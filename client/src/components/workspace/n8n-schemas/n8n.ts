/**
 * n8n Integration Schema
 * Resources: Webhook
 */

import type { N8nAppSchema } from './types';

export const n8nSchema: N8nAppSchema = {
  id: 'n8n',
  name: 'n8n',
  description: 'n8n workflow automation',
  icon: 'zap',
  color: '#EA4B71',
  version: '1.0',
  group: ['automation'],
  credentials: [],
  resources: [
    {
      id: 'webhook',
      name: 'Webhook',
      value: 'webhook',
      description: 'Trigger n8n webhooks',
      operations: [
        {
          id: 'send_webhook',
          name: 'Send Webhook',
          value: 'send_webhook',
          description: 'Send data to an n8n webhook',
          action: 'Send webhook',
          fields: [
            {
              id: 'webhook_url',
              name: 'webhookUrl',
              displayName: 'Webhook URL',
              type: 'string',
              required: true,
              description: 'n8n webhook URL',
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
              ],
            },
            {
              id: 'data',
              name: 'data',
              displayName: 'Data (JSON)',
              type: 'json',
              description: 'JSON data to send',
            },
          ],
        },
      ],
    },
  ],
};
