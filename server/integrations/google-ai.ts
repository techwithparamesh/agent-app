import { Router } from 'express';
import { z } from 'zod';

const googleAiRouter = Router();

const authSchema = z.object({
  apiKey: z.string().min(1),
});

async function gaGetJson(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google AI API error ${res.status}: ${text || res.statusText}`);
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

function stripModelsPrefix(name: string) {
  return name.startsWith('models/') ? name.slice('models/'.length) : name;
}

// POST /api/integrations/options/google_ai/models
// Body: { apiKey }
// Returns available Gemini model ids.
googleAiRouter.post('/models', async (req, res) => {
  try {
    const { apiKey } = authSchema.parse(req.body);

    const data = await gaGetJson(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
    );

    const models = Array.isArray(data?.models) ? data.models : [];

    const options = models
      .map((m: any) => {
        const rawName = m?.name;
        if (!rawName || typeof rawName !== 'string') return null;
        const value = stripModelsPrefix(rawName);
        const label = (m?.displayName && typeof m.displayName === 'string') ? m.displayName : value;
        return { value, label };
      })
      .filter((o: any): o is { value: string; label: string } => !!o)
      .sort((a: { value: string; label: string }, b: { value: string; label: string }) => a.label.localeCompare(b.label));

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Google AI Options] models error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Google AI models' });
  }
});

export default googleAiRouter;
