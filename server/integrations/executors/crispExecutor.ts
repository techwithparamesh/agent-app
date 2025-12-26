import { z } from 'zod';

const crispAuthSchema = z.object({
  websiteId: z.string().min(1),
  identifier: z.string().min(1),
  key: z.string().min(1),
});

export type CrispExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function crispAuthHeader(identifier: string, key: string) {
  const token = Buffer.from(`${identifier}:${key}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

function parseJsonMaybe(value: any) {
  if (value == null) return undefined;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

async function crispRequestJson(path: string, authHeader: string, method: 'GET' | 'POST' | 'PATCH', body?: any) {
  const res = await fetch(`https://api.crisp.chat/v1${path}`, {
    method,
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Crisp API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeCrispAction(input: CrispExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { websiteId, identifier, key } = crispAuthSchema.parse({
    websiteId: credential.websiteId,
    identifier: credential.identifier,
    key: credential.key,
  });

  const authHeader = crispAuthHeader(identifier, key);

  if (actionId === 'send_message') {
    const sessionId = String(config.sessionId || '').trim();
    const type = String(config.type || '').trim() || 'text';
    const content = String(config.content || '').trim();
    if (!sessionId) throw new Error('Crisp send_message requires sessionId');
    if (!content) throw new Error('Crisp send_message requires content');

    const data = await crispRequestJson(
      `/website/${encodeURIComponent(websiteId)}/conversation/${encodeURIComponent(sessionId)}/message`,
      authHeader,
      'POST',
      {
        type,
        from: 'operator',
        origin: 'chat',
        content,
      },
    );

    return { ok: true, raw: data };
  }

  if (actionId === 'update_profile') {
    const sessionId = String(config.sessionId || '').trim();
    if (!sessionId) throw new Error('Crisp update_profile requires sessionId');

    const dataPayload = parseJsonMaybe(config.data);

    const body: any = {
      ...(config.email ? { email: String(config.email) } : {}),
      ...(config.nickname ? { nickname: String(config.nickname) } : {}),
      ...(config.phone ? { phone: String(config.phone) } : {}),
      ...(config.company ? { company: String(config.company) } : {}),
      ...(dataPayload && typeof dataPayload === 'object' ? { data: dataPayload } : {}),
    };

    // Update conversation meta/profile
    const data = await crispRequestJson(
      `/website/${encodeURIComponent(websiteId)}/conversation/${encodeURIComponent(sessionId)}/meta`,
      authHeader,
      'PATCH',
      body,
    );

    return { ok: true, raw: data };
  }

  if (actionId === 'add_segment') {
    const sessionId = String(config.sessionId || '').trim();
    const segment = String(config.segment || '').trim();
    if (!sessionId) throw new Error('Crisp add_segment requires sessionId');
    if (!segment) throw new Error('Crisp add_segment requires segment');

    const data = await crispRequestJson(
      `/website/${encodeURIComponent(websiteId)}/conversation/${encodeURIComponent(sessionId)}/meta/segments/${encodeURIComponent(segment)}`,
      authHeader,
      'POST',
    );

    return { ok: true, raw: data };
  }

  if (actionId === 'set_state') {
    const sessionId = String(config.sessionId || '').trim();
    const state = String(config.state || '').trim();
    if (!sessionId) throw new Error('Crisp set_state requires sessionId');
    if (!state) throw new Error('Crisp set_state requires state');

    const data = await crispRequestJson(
      `/website/${encodeURIComponent(websiteId)}/conversation/${encodeURIComponent(sessionId)}/meta`,
      authHeader,
      'PATCH',
      { state },
    );

    return { ok: true, raw: data };
  }

  if (actionId === 'assign_conversation') {
    const sessionId = String(config.sessionId || '').trim();
    const operatorId = String(config.operatorId || '').trim();
    if (!sessionId) throw new Error('Crisp assign_conversation requires sessionId');
    if (!operatorId) throw new Error('Crisp assign_conversation requires operatorId');

    const data = await crispRequestJson(
      `/website/${encodeURIComponent(websiteId)}/conversation/${encodeURIComponent(sessionId)}/meta/assignee`,
      authHeader,
      'POST',
      { operator_id: operatorId },
    );

    return { ok: true, raw: data };
  }

  return { status: 'skipped', reason: `Crisp action not implemented: ${actionId}` };
}
