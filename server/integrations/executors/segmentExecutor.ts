import { z } from 'zod';

export type SegmentExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

const authSchema = z.object({
  writeKey: z.string().min(1),
});

async function segmentPost(writeKey: string, path: string, body: any) {
  const auth = Buffer.from(`${writeKey}:`, 'utf8').toString('base64');

  const res = await fetch(`https://api.segment.io/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
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
    throw new Error(`Segment API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeSegmentAction(input: SegmentExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { writeKey } = authSchema.parse({ writeKey: credential.writeKey });

  if (actionId === 'track') {
    const userId = String(config.userId || '').trim();
    const event = String(config.event || '').trim();

    if (!userId) throw new Error('Segment track requires userId');
    if (!event) throw new Error('Segment track requires event');

    const properties = config.properties && typeof config.properties === 'object' ? config.properties : undefined;
    const context = config.context && typeof config.context === 'object' ? config.context : undefined;

    const body: any = {
      userId,
      event,
      properties,
      context,
      timestamp: new Date().toISOString(),
    };

    const data = await segmentPost(writeKey, 'track', body);
    return { ok: true, raw: data };
  }

  return { status: 'skipped', reason: `Segment action not implemented: ${actionId}` };
}
