import { z } from 'zod';

const airtableAuthSchema = z.object({
  apiKey: z.string().min(1),
});

export type AirtableExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function asString(value: any) {
  return value == null ? '' : String(value);
}

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

function buildQuery(params: Record<string, any>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

async function airtableRequestJson(path: string, apiKey: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: any) {
  const res = await fetch(`https://api.airtable.com/v0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
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
    throw new Error(`Airtable API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeAirtableAction(input: AirtableExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey } = airtableAuthSchema.parse({ apiKey: credential.apiKey });

  const baseId = asString(config.baseId).trim();
  const tableId = asString(config.tableId).trim();

  if (actionId === 'create_record') {
    if (!baseId) throw new Error('Airtable create_record requires baseId');
    if (!tableId) throw new Error('Airtable create_record requires tableId');
    const fields = parseJsonMaybe(config.fields);
    if (!fields || typeof fields !== 'object') throw new Error('Airtable create_record requires fields (json object)');

    const data = await airtableRequestJson(
      `/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`,
      apiKey,
      'POST',
      { fields },
    );

    return { ok: true, record: data, raw: data };
  }

  if (actionId === 'update_record') {
    if (!baseId) throw new Error('Airtable update_record requires baseId');
    if (!tableId) throw new Error('Airtable update_record requires tableId');
    const recordId = asString(config.recordId).trim();
    if (!recordId) throw new Error('Airtable update_record requires recordId');
    const fields = parseJsonMaybe(config.fields);
    if (!fields || typeof fields !== 'object') throw new Error('Airtable update_record requires fields (json object)');

    const data = await airtableRequestJson(
      `/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}/${encodeURIComponent(recordId)}`,
      apiKey,
      'PATCH',
      { fields },
    );

    return { ok: true, record: data, raw: data };
  }

  if (actionId === 'get_record') {
    if (!baseId) throw new Error('Airtable get_record requires baseId');
    if (!tableId) throw new Error('Airtable get_record requires tableId');
    const recordId = asString(config.recordId).trim();
    if (!recordId) throw new Error('Airtable get_record requires recordId');

    const data = await airtableRequestJson(
      `/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}/${encodeURIComponent(recordId)}`,
      apiKey,
      'GET',
    );

    return { ok: true, record: data, raw: data };
  }

  if (actionId === 'list_records') {
    if (!baseId) throw new Error('Airtable list_records requires baseId');
    if (!tableId) throw new Error('Airtable list_records requires tableId');

    const maxRecords = config.maxRecords != null ? Number(config.maxRecords) : undefined;
    const viewId = asString(config.viewId).trim();
    const filterByFormula = asString(config.filterByFormula).trim();

    const sort = parseJsonMaybe(config.sort);
    const query: Record<string, any> = {
      ...(viewId ? { view: viewId } : {}),
      ...(filterByFormula ? { filterByFormula } : {}),
      ...(Number.isFinite(maxRecords) ? { maxRecords: Math.trunc(maxRecords as number) } : {}),
    };

    if (Array.isArray(sort)) {
      // Airtable expects sort[0][field], sort[0][direction] style.
      sort.forEach((s: any, idx: number) => {
        if (!s) return;
        if (s.field) query[`sort[${idx}][field]`] = s.field;
        if (s.direction) query[`sort[${idx}][direction]`] = s.direction;
      });
    }

    const data = await airtableRequestJson(
      `/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}${buildQuery(query)}`,
      apiKey,
      'GET',
    );

    return { ok: true, records: data?.records, offset: data?.offset, raw: data };
  }

  if (actionId === 'delete_record') {
    if (!baseId) throw new Error('Airtable delete_record requires baseId');
    if (!tableId) throw new Error('Airtable delete_record requires tableId');
    const recordId = asString(config.recordId).trim();
    if (!recordId) throw new Error('Airtable delete_record requires recordId');

    const data = await airtableRequestJson(
      `/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}/${encodeURIComponent(recordId)}`,
      apiKey,
      'DELETE',
    );

    return { ok: true, result: data, raw: data };
  }

  return { status: 'skipped', reason: `Airtable action not implemented: ${actionId}` };
}
