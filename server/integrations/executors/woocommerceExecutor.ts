import { z } from 'zod';

const wooAuthSchema = z.object({
  siteUrl: z.string().min(1),
  consumerKey: z.string().min(1),
  consumerSecret: z.string().min(1),
});

export type WooCommerceExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function parseJsonMaybe(value: any) {
  if (value == null) return undefined;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function wooBase(siteUrl: string) {
  const normalized = siteUrl.trim().replace(/\/+$/, '');
  return `${normalized}/wp-json/wc/v3`;
}

async function wooJson(siteUrl: string, consumerKey: string, consumerSecret: string, path: string, init?: RequestInit) {
  const url = new URL(`${wooBase(siteUrl)}${path}`);
  url.searchParams.set('consumer_key', consumerKey);
  url.searchParams.set('consumer_secret', consumerSecret);

  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`WooCommerce API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeWooCommerceAction(input: WooCommerceExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { siteUrl, consumerKey, consumerSecret } = wooAuthSchema.parse({
    siteUrl: credential.siteUrl,
    consumerKey: credential.consumerKey,
    consumerSecret: credential.consumerSecret,
  });

  if (actionId === 'create_order') {
    const lineItems = parseJsonMaybe(config.lineItems);
    if (!Array.isArray(lineItems) || !lineItems.length) throw new Error('WooCommerce create_order requires lineItems (json array)');

    const body: any = {
      line_items: lineItems,
      ...(config.customerId ? { customer_id: Number(config.customerId) } : {}),
      ...(config.billing ? { billing: parseJsonMaybe(config.billing) ?? config.billing } : {}),
      ...(config.shipping ? { shipping: parseJsonMaybe(config.shipping) ?? config.shipping } : {}),
      ...(config.paymentMethod ? { payment_method: String(config.paymentMethod) } : {}),
      ...(config.status ? { status: String(config.status) } : {}),
    };

    const data = await wooJson(siteUrl, consumerKey, consumerSecret, '/orders', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, order: data, raw: data };
  }

  if (actionId === 'update_order') {
    const orderId = String(config.orderId || '').trim();
    if (!orderId) throw new Error('WooCommerce update_order requires orderId');

    const body: any = {};
    if (config.status) body.status = String(config.status);
    if (config.note) body.customer_note = String(config.note);

    const data = await wooJson(siteUrl, consumerKey, consumerSecret, `/orders/${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return { ok: true, order: data, raw: data };
  }

  if (actionId === 'get_order') {
    const orderId = String(config.orderId || '').trim();
    if (!orderId) throw new Error('WooCommerce get_order requires orderId');

    const data = await wooJson(siteUrl, consumerKey, consumerSecret, `/orders/${encodeURIComponent(orderId)}`, { method: 'GET' });
    return { ok: true, order: data, raw: data };
  }

  if (actionId === 'create_product') {
    const name = String(config.name || '').trim();
    const regularPrice = String(config.regularPrice || '').trim();
    if (!name) throw new Error('WooCommerce create_product requires name');
    if (!regularPrice) throw new Error('WooCommerce create_product requires regularPrice');

    const body: any = {
      name,
      type: String(config.type || 'simple'),
      regular_price: regularPrice,
      ...(config.description ? { description: String(config.description) } : {}),
      ...(config.shortDescription ? { short_description: String(config.shortDescription) } : {}),
      ...(config.sku ? { sku: String(config.sku) } : {}),
      ...(config.stockQuantity != null ? { stock_quantity: Number(config.stockQuantity) } : {}),
      ...(config.categories ? { categories: parseJsonMaybe(config.categories) ?? config.categories } : {}),
      ...(config.images ? { images: parseJsonMaybe(config.images) ?? config.images } : {}),
    };

    const data = await wooJson(siteUrl, consumerKey, consumerSecret, '/products', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, product: data, raw: data };
  }

  if (actionId === 'update_stock') {
    const productId = String(config.productId || '').trim();
    if (!productId) throw new Error('WooCommerce update_stock requires productId');

    const body: any = {
      ...(config.stockQuantity != null ? { stock_quantity: Number(config.stockQuantity) } : {}),
      ...(config.stockStatus ? { stock_status: String(config.stockStatus) } : {}),
    };

    const data = await wooJson(siteUrl, consumerKey, consumerSecret, `/products/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return { ok: true, product: data, raw: data };
  }

  if (actionId === 'create_customer') {
    const email = String(config.email || '').trim();
    if (!email) throw new Error('WooCommerce create_customer requires email');

    const body: any = {
      email,
      ...(config.firstName ? { first_name: String(config.firstName) } : {}),
      ...(config.lastName ? { last_name: String(config.lastName) } : {}),
      ...(config.username ? { username: String(config.username) } : {}),
      ...(config.billing ? { billing: parseJsonMaybe(config.billing) ?? config.billing } : {}),
      ...(config.shipping ? { shipping: parseJsonMaybe(config.shipping) ?? config.shipping } : {}),
    };

    const data = await wooJson(siteUrl, consumerKey, consumerSecret, '/customers', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, customer: data, raw: data };
  }

  return { status: 'skipped', reason: `WooCommerce action not implemented: ${actionId}` };
}
