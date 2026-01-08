/**
 * WhatsApp Cloud API - Message Sending Service
 * 
 * Handles all outbound messaging through WhatsApp Cloud API.
 * Includes rate limiting, tenant isolation, and message tracking.
 */

import { decrypt } from '../utils/encryption';
import type {
  SendMessageRequest,
  SendTextMessage,
  SendTemplateMessage,
  SendInteractiveMessage,
  SendMessageResponse,
  TemplateComponent,
  InteractiveAction,
  RateLimitStatus,
} from './types';

// ========== CONFIGURATION ==========

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ========== RATE LIMITING ==========

/**
 * In-memory rate limit tracking
 * In production, use Redis for distributed rate limiting
 */
const rateLimitStore = new Map<string, RateLimitStatus>();

// Rate limits per messaging tier
const RATE_LIMITS = {
  TIER_1K: { perSecond: 10, perMinute: 100, perHour: 1000 },
  TIER_10K: { perSecond: 50, perMinute: 500, perHour: 10000 },
  TIER_100K: { perSecond: 100, perMinute: 1000, perHour: 100000 },
  UNLIMITED: { perSecond: 250, perMinute: 2500, perHour: 250000 },
} as const;

function getRateLimitKey(tenantId: string, phoneNumberId: string): string {
  return `${tenantId}:${phoneNumberId}`;
}

function checkRateLimit(
  tenantId: string,
  phoneNumberId: string,
  tier: keyof typeof RATE_LIMITS = 'TIER_1K'
): { allowed: boolean; retryAfter?: number } {
  const key = getRateLimitKey(tenantId, phoneNumberId);
  const now = Date.now();
  const limits = RATE_LIMITS[tier];

  let status = rateLimitStore.get(key);
  
  // Initialize or reset expired status
  if (!status || status.resetAt.getTime() < now) {
    status = {
      tenantId,
      phoneNumberId,
      currentSecond: 0,
      currentMinute: 0,
      currentHour: 0,
      templatesSentToday: 0,
      resetAt: new Date(now + 1000), // Reset in 1 second
    };
    rateLimitStore.set(key, status);
  }

  // Check limits
  if (status.currentSecond >= limits.perSecond) {
    return { allowed: false, retryAfter: 1 };
  }
  if (status.currentMinute >= limits.perMinute) {
    return { allowed: false, retryAfter: 60 };
  }
  if (status.currentHour >= limits.perHour) {
    return { allowed: false, retryAfter: 3600 };
  }

  // Increment counters
  status.currentSecond++;
  status.currentMinute++;
  status.currentHour++;

  return { allowed: true };
}

// Reset second counter every second
setInterval(() => {
  for (const status of rateLimitStore.values()) {
    status.currentSecond = 0;
  }
}, 1000);

// Reset minute counter every minute
setInterval(() => {
  for (const status of rateLimitStore.values()) {
    status.currentMinute = 0;
  }
}, 60 * 1000);

// Reset hour counter every hour
setInterval(() => {
  for (const status of rateLimitStore.values()) {
    status.currentHour = 0;
  }
}, 60 * 60 * 1000);

// ========== MESSAGE SENDING SERVICE ==========

export interface MessageSendOptions {
  tenantId: string;
  phoneNumberId: string;
  accessToken: string; // Encrypted token
  messagingTier?: keyof typeof RATE_LIMITS;
}

export interface MessageSendResult {
  success: boolean;
  messageId?: string;
  waId?: string;
  error?: string;
  errorCode?: number;
  rateLimited?: boolean;
  retryAfter?: number;
}

/**
 * Send a text message
 */
export async function sendTextMessage(
  to: string,
  text: string,
  options: MessageSendOptions & { previewUrl?: boolean }
): Promise<MessageSendResult> {
  const { tenantId, phoneNumberId, accessToken, messagingTier, previewUrl } = options;

  // Check rate limit
  const rateCheck = checkRateLimit(tenantId, phoneNumberId, messagingTier);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
    };
  }

  const message: SendTextMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'text',
    text: {
      preview_url: previewUrl ?? false,
      body: text,
    },
  };

  return sendMessage(phoneNumberId, message, accessToken);
}

/**
 * Send a template message (for notifications outside 24hr window)
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components: TemplateComponent[] | undefined,
  options: MessageSendOptions
): Promise<MessageSendResult> {
  const { tenantId, phoneNumberId, accessToken, messagingTier } = options;

  // Check rate limit
  const rateCheck = checkRateLimit(tenantId, phoneNumberId, messagingTier);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
    };
  }

  const message: SendTemplateMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      ...(components && { components }),
    },
  };

  return sendMessage(phoneNumberId, message, accessToken);
}

/**
 * Send an interactive message with buttons or lists
 */
export async function sendInteractiveMessage(
  to: string,
  interactiveType: 'button' | 'list',
  body: string,
  action: InteractiveAction,
  options: MessageSendOptions & {
    header?: { type: 'text'; text: string } | { type: 'image'; link: string };
    footer?: string;
  }
): Promise<MessageSendResult> {
  const { tenantId, phoneNumberId, accessToken, messagingTier, header, footer } = options;

  // Check rate limit
  const rateCheck = checkRateLimit(tenantId, phoneNumberId, messagingTier);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
    };
  }

  const message: SendInteractiveMessage = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'interactive',
    interactive: {
      type: interactiveType,
      body: { text: body },
      action,
      ...(header && { header: header as any }),
      ...(footer && { footer: { text: footer } }),
    },
  };

  return sendMessage(phoneNumberId, message, accessToken);
}

/**
 * Send a media message (image, video, document, audio)
 */
export async function sendMediaMessage(
  to: string,
  mediaType: 'image' | 'video' | 'document' | 'audio',
  mediaUrl: string,
  options: MessageSendOptions & {
    caption?: string;
    filename?: string;
  }
): Promise<MessageSendResult> {
  const { tenantId, phoneNumberId, accessToken, messagingTier, caption, filename } = options;

  // Check rate limit
  const rateCheck = checkRateLimit(tenantId, phoneNumberId, messagingTier);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
    };
  }

  const message: SendMessageRequest & { type: string; [key: string]: any } = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: mediaType,
    [mediaType]: {
      link: mediaUrl,
      ...(caption && { caption }),
      ...(filename && mediaType === 'document' && { filename }),
    },
  };

  return sendMessage(phoneNumberId, message, accessToken);
}

/**
 * Send a location message
 */
export async function sendLocationMessage(
  to: string,
  latitude: number,
  longitude: number,
  options: MessageSendOptions & {
    name?: string;
    address?: string;
  }
): Promise<MessageSendResult> {
  const { tenantId, phoneNumberId, accessToken, messagingTier, name, address } = options;

  // Check rate limit
  const rateCheck = checkRateLimit(tenantId, phoneNumberId, messagingTier);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
    };
  }

  const message: SendMessageRequest & { type: string; location: any } = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'location',
    location: {
      latitude,
      longitude,
      ...(name && { name }),
      ...(address && { address }),
    },
  };

  return sendMessage(phoneNumberId, message, accessToken);
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(
  messageId: string,
  phoneNumberId: string,
  accessToken: string
): Promise<boolean> {
  const token = decrypt(accessToken);

  try {
    const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Message Service] Failed to mark message as read:', error);
    return false;
  }
}

/**
 * Send a reaction to a message
 */
export async function sendReaction(
  to: string,
  messageId: string,
  emoji: string,
  options: MessageSendOptions
): Promise<MessageSendResult> {
  const { phoneNumberId, accessToken } = options;
  const token = decrypt(accessToken);

  try {
    const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizePhoneNumber(to),
        type: 'reaction',
        reaction: {
          message_id: messageId,
          emoji,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || 'Failed to send reaction',
        errorCode: error.error?.code,
      };
    }

    const data: SendMessageResponse = await response.json();
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      waId: data.contacts?.[0]?.wa_id,
    };
  } catch (error: any) {
    console.error('[Message Service] Failed to send reaction:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

// ========== INTERNAL HELPERS ==========

async function sendMessage(
  phoneNumberId: string,
  message: SendMessageRequest,
  encryptedToken: string
): Promise<MessageSendResult> {
  const token = decrypt(encryptedToken);

  try {
    console.log(`[Message Service] Sending ${(message as any).type} message via ${phoneNumberId}`);

    const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Message Service] API error:', data.error);
      return {
        success: false,
        error: data.error?.message || 'API error',
        errorCode: data.error?.code,
      };
    }

    console.log(`[Message Service] Message sent successfully: ${data.messages?.[0]?.id}`);

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
      waId: data.contacts?.[0]?.wa_id,
    };
  } catch (error: any) {
    console.error('[Message Service] Network error:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * Normalize phone number to WhatsApp format
 * Removes + and any non-digit characters
 */
function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

// ========== MEDIA HANDLING ==========

/**
 * Get media URL from media ID
 */
export async function getMediaUrl(
  mediaId: string,
  accessToken: string
): Promise<string | null> {
  const token = decrypt(accessToken);

  try {
    const response = await fetch(`${GRAPH_API_BASE}/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('[Message Service] Failed to get media URL:', error);
    return null;
  }
}

/**
 * Download media content
 */
export async function downloadMedia(
  mediaUrl: string,
  accessToken: string
): Promise<Buffer | null> {
  const token = decrypt(accessToken);

  try {
    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[Message Service] Failed to download media:', error);
    return null;
  }
}

/**
 * Upload media to WhatsApp
 */
export async function uploadMedia(
  phoneNumberId: string,
  accessToken: string,
  file: Buffer,
  mimeType: string,
  filename?: string
): Promise<string | null> {
  const token = decrypt(accessToken);

  try {
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    // Convert Buffer to ArrayBuffer to satisfy BlobPart type
    const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
    formData.append('file', new Blob([arrayBuffer], { type: mimeType }), filename || 'file');
    formData.append('type', mimeType);

    const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Message Service] Media upload failed:', error);
      return null;
    }

    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error('[Message Service] Failed to upload media:', error);
    return null;
  }
}
