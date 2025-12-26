import { Router } from 'express';

const router = Router();

// Internal app: switch. No loadOptions currently required.
router.all('*', async (_req, res) => {
  return res.json({ options: [] });
});

export default router;
