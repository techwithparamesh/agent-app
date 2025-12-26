import { z } from 'zod';

const hfAuthSchema = z.object({
  apiToken: z.string().min(1),
});

export type HuggingFaceExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function safeNum(value: any, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function hfRequest(url: string, apiToken: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HuggingFace API error ${res.status}: ${text || res.statusText}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }

  // Some endpoints may return text; normalize.
  const text = await res.text().catch(() => '');
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

async function fetchAsBytes(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch image URL (${res.status}): ${text || res.statusText}`);
  }
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const bytes = Buffer.from(await res.arrayBuffer());
  return { bytes, contentType };
}

function modelUrl(model: string) {
  return `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
}

export async function executeHuggingFaceAction(input: HuggingFaceExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiToken } = hfAuthSchema.parse({ apiToken: credential.apiToken });

  if (actionId === 'text_generation') {
    const model = String(config.model || '').trim();
    const inputs = String(config.inputs || '').trim();
    if (!model) throw new Error('HuggingFace text_generation requires model');
    if (!inputs) throw new Error('HuggingFace text_generation requires inputs');

    const params: any = {
      max_new_tokens: safeNum(config.maxNewTokens, 250),
      temperature: safeNum(config.temperature, 1.0),
      top_p: safeNum(config.topP, 0.9),
      repetition_penalty: safeNum(config.repetitionPenalty, 1.0),
      do_sample: config.doSample != null ? Boolean(config.doSample) : true,
    };

    const data = await hfRequest(modelUrl(model), apiToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, parameters: params }),
    });

    return { ok: true, model, result: data, raw: data };
  }

  if (actionId === 'sentiment_analysis') {
    const model = String(config.model || '').trim();
    const inputs = String(config.inputs || '').trim();
    if (!model) throw new Error('HuggingFace sentiment_analysis requires model');
    if (!inputs) throw new Error('HuggingFace sentiment_analysis requires inputs');

    const data = await hfRequest(modelUrl(model), apiToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs }),
    });

    return { ok: true, model, result: data, raw: data };
  }

  if (actionId === 'question_answering') {
    const model = String(config.model || '').trim();
    const question = String(config.question || '').trim();
    const context = String(config.context || '').trim();
    if (!model) throw new Error('HuggingFace question_answering requires model');
    if (!question) throw new Error('HuggingFace question_answering requires question');
    if (!context) throw new Error('HuggingFace question_answering requires context');

    const data = await hfRequest(modelUrl(model), apiToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: { question, context } }),
    });

    return { ok: true, model, result: data, raw: data };
  }

  if (actionId === 'summarization') {
    const model = String(config.model || '').trim();
    const inputs = String(config.inputs || '').trim();
    if (!model) throw new Error('HuggingFace summarization requires model');
    if (!inputs) throw new Error('HuggingFace summarization requires inputs');

    const params: any = {
      min_length: safeNum(config.minLength, 30),
      max_length: safeNum(config.maxLength, 130),
    };

    const data = await hfRequest(modelUrl(model), apiToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, parameters: params }),
    });

    return { ok: true, model, result: data, raw: data };
  }

  if (actionId === 'translation') {
    const model = String(config.model || '').trim();
    const inputs = String(config.inputs || '').trim();
    if (!model) throw new Error('HuggingFace translation requires model');
    if (!inputs) throw new Error('HuggingFace translation requires inputs');

    const data = await hfRequest(modelUrl(model), apiToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs }),
    });

    return { ok: true, model, result: data, raw: data };
  }

  if (actionId === 'image_classification') {
    const model = String(config.model || '').trim();
    const imageUrl = String(config.imageUrl || '').trim();
    if (!model) throw new Error('HuggingFace image_classification requires model');
    if (!imageUrl) throw new Error('HuggingFace image_classification requires imageUrl');

    const { bytes, contentType } = await fetchAsBytes(imageUrl);

    const data = await hfRequest(modelUrl(model), apiToken, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: bytes as any,
    });

    return { ok: true, model, result: data, raw: data };
  }

  if (actionId === 'image_to_text') {
    const model = String(config.model || '').trim();
    const imageUrl = String(config.imageUrl || '').trim();
    if (!model) throw new Error('HuggingFace image_to_text requires model');
    if (!imageUrl) throw new Error('HuggingFace image_to_text requires imageUrl');

    const { bytes, contentType } = await fetchAsBytes(imageUrl);

    const data = await hfRequest(modelUrl(model), apiToken, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: bytes as any,
    });

    return { ok: true, model, result: data, raw: data };
  }

  return {
    status: 'skipped',
    reason: `HuggingFace action not implemented: ${actionId}`,
  };
}
