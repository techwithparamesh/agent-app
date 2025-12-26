import { z } from 'zod';

const authSchema = z.object({
  accessToken: z.string().min(1),
});

export type YouTubeExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function ytJson(accessToken: string, url: string, init?: RequestInit) {
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
    throw new Error(`YouTube API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeYouTubeAction(input: YouTubeExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = authSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'upload_video') {
    // The UI explicitly notes upload handling depends on implementation.
    // We do a safe "metadata-only" behavior: validate fields and return a skipped response.
    const title = String(config.title || '').trim();
    const description = config.description != null ? String(config.description) : '';
    const privacyStatus = String(config.privacyStatus || 'private');
    const videoUrl = config.videoUrl != null ? String(config.videoUrl).trim() : '';

    if (!title) throw new Error('YouTube upload_video requires title');

    // Non-destructive probe (optional): fetch channel info to ensure token works.
    // This helps surface auth errors early without attempting an upload.
    await ytJson(
      accessToken,
      'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&maxResults=1'
    );

    return {
      status: 'skipped',
      reason: 'Video upload is implementation-dependent (metadata-only stub)',
      requested: { title, description, privacyStatus, videoUrl: videoUrl || undefined },
    };
  }

  return { status: 'skipped', reason: `YouTube action not implemented: ${actionId}` };
}
