/**
 * Stripe Billing Integration
 * Handles subscriptions, payments, and invoicing
 */

import Stripe from 'stripe';
import { storage } from '../storage';

// Initialize Stripe with latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export interface CreateCheckoutSessionParams {
  userId: string;
  planSlug: string;
  billingCycle: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalSessionParams {
  userId: string;
  returnUrl: string;
}

export class StripeService {
  /**
   * Create or get Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string): Promise<string> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has a subscription with stripe customer ID
    const subscription = await storage.getUserSubscriptionByUserId(userId);
    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
      metadata: {
        userId: user.id,
      },
    });

    return customer.id;
  }

  /**
   * Create a checkout session for new subscription
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string> {
    const { userId, planSlug, billingCycle, successUrl, cancelUrl } = params;

    // Get the plan
    const plan = await storage.getSubscriptionPlanBySlug(planSlug);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Get or create customer
    const customerId = await this.getOrCreateCustomer(userId);

    // Get price based on billing cycle
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    if (!price || price === 0) {
      throw new Error('This plan is free and does not require payment');
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: plan.currency?.toLowerCase() || 'usd',
            product_data: {
              name: `${plan.name} Plan`,
              description: `WhatsApp Business SaaS - ${plan.name} Plan (${billingCycle})`,
            },
            unit_amount: price,
            recurring: {
              interval: billingCycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId: plan.id,
        planSlug,
        billingCycle,
      },
    });

    return session.url || '';
  }

  /**
   * Create a customer portal session for managing subscription
   */
  async createPortalSession(params: CreatePortalSessionParams): Promise<string> {
    const { userId, returnUrl } = params;

    const subscription = await storage.getUserSubscriptionByUserId(userId);
    if (!subscription?.stripeCustomerId) {
      throw new Error('No subscription found for user');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    console.log(`[Stripe] Received event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle successful checkout
   */
  private async handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const billingCycle = session.metadata?.billingCycle as 'monthly' | 'yearly';

    if (!userId || !planId) {
      console.error('[Stripe] Missing metadata in checkout session');
      return;
    }

    // Get subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);

    // Create or update user subscription
    const existingSubscription = await storage.getUserSubscriptionByUserId(userId);

    // Get period dates from subscription items
    const periodStart = stripeSubscription.items?.data?.[0]?.current_period_start || Math.floor(Date.now() / 1000);
    const periodEnd = stripeSubscription.items?.data?.[0]?.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    const subscriptionData = {
      userId,
      planId,
      billingCycle,
      status: 'active' as const,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      currentPeriodStart: new Date(periodStart * 1000),
      currentPeriodEnd: new Date(periodEnd * 1000),
      messagesUsed: 0,
    };

    if (existingSubscription) {
      await storage.updateUserSubscription(existingSubscription.id, subscriptionData);
    } else {
      await storage.createUserSubscription(subscriptionData);
    }

    // Update user's plan in users table
    const plan = await storage.getSubscriptionPlanById(planId);
    if (plan) {
      await storage.upgradePlan(userId, plan.slug);
    }

    console.log(`[Stripe] Subscription created for user: ${userId}`);
  }

  /**
   * Handle subscription update
   */
  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    
    // Find user subscription by stripe subscription ID
    // We need to look up by stripeSubscriptionId
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as Stripe.Customer).metadata?.userId;

    if (!userId) {
      console.error('[Stripe] Could not find userId for customer:', customerId);
      return;
    }

    const userSubscription = await storage.getUserSubscriptionByUserId(userId);
    if (!userSubscription) {
      console.error('[Stripe] No subscription found for user:', userId);
      return;
    }

    await storage.updateUserSubscription(userSubscription.id, {
      status: subscription.status === 'active' ? 'active' : 
              subscription.status === 'past_due' ? 'past_due' :
              subscription.status === 'canceled' ? 'cancelled' : 'active',
      currentPeriodStart: new Date((subscription.items?.data?.[0]?.current_period_start || Math.floor(Date.now() / 1000)) * 1000),
      currentPeriodEnd: new Date((subscription.items?.data?.[0]?.current_period_end || Math.floor(Date.now() / 1000)) * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    console.log(`[Stripe] Subscription updated for user: ${userId}`);
  }

  /**
   * Handle subscription cancellation
   */
  private async handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as Stripe.Customer).metadata?.userId;

    if (!userId) {
      console.error('[Stripe] Could not find userId for customer:', customerId);
      return;
    }

    const userSubscription = await storage.getUserSubscriptionByUserId(userId);
    if (!userSubscription) {
      return;
    }

    await storage.updateUserSubscription(userSubscription.id, {
      status: 'cancelled',
    });

    // Downgrade user to free plan
    await storage.upgradePlan(userId, 'free');

    console.log(`[Stripe] Subscription cancelled for user: ${userId}`);
  }

  /**
   * Handle paid invoice
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as Stripe.Customer).metadata?.userId;

    if (!userId) {
      return;
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create invoice record
    await storage.createInvoice({
      userId,
      invoiceNumber,
      stripeInvoiceId: invoice.id,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      subtotal: invoice.subtotal,
      tax: (invoice as any).tax || 0,
      total: invoice.total,
      amountPaid: invoice.amount_paid,
      amountDue: invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      status: 'paid',
      paidAt: new Date(),
      invoicePdfUrl: invoice.invoice_pdf || undefined,
      lineItems: invoice.lines.data.map((line: Stripe.InvoiceLineItem) => ({
        description: line.description || 'Subscription',
        quantity: line.quantity || 1,
        unitPrice: line.amount / (line.quantity || 1),
        total: line.amount,
      })),
    });

    // Reset messages used for new billing period
    const subscription = await storage.getUserSubscriptionByUserId(userId);
    if (subscription) {
      await storage.updateUserSubscription(subscription.id, {
        messagesUsed: 0,
      });
    }

    console.log(`[Stripe] Invoice paid for user: ${userId}`);
  }

  /**
   * Handle failed invoice payment
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    const userId = (customer as Stripe.Customer).metadata?.userId;

    if (!userId) {
      return;
    }

    const subscription = await storage.getUserSubscriptionByUserId(userId);
    if (subscription) {
      await storage.updateUserSubscription(subscription.id, {
        status: 'past_due',
      });
    }

    console.log(`[Stripe] Invoice payment failed for user: ${userId}`);
    // TODO: Send notification email to user
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    plan: string;
    messagesUsed: number;
    messageLimit: number | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  }> {
    const subscription = await storage.getUserSubscriptionByUserId(userId);
    
    if (!subscription || subscription.status !== 'active') {
      return {
        hasActiveSubscription: false,
        plan: 'free',
        messagesUsed: 0,
        messageLimit: 100,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    const plan = await storage.getSubscriptionPlanById(subscription.planId);

    return {
      hasActiveSubscription: true,
      plan: plan?.slug || 'unknown',
      messagesUsed: subscription.messagesUsed || 0,
      messageLimit: plan?.messageLimit || null,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
    };
  }

  /**
   * Check if user can send more messages
   */
  async canSendMessage(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const status = await this.getSubscriptionStatus(userId);
    
    // Unlimited (null) means no limit
    if (status.messageLimit === null) {
      return { allowed: true, remaining: Infinity };
    }

    const remaining = status.messageLimit - status.messagesUsed;
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
    };
  }

  /**
   * Record a message and increment usage
   */
  async recordMessageUsage(userId: string): Promise<void> {
    await storage.incrementSubscriptionMessagesUsed(userId, 1);
  }
}

export const stripeService = new StripeService();
