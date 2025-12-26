import { z } from 'zod';

const stripeAuthSchema = z.object({
  secretKey: z.string().min(1),
});

export type StripeExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function formEncode(obj: Record<string, any>) {
  const form = new URLSearchParams();

  const add = (key: string, value: any) => {
    if (value === undefined || value === null) return;
    form.append(key, String(value));
  };

  const walk = (prefix: string, value: any) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v, idx) => walk(`${prefix}[${idx}]`, v));
      return;
    }
    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        walk(`${prefix}[${k}]`, v);
      }
      return;
    }
    add(prefix, value);
  };

  for (const [k, v] of Object.entries(obj)) walk(k, v);

  return form;
}

async function stripeRequest(path: string, secretKey: string, method: 'GET' | 'POST', body?: Record<string, any>) {
  const url = `https://api.stripe.com/v1${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      Accept: 'application/json',
    },
    body: method === 'POST' && body ? formEncode(body).toString() : undefined,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Stripe API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeStripeAction(input: StripeExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { secretKey } = stripeAuthSchema.parse({ secretKey: credential.secretKey });

  if (actionId === 'create_customer') {
    const email = String(config.email || '').trim();
    if (!email) throw new Error('Stripe create_customer requires email');

    const body: any = {
      email,
      ...(config.name ? { name: String(config.name) } : {}),
      ...(config.phone ? { phone: String(config.phone) } : {}),
      ...(config.description ? { description: String(config.description) } : {}),
    };

    if (config.metadata) {
      try {
        body.metadata = typeof config.metadata === 'object' ? config.metadata : JSON.parse(String(config.metadata));
      } catch {
        // ignore
      }
    }

    const data = await stripeRequest('/customers', secretKey, 'POST', body);
    return { ok: true, id: data?.id, raw: data };
  }

  if (actionId === 'create_payment_intent') {
    const amount = Number(config.amount);
    const currency = String(config.currency || 'usd').trim();
    if (!Number.isFinite(amount)) throw new Error('Stripe create_payment_intent requires amount');
    if (!currency) throw new Error('Stripe create_payment_intent requires currency');

    const body: any = {
      amount: Math.trunc(amount),
      currency,
      ...(config.customerId ? { customer: String(config.customerId) } : {}),
      ...(config.description ? { description: String(config.description) } : {}),
    };

    if (config.paymentMethodTypes) {
      try {
        const arr = Array.isArray(config.paymentMethodTypes)
          ? config.paymentMethodTypes
          : JSON.parse(String(config.paymentMethodTypes));
        if (Array.isArray(arr)) body.payment_method_types = arr.map(String);
      } catch {
        // ignore
      }
    }

    if (config.metadata) {
      try {
        body.metadata = typeof config.metadata === 'object' ? config.metadata : JSON.parse(String(config.metadata));
      } catch {
        // ignore
      }
    }

    const data = await stripeRequest('/payment_intents', secretKey, 'POST', body);
    return { ok: true, id: data?.id, clientSecret: data?.client_secret, raw: data };
  }

  if (actionId === 'create_subscription') {
    const customerId = String(config.customerId || '').trim();
    const priceId = String(config.priceId || '').trim();
    if (!customerId) throw new Error('Stripe create_subscription requires customerId');
    if (!priceId) throw new Error('Stripe create_subscription requires priceId');

    const body: any = {
      customer: customerId,
      items: [{ price: priceId }],
      ...(config.trialPeriodDays != null ? { trial_period_days: Number(config.trialPeriodDays) } : {}),
    };

    if (config.metadata) {
      try {
        body.metadata = typeof config.metadata === 'object' ? config.metadata : JSON.parse(String(config.metadata));
      } catch {
        // ignore
      }
    }

    const data = await stripeRequest('/subscriptions', secretKey, 'POST', body);
    return { ok: true, id: data?.id, status: data?.status, raw: data };
  }

  if (actionId === 'cancel_subscription') {
    const subscriptionId = String(config.subscriptionId || '').trim();
    if (!subscriptionId) throw new Error('Stripe cancel_subscription requires subscriptionId');

    const cancelAtPeriodEnd = config.cancelAtPeriodEnd !== undefined ? Boolean(config.cancelAtPeriodEnd) : true;

    const data = await stripeRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}`, secretKey, 'POST', {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    return { ok: true, id: data?.id, status: data?.status, raw: data };
  }

  if (actionId === 'create_invoice') {
    const customerId = String(config.customerId || '').trim();
    if (!customerId) throw new Error('Stripe create_invoice requires customerId');

    const body: any = {
      customer: customerId,
      ...(config.autoAdvance !== undefined ? { auto_advance: Boolean(config.autoAdvance) } : {}),
      ...(config.description ? { description: String(config.description) } : {}),
    };

    const data = await stripeRequest('/invoices', secretKey, 'POST', body);
    return { ok: true, id: data?.id, status: data?.status, raw: data };
  }

  if (actionId === 'get_customer') {
    const customerId = String(config.customerId || '').trim();
    if (!customerId) throw new Error('Stripe get_customer requires customerId');

    const data = await stripeRequest(`/customers/${encodeURIComponent(customerId)}`, secretKey, 'GET');
    return { ok: true, raw: data };
  }

  if (actionId === 'refund_payment') {
    const paymentIntentId = String(config.paymentIntentId || '').trim();
    if (!paymentIntentId) throw new Error('Stripe refund_payment requires paymentIntentId');

    const body: any = {
      payment_intent: paymentIntentId,
      ...(config.amount != null && String(config.amount).length ? { amount: Math.trunc(Number(config.amount)) } : {}),
      ...(config.reason ? { reason: String(config.reason) } : {}),
    };

    const data = await stripeRequest('/refunds', secretKey, 'POST', body);
    return { ok: true, id: data?.id, status: data?.status, raw: data };
  }

  return { status: 'skipped', reason: `Stripe action not implemented: ${actionId}` };
}
