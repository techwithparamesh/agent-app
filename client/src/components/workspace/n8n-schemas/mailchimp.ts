/**
 * Mailchimp n8n-style Schema
 * 
 * Comprehensive Mailchimp Marketing API operations
 */

import { N8nAppSchema } from './types';

export const mailchimpSchema: N8nAppSchema = {
  id: 'mailchimp',
  name: 'Mailchimp',
  description: 'Mailchimp email marketing and automation',
  version: '1.0.0',
  color: '#FFE01B',
  icon: 'mailchimp',
  group: ['email', 'marketing'],
  
  credentials: [
    {
      name: 'mailchimpApi',
      displayName: 'Mailchimp API Key',
      required: true,
      type: 'apiKey',
    },
  ],
  
  resources: [
    // ============================================
    // MEMBER (SUBSCRIBER) RESOURCE
    // ============================================
    {
      id: 'member',
      name: 'Member',
      value: 'member',
      description: 'Manage list members/subscribers',
      operations: [
        {
          id: 'create_member',
          name: 'Create Member',
          value: 'create',
          description: 'Add a new subscriber',
          action: 'Add a new member to a list',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'options',
              required: true,
              description: 'Select the audience/list',
              typeOptions: {
                loadOptionsMethod: 'getLists',
              },
            },
            {
              id: 'email',
              name: 'emailAddress',
              displayName: 'Email Address',
              type: 'string',
              required: true,
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: true,
              default: 'subscribed',
              options: [
                { name: 'Subscribed', value: 'subscribed' },
                { name: 'Unsubscribed', value: 'unsubscribed' },
                { name: 'Cleaned', value: 'cleaned' },
                { name: 'Pending', value: 'pending' },
                { name: 'Transactional', value: 'transactional' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'email_type',
              name: 'emailType',
              displayName: 'Email Type',
              type: 'options',
              required: false,
              default: 'html',
              options: [
                { name: 'HTML', value: 'html' },
                { name: 'Text', value: 'text' },
              ],
            },
            {
              id: 'first_name',
              name: 'firstName',
              displayName: 'First Name',
              type: 'string',
              required: false,
            },
            {
              id: 'last_name',
              name: 'lastName',
              displayName: 'Last Name',
              type: 'string',
              required: false,
            },
            {
              id: 'phone',
              name: 'phone',
              displayName: 'Phone',
              type: 'string',
              required: false,
            },
            {
              id: 'birthday',
              name: 'birthday',
              displayName: 'Birthday',
              type: 'string',
              required: false,
              placeholder: 'MM/DD',
            },
            {
              id: 'address',
              name: 'address',
              displayName: 'Address (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"addr1": "123 Main St", "city": "Atlanta", "state": "GA", "zip": "30308"}',
            },
            {
              id: 'tags',
              name: 'tags',
              displayName: 'Tags',
              type: 'string',
              required: false,
              description: 'Comma-separated tags',
            },
            {
              id: 'merge_fields',
              name: 'mergeFields',
              displayName: 'Merge Fields (JSON)',
              type: 'json',
              required: false,
              description: 'Custom merge fields',
            },
            {
              id: 'vip',
              name: 'vip',
              displayName: 'VIP Status',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'language',
              name: 'language',
              displayName: 'Language',
              type: 'string',
              required: false,
              placeholder: 'en',
            },
            {
              id: 'skip_merge_validation',
              name: 'skipMergeValidation',
              displayName: 'Skip Merge Validation',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'get_member',
          name: 'Get Member',
          value: 'get',
          description: 'Get a member by email',
          action: 'Retrieve a member\'s information',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
            {
              id: 'email',
              name: 'emailAddress',
              displayName: 'Email Address',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_members',
          name: 'Get Members',
          value: 'getMany',
          description: 'Get all members in a list',
          action: 'List all members in an audience',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              options: [
                { name: 'Subscribed', value: 'subscribed' },
                { name: 'Unsubscribed', value: 'unsubscribed' },
                { name: 'Cleaned', value: 'cleaned' },
                { name: 'Pending', value: 'pending' },
                { name: 'Transactional', value: 'transactional' },
              ],
            },
            {
              id: 'count',
              name: 'count',
              displayName: 'Count',
              type: 'number',
              required: false,
              default: 10,
              typeOptions: {
                minValue: 1,
                maxValue: 1000,
              },
            },
            {
              id: 'since_last_changed',
              name: 'sinceLastChanged',
              displayName: 'Since Last Changed',
              type: 'dateTime',
              required: false,
            },
          ],
        },
        {
          id: 'update_member',
          name: 'Update Member',
          value: 'update',
          description: 'Update a member',
          action: 'Update member information',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
            {
              id: 'email',
              name: 'emailAddress',
              displayName: 'Email Address',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              options: [
                { name: 'Subscribed', value: 'subscribed' },
                { name: 'Unsubscribed', value: 'unsubscribed' },
                { name: 'Cleaned', value: 'cleaned' },
                { name: 'Pending', value: 'pending' },
              ],
            },
            {
              id: 'first_name',
              name: 'firstName',
              displayName: 'First Name',
              type: 'string',
              required: false,
            },
            {
              id: 'last_name',
              name: 'lastName',
              displayName: 'Last Name',
              type: 'string',
              required: false,
            },
            {
              id: 'merge_fields',
              name: 'mergeFields',
              displayName: 'Merge Fields (JSON)',
              type: 'json',
              required: false,
            },
            {
              id: 'tags',
              name: 'tags',
              displayName: 'Tags',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'delete_member',
          name: 'Delete Member',
          value: 'delete',
          description: 'Delete a member permanently',
          action: 'Permanently delete a member',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
            {
              id: 'email',
              name: 'emailAddress',
              displayName: 'Email Address',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'archive_member',
          name: 'Archive Member',
          value: 'archive',
          description: 'Archive a member',
          action: 'Archive a member (soft delete)',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
            {
              id: 'email',
              name: 'emailAddress',
              displayName: 'Email Address',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // LIST/AUDIENCE RESOURCE
    // ============================================
    {
      id: 'list',
      name: 'List/Audience',
      value: 'list',
      description: 'Manage audiences/lists',
      operations: [
        {
          id: 'get_lists',
          name: 'Get Lists',
          value: 'getMany',
          description: 'Get all lists/audiences',
          action: 'List all audiences',
          fields: [],
          optionalFields: [
            {
              id: 'count',
              name: 'count',
              displayName: 'Count',
              type: 'number',
              required: false,
              default: 10,
            },
          ],
        },
        {
          id: 'get_list',
          name: 'Get List',
          value: 'get',
          description: 'Get a list by ID',
          action: 'Retrieve audience details',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // CAMPAIGN RESOURCE
    // ============================================
    {
      id: 'campaign',
      name: 'Campaign',
      value: 'campaign',
      description: 'Manage email campaigns',
      operations: [
        {
          id: 'create_campaign',
          name: 'Create Campaign',
          value: 'create',
          description: 'Create a new campaign',
          action: 'Create a new email campaign',
          fields: [
            {
              id: 'type',
              name: 'type',
              displayName: 'Campaign Type',
              type: 'options',
              required: true,
              default: 'regular',
              options: [
                { name: 'Regular', value: 'regular' },
                { name: 'Plain Text', value: 'plaintext' },
                { name: 'A/B Split', value: 'absplit' },
                { name: 'RSS', value: 'rss' },
                { name: 'Variate', value: 'variate' },
              ],
            },
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject Line',
              type: 'string',
              required: false,
            },
            {
              id: 'preview_text',
              name: 'previewText',
              displayName: 'Preview Text',
              type: 'string',
              required: false,
            },
            {
              id: 'title',
              name: 'title',
              displayName: 'Campaign Title',
              type: 'string',
              required: false,
              description: 'Internal title for the campaign',
            },
            {
              id: 'from_name',
              name: 'fromName',
              displayName: 'From Name',
              type: 'string',
              required: false,
            },
            {
              id: 'reply_to',
              name: 'replyTo',
              displayName: 'Reply To',
              type: 'string',
              required: false,
            },
            {
              id: 'template_id',
              name: 'templateId',
              displayName: 'Template ID',
              type: 'number',
              required: false,
            },
            {
              id: 'segment_id',
              name: 'segmentId',
              displayName: 'Segment ID',
              type: 'number',
              required: false,
              description: 'Send to a specific segment',
            },
          ],
        },
        {
          id: 'get_campaigns',
          name: 'Get Campaigns',
          value: 'getMany',
          description: 'Get all campaigns',
          action: 'List all campaigns',
          fields: [],
          optionalFields: [
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              options: [
                { name: 'Save', value: 'save' },
                { name: 'Paused', value: 'paused' },
                { name: 'Schedule', value: 'schedule' },
                { name: 'Sending', value: 'sending' },
                { name: 'Sent', value: 'sent' },
              ],
            },
            {
              id: 'type',
              name: 'type',
              displayName: 'Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Regular', value: 'regular' },
                { name: 'Plain Text', value: 'plaintext' },
                { name: 'A/B Split', value: 'absplit' },
                { name: 'RSS', value: 'rss' },
                { name: 'Variate', value: 'variate' },
              ],
            },
            {
              id: 'count',
              name: 'count',
              displayName: 'Count',
              type: 'number',
              required: false,
              default: 10,
            },
          ],
        },
        {
          id: 'get_campaign',
          name: 'Get Campaign',
          value: 'get',
          description: 'Get a campaign',
          action: 'Retrieve campaign details',
          fields: [
            {
              id: 'campaign_id',
              name: 'campaignId',
              displayName: 'Campaign ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'send_campaign',
          name: 'Send Campaign',
          value: 'send',
          description: 'Send a campaign',
          action: 'Send an email campaign immediately',
          fields: [
            {
              id: 'campaign_id',
              name: 'campaignId',
              displayName: 'Campaign ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'schedule_campaign',
          name: 'Schedule Campaign',
          value: 'schedule',
          description: 'Schedule a campaign',
          action: 'Schedule a campaign for later',
          fields: [
            {
              id: 'campaign_id',
              name: 'campaignId',
              displayName: 'Campaign ID',
              type: 'string',
              required: true,
            },
            {
              id: 'schedule_time',
              name: 'scheduleTime',
              displayName: 'Schedule Time',
              type: 'dateTime',
              required: true,
              description: 'UTC time to send',
            },
          ],
          optionalFields: [
            {
              id: 'timewarp',
              name: 'timewarp',
              displayName: 'Timewarp',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Send based on subscriber timezone',
            },
            {
              id: 'batch_delay',
              name: 'batchDelay',
              displayName: 'Batch Delay',
              type: 'number',
              required: false,
              description: 'Batch delivery delay in minutes',
            },
          ],
        },
        {
          id: 'delete_campaign',
          name: 'Delete Campaign',
          value: 'delete',
          description: 'Delete a campaign',
          action: 'Delete a campaign',
          fields: [
            {
              id: 'campaign_id',
              name: 'campaignId',
              displayName: 'Campaign ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'replicate_campaign',
          name: 'Replicate Campaign',
          value: 'replicate',
          description: 'Copy a campaign',
          action: 'Create a copy of a campaign',
          fields: [
            {
              id: 'campaign_id',
              name: 'campaignId',
              displayName: 'Campaign ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // TAG RESOURCE
    // ============================================
    {
      id: 'tag',
      name: 'Tag',
      value: 'tag',
      description: 'Manage member tags',
      operations: [
        {
          id: 'add_tags',
          name: 'Add Tags',
          value: 'add',
          description: 'Add tags to a member',
          action: 'Add tags to a list member',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
            {
              id: 'email',
              name: 'emailAddress',
              displayName: 'Email Address',
              type: 'string',
              required: true,
            },
            {
              id: 'tags',
              name: 'tags',
              displayName: 'Tags',
              type: 'string',
              required: true,
              description: 'Comma-separated tag names',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'remove_tags',
          name: 'Remove Tags',
          value: 'remove',
          description: 'Remove tags from a member',
          action: 'Remove tags from a list member',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
            {
              id: 'email',
              name: 'emailAddress',
              displayName: 'Email Address',
              type: 'string',
              required: true,
            },
            {
              id: 'tags',
              name: 'tags',
              displayName: 'Tags',
              type: 'string',
              required: true,
              description: 'Comma-separated tag names to remove',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_tags',
          name: 'Get Tags',
          value: 'getMany',
          description: 'Get all tags for a list',
          action: 'List all tags in an audience',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // SEGMENT RESOURCE
    // ============================================
    {
      id: 'segment',
      name: 'Segment',
      value: 'segment',
      description: 'Manage audience segments',
      operations: [
        {
          id: 'get_segments',
          name: 'Get Segments',
          value: 'getMany',
          description: 'Get all segments',
          action: 'List all segments in an audience',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'type',
              name: 'type',
              displayName: 'Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Saved', value: 'saved' },
                { name: 'Static', value: 'static' },
                { name: 'Fuzzy', value: 'fuzzy' },
              ],
            },
          ],
        },
        {
          id: 'get_segment',
          name: 'Get Segment',
          value: 'get',
          description: 'Get a segment',
          action: 'Retrieve segment details',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
            {
              id: 'segment_id',
              name: 'segmentId',
              displayName: 'Segment ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_segment_members',
          name: 'Get Segment Members',
          value: 'getMembers',
          description: 'Get members in a segment',
          action: 'List all members in a segment',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List/Audience',
              type: 'string',
              required: true,
            },
            {
              id: 'segment_id',
              name: 'segmentId',
              displayName: 'Segment ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'count',
              name: 'count',
              displayName: 'Count',
              type: 'number',
              required: false,
              default: 10,
            },
          ],
        },
      ],
    },
  ],
};
