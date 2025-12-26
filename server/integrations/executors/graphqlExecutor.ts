import { z } from 'zod';

const graphqlCredentialSchema = z.object({
  endpoint: z.string().min(1),
  token: z.string().min(1).optional(),
  apiKey: z.string().min(1).optional(),
  headerName: z.string().min(1).optional(),
});

export type GraphqlExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function gqlJson(endpoint: string, headers: Record<string, string>, body: any) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
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
    throw new Error(`GraphQL HTTP error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function authHeaders(cred: z.infer<typeof graphqlCredentialSchema>) {
  const headers: Record<string, string> = {};
  if (cred.token) headers['Authorization'] = `Bearer ${cred.token}`;
  if (cred.apiKey) headers[cred.headerName || 'X-API-Key'] = cred.apiKey;
  return headers;
}

export async function executeGraphqlAction(input: GraphqlExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const cred = graphqlCredentialSchema.parse({
    endpoint: credential.endpoint,
    token: credential.token,
    apiKey: credential.apiKey,
    headerName: credential.headerName,
  });

  const query = String(config.query || '').trim();
  const variables = config.variables && typeof config.variables === 'object' ? config.variables : undefined;
  const operationName = String(config.operationName || '').trim() || undefined;

  if (!query) throw new Error('GraphQL requires query');

  if (actionId !== 'query' && actionId !== 'mutation') {
    return { status: 'skipped', message: `GraphQL action not implemented: ${actionId}` };
  }

  const payload: any = { query };
  if (variables !== undefined) payload.variables = variables;
  if (operationName) payload.operationName = operationName;

  const data = await gqlJson(cred.endpoint, authHeaders(cred), payload);

  if (data && typeof data === 'object' && Array.isArray((data as any).errors) && (data as any).errors.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify((data as any).errors)}`);
  }

  return { ok: true, response: data, data: (data as any)?.data, raw: data };
}
