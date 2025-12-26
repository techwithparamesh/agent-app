import { z } from 'zod';

const openAiAuthSchema = z.object({
  apiKey: z.string().min(1),
  organization: z.string().min(1).optional(),
});

async function oaFetchJson(url: string, apiKey: string, body: any, organization?: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(organization ? { 'OpenAI-Organization': organization } : {}),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

export type OpenAiExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

export async function executeOpenAiAction(input: OpenAiExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey, organization } = openAiAuthSchema.parse({
    apiKey: credential.apiKey,
    organization: credential.organization,
  });

  if (actionId === 'chat_completion') {
    const model = String(config.model || 'gpt-4o-mini');
    const userMessage = String(config.userMessage || '');
    if (!userMessage) throw new Error('OpenAI chat_completion requires userMessage');

    const systemPrompt = config.systemPrompt != null ? String(config.systemPrompt) : '';
    const temperature = config.temperature != null ? Number(config.temperature) : 0.7;
    const maxTokens = config.maxTokens != null ? Number(config.maxTokens) : 1000;

    const responseFormat = config.responseFormat === 'json_object' ? { type: 'json_object' } : undefined;

    const data = await oaFetchJson(
      'https://api.openai.com/v1/chat/completions',
      apiKey,
      {
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: userMessage },
        ],
        temperature,
        max_tokens: maxTokens,
        ...(responseFormat ? { response_format: responseFormat } : {}),
      },
      organization,
    );

    const content = data?.choices?.[0]?.message?.content;
    return {
      model,
      text: typeof content === 'string' ? content : '',
      raw: data,
    };
  }

  if (actionId === 'create_embedding') {
    const model = String(config.model || 'text-embedding-3-small');
    const inputText = String(config.input || '');
    if (!inputText) throw new Error('OpenAI create_embedding requires input');

    const data = await oaFetchJson(
      'https://api.openai.com/v1/embeddings',
      apiKey,
      { model, input: inputText },
      organization,
    );

    const embedding = data?.data?.[0]?.embedding;
    return {
      model,
      embedding: Array.isArray(embedding) ? embedding : [],
      raw: data,
    };
  }

  if (actionId === 'generate_image') {
    const model = String(config.model || 'dall-e-3');
    const prompt = String(config.prompt || '');
    if (!prompt) throw new Error('OpenAI generate_image requires prompt');

    const size = String(config.size || '1024x1024');
    const quality = String(config.quality || 'standard');
    const style = String(config.style || 'vivid');

    const data = await oaFetchJson(
      'https://api.openai.com/v1/images/generations',
      apiKey,
      { model, prompt, size, quality, style },
      organization,
    );

    const url = data?.data?.[0]?.url;
    return {
      model,
      url: typeof url === 'string' ? url : '',
      raw: data,
    };
  }

  if (actionId === 'text_to_speech') {
    // The TTS endpoint returns binary audio; we return base64 for now.
    const model = String(config.model || 'tts-1');
    const inputText = String(config.input || '');
    if (!inputText) throw new Error('OpenAI text_to_speech requires input');

    const voice = String(config.voice || 'alloy');
    const speed = config.speed != null ? Number(config.speed) : 1.0;

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(organization ? { 'OpenAI-Organization': organization } : {}),
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({ model, input: inputText, voice, speed, format: 'mp3' }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`OpenAI API error ${res.status}: ${text || res.statusText}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    return {
      model,
      voice,
      contentType: 'audio/mpeg',
      audioBase64: buf.toString('base64'),
    };
  }

  // File-based transcribe_audio is not supported via this JSON execute endpoint yet.
  if (actionId === 'transcribe_audio') {
    return {
      status: 'skipped',
      reason: 'transcribe_audio requires file upload support (not implemented yet)',
    };
  }

  return {
    status: 'skipped',
    reason: `OpenAI action not implemented: ${actionId}`,
  };
}
