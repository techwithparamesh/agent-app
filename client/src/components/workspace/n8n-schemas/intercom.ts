/**
 * Intercom n8n-style Schema
 * 
 * Comprehensive Intercom messaging and support API operations
 */

import { N8nAppSchema } from './types';

export const intercomSchema: N8nAppSchema = {
  id: 'intercom',
  name: 'Intercom',
  description: 'Intercom customer messaging platform',
  version: '1.0.0',
  color: '#1F8DED',
  icon: 'intercom',
  group: ['communication', 'crm'],
  
  credentials: [
    {
      name: 'intercomApi',
      displayName: 'Intercom Access Token',
      required: true,
      type: 'apiKey',
    },
  ],
  
  resources: [
    // ============================================
    // CONTACT RESOURCE
    // ============================================
    {
      id: 'contact',
      name: 'Contact',
      value: 'contact',
      description: 'Leads and users',
      operations: [
        {
          id: 'create_contact',
          name: 'Create Contact',
          value: 'create',
          description: 'Create a new contact',
          action: 'Create a new contact (lead or user)',
          fields: [
            {
              id: 'role',
              name: 'role',
              displayName: 'Role',
              type: 'options',
              required: true,
              options: [
                { name: 'User', value: 'user' },
                { name: 'Lead', value: 'lead' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: false,
            },
            {
              id: 'external_id',
              name: 'external_id',
              displayName: 'External ID',
              type: 'string',
              required: false,
              description: 'Your unique identifier for the user',
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
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
              id: 'avatar',
              name: 'avatar',
              displayName: 'Avatar URL',
              type: 'string',
              required: false,
            },
            {
              id: 'signed_up_at',
              name: 'signed_up_at',
              displayName: 'Signed Up At',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'last_seen_at',
              name: 'last_seen_at',
              displayName: 'Last Seen At',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'owner_id',
              name: 'owner_id',
              displayName: 'Owner ID',
              type: 'number',
              required: false,
            },
            {
              id: 'unsubscribed_from_emails',
              name: 'unsubscribed_from_emails',
              displayName: 'Unsubscribed from Emails',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'custom_attributes',
              name: 'custom_attributes',
              displayName: 'Custom Attributes (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'get_contact',
          name: 'Get Contact',
          value: 'get',
          description: 'Get a contact by ID',
          action: 'Retrieve a contact',
          fields: [
            {
              id: 'contact_id',
              name: 'contactId',
              displayName: 'Contact ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_contacts',
          name: 'Get Contacts',
          value: 'getMany',
          description: 'Get all contacts',
          action: 'List all contacts',
          fields: [],
          optionalFields: [
            {
              id: 'per_page',
              name: 'per_page',
              displayName: 'Per Page',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'update_contact',
          name: 'Update Contact',
          value: 'update',
          description: 'Update a contact',
          action: 'Update a contact',
          fields: [
            {
              id: 'contact_id',
              name: 'contactId',
              displayName: 'Contact ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: false,
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
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
              id: 'custom_attributes',
              name: 'custom_attributes',
              displayName: 'Custom Attributes (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'delete_contact',
          name: 'Delete Contact',
          value: 'delete',
          description: 'Delete a contact',
          action: 'Delete a contact',
          fields: [
            {
              id: 'contact_id',
              name: 'contactId',
              displayName: 'Contact ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'search_contacts',
          name: 'Search Contacts',
          value: 'search',
          description: 'Search for contacts',
          action: 'Search contacts',
          fields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Search Query (JSON)',
              type: 'json',
              required: true,
              placeholder: '{"field": "email", "operator": "=", "value": "user@example.com"}',
            },
          ],
          optionalFields: [
            {
              id: 'per_page',
              name: 'per_page',
              displayName: 'Per Page',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // CONVERSATION RESOURCE
    // ============================================
    {
      id: 'conversation',
      name: 'Conversation',
      value: 'conversation',
      description: 'Support conversations',
      operations: [
        {
          id: 'create_conversation',
          name: 'Create Conversation',
          value: 'create',
          description: 'Start a new conversation',
          action: 'Create a new conversation',
          fields: [
            {
              id: 'from',
              name: 'from',
              displayName: 'From (Contact ID)',
              type: 'string',
              required: true,
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Message Body',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 5,
              },
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_conversation',
          name: 'Get Conversation',
          value: 'get',
          description: 'Get a conversation by ID',
          action: 'Retrieve a conversation',
          fields: [
            {
              id: 'conversation_id',
              name: 'conversationId',
              displayName: 'Conversation ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_conversations',
          name: 'Get Conversations',
          value: 'getMany',
          description: 'Get all conversations',
          action: 'List all conversations',
          fields: [],
          optionalFields: [
            {
              id: 'type',
              name: 'type',
              displayName: 'Type',
              type: 'options',
              required: false,
              options: [
                { name: 'All', value: 'all' },
                { name: 'Open', value: 'open' },
                { name: 'Closed', value: 'closed' },
                { name: 'Snoozed', value: 'snoozed' },
                { name: 'Unassigned', value: 'unassigned' },
              ],
            },
            {
              id: 'per_page',
              name: 'per_page',
              displayName: 'Per Page',
              type: 'number',
              required: false,
              default: 20,
            },
          ],
        },
        {
          id: 'reply_conversation',
          name: 'Reply to Conversation',
          value: 'reply',
          description: 'Reply to a conversation',
          action: 'Reply to a conversation',
          fields: [
            {
              id: 'conversation_id',
              name: 'conversationId',
              displayName: 'Conversation ID',
              type: 'string',
              required: true,
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Message Body',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'message_type',
              name: 'message_type',
              displayName: 'Message Type',
              type: 'options',
              required: true,
              default: 'comment',
              options: [
                { name: 'Comment (visible to user)', value: 'comment' },
                { name: 'Note (internal only)', value: 'note' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'admin_id',
              name: 'admin_id',
              displayName: 'Admin ID',
              type: 'string',
              required: false,
              description: 'ID of the admin replying',
            },
            {
              id: 'attachment_urls',
              name: 'attachment_urls',
              displayName: 'Attachment URLs (JSON array)',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'close_conversation',
          name: 'Close Conversation',
          value: 'close',
          description: 'Close a conversation',
          action: 'Close a conversation',
          fields: [
            {
              id: 'conversation_id',
              name: 'conversationId',
              displayName: 'Conversation ID',
              type: 'string',
              required: true,
            },
            {
              id: 'admin_id',
              name: 'admin_id',
              displayName: 'Admin ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'body',
              name: 'body',
              displayName: 'Closing Message',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'assign_conversation',
          name: 'Assign Conversation',
          value: 'assign',
          description: 'Assign to admin or team',
          action: 'Assign a conversation',
          fields: [
            {
              id: 'conversation_id',
              name: 'conversationId',
              displayName: 'Conversation ID',
              type: 'string',
              required: true,
            },
            {
              id: 'admin_id',
              name: 'admin_id',
              displayName: 'Assigning Admin ID',
              type: 'string',
              required: true,
            },
            {
              id: 'assignee_id',
              name: 'assignee_id',
              displayName: 'Assignee ID',
              type: 'string',
              required: true,
              description: 'Admin or team ID to assign to',
            },
          ],
          optionalFields: [
            {
              id: 'body',
              name: 'body',
              displayName: 'Note',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'snooze_conversation',
          name: 'Snooze Conversation',
          value: 'snooze',
          description: 'Snooze a conversation',
          action: 'Snooze a conversation',
          fields: [
            {
              id: 'conversation_id',
              name: 'conversationId',
              displayName: 'Conversation ID',
              type: 'string',
              required: true,
            },
            {
              id: 'admin_id',
              name: 'admin_id',
              displayName: 'Admin ID',
              type: 'string',
              required: true,
            },
            {
              id: 'snoozed_until',
              name: 'snoozed_until',
              displayName: 'Snooze Until',
              type: 'dateTime',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'tag_conversation',
          name: 'Tag Conversation',
          value: 'tag',
          description: 'Add tags to a conversation',
          action: 'Tag a conversation',
          fields: [
            {
              id: 'conversation_id',
              name: 'conversationId',
              displayName: 'Conversation ID',
              type: 'string',
              required: true,
            },
            {
              id: 'admin_id',
              name: 'admin_id',
              displayName: 'Admin ID',
              type: 'string',
              required: true,
            },
            {
              id: 'tag_id',
              name: 'id',
              displayName: 'Tag ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // MESSAGE RESOURCE
    // ============================================
    {
      id: 'message',
      name: 'Message',
      value: 'message',
      description: 'In-app and email messages',
      operations: [
        {
          id: 'send_message',
          name: 'Send Message',
          value: 'send',
          description: 'Send a message to a contact',
          action: 'Send an in-app or email message',
          fields: [
            {
              id: 'message_type',
              name: 'message_type',
              displayName: 'Message Type',
              type: 'options',
              required: true,
              options: [
                { name: 'In-App', value: 'inapp' },
                { name: 'Email', value: 'email' },
              ],
            },
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Body',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'from',
              name: 'from',
              displayName: 'From (Admin ID)',
              type: 'string',
              required: true,
            },
            {
              id: 'to',
              name: 'to',
              displayName: 'To (Contact ID)',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'template',
              name: 'template',
              displayName: 'Template',
              type: 'options',
              required: false,
              options: [
                { name: 'Plain', value: 'plain' },
                { name: 'Personal', value: 'personal' },
                { name: 'Company', value: 'company' },
              ],
            },
          ],
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
      description: 'Contact and conversation tags',
      operations: [
        {
          id: 'create_tag',
          name: 'Create Tag',
          value: 'create',
          description: 'Create a new tag',
          action: 'Create a new tag',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Tag Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_tags',
          name: 'Get Tags',
          value: 'getMany',
          description: 'Get all tags',
          action: 'List all tags',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'tag_contact',
          name: 'Tag Contact',
          value: 'tagContact',
          description: 'Add a tag to a contact',
          action: 'Tag a contact',
          fields: [
            {
              id: 'tag_name',
              name: 'name',
              displayName: 'Tag Name',
              type: 'string',
              required: true,
            },
            {
              id: 'contact_ids',
              name: 'users',
              displayName: 'Contact IDs (JSON array)',
              type: 'json',
              required: true,
              placeholder: '[{"id": "123"}, {"id": "456"}]',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'untag_contact',
          name: 'Untag Contact',
          value: 'untagContact',
          description: 'Remove a tag from a contact',
          action: 'Untag a contact',
          fields: [
            {
              id: 'tag_name',
              name: 'name',
              displayName: 'Tag Name',
              type: 'string',
              required: true,
            },
            {
              id: 'contact_ids',
              name: 'users',
              displayName: 'Contact IDs (JSON array)',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_tag',
          name: 'Delete Tag',
          value: 'delete',
          description: 'Delete a tag',
          action: 'Delete a tag',
          fields: [
            {
              id: 'tag_id',
              name: 'tagId',
              displayName: 'Tag ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // COMPANY RESOURCE
    // ============================================
    {
      id: 'company',
      name: 'Company',
      value: 'company',
      description: 'Company records',
      operations: [
        {
          id: 'create_company',
          name: 'Create Company',
          value: 'create',
          description: 'Create a new company',
          action: 'Create a new company',
          fields: [
            {
              id: 'company_id',
              name: 'company_id',
              displayName: 'Company ID (your system)',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: false,
            },
            {
              id: 'plan',
              name: 'plan',
              displayName: 'Plan',
              type: 'string',
              required: false,
            },
            {
              id: 'monthly_spend',
              name: 'monthly_spend',
              displayName: 'Monthly Spend',
              type: 'number',
              required: false,
            },
            {
              id: 'size',
              name: 'size',
              displayName: 'Size',
              type: 'number',
              required: false,
            },
            {
              id: 'website',
              name: 'website',
              displayName: 'Website',
              type: 'string',
              required: false,
            },
            {
              id: 'industry',
              name: 'industry',
              displayName: 'Industry',
              type: 'string',
              required: false,
            },
            {
              id: 'custom_attributes',
              name: 'custom_attributes',
              displayName: 'Custom Attributes (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'get_company',
          name: 'Get Company',
          value: 'get',
          description: 'Get a company by ID',
          action: 'Retrieve a company',
          fields: [
            {
              id: 'company_id',
              name: 'companyId',
              displayName: 'Company ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_companies',
          name: 'Get Companies',
          value: 'getMany',
          description: 'Get all companies',
          action: 'List all companies',
          fields: [],
          optionalFields: [
            {
              id: 'per_page',
              name: 'per_page',
              displayName: 'Per Page',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'update_company',
          name: 'Update Company',
          value: 'update',
          description: 'Update a company',
          action: 'Update a company',
          fields: [
            {
              id: 'company_id',
              name: 'companyId',
              displayName: 'Company ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: false,
            },
            {
              id: 'plan',
              name: 'plan',
              displayName: 'Plan',
              type: 'string',
              required: false,
            },
            {
              id: 'custom_attributes',
              name: 'custom_attributes',
              displayName: 'Custom Attributes (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'delete_company',
          name: 'Delete Company',
          value: 'delete',
          description: 'Delete a company',
          action: 'Delete a company',
          fields: [
            {
              id: 'company_id',
              name: 'companyId',
              displayName: 'Company ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // EVENT RESOURCE
    // ============================================
    {
      id: 'event',
      name: 'Event',
      value: 'event',
      description: 'Track custom events',
      operations: [
        {
          id: 'create_event',
          name: 'Create Event',
          value: 'create',
          description: 'Track a custom event',
          action: 'Create a custom event',
          fields: [
            {
              id: 'event_name',
              name: 'event_name',
              displayName: 'Event Name',
              type: 'string',
              required: true,
            },
            {
              id: 'user_id',
              name: 'user_id',
              displayName: 'User ID (external)',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: false,
            },
            {
              id: 'intercom_user_id',
              name: 'id',
              displayName: 'Intercom User ID',
              type: 'string',
              required: false,
            },
            {
              id: 'created_at',
              name: 'created_at',
              displayName: 'Created At',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'metadata',
              name: 'metadata',
              displayName: 'Metadata (JSON)',
              type: 'json',
              required: false,
              description: 'Custom event properties',
            },
          ],
        },
        {
          id: 'get_events',
          name: 'Get Events',
          value: 'getMany',
          description: 'Get events for a user',
          action: 'List events for a user',
          fields: [
            {
              id: 'type',
              name: 'type',
              displayName: 'Type',
              type: 'options',
              required: true,
              default: 'user',
              options: [
                { name: 'User', value: 'user' },
              ],
            },
            {
              id: 'user_id',
              name: 'user_id',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'per_page',
              name: 'per_page',
              displayName: 'Per Page',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // ARTICLE RESOURCE
    // ============================================
    {
      id: 'article',
      name: 'Article',
      value: 'article',
      description: 'Help center articles',
      operations: [
        {
          id: 'get_articles',
          name: 'Get Articles',
          value: 'getMany',
          description: 'Get all articles',
          action: 'List all help center articles',
          fields: [],
          optionalFields: [
            {
              id: 'per_page',
              name: 'per_page',
              displayName: 'Per Page',
              type: 'number',
              required: false,
              default: 25,
            },
          ],
        },
        {
          id: 'get_article',
          name: 'Get Article',
          value: 'get',
          description: 'Get an article by ID',
          action: 'Retrieve an article',
          fields: [
            {
              id: 'article_id',
              name: 'articleId',
              displayName: 'Article ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'search_articles',
          name: 'Search Articles',
          value: 'search',
          description: 'Search articles',
          action: 'Search help center articles',
          fields: [
            {
              id: 'phrase',
              name: 'phrase',
              displayName: 'Search Phrase',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'per_page',
              name: 'per_page',
              displayName: 'Per Page',
              type: 'number',
              required: false,
              default: 25,
            },
          ],
        },
      ],
    },
  ],
};
