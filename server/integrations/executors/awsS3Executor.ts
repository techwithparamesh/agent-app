import { GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, CopyObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';

const awsAuthSchema = z.object({
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  region: z.string().min(1),
});

export type AwsS3ExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function makeS3Client(auth: { accessKeyId: string; secretAccessKey: string; region: string }) {
  return new S3Client({
    region: auth.region,
    credentials: {
      accessKeyId: auth.accessKeyId,
      secretAccessKey: auth.secretAccessKey,
    },
  });
}

async function fetchBytes(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch body URL (${res.status}): ${text || res.statusText}`);
  }
  const contentType = res.headers.get('content-type') || undefined;
  const arrayBuffer = await res.arrayBuffer();
  return { bytes: Buffer.from(arrayBuffer), contentType };
}

async function streamToBuffer(body: any): Promise<Buffer> {
  if (!body) return Buffer.alloc(0);
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);

  if (typeof body.getReader === 'function') {
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    return Buffer.concat(chunks.map((c) => Buffer.from(c)));
  }

  if (typeof body[Symbol.asyncIterator] === 'function') {
    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  throw new Error('Unsupported S3 response body type');
}

function encodeS3KeyPreserveSlashes(key: string) {
  return key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

export async function executeAwsS3Action(input: AwsS3ExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const auth = awsAuthSchema.parse({
    accessKeyId: credential.accessKeyId,
    secretAccessKey: credential.secretAccessKey,
    region: credential.region,
  });

  const s3 = makeS3Client(auth);

  if (actionId === 'upload_file') {
    const bucket = String(config.bucket || '').trim();
    const key = String(config.key || '').trim();
    const bodyUrl = String(config.body || '').trim();
    const contentType = String(config.contentType || '').trim() || undefined;
    const acl = String(config.acl || '').trim() || 'private';

    if (!bucket) throw new Error('AWS S3 upload_file requires bucket');
    if (!key) throw new Error('AWS S3 upload_file requires key');
    if (!bodyUrl) throw new Error('AWS S3 upload_file requires body (URL)');

    const { bytes, contentType: fetchedContentType } = await fetchBytes(bodyUrl);

    const result = await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: contentType || fetchedContentType,
        ACL: acl === 'public-read' ? 'public-read' : 'private',
      })
    );

    return { ok: true, bucket, key, etag: result.ETag, raw: result };
  }

  if (actionId === 'get_object') {
    const bucket = String(config.bucket || '').trim();
    const key = String(config.key || '').trim();

    if (!bucket) throw new Error('AWS S3 get_object requires bucket');
    if (!key) throw new Error('AWS S3 get_object requires key');

    const result = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const buf = await streamToBuffer(result.Body);

    return {
      ok: true,
      bucket,
      key,
      contentType: result.ContentType,
      contentLength: result.ContentLength,
      etag: result.ETag,
      bodyBase64: buf.toString('base64'),
      raw: {
        ContentType: result.ContentType,
        ContentLength: result.ContentLength,
        ETag: result.ETag,
        LastModified: result.LastModified,
      },
    };
  }

  if (actionId === 'list_objects') {
    const bucket = String(config.bucket || '').trim();
    const prefix = String(config.prefix || '').trim() || undefined;
    const maxKeys = config.maxKeys !== undefined ? Number(config.maxKeys) : 1000;

    if (!bucket) throw new Error('AWS S3 list_objects requires bucket');

    const result = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: Number.isFinite(maxKeys) && maxKeys > 0 ? Math.min(1000, maxKeys) : undefined,
      })
    );

    return {
      ok: true,
      bucket,
      prefix,
      objects: result.Contents || [],
      count: Array.isArray(result.Contents) ? result.Contents.length : 0,
      raw: result,
    };
  }

  if (actionId === 'delete_object') {
    const bucket = String(config.bucket || '').trim();
    const key = String(config.key || '').trim();

    if (!bucket) throw new Error('AWS S3 delete_object requires bucket');
    if (!key) throw new Error('AWS S3 delete_object requires key');

    const result = await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return { ok: true, bucket, key, deleted: true, raw: result };
  }

  if (actionId === 'copy_object') {
    const sourceBucket = String(config.sourceBucket || '').trim();
    const sourceKey = String(config.sourceKey || '').trim();
    const destBucket = String(config.destBucket || '').trim();
    const destKey = String(config.destKey || '').trim();

    if (!sourceBucket) throw new Error('AWS S3 copy_object requires sourceBucket');
    if (!sourceKey) throw new Error('AWS S3 copy_object requires sourceKey');
    if (!destBucket) throw new Error('AWS S3 copy_object requires destBucket');
    if (!destKey) throw new Error('AWS S3 copy_object requires destKey');

    const copySource = `${sourceBucket}/${encodeS3KeyPreserveSlashes(sourceKey)}`;

    const result = await s3.send(
      new CopyObjectCommand({
        Bucket: destBucket,
        Key: destKey,
        CopySource: copySource,
      })
    );

    return { ok: true, sourceBucket, sourceKey, destBucket, destKey, raw: result };
  }

  if (actionId === 'generate_presigned_url') {
    const bucket = String(config.bucket || '').trim();
    const key = String(config.key || '').trim();
    const operation = String(config.operation || '').trim() || 'getObject';
    const expiresIn = config.expiresIn !== undefined ? Number(config.expiresIn) : 3600;

    if (!bucket) throw new Error('AWS S3 generate_presigned_url requires bucket');
    if (!key) throw new Error('AWS S3 generate_presigned_url requires key');

    const ttl = Number.isFinite(expiresIn) && expiresIn > 0 ? Math.min(7 * 24 * 3600, expiresIn) : 3600;

    if (operation === 'putObject') {
      const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: ttl });
      return { ok: true, url, operation: 'putObject', bucket, key, expiresIn: ttl };
    }

    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: ttl });
    return { ok: true, url, operation: 'getObject', bucket, key, expiresIn: ttl };
  }

  return { status: 'skipped', message: `AWS S3 action not implemented: ${actionId}` };
}
