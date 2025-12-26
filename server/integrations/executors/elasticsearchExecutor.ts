import { z } from 'zod';

const authSchema = z.object({
  baseUrl: z.string().min(1),
  apiKey: z.string().min(1),
});

export type ElasticsearchExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function joinUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function toIdSegment(id: any): string {
  return encodeURIComponent(String(id));
}

function parseJsonObject(raw: any, name: string): Record<string, any> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      // fallthrough
    }
  }
  throw new Error(`${name} must be a JSON object`);
}

async function esJson(baseUrl: string, apiKey: string, path: string, init?: RequestInit) {
  const res = await fetch(joinUrl(baseUrl, path), {
    ...init,
    headers: {
      Authorization: `ApiKey ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
    throw new Error(`Elasticsearch API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeElasticsearchAction(input: ElasticsearchExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { baseUrl, apiKey } = authSchema.parse({ baseUrl: credential.baseUrl, apiKey: credential.apiKey });

  if (actionId === 'index_document') {
    const index = String(config.index || '').trim();
    const id = config.id != null && String(config.id).trim().length ? String(config.id).trim() : '';
    if (!index) throw new Error('Elasticsearch index_document requires index');

    const document = parseJsonObject(config.document, 'document');

    const path = id
      ? `/${encodeURIComponent(index)}/_doc/${toIdSegment(id)}`
      : `/${encodeURIComponent(index)}/_doc`;

    const data = await esJson(baseUrl, apiKey, path, {
      method: 'POST',
      body: JSON.stringify(document),
    });

    return { ok: true, raw: data };
  }

  if (actionId === 'search') {
    const index = String(config.index || '').trim();
    if (!index) throw new Error('Elasticsearch search requires index');

    const queryObj = parseJsonObject(config.query, 'query');
    const size = config.size != null ? Number(config.size) : undefined;

    const body: any = { ...queryObj };
    if (size != null && Number.isFinite(size)) body.size = Math.trunc(size);

    const data = await esJson(baseUrl, apiKey, `/${encodeURIComponent(index)}/_search`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { ok: true, hits: data?.hits, raw: data };
  }

  return { status: 'skipped', reason: `Elasticsearch action not implemented: ${actionId}` };
}
