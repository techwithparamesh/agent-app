import { z } from 'zod';

const authSchema = z.object({
  baseUrl: z.string().min(1),
  apiKey: z.string().min(1),
});

export type LiveAgentExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function joinUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function laJson(baseUrl: string, apiKey: string, path: string, init?: RequestInit) {
  const res = await fetch(joinUrl(baseUrl, path), {
    ...init,
    headers: {
      // LiveAgent API auth varies by deployment; this is a best-effort header.
      apikey: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers || {}),
    } as any,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`LiveAgent API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeLiveAgentAction(input: LiveAgentExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { baseUrl, apiKey } = authSchema.parse({ baseUrl: credential.baseUrl, apiKey: credential.apiKey });

  if (actionId === 'create_ticket') {
    const subject = String(config.subject || '').trim();
    const message = String(config.message || '').trim();
    const email = config.email != null ? String(config.email).trim() : '';
    const priority = String(config.priority || 'normal').trim();

    if (!subject) throw new Error('LiveAgent create_ticket requires subject');
    if (!message) throw new Error('LiveAgent create_ticket requires message');

    // Best-effort payload; LiveAgent schemas can vary.
    const body: any = {
      subject,
      message,
      priority,
    };
    if (email) body.email = email;

    // Common v3 endpoint patterns: /tickets or /tickets/_create
    let data: any;
    try {
      data = await laJson(baseUrl, apiKey, '/tickets', { method: 'POST', body: JSON.stringify(body) });
    } catch (e) {
      // fallback path
      data = await laJson(baseUrl, apiKey, '/tickets/_create', { method: 'POST', body: JSON.stringify(body) });
    }

    return { ok: true, raw: data };
  }

  return { status: 'skipped', reason: `LiveAgent action not implemented: ${actionId}` };
}
