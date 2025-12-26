import { Router } from 'express';
import { z } from 'zod';

const githubRouter = Router();

const baseSchema = z.object({
  token: z.string().min(1),
});

const ownerSchema = baseSchema.extend({
  owner: z.string().min(1),
});

const repoSchema = ownerSchema.extend({
  repo: z.string().min(1),
});

async function ghGetJson(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

function uniqByValue(options: { value: string; label: string }[]) {
  const seen = new Set<string>();
  const out: { value: string; label: string }[] = [];
  for (const o of options) {
    if (seen.has(o.value)) continue;
    seen.add(o.value);
    out.push(o);
  }
  return out;
}

// POST /api/integrations/options/github/owners
// Body: { token }
// Returns the authenticated user + organizations as owner options.
githubRouter.post('/owners', async (req, res) => {
  try {
    const { token } = baseSchema.parse(req.body);

    const me = await ghGetJson('https://api.github.com/user', token);
    const orgs = await ghGetJson('https://api.github.com/user/orgs?per_page=100', token);

    const options: { value: string; label: string }[] = [];
    if (me?.login) options.push({ value: String(me.login), label: String(me.login) });

    if (Array.isArray(orgs)) {
      for (const o of orgs) {
        if (o?.login) options.push({ value: String(o.login), label: String(o.login) });
      }
    }

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[GitHub Options] owners error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load GitHub owners' });
  }
});

// POST /api/integrations/options/github/repos
// Body: { token, owner }
// Returns repos for the selected owner.
githubRouter.post('/repos', async (req, res) => {
  try {
    const { token, owner } = ownerSchema.parse(req.body);

    // Try org repos first; if it fails (not an org), fall back to user repos.
    let repos: any[] = [];
    try {
      const data = await ghGetJson(`https://api.github.com/orgs/${encodeURIComponent(owner)}/repos?per_page=100&type=all&sort=updated`, token);
      repos = Array.isArray(data) ? data : [];
    } catch {
      const data = await ghGetJson(`https://api.github.com/users/${encodeURIComponent(owner)}/repos?per_page=100&type=all&sort=updated`, token);
      repos = Array.isArray(data) ? data : [];
    }

    const options = repos
      .filter((r: any) => r && r.name)
      .map((r: any) => ({ value: String(r.name), label: String(r.name) }));

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[GitHub Options] repos error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load GitHub repos' });
  }
});

// POST /api/integrations/options/github/workflows
// Body: { token, owner, repo }
// Returns workflows for the selected repo.
githubRouter.post('/workflows', async (req, res) => {
  try {
    const { token, owner, repo } = repoSchema.parse(req.body);

    const data = await ghGetJson(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows?per_page=100`,
      token,
    );

    const workflows = Array.isArray(data?.workflows) ? data.workflows : [];
    const options = workflows
      .filter((w: any) => w && (w.id != null) && (w.name || w.path))
      .map((w: any) => ({ value: String(w.id), label: String(w.name || w.path) }));

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[GitHub Options] workflows error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load GitHub workflows' });
  }
});

export default githubRouter;
