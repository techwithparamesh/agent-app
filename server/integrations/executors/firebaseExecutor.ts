import { z } from 'zod';
import { getServiceAccountAccessToken, type GoogleServiceAccount } from '../googleServiceAccount';

const firebaseAuthSchema = z.object({
  projectId: z.string().min(1),
  serviceAccount: z.any(),
});

export type FirebaseExecuteInput = {
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

function asString(value: any) {
  return value == null ? '' : String(value);
}

function isPlainObject(value: any) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function toFirestoreValue(value: any): any {
  if (value === null) return { nullValue: null };
  if (value === undefined) return { nullValue: null };

  if (value instanceof Date) return { timestampValue: value.toISOString() };

  const t = typeof value;
  if (t === 'string') return { stringValue: value };
  if (t === 'boolean') return { booleanValue: value };
  if (t === 'number') {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }

  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((v) => toFirestoreValue(v)) } };
  }

  if (isPlainObject(value)) {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }

  return { stringValue: String(value) };
}

function fromFirestoreValue(value: any): any {
  if (!value || typeof value !== 'object') return value;

  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;

  if ('mapValue' in value) {
    const fields = value.mapValue?.fields || {};
    const out: any = {};
    for (const [k, v] of Object.entries(fields)) out[k] = fromFirestoreValue(v);
    return out;
  }

  if ('arrayValue' in value) {
    const values = value.arrayValue?.values || [];
    return values.map((v: any) => fromFirestoreValue(v));
  }

  return value;
}

function normalizeServiceAccount(serviceAccountRaw: any): GoogleServiceAccount {
  const obj = typeof serviceAccountRaw === 'string' ? parseJsonMaybe(serviceAccountRaw) : serviceAccountRaw;
  if (!obj || typeof obj !== 'object') throw new Error('Firebase serviceAccount must be a JSON object');

  const client_email = asString((obj as any).client_email).trim();
  const private_key = asString((obj as any).private_key).trim();
  const token_uri = (obj as any).token_uri ? asString((obj as any).token_uri).trim() : undefined;
  const project_id = (obj as any).project_id ? asString((obj as any).project_id).trim() : undefined;

  if (!client_email) throw new Error('Firebase serviceAccount is missing client_email');
  if (!private_key) throw new Error('Firebase serviceAccount is missing private_key');

  return { client_email, private_key, token_uri, project_id };
}

async function getFirestoreAccessToken(credential: Record<string, any>) {
  const parsed = firebaseAuthSchema.parse({
    projectId: credential.projectId,
    serviceAccount: credential.serviceAccount,
  });

  const serviceAccount = normalizeServiceAccount(parsed.serviceAccount);

  const { accessToken } = await getServiceAccountAccessToken({
    serviceAccount,
    scopes: [
      'https://www.googleapis.com/auth/datastore',
    ],
  });

  return { projectId: String(parsed.projectId), accessToken };
}

function firestoreBaseUrl(projectId: string) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;
}

async function firestoreRequest(projectId: string, accessToken: string, path: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: any) {
  const base = firestoreBaseUrl(projectId);
  const url = `${base}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Firestore API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function collectFieldPaths(obj: any, prefix = ''): string[] {
  if (!isPlainObject(obj)) return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    out.push(path);
    if (isPlainObject(v)) {
      out.push(...collectFieldPaths(v, path));
    }
  }
  return Array.from(new Set(out));
}

function parseFirestoreDoc(doc: any) {
  const name = asString(doc?.name);
  const fields = doc?.fields || {};
  const data: any = {};
  for (const [k, v] of Object.entries(fields)) data[k] = fromFirestoreValue(v);
  return { name, data, raw: doc };
}

export async function executeFirebaseAction(input: FirebaseExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { projectId, accessToken } = await getFirestoreAccessToken(credential);

  if (actionId === 'create_document') {
    const collection = asString(config.collection).trim();
    if (!collection) throw new Error('Firebase create_document requires collection');

    const dataObj = parseJsonMaybe(config.data);
    if (!dataObj || typeof dataObj !== 'object' || Array.isArray(dataObj)) throw new Error('Firebase create_document requires data (json object)');

    const documentId = asString(config.documentId).trim();

    const qs = new URLSearchParams();
    if (documentId) qs.set('documentId', documentId);

    const query = qs.toString();
    const path = `/${collection}${query ? `?${query}` : ''}`;

    const docBody = {
      fields: Object.fromEntries(Object.entries(dataObj).map(([k, v]) => [k, toFirestoreValue(v)])),
    };

    const created = await firestoreRequest(projectId, accessToken, path, 'POST', docBody);
    return { ok: true, document: parseFirestoreDoc(created) };
  }

  if (actionId === 'update_document') {
    const documentPath = asString(config.documentPath).trim();
    if (!documentPath) throw new Error('Firebase update_document requires documentPath');

    const dataObj = parseJsonMaybe(config.data);
    if (!dataObj || typeof dataObj !== 'object' || Array.isArray(dataObj)) throw new Error('Firebase update_document requires data (json object)');

    const merge = config.merge !== undefined ? Boolean(config.merge) : true;

    const qs = new URLSearchParams();
    if (merge) {
      const fieldPaths = collectFieldPaths(dataObj);
      for (const p of fieldPaths) qs.append('updateMask.fieldPaths', p);
    }

    const query = qs.toString();
    const path = `/${documentPath}${query ? `?${query}` : ''}`;

    const body = {
      fields: Object.fromEntries(Object.entries(dataObj).map(([k, v]) => [k, toFirestoreValue(v)])),
    };

    const updated = await firestoreRequest(projectId, accessToken, path, 'PATCH', body);
    return { ok: true, document: parseFirestoreDoc(updated) };
  }

  if (actionId === 'get_document') {
    const documentPath = asString(config.documentPath).trim();
    if (!documentPath) throw new Error('Firebase get_document requires documentPath');

    const doc = await firestoreRequest(projectId, accessToken, `/${documentPath}`, 'GET');
    return { ok: true, document: parseFirestoreDoc(doc) };
  }

  if (actionId === 'query_collection') {
    const collection = asString(config.collection).trim();
    if (!collection) throw new Error('Firebase query_collection requires collection');

    const where = parseJsonMaybe(config.where);
    const limit = config.limit != null ? Number(config.limit) : undefined;
    const orderBy = asString(config.orderBy).trim();

    const segments = collection.split('/').filter(Boolean);
    const collectionId = segments[segments.length - 1];
    const parent = segments.length > 1 ? segments.slice(0, -1).join('/') : '';

    const structuredQuery: any = {
      from: [{ collectionId }],
    };

    const filters: any[] = [];
    if (Array.isArray(where)) {
      for (const clause of where) {
        if (!Array.isArray(clause) || clause.length < 3) continue;
        const [field, op, value] = clause;
        const fieldPath = asString(field).trim();
        const operator = asString(op).trim();
        if (!fieldPath || !operator) continue;

        const operatorMap: Record<string, string> = {
          '==': 'EQUAL',
          '!=': 'NOT_EQUAL',
          '>': 'GREATER_THAN',
          '>=': 'GREATER_THAN_OR_EQUAL',
          '<': 'LESS_THAN',
          '<=': 'LESS_THAN_OR_EQUAL',
          'array-contains': 'ARRAY_CONTAINS',
        };

        const mapped = operatorMap[operator];
        if (!mapped) continue;

        filters.push({
          fieldFilter: {
            field: { fieldPath },
            op: mapped,
            value: toFirestoreValue(value),
          },
        });
      }
    }

    if (filters.length === 1) {
      structuredQuery.where = filters[0];
    } else if (filters.length > 1) {
      structuredQuery.where = {
        compositeFilter: {
          op: 'AND',
          filters,
        },
      };
    }

    if (orderBy) {
      structuredQuery.orderBy = [{ field: { fieldPath: orderBy }, direction: 'ASCENDING' }];
    }

    if (Number.isFinite(limit as any)) {
      structuredQuery.limit = limit;
    }

    const body = { structuredQuery };

    const path = parent ? `/${parent}:runQuery` : `:runQuery`;
    const rows = await firestoreRequest(projectId, accessToken, path, 'POST', body);

    const documents = Array.isArray(rows)
      ? rows
          .map((r: any) => r?.document)
          .filter(Boolean)
          .map((d: any) => parseFirestoreDoc(d))
      : [];

    return { ok: true, documents, raw: rows };
  }

  if (actionId === 'delete_document') {
    const documentPath = asString(config.documentPath).trim();
    if (!documentPath) throw new Error('Firebase delete_document requires documentPath');

    await firestoreRequest(projectId, accessToken, `/${documentPath}`, 'DELETE');
    return { ok: true };
  }

  return { status: 'skipped', reason: `Firebase action not implemented: ${actionId}` };
}
