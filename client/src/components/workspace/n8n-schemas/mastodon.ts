/**
 * Mastodon Integration Schema
 * Resources: Status
 */

import type { N8nAppSchema } from './types';

export const mastodonSchema: N8nAppSchema = {
  id: 'mastodon',
  name: 'Mastodon',
  description: 'Mastodon social network',
  icon: 'message-circle',
  color: '#6364FF',
  version: '1.0',
  group: ['social'],
  credentials: [
    {
      id: 'mastodon_oauth2',
      name: 'Mastodon OAuth2',
      type: 'oAuth2',
      fields: [
        { id: 'instance_url', displayName: 'Instance URL', name: 'instanceUrl', type: 'string', required: true },
        { id: 'access_token', displayName: 'Access Token', name: 'accessToken', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'status',
      name: 'Status',
      value: 'status',
      description: 'Post statuses',
      operations: [
        {
          id: 'create_status',
          name: 'Create Status',
          value: 'create_status',
          description: 'Post a new status (toot)',
          action: 'Create status',
          fields: [
            {
              id: 'instance_url',
              name: 'instanceUrl',
              displayName: 'Instance URL',
              type: 'string',
              required: true,
              description: 'Mastodon instance URL (e.g., https://mastodon.social)',
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status Text',
              type: 'text',
              required: true,
              typeOptions: { rows: 4 },
            },
          ],
          optionalFields: [
            {
              id: 'visibility',
              name: 'visibility',
              displayName: 'Visibility',
              type: 'options',
              default: 'public',
              options: [
                { name: 'Public', value: 'public' },
                { name: 'Unlisted', value: 'unlisted' },
                { name: 'Private', value: 'private' },
                { name: 'Direct', value: 'direct' },
              ],
            },
            {
              id: 'sensitive',
              name: 'sensitive',
              displayName: 'Sensitive Content',
              type: 'boolean',
              default: false,
            },
            {
              id: 'spoiler_text',
              name: 'spoilerText',
              displayName: 'Content Warning',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};
