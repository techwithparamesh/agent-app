/**
 * LinkedIn n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const linkedinSchema: N8nAppSchema = {
  id: 'linkedin',
  name: 'LinkedIn',
  description: 'LinkedIn professional network',
  version: '1.0.0',
  color: '#0A66C2',
  icon: 'linkedin',
  group: ['social', 'marketing'],
  
  credentials: [
    {
      name: 'linkedinOAuth2',
      displayName: 'LinkedIn OAuth2',
      required: true,
      type: 'oauth2',
      properties: [
        { name: 'accessToken', displayName: 'Access Token', type: 'string', required: true, typeOptions: { password: true } },
      ],
    },
  ],
  
  resources: [
    {
      id: 'post',
      name: 'Post',
      value: 'post',
      description: 'Post operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create post', action: 'Create post',
          fields: [
            { id: 'text', name: 'text', displayName: 'Text', type: 'string', required: true, typeOptions: { rows: 5 } },
            { id: 'visibility', name: 'visibility', displayName: 'Visibility', type: 'options', required: true, options: [{ name: 'Anyone', value: 'PUBLIC' }, { name: 'Connections Only', value: 'CONNECTIONS' }] },
          ],
          optionalFields: [
            { id: 'mediaCategory', name: 'mediaCategory', displayName: 'Media Category', type: 'options', required: false, options: [{ name: 'None', value: 'NONE' }, { name: 'Article', value: 'ARTICLE' }, { name: 'Image', value: 'IMAGE' }] },
            { id: 'articleUrl', name: 'articleUrl', displayName: 'Article URL', type: 'string', required: false },
            { id: 'articleTitle', name: 'articleTitle', displayName: 'Article Title', type: 'string', required: false },
            { id: 'articleDescription', name: 'articleDescription', displayName: 'Article Description', type: 'string', required: false },
          ],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete post', action: 'Delete post',
          fields: [{ id: 'postId', name: 'postId', displayName: 'Post ID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get post', action: 'Get post',
          fields: [{ id: 'postId', name: 'postId', displayName: 'Post ID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'profile',
      name: 'Profile',
      value: 'profile',
      description: 'Profile operations',
      operations: [
        { id: 'get', name: 'Get Profile', value: 'get', description: 'Get own profile', action: 'Get profile',
          fields: [],
          optionalFields: [],
        },
        { id: 'getOther', name: 'Get Other Profile', value: 'getOther', description: 'Get another profile', action: 'Get other profile',
          fields: [{ id: 'profileId', name: 'profileId', displayName: 'Profile ID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'company',
      name: 'Company Page',
      value: 'company',
      description: 'Company page operations',
      operations: [
        { id: 'get', name: 'Get', value: 'get', description: 'Get company', action: 'Get company',
          fields: [{ id: 'companyId', name: 'companyId', displayName: 'Company ID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'createPost', name: 'Create Post', value: 'createPost', description: 'Create company post', action: 'Create company post',
          fields: [
            { id: 'companyId', name: 'companyId', displayName: 'Company ID', type: 'string', required: true },
            { id: 'text', name: 'text', displayName: 'Text', type: 'string', required: true, typeOptions: { rows: 5 } },
            { id: 'visibility', name: 'visibility', displayName: 'Visibility', type: 'options', required: true, options: [{ name: 'Public', value: 'PUBLIC' }] },
          ],
          optionalFields: [
            { id: 'mediaCategory', name: 'mediaCategory', displayName: 'Media Category', type: 'options', required: false, options: [{ name: 'None', value: 'NONE' }, { name: 'Article', value: 'ARTICLE' }, { name: 'Image', value: 'IMAGE' }] },
            { id: 'articleUrl', name: 'articleUrl', displayName: 'Article URL', type: 'string', required: false },
          ],
        },
        { id: 'getFollowers', name: 'Get Followers', value: 'getFollowers', description: 'Get company followers', action: 'Get followers',
          fields: [{ id: 'companyId', name: 'companyId', displayName: 'Company ID', type: 'string', required: true }],
          optionalFields: [{ id: 'count', name: 'count', displayName: 'Count', type: 'number', required: false, default: 100 }],
        },
      ],
    },
    {
      id: 'message',
      name: 'Message',
      value: 'message',
      description: 'Messaging operations',
      operations: [
        { id: 'send', name: 'Send Message', value: 'send', description: 'Send direct message', action: 'Send message',
          fields: [
            { id: 'recipientId', name: 'recipientId', displayName: 'Recipient ID', type: 'string', required: true },
            { id: 'message', name: 'message', displayName: 'Message', type: 'string', required: true, typeOptions: { rows: 3 } },
          ],
          optionalFields: [
            { id: 'subject', name: 'subject', displayName: 'Subject', type: 'string', required: false },
          ],
        },
        { id: 'getConversations', name: 'Get Conversations', value: 'getConversations', description: 'Get conversations', action: 'Get conversations',
          fields: [],
          optionalFields: [{ id: 'count', name: 'count', displayName: 'Count', type: 'number', required: false, default: 20 }],
        },
      ],
    },
    {
      id: 'analytics',
      name: 'Analytics',
      value: 'analytics',
      description: 'Analytics operations',
      operations: [
        { id: 'getPageStats', name: 'Get Page Stats', value: 'getPageStats', description: 'Get company page stats', action: 'Get page stats',
          fields: [{ id: 'companyId', name: 'companyId', displayName: 'Company ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'startDate', name: 'startDate', displayName: 'Start Date', type: 'dateTime', required: false },
            { id: 'endDate', name: 'endDate', displayName: 'End Date', type: 'dateTime', required: false },
            { id: 'timeGranularity', name: 'timeGranularity', displayName: 'Time Granularity', type: 'options', required: false, options: [{ name: 'Day', value: 'DAY' }, { name: 'Month', value: 'MONTH' }] },
          ],
        },
        { id: 'getShareStats', name: 'Get Share Stats', value: 'getShareStats', description: 'Get share statistics', action: 'Get share stats',
          fields: [{ id: 'shareId', name: 'shareId', displayName: 'Share/Post ID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'connection',
      name: 'Connection',
      value: 'connection',
      description: 'Connection operations',
      operations: [
        { id: 'getConnections', name: 'Get Connections', value: 'getConnections', description: 'Get connections', action: 'Get connections',
          fields: [],
          optionalFields: [
            { id: 'start', name: 'start', displayName: 'Start', type: 'number', required: false, default: 0 },
            { id: 'count', name: 'count', displayName: 'Count', type: 'number', required: false, default: 50 },
          ],
        },
      ],
    },
  ],
};
