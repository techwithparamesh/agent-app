import { z } from 'zod';

const authSchema = z.object({
  accessToken: z.string().min(1),
});

export type PinterestExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function pinJson(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`https://api.pinterest.com/v5${path}`, {
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
    throw new Error(`Pinterest API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executePinterestAction(input: PinterestExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = authSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_pin') {
    const boardId = String(config.boardId || '').trim();
    const title = config.title != null ? String(config.title).trim() : '';
    const description = config.description != null ? String(config.description) : '';
    const link = config.link != null ? String(config.link).trim() : '';
    const imageUrl = String(config.imageUrl || '').trim();

    if (!boardId) throw new Error('Pinterest create_pin requires boardId');
    if (!imageUrl) throw new Error('Pinterest create_pin requires imageUrl');

    // Pinterest v5 expects a "media_source" object for images.
    const payload: any = {
      board_id: boardId,
      media_source: {
        source_type: 'image_url',
        url: imageUrl,
      },
    };

    if (title) payload.title = title;
    if (description) payload.description = description;
    if (link) payload.link = link;

    const data = await pinJson(accessToken, '/pins', { method: 'POST', body: JSON.stringify(payload) });
    return { ok: true, pin: data, raw: data };
  }

  return { status: 'skipped', reason: `Pinterest action not implemented: ${actionId}` };
}
