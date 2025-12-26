import { z } from 'zod';

const intercomAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type IntercomExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function intercomRequestJson(path: string, accessToken: string, method: 'GET' | 'POST' | 'PUT', body?: any) {
  const res = await fetch(`https://api.intercom.io${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Intercom-Version': '2.11',
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
    throw new Error(`Intercom API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
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

export async function executeIntercomAction(input: IntercomExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = intercomAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_contact') {
    const role = String(config.role || '').trim();
    if (!role) throw new Error('Intercom create_contact requires role');

    const body: any = {
      role,
      ...(config.email ? { email: String(config.email) } : {}),
      ...(config.phone ? { phone: String(config.phone) } : {}),
      ...(config.name ? { name: String(config.name) } : {}),
    };

    const customAttributes = parseJsonMaybe(config.customAttributes);
    if (customAttributes && typeof customAttributes === 'object') body.custom_attributes = customAttributes;

    const data = await intercomRequestJson('/contacts', accessToken, 'POST', body);
    return { ok: true, contact: data };
  }

  if (actionId === 'update_contact') {
    const contactId = String(config.contactId || '').trim();
    if (!contactId) throw new Error('Intercom update_contact requires contactId');

    const body: any = {
      ...(config.email ? { email: String(config.email) } : {}),
      ...(config.phone ? { phone: String(config.phone) } : {}),
      ...(config.name ? { name: String(config.name) } : {}),
    };

    const customAttributes = parseJsonMaybe(config.customAttributes);
    if (customAttributes && typeof customAttributes === 'object') body.custom_attributes = customAttributes;

    const data = await intercomRequestJson(`/contacts/${encodeURIComponent(contactId)}`, accessToken, 'PUT', body);
    return { ok: true, contact: data };
  }

  if (actionId === 'send_message') {
    const contactId = String(config.contactId || '').trim();
    const messageTypeUi = String(config.messageType || '').trim();
    const bodyText = String(config.body || '').trim();
    const fromId = String(config.fromId || '').trim();

    if (!contactId) throw new Error('Intercom send_message requires contactId');
    if (!messageTypeUi) throw new Error('Intercom send_message requires messageType');
    if (!bodyText) throw new Error('Intercom send_message requires body');
    if (!fromId) throw new Error('Intercom send_message requires fromId');

    const message_type = messageTypeUi === 'in_app' ? 'inapp' : messageTypeUi;

    const body: any = {
      message_type,
      body: bodyText,
      from: { type: 'admin', id: fromId },
      to: { type: 'contact', id: contactId },
      ...(message_type === 'email' && config.subject ? { subject: String(config.subject) } : {}),
    };

    const data = await intercomRequestJson('/messages', accessToken, 'POST', body);
    return { ok: true, message: data };
  }

  if (actionId === 'add_tag') {
    const contactId = String(config.contactId || '').trim();
    const tagId = String(config.tagId || '').trim();
    if (!contactId) throw new Error('Intercom add_tag requires contactId');
    if (!tagId) throw new Error('Intercom add_tag requires tagId');

    // Intercom supports tagging a contact via /contacts/{id}/tags
    const data = await intercomRequestJson(`/contacts/${encodeURIComponent(contactId)}/tags`, accessToken, 'POST', {
      id: tagId,
    });

    return { ok: true, result: data };
  }

  if (actionId === 'create_note') {
    const contactId = String(config.contactId || '').trim();
    const bodyText = String(config.body || '').trim();
    const adminId = String(config.adminId || '').trim();
    if (!contactId) throw new Error('Intercom create_note requires contactId');
    if (!bodyText) throw new Error('Intercom create_note requires body');
    if (!adminId) throw new Error('Intercom create_note requires adminId');

    const data = await intercomRequestJson('/notes', accessToken, 'POST', {
      body: bodyText,
      contact_id: contactId,
      admin_id: adminId,
    });

    return { ok: true, note: data };
  }

  if (actionId === 'reply_conversation') {
    const conversationId = String(config.conversationId || '').trim();
    const bodyText = String(config.body || '').trim();
    const adminId = String(config.adminId || '').trim();
    const messageType = config.messageType ? String(config.messageType) : 'comment';

    if (!conversationId) throw new Error('Intercom reply_conversation requires conversationId');
    if (!bodyText) throw new Error('Intercom reply_conversation requires body');
    if (!adminId) throw new Error('Intercom reply_conversation requires adminId');

    const data = await intercomRequestJson(`/conversations/${encodeURIComponent(conversationId)}/reply`, accessToken, 'POST', {
      type: 'admin',
      admin_id: adminId,
      message_type: messageType,
      body: bodyText,
    });

    return { ok: true, result: data };
  }

  return { status: 'skipped', reason: `Intercom action not implemented: ${actionId}` };
}
