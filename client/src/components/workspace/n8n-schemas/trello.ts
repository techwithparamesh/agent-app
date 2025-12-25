/**
 * Trello n8n-style Schema
 * 
 * Comprehensive Trello project management operations
 */

import { N8nAppSchema } from './types';

export const trelloSchema: N8nAppSchema = {
  id: 'trello',
  name: 'Trello',
  description: 'Trello boards and cards',
  version: '1.0.0',
  color: '#0079BF',
  icon: 'trello',
  group: ['productivity'],
  
  credentials: [
    {
      name: 'trelloApi',
      displayName: 'Trello API',
      required: true,
      type: 'apiKey',
      properties: [
        {
          name: 'apiKey',
          displayName: 'API Key',
          type: 'string',
          required: true,
        },
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
      description: 'Trello boards',
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
          ],
          optionalFields: [
            {
              id: 'desc',
              name: 'desc',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'defaultLists',
              name: 'defaultLists',
              displayName: 'Create Default Lists',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'idOrganization',
              name: 'idOrganization',
              displayName: 'Organization ID',
              type: 'string',
              required: false,
            },
            {
              id: 'prefs_permissionLevel',
              name: 'prefs_permissionLevel',
              displayName: 'Permission Level',
              type: 'options',
              required: false,
              default: 'private',
              options: [
                { name: 'Private', value: 'private' },
                { name: 'Public', value: 'public' },
                { name: 'Organization', value: 'org' },
              ],
            },
            {
              id: 'prefs_background',
              name: 'prefs_background',
              displayName: 'Background Color',
              type: 'options',
              required: false,
              options: [
                { name: 'Blue', value: 'blue' },
                { name: 'Orange', value: 'orange' },
                { name: 'Green', value: 'green' },
                { name: 'Red', value: 'red' },
                { name: 'Purple', value: 'purple' },
                { name: 'Pink', value: 'pink' },
                { name: 'Lime', value: 'lime' },
                { name: 'Sky', value: 'sky' },
                { name: 'Grey', value: 'grey' },
              ],
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
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'options',
              required: false,
              default: 'all',
              options: [
                { name: 'All', value: 'all' },
                { name: 'Open', value: 'open' },
                { name: 'Closed', value: 'closed' },
                { name: 'Starred', value: 'starred' },
              ],
            },
          ],
        },
        {
          id: 'update_board',
          name: 'Update Board',
          value: 'update',
          description: 'Update a board',
          action: 'Update a board',
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
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: false,
            },
            {
              id: 'desc',
              name: 'desc',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'closed',
              name: 'closed',
              displayName: 'Closed',
              type: 'boolean',
              required: false,
            },
          ],
        },
        {
          id: 'delete_board',
          name: 'Delete Board',
          value: 'delete',
          description: 'Delete a board',
          action: 'Delete a board',
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
    // LIST RESOURCE
    // ============================================
    {
      id: 'list',
      name: 'List',
      value: 'list',
      description: 'Board lists',
      operations: [
        {
          id: 'create_list',
          name: 'Create List',
          value: 'create',
          description: 'Create a new list',
          action: 'Create a list',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: true,
            },
            {
              id: 'idBoard',
              name: 'idBoard',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'pos',
              name: 'pos',
              displayName: 'Position',
              type: 'options',
              required: false,
              default: 'bottom',
              options: [
                { name: 'Top', value: 'top' },
                { name: 'Bottom', value: 'bottom' },
              ],
            },
          ],
        },
        {
          id: 'get_list',
          name: 'Get List',
          value: 'get',
          description: 'Get a list by ID',
          action: 'Retrieve a list',
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
          id: 'get_lists',
          name: 'Get Lists',
          value: 'getMany',
          description: 'Get all lists on a board',
          action: 'List all lists',
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
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'options',
              required: false,
              default: 'all',
              options: [
                { name: 'All', value: 'all' },
                { name: 'Open', value: 'open' },
                { name: 'Closed', value: 'closed' },
              ],
            },
          ],
        },
        {
          id: 'update_list',
          name: 'Update List',
          value: 'update',
          description: 'Update a list',
          action: 'Update a list',
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
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: false,
            },
            {
              id: 'closed',
              name: 'closed',
              displayName: 'Closed',
              type: 'boolean',
              required: false,
            },
            {
              id: 'pos',
              name: 'pos',
              displayName: 'Position',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'archive_list',
          name: 'Archive List',
          value: 'archive',
          description: 'Archive a list',
          action: 'Archive a list',
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
    // CARD RESOURCE
    // ============================================
    {
      id: 'card',
      name: 'Card',
      value: 'card',
      description: 'Trello cards',
      operations: [
        {
          id: 'create_card',
          name: 'Create Card',
          value: 'create',
          description: 'Create a new card',
          action: 'Create a card',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: true,
            },
            {
              id: 'idList',
              name: 'idList',
              displayName: 'List ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'desc',
              name: 'desc',
              displayName: 'Description',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'pos',
              name: 'pos',
              displayName: 'Position',
              type: 'options',
              required: false,
              default: 'bottom',
              options: [
                { name: 'Top', value: 'top' },
                { name: 'Bottom', value: 'bottom' },
              ],
            },
            {
              id: 'due',
              name: 'due',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'dueComplete',
              name: 'dueComplete',
              displayName: 'Due Complete',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'idMembers',
              name: 'idMembers',
              displayName: 'Member IDs',
              type: 'string',
              required: false,
              description: 'Comma-separated member IDs',
            },
            {
              id: 'idLabels',
              name: 'idLabels',
              displayName: 'Label IDs',
              type: 'string',
              required: false,
              description: 'Comma-separated label IDs',
            },
            {
              id: 'urlSource',
              name: 'urlSource',
              displayName: 'Source URL',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_card',
          name: 'Get Card',
          value: 'get',
          description: 'Get a card by ID',
          action: 'Retrieve a card',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_cards',
          name: 'Get Cards',
          value: 'getMany',
          description: 'Get all cards on a board or list',
          action: 'List all cards',
          fields: [
            {
              id: 'source_type',
              name: 'sourceType',
              displayName: 'Get Cards From',
              type: 'options',
              required: true,
              options: [
                { name: 'Board', value: 'board' },
                { name: 'List', value: 'list' },
              ],
            },
            {
              id: 'source_id',
              name: 'sourceId',
              displayName: 'Board/List ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'options',
              required: false,
              default: 'all',
              options: [
                { name: 'All', value: 'all' },
                { name: 'Open', value: 'open' },
                { name: 'Closed', value: 'closed' },
                { name: 'Visible', value: 'visible' },
              ],
            },
          ],
        },
        {
          id: 'update_card',
          name: 'Update Card',
          value: 'update',
          description: 'Update a card',
          action: 'Update a card',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
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
              id: 'desc',
              name: 'desc',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'idList',
              name: 'idList',
              displayName: 'Move to List ID',
              type: 'string',
              required: false,
            },
            {
              id: 'due',
              name: 'due',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'dueComplete',
              name: 'dueComplete',
              displayName: 'Due Complete',
              type: 'boolean',
              required: false,
            },
            {
              id: 'closed',
              name: 'closed',
              displayName: 'Archived',
              type: 'boolean',
              required: false,
            },
          ],
        },
        {
          id: 'delete_card',
          name: 'Delete Card',
          value: 'delete',
          description: 'Delete a card',
          action: 'Delete a card',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'add_member_to_card',
          name: 'Add Member',
          value: 'addMember',
          description: 'Add a member to a card',
          action: 'Add member to card',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
            {
              id: 'member_id',
              name: 'idMember',
              displayName: 'Member ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'remove_member_from_card',
          name: 'Remove Member',
          value: 'removeMember',
          description: 'Remove a member from a card',
          action: 'Remove member from card',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
            {
              id: 'member_id',
              name: 'idMember',
              displayName: 'Member ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // CHECKLIST RESOURCE
    // ============================================
    {
      id: 'checklist',
      name: 'Checklist',
      value: 'checklist',
      description: 'Card checklists',
      operations: [
        {
          id: 'create_checklist',
          name: 'Create Checklist',
          value: 'create',
          description: 'Create a checklist',
          action: 'Create a checklist',
          fields: [
            {
              id: 'card_id',
              name: 'idCard',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
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
              id: 'pos',
              name: 'pos',
              displayName: 'Position',
              type: 'options',
              required: false,
              default: 'bottom',
              options: [
                { name: 'Top', value: 'top' },
                { name: 'Bottom', value: 'bottom' },
              ],
            },
          ],
        },
        {
          id: 'get_checklists',
          name: 'Get Checklists',
          value: 'getMany',
          description: 'Get checklists on a card',
          action: 'List checklists',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_checklist',
          name: 'Delete Checklist',
          value: 'delete',
          description: 'Delete a checklist',
          action: 'Delete a checklist',
          fields: [
            {
              id: 'checklist_id',
              name: 'checklistId',
              displayName: 'Checklist ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'add_checklist_item',
          name: 'Add Checklist Item',
          value: 'addItem',
          description: 'Add an item to a checklist',
          action: 'Add checklist item',
          fields: [
            {
              id: 'checklist_id',
              name: 'checklistId',
              displayName: 'Checklist ID',
              type: 'string',
              required: true,
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'Item Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'checked',
              name: 'checked',
              displayName: 'Checked',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'pos',
              name: 'pos',
              displayName: 'Position',
              type: 'options',
              required: false,
              default: 'bottom',
              options: [
                { name: 'Top', value: 'top' },
                { name: 'Bottom', value: 'bottom' },
              ],
            },
            {
              id: 'due',
              name: 'due',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
          ],
        },
        {
          id: 'update_checklist_item',
          name: 'Update Checklist Item',
          value: 'updateItem',
          description: 'Update a checklist item',
          action: 'Update checklist item',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
            {
              id: 'checklist_item_id',
              name: 'checkItemId',
              displayName: 'Checklist Item ID',
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
              id: 'state',
              name: 'state',
              displayName: 'State',
              type: 'options',
              required: false,
              options: [
                { name: 'Complete', value: 'complete' },
                { name: 'Incomplete', value: 'incomplete' },
              ],
            },
          ],
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
      description: 'Card labels',
      operations: [
        {
          id: 'create_label',
          name: 'Create Label',
          value: 'create',
          description: 'Create a label',
          action: 'Create a label',
          fields: [
            {
              id: 'board_id',
              name: 'idBoard',
              displayName: 'Board ID',
              type: 'string',
              required: true,
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: true,
            },
            {
              id: 'color',
              name: 'color',
              displayName: 'Color',
              type: 'options',
              required: true,
              options: [
                { name: 'Green', value: 'green' },
                { name: 'Yellow', value: 'yellow' },
                { name: 'Orange', value: 'orange' },
                { name: 'Red', value: 'red' },
                { name: 'Purple', value: 'purple' },
                { name: 'Blue', value: 'blue' },
                { name: 'Sky', value: 'sky' },
                { name: 'Lime', value: 'lime' },
                { name: 'Pink', value: 'pink' },
                { name: 'Black', value: 'black' },
              ],
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_labels',
          name: 'Get Labels',
          value: 'getMany',
          description: 'Get labels on a board',
          action: 'List labels',
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
          id: 'add_label_to_card',
          name: 'Add Label to Card',
          value: 'addToCard',
          description: 'Add a label to a card',
          action: 'Add label to card',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
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
          id: 'remove_label_from_card',
          name: 'Remove Label from Card',
          value: 'removeFromCard',
          description: 'Remove a label from a card',
          action: 'Remove label from card',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
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
    // ATTACHMENT RESOURCE
    // ============================================
    {
      id: 'attachment',
      name: 'Attachment',
      value: 'attachment',
      description: 'Card attachments',
      operations: [
        {
          id: 'create_attachment',
          name: 'Add Attachment',
          value: 'create',
          description: 'Add an attachment to a card',
          action: 'Add attachment',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
            {
              id: 'url',
              name: 'url',
              displayName: 'URL',
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
          ],
        },
        {
          id: 'get_attachments',
          name: 'Get Attachments',
          value: 'getMany',
          description: 'Get attachments on a card',
          action: 'List attachments',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_attachment',
          name: 'Delete Attachment',
          value: 'delete',
          description: 'Delete an attachment',
          action: 'Delete attachment',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
            {
              id: 'attachment_id',
              name: 'attachmentId',
              displayName: 'Attachment ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
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
      description: 'Card comments',
      operations: [
        {
          id: 'add_comment',
          name: 'Add Comment',
          value: 'create',
          description: 'Add a comment to a card',
          action: 'Add comment',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Comment Text',
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
          description: 'Get comments on a card',
          action: 'List comments',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'update_comment',
          name: 'Update Comment',
          value: 'update',
          description: 'Update a comment',
          action: 'Update comment',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
            {
              id: 'comment_id',
              name: 'commentId',
              displayName: 'Comment ID',
              type: 'string',
              required: true,
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Comment Text',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_comment',
          name: 'Delete Comment',
          value: 'delete',
          description: 'Delete a comment',
          action: 'Delete comment',
          fields: [
            {
              id: 'card_id',
              name: 'cardId',
              displayName: 'Card ID',
              type: 'string',
              required: true,
            },
            {
              id: 'comment_id',
              name: 'commentId',
              displayName: 'Comment ID',
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
