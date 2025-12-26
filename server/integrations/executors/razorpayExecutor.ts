import { z } from 'zod';

const razorpayAuthSchema = z.object({
  keyId: z.string().min(1),
  keySecret: z.string().min(1),
});

export type RazorpayExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function basicAuthHeader(keyId: string, keySecret: string) {
  const token = Buffer.from(`${keyId}:${keySecret}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

async function rpJson(auth: { keyId: string; keySecret: string }, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: basicAuthHeader(auth.keyId, auth.keySecret),
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
    throw new Error(`Razorpay API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeRazorpayAction(input: RazorpayExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const auth = razorpayAuthSchema.parse({ keyId: credential.keyId, keySecret: credential.keySecret });

  if (actionId === 'create_order') {
    const amount = Number(config.amount);
    const currency = String(config.currency || 'INR').trim() || 'INR';
    const receipt = String(config.receipt || '').trim() || undefined;
    const notes = config.notes && typeof config.notes === 'object' ? config.notes : undefined;

    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Razorpay create_order requires amount (in paise)');

    const body: any = { amount: Math.trunc(amount), currency };
    if (receipt) body.receipt = receipt;
    if (notes) body.notes = notes;

    const data = await rpJson(auth, 'https://api.razorpay.com/v1/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { ok: true, order: data, raw: data };
  }

  if (actionId === 'capture_payment') {
    const paymentId = String(config.paymentId || '').trim();
    const amount = Number(config.amount);
    const currency = String(config.currency || 'INR').trim() || 'INR';

    if (!paymentId) throw new Error('Razorpay capture_payment requires paymentId');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Razorpay capture_payment requires amount');

    const data = await rpJson(auth, `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/capture`, {
      method: 'POST',
      body: JSON.stringify({ amount: Math.trunc(amount), currency }),
    });

    return { ok: true, payment: data, raw: data };
  }

  if (actionId === 'create_refund') {
    const paymentId = String(config.paymentId || '').trim();
    const amount = config.amount !== undefined && config.amount !== null && String(config.amount).length > 0 ? Number(config.amount) : undefined;
    const notes = config.notes && typeof config.notes === 'object' ? config.notes : undefined;

    if (!paymentId) throw new Error('Razorpay create_refund requires paymentId');
    if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0)) throw new Error('Razorpay create_refund amount must be a positive number');

    const body: any = {};
    if (amount !== undefined) body.amount = Math.trunc(amount);
    if (notes) body.notes = notes;

    const data = await rpJson(auth, `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { ok: true, refund: data, raw: data };
  }

  if (actionId === 'get_payment') {
    const paymentId = String(config.paymentId || '').trim();
    if (!paymentId) throw new Error('Razorpay get_payment requires paymentId');

    const data = await rpJson(auth, `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { method: 'GET' });
    return { ok: true, payment: data, raw: data };
  }

  if (actionId === 'create_customer') {
    const name = String(config.name || '').trim();
    const email = String(config.email || '').trim() || undefined;
    const contact = String(config.contact || '').trim() || undefined;
    const notes = config.notes && typeof config.notes === 'object' ? config.notes : undefined;

    if (!name) throw new Error('Razorpay create_customer requires name');

    const body: any = { name };
    if (email) body.email = email;
    if (contact) body.contact = contact;
    if (notes) body.notes = notes;

    const data = await rpJson(auth, 'https://api.razorpay.com/v1/customers', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { ok: true, customer: data, raw: data };
  }

  return { status: 'skipped', message: `Razorpay action not implemented: ${actionId}` };
}
