import { Router } from 'express';
import { z } from 'zod';

const trelloRouter = Router();

const baseSchema = z.object({
  apiKey: z.string().min(1),
  token: z.string().min(1),
});

const listsSchema = baseSchema.extend({
  boardId: z.string().min(1),
});

const cardsSchema = baseSchema.extend({
  listId: z.string().min(1),
});

async function trelloGetJson(url: string) {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Trello API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/trello/boards
// Body: { apiKey, token }
trelloRouter.post('/boards', async (req, res) => {
  try {
    const { apiKey, token } = baseSchema.parse(req.body);

    const url = `https://api.trello.com/1/members/me/boards?filter=open&fields=name&key=${encodeURIComponent(apiKey)}&token=${encodeURIComponent(token)}`;
    const boards = await trelloGetJson(url);

    const options = Array.isArray(boards)
      ? boards
          .filter((b: any) => b && b.id && b.name)
          .map((b: any) => ({ value: String(b.id), label: String(b.name) }))
      : [];

    res.json({ options });
  } catch (error: any) {
    console.error('[Trello Options] boards error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Trello boards' });
  }
});

// POST /api/integrations/options/trello/lists
// Body: { apiKey, token, boardId }
trelloRouter.post('/lists', async (req, res) => {
  try {
    const { apiKey, token, boardId } = listsSchema.parse(req.body);

    const url = `https://api.trello.com/1/boards/${encodeURIComponent(boardId)}/lists?filter=open&fields=name&key=${encodeURIComponent(apiKey)}&token=${encodeURIComponent(token)}`;
    const lists = await trelloGetJson(url);

    const options = Array.isArray(lists)
      ? lists
          .filter((l: any) => l && l.id && l.name)
          .map((l: any) => ({ value: String(l.id), label: String(l.name) }))
      : [];

    res.json({ options });
  } catch (error: any) {
    console.error('[Trello Options] lists error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Trello lists' });
  }
});

// POST /api/integrations/options/trello/cards
// Body: { apiKey, token, listId }
trelloRouter.post('/cards', async (req, res) => {
  try {
    const { apiKey, token, listId } = cardsSchema.parse(req.body);

    const url = `https://api.trello.com/1/lists/${encodeURIComponent(listId)}/cards?fields=name&key=${encodeURIComponent(apiKey)}&token=${encodeURIComponent(token)}`;
    const cards = await trelloGetJson(url);

    const options = Array.isArray(cards)
      ? cards
          .filter((c: any) => c && c.id && c.name)
          .map((c: any) => ({ value: String(c.id), label: String(c.name) }))
      : [];

    res.json({ options });
  } catch (error: any) {
    console.error('[Trello Options] cards error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Trello cards' });
  }
});

export default trelloRouter;
