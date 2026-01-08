/**
 * WhatsApp Cloud API Types
 * Meta-approved direct integration (no BSPs)
 * 
 * This module defines all types for WhatsApp Cloud API integration
 * using Embedded Signup (on-behalf-of onboarding)
 */

// ========== META OAUTH & EMBEDDED SIGNUP TYPES ==========

/**
 * Response from Meta OAuth after Embedded Signup completion
 */
export interface MetaOAuthResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in?: number;
  // The user's Meta user ID
  user_id?: string;
}

/**
 * Response from exchanging code for long-lived token
 */
export interface MetaLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // Usually 60 days
}

/**
 * WABA information returned after Embedded Signup
 */
export interface WhatsAppBusinessAccountInfo {
  id: string; // WABA ID
  name: string;
  currency: string;
  timezone_id: string;
  message_template_namespace: string;
  account_review_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  business_verification_status?: 'not_verified' | 'pending' | 'verified';
  on_behalf_of_business_info?: {
    id: string;
    name: string;
  };
  owner_business_info?: {
    id: string;
    name: string;
  };
}

/**
 * Phone number information from WABA
 */
export interface WhatsAppPhoneNumberInfo {
  id: string; // Phone Number ID
  display_phone_number: string;
  verified_name: string;
  quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'NA';
  code_verification_status?: 'VERIFIED' | 'NOT_VERIFIED' | 'EXPIRED';
  platform_type?: 'CLOUD_API' | 'ON_PREMISE';
  throughput?: {
    level: 'STANDARD' | 'HIGH' | 'NOT_APPLICABLE';
  };
  name_status?: 'APPROVED' | 'PENDING' | 'DECLINED' | 'EXPIRED' | 'NONE';
}

// ========== WEBHOOK TYPES ==========

/**
 * Meta webhook payload structure
 */
export interface MetaWebhookPayload {
  object: 'whatsapp_business_account';
  entry: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id: string; // WABA ID
  changes: MetaWebhookChange[];
}

export interface MetaWebhookChange {
  field: 'messages' | 'account_update' | 'message_template_status_update';
  value: MetaWebhookValue;
}

export interface MetaWebhookValue {
  messaging_product: 'whatsapp';
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: MetaWebhookContact[];
  messages?: MetaWebhookMessage[];
  statuses?: MetaWebhookStatus[];
  errors?: MetaWebhookError[];
}

export interface MetaWebhookContact {
  wa_id: string;
  profile: {
    name: string;
  };
}

export interface MetaWebhookMessage {
  id: string;
  from: string; // Sender's phone number
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contacts' | 'interactive' | 'button' | 'reaction';
  text?: {
    body: string;
  };
  image?: MediaInfo;
  audio?: MediaInfo;
  video?: MediaInfo;
  document?: MediaInfo & {
    filename?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: ContactInfo[];
  interactive?: InteractiveResponse;
  button?: {
    text: string;
    payload: string;
  };
  reaction?: {
    message_id: string;
    emoji: string;
  };
  context?: {
    from: string;
    id: string;
  };
}

export interface MediaInfo {
  id: string;
  mime_type: string;
  sha256?: string;
  caption?: string;
}

export interface ContactInfo {
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
  };
  phones?: Array<{
    phone: string;
    type: string;
    wa_id?: string;
  }>;
}

export interface InteractiveResponse {
  type: 'button_reply' | 'list_reply';
  button_reply?: {
    id: string;
    title: string;
  };
  list_reply?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface MetaWebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin: {
      type: 'user_initiated' | 'business_initiated' | 'referral_conversion';
    };
    expiration_timestamp?: string;
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: 'business_initiated' | 'user_initiated' | 'referral_conversion' | 'authentication' | 'marketing' | 'utility' | 'service';
  };
  errors?: MetaWebhookError[];
}

export interface MetaWebhookError {
  code: number;
  title: string;
  message: string;
  error_data?: {
    details: string;
  };
}

// ========== MESSAGE SENDING TYPES ==========

/**
 * Base message request for WhatsApp Cloud API
 */
export interface SendMessageRequest {
  messaging_product: 'whatsapp';
  recipient_type?: 'individual';
  to: string; // Recipient phone number
}

export interface SendTextMessage extends SendMessageRequest {
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

export interface SendTemplateMessage extends SendMessageRequest {
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: TemplateComponent[];
  };
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: 'quick_reply' | 'url';
  index?: number;
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: {
    link: string;
  };
  document?: {
    link: string;
    filename?: string;
  };
  video?: {
    link: string;
  };
}

export interface SendInteractiveMessage extends SendMessageRequest {
  type: 'interactive';
  interactive: {
    type: 'button' | 'list' | 'product' | 'product_list';
    header?: {
      type: 'text' | 'image' | 'video' | 'document';
      text?: string;
      image?: { link: string };
      video?: { link: string };
      document?: { link: string; filename?: string };
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: InteractiveAction;
  };
}

export interface InteractiveAction {
  button?: string;
  buttons?: Array<{
    type: 'reply';
    reply: {
      id: string;
      title: string;
    };
  }>;
  sections?: Array<{
    title?: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
  catalog_id?: string;
  product_retailer_id?: string;
}

/**
 * Response from sending a message
 */
export interface SendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

// ========== TENANT & ACCOUNT TYPES ==========

/**
 * Tenant WhatsApp account (for database)
 */
export interface TenantWhatsAppAccount {
  id: string;
  tenantId: string; // User ID in your system
  
  // Meta IDs
  wabaId: string;
  phoneNumberId: string;
  
  // Business Info
  businessName: string;
  displayPhoneNumber: string;
  verifiedName?: string;
  
  // Credentials (encrypted)
  accessToken: string; // System user token
  
  // Status
  qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'NA';
  accountStatus: 'pending' | 'active' | 'suspended' | 'disconnected';
  
  // Webhook
  webhookVerifyToken: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  tokenExpiresAt?: Date;
}

/**
 * Agent assignment for routing
 */
export interface AgentAssignment {
  id: string;
  phoneNumberId: string;
  agentId: string;
  routingMode: 'primary' | 'round_robin' | 'availability' | 'skill_based';
  priority: number;
  isActive: boolean;
  maxConcurrentConversations?: number;
}

/**
 * Conversation ownership tracking
 */
export interface ConversationOwnership {
  conversationId: string;
  phoneNumberId: string;
  customerWaId: string;
  assignedAgentId: string;
  assignedAt: Date;
  lastActivityAt: Date;
  status: 'active' | 'resolved' | 'transferred' | 'timeout';
}

// ========== RATE LIMITING TYPES ==========

export interface RateLimitConfig {
  messagesPerSecond: number;
  messagesPerMinute: number;
  messagesPerHour: number;
  templateMessagesPerDay: number;
}

export interface RateLimitStatus {
  tenantId: string;
  phoneNumberId: string;
  currentSecond: number;
  currentMinute: number;
  currentHour: number;
  templatesSentToday: number;
  resetAt: Date;
}
