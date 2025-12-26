import { z } from 'zod';

const googleAiAuthSchema = z.object({
  apiKey: z.string().min(1),
});

export type GoogleAiExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function gaJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Google AI API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
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

function extractGeminiText(data: any): string {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  const first = candidates[0];
  const parts = Array.isArray(first?.content?.parts) ? first.content.parts : [];
  const texts = parts
    .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
    .filter((t: string) => t.length > 0);
  return texts.join('');
}

function safeNum(value: any, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function executeGoogleAiAction(input: GoogleAiExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey } = googleAiAuthSchema.parse({ apiKey: credential.apiKey });

  if (actionId === 'generate_content') {
    const model = String(config.model || 'gemini-1.5-flash').trim();
    const prompt = String(config.prompt || '').trim();
    if (!prompt) throw new Error('Google AI generate_content requires prompt');

    const systemInstruction = config.systemInstruction != null ? String(config.systemInstruction).trim() : '';
    const combinedPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

    const temperature = safeNum(config.temperature, 1.0);
    const maxOutputTokens = safeNum(config.maxOutputTokens, 2048);
    const topP = safeNum(config.topP, 0.95);
    const topK = safeNum(config.topK, 40);

    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`);
    url.searchParams.set('key', apiKey);

    const body = {
      contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens,
        topP,
        topK,
      },
    };

    const data = await gaJson(url.toString(), { method: 'POST', body: JSON.stringify(body) });
    return {
      model,
      text: extractGeminiText(data),
      raw: data,
    };
  }

  if (actionId === 'analyze_image') {
    const model = String(config.model || 'gemini-1.5-flash').trim();
    const imageUrl = String(config.imageUrl || '').trim();
    const prompt = String(config.prompt || '').trim();
    if (!imageUrl) throw new Error('Google AI analyze_image requires imageUrl');
    if (!prompt) throw new Error('Google AI analyze_image requires prompt');

    const maxOutputTokens = safeNum(config.maxOutputTokens, 2048);

    const { bytes, contentType } = await fetchAsBytes(imageUrl);

    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`);
    url.searchParams.set('key', apiKey);

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: contentType,
                data: bytes.toString('base64'),
              },
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens,
      },
    };

    const data = await gaJson(url.toString(), { method: 'POST', body: JSON.stringify(body) });
    return {
      model,
      contentType,
      text: extractGeminiText(data),
      raw: data,
    };
  }

  if (actionId === 'embed_content') {
    const model = String(config.model || 'text-embedding-004').trim();
    const content = String(config.content || '').trim();
    if (!content) throw new Error('Google AI embed_content requires content');

    const taskType = config.taskType != null ? String(config.taskType).trim() : '';

    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:embedContent`);
    url.searchParams.set('key', apiKey);

    const body: any = {
      content: { parts: [{ text: content }] },
      ...(taskType ? { taskType } : {}),
    };

    const data = await gaJson(url.toString(), { method: 'POST', body: JSON.stringify(body) });

    const embedding = data?.embedding?.values;
    return {
      model,
      embedding: Array.isArray(embedding) ? embedding : [],
      raw: data,
    };
  }

  return {
    status: 'skipped',
    reason: `Google AI action not implemented: ${actionId}`,
  };
}
