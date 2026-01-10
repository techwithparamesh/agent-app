/**
 * WhatsApp Cloud API Routes
 * 
 * Production-ready REST endpoints for Meta-approved WhatsApp Cloud API integration
 * using Embedded Signup (on-behalf-of onboarding) for multi-tenant SaaS.
 * 
 * Security features:
 * - Session-based authentication required
 * - Tenant isolation via user ID
 * - Meta webhook signature verification
 * - Encrypted token storage
 * - Comprehensive audit logging
 */

import { Router, Request, Response, NextFunction } from "express";
import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "../db";
import {
  whatsappCloudAccounts,
  whatsappCloudPhoneNumbers,
  whatsappCloudAgentLinks,
  whatsappCloudConversations,
  whatsappCloudMessages,
  whatsappCloudTemplates,
  whatsappCloudAuditLog,
  agents,
  users,
} from "../../shared/schema";
import {
  generateEmbeddedSignupUrl,
  handleOAuthCallback,
  fetchWabaPhoneNumbers,
  fetchWabaDetails,
} from "./embeddedSignup";
import { sendTextMessage, sendTemplateMessage, markMessageAsRead } from "./messageService";
import { verifyMetaSignature, processWebhookPayload, onMessage, onStatus } from "./webhookHandler";
import { routeToAgent } from "./agentRouter";
import { encrypt, decrypt } from "../utils/encryption";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

let webhookHandlersRegistered = false;

function registerWebhookHandlersOnce() {
  if (webhookHandlersRegistered) return;
  webhookHandlersRegistered = true;

  onMessage(async (tenant, message, contact) => {
    const from = message.from;
    const messageText = (message as any)?.text?.body ? String((message as any).text.body) : "";

    if (!from) {
      console.warn("[Webhook] Missing message.from");
      return;
    }

    if (!messageText.trim()) {
      console.log("[Webhook] Non-text or empty message received; skipping", {
        type: (message as any)?.type,
        from,
      });
      return;
    }

    // Route to agent
    const decision = await routeToAgent(tenant, from);
    if (!decision) {
      console.warn("[Webhook] No agent routing decision", { from, metaPhoneNumberId: tenant.metaPhoneNumberId });
      return;
    }

    // Upsert conversation
    const now = new Date();
    const windowExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [existingConversation] = await db
      .select()
      .from(whatsappCloudConversations)
      .where(and(
        eq(whatsappCloudConversations.phoneNumberId, tenant.phoneRecordId),
        eq(whatsappCloudConversations.customerWaId, from),
        eq(whatsappCloudConversations.status, "active")
      ))
      .limit(1);

    let conversationId: string;
    if (existingConversation) {
      conversationId = existingConversation.id;
      await db.update(whatsappCloudConversations)
        .set({
          agentId: decision.agentId,
          customerName: contact?.name || existingConversation.customerName,
          lastCustomerMessageAt: now,
          windowExpiresAt,
          messageCount: (existingConversation.messageCount || 0) + 1,
          updatedAt: now,
        })
        .where(eq(whatsappCloudConversations.id, conversationId));
    } else {
      await db.insert(whatsappCloudConversations).values({
        phoneNumberId: tenant.phoneRecordId,
        agentId: decision.agentId,
        customerWaId: from,
        customerName: contact?.name || null,
        status: "active",
        lastCustomerMessageAt: now,
        windowExpiresAt,
        messageCount: 1,
      });

      const [created] = await db
        .select()
        .from(whatsappCloudConversations)
        .where(and(
          eq(whatsappCloudConversations.phoneNumberId, tenant.phoneRecordId),
          eq(whatsappCloudConversations.customerWaId, from),
          eq(whatsappCloudConversations.status, "active")
        ))
        .limit(1);
      conversationId = created?.id as string;
    }

    // Store inbound message
    try {
      await db.insert(whatsappCloudMessages).values({
        conversationId,
        waMessageId: (message as any)?.id || null,
        direction: "inbound",
        messageType: "text",
        content: messageText,
        status: "delivered",
      });
    } catch (e) {
      console.warn("[Webhook] Failed to store inbound message", { err: (e as any)?.message });
    }

    // Generate response (same core logic style as widget chat)
    const [agent] = await db.select().from(agents).where(eq(agents.id, decision.agentId)).limit(1);
    if (!agent || !agent.isActive) {
      console.warn("[Webhook] Agent not active/not found", { agentId: decision.agentId });
      return;
    }

    const usageCheck = await storage.canSendMessage(agent.userId);
    if (!usageCheck.allowed) {
      console.warn("[Webhook] Message limit reached for agent owner", { userId: agent.userId });
      return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let responseText = `Hi! I'm ${agent.name}. How can I help you?`;

    if (apiKey) {
      const allKnowledge = await storage.getKnowledgeByAgentId(agent.id);
      const relevantKnowledge = allKnowledge.slice(0, 15);
      // Keep it simple: use the most recent/available chunks first.
      const knowledgeContext = relevantKnowledge
        .map((k: any) => `[${k.title || 'Info'}${k.section ? ' - ' + k.section : ''}]\n${k.content}`)
        .join("\n\n---\n\n");

      const basePrompt = (agent as any).systemPrompt || `You are ${agent.name}, a helpful AI assistant.
${(agent as any).description ? `About: ${(agent as any).description}` : ""}
Tone: ${(agent as any).toneOfVoice || "friendly and professional"}

CRITICAL RESPONSE RULES:
1. Keep responses SHORT (WhatsApp style)
2. Use bullet points with - when listing
3. Answer the question directly first
4. If you don't know, say so
`;

      const systemPrompt = `${basePrompt}\n\n${knowledgeContext ? `Here is relevant information from the knowledge base:\n\n${knowledgeContext}` : ""}`;
      const anthropic = new Anthropic({ apiKey });

      const completion = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        system: systemPrompt,
        messages: [{ role: "user", content: messageText }],
      });

      responseText =
        completion.content[0]?.type === "text"
          ? completion.content[0].text
          : responseText;
    }

    // Send response
    const accessToken = decrypt(tenant.accessToken);
    const sendResult = await sendTextMessage(from, responseText, {
      tenantId: tenant.tenantId,
      phoneNumberId: tenant.metaPhoneNumberId,
      accessToken,
      messagingTier: (tenant.messagingTier || "TIER_1K") as any,
    });

    if (!sendResult.success) {
      console.error("[Webhook] Failed to send WhatsApp reply", sendResult.error);
      return;
    }

    try {
      await db.insert(whatsappCloudMessages).values({
        conversationId,
        waMessageId: sendResult.messageId || null,
        direction: "outbound",
        messageType: "text",
        content: responseText,
        status: "sent",
        sentAt: now,
      });
    } catch (e) {
      console.warn("[Webhook] Failed to store outbound message", { err: (e as any)?.message });
    }

    await storage.incrementMessageCount(agent.userId);
    console.log("[Webhook] Replied", { from, agentId: agent.id, metaPhoneNumberId: tenant.metaPhoneNumberId });
  });

  onStatus(async (_tenant, status) => {
    // Optional: future status persistence
    console.log("[Webhook] Status update", { status: (status as any)?.status, id: (status as any)?.id });
  });
}

registerWebhookHandlersOnce();

// Helper to get user ID from request (supporting both session and user patterns)
function getUserId(req: Request): string | null {
  return (req as any).user?.claims?.sub || (req as any).session?.userId || null;
}

// ============================================================================
// Middleware
// ============================================================================

/**
 * Ensure user is authenticated
 */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  // Attach userId to request for convenience
  (req as any).userId = userId;
  next();
}

/**
 * Ensure user has verified email (checks database)
 */
async function requireVerifiedEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Check email verification status from database
    const [user] = await db.select({ emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user || !user.emailVerified) {
      return res.status(403).json({ 
        error: "Email verification required",
        code: "email_verification_required"
      });
    }
    
    next();
  } catch (error) {
    console.error("Email verification check error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Audit logging helper
 */
async function auditLog(
  action: string,
  details: Record<string, any>,
  req: Request,
  accountId?: string,
  status: "success" | "failure" = "success",
  errorMessage?: string
) {
  try {
    const userId = getUserId(req);
    await db.insert(whatsappCloudAuditLog).values({
      accountId: accountId || null,
      userId: userId || null,
      action,
      resourceType: details.resourceType,
      resourceId: details.resourceId,
      details,
      ipAddress: req.ip || req.socket.remoteAddress || null,
      userAgent: req.headers["user-agent"] || null,
      status,
      errorMessage,
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

// ============================================================================
// OAuth / Embedded Signup Routes
// ============================================================================

/**
 * GET /api/whatsapp-cloud/oauth/start
 * Generate Embedded Signup URL for the authenticated user
 */
router.get("/oauth/start", requireAuth, requireVerifiedEmail, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Generate signup URL with state
    const result = generateEmbeddedSignupUrl(userId);
    
    await auditLog("oauth_start", {
      resourceType: "oauth",
      state: result.state,
    }, req);
    
    res.json({
      success: true,
      signupUrl: result.url,
      state: result.state,
      expiresIn: 600, // 10 minutes
    });
  } catch (error: any) {
    console.error("OAuth start error:", error);
    await auditLog("oauth_start", { resourceType: "oauth" }, req, undefined, "failure", error.message);
    res.status(500).json({ error: "Failed to generate signup URL" });
  }
});

/**
 * GET /api/whatsapp-cloud/oauth/callback
 * Handle OAuth callback from Meta Embedded Signup
 */
router.get("/oauth/callback", async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;
  
  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, error_description);
    await auditLog("oauth_callback", {
      resourceType: "oauth",
      error,
      error_description,
    }, req, undefined, "failure", String(error_description));
    
    // Redirect to frontend with error
    return res.redirect(`/dashboard/whatsapp/accounts?error=${encodeURIComponent(String(error_description || error))}`);
  }
  
  if (!code || !state) {
    return res.redirect("/dashboard/whatsapp/accounts?error=missing_parameters");
  }
  
  try {
    // Handle the OAuth callback
    const result = await handleOAuthCallback(String(code), String(state));
    
    if (!result.success) {
      throw new Error(result.error || "OAuth callback failed");
    }
    
    // Store the WABA in the database
    // tenantId is the userId that was passed when generating the signup URL
    const { tenantId, wabaId, accessToken, businessName, metaBusinessId } = result;
    
    // Encrypt the access token
    const encryptedToken = encrypt(accessToken!);
    
    // Generate webhook verify token
    const webhookVerifyToken = crypto.randomBytes(32).toString("hex");
    
    // Check if account already exists
    const existing = await db.select()
      .from(whatsappCloudAccounts)
      .where(eq(whatsappCloudAccounts.wabaId, wabaId!))
      .limit(1);
    
    let accountId: string;
    
    if (existing.length > 0) {
      // Update existing account
      await db.update(whatsappCloudAccounts)
        .set({
          encryptedAccessToken: encryptedToken,
          businessName: businessName || null,
          metaBusinessId: metaBusinessId || null,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(whatsappCloudAccounts.wabaId, wabaId!));
      accountId = existing[0].id;
    } else {
      // Create new account
      await db.insert(whatsappCloudAccounts).values({
        userId: tenantId!,
        wabaId: wabaId!,
        encryptedAccessToken: encryptedToken,
        businessName: businessName || null,
        metaBusinessId: metaBusinessId || null,
        webhookVerifyToken,
        status: "active",
      });
      
      // Fetch the actual UUID
      const [newAccount] = await db.select()
        .from(whatsappCloudAccounts)
        .where(eq(whatsappCloudAccounts.wabaId, wabaId!))
        .limit(1);
      accountId = newAccount.id;
    }
    
    // Sync phone numbers
    await syncPhoneNumbers(accountId, accessToken!);
    
    await auditLog("oauth_complete", {
      resourceType: "account",
      resourceId: accountId,
      wabaId,
      businessName,
    }, req, accountId);
    
    // Redirect to success page
    res.redirect(`/dashboard/whatsapp/accounts?success=connected&accountId=${accountId}`);
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    await auditLog("oauth_callback", { resourceType: "oauth" }, req, undefined, "failure", error.message);
    res.redirect(`/dashboard/whatsapp/accounts?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Sync phone numbers for an account
 */
async function syncPhoneNumbers(accountId: string, accessToken: string) {
  // Get the account to retrieve WABA ID
  const [account] = await db.select()
    .from(whatsappCloudAccounts)
    .where(eq(whatsappCloudAccounts.id, accountId))
    .limit(1);
  
  if (!account) throw new Error("Account not found");
  
  // Fetch phone numbers from Meta
  const phoneNumbers = await fetchWabaPhoneNumbers(account.wabaId, accessToken);
  console.log("[Sync] Phone numbers from Meta:", JSON.stringify(phoneNumbers, null, 2));
  
  for (const phone of phoneNumbers) {
    // Check if phone number exists by Meta's phone number ID
    const existing = await db.select()
      .from(whatsappCloudPhoneNumbers)
      .where(eq(whatsappCloudPhoneNumbers.phoneNumberId, phone.id))
      .limit(1);
    
    // Also check by display phone number (for locally added numbers)
    const existingByDisplay = await db.select()
      .from(whatsappCloudPhoneNumbers)
      .where(and(
        eq(whatsappCloudPhoneNumbers.accountId, accountId),
        eq(whatsappCloudPhoneNumbers.displayPhoneNumber, phone.display_phone_number)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing by Meta ID
      console.log(`[Sync] Updating existing phone by Meta ID: ${phone.id}`);
      await db.update(whatsappCloudPhoneNumbers)
        .set({
          displayPhoneNumber: phone.display_phone_number,
          verifiedName: phone.verified_name,
          qualityRating: phone.quality_rating,
          codeVerificationStatus: phone.code_verification_status,
          platformType: phone.platform_type,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(whatsappCloudPhoneNumbers.phoneNumberId, phone.id));
    } else if (existingByDisplay.length > 0) {
      // Update locally added phone number with Meta's data
      console.log(`[Sync] Updating local phone by display number: ${phone.display_phone_number}`);
      await db.update(whatsappCloudPhoneNumbers)
        .set({
          phoneNumberId: phone.id, // Update with real Meta ID
          verifiedName: phone.verified_name,
          qualityRating: phone.quality_rating,
          codeVerificationStatus: phone.code_verification_status,
          platformType: phone.platform_type,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(whatsappCloudPhoneNumbers.id, existingByDisplay[0].id));
    } else {
      // Create new
      console.log(`[Sync] Creating new phone: ${phone.display_phone_number}`);
      await db.insert(whatsappCloudPhoneNumbers).values({
        accountId,
        phoneNumberId: phone.id,
        displayPhoneNumber: phone.display_phone_number,
        verifiedName: phone.verified_name,
        qualityRating: phone.quality_rating,
        codeVerificationStatus: phone.code_verification_status,
        platformType: phone.platform_type,
        status: "active",
      });
    }
  }
}

// ============================================================================
// Account Management Routes
// ============================================================================

/**
 * GET /api/whatsapp-cloud/accounts
 * List all WhatsApp accounts for the authenticated user
 */
router.get("/accounts", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    const accounts = await db.select({
      id: whatsappCloudAccounts.id,
      wabaId: whatsappCloudAccounts.wabaId,
      businessName: whatsappCloudAccounts.businessName,
      businessVerificationStatus: whatsappCloudAccounts.businessVerificationStatus,
      accountReviewStatus: whatsappCloudAccounts.accountReviewStatus,
      messagingTier: whatsappCloudAccounts.messagingTier,
      dailyMessageLimit: whatsappCloudAccounts.dailyMessageLimit,
      status: whatsappCloudAccounts.status,
      createdAt: whatsappCloudAccounts.createdAt,
    })
    .from(whatsappCloudAccounts)
    .where(eq(whatsappCloudAccounts.userId, userId));
    
    res.json({ success: true, accounts });
  } catch (error: any) {
    console.error("List accounts error:", error);
    res.status(500).json({ error: "Failed to list accounts" });
  }
});

/**
 * GET /api/whatsapp-cloud/accounts/:id
 * Get details of a specific WhatsApp account
 */
router.get("/accounts/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const accountId = req.params.id;
    
    console.log(`[WhatsApp Cloud] Get account - userId: ${userId}, accountId: ${accountId}`);
    
    // First try to find by ID only (for debugging)
    const [accountById] = await db.select()
      .from(whatsappCloudAccounts)
      .where(eq(whatsappCloudAccounts.id, accountId))
      .limit(1);
    
    if (accountById) {
      console.log(`[WhatsApp Cloud] Account found - owner userId: ${accountById.userId}, request userId: ${userId}`);
    }
    
    const [account] = await db.select()
      .from(whatsappCloudAccounts)
      .where(and(
        eq(whatsappCloudAccounts.id, accountId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!account) {
      console.log(`[WhatsApp Cloud] Account not found or access denied`);
      return res.status(404).json({ error: "Account not found" });
    }
    
    // Don't return encrypted token
    const { encryptedAccessToken, ...safeAccount } = account;
    
    // Get phone numbers
    const phoneNumbers = await db.select()
      .from(whatsappCloudPhoneNumbers)
      .where(eq(whatsappCloudPhoneNumbers.accountId, accountId));
    
    res.json({
      success: true,
      account: safeAccount,
      phoneNumbers,
    });
  } catch (error: any) {
    console.error("Get account error:", error);
    res.status(500).json({ error: "Failed to get account" });
  }
});

/**
 * DELETE /api/whatsapp-cloud/accounts/:id
 * Disconnect a WhatsApp account
 */
router.delete("/accounts/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const accountId = req.params.id;
    
    // Verify ownership
    const [account] = await db.select()
      .from(whatsappCloudAccounts)
      .where(and(
        eq(whatsappCloudAccounts.id, accountId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    // Soft delete - set status to disconnected
    await db.update(whatsappCloudAccounts)
      .set({ status: "disconnected", updatedAt: new Date() })
      .where(eq(whatsappCloudAccounts.id, accountId));
    
    await auditLog("account_disconnect", {
      resourceType: "account",
      resourceId: accountId,
      wabaId: account.wabaId,
    }, req, accountId);
    
    res.json({ success: true, message: "Account disconnected" });
  } catch (error: any) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Failed to disconnect account" });
  }
});

/**
 * POST /api/whatsapp-cloud/accounts/:id/sync
 * Sync phone numbers and account details from Meta
 */
router.post("/accounts/:id/sync", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const accountId = req.params.id;
    
    // Verify ownership and get token
    const [account] = await db.select()
      .from(whatsappCloudAccounts)
      .where(and(
        eq(whatsappCloudAccounts.id, accountId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    // Decrypt access token
    const accessToken = decrypt(account.encryptedAccessToken);
    
    // Sync phone numbers
    await syncPhoneNumbers(accountId, accessToken);
    
    // Update WABA details
    const wabaDetails = await fetchWabaDetails(account.wabaId, accessToken);
    console.log("[Sync] WABA details from Meta:", JSON.stringify(wabaDetails, null, 2));
    
    if (wabaDetails) {
      await db.update(whatsappCloudAccounts)
        .set({
          businessName: wabaDetails.name,
          businessVerificationStatus: wabaDetails.business_verification_status || null,
          accountReviewStatus: wabaDetails.account_review_status || null,
          currency: wabaDetails.currency,
          timezone: wabaDetails.timezone_id,
          updatedAt: new Date(),
        })
        .where(eq(whatsappCloudAccounts.id, accountId));
    }
    
    await auditLog("account_sync", {
      resourceType: "account",
      resourceId: accountId,
    }, req, accountId);
    
    res.json({ success: true, message: "Account synced successfully" });
  } catch (error: any) {
    console.error("Sync account error:", error);
    res.status(500).json({ error: "Failed to sync account" });
  }
});

/**
 * POST /api/whatsapp-cloud/accounts/:id/subscribe-webhooks
 * Subscribe the WABA to receive webhooks for messages
 */
router.post("/accounts/:id/subscribe-webhooks", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const accountId = req.params.id;
    
    // Verify ownership and get token
    const [account] = await db.select()
      .from(whatsappCloudAccounts)
      .where(and(
        eq(whatsappCloudAccounts.id, accountId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    // Decrypt access token
    const accessToken = decrypt(account.encryptedAccessToken);
    
    // Subscribe to webhooks
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${account.wabaId}/subscribed_apps`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error("[Subscribe] Failed:", result);
      return res.status(400).json({ 
        success: false, 
        error: result.error?.message || "Failed to subscribe to webhooks",
        details: result
      });
    }
    
    console.log("[Subscribe] Success for WABA:", account.wabaId, result);
    
    await auditLog("webhook_subscribe", {
      resourceType: "account",
      resourceId: accountId,
      wabaId: account.wabaId,
    }, req, accountId);
    
    res.json({ success: true, message: "Subscribed to webhooks successfully", result });
  } catch (error: any) {
    console.error("Subscribe webhooks error:", error);
    res.status(500).json({ error: "Failed to subscribe to webhooks", message: error.message });
  }
});

/**
 * GET /api/whatsapp-cloud/accounts/:id/phone-numbers
 * Get phone numbers for a specific account
 */
router.get("/accounts/:id/phone-numbers", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const accountId = req.params.id;
    
    // Verify ownership
    const [account] = await db.select()
      .from(whatsappCloudAccounts)
      .where(and(
        eq(whatsappCloudAccounts.id, accountId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    // Get phone numbers
    const phoneNumbers = await db.select()
      .from(whatsappCloudPhoneNumbers)
      .where(eq(whatsappCloudPhoneNumbers.accountId, accountId));
    
    // Get agent links for these phone numbers
    const phoneIds = phoneNumbers.map(p => p.id);
    let agentLinks: any[] = [];
    if (phoneIds.length > 0) {
      agentLinks = await db.select()
        .from(whatsappCloudAgentLinks)
        .where(inArray(whatsappCloudAgentLinks.phoneNumberId, phoneIds));
    }
    
    // Merge agent info into phone numbers
    const phoneNumbersWithAgents = phoneNumbers.map(phone => {
      const link = agentLinks.find(l => l.phoneNumberId === phone.id);
      return {
        ...phone,
        agentId: link?.agentId || null,
      };
    });
    
    res.json({ success: true, phoneNumbers: phoneNumbersWithAgents });
  } catch (error: any) {
    console.error("Get phone numbers error:", error);
    res.status(500).json({ error: "Failed to get phone numbers" });
  }
});

// ============================================================================
// Phone Number Management Routes
// ============================================================================

/**
 * GET /api/whatsapp-cloud/phone-numbers
 * List all phone numbers for the authenticated user
 */
router.get("/phone-numbers", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Get phone numbers for user's accounts with all fields
    const phoneNumbers = await db.select({
      id: whatsappCloudPhoneNumbers.id,
      accountId: whatsappCloudPhoneNumbers.accountId,
      phoneNumberId: whatsappCloudPhoneNumbers.phoneNumberId,
      displayPhoneNumber: whatsappCloudPhoneNumbers.displayPhoneNumber,
      verifiedName: whatsappCloudPhoneNumbers.verifiedName,
      qualityRating: whatsappCloudPhoneNumbers.qualityRating,
      messagingLimitTier: whatsappCloudPhoneNumbers.messagingLimitTier,
      codeVerificationStatus: whatsappCloudPhoneNumbers.codeVerificationStatus,
      platformType: whatsappCloudPhoneNumbers.platformType,
      isWebhookEnabled: whatsappCloudPhoneNumbers.isWebhookEnabled,
      status: whatsappCloudPhoneNumbers.status,
      createdAt: whatsappCloudPhoneNumbers.createdAt,
      businessName: whatsappCloudAccounts.businessName,
    })
    .from(whatsappCloudPhoneNumbers)
    .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
    .where(eq(whatsappCloudAccounts.userId, userId));
    
    // Get agent links for these phone numbers
    const phoneIds = phoneNumbers.map(p => p.id);
    let agentLinks: any[] = [];
    if (phoneIds.length > 0) {
      agentLinks = await db.select()
        .from(whatsappCloudAgentLinks)
        .where(inArray(whatsappCloudAgentLinks.phoneNumberId, phoneIds));
    }
    
    // Merge agent info into phone numbers
    const phoneNumbersWithAgents = phoneNumbers.map(phone => {
      const link = agentLinks.find(l => l.phoneNumberId === phone.id);
      return {
        ...phone,
        agentId: link?.agentId || null,
      };
    });
    
    res.json({ success: true, phoneNumbers: phoneNumbersWithAgents });
  } catch (error: any) {
    console.error("List phone numbers error:", error);
    res.status(500).json({ error: "Failed to list phone numbers" });
  }
});

/**
 * POST /api/whatsapp-cloud/accounts/:id/phone-numbers
 * Register a phone number (note: actual phone registration should be done via Meta)
 */
router.post("/accounts/:id/phone-numbers", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const accountId = req.params.id;
    const { phoneNumber, displayPhoneNumber, profileName } = req.body;
    
    // Verify account ownership
    const [account] = await db.select()
      .from(whatsappCloudAccounts)
      .where(and(
        eq(whatsappCloudAccounts.id, accountId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    // For WhatsApp Cloud API, phone numbers should be registered via Meta Business Manager
    // This endpoint stores the reference locally
    await db.insert(whatsappCloudPhoneNumbers).values({
      accountId,
      phoneNumberId: `local_${Date.now()}`, // Placeholder - will be updated when synced with Meta
      displayPhoneNumber: displayPhoneNumber || phoneNumber,
      verifiedName: profileName || null,
      status: "pending",
    });
    
    res.json({ 
      success: true, 
      message: "Phone number registered. Please complete verification in Meta Business Manager.",
      note: "To fully activate, add and verify this number in your Meta Business Manager WhatsApp settings."
    });
  } catch (error: any) {
    console.error("Create phone number error:", error);
    res.status(500).json({ error: "Failed to create phone number" });
  }
});

/**
 * POST /api/whatsapp-cloud/phone-numbers/:id/link-agent
 * Link a phone number to an AI agent
 */
router.post("/phone-numbers/:id/link-agent", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const phoneId = req.params.id;
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: "Agent ID is required" });
    }
    
    // Verify phone number belongs to user's account
    const [phoneNumber] = await db.select({
      id: whatsappCloudPhoneNumbers.id,
      accountId: whatsappCloudPhoneNumbers.accountId,
    })
    .from(whatsappCloudPhoneNumbers)
    .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
    .where(and(
      eq(whatsappCloudPhoneNumbers.id, phoneId),
      eq(whatsappCloudAccounts.userId, userId)
    ))
    .limit(1);
    
    if (!phoneNumber) {
      return res.status(404).json({ error: "Phone number not found" });
    }
    
    // Check if agent exists and belongs to user
    const [agent] = await db.select()
      .from(agents)
      .where(and(
        eq(agents.id, agentId),
        eq(agents.userId, userId)
      ))
      .limit(1);
    
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    
    // Check if link already exists
    const [existingLink] = await db.select()
      .from(whatsappCloudAgentLinks)
      .where(and(
        eq(whatsappCloudAgentLinks.phoneNumberId, phoneId),
        eq(whatsappCloudAgentLinks.agentId, agentId)
      ))
      .limit(1);
    
    if (existingLink) {
      return res.status(400).json({ error: "This agent is already linked to this phone number" });
    }
    
    // Create the link
    await db.insert(whatsappCloudAgentLinks).values({
      phoneNumberId: phoneId,
      agentId,
      isPrimary: true,
    });
    
    res.json({ success: true, message: "Agent linked successfully" });
  } catch (error: any) {
    console.error("Link agent error:", error);
    res.status(500).json({ error: "Failed to link agent" });
  }
});

/**
 * DELETE /api/whatsapp-cloud/phone-numbers/:id
 * Delete a phone number
 */
router.delete("/phone-numbers/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const phoneId = req.params.id;
    
    // Verify phone number belongs to user's account
    const [phoneNumber] = await db.select({
      id: whatsappCloudPhoneNumbers.id,
    })
    .from(whatsappCloudPhoneNumbers)
    .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
    .where(and(
      eq(whatsappCloudPhoneNumbers.id, phoneId),
      eq(whatsappCloudAccounts.userId, userId)
    ))
    .limit(1);
    
    if (!phoneNumber) {
      return res.status(404).json({ error: "Phone number not found" });
    }
    
    // Delete agent links first
    await db.delete(whatsappCloudAgentLinks)
      .where(eq(whatsappCloudAgentLinks.phoneNumberId, phoneId));
    
    // Delete phone number
    await db.delete(whatsappCloudPhoneNumbers)
      .where(eq(whatsappCloudPhoneNumbers.id, phoneId));
    
    res.json({ success: true, message: "Phone number deleted" });
  } catch (error: any) {
    console.error("Delete phone number error:", error);
    res.status(500).json({ error: "Failed to delete phone number" });
  }
});

// ============================================================================
// Agent Link Management Routes
// ============================================================================

/**
 * GET /api/whatsapp-cloud/agents/:agentId/link
 * Get WhatsApp Cloud link status for a specific agent
 */
router.get("/agents/:agentId/link", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { agentId } = req.params;
    
    // Verify agent belongs to user
    const [agent] = await db.select()
      .from(agents)
      .where(and(
        eq(agents.id, agentId),
        eq(agents.userId, userId)
      ))
      .limit(1);
    
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    
    // Find agent link with phone number and account details
    const [link] = await db.select({
      linkId: whatsappCloudAgentLinks.id,
      phoneNumberId: whatsappCloudAgentLinks.phoneNumberId,
      displayPhoneNumber: whatsappCloudPhoneNumbers.displayPhoneNumber,
      verifiedName: whatsappCloudPhoneNumbers.verifiedName,
      phoneStatus: whatsappCloudPhoneNumbers.status,
      accountId: whatsappCloudAccounts.id,
      businessName: whatsappCloudAccounts.businessName,
      wabaId: whatsappCloudAccounts.wabaId,
    })
    .from(whatsappCloudAgentLinks)
    .innerJoin(whatsappCloudPhoneNumbers, eq(whatsappCloudAgentLinks.phoneNumberId, whatsappCloudPhoneNumbers.id))
    .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
    .where(eq(whatsappCloudAgentLinks.agentId, agentId))
    .limit(1);
    
    if (!link) {
      return res.status(404).json({ error: "No WhatsApp connection found for this agent" });
    }
    
    res.json({
      phoneNumber: {
        displayPhoneNumber: link.displayPhoneNumber,
        verifiedName: link.verifiedName,
        status: link.phoneStatus,
      },
      account: {
        businessName: link.businessName,
        wabaId: link.wabaId,
      },
    });
  } catch (error: any) {
    console.error("Get agent link error:", error);
    res.status(500).json({ error: "Failed to get agent link" });
  }
});

/**
 * GET /api/whatsapp-cloud/agent-links
 * List agent links for the authenticated user's phone numbers
 */
router.get("/agent-links", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    const agentLinks = await db.select({
      id: whatsappCloudAgentLinks.id,
      phoneNumberId: whatsappCloudAgentLinks.phoneNumberId,
      agentId: whatsappCloudAgentLinks.agentId,
      isPrimary: whatsappCloudAgentLinks.isPrimary,
      routingStrategy: whatsappCloudAgentLinks.routingStrategy,
      priority: whatsappCloudAgentLinks.priority,
      isAvailable: whatsappCloudAgentLinks.isAvailable,
      displayPhoneNumber: whatsappCloudPhoneNumbers.displayPhoneNumber,
      agentName: agents.name,
    })
    .from(whatsappCloudAgentLinks)
    .innerJoin(whatsappCloudPhoneNumbers, eq(whatsappCloudAgentLinks.phoneNumberId, whatsappCloudPhoneNumbers.id))
    .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
    .innerJoin(agents, eq(whatsappCloudAgentLinks.agentId, agents.id))
    .where(eq(whatsappCloudAccounts.userId, userId));
    
    res.json({ success: true, agentLinks });
  } catch (error: any) {
    console.error("List agent links error:", error);
    res.status(500).json({ error: "Failed to list agent links" });
  }
});

/**
 * POST /api/whatsapp-cloud/agent-links
 * Create a new agent link
 */
router.post("/agent-links", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { phoneNumberId, agentId, isPrimary, routingStrategy, priority, skills } = req.body;
    
    // Validate phone number ownership
    const [phoneNumber] = await db.select()
      .from(whatsappCloudPhoneNumbers)
      .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
      .where(and(
        eq(whatsappCloudPhoneNumbers.id, phoneNumberId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!phoneNumber) {
      return res.status(404).json({ error: "Phone number not found" });
    }
    
    // Validate agent ownership
    const [agent] = await db.select()
      .from(agents)
      .where(and(
        eq(agents.id, agentId),
        eq(agents.userId, userId)
      ))
      .limit(1);
    
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    
    // If setting as primary, unset other primaries
    if (isPrimary) {
      await db.update(whatsappCloudAgentLinks)
        .set({ isPrimary: false })
        .where(eq(whatsappCloudAgentLinks.phoneNumberId, phoneNumberId));
    }
    
    // Create agent link
    await db.insert(whatsappCloudAgentLinks).values({
      phoneNumberId,
      agentId,
      isPrimary: isPrimary || false,
      routingStrategy: routingStrategy || "primary",
      priority: priority || 1,
      skills: skills || [],
    });
    
    await auditLog("agent_link_create", {
      resourceType: "agent_link",
      phoneNumberId,
      agentId,
    }, req);
    
    res.json({ success: true, message: "Agent linked successfully" });
  } catch (error: any) {
    console.error("Create agent link error:", error);
    res.status(500).json({ error: "Failed to create agent link" });
  }
});

/**
 * PUT /api/whatsapp-cloud/agent-links/:id
 * Update an agent link
 */
router.put("/agent-links/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const linkId = req.params.id;
    const { isPrimary, routingStrategy, priority, skills, isAvailable } = req.body;
    
    // Verify ownership
    const [link] = await db.select()
      .from(whatsappCloudAgentLinks)
      .innerJoin(whatsappCloudPhoneNumbers, eq(whatsappCloudAgentLinks.phoneNumberId, whatsappCloudPhoneNumbers.id))
      .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
      .where(and(
        eq(whatsappCloudAgentLinks.id, linkId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!link) {
      return res.status(404).json({ error: "Agent link not found" });
    }
    
    // If setting as primary, unset other primaries
    if (isPrimary) {
      await db.update(whatsappCloudAgentLinks)
        .set({ isPrimary: false })
        .where(eq(whatsappCloudAgentLinks.phoneNumberId, link.whatsapp_cloud_agent_links.phoneNumberId));
    }
    
    // Update link
    await db.update(whatsappCloudAgentLinks)
      .set({
        isPrimary: isPrimary ?? link.whatsapp_cloud_agent_links.isPrimary,
        routingStrategy: routingStrategy ?? link.whatsapp_cloud_agent_links.routingStrategy,
        priority: priority ?? link.whatsapp_cloud_agent_links.priority,
        skills: skills ?? link.whatsapp_cloud_agent_links.skills,
        isAvailable: isAvailable ?? link.whatsapp_cloud_agent_links.isAvailable,
        updatedAt: new Date(),
      })
      .where(eq(whatsappCloudAgentLinks.id, linkId));
    
    res.json({ success: true, message: "Agent link updated" });
  } catch (error: any) {
    console.error("Update agent link error:", error);
    res.status(500).json({ error: "Failed to update agent link" });
  }
});

/**
 * DELETE /api/whatsapp-cloud/agent-links/:id
 * Remove an agent link
 */
router.delete("/agent-links/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const linkId = req.params.id;
    
    // Verify ownership
    const [link] = await db.select()
      .from(whatsappCloudAgentLinks)
      .innerJoin(whatsappCloudPhoneNumbers, eq(whatsappCloudAgentLinks.phoneNumberId, whatsappCloudPhoneNumbers.id))
      .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
      .where(and(
        eq(whatsappCloudAgentLinks.id, linkId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!link) {
      return res.status(404).json({ error: "Agent link not found" });
    }
    
    await db.delete(whatsappCloudAgentLinks)
      .where(eq(whatsappCloudAgentLinks.id, linkId));
    
    await auditLog("agent_link_delete", {
      resourceType: "agent_link",
      resourceId: linkId,
    }, req);
    
    res.json({ success: true, message: "Agent link removed" });
  } catch (error: any) {
    console.error("Delete agent link error:", error);
    res.status(500).json({ error: "Failed to remove agent link" });
  }
});

// ============================================================================
// Webhook Routes (Meta Verification & Message Handling)
// ============================================================================

/**
 * GET /api/whatsapp-cloud/webhook
 * Meta webhook verification endpoint
 */
router.get("/webhook", async (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  
  if (mode !== "subscribe") {
    return res.status(400).send("Invalid mode");
  }
  
  // Find account by verify token
  const [account] = await db.select()
    .from(whatsappCloudAccounts)
    .where(eq(whatsappCloudAccounts.webhookVerifyToken, String(token)))
    .limit(1);
  
  if (!account) {
    console.error("Invalid webhook verify token");
    return res.status(403).send("Invalid verify token");
  }
  
  console.log("Webhook verified for account:", account.id);
  res.status(200).send(challenge);
});

/**
 * POST /api/whatsapp-cloud/webhook
 * Meta webhook for incoming messages and status updates
 */
router.post("/webhook", async (req: Request, res: Response) => {
  // Get raw body for signature verification
  const signature = req.headers["x-hub-signature-256"] as string;
  const appSecret = process.env.META_APP_SECRET || "";

  // Use raw bytes captured by express.json verify hook.
  const rawBody = (req as any).rawBody as Buffer | undefined;
  
  // Verify Meta signature
  if (!rawBody) {
    console.error("Raw body not available for signature verification");
    return res.status(500).send("Webhook signature verification misconfigured");
  }

  if (!verifyMetaSignature(rawBody, signature, appSecret)) {
    console.error("Invalid webhook signature");
    await auditLog("webhook_invalid_signature", {
      resourceType: "webhook",
    }, req, undefined, "failure", "Invalid signature");
    return res.status(401).send("Invalid signature");
  }
  
  // Process webhook asynchronously
  processWebhookPayload(req.body).catch((error) => {
    console.error("Webhook processing error:", error);
  });
  
  // Always respond quickly to Meta
  res.status(200).send("OK");
});

// ============================================================================
// Messaging Routes
// ============================================================================

/**
 * POST /api/whatsapp-cloud/send-message
 * Send a WhatsApp message
 */
router.post("/send-message", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { phoneNumberId, to, type, content, templateName, templateLanguage, templateComponents } = req.body;
    
    // Get phone number and verify ownership
    const [phoneNumber] = await db.select()
      .from(whatsappCloudPhoneNumbers)
      .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
      .where(and(
        eq(whatsappCloudPhoneNumbers.id, phoneNumberId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!phoneNumber) {
      return res.status(404).json({ error: "Phone number not found" });
    }
    
    // Get decrypted access token
    const accessToken = decrypt(phoneNumber.whatsapp_cloud_accounts.encryptedAccessToken);
    const metaPhoneNumberId = phoneNumber.whatsapp_cloud_phone_numbers.phoneNumberId;
    const accountId = phoneNumber.whatsapp_cloud_accounts.id;
    const messagingTier = phoneNumber.whatsapp_cloud_accounts.messagingTier || 'TIER_1K';
    
    // Common options for message sending
    const messageOptions = {
      tenantId: userId,
      phoneNumberId: metaPhoneNumberId,
      accessToken,
      messagingTier: messagingTier as any,
    };
    
    let result;
    
    if (type === "template") {
      result = await sendTemplateMessage(
        to,
        templateName,
        templateLanguage || "en",
        templateComponents || [],
        messageOptions
      );
    } else {
      result = await sendTextMessage(
        to,
        content,
        messageOptions
      );
    }
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    await auditLog("message_sent", {
      resourceType: "message",
      resourceId: result.messageId,
      phoneNumberId,
      to,
      type,
    }, req, accountId);
    
    res.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ============================================================================
// Conversation Routes
// ============================================================================

/**
 * GET /api/whatsapp-cloud/conversations
 * List conversations for the authenticated user
 */
router.get("/conversations", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { status, limit = 50 } = req.query;
    
    let query = db.select({
      id: whatsappCloudConversations.id,
      phoneNumberId: whatsappCloudConversations.phoneNumberId,
      agentId: whatsappCloudConversations.agentId,
      customerWaId: whatsappCloudConversations.customerWaId,
      customerName: whatsappCloudConversations.customerName,
      status: whatsappCloudConversations.status,
      messageCount: whatsappCloudConversations.messageCount,
      lastCustomerMessageAt: whatsappCloudConversations.lastCustomerMessageAt,
      windowExpiresAt: whatsappCloudConversations.windowExpiresAt,
      createdAt: whatsappCloudConversations.createdAt,
      displayPhoneNumber: whatsappCloudPhoneNumbers.displayPhoneNumber,
      agentName: agents.name,
    })
    .from(whatsappCloudConversations)
    .innerJoin(whatsappCloudPhoneNumbers, eq(whatsappCloudConversations.phoneNumberId, whatsappCloudPhoneNumbers.id))
    .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
    .leftJoin(agents, eq(whatsappCloudConversations.agentId, agents.id))
    .where(eq(whatsappCloudAccounts.userId, userId))
    .orderBy(desc(whatsappCloudConversations.updatedAt))
    .limit(Number(limit));
    
    const conversations = await query;
    
    res.json({ success: true, conversations });
  } catch (error: any) {
    console.error("List conversations error:", error);
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

/**
 * GET /api/whatsapp-cloud/conversations/:id/messages
 * Get messages for a conversation
 */
router.get("/conversations/:id/messages", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const conversationId = req.params.id;
    const { limit = 100 } = req.query;
    
    // Verify ownership
    const [conversation] = await db.select()
      .from(whatsappCloudConversations)
      .innerJoin(whatsappCloudPhoneNumbers, eq(whatsappCloudConversations.phoneNumberId, whatsappCloudPhoneNumbers.id))
      .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
      .where(and(
        eq(whatsappCloudConversations.id, conversationId),
        eq(whatsappCloudAccounts.userId, userId)
      ))
      .limit(1);
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    const messages = await db.select()
      .from(whatsappCloudMessages)
      .where(eq(whatsappCloudMessages.conversationId, conversationId))
      .orderBy(desc(whatsappCloudMessages.createdAt))
      .limit(Number(limit));
    
    res.json({ success: true, messages: messages.reverse() });
  } catch (error: any) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// ============================================================================
// Template Management Routes
// ============================================================================

/**
 * GET /api/whatsapp-cloud/templates
 * List message templates for the authenticated user
 */
router.get("/templates", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    const templates = await db.select()
      .from(whatsappCloudTemplates)
      .innerJoin(whatsappCloudAccounts, eq(whatsappCloudTemplates.accountId, whatsappCloudAccounts.id))
      .where(eq(whatsappCloudAccounts.userId, userId));
    
    res.json({
      success: true,
      templates: templates.map(t => t.whatsapp_cloud_templates),
    });
  } catch (error: any) {
    console.error("List templates error:", error);
    res.status(500).json({ error: "Failed to list templates" });
  }
});

/**
 * POST /api/whatsapp-cloud/templates/sync
 * Sync templates from Meta for all user accounts
 */
router.post("/templates/sync", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { accountId } = req.body;
    
    // Get account(s) to sync
    let accountsQuery = db.select()
      .from(whatsappCloudAccounts)
      .where(eq(whatsappCloudAccounts.userId, userId));
    
    if (accountId) {
      accountsQuery = db.select()
        .from(whatsappCloudAccounts)
        .where(and(
          eq(whatsappCloudAccounts.id, accountId),
          eq(whatsappCloudAccounts.userId, userId)
        ));
    }
    
    const accounts = await accountsQuery;
    
    for (const account of accounts) {
      const accessToken = decrypt(account.encryptedAccessToken);
      
      // Fetch templates from Meta
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${account.wabaId}/message_templates`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      if (!response.ok) {
        console.error("Failed to fetch templates for account:", account.id);
        continue;
      }
      
      const data = await response.json();
      
      for (const template of data.data || []) {
        // Check if template exists
        const existing = await db.select()
          .from(whatsappCloudTemplates)
          .where(and(
            eq(whatsappCloudTemplates.accountId, account.id),
            eq(whatsappCloudTemplates.name, template.name),
            eq(whatsappCloudTemplates.language, template.language)
          ))
          .limit(1);
        
        const templateData = {
          templateId: template.id,
          name: template.name,
          language: template.language,
          category: template.category,
          status: template.status,
          components: template.components,
          qualityScore: template.quality_score?.score,
          rejectedReason: template.rejected_reason,
        };
        
        if (existing.length > 0) {
          await db.update(whatsappCloudTemplates)
            .set({ ...templateData, updatedAt: new Date() })
            .where(eq(whatsappCloudTemplates.id, existing[0].id));
        } else {
          await db.insert(whatsappCloudTemplates).values({
            accountId: account.id,
            ...templateData,
          });
        }
      }
    }
    
    res.json({ success: true, message: "Templates synced" });
  } catch (error: any) {
    console.error("Sync templates error:", error);
    res.status(500).json({ error: "Failed to sync templates" });
  }
});

// ============================================================================
// Analytics Routes
// ============================================================================

/**
 * GET /api/whatsapp-cloud/analytics
 * Get WhatsApp analytics for the authenticated user
 */
router.get("/analytics", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Get total accounts
    const accounts = await db.select()
      .from(whatsappCloudAccounts)
      .where(eq(whatsappCloudAccounts.userId, userId));
    
    // Get total phone numbers
    const phoneNumbers = await db.select()
      .from(whatsappCloudPhoneNumbers)
      .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
      .where(eq(whatsappCloudAccounts.userId, userId));
    
    // Get conversation stats
    const conversations = await db.select()
      .from(whatsappCloudConversations)
      .innerJoin(whatsappCloudPhoneNumbers, eq(whatsappCloudConversations.phoneNumberId, whatsappCloudPhoneNumbers.id))
      .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
      .where(eq(whatsappCloudAccounts.userId, userId));
    
    const activeConversations = conversations.filter(
      c => c.whatsapp_cloud_conversations.status === "active"
    ).length;
    
    const totalMessages = conversations.reduce(
      (sum, c) => sum + (c.whatsapp_cloud_conversations.messageCount || 0),
      0
    );
    
    res.json({
      success: true,
      analytics: {
        totalAccounts: accounts.length,
        totalPhoneNumbers: phoneNumbers.length,
        totalConversations: conversations.length,
        activeConversations,
        totalMessages,
      },
    });
  } catch (error: any) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

export default router;
