import { Router } from 'express';

const router = Router();

// Stripe currently does not require dynamic option loaders.
router.get('/', (_req, res) => res.json({ options: [] }));

export default router;
