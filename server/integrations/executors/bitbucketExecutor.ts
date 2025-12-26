import { z } from 'zod';

const bitbucketAuthSchema = z.object({
  username: z.string().min(1),
  appPassword: z.string().min(1),
});

export type BitbucketExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function bbAuthHeader(username: string, appPassword: string) {
  return `Basic ${Buffer.from(`${username}:${appPassword}`, 'utf8').toString('base64')}`;
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

async function bbRequestJson(path: string, auth: string, method: 'GET' | 'POST', body?: any) {
  const res = await fetch(`https://api.bitbucket.org/2.0${path}`, {
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
    throw new Error(`Bitbucket API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeBitbucketAction(input: BitbucketExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { username, appPassword } = bitbucketAuthSchema.parse({
    username: credential.username,
    appPassword: credential.appPassword,
  });

  const auth = bbAuthHeader(username, appPassword);

  if (actionId === 'create_issue') {
    const workspace = String(config.workspace || '').trim();
    const repoSlug = String(config.repoSlug || '').trim();
    const title = String(config.title || '').trim();
    if (!workspace) throw new Error('Bitbucket create_issue requires workspace');
    if (!repoSlug) throw new Error('Bitbucket create_issue requires repoSlug');
    if (!title) throw new Error('Bitbucket create_issue requires title');

    const body: any = {
      title,
      ...(config.content ? { content: { raw: String(config.content) } } : {}),
      ...(config.kind ? { kind: String(config.kind) } : {}),
      ...(config.priority ? { priority: String(config.priority) } : {}),
    };

    const data = await bbRequestJson(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/issues`,
      auth,
      'POST',
      body,
    );

    return { ok: true, issue: data };
  }

  if (actionId === 'create_pr') {
    const workspace = String(config.workspace || '').trim();
    const repoSlug = String(config.repoSlug || '').trim();
    const title = String(config.title || '').trim();
    const sourceBranch = String(config.sourceBranch || '').trim();
    const destBranch = String(config.destBranch || '').trim();
    if (!workspace) throw new Error('Bitbucket create_pr requires workspace');
    if (!repoSlug) throw new Error('Bitbucket create_pr requires repoSlug');
    if (!title) throw new Error('Bitbucket create_pr requires title');
    if (!sourceBranch) throw new Error('Bitbucket create_pr requires sourceBranch');
    if (!destBranch) throw new Error('Bitbucket create_pr requires destBranch');

    const body: any = {
      title,
      source: { branch: { name: sourceBranch } },
      destination: { branch: { name: destBranch } },
      ...(config.description ? { description: String(config.description) } : {}),
      ...(config.closeSourceBranch !== undefined ? { close_source_branch: Boolean(config.closeSourceBranch) } : {}),
    };

    const data = await bbRequestJson(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests`,
      auth,
      'POST',
      body,
    );

    return { ok: true, pullRequest: data };
  }

  if (actionId === 'add_comment') {
    const workspace = String(config.workspace || '').trim();
    const repoSlug = String(config.repoSlug || '').trim();
    const pullRequestId = Number(config.pullRequestId);
    const content = String(config.content || '').trim();
    if (!workspace) throw new Error('Bitbucket add_comment requires workspace');
    if (!repoSlug) throw new Error('Bitbucket add_comment requires repoSlug');
    if (!Number.isFinite(pullRequestId)) throw new Error('Bitbucket add_comment requires pullRequestId');
    if (!content) throw new Error('Bitbucket add_comment requires content');

    const data = await bbRequestJson(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${encodeURIComponent(String(pullRequestId))}/comments`,
      auth,
      'POST',
      { content: { raw: content } },
    );

    return { ok: true, comment: data };
  }

  if (actionId === 'trigger_pipeline') {
    const workspace = String(config.workspace || '').trim();
    const repoSlug = String(config.repoSlug || '').trim();
    const target = String(config.target || '').trim();
    if (!workspace) throw new Error('Bitbucket trigger_pipeline requires workspace');
    if (!repoSlug) throw new Error('Bitbucket trigger_pipeline requires repoSlug');
    if (!target) throw new Error('Bitbucket trigger_pipeline requires target');

    const varsRaw = parseJsonMaybe(config.variables);
    const variables = Array.isArray(varsRaw)
      ? varsRaw
          .filter((v: any) => v && v.key != null)
          .map((v: any) => ({ key: String(v.key), value: v.value != null ? String(v.value) : '' }))
      : undefined;

    const body: any = {
      target: {
        ref_type: 'branch',
        type: 'pipeline_ref_target',
        ref_name: target,
      },
      ...(variables ? { variables } : {}),
    };

    const data = await bbRequestJson(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pipelines/`,
      auth,
      'POST',
      body,
    );

    return { ok: true, pipeline: data };
  }

  return { status: 'skipped', reason: `Bitbucket action not implemented: ${actionId}` };
}
