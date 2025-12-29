/**
 * Azure Cosmos DB Integration Schema
 * Resources: Query
 */

import type { N8nAppSchema } from './types';

export const cosmosDbSchema: N8nAppSchema = {
  id: 'cosmos-db',
  name: 'Azure Cosmos DB',
  description: 'Azure Cosmos DB NoSQL database',
  icon: 'database',
  color: '#0089D6',
  version: '1.0',
  group: ['data'],
  credentials: [
    {
      id: 'cosmosdb_api',
      name: 'Cosmos DB API',
      type: 'apiKey',
      fields: [
        { id: 'endpoint', displayName: 'Endpoint', name: 'endpoint', type: 'string', required: true },
        { id: 'key', displayName: 'Key', name: 'key', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'query',
      name: 'Query',
      value: 'query',
      description: 'Query documents',
      operations: [
        {
          id: 'query',
          name: 'Execute Query',
          value: 'query',
          description: 'Execute a SQL query against a container',
          action: 'Execute query',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'container',
              name: 'container',
              displayName: 'Container',
              type: 'string',
              required: true,
            },
            {
              id: 'query',
              name: 'query',
              displayName: 'SQL Query',
              type: 'text',
              required: true,
              typeOptions: { rows: 4 },
              description: 'Cosmos DB SQL query',
            },
          ],
          optionalFields: [
            {
              id: 'partition_key',
              name: 'partitionKey',
              displayName: 'Partition Key',
              type: 'string',
            },
            {
              id: 'max_items',
              name: 'maxItems',
              displayName: 'Max Items',
              type: 'number',
              default: 100,
            },
          ],
        },
      ],
    },
  ],
};
