import { Router } from 'express';
import { z } from 'zod';

const huggingfaceRouter = Router();

const authSchema = z.object({
  apiToken: z.string().min(1),
});

async function hfGetJson(url: string, apiToken: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HuggingFace API error ${res.status}: ${text || res.statusText}`);
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

async function listModelsByPipelineTag(pipelineTag: string, apiToken: string) {
  // Public model search endpoint. Sorting by downloads helps pick sensible defaults.
  const url = `https://huggingface.co/api/models?pipeline_tag=${encodeURIComponent(pipelineTag)}&sort=downloads&direction=-1&limit=100`;
  const data = await hfGetJson(url, apiToken);
  const models = Array.isArray(data) ? data : [];

  const options = models
    .map((m: any) => {
      const id = m?.modelId || m?.id || m?.name;
      if (!id || typeof id !== 'string') return null;
      return { value: id, label: id };
    })
    .filter((o: any): o is { value: string; label: string } => !!o);

  return uniqByValue(options);
}

function makeModelsRoute(path: string, pipelineTag: string) {
  huggingfaceRouter.post(path, async (req, res) => {
    try {
      const { apiToken } = authSchema.parse(req.body);
      const options = await listModelsByPipelineTag(pipelineTag, apiToken);
      res.json({ options });
    } catch (error: any) {
      console.error(`[HuggingFace Options] ${path} error:`, error);
      res.status(400).json({ message: error?.message || 'Failed to load HuggingFace models' });
    }
  });
}

// Task-specific model lists (keeps dropdowns relevant and manageable)
makeModelsRoute('/models/text-generation', 'text-generation');
makeModelsRoute('/models/image-classification', 'image-classification');
makeModelsRoute('/models/text-classification', 'text-classification');
makeModelsRoute('/models/question-answering', 'question-answering');
makeModelsRoute('/models/summarization', 'summarization');
makeModelsRoute('/models/translation', 'translation');
makeModelsRoute('/models/image-to-text', 'image-to-text');

export default huggingfaceRouter;
