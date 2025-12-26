import { z } from 'zod';

const clickupAuthSchema = z.object({
  apiToken: z.string().min(1),
});

export type ClickupExecuteInput = {
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

function toMsTimestamp(value: any): number | undefined {
  if (!value) return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  const s = String(value).trim();
  if (!s) return undefined;
  const d = new Date(s);
  const ms = d.getTime();
  if (!Number.isFinite(ms)) return undefined;
  return ms;
}

async function clickupRequestJson(path: string, apiToken: string, method: 'GET' | 'POST' | 'PUT', body?: any) {
  const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
    method,
    headers: {
      Authorization: apiToken,
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
    throw new Error(`ClickUp API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeClickupAction(input: ClickupExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiToken } = clickupAuthSchema.parse({ apiToken: credential.apiToken });

  if (actionId === 'create_task') {
    const listId = String(config.listId || '').trim();
    const name = String(config.name || '').trim();
    if (!listId) throw new Error('ClickUp create_task requires listId');
    if (!name) throw new Error('ClickUp create_task requires name');

    const assignees = parseJsonMaybe(config.assignees);
    const tags = parseJsonMaybe(config.tags);

    const dueDateMs = toMsTimestamp(config.dueDate);

    const body: any = {
      name,
      ...(config.description ? { description: String(config.description) } : {}),
      ...(config.status ? { status: String(config.status) } : {}),
      ...(config.priority ? { priority: Number(config.priority) } : {}),
      ...(dueDateMs ? { due_date: dueDateMs } : {}),
      ...(Array.isArray(assignees) ? { assignees } : {}),
      ...(Array.isArray(tags) ? { tags } : {}),
    };

    const data = await clickupRequestJson(`/list/${encodeURIComponent(listId)}/task`, apiToken, 'POST', body);
    return { ok: true, task: data, raw: data };
  }

  if (actionId === 'update_task') {
    const taskId = String(config.taskId || '').trim();
    if (!taskId) throw new Error('ClickUp update_task requires taskId');

    const body: any = {
      ...(config.name != null ? { name: String(config.name) } : {}),
      ...(config.description != null ? { description: String(config.description) } : {}),
      ...(config.status != null ? { status: String(config.status) } : {}),
      ...(config.priority != null && String(config.priority).length ? { priority: Number(config.priority) } : {}),
    };

    const data = await clickupRequestJson(`/task/${encodeURIComponent(taskId)}`, apiToken, 'PUT', body);
    return { ok: true, task: data, raw: data };
  }

  if (actionId === 'add_comment') {
    const taskId = String(config.taskId || '').trim();
    const commentText = String(config.commentText || '').trim();
    if (!taskId) throw new Error('ClickUp add_comment requires taskId');
    if (!commentText) throw new Error('ClickUp add_comment requires commentText');

    const body: any = {
      comment_text: commentText,
    };

    const data = await clickupRequestJson(`/task/${encodeURIComponent(taskId)}/comment`, apiToken, 'POST', body);
    return { ok: true, comment: data, raw: data };
  }

  return { status: 'skipped', reason: `ClickUp action not implemented: ${actionId}` };
}
