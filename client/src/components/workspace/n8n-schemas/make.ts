/**
 * Make (Integromat) Integration Schema
 * Resources: Webhook
 */

import type { N8nAppSchema } from './types';

export const makeSchema: N8nAppSchema = {
  id: 'make',
  name: 'Make',
  description: 'Make (formerly Integromat) automation',
  icon: 'zap',
  color: '#6D00CC',
  version: '1.0',
  group: ['automation'],
  credentials: [],
  resources: [
    {
      id: 'webhook',
      name: 'Webhook',
      value: 'webhook',
      description: 'Trigger webhooks',
      operations: [
        {
          id: 'send_webhook',
          name: 'Send Webhook',
          value: 'send_webhook',
          description: 'Send data to a Make webhook',
          action: 'Send webhook',
          fields: [
            {
              id: 'webhook_url',
              name: 'webhookUrl',
              displayName: 'Webhook URL',
              type: 'string',
              required: true,
              description: 'Make webhook URL',
            },
          ],
          optionalFields: [
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
