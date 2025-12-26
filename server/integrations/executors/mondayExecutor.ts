import { z } from 'zod';

const mondayAuthSchema = z.object({
  apiToken: z.string().min(1),
});

export type MondayExecuteInput = {
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

async function mondayGraphql(apiToken: string, query: string, variables?: any) {
  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      Authorization: apiToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Monday API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  if (data?.errors?.length) {
    throw new Error(`Monday GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  return data?.data;
}

export async function executeMondayAction(input: MondayExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiToken } = mondayAuthSchema.parse({ apiToken: credential.apiToken });

  if (actionId === 'create_item') {
    const boardId = Number(config.boardId);
    const itemName = String(config.itemName || '').trim();
    if (!Number.isFinite(boardId)) throw new Error('Monday create_item requires boardId');
    if (!itemName) throw new Error('Monday create_item requires itemName');

    const groupId = config.groupId ? String(config.groupId).trim() : undefined;
    const columnValuesObj = parseJsonMaybe(config.columnValues);
    const columnValues = columnValuesObj ? JSON.stringify(columnValuesObj) : undefined;

    const query = `mutation ($boardId: Int!, $itemName: String!, $groupId: String, $columnValues: JSON) {
      create_item(board_id: $boardId, item_name: $itemName, group_id: $groupId, column_values: $columnValues) { id name }
    }`;

    const data = await mondayGraphql(apiToken, query, {
      boardId: Math.trunc(boardId),
      itemName,
      groupId: groupId || null,
      columnValues: columnValues || null,
    });

    return { ok: true, item: data?.create_item, raw: data };
  }

  if (actionId === 'update_item') {
    const itemId = Number(config.itemId);
    const boardId = Number(config.boardId);
    const columnValuesObj = parseJsonMaybe(config.columnValues);
    if (!Number.isFinite(itemId)) throw new Error('Monday update_item requires itemId');
    if (!Number.isFinite(boardId)) throw new Error('Monday update_item requires boardId');
    if (!columnValuesObj) throw new Error('Monday update_item requires columnValues (json)');

    const query = `mutation ($boardId: Int!, $itemId: Int!, $columnValues: JSON!) {
      change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $columnValues) { id }
    }`;

    const data = await mondayGraphql(apiToken, query, {
      boardId: Math.trunc(boardId),
      itemId: Math.trunc(itemId),
      columnValues: JSON.stringify(columnValuesObj),
    });

    return { ok: true, item: data?.change_multiple_column_values, raw: data };
  }

  if (actionId === 'create_update') {
    const itemId = Number(config.itemId);
    const body = String(config.body || '').trim();
    if (!Number.isFinite(itemId)) throw new Error('Monday create_update requires itemId');
    if (!body) throw new Error('Monday create_update requires body');

    const query = `mutation ($itemId: Int!, $body: String!) {
      create_update(item_id: $itemId, body: $body) { id }
    }`;

    const data = await mondayGraphql(apiToken, query, { itemId: Math.trunc(itemId), body });
    return { ok: true, update: data?.create_update, raw: data };
  }

  if (actionId === 'move_item') {
    const itemId = Number(config.itemId);
    const groupId = String(config.groupId || '').trim();
    if (!Number.isFinite(itemId)) throw new Error('Monday move_item requires itemId');
    if (!groupId) throw new Error('Monday move_item requires groupId');

    const query = `mutation ($itemId: Int!, $groupId: String!) {
      move_item_to_group(item_id: $itemId, group_id: $groupId) { id }
    }`;

    const data = await mondayGraphql(apiToken, query, { itemId: Math.trunc(itemId), groupId });
    return { ok: true, item: data?.move_item_to_group, raw: data };
  }

  return { status: 'skipped', reason: `Monday action not implemented: ${actionId}` };
}
