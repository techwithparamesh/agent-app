import { z } from 'zod';

const twilioAuthSchema = z.object({
  accountSid: z.string().min(1),
  authToken: z.string().min(1),
  fromNumber: z.string().min(1).optional(),
});

export type TwilioSmsExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function twilioAuthHeader(accountSid: string, authToken: string) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
}

async function twilioPostForm(url: string, auth: string, form: URLSearchParams) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: auth,
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
    throw new Error(`Twilio API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

async function twilioGetJson(url: string, auth: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: auth, Accept: 'application/json' },
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Twilio API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeTwilioSmsAction(input: TwilioSmsExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;

  const { accountSid, authToken, fromNumber } = twilioAuthSchema.parse({
    accountSid: credential.accountSid,
    authToken: credential.authToken,
    fromNumber: credential.fromNumber,
  });

  const auth = twilioAuthHeader(accountSid, authToken);

  if (actionId === 'send_sms') {
    const to = String(config.to || '').trim();
    const body = String(config.body || '');
    const from = String((config.from || fromNumber || '')).trim();

    if (!to) throw new Error('Twilio send_sms requires to');
    if (!from) throw new Error('Twilio send_sms requires from (or set fromNumber on credential)');
    if (!body) throw new Error('Twilio send_sms requires body');

    const form = new URLSearchParams();
    form.set('To', to);
    form.set('From', from);
    form.set('Body', body);

    if (config.mediaUrl) form.set('MediaUrl', String(config.mediaUrl));

    const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;
    const data = await twilioPostForm(url, auth, form);

    return { ok: true, sid: data?.sid, status: data?.status, raw: data };
  }

  if (actionId === 'lookup') {
    const phoneNumber = String(config.phoneNumber || '').trim();
    if (!phoneNumber) throw new Error('Twilio lookup requires phoneNumber');

    const types = Array.isArray(config.type) ? config.type : [];
    const url = new URL(`https://lookups.twilio.com/v1/PhoneNumbers/${encodeURIComponent(phoneNumber)}`);
    if (types.length) url.searchParams.set('Type', types.map(String).join(','));

    const data = await twilioGetJson(url.toString(), auth);
    return { ok: true, raw: data };
  }

  return { status: 'skipped', reason: `Twilio SMS action not implemented: ${actionId}` };
}
