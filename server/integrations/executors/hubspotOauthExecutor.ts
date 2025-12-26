import { z } from 'zod';

const hubspotAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type HubspotOauthExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function hsRequestJson(accessToken: string, path: string, method: 'GET' | 'POST', body?: any) {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`HubSpot API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeHubspotOauthAction(input: HubspotOauthExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = hubspotAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_contact') {
    const email = String(config.email || '').trim();
    const firstName = String(config.firstName || '').trim();
    const lastName = String(config.lastName || '').trim();

    if (!email) throw new Error('HubSpot OAuth create_contact requires email');

    const properties: Record<string, any> = { email };
    if (firstName) properties.firstname = firstName;
    if (lastName) properties.lastname = lastName;

    const data = await hsRequestJson(accessToken, '/crm/v3/objects/contacts', 'POST', { properties });
    return { ok: true, contact: data, raw: data };
  }

  return { status: 'skipped', reason: `HubSpot OAuth action not implemented: ${actionId}` };
}
