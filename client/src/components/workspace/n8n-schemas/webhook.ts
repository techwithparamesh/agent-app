/**
 * Webhook Integration Schema
 * Resources: Webhook
 */

import type { N8nAppSchema } from './types';

export const webhookSchema: N8nAppSchema = {
  id: 'webhook',
  name: 'Webhook',
  description: 'Send data to webhooks',
  icon: 'zap',
  color: '#000000',
  version: '1.0',
  group: ['automation'],
  credentials: [],
  resources: [
    {
      id: 'webhook',
      name: 'Webhook',
      value: 'webhook',
      description: 'Send webhook requests',
      operations: [
        {
          id: 'send_webhook',
          name: 'Send Webhook',
          value: 'send_webhook',
          description: 'Send data to a webhook URL',
          action: 'Send webhook',
          fields: [
            {
              id: 'url',
              name: 'url',
              displayName: 'Webhook URL',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'method',
              name: 'method',
              displayName: 'Method',
              type: 'options',
              default: 'POST',
              options: [
                { name: 'GET', value: 'GET' },
                { name: 'POST', value: 'POST' },
                { name: 'PUT', value: 'PUT' },
                { name: 'PATCH', value: 'PATCH' },
                { name: 'DELETE', value: 'DELETE' },
              ],
            },
            {
              id: 'data',
              name: 'data',
              displayName: 'Data (JSON)',
              type: 'json',
              description: 'JSON data to send',
            },
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Headers (JSON)',
              type: 'json',
              description: 'Custom headers as JSON',
            },
          ],
        },
      ],
    },
  ],
};
