/**
 * SendGrid n8n-style Schema
 * 
 * Comprehensive SendGrid Email API operations
 */

import { N8nAppSchema } from './types';

export const sendgridSchema: N8nAppSchema = {
  id: 'sendgrid',
  name: 'SendGrid',
  description: 'SendGrid email delivery and marketing platform',
  version: '1.0.0',
  color: '#1A82E2',
  icon: 'sendgrid',
  group: ['email', 'marketing'],
  
  credentials: [
    {
      name: 'sendgridApi',
      displayName: 'SendGrid API Key',
      required: true,
      type: 'apiKey',
    },
  ],
  
  resources: [
    // ============================================
    // MAIL RESOURCE
    // ============================================
    {
      id: 'mail',
      name: 'Mail',
      value: 'mail',
      description: 'Send emails',
      operations: [
        {
          id: 'send_email',
          name: 'Send Email',
          value: 'send',
          description: 'Send an email',
          action: 'Send a new email via SendGrid',
          fields: [
            {
              id: 'to',
              name: 'to',
              displayName: 'To Email',
              type: 'string',
              required: true,
              description: 'Recipient email address',
              placeholder: 'recipient@example.com',
            },
            {
              id: 'from',
              name: 'from',
              displayName: 'From Email',
              type: 'string',
              required: true,
              description: 'Verified sender email',
              placeholder: 'sender@yourdomain.com',
            },
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'content_type',
              name: 'contentType',
              displayName: 'Content Type',
              type: 'options',
              required: false,
              default: 'text/plain',
              options: [
                { name: 'Plain Text', value: 'text/plain' },
                { name: 'HTML', value: 'text/html' },
              ],
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Plain Text Content',
              type: 'text',
              required: false,
              typeOptions: {
                rows: 6,
              },
              displayOptions: {
                show: {
                  contentType: ['text/plain'],
                },
              },
            },
            {
              id: 'html',
              name: 'html',
              displayName: 'HTML Content',
              type: 'text',
              required: false,
              typeOptions: {
                rows: 8,
              },
              displayOptions: {
                show: {
                  contentType: ['text/html'],
                },
              },
            },
            {
              id: 'from_name',
              name: 'fromName',
              displayName: 'From Name',
              type: 'string',
              required: false,
            },
            {
              id: 'to_name',
              name: 'toName',
              displayName: 'To Name',
              type: 'string',
              required: false,
            },
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
              type: 'string',
              required: false,
              description: 'SendGrid dynamic template ID',
            },
            {
              id: 'dynamic_template_data',
              name: 'dynamicTemplateData',
              displayName: 'Template Data (JSON)',
              type: 'json',
              required: false,
              description: 'Data to merge with template',
            },
            {
              id: 'categories',
              name: 'categories',
              displayName: 'Categories',
              type: 'string',
              required: false,
              description: 'Comma-separated categories for analytics',
            },
            {
              id: 'custom_args',
              name: 'customArgs',
              displayName: 'Custom Args (JSON)',
              type: 'json',
              required: false,
              description: 'Custom arguments for webhooks',
            },
            {
              id: 'send_at',
              name: 'sendAt',
              displayName: 'Send At',
              type: 'dateTime',
              required: false,
              description: 'Schedule send time (Unix timestamp)',
            },
            {
              id: 'attachments',
              name: 'attachments',
              displayName: 'Attachments (JSON)',
              type: 'json',
              required: false,
            },
          ],
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
      description: 'Manage marketing contacts',
      operations: [
        {
          id: 'create_contact',
          name: 'Create/Update Contact',
          value: 'upsert',
          description: 'Create or update a contact',
          action: 'Create or update a marketing contact',
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
              id: 'address_line_1',
              name: 'addressLine1',
              displayName: 'Address Line 1',
              type: 'string',
              required: false,
            },
            {
              id: 'address_line_2',
              name: 'addressLine2',
              displayName: 'Address Line 2',
              type: 'string',
              required: false,
            },
            {
              id: 'city',
              name: 'city',
              displayName: 'City',
              type: 'string',
              required: false,
            },
            {
              id: 'state',
              name: 'stateProvinceRegion',
              displayName: 'State/Province',
              type: 'string',
              required: false,
            },
            {
              id: 'postal_code',
              name: 'postalCode',
              displayName: 'Postal Code',
              type: 'string',
              required: false,
            },
            {
              id: 'country',
              name: 'country',
              displayName: 'Country',
              type: 'string',
              required: false,
            },
            {
              id: 'phone_number',
              name: 'phoneNumber',
              displayName: 'Phone Number',
              type: 'string',
              required: false,
            },
            {
              id: 'list_ids',
              name: 'listIds',
              displayName: 'List IDs',
              type: 'string',
              required: false,
              description: 'Comma-separated list IDs to add contact to',
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
          id: 'get_contacts',
          name: 'Get Contacts',
          value: 'getMany',
          description: 'Get all contacts',
          action: 'List marketing contacts',
          fields: [],
          optionalFields: [
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 50,
              typeOptions: {
                minValue: 1,
                maxValue: 1000,
              },
            },
          ],
        },
        {
          id: 'search_contacts',
          name: 'Search Contacts',
          value: 'search',
          description: 'Search for contacts',
          action: 'Search contacts by query',
          fields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Search Query',
              type: 'string',
              required: true,
              description: 'SGQL query string',
              placeholder: "email LIKE '%@example.com'",
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_contacts',
          name: 'Delete Contacts',
          value: 'delete',
          description: 'Delete contacts',
          action: 'Delete contacts by ID or email',
          fields: [
            {
              id: 'delete_by',
              name: 'deleteBy',
              displayName: 'Delete By',
              type: 'options',
              required: true,
              default: 'ids',
              options: [
                { name: 'Contact IDs', value: 'ids' },
                { name: 'Emails', value: 'emails' },
                { name: 'All', value: 'all' },
              ],
            },
            {
              id: 'ids',
              name: 'ids',
              displayName: 'Contact IDs',
              type: 'string',
              required: false,
              description: 'Comma-separated contact IDs',
              displayOptions: {
                show: {
                  deleteBy: ['ids'],
                },
              },
            },
            {
              id: 'emails',
              name: 'emails',
              displayName: 'Emails',
              type: 'string',
              required: false,
              description: 'Comma-separated emails',
              displayOptions: {
                show: {
                  deleteBy: ['emails'],
                },
              },
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // LIST RESOURCE
    // ============================================
    {
      id: 'list',
      name: 'List',
      value: 'list',
      description: 'Manage contact lists',
      operations: [
        {
          id: 'create_list',
          name: 'Create List',
          value: 'create',
          description: 'Create a new list',
          action: 'Create a new contact list',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'List Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_lists',
          name: 'Get Lists',
          value: 'getMany',
          description: 'Get all lists',
          action: 'List all contact lists',
          fields: [],
          optionalFields: [
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
        {
          id: 'get_list',
          name: 'Get List',
          value: 'get',
          description: 'Get a list',
          action: 'Retrieve a specific list',
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
        {
          id: 'update_list',
          name: 'Update List',
          value: 'update',
          description: 'Update a list',
          action: 'Update list properties',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List ID',
              type: 'string',
              required: true,
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'New Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_list',
          name: 'Delete List',
          value: 'delete',
          description: 'Delete a list',
          action: 'Delete a contact list',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'delete_contacts',
              name: 'deleteContacts',
              displayName: 'Delete Contacts',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Also delete all contacts in the list',
            },
          ],
        },
        {
          id: 'add_to_list',
          name: 'Add Contacts to List',
          value: 'addContacts',
          description: 'Add contacts to a list',
          action: 'Add contacts to a list',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List ID',
              type: 'string',
              required: true,
            },
            {
              id: 'contact_ids',
              name: 'contactIds',
              displayName: 'Contact IDs',
              type: 'string',
              required: true,
              description: 'Comma-separated contact IDs',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'remove_from_list',
          name: 'Remove Contacts from List',
          value: 'removeContacts',
          description: 'Remove contacts from a list',
          action: 'Remove contacts from a list',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List ID',
              type: 'string',
              required: true,
            },
            {
              id: 'contact_ids',
              name: 'contactIds',
              displayName: 'Contact IDs',
              type: 'string',
              required: true,
              description: 'Comma-separated contact IDs',
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // TEMPLATE RESOURCE
    // ============================================
    {
      id: 'template',
      name: 'Template',
      value: 'template',
      description: 'Manage email templates',
      operations: [
        {
          id: 'get_templates',
          name: 'Get Templates',
          value: 'getMany',
          description: 'Get all templates',
          action: 'List all email templates',
          fields: [],
          optionalFields: [
            {
              id: 'generations',
              name: 'generations',
              displayName: 'Template Type',
              type: 'options',
              required: false,
              default: 'dynamic',
              options: [
                { name: 'Dynamic', value: 'dynamic' },
                { name: 'Legacy', value: 'legacy' },
              ],
            },
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'get_template',
          name: 'Get Template',
          value: 'get',
          description: 'Get a template',
          action: 'Retrieve a specific template',
          fields: [
            {
              id: 'template_id',
              name: 'templateId',
              displayName: 'Template ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'create_template',
          name: 'Create Template',
          value: 'create',
          description: 'Create a new template',
          action: 'Create a new email template',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Template Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'generation',
              name: 'generation',
              displayName: 'Generation',
              type: 'options',
              required: false,
              default: 'dynamic',
              options: [
                { name: 'Dynamic', value: 'dynamic' },
                { name: 'Legacy', value: 'legacy' },
              ],
            },
          ],
        },
        {
          id: 'delete_template',
          name: 'Delete Template',
          value: 'delete',
          description: 'Delete a template',
          action: 'Delete an email template',
          fields: [
            {
              id: 'template_id',
              name: 'templateId',
              displayName: 'Template ID',
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
