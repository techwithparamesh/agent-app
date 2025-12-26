import { Router } from 'express';

const paypalOptionsRouter = Router();

// POST /api/integrations/options/paypal/environments
// Body: (none)
paypalOptionsRouter.post('/environments', async (_req, res) => {
  return res.json({
    options: [
      { value: 'sandbox', label: 'Sandbox' },
      { value: 'live', label: 'Live' },
    ],
  });
});

export default paypalOptionsRouter;
