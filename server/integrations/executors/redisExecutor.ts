import { z } from 'zod';
import { createClient } from 'redis';

const authSchema = z.object({
  url: z.string().min(1),
  database: z.coerce.number().int().min(0).optional(),
});

export type RedisExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

export async function executeRedisAction(input: RedisExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { url, database } = authSchema.parse({ url: credential.url, database: credential.database });

  const client = createClient({ url, database });
  client.on('error', () => undefined);

  await client.connect();
  try {
    if (actionId === 'set') {
      const key = String(config.key || '').trim();
      const value = String(config.value ?? '').toString();
      const ttlSeconds = config.ttlSeconds != null ? Number(config.ttlSeconds) : undefined;

      if (!key) throw new Error('Redis set requires key');

      if (ttlSeconds && Number.isFinite(ttlSeconds) && ttlSeconds > 0) {
        await client.set(key, value, { EX: Math.trunc(ttlSeconds) });
      } else {
        await client.set(key, value);
      }
      return { ok: true };
    }

    if (actionId === 'get') {
      const key = String(config.key || '').trim();
      if (!key) throw new Error('Redis get requires key');
      const value = await client.get(key);
      return { ok: true, value };
    }

    if (actionId === 'publish') {
      const channel = String(config.channel || '').trim();
      const message = String(config.message ?? '').toString();
      if (!channel) throw new Error('Redis publish requires channel');
      const receivers = await client.publish(channel, message);
      return { ok: true, receivers };
    }

    return { status: 'skipped', reason: `Redis action not implemented: ${actionId}` };
  } finally {
    await client.quit().catch(() => undefined);
  }
}
