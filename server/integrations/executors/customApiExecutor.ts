import { z } from 'zod';

const authSchema = z.object({
  baseUrl: z.string().min(1),
  headers: z.any().optional(),
});

export type CustomApiExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function parseHeaders(raw: any): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) out[String(k)] = String(v);
    return out;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseHeaders(parsed);
    } catch {
      return {};
    }
  }
  return {};
}

function joinUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export async function executeCustomApiAction(input: CustomApiExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { baseUrl, headers: defaultHeadersRaw } = authSchema.parse({
    baseUrl: credential.baseUrl,
    headers: credential.headers,
  });

  if (actionId !== 'request') {
    return { status: 'skipped', reason: `Custom API action not implemented: ${actionId}` };
  }

  const path = String(config.path || '').trim();
  const method = String(config.method || 'GET').toUpperCase();
  if (!path) throw new Error('Custom API request requires path');

  const url = new URL(joinUrl(baseUrl, path));

  const queryObj = config.query;
  if (queryObj && typeof queryObj === 'object' && !Array.isArray(queryObj)) {
    for (const [k, v] of Object.entries(queryObj)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(String(k), String(v));
    }
  }

  const headers = {
    ...parseHeaders(defaultHeadersRaw),
    ...parseHeaders(config.headers),
  };

  const hasBody = !['GET', 'HEAD'].includes(method);
  let body: string | undefined = undefined;
  if (hasBody && config.body !== undefined) {
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    body = typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    data,
    url: url.toString(),
  };
}
