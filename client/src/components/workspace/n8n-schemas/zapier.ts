/**
 * Zapier Integration Schema
 * Resources: Webhook
 */

import type { N8nAppSchema } from './types';

export const zapierSchema: N8nAppSchema = {
  id: 'zapier',
  name: 'Zapier',
  description: 'Zapier automation platform',
  icon: 'zap',
  color: '#FF4A00',
  version: '1.0',
  group: ['automation'],
  credentials: [],
  resources: [
    {
      id: 'webhook',
      name: 'Webhook',
      value: 'webhook',
      description: 'Trigger Zapier webhooks',
      operations: [
        {
          id: 'send_webhook',
          name: 'Send Webhook',
          value: 'send_webhook',
          description: 'Send data to a Zapier webhook',
          action: 'Send webhook',
          fields: [
            {
              id: 'webhook_url',
              name: 'webhookUrl',
              displayName: 'Webhook URL',
              type: 'string',
              required: true,
              description: 'Zapier webhook URL',
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
