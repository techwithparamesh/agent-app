import { Integration } from './types';

export const webhooksIntegration: Integration = {
  id: 'webhooks',
  name: 'Webhooks',
  description: 'Use Webhooks to send and receive HTTP requests. AgentForge supports incoming webhooks as triggers and outgoing webhooks as actions for integrating with any HTTP-capable service.',
  shortDescription: 'HTTP request automation',
  category: 'developer',
  icon: 'webhook',
  color: '#6366F1',
  website: '',
  documentationUrl: '',

  features: [
    'Incoming webhook triggers',
    'Outgoing HTTP requests',
    'All HTTP methods (GET, POST, PUT, DELETE, PATCH)',
    'Custom headers',
    'Authentication support',
    'JSON and form data',
    'File uploads',
    'Response handling',
  ],

  useCases: [
    'Third-party integrations',
    'Custom triggers',
    'API calls',
    'Data sync',
    'Notifications',
    'Form submissions',
    'Payment webhooks',
    'Real-time events',
  ],

  credentialType: 'none',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Incoming Webhook',
      description: 'In AgentForge, create a new workflow with Webhook trigger to get a unique URL.',
    },
    {
      step: 2,
      title: 'Copy Webhook URL',
      description: 'Copy the generated webhook URL to configure in external services.',
    },
    {
      step: 3,
      title: 'Configure Authentication (Optional)',
      description: 'Set up header-based auth, query params, or IP whitelist for security.',
    },
  ],

  operations: [
    {
      name: 'HTTP Request',
      description: 'Make an outgoing HTTP request',
      fields: [
        { name: 'method', type: 'select', required: true, description: 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS' },
        { name: 'url', type: 'string', required: true, description: 'Request URL' },
        { name: 'headers', type: 'json', required: false, description: 'Request headers' },
        { name: 'body', type: 'json', required: false, description: 'Request body (for POST/PUT/PATCH)' },
        { name: 'authentication', type: 'select', required: false, description: 'none, basicAuth, bearerToken, apiKey' },
        { name: 'timeout', type: 'number', required: false, description: 'Request timeout in ms' },
      ],
    },
    {
      name: 'Respond to Webhook',
      description: 'Send response to incoming webhook',
      fields: [
        { name: 'status_code', type: 'number', required: false, description: 'HTTP status code (default: 200)' },
        { name: 'headers', type: 'json', required: false, description: 'Response headers' },
        { name: 'body', type: 'json', required: false, description: 'Response body' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Webhook Received',
      description: 'Triggers when webhook URL is called',
      when: 'HTTP request to webhook URL',
      outputFields: ['method', 'headers', 'query', 'body', 'ip'],
    },
  ],

  actions: [
    {
      name: 'Send HTTP Request',
      description: 'Make an HTTP call to any URL',
      inputFields: ['method', 'url', 'headers', 'body'],
      outputFields: ['status', 'headers', 'data'],
    },
    {
      name: 'Send Webhook',
      description: 'POST data to a webhook URL',
      inputFields: ['url', 'payload'],
      outputFields: ['status', 'response'],
    },
  ],

  examples: [
    {
      title: 'Payment Webhook Handler',
      description: 'Process Stripe payment webhooks',
      steps: [
        'Trigger: Incoming webhook from Stripe',
        'Verify webhook signature',
        'Parse event type (charge.succeeded, etc.)',
        'Update order status in database',
        'Send confirmation email',
      ],
      code: `// Outgoing webhook example
{
  "method": "POST",
  "url": "https://api.example.com/orders/update",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{env.API_KEY}}"
  },
  "body": {
    "order_id": "{{webhook.data.metadata.order_id}}",
    "status": "paid",
    "amount": "{{webhook.data.amount}}",
    "payment_id": "{{webhook.data.id}}"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Webhook not triggering',
      cause: 'URL misconfigured in external service.',
      solution: 'Verify URL is correctly copied. Test with curl or Postman.',
    },
    {
      problem: 'SSL certificate error',
      cause: 'Target server has invalid SSL certificate.',
      solution: 'Enable "Ignore SSL issues" option or fix target certificate.',
    },
    {
      problem: 'Timeout error',
      cause: 'External service taking too long to respond.',
      solution: 'Increase timeout value or optimize the external endpoint.',
    },
    {
      problem: 'CORS error',
      cause: 'Browser blocking cross-origin request.',
      solution: 'Webhooks are server-side. Make call from backend, not browser.',
    },
  ],

  relatedIntegrations: ['rest-api', 'zapier', 'github'],
  externalResources: [
    { title: 'Webhook.site (Testing)', url: 'https://webhook.site' },
    { title: 'HTTP Methods', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' },
  ],
};

export const restApiIntegration: Integration = {
  id: 'rest-api',
  name: 'REST API',
  description: 'Connect to any REST API with flexible HTTP request configuration. Supports authentication, pagination, and response parsing for universal API integration.',
  shortDescription: 'Universal API connector',
  category: 'developer',
  icon: 'api',
  color: '#10B981',
  website: '',
  documentationUrl: '',

  features: [
    'All HTTP methods',
    'Multiple auth types',
    'Pagination handling',
    'Response parsing',
    'Error handling',
    'Rate limiting',
    'Retry logic',
    'File handling',
  ],

  useCases: [
    'Connect to any API',
    'Data fetching',
    'CRUD operations',
    'API orchestration',
    'Legacy system integration',
    'Microservices',
    'Third-party data',
    'Custom integrations',
  ],

  credentialType: 'custom',
  credentialSteps: [
    {
      step: 1,
      title: 'Identify Authentication Type',
      description: 'Determine what auth the API requires (API key, OAuth, Basic, etc.).',
    },
    {
      step: 2,
      title: 'Get API Credentials',
      description: 'Obtain credentials from the API provider (key, token, client ID, etc.).',
    },
    {
      step: 3,
      title: 'Configure Authentication',
      description: 'Set up auth in AgentForge - choose type and enter credentials.',
    },
    {
      step: 4,
      title: 'Set Base URL',
      description: 'Configure the API base URL for all requests.',
    },
  ],

  operations: [
    {
      name: 'GET Request',
      description: 'Retrieve data from an endpoint',
      fields: [
        { name: 'url', type: 'string', required: true, description: 'Endpoint URL' },
        { name: 'query_params', type: 'json', required: false, description: 'URL query parameters' },
        { name: 'headers', type: 'json', required: false, description: 'Request headers' },
      ],
    },
    {
      name: 'POST Request',
      description: 'Send data to create a resource',
      fields: [
        { name: 'url', type: 'string', required: true, description: 'Endpoint URL' },
        { name: 'body', type: 'json', required: true, description: 'Request body' },
        { name: 'content_type', type: 'select', required: false, description: 'application/json, form-data, x-www-form-urlencoded' },
      ],
    },
    {
      name: 'PUT/PATCH Request',
      description: 'Update an existing resource',
      fields: [
        { name: 'url', type: 'string', required: true, description: 'Endpoint URL' },
        { name: 'body', type: 'json', required: true, description: 'Update data' },
      ],
    },
    {
      name: 'DELETE Request',
      description: 'Delete a resource',
      fields: [
        { name: 'url', type: 'string', required: true, description: 'Endpoint URL' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Polling Trigger',
      description: 'Poll an API endpoint at intervals',
      when: 'Scheduled poll detects new data',
      outputFields: ['data', 'timestamp'],
    },
  ],

  actions: [
    {
      name: 'API Call',
      description: 'Make a configured API request',
      inputFields: ['method', 'endpoint', 'params', 'body'],
      outputFields: ['status', 'data', 'headers'],
    },
  ],

  examples: [
    {
      title: 'Paginated Data Fetch',
      description: 'Fetch all pages from a paginated API',
      steps: [
        'Initial GET request to first page',
        'Check for next page indicator',
        'Loop through pages collecting data',
        'Combine all results',
      ],
      code: `{
  "method": "GET",
  "url": "https://api.example.com/items",
  "query_params": {
    "page": "{{pagination.currentPage}}",
    "limit": 100,
    "sort": "created_at:desc"
  },
  "headers": {
    "Authorization": "Bearer {{credentials.apiKey}}",
    "Accept": "application/json"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: '401 Unauthorized',
      cause: 'Invalid or expired authentication.',
      solution: 'Check credentials. Refresh tokens if using OAuth.',
    },
    {
      problem: '429 Too Many Requests',
      cause: 'Rate limit exceeded.',
      solution: 'Implement rate limiting and retry with backoff.',
    },
    {
      problem: 'CORS errors',
      cause: 'Browser security blocking request.',
      solution: 'API calls should be server-side. Use backend proxy.',
    },
  ],

  relatedIntegrations: ['webhooks', 'graphql'],
  externalResources: [
    { title: 'REST API Design', url: 'https://restfulapi.net/' },
    { title: 'HTTP Status Codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' },
  ],
};

export const githubIntegration: Integration = {
  id: 'github',
  name: 'GitHub',
  description: 'Use the GitHub node to manage repositories, issues, pull requests, and workflows. n8n supports full GitHub API access for development automation.',
  shortDescription: 'Code hosting and collaboration',
  category: 'developer',
  icon: 'github',
  color: '#181717',
  website: 'https://github.com',
  documentationUrl: 'https://docs.github.com/en/rest',

  features: [
    'Repository management',
    'Issue tracking',
    'Pull request automation',
    'Actions/workflows',
    'Release management',
    'Commit operations',
    'Branch protection',
    'Webhooks',
  ],

  useCases: [
    'CI/CD automation',
    'Issue triage',
    'PR management',
    'Release automation',
    'Code review workflows',
    'Repository setup',
    'Team management',
    'Security alerts',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create OAuth App or PAT',
      description: 'Go to Settings > Developer settings > OAuth Apps or Personal access tokens.',
    },
    {
      step: 2,
      title: 'For OAuth App',
      description: 'Create new OAuth App with AgentForge callback URL. Copy Client ID and Secret.',
    },
    {
      step: 3,
      title: 'For Personal Access Token',
      description: 'Generate new token with required scopes (repo, workflow, etc.).',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter OAuth credentials or Personal Access Token.',
    },
  ],
  requiredScopes: ['repo', 'workflow', 'admin:repo_hook'],

  operations: [
    {
      name: 'Create Issue',
      description: 'Create a new issue in a repository',
      fields: [
        { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
        { name: 'repo', type: 'string', required: true, description: 'Repository name' },
        { name: 'title', type: 'string', required: true, description: 'Issue title' },
        { name: 'body', type: 'string', required: false, description: 'Issue description' },
        { name: 'labels', type: 'array', required: false, description: 'Labels to apply' },
        { name: 'assignees', type: 'array', required: false, description: 'Assignees' },
      ],
    },
    {
      name: 'Create Pull Request',
      description: 'Open a new pull request',
      fields: [
        { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
        { name: 'repo', type: 'string', required: true, description: 'Repository name' },
        { name: 'title', type: 'string', required: true, description: 'PR title' },
        { name: 'head', type: 'string', required: true, description: 'Head branch' },
        { name: 'base', type: 'string', required: true, description: 'Base branch' },
        { name: 'body', type: 'string', required: false, description: 'PR description' },
      ],
    },
    {
      name: 'Add Comment',
      description: 'Add comment to issue or PR',
      fields: [
        { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
        { name: 'repo', type: 'string', required: true, description: 'Repository name' },
        { name: 'issue_number', type: 'number', required: true, description: 'Issue or PR number' },
        { name: 'body', type: 'string', required: true, description: 'Comment text' },
      ],
    },
    {
      name: 'Create Release',
      description: 'Create a new release',
      fields: [
        { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
        { name: 'repo', type: 'string', required: true, description: 'Repository name' },
        { name: 'tag_name', type: 'string', required: true, description: 'Release tag' },
        { name: 'name', type: 'string', required: false, description: 'Release name' },
        { name: 'body', type: 'string', required: false, description: 'Release notes' },
        { name: 'draft', type: 'boolean', required: false, description: 'Create as draft' },
      ],
    },
    {
      name: 'Trigger Workflow',
      description: 'Dispatch a GitHub Actions workflow',
      fields: [
        { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
        { name: 'repo', type: 'string', required: true, description: 'Repository name' },
        { name: 'workflow_id', type: 'string', required: true, description: 'Workflow file name or ID' },
        { name: 'ref', type: 'string', required: true, description: 'Branch or tag' },
        { name: 'inputs', type: 'json', required: false, description: 'Workflow inputs' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Push',
      description: 'Triggers on push to repository',
      when: 'Code pushed to branch',
      outputFields: ['ref', 'commits', 'pusher', 'repository'],
    },
    {
      name: 'Pull Request',
      description: 'Triggers on PR events',
      when: 'PR opened, closed, merged, etc.',
      outputFields: ['action', 'number', 'pull_request', 'repository'],
    },
    {
      name: 'Issue',
      description: 'Triggers on issue events',
      when: 'Issue opened, closed, labeled, etc.',
      outputFields: ['action', 'issue', 'repository'],
    },
    {
      name: 'Release',
      description: 'Triggers when release is published',
      when: 'Release created/published',
      outputFields: ['action', 'release', 'repository'],
    },
    {
      name: 'Workflow Run',
      description: 'Triggers on workflow completion',
      when: 'GitHub Action completes',
      outputFields: ['action', 'workflow_run', 'repository'],
    },
  ],

  actions: [
    {
      name: 'Create Issue',
      description: 'Open a new issue',
      inputFields: ['owner', 'repo', 'title', 'body', 'labels'],
      outputFields: ['number', 'html_url'],
    },
    {
      name: 'Merge PR',
      description: 'Merge a pull request',
      inputFields: ['owner', 'repo', 'pull_number', 'merge_method'],
      outputFields: ['merged', 'sha'],
    },
    {
      name: 'Close Issue',
      description: 'Close an issue',
      inputFields: ['owner', 'repo', 'issue_number'],
      outputFields: ['number', 'state'],
    },
  ],

  examples: [
    {
      title: 'Auto-Create Issue from Error',
      description: 'Create GitHub issues from monitoring alerts',
      steps: [
        'Trigger: Error alert webhook',
        'Check if similar issue exists',
        'Create issue with error details',
        'Add labels (bug, auto-created)',
        'Assign to on-call developer',
      ],
      code: `{
  "owner": "myorg",
  "repo": "myapp",
  "title": "[Auto] {{alert.title}}",
  "body": "## Error Details\\n\\n**Service:** {{alert.service}}\\n**Time:** {{alert.timestamp}}\\n\\n### Stack Trace\\n\`\`\`\\n{{alert.stackTrace}}\\n\`\`\`\\n\\n*This issue was auto-created by AgentForge.*",
  "labels": ["bug", "auto-created", "{{alert.severity}}"],
  "assignees": ["{{oncall.github_username}}"]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Bad credentials',
      cause: 'Token expired or revoked.',
      solution: 'Regenerate personal access token or reconnect OAuth.',
    },
    {
      problem: 'Not found',
      cause: 'Repository doesn\'t exist or no access.',
      solution: 'Verify repository name and ensure token has repo scope.',
    },
    {
      problem: 'Merge conflict',
      cause: 'PR has conflicts that must be resolved.',
      solution: 'Resolve conflicts manually before merging via API.',
    },
  ],

  relatedIntegrations: ['gitlab', 'jira', 'slack'],
  externalResources: [
    { title: 'GitHub REST API', url: 'https://docs.github.com/en/rest' },
    { title: 'GitHub Actions', url: 'https://docs.github.com/en/actions' },
  ],
};

export const zapierIntegration: Integration = {
  id: 'zapier',
  name: 'Zapier',
  description: 'Connect AgentForge with Zapier to integrate with 5000+ apps. Use webhooks to trigger Zaps or receive data from Zapier workflows.',
  shortDescription: 'Connect to 5000+ apps via Zapier',
  category: 'developer',
  icon: 'zapier',
  color: '#FF4A00',
  website: 'https://zapier.com',
  documentationUrl: 'https://zapier.com/help',

  features: [
    'Webhook triggers',
    'Webhook actions',
    'Multi-step Zaps',
    'Data formatting',
    'Conditional logic',
    'Scheduled triggers',
    'Error handling',
    'App connections',
  ],

  useCases: [
    'Connect unsupported apps',
    'Complex workflows',
    'Legacy integrations',
    'Marketing automation',
    'Sales workflows',
    'Data sync',
    'Notifications',
    'Process automation',
  ],

  credentialType: 'webhook',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Zap',
      description: 'In Zapier, create a new Zap with "Webhooks by Zapier" as trigger or action.',
    },
    {
      step: 2,
      title: 'Get Webhook URL',
      description: 'For triggers: copy the webhook URL from Zapier. For actions: use AgentForge webhook URL.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Add Zapier webhook URL to your workflow action or use trigger URL.',
    },
    {
      step: 4,
      title: 'Test Connection',
      description: 'Send test request and verify data flows correctly.',
    },
  ],

  operations: [
    {
      name: 'Send to Zapier',
      description: 'Send data to a Zapier webhook',
      fields: [
        { name: 'webhook_url', type: 'string', required: true, description: 'Zapier webhook URL' },
        { name: 'data', type: 'json', required: true, description: 'Data to send' },
      ],
    },
  ],

  triggers: [
    {
      name: 'From Zapier',
      description: 'Receive data from Zapier',
      when: 'Zapier sends webhook to AgentForge',
      outputFields: ['data'],
    },
  ],

  actions: [
    {
      name: 'Trigger Zap',
      description: 'Send data to trigger a Zap',
      inputFields: ['webhook_url', 'data'],
      outputFields: ['status', 'id'],
    },
  ],

  examples: [
    {
      title: 'Multi-App Notification',
      description: 'Send notifications to multiple apps via Zapier',
      steps: [
        'Trigger: Important event in AgentForge',
        'Send webhook to Zapier',
        'Zapier routes to Slack, Email, and SMS',
        'Log notification status',
      ],
      code: `{
  "webhook_url": "https://hooks.zapier.com/hooks/catch/xxx/yyy",
  "data": {
    "event_type": "high_priority_alert",
    "message": "{{alert.message}}",
    "user": "{{alert.user_email}}",
    "timestamp": "{{now()}}",
    "action_url": "{{alert.action_link}}"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Zap not triggering',
      cause: 'Zap is paused or webhook URL changed.',
      solution: 'Check Zap status in Zapier. Verify webhook URL.',
    },
    {
      problem: 'Data not mapping correctly',
      cause: 'Field names don\'t match expected structure.',
      solution: 'Check Zapier\'s expected fields and match your payload.',
    },
  ],

  relatedIntegrations: ['webhooks', 'rest-api'],
  externalResources: [
    { title: 'Zapier Webhooks', url: 'https://zapier.com/apps/webhook/integrations' },
  ],
};

export const gitlabIntegration: Integration = {
  id: 'gitlab',
  name: 'GitLab',
  description: 'Use the GitLab node to manage repositories, issues, merge requests, and pipelines. n8n supports full DevOps workflow automation with webhooks and API.',
  shortDescription: 'DevOps platform',
  category: 'developer',
  icon: 'gitlab',
  color: '#FC6D26',
  website: 'https://gitlab.com',
  documentationUrl: 'https://docs.gitlab.com/ee/api/',

  features: [
    'Repository management',
    'Issues and merge requests',
    'CI/CD pipelines',
    'Webhooks',
    'Project management',
    'Wiki pages',
    'Releases',
    'Container registry',
  ],

  useCases: [
    'DevOps automation',
    'Issue tracking',
    'CI/CD workflows',
    'Code review',
    'Release management',
    'Project management',
    'Security scanning',
    'Deployment automation',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Go to Access Tokens',
      description: 'In GitLab, go to User Settings > Access Tokens.',
    },
    {
      step: 2,
      title: 'Create Token',
      description: 'Create a personal access token with required scopes (api, read_repository).',
    },
    {
      step: 3,
      title: 'Copy Token',
      description: 'Copy the generated token immediately.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter token and GitLab URL in Integrations > GitLab.',
    },
  ],

  operations: [
    {
      name: 'Get Issues',
      description: 'List project issues',
      fields: [
        { name: 'project_id', type: 'string', required: true, description: 'Project ID or path' },
        { name: 'state', type: 'select', required: false, description: 'opened, closed, all' },
        { name: 'labels', type: 'string', required: false, description: 'Comma-separated labels' },
      ],
    },
    {
      name: 'Create Issue',
      description: 'Create a new issue',
      fields: [
        { name: 'project_id', type: 'string', required: true, description: 'Project ID' },
        { name: 'title', type: 'string', required: true, description: 'Issue title' },
        { name: 'description', type: 'string', required: false, description: 'Issue description' },
        { name: 'labels', type: 'string', required: false, description: 'Labels' },
        { name: 'assignee_ids', type: 'array', required: false, description: 'Assignee user IDs' },
      ],
    },
    {
      name: 'Create Merge Request',
      description: 'Create merge request',
      fields: [
        { name: 'project_id', type: 'string', required: true, description: 'Project ID' },
        { name: 'source_branch', type: 'string', required: true, description: 'Source branch' },
        { name: 'target_branch', type: 'string', required: true, description: 'Target branch' },
        { name: 'title', type: 'string', required: true, description: 'MR title' },
      ],
    },
    {
      name: 'Trigger Pipeline',
      description: 'Trigger CI/CD pipeline',
      fields: [
        { name: 'project_id', type: 'string', required: true, description: 'Project ID' },
        { name: 'ref', type: 'string', required: true, description: 'Branch or tag' },
        { name: 'variables', type: 'json', required: false, description: 'Pipeline variables' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Push',
      description: 'Triggers on code push',
      when: 'Code pushed to repository',
      outputFields: ['ref', 'commits', 'user'],
    },
    {
      name: 'Merge Request',
      description: 'Triggers on MR events',
      when: 'MR opened, merged, or updated',
      outputFields: ['action', 'merge_request', 'user'],
    },
    {
      name: 'Pipeline',
      description: 'Triggers on pipeline events',
      when: 'Pipeline status changes',
      outputFields: ['status', 'pipeline', 'project'],
    },
  ],

  actions: [
    {
      name: 'Create Issue',
      description: 'Open new issue',
      inputFields: ['project_id', 'title', 'description'],
      outputFields: ['iid', 'web_url'],
    },
    {
      name: 'Merge MR',
      description: 'Merge a merge request',
      inputFields: ['project_id', 'merge_request_iid'],
      outputFields: ['id', 'state', 'merged_by'],
    },
  ],

  examples: [
    {
      title: 'Auto-Create Issue from Alert',
      description: 'Create GitLab issue from monitoring alert',
      steps: [
        'Trigger: Monitoring alert received',
        'Search for existing issue',
        'If not exists, create new issue',
        'Add to milestone and assign',
      ],
      code: `{
  "project_id": "{{project_id}}",
  "title": "[Alert] {{alert.name}}",
  "description": "## Alert Details\\n\\n- **Severity:** {{alert.severity}}\\n- **Source:** {{alert.source}}\\n- **Time:** {{alert.timestamp}}\\n\\n{{alert.message}}",
  "labels": "alert,{{alert.severity}}",
  "assignee_ids": [{{on_call_user_id}}]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Project not found',
      cause: 'Invalid project ID or no access.',
      solution: 'Use project ID (number) or URL-encoded path.',
    },
    {
      problem: 'Insufficient scope',
      cause: 'Token missing required permissions.',
      solution: 'Create token with api scope.',
    },
  ],

  relatedIntegrations: ['github', 'jira', 'slack'],
  externalResources: [
    { title: 'GitLab API Docs', url: 'https://docs.gitlab.com/ee/api/' },
  ],
};

export const bitbucketIntegration: Integration = {
  id: 'bitbucket',
  name: 'Bitbucket',
  description: 'Use the Bitbucket node to manage repositories, pull requests, and pipelines. n8n supports code collaboration workflows with Atlassian integration.',
  shortDescription: 'Git code management',
  category: 'developer',
  icon: 'bitbucket',
  color: '#0052CC',
  website: 'https://bitbucket.org',
  documentationUrl: 'https://developer.atlassian.com/bitbucket/api/2/reference/',

  features: [
    'Repository management',
    'Pull requests',
    'Pipelines',
    'Webhooks',
    'Branch permissions',
    'Code review',
    'Deployments',
    'Issue tracking',
  ],

  useCases: [
    'Code management',
    'PR automation',
    'CI/CD integration',
    'Code review workflows',
    'Deployment automation',
    'Branch management',
    'Jira integration',
    'Team collaboration',
  ],

  credentialType: 'basic_auth',
  credentialSteps: [
    {
      step: 1,
      title: 'Go to App Passwords',
      description: 'In Bitbucket, go to Personal Settings > App Passwords.',
    },
    {
      step: 2,
      title: 'Create App Password',
      description: 'Create an app password with required permissions.',
    },
    {
      step: 3,
      title: 'Copy Password',
      description: 'Copy the generated app password.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter username and app password in Integrations > Bitbucket.',
    },
  ],

  operations: [
    {
      name: 'Get Repositories',
      description: 'List repositories',
      fields: [
        { name: 'workspace', type: 'string', required: true, description: 'Workspace slug' },
      ],
    },
    {
      name: 'Create Pull Request',
      description: 'Create a new PR',
      fields: [
        { name: 'workspace', type: 'string', required: true, description: 'Workspace' },
        { name: 'repo_slug', type: 'string', required: true, description: 'Repository slug' },
        { name: 'title', type: 'string', required: true, description: 'PR title' },
        { name: 'source_branch', type: 'string', required: true, description: 'Source branch' },
        { name: 'destination_branch', type: 'string', required: true, description: 'Target branch' },
      ],
    },
    {
      name: 'Approve PR',
      description: 'Approve a pull request',
      fields: [
        { name: 'workspace', type: 'string', required: true, description: 'Workspace' },
        { name: 'repo_slug', type: 'string', required: true, description: 'Repository' },
        { name: 'pull_request_id', type: 'number', required: true, description: 'PR ID' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Push',
      description: 'Triggers on code push',
      when: 'Code pushed',
      outputFields: ['push', 'repository', 'actor'],
    },
    {
      name: 'Pull Request',
      description: 'Triggers on PR events',
      when: 'PR created, updated, merged',
      outputFields: ['pullrequest', 'repository', 'actor'],
    },
  ],

  actions: [
    {
      name: 'Create PR',
      description: 'Open pull request',
      inputFields: ['workspace', 'repo_slug', 'title', 'source_branch'],
      outputFields: ['id', 'links'],
    },
    {
      name: 'Merge PR',
      description: 'Merge pull request',
      inputFields: ['workspace', 'repo_slug', 'pull_request_id'],
      outputFields: ['state', 'merge_commit'],
    },
  ],

  examples: [
    {
      title: 'Auto-Create Release PR',
      description: 'Create release PR when sprint ends',
      steps: [
        'Trigger: Sprint completed in Jira',
        'Create branch from develop',
        'Create PR to main',
        'Add release notes',
        'Notify team in Slack',
      ],
      code: `{
  "workspace": "{{workspace}}",
  "repo_slug": "{{repo}}",
  "title": "Release {{version}}",
  "source": { "branch": { "name": "develop" } },
  "destination": { "branch": { "name": "main" } },
  "description": "## Release {{version}}\\n\\n{{release_notes}}"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Authentication failed',
      cause: 'Using account password instead of app password.',
      solution: 'Create and use an app password.',
    },
    {
      problem: 'Repository not found',
      cause: 'Wrong workspace or repo slug.',
      solution: 'Check workspace and repository slug in URL.',
    },
  ],

  relatedIntegrations: ['github', 'gitlab', 'jira'],
  externalResources: [
    { title: 'Bitbucket API Docs', url: 'https://developer.atlassian.com/bitbucket/api/2/reference/' },
  ],
};

export const graphqlIntegration: Integration = {
  id: 'graphql',
  name: 'GraphQL',
  description: 'Use the GraphQL node to query and mutate data from any GraphQL API. Supports queries, mutations, subscriptions, and variables for flexible API integration.',
  shortDescription: 'GraphQL API client',
  category: 'developer',
  icon: 'graphql',
  color: '#E10098',
  website: 'https://graphql.org',
  documentationUrl: 'https://graphql.org/learn/',

  features: [
    'Queries',
    'Mutations',
    'Variables',
    'Custom headers',
    'Authentication',
    'Introspection',
    'Fragments',
    'Error handling',
  ],

  useCases: [
    'API integration',
    'Data fetching',
    'Content management',
    'E-commerce data',
    'Headless CMS',
    'Custom backends',
    'Shopify Storefront',
    'GitHub API',
  ],

  credentialType: 'custom',
  credentialSteps: [
    {
      step: 1,
      title: 'Get GraphQL Endpoint',
      description: 'Obtain the GraphQL endpoint URL from the service.',
    },
    {
      step: 2,
      title: 'Get Authentication',
      description: 'Get API key, token, or OAuth credentials as required.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter endpoint URL and authentication details.',
    },
  ],

  operations: [
    {
      name: 'Query',
      description: 'Execute GraphQL query',
      fields: [
        { name: 'endpoint', type: 'string', required: true, description: 'GraphQL endpoint URL' },
        { name: 'query', type: 'string', required: true, description: 'GraphQL query string' },
        { name: 'variables', type: 'json', required: false, description: 'Query variables' },
        { name: 'headers', type: 'json', required: false, description: 'Request headers' },
      ],
    },
    {
      name: 'Mutation',
      description: 'Execute GraphQL mutation',
      fields: [
        { name: 'endpoint', type: 'string', required: true, description: 'GraphQL endpoint URL' },
        { name: 'mutation', type: 'string', required: true, description: 'GraphQL mutation string' },
        { name: 'variables', type: 'json', required: false, description: 'Mutation variables' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Execute Query',
      description: 'Run GraphQL query',
      inputFields: ['endpoint', 'query', 'variables'],
      outputFields: ['data', 'errors'],
    },
    {
      name: 'Execute Mutation',
      description: 'Run GraphQL mutation',
      inputFields: ['endpoint', 'mutation', 'variables'],
      outputFields: ['data', 'errors'],
    },
  ],

  examples: [
    {
      title: 'Fetch Products from Shopify',
      description: 'Query Shopify Storefront API',
      steps: [
        'Trigger: Sync request',
        'Execute GraphQL query',
        'Parse product data',
        'Update local database',
      ],
      code: `{
  "endpoint": "https://{{shop}}.myshopify.com/api/2024-01/graphql.json",
  "headers": {
    "X-Shopify-Storefront-Access-Token": "{{storefront_token}}"
  },
  "query": "query GetProducts($first: Int!) { products(first: $first) { edges { node { id title description variants(first: 5) { edges { node { id price { amount } } } } } } } }",
  "variables": {
    "first": 50
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Query syntax error',
      cause: 'Invalid GraphQL syntax.',
      solution: 'Validate query in GraphQL playground first.',
    },
    {
      problem: 'Variable type mismatch',
      cause: 'Variables don\'t match expected types.',
      solution: 'Check schema for expected variable types.',
    },
    {
      problem: 'Field not found',
      cause: 'Querying non-existent field.',
      solution: 'Use introspection to verify available fields.',
    },
  ],

  relatedIntegrations: ['rest-api', 'webhooks'],
  externalResources: [
    { title: 'GraphQL Documentation', url: 'https://graphql.org/learn/' },
  ],
};
