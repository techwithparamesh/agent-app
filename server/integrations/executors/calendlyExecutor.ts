import { z } from 'zod';

const calendlyAuthSchema = z.object({
  token: z.string().min(1),
});

export type CalendlyExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function pickToken(credential: Record<string, any>): string {
  const v = credential?.apiKey || credential?.accessToken || credential?.token;
  return String(v || '').trim();
}

async function cJson(token: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
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
    throw new Error(`Calendly API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function normalizeUri(uri: string) {
  return uri.replace(/\/+$/, '');
}

export async function executeCalendlyAction(input: CalendlyExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const token = calendlyAuthSchema.parse({ token: pickToken(credential) }).token;

  if (actionId === 'get_event') {
    const eventUri = String(config.eventUri || '').trim();
    if (!eventUri) throw new Error('Calendly get_event requires eventUri');

    const data = await cJson(token, eventUri, { method: 'GET' });
    return { ok: true, event: data, raw: data };
  }

  if (actionId === 'list_events') {
    const userUri = String(config.userUri || '').trim();
    const status = String(config.status || '').trim() || undefined;
    const minStartTime = String(config.minStartTime || '').trim() || undefined;
    const maxStartTime = String(config.maxStartTime || '').trim() || undefined;
    const count = config.count !== undefined ? Number(config.count) : 20;

    if (!userUri) throw new Error('Calendly list_events requires userUri');

    const url = new URL('https://api.calendly.com/scheduled_events');
    url.searchParams.set('user', userUri);
    if (status) url.searchParams.set('status', status);
    if (minStartTime) url.searchParams.set('min_start_time', minStartTime);
    if (maxStartTime) url.searchParams.set('max_start_time', maxStartTime);
    if (Number.isFinite(count) && count > 0) url.searchParams.set('count', String(Math.min(100, Math.trunc(count))));

    const data = await cJson(token, url.toString(), { method: 'GET' });
    return { ok: true, events: data, raw: data };
  }

  if (actionId === 'cancel_event') {
    const eventUri = String(config.eventUri || '').trim();
    const reason = String(config.reason || '').trim() || undefined;

    if (!eventUri) throw new Error('Calendly cancel_event requires eventUri');

    const cancelUrl = `${normalizeUri(eventUri)}/cancellation`;
    const data = await cJson(token, cancelUrl, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    return { ok: true, cancellation: data, raw: data };
  }

  return { status: 'skipped', message: `Calendly action not implemented: ${actionId}` };
}
