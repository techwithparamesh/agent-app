import { z } from 'zod';

const authSchema = z.object({
  endpoint: z.string().min(1),
  apiKey: z.string().min(1),
  apiVersion: z.string().min(1).optional(),
  deployment: z.string().min(1),
});

export type AzureOpenAiExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function normalizeEndpoint(endpoint: string) {
  return endpoint.replace(/\/+$/, '');
}

export async function executeAzureOpenAiAction(input: AzureOpenAiExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;

  const { endpoint, apiKey, apiVersion, deployment } = authSchema.parse({
    endpoint: credential.endpoint,
    apiKey: credential.apiKey,
    apiVersion: credential.apiVersion,
    deployment: credential.deployment,
  });

  if (actionId !== 'chat_completion') {
    return { status: 'skipped', reason: `Azure OpenAI action not implemented: ${actionId}` };
  }

  const prompt = String(config.prompt || '').trim();
  if (!prompt) throw new Error('Azure OpenAI chat_completion requires prompt');

  const system = config.system != null ? String(config.system) : '';
  const temperature = config.temperature != null ? Number(config.temperature) : 0.7;
  const maxTokens = config.maxTokens != null ? Number(config.maxTokens) : 512;

  const url = new URL(
    `${normalizeEndpoint(endpoint)}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions`,
  );
  url.searchParams.set('api-version', String(apiVersion || '2024-02-15-preview'));

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Azure OpenAI API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  return {
    deployment,
    text: typeof content === 'string' ? content : '',
    raw: data,
  };
}
