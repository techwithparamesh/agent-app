import { Router } from 'express';
import { z } from 'zod';

const openaiRouter = Router();

const authSchema = z.object({
  apiKey: z.string().min(1),
  organization: z.string().min(1).optional(),
});

async function oaGetJson(url: string, apiKey: string, organization?: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(organization ? { 'OpenAI-Organization': organization } : {}),
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI API error ${res.status}: ${text || res.statusText}`);
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

async function listModels(apiKey: string, organization?: string): Promise<string[]> {
  const data = await oaGetJson('https://api.openai.com/v1/models', apiKey, organization);
  const arr = Array.isArray(data?.data) ? data.data : [];
  const ids: string[] = arr
    .map((m: any) => m?.id)
    .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);

  const unique = Array.from(new Set<string>(ids));
  return unique.sort((a, b) => a.localeCompare(b));
}

function asOptions(ids: string[]) {
  return uniqByValue(ids.map((id) => ({ value: id, label: id })));
}

function filterChat(ids: string[]) {
  return ids.filter((id) => /^(gpt|o\d)/i.test(id) || id.includes('chat'));
}

function filterImage(ids: string[]) {
  return ids.filter((id) => /dall-e|gpt-image/i.test(id));
}

function filterEmbedding(ids: string[]) {
  return ids.filter((id) => /embedding/i.test(id));
}

function filterTts(ids: string[]) {
  return ids.filter((id) => /\btts\b|text-to-speech/i.test(id));
}

function filterTranscription(ids: string[]) {
  return ids.filter((id) => /whisper|transcrib/i.test(id));
}

// POST /api/integrations/options/openai/chat-models
openaiRouter.post('/chat-models', async (req, res) => {
  try {
    const { apiKey, organization } = authSchema.parse(req.body);
    const ids = await listModels(apiKey, organization);
    res.json({ options: asOptions(filterChat(ids)) });
  } catch (error: any) {
    console.error('[OpenAI Options] chat-models error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load OpenAI chat models' });
  }
});

// POST /api/integrations/options/openai/image-models
openaiRouter.post('/image-models', async (req, res) => {
  try {
    const { apiKey, organization } = authSchema.parse(req.body);
    const ids = await listModels(apiKey, organization);
    res.json({ options: asOptions(filterImage(ids)) });
  } catch (error: any) {
    console.error('[OpenAI Options] image-models error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load OpenAI image models' });
  }
});

// POST /api/integrations/options/openai/embedding-models
openaiRouter.post('/embedding-models', async (req, res) => {
  try {
    const { apiKey, organization } = authSchema.parse(req.body);
    const ids = await listModels(apiKey, organization);
    res.json({ options: asOptions(filterEmbedding(ids)) });
  } catch (error: any) {
    console.error('[OpenAI Options] embedding-models error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load OpenAI embedding models' });
  }
});

// POST /api/integrations/options/openai/tts-models
openaiRouter.post('/tts-models', async (req, res) => {
  try {
    const { apiKey, organization } = authSchema.parse(req.body);
    const ids = await listModels(apiKey, organization);
    res.json({ options: asOptions(filterTts(ids)) });
  } catch (error: any) {
    console.error('[OpenAI Options] tts-models error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load OpenAI TTS models' });
  }
});

// POST /api/integrations/options/openai/transcription-models
openaiRouter.post('/transcription-models', async (req, res) => {
  try {
    const { apiKey, organization } = authSchema.parse(req.body);
    const ids = await listModels(apiKey, organization);
    res.json({ options: asOptions(filterTranscription(ids)) });
  } catch (error: any) {
    console.error('[OpenAI Options] transcription-models error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load OpenAI transcription models' });
  }
});

export default openaiRouter;
