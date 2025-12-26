import { Router } from 'express';

const router = Router();

// Twilio SMS currently does not require dynamic option loaders.
router.get('/', (_req, res) => res.json({ options: [] }));

export default router;
