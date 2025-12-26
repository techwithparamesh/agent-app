import { Router } from 'express';

const router = Router();

// HubSpot Marketing node does not currently declare loadOptions.
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
