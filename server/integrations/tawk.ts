import { Router } from 'express';

const router = Router();

// Placeholder options router: Tawk nodes do not currently declare loadOptions.
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
