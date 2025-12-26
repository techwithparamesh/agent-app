import { z } from 'zod';

const sendgridAuthSchema = z.object({
  apiKey: z.string().min(1),
});

export type SendgridExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function sgFetchJson(url: string, apiKey: string, method: 'GET' | 'POST' | 'PUT', body?: any) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
    throw new Error(`SendGrid API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return { status: res.status, data };
}

export async function executeSendgridAction(input: SendgridExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey } = sendgridAuthSchema.parse({ apiKey: credential.apiKey });

  if (actionId === 'send_email') {
    const to = String(config.to || '').trim();
    const from = String(config.from || '').trim();
    const subject = String(config.subject || '').trim();
    if (!to) throw new Error('SendGrid send_email requires to');
    if (!from) throw new Error('SendGrid send_email requires from');
    if (!subject) throw new Error('SendGrid send_email requires subject');

    const fromName = config.fromName ? String(config.fromName) : undefined;
    const textContent = config.textContent != null ? String(config.textContent) : undefined;
    const htmlContent = config.htmlContent != null ? String(config.htmlContent) : undefined;
    const replyTo = config.replyTo ? String(config.replyTo) : undefined;

    const categories = (() => {
      try {
        if (Array.isArray(config.categories)) return config.categories.map(String);
        if (typeof config.categories === 'string' && config.categories.trim().startsWith('[')) return JSON.parse(config.categories);
      } catch {
        // ignore
      }
      return undefined;
    })();

    const body: any = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, ...(fromName ? { name: fromName } : {}) },
      subject,
      content: [],
      ...(replyTo ? { reply_to: { email: replyTo } } : {}),
      ...(Array.isArray(categories) ? { categories } : {}),
    };

    if (textContent) body.content.push({ type: 'text/plain', value: textContent });
    if (htmlContent) body.content.push({ type: 'text/html', value: htmlContent });
    if (body.content.length === 0) body.content.push({ type: 'text/plain', value: '' });

    const res = await sgFetchJson('https://api.sendgrid.com/v3/mail/send', apiKey, 'POST', body);
    // SendGrid returns 202 Accepted on success
    return { ok: true, status: res.status };
  }

  if (actionId === 'send_template') {
    const to = String(config.to || '').trim();
    const from = String(config.from || '').trim();
    const templateId = String(config.templateId || '').trim();
    if (!to) throw new Error('SendGrid send_template requires to');
    if (!from) throw new Error('SendGrid send_template requires from');
    if (!templateId) throw new Error('SendGrid send_template requires templateId');

    let dynamicData: any = undefined;
    if (config.dynamicData != null) {
      if (typeof config.dynamicData === 'object') dynamicData = config.dynamicData;
      else {
        try {
          dynamicData = JSON.parse(String(config.dynamicData));
        } catch {
          dynamicData = undefined;
        }
      }
    }

    const body: any = {
      personalizations: [
        {
          to: [{ email: to }],
          ...(dynamicData ? { dynamic_template_data: dynamicData } : {}),
        },
      ],
      from: { email: from },
      template_id: templateId,
    };

    const res = await sgFetchJson('https://api.sendgrid.com/v3/mail/send', apiKey, 'POST', body);
    return { ok: true, status: res.status };
  }

  if (actionId === 'add_contact') {
    const email = String(config.email || '').trim();
    if (!email) throw new Error('SendGrid add_contact requires email');

    const firstName = config.firstName ? String(config.firstName) : undefined;
    const lastName = config.lastName ? String(config.lastName) : undefined;

    let listIds: string[] | undefined;
    try {
      if (Array.isArray(config.listIds)) listIds = config.listIds.map(String);
      else if (typeof config.listIds === 'string' && config.listIds.trim().startsWith('[')) listIds = JSON.parse(config.listIds);
    } catch {
      listIds = undefined;
    }

    let customFields: any = undefined;
    if (config.customFields != null) {
      if (typeof config.customFields === 'object') customFields = config.customFields;
      else {
        try {
          customFields = JSON.parse(String(config.customFields));
        } catch {
          customFields = undefined;
        }
      }
    }

    const contact: any = {
      email,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
      ...(customFields ? customFields : {}),
    };

    const body: any = {
      contacts: [contact],
      ...(Array.isArray(listIds) ? { list_ids: listIds } : {}),
    };

    const res = await sgFetchJson('https://api.sendgrid.com/v3/marketing/contacts', apiKey, 'PUT', body);
    return { ok: true, status: res.status, data: res.data };
  }

  return { status: 'skipped', reason: `SendGrid action not implemented: ${actionId}` };
}
