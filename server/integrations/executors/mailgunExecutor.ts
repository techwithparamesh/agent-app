import { z } from 'zod';

const mailgunAuthSchema = z.object({
  apiKey: z.string().min(1),
  domain: z.string().min(1),
  region: z.enum(['us', 'eu']).optional(),
});

export type MailgunExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function baseUrl(region?: string) {
  return region === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net';
}

async function mgPostForm(url: string, apiKey: string, form: URLSearchParams) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: form.toString(),
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Mailgun API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeMailgunAction(input: MailgunExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey, domain, region } = mailgunAuthSchema.parse({
    apiKey: credential.apiKey,
    domain: credential.domain,
    region: credential.region,
  });

  if (actionId === 'send_email') {
    const to = String(config.to || '').trim();
    const from = String(config.from || '').trim();
    const subject = String(config.subject || '').trim();
    if (!to) throw new Error('Mailgun send_email requires to');
    if (!from) throw new Error('Mailgun send_email requires from');
    if (!subject) throw new Error('Mailgun send_email requires subject');

    const textBody = config.text != null ? String(config.text) : undefined;
    const htmlBody = config.html != null ? String(config.html) : undefined;

    const form = new URLSearchParams();
    form.set('to', to);
    form.set('from', from);
    form.set('subject', subject);
    if (textBody) form.set('text', textBody);
    if (htmlBody) form.set('html', htmlBody);

    const url = `${baseUrl(region)}/v3/${encodeURIComponent(domain)}/messages`;
    const data = await mgPostForm(url, apiKey, form);

    return { ok: true, data };
  }

  return { status: 'skipped', reason: `Mailgun action not implemented: ${actionId}` };
}
