import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const authSchema = z.object({
  domain: z.string().min(1),
  apiKey: z.string().min(1),
});

function normalizeDomain(domain: string) {
  const d = domain.trim();
  if (!d) return d;
  if (d.startsWith('http://') || d.startsWith('https://')) return d;
  return `https://${d}`;
}

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

async function fdGetJson(baseUrl: string, path: string, apiKey: string) {
  const auth = Buffer.from(`${apiKey}:X`, 'utf8').toString('base64');
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Freshdesk API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/freshdesk/groups
// Body: { domain, apiKey }
router.post('/groups', async (req, res) => {
  try {
    const { domain, apiKey } = authSchema.parse(req.body);
    const baseUrl = normalizeDomain(domain);

    const data: any = await fdGetJson(baseUrl, '/api/v2/groups', apiKey);
    const groups = Array.isArray(data) ? data : [];

    const options = groups
      .filter((g: any) => g && (g.id != null))
      .map((g: any) => ({ value: String(g.id), label: String(g.name || g.id) }));

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Freshdesk Options] groups error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Freshdesk groups' });
  }
});

// POST /api/integrations/options/freshdesk/agents
// Body: { domain, apiKey }
router.post('/agents', async (req, res) => {
  try {
    const { domain, apiKey } = authSchema.parse(req.body);
    const baseUrl = normalizeDomain(domain);

    const options: Array<{ value: string; label: string }> = [];

    // Freshdesk supports pagination via `page` and `per_page`.
    for (let page = 1; page <= 10; page += 1) {
      const data: any = await fdGetJson(baseUrl, `/api/v2/agents?page=${page}&per_page=100`, apiKey);
      const agents = Array.isArray(data) ? data : [];

      for (const a of agents) {
        const id = a?.id != null ? String(a.id) : '';
        const name = typeof a?.contact?.name === 'string' ? a.contact.name : (typeof a?.name === 'string' ? a.name : '');
        const email = typeof a?.contact?.email === 'string' ? a.contact.email : (typeof a?.email === 'string' ? a.email : '');
        if (!id) continue;
        const label = email ? `${name || id} - ${email}` : (name || id);
        options.push({ value: id, label });
      }

      if (agents.length < 100) break;
    }

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Freshdesk Options] agents error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Freshdesk agents' });
  }
});

export default router;
