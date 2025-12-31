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

  const calendarId = String((config.calendarId ?? config.calendar_id) || 'primary');

  const parseAttendees = (value: any): Array<{ email: string }> | undefined => {
    const raw = parseJsonMaybe(value);
    if (Array.isArray(raw)) {
      const out = raw
        .map((e: any) => ({ email: String(e?.email ?? e).trim() }))
        .filter((a) => a.email);
      return out.length ? out : undefined;
    }
    if (typeof value === 'string') {
      const emails = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const out = emails.map((email) => ({ email }));
      return out.length ? out : undefined;
    }
    return undefined;
  };

  const sendUpdatesValue = (value: any, defaultValue: 'all' | 'none' | 'externalOnly' = 'all') => {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'string') {
      const v = value.trim();
      if (v === 'all' || v === 'none' || v === 'externalOnly') return v;
      return defaultValue;
    }
    // Back-compat: allow boolean.
    if (typeof value === 'boolean') return value ? 'all' : 'none';
    return defaultValue;
  };

  if (actionId === 'create_event') {
    const summary = String(config.summary || '').trim();
    const startDateTime = String((config.startDateTime ?? config.start_date_time) || '').trim();
    const endDateTime = String((config.endDateTime ?? config.end_date_time) || '').trim();
    if (!summary) throw new Error('Google Calendar create_event requires summary');
    if (!startDateTime) throw new Error('Google Calendar create_event requires startDateTime');
    if (!endDateTime) throw new Error('Google Calendar create_event requires endDateTime');

    const attendees = parseAttendees(config.attendees);

    const sendUpdates = sendUpdatesValue(config.sendUpdates ?? config.send_updates, 'all');
    const conferenceDataType = String((config.conferenceDataType ?? config.conference_data_type) || '').trim();
    const conferenceData = conferenceDataType ? conferenceDataType !== 'none' : Boolean(config.conferenceData ?? config.conference_data);
    const timezone = String((config.timezone ?? config.time_zone) || '').trim() || undefined;
    const allDay = Boolean(config.allDay ?? config.all_day);

    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    url.searchParams.set('sendUpdates', sendUpdates);
    if (conferenceData) url.searchParams.set('conferenceDataVersion', '1');

    const isDateOnly = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
    const start = allDay || isDateOnly(startDateTime)
      ? { date: startDateTime, ...(timezone ? { timeZone: timezone } : {}) }
      : { dateTime: startDateTime, ...(timezone ? { timeZone: timezone } : {}) };
    const end = allDay || isDateOnly(endDateTime)
      ? { date: endDateTime, ...(timezone ? { timeZone: timezone } : {}) }
      : { dateTime: endDateTime, ...(timezone ? { timeZone: timezone } : {}) };

    const body: any = {
      summary,
      ...(config.description ? { description: String(config.description) } : {}),
      ...(config.location ? { location: String(config.location) } : {}),
      start,
      end,
      ...(attendees && attendees.length ? { attendees } : {}),
      ...(config.colorId ? { colorId: String(config.colorId) } : {}),
      ...(config.visibility ? { visibility: String(config.visibility) } : {}),
    };

    if (config.recurrence) body.recurrence = [String(config.recurrence)];

    const remindersRaw = parseJsonMaybe(config.reminders);
    if (Array.isArray(remindersRaw)) {
      const overrides = remindersRaw
        .map((r: any) => ({ method: String(r?.method || '').trim(), minutes: Number(r?.minutes) }))
        .filter((r: any) => r.method && Number.isFinite(r.minutes));
      if (overrides.length) body.reminders = { useDefault: false, overrides };
    }

    if (conferenceData) {
      body.conferenceData = {
        createRequest: {
          requestId: `agentapp-${Date.now()}`,
          conferenceSolutionKey: { type: conferenceDataType && conferenceDataType !== 'none' ? conferenceDataType : 'hangoutsMeet' },
        },
      };
    }

    const data = await gcJson(accessToken, url.toString(), { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, event: data, raw: data };
  }

  if (actionId === 'update_event') {
    const eventId = String((config.eventId ?? config.event_id) || '').trim();
    if (!eventId) throw new Error('Google Calendar update_event requires eventId');

    const body: any = {};
    if (config.summary) body.summary = String(config.summary);
    if (config.description) body.description = String(config.description);
    if (config.location) body.location = String(config.location);

    const startRaw = config.startDateTime ?? config.start_date_time;
    const endRaw = config.endDateTime ?? config.end_date_time;
    const timezone = String((config.timezone ?? config.time_zone) || '').trim() || undefined;
    const isDateOnly = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
    if (startRaw) {
      const v = String(startRaw).trim();
      body.start = isDateOnly(v) ? { date: v, ...(timezone ? { timeZone: timezone } : {}) } : { dateTime: v, ...(timezone ? { timeZone: timezone } : {}) };
    }
    if (endRaw) {
      const v = String(endRaw).trim();
      body.end = isDateOnly(v) ? { date: v, ...(timezone ? { timeZone: timezone } : {}) } : { dateTime: v, ...(timezone ? { timeZone: timezone } : {}) };
    }

    const attendees = parseAttendees(config.attendees);
    if (attendees && attendees.length) body.attendees = attendees;

    const data = await gcJson(
      accessToken,
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: 'PATCH', body: JSON.stringify(body) }
    );

    return { ok: true, event: data, raw: data };
  }

  if (actionId === 'delete_event') {
    const eventId = String((config.eventId ?? config.event_id) || '').trim();
    if (!eventId) throw new Error('Google Calendar delete_event requires eventId');

    const sendUpdates = sendUpdatesValue(config.sendUpdates ?? config.send_updates, 'all');

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

    const maxResults = Number(config.maxResults ?? config.max_results ?? 10);
    const q = String((config.searchQuery ?? config.search_query) || '').trim() || undefined;

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
