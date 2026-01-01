# E-Commerce Extension Architecture

## Executive Summary

This document outlines an incremental, backward-compatible approach to extend the AgentForge platform with e-commerce capabilities. The design leverages existing infrastructure (encrypted credentials, workflow executors, capability gating) while adding new intent-based routing for dynamic product/order data.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER REQUEST                                       │
│                    (WhatsApp / Widget / API)                                 │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INTENT CLASSIFIER                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │   greeting   │ │product_lookup│ │ order_track  │ │ human_support│       │
│  │   goodbye    │ │ price_check  │ │refund_request│ │  ask_question│       │
│  │   feedback   │ │ stock_check  │ │ billing_inq  │ │     ...      │       │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘       │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CAPABILITY GATE CHECK                                   │
│         (Agent.capabilities includes required capability?)                   │
│                                                                              │
│   ✅ PASS → Route to Executor       ❌ FAIL → Lead Capture Fallback         │
└─────────────────────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCE ROUTER                                   │
│                                                                              │
│   ┌─────────────────┐          ┌─────────────────────────────────────────┐  │
│   │  STATIC DATA    │          │         DYNAMIC DATA (API)              │  │
│   │  Knowledge Base │          │  ┌─────────┐ ┌──────────┐ ┌──────────┐  │  │
│   │  - FAQs         │          │  │ Shopify │ │WooCommerce│ │ Generic  │  │  │
│   │  - Policies     │          │  │  API    │ │   API     │ │ REST API │  │  │
│   │  - About pages  │          │  └─────────┘ └──────────┘ └──────────┘  │  │
│   └─────────────────┘          └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                    │
          └──────────────┬─────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RESPONSE COMPOSER                                       │
│              (Merge static + dynamic data for LLM context)                   │
└─────────────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LLM RESPONSE                                         │
│                  (Claude / GPT with combined context)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. New E-Commerce Intents

### Intent Definitions (add to `server/whatsapp/types.ts`)

```typescript
// New e-commerce intents to add to the existing Intent type
export type EcommerceIntent =
  | 'product_lookup'     // "What products do you have?", "Show me laptops"
  | 'price_check'        // "How much is the iPhone?", "What's the price?"
  | 'stock_check'        // "Is this in stock?", "Do you have size M?"
  | 'order_tracking'     // "Where's my order?", "Track order #123"
  | 'refund_request'     // "I want a refund", "Return my order"
  | 'product_recommend'; // "What do you recommend?", "Best selling items"
```

### Intent → Capability Mapping

| Intent | Required Capability | Data Source | Executor |
|--------|---------------------|-------------|----------|
| `product_lookup` | `ecommerce` | API (products endpoint) | `ecom_get_products` |
| `price_check` | `ecommerce` | API (product by ID) | `ecom_get_product` |
| `stock_check` | `ecommerce` | API (inventory) | `ecom_check_stock` |
| `order_tracking` | `orders` | API (orders endpoint) | `ecom_get_order` |
| `refund_request` | `orders` | Lead capture + handoff | `capture_lead` → `human_handoff` |
| `product_recommend` | `ecommerce` | API + Knowledge Base | `ecom_get_products` |

---

## 3. Database Schema Changes

### New Tables (Non-Destructive Migration)

```sql
-- E-Commerce Store Connections
-- Links an agent to a store (Shopify, WooCommerce, or Generic REST)
CREATE TABLE ecommerce_connections (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  agent_id VARCHAR(36) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Store Type
  platform VARCHAR(50) NOT NULL, -- 'shopify', 'woocommerce', 'generic_rest'
  store_name VARCHAR(255),
  store_url VARCHAR(500) NOT NULL,
  
  -- Encrypted Credentials (uses existing encryption.ts)
  encrypted_credentials TEXT NOT NULL, -- JSON: {accessToken, consumerKey, consumerSecret, apiKey, etc.}
  
  -- Configuration
  config JSON, -- Platform-specific config: {apiVersion, customEndpoints, headerAuth, etc.}
  
  -- Feature Flags (what this connection supports)
  supports_products BOOLEAN DEFAULT TRUE,
  supports_inventory BOOLEAN DEFAULT TRUE,
  supports_orders BOOLEAN DEFAULT TRUE,
  supports_customers BOOLEAN DEFAULT FALSE,
  
  -- Rate Limiting
  rate_limit_per_minute INT DEFAULT 60,
  last_api_call_at TIMESTAMP,
  api_calls_this_minute INT DEFAULT 0,
  
  -- Status & Health
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP,
  last_error TEXT,
  error_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_ecom_agent (agent_id),
  INDEX idx_ecom_user (user_id),
  UNIQUE INDEX idx_ecom_agent_platform (agent_id, platform)
);

-- Product Cache (Optional - reduces API calls)
CREATE TABLE product_cache (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  connection_id VARCHAR(36) NOT NULL REFERENCES ecommerce_connections(id) ON DELETE CASCADE,
  
  -- Product Data
  external_product_id VARCHAR(100) NOT NULL, -- ID from Shopify/WooCommerce
  sku VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  inventory_quantity INT,
  is_in_stock BOOLEAN DEFAULT TRUE,
  
  -- Categorization (for search)
  product_type VARCHAR(100),
  tags TEXT, -- Comma-separated
  vendor VARCHAR(255),
  
  -- Images
  image_url VARCHAR(1000),
  
  -- Cache Control
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  INDEX idx_cache_connection (connection_id),
  INDEX idx_cache_external_id (connection_id, external_product_id),
  INDEX idx_cache_sku (connection_id, sku),
  FULLTEXT INDEX idx_cache_search (title, description, tags)
);

-- Order Lookup Audit Log (for security & debugging)
CREATE TABLE order_lookup_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  connection_id VARCHAR(36) REFERENCES ecommerce_connections(id) ON DELETE SET NULL,
  agent_id VARCHAR(36) NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Request Details
  lookup_type VARCHAR(50) NOT NULL, -- 'order_by_id', 'order_by_email', 'order_by_phone'
  lookup_value VARCHAR(255), -- The order ID, email, or phone used (hashed for PII)
  
  -- Context
  conversation_id VARCHAR(36),
  requester_phone VARCHAR(20), -- The WhatsApp user who requested
  
  -- Result
  found BOOLEAN DEFAULT FALSE,
  order_status VARCHAR(50), -- Status returned (pending, shipped, delivered, etc.)
  error_message TEXT,
  
  -- Timing
  response_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_lookup_agent (agent_id),
  INDEX idx_lookup_created (created_at)
);
```

### Schema in Drizzle ORM Format

Add to `shared/schema.ts`:

```typescript
// E-Commerce Connections
export const ecommerceConnections = mysqlTable("ecommerce_connections", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  
  platform: varchar("platform", { length: 50 }).notNull(), // 'shopify', 'woocommerce', 'generic_rest'
  storeName: varchar("store_name", { length: 255 }),
  storeUrl: varchar("store_url", { length: 500 }).notNull(),
  
  encryptedCredentials: text("encrypted_credentials").notNull(),
  config: json("config").$type<Record<string, any>>(),
  
  supportsProducts: boolean("supports_products").default(true),
  supportsInventory: boolean("supports_inventory").default(true),
  supportsOrders: boolean("supports_orders").default(true),
  supportsCustomers: boolean("supports_customers").default(false),
  
  rateLimitPerMinute: int("rate_limit_per_minute").default(60),
  lastApiCallAt: timestamp("last_api_call_at"),
  apiCallsThisMinute: int("api_calls_this_minute").default(0),
  
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  lastError: text("last_error"),
  errorCount: int("error_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  agentIdx: index("idx_ecom_agent").on(table.agentId),
  userIdx: index("idx_ecom_user").on(table.userId),
  agentPlatformIdx: uniqueIndex("idx_ecom_agent_platform").on(table.agentId, table.platform),
}));

// Product Cache
export const productCache = mysqlTable("product_cache", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  connectionId: varchar("connection_id", { length: 36 }).notNull().references(() => ecommerceConnections.id, { onDelete: "cascade" }),
  
  externalProductId: varchar("external_product_id", { length: 100 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  inventoryQuantity: int("inventory_quantity"),
  isInStock: boolean("is_in_stock").default(true),
  
  productType: varchar("product_type", { length: 100 }),
  tags: text("tags"),
  vendor: varchar("vendor", { length: 255 }),
  imageUrl: varchar("image_url", { length: 1000 }),
  
  cachedAt: timestamp("cached_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  connectionIdx: index("idx_cache_connection").on(table.connectionId),
  externalIdIdx: index("idx_cache_external_id").on(table.connectionId, table.externalProductId),
  skuIdx: index("idx_cache_sku").on(table.connectionId, table.sku),
}));

// Order Lookup Logs
export const orderLookupLogs = mysqlTable("order_lookup_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  connectionId: varchar("connection_id", { length: 36 }).references(() => ecommerceConnections.id, { onDelete: "set null" }),
  agentId: varchar("agent_id", { length: 36 }).notNull().references(() => agents.id, { onDelete: "cascade" }),
  
  lookupType: varchar("lookup_type", { length: 50 }).notNull(),
  lookupValueHash: varchar("lookup_value_hash", { length: 64 }), // SHA-256 hash of lookup value
  
  conversationId: varchar("conversation_id", { length: 36 }),
  requesterPhone: varchar("requester_phone", { length: 20 }),
  
  found: boolean("found").default(false),
  orderStatus: varchar("order_status", { length: 50 }),
  errorMessage: text("error_message"),
  responseTimeMs: int("response_time_ms"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  agentIdx: index("idx_lookup_agent").on(table.agentId),
  createdIdx: index("idx_lookup_created").on(table.createdAt),
}));
```

---

## 4. Folder/File Structure Changes

```
server/
├── ecommerce/                          # NEW: E-Commerce module
│   ├── index.ts                        # Exports all e-commerce functionality
│   ├── types.ts                        # E-commerce specific types
│   ├── connectionManager.ts            # CRUD for e-commerce connections
│   ├── ecommerceRouter.ts              # Express routes for /api/ecommerce/*
│   ├── intentRouter.ts                 # Routes intents to correct executor
│   ├── rateLimiter.ts                  # Per-connection rate limiting
│   ├── productCache.ts                 # Cache management for products
│   │
│   ├── connectors/                     # Platform-specific connectors
│   │   ├── baseConnector.ts            # Abstract base class
│   │   ├── shopifyConnector.ts         # Shopify API wrapper
│   │   ├── woocommerceConnector.ts     # WooCommerce API wrapper
│   │   └── genericRestConnector.ts     # Generic REST API connector
│   │
│   └── executors/                      # E-commerce tool executors
│       ├── getProducts.ts              # Search/list products
│       ├── getProductById.ts           # Get single product details
│       ├── checkStock.ts               # Check inventory
│       └── getOrderStatus.ts           # Track order by ID/email
│
├── whatsapp/
│   ├── types.ts                        # UPDATE: Add new e-commerce intents
│   ├── toolEngine.ts                   # UPDATE: Register new e-commerce tools
│   └── intentClassifier.ts             # UPDATE: Add e-commerce intent patterns
│
└── integrations/
    └── executors/
        ├── shopifyExecutor.ts          # EXISTING: Already has get_order, etc.
        └── woocommerceExecutor.ts      # EXISTING: Already has get_order, etc.
```

---

## 5. Executor Implementations

### Base Connector Interface

```typescript
// server/ecommerce/connectors/baseConnector.ts

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  inventoryQuantity?: number;
  isInStock: boolean;
  imageUrl?: string;
  productType?: string;
  vendor?: string;
  sku?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  sku?: string;
  inventoryQuantity?: number;
  isInStock: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  fulfillmentStatus?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  total: number;
  currency: string;
  customerEmail?: string;
  lineItems: OrderLineItem[];
}

export interface OrderLineItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
}

export abstract class BaseEcommerceConnector {
  protected storeUrl: string;
  protected credentials: Record<string, any>;
  protected config: Record<string, any>;

  constructor(storeUrl: string, credentials: Record<string, any>, config?: Record<string, any>) {
    this.storeUrl = storeUrl;
    this.credentials = credentials;
    this.config = config || {};
  }

  // Products
  abstract getProducts(options?: { query?: string; limit?: number; category?: string }): Promise<Product[]>;
  abstract getProductById(productId: string): Promise<Product | null>;
  abstract getProductBySku(sku: string): Promise<Product | null>;
  
  // Inventory
  abstract checkStock(productId: string, variantId?: string): Promise<{ inStock: boolean; quantity?: number }>;
  
  // Orders (requires customer identifier)
  abstract getOrderById(orderId: string): Promise<Order | null>;
  abstract getOrdersByEmail(email: string, limit?: number): Promise<Order[]>;
  abstract getOrdersByPhone(phone: string, limit?: number): Promise<Order[]>;

  // Health check
  abstract testConnection(): Promise<{ ok: boolean; error?: string }>;
}
```

### Shopify Connector (Reuses existing executor)

```typescript
// server/ecommerce/connectors/shopifyConnector.ts

import { BaseEcommerceConnector, Product, Order } from './baseConnector';

export class ShopifyConnector extends BaseEcommerceConnector {
  private accessToken: string;
  private apiVersion = '2024-01';

  constructor(storeUrl: string, credentials: { accessToken: string }, config?: any) {
    super(storeUrl, credentials, config);
    this.accessToken = credentials.accessToken;
  }

  private async fetch(path: string, method = 'GET', body?: any) {
    const url = `https://${this.storeUrl}/admin/api/${this.apiVersion}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });
    
    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.status}`);
    }
    return res.json();
  }

  async getProducts(options?: { query?: string; limit?: number }): Promise<Product[]> {
    const limit = Math.min(options?.limit || 10, 50); // Cap at 50
    let path = `/products.json?limit=${limit}&status=active`;
    
    // Note: Shopify REST API doesn't support full-text search
    // For search, use the title filter
    if (options?.query) {
      path += `&title=${encodeURIComponent(options.query)}`;
    }
    
    const data = await this.fetch(path);
    return (data.products || []).map(this.mapProduct);
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      const data = await this.fetch(`/products/${productId}.json`);
      return data.product ? this.mapProduct(data.product) : null;
    } catch {
      return null;
    }
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    // Search variants by SKU
    const data = await this.fetch(`/variants.json?sku=${encodeURIComponent(sku)}`);
    const variant = data.variants?.[0];
    if (!variant) return null;
    return this.getProductById(variant.product_id);
  }

  async checkStock(productId: string, variantId?: string): Promise<{ inStock: boolean; quantity?: number }> {
    const product = await this.getProductById(productId);
    if (!product) return { inStock: false };
    
    if (variantId && product.variants) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        return { inStock: variant.isInStock, quantity: variant.inventoryQuantity };
      }
    }
    
    return { inStock: product.isInStock, quantity: product.inventoryQuantity };
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const data = await this.fetch(`/orders/${orderId}.json`);
      return data.order ? this.mapOrder(data.order) : null;
    } catch {
      return null;
    }
  }

  async getOrdersByEmail(email: string, limit = 5): Promise<Order[]> {
    const data = await this.fetch(`/orders.json?email=${encodeURIComponent(email)}&limit=${limit}`);
    return (data.orders || []).map(this.mapOrder);
  }

  async getOrdersByPhone(phone: string, limit = 5): Promise<Order[]> {
    // Shopify doesn't have direct phone search; search in customer
    const data = await this.fetch(`/orders.json?limit=${limit}`);
    const orders = (data.orders || []).filter((o: any) => 
      o.customer?.phone?.includes(phone) || 
      o.shipping_address?.phone?.includes(phone)
    );
    return orders.map(this.mapOrder);
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.fetch('/shop.json');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Connection failed' };
    }
  }

  private mapProduct(p: any): Product {
    const variant = p.variants?.[0];
    return {
      id: String(p.id),
      title: p.title,
      description: p.body_html?.replace(/<[^>]*>/g, '') || '',
      price: parseFloat(variant?.price || '0'),
      currency: 'USD', // Shopify uses shop currency
      inventoryQuantity: variant?.inventory_quantity,
      isInStock: variant?.inventory_quantity > 0 || variant?.inventory_policy === 'continue',
      imageUrl: p.image?.src,
      productType: p.product_type,
      vendor: p.vendor,
      sku: variant?.sku,
      variants: (p.variants || []).map((v: any) => ({
        id: String(v.id),
        title: v.title,
        price: parseFloat(v.price || '0'),
        sku: v.sku,
        inventoryQuantity: v.inventory_quantity,
        isInStock: v.inventory_quantity > 0,
      })),
    };
  }

  private mapOrder(o: any): Order {
    return {
      id: String(o.id),
      orderNumber: o.order_number || o.name,
      status: this.mapOrderStatus(o.financial_status, o.fulfillment_status),
      fulfillmentStatus: o.fulfillment_status,
      trackingNumber: o.fulfillments?.[0]?.tracking_number,
      trackingUrl: o.fulfillments?.[0]?.tracking_url,
      createdAt: o.created_at,
      total: parseFloat(o.total_price || '0'),
      currency: o.currency,
      customerEmail: o.email,
      lineItems: (o.line_items || []).map((li: any) => ({
        productId: String(li.product_id),
        title: li.title,
        quantity: li.quantity,
        price: parseFloat(li.price || '0'),
      })),
    };
  }

  private mapOrderStatus(financial: string, fulfillment: string): Order['status'] {
    if (financial === 'refunded') return 'refunded';
    if (fulfillment === 'fulfilled') return 'delivered';
    if (fulfillment === 'partial') return 'shipped';
    if (financial === 'paid') return 'processing';
    return 'pending';
  }
}
```

---

## 6. Intent Router & Capability Gating

```typescript
// server/ecommerce/intentRouter.ts

import { storage } from '../storage';
import { decrypt } from '../utils/encryption';
import { ShopifyConnector } from './connectors/shopifyConnector';
import { WooCommerceConnector } from './connectors/woocommerceConnector';
import { BaseEcommerceConnector, Product, Order } from './connectors/baseConnector';

type EcomIntent = 'product_lookup' | 'price_check' | 'stock_check' | 'order_tracking' | 'refund_request';

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
  refund_request: 'orders', // Will always fallback to human handoff
};

export class EcommerceIntentRouter {
  
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
    
    // 4. Check rate limit
    const rateLimitOk = await this.checkRateLimit(connection.id);
    if (!rateLimitOk) {
      return {
        success: false,
        message: `We're experiencing high traffic. Please try again in a moment.`,
        fallbackToLeadCapture: false, // Don't capture lead, just wait
      };
    }
    
    // 5. Route to specific executor
    try {
      switch (intent) {
        case 'product_lookup':
          return await this.handleProductLookup(connector, entities);
        case 'price_check':
          return await this.handlePriceCheck(connector, entities);
        case 'stock_check':
          return await this.handleStockCheck(connector, entities);
        case 'order_tracking':
          return await this.handleOrderTracking(connector, entities, ctx);
        case 'refund_request':
          return await this.handleRefundRequest(entities);
        default:
          return { success: false, message: 'Unknown intent', fallbackToLeadCapture: true };
      }
    } catch (e) {
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
    config?: Record<string, any>
  ): BaseEcommerceConnector {
    switch (platform) {
      case 'shopify':
        return new ShopifyConnector(storeUrl, credentials, config);
      case 'woocommerce':
        return new WooCommerceConnector(storeUrl, credentials, config);
      // case 'generic_rest':
      //   return new GenericRestConnector(storeUrl, credentials, config);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
  
  private async handleProductLookup(
    connector: BaseEcommerceConnector,
    entities: Record<string, any>
  ): Promise<IntentResult> {
    const { query, category, limit = 5 } = entities;
    
    const products = await connector.getProducts({ 
      query, 
      category, 
      limit: Math.min(limit, 10) 
    });
    
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
    entities: Record<string, any>
  ): Promise<IntentResult> {
    const { productId, sku, productName } = entities;
    
    let product: Product | null = null;
    
    if (productId) {
      product = await connector.getProductById(productId);
    } else if (sku) {
      product = await connector.getProductBySku(sku);
    } else if (productName) {
      // Search by name and get first result
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
    entities: Record<string, any>
  ): Promise<IntentResult> {
    const { productId, sku, variantId } = entities;
    
    if (!productId && !sku) {
      return {
        success: false,
        message: `Which product would you like me to check stock for?`,
      };
    }
    
    let product: Product | null = null;
    if (productId) {
      product = await connector.getProductById(productId);
    } else if (sku) {
      product = await connector.getProductBySku(sku);
    }
    
    if (!product) {
      return {
        success: true,
        data: null,
        message: `I couldn't find that product.`,
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
    ctx: IntentContext
  ): Promise<IntentResult> {
    const { orderId, email, phone } = entities;
    const startTime = Date.now();
    
    let order: Order | null = null;
    let lookupType = 'order_by_id';
    let lookupValue = orderId;
    
    if (orderId) {
      order = await connector.getOrderById(orderId);
    } else if (email) {
      lookupType = 'order_by_email';
      lookupValue = email;
      const orders = await connector.getOrdersByEmail(email, 1);
      order = orders[0] || null;
    } else if (phone || ctx.requesterPhone) {
      lookupType = 'order_by_phone';
      lookupValue = phone || ctx.requesterPhone;
      const orders = await connector.getOrdersByPhone(lookupValue!, 1);
      order = orders[0] || null;
    } else {
      return {
        success: false,
        message: `To track your order, please provide your order number or email address.`,
      };
    }
    
    // Log the lookup for audit
    await this.logOrderLookup(ctx, lookupType, lookupValue, order, Date.now() - startTime);
    
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
      message: this.formatOrderStatus(order),
    };
  }
  
  private async handleRefundRequest(entities: Record<string, any>): Promise<IntentResult> {
    // ALWAYS route refund requests to human handoff
    // Do NOT automate refunds
    return {
      success: true,
      data: { requestType: 'refund', ...entities },
      message: `I understand you'd like to request a refund. Let me connect you with our support team who can help with this.`,
      fallbackToLeadCapture: true, // This triggers human handoff flow
    };
  }
  
  private formatProductList(products: Product[]): string {
    const lines = products.slice(0, 5).map((p, i) => 
      `${i + 1}. **${p.title}** - ${p.currency} ${p.price.toFixed(2)}${p.isInStock ? '' : ' (Out of stock)'}`
    );
    return `Here's what I found:\n\n${lines.join('\n')}\n\nWould you like more details on any of these?`;
  }
  
  private formatOrderStatus(order: Order): string {
    const statusEmoji: Record<string, string> = {
      pending: '⏳',
      processing: '📦',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
      refunded: '💰',
    };
    
    let msg = `**Order #${order.orderNumber}**\n`;
    msg += `Status: ${statusEmoji[order.status] || '📋'} ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}\n`;
    msg += `Total: ${order.currency} ${order.total.toFixed(2)}\n`;
    
    if (order.trackingNumber) {
      msg += `\nTracking: ${order.trackingNumber}`;
      if (order.trackingUrl) {
        msg += `\nTrack here: ${order.trackingUrl}`;
      }
    }
    
    return msg;
  }
  
  private async checkRateLimit(connectionId: string): Promise<boolean> {
    // Implementation would check apiCallsThisMinute against rateLimitPerMinute
    // and update/reset counters as needed
    return true; // Placeholder
  }
  
  private async logOrderLookup(
    ctx: IntentContext,
    lookupType: string,
    lookupValue: string | undefined,
    order: Order | null,
    responseTimeMs: number
  ): Promise<void> {
    // Hash PII before logging
    const crypto = await import('crypto');
    const lookupValueHash = lookupValue 
      ? crypto.createHash('sha256').update(lookupValue).digest('hex')
      : undefined;
    
    await storage.createOrderLookupLog({
      connectionId: undefined, // Get from context if needed
      agentId: ctx.agentId,
      lookupType,
      lookupValueHash,
      conversationId: ctx.conversationId,
      requesterPhone: ctx.requesterPhone,
      found: !!order,
      orderStatus: order?.status,
      responseTimeMs,
    });
  }
}

export const ecommerceIntentRouter = new EcommerceIntentRouter();
```

---

## 7. Integration with Existing Chat Flow

### Update WhatsApp Tool Engine

Add e-commerce tools to `server/whatsapp/toolEngine.ts`:

```typescript
// In constructor, add:
this.tools.set('ecom_get_products', this.ecomGetProducts.bind(this));
this.tools.set('ecom_get_product', this.ecomGetProduct.bind(this));
this.tools.set('ecom_check_stock', this.ecomCheckStock.bind(this));
this.tools.set('ecom_get_order', this.ecomGetOrder.bind(this));

// New methods:
async ecomGetProducts(input: { agentId: string; query?: string; category?: string }): Promise<ToolResult> {
  const result = await ecommerceIntentRouter.route({
    agentId: input.agentId,
    userId: '', // Will be fetched from agent
    intent: 'product_lookup',
    entities: { query: input.query, category: input.category },
  });
  
  if (!result.success && result.fallbackToLeadCapture) {
    return {
      success: false,
      error: 'capability_disabled',
      message: result.message,
      requiresLeadCapture: true,
    };
  }
  
  return {
    success: result.success,
    data: result.data,
    message: result.message,
  };
}

// Similar implementations for other e-commerce tools...
```

### Update Widget Chat System Prompt

When an agent has e-commerce capabilities, enhance the system prompt:

```typescript
// In routes.ts, within the chat endpoint

// Check if agent has e-commerce connection
const ecomConnection = await storage.getEcommerceConnectionByAgentId(agentId);
const hasEcommerce = ecomConnection?.isActive && agent.capabilities?.includes('ecommerce');

let ecommercePrompt = '';
if (hasEcommerce) {
  ecommercePrompt = `

## E-Commerce Capabilities
You have access to LIVE product and order data. When users ask about:
- Products, prices, or availability → Use the product database
- Order status or tracking → Ask for order number or email to look up
- Refunds or returns → Collect their info and escalate to human support

IMPORTANT:
- Always show CURRENT prices from the database
- If a product is out of stock, suggest alternatives
- For order issues, be empathetic and offer to connect them with support
- NEVER discuss payment processing or checkout details
`;
}

const systemPrompt = `${basePrompt}${ecommercePrompt}
${knowledgeContext ? `\nKnowledge Base:\n${knowledgeContext}` : ''}`;
```

---

## 8. Security Considerations

### What We DO:
- ✅ Store credentials encrypted (AES-256-GCM)
- ✅ Per-agent credential isolation (no cross-user access)
- ✅ Rate limiting per connection
- ✅ Audit logging for order lookups (hashed PII)
- ✅ Capability gating before any API call
- ✅ Timeouts on all external API calls (10s default)
- ✅ SSRF protection (store URLs validated)

### What We DON'T Do:
- ❌ Access checkout/cart endpoints
- ❌ Process payments
- ❌ Automate refunds (always human handoff)
- ❌ Store raw order data long-term
- ❌ Access customer passwords or payment info

### SSRF Protection

```typescript
// server/ecommerce/security.ts

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254', // AWS metadata
  'metadata.google.internal',
];

const BLOCKED_SCHEMES = ['file:', 'ftp:', 'gopher:'];

export function validateStoreUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    
    // Must be HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Store URL must use HTTPS' };
    }
    
    // Block dangerous schemes
    if (BLOCKED_SCHEMES.some(s => parsed.protocol === s)) {
      return { valid: false, error: 'Invalid URL scheme' };
    }
    
    // Block internal hosts
    if (BLOCKED_HOSTS.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h))) {
      return { valid: false, error: 'Internal hosts not allowed' };
    }
    
    // Block private IP ranges
    const ip = parsed.hostname;
    if (/^10\./.test(ip) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) || /^192\.168\./.test(ip)) {
      return { valid: false, error: 'Private IP addresses not allowed' };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
```

---

## 9. Minimal UI Changes

### Agent Settings (Add E-Commerce Tab)

Only when user enables the "ecommerce" capability, show a new tab/section:

```
┌─────────────────────────────────────────────────────────────┐
│  Agent Settings                                              │
├─────────────────────────────────────────────────────────────┤
│  [General] [Knowledge] [Capabilities] [E-Commerce] [Widget] │
└─────────────────────────────────────────────────────────────┘

E-Commerce Connection:
┌─────────────────────────────────────────────────────────────┐
│  Platform:  [Shopify ▼]                                     │
│                                                             │
│  Store URL: [your-store.myshopify.com              ]       │
│                                                             │
│  Access Token: [●●●●●●●●●●●●●●●●                  ] 👁      │
│                                                             │
│  [ Test Connection ]              Status: ✅ Connected      │
│                                                             │
│  Features Enabled:                                          │
│  ☑ Product Lookup                                           │
│  ☑ Inventory Check                                          │
│  ☑ Order Tracking                                           │
│  ☐ Customer Lookup (Coming Soon)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. What NOT to Build in V1

| Feature | Reason | Future Consideration |
|---------|--------|---------------------|
| Cart management | Payment-adjacent, high risk | V2 with explicit user action |
| Checkout automation | Never - payment security | N/A |
| Customer account creation | PII management complexity | V2 with proper consent flow |
| Inventory management (write) | Too risky for AI to modify | Admin-only workflow action |
| Multi-currency conversion | Complexity, accuracy issues | V2 |
| Product recommendations AI | Requires ML infrastructure | V2 |
| Real-time inventory sync | Webhook complexity | V2 |
| WooCommerce OAuth | Most use API keys | V2 if needed |
| BigCommerce, Magento | Limited market demand | V2 based on requests |

---

## 11. Migration & Rollout Plan

### Phase 1: Database + Schema (Week 1)
1. Create migration SQL file
2. Run `drizzle-kit push` or manual migration
3. Add Drizzle schema definitions
4. Add storage methods

### Phase 2: Connectors + Executors (Week 2)
1. Implement `BaseEcommerceConnector`
2. Port Shopify connector from existing executor
3. Port WooCommerce connector
4. Add unit tests

### Phase 3: Intent Router (Week 3)
1. Add e-commerce intents to types
2. Implement `EcommerceIntentRouter`
3. Integrate with `ToolEngine`
4. Add capability checks

### Phase 4: UI + Testing (Week 4)
1. Add E-Commerce settings panel
2. Connection test endpoint
3. E2E tests with mock APIs
4. Documentation

---

## 12. API Endpoints to Add

```
POST   /api/ecommerce/connections          - Create connection
GET    /api/ecommerce/connections          - List user's connections
GET    /api/ecommerce/connections/:id      - Get connection details
PUT    /api/ecommerce/connections/:id      - Update connection
DELETE /api/ecommerce/connections/:id      - Delete connection
POST   /api/ecommerce/connections/:id/test - Test connection

GET    /api/ecommerce/products             - Search products (via agent)
GET    /api/ecommerce/products/:id         - Get product details
GET    /api/ecommerce/orders/:id           - Get order status (authenticated)
```

---

## Summary

This design:
1. **Reuses** existing Shopify/WooCommerce executors as the base
2. **Extends** intent types and tool engine for e-commerce
3. **Enforces** capability gating at every entry point
4. **Never** touches checkout, payments, or sensitive operations
5. **Falls back** to lead capture when data is unavailable
6. **Logs** all order lookups for audit
7. **Encrypts** all credentials using existing infrastructure
8. **Validates** URLs to prevent SSRF attacks

The implementation is incremental and backward-compatible - existing agents without e-commerce connections continue to work exactly as before.
