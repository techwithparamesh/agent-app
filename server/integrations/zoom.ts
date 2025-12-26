import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const s2sSchema = z.object({
  accountId: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
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
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Zoom OAuth error ${res.status}: ${text || res.statusText}`);
  }

  const data: any = await res.json();
  const token = typeof data?.access_token === 'string' ? data.access_token : '';
  if (!token) throw new Error('Zoom OAuth did not return an access token');
  return token;
}

async function zoomGetJson(path: string, accessToken: string) {
  const res = await fetch(`https://api.zoom.us/v2${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Zoom API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/zoom/users
// Body: { accountId, clientId, clientSecret }
router.post('/users', async (req, res) => {
  try {
    const { accountId, clientId, clientSecret } = s2sSchema.parse(req.body);
    const accessToken = await zoomS2SToken(accountId, clientId, clientSecret);

    const options: Array<{ value: string; label: string; description?: string }> = [];

    let nextPageToken: string | undefined = undefined;
    let guard = 0;

    while (guard < 10) {
      guard += 1;
      const url = new URL('https://api.zoom.us/v2/users');
      url.searchParams.set('page_size', '100');
      if (nextPageToken) url.searchParams.set('next_page_token', nextPageToken);

      const data: any = await zoomGetJson(`/users?page_size=100${nextPageToken ? `&next_page_token=${encodeURIComponent(nextPageToken)}` : ''}`, accessToken);
      const users = Array.isArray(data?.users) ? data.users : [];

      for (const u of users) {
        const id = typeof u?.id === 'string' ? u.id : '';
        const firstName = typeof u?.first_name === 'string' ? u.first_name : '';
        const lastName = typeof u?.last_name === 'string' ? u.last_name : '';
        const email = typeof u?.email === 'string' ? u.email : '';
        if (!id) continue;

        const name = `${firstName} ${lastName}`.trim();
        const label = email ? `${name || email} (${email})` : (name || id);
        options.push({ value: id, label });
      }

      nextPageToken = typeof data?.next_page_token === 'string' && data.next_page_token ? data.next_page_token : undefined;
      if (!nextPageToken) break;
    }

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Zoom Options] users error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Zoom users' });
  }
});

export default router;
