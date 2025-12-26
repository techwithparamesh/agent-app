import { Router } from 'express';
import { z } from 'zod';

const mondayRouter = Router();

const baseSchema = z.object({
  apiToken: z.string().min(1),
});

const boardSchema = baseSchema.extend({
  boardId: z.union([z.string().min(1), z.number()]).transform(String),
});

async function mondayGraphQL(query: string, apiToken: string, variables?: Record<string, any>) {
  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      Authorization: apiToken,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Monday API error ${res.status}: ${text || res.statusText}`);
  }

  const json = await res.json();
  if (json?.errors?.length) {
    throw new Error(String(json.errors[0]?.message || 'Monday GraphQL error'));
  }
  return json;
}

// POST /api/integrations/options/monday/boards
// Body: { apiToken }
mondayRouter.post('/boards', async (req, res) => {
  try {
    const { apiToken } = baseSchema.parse(req.body);

    const query = `query { boards(limit: 100) { id name state } }`;
    const data = await mondayGraphQL(query, apiToken);

    const boards = Array.isArray(data?.data?.boards) ? data.data.boards : [];
    const options = boards
      .filter((b: any) => b && b.id && b.name && b.state !== 'archived')
      .map((b: any) => ({ value: String(b.id), label: String(b.name) }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Monday Options] boards error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Monday boards' });
  }
});

// POST /api/integrations/options/monday/groups
// Body: { apiToken, boardId }
mondayRouter.post('/groups', async (req, res) => {
  try {
    const { apiToken, boardId } = boardSchema.parse(req.body);

    const query = `query ($boardId: [ID!]) { boards(ids: $boardId) { groups { id title } } }`;
    const data = await mondayGraphQL(query, apiToken, { boardId: [boardId] });

    const groups = Array.isArray(data?.data?.boards?.[0]?.groups) ? data.data.boards[0].groups : [];
    const options = groups
      .filter((g: any) => g && g.id && g.title)
      .map((g: any) => ({ value: String(g.id), label: String(g.title) }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Monday Options] groups error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Monday groups' });
  }
});

// POST /api/integrations/options/monday/columns
// Body: { apiToken, boardId }
mondayRouter.post('/columns', async (req, res) => {
  try {
    const { apiToken, boardId } = boardSchema.parse(req.body);

    const query = `query ($boardId: [ID!]) { boards(ids: $boardId) { columns { id title type } } }`;
    const data = await mondayGraphQL(query, apiToken, { boardId: [boardId] });

    const columns = Array.isArray(data?.data?.boards?.[0]?.columns) ? data.data.boards[0].columns : [];
    const options = columns
      .filter((c: any) => c && c.id && c.title)
      .map((c: any) => ({ value: String(c.id), label: `${c.title} (${c.id})` }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Monday Options] columns error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Monday columns' });
  }
});

export default mondayRouter;
