import { z } from 'zod';

const authSchema = z.object({
  accessToken: z.string().min(1),
});

export type InstagramExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function graphJson(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
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
    throw new Error(`Instagram Graph API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeInstagramAction(input: InstagramExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = authSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_post') {
    const instagramAccountId = String(config.instagramAccountId || '').trim();
    const imageUrl = String(config.imageUrl || '').trim();
    const caption = config.caption != null ? String(config.caption) : '';

    if (!instagramAccountId) throw new Error('Instagram create_post requires instagramAccountId');
    if (!imageUrl) throw new Error('Instagram create_post requires imageUrl');

    // 1) Create media container
    const createParams = new URLSearchParams();
    createParams.set('image_url', imageUrl);
    if (caption) createParams.set('caption', caption);
    createParams.set('access_token', accessToken);

    const created = await graphJson(`https://graph.facebook.com/v19.0/${encodeURIComponent(instagramAccountId)}/media?${createParams.toString()}`, {
      method: 'POST',
    });

    const creationId = String(created?.id || '').trim();
    if (!creationId) throw new Error('Instagram media creation did not return id');

    // 2) Publish media
    const publishParams = new URLSearchParams();
    publishParams.set('creation_id', creationId);
    publishParams.set('access_token', accessToken);

    const published = await graphJson(`https://graph.facebook.com/v19.0/${encodeURIComponent(instagramAccountId)}/media_publish?${publishParams.toString()}`, {
      method: 'POST',
    });

    return { ok: true, creationId, publishResult: published, raw: { created, published } };
  }

  return { status: 'skipped', reason: `Instagram action not implemented: ${actionId}` };
}
