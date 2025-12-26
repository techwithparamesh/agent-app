import { z } from 'zod';

const trelloAuthSchema = z.object({
  apiKey: z.string().min(1),
  token: z.string().min(1),
});

export type TrelloExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

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

function buildQuery(params: Record<string, any>) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      for (const vv of v) usp.append(k, String(vv));
      continue;
    }
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

async function trelloRequestJson(path: string, apiKey: string, token: string, method: 'GET' | 'POST' | 'PUT', params?: any) {
  const query = buildQuery({ ...params, key: apiKey, token });
  const res = await fetch(`https://api.trello.com/1${path}${query}`, {
    method,
    headers: {
      Accept: 'application/json',
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
    throw new Error(`Trello API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeTrelloAction(input: TrelloExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey, token } = trelloAuthSchema.parse({ apiKey: credential.apiKey, token: credential.token });

  if (actionId === 'create_card') {
    const listId = String(config.listId || '').trim();
    const name = String(config.name || '').trim();
    if (!listId) throw new Error('Trello create_card requires listId');
    if (!name) throw new Error('Trello create_card requires name');

    const labels = parseJsonMaybe(config.labels);
    const members = parseJsonMaybe(config.members);

    const params: any = {
      idList: listId,
      name,
      ...(config.desc ? { desc: String(config.desc) } : {}),
      ...(config.due ? { due: String(config.due) } : {}),
      ...(config.pos ? { pos: String(config.pos) } : {}),
      ...(Array.isArray(labels) ? { idLabels: labels } : {}),
      ...(Array.isArray(members) ? { idMembers: members } : {}),
    };

    const data = await trelloRequestJson('/cards', apiKey, token, 'POST', params);
    return { ok: true, card: data, raw: data };
  }

  if (actionId === 'update_card') {
    const cardId = String(config.cardId || '').trim();
    if (!cardId) throw new Error('Trello update_card requires cardId');

    const params: any = {
      ...(config.name != null ? { name: String(config.name) } : {}),
      ...(config.desc != null ? { desc: String(config.desc) } : {}),
      ...(config.due != null ? { due: String(config.due) } : {}),
      ...(config.dueComplete !== undefined ? { dueComplete: Boolean(config.dueComplete) } : {}),
      ...(config.closed !== undefined ? { closed: Boolean(config.closed) } : {}),
    };

    const data = await trelloRequestJson(`/cards/${encodeURIComponent(cardId)}`, apiKey, token, 'PUT', params);
    return { ok: true, card: data, raw: data };
  }

  if (actionId === 'move_card') {
    const cardId = String(config.cardId || '').trim();
    const targetListId = String(config.targetListId || '').trim();
    if (!cardId) throw new Error('Trello move_card requires cardId');
    if (!targetListId) throw new Error('Trello move_card requires targetListId');

    const params: any = {
      idList: targetListId,
      ...(config.pos ? { pos: String(config.pos) } : {}),
    };

    const data = await trelloRequestJson(`/cards/${encodeURIComponent(cardId)}`, apiKey, token, 'PUT', params);
    return { ok: true, card: data, raw: data };
  }

  if (actionId === 'add_comment') {
    const cardId = String(config.cardId || '').trim();
    const text = String(config.text || '').trim();
    if (!cardId) throw new Error('Trello add_comment requires cardId');
    if (!text) throw new Error('Trello add_comment requires text');

    const data = await trelloRequestJson(`/cards/${encodeURIComponent(cardId)}/actions/comments`, apiKey, token, 'POST', { text });
    return { ok: true, comment: data, raw: data };
  }

  if (actionId === 'add_member') {
    const cardId = String(config.cardId || '').trim();
    const memberId = String(config.memberId || '').trim();
    if (!cardId) throw new Error('Trello add_member requires cardId');
    if (!memberId) throw new Error('Trello add_member requires memberId');

    const data = await trelloRequestJson(`/cards/${encodeURIComponent(cardId)}/idMembers`, apiKey, token, 'POST', { value: memberId });
    return { ok: true, result: data, raw: data };
  }

  return { status: 'skipped', reason: `Trello action not implemented: ${actionId}` };
}
