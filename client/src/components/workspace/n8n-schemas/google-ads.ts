/**
 * Google Ads n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const googleAdsSchema: N8nAppSchema = {
  id: 'google-ads',
  name: 'Google Ads',
  description: 'Google Ads advertising platform',
  version: '1.0.0',
  color: '#4285F4',
  icon: 'google',
  group: ['advertising', 'marketing'],
  
  credentials: [
    { name: 'googleAdsOAuth2', displayName: 'Google Ads OAuth2', required: true, type: 'oauth2',
      properties: [
        { name: 'accessToken', displayName: 'Access Token', type: 'string', required: true, typeOptions: { password: true } },
        { name: 'developerToken', displayName: 'Developer Token', type: 'string', required: true, typeOptions: { password: true } },
        { name: 'customerId', displayName: 'Customer ID', type: 'string', required: true },
      ],
    },
  ],
  
  resources: [
    {
      id: 'campaign', name: 'Campaign', value: 'campaign', description: 'Campaign operations',
      operations: [
        { id: 'get', name: 'Get', value: 'get', description: 'Get campaign', action: 'Get campaign',
          fields: [{ id: 'campaignId', name: 'campaignId', displayName: 'Campaign ID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List campaigns', action: 'List campaigns',
          fields: [],
          optionalFields: [{ id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'All', value: '' }, { name: 'Enabled', value: 'ENABLED' }, { name: 'Paused', value: 'PAUSED' }, { name: 'Removed', value: 'REMOVED' }] }],
        },
        { id: 'update', name: 'Update', value: 'update', description: 'Update campaign', action: 'Update campaign',
          fields: [{ id: 'campaignId', name: 'campaignId', displayName: 'Campaign ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'name', name: 'name', displayName: 'Name', type: 'string', required: false },
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'Enabled', value: 'ENABLED' }, { name: 'Paused', value: 'PAUSED' }] },
            { id: 'budget', name: 'budget', displayName: 'Daily Budget', type: 'number', required: false },
          ],
        },
      ],
    },
    {
      id: 'adGroup', name: 'Ad Group', value: 'adGroup', description: 'Ad group operations',
      operations: [
        { id: 'get', name: 'Get', value: 'get', description: 'Get ad group', action: 'Get ad group',
          fields: [{ id: 'adGroupId', name: 'adGroupId', displayName: 'Ad Group ID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List ad groups', action: 'List ad groups',
          fields: [{ id: 'campaignId', name: 'campaignId', displayName: 'Campaign ID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'update', name: 'Update', value: 'update', description: 'Update ad group', action: 'Update ad group',
          fields: [{ id: 'adGroupId', name: 'adGroupId', displayName: 'Ad Group ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'name', name: 'name', displayName: 'Name', type: 'string', required: false },
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'Enabled', value: 'ENABLED' }, { name: 'Paused', value: 'PAUSED' }] },
            { id: 'cpcBidMicros', name: 'cpcBidMicros', displayName: 'CPC Bid (micros)', type: 'number', required: false },
          ],
        },
      ],
    },
    {
      id: 'keyword', name: 'Keyword', value: 'keyword', description: 'Keyword operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List keywords', action: 'List keywords',
          fields: [{ id: 'adGroupId', name: 'adGroupId', displayName: 'Ad Group ID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'update', name: 'Update', value: 'update', description: 'Update keyword', action: 'Update keyword',
          fields: [{ id: 'keywordId', name: 'keywordId', displayName: 'Keyword ID', type: 'string', required: true }],
          optionalFields: [{ id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'Enabled', value: 'ENABLED' }, { name: 'Paused', value: 'PAUSED' }] }],
        },
      ],
    },
    {
      id: 'report', name: 'Report', value: 'report', description: 'Reporting operations',
      operations: [
        { id: 'get', name: 'Get Report', value: 'get', description: 'Get report data', action: 'Get report',
          fields: [
            { id: 'query', name: 'query', displayName: 'GAQL Query', type: 'string', required: true, typeOptions: { rows: 5 }, description: 'Google Ads Query Language query' },
          ],
          optionalFields: [{ id: 'returnAll', name: 'returnAll', displayName: 'Return All', type: 'boolean', required: false, default: false }],
        },
      ],
    },
  ],
};
