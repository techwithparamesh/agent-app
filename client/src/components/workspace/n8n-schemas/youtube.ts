/**
 * YouTube n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const youtubeSchema: N8nAppSchema = {
  id: 'youtube',
  name: 'YouTube',
  description: 'YouTube video platform',
  version: '1.0.0',
  color: '#FF0000',
  icon: 'youtube',
  group: ['social', 'video'],
  
  credentials: [
    {
      name: 'youtubeOAuth2',
      displayName: 'YouTube OAuth2',
      required: true,
      type: 'oauth2',
      properties: [
        { name: 'accessToken', displayName: 'Access Token', type: 'string', required: true, typeOptions: { password: true } },
      ],
    },
    {
      name: 'youtubeApi',
      displayName: 'YouTube API Key',
      required: true,
      type: 'apiKey',
      properties: [
        { name: 'apiKey', displayName: 'API Key', type: 'string', required: true, typeOptions: { password: true } },
      ],
    },
  ],
  
  resources: [
    {
      id: 'video',
      name: 'Video',
      value: 'video',
      description: 'Video operations',
      operations: [
        {
          id: 'upload', name: 'Upload Video', value: 'upload', description: 'Upload a video', action: 'Upload video',
          fields: [
            { id: 'title', name: 'title', displayName: 'Title', type: 'string', required: true },
            { id: 'file', name: 'file', displayName: 'Video File', type: 'string', required: true },
          ],
          optionalFields: [
            { id: 'description', name: 'description', displayName: 'Description', type: 'string', required: false, typeOptions: { rows: 4 } },
            { id: 'tags', name: 'tags', displayName: 'Tags', type: 'string', required: false, description: 'Comma-separated' },
            { id: 'categoryId', name: 'categoryId', displayName: 'Category ID', type: 'string', required: false },
            { id: 'privacyStatus', name: 'privacyStatus', displayName: 'Privacy', type: 'options', required: false, options: [{ name: 'Public', value: 'public' }, { name: 'Unlisted', value: 'unlisted' }, { name: 'Private', value: 'private' }] },
            { id: 'madeForKids', name: 'madeForKids', displayName: 'Made for Kids', type: 'boolean', required: false, default: false },
          ],
        },
        {
          id: 'get', name: 'Get Video', value: 'get', description: 'Get video details', action: 'Get video',
          fields: [{ id: 'videoId', name: 'videoId', displayName: 'Video ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'part', name: 'part', displayName: 'Parts', type: 'multiOptions', required: false, options: [{ name: 'Snippet', value: 'snippet' }, { name: 'Statistics', value: 'statistics' }, { name: 'Content Details', value: 'contentDetails' }, { name: 'Status', value: 'status' }] },
          ],
        },
        {
          id: 'update', name: 'Update Video', value: 'update', description: 'Update video metadata', action: 'Update video',
          fields: [{ id: 'videoId', name: 'videoId', displayName: 'Video ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'title', name: 'title', displayName: 'Title', type: 'string', required: false },
            { id: 'description', name: 'description', displayName: 'Description', type: 'string', required: false },
            { id: 'tags', name: 'tags', displayName: 'Tags', type: 'string', required: false },
            { id: 'privacyStatus', name: 'privacyStatus', displayName: 'Privacy', type: 'options', required: false, options: [{ name: 'Public', value: 'public' }, { name: 'Unlisted', value: 'unlisted' }, { name: 'Private', value: 'private' }] },
          ],
        },
        {
          id: 'delete', name: 'Delete Video', value: 'delete', description: 'Delete a video', action: 'Delete video',
          fields: [{ id: 'videoId', name: 'videoId', displayName: 'Video ID', type: 'string', required: true }],
          optionalFields: [],
        },
        {
          id: 'list', name: 'List Videos', value: 'list', description: 'List videos', action: 'List videos',
          fields: [{ id: 'channelId', name: 'channelId', displayName: 'Channel ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'maxResults', name: 'maxResults', displayName: 'Max Results', type: 'number', required: false, default: 25 },
            { id: 'order', name: 'order', displayName: 'Order', type: 'options', required: false, options: [{ name: 'Date', value: 'date' }, { name: 'Rating', value: 'rating' }, { name: 'View Count', value: 'viewCount' }] },
          ],
        },
        {
          id: 'rate', name: 'Rate Video', value: 'rate', description: 'Like/dislike a video', action: 'Rate video',
          fields: [
            { id: 'videoId', name: 'videoId', displayName: 'Video ID', type: 'string', required: true },
            { id: 'rating', name: 'rating', displayName: 'Rating', type: 'options', required: true, options: [{ name: 'Like', value: 'like' }, { name: 'Dislike', value: 'dislike' }, { name: 'None', value: 'none' }] },
          ],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'channel',
      name: 'Channel',
      value: 'channel',
      description: 'Channel operations',
      operations: [
        {
          id: 'get', name: 'Get Channel', value: 'get', description: 'Get channel details', action: 'Get channel',
          fields: [{ id: 'channelId', name: 'channelId', displayName: 'Channel ID', type: 'string', required: true }],
          optionalFields: [{ id: 'part', name: 'part', displayName: 'Parts', type: 'multiOptions', required: false, options: [{ name: 'Snippet', value: 'snippet' }, { name: 'Statistics', value: 'statistics' }, { name: 'Branding Settings', value: 'brandingSettings' }] }],
        },
        {
          id: 'update', name: 'Update Channel', value: 'update', description: 'Update channel', action: 'Update channel',
          fields: [{ id: 'channelId', name: 'channelId', displayName: 'Channel ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'description', name: 'description', displayName: 'Description', type: 'string', required: false },
            { id: 'keywords', name: 'keywords', displayName: 'Keywords', type: 'string', required: false },
            { id: 'defaultLanguage', name: 'defaultLanguage', displayName: 'Default Language', type: 'string', required: false },
          ],
        },
        {
          id: 'listSubscriptions', name: 'List Subscriptions', value: 'listSubscriptions', description: 'List channel subscriptions', action: 'List subscriptions',
          fields: [{ id: 'channelId', name: 'channelId', displayName: 'Channel ID', type: 'string', required: true }],
          optionalFields: [{ id: 'maxResults', name: 'maxResults', displayName: 'Max Results', type: 'number', required: false, default: 25 }],
        },
      ],
    },
    {
      id: 'playlist',
      name: 'Playlist',
      value: 'playlist',
      description: 'Playlist operations',
      operations: [
        {
          id: 'create', name: 'Create Playlist', value: 'create', description: 'Create a playlist', action: 'Create playlist',
          fields: [{ id: 'title', name: 'title', displayName: 'Title', type: 'string', required: true }],
          optionalFields: [
            { id: 'description', name: 'description', displayName: 'Description', type: 'string', required: false },
            { id: 'privacyStatus', name: 'privacyStatus', displayName: 'Privacy', type: 'options', required: false, options: [{ name: 'Public', value: 'public' }, { name: 'Unlisted', value: 'unlisted' }, { name: 'Private', value: 'private' }] },
          ],
        },
        {
          id: 'get', name: 'Get Playlist', value: 'get', description: 'Get playlist', action: 'Get playlist',
          fields: [{ id: 'playlistId', name: 'playlistId', displayName: 'Playlist ID', type: 'string', required: true }],
          optionalFields: [],
        },
        {
          id: 'update', name: 'Update Playlist', value: 'update', description: 'Update playlist', action: 'Update playlist',
          fields: [{ id: 'playlistId', name: 'playlistId', displayName: 'Playlist ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'title', name: 'title', displayName: 'Title', type: 'string', required: false },
            { id: 'description', name: 'description', displayName: 'Description', type: 'string', required: false },
          ],
        },
        {
          id: 'delete', name: 'Delete Playlist', value: 'delete', description: 'Delete playlist', action: 'Delete playlist',
          fields: [{ id: 'playlistId', name: 'playlistId', displayName: 'Playlist ID', type: 'string', required: true }],
          optionalFields: [],
        },
        {
          id: 'addItem', name: 'Add to Playlist', value: 'addItem', description: 'Add video to playlist', action: 'Add to playlist',
          fields: [
            { id: 'playlistId', name: 'playlistId', displayName: 'Playlist ID', type: 'string', required: true },
            { id: 'videoId', name: 'videoId', displayName: 'Video ID', type: 'string', required: true },
          ],
          optionalFields: [{ id: 'position', name: 'position', displayName: 'Position', type: 'number', required: false }],
        },
        {
          id: 'removeItem', name: 'Remove from Playlist', value: 'removeItem', description: 'Remove video from playlist', action: 'Remove from playlist',
          fields: [{ id: 'playlistItemId', name: 'playlistItemId', displayName: 'Playlist Item ID', type: 'string', required: true }],
          optionalFields: [],
        },
        {
          id: 'listItems', name: 'List Playlist Items', value: 'listItems', description: 'List videos in playlist', action: 'List playlist items',
          fields: [{ id: 'playlistId', name: 'playlistId', displayName: 'Playlist ID', type: 'string', required: true }],
          optionalFields: [{ id: 'maxResults', name: 'maxResults', displayName: 'Max Results', type: 'number', required: false, default: 25 }],
        },
      ],
    },
    {
      id: 'comment',
      name: 'Comment',
      value: 'comment',
      description: 'Comment operations',
      operations: [
        {
          id: 'create', name: 'Create Comment', value: 'create', description: 'Post a comment', action: 'Create comment',
          fields: [
            { id: 'videoId', name: 'videoId', displayName: 'Video ID', type: 'string', required: true },
            { id: 'text', name: 'text', displayName: 'Comment Text', type: 'string', required: true },
          ],
          optionalFields: [],
        },
        {
          id: 'reply', name: 'Reply to Comment', value: 'reply', description: 'Reply to a comment', action: 'Reply to comment',
          fields: [
            { id: 'parentId', name: 'parentId', displayName: 'Parent Comment ID', type: 'string', required: true },
            { id: 'text', name: 'text', displayName: 'Reply Text', type: 'string', required: true },
          ],
          optionalFields: [],
        },
        {
          id: 'list', name: 'List Comments', value: 'list', description: 'List comments on video', action: 'List comments',
          fields: [{ id: 'videoId', name: 'videoId', displayName: 'Video ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'maxResults', name: 'maxResults', displayName: 'Max Results', type: 'number', required: false, default: 20 },
            { id: 'order', name: 'order', displayName: 'Order', type: 'options', required: false, options: [{ name: 'Time', value: 'time' }, { name: 'Relevance', value: 'relevance' }] },
          ],
        },
        {
          id: 'delete', name: 'Delete Comment', value: 'delete', description: 'Delete a comment', action: 'Delete comment',
          fields: [{ id: 'commentId', name: 'commentId', displayName: 'Comment ID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'search',
      name: 'Search',
      value: 'search',
      description: 'Search operations',
      operations: [
        {
          id: 'search', name: 'Search', value: 'search', description: 'Search YouTube', action: 'Search',
          fields: [{ id: 'q', name: 'q', displayName: 'Query', type: 'string', required: true }],
          optionalFields: [
            { id: 'type', name: 'type', displayName: 'Type', type: 'options', required: false, options: [{ name: 'Video', value: 'video' }, { name: 'Channel', value: 'channel' }, { name: 'Playlist', value: 'playlist' }] },
            { id: 'maxResults', name: 'maxResults', displayName: 'Max Results', type: 'number', required: false, default: 25 },
            { id: 'order', name: 'order', displayName: 'Order', type: 'options', required: false, options: [{ name: 'Relevance', value: 'relevance' }, { name: 'Date', value: 'date' }, { name: 'View Count', value: 'viewCount' }, { name: 'Rating', value: 'rating' }] },
            { id: 'publishedAfter', name: 'publishedAfter', displayName: 'Published After', type: 'dateTime', required: false },
            { id: 'publishedBefore', name: 'publishedBefore', displayName: 'Published Before', type: 'dateTime', required: false },
            { id: 'regionCode', name: 'regionCode', displayName: 'Region Code', type: 'string', required: false },
          ],
        },
      ],
    },
    {
      id: 'subscription',
      name: 'Subscription',
      value: 'subscription',
      description: 'Subscription operations',
      operations: [
        {
          id: 'subscribe', name: 'Subscribe', value: 'subscribe', description: 'Subscribe to channel', action: 'Subscribe',
          fields: [{ id: 'channelId', name: 'channelId', displayName: 'Channel ID', type: 'string', required: true }],
          optionalFields: [],
        },
        {
          id: 'unsubscribe', name: 'Unsubscribe', value: 'unsubscribe', description: 'Unsubscribe from channel', action: 'Unsubscribe',
          fields: [{ id: 'subscriptionId', name: 'subscriptionId', displayName: 'Subscription ID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
  ],
};
