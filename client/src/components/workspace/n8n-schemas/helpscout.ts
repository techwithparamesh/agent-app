/**
 * Help Scout n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const helpscoutSchema: N8nAppSchema = {
  id: 'helpscout',
  name: 'Help Scout',
  description: 'Help Scout customer support',
  version: '1.0.0',
  color: '#1292EE',
  icon: 'helpscout',
  group: ['support', 'communication'],
  
  credentials: [
    { name: 'helpscoutOAuth2', displayName: 'Help Scout OAuth2', required: true, type: 'oauth2',
      properties: [{ name: 'accessToken', displayName: 'Access Token', type: 'string', required: true, typeOptions: { password: true } }],
    },
  ],
  
  resources: [
    {
      id: 'conversation', name: 'Conversation', value: 'conversation', description: 'Conversation operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create conversation', action: 'Create conversation',
          fields: [
            { id: 'mailboxId', name: 'mailboxId', displayName: 'Mailbox ID', type: 'string', required: true },
            { id: 'customerEmail', name: 'customerEmail', displayName: 'Customer Email', type: 'string', required: true },
            { id: 'subject', name: 'subject', displayName: 'Subject', type: 'string', required: true },
            { id: 'text', name: 'text', displayName: 'Message', type: 'string', required: true, typeOptions: { rows: 5 } },
          ],
          optionalFields: [
            { id: 'type', name: 'type', displayName: 'Type', type: 'options', required: false, options: [{ name: 'Email', value: 'email' }, { name: 'Phone', value: 'phone' }, { name: 'Chat', value: 'chat' }] },
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'Active', value: 'active' }, { name: 'Pending', value: 'pending' }, { name: 'Closed', value: 'closed' }] },
            { id: 'assignTo', name: 'assignTo', displayName: 'Assign To (User ID)', type: 'string', required: false },
            { id: 'tags', name: 'tags', displayName: 'Tags', type: 'string', required: false, description: 'Comma-separated' },
          ],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get conversation', action: 'Get conversation',
          fields: [{ id: 'conversationId', name: 'conversationId', displayName: 'Conversation ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List conversations', action: 'List conversations',
          fields: [],
          optionalFields: [
            { id: 'mailboxId', name: 'mailboxId', displayName: 'Mailbox ID', type: 'string', required: false },
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'All', value: '' }, { name: 'Active', value: 'active' }, { name: 'Pending', value: 'pending' }, { name: 'Closed', value: 'closed' }] },
            { id: 'assignedTo', name: 'assignedTo', displayName: 'Assigned To', type: 'string', required: false },
            { id: 'limit', name: 'limit', displayName: 'Limit', type: 'number', required: false, default: 50 },
          ],
        },
        { id: 'update', name: 'Update', value: 'update', description: 'Update conversation', action: 'Update conversation',
          fields: [{ id: 'conversationId', name: 'conversationId', displayName: 'Conversation ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'Active', value: 'active' }, { name: 'Pending', value: 'pending' }, { name: 'Closed', value: 'closed' }] },
            { id: 'assignTo', name: 'assignTo', displayName: 'Assign To (User ID)', type: 'string', required: false },
          ],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete conversation', action: 'Delete conversation',
          fields: [{ id: 'conversationId', name: 'conversationId', displayName: 'Conversation ID', type: 'string', required: true }], optionalFields: [] },
      ],
    },
    {
      id: 'thread', name: 'Thread', value: 'thread', description: 'Thread/Reply operations',
      operations: [
        { id: 'createReply', name: 'Create Reply', value: 'createReply', description: 'Create reply', action: 'Create reply',
          fields: [
            { id: 'conversationId', name: 'conversationId', displayName: 'Conversation ID', type: 'string', required: true },
            { id: 'text', name: 'text', displayName: 'Message', type: 'string', required: true, typeOptions: { rows: 3 } },
          ],
          optionalFields: [
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'Active', value: 'active' }, { name: 'Pending', value: 'pending' }, { name: 'Closed', value: 'closed' }] },
            { id: 'draft', name: 'draft', displayName: 'Save as Draft', type: 'boolean', required: false, default: false },
          ],
        },
        { id: 'createNote', name: 'Create Note', value: 'createNote', description: 'Create internal note', action: 'Create note',
          fields: [
            { id: 'conversationId', name: 'conversationId', displayName: 'Conversation ID', type: 'string', required: true },
            { id: 'text', name: 'text', displayName: 'Note', type: 'string', required: true, typeOptions: { rows: 3 } },
          ],
          optionalFields: [],
        },
        { id: 'getAll', name: 'List Threads', value: 'getAll', description: 'List conversation threads', action: 'List threads',
          fields: [{ id: 'conversationId', name: 'conversationId', displayName: 'Conversation ID', type: 'string', required: true }], optionalFields: [] },
      ],
    },
    {
      id: 'customer', name: 'Customer', value: 'customer', description: 'Customer operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create customer', action: 'Create customer',
          fields: [{ id: 'email', name: 'email', displayName: 'Email', type: 'string', required: true }],
          optionalFields: [
            { id: 'firstName', name: 'firstName', displayName: 'First Name', type: 'string', required: false },
            { id: 'lastName', name: 'lastName', displayName: 'Last Name', type: 'string', required: false },
            { id: 'phone', name: 'phone', displayName: 'Phone', type: 'string', required: false },
            { id: 'company', name: 'company', displayName: 'Company', type: 'string', required: false },
          ],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get customer', action: 'Get customer',
          fields: [{ id: 'customerId', name: 'customerId', displayName: 'Customer ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List customers', action: 'List customers',
          fields: [], optionalFields: [{ id: 'limit', name: 'limit', displayName: 'Limit', type: 'number', required: false, default: 50 }] },
        { id: 'search', name: 'Search', value: 'search', description: 'Search customers', action: 'Search customers',
          fields: [{ id: 'query', name: 'query', displayName: 'Query', type: 'string', required: true }], optionalFields: [] },
      ],
    },
    {
      id: 'mailbox', name: 'Mailbox', value: 'mailbox', description: 'Mailbox operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List mailboxes', action: 'List mailboxes', fields: [], optionalFields: [] },
        { id: 'get', name: 'Get', value: 'get', description: 'Get mailbox', action: 'Get mailbox',
          fields: [{ id: 'mailboxId', name: 'mailboxId', displayName: 'Mailbox ID', type: 'string', required: true }], optionalFields: [] },
      ],
    },
    {
      id: 'tag', name: 'Tag', value: 'tag', description: 'Tag operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List tags', action: 'List tags', fields: [], optionalFields: [] },
        { id: 'addToConversation', name: 'Add to Conversation', value: 'addToConversation', description: 'Add tag to conversation', action: 'Add tag',
          fields: [
            { id: 'conversationId', name: 'conversationId', displayName: 'Conversation ID', type: 'string', required: true },
            { id: 'tag', name: 'tag', displayName: 'Tag', type: 'string', required: true },
          ], optionalFields: [] },
      ],
    },
  ],
};
