import { z } from 'zod';

const googleAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type GoogleCalendarExecuteInput = {
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

async function gcJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
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
    throw new Error(`Google Calendar API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeGoogleCalendarAction(input: GoogleCalendarExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = googleAuthSchema.parse({ accessToken: credential.accessToken });

  const calendarId = String(config.calendarId || 'primary');

  if (actionId === 'create_event') {
    const summary = String(config.summary || '').trim();
    const startDateTime = String(config.startDateTime || '').trim();
    const endDateTime = String(config.endDateTime || '').trim();
    if (!summary) throw new Error('Google Calendar create_event requires summary');
    if (!startDateTime) throw new Error('Google Calendar create_event requires startDateTime');
    if (!endDateTime) throw new Error('Google Calendar create_event requires endDateTime');

    const attendeesRaw = parseJsonMaybe(config.attendees);
    const attendees = Array.isArray(attendeesRaw)
      ? attendeesRaw.map((e: any) => ({ email: String(e) })).filter((a: any) => a.email)
      : undefined;

    const sendUpdates = String(config.sendUpdates || 'all');
    const conferenceData = Boolean(config.conferenceData);

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.set('sendUpdates', sendUpdates);
    if (conferenceData) url.searchParams.set('conferenceDataVersion', '1');

    const body: any = {
      summary,
      ...(config.description ? { description: String(config.description) } : {}),
      ...(config.location ? { location: String(config.location) } : {}),
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
      ...(attendees && attendees.length ? { attendees } : {}),
    };

    if (conferenceData) {
      body.conferenceData = {
        createRequest: {
          requestId: `agentapp-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    const data = await gcJson(accessToken, url.toString(), { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, event: data, raw: data };
  }

  if (actionId === 'update_event') {
    const eventId = String(config.eventId || '').trim();
    if (!eventId) throw new Error('Google Calendar update_event requires eventId');

    const body: any = {};
    if (config.summary) body.summary = String(config.summary);
    if (config.description) body.description = String(config.description);
    if (config.startDateTime) body.start = { dateTime: String(config.startDateTime) };
    if (config.endDateTime) body.end = { dateTime: String(config.endDateTime) };

    const data = await gcJson(
      accessToken,
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: 'PATCH', body: JSON.stringify(body) }
    );

    return { ok: true, event: data, raw: data };
  }

  if (actionId === 'delete_event') {
    const eventId = String(config.eventId || '').trim();
    if (!eventId) throw new Error('Google Calendar delete_event requires eventId');

    const sendUpdates = Boolean(config.sendUpdates) ? 'all' : 'none';

    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`
    );
    url.searchParams.set('sendUpdates', sendUpdates);

    await gcJson(accessToken, url.toString(), { method: 'DELETE' });
    return { ok: true, deleted: true };
  }

  if (actionId === 'get_events') {
    const timeMin = String(config.timeMin || '').trim();
    const timeMax = String(config.timeMax || '').trim();
    if (!timeMin) throw new Error('Google Calendar get_events requires timeMin');
    if (!timeMax) throw new Error('Google Calendar get_events requires timeMax');

    const maxResults = Number(config.maxResults ?? 10);
    const q = String(config.searchQuery || '').trim() || undefined;

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('timeMin', timeMin);
    url.searchParams.set('timeMax', timeMax);
    url.searchParams.set('maxResults', String(Number.isFinite(maxResults) ? maxResults : 10));
    if (q) url.searchParams.set('q', q);

    const data = await gcJson(accessToken, url.toString(), { method: 'GET' });
    return { ok: true, events: data?.items, raw: data };
  }

  if (actionId === 'quick_add') {
    const text = String(config.text || '').trim();
    if (!text) throw new Error('Google Calendar quick_add requires text');

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/quickAdd`);
    url.searchParams.set('text', text);

    const data = await gcJson(accessToken, url.toString(), { method: 'POST' });
    return { ok: true, event: data, raw: data };
  }

  return { status: 'skipped', reason: `Google Calendar action not implemented: ${actionId}` };
}
