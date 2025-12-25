/**
 * Instagram n8n-style Schema
 * 
 * Comprehensive Instagram Graph API operations
 */

import { N8nAppSchema } from './types';

export const instagramSchema: N8nAppSchema = {
  id: 'instagram',
  name: 'Instagram',
  description: 'Instagram social media platform',
  version: '1.0.0',
  color: '#E4405F',
  icon: 'instagram',
  group: ['social', 'marketing'],
  
  credentials: [
    {
      name: 'instagramOAuth2',
      displayName: 'Instagram OAuth2',
      required: true,
      type: 'oauth2',
      properties: [
        {
          name: 'accessToken',
          displayName: 'Access Token',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
      ],
    },
    {
      name: 'instagramBasicDisplay',
      displayName: 'Instagram Basic Display',
      required: true,
      type: 'oauth2',
      properties: [
        {
          name: 'accessToken',
          displayName: 'Access Token',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
        {
          name: 'appId',
          displayName: 'App ID',
          type: 'string',
          required: true,
        },
        {
          name: 'appSecret',
          displayName: 'App Secret',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // USER RESOURCE
    // ============================================
    {
      id: 'user',
      name: 'User',
      value: 'user',
      description: 'User profile operations',
      operations: [
        {
          id: 'get_user',
          name: 'Get User',
          value: 'get',
          description: 'Get user profile information',
          action: 'Get user',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
              default: 'me',
              description: 'User ID or "me" for authenticated user',
            },
          ],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Username', value: 'username' },
                { name: 'Name', value: 'name' },
                { name: 'Biography', value: 'biography' },
                { name: 'Website', value: 'website' },
                { name: 'Profile Picture URL', value: 'profile_picture_url' },
                { name: 'Followers Count', value: 'followers_count' },
                { name: 'Follows Count', value: 'follows_count' },
                { name: 'Media Count', value: 'media_count' },
                { name: 'Account Type', value: 'account_type' },
              ],
            },
          ],
        },
        {
          id: 'get_business_discovery',
          name: 'Get Business Discovery',
          value: 'getBusinessDiscovery',
          description: 'Get another business/creator account info',
          action: 'Get business discovery',
          fields: [
            {
              id: 'username',
              name: 'username',
              displayName: 'Username',
              type: 'string',
              required: true,
              description: 'Username to look up (without @)',
            },
          ],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Username', value: 'username' },
                { name: 'Name', value: 'name' },
                { name: 'Biography', value: 'biography' },
                { name: 'Website', value: 'website' },
                { name: 'Profile Picture URL', value: 'profile_picture_url' },
                { name: 'Followers Count', value: 'followers_count' },
                { name: 'Media Count', value: 'media_count' },
              ],
            },
            {
              id: 'include_media',
              name: 'includeMedia',
              displayName: 'Include Media',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'media_limit',
              name: 'mediaLimit',
              displayName: 'Media Limit',
              type: 'number',
              required: false,
              default: 10,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // MEDIA RESOURCE
    // ============================================
    {
      id: 'media',
      name: 'Media',
      value: 'media',
      description: 'Media post operations',
      operations: [
        {
          id: 'get_media',
          name: 'Get Media',
          value: 'get',
          description: 'Get media object by ID',
          action: 'Get media',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Caption', value: 'caption' },
                { name: 'Media Type', value: 'media_type' },
                { name: 'Media URL', value: 'media_url' },
                { name: 'Permalink', value: 'permalink' },
                { name: 'Thumbnail URL', value: 'thumbnail_url' },
                { name: 'Timestamp', value: 'timestamp' },
                { name: 'Username', value: 'username' },
                { name: 'Like Count', value: 'like_count' },
                { name: 'Comments Count', value: 'comments_count' },
                { name: 'Is Comment Enabled', value: 'is_comment_enabled' },
              ],
            },
          ],
        },
        {
          id: 'get_user_media',
          name: 'Get User Media',
          value: 'getMany',
          description: 'Get media posts from user',
          action: 'Get user media',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
              default: 'me',
            },
          ],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 25,
            },
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Caption', value: 'caption' },
                { name: 'Media Type', value: 'media_type' },
                { name: 'Media URL', value: 'media_url' },
                { name: 'Permalink', value: 'permalink' },
                { name: 'Timestamp', value: 'timestamp' },
                { name: 'Like Count', value: 'like_count' },
                { name: 'Comments Count', value: 'comments_count' },
              ],
            },
          ],
        },
        {
          id: 'create_photo_post',
          name: 'Create Photo Post',
          value: 'createPhoto',
          description: 'Create a photo post',
          action: 'Create photo post',
          fields: [
            {
              id: 'image_url',
              name: 'imageUrl',
              displayName: 'Image URL',
              type: 'string',
              required: true,
              description: 'Public URL of the image',
            },
          ],
          optionalFields: [
            {
              id: 'caption',
              name: 'caption',
              displayName: 'Caption',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'location_id',
              name: 'locationId',
              displayName: 'Location ID',
              type: 'string',
              required: false,
            },
            {
              id: 'user_tags',
              name: 'userTags',
              displayName: 'User Tags (JSON)',
              type: 'json',
              required: false,
              description: 'Array of {username, x, y} objects',
            },
          ],
        },
        {
          id: 'create_video_post',
          name: 'Create Video Post',
          value: 'createVideo',
          description: 'Create a video post (Reel)',
          action: 'Create video post',
          fields: [
            {
              id: 'video_url',
              name: 'videoUrl',
              displayName: 'Video URL',
              type: 'string',
              required: true,
              description: 'Public URL of the video',
            },
          ],
          optionalFields: [
            {
              id: 'caption',
              name: 'caption',
              displayName: 'Caption',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'cover_url',
              name: 'coverUrl',
              displayName: 'Cover Image URL',
              type: 'string',
              required: false,
            },
            {
              id: 'thumb_offset',
              name: 'thumbOffset',
              displayName: 'Thumbnail Offset (ms)',
              type: 'number',
              required: false,
            },
            {
              id: 'location_id',
              name: 'locationId',
              displayName: 'Location ID',
              type: 'string',
              required: false,
            },
            {
              id: 'share_to_feed',
              name: 'shareToFeed',
              displayName: 'Share to Feed',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'create_carousel_post',
          name: 'Create Carousel Post',
          value: 'createCarousel',
          description: 'Create a carousel (multiple images/videos)',
          action: 'Create carousel post',
          fields: [
            {
              id: 'children',
              name: 'children',
              displayName: 'Children (JSON)',
              type: 'json',
              required: true,
              description: 'Array of media container IDs',
            },
          ],
          optionalFields: [
            {
              id: 'caption',
              name: 'caption',
              displayName: 'Caption',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'location_id',
              name: 'locationId',
              displayName: 'Location ID',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'create_story',
          name: 'Create Story',
          value: 'createStory',
          description: 'Create a story',
          action: 'Create story',
          fields: [
            {
              id: 'media_type',
              name: 'mediaType',
              displayName: 'Media Type',
              type: 'options',
              required: true,
              options: [
                { name: 'Image', value: 'IMAGE' },
                { name: 'Video', value: 'VIDEO' },
              ],
            },
            {
              id: 'media_url',
              name: 'mediaUrl',
              displayName: 'Media URL',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_stories',
          name: 'Get Stories',
          value: 'getStories',
          description: 'Get user stories',
          action: 'Get stories',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'publish_container',
          name: 'Publish Container',
          value: 'publish',
          description: 'Publish a media container',
          action: 'Publish container',
          fields: [
            {
              id: 'creation_id',
              name: 'creationId',
              displayName: 'Creation ID',
              type: 'string',
              required: true,
              description: 'Container ID from create operation',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_container_status',
          name: 'Get Container Status',
          value: 'getContainerStatus',
          description: 'Get status of media container',
          action: 'Get container status',
          fields: [
            {
              id: 'container_id',
              name: 'containerId',
              displayName: 'Container ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // COMMENT RESOURCE
    // ============================================
    {
      id: 'comment',
      name: 'Comment',
      value: 'comment',
      description: 'Comment operations',
      operations: [
        {
          id: 'get_comments',
          name: 'Get Comments',
          value: 'getMany',
          description: 'Get comments on a media',
          action: 'Get comments',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 50,
            },
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Text', value: 'text' },
                { name: 'Timestamp', value: 'timestamp' },
                { name: 'Username', value: 'username' },
                { name: 'Like Count', value: 'like_count' },
                { name: 'Replies', value: 'replies' },
              ],
            },
          ],
        },
        {
          id: 'get_comment',
          name: 'Get Comment',
          value: 'get',
          description: 'Get a specific comment',
          action: 'Get comment',
          fields: [
            {
              id: 'comment_id',
              name: 'commentId',
              displayName: 'Comment ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Text', value: 'text' },
                { name: 'Timestamp', value: 'timestamp' },
                { name: 'Username', value: 'username' },
                { name: 'Like Count', value: 'like_count' },
              ],
            },
          ],
        },
        {
          id: 'create_comment',
          name: 'Create Comment',
          value: 'create',
          description: 'Create a comment on media',
          action: 'Create comment',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message',
              name: 'message',
              displayName: 'Message',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'reply_to_comment',
          name: 'Reply to Comment',
          value: 'reply',
          description: 'Reply to a comment',
          action: 'Reply to comment',
          fields: [
            {
              id: 'comment_id',
              name: 'commentId',
              displayName: 'Comment ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message',
              name: 'message',
              displayName: 'Message',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_comment',
          name: 'Delete Comment',
          value: 'delete',
          description: 'Delete a comment',
          action: 'Delete comment',
          fields: [
            {
              id: 'comment_id',
              name: 'commentId',
              displayName: 'Comment ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'hide_comment',
          name: 'Hide Comment',
          value: 'hide',
          description: 'Hide a comment',
          action: 'Hide comment',
          fields: [
            {
              id: 'comment_id',
              name: 'commentId',
              displayName: 'Comment ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'unhide_comment',
          name: 'Unhide Comment',
          value: 'unhide',
          description: 'Unhide a comment',
          action: 'Unhide comment',
          fields: [
            {
              id: 'comment_id',
              name: 'commentId',
              displayName: 'Comment ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'enable_comments',
          name: 'Enable Comments',
          value: 'enable',
          description: 'Enable comments on media',
          action: 'Enable comments',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'disable_comments',
          name: 'Disable Comments',
          value: 'disable',
          description: 'Disable comments on media',
          action: 'Disable comments',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // INSIGHTS RESOURCE
    // ============================================
    {
      id: 'insights',
      name: 'Insights',
      value: 'insights',
      description: 'Analytics and insights',
      operations: [
        {
          id: 'get_user_insights',
          name: 'Get User Insights',
          value: 'getUserInsights',
          description: 'Get account insights',
          action: 'Get user insights',
          fields: [
            {
              id: 'metric',
              name: 'metric',
              displayName: 'Metrics',
              type: 'multiOptions',
              required: true,
              options: [
                { name: 'Impressions', value: 'impressions' },
                { name: 'Reach', value: 'reach' },
                { name: 'Profile Views', value: 'profile_views' },
                { name: 'Follower Count', value: 'follower_count' },
                { name: 'Email Contacts', value: 'email_contacts' },
                { name: 'Phone Call Clicks', value: 'phone_call_clicks' },
                { name: 'Text Message Clicks', value: 'text_message_clicks' },
                { name: 'Get Directions Clicks', value: 'get_directions_clicks' },
                { name: 'Website Clicks', value: 'website_clicks' },
              ],
            },
            {
              id: 'period',
              name: 'period',
              displayName: 'Period',
              type: 'options',
              required: true,
              options: [
                { name: 'Day', value: 'day' },
                { name: 'Week', value: 'week' },
                { name: 'Days 28', value: 'days_28' },
                { name: 'Lifetime', value: 'lifetime' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'since',
              name: 'since',
              displayName: 'Since (Unix Timestamp)',
              type: 'number',
              required: false,
            },
            {
              id: 'until',
              name: 'until',
              displayName: 'Until (Unix Timestamp)',
              type: 'number',
              required: false,
            },
          ],
        },
        {
          id: 'get_media_insights',
          name: 'Get Media Insights',
          value: 'getMediaInsights',
          description: 'Get insights for a media post',
          action: 'Get media insights',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
            {
              id: 'metric',
              name: 'metric',
              displayName: 'Metrics',
              type: 'multiOptions',
              required: true,
              options: [
                { name: 'Engagement', value: 'engagement' },
                { name: 'Impressions', value: 'impressions' },
                { name: 'Reach', value: 'reach' },
                { name: 'Saved', value: 'saved' },
                { name: 'Video Views', value: 'video_views' },
                { name: 'Likes', value: 'likes' },
                { name: 'Comments', value: 'comments' },
                { name: 'Shares', value: 'shares' },
                { name: 'Plays', value: 'plays' },
                { name: 'Total Interactions', value: 'total_interactions' },
              ],
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_story_insights',
          name: 'Get Story Insights',
          value: 'getStoryInsights',
          description: 'Get insights for a story',
          action: 'Get story insights',
          fields: [
            {
              id: 'story_id',
              name: 'storyId',
              displayName: 'Story ID',
              type: 'string',
              required: true,
            },
            {
              id: 'metric',
              name: 'metric',
              displayName: 'Metrics',
              type: 'multiOptions',
              required: true,
              options: [
                { name: 'Exits', value: 'exits' },
                { name: 'Impressions', value: 'impressions' },
                { name: 'Reach', value: 'reach' },
                { name: 'Replies', value: 'replies' },
                { name: 'Taps Forward', value: 'taps_forward' },
                { name: 'Taps Back', value: 'taps_back' },
              ],
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_audience_demographics',
          name: 'Get Audience Demographics',
          value: 'getAudienceDemographics',
          description: 'Get audience demographics',
          action: 'Get audience demographics',
          fields: [
            {
              id: 'metric',
              name: 'metric',
              displayName: 'Metrics',
              type: 'multiOptions',
              required: true,
              options: [
                { name: 'Audience City', value: 'audience_city' },
                { name: 'Audience Country', value: 'audience_country' },
                { name: 'Audience Gender Age', value: 'audience_gender_age' },
                { name: 'Audience Locale', value: 'audience_locale' },
              ],
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_online_followers',
          name: 'Get Online Followers',
          value: 'getOnlineFollowers',
          description: 'Get when followers are online',
          action: 'Get online followers',
          fields: [],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // HASHTAG RESOURCE
    // ============================================
    {
      id: 'hashtag',
      name: 'Hashtag',
      value: 'hashtag',
      description: 'Hashtag search operations',
      operations: [
        {
          id: 'search_hashtag',
          name: 'Search Hashtag',
          value: 'search',
          description: 'Search for hashtag ID',
          action: 'Search hashtag',
          fields: [
            {
              id: 'q',
              name: 'q',
              displayName: 'Hashtag (without #)',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_recent_media',
          name: 'Get Recent Media',
          value: 'getRecentMedia',
          description: 'Get recent media for hashtag',
          action: 'Get recent media',
          fields: [
            {
              id: 'hashtag_id',
              name: 'hashtagId',
              displayName: 'Hashtag ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Caption', value: 'caption' },
                { name: 'Media Type', value: 'media_type' },
                { name: 'Media URL', value: 'media_url' },
                { name: 'Permalink', value: 'permalink' },
                { name: 'Timestamp', value: 'timestamp' },
                { name: 'Like Count', value: 'like_count' },
                { name: 'Comments Count', value: 'comments_count' },
              ],
            },
          ],
        },
        {
          id: 'get_top_media',
          name: 'Get Top Media',
          value: 'getTopMedia',
          description: 'Get top media for hashtag',
          action: 'Get top media',
          fields: [
            {
              id: 'hashtag_id',
              name: 'hashtagId',
              displayName: 'Hashtag ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Caption', value: 'caption' },
                { name: 'Media Type', value: 'media_type' },
                { name: 'Permalink', value: 'permalink' },
                { name: 'Timestamp', value: 'timestamp' },
              ],
            },
          ],
        },
      ],
    },
    
    // ============================================
    // MENTION RESOURCE
    // ============================================
    {
      id: 'mention',
      name: 'Mention',
      value: 'mention',
      description: 'Mention operations',
      operations: [
        {
          id: 'get_mentions',
          name: 'Get Mentions',
          value: 'getMany',
          description: 'Get media where user is mentioned',
          action: 'Get mentions',
          fields: [],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Caption', value: 'caption' },
                { name: 'Media Type', value: 'media_type' },
                { name: 'Media URL', value: 'media_url' },
                { name: 'Permalink', value: 'permalink' },
                { name: 'Timestamp', value: 'timestamp' },
              ],
            },
          ],
        },
        {
          id: 'get_tagged_media',
          name: 'Get Tagged Media',
          value: 'getTagged',
          description: 'Get media where user is tagged',
          action: 'Get tagged media',
          fields: [],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Caption', value: 'caption' },
                { name: 'Media Type', value: 'media_type' },
                { name: 'Permalink', value: 'permalink' },
                { name: 'Timestamp', value: 'timestamp' },
              ],
            },
          ],
        },
      ],
    },
    
    // ============================================
    // CONTENT PUBLISHING LIMIT RESOURCE
    // ============================================
    {
      id: 'contentPublishingLimit',
      name: 'Content Publishing Limit',
      value: 'contentPublishingLimit',
      description: 'Check publishing limits',
      operations: [
        {
          id: 'get_limit',
          name: 'Get Limit',
          value: 'get',
          description: 'Get content publishing limit status',
          action: 'Get limit',
          fields: [],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // LOCATION RESOURCE
    // ============================================
    {
      id: 'location',
      name: 'Location',
      value: 'location',
      description: 'Location search operations',
      operations: [
        {
          id: 'search_location',
          name: 'Search Location',
          value: 'search',
          description: 'Search for location pages',
          action: 'Search location',
          fields: [
            {
              id: 'q',
              name: 'q',
              displayName: 'Query',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // PRODUCT TAGGING RESOURCE
    // ============================================
    {
      id: 'productTagging',
      name: 'Product Tagging',
      value: 'productTagging',
      description: 'Product tagging operations',
      operations: [
        {
          id: 'get_product_tags',
          name: 'Get Product Tags',
          value: 'get',
          description: 'Get product tags on media',
          action: 'Get product tags',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'create_product_tags',
          name: 'Create Product Tags',
          value: 'create',
          description: 'Add product tags to media',
          action: 'Create product tags',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
            {
              id: 'product_tags',
              name: 'productTags',
              displayName: 'Product Tags (JSON)',
              type: 'json',
              required: true,
              description: 'Array of product tag objects',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'update_product_tags',
          name: 'Update Product Tags',
          value: 'update',
          description: 'Update product tags on media',
          action: 'Update product tags',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
            {
              id: 'product_tags',
              name: 'productTags',
              displayName: 'Product Tags (JSON)',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_product_tags',
          name: 'Delete Product Tags',
          value: 'delete',
          description: 'Delete product tags from media',
          action: 'Delete product tags',
          fields: [
            {
              id: 'media_id',
              name: 'mediaId',
              displayName: 'Media ID',
              type: 'string',
              required: true,
            },
            {
              id: 'deleted_product_tags',
              name: 'deletedProductTags',
              displayName: 'Product Tags to Delete (JSON)',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_available_catalogs',
          name: 'Get Available Catalogs',
          value: 'getCatalogs',
          description: 'Get available product catalogs',
          action: 'Get available catalogs',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'search_product_catalog',
          name: 'Search Product Catalog',
          value: 'searchCatalog',
          description: 'Search products in catalog',
          action: 'Search product catalog',
          fields: [
            {
              id: 'catalog_id',
              name: 'catalogId',
              displayName: 'Catalog ID',
              type: 'string',
              required: true,
            },
            {
              id: 'q',
              name: 'q',
              displayName: 'Query',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
  ],
};
