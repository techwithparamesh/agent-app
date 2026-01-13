/**
 * WhatsApp Cloud API - Message Sending Service
 * 
 * Handles all outbound messaging through WhatsApp Cloud API.
 * Includes rate limiting, tenant isolation, and message tracking.
 */

import { decrypt } from '../utils/encryption';
import { createClient } from "redis";
import type {
  SendMessageRequest,
  SendTextMessage,
  SendTemplateMessage,
  SendInteractiveMessage,
  SendMessageResponse,
  TemplateComponent,
  InteractiveAction,
} from './types';

// ========== CONFIGURATION ==========

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ========== RATE LIMITING ==========

/**
 * Multi-scope throttling (MANDATORY):
 * - per-user
 * - per-WABA
 * - per-phone-number
 *
 * Distinct limits for:
 * - free_text_reply
 * - template
 * - broadcast
 *
 * Uses Redis if REDIS_URL is set; otherwise falls back to in-memory.
 */

type OutboundCategory = "free_text_reply" | "template" | "broadcast";

const BASE_TIER_LIMITS = {
  TIER_1K: { perSecond: 10, perMinute: 100, perHour: 1000 },
  TIER_10K: { perSecond: 50, perMinute: 500, perHour: 10000 },
  TIER_100K: { perSecond: 100, perMinute: 1000, perHour: 100000 },
  UNLIMITED: { perSecond: 250, perMinute: 2500, perHour: 250000 },
} as const;

type TierKey = keyof typeof BASE_TIER_LIMITS;

// Conservative tuning aligned with Meta tiers + SaaS plans (plans further cap tier in routes).
// - Free-text replies are limited to protect quality & avoid spam.
// - Templates are more restrictive (even though policy-compliant).
// - Broadcast is the most restrictive.
const CATEGORY_MULTIPLIER: Record<OutboundCategory, number> = {
  free_text_reply: 0.5,
  template: 0.25,
  broadcast: 0.05,
};

const CATEGORY_DAILY_CAP: Record<TierKey, Record<OutboundCategory, number | undefined>> = {
  TIER_1K: { free_text_reply: undefined, template: 250, broadcast: 50 },
  TIER_10K: { free_text_reply: undefined, template: 1000, broadcast: 200 },
  TIER_100K: { free_text_reply: undefined, template: 2500, broadcast: 500 },
  UNLIMITED: { free_text_reply: undefined, template: 5000, broadcast: 1000 },
};

type RedisClient = ReturnType<typeof createClient>;

let redisClientPromise: Promise<RedisClient | null> | null = null;

async function getRedisClient(): Promise<RedisClient | null> {
  const url = process.env.REDIS_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[WhatsApp RateLimit] REDIS_URL is required in production.");
    }
    console.warn("[WhatsApp RateLimit] REDIS_URL not set; using in-memory rate limiting (single-instance only).");
    return null;
  }

  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      try {
        const client = createClient({ url });
        client.on("error", (err) => console.error("[WhatsApp RateLimit] Redis error:", err));
        await client.connect();
        return client;
      } catch (err) {
        console.error("[WhatsApp RateLimit] Failed to connect Redis:", err);
        if (process.env.NODE_ENV === "production") {
          throw err;
        }
        return null;
      }
    })();
  }

  return redisClientPromise;
}

const memoryCounters = new Map<string, { count: number; resetAt: number }>();

// Best-effort cleanup for dev/single-instance mode
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryCounters.entries()) {
    if (value.resetAt <= now) memoryCounters.delete(key);
  }
}, 60_000);

async function consumeCounter(key: string, windowSeconds: number, limit: number): Promise<{ allowed: boolean; retryAfter?: number }> {
  const redis = await getRedisClient();
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    if (count > limit) {
      const ttl = await redis.ttl(key);
      return { allowed: false, retryAfter: Math.max(1, ttl) };
    }
    return { allowed: true };
  }

  const now = Date.now();
  const existing = memoryCounters.get(key);
  const windowMs = windowSeconds * 1000;

  if (!existing || existing.resetAt <= now) {
    memoryCounters.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }

  existing.count += 1;
  return { allowed: true };
}

function calcLimit(base: number, mult: number): number {
  return Math.max(1, Math.floor(base * mult));
}

async function enforceOutboundRateLimit(params: {
  tenantId: string;
  wabaId?: string;
  phoneNumberId: string;
  tier?: TierKey;
  category: OutboundCategory;
}): Promise<
  | { allowed: true }
  | {
      allowed: false;
      retryAfter?: number;
      hit: {
        category: OutboundCategory;
        tier: TierKey;
        scope: "phone" | "user" | "waba";
        window: "s" | "m" | "h" | "d";
        limit: number;
      };
    }
> {
  const tier = (params.tier || "TIER_1K") as TierKey;
  const base = BASE_TIER_LIMITS[tier] || BASE_TIER_LIMITS.TIER_1K;
  const mult = CATEGORY_MULTIPLIER[params.category];
  const perDayCap = CATEGORY_DAILY_CAP[tier]?.[params.category];

  const perPhone = {
    perSecond: calcLimit(base.perSecond, mult),
    perMinute: calcLimit(base.perMinute, mult),
    perHour: calcLimit(base.perHour, mult),
    perDay: perDayCap,
  };

  const perWaba = params.wabaId
    ? {
        perSecond: perPhone.perSecond * 2,
        perMinute: perPhone.perMinute * 2,
        perHour: perPhone.perHour * 2,
        perDay: perPhone.perDay ? perPhone.perDay * 2 : undefined,
      }
    : null;

  const perUser = {
    perSecond: perPhone.perSecond * 3,
    perMinute: perPhone.perMinute * 3,
    perHour: perPhone.perHour * 3,
    perDay: perPhone.perDay ? perPhone.perDay * 3 : undefined,
  };

  const scopes: Array<{ scope: "phone" | "user" | "waba"; prefix: string; limits: any }> = [
    { scope: "phone", prefix: `wa:out:${params.category}:phone:${params.tenantId}:${params.phoneNumberId}`, limits: perPhone },
    { scope: "user", prefix: `wa:out:${params.category}:user:${params.tenantId}`, limits: perUser },
  ];
  if (perWaba && params.wabaId) {
    scopes.push({ scope: "waba", prefix: `wa:out:${params.category}:waba:${params.tenantId}:${params.wabaId}`, limits: perWaba });
  }

  const windows: Array<{ suffix: string; seconds: number; getLimit: (l: any) => number | undefined }> = [
    { suffix: "s", seconds: 1, getLimit: (l) => l.perSecond },
    { suffix: "m", seconds: 60, getLimit: (l) => l.perMinute },
    { suffix: "h", seconds: 3600, getLimit: (l) => l.perHour },
    { suffix: "d", seconds: 86400, getLimit: (l) => l.perDay },
  ];

  for (const scope of scopes) {
    for (const w of windows) {
      const limit = w.getLimit(scope.limits);
      if (!limit) continue;
      const key = `${scope.prefix}:${w.suffix}`;
      const result = await consumeCounter(key, w.seconds, limit);
      if (!result.allowed) {
        return {
          allowed: false,
          retryAfter: result.retryAfter,
          hit: {
            category: params.category,
            tier,
            scope: scope.scope,
            window: w.suffix as any,
            limit,
          },
        };
      }
    }
  }

  return { allowed: true };
}

// ========== MESSAGE SENDING SERVICE ==========

export interface MessageSendOptions {
  tenantId: string;
  wabaId?: string;
  phoneNumberId: string;
  accessToken: string; // Encrypted token
  messagingTier?: TierKey;
  category?: OutboundCategory;
}

export interface MessageSendResult {
  success: boolean;
  messageId?: string;
  waId?: string;
  error?: string;
  errorCode?: number;
  rateLimited?: boolean;
  retryAfter?: number;
  rateLimit?: {
    category: OutboundCategory;
    tier: TierKey;
    scope: "phone" | "user" | "waba";
    window: "s" | "m" | "h" | "d";
    limit: number;
  };
}

/**
 * Send a text message
 */
export async function sendTextMessage(
  to: string,
  text: string,
  options: MessageSendOptions & { previewUrl?: boolean }
): Promise<MessageSendResult> {
  const { tenantId, wabaId, phoneNumberId, accessToken, messagingTier, previewUrl, category } = options;

  // Check rate limit
  const rateCheck = await enforceOutboundRateLimit({
    tenantId,
    wabaId,
    phoneNumberId,
    tier: messagingTier,
    category: category ?? 'free_text_reply',
  });
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
      rateLimit: rateCheck.hit,
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
  const { tenantId, wabaId, phoneNumberId, accessToken, messagingTier, category } = options;

  // Check rate limit
  const rateCheck = await enforceOutboundRateLimit({
    tenantId,
    wabaId,
    phoneNumberId,
    tier: messagingTier,
    category: category ?? 'template',
  });
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
      rateLimit: rateCheck.hit,
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
  const { tenantId, wabaId, phoneNumberId, accessToken, messagingTier, header, footer, category } = options;

  // Check rate limit
  const rateCheck = await enforceOutboundRateLimit({
    tenantId,
    wabaId,
    phoneNumberId,
    tier: messagingTier,
    category: category ?? 'free_text_reply',
  });
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
      rateLimit: rateCheck.hit,
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
  const { tenantId, wabaId, phoneNumberId, accessToken, messagingTier, caption, filename, category } = options;

  // Check rate limit
  const rateCheck = await enforceOutboundRateLimit({
    tenantId,
    wabaId,
    phoneNumberId,
    tier: messagingTier,
    category: category ?? 'free_text_reply',
  });
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
      rateLimit: rateCheck.hit,
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
  const { tenantId, wabaId, phoneNumberId, accessToken, messagingTier, name, address, category } = options;

  // Check rate limit
  const rateCheck = await enforceOutboundRateLimit({
    tenantId,
    wabaId,
    phoneNumberId,
    tier: messagingTier,
    category: category ?? 'free_text_reply',
  });
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded',
      rateLimited: true,
      retryAfter: rateCheck.retryAfter,
      rateLimit: rateCheck.hit,
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
