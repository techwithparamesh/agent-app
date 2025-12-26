import { z } from 'zod';

const powerAutomateAuthSchema = z.object({
  flowUrl: z.string().min(1),
});

export type PowerAutomateExecuteInput = {
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

export async function executePowerAutomateAction(input: PowerAutomateExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { flowUrl } = powerAutomateAuthSchema.parse({ flowUrl: credential.flowUrl });

  if (actionId === 'trigger_flow') {
    const bodyObj = parseJsonMaybe(config.body);
    if (bodyObj === undefined) throw new Error('Power Automate trigger_flow requires body (JSON)');

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(String(flowUrl));
    } catch {
      throw new Error('Power Automate flowUrl is not a valid URL');
    }

    const res = await fetch(parsedUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bodyObj),
    });

    const responseBody = await fetchJsonOrText(res);

    if (!res.ok) {
      throw new Error(`Power Automate flow error ${res.status}: ${typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)}`);
    }

    return { ok: true, status: res.status, response: responseBody };
  }

  return { status: 'skipped', reason: `Power Automate action not implemented: ${actionId}` };
}
