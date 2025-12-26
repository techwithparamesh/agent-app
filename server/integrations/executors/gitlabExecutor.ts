import { z } from 'zod';

const gitlabAuthSchema = z.object({
  token: z.string().min(1),
  baseUrl: z.string().min(1).default('https://gitlab.com'),
});

export type GitlabExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function normalizeBaseUrl(baseUrl: string) {
  const b = baseUrl.trim().replace(/\/+$/, '');
  return b || 'https://gitlab.com';
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

async function glRequestJson(baseUrl: string, token: string, path: string, method: 'GET' | 'POST' | 'PUT', body?: any) {
  const res = await fetch(`${normalizeBaseUrl(baseUrl)}${path}`, {
    method,
    headers: {
      'PRIVATE-TOKEN': token,
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
    throw new Error(`GitLab API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeGitlabAction(input: GitlabExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { token, baseUrl } = gitlabAuthSchema.parse({ token: credential.token, baseUrl: credential.baseUrl || 'https://gitlab.com' });

  if (actionId === 'create_issue') {
    const projectId = String(config.projectId || '').trim();
    const title = String(config.title || '').trim();
    if (!projectId) throw new Error('GitLab create_issue requires projectId');
    if (!title) throw new Error('GitLab create_issue requires title');

    const body: any = {
      title,
      ...(config.description ? { description: String(config.description) } : {}),
      ...(config.labels ? { labels: String(config.labels) } : {}),
      ...(config.milestoneId != null && String(config.milestoneId).length ? { milestone_id: Number(config.milestoneId) } : {}),
    };

    const assigneeIds = parseJsonMaybe(config.assigneeIds);
    if (Array.isArray(assigneeIds)) body.assignee_ids = assigneeIds.map((x: any) => Number(x));

    const data = await glRequestJson(baseUrl, token, `/api/v4/projects/${encodeURIComponent(projectId)}/issues`, 'POST', body);
    return { ok: true, issue: data };
  }

  if (actionId === 'update_issue') {
    const projectId = String(config.projectId || '').trim();
    const issueIid = Number(config.issueIid);
    if (!projectId) throw new Error('GitLab update_issue requires projectId');
    if (!Number.isFinite(issueIid)) throw new Error('GitLab update_issue requires issueIid');

    const body: any = {};
    if (config.title != null) body.title = String(config.title);
    if (config.description != null) body.description = String(config.description);
    if (config.stateEvent) body.state_event = String(config.stateEvent);

    const data = await glRequestJson(
      baseUrl,
      token,
      `/api/v4/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(String(issueIid))}`,
      'PUT',
      body,
    );

    return { ok: true, issue: data };
  }

  if (actionId === 'add_comment') {
    const projectId = String(config.projectId || '').trim();
    const issueIid = Number(config.issueIid);
    const bodyText = String(config.body || '').trim();
    if (!projectId) throw new Error('GitLab add_comment requires projectId');
    if (!Number.isFinite(issueIid)) throw new Error('GitLab add_comment requires issueIid');
    if (!bodyText) throw new Error('GitLab add_comment requires body');

    const data = await glRequestJson(
      baseUrl,
      token,
      `/api/v4/projects/${encodeURIComponent(projectId)}/issues/${encodeURIComponent(String(issueIid))}/notes`,
      'POST',
      { body: bodyText },
    );

    return { ok: true, note: data };
  }

  if (actionId === 'create_mr') {
    const projectId = String(config.projectId || '').trim();
    const sourceBranch = String(config.sourceBranch || '').trim();
    const targetBranch = String(config.targetBranch || '').trim();
    const title = String(config.title || '').trim();
    if (!projectId) throw new Error('GitLab create_mr requires projectId');
    if (!sourceBranch) throw new Error('GitLab create_mr requires sourceBranch');
    if (!targetBranch) throw new Error('GitLab create_mr requires targetBranch');
    if (!title) throw new Error('GitLab create_mr requires title');

    const body: any = {
      id: projectId,
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title,
      ...(config.description ? { description: String(config.description) } : {}),
      ...(config.assigneeId != null && String(config.assigneeId).length ? { assignee_id: Number(config.assigneeId) } : {}),
    };

    const data = await glRequestJson(baseUrl, token, `/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests`, 'POST', body);
    return { ok: true, mergeRequest: data };
  }

  if (actionId === 'trigger_pipeline') {
    const projectId = String(config.projectId || '').trim();
    const ref = String(config.ref || '').trim();
    if (!projectId) throw new Error('GitLab trigger_pipeline requires projectId');
    if (!ref) throw new Error('GitLab trigger_pipeline requires ref');

    const variablesRaw = parseJsonMaybe(config.variables);
    const variables = Array.isArray(variablesRaw)
      ? variablesRaw
          .filter((v: any) => v && v.key != null)
          .map((v: any) => ({ key: String(v.key), value: v.value != null ? String(v.value) : '' }))
      : undefined;

    const body: any = { ref, ...(variables ? { variables } : {}) };

    const data = await glRequestJson(baseUrl, token, `/api/v4/projects/${encodeURIComponent(projectId)}/pipeline`, 'POST', body);
    return { ok: true, pipeline: data };
  }

  return { status: 'skipped', reason: `GitLab action not implemented: ${actionId}` };
}
