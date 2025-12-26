import { Router } from 'express';
import { z } from 'zod';

const gitlabRouter = Router();

const baseSchema = z.object({
  token: z.string().min(1),
  baseUrl: z.string().min(1).optional(),
});

const branchesSchema = baseSchema.extend({
  projectId: z.union([z.string().min(1), z.number()]),
});

function normalizeBaseUrl(baseUrl?: string) {
  const base = (baseUrl && baseUrl.trim()) || 'https://gitlab.com';
  return base.replace(/\/+$/, '');
}

async function glGetJson(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'PRIVATE-TOKEN': token,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitLab API error ${res.status}: ${text || res.statusText}`);
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

// POST /api/integrations/options/gitlab/projects
// Body: { token, baseUrl? }
// Returns projects the user is a member of.
gitlabRouter.post('/projects', async (req, res) => {
  try {
    const { token, baseUrl } = baseSchema.parse(req.body);
    const base = normalizeBaseUrl(baseUrl);

    const projects = await glGetJson(
      `${base}/api/v4/projects?membership=true&simple=true&per_page=100&order_by=last_activity_at&sort=desc`,
      token,
    );

    const options = (Array.isArray(projects) ? projects : [])
      .filter((p: any) => p && (p.id != null) && (p.path_with_namespace || p.name))
      .map((p: any) => ({
        value: String(p.id),
        label: String(p.path_with_namespace || p.name),
      }));

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[GitLab Options] projects error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load GitLab projects' });
  }
});

// POST /api/integrations/options/gitlab/branches
// Body: { token, baseUrl?, projectId }
// Returns repository branches for a project.
gitlabRouter.post('/branches', async (req, res) => {
  try {
    const { token, baseUrl, projectId } = branchesSchema.parse(req.body);
    const base = normalizeBaseUrl(baseUrl);

    const branches = await glGetJson(
      `${base}/api/v4/projects/${encodeURIComponent(String(projectId))}/repository/branches?per_page=100`,
      token,
    );

    const options = (Array.isArray(branches) ? branches : [])
      .filter((b: any) => b && b.name)
      .map((b: any) => ({ value: String(b.name), label: String(b.name) }));

    res.json({ options: uniqByValue(options) });
  } catch (error: any) {
    console.error('[GitLab Options] branches error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load GitLab branches' });
  }
});

export default gitlabRouter;
