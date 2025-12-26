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

async function intercomGetJson(path: string, accessToken: string) {
  const res = await fetch(`https://api.intercom.io${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Intercom-Version': '2.11',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Intercom API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/intercom/inboxes
// Body: { accessToken }
router.post('/inboxes', async (req, res) => {
  try {
    const { accessToken } = tokenSchema.parse(req.body);
    const data: any = await intercomGetJson('/inboxes', accessToken);

    const inboxes = Array.isArray(data?.inboxes) ? data.inboxes : [];
    const options = inboxes
      .filter((i: any) => i && (i.id != null))
      .map((i: any) => ({
        value: String(i.id),
        label: String(i.name || i.id),
      }));

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Intercom Options] inboxes error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Intercom inboxes' });
  }
});

// POST /api/integrations/options/intercom/admins
// Body: { accessToken }
router.post('/admins', async (req, res) => {
  try {
    const { accessToken } = tokenSchema.parse(req.body);
    const data: any = await intercomGetJson('/admins', accessToken);

    const admins = Array.isArray(data?.admins) ? data.admins : [];
    const options = admins
      .filter((a: any) => a && (a.id != null))
      .map((a: any) => {
        const nameParts = [a?.name, a?.email].filter(Boolean).map(String);
        const label = nameParts.length ? nameParts.join(' - ') : String(a.id);
        return { value: String(a.id), label };
      });

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Intercom Options] admins error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Intercom admins' });
  }
});

// POST /api/integrations/options/intercom/tags
// Body: { accessToken }
router.post('/tags', async (req, res) => {
  try {
    const { accessToken } = tokenSchema.parse(req.body);
    const data: any = await intercomGetJson('/tags', accessToken);

    const tags = Array.isArray(data?.data) ? data.data : [];
    const options = tags
      .filter((t: any) => t && (t.id != null))
      .map((t: any) => ({
        value: String(t.id),
        label: String(t.name || t.id),
      }));

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Intercom Options] tags error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Intercom tags' });
  }
});

export default router;
