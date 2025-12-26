import { z } from 'zod';

const fbAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type FacebookAdsExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function fbJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
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
    throw new Error(`Facebook Ads API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  // Graph API sometimes returns 200 with an error payload
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(`Facebook Ads API error: ${JSON.stringify((data as any).error)}`);
  }

  return data;
}

function buildGraphUrl(path: string, params: Record<string, string>) {
  const u = new URL(`https://graph.facebook.com/v18.0/${path.replace(/^\//, '')}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

export async function executeFacebookAdsAction(input: FacebookAdsExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = fbAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'get_campaigns') {
    const adAccountId = String(config.adAccountId || '').trim();
    if (!adAccountId) throw new Error('Facebook Ads get_campaigns requires adAccountId');

    const fields = String(config.fields || 'id,name,status,objective,effective_status').trim();
    const limit = String(config.limit || '50');

    const url = buildGraphUrl(`${encodeURIComponent(adAccountId)}/campaigns`, {
      access_token: accessToken,
      fields,
      limit,
    });

    const data = await fbJson(accessToken, url);
    return { ok: true, campaigns: data?.data ?? [], paging: data?.paging, raw: data };
  }

  if (actionId === 'get_insights') {
    const objectId = String(config.objectId || config.adAccountId || '').trim();
    if (!objectId) throw new Error('Facebook Ads get_insights requires objectId (or adAccountId)');

    const fields = String(config.fields || 'impressions,clicks,spend,ctr,cpc,cpm,actions').trim();
    const datePreset = String(config.datePreset || 'last_30d').trim();
    const level = String(config.level || 'campaign').trim();
    const limit = String(config.limit || '50');

    const url = buildGraphUrl(`${encodeURIComponent(objectId)}/insights`, {
      access_token: accessToken,
      fields,
      date_preset: datePreset,
      level,
      limit,
    });

    const data = await fbJson(accessToken, url);
    return { ok: true, insights: data?.data ?? [], paging: data?.paging, raw: data };
  }

  if (actionId === 'update_campaign') {
    const campaignId = String(config.campaignId || '').trim();
    if (!campaignId) throw new Error('Facebook Ads update_campaign requires campaignId');

    const body: Record<string, any> = { access_token: accessToken };
    if (config.status) body.status = String(config.status);
    if (config.name) body.name = String(config.name);

    const url = `https://graph.facebook.com/v18.0/${encodeURIComponent(campaignId)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text().catch(() => '');
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok || (data && typeof data === 'object' && 'error' in data)) {
      throw new Error(`Facebook Ads update_campaign error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }

    return { ok: true, result: data, raw: data };
  }

  return { status: 'skipped', message: `Facebook Ads action not implemented: ${actionId}` };
}
