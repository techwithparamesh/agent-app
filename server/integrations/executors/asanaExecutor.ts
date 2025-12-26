import { z } from 'zod';

const asanaAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type AsanaExecuteInput = {
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

async function asanaRequestJson(path: string, accessToken: string, method: 'GET' | 'POST' | 'PUT', body?: any) {
  const res = await fetch(`https://app.asana.com/api/1.0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    throw new Error(`Asana API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function dueFieldsFromDueOn(dueOn: any): { due_at?: string; due_on?: string } {
  if (!dueOn) return {};
  const s = String(dueOn).trim();
  if (!s) return {};

  // If it includes a time component, prefer due_at.
  if (s.includes('T')) return { due_at: s };
  return { due_on: s };
}

export async function executeAsanaAction(input: AsanaExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = asanaAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_task') {
    const projectId = String(config.projectId || '').trim();
    const workspaceId = String(config.workspaceId || '').trim();
    const name = String(config.name || '').trim();
    if (!workspaceId) throw new Error('Asana create_task requires workspaceId');
    if (!projectId) throw new Error('Asana create_task requires projectId');
    if (!name) throw new Error('Asana create_task requires name');

    const body: any = {
      data: {
        workspace: workspaceId,
        projects: [projectId],
        name,
        ...(config.notes ? { notes: String(config.notes) } : {}),
        ...(config.assignee ? { assignee: String(config.assignee) } : {}),
        ...dueFieldsFromDueOn(config.dueOn),
      },
    };

    const tags = parseJsonMaybe(config.tags);
    if (Array.isArray(tags) && tags.length) body.data.tags = tags.map(String);

    const data = await asanaRequestJson('/tasks', accessToken, 'POST', body);
    return { ok: true, task: data?.data, raw: data };
  }

  if (actionId === 'update_task') {
    const taskId = String(config.taskId || '').trim();
    if (!taskId) throw new Error('Asana update_task requires taskId');

    const dataBody: any = {
      ...(config.name != null ? { name: String(config.name) } : {}),
      ...(config.notes != null ? { notes: String(config.notes) } : {}),
      ...(config.completed !== undefined ? { completed: Boolean(config.completed) } : {}),
      ...(config.assignee != null ? { assignee: String(config.assignee) } : {}),
      ...dueFieldsFromDueOn(config.dueOn),
    };

    const data = await asanaRequestJson(`/tasks/${encodeURIComponent(taskId)}`, accessToken, 'PUT', { data: dataBody });
    return { ok: true, task: data?.data, raw: data };
  }

  if (actionId === 'complete_task') {
    const taskId = String(config.taskId || '').trim();
    if (!taskId) throw new Error('Asana complete_task requires taskId');

    const data = await asanaRequestJson(`/tasks/${encodeURIComponent(taskId)}`, accessToken, 'PUT', { data: { completed: true } });
    return { ok: true, task: data?.data, raw: data };
  }

  if (actionId === 'add_comment') {
    const taskId = String(config.taskId || '').trim();
    const text = String(config.text || '').trim();
    if (!taskId) throw new Error('Asana add_comment requires taskId');
    if (!text) throw new Error('Asana add_comment requires text');

    const data = await asanaRequestJson(`/tasks/${encodeURIComponent(taskId)}/stories`, accessToken, 'POST', {
      data: { text },
    });

    return { ok: true, story: data?.data, raw: data };
  }

  if (actionId === 'create_subtask') {
    const parentTaskId = String(config.parentTaskId || '').trim();
    const name = String(config.name || '').trim();
    if (!parentTaskId) throw new Error('Asana create_subtask requires parentTaskId');
    if (!name) throw new Error('Asana create_subtask requires name');

    const body: any = {
      data: {
        name,
        ...(config.notes ? { notes: String(config.notes) } : {}),
      },
    };

    const data = await asanaRequestJson(`/tasks/${encodeURIComponent(parentTaskId)}/subtasks`, accessToken, 'POST', body);
    return { ok: true, subtask: data?.data, raw: data };
  }

  return { status: 'skipped', reason: `Asana action not implemented: ${actionId}` };
}
