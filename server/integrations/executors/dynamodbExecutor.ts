import { z } from 'zod';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const authSchema = z.object({
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  region: z.string().min(1),
});

export type DynamoDbExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function parseJsonObject(raw: any, name: string): Record<string, any> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch {
      // fallthrough
    }
  }
  throw new Error(`${name} must be a JSON object`);
}

export async function executeDynamoDbAction(input: DynamoDbExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessKeyId, secretAccessKey, region } = authSchema.parse({
    accessKeyId: credential.accessKeyId,
    secretAccessKey: credential.secretAccessKey,
    region: credential.region,
  });

  const client = new DynamoDBClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  if (actionId === 'put_item') {
    const tableName = String(config.tableName || '').trim();
    if (!tableName) throw new Error('DynamoDB put_item requires tableName');
    const itemObj = parseJsonObject(config.item, 'item');

    const out = await client.send(
      new PutItemCommand({
        TableName: tableName,
        Item: marshall(itemObj, { removeUndefinedValues: true, convertEmptyValues: true }),
      })
    );

    return { ok: true, raw: out };
  }

  if (actionId === 'get_item') {
    const tableName = String(config.tableName || '').trim();
    if (!tableName) throw new Error('DynamoDB get_item requires tableName');
    const keyObj = parseJsonObject(config.key, 'key');

    const out = await client.send(
      new GetItemCommand({
        TableName: tableName,
        Key: marshall(keyObj, { removeUndefinedValues: true, convertEmptyValues: true }),
      })
    );

    return { ok: true, item: out.Item ? unmarshall(out.Item) : null, raw: out };
  }

  return { status: 'skipped', reason: `DynamoDB action not implemented: ${actionId}` };
}
