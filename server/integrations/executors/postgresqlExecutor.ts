import { z } from 'zod';
import pg from 'pg';

const { Client } = pg;

const authSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive().default(5432),
  database: z.string().min(1),
  user: z.string().min(1),
  password: z.string().min(1),
  ssl: z.coerce.boolean().optional(),
});

export type PostgresqlExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function parseParams(raw: any): any[] {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  }
  return [];
}

function applyLimit(sql: string, limit: any) {
  const n = Number(limit);
  if (!Number.isFinite(n) || n <= 0) return sql;
  return `${sql}\nLIMIT ${Math.trunc(n)}`;
}

export async function executePostgresqlAction(input: PostgresqlExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { host, port, database, user, password, ssl } = authSchema.parse({
    host: credential.host,
    port: credential.port,
    database: credential.database,
    user: credential.user,
    password: credential.password,
    ssl: credential.ssl,
  });

  const client = new Client({
    host,
    port,
    database,
    user,
    password,
    ssl: ssl === false ? undefined : (ssl === true ? { rejectUnauthorized: false } : undefined),
  });

  await client.connect();
  try {
    if (actionId === 'query') {
      const sqlRaw = String(config.query || '').trim();
      if (!sqlRaw) throw new Error('PostgreSQL query requires SQL');
      const params = parseParams(config.params);
      const sql = applyLimit(sqlRaw, config.limit);

      const res = await client.query(sql, params);
      return { ok: true, rows: res.rows, rowCount: res.rowCount };
    }

    if (actionId === 'execute') {
      const sqlRaw = String(config.query || '').trim();
      if (!sqlRaw) throw new Error('PostgreSQL execute requires SQL');
      const params = parseParams(config.params);

      const res = await client.query(sqlRaw, params);
      return { ok: true, rowCount: res.rowCount, rows: res.rows };
    }

    return { status: 'skipped', reason: `PostgreSQL action not implemented: ${actionId}` };
  } finally {
    await client.end().catch(() => undefined);
  }
}
