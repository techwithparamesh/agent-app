import { z } from 'zod';

export type MixpanelExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

const authSchema = z.object({
  projectToken: z.string().min(1),
});

async function mixpanelTrack(token: string, event: string, distinctId: string, properties?: Record<string, any>) {
  const payload = {
    event,
    properties: {
      token,
      distinct_id: distinctId,
      ...(properties || {}),
    },
  };

  const res = await fetch('https://api.mixpanel.com/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain',
    },
    body: JSON.stringify([payload]),
  });

  const text = await res.text().catch(() => '');
  if (!res.ok) throw new Error(`Mixpanel API error ${res.status}: ${text}`);

  // Mixpanel often returns "1" on success.
  return { responseText: text };
}

export async function executeMixpanelAction(input: MixpanelExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { projectToken } = authSchema.parse({ projectToken: credential.projectToken });

  if (actionId === 'track') {
    const distinctId = String(config.distinctId || '').trim();
    const event = String(config.event || '').trim();
    if (!distinctId) throw new Error('Mixpanel track requires distinctId');
    if (!event) throw new Error('Mixpanel track requires event');

    const properties = config.properties && typeof config.properties === 'object' ? config.properties : undefined;

    const data = await mixpanelTrack(projectToken, event, distinctId, properties);
    return { ok: true, raw: data };
  }

  return { status: 'skipped', reason: `Mixpanel action not implemented: ${actionId}` };
}
