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
  date,
  time,
  uniqueIndex,
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
  // WhatsApp Agent fields
  agentType: varchar("agent_type", { length: 50 }).default("website"), // website, whatsapp
  businessCategory: varchar("business_category", { length: 100 }),
  capabilities: json("capabilities").$type<string[]>(),
  businessInfo: json("business_info").$type<{
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    workingHours?: string;
  }>(),
  language: varchar("language", { length: 10 }).default("en"),
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

// ========== WHATSAPP AGENT TABLES ==========

// WhatsApp Configuration for agents
export const agentWhatsappConfig = mysqlTable("agent_whatsapp_config", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  whatsappBusinessId: varchar("whatsapp_business_id", { length: 100 }),
  whatsappPhoneNumberId: varchar("whatsapp_phone_number_id", { length: 100 }),
  whatsappPhoneNumber: varchar("whatsapp_phone_number", { length: 20 }).notNull().unique(),
  accessToken: text("access_token"),
  verifyToken: varchar("verify_token", { length: 255 }),
  webhookSecret: varchar("webhook_secret", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  phoneIdx: index("idx_whatsapp_phone").on(table.whatsappPhoneNumber),
}));

// WhatsApp Conversations (separate from web conversations)
export const whatsappConversations = mysqlTable("whatsapp_conversations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  whatsappUserId: varchar("whatsapp_user_id", { length: 100 }).notNull(),
  userPhone: varchar("user_phone", { length: 20 }).notNull(),
  userName: varchar("user_name", { length: 255 }),
  state: varchar("state", { length: 50 }).default("idle"),
  context: json("context").$type<Record<string, any>>(),
  collectedData: json("collected_data").$type<Record<string, any>>(),
  currentFlow: varchar("current_flow", { length: 50 }),
  flowStep: int("flow_step").default(0),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  agentUserIdx: index("idx_agent_user").on(table.agentId, table.whatsappUserId),
  phoneIdx: index("idx_wa_phone").on(table.userPhone),
}));

// WhatsApp Messages
export const whatsappMessages = mysqlTable("whatsapp_messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => whatsappConversations.id, { onDelete: "cascade" }),
  whatsappMessageId: varchar("whatsapp_message_id", { length: 100 }),
  direction: varchar("direction", { length: 10 }).notNull(), // 'inbound' | 'outbound'
  messageType: varchar("message_type", { length: 20 }).default("text"),
  content: text("content").notNull(),
  mediaUrl: varchar("media_url", { length: 2048 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  status: varchar("status", { length: 20 }).default("sent"),
  intent: varchar("intent", { length: 100 }),
  entities: json("entities").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  conversationIdx: index("idx_wa_conversation").on(table.conversationId),
  waMsgIdx: index("idx_wa_msg_id").on(table.whatsappMessageId),
}));

// Availability Slots for appointments
export const availabilitySlots = mysqlTable("availability_slots", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  dayOfWeek: int("day_of_week"), // 0-6 (Sunday-Saturday)
  specificDate: date("specific_date"),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  slotDuration: int("slot_duration").default(30), // minutes
  maxBookings: int("max_bookings").default(1),
  isAvailable: boolean("is_available").default(true),
  serviceType: varchar("service_type", { length: 100 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  agentDateIdx: index("idx_slot_agent_date").on(table.agentId, table.specificDate),
  agentDayIdx: index("idx_slot_agent_day").on(table.agentId, table.dayOfWeek),
}));

// Appointments/Bookings
export const appointments = mysqlTable("appointments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  conversationId: varchar("conversation_id", { length: 36 }).references(() => whatsappConversations.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  endTime: time("end_time"),
  serviceType: varchar("service_type", { length: 100 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, cancelled, completed, no_show
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  agentDateIdx: index("idx_appt_agent_date").on(table.agentId, table.appointmentDate),
  phoneIdx: index("idx_appt_phone").on(table.customerPhone),
  statusIdx: index("idx_appt_status").on(table.status),
}));

// Leads/Customer Data
export const leads = mysqlTable("leads", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  conversationId: varchar("conversation_id", { length: 36 }).references(() => whatsappConversations.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  source: varchar("source", { length: 50 }).default("whatsapp"),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, qualified, converted, lost
  interest: varchar("interest", { length: 255 }),
  notes: text("notes"),
  customFields: json("custom_fields").$type<Record<string, any>>(),
  assignedTo: varchar("assigned_to", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  agentIdx: index("idx_lead_agent").on(table.agentId),
  phoneIdx: index("idx_lead_phone").on(table.phone),
  statusIdx: index("idx_lead_status").on(table.status),
}));

// Human Handoff Queue
export const handoffQueue = mysqlTable("handoff_queue", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => whatsappConversations.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 255 }),
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  status: varchar("status", { length: 50 }).default("pending"), // pending, assigned, resolved
  assignedTo: varchar("assigned_to", { length: 36 }),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  agentStatusIdx: index("idx_handoff_agent_status").on(table.agentId, table.status),
}));

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
  whatsappConfig: one(agentWhatsappConfig),
  whatsappConversations: many(whatsappConversations),
  availabilitySlots: many(availabilitySlots),
  appointments: many(appointments),
  leads: many(leads),
  handoffQueue: many(handoffQueue),
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

// WhatsApp Relations
export const agentWhatsappConfigRelations = relations(agentWhatsappConfig, ({ one }) => ({
  agent: one(agents, {
    fields: [agentWhatsappConfig.agentId],
    references: [agents.id],
  }),
}));

export const whatsappConversationsRelations = relations(whatsappConversations, ({ one, many }) => ({
  agent: one(agents, {
    fields: [whatsappConversations.agentId],
    references: [agents.id],
  }),
  messages: many(whatsappMessages),
  appointments: many(appointments),
  leads: many(leads),
  handoffQueue: many(handoffQueue),
}));

export const whatsappMessagesRelations = relations(whatsappMessages, ({ one }) => ({
  conversation: one(whatsappConversations, {
    fields: [whatsappMessages.conversationId],
    references: [whatsappConversations.id],
  }),
}));

export const availabilitySlotsRelations = relations(availabilitySlots, ({ one }) => ({
  agent: one(agents, {
    fields: [availabilitySlots.agentId],
    references: [agents.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  agent: one(agents, {
    fields: [appointments.agentId],
    references: [agents.id],
  }),
  conversation: one(whatsappConversations, {
    fields: [appointments.conversationId],
    references: [whatsappConversations.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  agent: one(agents, {
    fields: [leads.agentId],
    references: [agents.id],
  }),
  conversation: one(whatsappConversations, {
    fields: [leads.conversationId],
    references: [whatsappConversations.id],
  }),
}));

export const handoffQueueRelations = relations(handoffQueue, ({ one }) => ({
  agent: one(agents, {
    fields: [handoffQueue.agentId],
    references: [agents.id],
  }),
  conversation: one(whatsappConversations, {
    fields: [handoffQueue.conversationId],
    references: [whatsappConversations.id],
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

// WhatsApp Insert Schemas
export const insertAgentWhatsappConfigSchema = createInsertSchema(agentWhatsappConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhatsappConversationSchema = createInsertSchema(whatsappConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).omit({
  id: true,
  createdAt: true,
});

export const insertAvailabilitySlotSchema = createInsertSchema(availabilitySlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHandoffQueueSchema = createInsertSchema(handoffQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// WhatsApp Types
export type InsertAgentWhatsappConfig = z.infer<typeof insertAgentWhatsappConfigSchema>;
export type AgentWhatsappConfig = typeof agentWhatsappConfig.$inferSelect;

export type InsertWhatsappConversation = z.infer<typeof insertWhatsappConversationSchema>;
export type WhatsappConversation = typeof whatsappConversations.$inferSelect;

export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;

export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertHandoffQueue = z.infer<typeof insertHandoffQueueSchema>;
export type HandoffQueue = typeof handoffQueue.$inferSelect;


