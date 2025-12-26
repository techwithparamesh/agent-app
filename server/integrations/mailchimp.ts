import { Router } from 'express';
import { z } from 'zod';

const mailchimpOptionsRouter = Router();

const baseSchema = z.object({
  apiKey: z.string().min(1),
});

function getDatacenter(apiKey: string) {
  const parts = apiKey.split('-');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function mailchimpAuthHeader(apiKey: string) {
  return `Basic ${Buffer.from(`anystring:${apiKey}`, 'utf8').toString('base64')}`;
}

async function mcGetJson(apiKey: string, path: string) {
  const dc = getDatacenter(apiKey);
  if (!dc) throw new Error('Mailchimp API key must include datacenter suffix like "xxxx-us1"');

  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0${path}`, {
    method: 'GET',
    headers: {
      Authorization: mailchimpAuthHeader(apiKey),
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Mailchimp API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

// POST /api/integrations/options/mailchimp/lists
// Body: { apiKey }
mailchimpOptionsRouter.post('/lists', async (req, res) => {
  try {
    const { apiKey } = baseSchema.parse(req.body);

    const data = await mcGetJson(apiKey, '/lists?count=1000&fields=lists.id,lists.name');
    const lists = Array.isArray(data?.lists) ? data.lists : [];

    const options = lists
      .filter((l: any) => l && l.id && l.name)
      .map((l: any) => ({ value: String(l.id), label: String(l.name) }));

    return res.json({ options });
  } catch (error: any) {
    console.error('[Mailchimp Options] lists error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Mailchimp lists' });
  }
});

export default mailchimpOptionsRouter;
