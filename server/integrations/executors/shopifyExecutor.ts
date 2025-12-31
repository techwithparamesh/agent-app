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

  const pick = (obj: Record<string, any>, ...keys: string[]) => {
    for (const k of keys) {
      if (obj[k] !== undefined) return obj[k];
    }
    return undefined;
  };

  const parseJsonMaybe = (value: any): any => {
    if (value == null) return undefined;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return undefined;
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  };

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
      const raw = pick(config, 'lineItems', 'line_items');
      if (Array.isArray(raw)) lineItems = raw;
      else if (typeof raw === 'string') lineItems = JSON.parse(raw);
    } catch {
      lineItems = [];
    }
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new Error('Shopify create_order requires lineItems (non-empty JSON array)');
    }

    const order: any = {
      line_items: lineItems,
    };

    const customerId = pick(config, 'customerId', 'customer_id');
    if (customerId) order.customer = { id: Number(customerId) || customerId };

    const customerRaw = pick(config, 'customer');
    const customerObj = parseJsonMaybe(customerRaw);
    if (!order.customer && customerObj && typeof customerObj === 'object') {
      if (customerObj.id != null) order.customer = { id: Number(customerObj.id) || customerObj.id };
      if (!order.email && typeof customerObj.email === 'string') order.email = customerObj.email;
    }

    const email = pick(config, 'email');
    if (email) order.email = String(email);

    const financialStatus = pick(config, 'financialStatus', 'financial_status');
    if (financialStatus) order.financial_status = String(financialStatus);

    const shippingAddress = pick(config, 'shippingAddress', 'shipping_address');
    if (shippingAddress) {
      try {
        order.shipping_address = typeof shippingAddress === 'object'
          ? shippingAddress
          : JSON.parse(String(shippingAddress));
      } catch {
        // ignore
      }
    }

    const tags = pick(config, 'tags');
    if (tags) order.tags = String(tags);

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
      ...(pick(config, 'bodyHtml', 'body_html') ? { body_html: String(pick(config, 'bodyHtml', 'body_html')) } : {}),
      ...(pick(config, 'vendor') ? { vendor: String(pick(config, 'vendor')) } : {}),
      ...(pick(config, 'productType', 'product_type') ? { product_type: String(pick(config, 'productType', 'product_type')) } : {}),
      ...(pick(config, 'tags') ? { tags: String(pick(config, 'tags')) } : {}),
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
    const bodyHtml = pick(config, 'bodyHtml', 'body_html');
    if (bodyHtml) product.body_html = String(bodyHtml);
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
    const email = String(pick(config, 'email') || '').trim();
    if (!email) throw new Error('Shopify create_customer requires email');

    const customer: any = {
      email,
      ...(pick(config, 'firstName', 'first_name') ? { first_name: String(pick(config, 'firstName', 'first_name')) } : {}),
      ...(pick(config, 'lastName', 'last_name') ? { last_name: String(pick(config, 'lastName', 'last_name')) } : {}),
      ...(pick(config, 'phone') ? { phone: String(pick(config, 'phone')) } : {}),
      ...(pick(config, 'acceptsMarketing', 'accepts_marketing') !== undefined
        ? { accepts_marketing: Boolean(pick(config, 'acceptsMarketing', 'accepts_marketing')) }
        : {}),
      ...(pick(config, 'tags') ? { tags: String(pick(config, 'tags')) } : {}),
      ...(pick(config, 'note') ? { note: String(pick(config, 'note')) } : {}),
    };

    const data = await shopifyFetchJson(shopDomain, accessToken, 'POST', '/customers.json', { customer });
    return { ok: true, customer: data?.customer, raw: data };
  }

  if (actionId === 'fulfill_order') {
    const orderId = String(config.orderId || '').trim();
    if (!orderId) throw new Error('Shopify fulfill_order requires orderId');

    const notifyCustomer = config.notifyCustomer !== undefined ? Boolean(config.notifyCustomer) : true;
    const trackingNumber = config.trackingNumber != null ? String(config.trackingNumber).trim() : '';
    const trackingCompany = config.trackingCompany != null ? String(config.trackingCompany).trim() : '';

    // NOTE: Shopify fulfillment APIs can be complex (fulfillment orders).
    // This uses the legacy REST endpoint as a best-effort for simple stores.
    const fulfillment: any = {
      notify_customer: notifyCustomer,
    };

    if (trackingNumber) fulfillment.tracking_number = trackingNumber;
    if (trackingCompany) fulfillment.tracking_company = trackingCompany;

    const data = await shopifyFetchJson(
      shopDomain,
      accessToken,
      'POST',
      `/orders/${encodeURIComponent(orderId)}/fulfillments.json`,
      { fulfillment },
    );

    return { ok: true, fulfillment: data?.fulfillment, raw: data };
  }

  return { status: 'skipped', reason: `Shopify action not implemented: ${actionId}` };
}
