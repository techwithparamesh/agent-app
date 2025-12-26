import { Router } from 'express';
import { z } from 'zod';

const clickupRouter = Router();

const baseSchema = z.object({
  apiToken: z.string().min(1),
});

const teamSchema = baseSchema.extend({
  teamId: z.union([z.string().min(1), z.number()]).transform(String),
});

const spaceSchema = baseSchema.extend({
  spaceId: z.union([z.string().min(1), z.number()]).transform(String),
});

const listsSchema = baseSchema.extend({
  spaceId: z.union([z.string().min(1), z.number()]).transform(String),
  folderId: z.union([z.string().min(1), z.number()]).transform(String).optional(),
});

async function clickupGetJson(url: string, apiToken: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: apiToken,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ClickUp API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

function toOptions(items: any[], idKey: string, labelKey: string) {
  return Array.isArray(items)
    ? items
        .filter((i: any) => i && i[idKey] != null && i[labelKey])
        .map((i: any) => ({ value: String(i[idKey]), label: String(i[labelKey]) }))
    : [];
}

// POST /api/integrations/options/clickup/teams
// Body: { apiToken }
clickupRouter.post('/teams', async (req, res) => {
  try {
    const { apiToken } = baseSchema.parse(req.body);
    const data = await clickupGetJson('https://api.clickup.com/api/v2/team', apiToken);

    const teams = Array.isArray(data?.teams) ? data.teams : [];
    res.json({ options: toOptions(teams, 'id', 'name') });
  } catch (error: any) {
    console.error('[ClickUp Options] teams error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load ClickUp teams' });
  }
});

// POST /api/integrations/options/clickup/spaces
// Body: { apiToken, teamId }
clickupRouter.post('/spaces', async (req, res) => {
  try {
    const { apiToken, teamId } = teamSchema.parse(req.body);
    const data = await clickupGetJson(`https://api.clickup.com/api/v2/team/${encodeURIComponent(teamId)}/space?archived=false`, apiToken);

    const spaces = Array.isArray(data?.spaces) ? data.spaces : [];
    res.json({ options: toOptions(spaces, 'id', 'name') });
  } catch (error: any) {
    console.error('[ClickUp Options] spaces error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load ClickUp spaces' });
  }
});

// POST /api/integrations/options/clickup/folders
// Body: { apiToken, spaceId }
clickupRouter.post('/folders', async (req, res) => {
  try {
    const { apiToken, spaceId } = spaceSchema.parse(req.body);
    const data = await clickupGetJson(`https://api.clickup.com/api/v2/space/${encodeURIComponent(spaceId)}/folder?archived=false`, apiToken);

    const folders = Array.isArray(data?.folders) ? data.folders : [];
    res.json({ options: toOptions(folders, 'id', 'name') });
  } catch (error: any) {
    console.error('[ClickUp Options] folders error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load ClickUp folders' });
  }
});

// POST /api/integrations/options/clickup/lists
// Body: { apiToken, spaceId, folderId? }
clickupRouter.post('/lists', async (req, res) => {
  try {
    const { apiToken, spaceId, folderId } = listsSchema.parse(req.body);

    const url = folderId
      ? `https://api.clickup.com/api/v2/folder/${encodeURIComponent(folderId)}/list?archived=false`
      : `https://api.clickup.com/api/v2/space/${encodeURIComponent(spaceId)}/list?archived=false`;

    const data = await clickupGetJson(url, apiToken);

    const lists = Array.isArray(data?.lists) ? data.lists : [];
    res.json({ options: toOptions(lists, 'id', 'name') });
  } catch (error: any) {
    console.error('[ClickUp Options] lists error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load ClickUp lists' });
  }
});

export default clickupRouter;
