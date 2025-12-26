import { z } from 'zod';

const googleAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type GoogleMeetExecuteInput = {
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

function extractMeetLink(event: any): string {
  if (typeof event?.hangoutLink === 'string' && event.hangoutLink) return event.hangoutLink;

  const entryPoints = Array.isArray(event?.conferenceData?.entryPoints) ? event.conferenceData.entryPoints : [];
  const video = entryPoints.find((e: any) => e?.entryPointType === 'video');
  if (typeof video?.uri === 'string' && video.uri) return video.uri;

  const anyUri = entryPoints.find((e: any) => typeof e?.uri === 'string' && e.uri);
  if (typeof anyUri?.uri === 'string' && anyUri.uri) return anyUri.uri;

  return '';
}

export async function executeGoogleMeetAction(input: GoogleMeetExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = googleAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_meeting') {
    const summary = String(config.summary || '').trim();
    const startTime = String(config.startTime || '').trim();
    const endTime = String(config.endTime || '').trim();
    const timezone = String(config.timezone || 'UTC').trim() || 'UTC';
    if (!summary) throw new Error('Google Meet create_meeting requires summary');
    if (!startTime) throw new Error('Google Meet create_meeting requires startTime');
    if (!endTime) throw new Error('Google Meet create_meeting requires endTime');

    const attendeesRaw = parseJsonMaybe(config.attendees);
    const attendees = Array.isArray(attendeesRaw)
      ? attendeesRaw.map((e: any) => ({ email: String(e) })).filter((a: any) => a.email)
      : undefined;

    const sendUpdates = String(config.sendUpdates || 'all');

    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('sendUpdates', sendUpdates);
    url.searchParams.set('conferenceDataVersion', '1');

    const body: any = {
      summary,
      ...(config.description ? { description: String(config.description) } : {}),
      start: { dateTime: startTime, timeZone: timezone },
      end: { dateTime: endTime, timeZone: timezone },
      ...(attendees && attendees.length ? { attendees } : {}),
      ...(config.guestsCanModify != null ? { guestsCanModify: Boolean(config.guestsCanModify) } : {}),
      ...(config.guestsCanInviteOthers != null ? { guestsCanInviteOthers: Boolean(config.guestsCanInviteOthers) } : {}),
      conferenceData: {
        createRequest: {
          requestId: `agentapp-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const data = await gcJson(accessToken, url.toString(), { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, event: data, meetingLink: extractMeetLink(data), raw: data };
  }

  if (actionId === 'get_meeting_link') {
    const eventId = String(config.eventId || '').trim();
    const calendarId = String(config.calendarId || 'primary').trim() || 'primary';
    if (!eventId) throw new Error('Google Meet get_meeting_link requires eventId');

    const data = await gcJson(
      accessToken,
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: 'GET' },
    );

    return { ok: true, event: data, meetingLink: extractMeetLink(data), raw: data };
  }

  if (actionId === 'update_meeting') {
    const eventId = String(config.eventId || '').trim();
    const calendarId = String(config.calendarId || 'primary').trim() || 'primary';
    if (!eventId) throw new Error('Google Meet update_meeting requires eventId');

    const body: any = {};
    if (config.summary != null) body.summary = String(config.summary);
    if (config.description != null) body.description = String(config.description);

    if (config.startTime) {
      const timezone = String(config.timezone || 'UTC').trim() || 'UTC';
      body.start = { dateTime: String(config.startTime), timeZone: timezone };
    }
    if (config.endTime) {
      const timezone = String(config.timezone || 'UTC').trim() || 'UTC';
      body.end = { dateTime: String(config.endTime), timeZone: timezone };
    }

    const data = await gcJson(
      accessToken,
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: 'PATCH', body: JSON.stringify(body) },
    );

    return { ok: true, event: data, meetingLink: extractMeetLink(data), raw: data };
  }

  if (actionId === 'delete_meeting') {
    const eventId = String(config.eventId || '').trim();
    const calendarId = String(config.calendarId || 'primary').trim() || 'primary';
    if (!eventId) throw new Error('Google Meet delete_meeting requires eventId');

    const sendUpdates = String(config.sendUpdates || 'all');

    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`
    );
    url.searchParams.set('sendUpdates', sendUpdates);

    await gcJson(accessToken, url.toString(), { method: 'DELETE' });
    return { ok: true, deleted: true };
  }

  return {
    status: 'skipped',
    reason: `Google Meet action not implemented: ${actionId}`,
  };
}
