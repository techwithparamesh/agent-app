import { z } from 'zod';

const authSchema = z.object({
  accessToken: z.string().min(1),
});

export type DriftExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function driftJson(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`https://driftapi.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
    throw new Error(`Drift API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeDriftAction(input: DriftExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = authSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'send_message') {
    const conversationId = String(config.conversationId || '').trim();
    const body = String(config.body || '').trim();

    if (!conversationId) throw new Error('Drift send_message requires conversationId');
    if (!body) throw new Error('Drift send_message requires body');

    // Best-effort: Drift chat message endpoint. If tenant setup differs, this will return a helpful API error.
    const data = await driftJson(accessToken, `/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });

    return { ok: true, raw: data };
  }

  return { status: 'skipped', reason: `Drift action not implemented: ${actionId}` };
}
