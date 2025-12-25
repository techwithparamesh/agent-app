/**
 * Notion n8n-style Schema
 * 
 * Comprehensive Notion workspace operations
 */

import { N8nAppSchema } from './types';

export const notionSchema: N8nAppSchema = {
  id: 'notion',
  name: 'Notion',
  description: 'Notion workspace and collaboration',
  version: '1.0.0',
  color: '#000000',
  icon: 'notion',
  group: ['productivity'],
  
  credentials: [
    {
      name: 'notionApi',
      displayName: 'Notion API',
      required: true,
      type: 'apiKey',
      properties: [
        {
          name: 'apiKey',
          displayName: 'Integration Token',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
          placeholder: 'secret_...',
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // DATABASE RESOURCE
    // ============================================
    {
      id: 'database',
      name: 'Database',
      value: 'database',
      description: 'Notion databases',
      operations: [
        {
          id: 'get_database',
          name: 'Get Database',
          value: 'get',
          description: 'Get a database',
          action: 'Retrieve a database',
          fields: [
            {
              id: 'database_id',
              name: 'databaseId',
              displayName: 'Database ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'query_database',
          name: 'Query Database',
          value: 'query',
          description: 'Query a database',
          action: 'Query database items',
          fields: [
            {
              id: 'database_id',
              name: 'databaseId',
              displayName: 'Database ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"property": "Status", "select": {"equals": "Done"}}',
            },
            {
              id: 'sorts',
              name: 'sorts',
              displayName: 'Sorts (JSON)',
              type: 'json',
              required: false,
              placeholder: '[{"property": "Created", "direction": "descending"}]',
            },
            {
              id: 'start_cursor',
              name: 'start_cursor',
              displayName: 'Start Cursor',
              type: 'string',
              required: false,
            },
            {
              id: 'page_size',
              name: 'page_size',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
        {
          id: 'create_database',
          name: 'Create Database',
          value: 'create',
          description: 'Create a database',
          action: 'Create a database',
          fields: [
            {
              id: 'parent_page_id',
              name: 'parent.page_id',
              displayName: 'Parent Page ID',
              type: 'string',
              required: true,
            },
            {
              id: 'title',
              name: 'title',
              displayName: 'Title',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'properties',
              name: 'properties',
              displayName: 'Properties (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"Name": {"title": {}}, "Status": {"select": {"options": [...]}}}',
            },
            {
              id: 'icon',
              name: 'icon',
              displayName: 'Icon (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"emoji": "📊"}',
            },
            {
              id: 'cover',
              name: 'cover',
              displayName: 'Cover (JSON)',
              type: 'json',
              required: false,
            },
            {
              id: 'is_inline',
              name: 'is_inline',
              displayName: 'Is Inline',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'update_database',
          name: 'Update Database',
          value: 'update',
          description: 'Update a database',
          action: 'Update a database',
          fields: [
            {
              id: 'database_id',
              name: 'databaseId',
              displayName: 'Database ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'title',
              name: 'title',
              displayName: 'Title',
              type: 'string',
              required: false,
            },
            {
              id: 'properties',
              name: 'properties',
              displayName: 'Properties (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // PAGE RESOURCE
    // ============================================
    {
      id: 'page',
      name: 'Page',
      value: 'page',
      description: 'Notion pages',
      operations: [
        {
          id: 'create_page',
          name: 'Create Page',
          value: 'create',
          description: 'Create a new page',
          action: 'Create a page',
          fields: [
            {
              id: 'parent_type',
              name: 'parentType',
              displayName: 'Parent Type',
              type: 'options',
              required: true,
              options: [
                { name: 'Database', value: 'database_id' },
                { name: 'Page', value: 'page_id' },
              ],
            },
            {
              id: 'parent_id',
              name: 'parentId',
              displayName: 'Parent ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'properties',
              name: 'properties',
              displayName: 'Properties (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"Name": {"title": [{"text": {"content": "Page Title"}}]}}',
            },
            {
              id: 'children',
              name: 'children',
              displayName: 'Content Blocks (JSON)',
              type: 'json',
              required: false,
              placeholder: '[{"object": "block", "type": "paragraph", "paragraph": {...}}]',
            },
            {
              id: 'icon',
              name: 'icon',
              displayName: 'Icon (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"emoji": "📄"}',
            },
            {
              id: 'cover',
              name: 'cover',
              displayName: 'Cover (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'get_page',
          name: 'Get Page',
          value: 'get',
          description: 'Get a page',
          action: 'Retrieve a page',
          fields: [
            {
              id: 'page_id',
              name: 'pageId',
              displayName: 'Page ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'update_page',
          name: 'Update Page',
          value: 'update',
          description: 'Update a page',
          action: 'Update a page',
          fields: [
            {
              id: 'page_id',
              name: 'pageId',
              displayName: 'Page ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'properties',
              name: 'properties',
              displayName: 'Properties (JSON)',
              type: 'json',
              required: false,
            },
            {
              id: 'icon',
              name: 'icon',
              displayName: 'Icon (JSON)',
              type: 'json',
              required: false,
            },
            {
              id: 'cover',
              name: 'cover',
              displayName: 'Cover (JSON)',
              type: 'json',
              required: false,
            },
            {
              id: 'archived',
              name: 'archived',
              displayName: 'Archive',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'archive_page',
          name: 'Archive Page',
          value: 'archive',
          description: 'Archive a page',
          action: 'Archive a page',
          fields: [
            {
              id: 'page_id',
              name: 'pageId',
              displayName: 'Page ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // BLOCK RESOURCE
    // ============================================
    {
      id: 'block',
      name: 'Block',
      value: 'block',
      description: 'Page content blocks',
      operations: [
        {
          id: 'get_block',
          name: 'Get Block',
          value: 'get',
          description: 'Get a block',
          action: 'Retrieve a block',
          fields: [
            {
              id: 'block_id',
              name: 'blockId',
              displayName: 'Block ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_block_children',
          name: 'Get Block Children',
          value: 'getChildren',
          description: 'Get block children',
          action: 'List block children',
          fields: [
            {
              id: 'block_id',
              name: 'blockId',
              displayName: 'Block/Page ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'start_cursor',
              name: 'start_cursor',
              displayName: 'Start Cursor',
              type: 'string',
              required: false,
            },
            {
              id: 'page_size',
              name: 'page_size',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
        {
          id: 'append_block_children',
          name: 'Append Block Children',
          value: 'append',
          description: 'Append blocks to a page/block',
          action: 'Append content blocks',
          fields: [
            {
              id: 'block_id',
              name: 'blockId',
              displayName: 'Block/Page ID',
              type: 'string',
              required: true,
            },
            {
              id: 'children',
              name: 'children',
              displayName: 'Children Blocks (JSON)',
              type: 'json',
              required: true,
              placeholder: '[{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Hello"}}]}}]',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'update_block',
          name: 'Update Block',
          value: 'update',
          description: 'Update a block',
          action: 'Update a block',
          fields: [
            {
              id: 'block_id',
              name: 'blockId',
              displayName: 'Block ID',
              type: 'string',
              required: true,
            },
            {
              id: 'block_type',
              name: 'blockType',
              displayName: 'Block Type',
              type: 'options',
              required: true,
              options: [
                { name: 'Paragraph', value: 'paragraph' },
                { name: 'Heading 1', value: 'heading_1' },
                { name: 'Heading 2', value: 'heading_2' },
                { name: 'Heading 3', value: 'heading_3' },
                { name: 'Bulleted List', value: 'bulleted_list_item' },
                { name: 'Numbered List', value: 'numbered_list_item' },
                { name: 'To-do', value: 'to_do' },
                { name: 'Toggle', value: 'toggle' },
                { name: 'Code', value: 'code' },
                { name: 'Quote', value: 'quote' },
                { name: 'Callout', value: 'callout' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'content',
              name: 'content',
              displayName: 'Block Content (JSON)',
              type: 'json',
              required: false,
            },
            {
              id: 'archived',
              name: 'archived',
              displayName: 'Archive',
              type: 'boolean',
              required: false,
            },
          ],
        },
        {
          id: 'delete_block',
          name: 'Delete Block',
          value: 'delete',
          description: 'Delete a block',
          action: 'Delete a block',
          fields: [
            {
              id: 'block_id',
              name: 'blockId',
              displayName: 'Block ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
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
      description: 'Workspace users',
      operations: [
        {
          id: 'get_user',
          name: 'Get User',
          value: 'get',
          description: 'Get a user',
          action: 'Retrieve a user',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_users',
          name: 'Get Users',
          value: 'getMany',
          description: 'Get all users',
          action: 'List all users',
          fields: [],
          optionalFields: [
            {
              id: 'start_cursor',
              name: 'start_cursor',
              displayName: 'Start Cursor',
              type: 'string',
              required: false,
            },
            {
              id: 'page_size',
              name: 'page_size',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
        {
          id: 'get_me',
          name: 'Get Current User',
          value: 'getMe',
          description: 'Get the bot user',
          action: 'Get current user',
          fields: [],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // SEARCH RESOURCE
    // ============================================
    {
      id: 'search',
      name: 'Search',
      value: 'search',
      description: 'Search workspace',
      operations: [
        {
          id: 'search_all',
          name: 'Search',
          value: 'search',
          description: 'Search pages and databases',
          action: 'Search the workspace',
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
              id: 'filter_type',
              name: 'filter.value',
              displayName: 'Filter Type',
              type: 'options',
              required: false,
              options: [
                { name: 'All', value: '' },
                { name: 'Pages Only', value: 'page' },
                { name: 'Databases Only', value: 'database' },
              ],
            },
            {
              id: 'sort_direction',
              name: 'sort.direction',
              displayName: 'Sort Direction',
              type: 'options',
              required: false,
              default: 'descending',
              options: [
                { name: 'Ascending (Oldest First)', value: 'ascending' },
                { name: 'Descending (Newest First)', value: 'descending' },
              ],
            },
            {
              id: 'start_cursor',
              name: 'start_cursor',
              displayName: 'Start Cursor',
              type: 'string',
              required: false,
            },
            {
              id: 'page_size',
              name: 'page_size',
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
    // COMMENT RESOURCE
    // ============================================
    {
      id: 'comment',
      name: 'Comment',
      value: 'comment',
      description: 'Page comments',
      operations: [
        {
          id: 'create_comment',
          name: 'Create Comment',
          value: 'create',
          description: 'Create a comment',
          action: 'Add a comment',
          fields: [
            {
              id: 'parent_type',
              name: 'parentType',
              displayName: 'Comment On',
              type: 'options',
              required: true,
              options: [
                { name: 'Page', value: 'page_id' },
                { name: 'Discussion', value: 'discussion_id' },
              ],
            },
            {
              id: 'parent_id',
              name: 'parentId',
              displayName: 'Page/Discussion ID',
              type: 'string',
              required: true,
            },
            {
              id: 'rich_text',
              name: 'rich_text',
              displayName: 'Comment Text (JSON)',
              type: 'json',
              required: true,
              placeholder: '[{"text": {"content": "This is a comment"}}]',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_comments',
          name: 'Get Comments',
          value: 'getMany',
          description: 'Get comments on a block',
          action: 'List comments',
          fields: [
            {
              id: 'block_id',
              name: 'blockId',
              displayName: 'Block/Page ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'start_cursor',
              name: 'start_cursor',
              displayName: 'Start Cursor',
              type: 'string',
              required: false,
            },
            {
              id: 'page_size',
              name: 'page_size',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
      ],
    },
  ],
};
