import { z } from 'zod';

const hubspotAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type HubspotMarketingExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function hsRequestJson(accessToken: string, url: string, method: 'GET' | 'POST', body?: any) {
  const res = await fetch(url, {
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

export async function executeHubspotMarketingAction(input: HubspotMarketingExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = hubspotAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'add_to_list') {
    const listId = String(config.listId || '').trim();
    const email = String(config.email || '').trim();
    if (!listId) throw new Error('HubSpot Marketing add_to_list requires listId');
    if (!email) throw new Error('HubSpot Marketing add_to_list requires email');

    // Best-effort (legacy) Lists endpoint. HubSpot marketing APIs vary by account features.
    const url = `https://api.hubapi.com/contacts/v1/lists/${encodeURIComponent(listId)}/add`;
    const data = await hsRequestJson(accessToken, url, 'POST', { emails: [email] });
    return { ok: true, raw: data };
  }

  if (actionId === 'send_marketing_email') {
    const to = String(config.to || '').trim();
    const subject = String(config.subject || '').trim();
    const html = String(config.html || '').trim();

    if (!to) throw new Error('HubSpot Marketing send_marketing_email requires to');
    if (!subject) throw new Error('HubSpot Marketing send_marketing_email requires subject');
    if (!html) throw new Error('HubSpot Marketing send_marketing_email requires html');

    return {
      status: 'skipped',
      reason: 'HubSpot marketing email sending is implementation-dependent and requires a configured email asset/campaign',
      requested: { to, subject },
    };
  }

  return { status: 'skipped', reason: `HubSpot Marketing action not implemented: ${actionId}` };
}
