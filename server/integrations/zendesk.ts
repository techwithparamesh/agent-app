import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const authSchema = z.object({
  subdomain: z.string().min(1),
  email: z.string().min(1),
  apiToken: z.string().min(1),
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

function zendeskBaseUrl(subdomain: string) {
  const sd = subdomain.trim();
  return `https://${sd}.zendesk.com`;
}

function zendeskAuthHeader(email: string, apiToken: string) {
  // Zendesk API token auth: user@domain.com/token:{api_token}
  const raw = `${email}/token:${apiToken}`;
  const encoded = Buffer.from(raw, 'utf8').toString('base64');
  return `Basic ${encoded}`;
}

async function zdGetJson(url: string, authHeader: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Zendesk API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/zendesk/groups
// Body: { subdomain, email, apiToken }
router.post('/groups', async (req, res) => {
  try {
    const { subdomain, email, apiToken } = authSchema.parse(req.body);
    const baseUrl = zendeskBaseUrl(subdomain);
    const authHeader = zendeskAuthHeader(email, apiToken);

    const data: any = await zdGetJson(`${baseUrl}/api/v2/groups.json?page[size]=100`, authHeader);
    const groups = Array.isArray(data?.groups) ? data.groups : [];

    const options = groups
      .filter((g: any) => g && (g.id != null))
      .map((g: any) => ({ value: String(g.id), label: String(g.name || g.id) }));

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Zendesk Options] groups error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Zendesk groups' });
  }
});

// POST /api/integrations/options/zendesk/agents
// Body: { subdomain, email, apiToken }
router.post('/agents', async (req, res) => {
  try {
    const { subdomain, email, apiToken } = authSchema.parse(req.body);
    const baseUrl = zendeskBaseUrl(subdomain);
    const authHeader = zendeskAuthHeader(email, apiToken);

    const options: Array<{ value: string; label: string }> = [];

    // Use search API to find agents/admins.
    let nextUrl: string | null = `${baseUrl}/api/v2/search.json?query=${encodeURIComponent('role:agent role:admin')}`;
    let guard = 0;

    while (nextUrl && guard < 10) {
      guard += 1;
      const data: any = await zdGetJson(nextUrl, authHeader);
      const results = Array.isArray(data?.results) ? data.results : [];

      for (const u of results) {
        if (!u || u?.result_type !== 'user') continue;
        const id = u?.id != null ? String(u.id) : '';
        const name = typeof u?.name === 'string' ? u.name : '';
        const userEmail = typeof u?.email === 'string' ? u.email : '';
        if (!id) continue;
        const label = userEmail ? `${name || id} - ${userEmail}` : (name || id);
        options.push({ value: id, label });
      }

      nextUrl = typeof data?.next_page === 'string' ? data.next_page : null;
    }

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Zendesk Options] agents error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Zendesk agents' });
  }
});

export default router;
