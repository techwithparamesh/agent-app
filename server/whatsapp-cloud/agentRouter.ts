/**
 * WhatsApp Cloud API - Agent Routing Service
 * 
 * Routes incoming WhatsApp messages to the correct AI agent(s).
 * Supports multiple routing strategies:
 * - Primary agent (single agent per number)
 * - Round-robin (distribute across agents)
 * - Availability-based (route to available agents)
 * - Conversation ownership (keep same agent for conversation)
 */

import { db } from '../db';
import { eq, and, desc, asc } from 'drizzle-orm';
import {
  whatsappCloudAgentLinks,
  whatsappCloudConversations,
} from '../../shared/schema';
import type { ResolvedTenant } from './webhookHandler';

// ========== TYPES ==========

export type RoutingStrategy = 'primary' | 'round_robin' | 'availability' | 'skill_based';

export interface RoutingDecision {
  agentId: string;
  reason: string;
  isNewAssignment: boolean;
}

// ========== IN-MEMORY STATE ==========

/**
 * Round-robin state per phone number
 * In production, use Redis for distributed state
 */
const roundRobinIndex = new Map<string, number>();

/**
 * Agent load tracking (concurrent conversations)
 */
const agentLoad = new Map<string, number>();

// ========== ROUTING SERVICE ==========

/**
 * Main routing function - determines which agent handles a message
 */
export async function routeToAgent(
  tenant: ResolvedTenant,
  customerWaId: string,
  context?: { intent?: string; skills?: string[] }
): Promise<RoutingDecision | null> {
  const { phoneNumberId, agentIds } = tenant;

  if (!agentIds || agentIds.length === 0) {
    console.warn(`[Agent Router] No agents linked to phone number ${phoneNumberId}`);
    return null;
  }

  try {
    // Check for existing conversation ownership
    const existingConversation = await getActiveConversation(phoneNumberId, customerWaId);
    
    if (existingConversation && existingConversation.agentId) {
      // Check if assigned agent is still valid
      if (agentIds.includes(existingConversation.agentId)) {
        return {
          agentId: existingConversation.agentId,
          reason: 'conversation_ownership',
          isNewAssignment: false,
        };
      }
    }

    // Get routing configuration for this phone number
    const routingConfigs = await getRoutingConfigs(phoneNumberId);
    
    if (!routingConfigs || routingConfigs.length === 0) {
      // Default: use first agent with primary routing
      const agentId = agentIds[0];
      await assignConversation(phoneNumberId, customerWaId, agentId);
      return {
        agentId,
        reason: 'default_primary',
        isNewAssignment: true,
      };
    }

    // Determine routing strategy (use first config's strategy)
    const strategy = (routingConfigs[0].routingStrategy || 'primary') as RoutingStrategy;
    
    let selectedAgentId: string | null = null;
    let routingReason = '';

    switch (strategy) {
      case 'primary':
        selectedAgentId = await routePrimary(routingConfigs);
        routingReason = 'primary_agent';
        break;
        
      case 'round_robin':
        selectedAgentId = await routeRoundRobin(phoneNumberId, routingConfigs);
        routingReason = 'round_robin';
        break;
        
      case 'availability':
        selectedAgentId = await routeByAvailability(routingConfigs);
        routingReason = 'availability_based';
        break;
        
      case 'skill_based':
        selectedAgentId = await routeBySkills(routingConfigs, context?.skills || []);
        routingReason = 'skill_match';
        break;
        
      default:
        selectedAgentId = await routePrimary(routingConfigs);
        routingReason = 'fallback_primary';
    }

    if (!selectedAgentId) {
      console.warn(`[Agent Router] No suitable agent found for ${phoneNumberId}`);
      return null;
    }

    // Assign or update conversation
    await assignConversation(phoneNumberId, customerWaId, selectedAgentId);
    
    return {
      agentId: selectedAgentId,
      reason: routingReason,
      isNewAssignment: true,
    };
  } catch (error) {
    console.error('[Agent Router] Error routing to agent:', error);
    // Fallback to first available agent
    if (agentIds.length > 0) {
      return {
        agentId: agentIds[0],
        reason: 'error_fallback',
        isNewAssignment: true,
      };
    }
    return null;
  }
}

// ========== ROUTING STRATEGIES ==========

/**
 * Primary routing - use the designated primary agent
 */
async function routePrimary(
  configs: Array<{ agentId: string; isPrimary: boolean | null; isAvailable: boolean | null }>
): Promise<string | null> {
  // Find the primary agent
  const primary = configs.find(c => c.isPrimary && c.isAvailable !== false);
  if (primary) return primary.agentId;
  
  // Fallback to first available
  const available = configs.find(c => c.isAvailable !== false);
  return available?.agentId || configs[0]?.agentId || null;
}

/**
 * Round-robin routing - distribute evenly across agents
 */
async function routeRoundRobin(
  phoneNumberId: string,
  configs: Array<{ agentId: string; isAvailable: boolean | null }>
): Promise<string | null> {
  const availableConfigs = configs.filter(c => c.isAvailable !== false);
  if (availableConfigs.length === 0) return null;
  
  // Get current index
  const currentIndex = roundRobinIndex.get(phoneNumberId) || 0;
  const nextIndex = (currentIndex + 1) % availableConfigs.length;
  
  // Update index
  roundRobinIndex.set(phoneNumberId, nextIndex);
  
  return availableConfigs[nextIndex].agentId;
}

/**
 * Availability-based routing - route to agent with lowest load
 */
async function routeByAvailability(
  configs: Array<{ agentId: string; isAvailable: boolean | null; maxConcurrentChats: number | null }>
): Promise<string | null> {
  const availableConfigs = configs.filter(c => c.isAvailable !== false);
  if (availableConfigs.length === 0) return null;
  
  // Find agent with lowest load
  let bestAgent = availableConfigs[0];
  let lowestLoad = getAgentCurrentLoad(bestAgent.agentId);
  
  for (const config of availableConfigs) {
    const currentLoad = getAgentCurrentLoad(config.agentId);
    const maxChats = config.maxConcurrentChats || 10;
    
    // Skip if at capacity
    if (currentLoad >= maxChats) continue;
    
    if (currentLoad < lowestLoad) {
      bestAgent = config;
      lowestLoad = currentLoad;
    }
  }
  
  return bestAgent.agentId;
}

/**
 * Skill-based routing - match required skills
 */
async function routeBySkills(
  configs: Array<{ agentId: string; skills: string[] | null; isAvailable: boolean | null }>,
  requiredSkills: string[]
): Promise<string | null> {
  if (!requiredSkills || requiredSkills.length === 0) {
    // No skills required, use primary routing
    return configs[0]?.agentId || null;
  }
  
  const availableConfigs = configs.filter(c => c.isAvailable !== false);
  
  // Score each agent by skill match
  let bestAgent: typeof configs[0] | null = null;
  let bestScore = -1;
  
  for (const config of availableConfigs) {
    const agentSkills = config.skills || [];
    const matchCount = requiredSkills.filter(s => 
      agentSkills.some(as => as.toLowerCase() === s.toLowerCase())
    ).length;
    
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestAgent = config;
    }
  }
  
  return bestAgent?.agentId || availableConfigs[0]?.agentId || null;
}

// ========== HELPER FUNCTIONS ==========

/**
 * Get routing configurations for a phone number
 */
async function getRoutingConfigs(phoneNumberId: string) {
  try {
    const configs = await db.select({
      agentId: whatsappCloudAgentLinks.agentId,
      isPrimary: whatsappCloudAgentLinks.isPrimary,
      routingStrategy: whatsappCloudAgentLinks.routingStrategy,
      priority: whatsappCloudAgentLinks.priority,
      skills: whatsappCloudAgentLinks.skills,
      maxConcurrentChats: whatsappCloudAgentLinks.maxConcurrentChats,
      isAvailable: whatsappCloudAgentLinks.isAvailable,
    })
    .from(whatsappCloudAgentLinks)
    .where(eq(whatsappCloudAgentLinks.phoneNumberId, phoneNumberId))
    .orderBy(asc(whatsappCloudAgentLinks.priority));
    
    return configs;
  } catch (error) {
    console.error('[Agent Router] Error getting routing configs:', error);
    return [];
  }
}

/**
 * Get active conversation for a customer
 */
async function getActiveConversation(phoneNumberId: string, customerWaId: string) {
  try {
    const [conversation] = await db.select()
      .from(whatsappCloudConversations)
      .where(
        and(
          eq(whatsappCloudConversations.phoneNumberId, phoneNumberId),
          eq(whatsappCloudConversations.customerWaId, customerWaId),
          eq(whatsappCloudConversations.status, 'active')
        )
      )
      .orderBy(desc(whatsappCloudConversations.updatedAt))
      .limit(1);

    if (!conversation) return null;

    // Check if conversation is still within 24hr window
    const windowExpires = conversation.windowExpiresAt;
    if (windowExpires && new Date() > windowExpires) {
      // Conversation window expired
      return null;
    }

    return conversation;
  } catch (error) {
    console.error('[Agent Router] Error getting conversation:', error);
    return null;
  }
}

/**
 * Assign or update conversation
 */
async function assignConversation(
  phoneNumberId: string,
  customerWaId: string,
  agentId: string
): Promise<void> {
  try {
    const now = new Date();
    const windowExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    // Check if conversation exists
    const [existing] = await db.select()
      .from(whatsappCloudConversations)
      .where(
        and(
          eq(whatsappCloudConversations.phoneNumberId, phoneNumberId),
          eq(whatsappCloudConversations.customerWaId, customerWaId)
        )
      )
      .orderBy(desc(whatsappCloudConversations.updatedAt))
      .limit(1);

    if (existing) {
      // Update existing conversation
      await db.update(whatsappCloudConversations)
        .set({
          agentId,
          status: 'active',
          lastCustomerMessageAt: now,
          windowExpiresAt: windowExpires,
          updatedAt: now,
        })
        .where(eq(whatsappCloudConversations.id, existing.id));
    } else {
      // Create new conversation
      await db.insert(whatsappCloudConversations).values({
        phoneNumberId,
        customerWaId,
        agentId,
        status: 'active',
        lastCustomerMessageAt: now,
        windowExpiresAt: windowExpires,
        messageCount: 1,
      });
    }

    // Update agent load
    incrementAgentLoad(agentId);
  } catch (error) {
    console.error('[Agent Router] Error assigning conversation:', error);
    throw error;
  }
}

/**
 * Transfer conversation to another agent
 */
export async function transferConversation(
  conversationId: string,
  newAgentId: string,
  reason?: string
): Promise<boolean> {
  try {
    const [conversation] = await db.select()
      .from(whatsappCloudConversations)
      .where(eq(whatsappCloudConversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      console.warn('[Agent Router] Conversation not found for transfer:', conversationId);
      return false;
    }

    const oldAgentId = conversation.agentId;

    // Update conversation
    await db.update(whatsappCloudConversations)
      .set({
        agentId: newAgentId,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(whatsappCloudConversations.id, conversationId));

    // Update load tracking
    if (oldAgentId) decrementAgentLoad(oldAgentId);
    incrementAgentLoad(newAgentId);

    console.log(`[Agent Router] Transferred conversation ${conversationId} from ${oldAgentId} to ${newAgentId}. Reason: ${reason || 'not specified'}`);
    return true;
  } catch (error) {
    console.error('[Agent Router] Error transferring conversation:', error);
    return false;
  }
}

/**
 * Resolve/close a conversation
 */
export async function resolveConversation(
  conversationId: string,
  resolution?: string
): Promise<boolean> {
  try {
    const [conversation] = await db.select()
      .from(whatsappCloudConversations)
      .where(eq(whatsappCloudConversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      console.warn('[Agent Router] Conversation not found for resolution:', conversationId);
      return false;
    }

    // Update conversation
    await db.update(whatsappCloudConversations)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(whatsappCloudConversations.id, conversationId));

    // Update load tracking
    if (conversation.agentId) {
      decrementAgentLoad(conversation.agentId);
    }

    console.log(`[Agent Router] Resolved conversation ${conversationId}. Resolution: ${resolution || 'not specified'}`);
    return true;
  } catch (error) {
    console.error('[Agent Router] Error resolving conversation:', error);
    return false;
  }
}

// ========== LOAD TRACKING ==========

function getAgentCurrentLoad(agentId: string): number {
  return agentLoad.get(agentId) || 0;
}

function incrementAgentLoad(agentId: string): void {
  const current = agentLoad.get(agentId) || 0;
  agentLoad.set(agentId, current + 1);
}

function decrementAgentLoad(agentId: string): void {
  const current = agentLoad.get(agentId) || 0;
  agentLoad.set(agentId, Math.max(0, current - 1));
}

/**
 * Reset agent load (for testing or recovery)
 */
export function resetAgentLoad(agentId?: string): void {
  if (agentId) {
    agentLoad.delete(agentId);
  } else {
    agentLoad.clear();
  }
}
