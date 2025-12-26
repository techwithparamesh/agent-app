import { z } from 'zod';

const notionAuthSchema = z.object({
  apiKey: z.string().min(1),
});

export type NotionExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

const NOTION_VERSION = '2022-06-28';

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

function richTextFromPlain(text: string) {
  return [{ type: 'text', text: { content: text } }];
}

function buildTextBlock(type: string, content: string) {
  const rt = richTextFromPlain(content);
  if (type === 'paragraph') return { object: 'block', type: 'paragraph', paragraph: { rich_text: rt } };
  if (type === 'heading_1') return { object: 'block', type: 'heading_1', heading_1: { rich_text: rt } };
  if (type === 'heading_2') return { object: 'block', type: 'heading_2', heading_2: { rich_text: rt } };
  if (type === 'bulleted_list_item') {
    return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt } };
  }
  if (type === 'numbered_list_item') {
    return { object: 'block', type: 'numbered_list_item', numbered_list_item: { rich_text: rt } };
  }
  if (type === 'to_do') {
    return { object: 'block', type: 'to_do', to_do: { rich_text: rt, checked: false } };
  }
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: rt } };
}

async function notionRequestJson(path: string, apiKey: string, method: 'GET' | 'POST' | 'PATCH', body?: any) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': NOTION_VERSION,
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
    throw new Error(`Notion API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function ensurePageTitleProperties(properties: any, title: string) {
  const props = properties && typeof properties === 'object' ? { ...properties } : {};

  // If any property already looks like a title property, leave it.
  for (const v of Object.values(props)) {
    if (v && typeof v === 'object' && 'title' in (v as any)) return props;
  }

  // Common fallbacks (DB title property often named "Name" or "Title").
  props.Title = { title: richTextFromPlain(title) };
  props.Name = { title: richTextFromPlain(title) };
  props.title = { title: richTextFromPlain(title) };
  return props;
}

export async function executeNotionAction(input: NotionExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey } = notionAuthSchema.parse({ apiKey: credential.apiKey });

  if (actionId === 'create_page') {
    const parentId = String(config.parentId || '').trim();
    const parentType = String(config.parentType || '').trim();
    const title = String(config.title || '').trim();
    if (!parentId) throw new Error('Notion create_page requires parentId');
    if (parentType !== 'page_id' && parentType !== 'database_id') throw new Error('Notion create_page requires parentType');
    if (!title) throw new Error('Notion create_page requires title');

    const propertiesRaw = parseJsonMaybe(config.properties);
    const properties = ensurePageTitleProperties(propertiesRaw, title);

    const content = String(config.content || '').trim();
    const children = content ? [buildTextBlock('paragraph', content)] : undefined;

    const body: any = {
      parent: { [parentType]: parentId },
      properties,
      ...(children ? { children } : {}),
    };

    const data = await notionRequestJson('/pages', apiKey, 'POST', body);
    return { ok: true, page: data, raw: data };
  }

  if (actionId === 'update_page') {
    const pageId = String(config.pageId || '').trim();
    if (!pageId) throw new Error('Notion update_page requires pageId');

    const properties = parseJsonMaybe(config.properties);
    if (!properties || typeof properties !== 'object') throw new Error('Notion update_page requires properties (json)');

    const data = await notionRequestJson(`/pages/${encodeURIComponent(pageId)}`, apiKey, 'PATCH', { properties });
    return { ok: true, page: data, raw: data };
  }

  if (actionId === 'append_block') {
    const pageId = String(config.pageId || '').trim();
    const content = String(config.content || '').trim();
    const blockType = String(config.blockType || 'paragraph').trim();
    if (!pageId) throw new Error('Notion append_block requires pageId');
    if (!content) throw new Error('Notion append_block requires content');

    const children = [buildTextBlock(blockType, content)];
    const data = await notionRequestJson(`/blocks/${encodeURIComponent(pageId)}/children`, apiKey, 'PATCH', { children });
    return { ok: true, result: data, raw: data };
  }

  if (actionId === 'query_database') {
    const databaseId = String(config.databaseId || '').trim();
    if (!databaseId) throw new Error('Notion query_database requires databaseId');

    const filter = parseJsonMaybe(config.filter);
    const sorts = parseJsonMaybe(config.sorts);
    const pageSize = config.pageSize != null ? Number(config.pageSize) : undefined;

    const body: any = {
      ...(filter ? { filter } : {}),
      ...(sorts ? { sorts } : {}),
      ...(Number.isFinite(pageSize) ? { page_size: Math.trunc(pageSize as number) } : {}),
    };

    const data = await notionRequestJson(`/databases/${encodeURIComponent(databaseId)}/query`, apiKey, 'POST', body);
    return { ok: true, results: data?.results, raw: data };
  }

  if (actionId === 'get_page') {
    const pageId = String(config.pageId || '').trim();
    if (!pageId) throw new Error('Notion get_page requires pageId');

    const data = await notionRequestJson(`/pages/${encodeURIComponent(pageId)}`, apiKey, 'GET');
    return { ok: true, page: data, raw: data };
  }

  return { status: 'skipped', reason: `Notion action not implemented: ${actionId}` };
}
