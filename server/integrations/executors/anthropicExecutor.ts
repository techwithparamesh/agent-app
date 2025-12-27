import { z } from 'zod';

const anthropicAuthSchema = z.object({
  apiKey: z.string().min(1),
});

export type AnthropicExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function anPostJson(url: string, apiKey: string, body: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

function extractTextFromMessageResponse(data: any): string {
  // Anthropic responses can look like: { content: [{ type: 'text', text: '...' }, ...] }
  const content = Array.isArray(data?.content) ? data.content : [];
  const parts = content
    .map((c: any) => (c?.type === 'text' && typeof c?.text === 'string' ? c.text : ''))
    .filter(Boolean);
  if (parts.length) return parts.join('');
  if (typeof data?.completion === 'string') return data.completion;
  return '';
}

export async function executeAnthropicAction(input: AnthropicExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey } = anthropicAuthSchema.parse({ apiKey: credential.apiKey });

  // AppConfigurations.ts uses action ids: message (Send Message) and vision (Vision Analysis)
  if (actionId === 'message') {
    const model = String(config.model || 'claude-3-5-sonnet-20241022');
    const userMessage = String(config.userMessage || '');
    if (!userMessage) throw new Error('Anthropic message requires userMessage');

    const systemPrompt = config.systemPrompt != null ? String(config.systemPrompt) : undefined;
    const maxTokens = config.maxTokens != null ? Number(config.maxTokens) : 1024;
    const temperature = config.temperature != null ? Number(config.temperature) : undefined;
    const topP = config.topP != null ? Number(config.topP) : undefined;
    const topK = config.topK != null ? Number(config.topK) : undefined;

    const body: any = {
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: userMessage }],
      ...(systemPrompt ? { system: systemPrompt } : {}),
      ...(temperature != null ? { temperature } : {}),
      ...(topP != null ? { top_p: topP } : {}),
      ...(topK != null ? { top_k: topK } : {}),
    };

    const data = await anPostJson('https://api.anthropic.com/v1/messages', apiKey, body);
    return { model, text: extractTextFromMessageResponse(data), raw: data };
  }

  if (actionId === 'vision') {
    const model = String(config.model || 'claude-3-5-sonnet-20241022');
    const prompt = String(config.prompt || '');
    const imageUrl = String(config.imageUrl || '');
    if (!prompt) throw new Error('Anthropic vision requires prompt');
    if (!imageUrl) throw new Error('Anthropic vision requires imageUrl');

    const systemPrompt = config.systemPrompt != null ? String(config.systemPrompt) : undefined;
    const maxTokens = config.maxTokens != null ? Number(config.maxTokens) : 1024;
    const temperature = config.temperature != null ? Number(config.temperature) : undefined;
    const topP = config.topP != null ? Number(config.topP) : undefined;
    const topK = config.topK != null ? Number(config.topK) : undefined;

    const messages: any[] = [];
    // Fetch image and send as base64. If it fails, we fall back to text-only.
    try {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const buf = Buffer.from(await imgRes.arrayBuffer());
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        messages.push({
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: contentType,
                data: buf.toString('base64'),
              },
            },
            { type: 'text', text: prompt },
          ],
        });
      } else {
        messages.push({ role: 'user', content: prompt });
      }
    } catch {
      messages.push({ role: 'user', content: prompt });
    }

    const body: any = {
      model,
      max_tokens: maxTokens,
      messages,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      ...(temperature != null ? { temperature } : {}),
      ...(topP != null ? { top_p: topP } : {}),
      ...(topK != null ? { top_k: topK } : {}),
    };

    const data = await anPostJson('https://api.anthropic.com/v1/messages', apiKey, body);
    return { model, text: extractTextFromMessageResponse(data), raw: data };
  }

  return {
    status: 'skipped',
    reason: `Anthropic action not implemented: ${actionId}`,
  };
}
