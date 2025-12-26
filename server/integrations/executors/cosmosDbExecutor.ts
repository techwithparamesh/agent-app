import { z } from 'zod';

const authSchema = z.object({
  endpoint: z.string().min(1),
  key: z.string().min(1),
  databaseId: z.string().min(1),
});

export type CosmosDbExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

export async function executeCosmosDbAction(input: CosmosDbExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  authSchema.parse({
    endpoint: credential.endpoint,
    key: credential.key,
    databaseId: credential.databaseId,
  });

  if (actionId === 'query') {
    const containerId = String(config.containerId || '').trim();
    const query = String(config.query || '').trim();
    if (!containerId) throw new Error('Cosmos DB query requires containerId');
    if (!query) throw new Error('Cosmos DB query requires query');

    // Cosmos DB SQL REST auth requires signing with the account key.
    // Implementing this correctly is non-trivial; keep this safe until we add the official SDK.
    return {
      status: 'skipped',
      reason: 'Cosmos DB query not implemented yet (requires Cosmos DB REST signing or SDK)',
      requested: { containerId, query, parameters: config.parameters },
    };
  }

  return { status: 'skipped', reason: `Cosmos DB action not implemented: ${actionId}` };
}
