// E-Commerce Connector Types

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

export interface SearchOptions {
  query?: string;
  limit?: number;
  category?: string;
}

export interface StockResult {
  inStock: boolean;
  quantity?: number;
}

export interface ConnectionTestResult {
  ok: boolean;
  storeName?: string;
  error?: string;
}

// Base connector interface that all platforms must implement
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
  abstract getProducts(options?: SearchOptions): Promise<Product[]>;
  abstract getProductById(productId: string): Promise<Product | null>;
  abstract getProductBySku(sku: string): Promise<Product | null>;
  
  // Inventory
  abstract checkStock(productId: string, variantId?: string): Promise<StockResult>;
  
  // Orders
  abstract getOrderById(orderId: string): Promise<Order | null>;
  abstract getOrdersByEmail(email: string, limit?: number): Promise<Order[]>;
  
  // Health check
  abstract testConnection(): Promise<ConnectionTestResult>;
  
  // Helper for making HTTP requests with timeout
  protected async fetch(url: string, options?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }
}
