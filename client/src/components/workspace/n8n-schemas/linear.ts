/**
 * Linear Integration Schema
 * Resources: Issue, Comment
 */

import type { N8nAppSchema } from './types';

export const linearSchema: N8nAppSchema = {
  id: 'linear',
  name: 'Linear',
  description: 'Linear issue tracking',
  icon: 'check-square',
  color: '#5E6AD2',
  version: '1.0',
  group: ['project-management'],
  credentials: [
    {
      id: 'linear_api',
      name: 'Linear API',
      type: 'apiKey',
      fields: [
        { id: 'api_key', displayName: 'API Key', name: 'apiKey', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'issue',
      name: 'Issue',
      value: 'issue',
      description: 'Manage issues',
      operations: [
        {
          id: 'create_issue',
          name: 'Create Issue',
          value: 'create_issue',
          description: 'Create a new issue',
          action: 'Create issue',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team ID',
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
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
              typeOptions: { rows: 4 },
            },
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              options: [
                { name: 'No Priority', value: '0' },
                { name: 'Urgent', value: '1' },
                { name: 'High', value: '2' },
                { name: 'Medium', value: '3' },
                { name: 'Low', value: '4' },
              ],
            },
            {
              id: 'assignee_id',
              name: 'assigneeId',
              displayName: 'Assignee ID',
              type: 'string',
            },
            {
              id: 'state_id',
              name: 'stateId',
              displayName: 'State ID',
              type: 'string',
            },
            {
              id: 'label_ids',
              name: 'labelIds',
              displayName: 'Label IDs',
              type: 'string',
              description: 'Comma-separated label IDs',
            },
          ],
        },
        {
          id: 'update_issue',
          name: 'Update Issue',
          value: 'update_issue',
          description: 'Update an existing issue',
          action: 'Update issue',
          fields: [
            {
              id: 'issue_id',
              name: 'issueId',
              displayName: 'Issue ID',
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
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
            },
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              options: [
                { name: 'No Priority', value: '0' },
                { name: 'Urgent', value: '1' },
                { name: 'High', value: '2' },
                { name: 'Medium', value: '3' },
                { name: 'Low', value: '4' },
              ],
            },
            {
              id: 'state_id',
              name: 'stateId',
              displayName: 'State ID',
              type: 'string',
            },
            {
              id: 'assignee_id',
              name: 'assigneeId',
              displayName: 'Assignee ID',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      id: 'comment',
      name: 'Comment',
      value: 'comment',
      description: 'Manage comments',
      operations: [
        {
          id: 'add_comment',
          name: 'Add Comment',
          value: 'add_comment',
          description: 'Add a comment to an issue',
          action: 'Add comment',
          fields: [
            {
              id: 'issue_id',
              name: 'issueId',
              displayName: 'Issue ID',
              type: 'string',
              required: true,
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Comment Body',
              type: 'text',
              required: true,
              typeOptions: { rows: 3 },
            },
          ],
        },
      ],
    },
  ],
};
