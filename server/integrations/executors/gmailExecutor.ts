import { z } from 'zod';

const gmailAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type GmailExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function asString(value: any) {
  return value == null ? '' : String(value);
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

function base64UrlEncode(buf: Buffer) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function sanitizeHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function splitEmailList(value: string): string[] {
  return value
    .split(/[;,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function guessFilenameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop();
    return last || 'attachment';
  } catch {
    return 'attachment';
  }
}

async function downloadToBuffer(url: string): Promise<{ filename: string; contentType: string; data: Buffer }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download attachment ${res.status}`);
  const arrayBuf = await res.arrayBuffer();
  const data = Buffer.from(arrayBuf);
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const filename = guessFilenameFromUrl(url);
  return { filename, contentType, data };
}

function buildMimeMessage(input: {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  inReplyTo?: string;
  references?: string;
  attachments?: Array<{ filename: string; contentType: string; data: Buffer }>;
}) {
  const boundary = `----copilot-${Math.random().toString(16).slice(2)}`;

  const headers: string[] = [];
  headers.push(`To: ${sanitizeHeaderValue(input.to)}`);
  if (input.cc) headers.push(`Cc: ${sanitizeHeaderValue(input.cc)}`);
  if (input.bcc) headers.push(`Bcc: ${sanitizeHeaderValue(input.bcc)}`);
  headers.push(`Subject: ${sanitizeHeaderValue(input.subject)}`);
  headers.push('MIME-Version: 1.0');
  if (input.inReplyTo) headers.push(`In-Reply-To: ${sanitizeHeaderValue(input.inReplyTo)}`);
  if (input.references) headers.push(`References: ${sanitizeHeaderValue(input.references)}`);

  const attachments = input.attachments || [];
  const contentType = input.isHtml ? 'text/html; charset="UTF-8"' : 'text/plain; charset="UTF-8"';

  if (attachments.length === 0) {
    headers.push(`Content-Type: ${contentType}`);
    return `${headers.join('\r\n')}\r\n\r\n${input.body}`;
  }

  headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);

  const parts: string[] = [];

  parts.push(`--${boundary}`);
  parts.push(`Content-Type: ${contentType}`);
  parts.push('Content-Transfer-Encoding: 7bit');
  parts.push('');
  parts.push(input.body);

  for (const att of attachments) {
    parts.push(`--${boundary}`);
    parts.push(`Content-Type: ${att.contentType}; name="${att.filename}"`);
    parts.push('Content-Transfer-Encoding: base64');
    parts.push(`Content-Disposition: attachment; filename="${att.filename}"`);
    parts.push('');
    parts.push(att.data.toString('base64').replace(/(.{76})/g, '$1\r\n'));
  }

  parts.push(`--${boundary}--`);

  return `${headers.join('\r\n')}\r\n\r\n${parts.join('\r\n')}`;
}

async function gmailRequest(accessToken: string, path: string, method: 'GET' | 'POST', body?: any) {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1${path}`, {
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
    throw new Error(`Gmail API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function headerValue(headers: any[], name: string) {
  const h = (headers || []).find((x: any) => String(x?.name || '').toLowerCase() === name.toLowerCase());
  return h?.value ? String(h.value) : '';
}

export async function executeGmailAction(input: GmailExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = gmailAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'send_email') {
    const to = asString(config.to).trim();
    const subject = asString(config.subject).trim();
    const body = asString(config.body);
    if (!to) throw new Error('Gmail send_email requires to');
    if (!subject) throw new Error('Gmail send_email requires subject');
    if (!body) throw new Error('Gmail send_email requires body');

    const isHtml = config.isHtml !== undefined ? Boolean(config.isHtml) : false;
    const cc = asString(config.cc).trim();
    const bcc = asString(config.bcc).trim();

    const attachmentUrls = parseJsonMaybe(config.attachmentUrls);
    const attachments = Array.isArray(attachmentUrls)
      ? await Promise.all(attachmentUrls.filter(Boolean).map((u: any) => downloadToBuffer(String(u))))
      : [];

    const mime = buildMimeMessage({ to, cc: cc || undefined, bcc: bcc || undefined, subject, body, isHtml, attachments });
    const raw = base64UrlEncode(Buffer.from(mime, 'utf8'));

    const data = await gmailRequest(accessToken, '/users/me/messages/send', 'POST', { raw });
    return { ok: true, message: data };
  }

  if (actionId === 'create_draft') {
    const to = asString(config.to).trim();
    const subject = asString(config.subject).trim();
    const body = asString(config.body);
    if (!to) throw new Error('Gmail create_draft requires to');
    if (!subject) throw new Error('Gmail create_draft requires subject');
    if (!body) throw new Error('Gmail create_draft requires body');

    const mime = buildMimeMessage({ to, subject, body, isHtml: false });
    const raw = base64UrlEncode(Buffer.from(mime, 'utf8'));

    const data = await gmailRequest(accessToken, '/users/me/drafts', 'POST', { message: { raw } });
    return { ok: true, draft: data };
  }

  if (actionId === 'reply_email') {
    const threadId = asString(config.threadId).trim();
    const body = asString(config.body);
    if (!threadId) throw new Error('Gmail reply_email requires threadId');
    if (!body) throw new Error('Gmail reply_email requires body');

    const qs = new URLSearchParams();
    qs.set('format', 'metadata');
    for (const h of ['From', 'To', 'Cc', 'Subject', 'Message-Id', 'References', 'Reply-To']) {
      qs.append('metadataHeaders', h);
    }

    const thread = await gmailRequest(accessToken, `/users/me/threads/${encodeURIComponent(threadId)}?${qs.toString()}`, 'GET');
    const messages = Array.isArray(thread?.messages) ? thread.messages : [];
    if (messages.length === 0) throw new Error('Gmail thread has no messages');

    const last = messages[messages.length - 1];
    const headers = last?.payload?.headers || [];

    const replyTo = headerValue(headers, 'Reply-To') || headerValue(headers, 'From');
    const subjectRaw = headerValue(headers, 'Subject') || '';
    const subject = subjectRaw.toLowerCase().startsWith('re:') ? subjectRaw : `Re: ${subjectRaw || '(no subject)'}`;

    const inReplyTo = headerValue(headers, 'Message-Id') || '';
    const referencesPrev = headerValue(headers, 'References') || '';
    const references = [referencesPrev, inReplyTo].filter(Boolean).join(' ').trim() || undefined;

    const mime = buildMimeMessage({
      to: replyTo,
      subject,
      body,
      isHtml: false,
      inReplyTo: inReplyTo || undefined,
      references,
    });

    const raw = base64UrlEncode(Buffer.from(mime, 'utf8'));

    const data = await gmailRequest(accessToken, '/users/me/messages/send', 'POST', {
      raw,
      threadId,
    });

    return { ok: true, message: data };
  }

  if (actionId === 'add_label') {
    const messageId = asString(config.messageId).trim();
    if (!messageId) throw new Error('Gmail add_label requires messageId');

    const labelIds = Array.isArray(config.labelIds) ? config.labelIds : parseJsonMaybe(config.labelIds);
    const addLabelIds = Array.isArray(labelIds) ? labelIds.map((x: any) => String(x)).filter(Boolean) : [];
    if (addLabelIds.length === 0) throw new Error('Gmail add_label requires labelIds');

    const data = await gmailRequest(accessToken, `/users/me/messages/${encodeURIComponent(messageId)}/modify`, 'POST', {
      addLabelIds,
      removeLabelIds: [],
    });

    return { ok: true, message: data };
  }

  if (actionId === 'mark_read') {
    const messageId = asString(config.messageId).trim();
    if (!messageId) throw new Error('Gmail mark_read requires messageId');

    const markAs = asString(config.markAs).trim().toLowerCase();
    if (markAs !== 'read' && markAs !== 'unread') throw new Error('Gmail mark_read markAs must be read or unread');

    const addLabelIds = markAs === 'unread' ? ['UNREAD'] : [];
    const removeLabelIds = markAs === 'read' ? ['UNREAD'] : [];

    const data = await gmailRequest(accessToken, `/users/me/messages/${encodeURIComponent(messageId)}/modify`, 'POST', {
      addLabelIds,
      removeLabelIds,
    });

    return { ok: true, message: data };
  }

  return { status: 'skipped', reason: `Gmail action not implemented: ${actionId}` };
}
