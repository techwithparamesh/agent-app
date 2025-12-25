/**
 * ClickUp n8n-style Schema
 * 
 * Comprehensive ClickUp project management operations
 */

import { N8nAppSchema } from './types';

export const clickupSchema: N8nAppSchema = {
  id: 'clickup',
  name: 'ClickUp',
  description: 'ClickUp project management and productivity',
  version: '1.0.0',
  color: '#7B68EE',
  icon: 'clickup',
  group: ['productivity'],
  
  credentials: [
    {
      name: 'clickupApi',
      displayName: 'ClickUp API',
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
    // TASK RESOURCE
    // ============================================
    {
      id: 'task',
      name: 'Task',
      value: 'task',
      description: 'ClickUp tasks',
      operations: [
        {
          id: 'create_task',
          name: 'Create Task',
          value: 'create',
          description: 'Create a new task',
          action: 'Create a task',
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
              displayName: 'Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'markdown_description',
              name: 'markdownDescription',
              displayName: 'Markdown Description',
              type: 'string',
              required: false,
            },
            {
              id: 'assignees',
              name: 'assignees',
              displayName: 'Assignee IDs',
              type: 'string',
              required: false,
              description: 'Comma-separated user IDs',
            },
            {
              id: 'tags',
              name: 'tags',
              displayName: 'Tags',
              type: 'string',
              required: false,
              description: 'Comma-separated tag names',
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'string',
              required: false,
            },
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              required: false,
              options: [
                { name: 'Urgent', value: '1' },
                { name: 'High', value: '2' },
                { name: 'Normal', value: '3' },
                { name: 'Low', value: '4' },
              ],
            },
            {
              id: 'due_date',
              name: 'dueDate',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'due_date_time',
              name: 'dueDateTime',
              displayName: 'Due Date Time',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'start_date',
              name: 'startDate',
              displayName: 'Start Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'time_estimate',
              name: 'timeEstimate',
              displayName: 'Time Estimate (ms)',
              type: 'number',
              required: false,
            },
            {
              id: 'notify_all',
              name: 'notifyAll',
              displayName: 'Notify All',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'parent',
              name: 'parent',
              displayName: 'Parent Task ID',
              type: 'string',
              required: false,
            },
            {
              id: 'custom_fields',
              name: 'customFields',
              displayName: 'Custom Fields',
              type: 'json',
              required: false,
              description: 'Array of custom field objects',
            },
          ],
        },
        {
          id: 'get_task',
          name: 'Get Task',
          value: 'get',
          description: 'Get a task by ID',
          action: 'Retrieve a task',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'include_subtasks',
              name: 'includeSubtasks',
              displayName: 'Include Subtasks',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'get_tasks',
          name: 'Get Tasks',
          value: 'getMany',
          description: 'Get tasks from a list',
          action: 'List tasks',
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
              id: 'archived',
              name: 'archived',
              displayName: 'Include Archived',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'page',
              name: 'page',
              displayName: 'Page',
              type: 'number',
              required: false,
              default: 0,
            },
            {
              id: 'order_by',
              name: 'orderBy',
              displayName: 'Order By',
              type: 'options',
              required: false,
              options: [
                { name: 'ID', value: 'id' },
                { name: 'Created', value: 'created' },
                { name: 'Updated', value: 'updated' },
                { name: 'Due Date', value: 'due_date' },
              ],
            },
            {
              id: 'reverse',
              name: 'reverse',
              displayName: 'Reverse Order',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'subtasks',
              name: 'subtasks',
              displayName: 'Include Subtasks',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'statuses',
              name: 'statuses',
              displayName: 'Filter by Statuses',
              type: 'string',
              required: false,
              description: 'Comma-separated status names',
            },
            {
              id: 'include_closed',
              name: 'includeClosed',
              displayName: 'Include Closed',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'assignees',
              name: 'assignees',
              displayName: 'Filter by Assignees',
              type: 'string',
              required: false,
              description: 'Comma-separated user IDs',
            },
            {
              id: 'tags',
              name: 'tags',
              displayName: 'Filter by Tags',
              type: 'string',
              required: false,
              description: 'Comma-separated tag names',
            },
            {
              id: 'due_date_gt',
              name: 'dueDateGt',
              displayName: 'Due Date Greater Than',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'due_date_lt',
              name: 'dueDateLt',
              displayName: 'Due Date Less Than',
              type: 'dateTime',
              required: false,
            },
          ],
        },
        {
          id: 'update_task',
          name: 'Update Task',
          value: 'update',
          description: 'Update a task',
          action: 'Update a task',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
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
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'string',
              required: false,
            },
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              required: false,
              options: [
                { name: 'Urgent', value: '1' },
                { name: 'High', value: '2' },
                { name: 'Normal', value: '3' },
                { name: 'Low', value: '4' },
                { name: 'None', value: 'null' },
              ],
            },
            {
              id: 'due_date',
              name: 'dueDate',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'time_estimate',
              name: 'timeEstimate',
              displayName: 'Time Estimate (ms)',
              type: 'number',
              required: false,
            },
            {
              id: 'archived',
              name: 'archived',
              displayName: 'Archived',
              type: 'boolean',
              required: false,
            },
          ],
        },
        {
          id: 'delete_task',
          name: 'Delete Task',
          value: 'delete',
          description: 'Delete a task',
          action: 'Delete a task',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'add_assignee',
          name: 'Add Assignee',
          value: 'addAssignee',
          description: 'Add an assignee to a task',
          action: 'Add assignee',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'remove_assignee',
          name: 'Remove Assignee',
          value: 'removeAssignee',
          description: 'Remove an assignee from a task',
          action: 'Remove assignee',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'add_tag',
          name: 'Add Tag',
          value: 'addTag',
          description: 'Add a tag to a task',
          action: 'Add tag',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'tag_name',
              name: 'tagName',
              displayName: 'Tag Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'remove_tag',
          name: 'Remove Tag',
          value: 'removeTag',
          description: 'Remove a tag from a task',
          action: 'Remove tag',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'tag_name',
              name: 'tagName',
              displayName: 'Tag Name',
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
      description: 'ClickUp lists',
      operations: [
        {
          id: 'create_list',
          name: 'Create List',
          value: 'create',
          description: 'Create a list',
          action: 'Create a list',
          fields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Folder ID',
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
              id: 'content',
              name: 'content',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'due_date',
              name: 'dueDate',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              required: false,
              options: [
                { name: 'Urgent', value: '1' },
                { name: 'High', value: '2' },
                { name: 'Normal', value: '3' },
                { name: 'Low', value: '4' },
              ],
            },
            {
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee ID',
              type: 'string',
              required: false,
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'create_folderless_list',
          name: 'Create Folderless List',
          value: 'createFolderless',
          description: 'Create a list directly in a space',
          action: 'Create folderless list',
          fields: [
            {
              id: 'space_id',
              name: 'spaceId',
              displayName: 'Space ID',
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
              id: 'content',
              name: 'content',
              displayName: 'Description',
              type: 'string',
              required: false,
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
          description: 'Get all lists in a folder',
          action: 'List lists',
          fields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Folder ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'archived',
              name: 'archived',
              displayName: 'Include Archived',
              type: 'boolean',
              required: false,
              default: false,
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
              id: 'content',
              name: 'content',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'delete_list',
          name: 'Delete List',
          value: 'delete',
          description: 'Delete a list',
          action: 'Delete a list',
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
    // FOLDER RESOURCE
    // ============================================
    {
      id: 'folder',
      name: 'Folder',
      value: 'folder',
      description: 'Space folders',
      operations: [
        {
          id: 'create_folder',
          name: 'Create Folder',
          value: 'create',
          description: 'Create a folder',
          action: 'Create a folder',
          fields: [
            {
              id: 'space_id',
              name: 'spaceId',
              displayName: 'Space ID',
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
          optionalFields: [],
        },
        {
          id: 'get_folder',
          name: 'Get Folder',
          value: 'get',
          description: 'Get a folder by ID',
          action: 'Retrieve a folder',
          fields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Folder ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_folders',
          name: 'Get Folders',
          value: 'getMany',
          description: 'Get all folders in a space',
          action: 'List folders',
          fields: [
            {
              id: 'space_id',
              name: 'spaceId',
              displayName: 'Space ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'archived',
              name: 'archived',
              displayName: 'Include Archived',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'update_folder',
          name: 'Update Folder',
          value: 'update',
          description: 'Update a folder',
          action: 'Update a folder',
          fields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Folder ID',
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
          optionalFields: [],
        },
        {
          id: 'delete_folder',
          name: 'Delete Folder',
          value: 'delete',
          description: 'Delete a folder',
          action: 'Delete a folder',
          fields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Folder ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // SPACE RESOURCE
    // ============================================
    {
      id: 'space',
      name: 'Space',
      value: 'space',
      description: 'Workspace spaces',
      operations: [
        {
          id: 'create_space',
          name: 'Create Space',
          value: 'create',
          description: 'Create a space',
          action: 'Create a space',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team ID',
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
              id: 'multiple_assignees',
              name: 'multipleAssignees',
              displayName: 'Multiple Assignees',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'features',
              name: 'features',
              displayName: 'Features',
              type: 'json',
              required: false,
              description: 'Space features configuration',
            },
          ],
        },
        {
          id: 'get_space',
          name: 'Get Space',
          value: 'get',
          description: 'Get a space by ID',
          action: 'Retrieve a space',
          fields: [
            {
              id: 'space_id',
              name: 'spaceId',
              displayName: 'Space ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_spaces',
          name: 'Get Spaces',
          value: 'getMany',
          description: 'Get all spaces in a team',
          action: 'List spaces',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'archived',
              name: 'archived',
              displayName: 'Include Archived',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'update_space',
          name: 'Update Space',
          value: 'update',
          description: 'Update a space',
          action: 'Update a space',
          fields: [
            {
              id: 'space_id',
              name: 'spaceId',
              displayName: 'Space ID',
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
              id: 'color',
              name: 'color',
              displayName: 'Color',
              type: 'string',
              required: false,
            },
            {
              id: 'private',
              name: 'private',
              displayName: 'Private',
              type: 'boolean',
              required: false,
            },
            {
              id: 'admin_can_manage',
              name: 'adminCanManage',
              displayName: 'Admin Can Manage',
              type: 'boolean',
              required: false,
            },
            {
              id: 'multiple_assignees',
              name: 'multipleAssignees',
              displayName: 'Multiple Assignees',
              type: 'boolean',
              required: false,
            },
          ],
        },
        {
          id: 'delete_space',
          name: 'Delete Space',
          value: 'delete',
          description: 'Delete a space',
          action: 'Delete a space',
          fields: [
            {
              id: 'space_id',
              name: 'spaceId',
              displayName: 'Space ID',
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
      description: 'Task checklists',
      operations: [
        {
          id: 'create_checklist',
          name: 'Create Checklist',
          value: 'create',
          description: 'Create a checklist on a task',
          action: 'Create a checklist',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
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
          optionalFields: [],
        },
        {
          id: 'create_checklist_item',
          name: 'Create Checklist Item',
          value: 'createItem',
          description: 'Create an item in a checklist',
          action: 'Create checklist item',
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
              displayName: 'Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee ID',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'update_checklist',
          name: 'Update Checklist',
          value: 'update',
          description: 'Update a checklist',
          action: 'Update a checklist',
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
              displayName: 'Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'position',
              name: 'position',
              displayName: 'Position',
              type: 'number',
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
              id: 'checklist_id',
              name: 'checklistId',
              displayName: 'Checklist ID',
              type: 'string',
              required: true,
            },
            {
              id: 'checklist_item_id',
              name: 'checklistItemId',
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
              id: 'resolved',
              name: 'resolved',
              displayName: 'Resolved',
              type: 'boolean',
              required: false,
            },
            {
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee ID',
              type: 'string',
              required: false,
            },
          ],
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
          id: 'delete_checklist_item',
          name: 'Delete Checklist Item',
          value: 'deleteItem',
          description: 'Delete a checklist item',
          action: 'Delete checklist item',
          fields: [
            {
              id: 'checklist_id',
              name: 'checklistId',
              displayName: 'Checklist ID',
              type: 'string',
              required: true,
            },
            {
              id: 'checklist_item_id',
              name: 'checklistItemId',
              displayName: 'Checklist Item ID',
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
      description: 'Task comments',
      operations: [
        {
          id: 'create_comment',
          name: 'Create Comment',
          value: 'create',
          description: 'Create a comment on a task',
          action: 'Create a comment',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'comment_text',
              name: 'commentText',
              displayName: 'Comment',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 3,
              },
            },
          ],
          optionalFields: [
            {
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee ID',
              type: 'string',
              required: false,
            },
            {
              id: 'notify_all',
              name: 'notifyAll',
              displayName: 'Notify All',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'get_comments',
          name: 'Get Comments',
          value: 'getMany',
          description: 'Get comments on a task',
          action: 'List comments',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
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
          action: 'Update a comment',
          fields: [
            {
              id: 'comment_id',
              name: 'commentId',
              displayName: 'Comment ID',
              type: 'string',
              required: true,
            },
            {
              id: 'comment_text',
              name: 'commentText',
              displayName: 'Comment',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee ID',
              type: 'string',
              required: false,
            },
            {
              id: 'resolved',
              name: 'resolved',
              displayName: 'Resolved',
              type: 'boolean',
              required: false,
            },
          ],
        },
        {
          id: 'delete_comment',
          name: 'Delete Comment',
          value: 'delete',
          description: 'Delete a comment',
          action: 'Delete a comment',
          fields: [
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
    
    // ============================================
    // TIME TRACKING RESOURCE
    // ============================================
    {
      id: 'timeTracking',
      name: 'Time Tracking',
      value: 'timeTracking',
      description: 'Task time entries',
      operations: [
        {
          id: 'create_time_entry',
          name: 'Create Time Entry',
          value: 'create',
          description: 'Create a time entry',
          action: 'Create time entry',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'duration',
              name: 'duration',
              displayName: 'Duration (ms)',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'start',
              name: 'start',
              displayName: 'Start Time',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee ID',
              type: 'string',
              required: false,
            },
            {
              id: 'billable',
              name: 'billable',
              displayName: 'Billable',
              type: 'boolean',
              required: false,
            },
          ],
        },
        {
          id: 'get_time_entries',
          name: 'Get Time Entries',
          value: 'getMany',
          description: 'Get time entries for a task',
          action: 'List time entries',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_time_entry',
          name: 'Delete Time Entry',
          value: 'delete',
          description: 'Delete a time entry',
          action: 'Delete time entry',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team ID',
              type: 'string',
              required: true,
            },
            {
              id: 'time_entry_id',
              name: 'timeEntryId',
              displayName: 'Time Entry ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // TEAM RESOURCE
    // ============================================
    {
      id: 'team',
      name: 'Team',
      value: 'team',
      description: 'Workspace teams',
      operations: [
        {
          id: 'get_teams',
          name: 'Get Teams',
          value: 'getMany',
          description: 'Get all accessible teams',
          action: 'List teams',
          fields: [],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // MEMBER RESOURCE
    // ============================================
    {
      id: 'member',
      name: 'Member',
      value: 'member',
      description: 'Team members',
      operations: [
        {
          id: 'get_members',
          name: 'Get Members',
          value: 'getMany',
          description: 'Get members of a list',
          action: 'List members',
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
          id: 'get_task_members',
          name: 'Get Task Members',
          value: 'getTaskMembers',
          description: 'Get members of a task',
          action: 'Get task members',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
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
