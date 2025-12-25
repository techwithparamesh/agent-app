/**
 * AWS Lambda n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const awsLambdaSchema: N8nAppSchema = {
  id: 'aws-lambda',
  name: 'AWS Lambda',
  description: 'Amazon Lambda serverless functions',
  version: '1.0.0',
  color: '#FF9900',
  icon: 'aws',
  group: ['compute', 'cloud'],
  
  credentials: [
    {
      name: 'awsCredentials',
      displayName: 'AWS Credentials',
      required: true,
      type: 'apiKey',
      properties: [
        { name: 'accessKeyId', displayName: 'Access Key ID', type: 'string', required: true },
        { name: 'secretAccessKey', displayName: 'Secret Access Key', type: 'string', required: true, typeOptions: { password: true } },
        { name: 'region', displayName: 'Region', type: 'string', required: true, default: 'us-east-1' },
      ],
    },
  ],
  
  resources: [
    {
      id: 'function',
      name: 'Function',
      value: 'function',
      description: 'Lambda function operations',
      operations: [
        { id: 'invoke', name: 'Invoke', value: 'invoke', description: 'Invoke function', action: 'Invoke function',
          fields: [{ id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true }],
          optionalFields: [
            { id: 'payload', name: 'payload', displayName: 'Payload (JSON)', type: 'json', required: false },
            { id: 'invocationType', name: 'invocationType', displayName: 'Invocation Type', type: 'options', required: false, default: 'RequestResponse', options: [{ name: 'Request/Response', value: 'RequestResponse' }, { name: 'Event (Async)', value: 'Event' }, { name: 'Dry Run', value: 'DryRun' }] },
            { id: 'qualifier', name: 'qualifier', displayName: 'Qualifier', type: 'string', required: false, description: 'Version or alias' },
            { id: 'logType', name: 'logType', displayName: 'Log Type', type: 'options', required: false, options: [{ name: 'None', value: 'None' }, { name: 'Tail', value: 'Tail' }] },
          ],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get function details', action: 'Get function',
          fields: [{ id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true }],
          optionalFields: [{ id: 'qualifier', name: 'qualifier', displayName: 'Qualifier', type: 'string', required: false }],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List all functions', action: 'List functions',
          fields: [],
          optionalFields: [
            { id: 'returnAll', name: 'returnAll', displayName: 'Return All', type: 'boolean', required: false, default: false },
            { id: 'limit', name: 'limit', displayName: 'Limit', type: 'number', required: false, default: 50 },
          ],
        },
        { id: 'create', name: 'Create', value: 'create', description: 'Create function', action: 'Create function',
          fields: [
            { id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true },
            { id: 'runtime', name: 'runtime', displayName: 'Runtime', type: 'options', required: true, options: [{ name: 'Node.js 20.x', value: 'nodejs20.x' }, { name: 'Node.js 18.x', value: 'nodejs18.x' }, { name: 'Python 3.12', value: 'python3.12' }, { name: 'Python 3.11', value: 'python3.11' }, { name: 'Python 3.10', value: 'python3.10' }, { name: 'Java 21', value: 'java21' }, { name: 'Java 17', value: 'java17' }, { name: 'Go 1.x', value: 'go1.x' }, { name: '.NET 8', value: 'dotnet8' }, { name: 'Ruby 3.3', value: 'ruby3.3' }] },
            { id: 'handler', name: 'handler', displayName: 'Handler', type: 'string', required: true },
            { id: 'role', name: 'role', displayName: 'Role ARN', type: 'string', required: true },
          ],
          optionalFields: [
            { id: 'codeZipFile', name: 'codeZipFile', displayName: 'Code (Binary)', type: 'string', required: false, description: 'Binary property name with ZIP' },
            { id: 's3Bucket', name: 's3Bucket', displayName: 'S3 Bucket', type: 'string', required: false },
            { id: 's3Key', name: 's3Key', displayName: 'S3 Key', type: 'string', required: false },
            { id: 'description', name: 'description', displayName: 'Description', type: 'string', required: false },
            { id: 'memorySize', name: 'memorySize', displayName: 'Memory Size (MB)', type: 'number', required: false, default: 128 },
            { id: 'timeout', name: 'timeout', displayName: 'Timeout (seconds)', type: 'number', required: false, default: 3 },
            { id: 'environment', name: 'environment', displayName: 'Environment Variables', type: 'json', required: false },
          ],
        },
        { id: 'update', name: 'Update Code', value: 'update', description: 'Update function code', action: 'Update code',
          fields: [{ id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true }],
          optionalFields: [
            { id: 'codeZipFile', name: 'codeZipFile', displayName: 'Code (Binary)', type: 'string', required: false },
            { id: 's3Bucket', name: 's3Bucket', displayName: 'S3 Bucket', type: 'string', required: false },
            { id: 's3Key', name: 's3Key', displayName: 'S3 Key', type: 'string', required: false },
          ],
        },
        { id: 'updateConfig', name: 'Update Configuration', value: 'updateConfig', description: 'Update function config', action: 'Update config',
          fields: [{ id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true }],
          optionalFields: [
            { id: 'description', name: 'description', displayName: 'Description', type: 'string', required: false },
            { id: 'handler', name: 'handler', displayName: 'Handler', type: 'string', required: false },
            { id: 'runtime', name: 'runtime', displayName: 'Runtime', type: 'string', required: false },
            { id: 'memorySize', name: 'memorySize', displayName: 'Memory Size (MB)', type: 'number', required: false },
            { id: 'timeout', name: 'timeout', displayName: 'Timeout (seconds)', type: 'number', required: false },
            { id: 'environment', name: 'environment', displayName: 'Environment Variables', type: 'json', required: false },
          ],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete function', action: 'Delete function',
          fields: [{ id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true }],
          optionalFields: [{ id: 'qualifier', name: 'qualifier', displayName: 'Qualifier', type: 'string', required: false }],
        },
      ],
    },
    {
      id: 'alias',
      name: 'Alias',
      value: 'alias',
      description: 'Function alias operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create alias', action: 'Create alias',
          fields: [
            { id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true },
            { id: 'name', name: 'name', displayName: 'Alias Name', type: 'string', required: true },
            { id: 'functionVersion', name: 'functionVersion', displayName: 'Function Version', type: 'string', required: true },
          ],
          optionalFields: [{ id: 'description', name: 'description', displayName: 'Description', type: 'string', required: false }],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get alias', action: 'Get alias',
          fields: [
            { id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true },
            { id: 'name', name: 'name', displayName: 'Alias Name', type: 'string', required: true },
          ],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List aliases', action: 'List aliases',
          fields: [{ id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'update', name: 'Update', value: 'update', description: 'Update alias', action: 'Update alias',
          fields: [
            { id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true },
            { id: 'name', name: 'name', displayName: 'Alias Name', type: 'string', required: true },
          ],
          optionalFields: [
            { id: 'functionVersion', name: 'functionVersion', displayName: 'Function Version', type: 'string', required: false },
            { id: 'description', name: 'description', displayName: 'Description', type: 'string', required: false },
          ],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete alias', action: 'Delete alias',
          fields: [
            { id: 'functionName', name: 'functionName', displayName: 'Function Name', type: 'string', required: true },
            { id: 'name', name: 'name', displayName: 'Alias Name', type: 'string', required: true },
          ],
          optionalFields: [],
        },
      ],
    },
  ],
};
