import { z } from 'zod';

const makeAuthSchema = z.object({
  webhookUrl: z.string().min(1),
});

export type MakeExecuteInput = {
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

async function fetchJsonOrText(res: Response) {
  const text = await res.text().catch(() => '');
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function executeMakeAction(input: MakeExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { webhookUrl } = makeAuthSchema.parse({ webhookUrl: credential.webhookUrl });

  if (actionId === 'send_webhook') {
    const dataObj = parseJsonMaybe(config.data);
    if (dataObj === undefined) throw new Error('Make send_webhook requires data (JSON)');

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(String(webhookUrl));
    } catch {
      throw new Error('Make webhookUrl is not a valid URL');
    }

    const res = await fetch(parsedUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dataObj),
    });

    const responseBody = await fetchJsonOrText(res);

    if (!res.ok) {
      throw new Error(`Make webhook error ${res.status}: ${typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)}`);
    }

    return { ok: true, status: res.status, response: responseBody };
  }

  return { status: 'skipped', reason: `Make action not implemented: ${actionId}` };
}
