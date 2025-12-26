import { z } from 'zod';

const linearAuthSchema = z.object({
  apiKey: z.string().min(1),
});

export type LinearExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function linearGraphql(apiKey: string, query: string, variables?: any) {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text().catch(() => '');
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!res.ok) {
    throw new Error(`Linear API error ${res.status}: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
  }

  if (payload?.errors?.length) {
    throw new Error(`Linear GraphQL error: ${JSON.stringify(payload.errors)}`);
  }

  return payload?.data;
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

export async function executeLinearAction(input: LinearExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey } = linearAuthSchema.parse({ apiKey: credential.apiKey });

  if (actionId === 'create_issue') {
    const teamId = String(config.teamId || '').trim();
    const title = String(config.title || '').trim();
    if (!teamId) throw new Error('Linear create_issue requires teamId');
    if (!title) throw new Error('Linear create_issue requires title');

    const labelIds = parseJsonMaybe(config.labelIds);

    const query = `mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier title url }
      }
    }`;

    const inputObj: any = {
      teamId,
      title,
      ...(config.description ? { description: String(config.description) } : {}),
      ...(config.priority != null && String(config.priority).length ? { priority: Number(config.priority) } : {}),
      ...(config.stateId ? { stateId: String(config.stateId) } : {}),
      ...(config.assigneeId ? { assigneeId: String(config.assigneeId) } : {}),
      ...(Array.isArray(labelIds) ? { labelIds } : {}),
    };

    const data = await linearGraphql(apiKey, query, { input: inputObj });
    return { ok: true, result: data?.issueCreate, issue: data?.issueCreate?.issue, raw: data };
  }

  if (actionId === 'update_issue') {
    const issueId = String(config.issueId || '').trim();
    if (!issueId) throw new Error('Linear update_issue requires issueId');

    const query = `mutation IssueUpdate($input: IssueUpdateInput!) {
      issueUpdate(input: $input) {
        success
        issue { id identifier title url }
      }
    }`;

    const inputObj: any = {
      id: issueId,
      ...(config.title != null ? { title: String(config.title) } : {}),
      ...(config.description != null ? { description: String(config.description) } : {}),
      ...(config.priority != null && String(config.priority).length ? { priority: Number(config.priority) } : {}),
      ...(config.stateId ? { stateId: String(config.stateId) } : {}),
      ...(config.assigneeId != null && String(config.assigneeId).length ? { assigneeId: String(config.assigneeId) } : {}),
    };

    const data = await linearGraphql(apiKey, query, { input: inputObj });
    return { ok: true, result: data?.issueUpdate, issue: data?.issueUpdate?.issue, raw: data };
  }

  if (actionId === 'add_comment') {
    const issueId = String(config.issueId || '').trim();
    const body = String(config.body || '').trim();
    if (!issueId) throw new Error('Linear add_comment requires issueId');
    if (!body) throw new Error('Linear add_comment requires body');

    const query = `mutation CommentCreate($input: CommentCreateInput!) {
      commentCreate(input: $input) {
        success
        comment { id body issue { id identifier } }
      }
    }`;

    const data = await linearGraphql(apiKey, query, { input: { issueId, body } });
    return { ok: true, result: data?.commentCreate, comment: data?.commentCreate?.comment, raw: data };
  }

  return { status: 'skipped', reason: `Linear action not implemented: ${actionId}` };
}
