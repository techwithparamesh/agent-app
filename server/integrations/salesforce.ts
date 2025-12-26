import { Router } from 'express';

const router = Router();

// Placeholder options router (current UI uses fixed selects for Salesforce).
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
