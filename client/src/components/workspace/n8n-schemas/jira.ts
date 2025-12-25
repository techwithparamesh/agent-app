/**
 * Jira n8n-style Schema
 * 
 * Comprehensive Jira project management operations
 */

import { N8nAppSchema } from './types';

export const jiraSchema: N8nAppSchema = {
  id: 'jira',
  name: 'Jira',
  description: 'Jira issue tracking and project management',
  version: '1.0.0',
  color: '#0052CC',
  icon: 'jira',
  group: ['productivity'],
  
  credentials: [
    {
      name: 'jiraApi',
      displayName: 'Jira API',
      required: true,
      type: 'basic',
      properties: [
        {
          name: 'domain',
          displayName: 'Domain',
          type: 'string',
          required: true,
          placeholder: 'your-domain.atlassian.net',
        },
        {
          name: 'email',
          displayName: 'Email',
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
    // ISSUE RESOURCE
    // ============================================
    {
      id: 'issue',
      name: 'Issue',
      value: 'issue',
      description: 'Jira issues',
      operations: [
        {
          id: 'create_issue',
          name: 'Create Issue',
          value: 'create',
          description: 'Create a new issue',
          action: 'Create an issue',
          fields: [
            {
              id: 'project',
              name: 'project',
              displayName: 'Project Key',
              type: 'string',
              required: true,
              placeholder: 'PROJ',
            },
            {
              id: 'issue_type',
              name: 'issueType',
              displayName: 'Issue Type',
              type: 'options',
              required: true,
              options: [
                { name: 'Bug', value: 'Bug' },
                { name: 'Task', value: 'Task' },
                { name: 'Story', value: 'Story' },
                { name: 'Epic', value: 'Epic' },
                { name: 'Subtask', value: 'Sub-task' },
              ],
            },
            {
              id: 'summary',
              name: 'summary',
              displayName: 'Summary',
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
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee Account ID',
              type: 'string',
              required: false,
            },
            {
              id: 'reporter',
              name: 'reporter',
              displayName: 'Reporter Account ID',
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
                { name: 'Highest', value: 'Highest' },
                { name: 'High', value: 'High' },
                { name: 'Medium', value: 'Medium' },
                { name: 'Low', value: 'Low' },
                { name: 'Lowest', value: 'Lowest' },
              ],
            },
            {
              id: 'labels',
              name: 'labels',
              displayName: 'Labels',
              type: 'string',
              required: false,
              description: 'Comma-separated labels',
            },
            {
              id: 'components',
              name: 'components',
              displayName: 'Component IDs',
              type: 'string',
              required: false,
              description: 'Comma-separated component IDs',
            },
            {
              id: 'due_date',
              name: 'dueDate',
              displayName: 'Due Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'parent_key',
              name: 'parentKey',
              displayName: 'Parent Issue Key',
              type: 'string',
              required: false,
              description: 'For subtasks',
            },
            {
              id: 'epic_link',
              name: 'epicLink',
              displayName: 'Epic Link',
              type: 'string',
              required: false,
            },
            {
              id: 'story_points',
              name: 'storyPoints',
              displayName: 'Story Points',
              type: 'number',
              required: false,
            },
            {
              id: 'custom_fields',
              name: 'customFields',
              displayName: 'Custom Fields',
              type: 'json',
              required: false,
              description: 'JSON object of custom fields',
            },
          ],
        },
        {
          id: 'get_issue',
          name: 'Get Issue',
          value: 'get',
          description: 'Get an issue by key',
          action: 'Retrieve an issue',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
              placeholder: 'PROJ-123',
            },
          ],
          optionalFields: [
            {
              id: 'expand',
              name: 'expand',
              displayName: 'Expand',
              type: 'string',
              required: false,
              description: 'Fields to expand (changelog, renderedFields, transitions)',
            },
          ],
        },
        {
          id: 'search_issues',
          name: 'Search Issues',
          value: 'search',
          description: 'Search issues using JQL',
          action: 'Search issues',
          fields: [
            {
              id: 'jql',
              name: 'jql',
              displayName: 'JQL Query',
              type: 'string',
              required: true,
              placeholder: 'project = PROJ AND status = "In Progress"',
            },
          ],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'string',
              required: false,
              default: '*all',
              description: 'Comma-separated fields to return',
            },
            {
              id: 'start_at',
              name: 'startAt',
              displayName: 'Start At',
              type: 'number',
              required: false,
              default: 0,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'update_issue',
          name: 'Update Issue',
          value: 'update',
          description: 'Update an issue',
          action: 'Update an issue',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'summary',
              name: 'summary',
              displayName: 'Summary',
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
              id: 'assignee',
              name: 'assignee',
              displayName: 'Assignee Account ID',
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
                { name: 'Highest', value: 'Highest' },
                { name: 'High', value: 'High' },
                { name: 'Medium', value: 'Medium' },
                { name: 'Low', value: 'Low' },
                { name: 'Lowest', value: 'Lowest' },
              ],
            },
            {
              id: 'labels',
              name: 'labels',
              displayName: 'Labels',
              type: 'string',
              required: false,
            },
            {
              id: 'custom_fields',
              name: 'customFields',
              displayName: 'Custom Fields',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'delete_issue',
          name: 'Delete Issue',
          value: 'delete',
          description: 'Delete an issue',
          action: 'Delete an issue',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'delete_subtasks',
              name: 'deleteSubtasks',
              displayName: 'Delete Subtasks',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'transition_issue',
          name: 'Transition Issue',
          value: 'transition',
          description: 'Transition an issue to a new status',
          action: 'Transition an issue',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
            },
            {
              id: 'transition_id',
              name: 'transitionId',
              displayName: 'Transition ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'comment',
              name: 'comment',
              displayName: 'Comment',
              type: 'string',
              required: false,
            },
            {
              id: 'resolution',
              name: 'resolution',
              displayName: 'Resolution',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'assign_issue',
          name: 'Assign Issue',
          value: 'assign',
          description: 'Assign an issue to a user',
          action: 'Assign an issue',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
            },
            {
              id: 'account_id',
              name: 'accountId',
              displayName: 'Assignee Account ID',
              type: 'string',
              required: true,
              description: 'Use "-1" to unassign',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_transitions',
          name: 'Get Transitions',
          value: 'getTransitions',
          description: 'Get available transitions for an issue',
          action: 'Get issue transitions',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
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
      description: 'Jira projects',
      operations: [
        {
          id: 'get_project',
          name: 'Get Project',
          value: 'get',
          description: 'Get a project by key',
          action: 'Retrieve a project',
          fields: [
            {
              id: 'project_key',
              name: 'projectKey',
              displayName: 'Project Key',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'expand',
              name: 'expand',
              displayName: 'Expand',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_projects',
          name: 'Get Projects',
          value: 'getMany',
          description: 'Get all projects',
          action: 'List all projects',
          fields: [],
          optionalFields: [
            {
              id: 'start_at',
              name: 'startAt',
              displayName: 'Start At',
              type: 'number',
              required: false,
              default: 0,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 50,
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
      description: 'Issue comments',
      operations: [
        {
          id: 'add_comment',
          name: 'Add Comment',
          value: 'create',
          description: 'Add a comment to an issue',
          action: 'Add a comment',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
            },
            {
              id: 'body',
              name: 'body',
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
              id: 'visibility_type',
              name: 'visibilityType',
              displayName: 'Visibility Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Group', value: 'group' },
                { name: 'Role', value: 'role' },
              ],
            },
            {
              id: 'visibility_value',
              name: 'visibilityValue',
              displayName: 'Visibility Value',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_comments',
          name: 'Get Comments',
          value: 'getMany',
          description: 'Get comments on an issue',
          action: 'List comments',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'start_at',
              name: 'startAt',
              displayName: 'Start At',
              type: 'number',
              required: false,
              default: 0,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 50,
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
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
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
              id: 'body',
              name: 'body',
              displayName: 'Comment',
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
          action: 'Delete a comment',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
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
    
    // ============================================
    // WORKLOG RESOURCE
    // ============================================
    {
      id: 'worklog',
      name: 'Worklog',
      value: 'worklog',
      description: 'Time tracking entries',
      operations: [
        {
          id: 'add_worklog',
          name: 'Add Worklog',
          value: 'create',
          description: 'Add a worklog entry',
          action: 'Add a worklog',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
            },
            {
              id: 'time_spent',
              name: 'timeSpent',
              displayName: 'Time Spent',
              type: 'string',
              required: true,
              placeholder: '3h 30m',
            },
          ],
          optionalFields: [
            {
              id: 'started',
              name: 'started',
              displayName: 'Started',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'comment',
              name: 'comment',
              displayName: 'Comment',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_worklogs',
          name: 'Get Worklogs',
          value: 'getMany',
          description: 'Get worklogs for an issue',
          action: 'List worklogs',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_worklog',
          name: 'Delete Worklog',
          value: 'delete',
          description: 'Delete a worklog',
          action: 'Delete a worklog',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
              type: 'string',
              required: true,
            },
            {
              id: 'worklog_id',
              name: 'worklogId',
              displayName: 'Worklog ID',
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
      description: 'Jira users',
      operations: [
        {
          id: 'search_users',
          name: 'Search Users',
          value: 'search',
          description: 'Search for users',
          action: 'Search users',
          fields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Search Query',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'start_at',
              name: 'startAt',
              displayName: 'Start At',
              type: 'number',
              required: false,
              default: 0,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'get_user',
          name: 'Get User',
          value: 'get',
          description: 'Get a user by account ID',
          action: 'Retrieve a user',
          fields: [
            {
              id: 'account_id',
              name: 'accountId',
              displayName: 'Account ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_assignable_users',
          name: 'Get Assignable Users',
          value: 'getAssignable',
          description: 'Get users assignable to a project',
          action: 'Get assignable users',
          fields: [
            {
              id: 'project_key',
              name: 'projectKey',
              displayName: 'Project Key',
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
      description: 'Issue attachments',
      operations: [
        {
          id: 'get_attachments',
          name: 'Get Attachments',
          value: 'getMany',
          description: 'Get attachments on an issue',
          action: 'List attachments',
          fields: [
            {
              id: 'issue_key',
              name: 'issueKey',
              displayName: 'Issue Key',
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
          action: 'Delete an attachment',
          fields: [
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
    // SPRINT RESOURCE
    // ============================================
    {
      id: 'sprint',
      name: 'Sprint',
      value: 'sprint',
      description: 'Agile sprints',
      operations: [
        {
          id: 'get_sprints',
          name: 'Get Sprints',
          value: 'getMany',
          description: 'Get sprints for a board',
          action: 'List sprints',
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
              id: 'state',
              name: 'state',
              displayName: 'State',
              type: 'options',
              required: false,
              options: [
                { name: 'Active', value: 'active' },
                { name: 'Closed', value: 'closed' },
                { name: 'Future', value: 'future' },
              ],
            },
            {
              id: 'start_at',
              name: 'startAt',
              displayName: 'Start At',
              type: 'number',
              required: false,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'get_sprint',
          name: 'Get Sprint',
          value: 'get',
          description: 'Get a sprint by ID',
          action: 'Retrieve a sprint',
          fields: [
            {
              id: 'sprint_id',
              name: 'sprintId',
              displayName: 'Sprint ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_sprint_issues',
          name: 'Get Sprint Issues',
          value: 'getIssues',
          description: 'Get issues in a sprint',
          action: 'Get sprint issues',
          fields: [
            {
              id: 'sprint_id',
              name: 'sprintId',
              displayName: 'Sprint ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'start_at',
              name: 'startAt',
              displayName: 'Start At',
              type: 'number',
              required: false,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'move_issue_to_sprint',
          name: 'Move Issue to Sprint',
          value: 'moveIssue',
          description: 'Move issues to a sprint',
          action: 'Move issue to sprint',
          fields: [
            {
              id: 'sprint_id',
              name: 'sprintId',
              displayName: 'Sprint ID',
              type: 'string',
              required: true,
            },
            {
              id: 'issues',
              name: 'issues',
              displayName: 'Issue Keys',
              type: 'string',
              required: true,
              description: 'Comma-separated issue keys',
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // BOARD RESOURCE
    // ============================================
    {
      id: 'board',
      name: 'Board',
      value: 'board',
      description: 'Agile boards',
      operations: [
        {
          id: 'get_boards',
          name: 'Get Boards',
          value: 'getMany',
          description: 'Get all boards',
          action: 'List boards',
          fields: [],
          optionalFields: [
            {
              id: 'project_key',
              name: 'projectKey',
              displayName: 'Project Key',
              type: 'string',
              required: false,
            },
            {
              id: 'type',
              name: 'type',
              displayName: 'Board Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Scrum', value: 'scrum' },
                { name: 'Kanban', value: 'kanban' },
              ],
            },
            {
              id: 'start_at',
              name: 'startAt',
              displayName: 'Start At',
              type: 'number',
              required: false,
            },
            {
              id: 'max_results',
              name: 'maxResults',
              displayName: 'Max Results',
              type: 'number',
              required: false,
              default: 50,
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
      ],
    },
  ],
};
