-- =====================================================
-- DATABASE UPDATE SCRIPT FOR VPS DEPLOYMENT
-- Run these commands in your MySQL database
-- NOTE: MySQL doesn't support "IF NOT EXISTS" for indexes.
--       Just run each command - duplicate errors are OK to ignore.
-- =====================================================

-- =====================================================
-- 1. SCHEMA UPDATES - Add new columns
-- =====================================================

-- Add password reset fields to users table (ignore error if columns exist)
ALTER TABLE users 
ADD COLUMN reset_password_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN reset_password_expires TIMESTAMP DEFAULT NULL;

-- =====================================================
-- 2. PERFORMANCE INDEXES
-- Run each command. "Duplicate key name" errors mean index exists - OK!
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_reset_token ON users(reset_password_token);
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

-- Agents table indexes
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_is_active ON agents(is_active);
CREATE INDEX idx_agents_agent_type ON agents(agent_type);
CREATE INDEX idx_agents_scan_status ON agents(scan_status);

-- Knowledge base indexes
CREATE INDEX idx_knowledge_agent_id ON knowledge_base(agent_id);
CREATE INDEX idx_knowledge_source_url ON knowledge_base(source_url(255));

-- Conversations indexes
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- WhatsApp conversations indexes (some may already exist from schema)
CREATE INDEX idx_whatsapp_conv_agent_id ON whatsapp_conversations(agent_id);
CREATE INDEX idx_whatsapp_conv_phone ON whatsapp_conversations(user_phone);
CREATE INDEX idx_whatsapp_conv_status ON whatsapp_conversations(state);
CREATE INDEX idx_whatsapp_conv_created_at ON whatsapp_conversations(created_at);

-- WhatsApp messages indexes
CREATE INDEX idx_whatsapp_msg_conv_id ON whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_msg_created_at ON whatsapp_messages(created_at);

-- Agent WhatsApp config indexes
CREATE INDEX idx_agent_wa_config_agent_id ON agent_whatsapp_config(agent_id);

-- Leads indexes
CREATE INDEX idx_leads_agent_id ON leads(agent_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- Appointments indexes (some may already exist from schema)
CREATE INDEX idx_appointments_agent_id ON appointments(agent_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_phone ON appointments(customer_phone);

-- Availability slots indexes
CREATE INDEX idx_availability_agent_id ON availability_slots(agent_id);
CREATE INDEX idx_availability_day ON availability_slots(day_of_week);

-- Handoff queue indexes
CREATE INDEX idx_handoff_agent_id ON handoff_queue(agent_id);
CREATE INDEX idx_handoff_status ON handoff_queue(status);
CREATE INDEX idx_handoff_priority ON handoff_queue(priority);
CREATE INDEX idx_handoff_created_at ON handoff_queue(created_at);

-- WhatsApp business accounts indexes
CREATE INDEX idx_waba_user_id ON whatsapp_business_accounts(user_id);
CREATE INDEX idx_waba_status ON whatsapp_business_accounts(status);

-- Phone numbers indexes (some may already exist from schema)
CREATE INDEX idx_phone_numbers_waba_id ON phone_numbers(waba_id);
CREATE INDEX idx_phone_numbers_user_id ON phone_numbers(user_id);
CREATE INDEX idx_phone_numbers_status ON phone_numbers(provisioning_status);
CREATE INDEX idx_phone_numbers_phone ON phone_numbers(phone_number);

-- Message templates indexes (some may already exist from schema)
CREATE INDEX idx_msg_templates_waba_id ON message_templates(waba_id);
CREATE INDEX idx_msg_templates_status ON message_templates(status);
CREATE INDEX idx_msg_templates_category ON message_templates(category);

-- Usage records indexes (some may already exist from schema)
CREATE INDEX idx_usage_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_waba_id ON usage_records(waba_id);
CREATE INDEX idx_usage_period_start ON usage_records(billing_period_start);
CREATE INDEX idx_usage_status ON usage_records(status);

-- Message billing events indexes (some may already exist from schema)
CREATE INDEX idx_billing_user_id ON message_billing_events(user_id);
CREATE INDEX idx_billing_usage_id ON message_billing_events(usage_record_id);
CREATE INDEX idx_billing_phone_id ON message_billing_events(phone_number_id);
CREATE INDEX idx_billing_created_at ON message_billing_events(created_at);

-- User subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);

-- Invoices indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_stripe_id ON invoices(stripe_invoice_id);

-- Webhook events indexes
CREATE INDEX idx_webhooks_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhooks_source ON webhook_events(source);
CREATE INDEX idx_webhooks_processed_at ON webhook_events(processed_at);

-- Integrations indexes (some may already exist from schema)
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_agent_id ON integrations(agent_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_active ON integrations(is_active);

-- Integration logs indexes
CREATE INDEX idx_integration_logs_integration_id ON integration_logs(integration_id);
CREATE INDEX idx_integration_logs_status ON integration_logs(status);
CREATE INDEX idx_integration_logs_created_at ON integration_logs(created_at);

-- Sessions table indexes
CREATE INDEX idx_sessions_expires ON sessions(expires);

-- =====================================================
-- 3. COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Common query: Get agents with conversations for a user
CREATE INDEX idx_agents_user_active ON agents(user_id, is_active);

-- Common query: Get recent conversations for an agent
CREATE INDEX idx_conversations_agent_recent ON conversations(agent_id, created_at);

-- Common query: Get messages in a conversation by time
CREATE INDEX idx_messages_conv_time ON messages(conversation_id, created_at);

-- Common query: Get leads by agent and status
CREATE INDEX idx_leads_agent_status ON leads(agent_id, status);

-- Common query: Get upcoming appointments
CREATE INDEX idx_appointments_agent_date ON appointments(agent_id, appointment_date);

-- =====================================================
-- 4. VERIFY INDEXES WERE CREATED
-- =====================================================
-- Run: SHOW INDEX FROM users;
-- Run: SHOW INDEX FROM agents;
-- etc.
