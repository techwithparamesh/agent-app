import { IntegrationDoc } from './types';

export const productivityDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TRELLO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'trello',
    name: 'Trello',
    icon: '📋',
    category: 'productivity',
    shortDescription: 'Manage Trello boards, lists, and cards',
    overview: {
      what: 'Trello integration allows your AI agent to create and manage Trello cards, lists, and boards for task management.',
      why: 'Trello\'s visual boards make task management intuitive. Let AI create tasks from conversations automatically.',
      useCases: ['Task creation from chat', 'Project tracking', 'Bug reporting', 'Feature requests', 'Support ticket management', 'Team task assignment'],
      targetAudience: 'Teams using Trello for project management who want to capture tasks from conversations.',
    },
    prerequisites: {
      accounts: ['Trello account'],
      permissions: ['API key and token'],
      preparations: ['Get API key from Trello', 'Authorize token'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Trello Developer', description: 'Visit trello.com/power-ups/admin and log in.', screenshot: 'Trello – Developer Portal' },
      { step: 2, title: 'Create New Power-Up', description: 'Click "New" to create a new integration.', screenshot: 'Trello – Create Power-Up' },
      { step: 3, title: 'Get API Key', description: 'Go to your Power-Up page and find the API Key.', screenshot: 'Trello – API Key' },
      { step: 4, title: 'Generate Token', description: 'Click "Token" link to authorize and get a token.', screenshot: 'Trello – Generate Token' },
      { step: 5, title: 'Copy Token', description: 'Authorize the app and copy the generated token.', screenshot: 'Trello – Copy Token' },
      { step: 6, title: 'Get Board ID', description: 'Open your board. The ID is in the URL after /b/.', screenshot: 'Trello – Board ID', tip: 'Or use boards API to list all boards.' },
      { step: 7, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Trello. Enter API key, token, and board ID.', screenshot: 'AgentForge – Trello Form' },
    ],
    triggers: [
      { id: 'card_created', name: 'Card Created', description: 'Fires when a new card is added.', whenItFires: 'When card is created on board.', exampleScenario: 'Notify assignee of new task.', dataProvided: ['Card ID', 'Name', 'Description', 'List'] },
      { id: 'card_moved', name: 'Card Moved', description: 'Fires when card moves between lists.', whenItFires: 'When card is dragged to another list.', exampleScenario: 'Update customer when task status changes.', dataProvided: ['Card ID', 'Old list', 'New list'] },
    ],
    actions: [
      { id: 'create_card', name: 'Create Card', description: 'Create a new Trello card.', whenToUse: 'To capture tasks from conversations.', requiredFields: ['List ID', 'Card name'], optionalFields: ['Description', 'Due date', 'Labels'], example: 'Create card "Fix login bug" in "To Do" list.' },
      { id: 'update_card', name: 'Update Card', description: 'Update an existing card.', whenToUse: 'To modify card details.', requiredFields: ['Card ID'], optionalFields: ['Name', 'Description', 'Due date', 'List ID'], example: 'Move card to "In Progress" list.' },
      { id: 'add_comment', name: 'Add Comment', description: 'Add comment to a card.', whenToUse: 'To add context or updates.', requiredFields: ['Card ID', 'Comment text'], example: 'Add customer feedback as comment.' },
    ],
    exampleFlow: { title: 'Task Capture Flow', scenario: 'Create tasks from customer requests.', steps: ['Customer reports issue in chat', 'AI summarizes the issue', 'Trello action creates card', 'Card appears in "Incoming" list', 'Team triages and assigns'] },
    troubleshooting: [
      { error: 'Invalid token', cause: 'Token expired or revoked.', solution: 'Generate new token from developer portal.' },
      { error: 'Board not found', cause: 'Wrong board ID or no access.', solution: 'Verify board ID and ensure token has access.' },
      { error: 'List not found', cause: 'List ID incorrect.', solution: 'Get list IDs via API or from board URL.' },
    ],
    bestPractices: ['Use descriptive card names', 'Add labels for categorization', 'Set due dates for deadlines', 'Use checklists for subtasks', 'Archive completed cards regularly'],
    faq: [
      { question: 'Is Trello free?', answer: 'Free tier: unlimited cards, 10 boards. Paid for more features.' },
      { question: 'Can I assign members?', answer: 'Yes, add member IDs to card using their Trello member ID.' },
      { question: 'How do I get list IDs?', answer: 'Add .json to board URL or use the API to list all lists.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ASANA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'asana',
    name: 'Asana',
    icon: '🎯',
    category: 'productivity',
    shortDescription: 'Create and manage Asana tasks and projects',
    overview: {
      what: 'Asana integration connects your AI agent to Asana for comprehensive task and project management.',
      why: 'Asana is built for team collaboration. Track work from small tasks to strategic initiatives.',
      useCases: ['Task creation', 'Project tracking', 'Deadline management', 'Team assignment', 'Progress updates', 'Meeting action items'],
      targetAudience: 'Teams using Asana for work management who want to capture and update tasks via conversations.',
    },
    prerequisites: {
      accounts: ['Asana account'],
      permissions: ['Personal Access Token'],
      preparations: ['Generate personal access token', 'Note workspace and project IDs'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Asana Developer Console', description: 'Visit app.asana.com/0/developer-console.', screenshot: 'Asana – Developer Console' },
      { step: 2, title: 'Create Personal Access Token', description: 'Click "+ Create new token".', screenshot: 'Asana – Create Token' },
      { step: 3, title: 'Name and Create', description: 'Name your token and create it.', screenshot: 'Asana – Name Token' },
      { step: 4, title: 'Copy Token', description: 'Copy the generated token.', screenshot: 'Asana – Copy Token', warning: 'Token shown only once!' },
      { step: 5, title: 'Get Workspace GID', description: 'Use API or check URL when in workspace.', screenshot: 'Asana – Workspace GID' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Asana. Enter token and workspace GID.', screenshot: 'AgentForge – Asana Form' },
    ],
    triggers: [
      { id: 'task_created', name: 'Task Created', description: 'Fires when new task is created.', whenItFires: 'When task is added to project.', exampleScenario: 'Notify team of new task.', dataProvided: ['Task GID', 'Name', 'Assignee', 'Due date'] },
      { id: 'task_completed', name: 'Task Completed', description: 'Fires when task is marked complete.', whenItFires: 'When task completion status changes.', exampleScenario: 'Update customer on completed work.', dataProvided: ['Task GID', 'Name', 'Completed at'] },
    ],
    actions: [
      { id: 'create_task', name: 'Create Task', description: 'Create a new Asana task.', whenToUse: 'To capture action items.', requiredFields: ['Name'], optionalFields: ['Project', 'Assignee', 'Due date', 'Notes'], example: 'Create task "Review proposal" due Friday.' },
      { id: 'update_task', name: 'Update Task', description: 'Update an existing task.', whenToUse: 'To modify task details.', requiredFields: ['Task GID'], optionalFields: ['Name', 'Completed', 'Due date'], example: 'Mark task as completed.' },
      { id: 'add_comment', name: 'Add Comment', description: 'Add comment to task.', whenToUse: 'To provide updates or context.', requiredFields: ['Task GID', 'Comment'], example: 'Add status update to task.' },
    ],
    exampleFlow: { title: 'Meeting Action Items Flow', scenario: 'Capture action items from meetings.', steps: ['Meeting concludes with action items', 'AI captures each action item', 'Asana action creates tasks', 'Tasks assigned to team members', 'Team sees tasks in their Asana inbox'] },
    troubleshooting: [
      { error: 'Not authorized', cause: 'Invalid or expired token.', solution: 'Generate new personal access token.' },
      { error: 'Project not found', cause: 'Wrong project GID.', solution: 'Verify project GID from URL or API.' },
      { error: 'User not in workspace', cause: 'Assignee not in workspace.', solution: 'Use email or GID of user in same workspace.' },
    ],
    bestPractices: ['Use projects to organize tasks', 'Set clear due dates', 'Add detailed descriptions', 'Use subtasks for complex items', 'Leverage custom fields'],
    faq: [
      { question: 'Is Asana free?', answer: 'Free for up to 15 users with basic features. Premium/Business for more.' },
      { question: 'What\'s a GID?', answer: 'Global ID - Asana\'s unique identifier for objects.' },
      { question: 'Can I create subtasks?', answer: 'Yes, set parent field when creating task.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JIRA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'jira',
    name: 'Jira',
    icon: '🎫',
    category: 'productivity',
    shortDescription: 'Create and manage Jira issues and projects',
    overview: {
      what: 'Jira integration connects your AI agent to Atlassian Jira for issue tracking and agile project management.',
      why: 'Jira is the standard for software development tracking. Perfect for bug reports, features, and sprints.',
      useCases: ['Bug reporting', 'Feature requests', 'Sprint management', 'Issue tracking', 'Support ticket escalation', 'Development workflow'],
      targetAudience: 'Software teams using Jira for development tracking and agile project management.',
    },
    prerequisites: {
      accounts: ['Atlassian/Jira account'],
      permissions: ['API token'],
      preparations: ['Generate API token', 'Note your Jira domain and project key'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Atlassian Account', description: 'Visit id.atlassian.com/manage-profile/security/api-tokens.', screenshot: 'Atlassian – Account Security' },
      { step: 2, title: 'Create API Token', description: 'Click "Create API token".', screenshot: 'Atlassian – Create Token' },
      { step: 3, title: 'Name Token', description: 'Give your token a descriptive name.', screenshot: 'Atlassian – Name Token' },
      { step: 4, title: 'Copy Token', description: 'Copy the generated token immediately.', screenshot: 'Atlassian – Copy Token', warning: 'Token shown only once!' },
      { step: 5, title: 'Note Your Domain', description: 'Your Jira domain is: your-company.atlassian.net', screenshot: 'Jira – Domain' },
      { step: 6, title: 'Get Project Key', description: 'Project key is shown in issue IDs (e.g., PROJ-123 → key is PROJ).', screenshot: 'Jira – Project Key' },
      { step: 7, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Jira. Enter email, token, domain, and project key.', screenshot: 'AgentForge – Jira Form' },
    ],
    triggers: [
      { id: 'issue_created', name: 'Issue Created', description: 'Fires when new issue is created.', whenItFires: 'When issue is added to project.', exampleScenario: 'Notify team of new bug report.', dataProvided: ['Issue key', 'Summary', 'Type', 'Priority', 'Reporter'] },
      { id: 'issue_updated', name: 'Issue Updated', description: 'Fires when issue is modified.', whenItFires: 'When issue fields change.', exampleScenario: 'Update customer when bug is fixed.', dataProvided: ['Issue key', 'Changed fields', 'New values'] },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', description: 'Create a new Jira issue.', whenToUse: 'To log bugs or feature requests.', requiredFields: ['Project', 'Issue type', 'Summary'], optionalFields: ['Description', 'Priority', 'Assignee'], example: 'Create bug "Login fails on mobile".' },
      { id: 'update_issue', name: 'Update Issue', description: 'Update an existing issue.', whenToUse: 'To modify issue details.', requiredFields: ['Issue key'], optionalFields: ['Status', 'Assignee', 'Comment'], example: 'Move PROJ-123 to "In Progress".' },
      { id: 'add_comment', name: 'Add Comment', description: 'Add comment to issue.', whenToUse: 'To provide updates.', requiredFields: ['Issue key', 'Comment'], example: 'Add customer feedback to issue.' },
    ],
    exampleFlow: { title: 'Bug Report Flow', scenario: 'Create bug from customer report.', steps: ['Customer reports issue', 'AI gathers reproduction steps', 'Jira action creates bug', 'Bug appears in backlog', 'Team reviews and prioritizes'] },
    troubleshooting: [
      { error: 'Authentication failed', cause: 'Wrong email or token.', solution: 'Verify email and regenerate token.' },
      { error: 'Project not found', cause: 'Wrong project key.', solution: 'Check project key from issue IDs.' },
      { error: 'Invalid issue type', cause: 'Type not available in project.', solution: 'Use issue types configured for your project.' },
    ],
    bestPractices: ['Use appropriate issue types', 'Set priority consistently', 'Add reproduction steps for bugs', 'Link related issues', 'Keep issues updated'],
    faq: [
      { question: 'Cloud or Server?', answer: 'This integration is for Jira Cloud. Server/DC requires different setup.' },
      { question: 'What issue types exist?', answer: 'Default: Bug, Story, Task, Epic. Custom types depend on project.' },
      { question: 'Can I transition issues?', answer: 'Yes, use update with transition ID to move through workflow.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MONDAY.COM
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'monday',
    name: 'Monday.com',
    icon: '📅',
    category: 'productivity',
    shortDescription: 'Manage Monday.com boards and items',
    overview: {
      what: 'Monday.com integration allows your AI agent to create and manage items in Monday.com work management boards.',
      why: 'Monday.com offers flexible work management with beautiful visualizations. Great for any team workflow.',
      useCases: ['Work tracking', 'Project management', 'CRM workflows', 'Marketing campaigns', 'IT requests', 'HR processes'],
      targetAudience: 'Teams using Monday.com for work management across various departments.',
    },
    prerequisites: {
      accounts: ['Monday.com account'],
      permissions: ['API token'],
      preparations: ['Generate API token', 'Note board IDs'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Monday.com', description: 'Log into your Monday.com account.', screenshot: 'Monday – Dashboard' },
      { step: 2, title: 'Open Admin', description: 'Click your avatar → Admin.', screenshot: 'Monday – Admin Menu' },
      { step: 3, title: 'Go to API', description: 'Click "API" in the admin section.', screenshot: 'Monday – API Section' },
      { step: 4, title: 'Generate Token', description: 'Click "Generate" to create personal API token.', screenshot: 'Monday – Generate Token' },
      { step: 5, title: 'Copy Token', description: 'Copy the generated token.', screenshot: 'Monday – Copy Token' },
      { step: 6, title: 'Get Board ID', description: 'Open board. ID is in URL after /boards/.', screenshot: 'Monday – Board ID' },
      { step: 7, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Monday.com. Enter API token and board ID.', screenshot: 'AgentForge – Monday Form' },
    ],
    triggers: [
      { id: 'item_created', name: 'Item Created', description: 'Fires when new item is added.', whenItFires: 'When item created on board.', exampleScenario: 'Send welcome message for new lead.', dataProvided: ['Item ID', 'Name', 'Column values', 'Group'] },
      { id: 'status_changed', name: 'Status Changed', description: 'Fires when status column changes.', whenItFires: 'When status is updated.', exampleScenario: 'Notify customer of progress.', dataProvided: ['Item ID', 'Old status', 'New status'] },
    ],
    actions: [
      { id: 'create_item', name: 'Create Item', description: 'Create a new item on board.', whenToUse: 'To add new entries.', requiredFields: ['Board ID', 'Item name'], optionalFields: ['Column values', 'Group ID'], example: 'Create lead "John Smith" in "New" group.' },
      { id: 'update_item', name: 'Update Item', description: 'Update item column values.', whenToUse: 'To modify item data.', requiredFields: ['Item ID', 'Column values'], example: 'Update status to "Working on it".' },
      { id: 'add_update', name: 'Add Update', description: 'Add update/comment to item.', whenToUse: 'To communicate on items.', requiredFields: ['Item ID', 'Update text'], example: 'Add note about customer call.' },
    ],
    exampleFlow: { title: 'Lead Intake Flow', scenario: 'Create leads from chat.', steps: ['Potential customer inquires', 'AI qualifies lead', 'Monday action creates item', 'Lead appears in Sales board', 'Sales team follows up'] },
    troubleshooting: [
      { error: 'Invalid token', cause: 'Token expired or revoked.', solution: 'Generate new API token.' },
      { error: 'Board not found', cause: 'Wrong board ID or no access.', solution: 'Verify board ID and permissions.' },
      { error: 'Column not found', cause: 'Column ID incorrect.', solution: 'Use column API to get correct IDs.' },
    ],
    bestPractices: ['Use groups to organize items', 'Define clear column structures', 'Use automations for workflows', 'Keep boards focused', 'Archive old items'],
    faq: [
      { question: 'Is Monday.com free?', answer: 'Free for up to 2 users. Paid plans for teams.' },
      { question: 'How do I get column IDs?', answer: 'Use the API or check board settings.' },
      { question: 'Can I create subitems?', answer: 'Yes, use create_subitem mutation with parent item ID.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLICKUP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'clickup',
    name: 'ClickUp',
    icon: '✅',
    category: 'productivity',
    shortDescription: 'Manage ClickUp tasks, lists, and spaces',
    overview: {
      what: 'ClickUp integration connects your AI agent to ClickUp for comprehensive task and project management.',
      why: 'ClickUp is an all-in-one productivity platform. Docs, tasks, goals, and time tracking in one place.',
      useCases: ['Task management', 'Project tracking', 'Documentation', 'Goal tracking', 'Time tracking', 'Team collaboration'],
      targetAudience: 'Teams using ClickUp as their productivity hub who want AI-powered task management.',
    },
    prerequisites: {
      accounts: ['ClickUp account'],
      permissions: ['API token'],
      preparations: ['Generate API token', 'Note workspace and list IDs'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to ClickUp Settings', description: 'Click avatar → Settings.', screenshot: 'ClickUp – Settings' },
      { step: 2, title: 'Navigate to Apps', description: 'Click "Apps" in the left sidebar.', screenshot: 'ClickUp – Apps' },
      { step: 3, title: 'Generate API Token', description: 'Click "Generate" under Personal API Token.', screenshot: 'ClickUp – Generate Token' },
      { step: 4, title: 'Copy Token', description: 'Copy the generated token.', screenshot: 'ClickUp – Copy Token' },
      { step: 5, title: 'Get List ID', description: 'Open a list. ID is in URL or use settings.', screenshot: 'ClickUp – List ID', tip: 'List ID is where tasks will be created.' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → ClickUp. Enter API token and list ID.', screenshot: 'AgentForge – ClickUp Form' },
    ],
    triggers: [
      { id: 'task_created', name: 'Task Created', description: 'Fires when new task is created.', whenItFires: 'When task added to list.', exampleScenario: 'Notify team of new task.', dataProvided: ['Task ID', 'Name', 'Status', 'Assignees'] },
      { id: 'task_updated', name: 'Task Updated', description: 'Fires when task is modified.', whenItFires: 'When task details change.', exampleScenario: 'Update customer on task progress.', dataProvided: ['Task ID', 'Changed fields', 'New values'] },
    ],
    actions: [
      { id: 'create_task', name: 'Create Task', description: 'Create a new ClickUp task.', whenToUse: 'To add new work items.', requiredFields: ['List ID', 'Name'], optionalFields: ['Description', 'Assignees', 'Due date', 'Priority'], example: 'Create task "Review document" in Design list.' },
      { id: 'update_task', name: 'Update Task', description: 'Update an existing task.', whenToUse: 'To modify task details.', requiredFields: ['Task ID'], optionalFields: ['Status', 'Priority', 'Due date'], example: 'Change task status to "Complete".' },
      { id: 'add_comment', name: 'Add Comment', description: 'Add comment to task.', whenToUse: 'To provide updates.', requiredFields: ['Task ID', 'Comment'], example: 'Add feedback to task.' },
    ],
    exampleFlow: { title: 'Support Escalation Flow', scenario: 'Escalate support issues to dev team.', steps: ['Customer reports technical issue', 'Support confirms it\'s a bug', 'ClickUp action creates task', 'Task assigned to dev team', 'Customer updated when resolved'] },
    troubleshooting: [
      { error: 'Invalid token', cause: 'Token incorrect or expired.', solution: 'Regenerate API token in settings.' },
      { error: 'List not found', cause: 'Wrong list ID.', solution: 'Verify list ID from URL or settings.' },
      { error: 'Permission denied', cause: 'No access to workspace/list.', solution: 'Ensure token owner has access to the list.' },
    ],
    bestPractices: ['Organize with Spaces and Folders', 'Use statuses for workflow stages', 'Set priorities consistently', 'Use custom fields for data', 'Leverage ClickUp Docs'],
    faq: [
      { question: 'Is ClickUp free?', answer: 'Free Forever plan available. Paid for advanced features.' },
      { question: 'Spaces vs Lists?', answer: 'Spaces contain Folders/Lists. Lists contain tasks.' },
      { question: 'Can I create subtasks?', answer: 'Yes, use parent field when creating task.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CALENDLY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'calendly',
    name: 'Calendly',
    icon: '📆',
    category: 'productivity',
    shortDescription: 'Schedule meetings via Calendly',
    overview: {
      what: 'Calendly integration allows your AI agent to create scheduling links and manage appointments.',
      why: 'Calendly eliminates scheduling back-and-forth. Let AI share booking links and confirm meetings.',
      useCases: ['Meeting scheduling', 'Demo bookings', 'Consultation appointments', 'Interview scheduling', 'Support calls', 'Follow-up meetings'],
      targetAudience: 'Anyone using Calendly who wants AI to handle scheduling conversations.',
    },
    prerequisites: {
      accounts: ['Calendly account (Professional+ for API)'],
      permissions: ['Personal access token'],
      preparations: ['Generate API token', 'Set up event types'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Calendly Integrations', description: 'Go to calendly.com/integrations.', screenshot: 'Calendly – Integrations' },
      { step: 2, title: 'Navigate to API', description: 'Click "API & Webhooks".', screenshot: 'Calendly – API Section' },
      { step: 3, title: 'Generate Token', description: 'Click "Create new token" under Personal access tokens.', screenshot: 'Calendly – Create Token' },
      { step: 4, title: 'Copy Token', description: 'Name and create token, then copy it.', screenshot: 'Calendly – Copy Token', warning: 'Token shown only once!' },
      { step: 5, title: 'Get Event Type', description: 'Note your scheduling link (calendly.com/yourname/event-type).', screenshot: 'Calendly – Event Type' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Calendly. Enter API token.', screenshot: 'AgentForge – Calendly Form' },
    ],
    triggers: [
      { id: 'invitee_created', name: 'Meeting Booked', description: 'Fires when someone books a meeting.', whenItFires: 'When invitee completes booking.', exampleScenario: 'Send confirmation and prep materials.', dataProvided: ['Event name', 'Invitee email', 'Start time', 'Questions/answers'] },
      { id: 'invitee_canceled', name: 'Meeting Canceled', description: 'Fires when meeting is canceled.', whenItFires: 'When invitee cancels.', exampleScenario: 'Offer to reschedule.', dataProvided: ['Event name', 'Invitee email', 'Cancellation reason'] },
    ],
    actions: [
      { id: 'get_scheduling_link', name: 'Get Scheduling Link', description: 'Return a Calendly scheduling link.', whenToUse: 'When customer wants to schedule.', requiredFields: ['Event type'], example: 'Share 30-minute meeting link.' },
      { id: 'list_events', name: 'List Scheduled Events', description: 'Get list of scheduled events.', whenToUse: 'To check upcoming meetings.', requiredFields: ['Date range'], example: 'Get all meetings for next week.' },
      { id: 'cancel_event', name: 'Cancel Event', description: 'Cancel a scheduled event.', whenToUse: 'When meeting needs cancellation.', requiredFields: ['Event UUID'], optionalFields: ['Cancellation reason'], example: 'Cancel meeting and notify invitee.' },
    ],
    exampleFlow: { title: 'Demo Scheduling Flow', scenario: 'Schedule product demo.', steps: ['Customer asks for demo', 'AI confirms interest', 'Provides Calendly link', 'Customer books slot', 'Webhook confirms booking', 'AI sends prep materials'] },
    troubleshooting: [
      { error: 'Invalid token', cause: 'Token expired or revoked.', solution: 'Generate new personal access token.' },
      { error: 'Event type not found', cause: 'Wrong event type slug.', solution: 'Verify event type from scheduling page URL.' },
      { error: 'No access', cause: 'API access requires Professional plan.', solution: 'Upgrade to Calendly Professional or higher.' },
    ],
    bestPractices: ['Create specific event types for different purposes', 'Set buffer times between meetings', 'Use custom questions to gather info', 'Set up reminders', 'Integrate with your calendar'],
    faq: [
      { question: 'Is API access free?', answer: 'API requires Calendly Professional ($12/mo) or higher.' },
      { question: 'Can I create one-off links?', answer: 'Yes, use single-use links for specific invitees.' },
      { question: 'What about time zones?', answer: 'Calendly automatically handles time zone conversion.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LINEAR
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'linear',
    name: 'Linear',
    icon: '⚡',
    category: 'productivity',
    shortDescription: 'Manage Linear issues and projects',
    overview: {
      what: 'Linear integration connects your AI agent to Linear for modern, streamlined issue tracking.',
      why: 'Linear is built for speed. Fast, keyboard-driven issue tracking loved by modern software teams.',
      useCases: ['Issue tracking', 'Bug reports', 'Feature requests', 'Sprint planning', 'Roadmap updates', 'Engineering workflows'],
      targetAudience: 'Software teams using Linear for issue tracking and project management.',
    },
    prerequisites: {
      accounts: ['Linear account'],
      permissions: ['Personal API key'],
      preparations: ['Generate API key', 'Note team and project keys'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Linear Settings', description: 'Click avatar → Settings in Linear.', screenshot: 'Linear – Settings' },
      { step: 2, title: 'Navigate to API', description: 'Click "API" under Account.', screenshot: 'Linear – API Section' },
      { step: 3, title: 'Create Personal API Key', description: 'Click "Create key" under Personal API keys.', screenshot: 'Linear – Create Key' },
      { step: 4, title: 'Copy Key', description: 'Name and create key, then copy it.', screenshot: 'Linear – Copy Key' },
      { step: 5, title: 'Get Team ID', description: 'Team key is in URLs (e.g., APP for APP-123).', screenshot: 'Linear – Team Key', tip: 'Or query teams via GraphQL API.' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Linear. Enter API key and team ID.', screenshot: 'AgentForge – Linear Form' },
    ],
    triggers: [
      { id: 'issue_created', name: 'Issue Created', description: 'Fires when new issue is created.', whenItFires: 'When issue added to team.', exampleScenario: 'Acknowledge bug report to customer.', dataProvided: ['Issue ID', 'Title', 'State', 'Priority', 'Assignee'] },
      { id: 'issue_updated', name: 'Issue Updated', description: 'Fires when issue is modified.', whenItFires: 'When issue fields change.', exampleScenario: 'Notify when bug is fixed.', dataProvided: ['Issue ID', 'Changed fields'] },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', description: 'Create a new Linear issue.', whenToUse: 'To log bugs or features.', requiredFields: ['Team ID', 'Title'], optionalFields: ['Description', 'Priority', 'Assignee', 'State'], example: 'Create high priority bug issue.' },
      { id: 'update_issue', name: 'Update Issue', description: 'Update an existing issue.', whenToUse: 'To modify issue.', requiredFields: ['Issue ID'], optionalFields: ['State', 'Priority', 'Assignee'], example: 'Move issue to "In Progress".' },
      { id: 'add_comment', name: 'Add Comment', description: 'Comment on issue.', whenToUse: 'To add context.', requiredFields: ['Issue ID', 'Body'], example: 'Add customer feedback.' },
    ],
    exampleFlow: { title: 'Feature Request Flow', scenario: 'Capture feature requests.', steps: ['Customer suggests feature', 'AI validates and categorizes', 'Linear action creates issue', 'Issue added to backlog', 'PM reviews and prioritizes'] },
    troubleshooting: [
      { error: 'Invalid API key', cause: 'Key revoked or incorrect.', solution: 'Generate new API key.' },
      { error: 'Team not found', cause: 'Wrong team ID.', solution: 'Verify team key from issue identifiers.' },
      { error: 'Permission denied', cause: 'Key lacks required access.', solution: 'Ensure key has write permissions.' },
    ],
    bestPractices: ['Use labels for categorization', 'Set priorities consistently', 'Link related issues', 'Use cycles for sprints', 'Keep issues focused and small'],
    faq: [
      { question: 'Is Linear free?', answer: 'Free for small teams. Paid for larger teams and features.' },
      { question: 'GraphQL or REST?', answer: 'Linear uses GraphQL API exclusively.' },
      { question: 'What states exist?', answer: 'Backlog, Todo, In Progress, Done, Canceled (customizable).' },
    ],
  },
];
