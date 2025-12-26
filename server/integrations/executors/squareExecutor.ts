import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const authSchema = z.object({
  accessToken: z.string().min(1),
  environment: z.enum(['production', 'sandbox']).optional(),
});

export type SquareExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function squareBaseUrl(environment?: string) {
  return environment === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';
}

async function squareJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
    throw new Error(`Square API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  if (data && typeof data === 'object' && Array.isArray((data as any).errors) && (data as any).errors.length) {
    throw new Error(`Square API error: ${JSON.stringify((data as any).errors)}`);
  }

  return data;
}

export async function executeSquareAction(input: SquareExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken, environment } = authSchema.parse({
    accessToken: credential.accessToken,
    environment: credential.environment,
  });

  if (actionId === 'create_payment') {
    const amount = Number(config.amount);
    const currency = String(config.currency || 'USD').trim();
    const sourceId = String(config.sourceId || '').trim();

    if (!Number.isFinite(amount)) throw new Error('Square create_payment requires amount');
    if (!currency) throw new Error('Square create_payment requires currency');
    if (!sourceId) throw new Error('Square create_payment requires sourceId');

    const idempotencyKey = String(config.idempotencyKey || '').trim() || randomUUID();

    const body = {
      source_id: sourceId,
      idempotency_key: idempotencyKey,
      amount_money: {
        amount: Math.trunc(amount),
        currency,
      },
    };

    const data = await squareJson(accessToken, `${squareBaseUrl(environment)}/v2/payments`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { ok: true, payment: data?.payment, raw: data };
  }

  return { status: 'skipped', reason: `Square action not implemented: ${actionId}` };
}
