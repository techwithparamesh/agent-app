import { z } from 'zod';

const googleAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type GoogleFormsExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function gJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    throw new Error(`Google Forms API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeGoogleFormsAction(input: GoogleFormsExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = googleAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'get_responses') {
    const formId = String(config.formId || '').trim();
    const limit = config.limit !== undefined ? Number(config.limit) : 100;

    if (!formId) throw new Error('Google Forms get_responses requires formId');

    const url = new URL(`https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}/responses`);
    if (Number.isFinite(limit) && limit > 0) url.searchParams.set('pageSize', String(Math.min(5000, limit)));

    const data = await gJson(accessToken, url.toString(), { method: 'GET' });
    return { ok: true, formId, responses: data, raw: data };
  }

  if (actionId === 'get_form') {
    const formId = String(config.formId || '').trim();
    if (!formId) throw new Error('Google Forms get_form requires formId');

    const data = await gJson(accessToken, `https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}`, { method: 'GET' });
    return { ok: true, formId, form: data, raw: data };
  }

  return { status: 'skipped', message: `Google Forms action not implemented: ${actionId}` };
}
