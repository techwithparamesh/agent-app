/**
 * Zendesk n8n-style Schema
 * 
 * Comprehensive Zendesk Support API operations
 */

import { N8nAppSchema } from './types';

export const zendeskSchema: N8nAppSchema = {
  id: 'zendesk',
  name: 'Zendesk',
  description: 'Zendesk customer service and support platform',
  version: '1.0.0',
  color: '#03363D',
  icon: 'zendesk',
  group: ['support', 'crm'],
  
  credentials: [
    {
      name: 'zendeskApi',
      displayName: 'Zendesk API',
      required: true,
      type: 'apiKey',
    },
  ],
  
  resources: [
    // ============================================
    // TICKET RESOURCE
    // ============================================
    {
      id: 'ticket',
      name: 'Ticket',
      value: 'ticket',
      description: 'Create and manage support tickets',
      operations: [
        {
          id: 'create_ticket',
          name: 'Create Ticket',
          value: 'create',
          description: 'Create a new ticket',
          action: 'Create a new support ticket',
          fields: [
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
              description: 'Ticket subject line',
              placeholder: 'Help with order #12345',
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
              required: true,
              description: 'The initial comment/description',
              typeOptions: {
                rows: 5,
              },
            },
          ],
          optionalFields: [
            {
              id: 'requester_email',
              name: 'requesterEmail',
              displayName: 'Requester Email',
              type: 'string',
              required: false,
              description: 'Email of the ticket requester',
            },
            {
              id: 'requester_name',
              name: 'requesterName',
              displayName: 'Requester Name',
              type: 'string',
              required: false,
            },
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              required: false,
              default: 'normal',
              options: [
                { name: 'Urgent', value: 'urgent' },
                { name: 'High', value: 'high' },
                { name: 'Normal', value: 'normal' },
                { name: 'Low', value: 'low' },
              ],
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              default: 'new',
              options: [
                { name: 'New', value: 'new' },
                { name: 'Open', value: 'open' },
                { name: 'Pending', value: 'pending' },
                { name: 'Hold', value: 'hold' },
                { name: 'Solved', value: 'solved' },
                { name: 'Closed', value: 'closed' },
              ],
            },
            {
              id: 'type',
              name: 'type',
              displayName: 'Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Problem', value: 'problem' },
                { name: 'Incident', value: 'incident' },
                { name: 'Question', value: 'question' },
                { name: 'Task', value: 'task' },
              ],
            },
            {
              id: 'assignee_id',
              name: 'assigneeId',
              displayName: 'Assignee ID',
              type: 'number',
              required: false,
              description: 'ID of the agent to assign',
            },
            {
              id: 'group_id',
              name: 'groupId',
              displayName: 'Group ID',
              type: 'number',
              required: false,
              description: 'ID of the group to assign',
            },
            {
              id: 'tags',
              name: 'tags',
              displayName: 'Tags',
              type: 'string',
              required: false,
              description: 'Comma-separated list of tags',
            },
            {
              id: 'custom_fields',
              name: 'customFields',
              displayName: 'Custom Fields (JSON)',
              type: 'json',
              required: false,
              description: 'Array of custom field objects',
              placeholder: '[{"id": 123, "value": "custom value"}]',
            },
          ],
        },
        {
          id: 'get_ticket',
          name: 'Get Ticket',
          value: 'get',
          description: 'Get a ticket by ID',
          action: 'Retrieve ticket details',
          fields: [
            {
              id: 'ticket_id',
              name: 'ticketId',
              displayName: 'Ticket ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_tickets',
          name: 'Get Tickets',
          value: 'getMany',
          description: 'Get multiple tickets',
          action: 'List tickets',
          fields: [],
          optionalFields: [
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              options: [
                { name: 'New', value: 'new' },
                { name: 'Open', value: 'open' },
                { name: 'Pending', value: 'pending' },
                { name: 'Hold', value: 'hold' },
                { name: 'Solved', value: 'solved' },
                { name: 'Closed', value: 'closed' },
              ],
            },
            {
              id: 'sort_by',
              name: 'sortBy',
              displayName: 'Sort By',
              type: 'options',
              required: false,
              default: 'created_at',
              options: [
                { name: 'Created At', value: 'created_at' },
                { name: 'Updated At', value: 'updated_at' },
                { name: 'Priority', value: 'priority' },
                { name: 'Status', value: 'status' },
              ],
            },
            {
              id: 'sort_order',
              name: 'sortOrder',
              displayName: 'Sort Order',
              type: 'options',
              required: false,
              default: 'desc',
              options: [
                { name: 'Ascending', value: 'asc' },
                { name: 'Descending', value: 'desc' },
              ],
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
        {
          id: 'update_ticket',
          name: 'Update Ticket',
          value: 'update',
          description: 'Update a ticket',
          action: 'Update ticket properties',
          fields: [
            {
              id: 'ticket_id',
              name: 'ticketId',
              displayName: 'Ticket ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: false,
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              options: [
                { name: 'New', value: 'new' },
                { name: 'Open', value: 'open' },
                { name: 'Pending', value: 'pending' },
                { name: 'Hold', value: 'hold' },
                { name: 'Solved', value: 'solved' },
                { name: 'Closed', value: 'closed' },
              ],
            },
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              required: false,
              options: [
                { name: 'Urgent', value: 'urgent' },
                { name: 'High', value: 'high' },
                { name: 'Normal', value: 'normal' },
                { name: 'Low', value: 'low' },
              ],
            },
            {
              id: 'assignee_id',
              name: 'assigneeId',
              displayName: 'Assignee ID',
              type: 'number',
              required: false,
            },
            {
              id: 'group_id',
              name: 'groupId',
              displayName: 'Group ID',
              type: 'number',
              required: false,
            },
            {
              id: 'comment',
              name: 'comment',
              displayName: 'Add Comment',
              type: 'text',
              required: false,
              description: 'Add a comment to the ticket',
            },
            {
              id: 'public_comment',
              name: 'publicComment',
              displayName: 'Public Comment',
              type: 'boolean',
              required: false,
              default: true,
              description: 'Whether the comment is visible to the requester',
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
          id: 'delete_ticket',
          name: 'Delete Ticket',
          value: 'delete',
          description: 'Delete a ticket',
          action: 'Delete a ticket permanently',
          fields: [
            {
              id: 'ticket_id',
              name: 'ticketId',
              displayName: 'Ticket ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'search_tickets',
          name: 'Search Tickets',
          value: 'search',
          description: 'Search for tickets',
          action: 'Search tickets using query',
          fields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Search Query',
              type: 'string',
              required: true,
              description: 'Zendesk search query',
              placeholder: 'status:open priority:high',
            },
          ],
          optionalFields: [
            {
              id: 'sort_by',
              name: 'sortBy',
              displayName: 'Sort By',
              type: 'options',
              required: false,
              options: [
                { name: 'Relevance', value: 'relevance' },
                { name: 'Created At', value: 'created_at' },
                { name: 'Updated At', value: 'updated_at' },
              ],
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // USER RESOURCE
    // ============================================
    {
      id: 'user',
      name: 'User',
      value: 'user',
      description: 'Manage Zendesk users',
      operations: [
        {
          id: 'create_user',
          name: 'Create User',
          value: 'create',
          description: 'Create a new user',
          action: 'Create a new Zendesk user',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: true,
            },
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'role',
              name: 'role',
              displayName: 'Role',
              type: 'options',
              required: false,
              default: 'end-user',
              options: [
                { name: 'End User', value: 'end-user' },
                { name: 'Agent', value: 'agent' },
                { name: 'Admin', value: 'admin' },
              ],
            },
            {
              id: 'phone',
              name: 'phone',
              displayName: 'Phone',
              type: 'string',
              required: false,
            },
            {
              id: 'organization_id',
              name: 'organizationId',
              displayName: 'Organization ID',
              type: 'number',
              required: false,
            },
            {
              id: 'verified',
              name: 'verified',
              displayName: 'Verified',
              type: 'boolean',
              required: false,
              default: false,
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
          id: 'get_user',
          name: 'Get User',
          value: 'get',
          description: 'Get a user by ID',
          action: 'Retrieve user details',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_users',
          name: 'Get Users',
          value: 'getMany',
          description: 'Get multiple users',
          action: 'List users',
          fields: [],
          optionalFields: [
            {
              id: 'role',
              name: 'role',
              displayName: 'Role',
              type: 'options',
              required: false,
              options: [
                { name: 'End User', value: 'end-user' },
                { name: 'Agent', value: 'agent' },
                { name: 'Admin', value: 'admin' },
              ],
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
        {
          id: 'update_user',
          name: 'Update User',
          value: 'update',
          description: 'Update a user',
          action: 'Update user properties',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'number',
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
              id: 'email',
              name: 'email',
              displayName: 'Email',
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
              id: 'role',
              name: 'role',
              displayName: 'Role',
              type: 'options',
              required: false,
              options: [
                { name: 'End User', value: 'end-user' },
                { name: 'Agent', value: 'agent' },
                { name: 'Admin', value: 'admin' },
              ],
            },
            {
              id: 'suspended',
              name: 'suspended',
              displayName: 'Suspended',
              type: 'boolean',
              required: false,
            },
          ],
        },
        {
          id: 'delete_user',
          name: 'Delete User',
          value: 'delete',
          description: 'Delete a user',
          action: 'Delete a user',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'search_users',
          name: 'Search Users',
          value: 'search',
          description: 'Search for users',
          action: 'Search users by query',
          fields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Search Query',
              type: 'string',
              required: true,
              placeholder: 'email:*@company.com',
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // ORGANIZATION RESOURCE
    // ============================================
    {
      id: 'organization',
      name: 'Organization',
      value: 'organization',
      description: 'Manage organizations',
      operations: [
        {
          id: 'create_organization',
          name: 'Create Organization',
          value: 'create',
          description: 'Create a new organization',
          action: 'Create a new organization',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'domain_names',
              name: 'domainNames',
              displayName: 'Domain Names',
              type: 'string',
              required: false,
              description: 'Comma-separated domain names',
            },
            {
              id: 'details',
              name: 'details',
              displayName: 'Details',
              type: 'text',
              required: false,
            },
            {
              id: 'notes',
              name: 'notes',
              displayName: 'Notes',
              type: 'text',
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
          id: 'get_organization',
          name: 'Get Organization',
          value: 'get',
          description: 'Get an organization',
          action: 'Retrieve organization details',
          fields: [
            {
              id: 'organization_id',
              name: 'organizationId',
              displayName: 'Organization ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_organizations',
          name: 'Get Organizations',
          value: 'getMany',
          description: 'Get all organizations',
          action: 'List organizations',
          fields: [],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
        {
          id: 'update_organization',
          name: 'Update Organization',
          value: 'update',
          description: 'Update an organization',
          action: 'Update organization properties',
          fields: [
            {
              id: 'organization_id',
              name: 'organizationId',
              displayName: 'Organization ID',
              type: 'number',
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
              id: 'details',
              name: 'details',
              displayName: 'Details',
              type: 'text',
              required: false,
            },
            {
              id: 'notes',
              name: 'notes',
              displayName: 'Notes',
              type: 'text',
              required: false,
            },
          ],
        },
        {
          id: 'delete_organization',
          name: 'Delete Organization',
          value: 'delete',
          description: 'Delete an organization',
          action: 'Delete an organization',
          fields: [
            {
              id: 'organization_id',
              name: 'organizationId',
              displayName: 'Organization ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // TICKET COMMENT RESOURCE
    // ============================================
    {
      id: 'ticketComment',
      name: 'Ticket Comment',
      value: 'ticketComment',
      description: 'Manage ticket comments',
      operations: [
        {
          id: 'add_comment',
          name: 'Add Comment',
          value: 'create',
          description: 'Add a comment to a ticket',
          action: 'Add a comment to a ticket',
          fields: [
            {
              id: 'ticket_id',
              name: 'ticketId',
              displayName: 'Ticket ID',
              type: 'number',
              required: true,
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Comment',
              type: 'text',
              required: true,
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'public',
              name: 'public',
              displayName: 'Public',
              type: 'boolean',
              required: false,
              default: true,
              description: 'Whether visible to the requester',
            },
            {
              id: 'author_id',
              name: 'authorId',
              displayName: 'Author ID',
              type: 'number',
              required: false,
            },
          ],
        },
        {
          id: 'get_comments',
          name: 'Get Comments',
          value: 'getMany',
          description: 'Get all comments on a ticket',
          action: 'List ticket comments',
          fields: [
            {
              id: 'ticket_id',
              name: 'ticketId',
              displayName: 'Ticket ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'sort_order',
              name: 'sortOrder',
              displayName: 'Sort Order',
              type: 'options',
              required: false,
              default: 'asc',
              options: [
                { name: 'Oldest First', value: 'asc' },
                { name: 'Newest First', value: 'desc' },
              ],
            },
          ],
        },
      ],
    },
    
    // ============================================
    // GROUP RESOURCE
    // ============================================
    {
      id: 'group',
      name: 'Group',
      value: 'group',
      description: 'Manage agent groups',
      operations: [
        {
          id: 'get_groups',
          name: 'Get Groups',
          value: 'getMany',
          description: 'Get all groups',
          action: 'List all agent groups',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'get_group',
          name: 'Get Group',
          value: 'get',
          description: 'Get a group',
          action: 'Get group details',
          fields: [
            {
              id: 'group_id',
              name: 'groupId',
              displayName: 'Group ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
  ],
};
