/**
 * Segment Integration Schema
 * Resources: Event
 */

import type { N8nAppSchema } from './types';

export const segmentSchema: N8nAppSchema = {
  id: 'segment',
  name: 'Segment',
  description: 'Segment customer data platform',
  icon: 'bar-chart-2',
  color: '#52BD95',
  version: '1.0',
  group: ['analytics'],
  credentials: [
    {
      id: 'segment_api',
      name: 'Segment API',
      type: 'apiKey',
      fields: [
        { id: 'write_key', displayName: 'Write Key', name: 'writeKey', type: 'string', required: true },
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
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'anonymous_id',
              name: 'anonymousId',
              displayName: 'Anonymous ID',
              type: 'string',
            },
            {
              id: 'properties',
              name: 'properties',
              displayName: 'Properties (JSON)',
              type: 'json',
              description: 'Event properties',
            },
            {
              id: 'context',
              name: 'context',
              displayName: 'Context (JSON)',
              type: 'json',
              description: 'Context data',
            },
            {
              id: 'timestamp',
              name: 'timestamp',
              displayName: 'Timestamp',
              type: 'dateTime',
            },
          ],
        },
      ],
    },
  ],
};
