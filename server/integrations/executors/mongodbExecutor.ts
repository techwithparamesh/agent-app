import { Db, MongoClient } from 'mongodb';
import { z } from 'zod';

const mongoAuthSchema = z.object({
  connectionString: z.string().min(1),
  database: z.string().min(1),
});

export type MongoDbExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function withMongo<T>(
  auth: { connectionString: string; database: string },
  fn: (db: Db) => Promise<T>
): Promise<T> {
  const client = new MongoClient(auth.connectionString, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  await client.connect();
  try {
    const db = client.db(auth.database);
    return await fn(db);
  } finally {
    await client.close().catch(() => undefined);
  }
}

export async function executeMongoDbAction(input: MongoDbExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const auth = mongoAuthSchema.parse({
    connectionString: credential.connectionString,
    database: credential.database,
  });

  if (actionId === 'insert_document') {
    const collection = String(config.collection || '').trim();
    const document = config.document;
    if (!collection) throw new Error('MongoDB insert_document requires collection');
    if (!document || typeof document !== 'object') throw new Error('MongoDB insert_document requires document (object)');

    const result = await withMongo(auth, (db) => db.collection<Record<string, any>>(collection).insertOne(document));
    return { ok: true, insertedId: result.insertedId, acknowledged: result.acknowledged, raw: result };
  }

  if (actionId === 'update_document') {
    const collection = String(config.collection || '').trim();
    const filter = config.filter;
    const update = config.update;
    const upsert = config.upsert !== undefined ? Boolean(config.upsert) : false;

    if (!collection) throw new Error('MongoDB update_document requires collection');
    if (!filter || typeof filter !== 'object') throw new Error('MongoDB update_document requires filter (object)');
    if (!update || typeof update !== 'object') throw new Error('MongoDB update_document requires update (object)');

    const result = await withMongo(auth, (db) => db.collection<Record<string, any>>(collection).updateMany(filter, update, { upsert }));
    return {
      ok: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId,
      acknowledged: result.acknowledged,
      raw: result,
    };
  }

  if (actionId === 'find_documents') {
    const collection = String(config.collection || '').trim();
    const filter = config.filter && typeof config.filter === 'object' ? config.filter : {};
    const projection = config.projection && typeof config.projection === 'object' ? config.projection : undefined;
    const sort = config.sort && typeof config.sort === 'object' ? config.sort : undefined;
    const limit = config.limit !== undefined ? Number(config.limit) : 100;

    if (!collection) throw new Error('MongoDB find_documents requires collection');

    const docs = await withMongo(auth, async (db) => {
      let cursor = db.collection<Record<string, any>>(collection).find(filter, projection ? { projection } : undefined);
      if (sort) cursor = cursor.sort(sort);
      if (Number.isFinite(limit) && limit > 0) cursor = cursor.limit(Math.min(5000, limit));
      return cursor.toArray();
    });

    return { ok: true, documents: docs, count: docs.length, raw: docs };
  }

  if (actionId === 'delete_documents') {
    const collection = String(config.collection || '').trim();
    const filter = config.filter;

    if (!collection) throw new Error('MongoDB delete_documents requires collection');
    if (!filter || typeof filter !== 'object') throw new Error('MongoDB delete_documents requires filter (object)');

    const result = await withMongo(auth, (db) => db.collection<Record<string, any>>(collection).deleteMany(filter));
    return { ok: true, deletedCount: result.deletedCount, acknowledged: result.acknowledged, raw: result };
  }

  if (actionId === 'aggregate') {
    const collection = String(config.collection || '').trim();
    const pipeline = config.pipeline;

    if (!collection) throw new Error('MongoDB aggregate requires collection');
    if (!Array.isArray(pipeline)) throw new Error('MongoDB aggregate requires pipeline (array)');

    const docs = await withMongo(auth, (db) => db.collection<Record<string, any>>(collection).aggregate(pipeline).toArray());
    return { ok: true, documents: docs, count: docs.length, raw: docs };
  }

  return { status: 'skipped', message: `MongoDB action not implemented: ${actionId}` };
}
