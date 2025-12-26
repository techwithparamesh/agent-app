import { z } from 'zod';

const webhookCredentialSchema = z.object({
  headers: z.record(z.any()).optional(),
});

export type WebhookExecuteInput = {
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

export async function executeWebhookAction(input: WebhookExecuteInput): Promise<any> {
  const { actionId, config } = input;
  const credential = input.credential ? webhookCredentialSchema.parse(input.credential) : null;

  if (actionId === 'send_webhook') {
    const url = String(config.url || '').trim();
    const method = String(config.method || 'POST').trim().toUpperCase();
    const headers = toHeaderRecord(config.headers);
    const body = config.body;
    const timeout = config.timeout !== undefined ? Number(config.timeout) : 30000;
    const retries = config.retries !== undefined ? Number(config.retries) : 0;

    if (!url) throw new Error('Webhook send_webhook requires url');

    const credHeaders = toHeaderRecord(credential?.headers);
    const mergedHeaders: Record<string, string> = { ...credHeaders, ...headers };

    const hasBody = body !== undefined && body !== null && method !== 'GET' && method !== 'HEAD';
    const init: RequestInit = { method, headers: mergedHeaders };

    if (hasBody) {
      if (!Object.keys(mergedHeaders).some((h) => h.toLowerCase() === 'content-type')) {
        mergedHeaders['Content-Type'] = 'application/json';
      }
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const attemptCount = Number.isFinite(retries) && retries > 0 ? Math.min(10, Math.trunc(retries) + 1) : 1;
    let lastError: any = null;

    for (let i = 0; i < attemptCount; i++) {
      try {
        const res = await fetchWithTimeout(url, init, Number.isFinite(timeout) && timeout > 0 ? Math.trunc(timeout) : 30000);
        const { parsed, text } = await parseBody(res);

        const headersOut: Record<string, string> = {};
        res.headers.forEach((v, k) => {
          headersOut[k] = v;
        });

        if (!res.ok) {
          throw new Error(`Webhook request failed ${res.status}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
        }

        return {
          ok: true,
          status: res.status,
          headers: headersOut,
          data: parsed,
          text,
        };
      } catch (err: any) {
        lastError = err;
        if (i === attemptCount - 1) break;
      }
    }

    throw lastError || new Error('Webhook request failed');
  }

  return { status: 'skipped', message: `Webhook action not implemented: ${actionId}` };
}
