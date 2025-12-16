import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  mysqlTable,
  text,
  varchar,
  timestamp,
  json,
  index,
  int,
  boolean,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for express-mysql-session
export const sessions = mysqlTable(
  "sessions",
  {
    session_id: varchar("session_id", { length: 128 }).primaryKey(),
    expires: int("expires").notNull(),
    data: text("data"),
  }
);

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  // Subscription & Usage tracking
  plan: varchar("plan", { length: 50 }).default("free"), // free, starter, pro, enterprise
  messageCount: int("message_count").default(0), // Total messages used
  messageLimit: int("message_limit").default(20), // Free trial: 20 messages
  landingPageCount: int("landing_page_count").default(0), // Landing pages created
  landingPageLimit: int("landing_page_limit").default(1), // Free trial: 1 landing page
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("trial"), // trial, active, expired, cancelled
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// AI Agents table
export const agents = mysqlTable("agents", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  websiteUrl: varchar("website_url", { length: 2048 }),
  description: text("description"),
  systemPrompt: text("system_prompt"), // AI behavior instructions
  toneOfVoice: varchar("tone_of_voice", { length: 100 }),
  purpose: varchar("purpose", { length: 50 }),
  welcomeMessage: text("welcome_message"), // Initial greeting
  suggestedQuestions: text("suggested_questions"), // Newline-separated questions
  isActive: boolean("is_active").default(true),
  // Scan status tracking
  scanStatus: varchar("scan_status", { length: 50 }).default("idle"), // idle, scanning, complete, error
  scanProgress: int("scan_progress").default(0),
  scanMessage: text("scan_message"),
  lastScannedAt: timestamp("last_scanned_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Knowledge Base entries for scanned content
export const knowledgeBase = mysqlTable("knowledge_base", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  sourceUrl: varchar("source_url", { length: 2048 }),
  title: varchar("title", { length: 500 }),
  section: varchar("section", { length: 255 }),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 50 }),
  metadata: json("metadata").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations for chatbot
export const conversations = mysqlTable("conversations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Chat messages
export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});



// Relations
export const usersRelations = relations(users, ({ many }) => ({
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  knowledgeBase: many(knowledgeBase),
  conversations: many(conversations),
}));

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  agent: one(agents, {
    fields: [knowledgeBase.agentId],
    references: [agents.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  agent: one(agents, {
    fields: [conversations.agentId],
    references: [agents.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));



// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});



// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;


