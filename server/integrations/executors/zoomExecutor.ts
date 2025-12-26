import { z } from 'zod';

const zoomAuthSchema = z
  .object({
    accessToken: z.string().min(1).optional(),
    accountId: z.string().min(1).optional(),
    clientId: z.string().min(1).optional(),
    clientSecret: z.string().min(1).optional(),
  })
  .refine((v) => Boolean(v.accessToken || (v.accountId && v.clientId && v.clientSecret)), 'Zoom requires accessToken or S2S OAuth credentials');

export type ZoomExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function zoomS2SToken(accountId: string, clientId: string, clientSecret: string) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  const url = new URL('https://zoom.us/oauth/token');
  url.searchParams.set('grant_type', 'account_credentials');
  url.searchParams.set('account_id', accountId);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: '',
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Zoom OAuth error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  const token = data?.access_token;
  if (!token || typeof token !== 'string') throw new Error('Zoom OAuth did not return access_token');
  return token;
}

async function zJson(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`https://api.zoom.us/v2${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
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
    throw new Error(`Zoom API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeZoomAction(input: ZoomExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const parsed = zoomAuthSchema.parse({
    accessToken: credential.accessToken,
    accountId: credential.accountId,
    clientId: credential.clientId,
    clientSecret: credential.clientSecret,
  });

  const accessToken = parsed.accessToken || (await zoomS2SToken(String(parsed.accountId), String(parsed.clientId), String(parsed.clientSecret)));

  if (actionId === 'create_meeting') {
    const topic = String(config.topic || '').trim();
    if (!topic) throw new Error('Zoom create_meeting requires topic');

    const type = Number(config.type ?? 2);

    const body: any = {
      topic,
      type,
      ...(config.startTime ? { start_time: String(config.startTime) } : {}),
      ...(config.duration != null ? { duration: Number(config.duration) } : {}),
      ...(config.timezone ? { timezone: String(config.timezone) } : {}),
      ...(config.agenda ? { agenda: String(config.agenda) } : {}),
      ...(config.password ? { password: String(config.password) } : {}),
      settings: {
        ...(config.waitingRoom !== undefined ? { waiting_room: Boolean(config.waitingRoom) } : {}),
        ...(config.joinBeforeHost !== undefined ? { join_before_host: Boolean(config.joinBeforeHost) } : {}),
        ...(config.muteOnEntry !== undefined ? { mute_upon_entry: Boolean(config.muteOnEntry) } : {}),
        ...(config.autoRecording ? { auto_recording: String(config.autoRecording) } : {}),
      },
    };

    const data = await zJson(accessToken, '/users/me/meetings', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, meeting: data, raw: data };
  }

  if (actionId === 'update_meeting') {
    const meetingId = String(config.meetingId || '').trim();
    if (!meetingId) throw new Error('Zoom update_meeting requires meetingId');

    const body: any = {};
    if (config.topic) body.topic = String(config.topic);
    if (config.startTime) body.start_time = String(config.startTime);
    if (config.duration != null) body.duration = Number(config.duration);
    if (config.agenda) body.agenda = String(config.agenda);

    const data = await zJson(accessToken, `/meetings/${encodeURIComponent(meetingId)}`, { method: 'PATCH', body: JSON.stringify(body) });
    return { ok: true, meeting: data, raw: data };
  }

  if (actionId === 'delete_meeting') {
    const meetingId = String(config.meetingId || '').trim();
    if (!meetingId) throw new Error('Zoom delete_meeting requires meetingId');

    await zJson(accessToken, `/meetings/${encodeURIComponent(meetingId)}`, { method: 'DELETE' });
    return { ok: true, deleted: true };
  }

  if (actionId === 'get_meeting') {
    const meetingId = String(config.meetingId || '').trim();
    if (!meetingId) throw new Error('Zoom get_meeting requires meetingId');

    const data = await zJson(accessToken, `/meetings/${encodeURIComponent(meetingId)}`, { method: 'GET' });
    return { ok: true, meeting: data, raw: data };
  }

  if (actionId === 'list_meetings') {
    const type = String(config.type || 'upcoming');
    const pageSize = Number(config.pageSize ?? 30);

    const url = new URL('https://api.zoom.us/v2/users/me/meetings');
    url.searchParams.set('type', type);
    url.searchParams.set('page_size', String(Number.isFinite(pageSize) ? pageSize : 30));

    const data = await zJson(accessToken, `/users/me/meetings?type=${encodeURIComponent(type)}&page_size=${encodeURIComponent(String(Number.isFinite(pageSize) ? pageSize : 30))}`, { method: 'GET' });
    return { ok: true, meetings: data?.meetings, raw: data };
  }

  if (actionId === 'add_registrant') {
    const meetingId = String(config.meetingId || '').trim();
    const email = String(config.email || '').trim();
    const firstName = String(config.firstName || '').trim();
    const lastName = String(config.lastName || '').trim();

    if (!meetingId) throw new Error('Zoom add_registrant requires meetingId');
    if (!email) throw new Error('Zoom add_registrant requires email');
    if (!firstName) throw new Error('Zoom add_registrant requires firstName');

    const data = await zJson(accessToken, `/meetings/${encodeURIComponent(meetingId)}/registrants`, {
      method: 'POST',
      body: JSON.stringify({ email, first_name: firstName, ...(lastName ? { last_name: lastName } : {}) }),
    });

    return { ok: true, registrant: data, raw: data };
  }

  if (actionId === 'get_recordings') {
    const meetingId = String(config.meetingId || '').trim();
    if (!meetingId) throw new Error('Zoom get_recordings requires meetingId');

    const data = await zJson(accessToken, `/meetings/${encodeURIComponent(meetingId)}/recordings`, { method: 'GET' });
    return { ok: true, recordings: data, raw: data };
  }

  return { status: 'skipped', reason: `Zoom action not implemented: ${actionId}` };
}
