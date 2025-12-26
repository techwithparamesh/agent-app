import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const baseSchema = z.object({
  accessToken: z.string().min(1),
  developerToken: z.string().min(1),
  loginCustomerId: z.string().optional(),
});

const campaignsSchema = baseSchema.extend({
  customerId: z.string().min(1),
});

function uniqByValue<T extends { value: string }>(options: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const opt of options) {
    if (!opt?.value) continue;
    if (seen.has(opt.value)) continue;
    seen.add(opt.value);
    out.push(opt);
  }
  return out;
}

function normalizeCustomerId(customerId: string) {
  // Google Ads customer IDs are often written with hyphens; API expects digits.
  return customerId.replace(/-/g, '').trim();
}

async function gadsFetchJson(url: string, init: RequestInit, accessToken: string, developerToken: string, loginCustomerId?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': developerToken,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (loginCustomerId) headers['login-customer-id'] = normalizeCustomerId(loginCustomerId);

  const res = await fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers as any),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Ads API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/google_ads/customers
// Body: { accessToken, developerToken, loginCustomerId? }
// Returns accessible customers as options.
router.post('/customers', async (req, res) => {
  try {
    const { accessToken, developerToken, loginCustomerId } = baseSchema.parse(req.body);

    const data: any = await gadsFetchJson(
      'https://googleads.googleapis.com/v17/customers:listAccessibleCustomers',
      { method: 'POST', body: JSON.stringify({}) },
      accessToken,
      developerToken,
      loginCustomerId,
    );

    const resourceNames = Array.isArray(data?.resourceNames) ? data.resourceNames : [];
    const options = resourceNames
      .filter((r: any) => typeof r === 'string' && r.startsWith('customers/'))
      .map((r: string) => {
        const id = r.split('/')[1] || r;
        return { value: normalizeCustomerId(id), label: normalizeCustomerId(id) };
      });

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Google Ads Options] customers error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Google Ads customers' });
  }
});

// POST /api/integrations/options/google_ads/campaigns
// Body: { accessToken, developerToken, loginCustomerId?, customerId }
// Returns campaigns for the selected customer.
router.post('/campaigns', async (req, res) => {
  try {
    const { accessToken, developerToken, loginCustomerId, customerId } = campaignsSchema.parse(req.body);
    const normalizedCustomerId = normalizeCustomerId(customerId);

    const query = 'SELECT campaign.id, campaign.name, campaign.status FROM campaign ORDER BY campaign.name';

    const data: any = await gadsFetchJson(
      `https://googleads.googleapis.com/v17/customers/${encodeURIComponent(normalizedCustomerId)}/googleAds:search`,
      {
        method: 'POST',
        body: JSON.stringify({
          query,
          pageSize: 1000,
        }),
      },
      accessToken,
      developerToken,
      loginCustomerId,
    );

    const results = Array.isArray(data?.results) ? data.results : [];

    const options = results
      .map((r: any) => {
        const campaign = r?.campaign;
        const id = campaign?.id != null ? String(campaign.id) : '';
        const name = typeof campaign?.name === 'string' ? campaign.name : '';
        const status = typeof campaign?.status === 'string' ? campaign.status : '';
        if (!id) return null;
        const label = status ? `${name || id} (${status})` : (name || id);
        return { value: id, label };
      })
      .filter(Boolean) as Array<{ value: string; label: string }>;

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Google Ads Options] campaigns error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Google Ads campaigns' });
  }
});

export default router;
