import { z } from 'zod';

const salesforceAuthSchema = z.object({
  accessToken: z.string().min(1),
  instanceUrl: z.string().min(1),
  apiVersion: z.string().min(1).optional(),
});

export type SalesforceExecuteInput = {
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

function normalizeInstanceUrl(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

async function sfJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    throw new Error(`Salesforce API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeSalesforceAction(input: SalesforceExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken, instanceUrl, apiVersion } = salesforceAuthSchema.parse({
    accessToken: credential.accessToken,
    instanceUrl: credential.instanceUrl || credential.instanceURL || credential.baseUrl,
    apiVersion: credential.apiVersion,
  });

  const version = String(config.apiVersion || apiVersion || 'v59.0');
  const base = `${normalizeInstanceUrl(instanceUrl)}/services/data/${version}`;

  if (actionId === 'create_record') {
    const object = String(config.object || '').trim();
    const fields = parseJsonMaybe(config.fields);
    if (!object) throw new Error('Salesforce create_record requires object');
    if (!fields || typeof fields !== 'object') throw new Error('Salesforce create_record requires fields (JSON object)');

    const data = await sfJson(accessToken, `${base}/sobjects/${encodeURIComponent(object)}/`, {
      method: 'POST',
      body: JSON.stringify(fields),
    });

    return { ok: true, result: data, raw: data };
  }

  if (actionId === 'update_record') {
    const object = String(config.object || '').trim();
    const recordId = String(config.recordId || '').trim();
    const fields = parseJsonMaybe(config.fields);
    if (!object) throw new Error('Salesforce update_record requires object');
    if (!recordId) throw new Error('Salesforce update_record requires recordId');
    if (!fields || typeof fields !== 'object') throw new Error('Salesforce update_record requires fields (JSON object)');

    await sfJson(accessToken, `${base}/sobjects/${encodeURIComponent(object)}/${encodeURIComponent(recordId)}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });

    return { ok: true, updated: true, recordId };
  }

  if (actionId === 'get_record') {
    const object = String(config.object || '').trim();
    const recordId = String(config.recordId || '').trim();
    if (!object) throw new Error('Salesforce get_record requires object');
    if (!recordId) throw new Error('Salesforce get_record requires recordId');

    const data = await sfJson(accessToken, `${base}/sobjects/${encodeURIComponent(object)}/${encodeURIComponent(recordId)}`, {
      method: 'GET',
    });

    const fieldsArrRaw = parseJsonMaybe(config.fields);
    const fieldsArr = Array.isArray(fieldsArrRaw) ? fieldsArrRaw.map((f: any) => String(f)).filter(Boolean) : null;

    if (fieldsArr && fieldsArr.length) {
      const filtered: any = { Id: data?.Id || recordId };
      for (const f of fieldsArr) filtered[f] = data?.[f];
      return { ok: true, record: filtered, raw: data };
    }

    return { ok: true, record: data, raw: data };
  }

  if (actionId === 'query') {
    const soql = String(config.query || '').trim();
    if (!soql) throw new Error('Salesforce query requires query');

    const url = new URL(`${base}/query`);
    url.searchParams.set('q', soql);

    const data = await sfJson(accessToken, url.toString(), { method: 'GET' });
    return { ok: true, records: data?.records, raw: data };
  }

  if (actionId === 'delete_record') {
    const object = String(config.object || '').trim();
    const recordId = String(config.recordId || '').trim();
    if (!object) throw new Error('Salesforce delete_record requires object');
    if (!recordId) throw new Error('Salesforce delete_record requires recordId');

    await sfJson(accessToken, `${base}/sobjects/${encodeURIComponent(object)}/${encodeURIComponent(recordId)}`, {
      method: 'DELETE',
    });

    return { ok: true, deleted: true, recordId };
  }

  return { status: 'skipped', reason: `Salesforce action not implemented: ${actionId}` };
}
