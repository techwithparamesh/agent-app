import { z } from 'zod';

const freshdeskAuthSchema = z.object({
  domain: z.string().min(1),
  apiKey: z.string().min(1),
});

export type FreshdeskExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function normalizeDomain(domain: string) {
  const d = domain.trim();
  if (!d) return d;
  if (d.startsWith('http://') || d.startsWith('https://')) return d;
  return `https://${d}`;
}

function fdAuthHeader(apiKey: string) {
  const auth = Buffer.from(`${apiKey}:X`, 'utf8').toString('base64');
  return `Basic ${auth}`;
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

async function fdRequestJson(baseUrl: string, path: string, authHeader: string, method: 'GET' | 'POST' | 'PUT', body?: any) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: authHeader,
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
    throw new Error(`Freshdesk API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeFreshdeskAction(input: FreshdeskExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { domain, apiKey } = freshdeskAuthSchema.parse({ domain: credential.domain, apiKey: credential.apiKey });

  const baseUrl = normalizeDomain(domain);
  const authHeader = fdAuthHeader(apiKey);

  if (actionId === 'create_ticket') {
    const subject = String(config.subject || '').trim();
    const description = String(config.description || '').trim();
    const email = String(config.email || '').trim();
    if (!subject) throw new Error('Freshdesk create_ticket requires subject');
    if (!description) throw new Error('Freshdesk create_ticket requires description');
    if (!email) throw new Error('Freshdesk create_ticket requires email');

    const body: any = {
      subject,
      description,
      email,
      ...(config.priority != null ? { priority: Number(config.priority) } : {}),
      ...(config.status != null ? { status: Number(config.status) } : {}),
      ...(config.type ? { type: String(config.type) } : {}),
    };

    const tags = parseJsonMaybe(config.tags);
    if (Array.isArray(tags)) body.tags = tags;

    const data = await fdRequestJson(baseUrl, '/api/v2/tickets', authHeader, 'POST', body);
    return { ok: true, ticket: data };
  }

  if (actionId === 'update_ticket') {
    const ticketId = Number(config.ticketId);
    if (!Number.isFinite(ticketId)) throw new Error('Freshdesk update_ticket requires ticketId');

    const body: any = {};
    if (config.status != null && String(config.status).length) body.status = Number(config.status);
    if (config.priority != null && String(config.priority).length) body.priority = Number(config.priority);
    if (config.agentId != null && String(config.agentId).length) body.responder_id = Number(config.agentId);
    if (config.groupId != null && String(config.groupId).length) body.group_id = Number(config.groupId);

    const data = await fdRequestJson(baseUrl, `/api/v2/tickets/${encodeURIComponent(String(ticketId))}`, authHeader, 'PUT', body);
    return { ok: true, ticket: data };
  }

  if (actionId === 'add_note') {
    const ticketId = Number(config.ticketId);
    const bodyText = String(config.body || '').trim();
    if (!Number.isFinite(ticketId)) throw new Error('Freshdesk add_note requires ticketId');
    if (!bodyText) throw new Error('Freshdesk add_note requires body');

    const isPrivate = config.isPrivate !== undefined ? Boolean(config.isPrivate) : true;

    const data = await fdRequestJson(
      baseUrl,
      `/api/v2/tickets/${encodeURIComponent(String(ticketId))}/notes`,
      authHeader,
      'POST',
      { body: bodyText, private: isPrivate },
    );

    return { ok: true, note: data };
  }

  if (actionId === 'reply_ticket') {
    const ticketId = Number(config.ticketId);
    const bodyText = String(config.body || '').trim();
    if (!Number.isFinite(ticketId)) throw new Error('Freshdesk reply_ticket requires ticketId');
    if (!bodyText) throw new Error('Freshdesk reply_ticket requires body');

    const data = await fdRequestJson(
      baseUrl,
      `/api/v2/tickets/${encodeURIComponent(String(ticketId))}/reply`,
      authHeader,
      'POST',
      { body: bodyText },
    );

    return { ok: true, reply: data };
  }

  if (actionId === 'create_contact') {
    const name = String(config.name || '').trim();
    const email = String(config.email || '').trim();
    if (!name) throw new Error('Freshdesk create_contact requires name');
    if (!email) throw new Error('Freshdesk create_contact requires email');

    const body: any = {
      name,
      email,
      ...(config.phone ? { phone: String(config.phone) } : {}),
      ...(config.description ? { description: String(config.description) } : {}),
    };

    const data = await fdRequestJson(baseUrl, '/api/v2/contacts', authHeader, 'POST', body);
    return { ok: true, contact: data };
  }

  return { status: 'skipped', reason: `Freshdesk action not implemented: ${actionId}` };
}
