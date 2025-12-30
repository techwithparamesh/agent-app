export function maskPhoneForLogs(value: string): string {
  const input = String(value || '').trim();
  if (!input) return '';

  const digits = input.replace(/\D+/g, '');
  if (digits.length <= 4) return '****';

  const last4 = digits.slice(-4);
  return `+****${last4}`;
}

export function redactIfPresent<T>(value: T, placeholder = '[REDACTED]'): T | string {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' && value.trim().length === 0) return value;
  return placeholder;
}

export function sanitizeForLogs(input: unknown): unknown {
  const seen = new WeakSet<object>();

  const redactKeys = new Set([
    'accessToken',
    'token',
    'refreshToken',
    'verifyToken',
    'secret',
    'clientSecret',
    'password',
    'authorization',
    'apiKey',
    'bearerToken',
  ]);

  const phoneKeys = new Set([
    'phone',
    'phoneNumber',
    'whatsappPhoneNumber',
    'from',
    'to',
    'wa_id',
  ]);

  const walk = (value: unknown): unknown => {
    if (value === null || value === undefined) return value;

    if (typeof value === 'string') {
      // Don’t attempt to guess phone numbers from arbitrary strings.
      return value;
    }

    if (typeof value !== 'object') return value;

    const obj = value as Record<string, unknown>;
    if (seen.has(obj)) return '[Circular]';
    seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.map(walk);
    }

    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(obj)) {
      if (redactKeys.has(key)) {
        out[key] = redactIfPresent(v);
        continue;
      }

      if (phoneKeys.has(key) && typeof v === 'string') {
        out[key] = maskPhoneForLogs(v);
        continue;
      }

      // Message bodies often include PII; keep minimal signal.
      if (key === 'text' || key === 'body' || key === 'content' || key === 'message') {
        if (typeof v === 'string') {
          out[key] = v.length > 0 ? '[REDACTED]' : v;
          continue;
        }
      }

      out[key] = walk(v);
    }

    return out;
  };

  return walk(input);
}
