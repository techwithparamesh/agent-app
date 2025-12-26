import { z } from 'zod';

const githubAuthSchema = z.object({
  token: z.string().min(1),
});

export type GithubExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function ghRequestJson(path: string, token: string, method: 'GET' | 'POST' | 'PATCH' | 'PUT', body?: any) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
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
    throw new Error(`GitHub API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return { status: res.status, data };
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

export async function executeGithubAction(input: GithubExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { token } = githubAuthSchema.parse({ token: credential.token });

  if (actionId === 'create_issue') {
    const owner = String(config.owner || '').trim();
    const repo = String(config.repo || '').trim();
    const title = String(config.title || '').trim();
    if (!owner) throw new Error('GitHub create_issue requires owner');
    if (!repo) throw new Error('GitHub create_issue requires repo');
    if (!title) throw new Error('GitHub create_issue requires title');

    const body: any = {
      title,
      ...(config.body ? { body: String(config.body) } : {}),
    };

    const labels = parseJsonMaybe(config.labels);
    if (Array.isArray(labels)) body.labels = labels;

    const assignees = parseJsonMaybe(config.assignees);
    if (Array.isArray(assignees)) body.assignees = assignees;

    if (config.milestone != null && String(config.milestone).length) body.milestone = Number(config.milestone);

    const res = await ghRequestJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`, token, 'POST', body);
    return { ok: true, issue: res.data };
  }

  if (actionId === 'update_issue') {
    const owner = String(config.owner || '').trim();
    const repo = String(config.repo || '').trim();
    const issueNumber = Number(config.issueNumber);
    if (!owner) throw new Error('GitHub update_issue requires owner');
    if (!repo) throw new Error('GitHub update_issue requires repo');
    if (!Number.isFinite(issueNumber)) throw new Error('GitHub update_issue requires issueNumber');

    const body: any = {};
    if (config.title != null) body.title = String(config.title);
    if (config.body != null) body.body = String(config.body);
    if (config.state) body.state = String(config.state);

    const labels = parseJsonMaybe(config.labels);
    if (Array.isArray(labels)) body.labels = labels;

    const res = await ghRequestJson(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${encodeURIComponent(String(issueNumber))}`,
      token,
      'PATCH',
      body,
    );

    return { ok: true, issue: res.data };
  }

  if (actionId === 'create_comment') {
    const owner = String(config.owner || '').trim();
    const repo = String(config.repo || '').trim();
    const issueNumber = Number(config.issueNumber);
    const bodyText = String(config.body || '').trim();
    if (!owner) throw new Error('GitHub create_comment requires owner');
    if (!repo) throw new Error('GitHub create_comment requires repo');
    if (!Number.isFinite(issueNumber)) throw new Error('GitHub create_comment requires issueNumber');
    if (!bodyText) throw new Error('GitHub create_comment requires body');

    const res = await ghRequestJson(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${encodeURIComponent(String(issueNumber))}/comments`,
      token,
      'POST',
      { body: bodyText },
    );

    return { ok: true, comment: res.data };
  }

  if (actionId === 'create_pr') {
    const owner = String(config.owner || '').trim();
    const repo = String(config.repo || '').trim();
    const title = String(config.title || '').trim();
    const head = String(config.head || '').trim();
    const base = String(config.base || '').trim();
    if (!owner) throw new Error('GitHub create_pr requires owner');
    if (!repo) throw new Error('GitHub create_pr requires repo');
    if (!title) throw new Error('GitHub create_pr requires title');
    if (!head) throw new Error('GitHub create_pr requires head');
    if (!base) throw new Error('GitHub create_pr requires base');

    const body: any = {
      title,
      head,
      base,
      ...(config.body ? { body: String(config.body) } : {}),
      ...(config.draft !== undefined ? { draft: Boolean(config.draft) } : {}),
    };

    const res = await ghRequestJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`, token, 'POST', body);
    return { ok: true, pullRequest: res.data };
  }

  if (actionId === 'merge_pr') {
    const owner = String(config.owner || '').trim();
    const repo = String(config.repo || '').trim();
    const pullNumber = Number(config.pullNumber);
    if (!owner) throw new Error('GitHub merge_pr requires owner');
    if (!repo) throw new Error('GitHub merge_pr requires repo');
    if (!Number.isFinite(pullNumber)) throw new Error('GitHub merge_pr requires pullNumber');

    const body: any = {
      ...(config.commitTitle ? { commit_title: String(config.commitTitle) } : {}),
      ...(config.commitMessage ? { commit_message: String(config.commitMessage) } : {}),
      ...(config.mergeMethod ? { merge_method: String(config.mergeMethod) } : {}),
    };

    const res = await ghRequestJson(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${encodeURIComponent(String(pullNumber))}/merge`,
      token,
      'PUT',
      body,
    );

    return { ok: true, result: res.data };
  }

  if (actionId === 'create_release') {
    const owner = String(config.owner || '').trim();
    const repo = String(config.repo || '').trim();
    const tagName = String(config.tagName || '').trim();
    if (!owner) throw new Error('GitHub create_release requires owner');
    if (!repo) throw new Error('GitHub create_release requires repo');
    if (!tagName) throw new Error('GitHub create_release requires tagName');

    const body: any = {
      tag_name: tagName,
      ...(config.name ? { name: String(config.name) } : {}),
      ...(config.body ? { body: String(config.body) } : {}),
      ...(config.draft !== undefined ? { draft: Boolean(config.draft) } : {}),
      ...(config.prerelease !== undefined ? { prerelease: Boolean(config.prerelease) } : {}),
    };

    const res = await ghRequestJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases`, token, 'POST', body);
    return { ok: true, release: res.data };
  }

  if (actionId === 'dispatch_workflow') {
    const owner = String(config.owner || '').trim();
    const repo = String(config.repo || '').trim();
    const workflowId = String(config.workflowId || '').trim();
    const ref = String(config.ref || '').trim();
    if (!owner) throw new Error('GitHub dispatch_workflow requires owner');
    if (!repo) throw new Error('GitHub dispatch_workflow requires repo');
    if (!workflowId) throw new Error('GitHub dispatch_workflow requires workflowId');
    if (!ref) throw new Error('GitHub dispatch_workflow requires ref');

    const inputs = parseJsonMaybe(config.inputs);

    const res = await ghRequestJson(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(workflowId)}/dispatches`,
      token,
      'POST',
      { ref, ...(inputs && typeof inputs === 'object' ? { inputs } : {}) },
    );

    return { ok: true, status: res.status };
  }

  return { status: 'skipped', reason: `GitHub action not implemented: ${actionId}` };
}
