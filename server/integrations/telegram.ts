import { Router } from 'express';

const telegramOptionsRouter = Router();

// Telegram Bot API does not provide a reliable "list chats" endpoint.
// Keep an explicit options router mounted so the app is present in option routes.
telegramOptionsRouter.post('/chats', async (_req, res) => {
  return res.json({ options: [] });
});

export default telegramOptionsRouter;
