import { z } from 'zod';

const zohoAuthSchema = z.object({
  accessToken: z.string().min(1),
  apiDomain: z.string().min(1).optional(),
});

export type ZohoCrmExecuteInput = {
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

function normalizeApiDomain(domain: string) {
  const d = domain.trim().replace(/\/$/, '');
  if (d.startsWith('http://') || d.startsWith('https://')) return d;
  return `https://${d}`;
}

async function zohoJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
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
    throw new Error(`Zoho CRM API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  // Zoho errors can be embedded even with 200s; keep simple.
  return data;
}

export async function executeZohoCrmAction(input: ZohoCrmExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken, apiDomain } = zohoAuthSchema.parse({
    accessToken: credential.accessToken,
    apiDomain: credential.apiDomain,
  });

  const base = `${normalizeApiDomain(apiDomain || 'https://www.zohoapis.com')}/crm/v2`;

  if (actionId === 'create_record') {
    const module = String(config.module || '').trim();
    const dataObj = parseJsonMaybe(config.data);
    if (!module) throw new Error('Zoho CRM create_record requires module');
    if (!dataObj || typeof dataObj !== 'object') throw new Error('Zoho CRM create_record requires data (JSON object)');

    const body = { data: [dataObj] };
    const resp = await zohoJson(accessToken, `${base}/${encodeURIComponent(module)}`, { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, result: resp, raw: resp };
  }

  if (actionId === 'update_record') {
    const module = String(config.module || '').trim();
    const recordId = String(config.recordId || '').trim();
    const dataObj = parseJsonMaybe(config.data);
    if (!module) throw new Error('Zoho CRM update_record requires module');
    if (!recordId) throw new Error('Zoho CRM update_record requires recordId');
    if (!dataObj || typeof dataObj !== 'object') throw new Error('Zoho CRM update_record requires data (JSON object)');

    const body = { data: [dataObj] };
    const resp = await zohoJson(
      accessToken,
      `${base}/${encodeURIComponent(module)}/${encodeURIComponent(recordId)}`,
      { method: 'PUT', body: JSON.stringify(body) }
    );

    return { ok: true, result: resp, raw: resp };
  }

  if (actionId === 'search_records') {
    const module = String(config.module || '').trim();
    const criteria = String(config.criteria || '').trim();
    if (!module) throw new Error('Zoho CRM search_records requires module');
    if (!criteria) throw new Error('Zoho CRM search_records requires criteria');

    const url = new URL(`${base}/${encodeURIComponent(module)}/search`);
    url.searchParams.set('criteria', criteria);

    const resp = await zohoJson(accessToken, url.toString(), { method: 'GET' });
    return { ok: true, records: resp?.data, raw: resp };
  }

  return { status: 'skipped', reason: `Zoho CRM action not implemented: ${actionId}` };
}
