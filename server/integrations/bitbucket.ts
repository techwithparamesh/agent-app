import { Router } from 'express';
import { z } from 'zod';

const bitbucketRouter = Router();

const baseSchema = z.object({
  username: z.string().min(1),
  appPassword: z.string().min(1),
});

const reposSchema = baseSchema.extend({
  workspace: z.string().min(1),
});

const branchesSchema = reposSchema.extend({
  repoSlug: z.string().min(1),
});

function basicAuthHeader(username: string, appPassword: string) {
  const token = Buffer.from(`${username}:${appPassword}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

async function bbGetJson(url: string, username: string, appPassword: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: basicAuthHeader(username, appPassword),
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Bitbucket API error ${res.status}: ${text || res.statusText}`);
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

// POST /api/integrations/options/bitbucket/workspaces
// Body: { username, appPassword }
bitbucketRouter.post('/workspaces', async (req, res) => {
  try {
    const { username, appPassword } = baseSchema.parse(req.body);

    const data = await bbGetJson('https://api.bitbucket.org/2.0/workspaces?pagelen=100', username, appPassword);
    const values = Array.isArray(data?.values) ? data.values : [];

    const options = values
      .filter((w: any) => w && (w.slug || w.uuid) && (w.name || w.slug))
      .map((w: any) => ({
        value: String(w.slug || w.uuid),
        label: String(w.name || w.slug || w.uuid),
      }));

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Bitbucket Options] workspaces error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Bitbucket workspaces' });
  }
});

// POST /api/integrations/options/bitbucket/repos
// Body: { username, appPassword, workspace }
bitbucketRouter.post('/repos', async (req, res) => {
  try {
    const { username, appPassword, workspace } = reposSchema.parse(req.body);

    const data = await bbGetJson(
      `https://api.bitbucket.org/2.0/repositories/${encodeURIComponent(workspace)}?pagelen=100&sort=-updated_on`,
      username,
      appPassword,
    );

    const values = Array.isArray(data?.values) ? data.values : [];
    const options = values
      .filter((r: any) => r && (r.slug || r.name))
      .map((r: any) => ({
        value: String(r.slug || r.name),
        label: String(r.name || r.slug),
      }));

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Bitbucket Options] repos error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Bitbucket repositories' });
  }
});

// POST /api/integrations/options/bitbucket/branches
// Body: { username, appPassword, workspace, repoSlug }
bitbucketRouter.post('/branches', async (req, res) => {
  try {
    const { username, appPassword, workspace, repoSlug } = branchesSchema.parse(req.body);

    const data = await bbGetJson(
      `https://api.bitbucket.org/2.0/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/refs/branches?pagelen=100&sort=-target.date`,
      username,
      appPassword,
    );

    const values = Array.isArray(data?.values) ? data.values : [];
    const options = values
      .filter((b: any) => b && b.name)
      .map((b: any) => ({ value: String(b.name), label: String(b.name) }));

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[Bitbucket Options] branches error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Bitbucket branches' });
  }
});

export default bitbucketRouter;
