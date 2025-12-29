/**
 * Mixpanel Integration Schema
 * Resources: Event
 */

import type { N8nAppSchema } from './types';

export const mixpanelSchema: N8nAppSchema = {
  id: 'mixpanel',
  name: 'Mixpanel',
  description: 'Mixpanel product analytics',
  icon: 'bar-chart-2',
  color: '#7856FF',
  version: '1.0',
  group: ['analytics'],
  credentials: [
    {
      id: 'mixpanel_api',
      name: 'Mixpanel API',
      type: 'apiKey',
      fields: [
        { id: 'token', displayName: 'Token', name: 'token', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'event',
      name: 'Event',
      value: 'event',
      description: 'Track events',
      operations: [
        {
          id: 'track',
          name: 'Track Event',
          value: 'track',
          description: 'Track an event',
          action: 'Track event',
          fields: [
            {
              id: 'event',
              name: 'event',
              displayName: 'Event Name',
              type: 'string',
              required: true,
            },
            {
              id: 'distinct_id',
              name: 'distinctId',
              displayName: 'Distinct ID',
              type: 'string',
              required: true,
              description: 'Unique user identifier',
            },
          ],
          optionalFields: [
            {
              id: 'properties',
              name: 'properties',
              displayName: 'Properties (JSON)',
              type: 'json',
              description: 'Event properties as JSON',
            },
            {
              id: 'time',
              name: 'time',
              displayName: 'Timestamp',
              type: 'dateTime',
            },
          ],
        },
      ],
    },
  ],
};
