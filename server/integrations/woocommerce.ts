import { Router } from 'express';
import { z } from 'zod';

const woocommerceOptionsRouter = Router();

const baseSchema = z.object({
  siteUrl: z.string().min(1),
  consumerKey: z.string().min(1),
  consumerSecret: z.string().min(1),
});

const listSchema = baseSchema.extend({
  search: z.string().optional(),
  perPage: z.number().int().min(1).max(100).optional(),
});

function wooBase(siteUrl: string) {
  const normalized = siteUrl.trim().replace(/\/+$/, '');
  return `${normalized}/wp-json/wc/v3`;
}

async function wooGet(siteUrl: string, consumerKey: string, consumerSecret: string, path: string, params?: Record<string, string>) {
  const url = new URL(`${wooBase(siteUrl)}${path}`);
  url.searchParams.set('consumer_key', consumerKey);
  url.searchParams.set('consumer_secret', consumerSecret);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WooCommerce API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

// POST /api/integrations/options/woocommerce/products
// Body: { siteUrl, consumerKey, consumerSecret, search?, perPage? }
woocommerceOptionsRouter.post('/products', async (req, res) => {
  try {
    const { siteUrl, consumerKey, consumerSecret, search, perPage } = listSchema.parse(req.body);

    const data = await wooGet(siteUrl, consumerKey, consumerSecret, '/products', {
      per_page: String(perPage ?? 50),
      ...(search && search.trim() ? { search: search.trim() } : {}),
    });

    const products = Array.isArray(data) ? data : [];
    const options = products
      .filter((p: any) => p && p.id)
      .map((p: any) => ({ value: String(p.id), label: String(p.name || p.id) }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[WooCommerce Options] products error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load WooCommerce products' });
  }
});

// POST /api/integrations/options/woocommerce/customers
// Body: { siteUrl, consumerKey, consumerSecret, search?, perPage? }
woocommerceOptionsRouter.post('/customers', async (req, res) => {
  try {
    const { siteUrl, consumerKey, consumerSecret, search, perPage } = listSchema.parse(req.body);

    const data = await wooGet(siteUrl, consumerKey, consumerSecret, '/customers', {
      per_page: String(perPage ?? 50),
      ...(search && search.trim() ? { search: search.trim() } : {}),
    });

    const customers = Array.isArray(data) ? data : [];
    const options = customers
      .filter((c: any) => c && c.id)
      .map((c: any) => ({ value: String(c.id), label: String(c.email || c.username || c.id) }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[WooCommerce Options] customers error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load WooCommerce customers' });
  }
});

export default woocommerceOptionsRouter;
