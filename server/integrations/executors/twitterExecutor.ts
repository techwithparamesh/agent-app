import { z } from 'zod';

const authSchema = z.object({
  accessToken: z.string().min(1),
});

export type TwitterExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function twitterJson(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`https://api.twitter.com/2${path}`, {
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
    throw new Error(`Twitter API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeTwitterAction(input: TwitterExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = authSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_tweet') {
    const text = String(config.text || '').trim();
    const replyToTweetId = config.replyToTweetId != null ? String(config.replyToTweetId).trim() : '';

    if (!text) throw new Error('Twitter create_tweet requires text');

    const payload: any = { text };
    if (replyToTweetId) payload.reply = { in_reply_to_tweet_id: replyToTweetId };

    const data = await twitterJson(accessToken, '/tweets', { method: 'POST', body: JSON.stringify(payload) });
    return { ok: true, tweet: data?.data, raw: data };
  }

  if (actionId === 'get_profile') {
    const username = config.username != null ? String(config.username).trim() : '';
    const userId = config.userId != null ? String(config.userId).trim() : '';

    if (!username && !userId) throw new Error('Twitter get_profile requires username or userId');

    if (userId) {
      const data = await twitterJson(accessToken, `/users/${encodeURIComponent(userId)}?user.fields=profile_image_url,public_metrics,verified`);
      return { ok: true, user: data?.data, raw: data };
    }

    const data = await twitterJson(accessToken, `/users/by/username/${encodeURIComponent(username)}?user.fields=profile_image_url,public_metrics,verified`);
    return { ok: true, user: data?.data, raw: data };
  }

  return { status: 'skipped', reason: `Twitter action not implemented: ${actionId}` };
}
