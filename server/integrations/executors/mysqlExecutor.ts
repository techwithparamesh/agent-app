import { z } from 'zod';
import mysql from 'mysql2/promise';

const authSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive().default(3306),
  database: z.string().min(1),
  user: z.string().min(1),
  password: z.string().min(1),
  ssl: z.coerce.boolean().optional(),
});

export type MysqlExecuteInput = {
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

export async function executeMysqlAction(input: MysqlExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { host, port, database, user, password, ssl } = authSchema.parse({
    host: credential.host,
    port: credential.port,
    database: credential.database,
    user: credential.user,
    password: credential.password,
    ssl: credential.ssl,
  });

  const conn = await mysql.createConnection({
    host,
    port,
    database,
    user,
    password,
    ssl: ssl ? {} : undefined,
  } as any);

  try {
    if (actionId === 'query') {
      const sqlRaw = String(config.query || '').trim();
      if (!sqlRaw) throw new Error('MySQL query requires SQL');
      const params = parseParams(config.params);
      const sql = applyLimit(sqlRaw, config.limit);

      const [rows] = await conn.execute(sql, params);
      return { ok: true, rows };
    }

    if (actionId === 'execute') {
      const sqlRaw = String(config.query || '').trim();
      if (!sqlRaw) throw new Error('MySQL execute requires SQL');
      const params = parseParams(config.params);

      const [result] = await conn.execute(sqlRaw, params);
      return { ok: true, result };
    }

    return { status: 'skipped', reason: `MySQL action not implemented: ${actionId}` };
  } finally {
    await conn.end().catch(() => undefined);
  }
}
