import { z } from 'zod';

const n8nAuthSchema = z.object({
  webhookUrl: z.string().min(1),
  authHeader: z.string().optional(),
});

export type N8nExecuteInput = {
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

async function fetchJsonOrText(res: Response) {
  const text = await res.text().catch(() => '');
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function executeN8nAction(input: N8nExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { webhookUrl, authHeader } = n8nAuthSchema.parse({
    webhookUrl: credential.webhookUrl,
    authHeader: credential.authHeader,
  });

  if (actionId === 'send_webhook') {
    const dataObj = parseJsonMaybe(config.data);
    if (dataObj === undefined) throw new Error('n8n send_webhook requires data (JSON)');

    const method = String(config.method || 'POST').toUpperCase() === 'GET' ? 'GET' : 'POST';

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(String(webhookUrl));
    } catch {
      throw new Error('n8n webhookUrl is not a valid URL');
    }

    if (method === 'GET') {
      if (dataObj && typeof dataObj === 'object' && !Array.isArray(dataObj)) {
        for (const [k, v] of Object.entries(dataObj)) {
          if (v === undefined || v === null) continue;
          parsedUrl.searchParams.set(String(k), typeof v === 'string' ? v : JSON.stringify(v));
        }
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (authHeader && String(authHeader).trim().length > 0) {
      headers.Authorization = String(authHeader).trim();
    }

    const res = await fetch(parsedUrl.toString(), {
      method,
      headers: {
        ...headers,
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      },
      body: method === 'POST' ? JSON.stringify(dataObj) : undefined,
    });

    const responseBody = await fetchJsonOrText(res);

    if (!res.ok) {
      throw new Error(`n8n webhook error ${res.status}: ${typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)}`);
    }

    return { ok: true, status: res.status, response: responseBody };
  }

  return { status: 'skipped', reason: `n8n action not implemented: ${actionId}` };
}
