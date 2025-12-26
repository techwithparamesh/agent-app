import { Router } from 'express';

const router = Router();

// Placeholder options router.
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
