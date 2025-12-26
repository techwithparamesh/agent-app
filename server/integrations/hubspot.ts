import { Router } from 'express';
import { z } from 'zod';

const hubspotOptionsRouter = Router();

const baseSchema = z.object({
  accessToken: z.string().min(1),
});

const stagesSchema = baseSchema.extend({
  pipelineId: z.string().min(1),
});

async function hsGetJson(accessToken: string, path: string) {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HubSpot API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

// POST /api/integrations/options/hubspot/deal_pipelines
// Body: { accessToken }
hubspotOptionsRouter.post('/deal_pipelines', async (req, res) => {
  try {
    const { accessToken } = baseSchema.parse(req.body);

    const data = await hsGetJson(accessToken, '/crm/v3/pipelines/deals');
    const pipelines = Array.isArray(data?.results) ? data.results : [];

    const options = pipelines
      .filter((p: any) => p && p.id)
      .map((p: any) => ({ value: String(p.id), label: String(p.label || p.displayOrder || p.id) }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[HubSpot Options] deal_pipelines error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load HubSpot deal pipelines' });
  }
});

// POST /api/integrations/options/hubspot/deal_stages
// Body: { accessToken, pipelineId }
hubspotOptionsRouter.post('/deal_stages', async (req, res) => {
  try {
    const { accessToken, pipelineId } = stagesSchema.parse(req.body);

    const data = await hsGetJson(accessToken, `/crm/v3/pipelines/deals/${encodeURIComponent(pipelineId)}`);
    const stages = Array.isArray(data?.stages) ? data.stages : [];

    const options = stages
      .filter((s: any) => s && s.id)
      .map((s: any) => ({ value: String(s.id), label: String(s.label || s.id) }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[HubSpot Options] deal_stages error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load HubSpot deal stages' });
  }
});

export default hubspotOptionsRouter;
