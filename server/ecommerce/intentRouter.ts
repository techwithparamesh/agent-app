import { storage } from '../storage';
import { decrypt } from '../utils/encryption';
import { assertSafeOutboundUrlCached } from '../utils/outboundUrlSecurity';
import { ShopifyConnector } from './shopifyConnector';
import { WooCommerceConnector } from './woocommerceConnector';
import { BaseEcommerceConnector, Product, Order } from './types';
import crypto from 'crypto';

export type EcomIntent = 'product_lookup' | 'price_check' | 'stock_check' | 'order_tracking' | 'refund_request' | 'product_recommend';

interface IntentContext {
  agentId: string;
  userId: string;
  intent: EcomIntent;
  entities: Record<string, any>;
  conversationId?: string;
  requesterPhone?: string;
}

interface IntentResult {
  success: boolean;
  data?: any;
  message: string;
  fallbackToLeadCapture?: boolean;
}

// Intent → Required Capability mapping
const INTENT_CAPABILITIES: Record<EcomIntent, string> = {
  product_lookup: 'ecommerce',
  price_check: 'ecommerce',
  stock_check: 'ecommerce',
  order_tracking: 'orders',
  refund_request: 'orders',
  product_recommend: 'ecommerce',
};

class RateLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitExceededError';
  }
}

class SimplePerMinuteRateLimiter {
  private readonly bucket = new Map<string, number[]>();

  consume(key: string, limitPerMinute: number) {
    const limit = Number.isFinite(limitPerMinute) ? Math.floor(limitPerMinute) : 60;
    if (limit <= 0) return;

    const now = Date.now();
    const windowStart = now - 60_000;
    const existing = this.bucket.get(key) || [];
    const next = existing.filter((t) => t > windowStart);

    if (next.length >= limit) {
      throw new RateLimitExceededError('Rate limit exceeded for this store connection. Please try again shortly.');
    }

    next.push(now);
    this.bucket.set(key, next);
  }
}

function mapCachedProductToProduct(row: any): Product {
  return {
    id: String(row.externalProductId ?? row.id),
    title: String(row.title || ''),
    description: row.description || undefined,
    price: Number.parseFloat(String(row.price ?? '0')) || 0,
    currency: String(row.currency || 'USD'),
    inventoryQuantity: row.inventoryQuantity ?? undefined,
    isInStock: row.isInStock !== undefined ? Boolean(row.isInStock) : true,
    imageUrl: row.imageUrl || undefined,
    productType: row.productType || undefined,
    vendor: row.vendor || undefined,
    sku: row.sku || undefined,
  };
}

function productToCacheRow(connectionId: string, p: Product, ttlMs: number) {
  const now = Date.now();
  return {
    connectionId,
    externalProductId: String(p.id),
    sku: p.sku || null,
    title: p.title,
    description: p.description || null,
    price: String(p.price ?? 0),
    currency: p.currency || 'USD',
    inventoryQuantity: p.inventoryQuantity ?? null,
    isInStock: Boolean(p.isInStock),
    productType: p.productType || null,
    tags: null,
    vendor: p.vendor || null,
    imageUrl: p.imageUrl || null,
    cachedAt: new Date(now),
    expiresAt: new Date(now + ttlMs),
  };
}

export class EcommerceIntentRouter {
  private readonly rateLimiter = new SimplePerMinuteRateLimiter();
  
  async route(ctx: IntentContext): Promise<IntentResult> {
    const { agentId, intent, entities } = ctx;
    
    // 1. Check capability gating
    const agent = await storage.getAgentById(agentId);
    if (!agent) {
      return { success: false, message: 'Agent not found', fallbackToLeadCapture: true };
    }
    
    const requiredCapability = INTENT_CAPABILITIES[intent];
    const agentCapabilities = (agent.capabilities as string[]) || [];
    
    if (!agentCapabilities.includes(requiredCapability)) {
      console.log(`[EcomRouter] Capability '${requiredCapability}' not enabled for agent ${agentId}`);
      return {
        success: false,
        message: `I'm not able to help with that right now. Let me connect you with someone who can.`,
        fallbackToLeadCapture: true,
      };
    }
    
    // 2. Get e-commerce connection
    const connection = await storage.getEcommerceConnectionByAgentId(agentId);
    if (!connection || !connection.isActive) {
      return {
        success: false,
        message: `I don't have access to live product data right now. Let me take your details.`,
        fallbackToLeadCapture: true,
      };
    }

    // 2c. Best-effort DNS-based SSRF guard at runtime too (cached)
    try {
      await assertSafeOutboundUrlCached(connection.storeUrl, { ttlMs: 60_000 });
    } catch (e) {
      return {
        success: false,
        message: `I can't reach the store URL safely right now. Let me connect you with support.`,
        fallbackToLeadCapture: true,
      };
    }

    // 2b. Enforce connection-level feature flags and per-intent enablement
    const configCaps = Array.isArray((connection.config as any)?.capabilities)
      ? ((connection.config as any).capabilities as unknown[]).filter((c) => typeof c === 'string') as string[]
      : null;

    // Backward-compatible: only enforce per-intent config caps when present and non-empty.
    const isIntentAllowedByConfig = (intentToCheck: EcomIntent): boolean => {
      if (!configCaps || configCaps.length === 0) return true;
      const required = intentToCheck === 'product_recommend' ? 'product_lookup' : intentToCheck;
      return configCaps.includes(required);
    };

    const needsProducts = intent === 'product_lookup' || intent === 'price_check' || intent === 'product_recommend';
    const needsInventory = intent === 'stock_check';
    const needsOrders = intent === 'order_tracking' || intent === 'refund_request';

    if (needsProducts && connection.supportsProducts === false) {
      return {
        success: false,
        message: `I can't access the product catalog right now. Let me connect you with someone who can help.`,
        fallbackToLeadCapture: true,
      };
    }
    if (needsInventory && connection.supportsInventory === false) {
      return {
        success: false,
        message: `I can't check live inventory right now. Let me connect you with someone who can help.`,
        fallbackToLeadCapture: true,
      };
    }
    if (needsOrders && connection.supportsOrders === false) {
      return {
        success: false,
        message: `I can't access order status right now. Let me connect you with support.`,
        fallbackToLeadCapture: true,
      };
    }
    if (!isIntentAllowedByConfig(intent)) {
      return {
        success: false,
        message: `I'm not set up to help with that yet. Let me connect you with support.`,
        fallbackToLeadCapture: true,
      };
    }
    
    // 3. Decrypt credentials and create connector
    let connector: BaseEcommerceConnector;
    try {
      const credentials = JSON.parse(decrypt(connection.encryptedCredentials));
      connector = this.createConnector(connection.platform, connection.storeUrl, credentials, connection.config);
    } catch (e) {
      console.error(`[EcomRouter] Failed to create connector:`, e);
      return {
        success: false,
        message: `I'm having trouble connecting to the store. Please try again later.`,
        fallbackToLeadCapture: true,
      };
    }
    
    // 4. Route to specific executor
    try {
      switch (intent) {
        case 'product_lookup':
          return await this.handleProductLookup(connector, entities, connection);
        case 'price_check':
          return await this.handlePriceCheck(connector, entities, connection);
        case 'stock_check':
          return await this.handleStockCheck(connector, entities, connection);
        case 'order_tracking':
          return await this.handleOrderTracking(connector, entities, ctx, connection.id, connection);
        case 'refund_request':
          return await this.handleRefundRequest(entities);
        case 'product_recommend':
          return await this.handleProductLookup(connector, { ...entities, limit: 5 }, connection);
        default:
          return { success: false, message: 'Unknown intent', fallbackToLeadCapture: true };
      }
    } catch (e) {
      if (e instanceof RateLimitExceededError) {
        return { success: false, message: e.message, fallbackToLeadCapture: true };
      }
      console.error(`[EcomRouter] Executor error for ${intent}:`, e);
      return {
        success: false,
        message: `Sorry, I couldn't complete that request. Let me get someone to help you.`,
        fallbackToLeadCapture: true,
      };
    }
  }
  
  private createConnector(
    platform: string,
    storeUrl: string,
    credentials: Record<string, any>,
    config?: Record<string, any> | null
  ): BaseEcommerceConnector {
    switch (platform) {
      case 'shopify':
        return new ShopifyConnector(
          storeUrl,
          credentials as { accessToken: string },
          config ?? undefined
        );
      case 'woocommerce':
        return new WooCommerceConnector(
          storeUrl,
          credentials as { consumerKey: string; consumerSecret: string },
          config ?? undefined
        );
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
  
  private async handleProductLookup(
    connector: BaseEcommerceConnector,
    entities: Record<string, any>,
    connection: any
  ): Promise<IntentResult> {
    const { query, category, limit = 5 } = entities;

    this.rateLimiter.consume(String(connection.id), Number(connection.rateLimitPerMinute ?? 60));
    
    const products = await connector.getProducts({ 
      query, 
      category, 
      limit: Math.min(limit, 10) 
    });

    // Cache basic product data for future requests
    try {
      const ttlMs = 5 * 60_000;
      await Promise.all(
        (products || []).slice(0, 10).map((p) => storage.upsertProductCacheByExternalId(productToCacheRow(String(connection.id), p, ttlMs) as any))
      );
    } catch (e) {
      console.warn('[EcomRouter] Product cache upsert failed:', e);
    }
    
    if (products.length === 0) {
      return {
        success: true,
        data: { products: [] },
        message: query 
          ? `I couldn't find any products matching "${query}".`
          : `I couldn't find any products at the moment.`,
      };
    }
    
    return {
      success: true,
      data: { products },
      message: this.formatProductList(products),
    };
  }
  
  private async handlePriceCheck(
    connector: BaseEcommerceConnector,
    entities: Record<string, any>,
    connection: any
  ): Promise<IntentResult> {
    const { productId, sku, productName } = entities;
    
    let product: Product | null = null;

    // Cache-first for direct identifiers
    if (productId) {
      const cached = await storage.getCachedProductByExternalId(String(connection.id), String(productId));
      if (cached) product = mapCachedProductToProduct(cached as any);
    } else if (sku) {
      const cached = await storage.getCachedProductBySku(String(connection.id), String(sku));
      if (cached) product = mapCachedProductToProduct(cached as any);
    }

    if (product) {
      return {
        success: true,
        data: { product, cached: true },
        message: `**${product.title}** is priced at **${product.currency} ${product.price.toFixed(2)}**.${
          product.isInStock ? ' It\'s currently in stock!' : ' Unfortunately, it\'s out of stock.'
        }`,
      };
    }

    this.rateLimiter.consume(String(connection.id), Number(connection.rateLimitPerMinute ?? 60));
    
    if (productId) {
      product = await connector.getProductById(productId);
    } else if (sku) {
      product = await connector.getProductBySku(sku);
    } else if (productName) {
      const products = await connector.getProducts({ query: productName, limit: 1 });
      product = products[0] || null;
    }
    
    if (!product) {
      return {
        success: true,
        data: null,
        message: `I couldn't find that product. Could you provide more details?`,
      };
    }

    // Cache the product briefly (prices can change)
    try {
      const ttlMs = 60_000;
      await storage.upsertProductCacheByExternalId(productToCacheRow(String(connection.id), product, ttlMs) as any);
    } catch {
      // ignore
    }
    
    return {
      success: true,
      data: { product },
      message: `**${product.title}** is priced at **${product.currency} ${product.price.toFixed(2)}**.${
        product.isInStock ? ' It\'s currently in stock!' : ' Unfortunately, it\'s out of stock.'
      }`,
    };
  }
  
  private async handleStockCheck(
    connector: BaseEcommerceConnector,
    entities: Record<string, any>,
    connection: any
  ): Promise<IntentResult> {
    const { productId, sku, variantId, productName } = entities;
    
    let product: Product | null = null;

    this.rateLimiter.consume(String(connection.id), Number(connection.rateLimitPerMinute ?? 60));
    
    if (productId) {
      product = await connector.getProductById(productId);
    } else if (sku) {
      product = await connector.getProductBySku(sku);
    } else if (productName) {
      const products = await connector.getProducts({ query: productName, limit: 1 });
      product = products[0] || null;
    }
    
    if (!product) {
      return {
        success: true,
        data: null,
        message: `I couldn't find that product. Which product would you like me to check?`,
      };
    }
    
    const stock = await connector.checkStock(product.id, variantId);
    
    return {
      success: true,
      data: { product, stock },
      message: stock.inStock
        ? `Yes! **${product.title}** is in stock${stock.quantity ? ` (${stock.quantity} available)` : ''}.`
        : `Sorry, **${product.title}** is currently out of stock.`,
    };
  }
  
  private async handleOrderTracking(
    connector: BaseEcommerceConnector,
    entities: Record<string, any>,
    ctx: IntentContext,
    connectionId: string | null,
    connection: any
  ): Promise<IntentResult> {
    const { orderId, email, phone } = entities;
    const startTime = Date.now();

    this.rateLimiter.consume(String(connection.id), Number(connection.rateLimitPerMinute ?? 60));

    // Privacy: avoid email-only lookups (too easy to guess).
    if (!orderId && email) {
      return {
        success: true,
        data: null,
        message: `For privacy, please share your order number as well (e.g., "Order #1234"). Then I can help track it.`,
      };
    }
    
    let order: Order | null = null;
    let lookupType = 'order_by_id';
    let lookupValue = orderId;
    let verified = false;
    
    if (orderId) {
      order = await connector.getOrderById(orderId);
      if (order && email && order.customerEmail) {
        verified = order.customerEmail.trim().toLowerCase() === String(email).trim().toLowerCase();
        if (!verified) {
          await this.logOrderLookup(ctx, 'order_by_id_email_mismatch', email, order, Date.now() - startTime, connectionId);
          return {
            success: true,
            data: null,
            message: `I found an order for that order number, but I can't verify it matches that email. Please double-check the email or contact support.`,
            fallbackToLeadCapture: true,
          };
        }
      }
    } else if (email) {
      lookupType = 'order_by_email';
      lookupValue = email;
      const orders = await connector.getOrdersByEmail(email, 1);
      order = orders[0] || null;
    } else {
      return {
        success: false,
        message: `To track your order, please provide your order number or email address.`,
      };
    }
    
    // Log the lookup for audit
    await this.logOrderLookup(ctx, lookupType, lookupValue, order, Date.now() - startTime, connectionId);
    
    if (!order) {
      return {
        success: true,
        data: null,
        message: `I couldn't find an order with that information. Please double-check and try again, or let me connect you with support.`,
        fallbackToLeadCapture: true,
      };
    }
    
    return {
      success: true,
      data: { order },
      message: this.formatOrderStatus(order, { verified }),
    };
  }
  
  private async handleRefundRequest(entities: Record<string, any>): Promise<IntentResult> {
    // ALWAYS route refund requests to human handoff - DO NOT automate refunds
    return {
      success: true,
      data: { requestType: 'refund', ...entities },
      message: `I understand you'd like to request a refund. Let me connect you with our support team who can help with this.`,
      fallbackToLeadCapture: true,
    };
  }
  
  private formatProductList(products: Product[]): string {
    const lines = products.slice(0, 5).map((p, i) => 
      `${i + 1}. **${p.title}** - ${p.currency} ${p.price.toFixed(2)}${p.isInStock ? '' : ' (Out of stock)'}`
    );
    return `Here's what I found:\n\n${lines.join('\n')}\n\nWould you like more details on any of these?`;
  }
  
  private formatOrderStatus(order: Order, opts?: { verified?: boolean }): string {
    const statusEmoji: Record<string, string> = {
      pending: '⏳',
      processing: '📦',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
      refunded: '💰',
    };

    const verified = !!opts?.verified;
    
    let msg = `**Order #${order.orderNumber}**\n`;
    msg += `Status: ${statusEmoji[order.status] || '📋'} ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}\n`;

    if (verified) {
      msg += `Total: ${order.currency} ${order.total.toFixed(2)}\n`;
      if (order.trackingNumber) {
        msg += `\nTracking: ${order.trackingNumber}`;
        if (order.trackingUrl) {
          msg += `\nTrack here: ${order.trackingUrl}`;
        }
      }
    } else {
      msg += `\nFor privacy, I can share more details (like totals/tracking) once you confirm the order email.`;
    }
    
    return msg;
  }
  
  private async logOrderLookup(
    ctx: IntentContext,
    lookupType: string,
    lookupValue: string | undefined,
    order: Order | null,
    responseTimeMs: number,
    connectionId: string | null
  ): Promise<void> {
    try {
      // Hash PII before logging
      const lookupValueHash = lookupValue 
        ? crypto.createHash('sha256').update(lookupValue).digest('hex')
        : undefined;
      
      await storage.createOrderLookupLog({
        connectionId: connectionId || undefined,
        agentId: ctx.agentId,
        lookupType,
        lookupValueHash,
        conversationId: ctx.conversationId,
        requesterPhone: ctx.requesterPhone,
        found: !!order,
        orderStatus: order?.status,
        responseTimeMs,
      });
    } catch (e) {
      console.error('[EcomRouter] Failed to log order lookup:', e);
    }
  }
  
  // Helper to detect e-commerce intents from message text
  detectIntent(message: string): EcomIntent | null {
    const lower = message.toLowerCase();
    
    // Order tracking patterns
    if (/where('s| is)? my order|track(ing)?|order (status|#|number)|shipment/i.test(message)) {
      return 'order_tracking';
    }
    
    // Refund patterns
    if (/refund|return|money back|cancel order/i.test(message)) {
      return 'refund_request';
    }
    
    // Stock check patterns
    if (/in stock|available|availability|do you have/i.test(message)) {
      return 'stock_check';
    }
    
    // Price check patterns
    if (/price|cost|how much|pricing/i.test(message)) {
      return 'price_check';
    }
    
    // Product lookup patterns
    if (/show me|looking for|find|search|products|catalog|what do you (have|sell)/i.test(message)) {
      return 'product_lookup';
    }
    
    // Recommendation patterns
    if (/recommend|suggest|best|popular|trending/i.test(message)) {
      return 'product_recommend';
    }
    
    return null;
  }
  
  // Extract entities from message for e-commerce intents
  extractEntities(message: string, intent: EcomIntent): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract order ID (common formats)
    const orderIdMatch = message.match(/(?:order|#)\s*([A-Za-z0-9\-]+)/i);
    if (orderIdMatch) {
      entities.orderId = orderIdMatch[1];
    }
    
    // Extract email
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      entities.email = emailMatch[0];
    }
    
    // Extract SKU (common formats)
    const skuMatch = message.match(/(?:sku|item|product)\s*[:#]?\s*([A-Za-z0-9\-]+)/i);
    if (skuMatch) {
      entities.sku = skuMatch[1];
    }
    
    // For product lookups, use the whole message as query (minus common words)
    if (intent === 'product_lookup' || intent === 'product_recommend') {
      entities.query = message
        .replace(/show me|looking for|find|search|products|catalog|what do you have|recommend|suggest|best|popular/gi, '')
        .trim();
    }
    
    return entities;
  }
}

export const ecommerceIntentRouter = new EcommerceIntentRouter();
