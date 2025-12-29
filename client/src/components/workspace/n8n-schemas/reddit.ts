/**
 * Reddit Integration Schema
 * Resources: Post
 */

import type { N8nAppSchema } from './types';

export const redditSchema: N8nAppSchema = {
  id: 'reddit',
  name: 'Reddit',
  description: 'Reddit social platform',
  icon: 'message-square',
  color: '#FF4500',
  version: '1.0',
  group: ['social'],
  credentials: [
    {
      id: 'reddit_oauth2',
      name: 'Reddit OAuth2',
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
              id: 'subreddit',
              name: 'subreddit',
              displayName: 'Subreddit',
              type: 'string',
              required: true,
              description: 'Subreddit name (without r/)',
            },
            {
              id: 'title',
              name: 'title',
              displayName: 'Title',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'kind',
              name: 'kind',
              displayName: 'Post Type',
              type: 'options',
              default: 'self',
              options: [
                { name: 'Text Post', value: 'self' },
                { name: 'Link Post', value: 'link' },
              ],
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Text',
              type: 'text',
              typeOptions: { rows: 5 },
              description: 'Post body (for text posts)',
            },
            {
              id: 'url',
              name: 'url',
              displayName: 'URL',
              type: 'string',
              description: 'Link URL (for link posts)',
            },
            {
              id: 'nsfw',
              name: 'nsfw',
              displayName: 'NSFW',
              type: 'boolean',
              default: false,
            },
            {
              id: 'spoiler',
              name: 'spoiler',
              displayName: 'Spoiler',
              type: 'boolean',
              default: false,
            },
          ],
        },
      ],
    },
  ],
};
