import { Router } from 'express';
import { z } from 'zod';

const anthropicRouter = Router();

const authSchema = z.object({
  apiKey: z.string().min(1),
});

async function anGetJson(url: string, apiKey: string) {
  const res = await fetch(url, {
    headers: {
      'x-api-key': apiKey,
      // Anthropic requires a version header for most endpoints.
      'anthropic-version': '2023-06-01',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${text || res.statusText}`);
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

// POST /api/integrations/options/anthropic/models
// Body: { apiKey }
anthropicRouter.post('/models', async (req, res) => {
  try {
    const { apiKey } = authSchema.parse(req.body);

    // Models endpoint shape varies; handle common variants defensively.
    const data = await anGetJson('https://api.anthropic.com/v1/models?limit=100', apiKey);

    const items = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.models)
        ? data.models
        : Array.isArray(data)
          ? data
          : [];

    const options = items
      .map((m: any) => {
        const id = m?.id || m?.name || m?.model;
        if (!id || typeof id !== 'string') return null;
        const label = (m?.display_name || m?.displayName || m?.name || id) as string;
        return { value: id, label };
      })
      .filter((o: any): o is { value: string; label: string } => !!o);

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Anthropic Options] models error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Anthropic models' });
  }
});

export default anthropicRouter;
