/**
 * WhatsApp Cloud API - Webhook Handler
 * 
 * Production-ready webhook implementation for multi-tenant SaaS:
 * - Validates Meta signature for security
 * - Routes messages to correct tenant using phone_number_id
 * - Handles all webhook event types
 * - Strict tenant isolation
 */

import crypto from 'crypto';
import type { Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import type {
  MetaWebhookPayload,
  MetaWebhookEntry,
  MetaWebhookChange,
  MetaWebhookValue,
  MetaWebhookMessage,
  MetaWebhookStatus,
} from './types';

// ========== SIGNATURE VERIFICATION ==========

/**
 * Verify the X-Hub-Signature-256 header from Meta
 * This MUST be validated for security in production
 */
export function verifyMetaSignature(
  rawBody: Buffer | string,
  signature: string | undefined,
  appSecret: string
): boolean {
  if (!signature) {
    console.warn('[Webhook] Missing X-Hub-Signature-256 header');
    return false;
  }

  // Signature format: sha256=<hash>
  const [algorithm, receivedHash] = signature.split('=');
  if (algorithm !== 'sha256' || !receivedHash) {
    console.warn('[Webhook] Invalid signature format');
    return false;
  }

  // Compute expected signature
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(body)
    .digest('hex');

  // Time-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch {
    return false;
  }
}

// ========== TENANT RESOLUTION ==========

/**
 * Tenant account info resolved from phone_number_id
 */
export interface ResolvedTenant {
  tenantId: string;
  wabaId: string;
  phoneNumberId: string;
  businessName: string;
  accessToken: string; // Encrypted
  agentIds: string[]; // Linked agents for routing
}

/**
 * In-memory cache for tenant lookups (optimize for high webhook volume)
 * In production, use Redis with short TTL
 */
const tenantCache = new Map<string, { data: ResolvedTenant; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Resolve tenant from phone_number_id
 * This is the critical function for tenant isolation
 */
export async function resolveTenantByPhoneNumberId(
  phoneNumberId: string
): Promise<ResolvedTenant | null> {
  // Check cache first
  const cached = tenantCache.get(phoneNumberId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    // Import schema dynamically to avoid circular deps
    const { whatsappCloudAccounts, whatsappCloudPhoneNumbers, whatsappCloudAgentLinks } = 
      await import('../../shared/schema');

    // Query phone number and join with account
    const [phoneRecord] = await db
      .select({
        id: whatsappCloudPhoneNumbers.id, // Internal UUID for agent link lookup
        userId: whatsappCloudAccounts.userId,
        wabaId: whatsappCloudAccounts.wabaId,
        businessName: whatsappCloudAccounts.businessName,
        encryptedAccessToken: whatsappCloudAccounts.encryptedAccessToken,
        phoneNumberId: whatsappCloudPhoneNumbers.phoneNumberId,
      })
      .from(whatsappCloudPhoneNumbers)
      .innerJoin(
        whatsappCloudAccounts,
        eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id)
      )
      .where(
        and(
          eq(whatsappCloudPhoneNumbers.phoneNumberId, phoneNumberId),
          eq(whatsappCloudPhoneNumbers.status, 'active'),
          eq(whatsappCloudAccounts.status, 'active')
        )
      )
      .limit(1);

    if (!phoneRecord) {
      console.warn(`[Webhook] No active tenant found for phone_number_id: ${phoneNumberId}`);
      return null;
    }

    // Get linked agents using the internal phone record ID (not Meta's phone_number_id)
    const agentLinks = await db
      .select({ agentId: whatsappCloudAgentLinks.agentId })
      .from(whatsappCloudAgentLinks)
      .where(
        eq(whatsappCloudAgentLinks.phoneNumberId, phoneRecord.id)
      );

    console.log(`[Webhook] Found tenant for ${phoneNumberId}: userId=${phoneRecord.userId}, agents=${agentLinks.length}`);

    const tenant: ResolvedTenant = {
      tenantId: phoneRecord.userId,
      wabaId: phoneRecord.wabaId,
      phoneNumberId: phoneRecord.phoneNumberId,
      businessName: phoneRecord.businessName || '',
      accessToken: phoneRecord.encryptedAccessToken, // Note: Still encrypted, caller must decrypt
      agentIds: agentLinks.map(l => l.agentId),
    };

    // Cache the result
    tenantCache.set(phoneNumberId, {
      data: tenant,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return tenant;
  } catch (error) {
    console.error('[Webhook] Error resolving tenant:', error);
    return null;
  }
}

/**
 * Invalidate tenant cache (call when tenant config changes)
 */
export function invalidateTenantCache(phoneNumberId?: string): void {
  if (phoneNumberId) {
    tenantCache.delete(phoneNumberId);
  } else {
    tenantCache.clear();
  }
}

// ========== WEBHOOK EVENT HANDLERS ==========

export interface WebhookProcessResult {
  processed: number;
  errors: number;
  tenantId?: string;
}

/**
 * Message handler callback type
 */
export type MessageHandler = (
  tenant: ResolvedTenant,
  message: MetaWebhookMessage,
  contact: { waId: string; name: string }
) => Promise<void>;

/**
 * Status handler callback type
 */
export type StatusHandler = (
  tenant: ResolvedTenant,
  status: MetaWebhookStatus
) => Promise<void>;

// Handler registrations
let messageHandler: MessageHandler | null = null;
let statusHandler: StatusHandler | null = null;

/**
 * Register the message handler
 */
export function onMessage(handler: MessageHandler): void {
  messageHandler = handler;
}

/**
 * Register the status handler
 */
export function onStatus(handler: StatusHandler): void {
  statusHandler = handler;
}

/**
 * Process a webhook payload
 * Returns quickly after validation, processes async
 */
export async function processWebhookPayload(
  payload: MetaWebhookPayload
): Promise<WebhookProcessResult> {
  let processed = 0;
  let errors = 0;
  let tenantId: string | undefined;

  // Validate payload structure
  if (payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
    console.warn('[Webhook] Invalid payload structure');
    return { processed: 0, errors: 1 };
  }

  // Process each entry
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field === 'messages') {
        const result = await processMessagesChange(change.value);
        processed += result.processed;
        errors += result.errors;
        tenantId = result.tenantId;
      }
    }
  }

  return { processed, errors, tenantId };
}

async function processMessagesChange(
  value: MetaWebhookValue
): Promise<WebhookProcessResult> {
  let processed = 0;
  let errors = 0;

  const phoneNumberId = value.metadata?.phone_number_id;
  if (!phoneNumberId) {
    console.warn('[Webhook] Missing phone_number_id in metadata');
    return { processed: 0, errors: 1 };
  }

  // Resolve tenant from phone_number_id
  const tenant = await resolveTenantByPhoneNumberId(phoneNumberId);
  if (!tenant) {
    console.warn(`[Webhook] Unknown phone_number_id: ${phoneNumberId}`);
    return { processed: 0, errors: 1 };
  }

  // Process incoming messages
  if (value.messages && messageHandler) {
    for (const message of value.messages) {
      try {
        // Find contact info
        const contact = value.contacts?.find(c => c.wa_id === message.from);
        
        await messageHandler(tenant, message, {
          waId: message.from,
          name: contact?.profile?.name || 'Unknown',
        });
        
        processed++;
      } catch (error) {
        console.error('[Webhook] Error processing message:', error);
        errors++;
      }
    }
  }

  // Process status updates
  if (value.statuses && statusHandler) {
    for (const status of value.statuses) {
      try {
        await statusHandler(tenant, status);
        processed++;
      } catch (error) {
        console.error('[Webhook] Error processing status:', error);
        errors++;
      }
    }
  }

  return { processed, errors, tenantId: tenant.tenantId };
}

// ========== EXPRESS MIDDLEWARE ==========

/**
 * Express middleware for webhook verification (GET)
 */
export function webhookVerificationHandler(verifyToken: string) {
  return (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    console.log('[Webhook] Verification request received');

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[Webhook] Verification successful');
      res.status(200).send(challenge);
    } else {
      console.warn('[Webhook] Verification failed - token mismatch');
      res.sendStatus(403);
    }
  };
}

/**
 * Express middleware for webhook messages (POST)
 */
export function webhookMessageHandler(appSecret: string, enforceSignature: boolean = true) {
  return async (req: Request, res: Response): Promise<void> => {
    // Get raw body for signature verification
    const rawBody = (req as any).rawBody as Buffer | undefined;
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    // Verify signature in production
    if (enforceSignature) {
      if (!rawBody) {
        console.error('[Webhook] Raw body not available for signature verification');
        res.sendStatus(500);
        return;
      }

      if (!verifyMetaSignature(rawBody, signature, appSecret)) {
        console.warn('[Webhook] Invalid signature - rejecting');
        res.sendStatus(401);
        return;
      }
    }

    // Always respond quickly with 200
    res.sendStatus(200);

    // Process webhook asynchronously
    try {
      const payload = req.body as MetaWebhookPayload;
      const result = await processWebhookPayload(payload);
      
      console.log(
        `[Webhook] Processed: ${result.processed} events, ${result.errors} errors` +
        (result.tenantId ? ` for tenant ${result.tenantId}` : '')
      );
    } catch (error) {
      console.error('[Webhook] Error processing webhook:', error);
    }
  };
}

// ========== SECURITY UTILITIES ==========

/**
 * Generate a secure webhook verify token
 */
export function generateVerifyToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Mask phone number for logging (privacy)
 */
export function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return '****';
  return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
}

/**
 * Sanitize webhook payload for logging (remove sensitive data)
 */
export function sanitizePayloadForLog(payload: MetaWebhookPayload): object {
  return {
    object: payload.object,
    entryCount: payload.entry?.length || 0,
    changes: payload.entry?.flatMap(e => 
      e.changes?.map(c => ({
        field: c.field,
        messageCount: c.value?.messages?.length || 0,
        statusCount: c.value?.statuses?.length || 0,
        phoneNumberId: c.value?.metadata?.phone_number_id,
      }))
    ),
  };
}
