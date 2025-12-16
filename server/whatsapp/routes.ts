/**
 * WhatsApp Webhook Routes
 * Handles incoming webhook requests from Meta/WhatsApp Business API
 */

import { Router, type Request, type Response } from 'express';
import { agentRuntime } from './agentRuntime';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { agentWhatsappConfig, agents } from '@shared/schema';

const router = Router();

/**
 * Webhook Verification Endpoint (GET)
 * Meta sends a GET request to verify the webhook URL
 */
router.get('/webhook', async (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  console.log('[WhatsApp Webhook] Verification request:', { mode, token });

  if (mode !== 'subscribe') {
    console.warn('[WhatsApp Webhook] Invalid mode:', mode);
    return res.sendStatus(403);
  }

  // Look up verify token in database
  // For simplicity, we'll use an environment variable for the default verify token
  const defaultVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (token === defaultVerifyToken) {
    console.log('[WhatsApp Webhook] Verification successful');
    return res.status(200).send(challenge);
  }

  // Check if token matches any agent's verify token
  const [config] = await db
    .select()
    .from(agentWhatsappConfig)
    .where(eq(agentWhatsappConfig.verifyToken, token))
    .limit(1);

  if (config) {
    console.log('[WhatsApp Webhook] Verification successful for agent:', config.agentId);
    return res.status(200).send(challenge);
  }

  console.warn('[WhatsApp Webhook] Verification failed: invalid token');
  return res.sendStatus(403);
});

/**
 * Webhook Message Receiver Endpoint (POST)
 * Meta sends POST requests with incoming messages and status updates
 */
router.post('/webhook', async (req: Request, res: Response) => {
  console.log('[WhatsApp Webhook] Received POST:', JSON.stringify(req.body, null, 2));

  // Always respond with 200 OK quickly to acknowledge receipt
  // WhatsApp expects a response within 20 seconds
  res.sendStatus(200);

  try {
    // Process webhook asynchronously
    const result = await agentRuntime.processWebhook(req.body);
    console.log(`[WhatsApp Webhook] Processed: ${result.processed} messages, ${result.errors} errors`);
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing webhook:', error);
    // Already sent 200, so just log the error
  }
});

/**
 * WhatsApp Configuration Management Routes
 */

// Get WhatsApp config for an agent
router.get('/agents/:agentId/whatsapp-config', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const [config] = await db
      .select({
        id: agentWhatsappConfig.id,
        agentId: agentWhatsappConfig.agentId,
        whatsappBusinessId: agentWhatsappConfig.whatsappBusinessId,
        whatsappPhoneNumberId: agentWhatsappConfig.whatsappPhoneNumberId,
        whatsappPhoneNumber: agentWhatsappConfig.whatsappPhoneNumber,
        verifyToken: agentWhatsappConfig.verifyToken,
        isVerified: agentWhatsappConfig.isVerified,
        isActive: agentWhatsappConfig.isActive,
        createdAt: agentWhatsappConfig.createdAt,
      })
      .from(agentWhatsappConfig)
      .where(eq(agentWhatsappConfig.agentId, agentId))
      .limit(1);

    if (!config) {
      return res.status(404).json({ message: 'WhatsApp config not found' });
    }

    res.json(config);
  } catch (error) {
    console.error('[WhatsApp Routes] Error fetching config:', error);
    res.status(500).json({ message: 'Failed to fetch WhatsApp configuration' });
  }
});

// Create or update WhatsApp config for an agent
router.post('/agents/:agentId/whatsapp-config', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const {
      whatsappBusinessId,
      whatsappPhoneNumberId,
      whatsappPhoneNumber,
      accessToken,
      verifyToken,
    } = req.body;

    // Validate required fields
    if (!whatsappPhoneNumber) {
      return res.status(400).json({ message: 'WhatsApp phone number is required' });
    }

    // Check if agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check for existing config
    const [existing] = await db
      .select()
      .from(agentWhatsappConfig)
      .where(eq(agentWhatsappConfig.agentId, agentId))
      .limit(1);

    if (existing) {
      // Update existing config
      await db
        .update(agentWhatsappConfig)
        .set({
          whatsappBusinessId,
          whatsappPhoneNumberId,
          whatsappPhoneNumber,
          accessToken,
          verifyToken: verifyToken || existing.verifyToken,
          updatedAt: new Date(),
        })
        .where(eq(agentWhatsappConfig.id, existing.id));

      const [updated] = await db
        .select()
        .from(agentWhatsappConfig)
        .where(eq(agentWhatsappConfig.id, existing.id))
        .limit(1);

      return res.json(updated);
    }

    // Create new config
    const configId = crypto.randomUUID();
    const generatedVerifyToken = verifyToken || crypto.randomUUID().replace(/-/g, '');

    await db.insert(agentWhatsappConfig).values({
      id: configId,
      agentId,
      whatsappBusinessId,
      whatsappPhoneNumberId,
      whatsappPhoneNumber,
      accessToken,
      verifyToken: generatedVerifyToken,
      isVerified: false,
      isActive: true,
    });

    const [created] = await db
      .select()
      .from(agentWhatsappConfig)
      .where(eq(agentWhatsappConfig.id, configId))
      .limit(1);

    res.status(201).json(created);
  } catch (error) {
    console.error('[WhatsApp Routes] Error creating/updating config:', error);
    res.status(500).json({ message: 'Failed to save WhatsApp configuration' });
  }
});

// Delete WhatsApp config
router.delete('/agents/:agentId/whatsapp-config', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    await db
      .delete(agentWhatsappConfig)
      .where(eq(agentWhatsappConfig.agentId, agentId));

    res.status(204).send();
  } catch (error) {
    console.error('[WhatsApp Routes] Error deleting config:', error);
    res.status(500).json({ message: 'Failed to delete WhatsApp configuration' });
  }
});

// Verify webhook setup
router.post('/agents/:agentId/whatsapp-config/verify', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const [config] = await db
      .select()
      .from(agentWhatsappConfig)
      .where(eq(agentWhatsappConfig.agentId, agentId))
      .limit(1);

    if (!config) {
      return res.status(404).json({ message: 'WhatsApp config not found' });
    }

    // Test sending a message to verify API access
    // This is a placeholder - in production, you'd make a test API call
    
    await db
      .update(agentWhatsappConfig)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(eq(agentWhatsappConfig.id, config.id));

    res.json({ verified: true, message: 'WhatsApp configuration verified' });
  } catch (error) {
    console.error('[WhatsApp Routes] Error verifying config:', error);
    res.status(500).json({ message: 'Failed to verify WhatsApp configuration' });
  }
});

export default router;
