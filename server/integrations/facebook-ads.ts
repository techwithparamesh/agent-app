import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const tokenSchema = z.object({
  accessToken: z.string().min(1),
});

const campaignsSchema = tokenSchema.extend({
  accountId: z.string().min(1),
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

async function fbGetJson(url: string, accessToken: string) {
  const u = new URL(url);
  if (!u.searchParams.has('access_token')) {
    u.searchParams.set('access_token', accessToken);
  }

  const res = await fetch(u.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Facebook API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

function normalizeAdAccountId(accountId: string) {
  const trimmed = accountId.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('act_')) return trimmed;
  // Accept numeric account ids and normalize to Graph API format
  if (/^\d+$/.test(trimmed)) return `act_${trimmed}`;
  return trimmed;
}

// POST /api/integrations/options/facebook_ads/accounts
// Body: { accessToken }
router.post('/accounts', async (req, res) => {
  try {
    const { accessToken } = tokenSchema.parse(req.body);

    const options: Array<{ value: string; label: string; description?: string }> = [];

    let after: string | undefined = undefined;
    let guard = 0;

    while (guard < 10) {
      guard += 1;

      const url = new URL('https://graph.facebook.com/v20.0/me/adaccounts');
      url.searchParams.set('fields', 'id,name,account_id');
      url.searchParams.set('limit', '100');
      if (after) url.searchParams.set('after', after);

      const data: any = await fbGetJson(url.toString(), accessToken);
      const items = Array.isArray(data?.data) ? data.data : [];

      for (const a of items) {
        const id = typeof a?.id === 'string' ? a.id : '';
        const name = typeof a?.name === 'string' ? a.name : '';
        const accountNumeric = a?.account_id != null ? String(a.account_id) : '';

        if (!id) continue;

        const labelParts = [name || id];
        if (accountNumeric) labelParts.push(`(${accountNumeric})`);
        const label = labelParts.join(' ');

        options.push({ value: id, label });
      }

      after = typeof data?.paging?.cursors?.after === 'string' ? data.paging.cursors.after : undefined;
      const hasNext = Boolean(data?.paging?.next);
      if (!hasNext || !after) break;
    }

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Facebook Ads Options] accounts error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Facebook ad accounts' });
  }
});

// POST /api/integrations/options/facebook_ads/campaigns
// Body: { accessToken, accountId }
router.post('/campaigns', async (req, res) => {
  try {
    const { accessToken, accountId } = campaignsSchema.parse(req.body);
    const normalizedAccountId = normalizeAdAccountId(accountId);

    const options: Array<{ value: string; label: string; description?: string }> = [];

    let after: string | undefined = undefined;
    let guard = 0;

    while (guard < 10) {
      guard += 1;

      const url = new URL(`https://graph.facebook.com/v20.0/${encodeURIComponent(normalizedAccountId)}/campaigns`);
      url.searchParams.set('fields', 'id,name,status');
      url.searchParams.set('limit', '100');
      if (after) url.searchParams.set('after', after);

      const data: any = await fbGetJson(url.toString(), accessToken);
      const items = Array.isArray(data?.data) ? data.data : [];

      for (const c of items) {
        const id = typeof c?.id === 'string' ? c.id : '';
        const name = typeof c?.name === 'string' ? c.name : '';
        const status = typeof c?.status === 'string' ? c.status : '';
        if (!id) continue;

        const label = status ? `${name || id} (${status})` : (name || id);
        options.push({ value: id, label });
      }

      after = typeof data?.paging?.cursors?.after === 'string' ? data.paging.cursors.after : undefined;
      const hasNext = Boolean(data?.paging?.next);
      if (!hasNext || !after) break;
    }

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Facebook Ads Options] campaigns error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Facebook campaigns' });
  }
});

export default router;
