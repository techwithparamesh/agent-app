import { z } from 'zod';

const zapierAuthSchema = z.object({
  webhookUrl: z.string().min(1),
});

export type ZapierExecuteInput = {
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

export async function executeZapierAction(input: ZapierExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { webhookUrl } = zapierAuthSchema.parse({ webhookUrl: credential.webhookUrl });

  if (actionId === 'send_webhook') {
    const dataObj = parseJsonMaybe(config.data);
    if (dataObj === undefined) throw new Error('Zapier send_webhook requires data (JSON)');

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(webhookUrl);
    } catch {
      throw new Error('Zapier webhookUrl is not a valid URL');
    }

    const res = await fetch(parsedUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dataObj),
    });

    const text = await res.text().catch(() => '');
    let responseBody: any = text;
    try {
      responseBody = text ? JSON.parse(text) : null;
    } catch {
      responseBody = text;
    }

    if (!res.ok) {
      throw new Error(`Zapier webhook error ${res.status}: ${typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)}`);
    }

    return { ok: true, status: res.status, response: responseBody };
  }

  return { status: 'skipped', reason: `Zapier action not implemented: ${actionId}` };
}
