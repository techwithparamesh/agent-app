import { IntegrationDoc } from './types';

export const developerDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GITHUB
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    category: 'developer',
    shortDescription: 'Manage GitHub repositories, issues, and PRs',
    overview: {
      what: 'GitHub integration connects your AI agent to GitHub for repository management, issue tracking, and PR workflows.',
      why: 'GitHub hosts millions of repositories. Automate issue creation, PR reviews, and deployment notifications.',
      useCases: ['Issue creation from support', 'PR notifications', 'Deployment status updates', 'Repository management', 'Code review workflows', 'Release announcements'],
      targetAudience: 'Development teams using GitHub who want to connect their AI agents to their development workflow.',
    },
    prerequisites: {
      accounts: ['GitHub account'],
      permissions: ['Personal access token or GitHub App'],
      preparations: ['Create personal access token', 'Select required scopes'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to GitHub Settings', description: 'Click profile → Settings → Developer settings.', screenshot: 'GitHub – Developer Settings' },
      { step: 2, title: 'Personal Access Tokens', description: 'Click "Personal access tokens" → "Tokens (classic)".', screenshot: 'GitHub – PAT Section' },
      { step: 3, title: 'Generate New Token', description: 'Click "Generate new token (classic)".', screenshot: 'GitHub – Generate Token' },
      { step: 4, title: 'Configure Scopes', description: 'Select scopes: repo, workflow (if needed), admin:org (optional).', screenshot: 'GitHub – Token Scopes', tip: 'Select minimum required scopes for security.' },
      { step: 5, title: 'Generate and Copy', description: 'Click "Generate token" and copy immediately.', screenshot: 'GitHub – Copy Token', warning: 'Token shown only once!' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → GitHub. Enter token and default repository.', screenshot: 'AgentForge – GitHub Form' },
    ],
    triggers: [
      { id: 'push', name: 'Push Event', description: 'Fires when code is pushed.', whenItFires: 'When commits are pushed to branch.', exampleScenario: 'Notify team of new deployment.', dataProvided: ['Repository', 'Branch', 'Commits', 'Pusher'] },
      { id: 'pull_request', name: 'Pull Request', description: 'Fires on PR events.', whenItFires: 'When PR is opened/updated/merged.', exampleScenario: 'Notify reviewer of new PR.', dataProvided: ['PR number', 'Title', 'Author', 'Action'] },
      { id: 'issues', name: 'Issue Event', description: 'Fires on issue events.', whenItFires: 'When issue is opened/closed/updated.', exampleScenario: 'Track customer-reported issues.', dataProvided: ['Issue number', 'Title', 'Author', 'Labels'] },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', description: 'Create a GitHub issue.', whenToUse: 'To log bugs or features from conversations.', requiredFields: ['Repository', 'Title'], optionalFields: ['Body', 'Labels', 'Assignees'], example: 'Create issue "Bug: Login timeout".' },
      { id: 'add_comment', name: 'Add Comment', description: 'Comment on issue or PR.', whenToUse: 'To provide updates.', requiredFields: ['Issue/PR number', 'Comment'], example: 'Add fix details to bug issue.' },
      { id: 'create_pr', name: 'Create Pull Request', description: 'Create a new pull request.', whenToUse: 'For automated PRs.', requiredFields: ['Head branch', 'Base branch', 'Title'], example: 'Create PR for feature branch.' },
    ],
    exampleFlow: { title: 'Bug Report Flow', scenario: 'Create GitHub issues from customer reports.', steps: ['Customer reports bug', 'AI gathers details', 'GitHub action creates issue', 'Issue labeled and assigned', 'Customer notified with issue link'] },
    troubleshooting: [
      { error: 'Bad credentials', cause: 'Token invalid or expired.', solution: 'Generate new personal access token.' },
      { error: 'Not found', cause: 'Repository doesn\'t exist or no access.', solution: 'Check repository name and token scopes.' },
      { error: 'Insufficient scopes', cause: 'Token missing required scope.', solution: 'Regenerate token with required scopes.' },
    ],
    bestPractices: ['Use fine-grained tokens when possible', 'Limit token scopes', 'Use webhooks for real-time events', 'Add meaningful labels', 'Link issues to PRs'],
    faq: [
      { question: 'Classic vs Fine-grained tokens?', answer: 'Fine-grained are newer with more control. Classic work for all repos.' },
      { question: 'Can I access private repos?', answer: 'Yes, with "repo" scope on your token.' },
      { question: 'What about GitHub Enterprise?', answer: 'Supported. Use your enterprise domain in API URL.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GITLAB
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'gitlab',
    name: 'GitLab',
    icon: '🦊',
    category: 'developer',
    shortDescription: 'Manage GitLab projects, issues, and merge requests',
    overview: {
      what: 'GitLab integration connects your AI agent to GitLab for DevOps lifecycle management.',
      why: 'GitLab offers complete DevOps in one platform. Manage code, CI/CD, and issues together.',
      useCases: ['Issue tracking', 'Merge request workflows', 'CI/CD notifications', 'Project management', 'Code review', 'Deployment tracking'],
      targetAudience: 'Teams using GitLab for DevOps who want AI-powered automation.',
    },
    prerequisites: {
      accounts: ['GitLab account (gitlab.com or self-hosted)'],
      permissions: ['Personal access token'],
      preparations: ['Create personal access token', 'Note project IDs'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to GitLab Preferences', description: 'Click avatar → Preferences.', screenshot: 'GitLab – Preferences' },
      { step: 2, title: 'Access Tokens', description: 'Click "Access Tokens" in left sidebar.', screenshot: 'GitLab – Access Tokens' },
      { step: 3, title: 'Create Token', description: 'Enter name, expiry date, and select scopes (api, read_api).', screenshot: 'GitLab – Create Token' },
      { step: 4, title: 'Generate Token', description: 'Click "Create personal access token".', screenshot: 'GitLab – Generate Token' },
      { step: 5, title: 'Copy Token', description: 'Copy the generated token.', screenshot: 'GitLab – Copy Token', warning: 'Token shown only once!' },
      { step: 6, title: 'Get Project ID', description: 'Project ID shown on project main page.', screenshot: 'GitLab – Project ID' },
      { step: 7, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → GitLab. Enter token, URL, and project ID.', screenshot: 'AgentForge – GitLab Form' },
    ],
    triggers: [
      { id: 'push', name: 'Push Events', description: 'Fires when code is pushed.', whenItFires: 'When commits pushed to repository.', exampleScenario: 'Notify on deployment.', dataProvided: ['Project', 'Branch', 'Commits'] },
      { id: 'merge_request', name: 'Merge Request', description: 'Fires on MR events.', whenItFires: 'When MR is created/updated/merged.', exampleScenario: 'Request code review.', dataProvided: ['MR IID', 'Title', 'Author', 'Action'] },
      { id: 'pipeline', name: 'Pipeline Event', description: 'Fires on CI/CD pipeline events.', whenItFires: 'When pipeline status changes.', exampleScenario: 'Alert on failed builds.', dataProvided: ['Pipeline ID', 'Status', 'Branch'] },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', description: 'Create a GitLab issue.', whenToUse: 'To log work items.', requiredFields: ['Project ID', 'Title'], optionalFields: ['Description', 'Labels', 'Assignee'], example: 'Create issue for bug fix.' },
      { id: 'add_comment', name: 'Add Comment', description: 'Comment on issue or MR.', whenToUse: 'To provide updates.', requiredFields: ['Issue/MR IID', 'Comment'], example: 'Add implementation notes.' },
      { id: 'create_mr', name: 'Create Merge Request', description: 'Create a new merge request.', whenToUse: 'For automated MRs.', requiredFields: ['Source branch', 'Target branch', 'Title'], example: 'Create MR for feature branch.' },
    ],
    exampleFlow: { title: 'Issue to MR Flow', scenario: 'Track feature from issue to merge.', steps: ['Issue created from request', 'Developer creates branch', 'MR created and reviewed', 'MR merged', 'Customer notified of release'] },
    troubleshooting: [
      { error: 'Invalid token', cause: 'Token expired or revoked.', solution: 'Create new personal access token.' },
      { error: 'Project not found', cause: 'Wrong project ID or no access.', solution: 'Verify project ID and token scopes.' },
      { error: 'Insufficient scope', cause: 'Token missing required scope.', solution: 'Create token with api scope.' },
    ],
    bestPractices: ['Use project tokens for limited access', 'Set token expiration', 'Use labels and milestones', 'Link issues to MRs', 'Leverage CI/CD integration'],
    faq: [
      { question: 'gitlab.com vs self-hosted?', answer: 'Both supported. Self-hosted needs your instance URL.' },
      { question: 'What\'s IID vs ID?', answer: 'IID is project-specific number. ID is global unique ID.' },
      { question: 'Can I trigger pipelines?', answer: 'Yes, with api scope on your token.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BITBUCKET
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    icon: '🪣',
    category: 'developer',
    shortDescription: 'Manage Bitbucket repositories and pull requests',
    overview: {
      what: 'Bitbucket integration connects your AI agent to Atlassian Bitbucket for code hosting and CI/CD.',
      why: 'Bitbucket integrates with Jira and Trello. Perfect for Atlassian ecosystem users.',
      useCases: ['Repository management', 'Pull request workflows', 'Pipelines notifications', 'Issue linking', 'Code review', 'Deployment tracking'],
      targetAudience: 'Teams using Atlassian tools who want unified DevOps automation.',
    },
    prerequisites: {
      accounts: ['Atlassian/Bitbucket account'],
      permissions: ['App password'],
      preparations: ['Create app password', 'Note workspace and repo slugs'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Bitbucket Settings', description: 'Click avatar → Personal settings.', screenshot: 'Bitbucket – Settings' },
      { step: 2, title: 'App Passwords', description: 'Click "App passwords" under Access management.', screenshot: 'Bitbucket – App Passwords' },
      { step: 3, title: 'Create App Password', description: 'Click "Create app password".', screenshot: 'Bitbucket – Create Password' },
      { step: 4, title: 'Set Permissions', description: 'Name it and select required permissions.', screenshot: 'Bitbucket – Permissions', tip: 'Select Repository: Read/Write, Pull requests: Read/Write.' },
      { step: 5, title: 'Copy Password', description: 'Copy the generated app password.', screenshot: 'Bitbucket – Copy Password', warning: 'Password shown only once!' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Bitbucket. Enter username, app password, and workspace.', screenshot: 'AgentForge – Bitbucket Form' },
    ],
    triggers: [
      { id: 'push', name: 'Push Event', description: 'Fires when code is pushed.', whenItFires: 'When commits pushed.', exampleScenario: 'Notify team of changes.', dataProvided: ['Repository', 'Branch', 'Commits'] },
      { id: 'pullrequest', name: 'Pull Request', description: 'Fires on PR events.', whenItFires: 'When PR is created/updated/merged.', exampleScenario: 'Notify reviewer.', dataProvided: ['PR ID', 'Title', 'Author', 'State'] },
      { id: 'pipeline', name: 'Pipeline Status', description: 'Fires on pipeline events.', whenItFires: 'When pipeline completes.', exampleScenario: 'Alert on build failure.', dataProvided: ['Pipeline UUID', 'State', 'Build number'] },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', description: 'Create repository issue.', whenToUse: 'To track work (if issues enabled).', requiredFields: ['Repository', 'Title'], optionalFields: ['Content', 'Priority', 'Assignee'], example: 'Create bug issue.' },
      { id: 'add_comment', name: 'Add PR Comment', description: 'Comment on pull request.', whenToUse: 'To provide feedback.', requiredFields: ['PR ID', 'Comment'], example: 'Add review comment.' },
      { id: 'create_pr', name: 'Create Pull Request', description: 'Create a new PR.', whenToUse: 'For automated PRs.', requiredFields: ['Source branch', 'Destination branch', 'Title'], example: 'Create PR for hotfix.' },
    ],
    exampleFlow: { title: 'Code Review Flow', scenario: 'Automate code review notifications.', steps: ['Developer creates PR', 'Webhook notifies AI', 'AI posts to team channel', 'Reviewer adds comments', 'Developer addresses feedback', 'PR merged'] },
    troubleshooting: [
      { error: 'Invalid credentials', cause: 'Wrong username or app password.', solution: 'Verify username and create new app password.' },
      { error: 'Repository not found', cause: 'Wrong workspace or repo slug.', solution: 'Check URL: bitbucket.org/workspace/repo.' },
      { error: 'Permission denied', cause: 'App password lacks permission.', solution: 'Create new app password with required permissions.' },
    ],
    bestPractices: ['Use app passwords, not account password', 'Set minimal permissions', 'Link to Jira issues', 'Use Pipelines for CI/CD', 'Review PR settings'],
    faq: [
      { question: 'Cloud vs Server?', answer: 'This is for Bitbucket Cloud. Server/DC is different.' },
      { question: 'What\'s a workspace?', answer: 'Workspace is your team/organization in Bitbucket.' },
      { question: 'Issues vs Jira?', answer: 'Bitbucket has simple issues. Most teams use Jira instead.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WEBHOOKS (GENERIC)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'webhooks',
    name: 'Webhooks',
    icon: '🔗',
    category: 'developer',
    shortDescription: 'Send and receive webhooks for custom integrations',
    overview: {
      what: 'Webhooks integration allows your AI agent to send HTTP requests and receive incoming webhooks for custom integrations.',
      why: 'Webhooks are the universal integration method. Connect to any system that supports HTTP.',
      useCases: ['Custom integrations', 'Third-party notifications', 'Data sync', 'API calls', 'Event-driven workflows', 'Legacy system integration'],
      targetAudience: 'Developers who need to connect to systems not covered by native integrations.',
    },
    prerequisites: {
      accounts: ['Target system credentials (varies)'],
      permissions: ['Endpoint URLs and authentication'],
      preparations: ['Get target API documentation', 'Prepare authentication credentials'],
    },
    connectionGuide: [
      { step: 1, title: 'Identify Your Use Case', description: 'Determine if you need outgoing webhooks (send) or incoming (receive).', screenshot: 'Webhooks – Use Case' },
      { step: 2, title: 'For Incoming Webhooks', description: 'Copy your AgentForge webhook URL from the integrations page.', screenshot: 'AgentForge – Webhook URL' },
      { step: 3, title: 'Configure Source System', description: 'Add AgentForge webhook URL to the source system.', screenshot: 'Source System – Add Webhook' },
      { step: 4, title: 'For Outgoing Webhooks', description: 'Configure target URL and authentication method.', screenshot: 'AgentForge – Outgoing Config' },
      { step: 5, title: 'Set Headers and Auth', description: 'Add required headers (API keys, Bearer tokens, etc.).', screenshot: 'AgentForge – Headers', tip: 'Most APIs need Authorization or X-API-Key headers.' },
      { step: 6, title: 'Test the Connection', description: 'Send a test request to verify connectivity.', screenshot: 'AgentForge – Test Webhook' },
    ],
    triggers: [
      { id: 'webhook_received', name: 'Webhook Received', description: 'Fires when incoming webhook is received.', whenItFires: 'When external system posts to your webhook URL.', exampleScenario: 'Receive payment confirmation from custom system.', dataProvided: ['Headers', 'Body', 'Query params', 'Timestamp'] },
    ],
    actions: [
      { id: 'http_request', name: 'HTTP Request', description: 'Send an HTTP request to any URL.', whenToUse: 'To call external APIs.', requiredFields: ['URL', 'Method'], optionalFields: ['Headers', 'Body', 'Query params'], example: 'POST order data to ERP system.' },
      { id: 'http_get', name: 'HTTP GET', description: 'Fetch data from a URL.', whenToUse: 'To retrieve information.', requiredFields: ['URL'], optionalFields: ['Headers', 'Query params'], example: 'Get product info from inventory API.' },
    ],
    exampleFlow: { title: 'Custom ERP Integration', scenario: 'Sync orders to legacy ERP.', steps: ['Customer places order', 'AI formats order data', 'Webhook action POSTs to ERP', 'ERP processes order', 'ERP webhooks back confirmation', 'AI confirms to customer'] },
    troubleshooting: [
      { error: 'Connection refused', cause: 'Target server unreachable.', solution: 'Verify URL and check if server is running.' },
      { error: '401 Unauthorized', cause: 'Invalid credentials.', solution: 'Check API key or token is correct.' },
      { error: '404 Not Found', cause: 'Wrong endpoint URL.', solution: 'Verify the endpoint path is correct.' },
      { error: 'Timeout', cause: 'Server too slow to respond.', solution: 'Check target server performance or increase timeout.' },
    ],
    bestPractices: ['Always use HTTPS', 'Validate webhook signatures', 'Handle retries gracefully', 'Log requests for debugging', 'Set appropriate timeouts', 'Use idempotency keys'],
    faq: [
      { question: 'What HTTP methods are supported?', answer: 'GET, POST, PUT, PATCH, DELETE.' },
      { question: 'Can I send files?', answer: 'Yes, via multipart/form-data or base64 encoding.' },
      { question: 'How do I validate incoming webhooks?', answer: 'Check signature header against shared secret.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REST API
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'rest_api',
    name: 'REST API',
    icon: '🌐',
    category: 'developer',
    shortDescription: 'Connect to any REST API',
    overview: {
      what: 'REST API integration provides a flexible way to connect to any RESTful API service.',
      why: 'REST is the most common API standard. Connect to virtually any modern web service.',
      useCases: ['Custom API integration', 'Data fetching', 'Third-party services', 'Internal APIs', 'Microservices', 'Backend systems'],
      targetAudience: 'Developers integrating with REST APIs not covered by native integrations.',
    },
    prerequisites: {
      accounts: ['API access to target service'],
      permissions: ['API credentials (keys, tokens, OAuth)'],
      preparations: ['API documentation', 'Authentication credentials', 'Endpoint URLs'],
    },
    connectionGuide: [
      { step: 1, title: 'Get API Documentation', description: 'Locate the API documentation for your target service.', screenshot: 'API – Documentation' },
      { step: 2, title: 'Obtain Credentials', description: 'Get API keys, tokens, or OAuth credentials.', screenshot: 'API – Credentials' },
      { step: 3, title: 'Configure Base URL', description: 'Enter the API base URL (e.g., https://api.example.com/v1).', screenshot: 'AgentForge – Base URL' },
      { step: 4, title: 'Set Authentication', description: 'Configure auth: API Key, Bearer Token, Basic Auth, or OAuth.', screenshot: 'AgentForge – Auth Config' },
      { step: 5, title: 'Add Default Headers', description: 'Add any required headers (Content-Type, Accept, etc.).', screenshot: 'AgentForge – Headers' },
      { step: 6, title: 'Test Connection', description: 'Make a test request to verify setup.', screenshot: 'AgentForge – Test API' },
    ],
    triggers: [
      { id: 'polling', name: 'Polling Trigger', description: 'Periodically check API for changes.', whenItFires: 'At configured intervals when new data detected.', exampleScenario: 'Check for new orders every minute.', dataProvided: ['API response data'] },
    ],
    actions: [
      { id: 'api_call', name: 'API Call', description: 'Make a REST API call.', whenToUse: 'To interact with any REST API.', requiredFields: ['Endpoint', 'Method'], optionalFields: ['Body', 'Query params', 'Headers'], example: 'GET /users/{id} to fetch user details.' },
      { id: 'api_post', name: 'Create Resource', description: 'POST to create a new resource.', whenToUse: 'To create new data.', requiredFields: ['Endpoint', 'Body'], example: 'POST /orders to create new order.' },
      { id: 'api_put', name: 'Update Resource', description: 'PUT/PATCH to update a resource.', whenToUse: 'To update existing data.', requiredFields: ['Endpoint', 'Body'], example: 'PATCH /users/{id} to update user.' },
    ],
    exampleFlow: { title: 'Data Sync Flow', scenario: 'Sync customer data with external system.', steps: ['Customer updates their info', 'AI captures changes', 'REST API action updates external system', 'External system confirms', 'AI logs sync completion'] },
    troubleshooting: [
      { error: '400 Bad Request', cause: 'Invalid request format.', solution: 'Check request body matches API spec.' },
      { error: '401 Unauthorized', cause: 'Invalid authentication.', solution: 'Verify API key or token.' },
      { error: '403 Forbidden', cause: 'Insufficient permissions.', solution: 'Check API key has required access.' },
      { error: '429 Too Many Requests', cause: 'Rate limit exceeded.', solution: 'Implement backoff and retry logic.' },
    ],
    bestPractices: ['Read API documentation thoroughly', 'Handle all error responses', 'Implement rate limiting', 'Cache responses when appropriate', 'Use pagination for large datasets', 'Log API calls for debugging'],
    faq: [
      { question: 'How do I handle pagination?', answer: 'Follow API\'s pagination format (offset, cursor, or page).' },
      { question: 'What about rate limits?', answer: 'Check API docs for limits. Implement exponential backoff.' },
      { question: 'Can I use OAuth?', answer: 'Yes, OAuth 2.0 flows are supported.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRAPHQL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'graphql',
    name: 'GraphQL',
    icon: '◈',
    category: 'developer',
    shortDescription: 'Connect to GraphQL APIs',
    overview: {
      what: 'GraphQL integration allows your AI agent to query and mutate data via GraphQL APIs.',
      why: 'GraphQL offers precise data fetching. Request exactly what you need in a single query.',
      useCases: ['Modern API integration', 'Complex data queries', 'Efficient data fetching', 'Real-time subscriptions', 'Headless CMS', 'E-commerce backends'],
      targetAudience: 'Developers working with GraphQL APIs who need flexible data operations.',
    },
    prerequisites: {
      accounts: ['GraphQL API access'],
      permissions: ['API credentials'],
      preparations: ['GraphQL endpoint URL', 'Schema documentation', 'Authentication setup'],
    },
    connectionGuide: [
      { step: 1, title: 'Get GraphQL Endpoint', description: 'Locate the GraphQL endpoint URL (usually /graphql).', screenshot: 'GraphQL – Endpoint' },
      { step: 2, title: 'Explore Schema', description: 'Use GraphiQL or playground to explore the schema.', screenshot: 'GraphQL – Schema Explorer' },
      { step: 3, title: 'Get Credentials', description: 'Obtain authentication credentials (API key, Bearer token).', screenshot: 'GraphQL – Credentials' },
      { step: 4, title: 'Configure Endpoint', description: 'Enter GraphQL endpoint URL in AgentForge.', screenshot: 'AgentForge – GraphQL Endpoint' },
      { step: 5, title: 'Set Authentication', description: 'Configure headers for authentication.', screenshot: 'AgentForge – GraphQL Auth' },
      { step: 6, title: 'Test Query', description: 'Run a simple query to verify connection.', screenshot: 'AgentForge – Test Query' },
    ],
    triggers: [
      { id: 'subscription', name: 'GraphQL Subscription', description: 'Subscribe to real-time data changes.', whenItFires: 'When subscribed data changes.', exampleScenario: 'Real-time order updates.', dataProvided: ['Subscription payload'] },
    ],
    actions: [
      { id: 'query', name: 'GraphQL Query', description: 'Execute a GraphQL query.', whenToUse: 'To fetch data.', requiredFields: ['Query'], optionalFields: ['Variables'], example: 'Query { user(id: "123") { name email } }' },
      { id: 'mutation', name: 'GraphQL Mutation', description: 'Execute a GraphQL mutation.', whenToUse: 'To create/update/delete data.', requiredFields: ['Mutation', 'Variables'], example: 'Mutation { createUser(input: {...}) { id } }' },
    ],
    exampleFlow: { title: 'User Lookup Flow', scenario: 'Fetch user details via GraphQL.', steps: ['Customer asks about their account', 'AI extracts user identifier', 'GraphQL query fetches user data', 'Returns only needed fields', 'AI formats and presents info'] },
    troubleshooting: [
      { error: 'Query validation failed', cause: 'Query syntax error or invalid field.', solution: 'Validate query against schema.' },
      { error: 'Authentication error', cause: 'Missing or invalid auth header.', solution: 'Check Authorization header format.' },
      { error: 'Variable type mismatch', cause: 'Variable type doesn\'t match schema.', solution: 'Verify variable types match schema definitions.' },
    ],
    bestPractices: ['Request only needed fields', 'Use variables for dynamic data', 'Handle errors gracefully', 'Use fragments for reusable selections', 'Implement proper caching', 'Monitor query complexity'],
    faq: [
      { question: 'GraphQL vs REST?', answer: 'GraphQL: single endpoint, flexible queries. REST: multiple endpoints, fixed responses.' },
      { question: 'How do I see the schema?', answer: 'Use introspection query or GraphQL playground.' },
      { question: 'Can I do real-time?', answer: 'Yes, via GraphQL subscriptions (WebSocket).' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SENTRY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sentry',
    name: 'Sentry',
    icon: '🐛',
    category: 'developer',
    shortDescription: 'Monitor errors and performance with Sentry',
    overview: {
      what: 'Sentry integration connects your AI agent to Sentry for error tracking and performance monitoring.',
      why: 'Sentry catches errors before users report them. Get notified of issues instantly.',
      useCases: ['Error notifications', 'Issue tracking', 'Performance monitoring', 'Release tracking', 'User feedback', 'Crash reporting'],
      targetAudience: 'Development teams using Sentry who want to integrate error alerting with their AI workflows.',
    },
    prerequisites: {
      accounts: ['Sentry account'],
      permissions: ['Auth token with project access'],
      preparations: ['Create auth token', 'Note organization and project slugs'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Sentry Settings', description: 'Navigate to Settings → Developer Settings → Auth Tokens.', screenshot: 'Sentry – Settings' },
      { step: 2, title: 'Create Auth Token', description: 'Click "Create New Token".', screenshot: 'Sentry – Create Token' },
      { step: 3, title: 'Set Scopes', description: 'Select required scopes (project:read, project:write, event:read).', screenshot: 'Sentry – Token Scopes' },
      { step: 4, title: 'Copy Token', description: 'Copy the generated auth token.', screenshot: 'Sentry – Copy Token' },
      { step: 5, title: 'Get Organization Slug', description: 'Organization slug is in URL: sentry.io/organizations/{slug}/', screenshot: 'Sentry – Org Slug' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Sentry. Enter token and organization slug.', screenshot: 'AgentForge – Sentry Form' },
    ],
    triggers: [
      { id: 'issue_alert', name: 'Issue Alert', description: 'Fires when Sentry issue alert triggers.', whenItFires: 'When new error or threshold exceeded.', exampleScenario: 'Notify team of new production error.', dataProvided: ['Issue ID', 'Title', 'Level', 'Platform', 'Count'] },
      { id: 'metric_alert', name: 'Metric Alert', description: 'Fires when metric alert triggers.', whenItFires: 'When performance threshold exceeded.', exampleScenario: 'Alert on high error rate.', dataProvided: ['Alert name', 'Value', 'Threshold'] },
    ],
    actions: [
      { id: 'get_issue', name: 'Get Issue', description: 'Retrieve issue details.', whenToUse: 'To get error information.', requiredFields: ['Issue ID'], example: 'Get details for issue #12345.' },
      { id: 'resolve_issue', name: 'Resolve Issue', description: 'Mark issue as resolved.', whenToUse: 'When bug is fixed.', requiredFields: ['Issue ID'], optionalFields: ['Resolution status'], example: 'Resolve issue in next release.' },
      { id: 'list_issues', name: 'List Issues', description: 'Get list of project issues.', whenToUse: 'To see current errors.', requiredFields: ['Project slug'], optionalFields: ['Query', 'Status'], example: 'Get all unresolved issues.' },
    ],
    exampleFlow: { title: 'Error Alert Flow', scenario: 'Notify team of critical errors.', steps: ['New error occurs in production', 'Sentry captures and groups it', 'Webhook sends to AgentForge', 'AI formats error summary', 'Notification sent to on-call channel'] },
    troubleshooting: [
      { error: 'Invalid auth token', cause: 'Token expired or revoked.', solution: 'Generate new auth token.' },
      { error: 'Project not found', cause: 'Wrong project slug.', solution: 'Verify project slug from Sentry URL.' },
      { error: 'Rate limited', cause: 'Too many API requests.', solution: 'Implement request throttling.' },
    ],
    bestPractices: ['Set up meaningful alert rules', 'Use release tracking', 'Configure issue owners', 'Use environments', 'Review and triage regularly'],
    faq: [
      { question: 'Is Sentry free?', answer: 'Free tier: 5K errors/month. Paid for more volume and features.' },
      { question: 'Cloud vs self-hosted?', answer: 'Both supported. Self-hosted needs your instance URL.' },
      { question: 'Can I create issues from chat?', answer: 'Issues are auto-created. You can manage and resolve them.' },
    ],
  },
];
