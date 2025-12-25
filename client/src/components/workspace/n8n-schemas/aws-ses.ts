/**
 * AWS SES n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const awsSesSchema: N8nAppSchema = {
  id: 'aws-ses',
  name: 'AWS SES',
  description: 'Amazon Simple Email Service',
  version: '1.0.0',
  color: '#FF9900',
  icon: 'aws',
  group: ['email', 'cloud'],
  
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
      id: 'email',
      name: 'Email',
      value: 'email',
      description: 'Email operations',
      operations: [
        { id: 'send', name: 'Send', value: 'send', description: 'Send email', action: 'Send email',
          fields: [
            { id: 'fromEmail', name: 'fromEmail', displayName: 'From Email', type: 'string', required: true },
            { id: 'toEmail', name: 'toEmail', displayName: 'To Email', type: 'string', required: true, description: 'Comma-separated for multiple' },
            { id: 'subject', name: 'subject', displayName: 'Subject', type: 'string', required: true },
          ],
          optionalFields: [
            { id: 'body', name: 'body', displayName: 'Body (Text)', type: 'string', required: false, typeOptions: { rows: 5 } },
            { id: 'htmlBody', name: 'htmlBody', displayName: 'Body (HTML)', type: 'string', required: false, typeOptions: { rows: 5 } },
            { id: 'ccEmail', name: 'ccEmail', displayName: 'CC', type: 'string', required: false },
            { id: 'bccEmail', name: 'bccEmail', displayName: 'BCC', type: 'string', required: false },
            { id: 'replyTo', name: 'replyTo', displayName: 'Reply To', type: 'string', required: false },
            { id: 'attachments', name: 'attachments', displayName: 'Attachments', type: 'string', required: false, description: 'Binary property names' },
          ],
        },
        { id: 'sendRaw', name: 'Send Raw', value: 'sendRaw', description: 'Send raw email', action: 'Send raw email',
          fields: [
            { id: 'rawMessage', name: 'rawMessage', displayName: 'Raw Message', type: 'string', required: true, typeOptions: { rows: 10 } },
          ],
          optionalFields: [
            { id: 'source', name: 'source', displayName: 'Source', type: 'string', required: false },
            { id: 'destinations', name: 'destinations', displayName: 'Destinations', type: 'string', required: false },
          ],
        },
        { id: 'sendTemplated', name: 'Send Templated', value: 'sendTemplated', description: 'Send templated email', action: 'Send templated email',
          fields: [
            { id: 'fromEmail', name: 'fromEmail', displayName: 'From Email', type: 'string', required: true },
            { id: 'toEmail', name: 'toEmail', displayName: 'To Email', type: 'string', required: true },
            { id: 'templateName', name: 'templateName', displayName: 'Template Name', type: 'string', required: true },
            { id: 'templateData', name: 'templateData', displayName: 'Template Data (JSON)', type: 'json', required: true },
          ],
          optionalFields: [
            { id: 'configurationSetName', name: 'configurationSetName', displayName: 'Configuration Set', type: 'string', required: false },
          ],
        },
        { id: 'sendBulk', name: 'Send Bulk', value: 'sendBulk', description: 'Send bulk templated email', action: 'Send bulk email',
          fields: [
            { id: 'fromEmail', name: 'fromEmail', displayName: 'From Email', type: 'string', required: true },
            { id: 'templateName', name: 'templateName', displayName: 'Template Name', type: 'string', required: true },
            { id: 'destinations', name: 'destinations', displayName: 'Destinations (JSON)', type: 'json', required: true, description: 'Array of destination objects' },
          ],
          optionalFields: [
            { id: 'defaultTemplateData', name: 'defaultTemplateData', displayName: 'Default Template Data', type: 'json', required: false },
          ],
        },
      ],
    },
    {
      id: 'template',
      name: 'Template',
      value: 'template',
      description: 'Email template operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create template', action: 'Create template',
          fields: [
            { id: 'templateName', name: 'templateName', displayName: 'Template Name', type: 'string', required: true },
            { id: 'subject', name: 'subject', displayName: 'Subject', type: 'string', required: true },
          ],
          optionalFields: [
            { id: 'textPart', name: 'textPart', displayName: 'Text Part', type: 'string', required: false, typeOptions: { rows: 5 } },
            { id: 'htmlPart', name: 'htmlPart', displayName: 'HTML Part', type: 'string', required: false, typeOptions: { rows: 5 } },
          ],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get template', action: 'Get template',
          fields: [{ id: 'templateName', name: 'templateName', displayName: 'Template Name', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'update', name: 'Update', value: 'update', description: 'Update template', action: 'Update template',
          fields: [{ id: 'templateName', name: 'templateName', displayName: 'Template Name', type: 'string', required: true }],
          optionalFields: [
            { id: 'subject', name: 'subject', displayName: 'Subject', type: 'string', required: false },
            { id: 'textPart', name: 'textPart', displayName: 'Text Part', type: 'string', required: false },
            { id: 'htmlPart', name: 'htmlPart', displayName: 'HTML Part', type: 'string', required: false },
          ],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete template', action: 'Delete template',
          fields: [{ id: 'templateName', name: 'templateName', displayName: 'Template Name', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List templates', action: 'List templates',
          fields: [],
          optionalFields: [{ id: 'maxItems', name: 'maxItems', displayName: 'Max Items', type: 'number', required: false, default: 100 }],
        },
      ],
    },
    {
      id: 'identity',
      name: 'Identity',
      value: 'identity',
      description: 'Identity verification operations',
      operations: [
        { id: 'verifyEmail', name: 'Verify Email', value: 'verifyEmail', description: 'Verify email identity', action: 'Verify email',
          fields: [{ id: 'email', name: 'email', displayName: 'Email', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'verifyDomain', name: 'Verify Domain', value: 'verifyDomain', description: 'Verify domain identity', action: 'Verify domain',
          fields: [{ id: 'domain', name: 'domain', displayName: 'Domain', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List identities', action: 'List identities',
          fields: [],
          optionalFields: [
            { id: 'identityType', name: 'identityType', displayName: 'Identity Type', type: 'options', required: false, options: [{ name: 'All', value: '' }, { name: 'Email Address', value: 'EmailAddress' }, { name: 'Domain', value: 'Domain' }] },
          ],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete identity', action: 'Delete identity',
          fields: [{ id: 'identity', name: 'identity', displayName: 'Identity', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'getVerificationAttributes', name: 'Get Verification Status', value: 'getVerificationAttributes', description: 'Get verification attributes', action: 'Get verification status',
          fields: [{ id: 'identities', name: 'identities', displayName: 'Identities', type: 'string', required: true, description: 'Comma-separated list' }],
          optionalFields: [],
        },
      ],
    },
  ],
};
