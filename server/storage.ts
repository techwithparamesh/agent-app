import { db } from "./db";
import { eq, and, desc, count, sql, inArray } from "drizzle-orm";
import {
  users,
  agents,
  knowledgeBase,
  conversations,
  messages,
  generatedPages,
  generatedPosters,
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
  type GeneratedPage,
  type InsertGeneratedPage,
  type GeneratedPoster,
  type InsertGeneratedPoster,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Agents
  getAgentsByUserId(userId: string): Promise<Agent[]>;
  getAgentById(id: string): Promise<Agent | undefined>;
  createAgent(userId: string, agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<void>;

  // Knowledge Base
  getKnowledgeByAgentId(agentId: string): Promise<KnowledgeBase[]>;
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

  // Generated Pages
  getGeneratedPagesByUserId(userId: string): Promise<GeneratedPage[]>;
  getGeneratedPageById(id: string): Promise<GeneratedPage | undefined>;
  createGeneratedPage(userId: string, page: InsertGeneratedPage): Promise<GeneratedPage>;
  deleteGeneratedPage(id: string): Promise<void>;

  // Generated Posters
  getGeneratedPostersByUserId(userId: string): Promise<GeneratedPoster[]>;
  getGeneratedPosterById(id: string): Promise<GeneratedPoster | undefined>;
  createGeneratedPoster(userId: string, poster: InsertGeneratedPoster): Promise<GeneratedPoster>;
  deleteGeneratedPoster(id: string): Promise<void>;
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
    const id = crypto.randomUUID();
    await db
      .insert(agents)
      .values({ ...agentData, id, userId });
    return this.getAgentById(id) as Promise<Agent>;
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
  async getKnowledgeByAgentId(agentId: string): Promise<KnowledgeBase[]> {
    return db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.agentId, agentId))
      .orderBy(desc(knowledgeBase.createdAt));
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

  // Generated Pages
  async getGeneratedPagesByUserId(userId: string): Promise<GeneratedPage[]> {
    return db
      .select()
      .from(generatedPages)
      .where(eq(generatedPages.userId, userId))
      .orderBy(desc(generatedPages.createdAt));
  }

  async getGeneratedPageById(id: string): Promise<GeneratedPage | undefined> {
    const [page] = await db.select().from(generatedPages).where(eq(generatedPages.id, id));
    return page;
  }

  async createGeneratedPage(userId: string, pageData: InsertGeneratedPage): Promise<GeneratedPage> {
    const id = crypto.randomUUID();
    await db
      .insert(generatedPages)
      .values({ ...pageData, id, userId });
    return this.getGeneratedPageById(id) as Promise<GeneratedPage>;
  }

  async deleteGeneratedPage(id: string): Promise<void> {
    await db.delete(generatedPages).where(eq(generatedPages.id, id));
  }

  // Generated Posters
  async getGeneratedPostersByUserId(userId: string): Promise<GeneratedPoster[]> {
    return db
      .select()
      .from(generatedPosters)
      .where(eq(generatedPosters.userId, userId))
      .orderBy(desc(generatedPosters.createdAt));
  }

  async getGeneratedPosterById(id: string): Promise<GeneratedPoster | undefined> {
    const [poster] = await db.select().from(generatedPosters).where(eq(generatedPosters.id, id));
    return poster;
  }

  async createGeneratedPoster(userId: string, posterData: InsertGeneratedPoster): Promise<GeneratedPoster> {
    const id = crypto.randomUUID();
    await db
      .insert(generatedPosters)
      .values({ ...posterData, id, userId });
    return this.getGeneratedPosterById(id) as Promise<GeneratedPoster>;
  }

  async deleteGeneratedPoster(id: string): Promise<void> {
    await db.delete(generatedPosters).where(eq(generatedPosters.id, id));
  }

  async updateGeneratedPoster(id: string, updates: Partial<InsertGeneratedPoster>): Promise<GeneratedPoster | undefined> {
    await db
      .update(generatedPosters)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(generatedPosters.id, id));
    return this.getGeneratedPosterById(id);
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
    
    const landingPageLimits: Record<string, number> = {
      'free': 1,
      'starter': 5,
      'pro': 20,
      'enterprise': 100,
    };
    
    await db
      .update(users)
      .set({ 
        plan,
        messageLimit: messageLimits[plan] || 20,
        landingPageLimit: landingPageLimits[plan] || 1,
        subscriptionStatus: plan === 'free' ? 'trial' : 'active',
        messageCount: 0, // Reset count on upgrade
        landingPageCount: 0, // Reset landing page count on upgrade
      })
      .where(eq(users.id, userId));
  }

  // Landing Page Usage Tracking
  async getLandingPageUsage(userId: string): Promise<{ landingPageCount: number; landingPageLimit: number; plan: string } | null> {
    const [user] = await db.select({
      landingPageCount: users.landingPageCount,
      landingPageLimit: users.landingPageLimit,
      plan: users.plan,
    }).from(users).where(eq(users.id, userId));
    
    if (!user) return null;
    
    return {
      landingPageCount: user.landingPageCount || 0,
      landingPageLimit: user.landingPageLimit || 1,
      plan: user.plan || 'free',
    };
  }

  async canCreateLandingPage(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; plan: string }> {
    const usage = await this.getLandingPageUsage(userId);
    if (!usage) {
      return { allowed: false, remaining: 0, limit: 0, plan: 'free' };
    }
    
    // Paid plans have higher limits
    if (usage.plan !== 'free') {
      return { 
        allowed: usage.landingPageCount < usage.landingPageLimit, 
        remaining: Math.max(0, usage.landingPageLimit - usage.landingPageCount), 
        limit: usage.landingPageLimit,
        plan: usage.plan 
      };
    }
    
    // Free trial check
    const allowed = usage.landingPageCount < usage.landingPageLimit;
    return {
      allowed,
      remaining: Math.max(0, usage.landingPageLimit - usage.landingPageCount),
      limit: usage.landingPageLimit,
      plan: usage.plan,
    };
  }

  async incrementLandingPageCount(userId: string): Promise<{ newCount: number; limit: number; exceeded: boolean }> {
    const usage = await this.getLandingPageUsage(userId);
    if (!usage) {
      throw new Error('User not found');
    }
    
    const newCount = usage.landingPageCount + 1;
    
    await db
      .update(users)
      .set({ landingPageCount: newCount })
      .where(eq(users.id, userId));
    
    return {
      newCount,
      limit: usage.landingPageLimit,
      exceeded: newCount >= usage.landingPageLimit,
    };
  }

  // Update generated page
  async updateGeneratedPage(id: string, pageData: Partial<InsertGeneratedPage>): Promise<GeneratedPage | undefined> {
    await db
      .update(generatedPages)
      .set({ ...pageData })
      .where(eq(generatedPages.id, id));
    return this.getGeneratedPageById(id);
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
}

export const storage = new DatabaseStorage();
