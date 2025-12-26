import { z } from 'zod';

export type RedditExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

const authSchema = z.object({
  accessToken: z.string().min(1),
});

function normalizeSubreddit(input: string) {
  const v = String(input || '').trim();
  if (!v) return '';
  if (v.startsWith('r/')) return v.slice(2);
  if (v.startsWith('/r/')) return v.slice(3);
  return v;
}

async function redditJson(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`https://oauth.reddit.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'agent-app/1.0 (workflow runner)',
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
    throw new Error(`Reddit API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeRedditAction(input: RedditExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = authSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_post') {
    const subreddit = normalizeSubreddit(config.subreddit);
    const title = String(config.title || '').trim();
    const text = String(config.text || '').trim();
    const url = String(config.url || '').trim();

    if (!subreddit) throw new Error('Reddit create_post requires subreddit');
    if (!title) throw new Error('Reddit create_post requires title');
    if (!text && !url) throw new Error('Reddit create_post requires text or url');

    const params = new URLSearchParams();
    params.set('sr', subreddit);
    params.set('title', title);
    params.set('kind', url ? 'link' : 'self');
    if (url) params.set('url', url);
    if (text) params.set('text', text);
    params.set('resubmit', 'true');
    params.set('sendreplies', 'true');

    const data = await redditJson(accessToken, '/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    return { ok: true, raw: data };
  }

  return { status: 'skipped', reason: `Reddit action not implemented: ${actionId}` };
}
