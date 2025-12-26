import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const tokenSchema = z.object({
  accessToken: z.string().min(1),
});

function uniqByValue<T extends { value: string }>(options: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const opt of options) {
    if (!opt?.value) continue;
    if (seen.has(opt.value)) continue;
    seen.add(opt.value);
    out.push(opt);
  }
  return out;
}

async function googleCalendarGetJson(url: string, accessToken: string) {
  const res = await fetch(url, {
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

  return res.json();
}

// POST /api/integrations/options/google_meet/calendars
// Body: { accessToken }
router.post('/calendars', async (req, res) => {
  try {
    const { accessToken } = tokenSchema.parse(req.body);

    const options: Array<{ value: string; label: string; description?: string }> = [];

    let pageToken: string | undefined = undefined;
    let guard = 0;

    while (guard < 10) {
      guard += 1;

      const url = new URL('https://www.googleapis.com/calendar/v3/users/me/calendarList');
      url.searchParams.set('maxResults', '250');
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const data: any = await googleCalendarGetJson(url.toString(), accessToken);
      const items = Array.isArray(data?.items) ? data.items : [];

      for (const c of items) {
        const id = typeof c?.id === 'string' ? c.id : '';
        const summary = typeof c?.summary === 'string' ? c.summary : '';
        const primary = Boolean(c?.primary);
        if (!id) continue;

        const label = primary ? `${summary || id} (primary)` : (summary || id);
        options.push({ value: id, label });
      }

      pageToken = typeof data?.nextPageToken === 'string' ? data.nextPageToken : undefined;
      if (!pageToken) break;
    }

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Google Meet Options] calendars error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Google calendars' });
  }
});

export default router;
