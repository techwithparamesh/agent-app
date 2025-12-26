import { Router } from 'express';
import { z } from 'zod';

const replicateRouter = Router();

const authSchema = z.object({
  apiToken: z.string().min(1),
});

const versionsSchema = authSchema.extend({
  model: z.string().min(1), // owner/name
});

async function repGetJson(url: string, apiToken: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Token ${apiToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Replicate API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

function uniqByValue(options: { value: string; label: string }[]) {
  const seen = new Set<string>();
  const out: { value: string; label: string }[] = [];
  for (const o of options) {
    if (seen.has(o.value)) continue;
    seen.add(o.value);
    out.push(o);
  }
  return out;
}

function parseOwnerName(model: string) {
  const trimmed = model.trim();
  const parts = trimmed.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const owner = parts[0];
  const name = parts.slice(1).join('/');
  return { owner, name };
}

// POST /api/integrations/options/replicate/models
// Body: { apiToken }
// Returns first page of public models (paginated).
replicateRouter.post('/models', async (req, res) => {
  try {
    const { apiToken } = authSchema.parse(req.body);

    const data = await repGetJson('https://api.replicate.com/v1/models?limit=100', apiToken);
    const results = Array.isArray(data?.results) ? data.results : [];

    const options = results
      .map((m: any) => {
        const owner = m?.owner;
        const name = m?.name;
        if (typeof owner !== 'string' || typeof name !== 'string') return null;
        const value = `${owner}/${name}`;
        const label = (typeof m?.description === 'string' && m.description.trim().length > 0)
          ? `${value} — ${m.description.trim()}`
          : value;
        return { value, label };
      })
      .filter((o: any): o is { value: string; label: string } => !!o);

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Replicate Options] models error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Replicate models' });
  }
});

// POST /api/integrations/options/replicate/versions
// Body: { apiToken, model }
replicateRouter.post('/versions', async (req, res) => {
  try {
    const { apiToken, model } = versionsSchema.parse(req.body);
    const parsed = parseOwnerName(model);
    if (!parsed) {
      return res.status(400).json({ message: 'Invalid model format. Expected owner/model.' });
    }

    const data = await repGetJson(
      `https://api.replicate.com/v1/models/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.name)}/versions?limit=100`,
      apiToken,
    );

    const results = Array.isArray(data?.results) ? data.results : [];

    const options = results
      .map((v: any) => {
        const id = v?.id;
        if (typeof id !== 'string' || id.length === 0) return null;
        const createdAt = typeof v?.created_at === 'string' ? v.created_at : '';
        const label = createdAt ? `${id} (${createdAt})` : id;
        return { value: id, label };
      })
      .filter((o: any): o is { value: string; label: string } => !!o);

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Replicate Options] versions error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Replicate versions' });
  }
});

export default replicateRouter;
