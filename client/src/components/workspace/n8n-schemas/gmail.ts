/**
 * Gmail n8n-style Schema
 * 
 * Comprehensive Gmail API operations
 */

import { N8nAppSchema } from './types';

export const gmailSchema: N8nAppSchema = {
  id: 'gmail',
  name: 'Gmail',
  description: 'Gmail email service by Google',
  version: '1.0.0',
  color: '#EA4335',
  icon: 'gmail',
  group: ['email', 'google', 'communication'],
  
  credentials: [
    {
      name: 'gmailOAuth2',
      displayName: 'Gmail OAuth2',
      required: true,
      type: 'oauth2',
    },
  ],
  
  resources: [
    // ============================================
    // MESSAGE RESOURCE
    // ============================================
    {
      id: 'message',
      name: 'Message',
      value: 'message',
      description: 'Send and manage emails',
      operations: [
        {
          id: 'send_message',
          name: 'Send Email',
          value: 'send',
          description: 'Send an email',
          action: 'Send a new email',
          fields: [
            {
              id: 'to',
              name: 'to',
              displayName: 'To',
              type: 'string',
              required: true,
              description: 'Recipient email address(es)',
              placeholder: 'john@example.com, jane@example.com',
            },
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
              placeholder: 'Email Subject',
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Body',
              type: 'text',
              required: true,
              description: 'Email body content',
              typeOptions: {
                rows: 8,
              },
            },
          ],
          optionalFields: [
            {
              id: 'body_type',
              name: 'bodyType',
              displayName: 'Body Type',
              type: 'options',
              required: false,
              default: 'text',
              options: [
                { name: 'Plain Text', value: 'text' },
                { name: 'HTML', value: 'html' },
              ],
            },
            {
              id: 'cc',
              name: 'cc',
              displayName: 'CC',
              type: 'string',
              required: false,
              description: 'Carbon copy recipients',
            },
            {
              id: 'bcc',
              name: 'bcc',
              displayName: 'BCC',
              type: 'string',
              required: false,
              description: 'Blind carbon copy recipients',
            },
            {
              id: 'reply_to',
              name: 'replyTo',
              displayName: 'Reply To',
              type: 'string',
              required: false,
            },
            {
              id: 'from_name',
              name: 'fromName',
              displayName: 'From Name',
              type: 'string',
              required: false,
              description: 'Sender display name',
            },
            {
              id: 'attachments',
              name: 'attachments',
              displayName: 'Attachments (JSON)',
              type: 'json',
              required: false,
              description: 'Array of attachment objects',
            },
          ],
        },
        {
          id: 'reply',
          name: 'Reply',
          value: 'reply',
          description: 'Reply to an email',
          action: 'Reply to an existing email',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
              description: 'ID of the message to reply to',
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Reply Body',
              type: 'text',
              required: true,
              typeOptions: {
                rows: 6,
              },
            },
          ],
          optionalFields: [
            {
              id: 'body_type',
              name: 'bodyType',
              displayName: 'Body Type',
              type: 'options',
              required: false,
              default: 'text',
              options: [
                { name: 'Plain Text', value: 'text' },
                { name: 'HTML', value: 'html' },
              ],
            },
            {
              id: 'to_all',
              name: 'toAll',
              displayName: 'Reply All',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'get_message',
          name: 'Get Email',
          value: 'get',
          description: 'Get an email by ID',
          action: 'Retrieve a specific email',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'format',
              name: 'format',
              displayName: 'Format',
              type: 'options',
              required: false,
              default: 'full',
              options: [
                { name: 'Full', value: 'full' },
                { name: 'Metadata', value: 'metadata' },
                { name: 'Minimal', value: 'minimal' },
                { name: 'Raw', value: 'raw' },
              ],
            },
          ],
        },
        {
          id: 'get_messages',
          name: 'Get Emails',
          value: 'getMany',
          description: 'Get multiple emails',
          action: 'List emails from inbox',
          fields: [],
          optionalFields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Search Query',
              type: 'string',
              required: false,
              description: 'Gmail search query',
              placeholder: 'from:sender@example.com is:unread',
            },
            {
              id: 'label_ids',
              name: 'labelIds',
              displayName: 'Label IDs',
              type: 'string',
              required: false,
              description: 'Comma-separated label IDs',
            },
            {
              id: 'include_spam_trash',
              name: 'includeSpamTrash',
              displayName: 'Include Spam/Trash',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 10,
              typeOptions: {
                minValue: 1,
                maxValue: 500,
              },
            },
          ],
        },
        {
          id: 'delete_message',
          name: 'Delete Email',
          value: 'delete',
          description: 'Delete an email',
          action: 'Delete an email permanently',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'trash_message',
          name: 'Move to Trash',
          value: 'trash',
          description: 'Move an email to trash',
          action: 'Move email to trash folder',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'mark_as_read',
          name: 'Mark as Read',
          value: 'markAsRead',
          description: 'Mark email as read',
          action: 'Mark an email as read',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'mark_as_unread',
          name: 'Mark as Unread',
          value: 'markAsUnread',
          description: 'Mark email as unread',
          action: 'Mark an email as unread',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'add_labels',
          name: 'Add Labels',
          value: 'addLabels',
          description: 'Add labels to an email',
          action: 'Add labels to an email',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
            {
              id: 'label_ids',
              name: 'labelIds',
              displayName: 'Label IDs',
              type: 'string',
              required: true,
              description: 'Comma-separated label IDs to add',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'remove_labels',
          name: 'Remove Labels',
          value: 'removeLabels',
          description: 'Remove labels from an email',
          action: 'Remove labels from an email',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
            {
              id: 'label_ids',
              name: 'labelIds',
              displayName: 'Label IDs',
              type: 'string',
              required: true,
              description: 'Comma-separated label IDs to remove',
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // DRAFT RESOURCE
    // ============================================
    {
      id: 'draft',
      name: 'Draft',
      value: 'draft',
      description: 'Manage email drafts',
      operations: [
        {
          id: 'create_draft',
          name: 'Create Draft',
          value: 'create',
          description: 'Create a new draft',
          action: 'Create a new email draft',
          fields: [
            {
              id: 'to',
              name: 'to',
              displayName: 'To',
              type: 'string',
              required: true,
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
              type: 'text',
              required: true,
              typeOptions: {
                rows: 6,
              },
            },
          ],
          optionalFields: [
            {
              id: 'cc',
              name: 'cc',
              displayName: 'CC',
              type: 'string',
              required: false,
            },
            {
              id: 'bcc',
              name: 'bcc',
              displayName: 'BCC',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_drafts',
          name: 'Get Drafts',
          value: 'getMany',
          description: 'Get all drafts',
          action: 'List all email drafts',
          fields: [],
          optionalFields: [
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 10,
            },
          ],
        },
        {
          id: 'get_draft',
          name: 'Get Draft',
          value: 'get',
          description: 'Get a draft',
          action: 'Retrieve a specific draft',
          fields: [
            {
              id: 'draft_id',
              name: 'draftId',
              displayName: 'Draft ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'send_draft',
          name: 'Send Draft',
          value: 'send',
          description: 'Send a draft',
          action: 'Send an existing draft',
          fields: [
            {
              id: 'draft_id',
              name: 'draftId',
              displayName: 'Draft ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_draft',
          name: 'Delete Draft',
          value: 'delete',
          description: 'Delete a draft',
          action: 'Delete an email draft',
          fields: [
            {
              id: 'draft_id',
              name: 'draftId',
              displayName: 'Draft ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // LABEL RESOURCE
    // ============================================
    {
      id: 'label',
      name: 'Label',
      value: 'label',
      description: 'Manage email labels',
      operations: [
        {
          id: 'create_label',
          name: 'Create Label',
          value: 'create',
          description: 'Create a new label',
          action: 'Create a new email label',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Label Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'label_list_visibility',
              name: 'labelListVisibility',
              displayName: 'List Visibility',
              type: 'options',
              required: false,
              default: 'labelShow',
              options: [
                { name: 'Show', value: 'labelShow' },
                { name: 'Show if Unread', value: 'labelShowIfUnread' },
                { name: 'Hide', value: 'labelHide' },
              ],
            },
            {
              id: 'message_list_visibility',
              name: 'messageListVisibility',
              displayName: 'Message Visibility',
              type: 'options',
              required: false,
              default: 'show',
              options: [
                { name: 'Show', value: 'show' },
                { name: 'Hide', value: 'hide' },
              ],
            },
            {
              id: 'background_color',
              name: 'backgroundColor',
              displayName: 'Background Color',
              type: 'color',
              required: false,
            },
            {
              id: 'text_color',
              name: 'textColor',
              displayName: 'Text Color',
              type: 'color',
              required: false,
            },
          ],
        },
        {
          id: 'get_labels',
          name: 'Get Labels',
          value: 'getMany',
          description: 'Get all labels',
          action: 'List all email labels',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'get_label',
          name: 'Get Label',
          value: 'get',
          description: 'Get a label',
          action: 'Retrieve a specific label',
          fields: [
            {
              id: 'label_id',
              name: 'labelId',
              displayName: 'Label ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_label',
          name: 'Delete Label',
          value: 'delete',
          description: 'Delete a label',
          action: 'Delete an email label',
          fields: [
            {
              id: 'label_id',
              name: 'labelId',
              displayName: 'Label ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // THREAD RESOURCE
    // ============================================
    {
      id: 'thread',
      name: 'Thread',
      value: 'thread',
      description: 'Manage email threads',
      operations: [
        {
          id: 'get_threads',
          name: 'Get Threads',
          value: 'getMany',
          description: 'Get email threads',
          action: 'List email threads',
          fields: [],
          optionalFields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Search Query',
              type: 'string',
              required: false,
            },
            {
              id: 'label_ids',
              name: 'labelIds',
              displayName: 'Label IDs',
              type: 'string',
              required: false,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 10,
            },
          ],
        },
        {
          id: 'get_thread',
          name: 'Get Thread',
          value: 'get',
          description: 'Get a thread',
          action: 'Retrieve a specific thread',
          fields: [
            {
              id: 'thread_id',
              name: 'threadId',
              displayName: 'Thread ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'format',
              name: 'format',
              displayName: 'Format',
              type: 'options',
              required: false,
              default: 'full',
              options: [
                { name: 'Full', value: 'full' },
                { name: 'Metadata', value: 'metadata' },
                { name: 'Minimal', value: 'minimal' },
              ],
            },
          ],
        },
        {
          id: 'trash_thread',
          name: 'Trash Thread',
          value: 'trash',
          description: 'Move thread to trash',
          action: 'Move an entire thread to trash',
          fields: [
            {
              id: 'thread_id',
              name: 'threadId',
              displayName: 'Thread ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_thread',
          name: 'Delete Thread',
          value: 'delete',
          description: 'Delete a thread permanently',
          action: 'Delete an entire thread',
          fields: [
            {
              id: 'thread_id',
              name: 'threadId',
              displayName: 'Thread ID',
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
