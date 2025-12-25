/**
 * Freshdesk n8n-style Schema
 * 
 * Comprehensive Freshdesk Support API operations
 */

import { N8nAppSchema } from './types';

export const freshdeskSchema: N8nAppSchema = {
  id: 'freshdesk',
  name: 'Freshdesk',
  description: 'Freshdesk customer support and helpdesk',
  version: '1.0.0',
  color: '#25C16F',
  icon: 'freshdesk',
  group: ['support', 'crm'],
  
  credentials: [
    {
      name: 'freshdeskApi',
      displayName: 'Freshdesk API Key',
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
              description: 'Ticket subject',
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
              required: true,
              description: 'HTML content of the ticket',
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'email',
              name: 'email',
              displayName: 'Requester Email',
              type: 'string',
              required: true,
              description: 'Email of the requester',
            },
          ],
          optionalFields: [
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              required: false,
              default: '1',
              options: [
                { name: 'Low', value: '1' },
                { name: 'Medium', value: '2' },
                { name: 'High', value: '3' },
                { name: 'Urgent', value: '4' },
              ],
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              default: '2',
              options: [
                { name: 'Open', value: '2' },
                { name: 'Pending', value: '3' },
                { name: 'Resolved', value: '4' },
                { name: 'Closed', value: '5' },
              ],
            },
            {
              id: 'source',
              name: 'source',
              displayName: 'Source',
              type: 'options',
              required: false,
              default: '2',
              options: [
                { name: 'Email', value: '1' },
                { name: 'Portal', value: '2' },
                { name: 'Phone', value: '3' },
                { name: 'Chat', value: '7' },
                { name: 'Feedback Widget', value: '9' },
                { name: 'Outbound Email', value: '10' },
              ],
            },
            {
              id: 'type',
              name: 'type',
              displayName: 'Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Question', value: 'Question' },
                { name: 'Incident', value: 'Incident' },
                { name: 'Problem', value: 'Problem' },
                { name: 'Feature Request', value: 'Feature Request' },
                { name: 'Refund', value: 'Refund' },
              ],
            },
            {
              id: 'responder_id',
              name: 'responderId',
              displayName: 'Agent ID',
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
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'Requester Name',
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
              id: 'tags',
              name: 'tags',
              displayName: 'Tags',
              type: 'string',
              required: false,
              description: 'Comma-separated tags',
            },
            {
              id: 'cc_emails',
              name: 'ccEmails',
              displayName: 'CC Emails',
              type: 'string',
              required: false,
              description: 'Comma-separated CC emails',
            },
            {
              id: 'due_by',
              name: 'dueBy',
              displayName: 'Due By',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'custom_fields',
              name: 'customFields',
              displayName: 'Custom Fields (JSON)',
              type: 'json',
              required: false,
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
          optionalFields: [
            {
              id: 'include',
              name: 'include',
              displayName: 'Include',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'Conversations', value: 'conversations' },
                { name: 'Requester', value: 'requester' },
                { name: 'Company', value: 'company' },
                { name: 'Stats', value: 'stats' },
              ],
            },
          ],
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
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'options',
              required: false,
              options: [
                { name: 'New and My Open', value: 'new_and_my_open' },
                { name: 'Watching', value: 'watching' },
                { name: 'Spam', value: 'spam' },
                { name: 'Deleted', value: 'deleted' },
              ],
            },
            {
              id: 'requester_id',
              name: 'requesterId',
              displayName: 'Requester ID',
              type: 'number',
              required: false,
            },
            {
              id: 'email',
              name: 'email',
              displayName: 'Requester Email',
              type: 'string',
              required: false,
            },
            {
              id: 'updated_since',
              name: 'updatedSince',
              displayName: 'Updated Since',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'order_by',
              name: 'orderBy',
              displayName: 'Order By',
              type: 'options',
              required: false,
              default: 'created_at',
              options: [
                { name: 'Created At', value: 'created_at' },
                { name: 'Updated At', value: 'updated_at' },
                { name: 'Due By', value: 'due_by' },
              ],
            },
            {
              id: 'order_type',
              name: 'orderType',
              displayName: 'Order',
              type: 'options',
              required: false,
              default: 'desc',
              options: [
                { name: 'Ascending', value: 'asc' },
                { name: 'Descending', value: 'desc' },
              ],
            },
            {
              id: 'per_page',
              name: 'perPage',
              displayName: 'Per Page',
              type: 'number',
              required: false,
              default: 30,
              typeOptions: {
                minValue: 1,
                maxValue: 100,
              },
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
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
              required: false,
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              options: [
                { name: 'Open', value: '2' },
                { name: 'Pending', value: '3' },
                { name: 'Resolved', value: '4' },
                { name: 'Closed', value: '5' },
              ],
            },
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              required: false,
              options: [
                { name: 'Low', value: '1' },
                { name: 'Medium', value: '2' },
                { name: 'High', value: '3' },
                { name: 'Urgent', value: '4' },
              ],
            },
            {
              id: 'responder_id',
              name: 'responderId',
              displayName: 'Agent ID',
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
          action: 'Delete a ticket',
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
      ],
    },
    
    // ============================================
    // CONTACT RESOURCE
    // ============================================
    {
      id: 'contact',
      name: 'Contact',
      value: 'contact',
      description: 'Manage contacts',
      operations: [
        {
          id: 'create_contact',
          name: 'Create Contact',
          value: 'create',
          description: 'Create a new contact',
          action: 'Create a new contact',
          fields: [
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
              id: 'mobile',
              name: 'mobile',
              displayName: 'Mobile',
              type: 'string',
              required: false,
            },
            {
              id: 'company_id',
              name: 'companyId',
              displayName: 'Company ID',
              type: 'number',
              required: false,
            },
            {
              id: 'job_title',
              name: 'jobTitle',
              displayName: 'Job Title',
              type: 'string',
              required: false,
            },
            {
              id: 'address',
              name: 'address',
              displayName: 'Address',
              type: 'text',
              required: false,
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
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
          id: 'get_contact',
          name: 'Get Contact',
          value: 'get',
          description: 'Get a contact',
          action: 'Retrieve contact details',
          fields: [
            {
              id: 'contact_id',
              name: 'contactId',
              displayName: 'Contact ID',
              type: 'number',
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
          action: 'List contacts',
          fields: [],
          optionalFields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Filter by Email',
              type: 'string',
              required: false,
            },
            {
              id: 'phone',
              name: 'phone',
              displayName: 'Filter by Phone',
              type: 'string',
              required: false,
            },
            {
              id: 'company_id',
              name: 'companyId',
              displayName: 'Company ID',
              type: 'number',
              required: false,
            },
          ],
        },
        {
          id: 'update_contact',
          name: 'Update Contact',
          value: 'update',
          description: 'Update a contact',
          action: 'Update contact properties',
          fields: [
            {
              id: 'contact_id',
              name: 'contactId',
              displayName: 'Contact ID',
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
              id: 'job_title',
              name: 'jobTitle',
              displayName: 'Job Title',
              type: 'string',
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
              type: 'number',
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
      description: 'Manage companies',
      operations: [
        {
          id: 'create_company',
          name: 'Create Company',
          value: 'create',
          description: 'Create a new company',
          action: 'Create a new company',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Company Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'domains',
              name: 'domains',
              displayName: 'Domains',
              type: 'string',
              required: false,
              description: 'Comma-separated email domains',
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
              required: false,
            },
            {
              id: 'note',
              name: 'note',
              displayName: 'Note',
              type: 'text',
              required: false,
            },
            {
              id: 'health_score',
              name: 'healthScore',
              displayName: 'Health Score',
              type: 'options',
              required: false,
              options: [
                { name: 'At Risk', value: 'at_risk' },
                { name: 'Doing Okay', value: 'doing_okay' },
                { name: 'Happy', value: 'happy' },
              ],
            },
            {
              id: 'industry',
              name: 'industry',
              displayName: 'Industry',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_company',
          name: 'Get Company',
          value: 'get',
          description: 'Get a company',
          action: 'Retrieve company details',
          fields: [
            {
              id: 'company_id',
              name: 'companyId',
              displayName: 'Company ID',
              type: 'number',
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
          action: 'List companies',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'update_company',
          name: 'Update Company',
          value: 'update',
          description: 'Update a company',
          action: 'Update company properties',
          fields: [
            {
              id: 'company_id',
              name: 'companyId',
              displayName: 'Company ID',
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
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
              required: false,
            },
            {
              id: 'health_score',
              name: 'healthScore',
              displayName: 'Health Score',
              type: 'options',
              required: false,
              options: [
                { name: 'At Risk', value: 'at_risk' },
                { name: 'Doing Okay', value: 'doing_okay' },
                { name: 'Happy', value: 'happy' },
              ],
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
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
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
      description: 'Manage ticket conversations',
      operations: [
        {
          id: 'create_reply',
          name: 'Create Reply',
          value: 'createReply',
          description: 'Reply to a ticket',
          action: 'Add a reply to a ticket',
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
              displayName: 'Body',
              type: 'text',
              required: true,
              description: 'HTML content of the reply',
              typeOptions: {
                rows: 5,
              },
            },
          ],
          optionalFields: [
            {
              id: 'from_email',
              name: 'fromEmail',
              displayName: 'From Email',
              type: 'string',
              required: false,
            },
            {
              id: 'cc_emails',
              name: 'ccEmails',
              displayName: 'CC Emails',
              type: 'string',
              required: false,
            },
            {
              id: 'bcc_emails',
              name: 'bccEmails',
              displayName: 'BCC Emails',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'create_note',
          name: 'Create Note',
          value: 'createNote',
          description: 'Add a private note',
          action: 'Add a private note to a ticket',
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
              displayName: 'Note',
              type: 'text',
              required: true,
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'private',
              name: 'private',
              displayName: 'Private',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'notify_emails',
              name: 'notifyEmails',
              displayName: 'Notify Emails',
              type: 'string',
              required: false,
              description: 'Comma-separated emails to notify',
            },
          ],
        },
        {
          id: 'get_conversations',
          name: 'Get Conversations',
          value: 'getMany',
          description: 'Get ticket conversations',
          action: 'List all conversations on a ticket',
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
      ],
    },
    
    // ============================================
    // AGENT RESOURCE
    // ============================================
    {
      id: 'agent',
      name: 'Agent',
      value: 'agent',
      description: 'Manage agents',
      operations: [
        {
          id: 'get_agents',
          name: 'Get Agents',
          value: 'getMany',
          description: 'Get all agents',
          action: 'List all agents',
          fields: [],
          optionalFields: [
            {
              id: 'state',
              name: 'state',
              displayName: 'State',
              type: 'options',
              required: false,
              options: [
                { name: 'Fulltime', value: 'fulltime' },
                { name: 'Occasional', value: 'occasional' },
              ],
            },
          ],
        },
        {
          id: 'get_agent',
          name: 'Get Agent',
          value: 'get',
          description: 'Get an agent',
          action: 'Retrieve agent details',
          fields: [
            {
              id: 'agent_id',
              name: 'agentId',
              displayName: 'Agent ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
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
      description: 'Manage groups',
      operations: [
        {
          id: 'get_groups',
          name: 'Get Groups',
          value: 'getMany',
          description: 'Get all groups',
          action: 'List all groups',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'get_group',
          name: 'Get Group',
          value: 'get',
          description: 'Get a group',
          action: 'Retrieve group details',
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
