import { Router } from 'express';

const router = Router();

// Placeholder options router (current UI uses fixed selects for modules).
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
