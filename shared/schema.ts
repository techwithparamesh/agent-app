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
  // Widget Customization fields
  widgetConfig: json("widget_config").$type<{
    displayName?: string;
    primaryColor?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    avatarUrl?: string;
    showBranding?: boolean;
    autoOpen?: boolean;
    responseFormat?: 'structured' | 'conversational';
  }>(),
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

// ========== BSP/WHATSAPP BUSINESS SAAS TABLES ==========

// WhatsApp Business Accounts (WABA) - Created via BSP
export const whatsappBusinessAccounts = mysqlTable("whatsapp_business_accounts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // BSP Account Details (360dialog, Twilio, etc.)
  bspProvider: varchar("bsp_provider", { length: 50 }).notNull(), // '360dialog', 'twilio', 'messagebird', 'gupshup'
  bspAccountId: varchar("bsp_account_id", { length: 255 }), // Account ID from BSP
  bspApiKey: text("bsp_api_key"), // Encrypted API key from BSP
  bspPartnerId: varchar("bsp_partner_id", { length: 255 }),
  
  // Meta/WhatsApp Business Account IDs
  wabaId: varchar("waba_id", { length: 100 }), // WhatsApp Business Account ID
  businessManagerId: varchar("business_manager_id", { length: 100 }),
  metaBusinessId: varchar("meta_business_id", { length: 100 }),
  
  // Business Details
  businessName: varchar("business_name", { length: 255 }).notNull(),
  businessEmail: varchar("business_email", { length: 255 }),
  businessWebsite: varchar("business_website", { length: 500 }),
  businessAddress: text("business_address"),
  businessCategory: varchar("business_category", { length: 100 }),
  businessDescription: text("business_description"),
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  
  // Verification Status
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending"), // pending, submitted, verified, rejected
  verificationSubmittedAt: timestamp("verification_submitted_at"),
  verificationCompletedAt: timestamp("verification_completed_at"),
  verificationNotes: text("verification_notes"),
  
  // Account Status
  status: varchar("status", { length: 50 }).default("pending"), // pending, active, suspended, terminated
  isActive: boolean("is_active").default(false),
  
  // Webhook Configuration
  webhookUrl: varchar("webhook_url", { length: 500 }),
  webhookSecret: varchar("webhook_secret", { length: 255 }),
  webhookVerifyToken: varchar("webhook_verify_token", { length: 255 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  userIdx: index("idx_waba_user").on(table.userId),
  bspIdx: index("idx_waba_bsp").on(table.bspProvider, table.bspAccountId),
  wabaIdx: uniqueIndex("idx_waba_id").on(table.wabaId),
}));

// Phone Numbers - Provisioned via BSP
export const phoneNumbers = mysqlTable("phone_numbers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  wabaId: varchar("waba_id", { length: 36 }).notNull().references(() => whatsappBusinessAccounts.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Phone Number Details
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(), // E.164 format
  displayPhoneNumber: varchar("display_phone_number", { length: 30 }), // Formatted for display
  countryCode: varchar("country_code", { length: 5 }),
  
  // WhatsApp IDs
  phoneNumberId: varchar("phone_number_id", { length: 100 }), // WhatsApp phone number ID
  wabaPhoneNumberId: varchar("waba_phone_number_id", { length: 100 }),
  
  // Number Type & Status
  numberType: varchar("number_type", { length: 50 }).default("new"), // 'new', 'ported', 'virtual'
  provisioningStatus: varchar("provisioning_status", { length: 50 }).default("pending"), // pending, provisioning, active, failed, deactivated
  qualityRating: varchar("quality_rating", { length: 20 }), // green, yellow, red
  messagingLimit: varchar("messaging_limit", { length: 50 }), // TIER_1K, TIER_10K, TIER_100K, UNLIMITED
  
  // Profile Info (displayed on WhatsApp)
  profileName: varchar("profile_name", { length: 255 }),
  profileAbout: varchar("profile_about", { length: 500 }),
  profilePictureUrl: varchar("profile_picture_url", { length: 500 }),
  profileVertical: varchar("profile_vertical", { length: 100 }), // industry category
  profileAddress: text("profile_address"),
  profileEmail: varchar("profile_email", { length: 255 }),
  profileWebsites: json("profile_websites").$type<string[]>(),
  
  // Verification
  isVerified: boolean("is_verified").default(false),
  verifiedName: varchar("verified_name", { length: 255 }),
  
  // Associated Agent (if linked to a specific bot)
  agentId: varchar("agent_id", { length: 36 }).references(() => agents.id, { onDelete: "set null" }),
  
  // Access Credentials
  accessToken: text("access_token"), // Encrypted
  tokenExpiresAt: timestamp("token_expires_at"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  wabaIdx: index("idx_phone_waba").on(table.wabaId),
  userIdx: index("idx_phone_user").on(table.userId),
  phoneIdx: uniqueIndex("idx_phone_number").on(table.phoneNumber),
  phoneIdIdx: index("idx_phone_number_id").on(table.phoneNumberId),
}));

// Message Templates (Pre-approved by Meta)
export const messageTemplates = mysqlTable("message_templates", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  wabaId: varchar("waba_id", { length: 36 }).notNull().references(() => whatsappBusinessAccounts.id, { onDelete: "cascade" }),
  
  // Template Details
  templateId: varchar("template_id", { length: 100 }), // Meta template ID
  name: varchar("name", { length: 512 }).notNull(),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  category: varchar("category", { length: 50 }).notNull(), // MARKETING, UTILITY, AUTHENTICATION
  
  // Template Content
  headerType: varchar("header_type", { length: 20 }), // TEXT, IMAGE, VIDEO, DOCUMENT
  headerContent: text("header_content"),
  bodyText: text("body_text").notNull(),
  footerText: varchar("footer_text", { length: 60 }),
  
  // Buttons & Interactive Elements
  buttons: json("buttons").$type<Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
    text: string;
    url?: string;
    phoneNumber?: string;
  }>>(),
  
  // Variables/Parameters
  variables: json("variables").$type<Array<{
    position: number;
    example: string;
    type: 'text' | 'currency' | 'date_time';
  }>>(),
  
  // Approval Status
  status: varchar("status", { length: 50 }).default("PENDING"), // PENDING, APPROVED, REJECTED, PAUSED, DISABLED
  rejectionReason: text("rejection_reason"),
  
  // Quality & Performance
  qualityScore: varchar("quality_score", { length: 20 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  wabaIdx: index("idx_template_waba").on(table.wabaId),
  nameIdx: index("idx_template_name").on(table.name, table.language),
  statusIdx: index("idx_template_status").on(table.status),
}));

// Usage Tracking & Billing
export const usageRecords = mysqlTable("usage_records", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  wabaId: varchar("waba_id", { length: 36 }).references(() => whatsappBusinessAccounts.id, { onDelete: "set null" }),
  phoneNumberId: varchar("phone_number_id", { length: 36 }).references(() => phoneNumbers.id, { onDelete: "set null" }),
  
  // Billing Period
  billingPeriodStart: timestamp("billing_period_start").notNull(),
  billingPeriodEnd: timestamp("billing_period_end").notNull(),
  
  // Message Counts
  messagesInbound: int("messages_inbound").default(0),
  messagesOutbound: int("messages_outbound").default(0),
  templateMessages: int("template_messages").default(0),
  sessionMessages: int("session_messages").default(0),
  
  // Conversation Counts (WhatsApp charges per 24hr conversation)
  businessInitiatedConversations: int("business_initiated_conversations").default(0),
  userInitiatedConversations: int("user_initiated_conversations").default(0),
  
  // Costs (in cents)
  messageCost: int("message_cost").default(0),
  conversationCost: int("conversation_cost").default(0),
  totalCost: int("total_cost").default(0),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Status
  status: varchar("status", { length: 50 }).default("active"), // active, closed, billed
  invoiceId: varchar("invoice_id", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  userPeriodIdx: index("idx_usage_user_period").on(table.userId, table.billingPeriodStart),
  statusIdx: index("idx_usage_status").on(table.status),
}));

// Individual Message Billing Events
export const messageBillingEvents = mysqlTable("message_billing_events", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  usageRecordId: varchar("usage_record_id", { length: 36 }).references(() => usageRecords.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  phoneNumberId: varchar("phone_number_id", { length: 36 }).references(() => phoneNumbers.id, { onDelete: "set null" }),
  
  // Message Details
  messageId: varchar("message_id", { length: 100 }),
  conversationId: varchar("conversation_id", { length: 100 }), // WhatsApp conversation ID
  direction: varchar("direction", { length: 10 }).notNull(), // inbound, outbound
  messageType: varchar("message_type", { length: 30 }).notNull(), // text, template, media, interactive
  
  // Conversation Pricing Category
  conversationType: varchar("conversation_type", { length: 30 }), // marketing, utility, authentication, service
  isConversationStart: boolean("is_conversation_start").default(false),
  
  // Pricing
  unitCost: int("unit_cost").default(0), // Cost in cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Recipient Info
  recipientPhone: varchar("recipient_phone", { length: 20 }),
  recipientCountry: varchar("recipient_country", { length: 5 }),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  usageIdx: index("idx_billing_usage").on(table.usageRecordId),
  userIdx: index("idx_billing_user").on(table.userId),
  messageIdx: index("idx_billing_message").on(table.messageId),
}));

// Subscription Plans & Pricing
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(), // free, starter, pro, enterprise
  description: varchar("description", { length: 255 }), // Plan description
  
  // Pricing
  monthlyPrice: int("monthly_price").default(0), // In cents
  yearlyPrice: int("yearly_price").default(0), // In cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Limits
  messageLimit: int("message_limit"), // null = unlimited, -1 = unlimited
  agentLimit: int("agent_limit").default(1), // -1 = unlimited
  phoneNumberLimit: int("phone_number_limit").default(1), // -1 = unlimited
  teamMemberLimit: int("team_member_limit").default(1), // -1 = unlimited
  storageLimit: int("storage_limit"), // In MB
  
  // Features
  features: json("features").$type<{
    customBranding: boolean;
    analytics: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    webhooks: boolean;
    integrations: boolean;
    aiCapabilities: string[];
    whatsappIncluded: boolean;
    landingPages: boolean;
    websiteScanning: string; // 'basic', 'advanced', 'enterprise'
  }>(),
  
  // Per-message pricing (for usage above limit)
  perMessageCost: int("per_message_cost").default(0), // In cents
  perConversationCost: int("per_conversation_cost").default(0),
  
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// User Subscriptions
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: varchar("plan_id", { length: 36 }).notNull().references(() => subscriptionPlans.id),
  
  // Billing
  billingCycle: varchar("billing_cycle", { length: 20 }).default("monthly"), // monthly, yearly
  status: varchar("status", { length: 50 }).default("active"), // active, cancelled, past_due, paused
  
  // Payment Provider
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  
  // Period
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  
  // Trial
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  
  // Usage This Period
  messagesUsed: int("messages_used").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  userIdx: uniqueIndex("idx_subscription_user").on(table.userId),
  stripeIdx: index("idx_subscription_stripe").on(table.stripeSubscriptionId),
}));

// Invoices
export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id", { length: 36 }).references(() => userSubscriptions.id, { onDelete: "set null" }),
  
  // Invoice Details
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 100 }),
  
  // Period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Amounts (in cents)
  subtotal: int("subtotal").default(0),
  tax: int("tax").default(0),
  total: int("total").default(0),
  amountPaid: int("amount_paid").default(0),
  amountDue: int("amount_due").default(0),
  currency: varchar("currency", { length: 3 }).default("USD"),
  
  // Line Items
  lineItems: json("line_items").$type<Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>>(),
  
  // Status
  status: varchar("status", { length: 50 }).default("draft"), // draft, open, paid, void, uncollectible
  paidAt: timestamp("paid_at"),
  dueDate: timestamp("due_date"),
  
  // PDF
  invoicePdfUrl: varchar("invoice_pdf_url", { length: 500 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  userIdx: index("idx_invoice_user").on(table.userId),
  statusIdx: index("idx_invoice_status").on(table.status),
  numberIdx: uniqueIndex("idx_invoice_number").on(table.invoiceNumber),
}));

// Webhook Events Log (for debugging & retry)
export const webhookEvents = mysqlTable("webhook_events", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  wabaId: varchar("waba_id", { length: 36 }).references(() => whatsappBusinessAccounts.id, { onDelete: "set null" }),
  phoneNumberId: varchar("phone_number_id", { length: 36 }).references(() => phoneNumbers.id, { onDelete: "set null" }),
  
  // Event Details
  eventId: varchar("event_id", { length: 100 }), // External event ID
  eventType: varchar("event_type", { length: 50 }).notNull(), // message, status, template_status, etc.
  source: varchar("source", { length: 50 }).notNull(), // whatsapp, bsp, stripe
  
  // Payload
  payload: json("payload").$type<Record<string, any>>(),
  
  // Processing Status
  status: varchar("status", { length: 50 }).default("received"), // received, processing, processed, failed
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: int("retry_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  wabaIdx: index("idx_webhook_waba").on(table.wabaId),
  typeIdx: index("idx_webhook_type").on(table.eventType),
  statusIdx: index("idx_webhook_status").on(table.status),
  eventIdx: index("idx_webhook_event").on(table.eventId),
}));

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  agents: many(agents),
  whatsappBusinessAccounts: many(whatsappBusinessAccounts),
  phoneNumbers: many(phoneNumbers),
  usageRecords: many(usageRecords),
  billingEvents: many(messageBillingEvents),
  subscription: one(userSubscriptions),
  invoices: many(invoices),
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

// BSP/SaaS Relations
export const whatsappBusinessAccountsRelations = relations(whatsappBusinessAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [whatsappBusinessAccounts.userId],
    references: [users.id],
  }),
  phoneNumbers: many(phoneNumbers),
  messageTemplates: many(messageTemplates),
  webhookEvents: many(webhookEvents),
}));

export const phoneNumbersRelations = relations(phoneNumbers, ({ one, many }) => ({
  waba: one(whatsappBusinessAccounts, {
    fields: [phoneNumbers.wabaId],
    references: [whatsappBusinessAccounts.id],
  }),
  user: one(users, {
    fields: [phoneNumbers.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [phoneNumbers.agentId],
    references: [agents.id],
  }),
  billingEvents: many(messageBillingEvents),
  webhookEvents: many(webhookEvents),
}));

export const messageTemplatesRelations = relations(messageTemplates, ({ one }) => ({
  waba: one(whatsappBusinessAccounts, {
    fields: [messageTemplates.wabaId],
    references: [whatsappBusinessAccounts.id],
  }),
}));

export const usageRecordsRelations = relations(usageRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [usageRecords.userId],
    references: [users.id],
  }),
  waba: one(whatsappBusinessAccounts, {
    fields: [usageRecords.wabaId],
    references: [whatsappBusinessAccounts.id],
  }),
  phoneNumber: one(phoneNumbers, {
    fields: [usageRecords.phoneNumberId],
    references: [phoneNumbers.id],
  }),
  billingEvents: many(messageBillingEvents),
}));

export const messageBillingEventsRelations = relations(messageBillingEvents, ({ one }) => ({
  usageRecord: one(usageRecords, {
    fields: [messageBillingEvents.usageRecordId],
    references: [usageRecords.id],
  }),
  user: one(users, {
    fields: [messageBillingEvents.userId],
    references: [users.id],
  }),
  phoneNumber: one(phoneNumbers, {
    fields: [messageBillingEvents.phoneNumberId],
    references: [phoneNumbers.id],
  }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  subscription: one(userSubscriptions, {
    fields: [invoices.subscriptionId],
    references: [userSubscriptions.id],
  }),
}));

export const webhookEventsRelations = relations(webhookEvents, ({ one }) => ({
  waba: one(whatsappBusinessAccounts, {
    fields: [webhookEvents.wabaId],
    references: [whatsappBusinessAccounts.id],
  }),
  phoneNumber: one(phoneNumbers, {
    fields: [webhookEvents.phoneNumberId],
    references: [phoneNumbers.id],
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

// BSP/SaaS Insert Schemas
export const insertWhatsappBusinessAccountSchema = createInsertSchema(whatsappBusinessAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhoneNumberSchema = createInsertSchema(phoneNumbers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUsageRecordSchema = createInsertSchema(usageRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageBillingEventSchema = createInsertSchema(messageBillingEvents).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  createdAt: true,
});

// BSP/SaaS Types
export type InsertWhatsappBusinessAccount = z.infer<typeof insertWhatsappBusinessAccountSchema>;
export type WhatsappBusinessAccount = typeof whatsappBusinessAccounts.$inferSelect;

export type InsertPhoneNumber = z.infer<typeof insertPhoneNumberSchema>;
export type PhoneNumber = typeof phoneNumbers.$inferSelect;

export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;

export type InsertUsageRecord = z.infer<typeof insertUsageRecordSchema>;
export type UsageRecord = typeof usageRecords.$inferSelect;

export type InsertMessageBillingEvent = z.infer<typeof insertMessageBillingEventSchema>;
export type MessageBillingEvent = typeof messageBillingEvents.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;


