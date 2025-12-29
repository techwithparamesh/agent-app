/**
 * Zoho CRM Integration Schema
 * Resources: Record
 */

import type { N8nAppSchema } from './types';

export const zohoCrmSchema: N8nAppSchema = {
  id: 'zoho-crm',
  name: 'Zoho CRM',
  description: 'Zoho CRM integration',
  icon: 'users',
  color: '#E42527',
  version: '1.0',
  group: ['crm'],
  credentials: [
    {
      id: 'zoho_oauth2',
      name: 'Zoho OAuth2',
      type: 'oAuth2',
      fields: [
        { id: 'client_id', displayName: 'Client ID', name: 'clientId', type: 'string', required: true },
        { id: 'client_secret', displayName: 'Client Secret', name: 'clientSecret', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'record',
      name: 'Record',
      value: 'record',
      description: 'Manage CRM records',
      operations: [
        {
          id: 'create_record',
          name: 'Create Record',
          value: 'create_record',
          description: 'Create a new record',
          action: 'Create record',
          fields: [
            {
              id: 'module',
              name: 'module',
              displayName: 'Module',
              type: 'options',
              required: true,
              options: [
                { name: 'Leads', value: 'Leads' },
                { name: 'Contacts', value: 'Contacts' },
                { name: 'Accounts', value: 'Accounts' },
                { name: 'Deals', value: 'Deals' },
                { name: 'Tasks', value: 'Tasks' },
                { name: 'Events', value: 'Events' },
                { name: 'Calls', value: 'Calls' },
              ],
            },
            {
              id: 'data',
              name: 'data',
              displayName: 'Record Data (JSON)',
              type: 'json',
              required: true,
              description: 'Record data as JSON',
            },
          ],
        },
        {
          id: 'update_record',
          name: 'Update Record',
          value: 'update_record',
          description: 'Update an existing record',
          action: 'Update record',
          fields: [
            {
              id: 'module',
              name: 'module',
              displayName: 'Module',
              type: 'options',
              required: true,
              options: [
                { name: 'Leads', value: 'Leads' },
                { name: 'Contacts', value: 'Contacts' },
                { name: 'Accounts', value: 'Accounts' },
                { name: 'Deals', value: 'Deals' },
                { name: 'Tasks', value: 'Tasks' },
                { name: 'Events', value: 'Events' },
                { name: 'Calls', value: 'Calls' },
              ],
            },
            {
              id: 'record_id',
              name: 'recordId',
              displayName: 'Record ID',
              type: 'string',
              required: true,
            },
            {
              id: 'data',
              name: 'data',
              displayName: 'Record Data (JSON)',
              type: 'json',
              required: true,
            },
          ],
        },
        {
          id: 'search_records',
          name: 'Search Records',
          value: 'search_records',
          description: 'Search for records',
          action: 'Search records',
          fields: [
            {
              id: 'module',
              name: 'module',
              displayName: 'Module',
              type: 'options',
              required: true,
              options: [
                { name: 'Leads', value: 'Leads' },
                { name: 'Contacts', value: 'Contacts' },
                { name: 'Accounts', value: 'Accounts' },
                { name: 'Deals', value: 'Deals' },
              ],
            },
            {
              id: 'criteria',
              name: 'criteria',
              displayName: 'Search Criteria',
              type: 'string',
              required: true,
              description: 'Search criteria (e.g., (Email:equals:test@example.com))',
            },
          ],
          optionalFields: [
            {
              id: 'page',
              name: 'page',
              displayName: 'Page',
              type: 'number',
              default: 1,
            },
            {
              id: 'per_page',
              name: 'perPage',
              displayName: 'Per Page',
              type: 'number',
              default: 200,
            },
          ],
        },
      ],
    },
  ],
};
