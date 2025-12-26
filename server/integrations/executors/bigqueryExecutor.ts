import { z } from 'zod';
import { getServiceAccountAccessToken, type GoogleServiceAccount } from '../googleServiceAccount';

const authSchema = z.object({
  projectId: z.string().min(1),
  serviceAccountJson: z.any(),
});

export type BigQueryExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function parseServiceAccount(raw: any): GoogleServiceAccount {
  if (raw && typeof raw === 'object') return raw as GoogleServiceAccount;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as GoogleServiceAccount;
    } catch {
      throw new Error('BigQuery serviceAccountJson must be valid JSON');
    }
  }
  throw new Error('BigQuery serviceAccountJson is required');
}

async function bqJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`BigQuery API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeBigQueryAction(input: BigQueryExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { projectId, serviceAccountJson } = authSchema.parse({
    projectId: credential.projectId,
    serviceAccountJson: credential.serviceAccountJson,
  });

  if (actionId === 'query') {
    const sql = String(config.query || '').trim();
    const useLegacySql = Boolean(config.useLegacySql);
    const location = config.location != null ? String(config.location).trim() : '';

    if (!sql) throw new Error('BigQuery query requires SQL');

    const serviceAccount = parseServiceAccount(serviceAccountJson);
    const { accessToken } = await getServiceAccountAccessToken({
      serviceAccount,
      scopes: ['https://www.googleapis.com/auth/bigquery'],
    });

    const body: any = { query: sql, useLegacySql };
    if (location) body.location = location;

    const data = await bqJson(
      accessToken,
      `https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(projectId)}/queries`,
      { method: 'POST', body: JSON.stringify(body) }
    );

    return { ok: true, jobComplete: data?.jobComplete, rows: data?.rows, schema: data?.schema, raw: data };
  }

  return { status: 'skipped', reason: `BigQuery action not implemented: ${actionId}` };
}
