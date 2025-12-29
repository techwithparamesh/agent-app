/**
 * Power Automate Integration Schema
 * Resources: Flow
 */

import type { N8nAppSchema } from './types';

export const powerAutomateSchema: N8nAppSchema = {
  id: 'power-automate',
  name: 'Power Automate',
  description: 'Microsoft Power Automate',
  icon: 'zap',
  color: '#0066FF',
  version: '1.0',
  group: ['automation'],
  credentials: [],
  resources: [
    {
      id: 'flow',
      name: 'Flow',
      value: 'flow',
      description: 'Trigger flows',
      operations: [
        {
          id: 'trigger_flow',
          name: 'Trigger Flow',
          value: 'trigger_flow',
          description: 'Trigger a Power Automate flow',
          action: 'Trigger flow',
          fields: [
            {
              id: 'webhook_url',
              name: 'webhookUrl',
              displayName: 'HTTP Trigger URL',
              type: 'string',
              required: true,
              description: 'Power Automate HTTP trigger URL',
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
