/**
 * Agent Resolver Service
 * Resolves agent configuration from incoming WhatsApp phone number
 * Ensures tenant isolation (agent_id scoped data only)
 */

import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import {
  agents,
  agentWhatsappConfig,
  type Agent,
  type AgentWhatsappConfig,
} from '@shared/schema';
import type { AgentConfig } from './types';

export interface ResolvedAgent {
  agent: Agent;
  whatsappConfig: AgentWhatsappConfig;
  config: AgentConfig;
}

export class AgentResolver {
  private cache: Map<string, { data: ResolvedAgent; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Resolve agent by WhatsApp phone number ID
   */
  async resolveByPhoneNumberId(phoneNumberId: string): Promise<ResolvedAgent | null> {
    // Check cache first
    const cached = this.getCached(phoneNumberId);
    if (cached) {
      return cached;
    }

    try {
      // Find WhatsApp config by phone number ID
      const [config] = await db
        .select()
        .from(agentWhatsappConfig)
        .where(
          and(
            eq(agentWhatsappConfig.whatsappPhoneNumberId, phoneNumberId),
            eq(agentWhatsappConfig.isActive, true)
          )
        )
        .limit(1);

      if (!config) {
        console.warn(`[AgentResolver] No active config found for phone number ID: ${phoneNumberId}`);
        return null;
      }

      // Get the associated agent
      const [agent] = await db
        .select()
        .from(agents)
        .where(
          and(
            eq(agents.id, config.agentId),
            eq(agents.isActive, true)
          )
        )
        .limit(1);

      if (!agent) {
        console.warn(`[AgentResolver] Agent not found or inactive for config: ${config.id}`);
        return null;
      }

      const resolved = this.buildResolvedAgent(agent, config);
      
      // Cache the result
      this.setCache(phoneNumberId, resolved);
      
      return resolved;
    } catch (error) {
      console.error('[AgentResolver] Error resolving agent:', error);
      throw error;
    }
  }

  /**
   * Resolve agent by WhatsApp phone number
   */
  async resolveByPhoneNumber(phoneNumber: string): Promise<ResolvedAgent | null> {
    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const cacheKey = `phone:${normalizedPhone}`;

    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const [config] = await db
        .select()
        .from(agentWhatsappConfig)
        .where(
          and(
            eq(agentWhatsappConfig.whatsappPhoneNumber, normalizedPhone),
            eq(agentWhatsappConfig.isActive, true)
          )
        )
        .limit(1);

      if (!config) {
        console.warn(`[AgentResolver] No config found for phone: ${normalizedPhone}`);
        return null;
      }

      const [agent] = await db
        .select()
        .from(agents)
        .where(
          and(
            eq(agents.id, config.agentId),
            eq(agents.isActive, true)
          )
        )
        .limit(1);

      if (!agent) {
        console.warn(`[AgentResolver] Agent not found for config: ${config.id}`);
        return null;
      }

      const resolved = this.buildResolvedAgent(agent, config);
      this.setCache(cacheKey, resolved);
      
      return resolved;
    } catch (error) {
      console.error('[AgentResolver] Error resolving by phone:', error);
      throw error;
    }
  }

  /**
   * Resolve agent by ID (for internal use)
   */
  async resolveById(agentId: string): Promise<ResolvedAgent | null> {
    const cacheKey = `id:${agentId}`;
    
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, agentId))
        .limit(1);

      if (!agent) {
        return null;
      }

      // Get WhatsApp config if exists
      const [config] = await db
        .select()
        .from(agentWhatsappConfig)
        .where(eq(agentWhatsappConfig.agentId, agentId))
        .limit(1);

      const resolved = this.buildResolvedAgent(agent, config || null);
      this.setCache(cacheKey, resolved);
      
      return resolved;
    } catch (error) {
      console.error('[AgentResolver] Error resolving by ID:', error);
      throw error;
    }
  }

  /**
   * Build the resolved agent configuration
   */
  private buildResolvedAgent(agent: Agent, config: AgentWhatsappConfig | null): ResolvedAgent {
    const agentConfig: AgentConfig = {
      id: agent.id,
      userId: agent.userId,
      name: agent.name,
      systemPrompt: agent.systemPrompt || this.getDefaultSystemPrompt(agent),
      welcomeMessage: agent.welcomeMessage || `Hello! I'm the AI assistant for ${agent.name}. How can I help you today?`,
      toneOfVoice: agent.toneOfVoice || 'professional',
      language: agent.language || 'en',
      capabilities: (agent.capabilities as string[]) || [],
      businessCategory: agent.businessCategory || undefined,
      businessInfo: agent.businessInfo as AgentConfig['businessInfo'] || undefined,
    };

    if (config) {
      agentConfig.whatsappConfig = {
        phoneNumberId: config.whatsappPhoneNumberId || '',
        accessToken: config.accessToken || '',
        businessId: config.whatsappBusinessId || '',
        verifyToken: config.verifyToken || '',
      };
    }

    return {
      agent,
      whatsappConfig: config!,
      config: agentConfig,
    };
  }

  /**
   * Generate default system prompt based on agent configuration
   */
  private getDefaultSystemPrompt(agent: Agent): string {
    const capabilities = (agent.capabilities as string[]) || [];
    const businessInfo = agent.businessInfo as AgentConfig['businessInfo'];

    let prompt = `You are a helpful WhatsApp AI assistant for ${agent.name}.`;

    if (agent.businessCategory) {
      prompt += ` This is a ${agent.businessCategory} business.`;
    }

    if (businessInfo) {
      prompt += '\n\n## Business Information';
      if (businessInfo.name) prompt += `\n- Business Name: ${businessInfo.name}`;
      if (businessInfo.phone) prompt += `\n- Phone: ${businessInfo.phone}`;
      if (businessInfo.email) prompt += `\n- Email: ${businessInfo.email}`;
      if (businessInfo.address) prompt += `\n- Address: ${businessInfo.address}`;
      if (businessInfo.workingHours) prompt += `\n- Working Hours: ${businessInfo.workingHours}`;
    }

    if (capabilities.length > 0) {
      prompt += '\n\n## Your Capabilities\nYou can help customers with:\n';
      prompt += capabilities.map((cap) => `- ${cap}`).join('\n');
    }

    prompt += `\n\n## Guidelines
1. Be friendly and professional - this is WhatsApp, keep messages concise
2. Use short, clear messages - avoid walls of text
3. Ask one question at a time when collecting information
4. Always confirm details before finalizing any booking/order
5. If you can't help with something, politely explain and suggest alternatives
6. Respond in the same language the customer uses
7. Use emojis sparingly to keep it friendly 😊

## Important Rules
- Never make up information you don't have
- For appointments/bookings: collect name, phone, date/time preference, service needed
- Always end with a helpful follow-up or call-to-action`;

    return prompt;
  }

  /**
   * Normalize phone number to consistent format
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-numeric characters except leading +
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }

    return normalized;
  }

  /**
   * Get cached agent data
   */
  private getCached(key: string): ResolvedAgent | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: ResolvedAgent): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear cache for a specific agent
   */
  clearCache(agentId?: string): void {
    if (agentId) {
      // Clear specific agent from all caches
      const keysToDelete: string[] = [];
      this.cache.forEach((value, key) => {
        if (value.data.agent.id === agentId) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}

// Export singleton instance
export const agentResolver = new AgentResolver();
