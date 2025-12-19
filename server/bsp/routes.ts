/**
 * BSP (Business Service Provider) Routes
 * Handles WhatsApp Business Account provisioning, phone numbers, templates, and billing
 */

import { Router, type Request, type Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// ========== VALIDATION SCHEMAS ==========

const createWabaSchema = z.object({
  bspProvider: z.enum(['360dialog', 'twilio', 'messagebird', 'gupshup']),
  businessName: z.string().min(1).max(255),
  businessEmail: z.string().email().optional(),
  businessWebsite: z.string().url().optional(),
  businessAddress: z.string().optional(),
  businessCategory: z.string().optional(),
  businessDescription: z.string().optional(),
  timezone: z.string().default('UTC'),
});

const createPhoneNumberSchema = z.object({
  wabaId: z.string().uuid(),
  phoneNumber: z.string().min(10).max(20),
  displayPhoneNumber: z.string().optional(),
  countryCode: z.string().max(5).optional(),
  numberType: z.enum(['new', 'ported', 'virtual']).default('new'),
  profileName: z.string().max(255).optional(),
  profileAbout: z.string().max(500).optional(),
});

const createTemplateSchema = z.object({
  wabaId: z.string().uuid(),
  name: z.string().min(1).max(512),
  language: z.string().default('en'),
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']),
  headerType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT']).optional(),
  headerContent: z.string().optional(),
  bodyText: z.string().min(1),
  footerText: z.string().max(60).optional(),
  buttons: z.array(z.object({
    type: z.enum(['QUICK_REPLY', 'URL', 'PHONE_NUMBER', 'COPY_CODE']),
    text: z.string(),
    url: z.string().optional(),
    phoneNumber: z.string().optional(),
  })).optional(),
  variables: z.array(z.object({
    position: z.number(),
    example: z.string(),
    type: z.enum(['text', 'currency', 'date_time']),
  })).optional(),
});

// ========== WHATSAPP BUSINESS ACCOUNTS ==========

// Get all WABA accounts for user
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const accounts = await storage.getWhatsappBusinessAccountsByUserId(userId);
    res.json(accounts);
  } catch (error) {
    console.error('[BSP Routes] Error fetching accounts:', error);
    res.status(500).json({ message: 'Failed to fetch WhatsApp Business Accounts' });
  }
});

// Get single WABA account
router.get('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const account = await storage.getWhatsappBusinessAccountById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    if (account.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(account);
  } catch (error) {
    console.error('[BSP Routes] Error fetching account:', error);
    res.status(500).json({ message: 'Failed to fetch account' });
  }
});

// Create new WABA account
router.post('/accounts', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const validated = createWabaSchema.parse(req.body);
    
    // Generate webhook credentials
    const webhookVerifyToken = crypto.randomUUID();
    const webhookSecret = crypto.randomUUID();

    const account = await storage.createWhatsappBusinessAccount({
      userId,
      ...validated,
      webhookVerifyToken,
      webhookSecret,
      status: 'pending',
      verificationStatus: 'pending',
    });

    res.status(201).json(account);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('[BSP Routes] Error creating account:', error);
    res.status(500).json({ message: 'Failed to create WhatsApp Business Account' });
  }
});

// Update WABA account
router.patch('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const account = await storage.getWhatsappBusinessAccountById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    if (account.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await storage.updateWhatsappBusinessAccount(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('[BSP Routes] Error updating account:', error);
    res.status(500).json({ message: 'Failed to update account' });
  }
});

// Delete WABA account
router.delete('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const account = await storage.getWhatsappBusinessAccountById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    if (account.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await storage.deleteWhatsappBusinessAccount(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('[BSP Routes] Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// ========== PHONE NUMBERS ==========

// Get all phone numbers for user
router.get('/phone-numbers', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const phoneNumbers = await storage.getPhoneNumbersByUserId(userId);
    res.json(phoneNumbers);
  } catch (error) {
    console.error('[BSP Routes] Error fetching phone numbers:', error);
    res.status(500).json({ message: 'Failed to fetch phone numbers' });
  }
});

// Get phone numbers by WABA
router.get('/accounts/:wabaId/phone-numbers', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify user owns the WABA
    const account = await storage.getWhatsappBusinessAccountById(req.params.wabaId);
    if (!account || account.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const phoneNumbers = await storage.getPhoneNumbersByWabaId(req.params.wabaId);
    res.json(phoneNumbers);
  } catch (error) {
    console.error('[BSP Routes] Error fetching phone numbers:', error);
    res.status(500).json({ message: 'Failed to fetch phone numbers' });
  }
});

// Create/provision new phone number
router.post('/phone-numbers', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const validated = createPhoneNumberSchema.parse(req.body);

    // Verify user owns the WABA
    const account = await storage.getWhatsappBusinessAccountById(validated.wabaId);
    if (!account || account.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Check if phone number already exists
    const existing = await storage.getPhoneNumberByNumber(validated.phoneNumber);
    if (existing) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const phoneNumber = await storage.createPhoneNumber({
      ...validated,
      userId,
      provisioningStatus: 'pending',
    });

    res.status(201).json(phoneNumber);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('[BSP Routes] Error creating phone number:', error);
    res.status(500).json({ message: 'Failed to create phone number' });
  }
});

// Link phone number to agent
router.post('/phone-numbers/:id/link-agent', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { agentId } = req.body;
    if (!agentId) {
      return res.status(400).json({ message: 'agentId is required' });
    }

    const phoneNumber = await storage.getPhoneNumberById(req.params.id);
    if (!phoneNumber || phoneNumber.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await storage.updatePhoneNumber(req.params.id, { agentId });
    res.json(updated);
  } catch (error) {
    console.error('[BSP Routes] Error linking agent:', error);
    res.status(500).json({ message: 'Failed to link agent' });
  }
});

// Delete phone number
router.delete('/phone-numbers/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const phoneNumber = await storage.getPhoneNumberById(req.params.id);
    if (!phoneNumber || phoneNumber.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await storage.deletePhoneNumber(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('[BSP Routes] Error deleting phone number:', error);
    res.status(500).json({ message: 'Failed to delete phone number' });
  }
});

// ========== MESSAGE TEMPLATES ==========

// Get templates by WABA
router.get('/accounts/:wabaId/templates', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const account = await storage.getWhatsappBusinessAccountById(req.params.wabaId);
    if (!account || account.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const templates = await storage.getMessageTemplatesByWabaId(req.params.wabaId);
    res.json(templates);
  } catch (error) {
    console.error('[BSP Routes] Error fetching templates:', error);
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
});

// Create template
router.post('/templates', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const validated = createTemplateSchema.parse(req.body);

    const account = await storage.getWhatsappBusinessAccountById(validated.wabaId);
    if (!account || account.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const template = await storage.createMessageTemplate({
      ...validated,
      status: 'PENDING',
    });

    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('[BSP Routes] Error creating template:', error);
    res.status(500).json({ message: 'Failed to create template' });
  }
});

// Delete template
router.delete('/templates/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const template = await storage.getMessageTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const account = await storage.getWhatsappBusinessAccountById(template.wabaId);
    if (!account || account.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await storage.deleteMessageTemplate(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('[BSP Routes] Error deleting template:', error);
    res.status(500).json({ message: 'Failed to delete template' });
  }
});

// ========== SUBSCRIPTION PLANS ==========

// Get all subscription plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await storage.getAllSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    console.error('[BSP Routes] Error fetching plans:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
});

// Get user's current subscription
router.get('/subscription', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const subscription = await storage.getUserSubscriptionByUserId(userId);
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Get plan details
    const plan = await storage.getSubscriptionPlanById(subscription.planId);

    res.json({ subscription, plan });
  } catch (error) {
    console.error('[BSP Routes] Error fetching subscription:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
});

// ========== USAGE & BILLING ==========

// Get current usage
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const usageRecord = await storage.getCurrentUsageRecord(userId);
    const subscription = await storage.getUserSubscriptionByUserId(userId);

    res.json({
      currentPeriod: usageRecord,
      subscription: subscription ? {
        messagesUsed: subscription.messagesUsed,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      } : null,
    });
  } catch (error) {
    console.error('[BSP Routes] Error fetching usage:', error);
    res.status(500).json({ message: 'Failed to fetch usage' });
  }
});

// Get usage history
router.get('/usage/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const records = await storage.getUsageRecordsByUserId(userId);
    res.json(records);
  } catch (error) {
    console.error('[BSP Routes] Error fetching usage history:', error);
    res.status(500).json({ message: 'Failed to fetch usage history' });
  }
});

// Get invoices
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const invoices = await storage.getInvoicesByUserId(userId);
    res.json(invoices);
  } catch (error) {
    console.error('[BSP Routes] Error fetching invoices:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

export default router;
