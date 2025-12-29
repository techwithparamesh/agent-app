/**
 * Mailgun Integration Schema
 * Resources: Email
 */

import type { N8nAppSchema } from './types';

export const mailgunSchema: N8nAppSchema = {
  id: 'mailgun',
  name: 'Mailgun',
  description: 'Mailgun email delivery service',
  icon: 'mail',
  color: '#F06B66',
  version: '1.0',
  group: ['email'],
  credentials: [
    {
      id: 'mailgun_api',
      name: 'Mailgun API',
      type: 'apiKey',
      fields: [
        { id: 'api_key', displayName: 'API Key', name: 'apiKey', type: 'string', required: true },
        { id: 'domain', displayName: 'Domain', name: 'domain', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'email',
      name: 'Email',
      value: 'email',
      description: 'Send emails',
      operations: [
        {
          id: 'send_email',
          name: 'Send Email',
          value: 'send_email',
          description: 'Send an email',
          action: 'Send email',
          fields: [
            {
              id: 'domain',
              name: 'domain',
              displayName: 'Domain',
              type: 'string',
              required: true,
              description: 'Your Mailgun domain',
            },
            {
              id: 'from',
              name: 'from',
              displayName: 'From',
              type: 'string',
              required: true,
              description: 'Sender email address',
            },
            {
              id: 'to',
              name: 'to',
              displayName: 'To',
              type: 'string',
              required: true,
              description: 'Recipient email addresses (comma-separated)',
            },
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'text',
              name: 'text',
              displayName: 'Text Body',
              type: 'text',
              typeOptions: { rows: 5 },
            },
            {
              id: 'html',
              name: 'html',
              displayName: 'HTML Body',
              type: 'text',
              typeOptions: { rows: 8 },
            },
            {
              id: 'cc',
              name: 'cc',
              displayName: 'CC',
              type: 'string',
            },
            {
              id: 'bcc',
              name: 'bcc',
              displayName: 'BCC',
              type: 'string',
            },
            {
              id: 'reply_to',
              name: 'replyTo',
              displayName: 'Reply-To',
              type: 'string',
            },
            {
              id: 'tags',
              name: 'tags',
              displayName: 'Tags',
              type: 'string',
              description: 'Comma-separated tags',
            },
          ],
        },
      ],
    },
  ],
};
