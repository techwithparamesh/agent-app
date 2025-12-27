import { z } from 'zod';

const googleAdsAuthSchema = z.object({
  developerToken: z.string().min(1),
  accessToken: z.string().min(1),
});

export type GoogleAdsExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function googleAdsFetch(
  credential: { developerToken: string; accessToken: string; loginCustomerId?: string },
  url: string,
  init?: RequestInit,
) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${credential.accessToken}`,
    'developer-token': credential.developerToken,
  };

  const loginId = credential.loginCustomerId || (init as any)?.loginCustomerId;
  if (loginId) headers['login-customer-id'] = String(loginId);

  if (init?.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    ...init,
    headers: {
      ...headers,
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
    throw new Error(`Google Ads API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  // API can also respond with error payload
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(`Google Ads API error: ${JSON.stringify((data as any).error)}`);
  }

  return data;
}

function buildGaqlReportQuery(config: Record<string, any>) {
  const resource = String(config.resource || 'campaign').trim();
  const fields = Array.isArray(config.fields)
    ? config.fields.map(String).filter(Boolean)
    : String(config.fields || 'campaign.id,campaign.name,campaign.status').split(',').map((s) => s.trim()).filter(Boolean);

  const where = String(config.where || '').trim();
  const limit = Number(config.limit || 100);

  const select = fields.join(', ');
  let q = `SELECT ${select} FROM ${resource}`;
  if (where) q += ` WHERE ${where}`;
  if (Number.isFinite(limit) && limit > 0) q += ` LIMIT ${limit}`;
  return q;
}

export async function executeGoogleAdsAction(input: GoogleAdsExecuteInput): Promise<any> {
  const { actionId, config, credential: rawCredential } = input;

  const parsed = googleAdsAuthSchema.parse({
    developerToken: rawCredential.developerToken,
    accessToken: rawCredential.accessToken,
  });

  const credential = {
    ...parsed,
    loginCustomerId: rawCredential.loginCustomerId ? String(rawCredential.loginCustomerId) : undefined,
  };

  const customerId = String(config.customerId || '').trim();

  async function resolveCampaignBudgetResourceName(campaignId: string): Promise<string> {
    const gaql = `SELECT campaign_budget.resource_name FROM campaign WHERE campaign.id = ${Number(campaignId)}`;
    const data = await googleAdsFetch(
      credential,
      `https://googleads.googleapis.com/v16/customers/${encodeURIComponent(customerId)}/googleAds:searchStream`,
      { method: 'POST', body: JSON.stringify({ query: gaql }) },
    );

    // searchStream returns an array of response chunks
    const chunks = Array.isArray(data) ? data : [];
    for (const chunk of chunks) {
      const results = Array.isArray((chunk as any)?.results) ? (chunk as any).results : [];
      for (const r of results) {
        const rn = (r as any)?.campaignBudget?.resourceName;
        if (typeof rn === 'string' && rn.trim()) return rn.trim();
      }
    }

    throw new Error('Google Ads could not resolve campaign budget resource name for campaignId');
  }

  if (actionId === 'get_campaigns') {
    if (!customerId) throw new Error('Google Ads get_campaigns requires customerId');

    const gaql = `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type FROM campaign ORDER BY campaign.id DESC LIMIT ${Number(config.limit || 50)}`;
    const data = await googleAdsFetch(
      credential,
      `https://googleads.googleapis.com/v16/customers/${encodeURIComponent(customerId)}/googleAds:searchStream`,
      { method: 'POST', body: JSON.stringify({ query: gaql }) },
    );

    return { ok: true, results: data, raw: data };
  }

  if (actionId === 'get_report') {
    if (!customerId) throw new Error('Google Ads get_report requires customerId');

    const gaql = buildGaqlReportQuery(config);
    const data = await googleAdsFetch(
      credential,
      `https://googleads.googleapis.com/v16/customers/${encodeURIComponent(customerId)}/googleAds:searchStream`,
      { method: 'POST', body: JSON.stringify({ query: gaql }) },
    );

    return { ok: true, query: gaql, results: data, raw: data };
  }

  if (actionId === 'update_campaign_budget') {
    if (!customerId) throw new Error('Google Ads update_campaign_budget requires customerId');

    // UI provides campaignId + budgetAmountMicros.
    // Backend also supports direct campaignBudgetResourceName + amountMicros.
    const campaignId = String(config.campaignId || '').trim();
    const campaignBudgetResourceNameRaw = String((config as any).campaignBudgetResourceName || '').trim();
    const amountMicros = (config as any).amountMicros ?? config.budgetAmountMicros;

    if (amountMicros === undefined || amountMicros === null || amountMicros === '') {
      throw new Error('Google Ads update_campaign_budget requires budgetAmountMicros (or amountMicros)');
    }

    const campaignBudgetResourceName = campaignBudgetResourceNameRaw
      ? campaignBudgetResourceNameRaw
      : campaignId
        ? await resolveCampaignBudgetResourceName(campaignId)
        : '';

    if (!campaignBudgetResourceName) {
      throw new Error('Google Ads update_campaign_budget requires campaignId or campaignBudgetResourceName');
    }

    const body = {
      operations: [
        {
          update: {
            resourceName: campaignBudgetResourceName,
            amountMicros: String(amountMicros),
          },
          updateMask: 'amount_micros',
        },
      ],
    };

    const data = await googleAdsFetch(
      credential,
      `https://googleads.googleapis.com/v16/customers/${encodeURIComponent(customerId)}/campaignBudgets:mutate`,
      { method: 'POST', body: JSON.stringify(body) },
    );

    return { ok: true, result: data, raw: data };
  }

  if (actionId === 'update_campaign_status') {
    if (!customerId) throw new Error('Google Ads update_campaign_status requires customerId');

    const campaignResourceName = String(
      (config as any).campaignResourceName ||
        (config.campaignId ? `customers/${customerId}/campaigns/${String(config.campaignId).trim()}` : '')
    ).trim();
    const status = String(config.status || '').trim();

    if (!campaignResourceName) throw new Error('Google Ads update_campaign_status requires campaignResourceName');
    if (!status) throw new Error('Google Ads update_campaign_status requires status');

    const body = {
      operations: [
        {
          update: {
            resourceName: campaignResourceName,
            status,
          },
          updateMask: 'status',
        },
      ],
    };

    const data = await googleAdsFetch(
      credential,
      `https://googleads.googleapis.com/v16/customers/${encodeURIComponent(customerId)}/campaigns:mutate`,
      { method: 'POST', body: JSON.stringify(body) },
    );

    return { ok: true, result: data, raw: data };
  }

  return { status: 'skipped', message: `Google Ads action not implemented: ${actionId}` };
}
