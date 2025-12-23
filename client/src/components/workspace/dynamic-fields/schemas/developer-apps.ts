/**
 * App Schema Registry - Developer Tools
 * 
 * Schema definitions for HTTP requests, webhooks, databases, GitHub, and code utilities
 */

import type { AppSchema, FieldSchema } from '../types';

// ============================================
// HTTP REQUEST SCHEMA
// ============================================

export const httpRequestSchema: AppSchema = {
  id: 'http_request',
  name: 'HTTP Request',
  description: 'Make HTTP/REST API calls to any endpoint',
  icon: '🌐',
  color: '#FF6B35',
  category: 'Developer',
  tags: ['http', 'api', 'rest', 'request'],
  version: '1.0.0',
  status: 'stable',
  
  credentials: [{
    id: 'http_auth',
    name: 'HTTP Authentication',
    type: 'custom',
    fields: [
      {
        id: 'authType',
        name: 'Auth Type',
        type: 'select',
        options: [
          { value: 'none', label: 'No Auth' },
          { value: 'basic', label: 'Basic Auth' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'api_key', label: 'API Key' },
          { value: 'oauth2', label: 'OAuth 2.0' },
        ],
      },
      { id: 'username', name: 'Username', type: 'text', showWhen: [{ field: 'authType', condition: 'equals', value: 'basic' }] },
      { id: 'password', name: 'Password', type: 'secret', showWhen: [{ field: 'authType', condition: 'equals', value: 'basic' }] },
      { id: 'token', name: 'Token', type: 'secret', showWhen: [{ field: 'authType', condition: 'equals', value: 'bearer' }] },
      { id: 'apiKey', name: 'API Key', type: 'secret', showWhen: [{ field: 'authType', condition: 'equals', value: 'api_key' }] },
      { id: 'apiKeyHeader', name: 'Header Name', type: 'text', defaultValue: 'X-API-Key', showWhen: [{ field: 'authType', condition: 'equals', value: 'api_key' }] },
    ],
  }],
  
  actions: [
    {
      id: 'http_make_request',
      appId: 'http_request',
      name: 'Make Request',
      description: 'Send an HTTP request',
      category: 'Requests',
      requiresCredential: false,
      fieldGroups: [
        { id: 'request', name: 'Request' },
        { id: 'body', name: 'Body' },
        { id: 'headers', name: 'Headers', collapsed: true },
        { id: 'options', name: 'Options', collapsed: true },
      ],
      fields: [
        {
          id: 'method',
          name: 'Method',
          type: 'select',
          group: 'request',
          validation: { required: true },
          defaultValue: 'GET',
          options: [
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'PATCH', label: 'PATCH' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'HEAD', label: 'HEAD' },
            { value: 'OPTIONS', label: 'OPTIONS' },
          ],
        },
        {
          id: 'url',
          name: 'URL',
          description: 'Request URL',
          type: 'expression',
          group: 'request',
          validation: { required: true },
          placeholder: 'https://api.example.com/endpoint',
        },
        {
          id: 'queryParams',
          name: 'Query Parameters',
          description: 'URL query parameters',
          type: 'key-value',
          group: 'request',
        },
        {
          id: 'bodyType',
          name: 'Body Type',
          type: 'select',
          group: 'body',
          defaultValue: 'none',
          showWhen: [{ field: 'method', condition: 'in', values: ['POST', 'PUT', 'PATCH'] }],
          options: [
            { value: 'none', label: 'None' },
            { value: 'json', label: 'JSON' },
            { value: 'form', label: 'Form Data' },
            { value: 'urlencoded', label: 'URL Encoded' },
            { value: 'raw', label: 'Raw' },
            { value: 'binary', label: 'Binary' },
          ],
        },
        {
          id: 'bodyJson',
          name: 'JSON Body',
          type: 'json',
          group: 'body',
          showWhen: [{ field: 'bodyType', condition: 'equals', value: 'json' }],
          aiAutoFill: true,
        },
        {
          id: 'bodyForm',
          name: 'Form Data',
          type: 'key-value',
          group: 'body',
          showWhen: [{ field: 'bodyType', condition: 'in', values: ['form', 'urlencoded'] }],
        },
        {
          id: 'bodyRaw',
          name: 'Raw Body',
          type: 'textarea',
          rows: 6,
          group: 'body',
          showWhen: [{ field: 'bodyType', condition: 'equals', value: 'raw' }],
        },
        {
          id: 'contentType',
          name: 'Content-Type',
          type: 'text',
          group: 'body',
          placeholder: 'application/json',
          showWhen: [{ field: 'bodyType', condition: 'equals', value: 'raw' }],
        },
        {
          id: 'headers',
          name: 'Headers',
          type: 'key-value',
          group: 'headers',
        },
        {
          id: 'timeout',
          name: 'Timeout (ms)',
          type: 'number',
          group: 'options',
          defaultValue: 30000,
          validation: { min: 1000, max: 300000 },
        },
        {
          id: 'followRedirects',
          name: 'Follow Redirects',
          type: 'boolean',
          group: 'options',
          defaultValue: true,
        },
        {
          id: 'validateStatus',
          name: 'Valid Status Codes',
          description: 'Only accept these status codes',
          type: 'text',
          group: 'options',
          placeholder: '200-299, 404',
        },
        {
          id: 'responseType',
          name: 'Response Type',
          type: 'select',
          group: 'options',
          defaultValue: 'auto',
          options: [
            { value: 'auto', label: 'Auto Detect' },
            { value: 'json', label: 'JSON' },
            { value: 'text', label: 'Text' },
            { value: 'binary', label: 'Binary' },
          ],
        },
      ],
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'number' },
          statusText: { type: 'string' },
          headers: { type: 'object' },
          data: { type: 'any' },
        },
      },
    },
  ],
};

// ============================================
// WEBHOOK SCHEMA
// ============================================

export const webhookSchema: AppSchema = {
  id: 'webhook',
  name: 'Webhook',
  description: 'Receive data via webhooks or trigger other webhooks',
  icon: '🔗',
  color: '#9B59B6',
  category: 'Developer',
  tags: ['webhook', 'trigger', 'http', 'callback'],
  version: '1.0.0',
  status: 'stable',
  
  triggers: [
    {
      id: 'webhook_receive',
      appId: 'webhook',
      name: 'Webhook Trigger',
      description: 'Trigger workflow when webhook receives data',
      category: 'Webhooks',
      requiresCredential: false,
      fields: [
        {
          id: 'method',
          name: 'HTTP Method',
          type: 'select',
          defaultValue: 'POST',
          options: [
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'ANY', label: 'Any Method' },
          ],
        },
        {
          id: 'path',
          name: 'Path',
          description: 'Custom webhook path (auto-generated if empty)',
          type: 'text',
          placeholder: '/my-webhook',
        },
        {
          id: 'authentication',
          name: 'Authentication',
          type: 'select',
          defaultValue: 'none',
          options: [
            { value: 'none', label: 'No Authentication' },
            { value: 'header', label: 'Header Authentication' },
            { value: 'query', label: 'Query Parameter' },
            { value: 'basic', label: 'Basic Auth' },
          ],
        },
        {
          id: 'authHeader',
          name: 'Auth Header Name',
          type: 'text',
          defaultValue: 'X-Webhook-Secret',
          showWhen: [{ field: 'authentication', condition: 'equals', value: 'header' }],
        },
        {
          id: 'authValue',
          name: 'Auth Value',
          type: 'secret',
          showWhen: [{ field: 'authentication', condition: 'in', values: ['header', 'query'] }],
        },
        {
          id: 'responseType',
          name: 'Response',
          type: 'select',
          defaultValue: 'immediate',
          options: [
            { value: 'immediate', label: 'Respond Immediately' },
            { value: 'last_node', label: 'Respond with Last Node Output' },
            { value: 'custom', label: 'Custom Response' },
          ],
        },
        {
          id: 'customResponse',
          name: 'Custom Response',
          type: 'json',
          showWhen: [{ field: 'responseType', condition: 'equals', value: 'custom' }],
        },
      ],
    },
  ],
  
  actions: [
    {
      id: 'webhook_send',
      appId: 'webhook',
      name: 'Send Webhook',
      description: 'Send data to an external webhook',
      category: 'Webhooks',
      requiresCredential: false,
      fields: [
        {
          id: 'url',
          name: 'Webhook URL',
          type: 'expression',
          validation: { required: true },
          placeholder: 'https://hooks.example.com/webhook',
        },
        {
          id: 'method',
          name: 'Method',
          type: 'select',
          defaultValue: 'POST',
          options: [
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'GET', label: 'GET' },
          ],
        },
        {
          id: 'payload',
          name: 'Payload',
          type: 'json',
          validation: { required: true },
          aiAutoFill: true,
        },
        {
          id: 'headers',
          name: 'Headers',
          type: 'key-value',
        },
      ],
    },
    {
      id: 'webhook_respond',
      appId: 'webhook',
      name: 'Respond to Webhook',
      description: 'Send a response back to the webhook caller',
      category: 'Webhooks',
      requiresCredential: false,
      fields: [
        {
          id: 'statusCode',
          name: 'Status Code',
          type: 'number',
          defaultValue: 200,
          validation: { required: true, min: 100, max: 599 },
        },
        {
          id: 'body',
          name: 'Response Body',
          type: 'json',
        },
        {
          id: 'headers',
          name: 'Response Headers',
          type: 'key-value',
        },
      ],
    },
  ],
};

// ============================================
// GITHUB SCHEMA
// ============================================

export const githubSchema: AppSchema = {
  id: 'github',
  name: 'GitHub',
  description: 'Manage repositories, issues, pull requests, and more',
  icon: '🐙',
  color: '#181717',
  category: 'Developer',
  tags: ['github', 'git', 'repository', 'issues', 'pr'],
  apiBaseUrl: 'https://api.github.com',
  apiDocsUrl: 'https://docs.github.com/en/rest',
  version: '1.0.0',
  status: 'stable',
  
  credentials: [{
    id: 'github_token',
    name: 'GitHub Personal Access Token',
    type: 'bearer',
    helpUrl: 'https://github.com/settings/tokens',
    fields: [{
      id: 'token',
      name: 'Personal Access Token',
      description: 'Classic or fine-grained token',
      type: 'secret',
      validation: { required: true, pattern: '^(ghp_|github_pat_)' },
    }],
  }],
  
  triggers: [
    {
      id: 'github_new_issue',
      appId: 'github',
      name: 'New Issue',
      description: 'Triggers when an issue is created',
      category: 'Issues',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        {
          id: 'owner',
          name: 'Owner',
          description: 'Repository owner (user or org)',
          type: 'text',
          validation: { required: true },
        },
        {
          id: 'repo',
          name: 'Repository',
          type: 'text',
          validation: { required: true },
        },
        {
          id: 'labels',
          name: 'Filter by Labels',
          type: 'array',
          itemSchema: { id: 'label', name: 'Label', type: 'text' },
        },
      ],
    },
    {
      id: 'github_new_pr',
      appId: 'github',
      name: 'New Pull Request',
      description: 'Triggers when a PR is opened',
      category: 'Pull Requests',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        {
          id: 'base',
          name: 'Base Branch',
          description: 'Filter by target branch',
          type: 'text',
          placeholder: 'main',
        },
      ],
    },
    {
      id: 'github_push',
      appId: 'github',
      name: 'Push',
      description: 'Triggers on push to repository',
      category: 'Repository',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        { id: 'branch', name: 'Branch', type: 'text', placeholder: 'main' },
      ],
    },
    {
      id: 'github_star',
      appId: 'github',
      name: 'New Star',
      description: 'Triggers when repo is starred',
      category: 'Repository',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
      ],
    },
  ],
  
  actions: [
    {
      id: 'github_create_issue',
      appId: 'github',
      name: 'Create Issue',
      description: 'Create a new issue',
      category: 'Issues',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        {
          id: 'title',
          name: 'Title',
          type: 'expression',
          validation: { required: true },
          aiSuggestions: true,
        },
        {
          id: 'body',
          name: 'Description',
          type: 'textarea',
          rows: 6,
          aiSuggestions: true,
          aiAutoFill: true,
        },
        {
          id: 'labels',
          name: 'Labels',
          type: 'array',
          itemSchema: { id: 'label', name: 'Label', type: 'text' },
        },
        {
          id: 'assignees',
          name: 'Assignees',
          type: 'array',
          itemSchema: { id: 'assignee', name: 'Username', type: 'text' },
        },
        { id: 'milestone', name: 'Milestone Number', type: 'number' },
      ],
    },
    {
      id: 'github_update_issue',
      appId: 'github',
      name: 'Update Issue',
      description: 'Update an existing issue',
      category: 'Issues',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        { id: 'issue_number', name: 'Issue Number', type: 'number', validation: { required: true } },
        { id: 'title', name: 'Title', type: 'expression' },
        { id: 'body', name: 'Description', type: 'textarea', rows: 4 },
        {
          id: 'state',
          name: 'State',
          type: 'select',
          options: [
            { value: 'open', label: 'Open' },
            { value: 'closed', label: 'Closed' },
          ],
        },
        { id: 'labels', name: 'Labels', type: 'array', itemSchema: { id: 'label', name: 'Label', type: 'text' } },
      ],
    },
    {
      id: 'github_create_comment',
      appId: 'github',
      name: 'Create Comment',
      description: 'Add a comment to an issue or PR',
      category: 'Issues',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        { id: 'issue_number', name: 'Issue/PR Number', type: 'number', validation: { required: true } },
        {
          id: 'body',
          name: 'Comment',
          type: 'textarea',
          rows: 4,
          validation: { required: true },
          aiSuggestions: true,
        },
      ],
    },
    {
      id: 'github_create_pr',
      appId: 'github',
      name: 'Create Pull Request',
      description: 'Create a new pull request',
      category: 'Pull Requests',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        { id: 'title', name: 'Title', type: 'expression', validation: { required: true }, aiSuggestions: true },
        { id: 'body', name: 'Description', type: 'textarea', rows: 6, aiSuggestions: true },
        { id: 'head', name: 'Source Branch', type: 'text', validation: { required: true } },
        { id: 'base', name: 'Target Branch', type: 'text', defaultValue: 'main', validation: { required: true } },
        { id: 'draft', name: 'Draft PR', type: 'boolean', defaultValue: false },
      ],
    },
    {
      id: 'github_merge_pr',
      appId: 'github',
      name: 'Merge Pull Request',
      description: 'Merge a pull request',
      category: 'Pull Requests',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        { id: 'pull_number', name: 'PR Number', type: 'number', validation: { required: true } },
        { id: 'commit_title', name: 'Commit Title', type: 'expression' },
        { id: 'commit_message', name: 'Commit Message', type: 'textarea', rows: 3 },
        {
          id: 'merge_method',
          name: 'Merge Method',
          type: 'select',
          defaultValue: 'merge',
          options: [
            { value: 'merge', label: 'Create merge commit' },
            { value: 'squash', label: 'Squash and merge' },
            { value: 'rebase', label: 'Rebase and merge' },
          ],
        },
      ],
    },
    {
      id: 'github_get_file',
      appId: 'github',
      name: 'Get File Contents',
      description: 'Get contents of a file from repository',
      category: 'Repository',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        { id: 'path', name: 'File Path', type: 'text', validation: { required: true }, placeholder: 'src/index.ts' },
        { id: 'ref', name: 'Branch/Tag', type: 'text', placeholder: 'main' },
      ],
    },
    {
      id: 'github_create_file',
      appId: 'github',
      name: 'Create/Update File',
      description: 'Create or update a file in repository',
      category: 'Repository',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        { id: 'path', name: 'File Path', type: 'text', validation: { required: true } },
        { id: 'content', name: 'Content', type: 'code', language: 'text', validation: { required: true } },
        { id: 'message', name: 'Commit Message', type: 'expression', validation: { required: true } },
        { id: 'branch', name: 'Branch', type: 'text', defaultValue: 'main' },
        { id: 'sha', name: 'File SHA', description: 'Required for updates', type: 'text' },
      ],
    },
    {
      id: 'github_dispatch_workflow',
      appId: 'github',
      name: 'Trigger Workflow',
      description: 'Trigger a GitHub Actions workflow',
      category: 'Actions',
      requiresCredential: true,
      credentialType: 'github_token',
      fields: [
        { id: 'owner', name: 'Owner', type: 'text', validation: { required: true } },
        { id: 'repo', name: 'Repository', type: 'text', validation: { required: true } },
        { id: 'workflow_id', name: 'Workflow ID/File', type: 'text', validation: { required: true }, placeholder: 'build.yml' },
        { id: 'ref', name: 'Branch/Tag', type: 'text', validation: { required: true }, defaultValue: 'main' },
        { id: 'inputs', name: 'Inputs', type: 'json' },
      ],
    },
  ],
};

// ============================================
// CODE UTILITIES SCHEMA
// ============================================

export const codeSchema: AppSchema = {
  id: 'code',
  name: 'Code',
  description: 'Execute code, transform data, and run scripts',
  icon: '💻',
  color: '#3572A5',
  category: 'Developer',
  tags: ['code', 'javascript', 'transform', 'script'],
  version: '1.0.0',
  status: 'stable',
  
  actions: [
    {
      id: 'code_execute',
      appId: 'code',
      name: 'Execute Code',
      description: 'Run JavaScript/TypeScript code',
      category: 'Code',
      requiresCredential: false,
      fields: [
        {
          id: 'language',
          name: 'Language',
          type: 'select',
          defaultValue: 'javascript',
          options: [
            { value: 'javascript', label: 'JavaScript' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'python', label: 'Python' },
          ],
        },
        {
          id: 'code',
          name: 'Code',
          type: 'code',
          language: 'javascript',
          validation: { required: true },
          aiSuggestions: true,
          aiAutoFill: true,
        },
        {
          id: 'mode',
          name: 'Execution Mode',
          type: 'select',
          defaultValue: 'run_once',
          options: [
            { value: 'run_once', label: 'Run Once' },
            { value: 'run_per_item', label: 'Run for Each Item' },
          ],
        },
      ],
    },
    {
      id: 'code_transform',
      appId: 'code',
      name: 'Transform Data',
      description: 'Transform input data with code',
      category: 'Code',
      requiresCredential: false,
      fields: [
        {
          id: 'expression',
          name: 'Expression',
          description: 'JavaScript expression to transform data',
          type: 'expression',
          validation: { required: true },
          placeholder: 'items.map(item => ({ ...item, processed: true }))',
          aiSuggestions: true,
        },
      ],
    },
  ],
};

// ============================================
// SCHEDULER SCHEMA
// ============================================

export const schedulerSchema: AppSchema = {
  id: 'scheduler',
  name: 'Scheduler',
  description: 'Schedule workflows with cron expressions or intervals',
  icon: '⏰',
  color: '#F39C12',
  category: 'Developer',
  tags: ['schedule', 'cron', 'timer', 'interval'],
  version: '1.0.0',
  status: 'stable',
  
  triggers: [
    {
      id: 'scheduler_cron',
      appId: 'scheduler',
      name: 'Cron Schedule',
      description: 'Trigger on a cron schedule',
      category: 'Schedule',
      requiresCredential: false,
      fields: [
        {
          id: 'cronExpression',
          name: 'Cron Expression',
          description: 'Standard cron expression',
          type: 'text',
          validation: { required: true },
          placeholder: '0 9 * * 1-5',
          aiHelp: 'Minute Hour DayOfMonth Month DayOfWeek. E.g., "0 9 * * 1-5" = 9 AM weekdays',
        },
        {
          id: 'timezone',
          name: 'Timezone',
          type: 'select',
          defaultValue: 'UTC',
          options: [
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'Eastern Time' },
            { value: 'America/Los_Angeles', label: 'Pacific Time' },
            { value: 'Europe/London', label: 'London' },
            { value: 'Asia/Tokyo', label: 'Tokyo' },
            { value: 'Asia/Kolkata', label: 'India' },
          ],
          allowCustom: true,
        },
      ],
    },
    {
      id: 'scheduler_interval',
      appId: 'scheduler',
      name: 'Interval',
      description: 'Trigger at regular intervals',
      category: 'Schedule',
      requiresCredential: false,
      fields: [
        {
          id: 'interval',
          name: 'Interval',
          type: 'number',
          validation: { required: true, min: 1 },
          defaultValue: 15,
        },
        {
          id: 'unit',
          name: 'Unit',
          type: 'select',
          defaultValue: 'minutes',
          options: [
            { value: 'seconds', label: 'Seconds' },
            { value: 'minutes', label: 'Minutes' },
            { value: 'hours', label: 'Hours' },
            { value: 'days', label: 'Days' },
          ],
        },
      ],
    },
  ],
  
  actions: [
    {
      id: 'scheduler_wait',
      appId: 'scheduler',
      name: 'Wait',
      description: 'Pause workflow for a duration',
      category: 'Timing',
      requiresCredential: false,
      fields: [
        {
          id: 'duration',
          name: 'Duration',
          type: 'number',
          validation: { required: true, min: 1 },
          defaultValue: 5,
        },
        {
          id: 'unit',
          name: 'Unit',
          type: 'select',
          defaultValue: 'seconds',
          options: [
            { value: 'milliseconds', label: 'Milliseconds' },
            { value: 'seconds', label: 'Seconds' },
            { value: 'minutes', label: 'Minutes' },
            { value: 'hours', label: 'Hours' },
          ],
        },
      ],
    },
    {
      id: 'scheduler_wait_until',
      appId: 'scheduler',
      name: 'Wait Until',
      description: 'Wait until a specific time',
      category: 'Timing',
      requiresCredential: false,
      fields: [
        {
          id: 'datetime',
          name: 'Date & Time',
          type: 'datetime',
          validation: { required: true },
        },
        {
          id: 'timezone',
          name: 'Timezone',
          type: 'select',
          defaultValue: 'UTC',
          options: [
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'Eastern Time' },
            { value: 'America/Los_Angeles', label: 'Pacific Time' },
            { value: 'Europe/London', label: 'London' },
          ],
        },
      ],
    },
  ],
};

// ============================================
// DATABASE SCHEMA
// ============================================

export const databaseSchema: AppSchema = {
  id: 'database',
  name: 'Database',
  description: 'Query and modify SQL databases',
  icon: '🗄️',
  color: '#336791',
  category: 'Developer',
  tags: ['database', 'sql', 'postgres', 'mysql', 'query'],
  version: '1.0.0',
  status: 'stable',
  
  credentials: [
    {
      id: 'postgres',
      name: 'PostgreSQL',
      type: 'custom',
      fields: [
        { id: 'host', name: 'Host', type: 'text', validation: { required: true }, defaultValue: 'localhost' },
        { id: 'port', name: 'Port', type: 'number', validation: { required: true }, defaultValue: 5432 },
        { id: 'database', name: 'Database', type: 'text', validation: { required: true } },
        { id: 'user', name: 'User', type: 'text', validation: { required: true } },
        { id: 'password', name: 'Password', type: 'secret', validation: { required: true } },
        { id: 'ssl', name: 'SSL', type: 'boolean', defaultValue: false },
      ],
    },
    {
      id: 'mysql',
      name: 'MySQL',
      type: 'custom',
      fields: [
        { id: 'host', name: 'Host', type: 'text', validation: { required: true }, defaultValue: 'localhost' },
        { id: 'port', name: 'Port', type: 'number', validation: { required: true }, defaultValue: 3306 },
        { id: 'database', name: 'Database', type: 'text', validation: { required: true } },
        { id: 'user', name: 'User', type: 'text', validation: { required: true } },
        { id: 'password', name: 'Password', type: 'secret', validation: { required: true } },
      ],
    },
  ],
  
  actions: [
    {
      id: 'database_query',
      appId: 'database',
      name: 'Execute Query',
      description: 'Run a SQL query',
      category: 'Queries',
      requiresCredential: true,
      fields: [
        {
          id: 'query',
          name: 'SQL Query',
          type: 'code',
          language: 'sql',
          validation: { required: true },
          aiSuggestions: true,
        },
        {
          id: 'parameters',
          name: 'Parameters',
          description: 'Query parameters (for parameterized queries)',
          type: 'array',
          itemSchema: { id: 'param', name: 'Parameter', type: 'expression' },
        },
      ],
    },
    {
      id: 'database_insert',
      appId: 'database',
      name: 'Insert Row',
      description: 'Insert a new row into a table',
      category: 'Queries',
      requiresCredential: true,
      fields: [
        { id: 'table', name: 'Table', type: 'text', validation: { required: true } },
        { id: 'values', name: 'Values', type: 'key-value', validation: { required: true }, aiAutoFill: true },
        { id: 'returnData', name: 'Return Inserted Data', type: 'boolean', defaultValue: true },
      ],
    },
    {
      id: 'database_update',
      appId: 'database',
      name: 'Update Rows',
      description: 'Update existing rows',
      category: 'Queries',
      requiresCredential: true,
      fields: [
        { id: 'table', name: 'Table', type: 'text', validation: { required: true } },
        { id: 'values', name: 'Values', type: 'key-value', validation: { required: true } },
        { id: 'where', name: 'WHERE Clause', type: 'text', validation: { required: true }, placeholder: 'id = $1' },
        { id: 'whereParams', name: 'WHERE Parameters', type: 'array', itemSchema: { id: 'param', name: 'Parameter', type: 'expression' } },
      ],
    },
    {
      id: 'database_delete',
      appId: 'database',
      name: 'Delete Rows',
      description: 'Delete rows from a table',
      category: 'Queries',
      requiresCredential: true,
      fields: [
        { id: 'table', name: 'Table', type: 'text', validation: { required: true } },
        { id: 'where', name: 'WHERE Clause', type: 'text', validation: { required: true }, placeholder: 'id = $1' },
        { id: 'whereParams', name: 'WHERE Parameters', type: 'array', itemSchema: { id: 'param', name: 'Parameter', type: 'expression' } },
      ],
    },
  ],
};

// ============================================
// IF/SWITCH SCHEMA (Flow Control)
// ============================================

export const flowControlSchema: AppSchema = {
  id: 'flow_control',
  name: 'Flow Control',
  description: 'Control workflow execution with conditions and loops',
  icon: '🔀',
  color: '#E74C3C',
  category: 'Developer',
  tags: ['if', 'switch', 'condition', 'branch', 'loop'],
  version: '1.0.0',
  status: 'stable',
  
  actions: [
    {
      id: 'flow_if',
      appId: 'flow_control',
      name: 'IF',
      description: 'Branch workflow based on condition',
      category: 'Conditions',
      requiresCredential: false,
      fields: [
        {
          id: 'conditions',
          name: 'Conditions',
          type: 'array',
          validation: { required: true },
          itemSchema: {
            id: 'condition',
            name: 'Condition',
            type: 'object',
            fields: [
              { id: 'value1', name: 'Value 1', type: 'expression', validation: { required: true } },
              {
                id: 'operator',
                name: 'Operator',
                type: 'select',
                validation: { required: true },
                options: [
                  { value: 'eq', label: 'Equals (==)' },
                  { value: 'neq', label: 'Not Equals (!=)' },
                  { value: 'gt', label: 'Greater Than (>)' },
                  { value: 'gte', label: 'Greater or Equal (>=)' },
                  { value: 'lt', label: 'Less Than (<)' },
                  { value: 'lte', label: 'Less or Equal (<=)' },
                  { value: 'contains', label: 'Contains' },
                  { value: 'notContains', label: 'Does Not Contain' },
                  { value: 'startsWith', label: 'Starts With' },
                  { value: 'endsWith', label: 'Ends With' },
                  { value: 'matches', label: 'Matches Regex' },
                  { value: 'empty', label: 'Is Empty' },
                  { value: 'notEmpty', label: 'Is Not Empty' },
                  { value: 'true', label: 'Is True' },
                  { value: 'false', label: 'Is False' },
                ],
              },
              { id: 'value2', name: 'Value 2', type: 'expression', hideWhen: [{ field: 'operator', condition: 'in', values: ['empty', 'notEmpty', 'true', 'false'] }] },
            ],
          },
        },
        {
          id: 'combineWith',
          name: 'Combine Conditions',
          type: 'select',
          defaultValue: 'and',
          options: [
            { value: 'and', label: 'AND (all must match)' },
            { value: 'or', label: 'OR (any can match)' },
          ],
        },
      ],
    },
    {
      id: 'flow_switch',
      appId: 'flow_control',
      name: 'Switch',
      description: 'Route to different branches based on value',
      category: 'Conditions',
      requiresCredential: false,
      fields: [
        {
          id: 'value',
          name: 'Value to Switch On',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'cases',
          name: 'Cases',
          type: 'array',
          validation: { required: true },
          itemSchema: {
            id: 'case',
            name: 'Case',
            type: 'object',
            fields: [
              { id: 'value', name: 'Case Value', type: 'expression', validation: { required: true } },
              { id: 'output', name: 'Output Name', type: 'text', validation: { required: true } },
            ],
          },
        },
        {
          id: 'fallback',
          name: 'Default Output',
          description: 'Output when no case matches',
          type: 'text',
          defaultValue: 'default',
        },
      ],
    },
    {
      id: 'flow_loop',
      appId: 'flow_control',
      name: 'Loop',
      description: 'Loop through items',
      category: 'Loops',
      requiresCredential: false,
      fields: [
        {
          id: 'items',
          name: 'Items',
          description: 'Array to loop through',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'batchSize',
          name: 'Batch Size',
          description: 'Process items in batches',
          type: 'number',
          defaultValue: 1,
          validation: { min: 1 },
        },
        {
          id: 'continueOnError',
          name: 'Continue on Error',
          type: 'boolean',
          defaultValue: false,
        },
      ],
    },
    {
      id: 'flow_merge',
      appId: 'flow_control',
      name: 'Merge',
      description: 'Merge multiple branches',
      category: 'Branching',
      requiresCredential: false,
      fields: [
        {
          id: 'mode',
          name: 'Merge Mode',
          type: 'select',
          defaultValue: 'append',
          options: [
            { value: 'append', label: 'Append (combine all items)' },
            { value: 'combine', label: 'Combine (zip by index)' },
            { value: 'join', label: 'Join (SQL-like join)' },
            { value: 'wait', label: 'Wait (wait for all branches)' },
          ],
        },
        {
          id: 'joinField',
          name: 'Join Field',
          type: 'text',
          showWhen: [{ field: 'mode', condition: 'equals', value: 'join' }],
        },
      ],
    },
  ],
};

// Export all developer schemas
export const developerAppSchemas: AppSchema[] = [
  httpRequestSchema,
  webhookSchema,
  githubSchema,
  codeSchema,
  schedulerSchema,
  databaseSchema,
  flowControlSchema,
];
