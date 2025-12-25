/**
 * Facebook Ads n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const facebookAdsSchema: N8nAppSchema = {
  id: 'facebook-ads',
  name: 'Facebook Ads',
  description: 'Meta/Facebook Ads Manager',
  version: '1.0.0',
  color: '#1877F2',
  icon: 'facebook',
  group: ['advertising', 'marketing'],
  
  credentials: [
    { name: 'facebookAdsOAuth2', displayName: 'Facebook Ads OAuth2', required: true, type: 'oauth2',
      properties: [{ name: 'accessToken', displayName: 'Access Token', type: 'string', required: true, typeOptions: { password: true } }],
    },
  ],
  
  resources: [
    {
      id: 'campaign', name: 'Campaign', value: 'campaign', description: 'Campaign operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create campaign', action: 'Create campaign',
          fields: [
            { id: 'accountId', name: 'accountId', displayName: 'Ad Account ID', type: 'string', required: true },
            { id: 'name', name: 'name', displayName: 'Name', type: 'string', required: true },
            { id: 'objective', name: 'objective', displayName: 'Objective', type: 'options', required: true, options: [{ name: 'Awareness', value: 'OUTCOME_AWARENESS' }, { name: 'Traffic', value: 'OUTCOME_TRAFFIC' }, { name: 'Engagement', value: 'OUTCOME_ENGAGEMENT' }, { name: 'Leads', value: 'OUTCOME_LEADS' }, { name: 'App Promotion', value: 'OUTCOME_APP_PROMOTION' }, { name: 'Sales', value: 'OUTCOME_SALES' }] },
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: true, options: [{ name: 'Active', value: 'ACTIVE' }, { name: 'Paused', value: 'PAUSED' }] },
          ],
          optionalFields: [
            { id: 'specialAdCategories', name: 'specialAdCategories', displayName: 'Special Ad Categories', type: 'multiOptions', required: false, options: [{ name: 'None', value: 'NONE' }, { name: 'Housing', value: 'HOUSING' }, { name: 'Employment', value: 'EMPLOYMENT' }, { name: 'Credit', value: 'CREDIT' }] },
            { id: 'dailyBudget', name: 'dailyBudget', displayName: 'Daily Budget (cents)', type: 'number', required: false },
            { id: 'lifetimeBudget', name: 'lifetimeBudget', displayName: 'Lifetime Budget (cents)', type: 'number', required: false },
          ],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get campaign', action: 'Get campaign',
          fields: [{ id: 'campaignId', name: 'campaignId', displayName: 'Campaign ID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List campaigns', action: 'List campaigns',
          fields: [{ id: 'accountId', name: 'accountId', displayName: 'Ad Account ID', type: 'string', required: true }],
          optionalFields: [{ id: 'status', name: 'status', displayName: 'Status Filter', type: 'options', required: false, options: [{ name: 'All', value: '' }, { name: 'Active', value: 'ACTIVE' }, { name: 'Paused', value: 'PAUSED' }, { name: 'Archived', value: 'ARCHIVED' }] }],
        },
        { id: 'update', name: 'Update', value: 'update', description: 'Update campaign', action: 'Update campaign',
          fields: [{ id: 'campaignId', name: 'campaignId', displayName: 'Campaign ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'name', name: 'name', displayName: 'Name', type: 'string', required: false },
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'Active', value: 'ACTIVE' }, { name: 'Paused', value: 'PAUSED' }] },
          ],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete campaign', action: 'Delete campaign',
          fields: [{ id: 'campaignId', name: 'campaignId', displayName: 'Campaign ID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'adSet', name: 'Ad Set', value: 'adSet', description: 'Ad set operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create ad set', action: 'Create ad set',
          fields: [
            { id: 'accountId', name: 'accountId', displayName: 'Ad Account ID', type: 'string', required: true },
            { id: 'campaignId', name: 'campaignId', displayName: 'Campaign ID', type: 'string', required: true },
            { id: 'name', name: 'name', displayName: 'Name', type: 'string', required: true },
            { id: 'targeting', name: 'targeting', displayName: 'Targeting (JSON)', type: 'json', required: true },
            { id: 'billingEvent', name: 'billingEvent', displayName: 'Billing Event', type: 'options', required: true, options: [{ name: 'Impressions', value: 'IMPRESSIONS' }, { name: 'Link Clicks', value: 'LINK_CLICKS' }, { name: 'Page Likes', value: 'PAGE_LIKES' }] },
          ],
          optionalFields: [
            { id: 'dailyBudget', name: 'dailyBudget', displayName: 'Daily Budget (cents)', type: 'number', required: false },
            { id: 'bidAmount', name: 'bidAmount', displayName: 'Bid Amount (cents)', type: 'number', required: false },
          ],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get ad set', action: 'Get ad set',
          fields: [{ id: 'adSetId', name: 'adSetId', displayName: 'Ad Set ID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List ad sets', action: 'List ad sets',
          fields: [{ id: 'campaignId', name: 'campaignId', displayName: 'Campaign ID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'ad', name: 'Ad', value: 'ad', description: 'Ad operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create ad', action: 'Create ad',
          fields: [
            { id: 'accountId', name: 'accountId', displayName: 'Ad Account ID', type: 'string', required: true },
            { id: 'adSetId', name: 'adSetId', displayName: 'Ad Set ID', type: 'string', required: true },
            { id: 'name', name: 'name', displayName: 'Name', type: 'string', required: true },
            { id: 'creative', name: 'creative', displayName: 'Creative (JSON)', type: 'json', required: true },
          ],
          optionalFields: [{ id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'Active', value: 'ACTIVE' }, { name: 'Paused', value: 'PAUSED' }] }],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get ad', action: 'Get ad',
          fields: [{ id: 'adId', name: 'adId', displayName: 'Ad ID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List ads', action: 'List ads',
          fields: [{ id: 'adSetId', name: 'adSetId', displayName: 'Ad Set ID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'insights', name: 'Insights', value: 'insights', description: 'Analytics insights',
      operations: [
        { id: 'get', name: 'Get Insights', value: 'get', description: 'Get performance insights', action: 'Get insights',
          fields: [
            { id: 'objectId', name: 'objectId', displayName: 'Object ID', type: 'string', required: true },
            { id: 'level', name: 'level', displayName: 'Level', type: 'options', required: true, options: [{ name: 'Account', value: 'account' }, { name: 'Campaign', value: 'campaign' }, { name: 'Ad Set', value: 'adset' }, { name: 'Ad', value: 'ad' }] },
          ],
          optionalFields: [
            { id: 'datePreset', name: 'datePreset', displayName: 'Date Preset', type: 'options', required: false, options: [{ name: 'Today', value: 'today' }, { name: 'Yesterday', value: 'yesterday' }, { name: 'Last 7 Days', value: 'last_7d' }, { name: 'Last 30 Days', value: 'last_30d' }, { name: 'This Month', value: 'this_month' }, { name: 'Last Month', value: 'last_month' }] },
            { id: 'fields', name: 'fields', displayName: 'Fields', type: 'multiOptions', required: false, options: [{ name: 'Impressions', value: 'impressions' }, { name: 'Clicks', value: 'clicks' }, { name: 'Spend', value: 'spend' }, { name: 'CTR', value: 'ctr' }, { name: 'CPC', value: 'cpc' }, { name: 'CPM', value: 'cpm' }, { name: 'Reach', value: 'reach' }, { name: 'Conversions', value: 'conversions' }] },
          ],
        },
      ],
    },
  ],
};
