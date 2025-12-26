import { z } from 'zod';

const zendeskAuthSchema = z.object({
  subdomain: z.string().min(1),
  email: z.string().min(1),
  apiToken: z.string().min(1),
});

export type ZendeskExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function zendeskBaseUrl(subdomain: string) {
  return `https://${subdomain.trim()}.zendesk.com`;
}

function zendeskAuthHeader(email: string, apiToken: string) {
  const raw = `${email}/token:${apiToken}`;
  return `Basic ${Buffer.from(raw, 'utf8').toString('base64')}`;
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

async function zdRequestJson(url: string, authHeader: string, method: 'GET' | 'POST' | 'PUT', body?: any) {
  const res = await fetch(url, {
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
    throw new Error(`Zendesk API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeZendeskAction(input: ZendeskExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { subdomain, email, apiToken } = zendeskAuthSchema.parse({
    subdomain: credential.subdomain,
    email: credential.email,
    apiToken: credential.apiToken,
  });

  const baseUrl = zendeskBaseUrl(subdomain);
  const authHeader = zendeskAuthHeader(email, apiToken);

  if (actionId === 'create_ticket') {
    const subject = String(config.subject || '').trim();
    const description = String(config.description || '').trim();
    if (!subject) throw new Error('Zendesk create_ticket requires subject');
    if (!description) throw new Error('Zendesk create_ticket requires description');

    const ticket: any = {
      subject,
      comment: { body: description },
    };

    if (config.priority) ticket.priority = String(config.priority);
    if (config.type) ticket.type = String(config.type);
    if (config.requesterId != null && String(config.requesterId).length) ticket.requester_id = Number(config.requesterId);
    if (config.assigneeId != null && String(config.assigneeId).length) ticket.assignee_id = Number(config.assigneeId);
    if (config.groupId != null && String(config.groupId).length) ticket.group_id = Number(config.groupId);

    const tags = parseJsonMaybe(config.tags);
    if (Array.isArray(tags)) ticket.tags = tags;

    const customFields = parseJsonMaybe(config.customFields);
    if (customFields && typeof customFields === 'object') ticket.custom_fields = customFields;

    const data = await zdRequestJson(`${baseUrl}/api/v2/tickets.json`, authHeader, 'POST', { ticket });
    return { ok: true, ticket: data?.ticket, raw: data };
  }

  if (actionId === 'update_ticket') {
    const ticketId = Number(config.ticketId);
    if (!Number.isFinite(ticketId)) throw new Error('Zendesk update_ticket requires ticketId');

    const ticket: any = {};
    if (config.status) ticket.status = String(config.status);
    if (config.priority) ticket.priority = String(config.priority);
    if (config.assigneeId != null && String(config.assigneeId).length) ticket.assignee_id = Number(config.assigneeId);

    const tags = parseJsonMaybe(config.tags);
    if (Array.isArray(tags)) ticket.tags = tags;

    const data = await zdRequestJson(`${baseUrl}/api/v2/tickets/${encodeURIComponent(String(ticketId))}.json`, authHeader, 'PUT', { ticket });
    return { ok: true, ticket: data?.ticket, raw: data };
  }

  if (actionId === 'add_comment') {
    const ticketId = Number(config.ticketId);
    const bodyText = String(config.body || '').trim();
    if (!Number.isFinite(ticketId)) throw new Error('Zendesk add_comment requires ticketId');
    if (!bodyText) throw new Error('Zendesk add_comment requires body');

    const isPublic = config.isPublic !== undefined ? Boolean(config.isPublic) : true;

    const ticket: any = {
      comment: {
        body: bodyText,
        public: isPublic,
      },
    };

    if (config.authorId != null && String(config.authorId).length) ticket.comment.author_id = Number(config.authorId);

    const data = await zdRequestJson(`${baseUrl}/api/v2/tickets/${encodeURIComponent(String(ticketId))}.json`, authHeader, 'PUT', { ticket });
    return { ok: true, ticket: data?.ticket, raw: data };
  }

  if (actionId === 'search_tickets') {
    const query = String(config.query || '').trim();
    if (!query) throw new Error('Zendesk search_tickets requires query');

    const url = `${baseUrl}/api/v2/search.json?query=${encodeURIComponent(query)}`;
    const data = await zdRequestJson(url, authHeader, 'GET');
    return { ok: true, results: data?.results, count: data?.count, raw: data };
  }

  if (actionId === 'get_ticket') {
    const ticketId = Number(config.ticketId);
    if (!Number.isFinite(ticketId)) throw new Error('Zendesk get_ticket requires ticketId');

    const data = await zdRequestJson(`${baseUrl}/api/v2/tickets/${encodeURIComponent(String(ticketId))}.json`, authHeader, 'GET');
    return { ok: true, ticket: data?.ticket, raw: data };
  }

  return { status: 'skipped', reason: `Zendesk action not implemented: ${actionId}` };
}
