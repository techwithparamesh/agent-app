import { z } from 'zod';

export type MastodonExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

const authSchema = z.object({
  instanceUrl: z.string().min(1),
  accessToken: z.string().min(1),
});

function joinUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function mastodonJson(instanceUrl: string, accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(joinUrl(instanceUrl, path), {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    throw new Error(`Mastodon API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeMastodonAction(input: MastodonExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { instanceUrl, accessToken } = authSchema.parse({
    instanceUrl: credential.instanceUrl,
    accessToken: credential.accessToken,
  });

  if (actionId === 'create_status') {
    const status = String(config.status || '').trim();
    const visibility = String(config.visibility || 'public').trim();
    if (!status) throw new Error('Mastodon create_status requires status');

    const body = new URLSearchParams();
    body.set('status', status);
    body.set('visibility', visibility);

    const data = await mastodonJson(instanceUrl, accessToken, '/api/v1/statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    return { ok: true, status: data, raw: data };
  }

  return { status: 'skipped', reason: `Mastodon action not implemented: ${actionId}` };
}
