import { Router } from 'express';
import { z } from 'zod';

const jiraRouter = Router();

const baseSchema = z.object({
  domain: z.string().min(1),
  email: z.string().min(1),
  apiToken: z.string().min(1),
});

const projectKeySchema = baseSchema.extend({
  projectKey: z.string().min(1),
});

const issueKeySchema = baseSchema.extend({
  issueKey: z.string().min(1),
});

function normalizeDomain(domain: string) {
  const trimmed = domain.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed.replace(/\/$/, '');
  return `https://${trimmed.replace(/\/$/, '')}`;
}

function basicAuthHeader(email: string, apiToken: string) {
  const raw = `${email}:${apiToken}`;
  // Node supports Buffer in this server runtime
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

async function jiraGetJson(url: string, authHeader: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: authHeader,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Jira API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/jira/projects
// Body: { domain, email, apiToken }
jiraRouter.post('/projects', async (req, res) => {
  try {
    const { domain, email, apiToken } = baseSchema.parse(req.body);
    const baseUrl = normalizeDomain(domain);
    const authHeader = basicAuthHeader(email, apiToken);

    // Use project search for pagination-friendly listing
    const url = `${baseUrl}/rest/api/3/project/search?maxResults=100`;
    const data = await jiraGetJson(url, authHeader);

    const values = Array.isArray(data?.values) ? data.values : Array.isArray(data) ? data : [];
    const options = values
      .filter((p: any) => p && p.key && p.name)
      .map((p: any) => ({ value: String(p.key), label: `${p.name} (${p.key})` }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Jira Options] projects error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Jira projects' });
  }
});

// POST /api/integrations/options/jira/issue-types
// Body: { domain, email, apiToken, projectKey }
jiraRouter.post('/issue-types', async (req, res) => {
  try {
    const { domain, email, apiToken, projectKey } = projectKeySchema.parse(req.body);
    const baseUrl = normalizeDomain(domain);
    const authHeader = basicAuthHeader(email, apiToken);

    // Fetch issue types available for create within a project
    // Note: Jira Cloud supports createmeta; if disabled, we fall back to global issue types.
    const metaUrl = `${baseUrl}/rest/api/3/issue/createmeta?projectKeys=${encodeURIComponent(projectKey)}&expand=projects.issuetypes`;

    let options: { value: string; label: string }[] = [];
    try {
      const meta = await jiraGetJson(metaUrl, authHeader);
      const project = Array.isArray(meta?.projects) ? meta.projects[0] : null;
      const issueTypes = Array.isArray(project?.issuetypes) ? project.issuetypes : [];
      options = issueTypes
        .filter((t: any) => t && t.id && t.name)
        .map((t: any) => ({ value: String(t.id), label: String(t.name) }));
    } catch (e: any) {
      const allUrl = `${baseUrl}/rest/api/3/issuetype`;
      const all = await jiraGetJson(allUrl, authHeader);
      options = (Array.isArray(all) ? all : all?.values || [])
        .filter((t: any) => t && t.id && t.name)
        .map((t: any) => ({ value: String(t.id), label: String(t.name) }));
    }

    res.json({ options });
  } catch (error: any) {
    console.error('[Jira Options] issue-types error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Jira issue types' });
  }
});

// POST /api/integrations/options/jira/transitions
// Body: { domain, email, apiToken, issueKey }
jiraRouter.post('/transitions', async (req, res) => {
  try {
    const { domain, email, apiToken, issueKey } = issueKeySchema.parse(req.body);
    const baseUrl = normalizeDomain(domain);
    const authHeader = basicAuthHeader(email, apiToken);

    const url = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(issueKey)}/transitions`;
    const data = await jiraGetJson(url, authHeader);

    const transitions = Array.isArray(data?.transitions) ? data.transitions : [];
    const options = transitions
      .filter((t: any) => t && t.id && t.name)
      .map((t: any) => ({ value: String(t.id), label: String(t.name) }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Jira Options] transitions error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Jira transitions' });
  }
});

export default jiraRouter;
