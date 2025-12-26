import { z } from 'zod';

const restCredentialSchema = z.object({
  apiKey: z.string().min(1).optional(),
  headerName: z.string().min(1).optional(),
  token: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
});

export type RestApiExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

function toHeaderRecord(value: any): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (!k) continue;
    if (v === undefined || v === null) continue;
    out[String(k)] = typeof v === 'string' ? v : JSON.stringify(v);
  }
  return out;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function parseBody(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text().catch(() => '');
  if (contentType.includes('application/json')) {
    try {
      return { parsed: text ? JSON.parse(text) : null, text };
    } catch {
      return { parsed: text, text };
    }
  }
  return { parsed: text, text };
}

function applyAuthHeaders(headers: Record<string, string>, cred: z.infer<typeof restCredentialSchema> | null) {
  if (!cred) return;

  if (cred.apiKey) {
    const name = cred.headerName || 'X-API-Key';
    headers[name] = cred.apiKey;
    return;
  }

  if (cred.token) {
    headers['Authorization'] = `Bearer ${cred.token}`;
    return;
  }

  if (cred.username && cred.password) {
    const token = Buffer.from(`${cred.username}:${cred.password}`, 'utf8').toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  }
}

export async function executeRestApiAction(input: RestApiExecuteInput): Promise<any> {
  const { actionId, config } = input;
  const credential = input.credential ? restCredentialSchema.parse(input.credential) : null;

  if (actionId === 'http_request') {
    const urlRaw = String(config.url || '').trim();
    const method = String(config.method || 'GET').trim().toUpperCase();
    const headers = toHeaderRecord(config.headers);
    const queryParams = config.queryParams && typeof config.queryParams === 'object' ? config.queryParams : null;
    const body = config.body;
    const bodyType = String(config.bodyType || 'json').trim();
    const timeout = config.timeout !== undefined ? Number(config.timeout) : 30000;
    const followRedirects = config.followRedirects !== undefined ? Boolean(config.followRedirects) : true;

    if (!urlRaw) throw new Error('REST API http_request requires url');

    const url = new URL(urlRaw);
    if (queryParams) {
      for (const [k, v] of Object.entries(queryParams)) {
        if (v === undefined || v === null) continue;
        url.searchParams.set(String(k), typeof v === 'string' ? v : JSON.stringify(v));
      }
    }

    applyAuthHeaders(headers, credential);

    const init: RequestInit = {
      method,
      headers,
      redirect: followRedirects ? 'follow' : 'manual',
    };

    const canHaveBody = method !== 'GET' && method !== 'HEAD';
    if (canHaveBody && body !== undefined && body !== null) {
      if (bodyType === 'raw') {
        init.body = typeof body === 'string' ? body : JSON.stringify(body);
      } else if (bodyType === 'form') {
        const formObj = body && typeof body === 'object' ? body : {};
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(formObj)) {
          if (v === undefined || v === null) continue;
          params.set(String(k), typeof v === 'string' ? v : JSON.stringify(v));
        }
        if (!Object.keys(headers).some((h) => h.toLowerCase() === 'content-type')) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        init.body = params.toString();
      } else {
        if (!Object.keys(headers).some((h) => h.toLowerCase() === 'content-type')) {
          headers['Content-Type'] = 'application/json';
        }
        init.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
    }

    const res = await fetchWithTimeout(url.toString(), init, Number.isFinite(timeout) && timeout > 0 ? Math.trunc(timeout) : 30000);
    const { parsed, text } = await parseBody(res);

    const headersOut: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headersOut[k] = v;
    });

    if (!res.ok) {
      throw new Error(`REST API request failed ${res.status}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
    }

    return { ok: true, status: res.status, headers: headersOut, data: parsed, text };
  }

  return { status: 'skipped', message: `REST API action not implemented: ${actionId}` };
}
