import { z } from 'zod';

const authSchema = z.object({
  key: z.string().min(1),
});

export type IftttExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

export async function executeIftttAction(input: IftttExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { key } = authSchema.parse({ key: credential.key });

  if (actionId !== 'trigger_event') {
    return { status: 'skipped', reason: `IFTTT action not implemented: ${actionId}` };
  }

  const event = String(config.event || '').trim();
  if (!event) throw new Error('IFTTT trigger_event requires event');

  const body: Record<string, any> = {};
  if (config.value1 !== undefined && config.value1 !== null && String(config.value1).length) body.value1 = String(config.value1);
  if (config.value2 !== undefined && config.value2 !== null && String(config.value2).length) body.value2 = String(config.value2);
  if (config.value3 !== undefined && config.value3 !== null && String(config.value3).length) body.value3 = String(config.value3);

  const url = `https://maker.ifttt.com/trigger/${encodeURIComponent(event)}/with/key/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`IFTTT Webhooks error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return { ok: true, event, response: data, raw: data };
}
