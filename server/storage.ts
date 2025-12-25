import { db } from "./db";
import { eq, and, desc, count, sql, inArray, gte, lte } from "drizzle-orm";
import {
  users,
  agents,
  knowledgeBase,
  conversations,
  messages,
  whatsappBusinessAccounts,
  phoneNumbers,
  messageTemplates,
  usageRecords,
  messageBillingEvents,
  subscriptionPlans,
  userSubscriptions,
  invoices,
  webhookEvents,
  integrationCredentials,
  integrationWorkflows,
  workflowExecutions,
  type User,
  type UpsertUser,
  type Agent,
  type InsertAgent,
  type KnowledgeBase,
  type InsertKnowledgeBase,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type WhatsappBusinessAccount,
  type InsertWhatsappBusinessAccount,
  type PhoneNumber,
  type InsertPhoneNumber,
  type MessageTemplate,
  type InsertMessageTemplate,
  type UsageRecord,
  type InsertUsageRecord,
  type MessageBillingEvent,
  type InsertMessageBillingEvent,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type UserSubscription,
  type InsertUserSubscription,
  type Invoice,
  type InsertInvoice,
  type WebhookEvent,
  type InsertWebhookEvent,
  type IntegrationCredential,
  type InsertIntegrationCredential,
  type IntegrationWorkflow,
  type InsertIntegrationWorkflow,
  type WorkflowExecution,
  type InsertWorkflowExecution,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearPasswordResetToken(userId: string): Promise<void>;
  updateUserProfile(userId: string, data: { firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<User | undefined>;

  // Agents
  getAgentsByUserId(userId: string): Promise<Agent[]>;
  getAgentById(id: string): Promise<Agent | undefined>;
  createAgent(userId: string, agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<void>;

  // Knowledge Base
  getKnowledgeByAgentId(agentId: string, options?: { limit?: number; offset?: number }): Promise<KnowledgeBase[]>;
  getKnowledgeCountByAgentId(agentId: string): Promise<number>;
  getKnowledgeById(id: string): Promise<KnowledgeBase | undefined>;
  createKnowledgeEntry(entry: InsertKnowledgeBase): Promise<KnowledgeBase>;
  deleteKnowledgeEntry(id: string): Promise<void>;
  deleteAllKnowledgeByAgentId(agentId: string): Promise<number>;

  // Conversations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationById(id: string): Promise<Conversation | undefined>;
  getConversationsByAgentId(agentId: string): Promise<Conversation[]>;

  // Messages
  addMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;

  // Integration Credentials
  getCredentialsByUserId(userId: string): Promise<IntegrationCredential[]>;
  getCredentialById(id: string): Promise<IntegrationCredential | undefined>;
  getCredentialByUserAndApp(userId: string, appId: string): Promise<IntegrationCredential | undefined>;
  createCredential(userId: string, credential: Omit<InsertIntegrationCredential, 'userId'>): Promise<IntegrationCredential>;
  updateCredential(id: string, data: Partial<InsertIntegrationCredential>): Promise<IntegrationCredential | undefined>;
  deleteCredential(id: string): Promise<void>;

  // Integration Workflows
  getWorkflowsByUserId(userId: string): Promise<IntegrationWorkflow[]>;
  getWorkflowById(id: string): Promise<IntegrationWorkflow | undefined>;
  getWorkflowByWebhookId(webhookId: string): Promise<IntegrationWorkflow | undefined>;
  createWorkflow(userId: string, workflow: Omit<InsertIntegrationWorkflow, 'userId'>): Promise<IntegrationWorkflow>;
  updateWorkflow(id: string, data: Partial<InsertIntegrationWorkflow>): Promise<IntegrationWorkflow | undefined>;
  deleteWorkflow(id: string): Promise<void>;

  // Workflow Executions
  getExecutionsByWorkflowId(workflowId: string, limit?: number): Promise<WorkflowExecution[]>;
  getExecutionById(id: string): Promise<WorkflowExecution | undefined>;
  createExecution(execution: InsertWorkflowExecution): Promise<WorkflowExecution>;
  updateExecution(id: string, data: Partial<InsertWorkflowExecution>): Promise<WorkflowExecution | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || crypto.randomUUID();
    await db.insert(users).values({ ...userData, id });
    return this.getUser(id) as Promise<User>;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Try to find existing user
    const existingUser = await this.getUser(userData.id as string);
    
    if (existingUser) {
      // Update existing user
      await db
        .update(users)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id as string));
      
      return this.getUser(userData.id as string) as Promise<User>;
    } else {
      // Insert new user
      await db.insert(users).values(userData);
      return this.getUser(userData.id as string) as Promise<User>;
    }
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        resetPasswordToken: token, 
        resetPasswordExpires: expires,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, token),
          gte(users.resetPasswordExpires, new Date())
        )
      );
    return user;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        resetPasswordToken: null, 
        resetPasswordExpires: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: string, data: { firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<User | undefined> {
    await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId));
    return this.getUser(userId);
  }

  // Agents
  async getAgentsByUserId(userId: string): Promise<Agent[]> {
    return db
      .select()
      .from(agents)
      .where(eq(agents.userId, userId))
      .orderBy(desc(agents.createdAt));
  }

  async getAgentById(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(userId: string, agentData: InsertAgent): Promise<Agent> {
    console.log("=== STORAGE: createAgent ===");
    console.log("userId:", userId);
    console.log("agentData:", JSON.stringify(agentData, null, 2));
    
    const id = crypto.randomUUID();
    console.log("Generated agent ID:", id);
    
    try {
      await db
        .insert(agents)
        .values({ ...agentData, id, userId });
      console.log("Insert successful, fetching agent...");
      return this.getAgentById(id) as Promise<Agent>;
    } catch (dbError: any) {
      console.error("=== DATABASE INSERT ERROR ===");
      console.error("Error code:", dbError?.code);
      console.error("Error errno:", dbError?.errno);
      console.error("Error sqlMessage:", dbError?.sqlMessage);
      console.error("Error sql:", dbError?.sql);
      throw dbError;
    }
  }

  async updateAgent(id: string, agentData: Partial<InsertAgent>): Promise<Agent | undefined> {
    await db
      .update(agents)
      .set({ ...agentData, updatedAt: new Date() })
      .where(eq(agents.id, id));
    return this.getAgentById(id);
  }

  async deleteAgent(id: string): Promise<void> {
    await db.delete(agents).where(eq(agents.id, id));
  }

  // Knowledge Base
  async getKnowledgeByAgentId(
    agentId: string, 
    options?: { limit?: number; offset?: number }
  ): Promise<KnowledgeBase[]> {
    const limit = options?.limit || 100; // Default limit to prevent unbounded queries
    const offset = options?.offset || 0;
    
    return db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.agentId, agentId))
      .orderBy(desc(knowledgeBase.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getKnowledgeCountByAgentId(agentId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(knowledgeBase)
      .where(eq(knowledgeBase.agentId, agentId));
    return result?.count || 0;
  }

  async getKnowledgeById(id: string): Promise<KnowledgeBase | undefined> {
    const [entry] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
    return entry;
  }

  async createKnowledgeEntry(entry: InsertKnowledgeBase): Promise<KnowledgeBase> {
    const id = crypto.randomUUID();
    await db.insert(knowledgeBase).values({ ...entry, id });
    return this.getKnowledgeById(id) as Promise<KnowledgeBase>;
  }

  async deleteKnowledgeEntry(id: string): Promise<void> {
    await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
  }

  async deleteAllKnowledgeByAgentId(agentId: string): Promise<number> {
    // Get count first
    const entries = await db.select().from(knowledgeBase).where(eq(knowledgeBase.agentId, agentId));
    const count = entries.length;
    // Delete all
    await db.delete(knowledgeBase).where(eq(knowledgeBase.agentId, agentId));
    return count;
  }

  // Conversations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = crypto.randomUUID();
    await db.insert(conversations).values({ ...conversation, id });
    return this.getConversationById(id) as Promise<Conversation>;
  }

  async getConversationById(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationsByAgentId(agentId: string): Promise<Conversation[]> {
    return db
      .select()
      .from(conversations)
      .where(eq(conversations.agentId, agentId))
      .orderBy(desc(conversations.createdAt));
  }

  // Get conversations by user ID (across all their agents)
  async getConversationsByUserId(userId: string, agentId?: string): Promise<Conversation[]> {
    // Get all agents for this user
    const userAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.userId, userId));
    
    if (userAgents.length === 0) {
      return [];
    }

    const agentIds = userAgents.map(a => a.id);

    // If a specific agentId is provided, filter by it
    if (agentId && agentIds.includes(agentId)) {
      return db
        .select()
        .from(conversations)
        .where(eq(conversations.agentId, agentId))
        .orderBy(desc(conversations.createdAt));
    }

    // Otherwise get all conversations for all user's agents
    return db
      .select()
      .from(conversations)
      .where(inArray(conversations.agentId, agentIds))
      .orderBy(desc(conversations.createdAt));
  }

  // Delete a single conversation and its messages
  async deleteConversation(conversationId: string): Promise<void> {
    // Delete messages first (foreign key constraint)
    await db.delete(messages).where(eq(messages.conversationId, conversationId));
    // Delete the conversation
    await db.delete(conversations).where(eq(conversations.id, conversationId));
  }

  // Delete all conversations for an agent
  async deleteConversationsByAgentId(agentId: string): Promise<number> {
    // Get all conversation IDs for this agent
    const agentConversations = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.agentId, agentId));
    
    if (agentConversations.length === 0) {
      return 0;
    }

    const convIds = agentConversations.map(c => c.id);
    
    // Delete messages first
    await db.delete(messages).where(inArray(messages.conversationId, convIds));
    
    // Delete conversations
    await db.delete(conversations).where(eq(conversations.agentId, agentId));
    
    return agentConversations.length;
  }

  // Messages
  async addMessage(message: InsertMessage): Promise<Message> {
    const id = crypto.randomUUID();
    await db.insert(messages).values({ ...message, id });
    const [created] = await db.select().from(messages).where(eq(messages.id, id));
    return created;
  }

  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Usage Tracking
  async getUserUsage(userId: string): Promise<{ messageCount: number; messageLimit: number; plan: string; subscriptionStatus: string } | null> {
    const [user] = await db.select({
      messageCount: users.messageCount,
      messageLimit: users.messageLimit,
      plan: users.plan,
      subscriptionStatus: users.subscriptionStatus,
    }).from(users).where(eq(users.id, userId));
    
    if (!user) return null;
    
    return {
      messageCount: user.messageCount || 0,
      messageLimit: user.messageLimit || 20,
      plan: user.plan || 'free',
      subscriptionStatus: user.subscriptionStatus || 'trial',
    };
  }

  async incrementMessageCount(userId: string): Promise<{ newCount: number; limit: number; exceeded: boolean }> {
    const usage = await this.getUserUsage(userId);
    if (!usage) {
      throw new Error('User not found');
    }
    
    const newCount = usage.messageCount + 1;
    
    await db
      .update(users)
      .set({ messageCount: newCount })
      .where(eq(users.id, userId));
    
    return {
      newCount,
      limit: usage.messageLimit,
      exceeded: newCount > usage.messageLimit,
    };
  }

  async canSendMessage(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; plan: string }> {
    const usage = await this.getUserUsage(userId);
    if (!usage) {
      return { allowed: false, remaining: 0, limit: 0, plan: 'free' };
    }
    
    // Paid plans have unlimited or higher limits
    if (usage.plan !== 'free' && usage.subscriptionStatus === 'active') {
      return { 
        allowed: true, 
        remaining: usage.messageLimit - usage.messageCount, 
        limit: usage.messageLimit,
        plan: usage.plan 
      };
    }
    
    // Free trial check
    const allowed = usage.messageCount < usage.messageLimit;
    return {
      allowed,
      remaining: Math.max(0, usage.messageLimit - usage.messageCount),
      limit: usage.messageLimit,
      plan: usage.plan,
    };
  }

  async upgradePlan(userId: string, plan: string): Promise<void> {
    const messageLimits: Record<string, number> = {
      'free': 20,
      'starter': 500,
      'pro': 2000,
      'enterprise': 10000,
    };
    
    await db
      .update(users)
      .set({ 
        plan,
        messageLimit: messageLimits[plan] || 20,
        subscriptionStatus: plan === 'free' ? 'trial' : 'active',
        messageCount: 0, // Reset count on upgrade
      })
      .where(eq(users.id, userId));
  }

  // Dashboard Stats
  async getDashboardStats(userId: string): Promise<{
    totalConversations: number;
    uniqueVisitors: number;
    totalMessages: number;
    responseRate: number;
  }> {
    // Get all agents for this user
    const userAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.userId, userId));
    
    if (userAgents.length === 0) {
      return {
        totalConversations: 0,
        uniqueVisitors: 0,
        totalMessages: 0,
        responseRate: 0,
      };
    }

    const agentIds = userAgents.map(a => a.id);

    // Get total conversations across all user's agents
    const conversationStats = await db
      .select({
        total: count(),
        uniqueSessions: sql<number>`COUNT(DISTINCT session_id)`,
      })
      .from(conversations)
      .where(inArray(conversations.agentId, agentIds));

    // Get total messages
    const allConversations = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(inArray(conversations.agentId, agentIds));
    
    let totalMessages = 0;
    let userMessages = 0;
    let assistantMessages = 0;

    if (allConversations.length > 0) {
      const convIds = allConversations.map(c => c.id);
      const messageStats = await db
        .select({
          total: count(),
          userMsgs: sql<number>`SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END)`,
          assistantMsgs: sql<number>`SUM(CASE WHEN role = 'assistant' THEN 1 ELSE 0 END)`,
        })
        .from(messages)
        .where(inArray(messages.conversationId, convIds));
      
      totalMessages = Number(messageStats[0]?.total) || 0;
      userMessages = Number(messageStats[0]?.userMsgs) || 0;
      assistantMessages = Number(messageStats[0]?.assistantMsgs) || 0;
    }

    // Calculate response rate (assistant responses / user messages)
    const responseRate = userMessages > 0 
      ? Math.round((assistantMessages / userMessages) * 100) 
      : 0;

    return {
      totalConversations: Number(conversationStats[0]?.total) || 0,
      uniqueVisitors: Number(conversationStats[0]?.uniqueSessions) || 0,
      totalMessages,
      responseRate,
    };
  }

  // Get or create conversation by session
  async getOrCreateConversation(agentId: string, sessionId: string): Promise<Conversation> {
    // Try to find existing conversation for this session and agent
    const [existing] = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.agentId, agentId),
        eq(conversations.sessionId, sessionId)
      ))
      .limit(1);
    
    if (existing) {
      return existing;
    }

    // Create new conversation
    const id = crypto.randomUUID();
    await db.insert(conversations).values({ id, agentId, sessionId });
    return this.getConversationById(id) as Promise<Conversation>;
  }

  // ========== BSP/SAAS WHATSAPP BUSINESS ACCOUNTS ==========
  
  async createWhatsappBusinessAccount(data: InsertWhatsappBusinessAccount): Promise<WhatsappBusinessAccount> {
    const id = crypto.randomUUID();
    await db.insert(whatsappBusinessAccounts).values({ ...data, id });
    return this.getWhatsappBusinessAccountById(id) as Promise<WhatsappBusinessAccount>;
  }

  async getWhatsappBusinessAccountById(id: string): Promise<WhatsappBusinessAccount | undefined> {
    const [account] = await db.select().from(whatsappBusinessAccounts).where(eq(whatsappBusinessAccounts.id, id));
    return account;
  }

  async getWhatsappBusinessAccountsByUserId(userId: string): Promise<WhatsappBusinessAccount[]> {
    return db
      .select()
      .from(whatsappBusinessAccounts)
      .where(eq(whatsappBusinessAccounts.userId, userId))
      .orderBy(desc(whatsappBusinessAccounts.createdAt));
  }

  async updateWhatsappBusinessAccount(id: string, data: Partial<InsertWhatsappBusinessAccount>): Promise<WhatsappBusinessAccount | undefined> {
    await db.update(whatsappBusinessAccounts).set(data).where(eq(whatsappBusinessAccounts.id, id));
    return this.getWhatsappBusinessAccountById(id);
  }

  async deleteWhatsappBusinessAccount(id: string): Promise<void> {
    await db.delete(whatsappBusinessAccounts).where(eq(whatsappBusinessAccounts.id, id));
  }

  // ========== PHONE NUMBERS ==========
  
  async createPhoneNumber(data: InsertPhoneNumber): Promise<PhoneNumber> {
    const id = crypto.randomUUID();
    await db.insert(phoneNumbers).values({ ...data, id });
    return this.getPhoneNumberById(id) as Promise<PhoneNumber>;
  }

  async getPhoneNumberById(id: string): Promise<PhoneNumber | undefined> {
    const [phone] = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, id));
    return phone;
  }

  async getPhoneNumberByNumber(phoneNumber: string): Promise<PhoneNumber | undefined> {
    const [phone] = await db.select().from(phoneNumbers).where(eq(phoneNumbers.phoneNumber, phoneNumber));
    return phone;
  }

  async getPhoneNumbersByUserId(userId: string): Promise<PhoneNumber[]> {
    return db
      .select()
      .from(phoneNumbers)
      .where(eq(phoneNumbers.userId, userId))
      .orderBy(desc(phoneNumbers.createdAt));
  }

  async getPhoneNumbersByWabaId(wabaId: string): Promise<PhoneNumber[]> {
    return db
      .select()
      .from(phoneNumbers)
      .where(eq(phoneNumbers.wabaId, wabaId))
      .orderBy(desc(phoneNumbers.createdAt));
  }

  async updatePhoneNumber(id: string, data: Partial<InsertPhoneNumber>): Promise<PhoneNumber | undefined> {
    await db.update(phoneNumbers).set(data).where(eq(phoneNumbers.id, id));
    return this.getPhoneNumberById(id);
  }

  async deletePhoneNumber(id: string): Promise<void> {
    await db.delete(phoneNumbers).where(eq(phoneNumbers.id, id));
  }

  // ========== MESSAGE TEMPLATES ==========
  
  async createMessageTemplate(data: InsertMessageTemplate): Promise<MessageTemplate> {
    const id = crypto.randomUUID();
    await db.insert(messageTemplates).values({ ...data, id });
    return this.getMessageTemplateById(id) as Promise<MessageTemplate>;
  }

  async getMessageTemplateById(id: string): Promise<MessageTemplate | undefined> {
    const [template] = await db.select().from(messageTemplates).where(eq(messageTemplates.id, id));
    return template;
  }

  async getMessageTemplatesByWabaId(wabaId: string): Promise<MessageTemplate[]> {
    return db
      .select()
      .from(messageTemplates)
      .where(eq(messageTemplates.wabaId, wabaId))
      .orderBy(desc(messageTemplates.createdAt));
  }

  async updateMessageTemplate(id: string, data: Partial<InsertMessageTemplate>): Promise<MessageTemplate | undefined> {
    await db.update(messageTemplates).set(data).where(eq(messageTemplates.id, id));
    return this.getMessageTemplateById(id);
  }

  async deleteMessageTemplate(id: string): Promise<void> {
    await db.delete(messageTemplates).where(eq(messageTemplates.id, id));
  }

  // ========== USAGE RECORDS & BILLING ==========
  
  async createUsageRecord(data: InsertUsageRecord): Promise<UsageRecord> {
    const id = crypto.randomUUID();
    await db.insert(usageRecords).values({ ...data, id });
    return this.getUsageRecordById(id) as Promise<UsageRecord>;
  }

  async getUsageRecordById(id: string): Promise<UsageRecord | undefined> {
    const [record] = await db.select().from(usageRecords).where(eq(usageRecords.id, id));
    return record;
  }

  async getCurrentUsageRecord(userId: string): Promise<UsageRecord | undefined> {
    const now = new Date();
    const [record] = await db
      .select()
      .from(usageRecords)
      .where(and(
        eq(usageRecords.userId, userId),
        eq(usageRecords.status, 'active'),
        lte(usageRecords.billingPeriodStart, now),
        gte(usageRecords.billingPeriodEnd, now)
      ))
      .limit(1);
    return record;
  }

  async getUsageRecordsByUserId(userId: string): Promise<UsageRecord[]> {
    return db
      .select()
      .from(usageRecords)
      .where(eq(usageRecords.userId, userId))
      .orderBy(desc(usageRecords.billingPeriodStart));
  }

  async updateUsageRecord(id: string, data: Partial<InsertUsageRecord>): Promise<UsageRecord | undefined> {
    await db.update(usageRecords).set(data).where(eq(usageRecords.id, id));
    return this.getUsageRecordById(id);
  }

  async incrementUsageCounters(usageRecordId: string, counters: {
    messagesInbound?: number;
    messagesOutbound?: number;
    templateMessages?: number;
    sessionMessages?: number;
  }): Promise<void> {
    const record = await this.getUsageRecordById(usageRecordId);
    if (!record) return;

    await db.update(usageRecords).set({
      messagesInbound: (record.messagesInbound || 0) + (counters.messagesInbound || 0),
      messagesOutbound: (record.messagesOutbound || 0) + (counters.messagesOutbound || 0),
      templateMessages: (record.templateMessages || 0) + (counters.templateMessages || 0),
      sessionMessages: (record.sessionMessages || 0) + (counters.sessionMessages || 0),
    }).where(eq(usageRecords.id, usageRecordId));
  }

  // ========== MESSAGE BILLING EVENTS ==========
  
  async createMessageBillingEvent(data: InsertMessageBillingEvent): Promise<MessageBillingEvent> {
    const id = crypto.randomUUID();
    await db.insert(messageBillingEvents).values({ ...data, id });
    const [event] = await db.select().from(messageBillingEvents).where(eq(messageBillingEvents.id, id));
    return event;
  }

  async getBillingEventsByUsageRecordId(usageRecordId: string): Promise<MessageBillingEvent[]> {
    return db
      .select()
      .from(messageBillingEvents)
      .where(eq(messageBillingEvents.usageRecordId, usageRecordId))
      .orderBy(desc(messageBillingEvents.createdAt));
  }

  // ========== SUBSCRIPTION PLANS ==========
  
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);
  }

  async getSubscriptionPlanById(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getSubscriptionPlanBySlug(slug: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, slug));
    return plan;
  }

  // ========== USER SUBSCRIPTIONS ==========
  
  async createUserSubscription(data: InsertUserSubscription): Promise<UserSubscription> {
    const id = crypto.randomUUID();
    await db.insert(userSubscriptions).values({ ...data, id });
    return this.getUserSubscriptionById(id) as Promise<UserSubscription>;
  }

  async getUserSubscriptionById(id: string): Promise<UserSubscription | undefined> {
    const [sub] = await db.select().from(userSubscriptions).where(eq(userSubscriptions.id, id));
    return sub;
  }

  async getUserSubscriptionByUserId(userId: string): Promise<UserSubscription | undefined> {
    const [sub] = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId));
    return sub;
  }

  async updateUserSubscription(id: string, data: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    await db.update(userSubscriptions).set(data).where(eq(userSubscriptions.id, id));
    return this.getUserSubscriptionById(id);
  }

  async incrementSubscriptionMessagesUsed(userId: string, count: number = 1): Promise<void> {
    const sub = await this.getUserSubscriptionByUserId(userId);
    if (!sub) return;
    await db.update(userSubscriptions).set({
      messagesUsed: (sub.messagesUsed || 0) + count,
    }).where(eq(userSubscriptions.id, sub.id));
  }

  // ========== INVOICES ==========
  
  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const id = crypto.randomUUID();
    await db.insert(invoices).values({ ...data, id });
    return this.getInvoiceById(id) as Promise<Invoice>;
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoicesByUserId(userId: string): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  }

  async updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    await db.update(invoices).set(data).where(eq(invoices.id, id));
    return this.getInvoiceById(id);
  }

  // ========== WEBHOOK EVENTS ==========
  
  async createWebhookEvent(data: InsertWebhookEvent): Promise<WebhookEvent> {
    const id = crypto.randomUUID();
    await db.insert(webhookEvents).values({ ...data, id });
    const [event] = await db.select().from(webhookEvents).where(eq(webhookEvents.id, id));
    return event;
  }

  async getWebhookEventById(id: string): Promise<WebhookEvent | undefined> {
    const [event] = await db.select().from(webhookEvents).where(eq(webhookEvents.id, id));
    return event;
  }

  async updateWebhookEvent(id: string, data: Partial<InsertWebhookEvent>): Promise<WebhookEvent | undefined> {
    await db.update(webhookEvents).set(data).where(eq(webhookEvents.id, id));
    return this.getWebhookEventById(id);
  }

  async getFailedWebhookEvents(limit: number = 100): Promise<WebhookEvent[]> {
    return db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.status, 'failed'))
      .orderBy(desc(webhookEvents.createdAt))
      .limit(limit);
  }

  // ========== INTEGRATION CREDENTIALS ==========
  async getCredentialsByUserId(userId: string): Promise<IntegrationCredential[]> {
    return db
      .select()
      .from(integrationCredentials)
      .where(eq(integrationCredentials.userId, userId))
      .orderBy(desc(integrationCredentials.createdAt));
  }

  async getCredentialById(id: string): Promise<IntegrationCredential | undefined> {
    const [credential] = await db
      .select()
      .from(integrationCredentials)
      .where(eq(integrationCredentials.id, id));
    return credential;
  }

  async getCredentialByUserAndApp(userId: string, appId: string): Promise<IntegrationCredential | undefined> {
    const [credential] = await db
      .select()
      .from(integrationCredentials)
      .where(
        and(
          eq(integrationCredentials.userId, userId),
          eq(integrationCredentials.appId, appId)
        )
      );
    return credential;
  }

  async createCredential(userId: string, data: Omit<InsertIntegrationCredential, 'userId'>): Promise<IntegrationCredential> {
    const id = crypto.randomUUID();
    await db.insert(integrationCredentials).values({ ...data, id, userId });
    return this.getCredentialById(id) as Promise<IntegrationCredential>;
  }

  async updateCredential(id: string, data: Partial<InsertIntegrationCredential>): Promise<IntegrationCredential | undefined> {
    await db
      .update(integrationCredentials)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(integrationCredentials.id, id));
    return this.getCredentialById(id);
  }

  async deleteCredential(id: string): Promise<void> {
    await db.delete(integrationCredentials).where(eq(integrationCredentials.id, id));
  }

  // ========== INTEGRATION WORKFLOWS ==========
  async getWorkflowsByUserId(userId: string): Promise<IntegrationWorkflow[]> {
    return db
      .select()
      .from(integrationWorkflows)
      .where(eq(integrationWorkflows.userId, userId))
      .orderBy(desc(integrationWorkflows.updatedAt));
  }

  async getWorkflowById(id: string): Promise<IntegrationWorkflow | undefined> {
    const [workflow] = await db
      .select()
      .from(integrationWorkflows)
      .where(eq(integrationWorkflows.id, id));
    return workflow;
  }

  async getWorkflowByWebhookId(webhookId: string): Promise<IntegrationWorkflow | undefined> {
    const [workflow] = await db
      .select()
      .from(integrationWorkflows)
      .where(eq(integrationWorkflows.webhookId, webhookId));
    return workflow;
  }

  async createWorkflow(userId: string, data: Omit<InsertIntegrationWorkflow, 'userId'>): Promise<IntegrationWorkflow> {
    const id = crypto.randomUUID();
    const webhookId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    await db.insert(integrationWorkflows).values({ 
      ...data, 
      id, 
      userId,
      webhookId,
      webhookUrl: `/api/webhooks/workflow/${webhookId}`,
    });
    return this.getWorkflowById(id) as Promise<IntegrationWorkflow>;
  }

  async updateWorkflow(id: string, data: Partial<InsertIntegrationWorkflow>): Promise<IntegrationWorkflow | undefined> {
    await db
      .update(integrationWorkflows)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(integrationWorkflows.id, id));
    return this.getWorkflowById(id);
  }

  async deleteWorkflow(id: string): Promise<void> {
    await db.delete(integrationWorkflows).where(eq(integrationWorkflows.id, id));
  }

  // ========== WORKFLOW EXECUTIONS ==========
  async getExecutionsByWorkflowId(workflowId: string, limit: number = 50): Promise<WorkflowExecution[]> {
    return db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.workflowId, workflowId))
      .orderBy(desc(workflowExecutions.createdAt))
      .limit(limit);
  }

  async getExecutionById(id: string): Promise<WorkflowExecution | undefined> {
    const [execution] = await db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.id, id));
    return execution;
  }

  async createExecution(data: InsertWorkflowExecution): Promise<WorkflowExecution> {
    const id = crypto.randomUUID();
    await db.insert(workflowExecutions).values({ ...data, id });
    return this.getExecutionById(id) as Promise<WorkflowExecution>;
  }

  async updateExecution(id: string, data: Partial<InsertWorkflowExecution>): Promise<WorkflowExecution | undefined> {
    await db
      .update(workflowExecutions)
      .set(data)
      .where(eq(workflowExecutions.id, id));
    return this.getExecutionById(id);
  }
}

export const storage = new DatabaseStorage();
