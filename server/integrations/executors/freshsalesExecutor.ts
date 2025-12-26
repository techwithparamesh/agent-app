import { z } from 'zod';

const freshsalesAuthSchema = z.object({
  apiKey: z.string().min(1),
  domain: z.string().min(1),
});

export type FreshsalesExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function normalizeDomain(domain: string) {
  const d = domain.replace(/^https?:\/\//, '').trim();
  return d.endsWith('/') ? d.slice(0, -1) : d;
}

async function fsJson(baseUrl: string, apiKey: string, path: string, init?: RequestInit) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Token token=${apiKey}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Freshsales API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeFreshsalesAction(input: FreshsalesExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey, domain } = freshsalesAuthSchema.parse({
    apiKey: credential.apiKey,
    domain: credential.domain,
  });

  const baseUrl = `https://${normalizeDomain(domain)}/api`;

  if (actionId === 'create_lead') {
    const lastName = String(config.lastName || '').trim();
    if (!lastName) throw new Error('Freshsales create_lead requires lastName');

    const lead: any = {
      last_name: lastName,
    };
    if (config.firstName) lead.first_name = String(config.firstName);
    if (config.email) lead.email = String(config.email);
    if (config.phone) lead.phone = String(config.phone);
    if (config.company) lead.company_name = String(config.company);
    if (config.jobTitle) lead.job_title = String(config.jobTitle);

    const data = await fsJson(baseUrl, apiKey, '/leads', { method: 'POST', body: JSON.stringify({ lead }) });
    return { ok: true, lead: data?.lead || data, raw: data };
  }

  if (actionId === 'create_contact') {
    const lastName = String(config.lastName || '').trim();
    if (!lastName) throw new Error('Freshsales create_contact requires lastName');

    const contact: any = {
      last_name: lastName,
    };
    if (config.firstName) contact.first_name = String(config.firstName);
    if (config.email) contact.email = String(config.email);
    if (config.phone) contact.phone = String(config.phone);
    if (config.accountId) contact.account_id = String(config.accountId);

    const data = await fsJson(baseUrl, apiKey, '/contacts', { method: 'POST', body: JSON.stringify({ contact }) });
    return { ok: true, contact: data?.contact || data, raw: data };
  }

  if (actionId === 'create_deal') {
    const name = String(config.name || '').trim();
    if (!name) throw new Error('Freshsales create_deal requires name');

    const deal: any = { name };
    if (config.amount != null && String(config.amount).length) deal.amount = Number(config.amount);
    if (config.expectedClose) deal.expected_close = String(config.expectedClose);
    if (config.contactId) deal.contact_id = String(config.contactId);
    if (config.accountId) deal.account_id = String(config.accountId);

    const data = await fsJson(baseUrl, apiKey, '/deals', { method: 'POST', body: JSON.stringify({ deal }) });
    return { ok: true, deal: data?.deal || data, raw: data };
  }

  if (actionId === 'add_note') {
    const targetType = String(config.targetType || '').trim();
    const targetId = String(config.targetId || '').trim();
    const description = String(config.description || '').trim();
    if (!targetType) throw new Error('Freshsales add_note requires targetType');
    if (!targetId) throw new Error('Freshsales add_note requires targetId');
    if (!description) throw new Error('Freshsales add_note requires description');

    const note: any = {
      targetable_type: targetType,
      targetable_id: targetId,
      description,
    };

    const data = await fsJson(baseUrl, apiKey, '/notes', { method: 'POST', body: JSON.stringify({ note }) });
    return { ok: true, note: data?.note || data, raw: data };
  }

  return { status: 'skipped', reason: `Freshsales action not implemented: ${actionId}` };
}
