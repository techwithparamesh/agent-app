import { BaseEcommerceConnector, Product, Order, SearchOptions, StockResult, ConnectionTestResult } from './types';

export class ShopifyConnector extends BaseEcommerceConnector {
  private accessToken: string;
  private shopDomain: string;
  private apiVersion = '2024-01';
  private cachedCurrency: string | null = null;

  constructor(storeUrl: string, credentials: { accessToken: string }, config?: any) {
    super(storeUrl, credentials, config);
    this.accessToken = credentials.accessToken;
    // Always derive domain from validated storeUrl to avoid SSRF bypass via credential fields.
    this.shopDomain = new URL(storeUrl).hostname;
  }

  private async shopifyFetch(path: string, method = 'GET', body?: any): Promise<any> {
    const url = `https://${this.shopDomain}/admin/api/${this.apiVersion}${path}`;
    
    const res = await this.fetch(url, {
      method,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
    }
    
    return res.json();
  }

  private async ensureCurrency(): Promise<void> {
    if (this.cachedCurrency) return;
    if (typeof (this.config as any)?.currency === 'string' && String((this.config as any).currency).trim().length > 0) {
      this.cachedCurrency = String((this.config as any).currency).trim().toUpperCase();
      return;
    }
    try {
      const data = await this.shopifyFetch('/shop.json');
      const code = data?.shop?.currency;
      if (typeof code === 'string' && code.trim()) {
        this.cachedCurrency = code.trim().toUpperCase();
        return;
      }
    } catch {
      // ignore
    }
    this.cachedCurrency = 'USD';
  }

  async getProducts(options?: SearchOptions): Promise<Product[]> {
    await this.ensureCurrency();
    const limit = Math.min(options?.limit || 10, 50);
    let path = `/products.json?limit=${limit}&status=active`;
    
    if (options?.query) {
      // Shopify REST API title filter
      path += `&title=${encodeURIComponent(options.query)}`;
    }
    
    const data = await this.shopifyFetch(path);
    return (data.products || []).map((p: any) => this.mapProduct(p));
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      await this.ensureCurrency();
      const data = await this.shopifyFetch(`/products/${productId}.json`);
      return data.product ? this.mapProduct(data.product) : null;
    } catch {
      return null;
    }
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    try {
      // Search for variant by SKU first
      const data = await this.shopifyFetch(`/variants.json?sku=${encodeURIComponent(sku)}`);
      const variant = data.variants?.[0];
      if (!variant) return null;
      return this.getProductById(variant.product_id);
    } catch {
      return null;
    }
  }

  async checkStock(productId: string, variantId?: string): Promise<StockResult> {
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
      const data = await this.shopifyFetch(`/orders/${orderId}.json`);
      return data.order ? this.mapOrder(data.order) : null;
    } catch {
      return null;
    }
  }

  async getOrdersByEmail(email: string, limit = 5): Promise<Order[]> {
    try {
      const data = await this.shopifyFetch(`/orders.json?email=${encodeURIComponent(email)}&limit=${limit}`);
      return (data.orders || []).map((o: any) => this.mapOrder(o));
    } catch {
      return [];
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const data = await this.shopifyFetch('/shop.json');
      const code = data?.shop?.currency;
      if (typeof code === 'string' && code.trim()) {
        this.cachedCurrency = code.trim().toUpperCase();
      }
      return { ok: true, storeName: data.shop?.name };
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
      currency: this.cachedCurrency || 'USD',
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
      orderNumber: String(o.order_number || o.name),
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
