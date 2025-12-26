import { z } from 'zod';

const linkedinAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type LinkedInExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function liJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
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
    throw new Error(`LinkedIn API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeLinkedInAction(input: LinkedInExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = linkedinAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'get_profile') {
    // Basic profile.
    const data = await liJson(accessToken, 'https://api.linkedin.com/v2/me');
    return { ok: true, profile: data, raw: data };
  }

  if (actionId === 'get_connections') {
    // NOTE: Connections API is restricted for most apps; return a clear error.
    throw new Error('LinkedIn get_connections is not available for most API apps (Connections API is restricted).');
  }

  if (actionId === 'create_post') {
    const authorUrn = String(config.authorUrn || '').trim();
    const text = String(config.text || '').trim();

    if (!authorUrn) throw new Error('LinkedIn create_post requires authorUrn (e.g., urn:li:person:...)');
    if (!text) throw new Error('LinkedIn create_post requires text');

    const body = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const data = await liJson(accessToken, 'https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { ok: true, result: data, raw: data };
  }

  if (actionId === 'send_message') {
    // LinkedIn Messaging API is restricted; provide a clear error.
    throw new Error('LinkedIn send_message is not available for most API apps (Messaging API is restricted).');
  }

  return { status: 'skipped', message: `LinkedIn action not implemented: ${actionId}` };
}
