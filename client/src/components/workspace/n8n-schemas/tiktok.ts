/**
 * TikTok n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const tiktokSchema: N8nAppSchema = {
  id: 'tiktok',
  name: 'TikTok',
  description: 'TikTok social video platform',
  version: '1.0.0',
  color: '#000000',
  icon: 'tiktok',
  group: ['social', 'video'],
  
  credentials: [
    {
      name: 'tiktokOAuth2',
      displayName: 'TikTok OAuth2',
      required: true,
      type: 'oauth2',
      properties: [
        { name: 'accessToken', displayName: 'Access Token', type: 'string', required: true, typeOptions: { password: true } },
        { name: 'refreshToken', displayName: 'Refresh Token', type: 'string', required: false, typeOptions: { password: true } },
      ],
    },
  ],
  
  resources: [
    {
      id: 'user',
      name: 'User',
      value: 'user',
      description: 'User operations',
      operations: [
        {
          id: 'getInfo', name: 'Get User Info', value: 'getInfo', description: 'Get user profile', action: 'Get user info',
          fields: [],
          optionalFields: [
            { id: 'fields', name: 'fields', displayName: 'Fields', type: 'multiOptions', required: false, options: [{ name: 'Open ID', value: 'open_id' }, { name: 'Display Name', value: 'display_name' }, { name: 'Avatar URL', value: 'avatar_url' }, { name: 'Follower Count', value: 'follower_count' }, { name: 'Following Count', value: 'following_count' }, { name: 'Likes Count', value: 'likes_count' }, { name: 'Video Count', value: 'video_count' }, { name: 'Bio Description', value: 'bio_description' }] },
          ],
        },
      ],
    },
    {
      id: 'video',
      name: 'Video',
      value: 'video',
      description: 'Video operations',
      operations: [
        {
          id: 'list', name: 'List Videos', value: 'list', description: 'List user videos', action: 'List videos',
          fields: [],
          optionalFields: [
            { id: 'maxCount', name: 'maxCount', displayName: 'Max Count', type: 'number', required: false, default: 20 },
            { id: 'fields', name: 'fields', displayName: 'Fields', type: 'multiOptions', required: false, options: [{ name: 'ID', value: 'id' }, { name: 'Title', value: 'title' }, { name: 'Description', value: 'video_description' }, { name: 'Duration', value: 'duration' }, { name: 'Cover Image', value: 'cover_image_url' }, { name: 'Embed Link', value: 'embed_link' }, { name: 'Create Time', value: 'create_time' }, { name: 'Like Count', value: 'like_count' }, { name: 'Comment Count', value: 'comment_count' }, { name: 'Share Count', value: 'share_count' }, { name: 'View Count', value: 'view_count' }] },
          ],
        },
        {
          id: 'query', name: 'Query Videos', value: 'query', description: 'Query specific videos', action: 'Query videos',
          fields: [{ id: 'videoIds', name: 'videoIds', displayName: 'Video IDs', type: 'string', required: true, description: 'Comma-separated video IDs' }],
          optionalFields: [
            { id: 'fields', name: 'fields', displayName: 'Fields', type: 'multiOptions', required: false, options: [{ name: 'ID', value: 'id' }, { name: 'Title', value: 'title' }, { name: 'Description', value: 'video_description' }, { name: 'Duration', value: 'duration' }, { name: 'Like Count', value: 'like_count' }, { name: 'View Count', value: 'view_count' }] },
          ],
        },
        {
          id: 'initUpload', name: 'Initialize Upload', value: 'initUpload', description: 'Initialize video upload', action: 'Initialize upload',
          fields: [
            { id: 'postInfo', name: 'postInfo', displayName: 'Post Info', type: 'json', required: true, description: 'Video post information' },
            { id: 'sourceInfo', name: 'sourceInfo', displayName: 'Source Info', type: 'json', required: true, description: 'Video source information' },
          ],
          optionalFields: [],
        },
        {
          id: 'publishStatus', name: 'Get Publish Status', value: 'publishStatus', description: 'Get video publish status', action: 'Get publish status',
          fields: [{ id: 'publishId', name: 'publishId', displayName: 'Publish ID', type: 'string', required: true }],
          optionalFields: [],
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
          id: 'list', name: 'List Comments', value: 'list', description: 'List video comments', action: 'List comments',
          fields: [{ id: 'videoId', name: 'videoId', displayName: 'Video ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'maxCount', name: 'maxCount', displayName: 'Max Count', type: 'number', required: false, default: 50 },
            { id: 'sortField', name: 'sortField', displayName: 'Sort By', type: 'options', required: false, options: [{ name: 'Create Time', value: 'create_time' }, { name: 'Like Count', value: 'like_count' }] },
            { id: 'sortOrder', name: 'sortOrder', displayName: 'Sort Order', type: 'options', required: false, options: [{ name: 'Ascending', value: 'asc' }, { name: 'Descending', value: 'desc' }] },
          ],
        },
        {
          id: 'listReplies', name: 'List Replies', value: 'listReplies', description: 'List comment replies', action: 'List replies',
          fields: [
            { id: 'videoId', name: 'videoId', displayName: 'Video ID', type: 'string', required: true },
            { id: 'commentId', name: 'commentId', displayName: 'Comment ID', type: 'string', required: true },
          ],
          optionalFields: [{ id: 'maxCount', name: 'maxCount', displayName: 'Max Count', type: 'number', required: false, default: 50 }],
        },
      ],
    },
    {
      id: 'research',
      name: 'Research',
      value: 'research',
      description: 'Research API operations',
      operations: [
        {
          id: 'queryVideos', name: 'Query Videos', value: 'queryVideos', description: 'Research API video query', action: 'Query videos',
          fields: [{ id: 'query', name: 'query', displayName: 'Query (JSON)', type: 'json', required: true }],
          optionalFields: [
            { id: 'maxCount', name: 'maxCount', displayName: 'Max Count', type: 'number', required: false, default: 100 },
            { id: 'startDate', name: 'startDate', displayName: 'Start Date', type: 'dateTime', required: false },
            { id: 'endDate', name: 'endDate', displayName: 'End Date', type: 'dateTime', required: false },
          ],
        },
        {
          id: 'queryUsers', name: 'Query Users', value: 'queryUsers', description: 'Research API user query', action: 'Query users',
          fields: [{ id: 'query', name: 'query', displayName: 'Query (JSON)', type: 'json', required: true }],
          optionalFields: [{ id: 'maxCount', name: 'maxCount', displayName: 'Max Count', type: 'number', required: false, default: 100 }],
        },
        {
          id: 'queryComments', name: 'Query Comments', value: 'queryComments', description: 'Research API comment query', action: 'Query comments',
          fields: [{ id: 'videoIds', name: 'videoIds', displayName: 'Video IDs', type: 'string', required: true }],
          optionalFields: [{ id: 'maxCount', name: 'maxCount', displayName: 'Max Count', type: 'number', required: false, default: 100 }],
        },
      ],
    },
  ],
};
