import { z } from 'zod';

const paypalAuthSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  environment: z.enum(['sandbox', 'live']).default('sandbox'),
});

export type PayPalExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function paypalBase(env: 'sandbox' | 'live') {
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalAccessToken(clientId: string, clientSecret: string, env: 'sandbox' | 'live') {
  const auth = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  const res = await fetch(`${paypalBase(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`PayPal OAuth error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  const token = data?.access_token;
  if (!token || typeof token !== 'string') throw new Error('PayPal OAuth did not return access_token');
  return token;
}

async function ppJson(accessToken: string, env: 'sandbox' | 'live', path: string, init?: RequestInit) {
  const res = await fetch(`${paypalBase(env)}${path}`, {
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
    throw new Error(`PayPal API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executePayPalAction(input: PayPalExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { clientId, clientSecret, environment } = paypalAuthSchema.parse({
    clientId: credential.clientId,
    clientSecret: credential.clientSecret,
    environment: credential.environment || 'sandbox',
  });

  const env = environment as 'sandbox' | 'live';
  const accessToken = await getPayPalAccessToken(clientId, clientSecret, env);

  if (actionId === 'create_order') {
    const amount = Number(config.amount);
    const currency = String(config.currency || 'USD').trim();
    const returnUrl = String(config.returnUrl || '').trim();
    const cancelUrl = String(config.cancelUrl || '').trim();
    const description = String(config.description || '').trim() || undefined;

    if (!Number.isFinite(amount) || amount <= 0) throw new Error('PayPal create_order requires amount');
    if (!currency) throw new Error('PayPal create_order requires currency');
    if (!returnUrl) throw new Error('PayPal create_order requires returnUrl');
    if (!cancelUrl) throw new Error('PayPal create_order requires cancelUrl');

    const body: any = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          ...(description ? { description } : {}),
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };

    const data = await ppJson(accessToken, env, '/v2/checkout/orders', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, order: data, raw: data };
  }

  if (actionId === 'capture_order') {
    const orderId = String(config.orderId || '').trim();
    if (!orderId) throw new Error('PayPal capture_order requires orderId');

    const data = await ppJson(accessToken, env, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    return { ok: true, capture: data, raw: data };
  }

  if (actionId === 'refund_capture') {
    const captureId = String(config.captureId || '').trim();
    if (!captureId) throw new Error('PayPal refund_capture requires captureId');

    const amount = config.amount != null && String(config.amount).length ? Number(config.amount) : undefined;
    const currency = String(config.currency || 'USD').trim();
    const note = String(config.note || '').trim() || undefined;

    const body: any = {};
    if (amount !== undefined) {
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('PayPal refund_capture amount must be positive');
      body.amount = { currency_code: currency, value: amount.toFixed(2) };
    }
    if (note) body.note_to_payer = note;

    const data = await ppJson(accessToken, env, `/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { ok: true, refund: data, raw: data };
  }

  if (actionId === 'get_order') {
    const orderId = String(config.orderId || '').trim();
    if (!orderId) throw new Error('PayPal get_order requires orderId');

    const data = await ppJson(accessToken, env, `/v2/checkout/orders/${encodeURIComponent(orderId)}`, { method: 'GET' });
    return { ok: true, order: data, raw: data };
  }

  if (actionId === 'create_payout') {
    const recipientEmail = String(config.recipientEmail || '').trim();
    const amount = Number(config.amount);
    const currency = String(config.currency || 'USD').trim();
    const note = String(config.note || '').trim() || undefined;

    if (!recipientEmail) throw new Error('PayPal create_payout requires recipientEmail');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('PayPal create_payout requires amount');

    const senderBatchId = `agentapp-${Date.now()}`;

    const body: any = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: 'You have a payout',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency,
          },
          receiver: recipientEmail,
          note: note || undefined,
          sender_item_id: senderBatchId,
        },
      ],
    };

    const data = await ppJson(accessToken, env, '/v1/payments/payouts', { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, payout: data, raw: data };
  }

  return { status: 'skipped', reason: `PayPal action not implemented: ${actionId}` };
}
