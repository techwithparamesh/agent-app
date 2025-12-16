/**
 * State Manager Service
 * Manages conversation state, flow progress, and collected data
 */

import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import {
  whatsappConversations,
  whatsappMessages,
  type WhatsappConversation,
  type WhatsappMessage,
} from '@shared/schema';
import type {
  ConversationState,
  ConversationContext,
  FlowType,
  NormalizedMessage,
} from './types';

export interface ConversationData {
  conversation: WhatsappConversation;
  context: ConversationContext;
}

export class StateManager {
  private contextCache: Map<string, ConversationContext> = new Map();

  /**
   * Get or create a conversation for a WhatsApp user
   */
  async getOrCreateConversation(
    agentId: string,
    userPhone: string,
    whatsappUserId: string,
    userName?: string
  ): Promise<ConversationData> {
    // Try to find existing conversation
    const [existing] = await db
      .select()
      .from(whatsappConversations)
      .where(
        and(
          eq(whatsappConversations.agentId, agentId),
          eq(whatsappConversations.whatsappUserId, whatsappUserId)
        )
      )
      .orderBy(desc(whatsappConversations.lastActivityAt))
      .limit(1);

    if (existing) {
      // Update last activity
      await this.updateLastActivity(existing.id);
      
      // Load or initialize context
      const context = await this.loadContext(existing);
      
      return { conversation: existing, context };
    }

    // Create new conversation
    const id = crypto.randomUUID();
    const initialContext: ConversationContext = {
      collectedData: {},
      missingFields: [],
      messageHistory: [],
    };

    await db.insert(whatsappConversations).values({
      id,
      agentId,
      whatsappUserId,
      userPhone,
      userName,
      state: 'idle',
      context: initialContext,
      collectedData: {},
      currentFlow: null,
      flowStep: 0,
    });

    const [conversation] = await db
      .select()
      .from(whatsappConversations)
      .where(eq(whatsappConversations.id, id))
      .limit(1);

    return { conversation: conversation!, context: initialContext };
  }

  /**
   * Load context from conversation record
   */
  private async loadContext(conversation: WhatsappConversation): Promise<ConversationContext> {
    // Check cache
    const cached = this.contextCache.get(conversation.id);
    if (cached) {
      return cached;
    }

    // Build context from stored data
    const storedContext = conversation.context as Partial<ConversationContext> || {};
    const collectedData = conversation.collectedData as Record<string, any> || {};

    // Load recent message history
    const recentMessages = await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.conversationId, conversation.id))
      .orderBy(desc(whatsappMessages.createdAt))
      .limit(10);

    const messageHistory = recentMessages
      .reverse()
      .map((msg) => ({
        role: msg.direction === 'inbound' ? 'user' as const : 'assistant' as const,
        content: msg.content,
        timestamp: new Date(msg.createdAt!),
      }));

    const context: ConversationContext = {
      currentIntent: storedContext.currentIntent,
      collectedData,
      missingFields: storedContext.missingFields || [],
      lastToolUsed: storedContext.lastToolUsed,
      lastToolResult: storedContext.lastToolResult,
      messageHistory,
      knowledgeContext: storedContext.knowledgeContext,
    };

    // Cache it
    this.contextCache.set(conversation.id, context);

    return context;
  }

  /**
   * Update conversation state
   */
  async updateState(
    conversationId: string,
    state: ConversationState,
    updates?: Partial<{
      currentFlow: FlowType | null;
      flowStep: number;
      context: Partial<ConversationContext>;
      collectedData: Record<string, any>;
    }>
  ): Promise<void> {
    const updateData: any = {
      state,
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };

    if (updates?.currentFlow !== undefined) {
      updateData.currentFlow = updates.currentFlow;
    }
    if (updates?.flowStep !== undefined) {
      updateData.flowStep = updates.flowStep;
    }
    if (updates?.collectedData) {
      // Merge with existing collected data
      const [current] = await db
        .select()
        .from(whatsappConversations)
        .where(eq(whatsappConversations.id, conversationId))
        .limit(1);

      const existingData = current?.collectedData as Record<string, any> || {};
      updateData.collectedData = { ...existingData, ...updates.collectedData };
    }
    if (updates?.context) {
      const [current] = await db
        .select()
        .from(whatsappConversations)
        .where(eq(whatsappConversations.id, conversationId))
        .limit(1);

      const existingContext = current?.context as Partial<ConversationContext> || {};
      updateData.context = { ...existingContext, ...updates.context };
      
      // Update cache
      const cached = this.contextCache.get(conversationId);
      if (cached) {
        Object.assign(cached, updates.context);
      }
    }

    await db
      .update(whatsappConversations)
      .set(updateData)
      .where(eq(whatsappConversations.id, conversationId));
  }

  /**
   * Update last activity timestamp
   */
  private async updateLastActivity(conversationId: string): Promise<void> {
    await db
      .update(whatsappConversations)
      .set({ lastActivityAt: new Date() })
      .where(eq(whatsappConversations.id, conversationId));
  }

  /**
   * Save a message to the conversation
   */
  async saveMessage(
    conversationId: string,
    message: {
      whatsappMessageId?: string;
      direction: 'inbound' | 'outbound';
      messageType?: string;
      content: string;
      mediaUrl?: string;
      metadata?: Record<string, any>;
      intent?: string;
      entities?: Record<string, any>;
    }
  ): Promise<WhatsappMessage> {
    const id = crypto.randomUUID();

    await db.insert(whatsappMessages).values({
      id,
      conversationId,
      whatsappMessageId: message.whatsappMessageId,
      direction: message.direction,
      messageType: message.messageType || 'text',
      content: message.content,
      mediaUrl: message.mediaUrl,
      metadata: message.metadata,
      intent: message.intent,
      entities: message.entities,
      status: message.direction === 'outbound' ? 'sent' : 'received',
    });

    const [saved] = await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.id, id))
      .limit(1);

    // Update context cache with new message
    const cached = this.contextCache.get(conversationId);
    if (cached) {
      cached.messageHistory.push({
        role: message.direction === 'inbound' ? 'user' : 'assistant',
        content: message.content,
        timestamp: new Date(),
      });
      // Keep only last 10 messages
      if (cached.messageHistory.length > 10) {
        cached.messageHistory = cached.messageHistory.slice(-10);
      }
    }

    return saved!;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<WhatsappConversation | null> {
    const [conversation] = await db
      .select()
      .from(whatsappConversations)
      .where(eq(whatsappConversations.id, conversationId))
      .limit(1);

    return conversation || null;
  }

  /**
   * Get recent messages for a conversation
   */
  async getRecentMessages(conversationId: string, limit: number = 10): Promise<WhatsappMessage[]> {
    return db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.conversationId, conversationId))
      .orderBy(desc(whatsappMessages.createdAt))
      .limit(limit);
  }

  /**
   * Update collected data
   */
  async updateCollectedData(
    conversationId: string,
    data: Record<string, any>
  ): Promise<void> {
    const [current] = await db
      .select()
      .from(whatsappConversations)
      .where(eq(whatsappConversations.id, conversationId))
      .limit(1);

    const existingData = current?.collectedData as Record<string, any> || {};
    const mergedData = { ...existingData, ...data };

    await db
      .update(whatsappConversations)
      .set({ collectedData: mergedData })
      .where(eq(whatsappConversations.id, conversationId));

    // Update cache
    const cached = this.contextCache.get(conversationId);
    if (cached) {
      Object.assign(cached.collectedData, data);
    }
  }

  /**
   * Start a new flow
   */
  async startFlow(
    conversationId: string,
    flowType: FlowType,
    requiredFields: string[]
  ): Promise<void> {
    await this.updateState(conversationId, 'collecting_info', {
      currentFlow: flowType,
      flowStep: 0,
      context: {
        missingFields: requiredFields,
      },
    });
  }

  /**
   * Advance flow to next step
   */
  async advanceFlow(conversationId: string): Promise<number> {
    const [current] = await db
      .select()
      .from(whatsappConversations)
      .where(eq(whatsappConversations.id, conversationId))
      .limit(1);

    const newStep = (current?.flowStep || 0) + 1;

    await db
      .update(whatsappConversations)
      .set({ flowStep: newStep })
      .where(eq(whatsappConversations.id, conversationId));

    return newStep;
  }

  /**
   * Complete current flow
   */
  async completeFlow(conversationId: string): Promise<void> {
    await this.updateState(conversationId, 'idle', {
      currentFlow: null,
      flowStep: 0,
      context: {
        missingFields: [],
      },
    });
  }

  /**
   * Clear context cache for a conversation
   */
  clearCache(conversationId?: string): void {
    if (conversationId) {
      this.contextCache.delete(conversationId);
    } else {
      this.contextCache.clear();
    }
  }

  /**
   * Get all active conversations for an agent
   */
  async getActiveConversations(agentId: string): Promise<WhatsappConversation[]> {
    return db
      .select()
      .from(whatsappConversations)
      .where(eq(whatsappConversations.agentId, agentId))
      .orderBy(desc(whatsappConversations.lastActivityAt));
  }
}

// Export singleton instance
export const stateManager = new StateManager();
