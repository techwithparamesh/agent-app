/**
 * BigQuery Integration Schema
 * Resources: Query
 */

import type { N8nAppSchema } from './types';

export const bigquerySchema: N8nAppSchema = {
  id: 'bigquery',
  name: 'BigQuery',
  description: 'Google BigQuery data warehouse',
  icon: 'database',
  color: '#4285F4',
  version: '1.0',
  group: ['data'],
  credentials: [
    {
      id: 'bigquery_service_account',
      name: 'BigQuery Service Account',
      type: 'serviceAccount',
      fields: [
        { id: 'project_id', displayName: 'Project ID', name: 'projectId', type: 'string', required: true },
        { id: 'credentials_json', displayName: 'Service Account JSON', name: 'credentialsJson', type: 'json', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'query',
      name: 'Query',
      value: 'query',
      description: 'Execute SQL queries',
      operations: [
        {
          id: 'query',
          name: 'Execute Query',
          value: 'query',
          description: 'Execute a SQL query',
          action: 'Execute query',
          fields: [
            {
              id: 'project_id',
              name: 'projectId',
              displayName: 'Project ID',
              type: 'string',
              required: true,
              description: 'Google Cloud project ID',
            },
            {
              id: 'query',
              name: 'query',
              displayName: 'SQL Query',
              type: 'text',
              required: true,
              typeOptions: { rows: 5 },
              description: 'The SQL query to execute',
            },
          ],
          optionalFields: [
            {
              id: 'location',
              name: 'location',
              displayName: 'Location',
              type: 'string',
              description: 'Dataset location (e.g., US, EU)',
            },
            {
              id: 'use_legacy_sql',
              name: 'useLegacySql',
              displayName: 'Use Legacy SQL',
              type: 'boolean',
              default: false,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              default: 1000,
            },
          ],
        },
      ],
    },
  ],
};
