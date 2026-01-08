/**
 * WhatsApp Cloud API Module
 * 
 * Production-ready Meta-approved WhatsApp Cloud API integration
 * using Embedded Signup (on-behalf-of onboarding) for multi-tenant SaaS.
 * 
 * Features:
 * - Meta Embedded Signup OAuth flow
 * - System user token management
 * - Multi-tenant WABA isolation
 * - Webhook signature verification
 * - Rate limiting per messaging tier
 * - Agent routing strategies
 * - Message history tracking
 * - Template management
 * - Comprehensive audit logging
 * 
 * @module whatsapp-cloud
 */

// Types
export * from "./types";

// Services
export {
  generateEmbeddedSignupUrl,
  handleOAuthCallback,
  fetchWabaPhoneNumbers,
  fetchWabaDetails,
  generateSystemUserToken,
  verifyTokenPermissions,
  refreshTokenIfNeeded,
  OAuthCallbackResult,
} from "./embeddedSignup";

export {
  sendTextMessage,
  sendTemplateMessage,
  sendInteractiveMessage,
  sendMediaMessage,
  sendLocationMessage,
  markMessageAsRead,
  getMediaUrl,
  uploadMedia,
} from "./messageService";

export {
  verifyMetaSignature,
  resolveTenantByPhoneNumberId,
  processWebhookPayload,
  onMessage,
  onStatus,
} from "./webhookHandler";

export {
  routeToAgent,
  transferConversation,
  resolveConversation,
  resetAgentLoad,
} from "./agentRouter";

// Routes
export { default as whatsappCloudRoutes } from "./routes";
