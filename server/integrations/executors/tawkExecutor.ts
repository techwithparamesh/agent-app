import { z } from 'zod';

export type TawkExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

const tawkCredSchema = z.object({
  apiKey: z.string().min(1),
  propertyId: z.string().min(1),
  // Optional override: some deployments/proxies may require a different base URL.
  // Default is a best-effort guess; if your account uses a different endpoint,
  // set baseUrl in the credential payload.
  baseUrl: z.string().min(1).optional(),
});

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

async function tawkRequest(
  baseUrl: string,
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: any; headers: Record<string, string> }>{
  const url = `${normalizeBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`;

  const doFetch = async (headers: Record<string, string>) => {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
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

    return {
      ok: res.ok,
      status: res.status,
      data,
      headers: Object.fromEntries(res.headers.entries()),
    };
  };

  // Best-effort auth strategies (since official REST docs may vary by account/region):
  // 1) Bearer token
  // 2) X-API-Key header
  const r1 = await doFetch({ Authorization: `Bearer ${apiKey}` });
  if (r1.ok || (r1.status !== 401 && r1.status !== 403)) return r1;
  return doFetch({ 'X-API-Key': apiKey });
}

export async function executeTawkAction(input: TawkExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;

  const cred = tawkCredSchema.parse({
    apiKey: credential.apiKey,
    propertyId: credential.propertyId,
    baseUrl: credential.baseUrl,
  });

  const baseUrl = cred.baseUrl || 'https://api.tawk.to/v1';
  const propertyId = String(cred.propertyId).trim();

  if (actionId === 'create_ticket') {
    const subject = String(config.subject || '').trim();
    const message = String(config.message || '').trim();
    const requesterName = String(config.requesterName || '').trim();
    const requesterEmail = String(config.requesterEmail || '').trim();
    const priority = String(config.priority || 'medium').trim();

    if (!subject) throw new Error('Tawk create_ticket requires subject');
    if (!message) throw new Error('Tawk create_ticket requires message');
    if (!requesterName) throw new Error('Tawk create_ticket requires requesterName');
    if (!requesterEmail) throw new Error('Tawk create_ticket requires requesterEmail');

    const body = {
      subject,
      message,
      requester: { name: requesterName, email: requesterEmail },
      priority,
    };

    const resp = await tawkRequest(baseUrl, cred.apiKey, `/properties/${encodeURIComponent(propertyId)}/tickets`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error(
        `Tawk create_ticket failed (${resp.status}). If your Tawk account uses a different API base/path, set credential.baseUrl. Response: ${
          typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data)
        }`,
      );
    }

    return { ok: true, ticket: resp.data, raw: resp.data };
  }

  if (actionId === 'send_message') {
    const chatId = String(config.chatId || '').trim();
    const message = String(config.message || '').trim();
    if (!chatId) throw new Error('Tawk send_message requires chatId');
    if (!message) throw new Error('Tawk send_message requires message');

    const body = { message };
    const resp = await tawkRequest(
      baseUrl,
      cred.apiKey,
      `/properties/${encodeURIComponent(propertyId)}/chats/${encodeURIComponent(chatId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    );

    if (!resp.ok) {
      throw new Error(
        `Tawk send_message failed (${resp.status}). If your Tawk account uses a different API base/path, set credential.baseUrl. Response: ${
          typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data)
        }`,
      );
    }

    return { ok: true, result: resp.data, raw: resp.data };
  }

  if (actionId === 'get_visitor_info') {
    const visitorId = String(config.visitorId || '').trim();
    if (!visitorId) throw new Error('Tawk get_visitor_info requires visitorId');

    const resp = await tawkRequest(
      baseUrl,
      cred.apiKey,
      `/properties/${encodeURIComponent(propertyId)}/visitors/${encodeURIComponent(visitorId)}`,
      { method: 'GET' },
    );

    if (!resp.ok) {
      throw new Error(
        `Tawk get_visitor_info failed (${resp.status}). If your Tawk account uses a different API base/path, set credential.baseUrl. Response: ${
          typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data)
        }`,
      );
    }

    return { ok: true, visitor: resp.data, raw: resp.data };
  }

  if (actionId === 'ban_visitor') {
    const visitorId = String(config.visitorId || '').trim();
    if (!visitorId) throw new Error('Tawk ban_visitor requires visitorId');
    const reason = config.reason != null ? String(config.reason) : undefined;

    const body: any = {};
    if (reason && reason.trim().length) body.reason = reason.trim();

    const resp = await tawkRequest(
      baseUrl,
      cred.apiKey,
      `/properties/${encodeURIComponent(propertyId)}/visitors/${encodeURIComponent(visitorId)}/ban`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    );

    if (!resp.ok) {
      throw new Error(
        `Tawk ban_visitor failed (${resp.status}). If your Tawk account uses a different API base/path, set credential.baseUrl. Response: ${
          typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data)
        }`,
      );
    }

    return { ok: true, result: resp.data, raw: resp.data };
  }

  return {
    status: 'skipped',
    message: `Tawk action not implemented: ${actionId}`,
  };
}
