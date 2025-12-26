import { Router } from 'express';

const router = Router();

// SendGrid currently does not require dynamic option loaders.
// Keep this router mounted for parity and future option endpoints.
router.get('/', (_req, res) => res.json({ options: [] }));

export default router;
