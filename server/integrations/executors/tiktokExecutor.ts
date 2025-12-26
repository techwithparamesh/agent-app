import { z } from 'zod';

const authSchema = z.object({
  accessToken: z.string().min(1),
});

export type TikTokExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function ttJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
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
    throw new Error(`TikTok API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeTikTokAction(input: TikTokExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = authSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_post') {
    // Posting is explicitly marked implementation-dependent in the UI.
    const caption = config.caption != null ? String(config.caption) : '';
    const videoUrl = String(config.videoUrl || '').trim();
    if (!videoUrl) throw new Error('TikTok create_post requires videoUrl');

    // Non-destructive probe to validate token.
    // TikTok's APIs vary by product; "user.info.basic" is requested in UI scopes.
    // We attempt a best-effort call; if it fails, surface the error.
    await ttJson(accessToken, 'https://open.tiktokapis.com/v2/user/info/?fields=open_id');

    return {
      status: 'skipped',
      reason: 'TikTok posting is implementation-dependent (stub)',
      requested: { caption, videoUrl },
    };
  }

  return { status: 'skipped', reason: `TikTok action not implemented: ${actionId}` };
}
