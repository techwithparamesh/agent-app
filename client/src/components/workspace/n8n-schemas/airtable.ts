/**
 * Airtable n8n-style Schema
 * 
 * Comprehensive Airtable database operations
 */

import { N8nAppSchema } from './types';

export const airtableSchema: N8nAppSchema = {
  id: 'airtable',
  name: 'Airtable',
  description: 'Airtable spreadsheet database',
  version: '1.0.0',
  color: '#18BFFF',
  icon: 'airtable',
  group: ['database'],
  
  credentials: [
    {
      name: 'airtableApi',
      displayName: 'Airtable API',
      required: true,
      type: 'apiKey',
      properties: [
        {
          name: 'apiKey',
          displayName: 'API Key / Personal Access Token',
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
    // RECORD RESOURCE
    // ============================================
    {
      id: 'record',
      name: 'Record',
      value: 'record',
      description: 'Table records',
      operations: [
        {
          id: 'create_record',
          name: 'Create Record',
          value: 'create',
          description: 'Create a new record',
          action: 'Create a record',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
              placeholder: 'appXXXXXXXXXXXXXX',
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID or Name',
              type: 'string',
              required: true,
            },
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'json',
              required: true,
              description: 'Record fields as JSON object',
            },
          ],
          optionalFields: [
            {
              id: 'typecast',
              name: 'typecast',
              displayName: 'Typecast',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Automatically convert field values to the appropriate cell types',
            },
          ],
        },
        {
          id: 'get_record',
          name: 'Get Record',
          value: 'get',
          description: 'Get a record by ID',
          action: 'Retrieve a record',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID or Name',
              type: 'string',
              required: true,
            },
            {
              id: 'record_id',
              name: 'recordId',
              displayName: 'Record ID',
              type: 'string',
              required: true,
              placeholder: 'recXXXXXXXXXXXXXX',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_records',
          name: 'Get Records',
          value: 'getMany',
          description: 'Get all records from a table',
          action: 'List records',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID or Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'string',
              required: false,
              description: 'Comma-separated field names to return',
            },
            {
              id: 'filter_by_formula',
              name: 'filterByFormula',
              displayName: 'Filter By Formula',
              type: 'string',
              required: false,
              placeholder: 'AND({Status}="Active",{Count}>5)',
            },
            {
              id: 'max_records',
              name: 'maxRecords',
              displayName: 'Max Records',
              type: 'number',
              required: false,
            },
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 100,
            },
            {
              id: 'sort',
              name: 'sort',
              displayName: 'Sort',
              type: 'json',
              required: false,
              description: 'Array of sort objects: [{"field": "Name", "direction": "asc"}]',
            },
            {
              id: 'view',
              name: 'view',
              displayName: 'View',
              type: 'string',
              required: false,
              description: 'View name or ID to filter by',
            },
            {
              id: 'cell_format',
              name: 'cellFormat',
              displayName: 'Cell Format',
              type: 'options',
              required: false,
              default: 'json',
              options: [
                { name: 'JSON', value: 'json' },
                { name: 'String', value: 'string' },
              ],
            },
            {
              id: 'time_zone',
              name: 'timeZone',
              displayName: 'Time Zone',
              type: 'string',
              required: false,
            },
            {
              id: 'user_locale',
              name: 'userLocale',
              displayName: 'User Locale',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'update_record',
          name: 'Update Record',
          value: 'update',
          description: 'Update a record',
          action: 'Update a record',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID or Name',
              type: 'string',
              required: true,
            },
            {
              id: 'record_id',
              name: 'recordId',
              displayName: 'Record ID',
              type: 'string',
              required: true,
            },
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'json',
              required: true,
              description: 'Fields to update as JSON object',
            },
          ],
          optionalFields: [
            {
              id: 'typecast',
              name: 'typecast',
              displayName: 'Typecast',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'upsert_records',
          name: 'Upsert Records',
          value: 'upsert',
          description: 'Create or update records',
          action: 'Upsert records',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID or Name',
              type: 'string',
              required: true,
            },
            {
              id: 'records',
              name: 'records',
              displayName: 'Records',
              type: 'json',
              required: true,
              description: 'Array of record objects with fields',
            },
            {
              id: 'fields_to_merge_on',
              name: 'fieldsToMergeOn',
              displayName: 'Fields to Merge On',
              type: 'string',
              required: true,
              description: 'Comma-separated field names used to match records',
            },
          ],
          optionalFields: [
            {
              id: 'typecast',
              name: 'typecast',
              displayName: 'Typecast',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'delete_record',
          name: 'Delete Record',
          value: 'delete',
          description: 'Delete a record',
          action: 'Delete a record',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID or Name',
              type: 'string',
              required: true,
            },
            {
              id: 'record_id',
              name: 'recordId',
              displayName: 'Record ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'search_records',
          name: 'Search Records',
          value: 'search',
          description: 'Search records using formula',
          action: 'Search records',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID or Name',
              type: 'string',
              required: true,
            },
            {
              id: 'filter_by_formula',
              name: 'filterByFormula',
              displayName: 'Filter By Formula',
              type: 'string',
              required: true,
              placeholder: '{Email}="john@example.com"',
            },
          ],
          optionalFields: [
            {
              id: 'return_first_match',
              name: 'returnFirstMatch',
              displayName: 'Return First Match Only',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // BASE RESOURCE
    // ============================================
    {
      id: 'base',
      name: 'Base',
      value: 'base',
      description: 'Airtable bases',
      operations: [
        {
          id: 'get_bases',
          name: 'Get Bases',
          value: 'getMany',
          description: 'Get all bases',
          action: 'List bases',
          fields: [],
          optionalFields: [
            {
              id: 'offset',
              name: 'offset',
              displayName: 'Offset',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_base_schema',
          name: 'Get Base Schema',
          value: 'getSchema',
          description: 'Get the schema of a base',
          action: 'Get base schema',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // TABLE RESOURCE
    // ============================================
    {
      id: 'table',
      name: 'Table',
      value: 'table',
      description: 'Base tables',
      operations: [
        {
          id: 'create_table',
          name: 'Create Table',
          value: 'create',
          description: 'Create a new table',
          action: 'Create a table',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'json',
              required: true,
              description: 'Array of field definitions',
            },
          ],
          optionalFields: [
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'update_table',
          name: 'Update Table',
          value: 'update',
          description: 'Update a table',
          action: 'Update a table',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'New Name',
              type: 'string',
              required: false,
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // FIELD RESOURCE
    // ============================================
    {
      id: 'field',
      name: 'Field',
      value: 'field',
      description: 'Table fields',
      operations: [
        {
          id: 'create_field',
          name: 'Create Field',
          value: 'create',
          description: 'Create a new field',
          action: 'Create a field',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID',
              type: 'string',
              required: true,
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'Field Name',
              type: 'string',
              required: true,
            },
            {
              id: 'type',
              name: 'type',
              displayName: 'Field Type',
              type: 'options',
              required: true,
              options: [
                { name: 'Single Line Text', value: 'singleLineText' },
                { name: 'Long Text', value: 'multilineText' },
                { name: 'Email', value: 'email' },
                { name: 'URL', value: 'url' },
                { name: 'Phone Number', value: 'phoneNumber' },
                { name: 'Number', value: 'number' },
                { name: 'Currency', value: 'currency' },
                { name: 'Percent', value: 'percent' },
                { name: 'Duration', value: 'duration' },
                { name: 'Rating', value: 'rating' },
                { name: 'Date', value: 'date' },
                { name: 'Date Time', value: 'dateTime' },
                { name: 'Checkbox', value: 'checkbox' },
                { name: 'Single Select', value: 'singleSelect' },
                { name: 'Multiple Select', value: 'multipleSelects' },
                { name: 'Linked Record', value: 'multipleRecordLinks' },
                { name: 'Attachment', value: 'multipleAttachments' },
                { name: 'Rich Text', value: 'richText' },
                { name: 'Barcode', value: 'barcode' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'options',
              name: 'options',
              displayName: 'Options',
              type: 'json',
              required: false,
              description: 'Field-specific options (varies by type)',
            },
          ],
        },
        {
          id: 'update_field',
          name: 'Update Field',
          value: 'update',
          description: 'Update a field',
          action: 'Update a field',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID',
              type: 'string',
              required: true,
            },
            {
              id: 'field_id',
              name: 'fieldId',
              displayName: 'Field ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'New Name',
              type: 'string',
              required: false,
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
          ],
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
      description: 'Record comments',
      operations: [
        {
          id: 'create_comment',
          name: 'Create Comment',
          value: 'create',
          description: 'Create a comment on a record',
          action: 'Create a comment',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID',
              type: 'string',
              required: true,
            },
            {
              id: 'record_id',
              name: 'recordId',
              displayName: 'Record ID',
              type: 'string',
              required: true,
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Comment',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 3,
              },
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_comments',
          name: 'Get Comments',
          value: 'getMany',
          description: 'Get comments on a record',
          action: 'List comments',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_id',
              name: 'tableId',
              displayName: 'Table ID',
              type: 'string',
              required: true,
            },
            {
              id: 'record_id',
              name: 'recordId',
              displayName: 'Record ID',
              type: 'string',
              required: true,
            },
          ],
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
      ],
    },
    
    // ============================================
    // WEBHOOK RESOURCE
    // ============================================
    {
      id: 'webhook',
      name: 'Webhook',
      value: 'webhook',
      description: 'Airtable webhooks',
      operations: [
        {
          id: 'create_webhook',
          name: 'Create Webhook',
          value: 'create',
          description: 'Create a webhook',
          action: 'Create a webhook',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'notification_url',
              name: 'notificationUrl',
              displayName: 'Notification URL',
              type: 'string',
              required: true,
            },
            {
              id: 'specification',
              name: 'specification',
              displayName: 'Specification',
              type: 'json',
              required: true,
              description: 'Webhook specification including triggers and watched tables',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_webhooks',
          name: 'Get Webhooks',
          value: 'getMany',
          description: 'Get all webhooks for a base',
          action: 'List webhooks',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_webhook',
          name: 'Delete Webhook',
          value: 'delete',
          description: 'Delete a webhook',
          action: 'Delete a webhook',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'webhook_id',
              name: 'webhookId',
              displayName: 'Webhook ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'refresh_webhook',
          name: 'Refresh Webhook',
          value: 'refresh',
          description: 'Refresh a webhook',
          action: 'Refresh a webhook',
          fields: [
            {
              id: 'base_id',
              name: 'baseId',
              displayName: 'Base ID',
              type: 'string',
              required: true,
            },
            {
              id: 'webhook_id',
              name: 'webhookId',
              displayName: 'Webhook ID',
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
