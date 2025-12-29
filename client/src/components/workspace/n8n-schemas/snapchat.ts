/**
 * Snapchat Integration Schema
 * Resources: Post
 */

import type { N8nAppSchema } from './types';

export const snapchatSchema: N8nAppSchema = {
  id: 'snapchat',
  name: 'Snapchat',
  description: 'Snapchat marketing API',
  icon: 'camera',
  color: '#FFFC00',
  version: '1.0',
  group: ['social'],
  credentials: [
    {
      id: 'snapchat_oauth2',
      name: 'Snapchat OAuth2',
      type: 'oAuth2',
      fields: [
        { id: 'client_id', displayName: 'Client ID', name: 'clientId', type: 'string', required: true },
        { id: 'client_secret', displayName: 'Client Secret', name: 'clientSecret', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'post',
      name: 'Post',
      value: 'post',
      description: 'Create posts',
      operations: [
        {
          id: 'create_post',
          name: 'Create Post',
          value: 'create_post',
          description: 'Create a new post',
          action: 'Create post',
          fields: [
            {
              id: 'ad_account_id',
              name: 'adAccountId',
              displayName: 'Ad Account ID',
              type: 'string',
              required: true,
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'Post Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'media_url',
              name: 'mediaUrl',
              displayName: 'Media URL',
              type: 'string',
            },
            {
              id: 'headline',
              name: 'headline',
              displayName: 'Headline',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};
