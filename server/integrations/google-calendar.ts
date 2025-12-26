import { Router } from 'express';
import { z } from 'zod';

const googleCalendarOptionsRouter = Router();

const baseSchema = z.object({
  accessToken: z.string().min(1),
});

async function gcGet(accessToken: string, path: string) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Calendar API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

// POST /api/integrations/options/google_calendar/calendars
// Body: { accessToken }
googleCalendarOptionsRouter.post('/calendars', async (req, res) => {
  try {
    const { accessToken } = baseSchema.parse(req.body);

    const data = await gcGet(accessToken, '/users/me/calendarList');
    const items = Array.isArray(data?.items) ? data.items : [];

    const options = items
      .filter((c: any) => c && c.id)
      .map((c: any) => ({ value: String(c.id), label: String(c.summary || c.id) }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[Google Calendar Options] calendars error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Google Calendar calendars' });
  }
});

export default googleCalendarOptionsRouter;
