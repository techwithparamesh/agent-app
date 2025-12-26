import { Router } from 'express';

const router = Router();

// Reddit node does not currently declare loadOptions.
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
