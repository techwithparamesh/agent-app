import { z } from 'zod';

const authSchema = z.object({
  accessToken: z.string().min(1),
});

export type HelpScoutExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function hsJson(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`https://api.helpscout.net/v2${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    throw new Error(`Help Scout API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeHelpScoutAction(input: HelpScoutExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = authSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_conversation') {
    const mailboxId = String(config.mailboxId || '').trim();
    const subject = String(config.subject || '').trim();
    const customerEmail = String(config.customerEmail || '').trim();
    const body = String(config.body || '').trim();

    if (!mailboxId) throw new Error('Help Scout create_conversation requires mailboxId');
    if (!subject) throw new Error('Help Scout create_conversation requires subject');
    if (!customerEmail) throw new Error('Help Scout create_conversation requires customerEmail');
    if (!body) throw new Error('Help Scout create_conversation requires body');

    const payload = {
      subject,
      type: 'email',
      mailboxId,
      customer: { email: customerEmail },
      threads: [
        {
          type: 'customer',
          text: body,
        },
      ],
    };

    const data = await hsJson(accessToken, '/conversations', { method: 'POST', body: JSON.stringify(payload) });
    return { ok: true, conversation: data, raw: data };
  }

  if (actionId === 'reply_conversation') {
    const conversationId = String(config.conversationId || '').trim();
    const body = String(config.body || '').trim();

    if (!conversationId) throw new Error('Help Scout reply_conversation requires conversationId');
    if (!body) throw new Error('Help Scout reply_conversation requires body');

    const payload = {
      type: 'reply',
      text: body,
    };

    const data = await hsJson(accessToken, `/conversations/${encodeURIComponent(conversationId)}/threads`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { ok: true, raw: data };
  }

  return { status: 'skipped', reason: `Help Scout action not implemented: ${actionId}` };
}
