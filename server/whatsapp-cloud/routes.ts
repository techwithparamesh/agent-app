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
import { eq, and, desc } from "drizzle-orm";
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
import { verifyMetaSignature, processWebhookPayload } from "./webhookHandler";
import { routeToAgent } from "./agentRouter";
import { encrypt, decrypt } from "../utils/encryption";
import crypto from "crypto";

const router = Router();

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
  
  for (const phone of phoneNumbers) {
    // Check if phone number exists
    const existing = await db.select()
      .from(whatsappCloudPhoneNumbers)
      .where(eq(whatsappCloudPhoneNumbers.phoneNumberId, phone.id))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing
      await db.update(whatsappCloudPhoneNumbers)
        .set({
          displayPhoneNumber: phone.display_phone_number,
          verifiedName: phone.verified_name,
          qualityRating: phone.quality_rating,
          codeVerificationStatus: phone.code_verification_status,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(whatsappCloudPhoneNumbers.phoneNumberId, phone.id));
    } else {
      // Create new
      await db.insert(whatsappCloudPhoneNumbers).values({
        accountId,
        phoneNumberId: phone.id,
        displayPhoneNumber: phone.display_phone_number,
        verifiedName: phone.verified_name,
        qualityRating: phone.quality_rating,
        codeVerificationStatus: phone.code_verification_status,
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
    if (wabaDetails) {
      await db.update(whatsappCloudAccounts)
        .set({
          businessName: wabaDetails.name,
          businessVerificationStatus: wabaDetails.account_review_status,
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
    
    res.json({ success: true, phoneNumbers });
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
    
    // Get phone numbers for user's accounts
    const phoneNumbers = await db.select({
      id: whatsappCloudPhoneNumbers.id,
      accountId: whatsappCloudPhoneNumbers.accountId,
      phoneNumberId: whatsappCloudPhoneNumbers.phoneNumberId,
      displayPhoneNumber: whatsappCloudPhoneNumbers.displayPhoneNumber,
      verifiedName: whatsappCloudPhoneNumbers.verifiedName,
      qualityRating: whatsappCloudPhoneNumbers.qualityRating,
      status: whatsappCloudPhoneNumbers.status,
      businessName: whatsappCloudAccounts.businessName,
    })
    .from(whatsappCloudPhoneNumbers)
    .innerJoin(whatsappCloudAccounts, eq(whatsappCloudPhoneNumbers.accountId, whatsappCloudAccounts.id))
    .where(eq(whatsappCloudAccounts.userId, userId));
    
    res.json({ success: true, phoneNumbers });
  } catch (error: any) {
    console.error("List phone numbers error:", error);
    res.status(500).json({ error: "Failed to list phone numbers" });
  }
});

// ============================================================================
// Agent Link Management Routes
// ============================================================================

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
  
  // Get raw body - may be string or object depending on body parser
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  
  // Verify Meta signature
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
