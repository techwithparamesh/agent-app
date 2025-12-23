/**
 * Developer Tools App Configurations
 * 
 * n8n-style configurations for:
 * - Webhook
 * - REST API
 * - GraphQL
 * - GitHub (already in ProductivityApps, re-export)
 * - GitLab (already in ProductivityApps, re-export)
 * - Bitbucket
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
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// WEBHOOK CONFIG
// ============================================

export const WebhookConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const responseMode = config.responseMode || '';
  
  return (
  <div className="space-y-4">
    <SelectField
      label="HTTP Method"
      value={config.httpMethod || 'POST'}
      onChange={(v) => updateConfig('httpMethod', v)}
      options={[
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' },
      ]}
    />

    <TextField
      label="Webhook Path"
      value={config.path || ''}
      onChange={(v) => updateConfig('path', v)}
      placeholder="/webhook/my-endpoint"
      description="Path for the webhook URL"
    />

    <SelectField
      label="Response Mode"
      value={config.responseMode || 'onReceived'}
      onChange={(v) => updateConfig('responseMode', v)}
      options={[
        { value: 'onReceived', label: 'On Received (Immediate)' },
        { value: 'lastNode', label: 'After Last Node' },
        { value: 'responseNode', label: 'Using Response Node' },
      ]}
    />

    {config.responseMode === 'onReceived' && (
      <CollectionField
        label="Response Options"
        value={config.responseOptions || {}}
        onChange={(v) => updateConfig('responseOptions', v)}
        options={[
          { name: 'responseCode', displayName: 'Response Code', type: 'number' },
          { name: 'responseData', displayName: 'Response Data', type: 'string' },
          { name: 'responseContentType', displayName: 'Content Type', type: 'options', options: [
            { value: 'application/json', label: 'JSON' },
            { value: 'text/plain', label: 'Text' },
            { value: 'text/html', label: 'HTML' },
          ]},
        ]}
      />
    )}

    <CollectionField
      label="Options"
      value={config.options || {}}
      onChange={(v) => updateConfig('options', v)}
      options={[
        { name: 'rawBody', displayName: 'Raw Body', type: 'boolean' },
        { name: 'binaryData', displayName: 'Binary Data', type: 'boolean' },
        { name: 'ignoreBodyParser', displayName: 'Ignore Body Parser', type: 'boolean' },
      ]}
    />

    <KeyValueField
      label="Headers to Extract"
      value={config.headerAuth || []}
      onChange={(v) => updateConfig('headerAuth', v)}
      keyPlaceholder="Header Name"
      valuePlaceholder="Expected Value"
    />
  </div>
  );
};

// ============================================
// REST API CONFIG
// ============================================

export const RestApiConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const authType = config.authType || 'none';
  const bodyContentType = config.bodyContentType || '';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Authentication"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="HTTP Auth"
    />

    <SelectField
      label="Method"
      value={config.method || 'GET'}
      onChange={(v) => updateConfig('method', v)}
      options={[
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' },
        { value: 'HEAD', label: 'HEAD' },
        { value: 'OPTIONS', label: 'OPTIONS' },
      ]}
      required
    />

    <ExpressionField
      label="URL"
      value={config.url || ''}
      onChange={(v) => updateConfig('url', v)}
      placeholder="https://api.example.com/endpoint"
      required
    />

    <SelectField
      label="Authentication"
      value={config.authType || 'none'}
      onChange={(v) => updateConfig('authType', v)}
      options={[
        { value: 'none', label: 'None' },
        { value: 'basicAuth', label: 'Basic Auth' },
        { value: 'headerAuth', label: 'Header Auth' },
        { value: 'oauth2', label: 'OAuth2' },
        { value: 'apiKey', label: 'API Key' },
      ]}
    />

    {authType === 'basicAuth' && (
      <>
        <TextField
          label="Username"
          value={config.username || ''}
          onChange={(v) => updateConfig('username', v)}
        />
        <TextField
          label="Password"
          value={config.password || ''}
          onChange={(v) => updateConfig('password', v)}
        />
      </>
    )}

    {authType === 'headerAuth' && (
      <KeyValueField
        label="Auth Headers"
        value={config.authHeaders || []}
        onChange={(v) => updateConfig('authHeaders', v)}
        keyPlaceholder="Header Name"
        valuePlaceholder="Value"
      />
    )}

    {authType === 'apiKey' && (
      <>
        <TextField
          label="API Key Name"
          value={config.apiKeyName || 'X-API-Key'}
          onChange={(v) => updateConfig('apiKeyName', v)}
        />
        <ExpressionField
          label="API Key Value"
          value={config.apiKeyValue || ''}
          onChange={(v) => updateConfig('apiKeyValue', v)}
        />
        <SelectField
          label="Add API Key To"
          value={config.apiKeyLocation || 'header'}
          onChange={(v) => updateConfig('apiKeyLocation', v)}
          options={[
            { value: 'header', label: 'Header' },
            { value: 'query', label: 'Query Parameter' },
          ]}
        />
      </>
    )}

    <KeyValueField
      label="Headers"
      value={config.headers || []}
      onChange={(v) => updateConfig('headers', v)}
      keyPlaceholder="Header Name"
      valuePlaceholder="Value"
    />

    <KeyValueField
      label="Query Parameters"
      value={config.queryParams || []}
      onChange={(v) => updateConfig('queryParams', v)}
      keyPlaceholder="Parameter"
      valuePlaceholder="Value"
    />

    {(config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH') && (
      <>
        <SelectField
          label="Body Content Type"
          value={config.bodyContentType || 'json'}
          onChange={(v) => updateConfig('bodyContentType', v)}
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'form', label: 'Form Data' },
            { value: 'formUrlEncoded', label: 'Form URL Encoded' },
            { value: 'raw', label: 'Raw' },
          ]}
        />

        {config.bodyContentType === 'json' && (
          <TextareaField
            label="JSON Body"
            value={config.body || ''}
            onChange={(v) => updateConfig('body', v)}
            placeholder='{"key": "value"}'
            rows={6}
          />
        )}

        {(config.bodyContentType === 'form' || config.bodyContentType === 'formUrlEncoded') && (
          <KeyValueField
            label="Form Fields"
            value={config.formFields || []}
            onChange={(v) => updateConfig('formFields', v)}
            keyPlaceholder="Field Name"
            valuePlaceholder="Value"
          />
        )}

        {config.bodyContentType === 'raw' && (
          <TextareaField
            label="Raw Body"
            value={config.rawBody || ''}
            onChange={(v) => updateConfig('rawBody', v)}
            rows={6}
          />
        )}
      </>
    )}

    <CollectionField
      label="Options"
      value={config.options || {}}
      onChange={(v) => updateConfig('options', v)}
      options={[
        { name: 'timeout', displayName: 'Timeout (ms)', type: 'number' },
        { name: 'followRedirect', displayName: 'Follow Redirects', type: 'boolean' },
        { name: 'ignoreSSL', displayName: 'Ignore SSL Issues', type: 'boolean' },
        { name: 'fullResponse', displayName: 'Full Response', type: 'boolean' },
        { name: 'proxy', displayName: 'Proxy URL', type: 'string' },
      ]}
    />
  </div>
  );
};

// ============================================
// GRAPHQL CONFIG
// ============================================

export const GraphQLConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Authentication"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="GraphQL Auth"
    />

    <ExpressionField
      label="Endpoint URL"
      value={config.endpoint || ''}
      onChange={(v) => updateConfig('endpoint', v)}
      placeholder="https://api.example.com/graphql"
      required
    />

    <SelectField
      label="Request Method"
      value={config.method || 'POST'}
      onChange={(v) => updateConfig('method', v)}
      options={[
        { value: 'POST', label: 'POST' },
        { value: 'GET', label: 'GET' },
      ]}
    />

    <TextareaField
      label="Query"
      value={config.query || ''}
      onChange={(v) => updateConfig('query', v)}
      placeholder={`query {
  users {
    id
    name
    email
  }
}`}
      rows={10}
      required
    />

    <TextareaField
      label="Variables (JSON)"
      value={config.variables || ''}
      onChange={(v) => updateConfig('variables', v)}
      placeholder='{"userId": "123"}'
      rows={4}
    />

    <KeyValueField
      label="Headers"
      value={config.headers || []}
      onChange={(v) => updateConfig('headers', v)}
      keyPlaceholder="Header Name"
      valuePlaceholder="Value"
    />

    <CollectionField
      label="Options"
      value={config.options || {}}
      onChange={(v) => updateConfig('options', v)}
      options={[
        { name: 'operationName', displayName: 'Operation Name', type: 'string' },
        { name: 'timeout', displayName: 'Timeout (ms)', type: 'number' },
      ]}
    />
  </div>
);

// ============================================
// BITBUCKET CONFIG
// ============================================

export const BitbucketConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Bitbucket Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Bitbucket OAuth2"
      required
    />

    <ExpressionField
      label="Workspace"
      value={config.workspace || ''}
      onChange={(v) => updateConfig('workspace', v)}
      placeholder="your-workspace"
      required
    />

    <ExpressionField
      label="Repository Slug"
      value={config.repoSlug || ''}
      onChange={(v) => updateConfig('repoSlug', v)}
      placeholder="your-repo"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'repository'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'repository', label: 'Repository' },
        { value: 'pullRequest', label: 'Pull Request' },
        { value: 'issue', label: 'Issue' },
        { value: 'commit', label: 'Commit' },
        { value: 'pipeline', label: 'Pipeline' },
      ]}
      required
    />

    {resource === 'repository' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Repository' },
            { value: 'getAll', label: 'Get All Repositories' },
          ]}
        />
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
            { value: 'update', label: 'Update PR' },
            { value: 'merge', label: 'Merge PR' },
            { value: 'decline', label: 'Decline PR' },
            { value: 'approve', label: 'Approve PR' },
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
              label="Destination Branch"
              value={config.destBranch || 'main'}
              onChange={(v) => updateConfig('destBranch', v)}
              required
            />

            <TextareaField
              label="Description"
              value={config.description || ''}
              onChange={(v) => updateConfig('description', v)}
              rows={4}
            />

            <SwitchField
              label="Close Source Branch"
              value={config.closeSourceBranch || false}
              onChange={(v) => updateConfig('closeSourceBranch', v)}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'merge' || config.operation === 'decline' || config.operation === 'approve') && (
          <ExpressionField
            label="Pull Request ID"
            value={config.prId || ''}
            onChange={(v) => updateConfig('prId', v)}
            required
          />
        )}
      </>
    )}

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
              label="Content"
              value={config.content || ''}
              onChange={(v) => updateConfig('content', v)}
              rows={4}
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'kind', displayName: 'Kind', type: 'options', options: [
                  { value: 'bug', label: 'Bug' },
                  { value: 'enhancement', label: 'Enhancement' },
                  { value: 'proposal', label: 'Proposal' },
                  { value: 'task', label: 'Task' },
                ]},
                { name: 'priority', displayName: 'Priority', type: 'options', options: [
                  { value: 'trivial', label: 'Trivial' },
                  { value: 'minor', label: 'Minor' },
                  { value: 'major', label: 'Major' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'blocker', label: 'Blocker' },
                ]},
                { name: 'assignee', displayName: 'Assignee Username', type: 'string' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update') && (
          <ExpressionField
            label="Issue ID"
            value={config.issueId || ''}
            onChange={(v) => updateConfig('issueId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'pipeline' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'trigger'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'trigger', label: 'Trigger Pipeline' },
            { value: 'get', label: 'Get Pipeline' },
            { value: 'getAll', label: 'Get All Pipelines' },
            { value: 'stop', label: 'Stop Pipeline' },
          ]}
        />

        {operation === 'trigger' && (
          <>
            <ExpressionField
              label="Branch/Tag/Commit"
              value={config.target || 'main'}
              onChange={(v) => updateConfig('target', v)}
              required
            />

            <SelectField
              label="Target Type"
              value={config.targetType || 'branch'}
              onChange={(v) => updateConfig('targetType', v)}
              options={[
                { value: 'branch', label: 'Branch' },
                { value: 'tag', label: 'Tag' },
                { value: 'commit', label: 'Commit' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'stop') && (
          <ExpressionField
            label="Pipeline UUID"
            value={config.pipelineUuid || ''}
            onChange={(v) => updateConfig('pipelineUuid', v)}
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

export const DeveloperAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  webhook: WebhookConfig,
  webhook_trigger: WebhookConfig,
  
  rest_api: RestApiConfig,
  http_request: RestApiConfig,
  api: RestApiConfig,
  
  graphql: GraphQLConfig,
  graphql_api: GraphQLConfig,
  
  bitbucket: BitbucketConfig,
  bitbucket_pr: BitbucketConfig,
};

export default DeveloperAppConfigs;
