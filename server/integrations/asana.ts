import { Router } from 'express';
import { z } from 'zod';

const asanaRouter = Router();

const baseSchema = z.object({
  accessToken: z.string().min(1),
});

const workspaceSchema = baseSchema.extend({
  workspaceId: z.string().min(1),
});

const projectSchema = baseSchema.extend({
  projectId: z.string().min(1),
});

async function asanaGetJson(url: string, accessToken: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Asana API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

function toOptions(items: any[]) {
  return Array.isArray(items)
    ? items
        .filter((i: any) => i && (i.gid || i.id) && i.name)
        .map((i: any) => ({ value: String(i.gid || i.id), label: String(i.name) }))
    : [];
}

// POST /api/integrations/options/asana/workspaces
// Body: { accessToken }
asanaRouter.post('/workspaces', async (req, res) => {
  try {
    const { accessToken } = baseSchema.parse(req.body);

    const url = 'https://app.asana.com/api/1.0/workspaces?opt_fields=name';
    const data = await asanaGetJson(url, accessToken);

    res.json({ options: toOptions(data?.data || []) });
  } catch (error: any) {
    console.error('[Asana Options] workspaces error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Asana workspaces' });
  }
});

// POST /api/integrations/options/asana/projects
// Body: { accessToken, workspaceId }
asanaRouter.post('/projects', async (req, res) => {
  try {
    const { accessToken, workspaceId } = workspaceSchema.parse(req.body);

    const url = `https://app.asana.com/api/1.0/workspaces/${encodeURIComponent(workspaceId)}/projects?archived=false&opt_fields=name&limit=100`;
    const data = await asanaGetJson(url, accessToken);

    res.json({ options: toOptions(data?.data || []) });
  } catch (error: any) {
    console.error('[Asana Options] projects error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Asana projects' });
  }
});

// POST /api/integrations/options/asana/sections
// Body: { accessToken, projectId }
asanaRouter.post('/sections', async (req, res) => {
  try {
    const { accessToken, projectId } = projectSchema.parse(req.body);

    const url = `https://app.asana.com/api/1.0/projects/${encodeURIComponent(projectId)}/sections?opt_fields=name&limit=100`;
    const data = await asanaGetJson(url, accessToken);

    res.json({ options: toOptions(data?.data || []) });
  } catch (error: any) {
    console.error('[Asana Options] sections error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Asana sections' });
  }
});

// POST /api/integrations/options/asana/tasks
// Body: { accessToken, projectId }
asanaRouter.post('/tasks', async (req, res) => {
  try {
    const { accessToken, projectId } = projectSchema.parse(req.body);

    const url = `https://app.asana.com/api/1.0/projects/${encodeURIComponent(projectId)}/tasks?completed_since=now&opt_fields=name&limit=100`;
    const data = await asanaGetJson(url, accessToken);

    res.json({ options: toOptions(data?.data || []) });
  } catch (error: any) {
    console.error('[Asana Options] tasks error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Asana tasks' });
  }
});

export default asanaRouter;
