/**
 * Monday.com n8n-style Schema
 * 
 * Comprehensive Monday.com work management operations
 */

import { N8nAppSchema } from './types';

export const mondaySchema: N8nAppSchema = {
  id: 'monday',
  name: 'Monday.com',
  description: 'Monday.com work operating system',
  version: '1.0.0',
  color: '#6161FF',
  icon: 'monday',
  group: ['productivity'],
  
  credentials: [
    {
      name: 'mondayApi',
      displayName: 'Monday.com API',
      required: true,
      type: 'apiKey',
      properties: [
        {
          name: 'apiToken',
          displayName: 'API Token',
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
    // BOARD RESOURCE
    // ============================================
    {
      id: 'board',
      name: 'Board',
      value: 'board',
      description: 'Monday boards',
      operations: [
        {
          id: 'create_board',
          name: 'Create Board',
          value: 'create',
          description: 'Create a new board',
          action: 'Create a board',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: true,
            },
            {
              id: 'board_kind',
              name: 'boardKind',
              displayName: 'Board Kind',
              type: 'options',
              required: true,
              default: 'public',
              options: [
                { name: 'Public', value: 'public' },
                { name: 'Private', value: 'private' },
                { name: 'Share', value: 'share' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'workspace_id',
              name: 'workspaceId',
              displayName: 'Workspace ID',
              type: 'number',
              required: false,
            },
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Folder ID',
              type: 'number',
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
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_board',
          name: 'Get Board',
          value: 'get',
          description: 'Get a board by ID',
          action: 'Retrieve a board',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_boards',
          name: 'Get Boards',
          value: 'getMany',
          description: 'Get all boards',
          action: 'List all boards',
          fields: [],
          optionalFields: [
            {
              id: 'workspace_id',
              name: 'workspaceId',
              displayName: 'Workspace ID',
              type: 'number',
              required: false,
            },
            {
              id: 'board_kind',
              name: 'boardKind',
              displayName: 'Board Kind',
              type: 'options',
              required: false,
              options: [
                { name: 'Public', value: 'public' },
                { name: 'Private', value: 'private' },
                { name: 'Share', value: 'share' },
              ],
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 25,
            },
          ],
        },
        {
          id: 'archive_board',
          name: 'Archive Board',
          value: 'archive',
          description: 'Archive a board',
          action: 'Archive a board',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
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
      description: 'Board groups',
      operations: [
        {
          id: 'create_group',
          name: 'Create Group',
          value: 'create',
          description: 'Create a group in a board',
          action: 'Create a group',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
            {
              id: 'group_name',
              name: 'groupName',
              displayName: 'Group Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'color',
              name: 'color',
              displayName: 'Color',
              type: 'options',
              required: false,
              options: [
                { name: 'Green', value: '#00c875' },
                { name: 'Yellow', value: '#fdab3d' },
                { name: 'Red', value: '#e2445c' },
                { name: 'Purple', value: '#a25ddc' },
                { name: 'Blue', value: '#0086c0' },
                { name: 'Orange', value: '#ff642e' },
                { name: 'Teal', value: '#00d2d2' },
                { name: 'Pink', value: '#ff007f' },
              ],
            },
            {
              id: 'position',
              name: 'position',
              displayName: 'Position',
              type: 'string',
              required: false,
              description: 'Position relative to other groups',
            },
          ],
        },
        {
          id: 'get_groups',
          name: 'Get Groups',
          value: 'getMany',
          description: 'Get all groups in a board',
          action: 'List groups',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'archive_group',
          name: 'Archive Group',
          value: 'archive',
          description: 'Archive a group',
          action: 'Archive a group',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
            {
              id: 'group_id',
              name: 'groupId',
              displayName: 'Group ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_group',
          name: 'Delete Group',
          value: 'delete',
          description: 'Delete a group',
          action: 'Delete a group',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
            {
              id: 'group_id',
              name: 'groupId',
              displayName: 'Group ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // ITEM RESOURCE
    // ============================================
    {
      id: 'item',
      name: 'Item',
      value: 'item',
      description: 'Board items (rows)',
      operations: [
        {
          id: 'create_item',
          name: 'Create Item',
          value: 'create',
          description: 'Create a new item',
          action: 'Create an item',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
            {
              id: 'item_name',
              name: 'itemName',
              displayName: 'Item Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'group_id',
              name: 'groupId',
              displayName: 'Group ID',
              type: 'string',
              required: false,
            },
            {
              id: 'column_values',
              name: 'columnValues',
              displayName: 'Column Values',
              type: 'json',
              required: false,
              description: 'JSON object mapping column IDs to values',
            },
            {
              id: 'create_labels_if_missing',
              name: 'createLabelsIfMissing',
              displayName: 'Create Labels If Missing',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'get_item',
          name: 'Get Item',
          value: 'get',
          description: 'Get an item by ID',
          action: 'Retrieve an item',
          fields: [
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_items',
          name: 'Get Items',
          value: 'getMany',
          description: 'Get all items from a board',
          action: 'List items',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'group_id',
              name: 'groupId',
              displayName: 'Group ID',
              type: 'string',
              required: false,
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 25,
            },
            {
              id: 'cursor',
              name: 'cursor',
              displayName: 'Cursor',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'update_item',
          name: 'Update Item',
          value: 'update',
          description: 'Update an item',
          action: 'Update an item',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
              type: 'string',
              required: true,
            },
            {
              id: 'column_values',
              name: 'columnValues',
              displayName: 'Column Values',
              type: 'json',
              required: true,
              description: 'JSON object mapping column IDs to values',
            },
          ],
          optionalFields: [
            {
              id: 'create_labels_if_missing',
              name: 'createLabelsIfMissing',
              displayName: 'Create Labels If Missing',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'delete_item',
          name: 'Delete Item',
          value: 'delete',
          description: 'Delete an item',
          action: 'Delete an item',
          fields: [
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'archive_item',
          name: 'Archive Item',
          value: 'archive',
          description: 'Archive an item',
          action: 'Archive an item',
          fields: [
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'move_item_to_group',
          name: 'Move Item to Group',
          value: 'moveToGroup',
          description: 'Move an item to a different group',
          action: 'Move item to group',
          fields: [
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
              type: 'string',
              required: true,
            },
            {
              id: 'group_id',
              name: 'groupId',
              displayName: 'Target Group ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'duplicate_item',
          name: 'Duplicate Item',
          value: 'duplicate',
          description: 'Duplicate an item',
          action: 'Duplicate an item',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'with_updates',
              name: 'withUpdates',
              displayName: 'Include Updates',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // SUBITEM RESOURCE
    // ============================================
    {
      id: 'subitem',
      name: 'Subitem',
      value: 'subitem',
      description: 'Item subitems',
      operations: [
        {
          id: 'create_subitem',
          name: 'Create Subitem',
          value: 'create',
          description: 'Create a subitem',
          action: 'Create a subitem',
          fields: [
            {
              id: 'parent_item_id',
              name: 'parentItemId',
              displayName: 'Parent Item ID',
              type: 'string',
              required: true,
            },
            {
              id: 'item_name',
              name: 'itemName',
              displayName: 'Subitem Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'column_values',
              name: 'columnValues',
              displayName: 'Column Values',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'get_subitems',
          name: 'Get Subitems',
          value: 'getMany',
          description: 'Get subitems of an item',
          action: 'List subitems',
          fields: [
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // UPDATE (COMMENT) RESOURCE
    // ============================================
    {
      id: 'update',
      name: 'Update',
      value: 'update_resource',
      description: 'Item updates/comments',
      operations: [
        {
          id: 'create_update',
          name: 'Create Update',
          value: 'create',
          description: 'Create an update on an item',
          action: 'Create an update',
          fields: [
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
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
                rows: 3,
              },
            },
          ],
          optionalFields: [
            {
              id: 'parent_id',
              name: 'parentId',
              displayName: 'Parent Update ID',
              type: 'string',
              required: false,
              description: 'For replies to existing updates',
            },
          ],
        },
        {
          id: 'get_updates',
          name: 'Get Updates',
          value: 'getMany',
          description: 'Get updates on an item',
          action: 'List updates',
          fields: [
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
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
              default: 25,
            },
          ],
        },
        {
          id: 'delete_update',
          name: 'Delete Update',
          value: 'delete',
          description: 'Delete an update',
          action: 'Delete an update',
          fields: [
            {
              id: 'update_id',
              name: 'updateId',
              displayName: 'Update ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'like_update',
          name: 'Like Update',
          value: 'like',
          description: 'Like an update',
          action: 'Like an update',
          fields: [
            {
              id: 'update_id',
              name: 'updateId',
              displayName: 'Update ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // COLUMN RESOURCE
    // ============================================
    {
      id: 'column',
      name: 'Column',
      value: 'column',
      description: 'Board columns',
      operations: [
        {
          id: 'create_column',
          name: 'Create Column',
          value: 'create',
          description: 'Create a column in a board',
          action: 'Create a column',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
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
            {
              id: 'column_type',
              name: 'columnType',
              displayName: 'Column Type',
              type: 'options',
              required: true,
              options: [
                { name: 'Text', value: 'text' },
                { name: 'Long Text', value: 'long_text' },
                { name: 'Numbers', value: 'numbers' },
                { name: 'Status', value: 'status' },
                { name: 'Date', value: 'date' },
                { name: 'Timeline', value: 'timeline' },
                { name: 'People', value: 'people' },
                { name: 'Checkbox', value: 'checkbox' },
                { name: 'Rating', value: 'rating' },
                { name: 'Email', value: 'email' },
                { name: 'Phone', value: 'phone' },
                { name: 'Link', value: 'link' },
                { name: 'Dropdown', value: 'dropdown' },
                { name: 'Tags', value: 'tags' },
                { name: 'Files', value: 'files' },
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
              id: 'defaults',
              name: 'defaults',
              displayName: 'Defaults',
              type: 'json',
              required: false,
              description: 'Default column settings as JSON',
            },
          ],
        },
        {
          id: 'get_columns',
          name: 'Get Columns',
          value: 'getMany',
          description: 'Get all columns in a board',
          action: 'List columns',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'change_column_value',
          name: 'Change Column Value',
          value: 'changeValue',
          description: 'Change a column value for an item',
          action: 'Change column value',
          fields: [
            {
              id: 'board_id',
              name: 'boardId',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
            {
              id: 'item_id',
              name: 'itemId',
              displayName: 'Item ID',
              type: 'string',
              required: true,
            },
            {
              id: 'column_id',
              name: 'columnId',
              displayName: 'Column ID',
              type: 'string',
              required: true,
            },
            {
              id: 'value',
              name: 'value',
              displayName: 'Value',
              type: 'json',
              required: true,
              description: 'The value as JSON',
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // WORKSPACE RESOURCE
    // ============================================
    {
      id: 'workspace',
      name: 'Workspace',
      value: 'workspace',
      description: 'Workspaces',
      operations: [
        {
          id: 'get_workspaces',
          name: 'Get Workspaces',
          value: 'getMany',
          description: 'Get all workspaces',
          action: 'List workspaces',
          fields: [],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 25,
            },
          ],
        },
        {
          id: 'create_workspace',
          name: 'Create Workspace',
          value: 'create',
          description: 'Create a workspace',
          action: 'Create a workspace',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: true,
            },
            {
              id: 'kind',
              name: 'kind',
              displayName: 'Kind',
              type: 'options',
              required: true,
              default: 'open',
              options: [
                { name: 'Open', value: 'open' },
                { name: 'Closed', value: 'closed' },
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
      description: 'Account users',
      operations: [
        {
          id: 'get_users',
          name: 'Get Users',
          value: 'getMany',
          description: 'Get all users',
          action: 'List users',
          fields: [],
          optionalFields: [
            {
              id: 'kind',
              name: 'kind',
              displayName: 'Kind',
              type: 'options',
              required: false,
              options: [
                { name: 'All', value: 'all' },
                { name: 'Non Guests', value: 'non_guests' },
                { name: 'Guests', value: 'guests' },
                { name: 'Non Pending', value: 'non_pending' },
              ],
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 25,
            },
          ],
        },
        {
          id: 'get_current_user',
          name: 'Get Current User',
          value: 'getMe',
          description: 'Get the current authenticated user',
          action: 'Get current user',
          fields: [],
          optionalFields: [],
        },
      ],
    },
  ],
};
