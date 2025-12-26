import { Router } from 'express';
import { z } from 'zod';

const calendlyRouter = Router();

const baseSchema = z.object({
  apiKey: z.string().min(1),
});

const eventTypesSchema = baseSchema.extend({
  userUri: z.string().min(1).optional(),
});

async function calendlyGetJson(url: string, apiKey: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Calendly API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// POST /api/integrations/options/calendly/users
// Body: { apiKey }
// Returns the authenticated user as an option (Calendly usually operates scoped to a user URI)
calendlyRouter.post('/users', async (req, res) => {
  try {
    const { apiKey } = baseSchema.parse(req.body);

    const data = await calendlyGetJson('https://api.calendly.com/users/me', apiKey);
    const user = data?.resource;

    const options = user?.uri
      ? [{ value: String(user.uri), label: String(user.name || user.email || 'Me') }]
      : [];

    res.json({ options });
  } catch (error: any) {
    console.error('[Calendly Options] users error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Calendly user' });
  }
});

// POST /api/integrations/options/calendly/event-types
// Body: { apiKey, userUri? }
calendlyRouter.post('/event-types', async (req, res) => {
  try {
    const { apiKey, userUri } = eventTypesSchema.parse(req.body);

    let resolvedUserUri = userUri;
    if (!resolvedUserUri) {
      const me = await calendlyGetJson('https://api.calendly.com/users/me', apiKey);
      resolvedUserUri = me?.resource?.uri;
    }

    if (!resolvedUserUri) {
      return res.status(400).json({ message: 'Missing userUri' });
    }

    const url = `https://api.calendly.com/event_types?user=${encodeURIComponent(resolvedUserUri)}&count=100`;
    const data = await calendlyGetJson(url, apiKey);

    const collection = Array.isArray(data?.collection) ? data.collection : [];
    const options = collection
      .filter((e: any) => e && e.uri && (e.name || e.slug))
      .map((e: any) => ({ value: String(e.uri), label: String(e.name || e.slug) }));

    res.json({ options });
  } catch (error: any) {
    console.error('[Calendly Options] event-types error:', error);
    res.status(400).json({ message: error?.message || 'Failed to load Calendly event types' });
  }
});

export default calendlyRouter;
