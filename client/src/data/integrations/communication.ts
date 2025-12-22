import { Integration } from './types';

export const slackIntegration: Integration = {
  id: 'slack',
  name: 'Slack',
  description: 'Use the Slack node to send messages, manage channels, upload files, and interact with your Slack workspace. n8n has built-in support for posting messages, creating channels, managing users, and handling Slack events via webhooks.',
  shortDescription: 'Send messages and manage Slack workspaces',
  category: 'communication',
  icon: 'slack',
  color: '#4A154B',
  website: 'https://slack.com',
  documentationUrl: 'https://api.slack.com/docs',

  features: [
    'Send messages to channels and users',
    'Create and manage channels',
    'Upload and share files',
    'React to messages with emoji',
    'Create threaded conversations',
    'Set channel topics and purposes',
    'Invite users to channels',
    'Receive real-time events via webhooks',
  ],

  useCases: [
    'Team notifications and alerts',
    'Automated status updates',
    'Error and monitoring alerts',
    'Daily standups and reports',
    'Customer inquiry routing',
    'CI/CD pipeline notifications',
    'Support ticket escalation',
    'Cross-team collaboration workflows',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create a Slack App',
      description: 'Go to api.slack.com/apps and click "Create New App". Choose "From scratch" and enter your app name.',
    },
    {
      step: 2,
      title: 'Configure OAuth Scopes',
      description: 'In OAuth & Permissions, add the required Bot Token Scopes: chat:write, channels:read, users:read, files:write.',
      note: 'Add more scopes based on the features you need.',
    },
    {
      step: 3,
      title: 'Install App to Workspace',
      description: 'Click "Install to Workspace" and authorize the app. Copy the Bot User OAuth Token.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Go to Integrations > Slack and paste your Bot User OAuth Token.',
    },
    {
      step: 5,
      title: 'Enable Event Subscriptions (Optional)',
      description: 'To receive real-time messages, enable Event Subscriptions and add the webhook URL from AgentForge.',
    },
    {
      step: 6,
      title: 'Invite Bot to Channels',
      description: 'In Slack, invite your bot to channels where you want it to send messages using /invite @your-bot-name.',
    },
  ],
  requiredScopes: [
    'chat:write',
    'channels:read',
    'channels:history',
    'users:read',
    'files:write',
    'reactions:write',
  ],

  operations: [
    {
      name: 'Send Message',
      description: 'Post a message to a channel or direct message',
      fields: [
        { name: 'channel', type: 'string', required: true, description: 'Channel ID or name (e.g., #general or C1234567890)' },
        { name: 'text', type: 'string', required: true, description: 'Message text (supports Slack markdown)' },
        { name: 'blocks', type: 'json', required: false, description: 'Block Kit blocks for rich formatting' },
        { name: 'thread_ts', type: 'string', required: false, description: 'Thread timestamp to reply in a thread' },
        { name: 'unfurl_links', type: 'boolean', required: false, description: 'Enable link previews' },
      ],
    },
    {
      name: 'Upload File',
      description: 'Upload a file to a Slack channel',
      fields: [
        { name: 'channels', type: 'string', required: true, description: 'Comma-separated channel IDs' },
        { name: 'file', type: 'binary', required: true, description: 'File content to upload' },
        { name: 'filename', type: 'string', required: false, description: 'Name for the file' },
        { name: 'title', type: 'string', required: false, description: 'Title of the file' },
        { name: 'initial_comment', type: 'string', required: false, description: 'Message to include with the file' },
      ],
    },
    {
      name: 'Create Channel',
      description: 'Create a new public or private channel',
      fields: [
        { name: 'name', type: 'string', required: true, description: 'Channel name (lowercase, no spaces)' },
        { name: 'is_private', type: 'boolean', required: false, description: 'Create as private channel' },
        { name: 'description', type: 'string', required: false, description: 'Channel description' },
      ],
    },
    {
      name: 'Add Reaction',
      description: 'Add an emoji reaction to a message',
      fields: [
        { name: 'channel', type: 'string', required: true, description: 'Channel containing the message' },
        { name: 'timestamp', type: 'string', required: true, description: 'Message timestamp' },
        { name: 'emoji', type: 'string', required: true, description: 'Emoji name without colons (e.g., thumbsup)' },
      ],
    },
    {
      name: 'Get User Info',
      description: 'Retrieve information about a Slack user',
      fields: [
        { name: 'user_id', type: 'string', required: true, description: 'Slack user ID (e.g., U1234567890)' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Message Received',
      description: 'Triggers when a new message is posted in a channel',
      when: 'Any message is sent to a channel the bot is in',
      outputFields: ['channel', 'user', 'text', 'ts', 'thread_ts', 'attachments'],
    },
    {
      name: 'Reaction Added',
      description: 'Triggers when someone reacts to a message',
      when: 'An emoji reaction is added to any message',
      outputFields: ['user', 'reaction', 'item_channel', 'item_ts'],
    },
    {
      name: 'App Mention',
      description: 'Triggers when your app is mentioned',
      when: 'Someone mentions your bot with @',
      outputFields: ['channel', 'user', 'text', 'ts'],
    },
    {
      name: 'Channel Created',
      description: 'Triggers when a new channel is created',
      when: 'A new public or private channel is created',
      outputFields: ['channel_id', 'channel_name', 'creator'],
    },
  ],

  actions: [
    {
      name: 'Post Message',
      description: 'Send a message to a channel or user',
      inputFields: ['channel', 'text', 'blocks'],
      outputFields: ['ok', 'channel', 'ts', 'message'],
    },
    {
      name: 'Update Message',
      description: 'Edit an existing message',
      inputFields: ['channel', 'ts', 'text'],
      outputFields: ['ok', 'channel', 'ts'],
    },
    {
      name: 'Delete Message',
      description: 'Remove a message from a channel',
      inputFields: ['channel', 'ts'],
      outputFields: ['ok'],
    },
    {
      name: 'Set Channel Topic',
      description: 'Update a channel\'s topic',
      inputFields: ['channel', 'topic'],
      outputFields: ['ok'],
    },
  ],

  examples: [
    {
      title: 'Error Alert Notification',
      description: 'Send formatted error alerts to a monitoring channel',
      steps: [
        'Trigger: Error detected in application',
        'Format error details into Slack Block Kit message',
        'Post to #alerts channel with severity emoji',
        'Add link to error details dashboard',
      ],
      code: `{
  "channel": "#alerts",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "🚨 Error Alert"
      }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Service:*\\n{{service}}" },
        { "type": "mrkdwn", "text": "*Severity:*\\n{{severity}}" }
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Error:* {{error_message}}"
      }
    }
  ]
}`,
    },
    {
      title: 'Daily Standup Report',
      description: 'Automatically post a daily summary to your team channel',
      steps: [
        'Trigger: Scheduled at 9 AM daily',
        'Fetch open tasks from project management tool',
        'Compile summary of completed and pending items',
        'Post formatted report to #team-standup',
      ],
    },
    {
      title: 'Customer Inquiry Router',
      description: 'Route customer inquiries to the right team',
      steps: [
        'Trigger: New message in #customer-inquiries',
        'Analyze message content with AI',
        'Determine appropriate team (sales, support, billing)',
        'Forward to relevant channel with customer context',
        'Add reaction to original message indicating routing',
      ],
    },
  ],

  commonIssues: [
    {
      problem: 'Message not appearing in channel',
      cause: 'Bot is not a member of the channel.',
      solution: 'Invite the bot to the channel using /invite @bot-name or add it via channel settings.',
    },
    {
      problem: 'channel_not_found error',
      cause: 'Using channel name instead of ID, or channel doesn\'t exist.',
      solution: 'Use the channel ID (starts with C) instead of the name. Find IDs in channel details.',
    },
    {
      problem: 'missing_scope error',
      cause: 'App doesn\'t have required OAuth scopes.',
      solution: 'Add the required scope in Slack App settings and reinstall the app to your workspace.',
    },
    {
      problem: 'Rate limited (429 error)',
      cause: 'Too many API requests in a short period.',
      solution: 'Implement exponential backoff. Slack allows ~1 request per second for most methods.',
    },
  ],

  relatedIntegrations: ['discord', 'microsoft-teams', 'telegram'],
  externalResources: [
    { title: 'Slack API Documentation', url: 'https://api.slack.com/docs' },
    { title: 'Block Kit Builder', url: 'https://app.slack.com/block-kit-builder' },
    { title: 'OAuth Scopes Reference', url: 'https://api.slack.com/scopes' },
  ],
};

export const telegramIntegration: Integration = {
  id: 'telegram',
  name: 'Telegram',
  description: 'Use the Telegram node to send messages, photos, documents, and manage Telegram bots. n8n supports all major Telegram Bot API features including inline keyboards, message editing, and group management.',
  shortDescription: 'Build Telegram bots and send messages',
  category: 'communication',
  icon: 'telegram',
  color: '#0088cc',
  website: 'https://telegram.org',
  documentationUrl: 'https://core.telegram.org/bots/api',

  features: [
    'Send text messages with formatting',
    'Share photos, documents, and media',
    'Create inline and reply keyboards',
    'Edit and delete messages',
    'Manage groups and channels',
    'Send locations and contacts',
    'Create polls and quizzes',
    'Handle callback queries',
  ],

  useCases: [
    'Customer notification bots',
    'Team alerting systems',
    'Content publishing to channels',
    'Interactive support bots',
    'News and update broadcasting',
    'Personal automation assistants',
    'Group moderation bots',
    'E-commerce order tracking',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Start Chat with BotFather',
      description: 'Open Telegram and search for @BotFather. Start a chat with the official bot.',
    },
    {
      step: 2,
      title: 'Create a New Bot',
      description: 'Send /newbot command and follow the prompts. Choose a name and username for your bot.',
      note: 'Bot usernames must end with "bot" (e.g., mycompany_bot)',
    },
    {
      step: 3,
      title: 'Copy the Bot Token',
      description: 'BotFather will provide an API token. Copy this token securely.',
      note: 'Keep this token secret! Anyone with the token can control your bot.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Go to Integrations > Telegram and paste your bot token.',
    },
    {
      step: 5,
      title: 'Set Up Webhook',
      description: 'The webhook will be automatically configured when you save the integration.',
    },
    {
      step: 6,
      title: 'Test Your Bot',
      description: 'Find your bot on Telegram and send a message to verify it\'s working.',
    },
  ],

  operations: [
    {
      name: 'Send Message',
      description: 'Send a text message to a chat',
      fields: [
        { name: 'chat_id', type: 'string', required: true, description: 'Chat ID or @username' },
        { name: 'text', type: 'string', required: true, description: 'Message text (max 4096 chars)' },
        { name: 'parse_mode', type: 'select', required: false, description: 'Formatting: HTML or Markdown' },
        { name: 'reply_markup', type: 'json', required: false, description: 'Inline keyboard or reply keyboard' },
      ],
    },
    {
      name: 'Send Photo',
      description: 'Send a photo to a chat',
      fields: [
        { name: 'chat_id', type: 'string', required: true, description: 'Chat ID or @username' },
        { name: 'photo', type: 'string', required: true, description: 'Photo URL or file_id' },
        { name: 'caption', type: 'string', required: false, description: 'Photo caption' },
      ],
    },
    {
      name: 'Send Document',
      description: 'Send a document file to a chat',
      fields: [
        { name: 'chat_id', type: 'string', required: true, description: 'Chat ID' },
        { name: 'document', type: 'string', required: true, description: 'Document URL or file_id' },
        { name: 'caption', type: 'string', required: false, description: 'Document caption' },
      ],
    },
    {
      name: 'Edit Message',
      description: 'Edit an existing message',
      fields: [
        { name: 'chat_id', type: 'string', required: true, description: 'Chat ID' },
        { name: 'message_id', type: 'number', required: true, description: 'Message ID to edit' },
        { name: 'text', type: 'string', required: true, description: 'New message text' },
      ],
    },
    {
      name: 'Answer Callback Query',
      description: 'Respond to an inline keyboard button press',
      fields: [
        { name: 'callback_query_id', type: 'string', required: true, description: 'Callback query ID' },
        { name: 'text', type: 'string', required: false, description: 'Notification text' },
        { name: 'show_alert', type: 'boolean', required: false, description: 'Show as alert popup' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Message Received',
      description: 'Triggers when the bot receives a message',
      when: 'Any message is sent to the bot or a group where bot is admin',
      outputFields: ['message_id', 'from', 'chat', 'date', 'text'],
    },
    {
      name: 'Callback Query',
      description: 'Triggers when an inline keyboard button is pressed',
      when: 'User clicks an inline keyboard button',
      outputFields: ['id', 'from', 'message', 'data'],
    },
    {
      name: 'New Chat Member',
      description: 'Triggers when someone joins a group',
      when: 'New member is added to a group where bot is admin',
      outputFields: ['new_chat_members', 'chat', 'from'],
    },
  ],

  actions: [
    {
      name: 'Send Message',
      description: 'Send text or media message',
      inputFields: ['chat_id', 'text', 'parse_mode'],
      outputFields: ['message_id', 'chat', 'date'],
    },
    {
      name: 'Delete Message',
      description: 'Delete a message from a chat',
      inputFields: ['chat_id', 'message_id'],
      outputFields: ['ok'],
    },
    {
      name: 'Get Chat',
      description: 'Get information about a chat',
      inputFields: ['chat_id'],
      outputFields: ['id', 'type', 'title', 'username'],
    },
  ],

  examples: [
    {
      title: 'Interactive Menu Bot',
      description: 'Create a bot with inline keyboard navigation',
      steps: [
        'User sends /start command',
        'Bot responds with welcome message and inline keyboard',
        'Handle button callbacks to show different menus',
        'Update message with new content based on selection',
      ],
      code: `{
  "chat_id": "{{chat_id}}",
  "text": "Welcome! Choose an option:",
  "reply_markup": {
    "inline_keyboard": [
      [
        { "text": "📦 Orders", "callback_data": "orders" },
        { "text": "❓ Help", "callback_data": "help" }
      ],
      [
        { "text": "📞 Contact Us", "callback_data": "contact" }
      ]
    ]
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Bot not receiving messages',
      cause: 'Webhook not configured or bot privacy mode enabled.',
      solution: 'Verify webhook is set. For groups, disable privacy mode with BotFather using /setprivacy.',
    },
    {
      problem: 'Can\'t send messages to user',
      cause: 'User hasn\'t started a conversation with the bot.',
      solution: 'Users must /start the bot first. Bots cannot initiate conversations.',
    },
    {
      problem: 'Message too long error',
      cause: 'Text exceeds 4096 character limit.',
      solution: 'Split long messages into multiple parts or use a document for large content.',
    },
  ],

  relatedIntegrations: ['whatsapp', 'slack', 'discord'],
  externalResources: [
    { title: 'Telegram Bot API', url: 'https://core.telegram.org/bots/api' },
    { title: 'Bot Development Guide', url: 'https://core.telegram.org/bots' },
  ],
};

export const discordIntegration: Integration = {
  id: 'discord',
  name: 'Discord',
  description: 'Use the Discord node to send messages, manage servers, and interact with Discord channels. n8n supports webhooks, bot messaging, channel management, and rich embeds.',
  shortDescription: 'Send messages and manage Discord servers',
  category: 'communication',
  icon: 'discord',
  color: '#5865F2',
  website: 'https://discord.com',
  documentationUrl: 'https://discord.com/developers/docs',

  features: [
    'Send messages via webhooks or bot',
    'Create rich embed messages',
    'Manage channels and roles',
    'Moderate server members',
    'React to messages',
    'Create threaded discussions',
    'Send direct messages',
    'Handle Discord events',
  ],

  useCases: [
    'Community notifications',
    'Server moderation automation',
    'Gaming community updates',
    'Team collaboration',
    'Event announcements',
    'Support ticket creation',
    'Streaming alerts',
    'Welcome messages for new members',
  ],

  credentialType: 'custom',
  credentialSteps: [
    {
      step: 1,
      title: 'Create a Discord Application',
      description: 'Go to discord.com/developers/applications and click "New Application".',
    },
    {
      step: 2,
      title: 'Create a Bot',
      description: 'In your application, go to "Bot" section and click "Add Bot".',
    },
    {
      step: 3,
      title: 'Copy Bot Token',
      description: 'Click "Reset Token" to generate a new token. Copy and save it securely.',
      note: 'This token is only shown once. Store it safely.',
    },
    {
      step: 4,
      title: 'Set Bot Permissions',
      description: 'In OAuth2 > URL Generator, select "bot" scope and required permissions.',
    },
    {
      step: 5,
      title: 'Invite Bot to Server',
      description: 'Use the generated URL to invite the bot to your Discord server.',
    },
    {
      step: 6,
      title: 'Configure in AgentForge',
      description: 'Enter your bot token in Integrations > Discord.',
    },
  ],

  operations: [
    {
      name: 'Send Message',
      description: 'Send a message to a Discord channel',
      fields: [
        { name: 'channel_id', type: 'string', required: true, description: 'Discord channel ID' },
        { name: 'content', type: 'string', required: false, description: 'Message content' },
        { name: 'embeds', type: 'json', required: false, description: 'Array of embed objects' },
      ],
    },
    {
      name: 'Send Webhook Message',
      description: 'Send a message via webhook URL',
      fields: [
        { name: 'webhook_url', type: 'string', required: true, description: 'Discord webhook URL' },
        { name: 'content', type: 'string', required: false, description: 'Message content' },
        { name: 'username', type: 'string', required: false, description: 'Override webhook username' },
        { name: 'avatar_url', type: 'string', required: false, description: 'Override avatar URL' },
      ],
    },
    {
      name: 'Create Channel',
      description: 'Create a new channel in a server',
      fields: [
        { name: 'guild_id', type: 'string', required: true, description: 'Server ID' },
        { name: 'name', type: 'string', required: true, description: 'Channel name' },
        { name: 'type', type: 'select', required: true, description: 'Channel type: text, voice, category' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Message Created',
      description: 'Triggers when a message is sent in a channel',
      when: 'New message in any channel the bot can see',
      outputFields: ['id', 'content', 'author', 'channel_id', 'guild_id'],
    },
    {
      name: 'Member Joined',
      description: 'Triggers when a new member joins the server',
      when: 'User joins a server where the bot is present',
      outputFields: ['user', 'guild_id', 'joined_at'],
    },
    {
      name: 'Reaction Added',
      description: 'Triggers when a reaction is added to a message',
      when: 'Any reaction is added to a message',
      outputFields: ['user_id', 'channel_id', 'message_id', 'emoji'],
    },
  ],

  actions: [
    {
      name: 'Send Message',
      description: 'Send a message to a channel',
      inputFields: ['channel_id', 'content', 'embeds'],
      outputFields: ['id', 'channel_id', 'content'],
    },
    {
      name: 'Add Reaction',
      description: 'Add a reaction to a message',
      inputFields: ['channel_id', 'message_id', 'emoji'],
      outputFields: ['ok'],
    },
    {
      name: 'Ban Member',
      description: 'Ban a member from the server',
      inputFields: ['guild_id', 'user_id', 'reason'],
      outputFields: ['ok'],
    },
  ],

  examples: [
    {
      title: 'Welcome New Members',
      description: 'Automatically welcome new members with a custom embed',
      steps: [
        'Trigger: Member joins server',
        'Create welcome embed with member info',
        'Post to #welcome channel',
        'Assign default role to new member',
      ],
    },
  ],

  commonIssues: [
    {
      problem: 'Bot appears offline',
      cause: 'Bot not properly initialized or missing gateway intents.',
      solution: 'Enable required intents in Discord Developer Portal under Bot settings.',
    },
    {
      problem: 'Missing permissions error',
      cause: 'Bot doesn\'t have required permissions in the channel.',
      solution: 'Check bot role permissions and channel-specific permission overrides.',
    },
  ],

  relatedIntegrations: ['slack', 'telegram', 'microsoft-teams'],
  externalResources: [
    { title: 'Discord Developer Portal', url: 'https://discord.com/developers/docs' },
    { title: 'Embed Visualizer', url: 'https://discohook.org/' },
  ],
};
