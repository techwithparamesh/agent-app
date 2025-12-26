import { z } from 'zod';

const shopifyAuthSchema = z.object({
  shopDomain: z.string().min(1),
  accessToken: z.string().min(1),
});

export type ShopifyExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function normalizeDomain(domain: string) {
  const d = domain.trim().replace(/^https?:\/\//, '');
  return d;
}

async function shopifyFetchJson(domain: string, accessToken: string, method: 'GET' | 'POST' | 'PUT', path: string, body?: any) {
  const url = `https://${normalizeDomain(domain)}/admin/api/2024-01${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Shopify API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeShopifyAction(input: ShopifyExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { shopDomain, accessToken } = shopifyAuthSchema.parse({
    shopDomain: credential.shopDomain,
    accessToken: credential.accessToken,
  });

  if (actionId === 'get_order') {
    const orderId = String(config.orderId || '').trim();
    if (!orderId) throw new Error('Shopify get_order requires orderId');

    const data = await shopifyFetchJson(shopDomain, accessToken, 'GET', `/orders/${encodeURIComponent(orderId)}.json`);
    return { ok: true, order: data?.order, raw: data };
  }

  if (actionId === 'create_order') {
    // lineItems is JSON array like [{"variant_id": 123, "quantity": 1}]
    let lineItems: any[] = [];
    try {
      if (Array.isArray(config.lineItems)) lineItems = config.lineItems;
      else if (typeof config.lineItems === 'string') lineItems = JSON.parse(config.lineItems);
    } catch {
      lineItems = [];
    }
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new Error('Shopify create_order requires lineItems (non-empty JSON array)');
    }

    const order: any = {
      line_items: lineItems,
    };

    if (config.customerId) order.customer = { id: Number(config.customerId) || config.customerId };
    if (config.email) order.email = String(config.email);
    if (config.financialStatus) order.financial_status = String(config.financialStatus);
    if (config.shippingAddress) {
      try {
        order.shipping_address = typeof config.shippingAddress === 'object'
          ? config.shippingAddress
          : JSON.parse(String(config.shippingAddress));
      } catch {
        // ignore
      }
    }
    if (config.tags) order.tags = String(config.tags);

    const data = await shopifyFetchJson(shopDomain, accessToken, 'POST', '/orders.json', { order });
    return { ok: true, order: data?.order, raw: data };
  }

  if (actionId === 'update_order') {
    const orderId = String(config.orderId || '').trim();
    if (!orderId) throw new Error('Shopify update_order requires orderId');

    const order: any = { id: Number(orderId) || orderId };
    if (config.note) order.note = String(config.note);
    if (config.tags) order.tags = String(config.tags);
    if (config.email) order.email = String(config.email);

    const data = await shopifyFetchJson(shopDomain, accessToken, 'PUT', `/orders/${encodeURIComponent(orderId)}.json`, { order });
    return { ok: true, order: data?.order, raw: data };
  }

  if (actionId === 'create_product') {
    const title = String(config.title || '').trim();
    if (!title) throw new Error('Shopify create_product requires title');

    const product: any = {
      title,
      ...(config.bodyHtml ? { body_html: String(config.bodyHtml) } : {}),
      ...(config.vendor ? { vendor: String(config.vendor) } : {}),
      ...(config.productType ? { product_type: String(config.productType) } : {}),
      ...(config.tags ? { tags: String(config.tags) } : {}),
    };

    if (config.variants) {
      try {
        product.variants = typeof config.variants === 'object' ? config.variants : JSON.parse(String(config.variants));
      } catch {
        // ignore
      }
    }

    if (config.images) {
      try {
        product.images = typeof config.images === 'object' ? config.images : JSON.parse(String(config.images));
      } catch {
        // ignore
      }
    }

    const data = await shopifyFetchJson(shopDomain, accessToken, 'POST', '/products.json', { product });
    return { ok: true, product: data?.product, raw: data };
  }

  if (actionId === 'update_product') {
    const productId = String(config.productId || '').trim();
    if (!productId) throw new Error('Shopify update_product requires productId');

    const product: any = { id: Number(productId) || productId };
    if (config.title) product.title = String(config.title);
    if (config.bodyHtml) product.body_html = String(config.bodyHtml);
    if (config.tags) product.tags = String(config.tags);

    const data = await shopifyFetchJson(shopDomain, accessToken, 'PUT', `/products/${encodeURIComponent(productId)}.json`, { product });
    return { ok: true, product: data?.product, raw: data };
  }

  if (actionId === 'update_inventory') {
    // This is complex in Shopify REST (InventoryLevels). We accept inventoryItemId/locationId/adjustment.
    const inventoryItemId = String(config.inventoryItemId || '').trim();
    const locationId = String(config.locationId || '').trim();
    const adjustment = Number(config.adjustment);
    if (!inventoryItemId) throw new Error('Shopify update_inventory requires inventoryItemId');
    if (!locationId) throw new Error('Shopify update_inventory requires locationId');
    if (!Number.isFinite(adjustment)) throw new Error('Shopify update_inventory requires adjustment');

    const data = await shopifyFetchJson(shopDomain, accessToken, 'POST', '/inventory_levels/adjust.json', {
      inventory_item_id: Number(inventoryItemId) || inventoryItemId,
      location_id: Number(locationId) || locationId,
      available_adjustment: Math.trunc(adjustment),
    });

    return { ok: true, raw: data };
  }

  if (actionId === 'create_customer') {
    const email = String(config.email || '').trim();
    if (!email) throw new Error('Shopify create_customer requires email');

    const customer: any = {
      email,
      ...(config.firstName ? { first_name: String(config.firstName) } : {}),
      ...(config.lastName ? { last_name: String(config.lastName) } : {}),
      ...(config.phone ? { phone: String(config.phone) } : {}),
      ...(config.acceptsMarketing !== undefined ? { accepts_marketing: Boolean(config.acceptsMarketing) } : {}),
      ...(config.tags ? { tags: String(config.tags) } : {}),
      ...(config.note ? { note: String(config.note) } : {}),
    };

    const data = await shopifyFetchJson(shopDomain, accessToken, 'POST', '/customers.json', { customer });
    return { ok: true, customer: data?.customer, raw: data };
  }

  return { status: 'skipped', reason: `Shopify action not implemented: ${actionId}` };
}
