import { z } from 'zod';

const supabaseAuthSchema = z.object({
  projectUrl: z.string().min(1),
  anonKey: z.string().min(1),
  serviceKey: z.string().optional(),
});

export type SupabaseExecuteInput = {
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

function normalizeBaseUrl(projectUrl: string) {
  const trimmed = projectUrl.trim().replace(/\/$/, '');
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Supabase projectUrl is not a valid URL');
  }
  return parsed.toString().replace(/\/$/, '');
}

async function supabaseRequest(baseUrl: string, apiKey: string, path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: any, extraHeaders?: Record<string, string>) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(extraHeaders || {}),
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
    throw new Error(`Supabase API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function appendMatchParams(url: URL, match: Record<string, any>) {
  for (const [k, v] of Object.entries(match)) {
    if (v === undefined || v === null) continue;
    url.searchParams.set(k, `eq.${typeof v === 'string' ? v : JSON.stringify(v)}`);
  }
}

export async function executeSupabaseAction(input: SupabaseExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { projectUrl, anonKey, serviceKey } = supabaseAuthSchema.parse({
    projectUrl: credential.projectUrl,
    anonKey: credential.anonKey,
    serviceKey: credential.serviceKey,
  });

  const baseUrl = normalizeBaseUrl(projectUrl);
  const apiKey = (serviceKey && serviceKey.trim().length > 0) ? serviceKey.trim() : anonKey.trim();

  if (actionId === 'insert_row') {
    const table = asString(config.table).trim();
    if (!table) throw new Error('Supabase insert_row requires table');

    const dataObj = parseJsonMaybe(config.data);
    if (!dataObj || typeof dataObj !== 'object' || Array.isArray(dataObj)) throw new Error('Supabase insert_row requires data (json object)');

    const returning = config.returning !== undefined ? Boolean(config.returning) : true;

    const url = new URL(`${baseUrl}/rest/v1/${encodeURIComponent(table)}`);
    if (returning) url.searchParams.set('select', '*');

    const data = await supabaseRequest(
      baseUrl,
      apiKey,
      `${url.pathname}${url.search}`,
      'POST',
      dataObj,
      { Prefer: returning ? 'return=representation' : 'return=minimal' },
    );

    return { ok: true, data };
  }

  if (actionId === 'update_rows') {
    const table = asString(config.table).trim();
    if (!table) throw new Error('Supabase update_rows requires table');

    const dataObj = parseJsonMaybe(config.data);
    if (!dataObj || typeof dataObj !== 'object' || Array.isArray(dataObj)) throw new Error('Supabase update_rows requires data (json object)');

    const matchObj = parseJsonMaybe(config.match);
    if (!matchObj || typeof matchObj !== 'object' || Array.isArray(matchObj)) throw new Error('Supabase update_rows requires match (json object)');

    const url = new URL(`${baseUrl}/rest/v1/${encodeURIComponent(table)}`);
    appendMatchParams(url, matchObj as any);
    url.searchParams.set('select', '*');

    const data = await supabaseRequest(
      baseUrl,
      apiKey,
      `${url.pathname}${url.search}`,
      'PATCH',
      dataObj,
      { Prefer: 'return=representation' },
    );

    return { ok: true, data };
  }

  if (actionId === 'select_rows') {
    const table = asString(config.table).trim();
    if (!table) throw new Error('Supabase select_rows requires table');

    const columns = asString(config.columns || '*').trim() || '*';
    const filterObj = parseJsonMaybe(config.filter);
    const order = asString(config.order).trim();
    const limit = config.limit != null ? Number(config.limit) : undefined;

    const url = new URL(`${baseUrl}/rest/v1/${encodeURIComponent(table)}`);
    url.searchParams.set('select', columns);

    if (filterObj && typeof filterObj === 'object' && !Array.isArray(filterObj)) {
      appendMatchParams(url, filterObj as any);
    }

    if (order) url.searchParams.set('order', order);
    if (Number.isFinite(limit as any)) url.searchParams.set('limit', String(limit));

    const data = await supabaseRequest(
      baseUrl,
      apiKey,
      `${url.pathname}${url.search}`,
      'GET',
    );

    return { ok: true, data };
  }

  if (actionId === 'delete_rows') {
    const table = asString(config.table).trim();
    if (!table) throw new Error('Supabase delete_rows requires table');

    const matchObj = parseJsonMaybe(config.match);
    if (!matchObj || typeof matchObj !== 'object' || Array.isArray(matchObj)) throw new Error('Supabase delete_rows requires match (json object)');

    const url = new URL(`${baseUrl}/rest/v1/${encodeURIComponent(table)}`);
    appendMatchParams(url, matchObj as any);

    const data = await supabaseRequest(
      baseUrl,
      apiKey,
      `${url.pathname}${url.search}`,
      'DELETE',
      undefined,
      { Prefer: 'return=representation' },
    );

    return { ok: true, data };
  }

  if (actionId === 'rpc') {
    const functionName = asString(config.functionName).trim();
    if (!functionName) throw new Error('Supabase rpc requires functionName');

    const paramsObj = parseJsonMaybe(config.params);
    if (paramsObj !== undefined && (typeof paramsObj !== 'object' || Array.isArray(paramsObj))) {
      throw new Error('Supabase rpc params must be a json object');
    }

    const data = await supabaseRequest(
      baseUrl,
      apiKey,
      `/rest/v1/rpc/${encodeURIComponent(functionName)}`,
      'POST',
      paramsObj || {},
    );

    return { ok: true, data };
  }

  return { status: 'skipped', reason: `Supabase action not implemented: ${actionId}` };
}
