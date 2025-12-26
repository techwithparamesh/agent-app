import { z } from 'zod';

const pipedriveAuthSchema = z.object({
  apiToken: z.string().min(1),
  companyDomain: z.string().min(1),
});

export type PipedriveExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function normalizeDomain(domain: string) {
  const d = domain.replace(/^https?:\/\//, '').trim();
  return d.endsWith('/') ? d.slice(0, -1) : d;
}

async function pdJson(baseUrl: string, apiToken: string, path: string, init?: RequestInit) {
  const url = new URL(`${baseUrl}${path}`);
  url.searchParams.set('api_token', apiToken);

  const res = await fetch(url.toString(), {
    ...init,
    headers: {
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
    throw new Error(`Pipedrive API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  if (data && typeof data === 'object' && data.success === false) {
    throw new Error(`Pipedrive API error: ${data?.error || 'Request failed'}`);
  }

  return data;
}

export async function executePipedriveAction(input: PipedriveExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiToken, companyDomain } = pipedriveAuthSchema.parse({
    apiToken: credential.apiToken,
    companyDomain: credential.companyDomain,
  });

  const baseUrl = `https://${normalizeDomain(companyDomain)}/api/v1`;

  if (actionId === 'create_deal') {
    const title = String(config.title || '').trim();
    if (!title) throw new Error('Pipedrive create_deal requires title');

    const body: any = { title };
    if (config.value != null && String(config.value).length) body.value = Number(config.value);
    if (config.currency) body.currency = String(config.currency);
    if (config.personId) body.person_id = String(config.personId);
    if (config.orgId) body.org_id = String(config.orgId);
    if (config.stageId) body.stage_id = String(config.stageId);
    if (config.expectedCloseDate) body.expected_close_date = String(config.expectedCloseDate).slice(0, 10);

    const data = await pdJson(baseUrl, apiToken, '/deals', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, deal: data?.data, raw: data };
  }

  if (actionId === 'update_deal') {
    const dealId = String(config.dealId || '').trim();
    if (!dealId) throw new Error('Pipedrive update_deal requires dealId');

    const body: any = {};
    if (config.title != null) body.title = String(config.title);
    if (config.value != null && String(config.value).length) body.value = Number(config.value);
    if (config.stageId != null) body.stage_id = String(config.stageId);
    if (config.status != null) body.status = String(config.status);

    const data = await pdJson(baseUrl, apiToken, `/deals/${encodeURIComponent(dealId)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return { ok: true, deal: data?.data, raw: data };
  }

  if (actionId === 'create_person') {
    const name = String(config.name || '').trim();
    if (!name) throw new Error('Pipedrive create_person requires name');

    const body: any = { name };
    if (config.email) body.email = String(config.email);
    if (config.phone) body.phone = String(config.phone);
    if (config.orgId) body.org_id = String(config.orgId);

    const data = await pdJson(baseUrl, apiToken, '/persons', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, person: data?.data, raw: data };
  }

  if (actionId === 'create_activity') {
    const subject = String(config.subject || '').trim();
    const type = String(config.type || '').trim();
    if (!subject) throw new Error('Pipedrive create_activity requires subject');
    if (!type) throw new Error('Pipedrive create_activity requires type');

    const body: any = { subject, type };
    if (config.dueDate) body.due_date = String(config.dueDate).slice(0, 10);
    if (config.dealId) body.deal_id = String(config.dealId);
    if (config.personId) body.person_id = String(config.personId);
    if (config.note) body.note = String(config.note);

    const data = await pdJson(baseUrl, apiToken, '/activities', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, activity: data?.data, raw: data };
  }

  if (actionId === 'add_note') {
    const content = String(config.content || '').trim();
    if (!content) throw new Error('Pipedrive add_note requires content');

    const body: any = { content };
    if (config.dealId) body.deal_id = String(config.dealId);
    if (config.personId) body.person_id = String(config.personId);
    if (config.orgId) body.org_id = String(config.orgId);

    const data = await pdJson(baseUrl, apiToken, '/notes', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, note: data?.data, raw: data };
  }

  return { status: 'skipped', reason: `Pipedrive action not implemented: ${actionId}` };
}
