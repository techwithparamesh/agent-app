import { Router } from 'express';

const router = Router();

// IFTTT nodes do not currently declare loadOptions.
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
