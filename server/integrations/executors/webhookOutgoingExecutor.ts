export type WebhookOutgoingExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any> | null;
};

function parseHeaders(raw: any): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) out[String(k)] = String(v);
    return out;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseHeaders(parsed);
    } catch {
      return {};
    }
  }
  return {};
}

export async function executeWebhookOutgoingAction(input: WebhookOutgoingExecuteInput): Promise<any> {
  const { actionId, config } = input;

  if (actionId !== 'send') {
    return { status: 'skipped', reason: `Outgoing Webhook action not implemented: ${actionId}` };
  }

  const url = String(config.url || '').trim();
  const method = String(config.method || 'POST').toUpperCase();
  if (!url) throw new Error('Outgoing Webhook send requires url');

  const headers = parseHeaders(config.headers);

  const hasBody = !['GET', 'HEAD'].includes(method);
  const bodyValue = config.body;

  let body: string | undefined = undefined;
  if (hasBody && bodyValue !== undefined) {
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    body = typeof bodyValue === 'string' ? bodyValue : JSON.stringify(bodyValue);
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    data,
  };
}
