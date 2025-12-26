import { z } from 'zod';

const hubspotAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type HubspotExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function parseJsonMaybe(value: any) {
  if (value == null) return undefined;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function buildProperties(props: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(props || {})) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = v;
  }
  return out;
}

async function hsRequestJson(accessToken: string, path: string, method: 'GET' | 'POST' | 'PATCH', body?: any) {
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

export async function executeHubspotAction(input: HubspotExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = hubspotAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'create_contact') {
    const email = String(config.email || '').trim();
    if (!email) throw new Error('HubSpot create_contact requires email');

    const customProperties = parseJsonMaybe(config.customProperties);
    const properties = buildProperties({
      email,
      ...(config.firstname ? { firstname: String(config.firstname) } : {}),
      ...(config.lastname ? { lastname: String(config.lastname) } : {}),
      ...(config.phone ? { phone: String(config.phone) } : {}),
      ...(config.company ? { company: String(config.company) } : {}),
      ...(config.jobtitle ? { jobtitle: String(config.jobtitle) } : {}),
      ...(config.lifecyclestage ? { lifecyclestage: String(config.lifecyclestage) } : {}),
      ...(customProperties && typeof customProperties === 'object' ? customProperties : {}),
    });

    const data = await hsRequestJson(accessToken, '/crm/v3/objects/contacts', 'POST', { properties });
    return { ok: true, contact: data, raw: data };
  }

  if (actionId === 'update_contact') {
    const contactId = String(config.contactId || '').trim();
    if (!contactId) throw new Error('HubSpot update_contact requires contactId');

    const properties = parseJsonMaybe(config.properties);
    if (!properties || typeof properties !== 'object') throw new Error('HubSpot update_contact requires properties (json object)');

    const data = await hsRequestJson(accessToken, `/crm/v3/objects/contacts/${encodeURIComponent(contactId)}`, 'PATCH', {
      properties: buildProperties(properties),
    });

    return { ok: true, contact: data, raw: data };
  }

  if (actionId === 'get_contact') {
    const contactId = String(config.contactId || '').trim();
    const email = String(config.email || '').trim();
    const props = parseJsonMaybe(config.properties);

    const params = new URLSearchParams();
    if (Array.isArray(props) && props.length) {
      for (const p of props) params.append('properties', String(p));
    }

    if (contactId) {
      const data = await hsRequestJson(accessToken, `/crm/v3/objects/contacts/${encodeURIComponent(contactId)}${params.toString() ? `?${params.toString()}` : ''}`, 'GET');
      return { ok: true, contact: data, raw: data };
    }

    if (!email) throw new Error('HubSpot get_contact requires contactId or email');

    const search = await hsRequestJson(accessToken, '/crm/v3/objects/contacts/search', 'POST', {
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'email',
              operator: 'EQ',
              value: email,
            },
          ],
        },
      ],
      properties: Array.isArray(props) ? props : undefined,
      limit: 1,
    });

    const hit = Array.isArray(search?.results) && search.results.length ? search.results[0] : null;
    return { ok: true, contact: hit, raw: search };
  }

  if (actionId === 'create_deal') {
    const dealname = String(config.dealname || '').trim();
    const pipeline = String(config.pipeline || '').trim();
    const dealstage = String(config.dealstage || '').trim();
    if (!dealname) throw new Error('HubSpot create_deal requires dealname');
    if (!pipeline) throw new Error('HubSpot create_deal requires pipeline');
    if (!dealstage) throw new Error('HubSpot create_deal requires dealstage');

    const properties = buildProperties({
      dealname,
      ...(config.amount != null && String(config.amount).length ? { amount: String(config.amount) } : {}),
      pipeline,
      dealstage,
      ...(config.closedate ? { closedate: String(config.closedate) } : {}),
    });

    const data = await hsRequestJson(accessToken, '/crm/v3/objects/deals', 'POST', { properties });
    return { ok: true, deal: data, raw: data };
  }

  if (actionId === 'update_deal') {
    const dealId = String(config.dealId || '').trim();
    if (!dealId) throw new Error('HubSpot update_deal requires dealId');

    const properties = parseJsonMaybe(config.properties);
    if (!properties || typeof properties !== 'object') throw new Error('HubSpot update_deal requires properties (json object)');

    const data = await hsRequestJson(accessToken, `/crm/v3/objects/deals/${encodeURIComponent(dealId)}`, 'PATCH', {
      properties: buildProperties(properties),
    });

    return { ok: true, deal: data, raw: data };
  }

  if (actionId === 'create_company') {
    const name = String(config.name || '').trim();
    if (!name) throw new Error('HubSpot create_company requires name');

    const properties = buildProperties({
      name,
      ...(config.domain ? { domain: String(config.domain) } : {}),
      ...(config.industry ? { industry: String(config.industry) } : {}),
      ...(config.phone ? { phone: String(config.phone) } : {}),
      ...(config.city ? { city: String(config.city) } : {}),
      ...(config.country ? { country: String(config.country) } : {}),
    });

    const data = await hsRequestJson(accessToken, '/crm/v3/objects/companies', 'POST', { properties });
    return { ok: true, company: data, raw: data };
  }

  if (actionId === 'add_note') {
    const noteBody = String(config.noteBody || '').trim();
    if (!noteBody) throw new Error('HubSpot add_note requires noteBody');

    // Creates a Note object. Association is intentionally not applied here because
    // it requires association type IDs that vary by portal/object.
    const data = await hsRequestJson(accessToken, '/crm/v3/objects/notes', 'POST', {
      properties: {
        hs_note_body: noteBody,
      },
    });

    return {
      ok: true,
      note: data,
      associationSkipped: true,
      associationInfo: {
        associationType: config.associationType,
        associatedId: config.associatedId,
      },
      raw: data,
    };
  }

  return { status: 'skipped', reason: `HubSpot action not implemented: ${actionId}` };
}
