import { Router } from 'express';
import { z } from 'zod';

const linearRouter = Router();

const baseSchema = z.object({
  apiKey: z.string().min(1),
});

const teamSchema = baseSchema.extend({
  teamId: z.string().min(1),
});

async function linearGraphQL<T = any>(query: string, apiKey: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Linear API error ${res.status}: ${text || res.statusText}`);
  }

  const json = await res.json();
  if (json?.errors?.length) {
    throw new Error(String(json.errors[0]?.message || 'Linear GraphQL error'));
  }

  return json;
}

// POST /api/integrations/options/linear/teams
// Body: { apiKey }
linearRouter.post('/teams', async (req, res) => {
  try {
    const { apiKey } = baseSchema.parse(req.body);

    const query = `query { teams { nodes { id name } } }`;
    const data: any = await linearGraphQL(query, apiKey);

    const teams = Array.isArray(data?.data?.teams?.nodes) ? data.data.teams.nodes : [];
    const options = teams
      .filter((t: any) => t && t.id && t.name)
      .map((t: any) => ({ value: String(t.id), label: String(t.name) }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Linear Options] teams error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Linear teams' });
  }
});

// POST /api/integrations/options/linear/projects
// Body: { apiKey, teamId }
linearRouter.post('/projects', async (req, res) => {
  try {
    const { apiKey, teamId } = teamSchema.parse(req.body);

    const query = `query ($teamId: String!) { team(id: $teamId) { projects { nodes { id name } } } }`;
    const data: any = await linearGraphQL(query, apiKey, { teamId });

    const projects = Array.isArray(data?.data?.team?.projects?.nodes) ? data.data.team.projects.nodes : [];
    const options = projects
      .filter((p: any) => p && p.id && p.name)
      .map((p: any) => ({ value: String(p.id), label: String(p.name) }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Linear Options] projects error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Linear projects' });
  }
});

// POST /api/integrations/options/linear/states
// Body: { apiKey, teamId }
linearRouter.post('/states', async (req, res) => {
  try {
    const { apiKey, teamId } = teamSchema.parse(req.body);

    const query = `query ($teamId: String!) { team(id: $teamId) { states { nodes { id name } } } }`;
    const data: any = await linearGraphQL(query, apiKey, { teamId });

    const states = Array.isArray(data?.data?.team?.states?.nodes) ? data.data.team.states.nodes : [];
    const options = states
      .filter((s: any) => s && s.id && s.name)
      .map((s: any) => ({ value: String(s.id), label: String(s.name) }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Linear Options] states error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Linear states' });
  }
});

// POST /api/integrations/options/linear/labels
// Body: { apiKey, teamId }
linearRouter.post('/labels', async (req, res) => {
  try {
    const { apiKey, teamId } = teamSchema.parse(req.body);

    const query = `query ($teamId: String!) { team(id: $teamId) { labels { nodes { id name } } } }`;
    const data: any = await linearGraphQL(query, apiKey, { teamId });

    const labels = Array.isArray(data?.data?.team?.labels?.nodes) ? data.data.team.labels.nodes : [];
    const options = labels
      .filter((l: any) => l && l.id && l.name)
      .map((l: any) => ({ value: String(l.id), label: String(l.name) }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Linear Options] labels error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Linear labels' });
  }
});

export default linearRouter;
