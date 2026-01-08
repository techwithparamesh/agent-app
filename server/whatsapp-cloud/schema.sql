/**
 * WhatsApp Cloud API - Database Schema
 * 
 * Schema for multi-tenant WhatsApp Cloud API integration.
 * Each tenant gets their own WABA - no sharing between tenants.
 * 
 * Tables:
 * - whatsapp_cloud_accounts: WABA accounts per tenant
 * - whatsapp_cloud_phone_numbers: Phone numbers per WABA
 * - whatsapp_cloud_agent_links: Agent routing configuration
 * - whatsapp_cloud_conversations: Conversation tracking
 * - whatsapp_cloud_messages: Message history
 */

-- ========== WHATSAPP CLOUD ACCOUNTS ==========
-- One WABA per tenant - strict isolation

CREATE TABLE IF NOT EXISTS whatsapp_cloud_accounts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id VARCHAR(36) NOT NULL,
  
  -- Meta/WABA Identifiers
  waba_id VARCHAR(100) NOT NULL UNIQUE,
  business_manager_id VARCHAR(100),
  meta_business_id VARCHAR(100),
  
  -- Business Information
  business_name VARCHAR(255) NOT NULL,
  business_email VARCHAR(255),
  timezone VARCHAR(100) DEFAULT 'UTC',
  currency VARCHAR(10) DEFAULT 'USD',
  
  -- Access Credentials (ENCRYPTED)
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP NULL,
  
  -- Account Status
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, active, suspended, disconnected
  verification_status VARCHAR(50) DEFAULT 'not_verified', -- not_verified, pending, verified
  account_review_status VARCHAR(50), -- PENDING, APPROVED, REJECTED
  
  -- Webhook Configuration
  webhook_verify_token VARCHAR(255),
  
  -- Permissions tracking
  permissions JSON, -- Stored as ["whatsapp_business_management", "whatsapp_business_messaging"]
  
  -- Metadata
  connected_at TIMESTAMP,
  disconnected_at TIMESTAMP,
  disconnect_reason TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key to users table
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_waba_tenant (tenant_id),
  INDEX idx_waba_status (status),
  UNIQUE INDEX idx_waba_id (waba_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== PHONE NUMBERS ==========
-- One or more phone numbers per WABA

CREATE TABLE IF NOT EXISTS whatsapp_cloud_phone_numbers (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  account_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  
  -- WhatsApp Identifiers
  phone_number_id VARCHAR(100) NOT NULL UNIQUE,
  waba_id VARCHAR(100) NOT NULL,
  
  -- Phone Number Details
  phone_number VARCHAR(20) NOT NULL,
  display_phone_number VARCHAR(30),
  verified_name VARCHAR(255),
  
  -- Quality & Limits
  quality_rating VARCHAR(20) DEFAULT 'NA', -- GREEN, YELLOW, RED, NA
  messaging_limit VARCHAR(50), -- TIER_1K, TIER_10K, TIER_100K, UNLIMITED
  throughput_level VARCHAR(30), -- STANDARD, HIGH
  
  -- Profile Information
  profile_about VARCHAR(500),
  profile_picture_url VARCHAR(500),
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, active, disconnected
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  name_status VARCHAR(30), -- APPROVED, PENDING, DECLINED
  code_verification_status VARCHAR(30), -- VERIFIED, NOT_VERIFIED
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (account_id) REFERENCES whatsapp_cloud_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_phone_account (account_id),
  INDEX idx_phone_tenant (tenant_id),
  INDEX idx_phone_waba (waba_id),
  UNIQUE INDEX idx_phone_number_id (phone_number_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== AGENT LINKS ==========
-- Links phone numbers to AI agents with routing configuration

CREATE TABLE IF NOT EXISTS whatsapp_cloud_agent_links (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  phone_number_id VARCHAR(100) NOT NULL,
  agent_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  
  -- Routing Configuration
  routing_strategy VARCHAR(30) NOT NULL DEFAULT 'primary', -- primary, round_robin, availability, skill_based
  priority INT NOT NULL DEFAULT 0, -- Lower = higher priority
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Load Management
  max_concurrent_conversations INT,
  
  -- Skill-based Routing
  skills JSON, -- ["sales", "support", "billing"]
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_link_phone (phone_number_id),
  INDEX idx_link_agent (agent_id),
  INDEX idx_link_tenant (tenant_id),
  UNIQUE INDEX idx_link_phone_agent (phone_number_id, agent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== CONVERSATIONS ==========
-- Track conversation state and ownership

CREATE TABLE IF NOT EXISTS whatsapp_cloud_conversations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  phone_number_id VARCHAR(100) NOT NULL,
  customer_wa_id VARCHAR(100) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  
  -- Agent Assignment
  assigned_agent_id VARCHAR(36),
  last_agent_id VARCHAR(36), -- For transfer tracking
  
  -- Customer Info
  customer_name VARCHAR(255),
  customer_profile_picture VARCHAR(500),
  
  -- Conversation State
  status VARCHAR(30) NOT NULL DEFAULT 'new', -- new, active, waiting, resolved
  context JSON, -- Conversation context for AI
  
  -- 24hr Window Tracking
  window_expires_at TIMESTAMP, -- When session window expires
  last_customer_message_at TIMESTAMP,
  last_agent_message_at TIMESTAMP,
  
  -- Metrics
  message_count INT DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_conv_phone (phone_number_id),
  INDEX idx_conv_customer (customer_wa_id),
  INDEX idx_conv_tenant (tenant_id),
  INDEX idx_conv_agent (assigned_agent_id),
  INDEX idx_conv_status (status),
  UNIQUE INDEX idx_conv_phone_customer (phone_number_id, customer_wa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== MESSAGES ==========
-- Message history with billing tracking

CREATE TABLE IF NOT EXISTS whatsapp_cloud_messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  conversation_id VARCHAR(36) NOT NULL,
  phone_number_id VARCHAR(100) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  
  -- WhatsApp Message ID
  wa_message_id VARCHAR(100) UNIQUE,
  
  -- Message Details
  direction VARCHAR(10) NOT NULL, -- inbound, outbound
  message_type VARCHAR(30) NOT NULL, -- text, image, video, audio, document, location, template, interactive
  content TEXT,
  
  -- Media (if applicable)
  media_id VARCHAR(100),
  media_url VARCHAR(500),
  media_mime_type VARCHAR(100),
  media_sha256 VARCHAR(64),
  media_filename VARCHAR(255),
  
  -- Template (if applicable)
  template_name VARCHAR(255),
  template_language VARCHAR(10),
  
  -- Status Tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, sent, delivered, read, failed
  error_code INT,
  error_message TEXT,
  
  -- Billing
  is_billable BOOLEAN DEFAULT FALSE,
  conversation_type VARCHAR(30), -- user_initiated, business_initiated
  pricing_category VARCHAR(30), -- marketing, utility, authentication, service
  
  -- Timestamps
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (conversation_id) REFERENCES whatsapp_cloud_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_msg_conversation (conversation_id),
  INDEX idx_msg_phone (phone_number_id),
  INDEX idx_msg_tenant (tenant_id),
  INDEX idx_msg_wa_id (wa_message_id),
  INDEX idx_msg_status (status),
  INDEX idx_msg_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== TEMPLATES ==========
-- Message template management

CREATE TABLE IF NOT EXISTS whatsapp_cloud_templates (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  account_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  
  -- Template Identifiers
  template_id VARCHAR(100), -- Meta template ID
  name VARCHAR(512) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  
  -- Category
  category VARCHAR(50) NOT NULL, -- MARKETING, UTILITY, AUTHENTICATION
  
  -- Content
  header_type VARCHAR(20), -- TEXT, IMAGE, VIDEO, DOCUMENT
  header_content TEXT,
  body_text TEXT NOT NULL,
  footer_text VARCHAR(60),
  
  -- Interactive Elements
  buttons JSON,
  
  -- Variables
  variables JSON,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, PAUSED, DISABLED
  rejection_reason TEXT,
  
  -- Quality
  quality_score VARCHAR(20),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (account_id) REFERENCES whatsapp_cloud_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_template_account (account_id),
  INDEX idx_template_tenant (tenant_id),
  INDEX idx_template_name (name, language),
  INDEX idx_template_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== AUDIT LOG ==========
-- Security audit trail for compliance

CREATE TABLE IF NOT EXISTS whatsapp_cloud_audit_log (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id VARCHAR(36) NOT NULL,
  
  -- Action Details
  action VARCHAR(100) NOT NULL, -- account_connected, account_disconnected, message_sent, permission_changed, etc.
  resource_type VARCHAR(50) NOT NULL, -- account, phone_number, conversation, message
  resource_id VARCHAR(100),
  
  -- Actor
  actor_type VARCHAR(30) NOT NULL, -- user, system, webhook
  actor_id VARCHAR(100),
  
  -- Details
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_audit_tenant (tenant_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_resource (resource_type, resource_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
