/**
 * Productivity App Configurations - Part 1
 * 
 * n8n-style configurations for:
 * - Asana
 * - Trello
 * - GitHub
 */

import React from "react";
import {
  TextField,
  TextareaField,
  SelectField,
  SwitchField,
  NumberField,
  CredentialField,
  ExpressionField,
  KeyValueField,
  CollectionField,
  FixedCollectionField,
  DateTimeField,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// ASANA CONFIG
// ============================================

export const AsanaConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Asana Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Asana OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'task'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'task', label: 'Task' },
        { value: 'project', label: 'Project' },
        { value: 'subtask', label: 'Subtask' },
        { value: 'user', label: 'User' },
      ]}
      required
    />

    {resource === 'task' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Task' },
            { value: 'get', label: 'Get Task' },
            { value: 'getAll', label: 'Get All Tasks' },
            { value: 'update', label: 'Update Task' },
            { value: 'delete', label: 'Delete Task' },
            { value: 'move', label: 'Move to Section' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Workspace ID"
              value={config.workspaceId || ''}
              onChange={(v) => updateConfig('workspaceId', v)}
              required
            />

            <ExpressionField
              label="Task Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'projectId', displayName: 'Project ID', type: 'string' },
                { name: 'assignee', displayName: 'Assignee (Email/ID)', type: 'string' },
                { name: 'notes', displayName: 'Description', type: 'string' },
                { name: 'dueOn', displayName: 'Due Date (YYYY-MM-DD)', type: 'string' },
                { name: 'completed', displayName: 'Completed', type: 'boolean' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Task ID"
            value={config.taskId || ''}
            onChange={(v) => updateConfig('taskId', v)}
            required
          />
        )}

        {operation === 'getAll' && (
          <>
            <ExpressionField
              label="Project ID"
              value={config.projectId || ''}
              onChange={(v) => updateConfig('projectId', v)}
              required
            />

            <NumberField
              label="Limit"
              value={config.limit || 50}
              onChange={(v) => updateConfig('limit', v)}
            />
          </>
        )}
      </>
    )}

    {resource === 'project' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Project' },
            { value: 'getAll', label: 'Get All Projects' },
          ]}
        />

        {operation === 'get' && (
          <ExpressionField
            label="Project ID"
            value={config.projectId || ''}
            onChange={(v) => updateConfig('projectId', v)}
            required
          />
        )}

        {operation === 'getAll' && (
          <ExpressionField
            label="Workspace ID"
            value={config.workspaceId || ''}
            onChange={(v) => updateConfig('workspaceId', v)}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// TRELLO CONFIG
// ============================================

export const TrelloConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Trello Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Trello API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'card'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'card', label: 'Card' },
        { value: 'board', label: 'Board' },
        { value: 'list', label: 'List' },
        { value: 'checklist', label: 'Checklist' },
      ]}
      required
    />

    {resource === 'card' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Card' },
            { value: 'get', label: 'Get Card' },
            { value: 'update', label: 'Update Card' },
            { value: 'delete', label: 'Delete Card' },
            { value: 'move', label: 'Move Card' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="List ID"
              value={config.listId || ''}
              onChange={(v) => updateConfig('listId', v)}
              required
            />

            <ExpressionField
              label="Card Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'desc', displayName: 'Description', type: 'string' },
                { name: 'pos', displayName: 'Position', type: 'options', options: [
                  { value: 'top', label: 'Top' },
                  { value: 'bottom', label: 'Bottom' },
                ]},
                { name: 'due', displayName: 'Due Date', type: 'string' },
                { name: 'idMembers', displayName: 'Member IDs (comma-sep)', type: 'string' },
                { name: 'idLabels', displayName: 'Label IDs (comma-sep)', type: 'string' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete' || config.operation === 'move') && (
          <ExpressionField
            label="Card ID"
            value={config.cardId || ''}
            onChange={(v) => updateConfig('cardId', v)}
            required
          />
        )}

        {operation === 'move' && (
          <ExpressionField
            label="Target List ID"
            value={config.targetListId || ''}
            onChange={(v) => updateConfig('targetListId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'board' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Board' },
            { value: 'get', label: 'Get Board' },
            { value: 'getAll', label: 'Get All Boards' },
          ]}
        />

        {operation === 'create' && (
          <ExpressionField
            label="Board Name"
            value={config.name || ''}
            onChange={(v) => updateConfig('name', v)}
            required
          />
        )}

        {operation === 'get' && (
          <ExpressionField
            label="Board ID"
            value={config.boardId || ''}
            onChange={(v) => updateConfig('boardId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'list' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create List' },
            { value: 'getAll', label: 'Get All Lists' },
            { value: 'archive', label: 'Archive List' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Board ID"
              value={config.boardId || ''}
              onChange={(v) => updateConfig('boardId', v)}
              required
            />

            <ExpressionField
              label="List Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />
          </>
        )}

        {operation === 'getAll' && (
          <ExpressionField
            label="Board ID"
            value={config.boardId || ''}
            onChange={(v) => updateConfig('boardId', v)}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// GITHUB CONFIG
// ============================================

export const GitHubConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="GitHub Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="GitHub OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'issue'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'issue', label: 'Issue' },
        { value: 'repository', label: 'Repository' },
        { value: 'pullRequest', label: 'Pull Request' },
        { value: 'release', label: 'Release' },
        { value: 'file', label: 'File' },
      ]}
      required
    />

    <ExpressionField
      label="Repository Owner"
      value={config.owner || ''}
      onChange={(v) => updateConfig('owner', v)}
      placeholder="username or org"
      required
    />

    <ExpressionField
      label="Repository Name"
      value={config.repo || ''}
      onChange={(v) => updateConfig('repo', v)}
      required
    />

    {resource === 'issue' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Issue' },
            { value: 'get', label: 'Get Issue' },
            { value: 'getAll', label: 'Get All Issues' },
            { value: 'update', label: 'Update Issue' },
            { value: 'comment', label: 'Add Comment' },
            { value: 'lock', label: 'Lock Issue' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              required
            />

            <TextareaField
              label="Body"
              value={config.body || ''}
              onChange={(v) => updateConfig('body', v)}
              rows={4}
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'assignees', displayName: 'Assignees (comma-sep)', type: 'string' },
                { name: 'labels', displayName: 'Labels (comma-sep)', type: 'string' },
                { name: 'milestone', displayName: 'Milestone Number', type: 'number' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'comment' || config.operation === 'lock') && (
          <ExpressionField
            label="Issue Number"
            value={config.issueNumber || ''}
            onChange={(v) => updateConfig('issueNumber', v)}
            required
          />
        )}

        {operation === 'comment' && (
          <TextareaField
            label="Comment Body"
            value={config.commentBody || ''}
            onChange={(v) => updateConfig('commentBody', v)}
            rows={3}
            required
          />
        )}

        {operation === 'getAll' && (
          <CollectionField
            label="Filters"
            value={config.filters || {}}
            onChange={(v) => updateConfig('filters', v)}
            options={[
              { name: 'state', displayName: 'State', type: 'options', options: [
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
                { value: 'all', label: 'All' },
              ]},
              { name: 'labels', displayName: 'Labels', type: 'string' },
              { name: 'assignee', displayName: 'Assignee', type: 'string' },
            ]}
          />
        )}
      </>
    )}

    {resource === 'pullRequest' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create PR' },
            { value: 'get', label: 'Get PR' },
            { value: 'getAll', label: 'Get All PRs' },
            { value: 'merge', label: 'Merge PR' },
            { value: 'review', label: 'Create Review' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              required
            />

            <ExpressionField
              label="Head Branch"
              value={config.head || ''}
              onChange={(v) => updateConfig('head', v)}
              placeholder="feature-branch"
              required
            />

            <ExpressionField
              label="Base Branch"
              value={config.base || 'main'}
              onChange={(v) => updateConfig('base', v)}
              required
            />

            <TextareaField
              label="Body"
              value={config.body || ''}
              onChange={(v) => updateConfig('body', v)}
              rows={4}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'merge' || config.operation === 'review') && (
          <ExpressionField
            label="Pull Request Number"
            value={config.prNumber || ''}
            onChange={(v) => updateConfig('prNumber', v)}
            required
          />
        )}

        {operation === 'merge' && (
          <SelectField
            label="Merge Method"
            value={config.mergeMethod || 'merge'}
            onChange={(v) => updateConfig('mergeMethod', v)}
            options={[
              { value: 'merge', label: 'Merge Commit' },
              { value: 'squash', label: 'Squash and Merge' },
              { value: 'rebase', label: 'Rebase and Merge' },
            ]}
          />
        )}
      </>
    )}

    {resource === 'file' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get File' },
            { value: 'create', label: 'Create File' },
            { value: 'update', label: 'Update File' },
            { value: 'delete', label: 'Delete File' },
          ]}
        />

        <ExpressionField
          label="File Path"
          value={config.filePath || ''}
          onChange={(v) => updateConfig('filePath', v)}
          placeholder="path/to/file.txt"
          required
        />

        {(operation === 'create' || config.operation === 'update') && (
          <>
            <TextareaField
              label="File Content"
              value={config.content || ''}
              onChange={(v) => updateConfig('content', v)}
              rows={6}
              required
            />

            <ExpressionField
              label="Commit Message"
              value={config.commitMessage || ''}
              onChange={(v) => updateConfig('commitMessage', v)}
              required
            />

            <TextField
              label="Branch"
              value={config.branch || 'main'}
              onChange={(v) => updateConfig('branch', v)}
            />
          </>
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// JIRA CONFIG
// ============================================

export const JiraConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Jira Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Jira OAuth2"
      required
    />

    <TextField
      label="Jira Domain"
      value={config.domain || ''}
      onChange={(v) => updateConfig('domain', v)}
      placeholder="yourcompany.atlassian.net"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'issue'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'issue', label: 'Issue' },
        { value: 'project', label: 'Project' },
        { value: 'user', label: 'User' },
      ]}
      required
    />

    {resource === 'issue' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Issue' },
            { value: 'get', label: 'Get Issue' },
            { value: 'getAll', label: 'Get All Issues (JQL)' },
            { value: 'update', label: 'Update Issue' },
            { value: 'delete', label: 'Delete Issue' },
            { value: 'transition', label: 'Transition Issue' },
            { value: 'comment', label: 'Add Comment' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Project Key"
              value={config.projectKey || ''}
              onChange={(v) => updateConfig('projectKey', v)}
              placeholder="PROJ"
              required
            />

            <SelectField
              label="Issue Type"
              value={config.issueType || 'Task'}
              onChange={(v) => updateConfig('issueType', v)}
              options={[
                { value: 'Task', label: 'Task' },
                { value: 'Bug', label: 'Bug' },
                { value: 'Story', label: 'Story' },
                { value: 'Epic', label: 'Epic' },
                { value: 'Subtask', label: 'Subtask' },
              ]}
            />

            <ExpressionField
              label="Summary"
              value={config.summary || ''}
              onChange={(v) => updateConfig('summary', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'assignee', displayName: 'Assignee ID', type: 'string' },
                { name: 'priority', displayName: 'Priority', type: 'options', options: [
                  { value: 'Highest', label: 'Highest' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                  { value: 'Lowest', label: 'Lowest' },
                ]},
                { name: 'labels', displayName: 'Labels (comma-sep)', type: 'string' },
                { name: 'parentKey', displayName: 'Parent Issue Key', type: 'string' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete' || config.operation === 'transition' || config.operation === 'comment') && (
          <ExpressionField
            label="Issue Key"
            value={config.issueKey || ''}
            onChange={(v) => updateConfig('issueKey', v)}
            placeholder="PROJ-123"
            required
          />
        )}

        {operation === 'getAll' && (
          <>
            <ExpressionField
              label="JQL Query"
              value={config.jql || ''}
              onChange={(v) => updateConfig('jql', v)}
              placeholder="project = PROJ AND status = 'In Progress'"
              required
            />

            <NumberField
              label="Max Results"
              value={config.maxResults || 50}
              onChange={(v) => updateConfig('maxResults', v)}
            />
          </>
        )}

        {operation === 'transition' && (
          <ExpressionField
            label="Transition ID"
            value={config.transitionId || ''}
            onChange={(v) => updateConfig('transitionId', v)}
            required
          />
        )}

        {operation === 'comment' && (
          <TextareaField
            label="Comment"
            value={config.comment || ''}
            onChange={(v) => updateConfig('comment', v)}
            rows={3}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// GITLAB CONFIG
// ============================================

export const GitLabConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="GitLab Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="GitLab OAuth2"
      required
    />

    <TextField
      label="GitLab URL"
      value={config.gitlabUrl || 'https://gitlab.com'}
      onChange={(v) => updateConfig('gitlabUrl', v)}
      description="Use custom URL for self-hosted GitLab"
    />

    <ExpressionField
      label="Project ID or Path"
      value={config.projectId || ''}
      onChange={(v) => updateConfig('projectId', v)}
      placeholder="namespace/project or 12345"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'issue'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'issue', label: 'Issue' },
        { value: 'mergeRequest', label: 'Merge Request' },
        { value: 'repository', label: 'Repository' },
        { value: 'pipeline', label: 'Pipeline' },
      ]}
      required
    />

    {resource === 'issue' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Issue' },
            { value: 'get', label: 'Get Issue' },
            { value: 'getAll', label: 'Get All Issues' },
            { value: 'update', label: 'Update Issue' },
            { value: 'delete', label: 'Delete Issue' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'assignee_ids', displayName: 'Assignee IDs (comma-sep)', type: 'string' },
                { name: 'labels', displayName: 'Labels (comma-sep)', type: 'string' },
                { name: 'milestone_id', displayName: 'Milestone ID', type: 'number' },
                { name: 'due_date', displayName: 'Due Date (YYYY-MM-DD)', type: 'string' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Issue IID"
            value={config.issueIid || ''}
            onChange={(v) => updateConfig('issueIid', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'mergeRequest' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create MR' },
            { value: 'get', label: 'Get MR' },
            { value: 'getAll', label: 'Get All MRs' },
            { value: 'merge', label: 'Merge MR' },
            { value: 'approve', label: 'Approve MR' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              required
            />

            <ExpressionField
              label="Source Branch"
              value={config.sourceBranch || ''}
              onChange={(v) => updateConfig('sourceBranch', v)}
              required
            />

            <ExpressionField
              label="Target Branch"
              value={config.targetBranch || 'main'}
              onChange={(v) => updateConfig('targetBranch', v)}
              required
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'merge' || config.operation === 'approve') && (
          <ExpressionField
            label="Merge Request IID"
            value={config.mrIid || ''}
            onChange={(v) => updateConfig('mrIid', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'pipeline' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Pipeline' },
            { value: 'get', label: 'Get Pipeline' },
            { value: 'getAll', label: 'Get All Pipelines' },
            { value: 'cancel', label: 'Cancel Pipeline' },
            { value: 'retry', label: 'Retry Pipeline' },
          ]}
        />

        {operation === 'create' && (
          <ExpressionField
            label="Branch/Ref"
            value={config.ref || 'main'}
            onChange={(v) => updateConfig('ref', v)}
            required
          />
        )}

        {(operation === 'get' || config.operation === 'cancel' || config.operation === 'retry') && (
          <ExpressionField
            label="Pipeline ID"
            value={config.pipelineId || ''}
            onChange={(v) => updateConfig('pipelineId', v)}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// LINEAR CONFIG
// ============================================

export const LinearConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Linear API Key"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Linear API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'issue'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'issue', label: 'Issue' },
        { value: 'project', label: 'Project' },
        { value: 'comment', label: 'Comment' },
      ]}
      required
    />

    {resource === 'issue' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Issue' },
            { value: 'get', label: 'Get Issue' },
            { value: 'getAll', label: 'Get All Issues' },
            { value: 'update', label: 'Update Issue' },
            { value: 'delete', label: 'Delete Issue' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Team ID"
              value={config.teamId || ''}
              onChange={(v) => updateConfig('teamId', v)}
              required
            />

            <ExpressionField
              label="Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'assigneeId', displayName: 'Assignee ID', type: 'string' },
                { name: 'priority', displayName: 'Priority (0-4)', type: 'number' },
                { name: 'stateId', displayName: 'State ID', type: 'string' },
                { name: 'labelIds', displayName: 'Label IDs (comma-sep)', type: 'string' },
                { name: 'projectId', displayName: 'Project ID', type: 'string' },
                { name: 'estimate', displayName: 'Estimate (points)', type: 'number' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Issue ID"
            value={config.issueId || ''}
            onChange={(v) => updateConfig('issueId', v)}
            required
          />
        )}

        {operation === 'getAll' && (
          <CollectionField
            label="Filters"
            value={config.filters || {}}
            onChange={(v) => updateConfig('filters', v)}
            options={[
              { name: 'teamId', displayName: 'Team ID', type: 'string' },
              { name: 'projectId', displayName: 'Project ID', type: 'string' },
              { name: 'assigneeId', displayName: 'Assignee ID', type: 'string' },
              { name: 'first', displayName: 'Limit', type: 'number' },
            ]}
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// CLICKUP CONFIG
// ============================================

export const ClickUpConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="ClickUp Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="ClickUp OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'task'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'task', label: 'Task' },
        { value: 'list', label: 'List' },
        { value: 'folder', label: 'Folder' },
        { value: 'comment', label: 'Comment' },
      ]}
      required
    />

    {resource === 'task' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Task' },
            { value: 'get', label: 'Get Task' },
            { value: 'getAll', label: 'Get All Tasks' },
            { value: 'update', label: 'Update Task' },
            { value: 'delete', label: 'Delete Task' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="List ID"
              value={config.listId || ''}
              onChange={(v) => updateConfig('listId', v)}
              required
            />

            <ExpressionField
              label="Task Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'assignees', displayName: 'Assignee IDs (comma-sep)', type: 'string' },
                { name: 'priority', displayName: 'Priority (1-4)', type: 'number' },
                { name: 'status', displayName: 'Status', type: 'string' },
                { name: 'due_date', displayName: 'Due Date (Unix ms)', type: 'number' },
                { name: 'tags', displayName: 'Tags (comma-sep)', type: 'string' },
                { name: 'time_estimate', displayName: 'Time Estimate (ms)', type: 'number' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Task ID"
            value={config.taskId || ''}
            onChange={(v) => updateConfig('taskId', v)}
            required
          />
        )}

        {operation === 'getAll' && (
          <ExpressionField
            label="List ID"
            value={config.listId || ''}
            onChange={(v) => updateConfig('listId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'list' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create List' },
            { value: 'getAll', label: 'Get All Lists' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Folder ID"
              value={config.folderId || ''}
              onChange={(v) => updateConfig('folderId', v)}
              required
            />

            <ExpressionField
              label="List Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />
          </>
        )}

        {operation === 'getAll' && (
          <ExpressionField
            label="Folder ID"
            value={config.folderId || ''}
            onChange={(v) => updateConfig('folderId', v)}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// TODOIST CONFIG
// ============================================

export const TodoistConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Todoist API Token"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Todoist API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'task'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'task', label: 'Task' },
        { value: 'project', label: 'Project' },
        { value: 'section', label: 'Section' },
        { value: 'comment', label: 'Comment' },
      ]}
      required
    />

    {resource === 'task' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Task' },
            { value: 'get', label: 'Get Task' },
            { value: 'getAll', label: 'Get All Tasks' },
            { value: 'update', label: 'Update Task' },
            { value: 'close', label: 'Close Task' },
            { value: 'reopen', label: 'Reopen Task' },
            { value: 'delete', label: 'Delete Task' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Content"
              value={config.content || ''}
              onChange={(v) => updateConfig('content', v)}
              placeholder="Task title"
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'project_id', displayName: 'Project ID', type: 'string' },
                { name: 'section_id', displayName: 'Section ID', type: 'string' },
                { name: 'priority', displayName: 'Priority (1-4)', type: 'number' },
                { name: 'due_string', displayName: 'Due Date (natural)', type: 'string', placeholder: 'tomorrow at 5pm' },
                { name: 'due_date', displayName: 'Due Date (YYYY-MM-DD)', type: 'string' },
                { name: 'labels', displayName: 'Labels (comma-sep)', type: 'string' },
                { name: 'assignee_id', displayName: 'Assignee ID', type: 'string' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'close' || config.operation === 'reopen' || config.operation === 'delete') && (
          <ExpressionField
            label="Task ID"
            value={config.taskId || ''}
            onChange={(v) => updateConfig('taskId', v)}
            required
          />
        )}

        {operation === 'getAll' && (
          <CollectionField
            label="Filters"
            value={config.filters || {}}
            onChange={(v) => updateConfig('filters', v)}
            options={[
              { name: 'project_id', displayName: 'Project ID', type: 'string' },
              { name: 'section_id', displayName: 'Section ID', type: 'string' },
              { name: 'filter', displayName: 'Filter Query', type: 'string', placeholder: 'today | overdue' },
            ]}
          />
        )}
      </>
    )}

    {resource === 'project' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Project' },
            { value: 'get', label: 'Get Project' },
            { value: 'getAll', label: 'Get All Projects' },
            { value: 'update', label: 'Update Project' },
            { value: 'delete', label: 'Delete Project' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Project Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'color', displayName: 'Color', type: 'string' },
                { name: 'parent_id', displayName: 'Parent Project ID', type: 'string' },
                { name: 'is_favorite', displayName: 'Favorite', type: 'boolean' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Project ID"
            value={config.projectId || ''}
            onChange={(v) => updateConfig('projectId', v)}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export const ProductivityAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  asana: AsanaConfig,
  asana_task: AsanaConfig,
  
  trello: TrelloConfig,
  trello_card: TrelloConfig,
  
  github: GitHubConfig,
  github_issue: GitHubConfig,
  github_pr: GitHubConfig,
  
  jira: JiraConfig,
  jira_issue: JiraConfig,
  
  gitlab: GitLabConfig,
  gitlab_issue: GitLabConfig,
  gitlab_mr: GitLabConfig,
  
  linear: LinearConfig,
  linear_issue: LinearConfig,
  
  clickup: ClickUpConfig,
  clickup_task: ClickUpConfig,
  
  todoist: TodoistConfig,
  todoist_task: TodoistConfig,
};

export default ProductivityAppConfigs;
