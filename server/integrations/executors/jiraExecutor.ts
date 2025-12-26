import { z } from 'zod';

const jiraAuthSchema = z.object({
  domain: z.string().min(1),
  email: z.string().min(1),
  apiToken: z.string().min(1),
});

export type JiraExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function normalizeDomain(domain: string) {
  return domain.trim().replace(/^https?:\/\//, '');
}

function jiraAuthHeader(email: string, apiToken: string) {
  return `Basic ${Buffer.from(`${email}:${apiToken}`, 'utf8').toString('base64')}`;
}

function toAdfDoc(text?: string) {
  const t = (text ?? '').toString();
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: t ? [{ type: 'text', text: t }] : [],
      },
    ],
  };
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

async function jiraRequestJson(domain: string, auth: string, path: string, method: 'GET' | 'POST' | 'PUT', body?: any) {
  const base = `https://${normalizeDomain(domain)}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: auth,
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
    throw new Error(`Jira API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeJiraAction(input: JiraExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { domain, email, apiToken } = jiraAuthSchema.parse({
    domain: credential.domain,
    email: credential.email,
    apiToken: credential.apiToken,
  });

  const auth = jiraAuthHeader(email, apiToken);

  if (actionId === 'create_issue') {
    const projectKey = String(config.projectKey || '').trim();
    const issueTypeId = String(config.issueTypeId || '').trim();
    const summary = String(config.summary || '').trim();
    if (!projectKey) throw new Error('Jira create_issue requires projectKey');
    if (!issueTypeId) throw new Error('Jira create_issue requires issueTypeId');
    if (!summary) throw new Error('Jira create_issue requires summary');

    const fields: any = {
      project: { key: projectKey },
      issuetype: { id: issueTypeId },
      summary,
    };

    if (config.description) fields.description = toAdfDoc(String(config.description));
    if (config.priority) fields.priority = { name: String(config.priority) };
    if (config.assignee) fields.assignee = { id: String(config.assignee) };

    const labels = parseJsonMaybe(config.labels);
    if (Array.isArray(labels)) fields.labels = labels;

    const customFields = parseJsonMaybe(config.customFields);
    if (customFields && typeof customFields === 'object') {
      for (const [k, v] of Object.entries(customFields)) fields[k] = v;
    }

    const data = await jiraRequestJson(domain, auth, '/rest/api/3/issue', 'POST', { fields });
    return { ok: true, issueKey: data?.key, issueId: data?.id, raw: data };
  }

  if (actionId === 'update_issue') {
    const issueKey = String(config.issueKey || '').trim();
    if (!issueKey) throw new Error('Jira update_issue requires issueKey');

    const fields: any = {};
    if (config.summary != null) fields.summary = String(config.summary);
    if (config.description != null) fields.description = toAdfDoc(String(config.description));
    if (config.priority) fields.priority = { name: String(config.priority) };
    if (config.assignee != null) fields.assignee = { id: String(config.assignee) };

    const data = await jiraRequestJson(domain, auth, `/rest/api/3/issue/${encodeURIComponent(issueKey)}`, 'PUT', { fields });
    return { ok: true, raw: data };
  }

  if (actionId === 'transition_issue') {
    const issueKey = String(config.issueKey || '').trim();
    const transitionId = String(config.transitionId || '').trim();
    if (!issueKey) throw new Error('Jira transition_issue requires issueKey');
    if (!transitionId) throw new Error('Jira transition_issue requires transitionId');

    const body: any = {
      transition: { id: transitionId },
    };

    if (config.comment) {
      body.update = {
        comment: [
          {
            add: { body: toAdfDoc(String(config.comment)) },
          },
        ],
      };
    }

    const data = await jiraRequestJson(domain, auth, `/rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`, 'POST', body);
    return { ok: true, raw: data };
  }

  if (actionId === 'add_comment') {
    const issueKey = String(config.issueKey || '').trim();
    const bodyText = String(config.body || '').trim();
    if (!issueKey) throw new Error('Jira add_comment requires issueKey');
    if (!bodyText) throw new Error('Jira add_comment requires body');

    const data = await jiraRequestJson(domain, auth, `/rest/api/3/issue/${encodeURIComponent(issueKey)}/comment`, 'POST', {
      body: toAdfDoc(bodyText),
    });

    return { ok: true, comment: data, raw: data };
  }

  if (actionId === 'search_issues') {
    const jql = String(config.jql || '').trim();
    if (!jql) throw new Error('Jira search_issues requires jql');

    const maxResults = config.maxResults != null ? Number(config.maxResults) : 50;

    const data = await jiraRequestJson(domain, auth, '/rest/api/3/search', 'POST', {
      jql,
      maxResults: Number.isFinite(maxResults) ? Math.trunc(maxResults) : 50,
    });

    return { ok: true, issues: data?.issues, total: data?.total, raw: data };
  }

  return { status: 'skipped', reason: `Jira action not implemented: ${actionId}` };
}
