import crypto from 'crypto';
import { z } from 'zod';

const mailchimpAuthSchema = z.object({
  apiKey: z.string().min(1),
});

export type MailchimpExecuteInput = {
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

function getDatacenter(apiKey: string) {
  const parts = apiKey.split('-');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function subscriberHash(email: string) {
  return crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
}

function mailchimpAuthHeader(apiKey: string) {
  // Username can be any string.
  return `Basic ${Buffer.from(`anystring:${apiKey}`, 'utf8').toString('base64')}`;
}

async function mcRequestJson(apiKey: string, path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any) {
  const dc = getDatacenter(apiKey);
  if (!dc) throw new Error('Mailchimp API key must include datacenter suffix like "xxxx-us1"');

  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0${path}`, {
    method,
    headers: {
      Authorization: mailchimpAuthHeader(apiKey),
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
    throw new Error(`Mailchimp API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeMailchimpAction(input: MailchimpExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey } = mailchimpAuthSchema.parse({ apiKey: credential.apiKey });

  if (actionId === 'add_subscriber') {
    const listId = String(config.listId || '').trim();
    const email = String(config.email || '').trim();
    const status = String(config.status || '').trim();
    if (!listId) throw new Error('Mailchimp add_subscriber requires listId');
    if (!email) throw new Error('Mailchimp add_subscriber requires email');
    if (!status) throw new Error('Mailchimp add_subscriber requires status');

    const mergeFields = parseJsonMaybe(config.mergeFields);

    const body: any = {
      email_address: email,
      status_if_new: status,
      status,
      ...(config.firstName || config.lastName || mergeFields ? { merge_fields: { ...(config.firstName ? { FNAME: String(config.firstName) } : {}), ...(config.lastName ? { LNAME: String(config.lastName) } : {}), ...(mergeFields && typeof mergeFields === 'object' ? mergeFields : {}) } } : {}),
    };

    const tags = parseJsonMaybe(config.tags);
    const member = await mcRequestJson(apiKey, `/lists/${encodeURIComponent(listId)}/members/${subscriberHash(email)}`, 'PUT', body);

    if (Array.isArray(tags) && tags.length) {
      await mcRequestJson(apiKey, `/lists/${encodeURIComponent(listId)}/members/${subscriberHash(email)}/tags`, 'POST', {
        tags: tags.map((t: any) => ({ name: String(t), status: 'active' })),
      });
    }

    return { ok: true, member, raw: member };
  }

  if (actionId === 'remove_subscriber') {
    const listId = String(config.listId || '').trim();
    const email = String(config.email || '').trim();
    if (!listId) throw new Error('Mailchimp remove_subscriber requires listId');
    if (!email) throw new Error('Mailchimp remove_subscriber requires email');

    const data = await mcRequestJson(apiKey, `/lists/${encodeURIComponent(listId)}/members/${subscriberHash(email)}`, 'DELETE');
    return { ok: true, result: data, raw: data };
  }

  if (actionId === 'add_tag') {
    const listId = String(config.listId || '').trim();
    const email = String(config.email || '').trim();
    const tags = parseJsonMaybe(config.tags);
    if (!listId) throw new Error('Mailchimp add_tag requires listId');
    if (!email) throw new Error('Mailchimp add_tag requires email');
    if (!Array.isArray(tags) || !tags.length) throw new Error('Mailchimp add_tag requires tags (json array)');

    const data = await mcRequestJson(apiKey, `/lists/${encodeURIComponent(listId)}/members/${subscriberHash(email)}/tags`, 'POST', {
      tags: tags.map((t: any) => ({ name: String(t), status: 'active' })),
    });

    return { ok: true, result: data, raw: data };
  }

  if (actionId === 'create_campaign') {
    const listId = String(config.listId || '').trim();
    const subject = String(config.subject || '').trim();
    const fromName = String(config.fromName || '').trim();
    const replyTo = String(config.replyTo || '').trim();
    const type = String(config.type || 'regular').trim();
    if (!listId) throw new Error('Mailchimp create_campaign requires listId');
    if (!subject) throw new Error('Mailchimp create_campaign requires subject');
    if (!fromName) throw new Error('Mailchimp create_campaign requires fromName');
    if (!replyTo) throw new Error('Mailchimp create_campaign requires replyTo');

    const body: any = {
      type,
      recipients: { list_id: listId },
      settings: {
        subject_line: subject,
        from_name: fromName,
        reply_to: replyTo,
      },
    };

    const data = await mcRequestJson(apiKey, '/campaigns', 'POST', body);
    return { ok: true, campaign: data, raw: data };
  }

  return { status: 'skipped', reason: `Mailchimp action not implemented: ${actionId}` };
}
