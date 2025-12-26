import { z } from 'zod';

const twilioAuthSchema = z.object({
  accountSid: z.string().min(1),
  authToken: z.string().min(1),
});

export type TwilioVoiceExecuteInput = {
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

export async function executeTwilioVoiceAction(input: TwilioVoiceExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;

  const { accountSid, authToken } = twilioAuthSchema.parse({
    accountSid: credential.accountSid,
    authToken: credential.authToken,
  });

  const auth = twilioAuthHeader(accountSid, authToken);
  const base = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}`;

  if (actionId === 'make_call') {
    const to = String(config.to || '').trim();
    const from = String(config.from || '').trim();
    const twiml = config.twiml != null ? String(config.twiml) : '';
    const url = config.url != null ? String(config.url).trim() : '';

    if (!to) throw new Error('Twilio Voice make_call requires to');
    if (!from) throw new Error('Twilio Voice make_call requires from');
    if (!twiml && !url) throw new Error('Twilio Voice make_call requires either twiml or url');

    const form = new URLSearchParams();
    form.set('To', to);
    form.set('From', from);
    if (twiml) form.set('Twiml', twiml);
    if (url) form.set('Url', url);

    if (config.record !== undefined) form.set('Record', String(Boolean(config.record)));
    if (config.machineDetection) form.set('MachineDetection', String(config.machineDetection));
    if (config.timeout !== undefined && config.timeout !== null && config.timeout !== '') {
      form.set('Timeout', String(config.timeout));
    }

    const data = await twilioPostForm(`${base}/Calls.json`, auth, form);
    return { ok: true, sid: data?.sid, status: data?.status, raw: data };
  }

  if (actionId === 'send_sms_during_call') {
    const to = String(config.to || '').trim();
    const from = String(config.from || '').trim();
    const body = String(config.body || '');

    if (!to) throw new Error('Twilio Voice send_sms_during_call requires to');
    if (!from) throw new Error('Twilio Voice send_sms_during_call requires from');
    if (!body) throw new Error('Twilio Voice send_sms_during_call requires body');

    const form = new URLSearchParams();
    form.set('To', to);
    form.set('From', from);
    form.set('Body', body);

    const data = await twilioPostForm(`${base}/Messages.json`, auth, form);
    return { ok: true, sid: data?.sid, status: data?.status, raw: data };
  }

  if (actionId === 'get_call') {
    const callSid = String(config.callSid || '').trim();
    if (!callSid) throw new Error('Twilio Voice get_call requires callSid');

    const data = await twilioGetJson(`${base}/Calls/${encodeURIComponent(callSid)}.json`, auth);
    return { ok: true, call: data, raw: data };
  }

  if (actionId === 'update_call') {
    const callSid = String(config.callSid || '').trim();
    if (!callSid) throw new Error('Twilio Voice update_call requires callSid');

    const twiml = config.twiml != null ? String(config.twiml) : '';
    const url = config.url != null ? String(config.url).trim() : '';
    const status = config.status != null ? String(config.status).trim() : '';

    if (!twiml && !url && !status) throw new Error('Twilio Voice update_call requires at least one of twiml, url, status');

    const form = new URLSearchParams();
    if (twiml) form.set('Twiml', twiml);
    if (url) form.set('Url', url);
    if (status) form.set('Status', status);

    const data = await twilioPostForm(`${base}/Calls/${encodeURIComponent(callSid)}.json`, auth, form);
    return { ok: true, result: data, raw: data };
  }

  if (actionId === 'get_recording') {
    const recordingSid = String(config.recordingSid || '').trim();
    if (!recordingSid) throw new Error('Twilio Voice get_recording requires recordingSid');

    const data = await twilioGetJson(`${base}/Recordings/${encodeURIComponent(recordingSid)}.json`, auth);

    // Media URL format (can be fetched with basic auth):
    // https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Recordings/{RecordingSid}.wav
    const mediaUrl = `${base}/Recordings/${encodeURIComponent(recordingSid)}.wav`;

    return { ok: true, recording: data, mediaUrl, raw: data };
  }

  return { status: 'skipped', reason: `Twilio Voice action not implemented: ${actionId}` };
}
