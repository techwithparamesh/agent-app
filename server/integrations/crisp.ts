import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const authSchema = z.object({
  websiteId: z.string().min(1),
  identifier: z.string().min(1),
  key: z.string().min(1),
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

function crispAuthHeader(identifier: string, key: string) {
  const token = Buffer.from(`${identifier}:${key}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

async function crispGetJson(path: string, authHeader: string) {
  const res = await fetch(`https://api.crisp.chat/v1${path}`, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Crisp API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/crisp/operators
// Body: { websiteId, identifier, key }
router.post('/operators', async (req, res) => {
  try {
    const { websiteId, identifier, key } = authSchema.parse(req.body);
    const authHeader = crispAuthHeader(identifier, key);

    const data: any = await crispGetJson(`/website/${encodeURIComponent(websiteId)}/operator`, authHeader);

    // Crisp commonly responds as { data: [...] }
    const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

    const options = items
      .filter((o: any) => o && (o.user_id != null || o?.user?.user_id != null))
      .map((o: any) => {
        const userId = o?.user_id != null ? String(o.user_id) : String(o?.user?.user_id);
        const nickname = typeof o?.nickname === 'string' ? o.nickname : (typeof o?.user?.nickname === 'string' ? o.user.nickname : '');
        const email = typeof o?.email === 'string' ? o.email : (typeof o?.user?.email === 'string' ? o.user.email : '');
        const label = email ? `${nickname || userId} - ${email}` : (nickname || userId);
        return { value: userId, label };
      });

    return res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Crisp Options] operators error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Crisp operators' });
  }
});

export default router;
