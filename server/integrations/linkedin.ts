import { Router } from 'express';

const router = Router();

// Placeholder options router: the current UI config for LinkedIn does not require
// dynamic loadOptions, but we mount this for completeness.
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
