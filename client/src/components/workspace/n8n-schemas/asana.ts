/**
 * Asana n8n-style Schema
 * 
 * Comprehensive Asana project management operations
 */

import { N8nAppSchema } from './types';

export const asanaSchema: N8nAppSchema = {
  id: 'asana',
  name: 'Asana',
  description: 'Asana project and task management',
  version: '1.0.0',
  color: '#F95353',
  icon: 'asana',
  group: ['productivity'],
  
  credentials: [
    {
      name: 'asanaApi',
      displayName: 'Asana API',
      required: true,
      type: 'oauth2',
      properties: [
        {
          name: 'accessToken',
          displayName: 'Personal Access Token',
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
      description: 'Asana tasks',
      operations: [
        {
          id: 'create_task',
          name: 'Create Task',
          value: 'create',
          description: 'Create a new task',
          action: 'Create a task',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: true,
            },
            {
              id: 'workspace',
              name: 'workspace',
              displayName: 'Workspace ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'projects',
              name: 'projects',
              displayName: 'Project IDs',
              type: 'string',
              required: false,
              description: 'Comma-separated project IDs',
            },
            {
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee ID',
              type: 'string',
              required: false,
              description: 'User ID or "me"',
            },
            {
              id: 'notes',
              name: 'notes',
              displayName: 'Description',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'html_notes',
              name: 'html_notes',
              displayName: 'HTML Description',
              type: 'string',
              required: false,
            },
            {
              id: 'due_on',
              name: 'due_on',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'due_at',
              name: 'due_at',
              displayName: 'Due Date & Time',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'start_on',
              name: 'start_on',
              displayName: 'Start Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'completed',
              name: 'completed',
              displayName: 'Completed',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'tags',
              name: 'tags',
              displayName: 'Tag IDs',
              type: 'string',
              required: false,
              description: 'Comma-separated tag IDs',
            },
            {
              id: 'parent',
              name: 'parent',
              displayName: 'Parent Task ID',
              type: 'string',
              required: false,
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
          optionalFields: [],
        },
        {
          id: 'get_tasks',
          name: 'Get Tasks',
          value: 'getMany',
          description: 'Get tasks from a project',
          action: 'List tasks',
          fields: [
            {
              id: 'project',
              name: 'project',
              displayName: 'Project ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'completed_since',
              name: 'completed_since',
              displayName: 'Completed Since',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'modified_since',
              name: 'modified_since',
              displayName: 'Modified Since',
              type: 'dateTime',
              required: false,
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
              id: 'notes',
              name: 'notes',
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
              id: 'due_on',
              name: 'due_on',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'completed',
              name: 'completed',
              displayName: 'Completed',
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
          id: 'search_tasks',
          name: 'Search Tasks',
          value: 'search',
          description: 'Search tasks in a workspace',
          action: 'Search tasks',
          fields: [
            {
              id: 'workspace',
              name: 'workspace',
              displayName: 'Workspace ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'text',
              name: 'text',
              displayName: 'Search Text',
              type: 'string',
              required: false,
            },
            {
              id: 'assignee_any',
              name: 'assignee.any',
              displayName: 'Assignee IDs',
              type: 'string',
              required: false,
            },
            {
              id: 'projects_any',
              name: 'projects.any',
              displayName: 'Project IDs',
              type: 'string',
              required: false,
            },
            {
              id: 'completed',
              name: 'completed',
              displayName: 'Completed',
              type: 'boolean',
              required: false,
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 20,
            },
          ],
        },
        {
          id: 'add_task_to_project',
          name: 'Add Task to Project',
          value: 'addToProject',
          description: 'Add a task to a project',
          action: 'Add task to project',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'project',
              name: 'project',
              displayName: 'Project ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'section',
              name: 'section',
              displayName: 'Section ID',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'remove_task_from_project',
          name: 'Remove Task from Project',
          value: 'removeFromProject',
          description: 'Remove a task from a project',
          action: 'Remove task from project',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'project',
              name: 'project',
              displayName: 'Project ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // PROJECT RESOURCE
    // ============================================
    {
      id: 'project',
      name: 'Project',
      value: 'project',
      description: 'Asana projects',
      operations: [
        {
          id: 'create_project',
          name: 'Create Project',
          value: 'create',
          description: 'Create a new project',
          action: 'Create a project',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Name',
              type: 'string',
              required: true,
            },
            {
              id: 'workspace',
              name: 'workspace',
              displayName: 'Workspace ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'team',
              name: 'team',
              displayName: 'Team ID',
              type: 'string',
              required: false,
            },
            {
              id: 'notes',
              name: 'notes',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'color',
              name: 'color',
              displayName: 'Color',
              type: 'options',
              required: false,
              options: [
                { name: 'Dark Pink', value: 'dark-pink' },
                { name: 'Dark Green', value: 'dark-green' },
                { name: 'Dark Blue', value: 'dark-blue' },
                { name: 'Dark Red', value: 'dark-red' },
                { name: 'Dark Teal', value: 'dark-teal' },
                { name: 'Dark Brown', value: 'dark-brown' },
                { name: 'Dark Orange', value: 'dark-orange' },
                { name: 'Dark Purple', value: 'dark-purple' },
                { name: 'Light Pink', value: 'light-pink' },
                { name: 'Light Green', value: 'light-green' },
                { name: 'Light Blue', value: 'light-blue' },
                { name: 'Light Red', value: 'light-red' },
                { name: 'Light Teal', value: 'light-teal' },
                { name: 'Light Yellow', value: 'light-yellow' },
                { name: 'Light Orange', value: 'light-orange' },
                { name: 'Light Purple', value: 'light-purple' },
              ],
            },
            {
              id: 'default_view',
              name: 'default_view',
              displayName: 'Default View',
              type: 'options',
              required: false,
              default: 'list',
              options: [
                { name: 'List', value: 'list' },
                { name: 'Board', value: 'board' },
                { name: 'Calendar', value: 'calendar' },
                { name: 'Timeline', value: 'timeline' },
              ],
            },
            {
              id: 'public',
              name: 'public',
              displayName: 'Public',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'due_on',
              name: 'due_on',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'start_on',
              name: 'start_on',
              displayName: 'Start Date',
              type: 'dateTime',
              required: false,
            },
          ],
        },
        {
          id: 'get_project',
          name: 'Get Project',
          value: 'get',
          description: 'Get a project by ID',
          action: 'Retrieve a project',
          fields: [
            {
              id: 'project_id',
              name: 'projectId',
              displayName: 'Project ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_projects',
          name: 'Get Projects',
          value: 'getMany',
          description: 'Get all projects',
          action: 'List all projects',
          fields: [
            {
              id: 'workspace',
              name: 'workspace',
              displayName: 'Workspace ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'team',
              name: 'team',
              displayName: 'Team ID',
              type: 'string',
              required: false,
            },
            {
              id: 'archived',
              name: 'archived',
              displayName: 'Include Archived',
              type: 'boolean',
              required: false,
              default: false,
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
          id: 'update_project',
          name: 'Update Project',
          value: 'update',
          description: 'Update a project',
          action: 'Update a project',
          fields: [
            {
              id: 'project_id',
              name: 'projectId',
              displayName: 'Project ID',
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
              id: 'notes',
              name: 'notes',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'color',
              name: 'color',
              displayName: 'Color',
              type: 'options',
              required: false,
              options: [
                { name: 'Dark Pink', value: 'dark-pink' },
                { name: 'Dark Green', value: 'dark-green' },
                { name: 'Dark Blue', value: 'dark-blue' },
              ],
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
          id: 'delete_project',
          name: 'Delete Project',
          value: 'delete',
          description: 'Delete a project',
          action: 'Delete a project',
          fields: [
            {
              id: 'project_id',
              name: 'projectId',
              displayName: 'Project ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // SECTION RESOURCE
    // ============================================
    {
      id: 'section',
      name: 'Section',
      value: 'section',
      description: 'Project sections',
      operations: [
        {
          id: 'create_section',
          name: 'Create Section',
          value: 'create',
          description: 'Create a section',
          action: 'Create a section',
          fields: [
            {
              id: 'project',
              name: 'project',
              displayName: 'Project ID',
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
              id: 'insert_before',
              name: 'insert_before',
              displayName: 'Insert Before Section ID',
              type: 'string',
              required: false,
            },
            {
              id: 'insert_after',
              name: 'insert_after',
              displayName: 'Insert After Section ID',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_sections',
          name: 'Get Sections',
          value: 'getMany',
          description: 'Get sections in a project',
          action: 'List sections',
          fields: [
            {
              id: 'project',
              name: 'project',
              displayName: 'Project ID',
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
              default: 100,
            },
          ],
        },
        {
          id: 'update_section',
          name: 'Update Section',
          value: 'update',
          description: 'Update a section',
          action: 'Update a section',
          fields: [
            {
              id: 'section_id',
              name: 'sectionId',
              displayName: 'Section ID',
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
          id: 'delete_section',
          name: 'Delete Section',
          value: 'delete',
          description: 'Delete a section',
          action: 'Delete a section',
          fields: [
            {
              id: 'section_id',
              name: 'sectionId',
              displayName: 'Section ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'add_task_to_section',
          name: 'Add Task to Section',
          value: 'addTask',
          description: 'Add a task to a section',
          action: 'Add task to section',
          fields: [
            {
              id: 'section_id',
              name: 'sectionId',
              displayName: 'Section ID',
              type: 'string',
              required: true,
            },
            {
              id: 'task',
              name: 'task',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'insert_before',
              name: 'insert_before',
              displayName: 'Insert Before Task ID',
              type: 'string',
              required: false,
            },
            {
              id: 'insert_after',
              name: 'insert_after',
              displayName: 'Insert After Task ID',
              type: 'string',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // SUBTASK RESOURCE
    // ============================================
    {
      id: 'subtask',
      name: 'Subtask',
      value: 'subtask',
      description: 'Task subtasks',
      operations: [
        {
          id: 'create_subtask',
          name: 'Create Subtask',
          value: 'create',
          description: 'Create a subtask',
          action: 'Create a subtask',
          fields: [
            {
              id: 'parent_task',
              name: 'parentTask',
              displayName: 'Parent Task ID',
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
              id: 'notes',
              name: 'notes',
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
              id: 'due_on',
              name: 'due_on',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
          ],
        },
        {
          id: 'get_subtasks',
          name: 'Get Subtasks',
          value: 'getMany',
          description: 'Get subtasks of a task',
          action: 'List subtasks',
          fields: [
            {
              id: 'parent_task',
              name: 'parentTask',
              displayName: 'Parent Task ID',
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
              default: 100,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // TAG RESOURCE
    // ============================================
    {
      id: 'tag',
      name: 'Tag',
      value: 'tag',
      description: 'Task tags',
      operations: [
        {
          id: 'create_tag',
          name: 'Create Tag',
          value: 'create',
          description: 'Create a tag',
          action: 'Create a tag',
          fields: [
            {
              id: 'workspace',
              name: 'workspace',
              displayName: 'Workspace ID',
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
              id: 'color',
              name: 'color',
              displayName: 'Color',
              type: 'options',
              required: false,
              options: [
                { name: 'Dark Pink', value: 'dark-pink' },
                { name: 'Dark Green', value: 'dark-green' },
                { name: 'Dark Blue', value: 'dark-blue' },
                { name: 'Dark Red', value: 'dark-red' },
                { name: 'Dark Teal', value: 'dark-teal' },
                { name: 'Light Pink', value: 'light-pink' },
                { name: 'Light Green', value: 'light-green' },
                { name: 'Light Blue', value: 'light-blue' },
              ],
            },
            {
              id: 'notes',
              name: 'notes',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_tags',
          name: 'Get Tags',
          value: 'getMany',
          description: 'Get all tags in a workspace',
          action: 'List tags',
          fields: [
            {
              id: 'workspace',
              name: 'workspace',
              displayName: 'Workspace ID',
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
              default: 100,
            },
          ],
        },
        {
          id: 'add_tag_to_task',
          name: 'Add Tag to Task',
          value: 'addToTask',
          description: 'Add a tag to a task',
          action: 'Add tag to task',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'tag',
              name: 'tag',
              displayName: 'Tag ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'remove_tag_from_task',
          name: 'Remove Tag from Task',
          value: 'removeFromTask',
          description: 'Remove a tag from a task',
          action: 'Remove tag from task',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
              type: 'string',
              required: true,
            },
            {
              id: 'tag',
              name: 'tag',
              displayName: 'Tag ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // COMMENT (STORY) RESOURCE
    // ============================================
    {
      id: 'story',
      name: 'Comment',
      value: 'story',
      description: 'Task comments and stories',
      operations: [
        {
          id: 'create_comment',
          name: 'Add Comment',
          value: 'create',
          description: 'Add a comment to a task',
          action: 'Add a comment',
          fields: [
            {
              id: 'task_id',
              name: 'taskId',
              displayName: 'Task ID',
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
          optionalFields: [
            {
              id: 'is_pinned',
              name: 'is_pinned',
              displayName: 'Pin Comment',
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
          id: 'update_comment',
          name: 'Update Comment',
          value: 'update',
          description: 'Update a comment',
          action: 'Update a comment',
          fields: [
            {
              id: 'story_id',
              name: 'storyId',
              displayName: 'Story/Comment ID',
              type: 'string',
              required: true,
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Comment',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'is_pinned',
              name: 'is_pinned',
              displayName: 'Pin Comment',
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
              id: 'story_id',
              name: 'storyId',
              displayName: 'Story/Comment ID',
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
          description: 'Get a user by ID',
          action: 'Retrieve a user',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
              description: 'User ID or "me"',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_users',
          name: 'Get Users',
          value: 'getMany',
          description: 'Get users in a workspace',
          action: 'List users',
          fields: [
            {
              id: 'workspace',
              name: 'workspace',
              displayName: 'Workspace ID',
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
              default: 100,
            },
          ],
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
              default: 100,
            },
          ],
        },
        {
          id: 'get_workspace',
          name: 'Get Workspace',
          value: 'get',
          description: 'Get a workspace',
          action: 'Retrieve a workspace',
          fields: [
            {
              id: 'workspace_id',
              name: 'workspaceId',
              displayName: 'Workspace ID',
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
