import { Router } from 'express';

const router = Router();

// Placeholder options router (current UI uses text inputs for IDs).
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
