/**
 * AWS S3 n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const awsS3Schema: N8nAppSchema = {
  id: 'aws-s3',
  name: 'AWS S3',
  description: 'Amazon Simple Storage Service',
  version: '1.0.0',
  color: '#FF9900',
  icon: 'aws',
  group: ['storage', 'cloud'],
  
  credentials: [
    {
      name: 'awsCredentials',
      displayName: 'AWS Credentials',
      required: true,
      type: 'apiKey',
      properties: [
        { name: 'accessKeyId', displayName: 'Access Key ID', type: 'string', required: true },
        { name: 'secretAccessKey', displayName: 'Secret Access Key', type: 'string', required: true, typeOptions: { password: true } },
        { name: 'region', displayName: 'Region', type: 'options', required: true, options: [{ name: 'US East (N. Virginia)', value: 'us-east-1' }, { name: 'US East (Ohio)', value: 'us-east-2' }, { name: 'US West (N. California)', value: 'us-west-1' }, { name: 'US West (Oregon)', value: 'us-west-2' }, { name: 'EU (Ireland)', value: 'eu-west-1' }, { name: 'EU (London)', value: 'eu-west-2' }, { name: 'EU (Frankfurt)', value: 'eu-central-1' }, { name: 'Asia Pacific (Tokyo)', value: 'ap-northeast-1' }, { name: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' }, { name: 'Asia Pacific (Sydney)', value: 'ap-southeast-2' }] },
      ],
    },
  ],
  
  resources: [
    {
      id: 'bucket',
      name: 'Bucket',
      value: 'bucket',
      description: 'Bucket operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create bucket', action: 'Create bucket',
          fields: [{ id: 'name', name: 'name', displayName: 'Bucket Name', type: 'string', required: true }],
          optionalFields: [
            { id: 'region', name: 'region', displayName: 'Region', type: 'string', required: false },
            { id: 'acl', name: 'acl', displayName: 'ACL', type: 'options', required: false, options: [{ name: 'Private', value: 'private' }, { name: 'Public Read', value: 'public-read' }, { name: 'Public Read Write', value: 'public-read-write' }, { name: 'Authenticated Read', value: 'authenticated-read' }] },
          ],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete bucket', action: 'Delete bucket',
          fields: [{ id: 'name', name: 'name', displayName: 'Bucket Name', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List all buckets', action: 'List buckets',
          fields: [],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'file',
      name: 'File',
      value: 'file',
      description: 'File/object operations',
      operations: [
        { id: 'upload', name: 'Upload', value: 'upload', description: 'Upload file', action: 'Upload file',
          fields: [
            { id: 'bucketName', name: 'bucketName', displayName: 'Bucket Name', type: 'string', required: true },
            { id: 'fileName', name: 'fileName', displayName: 'File Name', type: 'string', required: true },
            { id: 'binaryData', name: 'binaryData', displayName: 'Binary Data', type: 'boolean', required: true, default: true },
          ],
          optionalFields: [
            { id: 'contentType', name: 'contentType', displayName: 'Content Type', type: 'string', required: false },
            { id: 'acl', name: 'acl', displayName: 'ACL', type: 'options', required: false, options: [{ name: 'Private', value: 'private' }, { name: 'Public Read', value: 'public-read' }] },
            { id: 'storageClass', name: 'storageClass', displayName: 'Storage Class', type: 'options', required: false, options: [{ name: 'Standard', value: 'STANDARD' }, { name: 'Reduced Redundancy', value: 'REDUCED_REDUNDANCY' }, { name: 'Standard-IA', value: 'STANDARD_IA' }, { name: 'One Zone-IA', value: 'ONEZONE_IA' }, { name: 'Glacier', value: 'GLACIER' }, { name: 'Glacier Deep Archive', value: 'DEEP_ARCHIVE' }] },
            { id: 'serverSideEncryption', name: 'serverSideEncryption', displayName: 'Server Side Encryption', type: 'options', required: false, options: [{ name: 'None', value: '' }, { name: 'AES-256', value: 'AES256' }, { name: 'AWS KMS', value: 'aws:kms' }] },
            { id: 'metadata', name: 'metadata', displayName: 'Metadata', type: 'json', required: false },
            { id: 'tagging', name: 'tagging', displayName: 'Tags', type: 'json', required: false },
          ],
        },
        { id: 'download', name: 'Download', value: 'download', description: 'Download file', action: 'Download file',
          fields: [
            { id: 'bucketName', name: 'bucketName', displayName: 'Bucket Name', type: 'string', required: true },
            { id: 'fileName', name: 'fileName', displayName: 'File Name', type: 'string', required: true },
          ],
          optionalFields: [{ id: 'binaryPropertyName', name: 'binaryPropertyName', displayName: 'Binary Property', type: 'string', required: false, default: 'data' }],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete file', action: 'Delete file',
          fields: [
            { id: 'bucketName', name: 'bucketName', displayName: 'Bucket Name', type: 'string', required: true },
            { id: 'fileName', name: 'fileName', displayName: 'File Name', type: 'string', required: true },
          ],
          optionalFields: [{ id: 'versionId', name: 'versionId', displayName: 'Version ID', type: 'string', required: false }],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List files in bucket', action: 'List files',
          fields: [{ id: 'bucketName', name: 'bucketName', displayName: 'Bucket Name', type: 'string', required: true }],
          optionalFields: [
            { id: 'prefix', name: 'prefix', displayName: 'Prefix', type: 'string', required: false },
            { id: 'delimiter', name: 'delimiter', displayName: 'Delimiter', type: 'string', required: false },
            { id: 'maxKeys', name: 'maxKeys', displayName: 'Max Keys', type: 'number', required: false, default: 1000 },
            { id: 'returnAll', name: 'returnAll', displayName: 'Return All', type: 'boolean', required: false, default: false },
          ],
        },
        { id: 'copy', name: 'Copy', value: 'copy', description: 'Copy file', action: 'Copy file',
          fields: [
            { id: 'sourceBucket', name: 'sourceBucket', displayName: 'Source Bucket', type: 'string', required: true },
            { id: 'sourceKey', name: 'sourceKey', displayName: 'Source Key', type: 'string', required: true },
            { id: 'destinationBucket', name: 'destinationBucket', displayName: 'Destination Bucket', type: 'string', required: true },
            { id: 'destinationKey', name: 'destinationKey', displayName: 'Destination Key', type: 'string', required: true },
          ],
          optionalFields: [{ id: 'acl', name: 'acl', displayName: 'ACL', type: 'options', required: false, options: [{ name: 'Private', value: 'private' }, { name: 'Public Read', value: 'public-read' }] }],
        },
      ],
    },
    {
      id: 'presignedUrl',
      name: 'Presigned URL',
      value: 'presignedUrl',
      description: 'Presigned URL operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create presigned URL', action: 'Create presigned URL',
          fields: [
            { id: 'bucketName', name: 'bucketName', displayName: 'Bucket Name', type: 'string', required: true },
            { id: 'fileName', name: 'fileName', displayName: 'File Name', type: 'string', required: true },
            { id: 'operation', name: 'operation', displayName: 'Operation', type: 'options', required: true, options: [{ name: 'Get Object', value: 'getObject' }, { name: 'Put Object', value: 'putObject' }] },
          ],
          optionalFields: [
            { id: 'expiresIn', name: 'expiresIn', displayName: 'Expires In (seconds)', type: 'number', required: false, default: 3600 },
          ],
        },
      ],
    },
  ],
};
