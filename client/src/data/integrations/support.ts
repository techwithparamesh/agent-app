import type { Integration } from './types';

// Additional Communication & Support Integrations

export const zendeskIntegration: Integration = {
  id: 'zendesk',
  name: 'Zendesk',
  description: 'Use the Zendesk node to manage tickets, users, and organizations. n8n supports complete helpdesk automation.',
  shortDescription: 'Customer support platform',
  category: 'communication',
  icon: 'zendesk',
  color: '#03363D',
  website: 'https://zendesk.com',
  documentationUrl: 'https://developer.zendesk.com',

  features: [
    'Ticket management',
    'User management',
    'Organization management',
    'Macros and triggers',
    'Custom fields',
    'Ticket comments',
    'Tags and priorities',
    'SLA management',
  ],

  useCases: [
    'Support ticket automation',
    'Customer onboarding',
    'Escalation workflows',
    'SLA monitoring',
    'Ticket routing',
    'Customer feedback',
    'Knowledge base sync',
    'Multi-channel support',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Subdomain',
      description: 'Note your Zendesk subdomain (yourcompany.zendesk.com).',
    },
    {
      step: 2,
      title: 'Create API Token',
      description: 'Go to Admin > Channels > API and create a token.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter subdomain, email, and API token.',
    },
  ],

  operations: [
    {
      name: 'Create Ticket',
      description: 'Create a new support ticket',
      fields: [
        { name: 'subject', type: 'string', required: true, description: 'Ticket subject' },
        { name: 'description', type: 'string', required: true, description: 'Ticket description' },
        { name: 'requester_email', type: 'string', required: true, description: 'Requester email' },
        { name: 'priority', type: 'select', required: false, description: 'low, normal, high, urgent' },
        { name: 'tags', type: 'array', required: false, description: 'Ticket tags' },
      ],
    },
    {
      name: 'Update Ticket',
      description: 'Update an existing ticket',
      fields: [
        { name: 'ticket_id', type: 'number', required: true, description: 'Ticket ID' },
        { name: 'status', type: 'select', required: false, description: 'new, open, pending, solved, closed' },
        { name: 'assignee_id', type: 'number', required: false, description: 'Assignee user ID' },
        { name: 'comment', type: 'string', required: false, description: 'Add comment' },
      ],
    },
    {
      name: 'Search Tickets',
      description: 'Search tickets with query',
      fields: [
        { name: 'query', type: 'string', required: true, description: 'Search query' },
        { name: 'sort_by', type: 'string', required: false, description: 'Sort field' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Ticket Created',
      description: 'Triggers when a new ticket is created',
      when: 'New ticket via any channel',
      outputFields: ['id', 'subject', 'status', 'requester', 'assignee'],
    },
    {
      name: 'Ticket Updated',
      description: 'Triggers when a ticket is updated',
      when: 'Ticket field changes',
      outputFields: ['id', 'subject', 'status', 'updated_at'],
    },
  ],

  actions: [
    {
      name: 'Add Comment',
      description: 'Add internal or public comment',
      inputFields: ['ticket_id', 'body', 'public'],
      outputFields: ['id', 'author_id'],
    },
  ],

  examples: [
    {
      title: 'Auto-Route High Priority',
      description: 'Route urgent tickets to senior agents',
      steps: [
        'Trigger: Ticket created with priority=urgent',
        'Get available senior agents',
        'Assign to agent with lowest load',
        'Send Slack alert to team',
      ],
      code: `{
  "ticket": {
    "id": {{ticket.id}},
    "assignee_id": {{senior_agent.id}},
    "tags": ["urgent", "auto-routed"],
    "comment": {
      "body": "Auto-assigned to {{senior_agent.name}} due to urgent priority.",
      "public": false
    }
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Authentication failed',
      cause: 'API token format incorrect.',
      solution: 'Use email/token format: email@company.com/token:API_TOKEN',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'Too many API requests.',
      solution: 'Implement request throttling (700 requests/minute).',
    },
  ],

  relatedIntegrations: ['intercom', 'freshdesk', 'slack'],
  externalResources: [
    { title: 'Zendesk API Reference', url: 'https://developer.zendesk.com/api-reference/' },
  ],
};

export const freshdeskIntegration: Integration = {
  id: 'freshdesk',
  name: 'Freshdesk',
  description: 'Use the Freshdesk node to manage tickets, contacts, and companies. n8n supports helpdesk automation and customer support.',
  shortDescription: 'Cloud-based helpdesk',
  category: 'communication',
  icon: 'freshdesk',
  color: '#25C16F',
  website: 'https://freshdesk.com',
  documentationUrl: 'https://developers.freshdesk.com',

  features: [
    'Ticket management',
    'Contact management',
    'Company management',
    'Canned responses',
    'Automations',
    'SLA policies',
    'Time tracking',
    'Satisfaction surveys',
  ],

  useCases: [
    'Support ticketing',
    'Customer management',
    'SLA tracking',
    'Team collaboration',
    'Knowledge base',
    'Multi-channel support',
    'Customer satisfaction',
    'Helpdesk analytics',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Domain',
      description: 'Note your Freshdesk domain (yourcompany.freshdesk.com).',
    },
    {
      step: 2,
      title: 'Get API Key',
      description: 'Go to Profile Settings and copy your API key.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter domain and API key.',
    },
  ],

  operations: [
    {
      name: 'Create Ticket',
      description: 'Create a new ticket',
      fields: [
        { name: 'subject', type: 'string', required: true, description: 'Ticket subject' },
        { name: 'description', type: 'string', required: true, description: 'Ticket description' },
        { name: 'email', type: 'string', required: true, description: 'Requester email' },
        { name: 'priority', type: 'number', required: false, description: '1=Low, 2=Medium, 3=High, 4=Urgent' },
        { name: 'status', type: 'number', required: false, description: '2=Open, 3=Pending, 4=Resolved, 5=Closed' },
      ],
    },
    {
      name: 'Update Ticket',
      description: 'Update ticket properties',
      fields: [
        { name: 'ticket_id', type: 'number', required: true, description: 'Ticket ID' },
        { name: 'status', type: 'number', required: false, description: 'New status' },
        { name: 'priority', type: 'number', required: false, description: 'New priority' },
        { name: 'agent_id', type: 'number', required: false, description: 'Assign to agent' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Ticket Created',
      description: 'Triggers on new ticket',
      when: 'New ticket created',
      outputFields: ['id', 'subject', 'description', 'requester_id'],
    },
    {
      name: 'Ticket Updated',
      description: 'Triggers on ticket update',
      when: 'Ticket property changes',
      outputFields: ['id', 'changes'],
    },
  ],

  actions: [
    {
      name: 'Reply to Ticket',
      description: 'Add reply to ticket',
      inputFields: ['ticket_id', 'body'],
      outputFields: ['id', 'created_at'],
    },
  ],

  examples: [
    {
      title: 'Auto-Response for Common Issues',
      description: 'Send automatic responses based on keywords',
      steps: [
        'Trigger: New ticket created',
        'Analyze subject and description',
        'Match against FAQ categories',
        'Send relevant KB article link',
      ],
      code: `{
  "body": "Hi {{ticket.requester_name}},\\n\\nThank you for reaching out! Based on your inquiry, this article might help:\\n\\n{{matched_article.title}}\\n{{matched_article.url}}\\n\\nIf this doesn't resolve your issue, we'll have an agent follow up shortly.",
  "private": false
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Invalid API key',
      cause: 'Key regenerated or wrong format.',
      solution: 'Regenerate API key from Profile Settings.',
    },
  ],

  relatedIntegrations: ['zendesk', 'intercom'],
  externalResources: [
    { title: 'Freshdesk API', url: 'https://developers.freshdesk.com/api/' },
  ],
};

export const microsoftTeamsIntegration: Integration = {
  id: 'microsoft-teams',
  name: 'Microsoft Teams',
  description: 'Use the Microsoft Teams node to send messages, manage channels, and handle team collaboration. n8n supports chat, channels, and meetings.',
  shortDescription: 'Team collaboration and chat',
  category: 'communication',
  icon: 'microsoft-teams',
  color: '#6264A7',
  website: 'https://teams.microsoft.com',
  documentationUrl: 'https://docs.microsoft.com/graph/teams-concept-overview',

  features: [
    'Send messages',
    'Channel management',
    'Team management',
    'Meeting scheduling',
    'File sharing',
    'Adaptive cards',
    'Mentions',
    'Reactions',
  ],

  useCases: [
    'Team notifications',
    'Approval workflows',
    'Status updates',
    'Meeting automation',
    'Alert systems',
    'Bot messages',
    'Channel posts',
    'Collaboration',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Register Azure App',
      description: 'Go to Azure Portal > App registrations and create a new app.',
    },
    {
      step: 2,
      title: 'Configure Permissions',
      description: 'Add Microsoft Graph permissions for Teams.',
    },
    {
      step: 3,
      title: 'Create Client Secret',
      description: 'Generate a client secret.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter tenant ID, client ID, and secret.',
    },
  ],

  operations: [
    {
      name: 'Send Message',
      description: 'Send message to channel or chat',
      fields: [
        { name: 'team_id', type: 'string', required: true, description: 'Team ID' },
        { name: 'channel_id', type: 'string', required: true, description: 'Channel ID' },
        { name: 'content', type: 'string', required: true, description: 'Message content' },
        { name: 'content_type', type: 'select', required: false, description: 'text or html' },
      ],
    },
    {
      name: 'Create Channel',
      description: 'Create a new channel',
      fields: [
        { name: 'team_id', type: 'string', required: true, description: 'Team ID' },
        { name: 'name', type: 'string', required: true, description: 'Channel name' },
        { name: 'description', type: 'string', required: false, description: 'Channel description' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Message Received',
      description: 'Triggers on new message',
      when: 'Message posted in channel',
      outputFields: ['id', 'content', 'from', 'channelIdentity'],
    },
  ],

  actions: [
    {
      name: 'Post Card',
      description: 'Send an Adaptive Card',
      inputFields: ['channel_id', 'card'],
      outputFields: ['id'],
    },
  ],

  examples: [
    {
      title: 'Deployment Notification',
      description: 'Notify team of deployments',
      steps: [
        'Trigger: Deployment completed',
        'Format deployment info',
        'Send rich card to DevOps channel',
        'Include action buttons',
      ],
      code: `{
  "contentType": "html",
  "content": "<b>🚀 Deployment Complete</b><br><br>Version: {{deployment.version}}<br>Environment: {{deployment.env}}<br>Status: ✅ Success<br><br><a href='{{deployment.url}}'>View Details</a>"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Insufficient permissions',
      cause: 'Missing Graph API permissions.',
      solution: 'Add ChannelMessage.Send and Team.ReadBasic.All permissions.',
    },
  ],

  relatedIntegrations: ['slack', 'discord'],
  externalResources: [
    { title: 'Teams Graph API', url: 'https://docs.microsoft.com/graph/api/resources/teams-api-overview' },
  ],
};

export const zoomIntegration: Integration = {
  id: 'zoom',
  name: 'Zoom',
  description: 'Use the Zoom node to create and manage meetings, webinars, and recordings. n8n supports full meeting lifecycle management.',
  shortDescription: 'Video meetings and webinars',
  category: 'communication',
  icon: 'zoom',
  color: '#2D8CFF',
  website: 'https://zoom.us',
  documentationUrl: 'https://marketplace.zoom.us/docs/api-reference/introduction',

  features: [
    'Create meetings',
    'Schedule webinars',
    'Manage participants',
    'Recording access',
    'Meeting reports',
    'Waiting room',
    'Breakout rooms',
    'Registration',
  ],

  useCases: [
    'Meeting scheduling',
    'Webinar automation',
    'Training sessions',
    'Client meetings',
    'Team standups',
    'Interview scheduling',
    'Event registration',
    'Recording management',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Zoom App',
      description: 'Go to marketplace.zoom.us and create an OAuth app.',
    },
    {
      step: 2,
      title: 'Configure Scopes',
      description: 'Add required scopes for meetings, users, etc.',
    },
    {
      step: 3,
      title: 'Get Credentials',
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
      name: 'Create Meeting',
      description: 'Schedule a new meeting',
      fields: [
        { name: 'topic', type: 'string', required: true, description: 'Meeting topic' },
        { name: 'start_time', type: 'datetime', required: true, description: 'Start time (ISO 8601)' },
        { name: 'duration', type: 'number', required: true, description: 'Duration in minutes' },
        { name: 'timezone', type: 'string', required: false, description: 'Timezone' },
        { name: 'password', type: 'string', required: false, description: 'Meeting password' },
      ],
    },
    {
      name: 'Get Meeting',
      description: 'Get meeting details',
      fields: [
        { name: 'meeting_id', type: 'number', required: true, description: 'Meeting ID' },
      ],
    },
    {
      name: 'List Recordings',
      description: 'Get user\'s cloud recordings',
      fields: [
        { name: 'user_id', type: 'string', required: true, description: 'User ID or email' },
        { name: 'from', type: 'date', required: false, description: 'Start date' },
        { name: 'to', type: 'date', required: false, description: 'End date' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Meeting Started',
      description: 'Triggers when meeting starts',
      when: 'Host starts meeting',
      outputFields: ['id', 'topic', 'host_id', 'start_time'],
    },
    {
      name: 'Meeting Ended',
      description: 'Triggers when meeting ends',
      when: 'Meeting concludes',
      outputFields: ['id', 'topic', 'duration', 'participants_count'],
    },
    {
      name: 'Recording Completed',
      description: 'Triggers when recording is ready',
      when: 'Cloud recording processed',
      outputFields: ['meeting_id', 'recording_files'],
    },
  ],

  actions: [
    {
      name: 'Delete Meeting',
      description: 'Cancel a scheduled meeting',
      inputFields: ['meeting_id'],
      outputFields: ['status'],
    },
  ],

  examples: [
    {
      title: 'Customer Call Scheduler',
      description: 'Auto-create Zoom links for customer calls',
      steps: [
        'Trigger: Call scheduled in CRM',
        'Create Zoom meeting with customer details',
        'Update CRM with meeting link',
        'Send calendar invite',
      ],
      code: `{
  "topic": "Call with {{customer.company}} - {{customer.name}}",
  "type": 2,
  "start_time": "{{call.scheduled_time}}",
  "duration": 30,
  "timezone": "{{customer.timezone}}",
  "settings": {
    "host_video": true,
    "participant_video": true,
    "join_before_host": false,
    "waiting_room": true
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Invalid access token',
      cause: 'Token expired (1 hour lifetime).',
      solution: 'Implement token refresh using refresh_token.',
    },
    {
      problem: 'User not found',
      cause: 'Using wrong user identifier.',
      solution: 'Use "me" for current user or valid email/user_id.',
    },
  ],

  relatedIntegrations: ['google-meet', 'microsoft-teams'],
  externalResources: [
    { title: 'Zoom API Reference', url: 'https://marketplace.zoom.us/docs/api-reference/zoom-api/' },
  ],
};

export const linkedinIntegration: Integration = {
  id: 'linkedin',
  name: 'LinkedIn',
  description: 'Use the LinkedIn node to manage company pages, posts, and engagement. n8n supports marketing and professional networking automation.',
  shortDescription: 'Professional networking',
  category: 'marketing',
  icon: 'linkedin',
  color: '#0A66C2',
  website: 'https://linkedin.com',
  documentationUrl: 'https://docs.microsoft.com/linkedin/',

  features: [
    'Company page posts',
    'Article sharing',
    'Profile management',
    'Connection requests',
    'Message sending',
    'Post analytics',
    'Comment management',
    'Share content',
  ],

  useCases: [
    'Content marketing',
    'Lead generation',
    'Brand awareness',
    'Job posting',
    'Employee advocacy',
    'Social selling',
    'Thought leadership',
    'Company updates',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create LinkedIn App',
      description: 'Go to linkedin.com/developers and create an app.',
    },
    {
      step: 2,
      title: 'Request Products',
      description: 'Request Marketing Developer Platform access.',
    },
    {
      step: 3,
      title: 'Get Credentials',
      description: 'Copy Client ID and Secret.',
    },
    {
      step: 4,
      title: 'Configure OAuth',
      description: 'Set redirect URI and authorize.',
    },
  ],

  operations: [
    {
      name: 'Create Post',
      description: 'Create a post on company page',
      fields: [
        { name: 'organization_id', type: 'string', required: true, description: 'Company page ID' },
        { name: 'text', type: 'string', required: true, description: 'Post text' },
        { name: 'media', type: 'array', required: false, description: 'Media URLs' },
        { name: 'visibility', type: 'select', required: false, description: 'PUBLIC or CONNECTIONS' },
      ],
    },
    {
      name: 'Get Post Analytics',
      description: 'Get engagement metrics',
      fields: [
        { name: 'post_id', type: 'string', required: true, description: 'Post URN' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Post Published',
      description: 'Triggers when post goes live',
      when: 'Post successfully published',
      outputFields: ['id', 'text', 'visibility'],
    },
  ],

  actions: [
    {
      name: 'Share Article',
      description: 'Share an article link',
      inputFields: ['url', 'text'],
      outputFields: ['id'],
    },
  ],

  examples: [
    {
      title: 'Blog Post Promotion',
      description: 'Auto-share blog posts to LinkedIn',
      steps: [
        'Trigger: New blog post published',
        'Extract title, excerpt, and image',
        'Create LinkedIn post with link',
        'Track engagement',
      ],
      code: `{
  "author": "urn:li:organization:{{org_id}}",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "📝 New Blog: {{post.title}}\\n\\n{{post.excerpt}}\\n\\n#{{post.category}} #ContentMarketing"
      },
      "shareMediaCategory": "ARTICLE",
      "media": [{
        "status": "READY",
        "originalUrl": "{{post.url}}"
      }]
    }
  },
  "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Insufficient permissions',
      cause: 'App not approved for Marketing API.',
      solution: 'Apply for Marketing Developer Platform access.',
    },
  ],

  relatedIntegrations: ['facebook-ads', 'twitter'],
  externalResources: [
    { title: 'LinkedIn Marketing API', url: 'https://docs.microsoft.com/linkedin/marketing/' },
  ],
};

export const liveagentIntegration: Integration = {
  id: 'liveagent',
  name: 'LiveAgent',
  description: 'Use the LiveAgent node to manage tickets, live chat, and support workflows. Supports multi-channel customer support automation.',
  shortDescription: 'Help desk and live chat',
  category: 'communication',
  icon: 'liveagent',
  color: '#FF6B35',
  website: 'https://liveagent.com',
  documentationUrl: 'https://www.liveagent.com/api/',

  features: [
    'Ticket management',
    'Live chat',
    'Email ticketing',
    'Call center',
    'Social media integration',
    'Knowledge base',
    'Customer portal',
    'SLA management',
  ],

  useCases: [
    'Customer support',
    'Help desk management',
    'Live chat support',
    'Multi-channel support',
    'Ticket routing',
    'Customer satisfaction',
    'Support analytics',
    'Agent performance',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Access API Settings',
      description: 'Go to Configuration > System > API in LiveAgent.',
    },
    {
      step: 2,
      title: 'Generate API Key',
      description: 'Create a new API key with required permissions.',
    },
    {
      step: 3,
      title: 'Get Domain',
      description: 'Note your LiveAgent domain (yourcompany.ladesk.com).',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter API key and domain.',
    },
  ],

  operations: [
    {
      name: 'Create Ticket',
      description: 'Create a new ticket',
      fields: [
        { name: 'subject', type: 'string', required: true, description: 'Ticket subject' },
        { name: 'message', type: 'string', required: true, description: 'Ticket message' },
        { name: 'email', type: 'string', required: true, description: 'Customer email' },
        { name: 'department_id', type: 'string', required: false, description: 'Department ID' },
      ],
    },
    {
      name: 'Get Ticket',
      description: 'Retrieve ticket details',
      fields: [
        { name: 'ticket_id', type: 'string', required: true, description: 'Ticket ID' },
      ],
    },
    {
      name: 'Add Reply',
      description: 'Add reply to ticket',
      fields: [
        { name: 'ticket_id', type: 'string', required: true, description: 'Ticket ID' },
        { name: 'message', type: 'string', required: true, description: 'Reply message' },
        { name: 'is_note', type: 'boolean', required: false, description: 'Internal note' },
      ],
    },
  ],

  triggers: [
    {
      name: 'New Ticket',
      description: 'Triggers when new ticket is created',
      when: 'Ticket created',
      outputFields: ['ticket_id', 'subject', 'customer_email', 'department'],
    },
    {
      name: 'Chat Started',
      description: 'Triggers when live chat starts',
      when: 'Customer initiates chat',
      outputFields: ['chat_id', 'visitor_name', 'visitor_email', 'department'],
    },
  ],

  actions: [
    {
      name: 'Create Ticket',
      description: 'Create support ticket',
      inputFields: ['subject', 'message', 'email'],
      outputFields: ['ticket_id', 'code'],
    },
  ],

  examples: [
    {
      title: 'Auto-Assign Tickets',
      description: 'Route tickets based on content',
      steps: [
        'Trigger: New ticket created',
        'Analyze ticket subject and content',
        'Determine appropriate department',
        'Assign to available agent',
      ],
      code: `{
  "ticket_id": "{{ticket.id}}",
  "department_id": "{{determineDepartment(ticket.subject)}}",
  "agent_id": "{{getAvailableAgent(department_id)}}",
  "priority": "{{ticket.is_urgent ? 'high' : 'normal'}}"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'API key invalid',
      cause: 'Key expired or revoked.',
      solution: 'Generate new API key in LiveAgent settings.',
    },
  ],

  relatedIntegrations: ['zendesk', 'freshdesk', 'intercom'],
  externalResources: [
    { title: 'LiveAgent API Docs', url: 'https://www.liveagent.com/api/' },
  ],
};

export const helpscoutIntegration: Integration = {
  id: 'helpscout',
  name: 'Help Scout',
  description: 'Use the Help Scout node to manage conversations, customers, and workflows. Perfect for team-based email support automation.',
  shortDescription: 'Shared inbox and help desk',
  category: 'communication',
  icon: 'helpscout',
  color: '#1292EE',
  website: 'https://helpscout.com',
  documentationUrl: 'https://developer.helpscout.com/',

  features: [
    'Conversation management',
    'Customer profiles',
    'Shared inbox',
    'Knowledge base',
    'Workflows',
    'Saved replies',
    'Tags and custom fields',
    'Reports and analytics',
  ],

  useCases: [
    'Email support',
    'Team collaboration',
    'Customer management',
    'Knowledge sharing',
    'Support workflows',
    'Customer satisfaction',
    'Response automation',
    'Help documentation',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Go to API Keys',
      description: 'In Help Scout, go to Your Profile > API Keys.',
    },
    {
      step: 2,
      title: 'Create API Key',
      description: 'Click "Generate an API Key".',
    },
    {
      step: 3,
      title: 'Copy Key',
      description: 'Copy the generated API key.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter API key and mailbox ID.',
    },
  ],

  operations: [
    {
      name: 'Create Conversation',
      description: 'Create a new conversation',
      fields: [
        { name: 'mailbox_id', type: 'string', required: true, description: 'Mailbox ID' },
        { name: 'customer_email', type: 'string', required: true, description: 'Customer email' },
        { name: 'subject', type: 'string', required: true, description: 'Subject line' },
        { name: 'text', type: 'string', required: true, description: 'Message content' },
        { name: 'type', type: 'select', required: false, description: 'email, chat, phone' },
      ],
    },
    {
      name: 'Add Thread',
      description: 'Add reply to conversation',
      fields: [
        { name: 'conversation_id', type: 'string', required: true, description: 'Conversation ID' },
        { name: 'text', type: 'string', required: true, description: 'Reply text' },
        { name: 'type', type: 'select', required: false, description: 'reply, note, forward' },
      ],
    },
    {
      name: 'Update Customer',
      description: 'Update customer profile',
      fields: [
        { name: 'customer_id', type: 'string', required: true, description: 'Customer ID' },
        { name: 'first_name', type: 'string', required: false, description: 'First name' },
        { name: 'last_name', type: 'string', required: false, description: 'Last name' },
        { name: 'company', type: 'string', required: false, description: 'Company name' },
      ],
    },
  ],

  triggers: [
    {
      name: 'New Conversation',
      description: 'Triggers when conversation is created',
      when: 'Customer sends email',
      outputFields: ['conversation_id', 'subject', 'customer', 'mailbox'],
    },
    {
      name: 'Customer Reply',
      description: 'Triggers when customer replies',
      when: 'Reply received',
      outputFields: ['conversation_id', 'thread_id', 'text'],
    },
  ],

  actions: [
    {
      name: 'Create Conversation',
      description: 'Start new conversation',
      inputFields: ['mailbox_id', 'customer_email', 'subject', 'text'],
      outputFields: ['id'],
    },
    {
      name: 'Send Reply',
      description: 'Reply to conversation',
      inputFields: ['conversation_id', 'text'],
      outputFields: ['id'],
    },
  ],

  examples: [
    {
      title: 'Customer Onboarding',
      description: 'Auto-send welcome email for new customers',
      steps: [
        'Trigger: New customer created',
        'Create welcome conversation',
        'Send personalized onboarding message',
        'Tag conversation for follow-up',
      ],
      code: `{
  "mailbox_id": "{{mailbox_id}}",
  "customer": {
    "email": "{{customer.email}}"
  },
  "type": "email",
  "subject": "Welcome to {{company.name}}! 🎉",
  "text": "Hi {{customer.first_name}},\\n\\nWelcome aboard! We're thrilled to have you.\\n\\nHere's what you can do next:\\n1. Complete your profile\\n2. Explore our features\\n3. Check out our help docs\\n\\nQuestions? Just reply to this email!\\n\\nBest,\\n{{agent.name}}",
  "tags": ["onboarding", "new-customer"]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Mailbox not found',
      cause: 'Invalid mailbox ID.',
      solution: 'Get mailbox ID from Help Scout API.',
    },
  ],

  relatedIntegrations: ['zendesk', 'intercom', 'freshdesk'],
  externalResources: [
    { title: 'Help Scout API Docs', url: 'https://developer.helpscout.com/' },
  ],
};
