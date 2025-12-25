/**
 * Google Analytics n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const googleAnalyticsSchema: N8nAppSchema = {
  id: 'google-analytics',
  name: 'Google Analytics',
  description: 'Google Analytics reporting and data',
  version: '1.0.0',
  color: '#E37400',
  icon: 'google',
  group: ['analytics', 'marketing'],
  
  credentials: [
    { name: 'googleAnalyticsOAuth2', displayName: 'Google Analytics OAuth2', required: true, type: 'oauth2',
      properties: [{ name: 'accessToken', displayName: 'Access Token', type: 'string', required: true, typeOptions: { password: true } }],
    },
  ],
  
  resources: [
    {
      id: 'report', name: 'Report', value: 'report', description: 'Analytics reports',
      operations: [
        { id: 'get', name: 'Get Report', value: 'get', description: 'Get analytics report', action: 'Get report',
          fields: [
            { id: 'propertyId', name: 'propertyId', displayName: 'Property ID', type: 'string', required: true },
            { id: 'startDate', name: 'startDate', displayName: 'Start Date', type: 'dateTime', required: true },
            { id: 'endDate', name: 'endDate', displayName: 'End Date', type: 'dateTime', required: true },
          ],
          optionalFields: [
            { id: 'dimensions', name: 'dimensions', displayName: 'Dimensions', type: 'multiOptions', required: false, options: [{ name: 'Date', value: 'date' }, { name: 'Country', value: 'country' }, { name: 'City', value: 'city' }, { name: 'Device Category', value: 'deviceCategory' }, { name: 'Browser', value: 'browser' }, { name: 'Session Source', value: 'sessionSource' }, { name: 'Session Medium', value: 'sessionMedium' }, { name: 'Landing Page', value: 'landingPage' }, { name: 'Page Path', value: 'pagePath' }] },
            { id: 'metrics', name: 'metrics', displayName: 'Metrics', type: 'multiOptions', required: false, options: [{ name: 'Active Users', value: 'activeUsers' }, { name: 'Sessions', value: 'sessions' }, { name: 'Screen Page Views', value: 'screenPageViews' }, { name: 'Bounce Rate', value: 'bounceRate' }, { name: 'Average Session Duration', value: 'averageSessionDuration' }, { name: 'Conversions', value: 'conversions' }, { name: 'Total Revenue', value: 'totalRevenue' }] },
            { id: 'limit', name: 'limit', displayName: 'Row Limit', type: 'number', required: false, default: 10000 },
          ],
        },
        { id: 'getRealTime', name: 'Get Realtime Report', value: 'getRealTime', description: 'Get realtime data', action: 'Get realtime report',
          fields: [{ id: 'propertyId', name: 'propertyId', displayName: 'Property ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'dimensions', name: 'dimensions', displayName: 'Dimensions', type: 'multiOptions', required: false, options: [{ name: 'Country', value: 'country' }, { name: 'City', value: 'city' }, { name: 'Device Category', value: 'deviceCategory' }] },
            { id: 'metrics', name: 'metrics', displayName: 'Metrics', type: 'multiOptions', required: false, options: [{ name: 'Active Users', value: 'activeUsers' }] },
          ],
        },
      ],
    },
    {
      id: 'account', name: 'Account', value: 'account', description: 'Account operations',
      operations: [
        { id: 'getAll', name: 'List Accounts', value: 'getAll', description: 'List accounts', action: 'List accounts', fields: [], optionalFields: [] },
        { id: 'getProperties', name: 'List Properties', value: 'getProperties', description: 'List properties', action: 'List properties',
          fields: [{ id: 'accountId', name: 'accountId', displayName: 'Account ID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
  ],
};
