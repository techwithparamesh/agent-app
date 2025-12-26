import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const optionsResponse = (options: Array<{ value: string; label: string; description?: string }>) => ({ options });

const listPropertiesSchema = z.object({
  accessToken: z.string().min(1),
});

router.post('/properties', async (req, res) => {
  try {
    const parsed = listPropertiesSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }

    const { accessToken } = parsed.data;

    const options: Array<{ value: string; label: string; description?: string }> = [];

    // Use the Analytics Admin API account summaries endpoint because it conveniently
    // returns property summaries nested under each account.
    let pageToken: string | undefined = undefined;
    let guard = 0;

    while (guard < 10) {
      guard += 1;

      const url = new URL('https://analyticsadmin.googleapis.com/v1beta/accountSummaries');
      url.searchParams.set('pageSize', '200');
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const resp = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        return res.status(resp.status).json({
          error: text || `Google Analytics request failed (${resp.status})`,
        });
      }

      const data: any = await resp.json();
      const accountSummaries = Array.isArray(data?.accountSummaries) ? data.accountSummaries : [];

      for (const a of accountSummaries) {
        const properties = Array.isArray(a?.propertySummaries) ? a.propertySummaries : [];
        for (const p of properties) {
          const value = typeof p?.property === 'string' ? p.property : '';
          const displayName = typeof p?.displayName === 'string' ? p.displayName : '';
          if (!value) continue;

          const label = displayName ? `${displayName} (${value})` : value;
          options.push({ value, label });
        }
      }

      pageToken = typeof data?.nextPageToken === 'string' ? data.nextPageToken : undefined;
      if (!pageToken) break;
    }

    // De-dupe by value (defensive)
    const seen = new Set<string>();
    const deduped = options.filter((o) => {
      if (seen.has(o.value)) return false;
      seen.add(o.value);
      return true;
    });

    return res.json(optionsResponse(deduped));
  } catch (error: any) {
    console.error('google-analytics options error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

export default router;
