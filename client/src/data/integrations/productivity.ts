import { Integration } from './types';

export const googleSheetsIntegration: Integration = {
  id: 'google-sheets',
  name: 'Google Sheets',
  description: 'Use the Google Sheets node to read, write, and manipulate spreadsheet data. n8n supports cell operations, row management, and batch updates for powerful data workflows.',
  shortDescription: 'Spreadsheet data management',
  category: 'productivity',
  icon: 'google-sheets',
  color: '#0F9D58',
  website: 'https://sheets.google.com',
  documentationUrl: 'https://developers.google.com/sheets/api',

  features: [
    'Read spreadsheet data',
    'Write and update cells',
    'Append rows',
    'Batch operations',
    'Create spreadsheets',
    'Manage sheets (tabs)',
    'Format cells',
    'Named ranges support',
  ],

  useCases: [
    'Data collection and storage',
    'Report generation',
    'Lead tracking',
    'Inventory management',
    'Survey responses',
    'Budget tracking',
    'Order logging',
    'Team collaboration',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Google Cloud Project',
      description: 'Go to console.cloud.google.com and create a new project.',
    },
    {
      step: 2,
      title: 'Enable Sheets API',
      description: 'In APIs & Services > Library, enable "Google Sheets API".',
    },
    {
      step: 3,
      title: 'Configure OAuth Consent',
      description: 'Set up OAuth consent screen with required scopes.',
    },
    {
      step: 4,
      title: 'Create OAuth Credentials',
      description: 'Create OAuth 2.0 Client ID credentials.',
    },
    {
      step: 5,
      title: 'Add Redirect URI',
      description: 'Add AgentForge OAuth callback URL.',
    },
    {
      step: 6,
      title: 'Configure in AgentForge',
      description: 'Enter Client ID and Secret, then authorize.',
    },
  ],
  requiredScopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],

  operations: [
    {
      name: 'Read Rows',
      description: 'Read rows from a spreadsheet',
      fields: [
        { name: 'spreadsheet_id', type: 'string', required: true, description: 'Spreadsheet ID from URL' },
        { name: 'range', type: 'string', required: true, description: 'A1 notation range (e.g., Sheet1!A1:D10)' },
        { name: 'value_render_option', type: 'select', required: false, description: 'FORMATTED_VALUE, UNFORMATTED_VALUE, FORMULA' },
      ],
    },
    {
      name: 'Append Row',
      description: 'Add a new row to the sheet',
      fields: [
        { name: 'spreadsheet_id', type: 'string', required: true, description: 'Spreadsheet ID' },
        { name: 'range', type: 'string', required: true, description: 'Target range (e.g., Sheet1!A:Z)' },
        { name: 'values', type: 'array', required: true, description: 'Array of values for the row' },
      ],
    },
    {
      name: 'Update Cells',
      description: 'Update specific cells',
      fields: [
        { name: 'spreadsheet_id', type: 'string', required: true, description: 'Spreadsheet ID' },
        { name: 'range', type: 'string', required: true, description: 'Range to update' },
        { name: 'values', type: 'array', required: true, description: '2D array of values' },
      ],
    },
    {
      name: 'Create Spreadsheet',
      description: 'Create a new spreadsheet',
      fields: [
        { name: 'title', type: 'string', required: true, description: 'Spreadsheet title' },
        { name: 'sheets', type: 'array', required: false, description: 'Sheet names to create' },
      ],
    },
    {
      name: 'Clear Range',
      description: 'Clear cells in a range',
      fields: [
        { name: 'spreadsheet_id', type: 'string', required: true, description: 'Spreadsheet ID' },
        { name: 'range', type: 'string', required: true, description: 'Range to clear' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Row Added',
      description: 'Triggers when a new row is added',
      when: 'New row detected (polling)',
      outputFields: ['row_number', 'values', 'timestamp'],
    },
    {
      name: 'Cell Updated',
      description: 'Triggers when specific cells change',
      when: 'Cell value changes (polling)',
      outputFields: ['range', 'old_value', 'new_value'],
    },
  ],

  actions: [
    {
      name: 'Log Data',
      description: 'Append data as a new row',
      inputFields: ['spreadsheet_id', 'sheet_name', 'values'],
      outputFields: ['updated_range', 'updated_rows'],
    },
    {
      name: 'Lookup Row',
      description: 'Find a row by column value',
      inputFields: ['spreadsheet_id', 'sheet_name', 'lookup_column', 'lookup_value'],
      outputFields: ['row_number', 'row_data'],
    },
  ],

  examples: [
    {
      title: 'Order Logging',
      description: 'Log e-commerce orders to a spreadsheet',
      steps: [
        'Trigger: New order received',
        'Format order data (date, customer, items, total)',
        'Append row to Orders spreadsheet',
        'Update daily totals in summary sheet',
      ],
      code: `{
  "spreadsheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "range": "Orders!A:F",
  "values": [
    ["{{formatDate(order.created_at)}}",
     "{{order.customer.email}}",
     "{{order.id}}",
     "{{order.line_items.length}}",
     "{{order.total}}",
     "{{order.status}}"]
  ]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Spreadsheet not found',
      cause: 'Invalid spreadsheet ID or no access.',
      solution: 'Verify the spreadsheet ID from URL and ensure it\'s shared with the service account.',
    },
    {
      problem: 'Range not found',
      cause: 'Sheet name doesn\'t exist or typo.',
      solution: 'Check exact sheet name including spaces and capitalization.',
    },
    {
      problem: 'Quota exceeded',
      cause: 'Too many API requests (100/100s for read, 100/100s for write).',
      solution: 'Batch operations together and implement rate limiting.',
    },
  ],

  relatedIntegrations: ['google-drive', 'airtable', 'notion'],
  externalResources: [
    { title: 'Sheets API Reference', url: 'https://developers.google.com/sheets/api/reference/rest' },
    { title: 'A1 Notation', url: 'https://developers.google.com/sheets/api/guides/concepts' },
  ],
};

export const notionIntegration: Integration = {
  id: 'notion',
  name: 'Notion',
  description: 'Use the Notion node to manage pages, databases, and blocks in your Notion workspace. n8n supports creating content, querying databases, and updating properties.',
  shortDescription: 'All-in-one workspace management',
  category: 'productivity',
  icon: 'notion',
  color: '#000000',
  website: 'https://notion.so',
  documentationUrl: 'https://developers.notion.com',

  features: [
    'Database management',
    'Page creation',
    'Block manipulation',
    'Property updates',
    'Database queries',
    'Page archiving',
    'Comments handling',
    'User management',
  ],

  useCases: [
    'Task management',
    'Content planning',
    'CRM database',
    'Knowledge base',
    'Project tracking',
    'Meeting notes',
    'Documentation',
    'Team wikis',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Integration',
      description: 'Go to notion.so/my-integrations and create a new integration.',
    },
    {
      step: 2,
      title: 'Configure Capabilities',
      description: 'Select content capabilities (read, update, insert) and comment capabilities.',
    },
    {
      step: 3,
      title: 'Copy Internal Token',
      description: 'Copy the Internal Integration Token (starts with secret_).',
    },
    {
      step: 4,
      title: 'Connect to Pages/Databases',
      description: 'In Notion, share specific pages/databases with your integration.',
      note: 'Integration only sees pages explicitly shared with it.',
    },
    {
      step: 5,
      title: 'Configure in AgentForge',
      description: 'Enter the integration token in Integrations > Notion.',
    },
  ],

  operations: [
    {
      name: 'Query Database',
      description: 'Query a Notion database with filters',
      fields: [
        { name: 'database_id', type: 'string', required: true, description: 'Database ID' },
        { name: 'filter', type: 'json', required: false, description: 'Filter conditions' },
        { name: 'sorts', type: 'array', required: false, description: 'Sort order' },
        { name: 'page_size', type: 'number', required: false, description: 'Results per page (max 100)' },
      ],
    },
    {
      name: 'Create Page',
      description: 'Create a new page or database entry',
      fields: [
        { name: 'parent', type: 'json', required: true, description: 'Parent page or database' },
        { name: 'properties', type: 'json', required: true, description: 'Page properties' },
        { name: 'children', type: 'array', required: false, description: 'Page content blocks' },
      ],
    },
    {
      name: 'Update Page',
      description: 'Update page properties',
      fields: [
        { name: 'page_id', type: 'string', required: true, description: 'Page ID' },
        { name: 'properties', type: 'json', required: true, description: 'Properties to update' },
      ],
    },
    {
      name: 'Append Blocks',
      description: 'Add content blocks to a page',
      fields: [
        { name: 'block_id', type: 'string', required: true, description: 'Parent block/page ID' },
        { name: 'children', type: 'array', required: true, description: 'Blocks to append' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Database Item Created',
      description: 'Triggers when a new item is added to database',
      when: 'New page in database (polling)',
      outputFields: ['id', 'properties', 'created_time', 'url'],
    },
    {
      name: 'Page Updated',
      description: 'Triggers when a page is modified',
      when: 'Page last_edited_time changes',
      outputFields: ['id', 'properties', 'last_edited_time'],
    },
  ],

  actions: [
    {
      name: 'Create Database Entry',
      description: 'Add a new entry to a Notion database',
      inputFields: ['database_id', 'properties'],
      outputFields: ['id', 'url'],
    },
    {
      name: 'Archive Page',
      description: 'Archive (soft delete) a page',
      inputFields: ['page_id'],
      outputFields: ['id', 'archived'],
    },
  ],

  examples: [
    {
      title: 'Task from Email',
      description: 'Create Notion tasks from emails',
      steps: [
        'Trigger: Email with subject containing "task"',
        'Extract task details from email body',
        'Create database entry in Tasks database',
        'Add email content as page content',
      ],
      code: `{
  "parent": { "database_id": "your-database-id" },
  "properties": {
    "Name": { "title": [{ "text": { "content": "{{email.subject}}" } }] },
    "Status": { "select": { "name": "To Do" } },
    "Due Date": { "date": { "start": "{{formatDate(addDays(now(), 7))}}" } },
    "Source": { "rich_text": [{ "text": { "content": "Email" } }] }
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Page not found',
      cause: 'Integration not shared with the page.',
      solution: 'In Notion, click Share and add your integration to the page.',
    },
    {
      problem: 'Invalid property',
      cause: 'Property name doesn\'t match database schema.',
      solution: 'Use exact property names as they appear in Notion.',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'Too many requests (3 requests/second average).',
      solution: 'Implement request throttling.',
    },
  ],

  relatedIntegrations: ['google-sheets', 'trello', 'asana'],
  externalResources: [
    { title: 'Notion API Reference', url: 'https://developers.notion.com/reference' },
    { title: 'Block Types', url: 'https://developers.notion.com/reference/block' },
  ],
};

export const trelloIntegration: Integration = {
  id: 'trello',
  name: 'Trello',
  description: 'Use the Trello node to manage boards, lists, and cards. n8n supports creating cards, moving items, managing checklists, and handling attachments.',
  shortDescription: 'Kanban-style project management',
  category: 'productivity',
  icon: 'trello',
  color: '#0079BF',
  website: 'https://trello.com',
  documentationUrl: 'https://developer.atlassian.com/cloud/trello/',

  features: [
    'Board management',
    'List operations',
    'Card creation and updates',
    'Checklist management',
    'Labels and members',
    'Comments',
    'Attachments',
    'Custom fields',
  ],

  useCases: [
    'Project management',
    'Task tracking',
    'Content calendars',
    'Bug tracking',
    'Team collaboration',
    'Sprint planning',
    'Workflow automation',
    'Customer requests',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Get API Key',
      description: 'Go to trello.com/app-key to get your API Key.',
    },
    {
      step: 2,
      title: 'Generate Token',
      description: 'Click "Token" link on the same page to authorize and get a token.',
    },
    {
      step: 3,
      title: 'Authorize Access',
      description: 'Allow the app access to your Trello account.',
    },
    {
      step: 4,
      title: 'Copy Token',
      description: 'Copy the generated token.',
    },
    {
      step: 5,
      title: 'Configure in AgentForge',
      description: 'Enter API Key and Token in Integrations > Trello.',
    },
  ],

  operations: [
    {
      name: 'Create Card',
      description: 'Create a new card on a list',
      fields: [
        { name: 'list_id', type: 'string', required: true, description: 'List ID' },
        { name: 'name', type: 'string', required: true, description: 'Card name' },
        { name: 'desc', type: 'string', required: false, description: 'Card description' },
        { name: 'due', type: 'date', required: false, description: 'Due date' },
        { name: 'labels', type: 'array', required: false, description: 'Label IDs' },
        { name: 'members', type: 'array', required: false, description: 'Member IDs' },
      ],
    },
    {
      name: 'Move Card',
      description: 'Move card to different list',
      fields: [
        { name: 'card_id', type: 'string', required: true, description: 'Card ID' },
        { name: 'list_id', type: 'string', required: true, description: 'Destination list ID' },
        { name: 'position', type: 'string', required: false, description: 'top, bottom, or position number' },
      ],
    },
    {
      name: 'Add Comment',
      description: 'Add a comment to a card',
      fields: [
        { name: 'card_id', type: 'string', required: true, description: 'Card ID' },
        { name: 'text', type: 'string', required: true, description: 'Comment text' },
      ],
    },
    {
      name: 'Create Checklist',
      description: 'Add a checklist to a card',
      fields: [
        { name: 'card_id', type: 'string', required: true, description: 'Card ID' },
        { name: 'name', type: 'string', required: true, description: 'Checklist name' },
        { name: 'items', type: 'array', required: false, description: 'Checklist items' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Card Created',
      description: 'Triggers when a new card is created',
      when: 'New card on board',
      outputFields: ['id', 'name', 'desc', 'list', 'board'],
    },
    {
      name: 'Card Moved',
      description: 'Triggers when a card moves lists',
      when: 'Card list changes',
      outputFields: ['id', 'name', 'old_list', 'new_list'],
    },
    {
      name: 'Due Date Approaching',
      description: 'Triggers when card due date is near',
      when: 'Due date within threshold',
      outputFields: ['id', 'name', 'due', 'list'],
    },
  ],

  actions: [
    {
      name: 'Create Card',
      description: 'Add a new card to a list',
      inputFields: ['list_id', 'name', 'desc', 'due'],
      outputFields: ['id', 'shortUrl'],
    },
    {
      name: 'Archive Card',
      description: 'Archive a card',
      inputFields: ['card_id'],
      outputFields: ['id', 'closed'],
    },
  ],

  examples: [
    {
      title: 'Support Ticket to Card',
      description: 'Create Trello cards from support tickets',
      steps: [
        'Trigger: New support ticket received',
        'Extract ticket details (title, priority, customer)',
        'Create card in appropriate list based on priority',
        'Add checklist with resolution steps',
      ],
      code: `{
  "idList": "{{lists.support}}",
  "name": "[{{ticket.priority}}] {{ticket.subject}}",
  "desc": "Customer: {{ticket.customer}}\\n\\n{{ticket.description}}",
  "due": "{{addDays(now(), 2)}}"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Invalid token',
      cause: 'Token expired or revoked.',
      solution: 'Generate a new token from the Trello developer page.',
    },
    {
      problem: 'Board not found',
      cause: 'Token doesn\'t have access to the board.',
      solution: 'Ensure the authorized user has access to the board.',
    },
  ],

  relatedIntegrations: ['asana', 'jira', 'notion'],
  externalResources: [
    { title: 'Trello REST API', url: 'https://developer.atlassian.com/cloud/trello/rest/' },
  ],
};

export const asanaIntegration: Integration = {
  id: 'asana',
  name: 'Asana',
  description: 'Use the Asana node to manage projects, tasks, and teams. n8n supports task creation, project management, and team collaboration features.',
  shortDescription: 'Work management and collaboration',
  category: 'productivity',
  icon: 'asana',
  color: '#F06A6A',
  website: 'https://asana.com',
  documentationUrl: 'https://developers.asana.com/docs',

  features: [
    'Task management',
    'Project organization',
    'Team collaboration',
    'Custom fields',
    'Sections and boards',
    'Dependencies',
    'Comments and attachments',
    'Portfolios',
  ],

  useCases: [
    'Project management',
    'Task assignment',
    'Sprint planning',
    'Team workload',
    'Request tracking',
    'Content production',
    'Event planning',
    'Cross-team collaboration',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Asana App',
      description: 'Go to app.asana.com/0/developer-console and create a new app.',
    },
    {
      step: 2,
      title: 'Configure OAuth',
      description: 'In OAuth settings, add redirect URI for AgentForge.',
    },
    {
      step: 3,
      title: 'Copy Credentials',
      description: 'Copy Client ID and Client Secret.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter credentials and authorize.',
    },
  ],

  operations: [
    {
      name: 'Create Task',
      description: 'Create a new task',
      fields: [
        { name: 'workspace', type: 'string', required: true, description: 'Workspace GID' },
        { name: 'name', type: 'string', required: true, description: 'Task name' },
        { name: 'projects', type: 'array', required: false, description: 'Project GIDs' },
        { name: 'assignee', type: 'string', required: false, description: 'Assignee GID' },
        { name: 'due_on', type: 'date', required: false, description: 'Due date' },
        { name: 'notes', type: 'string', required: false, description: 'Task description' },
      ],
    },
    {
      name: 'Update Task',
      description: 'Update an existing task',
      fields: [
        { name: 'task_gid', type: 'string', required: true, description: 'Task GID' },
        { name: 'name', type: 'string', required: false, description: 'New name' },
        { name: 'completed', type: 'boolean', required: false, description: 'Mark complete' },
        { name: 'assignee', type: 'string', required: false, description: 'New assignee' },
      ],
    },
    {
      name: 'Add Comment',
      description: 'Add a comment to a task',
      fields: [
        { name: 'task_gid', type: 'string', required: true, description: 'Task GID' },
        { name: 'text', type: 'string', required: true, description: 'Comment text (supports mentions)' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Task Created',
      description: 'Triggers when a task is created',
      when: 'New task in project',
      outputFields: ['gid', 'name', 'assignee', 'due_on', 'projects'],
    },
    {
      name: 'Task Completed',
      description: 'Triggers when a task is marked complete',
      when: 'Task completed = true',
      outputFields: ['gid', 'name', 'completed_at'],
    },
  ],

  actions: [
    {
      name: 'Create Task',
      description: 'Add a task to a project',
      inputFields: ['name', 'projects', 'assignee', 'due_on'],
      outputFields: ['gid', 'permalink_url'],
    },
    {
      name: 'Complete Task',
      description: 'Mark a task as complete',
      inputFields: ['task_gid'],
      outputFields: ['gid', 'completed'],
    },
  ],

  examples: [
    {
      title: 'Sprint Task Creation',
      description: 'Auto-create tasks from sprint planning',
      steps: [
        'Trigger: New sprint started in planning tool',
        'Get all stories for the sprint',
        'Create Asana task for each story',
        'Assign to team member and set due date',
      ],
      code: `{
  "workspace": "{{workspace_gid}}",
  "projects": ["{{project_gid}}"],
  "name": "{{story.title}}",
  "notes": "{{story.description}}",
  "assignee": "{{story.assignee_gid}}",
  "due_on": "{{formatDate(story.due_date, 'YYYY-MM-DD')}}"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Task not found',
      cause: 'Invalid task GID or no access.',
      solution: 'Verify task GID and ensure user has access.',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'Too many API requests (1500/minute).',
      solution: 'Implement exponential backoff.',
    },
  ],

  relatedIntegrations: ['trello', 'jira', 'slack'],
  externalResources: [
    { title: 'Asana API Reference', url: 'https://developers.asana.com/docs/asana' },
  ],
};

export const jiraIntegration: Integration = {
  id: 'jira',
  name: 'Jira',
  description: 'Use the Jira node to manage issues, projects, and workflows. n8n supports issue creation, transitions, comments, and sprint management.',
  shortDescription: 'Issue and project tracking',
  category: 'productivity',
  icon: 'jira',
  color: '#0052CC',
  website: 'https://atlassian.com/software/jira',
  documentationUrl: 'https://developer.atlassian.com/cloud/jira/platform/',

  features: [
    'Issue management',
    'Project tracking',
    'Workflow transitions',
    'Sprint management',
    'Custom fields',
    'Comments and attachments',
    'Watchers and notifications',
    'JQL search',
  ],

  useCases: [
    'Bug tracking',
    'Agile development',
    'Sprint planning',
    'Issue escalation',
    'Release management',
    'Customer support tickets',
    'Feature requests',
    'DevOps workflows',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Atlassian Developer App',
      description: 'Go to developer.atlassian.com and create a new OAuth 2.0 app.',
    },
    {
      step: 2,
      title: 'Configure Permissions',
      description: 'Add required scopes: read:jira-work, write:jira-work.',
    },
    {
      step: 3,
      title: 'Add Callback URL',
      description: 'Add AgentForge callback URL.',
    },
    {
      step: 4,
      title: 'Copy Credentials',
      description: 'Copy Client ID and Secret.',
    },
    {
      step: 5,
      title: 'Configure in AgentForge',
      description: 'Enter credentials and specify your Jira domain.',
    },
  ],

  operations: [
    {
      name: 'Create Issue',
      description: 'Create a new Jira issue',
      fields: [
        { name: 'project', type: 'string', required: true, description: 'Project key (e.g., PROJ)' },
        { name: 'issuetype', type: 'string', required: true, description: 'Bug, Story, Task, Epic' },
        { name: 'summary', type: 'string', required: true, description: 'Issue title' },
        { name: 'description', type: 'string', required: false, description: 'Issue description' },
        { name: 'assignee', type: 'string', required: false, description: 'Assignee account ID' },
        { name: 'priority', type: 'string', required: false, description: 'Priority level' },
        { name: 'labels', type: 'array', required: false, description: 'Labels to apply' },
      ],
    },
    {
      name: 'Transition Issue',
      description: 'Move issue through workflow',
      fields: [
        { name: 'issue_key', type: 'string', required: true, description: 'Issue key (e.g., PROJ-123)' },
        { name: 'transition_id', type: 'string', required: true, description: 'Transition ID' },
        { name: 'comment', type: 'string', required: false, description: 'Transition comment' },
      ],
    },
    {
      name: 'Search Issues (JQL)',
      description: 'Search using JQL',
      fields: [
        { name: 'jql', type: 'string', required: true, description: 'JQL query' },
        { name: 'maxResults', type: 'number', required: false, description: 'Max results' },
        { name: 'fields', type: 'array', required: false, description: 'Fields to return' },
      ],
    },
    {
      name: 'Add Comment',
      description: 'Add comment to issue',
      fields: [
        { name: 'issue_key', type: 'string', required: true, description: 'Issue key' },
        { name: 'body', type: 'string', required: true, description: 'Comment text' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Issue Created',
      description: 'Triggers when an issue is created',
      when: 'New issue in project',
      outputFields: ['key', 'summary', 'issuetype', 'status', 'assignee'],
    },
    {
      name: 'Issue Updated',
      description: 'Triggers when an issue is modified',
      when: 'Issue fields change',
      outputFields: ['key', 'summary', 'changelog'],
    },
    {
      name: 'Issue Transitioned',
      description: 'Triggers on status change',
      when: 'Issue moves in workflow',
      outputFields: ['key', 'from_status', 'to_status'],
    },
  ],

  actions: [
    {
      name: 'Create Bug',
      description: 'Create a bug issue',
      inputFields: ['project', 'summary', 'description', 'priority'],
      outputFields: ['key', 'self'],
    },
    {
      name: 'Close Issue',
      description: 'Transition issue to Done/Closed',
      inputFields: ['issue_key', 'resolution'],
      outputFields: ['key', 'status'],
    },
  ],

  examples: [
    {
      title: 'Bug from Error Alert',
      description: 'Auto-create bugs from monitoring alerts',
      steps: [
        'Trigger: Error alert from monitoring',
        'Check if similar bug exists (JQL search)',
        'If not exists, create new bug',
        'Add error details as comment',
        'Assign to on-call developer',
      ],
      code: `{
  "fields": {
    "project": { "key": "PROD" },
    "issuetype": { "name": "Bug" },
    "summary": "[Auto] {{alert.title}}",
    "description": "Error detected in production:\\n\\n{{alert.message}}\\n\\nTimestamp: {{alert.timestamp}}",
    "priority": { "name": "High" },
    "labels": ["auto-created", "monitoring"]
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Issue type not found',
      cause: 'Issue type doesn\'t exist in project.',
      solution: 'Check project settings for available issue types.',
    },
    {
      problem: 'Field not on screen',
      cause: 'Required field not on create/edit screen.',
      solution: 'Add field to screen in Jira admin or use different fields.',
    },
    {
      problem: 'Transition not available',
      cause: 'Issue status doesn\'t allow that transition.',
      solution: 'Get available transitions first and use valid transition ID.',
    },
  ],

  relatedIntegrations: ['github', 'slack', 'asana'],
  externalResources: [
    { title: 'Jira REST API', url: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/' },
    { title: 'JQL Reference', url: 'https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/' },
  ],
};

export const mondayIntegration: Integration = {
  id: 'monday',
  name: 'Monday.com',
  description: 'Use the Monday node to manage boards, items, and columns. n8n supports item CRUD, status updates, and automation triggers for work management.',
  shortDescription: 'Work management platform',
  category: 'productivity',
  icon: 'monday',
  color: '#FF3D57',
  website: 'https://monday.com',
  documentationUrl: 'https://developer.monday.com/api-reference/docs',

  features: [
    'Board management',
    'Item CRUD operations',
    'Column values',
    'Status updates',
    'Subitems',
    'Activity logs',
    'Webhooks',
    'File attachments',
  ],

  useCases: [
    'Project tracking',
    'Task management',
    'CRM workflows',
    'Sprint planning',
    'Request management',
    'Resource planning',
    'Client portals',
    'Team collaboration',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Go to Developer Section',
      description: 'Click your avatar > Developers.',
    },
    {
      step: 2,
      title: 'Create API Token',
      description: 'In "My Access Tokens", generate a personal API token.',
    },
    {
      step: 3,
      title: 'Copy Token',
      description: 'Copy the generated API token.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter the token in Integrations > Monday.com.',
    },
  ],

  operations: [
    {
      name: 'Get Items',
      description: 'Get items from a board',
      fields: [
        { name: 'board_id', type: 'string', required: true, description: 'Board ID' },
        { name: 'limit', type: 'number', required: false, description: 'Items limit' },
        { name: 'column_values', type: 'boolean', required: false, description: 'Include column values' },
      ],
    },
    {
      name: 'Create Item',
      description: 'Create a new item on a board',
      fields: [
        { name: 'board_id', type: 'string', required: true, description: 'Board ID' },
        { name: 'group_id', type: 'string', required: true, description: 'Group ID' },
        { name: 'item_name', type: 'string', required: true, description: 'Item name' },
        { name: 'column_values', type: 'json', required: false, description: 'Column values as JSON' },
      ],
    },
    {
      name: 'Update Item',
      description: 'Update item column values',
      fields: [
        { name: 'item_id', type: 'string', required: true, description: 'Item ID' },
        { name: 'column_values', type: 'json', required: true, description: 'Column values to update' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Item Created',
      description: 'Triggers when item is created',
      when: 'New item added to board',
      outputFields: ['id', 'name', 'board_id', 'column_values'],
    },
    {
      name: 'Status Changed',
      description: 'Triggers when status column changes',
      when: 'Status updated',
      outputFields: ['item_id', 'previous_status', 'new_status'],
    },
  ],

  actions: [
    {
      name: 'Create Item',
      description: 'Add new item to board',
      inputFields: ['board_id', 'group_id', 'item_name', 'column_values'],
      outputFields: ['id', 'name'],
    },
    {
      name: 'Update Status',
      description: 'Change item status',
      inputFields: ['item_id', 'status'],
      outputFields: ['id', 'column_values'],
    },
  ],

  examples: [
    {
      title: 'Lead Management',
      description: 'Create leads from form submissions',
      steps: [
        'Trigger: Form submission received',
        'Create item on Leads board',
        'Set column values (contact, company, source)',
        'Assign to sales rep',
      ],
      code: `mutation {
  create_item (
    board_id: {{board_id}},
    group_id: "new_leads",
    item_name: "{{lead.company}}",
    column_values: "{\\"person\\": {\\"personsAndTeams\\": [{\\"id\\": {{sales_rep_id}}}]}, \\"status\\": {\\"label\\": \\"New\\"}, \\"email\\": {\\"email\\": \\"{{lead.email}}\\", \\"text\\": \\"{{lead.email}}\\"}}"
  ) {
    id
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Column values not updating',
      cause: 'Incorrect JSON structure for column type.',
      solution: 'Check column type and use correct JSON format.',
    },
    {
      problem: 'Board not found',
      cause: 'Invalid board ID or no access.',
      solution: 'Verify board ID and API token permissions.',
    },
  ],

  relatedIntegrations: ['asana', 'trello', 'notion'],
  externalResources: [
    { title: 'Monday API Docs', url: 'https://developer.monday.com/api-reference/docs' },
  ],
};

export const clickupIntegration: Integration = {
  id: 'clickup',
  name: 'ClickUp',
  description: 'Use the ClickUp node to manage tasks, lists, and spaces. n8n supports task CRUD, comments, time tracking, and custom fields for productivity workflows.',
  shortDescription: 'Project management platform',
  category: 'productivity',
  icon: 'clickup',
  color: '#7B68EE',
  website: 'https://clickup.com',
  documentationUrl: 'https://clickup.com/api',

  features: [
    'Task management',
    'Custom fields',
    'Time tracking',
    'Comments',
    'Attachments',
    'Checklists',
    'Dependencies',
    'Goals tracking',
  ],

  useCases: [
    'Project management',
    'Sprint planning',
    'Time tracking',
    'Bug tracking',
    'Content calendar',
    'Client projects',
    'Personal tasks',
    'Team collaboration',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Go to Settings',
      description: 'Click your avatar > Settings > Apps.',
    },
    {
      step: 2,
      title: 'Generate API Token',
      description: 'Click "Generate" under API Token.',
    },
    {
      step: 3,
      title: 'Copy Token',
      description: 'Copy the personal API token.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter the token in Integrations > ClickUp.',
    },
  ],

  operations: [
    {
      name: 'Get Tasks',
      description: 'Get tasks from a list',
      fields: [
        { name: 'list_id', type: 'string', required: true, description: 'List ID' },
        { name: 'include_closed', type: 'boolean', required: false, description: 'Include closed tasks' },
        { name: 'subtasks', type: 'boolean', required: false, description: 'Include subtasks' },
      ],
    },
    {
      name: 'Create Task',
      description: 'Create a new task',
      fields: [
        { name: 'list_id', type: 'string', required: true, description: 'List ID' },
        { name: 'name', type: 'string', required: true, description: 'Task name' },
        { name: 'description', type: 'string', required: false, description: 'Task description' },
        { name: 'priority', type: 'number', required: false, description: '1=Urgent, 2=High, 3=Normal, 4=Low' },
        { name: 'due_date', type: 'date', required: false, description: 'Due date (Unix timestamp)' },
        { name: 'assignees', type: 'array', required: false, description: 'Assignee user IDs' },
      ],
    },
    {
      name: 'Update Task',
      description: 'Update an existing task',
      fields: [
        { name: 'task_id', type: 'string', required: true, description: 'Task ID' },
        { name: 'name', type: 'string', required: false, description: 'New task name' },
        { name: 'status', type: 'string', required: false, description: 'New status' },
        { name: 'priority', type: 'number', required: false, description: 'New priority' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Task Created',
      description: 'Triggers when task is created',
      when: 'New task in workspace',
      outputFields: ['id', 'name', 'status', 'list'],
    },
    {
      name: 'Task Updated',
      description: 'Triggers when task is updated',
      when: 'Task modified',
      outputFields: ['id', 'name', 'changed_fields'],
    },
  ],

  actions: [
    {
      name: 'Create Task',
      description: 'Create new task',
      inputFields: ['list_id', 'name', 'description', 'assignees'],
      outputFields: ['id', 'name', 'url'],
    },
    {
      name: 'Update Status',
      description: 'Change task status',
      inputFields: ['task_id', 'status'],
      outputFields: ['id', 'status'],
    },
  ],

  examples: [
    {
      title: 'Bug Report Workflow',
      description: 'Create tasks from bug reports',
      steps: [
        'Trigger: Bug report submitted',
        'Create task in Bugs list',
        'Set priority based on severity',
        'Assign to development team',
        'Add error details as comment',
      ],
      code: `{
  "list_id": "{{bugs_list_id}}",
  "name": "[Bug] {{bug.title}}",
  "description": "**Reporter:** {{bug.reporter}}\\n**Browser:** {{bug.browser}}\\n\\n{{bug.description}}",
  "priority": {{bug.severity === 'critical' ? 1 : bug.severity === 'high' ? 2 : 3}},
  "tags": ["bug", "{{bug.component}}"],
  "assignees": [{{dev_team_lead_id}}]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'List not found',
      cause: 'Invalid list ID or no access.',
      solution: 'Get list ID from ClickUp URL or API.',
    },
    {
      problem: 'Custom field error',
      cause: 'Wrong field ID or value format.',
      solution: 'Get custom field IDs from list settings.',
    },
  ],

  relatedIntegrations: ['asana', 'monday', 'trello'],
  externalResources: [
    { title: 'ClickUp API Docs', url: 'https://clickup.com/api' },
  ],
};

export const calendlyIntegration: Integration = {
  id: 'calendly',
  name: 'Calendly',
  description: 'Use the Calendly node to manage scheduled events and invitees. n8n supports event triggers, invitee data, and scheduling links for appointment automation.',
  shortDescription: 'Scheduling automation',
  category: 'productivity',
  icon: 'calendly',
  color: '#006BFF',
  website: 'https://calendly.com',
  documentationUrl: 'https://developer.calendly.com/api-docs',

  features: [
    'Event webhooks',
    'Invitee management',
    'Scheduling links',
    'Availability',
    'Event types',
    'Team scheduling',
    'Round robin',
    'Custom questions',
  ],

  useCases: [
    'Sales meeting booking',
    'Customer support calls',
    'Interview scheduling',
    'Consultation booking',
    'Demo scheduling',
    'Team availability',
    'Appointment reminders',
    'Calendar sync',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Go to Integrations',
      description: 'In Calendly, go to Integrations & Apps.',
    },
    {
      step: 2,
      title: 'Access API',
      description: 'Click "API & Webhooks" section.',
    },
    {
      step: 3,
      title: 'Generate Token',
      description: 'Create a Personal Access Token.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter the token in Integrations > Calendly.',
    },
  ],

  operations: [
    {
      name: 'List Events',
      description: 'Get scheduled events',
      fields: [
        { name: 'user', type: 'string', required: true, description: 'User URI' },
        { name: 'status', type: 'select', required: false, description: 'active, canceled' },
        { name: 'min_start_time', type: 'date', required: false, description: 'Minimum start time' },
        { name: 'max_start_time', type: 'date', required: false, description: 'Maximum start time' },
      ],
    },
    {
      name: 'Get Event',
      description: 'Get single event details',
      fields: [
        { name: 'event_uuid', type: 'string', required: true, description: 'Event UUID' },
      ],
    },
    {
      name: 'List Invitees',
      description: 'Get invitees for an event',
      fields: [
        { name: 'event_uuid', type: 'string', required: true, description: 'Event UUID' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Event Created',
      description: 'Triggers when meeting is booked',
      when: 'invitee.created webhook',
      outputFields: ['event', 'invitee', 'scheduled_time', 'questions_answers'],
    },
    {
      name: 'Event Canceled',
      description: 'Triggers when meeting is canceled',
      when: 'invitee.canceled webhook',
      outputFields: ['event', 'invitee', 'cancel_reason'],
    },
  ],

  actions: [
    {
      name: 'Get Event Details',
      description: 'Retrieve event information',
      inputFields: ['event_uuid'],
      outputFields: ['name', 'start_time', 'end_time', 'location'],
    },
  ],

  examples: [
    {
      title: 'Sales Pipeline Integration',
      description: 'Update CRM when meeting booked',
      steps: [
        'Trigger: Calendly meeting booked',
        'Extract invitee info and answers',
        'Create/update contact in CRM',
        'Add meeting to deal timeline',
        'Send confirmation with prep materials',
      ],
      code: `{
  "trigger": "invitee.created",
  "data": {
    "contact": {
      "email": "{{invitee.email}}",
      "name": "{{invitee.name}}",
      "company": "{{questions_answers.company}}"
    },
    "meeting": {
      "type": "{{event.name}}",
      "scheduled_at": "{{event.start_time}}",
      "duration": "{{event.duration}}"
    }
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Webhook not firing',
      cause: 'Webhook not configured for event type.',
      solution: 'Set up webhook subscription via API for specific events.',
    },
    {
      problem: 'User not found',
      cause: 'Invalid user URI.',
      solution: 'Get current user URI from /users/me endpoint.',
    },
  ],

  relatedIntegrations: ['google-calendar', 'hubspot', 'salesforce'],
  externalResources: [
    { title: 'Calendly API Docs', url: 'https://developer.calendly.com/api-docs' },
  ],
};
