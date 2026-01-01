import { BaseEcommerceConnector, Product, Order, SearchOptions, StockResult, ConnectionTestResult } from './types';

export class WooCommerceConnector extends BaseEcommerceConnector {
  private consumerKey: string;
  private consumerSecret: string;
  private siteUrl: string;
  private cachedCurrency: string | null = null;

  constructor(storeUrl: string, credentials: { consumerKey: string; consumerSecret: string }, config?: any) {
    super(storeUrl, credentials, config);
    this.consumerKey = credentials.consumerKey;
    this.consumerSecret = credentials.consumerSecret;
    this.siteUrl = storeUrl.replace(/\/$/, '');
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
  }

  private async wooFetch(endpoint: string, method = 'GET', body?: any): Promise<any> {
    const url = `${this.siteUrl}/wp-json/wc/v3${endpoint}`;
    
    const res = await this.fetch(url, {
      method,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`);
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
      const data = await this.wooFetch('/data/currencies/current');
      const code = data?.code || data?.currency;
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
    let endpoint = `/products?per_page=${limit}&status=publish`;
    
    if (options?.query) {
      endpoint += `&search=${encodeURIComponent(options.query)}`;
    }
    if (options?.category) {
      endpoint += `&category=${encodeURIComponent(options.category)}`;
    }
    
    const products = await this.wooFetch(endpoint);
    return products.map((p: any) => this.mapProduct(p));
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      await this.ensureCurrency();
      const product = await this.wooFetch(`/products/${productId}`);
      return this.mapProduct(product);
    } catch {
      return null;
    }
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    try {
      await this.ensureCurrency();
      const products = await this.wooFetch(`/products?sku=${encodeURIComponent(sku)}`);
      if (products.length === 0) return null;
      return this.mapProduct(products[0]);
    } catch {
      return null;
    }
  }

  async checkStock(productId: string, variantId?: string): Promise<StockResult> {
    try {
      if (variantId) {
        // Get variation stock
        const variation = await this.wooFetch(`/products/${productId}/variations/${variantId}`);
        return {
          inStock: variation.in_stock,
          quantity: variation.stock_quantity,
        };
      }
      
      const product = await this.wooFetch(`/products/${productId}`);
      return {
        inStock: product.in_stock,
        quantity: product.stock_quantity,
      };
    } catch {
      return { inStock: false };
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const order = await this.wooFetch(`/orders/${orderId}`);
      return this.mapOrder(order);
    } catch {
      return null;
    }
  }

  async getOrdersByEmail(email: string, limit = 5): Promise<Order[]> {
    try {
      const orders = await this.wooFetch(`/orders?search=${encodeURIComponent(email)}&per_page=${limit}`);
      return orders.map((o: any) => this.mapOrder(o));
    } catch {
      return [];
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const data = await this.wooFetch('/system_status');
      // Best-effort currency lookup
      await this.ensureCurrency();
      return { ok: true, storeName: data.settings?.store_name || this.siteUrl };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Connection failed' };
    }
  }

  private mapProduct(p: any): Product {
    return {
      id: String(p.id),
      title: p.name,
      description: p.short_description?.replace(/<[^>]*>/g, '') || p.description?.replace(/<[^>]*>/g, ''),
      price: parseFloat(p.price || '0'),
      currency: this.cachedCurrency || 'USD',
      inventoryQuantity: p.stock_quantity,
      isInStock: p.in_stock,
      imageUrl: p.images?.[0]?.src,
      productType: p.type,
      vendor: p.brands?.[0]?.name,
      sku: p.sku,
      // Avoid returning placeholder variations without fetching real variation details.
      variants: undefined,
    };
  }

  private mapOrder(o: any): Order {
    return {
      id: String(o.id),
      orderNumber: String(o.number),
      status: this.mapOrderStatus(o.status),
      fulfillmentStatus: o.status,
      trackingNumber: o.meta_data?.find((m: any) => m.key === '_tracking_number')?.value,
      trackingUrl: o.meta_data?.find((m: any) => m.key === '_tracking_url')?.value,
      createdAt: o.date_created,
      total: parseFloat(o.total || '0'),
      currency: o.currency,
      customerEmail: o.billing?.email,
      lineItems: (o.line_items || []).map((li: any) => ({
        productId: String(li.product_id),
        title: li.name,
        quantity: li.quantity,
        price: parseFloat(li.price || '0'),
      })),
    };
  }

  private mapOrderStatus(status: string): Order['status'] {
    switch (status) {
      case 'completed':
        return 'delivered';
      case 'processing':
        return 'processing';
      case 'on-hold':
      case 'pending':
        return 'pending';
      case 'cancelled':
        return 'cancelled';
      case 'refunded':
        return 'refunded';
      default:
        return 'pending';
    }
  }
}
