import { Router } from 'express';
import { z } from 'zod';

const elevenlabsRouter = Router();

const authSchema = z.object({
  apiKey: z.string().min(1),
});

async function elGetJson(url: string, apiKey: string) {
  const res = await fetch(url, {
    headers: {
      'xi-api-key': apiKey,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ElevenLabs API error ${res.status}: ${text || res.statusText}`);
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

// POST /api/integrations/options/elevenlabs/voices
// Body: { apiKey }
elevenlabsRouter.post('/voices', async (req, res) => {
  try {
    const { apiKey } = authSchema.parse(req.body);

    const data = await elGetJson('https://api.elevenlabs.io/v1/voices', apiKey);
    const voices = Array.isArray(data?.voices) ? data.voices : [];

    const options = voices
      .filter((v: any) => v && (v.voice_id || v.voiceId) && (v.name || v.voice_id))
      .map((v: any) => ({
        value: String(v.voice_id || v.voiceId),
        label: String(v.name || v.voice_id || v.voiceId),
      }));

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[ElevenLabs Options] voices error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load ElevenLabs voices' });
  }
});

export default elevenlabsRouter;
