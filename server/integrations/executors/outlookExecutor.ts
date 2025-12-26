import { z } from 'zod';

const outlookAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type OutlookExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function asString(value: any) {
  return value == null ? '' : String(value);
}

function splitEmails(value: string): string[] {
  return value
    .split(/[;,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function recipients(value: string): any[] {
  return splitEmails(value).map((address) => ({ emailAddress: { address } }));
}

async function graphRequest(accessToken: string, path: string, method: 'GET' | 'POST', body?: any) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    throw new Error(`Microsoft Graph error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeOutlookAction(input: OutlookExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = outlookAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'send_email') {
    const to = asString(config.to).trim();
    const subject = asString(config.subject).trim();
    const body = asString(config.body);
    if (!to) throw new Error('Outlook send_email requires to');
    if (!subject) throw new Error('Outlook send_email requires subject');
    if (!body) throw new Error('Outlook send_email requires body');

    const cc = asString(config.cc).trim();
    const bcc = asString(config.bcc).trim();

    const contentType = asString(config.contentType || 'Text').trim();
    const importance = asString(config.importance || 'Normal').trim();

    const message: any = {
      subject,
      body: { contentType, content: body },
      toRecipients: recipients(to),
      importance,
    };

    if (cc) message.ccRecipients = recipients(cc);
    if (bcc) message.bccRecipients = recipients(bcc);

    await graphRequest(accessToken, '/me/sendMail', 'POST', { message, saveToSentItems: true });
    return { ok: true };
  }

  if (actionId === 'reply_email') {
    const messageId = asString(config.messageId).trim();
    const comment = asString(config.comment);
    if (!messageId) throw new Error('Outlook reply_email requires messageId');
    if (!comment) throw new Error('Outlook reply_email requires comment');

    const replyAll = config.replyAll !== undefined ? Boolean(config.replyAll) : false;
    const endpoint = replyAll ? 'replyAll' : 'reply';

    await graphRequest(accessToken, `/me/messages/${encodeURIComponent(messageId)}/${endpoint}`, 'POST', { comment });
    return { ok: true };
  }

  if (actionId === 'forward_email') {
    const messageId = asString(config.messageId).trim();
    const to = asString(config.to).trim();
    if (!messageId) throw new Error('Outlook forward_email requires messageId');
    if (!to) throw new Error('Outlook forward_email requires to');

    const comment = asString(config.comment);

    await graphRequest(accessToken, `/me/messages/${encodeURIComponent(messageId)}/forward`, 'POST', {
      comment: comment || undefined,
      toRecipients: recipients(to),
    });

    return { ok: true };
  }

  if (actionId === 'move_email') {
    const messageId = asString(config.messageId).trim();
    const destinationFolder = asString(config.destinationFolder).trim();
    if (!messageId) throw new Error('Outlook move_email requires messageId');
    if (!destinationFolder) throw new Error('Outlook move_email requires destinationFolder');

    const data = await graphRequest(accessToken, `/me/messages/${encodeURIComponent(messageId)}/move`, 'POST', {
      destinationId: destinationFolder,
    });

    return { ok: true, message: data };
  }

  return { status: 'skipped', reason: `Outlook action not implemented: ${actionId}` };
}
