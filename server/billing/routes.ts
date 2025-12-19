/**
 * Billing Routes
 * Handles Stripe checkout, subscription management, and webhooks
 */

import { Router, type Request, type Response } from 'express';
import { stripeService } from './stripe';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// ========== VALIDATION SCHEMAS ==========

const createCheckoutSchema = z.object({
  planSlug: z.string(),
  billingCycle: z.enum(['monthly', 'yearly']),
});

// ========== CHECKOUT ROUTES ==========

/**
 * Create a checkout session for subscription
 */
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { planSlug, billingCycle } = createCheckoutSchema.parse(req.body);

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    
    const checkoutUrl = await stripeService.createCheckoutSession({
      userId,
      planSlug,
      billingCycle,
      successUrl: `${baseUrl}/dashboard/billing?success=true`,
      cancelUrl: `${baseUrl}/dashboard/billing?cancelled=true`,
    });

    res.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('[Billing] Checkout error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create checkout session' });
  }
});

/**
 * Create a billing portal session
 */
router.post('/portal', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    
    const portalUrl = await stripeService.createPortalSession({
      userId,
      returnUrl: `${baseUrl}/dashboard/billing`,
    });

    res.json({ url: portalUrl });
  } catch (error: any) {
    console.error('[Billing] Portal error:', error);
    res.status(500).json({ message: error.message || 'Failed to create portal session' });
  }
});

/**
 * Get subscription status
 */
router.get('/subscription', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const status = await stripeService.getSubscriptionStatus(userId);
    res.json(status);
  } catch (error: any) {
    console.error('[Billing] Status error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription status' });
  }
});

/**
 * Get all available plans
 */
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await storage.getAllSubscriptionPlans();
    // Return in the format expected by usePlans hook
    res.json({ plans });
  } catch (error: any) {
    console.error('[Billing] Plans error:', error);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
});

/**
 * Get invoices
 */
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub || (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const invoices = await storage.getInvoicesByUserId(userId);
    res.json(invoices);
  } catch (error: any) {
    console.error('[Billing] Invoices error:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

export default router;
