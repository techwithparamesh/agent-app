/**
 * AppConfigurations - Comprehensive configuration definitions for all apps
 * 
 * Each app has:
 * - Triggers: Events that can start a workflow
 * - Actions: Operations that can be performed
 * - Auth: Authentication methods supported
 * - Fields: Configuration fields for each trigger/action
 */

// ============================================================================
// Types
// ============================================================================

export type FieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean' | 'password' | 'email' | 'url' | 'json' | 'datetime' | 'file';

export interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  default?: string | number | boolean;
  options?: { value: string; label: string; description?: string }[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  dependsOn?: {
    field: string;
    value: string | string[];
  };
}

export interface TriggerConfig {
  id: string;
  name: string;
  description: string;
  icon?: string;
  triggerTypes: ('webhook' | 'poll' | 'schedule' | 'app-event' | 'manual')[];
  defaultTriggerType: 'webhook' | 'poll' | 'schedule' | 'app-event' | 'manual';
  fields: ConfigField[];
  outputSchema?: Record<string, any>;
}

export interface ActionConfig {
  id: string;
  name: string;
  description: string;
  icon?: string;
  fields: ConfigField[];
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export interface AuthConfig {
  type: 'oauth2' | 'api-key' | 'basic' | 'bearer' | 'custom';
  name: string;
  description: string;
  fields?: ConfigField[];
  scopes?: string[];
  oauthUrls?: {
    authorize: string;
    token: string;
  };
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  category: string;
  docsUrl?: string;
  auth: AuthConfig[];
  triggers: TriggerConfig[];
  actions: ActionConfig[];
}

// ============================================================================
// COMMUNICATION APPS
// ============================================================================

export const whatsappConfig: AppConfig = {
  id: 'whatsapp',
  name: 'WhatsApp Business',
  icon: '💬',
  color: '#25D366',
  description: 'Send and receive WhatsApp messages',
  category: 'communication',
  docsUrl: 'https://developers.facebook.com/docs/whatsapp',
  auth: [
    {
      type: 'api-key',
      name: 'WhatsApp Business API',
      description: 'Use your WhatsApp Business API credentials',
      fields: [
        { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true, placeholder: 'Enter your Phone Number ID' },
        { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'Your permanent access token' },
        { key: 'businessAccountId', label: 'Business Account ID', type: 'text', required: false, placeholder: 'Optional: Business Account ID' },
      ],
    },
    {
      type: 'oauth2',
      name: 'Meta Business Login',
      description: 'Connect via Meta Business account',
      scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
    },
  ],
  triggers: [
    {
      id: 'new_message',
      name: 'New Message Received',
      description: 'Triggers when a new WhatsApp message is received',
      icon: '📩',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        {
          key: 'messageType',
          label: 'Message Type',
          type: 'multiselect',
          options: [
            { value: 'text', label: 'Text Messages' },
            { value: 'image', label: 'Images' },
            { value: 'video', label: 'Videos' },
            { value: 'audio', label: 'Audio/Voice Notes' },
            { value: 'document', label: 'Documents' },
            { value: 'location', label: 'Location' },
            { value: 'contacts', label: 'Contacts' },
            { value: 'sticker', label: 'Stickers' },
          ],
          default: 'text',
          helpText: 'Filter by message types to process',
        },
        {
          key: 'filterPhone',
          label: 'Filter by Phone Number',
          type: 'text',
          placeholder: '+1234567890',
          helpText: 'Optional: Only trigger for messages from this number',
        },
      ],
      outputSchema: {
        messageId: 'string',
        from: 'string',
        timestamp: 'string',
        type: 'string',
        text: { body: 'string' },
      },
    },
    {
      id: 'message_status',
      name: 'Message Status Update',
      description: 'Triggers when message status changes (sent, delivered, read)',
      icon: '✅',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        {
          key: 'statusFilter',
          label: 'Status Filter',
          type: 'multiselect',
          options: [
            { value: 'sent', label: 'Sent' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'read', label: 'Read' },
            { value: 'failed', label: 'Failed' },
          ],
          helpText: 'Filter which status updates to receive',
        },
      ],
    },
  ],
  actions: [
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Send a text message via WhatsApp',
      icon: '📤',
      fields: [
        { key: 'to', label: 'Recipient Phone', type: 'text', required: true, placeholder: '+1234567890', helpText: 'Phone number with country code' },
        { key: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Enter your message...', validation: { maxLength: 4096 } },
        { key: 'previewUrl', label: 'Preview URLs', type: 'boolean', default: true, helpText: 'Show link previews in message' },
      ],
    },
    {
      id: 'send_template',
      name: 'Send Template Message',
      description: 'Send a pre-approved template message',
      icon: '📋',
      fields: [
        { key: 'to', label: 'Recipient Phone', type: 'text', required: true, placeholder: '+1234567890' },
        { key: 'templateName', label: 'Template Name', type: 'text', required: true, placeholder: 'hello_world' },
        { key: 'templateLanguage', label: 'Language Code', type: 'text', required: true, default: 'en', placeholder: 'en' },
        { key: 'templateParams', label: 'Template Parameters', type: 'json', placeholder: '["param1", "param2"]', helpText: 'JSON array of template parameters' },
      ],
    },
    {
      id: 'send_media',
      name: 'Send Media',
      description: 'Send image, video, or document',
      icon: '🖼️',
      fields: [
        { key: 'to', label: 'Recipient Phone', type: 'text', required: true },
        { key: 'mediaType', label: 'Media Type', type: 'select', required: true, options: [
          { value: 'image', label: 'Image' },
          { value: 'video', label: 'Video' },
          { value: 'audio', label: 'Audio' },
          { value: 'document', label: 'Document' },
        ]},
        { key: 'mediaUrl', label: 'Media URL', type: 'url', required: true, placeholder: 'https://...' },
        { key: 'caption', label: 'Caption', type: 'textarea', placeholder: 'Optional caption' },
        { key: 'filename', label: 'Filename', type: 'text', placeholder: 'document.pdf', dependsOn: { field: 'mediaType', value: 'document' } },
      ],
    },
    {
      id: 'send_interactive',
      name: 'Send Interactive Message',
      description: 'Send buttons or list message',
      icon: '🔘',
      fields: [
        { key: 'to', label: 'Recipient Phone', type: 'text', required: true },
        { key: 'interactiveType', label: 'Interactive Type', type: 'select', required: true, options: [
          { value: 'button', label: 'Button Message' },
          { value: 'list', label: 'List Message' },
        ]},
        { key: 'headerText', label: 'Header', type: 'text', placeholder: 'Optional header' },
        { key: 'bodyText', label: 'Body', type: 'textarea', required: true },
        { key: 'footerText', label: 'Footer', type: 'text', placeholder: 'Optional footer' },
        { key: 'buttons', label: 'Buttons/List Items', type: 'json', required: true, helpText: 'JSON configuration for buttons or list' },
      ],
    },
    {
      id: 'mark_read',
      name: 'Mark as Read',
      description: 'Mark a message as read',
      icon: '👁️',
      fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', required: true, placeholder: 'wamid.xxx' },
      ],
    },
  ],
};

export const telegramConfig: AppConfig = {
  id: 'telegram',
  name: 'Telegram',
  icon: '✈️',
  color: '#0088cc',
  description: 'Telegram bot integration',
  category: 'communication',
  docsUrl: 'https://core.telegram.org/bots/api',
  auth: [
    {
      type: 'api-key',
      name: 'Bot Token',
      description: 'Use your Telegram Bot Token from @BotFather',
      fields: [
        { key: 'botToken', label: 'Bot Token', type: 'password', required: true, placeholder: '123456:ABC-DEF...' },
      ],
    },
  ],
  triggers: [
    {
      id: 'new_message',
      name: 'New Message',
      description: 'Triggers when the bot receives a message',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [
        {
          key: 'chatType',
          label: 'Chat Type',
          type: 'multiselect',
          options: [
            { value: 'private', label: 'Private Chat' },
            { value: 'group', label: 'Group' },
            { value: 'supergroup', label: 'Supergroup' },
            { value: 'channel', label: 'Channel' },
          ],
        },
        { key: 'filterText', label: 'Filter by Text', type: 'text', placeholder: '/start', helpText: 'Only trigger for messages containing this text' },
      ],
    },
    {
      id: 'callback_query',
      name: 'Button Clicked',
      description: 'Triggers when an inline button is clicked',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'callbackData', label: 'Callback Data Filter', type: 'text', placeholder: 'Optional: filter by callback data' },
      ],
    },
    {
      id: 'new_member',
      name: 'New Chat Member',
      description: 'Triggers when someone joins a group',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Send a text message',
      fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', required: true, placeholder: 'Chat or User ID' },
        { key: 'text', label: 'Message', type: 'textarea', required: true, validation: { maxLength: 4096 } },
        { key: 'parseMode', label: 'Parse Mode', type: 'select', options: [
          { value: 'HTML', label: 'HTML' },
          { value: 'Markdown', label: 'Markdown' },
          { value: 'MarkdownV2', label: 'MarkdownV2' },
        ]},
        { key: 'disablePreview', label: 'Disable Link Preview', type: 'boolean', default: false },
        { key: 'replyToMessageId', label: 'Reply to Message ID', type: 'text', placeholder: 'Optional' },
      ],
    },
    {
      id: 'send_photo',
      name: 'Send Photo',
      description: 'Send a photo',
      fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', required: true },
        { key: 'photo', label: 'Photo URL', type: 'url', required: true },
        { key: 'caption', label: 'Caption', type: 'textarea', validation: { maxLength: 1024 } },
      ],
    },
    {
      id: 'send_document',
      name: 'Send Document',
      description: 'Send a file/document',
      fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', required: true },
        { key: 'document', label: 'Document URL', type: 'url', required: true },
        { key: 'caption', label: 'Caption', type: 'textarea' },
        { key: 'filename', label: 'Filename', type: 'text' },
      ],
    },
    {
      id: 'send_buttons',
      name: 'Send with Buttons',
      description: 'Send message with inline buttons',
      fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', required: true },
        { key: 'text', label: 'Message', type: 'textarea', required: true },
        { key: 'buttons', label: 'Buttons (JSON)', type: 'json', required: true, helpText: '[[{"text": "Button 1", "callback_data": "btn1"}]]' },
      ],
    },
    {
      id: 'edit_message',
      name: 'Edit Message',
      description: 'Edit an existing message',
      fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', required: true },
        { key: 'text', label: 'New Text', type: 'textarea', required: true },
      ],
    },
    {
      id: 'delete_message',
      name: 'Delete Message',
      description: 'Delete a message',
      fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', required: true },
      ],
    },
  ],
};

export const slackConfig: AppConfig = {
  id: 'slack',
  name: 'Slack',
  icon: '💼',
  color: '#4A154B',
  description: 'Post to Slack channels and interact with users',
  category: 'communication',
  docsUrl: 'https://api.slack.com',
  auth: [
    {
      type: 'oauth2',
      name: 'Slack OAuth',
      description: 'Connect your Slack workspace',
      scopes: ['chat:write', 'channels:read', 'users:read', 'reactions:write'],
    },
    {
      type: 'api-key',
      name: 'Bot Token',
      description: 'Use a Slack Bot Token',
      fields: [
        { key: 'botToken', label: 'Bot Token', type: 'password', required: true, placeholder: 'xoxb-...' },
      ],
    },
  ],
  triggers: [
    {
      id: 'new_message',
      name: 'New Message',
      description: 'Triggers when a message is posted to a channel',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general or Channel ID' },
        { key: 'filterUser', label: 'Filter by User', type: 'text', placeholder: 'Optional: User ID' },
      ],
    },
    {
      id: 'reaction_added',
      name: 'Reaction Added',
      description: 'Triggers when a reaction is added to a message',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'emoji', label: 'Emoji Filter', type: 'text', placeholder: ':thumbsup:' },
      ],
    },
    {
      id: 'mention',
      name: 'Bot Mentioned',
      description: 'Triggers when your bot is mentioned',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Post a message to a channel',
      fields: [
        { key: 'channel', label: 'Channel', type: 'text', required: true, placeholder: '#general or Channel ID' },
        { key: 'text', label: 'Message', type: 'textarea', required: true },
        { key: 'username', label: 'Bot Username', type: 'text', placeholder: 'My Bot' },
        { key: 'iconEmoji', label: 'Icon Emoji', type: 'text', placeholder: ':robot_face:' },
        { key: 'threadTs', label: 'Thread Timestamp', type: 'text', placeholder: 'Reply to thread (optional)' },
      ],
    },
    {
      id: 'send_blocks',
      name: 'Send Rich Message',
      description: 'Send a message with blocks (rich formatting)',
      fields: [
        { key: 'channel', label: 'Channel', type: 'text', required: true },
        { key: 'blocks', label: 'Blocks (JSON)', type: 'json', required: true, helpText: 'Slack Block Kit JSON' },
        { key: 'text', label: 'Fallback Text', type: 'textarea', required: true },
      ],
    },
    {
      id: 'send_dm',
      name: 'Send Direct Message',
      description: 'Send a DM to a user',
      fields: [
        { key: 'user', label: 'User ID', type: 'text', required: true, placeholder: 'U0123456789' },
        { key: 'text', label: 'Message', type: 'textarea', required: true },
      ],
    },
    {
      id: 'add_reaction',
      name: 'Add Reaction',
      description: 'Add an emoji reaction to a message',
      fields: [
        { key: 'channel', label: 'Channel', type: 'text', required: true },
        { key: 'timestamp', label: 'Message Timestamp', type: 'text', required: true },
        { key: 'emoji', label: 'Emoji', type: 'text', required: true, placeholder: 'thumbsup' },
      ],
    },
    {
      id: 'update_message',
      name: 'Update Message',
      description: 'Edit an existing message',
      fields: [
        { key: 'channel', label: 'Channel', type: 'text', required: true },
        { key: 'ts', label: 'Message Timestamp', type: 'text', required: true },
        { key: 'text', label: 'New Text', type: 'textarea', required: true },
      ],
    },
    {
      id: 'upload_file',
      name: 'Upload File',
      description: 'Upload a file to a channel',
      fields: [
        { key: 'channels', label: 'Channels', type: 'text', required: true, placeholder: 'C0123456789' },
        { key: 'fileUrl', label: 'File URL', type: 'url', required: true },
        { key: 'filename', label: 'Filename', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'initialComment', label: 'Comment', type: 'textarea' },
      ],
    },
  ],
};

export const discordConfig: AppConfig = {
  id: 'discord',
  name: 'Discord',
  icon: '🎮',
  color: '#5865F2',
  description: 'Discord webhooks and bot integration',
  category: 'communication',
  docsUrl: 'https://discord.com/developers/docs',
  auth: [
    {
      type: 'api-key',
      name: 'Bot Token',
      description: 'Use a Discord Bot Token',
      fields: [
        { key: 'botToken', label: 'Bot Token', type: 'password', required: true },
      ],
    },
    {
      type: 'custom',
      name: 'Webhook URL',
      description: 'Use a Discord Webhook URL',
      fields: [
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://discord.com/api/webhooks/...' },
      ],
    },
  ],
  triggers: [
    {
      id: 'new_message',
      name: 'New Message',
      description: 'Triggers when a message is sent',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text' },
        { key: 'guildId', label: 'Server ID', type: 'text' },
      ],
    },
    {
      id: 'member_joined',
      name: 'Member Joined',
      description: 'Triggers when a new member joins',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'guildId', label: 'Server ID', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Send a message to a channel',
      fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', required: true },
        { key: 'content', label: 'Message', type: 'textarea', required: true, validation: { maxLength: 2000 } },
        { key: 'tts', label: 'Text-to-Speech', type: 'boolean', default: false },
      ],
    },
    {
      id: 'send_embed',
      name: 'Send Embed',
      description: 'Send a rich embed message',
      fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'color', label: 'Color (Hex)', type: 'text', placeholder: '#5865F2' },
        { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url' },
        { key: 'imageUrl', label: 'Image URL', type: 'url' },
        { key: 'footer', label: 'Footer Text', type: 'text' },
      ],
    },
    {
      id: 'webhook_send',
      name: 'Send via Webhook',
      description: 'Send using a webhook URL',
      fields: [
        { key: 'content', label: 'Message', type: 'textarea', validation: { maxLength: 2000 } },
        { key: 'username', label: 'Username Override', type: 'text' },
        { key: 'avatarUrl', label: 'Avatar URL', type: 'url' },
        { key: 'embeds', label: 'Embeds (JSON)', type: 'json', helpText: 'Array of embed objects' },
      ],
    },
  ],
};

export const teamsConfig: AppConfig = {
  id: 'microsoft_teams',
  name: 'Microsoft Teams',
  icon: '👥',
  color: '#6264A7',
  description: 'Microsoft Teams messaging and integration',
  category: 'communication',
  docsUrl: 'https://docs.microsoft.com/en-us/microsoftteams/',
  auth: [
    {
      type: 'oauth2',
      name: 'Microsoft 365',
      description: 'Connect your Microsoft 365 account',
      scopes: ['Team.ReadBasic.All', 'Channel.ReadBasic.All', 'Chat.Read', 'Chat.ReadWrite'],
    },
    {
      type: 'custom',
      name: 'Incoming Webhook',
      description: 'Use a Teams Incoming Webhook',
      fields: [
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'new_message',
      name: 'New Message',
      description: 'Triggers when a new message is posted',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'teamId', label: 'Team ID', type: 'text' },
        { key: 'channelId', label: 'Channel ID', type: 'text' },
      ],
    },
  ],
  actions: [
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Send a message to a channel',
      fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', required: true },
        { key: 'channelId', label: 'Channel ID', type: 'text', required: true },
        { key: 'message', label: 'Message', type: 'textarea', required: true },
      ],
    },
    {
      id: 'send_card',
      name: 'Send Adaptive Card',
      description: 'Send a rich Adaptive Card',
      fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', required: true },
        { key: 'channelId', label: 'Channel ID', type: 'text', required: true },
        { key: 'cardJson', label: 'Card JSON', type: 'json', required: true, helpText: 'Adaptive Card JSON' },
      ],
    },
    {
      id: 'webhook_send',
      name: 'Send via Webhook',
      description: 'Send using an incoming webhook',
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'text', label: 'Text', type: 'textarea', required: true },
        { key: 'themeColor', label: 'Theme Color', type: 'text', placeholder: '0076D7' },
      ],
    },
  ],
};

export const twilioSmsConfig: AppConfig = {
  id: 'twilio_sms',
  name: 'Twilio SMS',
  icon: '📱',
  color: '#F22F46',
  description: 'Send and receive SMS via Twilio',
  category: 'communication',
  docsUrl: 'https://www.twilio.com/docs/sms',
  auth: [
    {
      type: 'api-key',
      name: 'Twilio API Credentials',
      description: 'Use your Twilio Account SID and Auth Token',
      fields: [
        { key: 'accountSid', label: 'Account SID', type: 'text', required: true, placeholder: 'ACxxxxxxxx' },
        { key: 'authToken', label: 'Auth Token', type: 'password', required: true },
        { key: 'fromNumber', label: 'From Number', type: 'text', required: true, placeholder: '+1234567890' },
      ],
    },
  ],
  triggers: [
    {
      id: 'sms_received',
      name: 'SMS Received',
      description: 'Triggers when an SMS is received',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'filterFrom', label: 'Filter by Sender', type: 'text', placeholder: '+1234567890' },
      ],
    },
    {
      id: 'delivery_status',
      name: 'Delivery Status',
      description: 'Triggers on delivery status updates',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'status', label: 'Status Filter', type: 'multiselect', options: [
          { value: 'sent', label: 'Sent' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'failed', label: 'Failed' },
          { value: 'undelivered', label: 'Undelivered' },
        ]},
      ],
    },
  ],
  actions: [
    {
      id: 'send_sms',
      name: 'Send SMS',
      description: 'Send an SMS message',
      fields: [
        { key: 'to', label: 'To Number', type: 'text', required: true, placeholder: '+1234567890' },
        { key: 'body', label: 'Message', type: 'textarea', required: true, validation: { maxLength: 1600 } },
        { key: 'mediaUrl', label: 'Media URL (MMS)', type: 'url', helpText: 'Optional: Send as MMS with media' },
      ],
    },
    {
      id: 'lookup',
      name: 'Phone Number Lookup',
      description: 'Look up information about a phone number',
      fields: [
        { key: 'phoneNumber', label: 'Phone Number', type: 'text', required: true },
        { key: 'type', label: 'Lookup Type', type: 'multiselect', options: [
          { value: 'carrier', label: 'Carrier Info' },
          { value: 'caller-name', label: 'Caller Name' },
        ]},
      ],
    },
  ],
};

// ============================================================================
// EMAIL APPS
// ============================================================================

export const gmailConfig: AppConfig = {
  id: 'gmail',
  name: 'Gmail',
  icon: '📧',
  color: '#EA4335',
  description: 'Send and receive emails via Gmail',
  category: 'email',
  docsUrl: 'https://developers.google.com/gmail/api',
  auth: [
    {
      type: 'oauth2',
      name: 'Google Account',
      description: 'Connect your Google account',
      scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
    },
  ],
  triggers: [
    {
      id: 'new_email',
      name: 'New Email',
      description: 'Triggers when a new email is received',
      triggerTypes: ['poll', 'webhook'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'labelIds', label: 'Label Filter', type: 'multiselect', options: [
          { value: 'INBOX', label: 'Inbox' },
          { value: 'STARRED', label: 'Starred' },
          { value: 'IMPORTANT', label: 'Important' },
          { value: 'UNREAD', label: 'Unread' },
        ]},
        { key: 'from', label: 'From Address', type: 'email', placeholder: 'Filter by sender' },
        { key: 'subject', label: 'Subject Contains', type: 'text', placeholder: 'Filter by subject' },
        { key: 'hasAttachment', label: 'Has Attachment', type: 'boolean' },
      ],
    },
    {
      id: 'new_thread',
      name: 'New Email Thread',
      description: 'Triggers for new email conversations',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'labelIds', label: 'Label Filter', type: 'multiselect', options: [
          { value: 'INBOX', label: 'Inbox' },
          { value: 'STARRED', label: 'Starred' },
        ]},
      ],
    },
  ],
  actions: [
    {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send an email',
      fields: [
        { key: 'to', label: 'To', type: 'email', required: true, placeholder: 'recipient@example.com' },
        { key: 'cc', label: 'CC', type: 'email', placeholder: 'cc@example.com' },
        { key: 'bcc', label: 'BCC', type: 'email', placeholder: 'bcc@example.com' },
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'body', label: 'Body', type: 'textarea', required: true },
        { key: 'isHtml', label: 'HTML Email', type: 'boolean', default: false },
        { key: 'attachmentUrls', label: 'Attachment URLs', type: 'json', placeholder: '["https://..."]' },
      ],
    },
    {
      id: 'reply_email',
      name: 'Reply to Email',
      description: 'Reply to an existing email',
      fields: [
        { key: 'threadId', label: 'Thread ID', type: 'text', required: true },
        { key: 'body', label: 'Reply Body', type: 'textarea', required: true },
        { key: 'replyAll', label: 'Reply All', type: 'boolean', default: false },
      ],
    },
    {
      id: 'create_draft',
      name: 'Create Draft',
      description: 'Create an email draft',
      fields: [
        { key: 'to', label: 'To', type: 'email', required: true },
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'body', label: 'Body', type: 'textarea', required: true },
      ],
    },
    {
      id: 'add_label',
      name: 'Add Label',
      description: 'Add a label to an email',
      fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', required: true },
        { key: 'labelIds', label: 'Labels', type: 'multiselect', required: true, options: [
          { value: 'STARRED', label: 'Star' },
          { value: 'IMPORTANT', label: 'Important' },
        ]},
      ],
    },
    {
      id: 'mark_read',
      name: 'Mark as Read/Unread',
      description: 'Change read status of an email',
      fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', required: true },
        { key: 'markAs', label: 'Mark As', type: 'select', required: true, options: [
          { value: 'read', label: 'Read' },
          { value: 'unread', label: 'Unread' },
        ]},
      ],
    },
  ],
};

export const outlookConfig: AppConfig = {
  id: 'outlook',
  name: 'Outlook',
  icon: '📨',
  color: '#0078D4',
  description: 'Microsoft Outlook email integration',
  category: 'email',
  docsUrl: 'https://docs.microsoft.com/en-us/graph/outlook-mail-concept-overview',
  auth: [
    {
      type: 'oauth2',
      name: 'Microsoft Account',
      description: 'Connect your Microsoft account',
      scopes: ['Mail.ReadWrite', 'Mail.Send', 'User.Read'],
    },
  ],
  triggers: [
    {
      id: 'new_email',
      name: 'New Email',
      description: 'Triggers when a new email is received',
      triggerTypes: ['poll', 'webhook'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'folder', label: 'Folder', type: 'select', options: [
          { value: 'inbox', label: 'Inbox' },
          { value: 'drafts', label: 'Drafts' },
          { value: 'sentitems', label: 'Sent Items' },
        ]},
        { key: 'from', label: 'From Address', type: 'email' },
        { key: 'importance', label: 'Importance', type: 'select', options: [
          { value: 'high', label: 'High' },
          { value: 'normal', label: 'Normal' },
          { value: 'low', label: 'Low' },
        ]},
      ],
    },
  ],
  actions: [
    {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send an email via Outlook',
      fields: [
        { key: 'to', label: 'To', type: 'email', required: true },
        { key: 'cc', label: 'CC', type: 'email' },
        { key: 'bcc', label: 'BCC', type: 'email' },
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'body', label: 'Body', type: 'textarea', required: true },
        { key: 'contentType', label: 'Content Type', type: 'select', options: [
          { value: 'Text', label: 'Plain Text' },
          { value: 'HTML', label: 'HTML' },
        ], default: 'Text' },
        { key: 'importance', label: 'Importance', type: 'select', options: [
          { value: 'Low', label: 'Low' },
          { value: 'Normal', label: 'Normal' },
          { value: 'High', label: 'High' },
        ], default: 'Normal' },
      ],
    },
    {
      id: 'reply_email',
      name: 'Reply to Email',
      description: 'Reply to an existing email',
      fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', required: true },
        { key: 'comment', label: 'Reply Body', type: 'textarea', required: true },
        { key: 'replyAll', label: 'Reply All', type: 'boolean', default: false },
      ],
    },
    {
      id: 'forward_email',
      name: 'Forward Email',
      description: 'Forward an email',
      fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', required: true },
        { key: 'to', label: 'Forward To', type: 'email', required: true },
        { key: 'comment', label: 'Comment', type: 'textarea' },
      ],
    },
    {
      id: 'move_email',
      name: 'Move Email',
      description: 'Move email to a folder',
      fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', required: true },
        { key: 'destinationFolder', label: 'Destination Folder', type: 'text', required: true },
      ],
    },
  ],
};

export const sendgridConfig: AppConfig = {
  id: 'sendgrid',
  name: 'SendGrid',
  icon: '📤',
  color: '#1A82E2',
  description: 'Transactional and marketing emails via SendGrid',
  category: 'email',
  docsUrl: 'https://docs.sendgrid.com',
  auth: [
    {
      type: 'api-key',
      name: 'SendGrid API Key',
      description: 'Use your SendGrid API Key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'SG.xxxx' },
      ],
    },
  ],
  triggers: [
    {
      id: 'email_event',
      name: 'Email Event',
      description: 'Triggers on email events (delivered, opened, clicked, etc.)',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'eventType', label: 'Event Type', type: 'multiselect', options: [
          { value: 'processed', label: 'Processed' },
          { value: 'dropped', label: 'Dropped' },
          { value: 'delivered', label: 'Delivered' },
          { value: 'deferred', label: 'Deferred' },
          { value: 'bounce', label: 'Bounce' },
          { value: 'open', label: 'Opened' },
          { value: 'click', label: 'Clicked' },
          { value: 'spamreport', label: 'Spam Report' },
          { value: 'unsubscribe', label: 'Unsubscribe' },
        ]},
      ],
    },
  ],
  actions: [
    {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send a transactional email',
      fields: [
        { key: 'to', label: 'To', type: 'email', required: true },
        { key: 'from', label: 'From', type: 'email', required: true },
        { key: 'fromName', label: 'From Name', type: 'text' },
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'textContent', label: 'Text Content', type: 'textarea' },
        { key: 'htmlContent', label: 'HTML Content', type: 'textarea' },
        { key: 'replyTo', label: 'Reply To', type: 'email' },
        { key: 'categories', label: 'Categories', type: 'json', placeholder: '["category1"]' },
      ],
    },
    {
      id: 'send_template',
      name: 'Send Template Email',
      description: 'Send an email using a template',
      fields: [
        { key: 'to', label: 'To', type: 'email', required: true },
        { key: 'from', label: 'From', type: 'email', required: true },
        { key: 'templateId', label: 'Template ID', type: 'text', required: true, placeholder: 'd-xxxxxxxx' },
        { key: 'dynamicData', label: 'Dynamic Data (JSON)', type: 'json', helpText: 'Template variables as JSON object' },
      ],
    },
    {
      id: 'add_contact',
      name: 'Add Contact',
      description: 'Add a contact to SendGrid',
      fields: [
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'listIds', label: 'List IDs', type: 'json', placeholder: '["list-id-1"]' },
        { key: 'customFields', label: 'Custom Fields', type: 'json' },
      ],
    },
  ],
};

export const mailchimpConfig: AppConfig = {
  id: 'mailchimp',
  name: 'Mailchimp',
  icon: '🐵',
  color: '#FFE01B',
  description: 'Email marketing and automation via Mailchimp',
  category: 'email',
  docsUrl: 'https://mailchimp.com/developer/',
  auth: [
    {
      type: 'oauth2',
      name: 'Mailchimp Account',
      description: 'Connect your Mailchimp account',
      scopes: [],
    },
    {
      type: 'api-key',
      name: 'API Key',
      description: 'Use your Mailchimp API Key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'xxxxxxx-us1' },
      ],
    },
  ],
  triggers: [
    {
      id: 'subscriber_added',
      name: 'New Subscriber',
      description: 'Triggers when a new subscriber is added',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'listId', label: 'List/Audience ID', type: 'text', required: true },
      ],
    },
    {
      id: 'campaign_sent',
      name: 'Campaign Sent',
      description: 'Triggers when a campaign is sent',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'unsubscribe',
      name: 'Unsubscribe',
      description: 'Triggers when someone unsubscribes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'listId', label: 'List/Audience ID', type: 'text' },
      ],
    },
  ],
  actions: [
    {
      id: 'add_subscriber',
      name: 'Add/Update Subscriber',
      description: 'Add or update a subscriber',
      fields: [
        { key: 'listId', label: 'List ID', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'status', label: 'Status', type: 'select', required: true, options: [
          { value: 'subscribed', label: 'Subscribed' },
          { value: 'pending', label: 'Pending' },
          { value: 'unsubscribed', label: 'Unsubscribed' },
        ]},
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'tags', label: 'Tags', type: 'json', placeholder: '["tag1", "tag2"]' },
        { key: 'mergeFields', label: 'Merge Fields', type: 'json' },
      ],
    },
    {
      id: 'remove_subscriber',
      name: 'Remove Subscriber',
      description: 'Remove a subscriber from a list',
      fields: [
        { key: 'listId', label: 'List ID', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
      ],
    },
    {
      id: 'add_tag',
      name: 'Add Tag',
      description: 'Add tags to a subscriber',
      fields: [
        { key: 'listId', label: 'List ID', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'tags', label: 'Tags', type: 'json', required: true, placeholder: '["tag1", "tag2"]' },
      ],
    },
    {
      id: 'create_campaign',
      name: 'Create Campaign',
      description: 'Create an email campaign',
      fields: [
        { key: 'listId', label: 'List ID', type: 'text', required: true },
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'fromName', label: 'From Name', type: 'text', required: true },
        { key: 'replyTo', label: 'Reply To', type: 'email', required: true },
        { key: 'type', label: 'Type', type: 'select', options: [
          { value: 'regular', label: 'Regular' },
          { value: 'plaintext', label: 'Plain Text' },
        ], default: 'regular' },
      ],
    },
  ],
};

export const smtpConfig: AppConfig = {
  id: 'smtp',
  name: 'SMTP',
  icon: '✉️',
  color: '#6B7280',
  description: 'Send emails via custom SMTP server',
  category: 'email',
  auth: [
    {
      type: 'custom',
      name: 'SMTP Credentials',
      description: 'Configure your SMTP server settings',
      fields: [
        { key: 'host', label: 'SMTP Host', type: 'text', required: true, placeholder: 'smtp.example.com' },
        { key: 'port', label: 'Port', type: 'number', required: true, default: 587 },
        { key: 'secure', label: 'Use SSL/TLS', type: 'boolean', default: true },
        { key: 'username', label: 'Username', type: 'text', required: true },
        { key: 'password', label: 'Password', type: 'password', required: true },
      ],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'send_email',
      name: 'Send Email',
      description: 'Send an email via SMTP',
      fields: [
        { key: 'from', label: 'From', type: 'email', required: true },
        { key: 'fromName', label: 'From Name', type: 'text' },
        { key: 'to', label: 'To', type: 'email', required: true },
        { key: 'cc', label: 'CC', type: 'email' },
        { key: 'bcc', label: 'BCC', type: 'email' },
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'textBody', label: 'Text Body', type: 'textarea' },
        { key: 'htmlBody', label: 'HTML Body', type: 'textarea' },
        { key: 'replyTo', label: 'Reply To', type: 'email' },
      ],
    },
  ],
};

// ============================================================================
// GOOGLE APPS
// ============================================================================

export const googleSheetsConfig: AppConfig = {
  id: 'google_sheets',
  name: 'Google Sheets',
  icon: '📊',
  color: '#0F9D58',
  description: 'Read and write data in Google Sheets',
  category: 'google',
  docsUrl: 'https://developers.google.com/sheets/api',
  auth: [
    {
      type: 'oauth2',
      name: 'Google Account',
      description: 'Connect your Google account',
      scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.readonly'],
    },
  ],
  triggers: [
    {
      id: 'new_row',
      name: 'New Row Added',
      description: 'Triggers when a new row is added',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true, placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', required: true, default: 'Sheet1' },
        { key: 'headerRow', label: 'Header Row', type: 'number', default: 1, helpText: 'Row number containing column headers' },
      ],
    },
    {
      id: 'row_updated',
      name: 'Row Updated',
      description: 'Triggers when a row is updated',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', required: true },
        { key: 'watchColumn', label: 'Watch Column', type: 'text', placeholder: 'A', helpText: 'Column to watch for changes' },
      ],
    },
  ],
  actions: [
    {
      id: 'append_row',
      name: 'Append Row',
      description: 'Add a new row to the sheet',
      fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', required: true, default: 'Sheet1' },
        { key: 'values', label: 'Row Values', type: 'json', required: true, placeholder: '["value1", "value2", "value3"]', helpText: 'JSON array of values' },
        { key: 'insertDataOption', label: 'Insert Option', type: 'select', options: [
          { value: 'INSERT_ROWS', label: 'Insert New Rows' },
          { value: 'OVERWRITE', label: 'Overwrite' },
        ], default: 'INSERT_ROWS' },
      ],
    },
    {
      id: 'update_row',
      name: 'Update Row',
      description: 'Update an existing row',
      fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', required: true },
        { key: 'range', label: 'Cell Range', type: 'text', required: true, placeholder: 'A2:D2', helpText: 'e.g., A2:D2 or A2:A2' },
        { key: 'values', label: 'New Values', type: 'json', required: true, placeholder: '[["value1", "value2"]]' },
      ],
    },
    {
      id: 'get_rows',
      name: 'Get Rows',
      description: 'Read rows from the sheet',
      fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', required: true },
        { key: 'range', label: 'Range', type: 'text', placeholder: 'A1:Z100', helpText: 'Leave empty to get all data' },
      ],
    },
    {
      id: 'find_row',
      name: 'Find Row',
      description: 'Find a row by column value',
      fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', required: true },
        { key: 'lookupColumn', label: 'Lookup Column', type: 'text', required: true, placeholder: 'A', helpText: 'Column letter to search in' },
        { key: 'lookupValue', label: 'Search Value', type: 'text', required: true },
      ],
    },
    {
      id: 'delete_row',
      name: 'Delete Row',
      description: 'Delete a row from the sheet',
      fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', required: true },
        { key: 'rowIndex', label: 'Row Number', type: 'number', required: true, helpText: 'Row number to delete (1-indexed)' },
      ],
    },
    {
      id: 'clear_range',
      name: 'Clear Range',
      description: 'Clear values in a range',
      fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true },
        { key: 'range', label: 'Range', type: 'text', required: true, placeholder: 'Sheet1!A1:D10' },
      ],
    },
  ],
};

export const googleDriveConfig: AppConfig = {
  id: 'google_drive',
  name: 'Google Drive',
  icon: '📁',
  color: '#4285F4',
  description: 'Manage files in Google Drive',
  category: 'google',
  docsUrl: 'https://developers.google.com/drive/api',
  auth: [
    {
      type: 'oauth2',
      name: 'Google Account',
      description: 'Connect your Google account',
      scopes: ['https://www.googleapis.com/auth/drive'],
    },
  ],
  triggers: [
    {
      id: 'new_file',
      name: 'New File',
      description: 'Triggers when a new file is added',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: 'Optional: specific folder' },
        { key: 'mimeType', label: 'File Type', type: 'select', options: [
          { value: '', label: 'All Files' },
          { value: 'application/pdf', label: 'PDF' },
          { value: 'image/*', label: 'Images' },
          { value: 'application/vnd.google-apps.document', label: 'Google Docs' },
          { value: 'application/vnd.google-apps.spreadsheet', label: 'Google Sheets' },
        ]},
      ],
    },
    {
      id: 'file_updated',
      name: 'File Updated',
      description: 'Triggers when a file is modified',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: 'Watch specific file' },
        { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: 'Watch folder' },
      ],
    },
  ],
  actions: [
    {
      id: 'upload_file',
      name: 'Upload File',
      description: 'Upload a file to Drive',
      fields: [
        { key: 'fileName', label: 'File Name', type: 'text', required: true },
        { key: 'fileContent', label: 'File Content/URL', type: 'url', required: true },
        { key: 'mimeType', label: 'MIME Type', type: 'text', placeholder: 'application/pdf' },
        { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: 'Destination folder' },
      ],
    },
    {
      id: 'create_folder',
      name: 'Create Folder',
      description: 'Create a new folder',
      fields: [
        { key: 'folderName', label: 'Folder Name', type: 'text', required: true },
        { key: 'parentFolderId', label: 'Parent Folder ID', type: 'text', placeholder: 'root' },
      ],
    },
    {
      id: 'copy_file',
      name: 'Copy File',
      description: 'Create a copy of a file',
      fields: [
        { key: 'fileId', label: 'File ID', type: 'text', required: true },
        { key: 'newName', label: 'New Name', type: 'text' },
        { key: 'folderId', label: 'Destination Folder', type: 'text' },
      ],
    },
    {
      id: 'move_file',
      name: 'Move File',
      description: 'Move a file to another folder',
      fields: [
        { key: 'fileId', label: 'File ID', type: 'text', required: true },
        { key: 'newFolderId', label: 'New Folder ID', type: 'text', required: true },
      ],
    },
    {
      id: 'delete_file',
      name: 'Delete File',
      description: 'Delete a file or folder',
      fields: [
        { key: 'fileId', label: 'File ID', type: 'text', required: true },
        { key: 'permanent', label: 'Permanent Delete', type: 'boolean', default: false, helpText: 'Skip trash and delete permanently' },
      ],
    },
    {
      id: 'share_file',
      name: 'Share File',
      description: 'Share a file with someone',
      fields: [
        { key: 'fileId', label: 'File ID', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'role', label: 'Permission', type: 'select', required: true, options: [
          { value: 'reader', label: 'Viewer' },
          { value: 'commenter', label: 'Commenter' },
          { value: 'writer', label: 'Editor' },
        ]},
        { key: 'sendNotification', label: 'Send Notification', type: 'boolean', default: true },
      ],
    },
    {
      id: 'get_file',
      name: 'Get File Info',
      description: 'Get file metadata',
      fields: [
        { key: 'fileId', label: 'File ID', type: 'text', required: true },
      ],
    },
  ],
};

export const googleCalendarConfig: AppConfig = {
  id: 'google_calendar',
  name: 'Google Calendar',
  icon: '📅',
  color: '#4285F4',
  description: 'Manage events in Google Calendar',
  category: 'google',
  docsUrl: 'https://developers.google.com/calendar',
  auth: [
    {
      type: 'oauth2',
      name: 'Google Account',
      description: 'Connect your Google account',
      scopes: ['https://www.googleapis.com/auth/calendar'],
    },
  ],
  triggers: [
    {
      id: 'new_event',
      name: 'New Event Created',
      description: 'Triggers when a new event is created',
      triggerTypes: ['poll', 'webhook'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'calendarId', label: 'Calendar', type: 'text', default: 'primary', helpText: 'Calendar ID or "primary"' },
      ],
    },
    {
      id: 'event_started',
      name: 'Event Started',
      description: 'Triggers when an event starts',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'calendarId', label: 'Calendar', type: 'text', default: 'primary' },
        { key: 'minutesBefore', label: 'Minutes Before', type: 'number', default: 0, helpText: 'Trigger X minutes before start' },
      ],
    },
    {
      id: 'event_updated',
      name: 'Event Updated',
      description: 'Triggers when an event is modified',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'calendarId', label: 'Calendar', type: 'text', default: 'primary' },
      ],
    },
  ],
  actions: [
    {
      id: 'create_event',
      name: 'Create Event',
      description: 'Create a new calendar event',
      fields: [
        { key: 'calendarId', label: 'Calendar', type: 'text', default: 'primary' },
        { key: 'summary', label: 'Event Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'startDateTime', label: 'Start Date/Time', type: 'datetime', required: true },
        { key: 'endDateTime', label: 'End Date/Time', type: 'datetime', required: true },
        { key: 'attendees', label: 'Attendees', type: 'json', placeholder: '["email1@example.com"]' },
        { key: 'sendUpdates', label: 'Send Invitations', type: 'select', options: [
          { value: 'all', label: 'All Attendees' },
          { value: 'externalOnly', label: 'External Only' },
          { value: 'none', label: 'None' },
        ], default: 'all' },
        { key: 'conferenceData', label: 'Add Google Meet', type: 'boolean', default: false },
      ],
    },
    {
      id: 'update_event',
      name: 'Update Event',
      description: 'Update an existing event',
      fields: [
        { key: 'calendarId', label: 'Calendar', type: 'text', default: 'primary' },
        { key: 'eventId', label: 'Event ID', type: 'text', required: true },
        { key: 'summary', label: 'New Title', type: 'text' },
        { key: 'description', label: 'New Description', type: 'textarea' },
        { key: 'startDateTime', label: 'New Start', type: 'datetime' },
        { key: 'endDateTime', label: 'New End', type: 'datetime' },
      ],
    },
    {
      id: 'delete_event',
      name: 'Delete Event',
      description: 'Delete a calendar event',
      fields: [
        { key: 'calendarId', label: 'Calendar', type: 'text', default: 'primary' },
        { key: 'eventId', label: 'Event ID', type: 'text', required: true },
        { key: 'sendUpdates', label: 'Notify Attendees', type: 'boolean', default: true },
      ],
    },
    {
      id: 'get_events',
      name: 'Get Events',
      description: 'List events in a time range',
      fields: [
        { key: 'calendarId', label: 'Calendar', type: 'text', default: 'primary' },
        { key: 'timeMin', label: 'Start Date', type: 'datetime', required: true },
        { key: 'timeMax', label: 'End Date', type: 'datetime', required: true },
        { key: 'maxResults', label: 'Max Results', type: 'number', default: 10 },
        { key: 'searchQuery', label: 'Search Query', type: 'text' },
      ],
    },
    {
      id: 'quick_add',
      name: 'Quick Add Event',
      description: 'Create event using natural language',
      fields: [
        { key: 'calendarId', label: 'Calendar', type: 'text', default: 'primary' },
        { key: 'text', label: 'Event Text', type: 'text', required: true, placeholder: 'Meeting with John tomorrow at 3pm' },
      ],
    },
  ],
};

export const googleDocsConfig: AppConfig = {
  id: 'google_docs',
  name: 'Google Docs',
  icon: '📄',
  color: '#4285F4',
  description: 'Create and edit Google Docs',
  category: 'google',
  docsUrl: 'https://developers.google.com/docs/api',
  auth: [
    {
      type: 'oauth2',
      name: 'Google Account',
      description: 'Connect your Google account',
      scopes: ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive'],
    },
  ],
  triggers: [
    {
      id: 'document_updated',
      name: 'Document Updated',
      description: 'Triggers when a document is modified',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'documentId', label: 'Document ID', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'create_document',
      name: 'Create Document',
      description: 'Create a new Google Doc',
      fields: [
        { key: 'title', label: 'Document Title', type: 'text', required: true },
        { key: 'content', label: 'Initial Content', type: 'textarea' },
        { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: 'Optional: folder location' },
      ],
    },
    {
      id: 'append_text',
      name: 'Append Text',
      description: 'Add text to end of document',
      fields: [
        { key: 'documentId', label: 'Document ID', type: 'text', required: true },
        { key: 'text', label: 'Text to Append', type: 'textarea', required: true },
      ],
    },
    {
      id: 'replace_text',
      name: 'Find & Replace',
      description: 'Replace text in the document',
      fields: [
        { key: 'documentId', label: 'Document ID', type: 'text', required: true },
        { key: 'findText', label: 'Find Text', type: 'text', required: true },
        { key: 'replaceText', label: 'Replace With', type: 'text', required: true },
        { key: 'matchCase', label: 'Match Case', type: 'boolean', default: false },
      ],
    },
    {
      id: 'get_content',
      name: 'Get Document Content',
      description: 'Read the document content',
      fields: [
        { key: 'documentId', label: 'Document ID', type: 'text', required: true },
      ],
    },
    {
      id: 'create_from_template',
      name: 'Create from Template',
      description: 'Create doc from template with variables',
      fields: [
        { key: 'templateId', label: 'Template Document ID', type: 'text', required: true },
        { key: 'newTitle', label: 'New Document Title', type: 'text', required: true },
        { key: 'variables', label: 'Variables', type: 'json', helpText: '{"{{name}}": "John"}' },
        { key: 'folderId', label: 'Destination Folder', type: 'text' },
      ],
    },
  ],
};

export const googleFormsConfig: AppConfig = {
  id: 'google_forms',
  name: 'Google Forms',
  icon: '📝',
  color: '#673AB7',
  description: 'Receive and manage Google Forms responses',
  category: 'google',
  docsUrl: 'https://developers.google.com/forms/api',
  auth: [
    {
      type: 'oauth2',
      name: 'Google Account',
      description: 'Connect your Google account',
      scopes: ['https://www.googleapis.com/auth/forms.responses.readonly', 'https://www.googleapis.com/auth/forms.body.readonly'],
    },
  ],
  triggers: [
    {
      id: 'new_response',
      name: 'New Form Response',
      description: 'Triggers when a new form response is submitted',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'formId', label: 'Form ID', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'get_responses',
      name: 'Get Responses',
      description: 'Get all form responses',
      fields: [
        { key: 'formId', label: 'Form ID', type: 'text', required: true },
        { key: 'limit', label: 'Limit', type: 'number', default: 100 },
      ],
    },
    {
      id: 'get_form',
      name: 'Get Form Structure',
      description: 'Get form questions and structure',
      fields: [
        { key: 'formId', label: 'Form ID', type: 'text', required: true },
      ],
    },
  ],
};

// ============================================================================
// Export all configs as a map
// ============================================================================

export const APP_CONFIGS: Record<string, AppConfig> = {
  // Communication
  whatsapp: whatsappConfig,
  telegram: telegramConfig,
  slack: slackConfig,
  discord: discordConfig,
  microsoft_teams: teamsConfig,
  twilio_sms: twilioSmsConfig,
  
  // Email
  gmail: gmailConfig,
  outlook: outlookConfig,
  sendgrid: sendgridConfig,
  mailchimp: mailchimpConfig,
  smtp: smtpConfig,
  
  // Google
  google_sheets: googleSheetsConfig,
  google_drive: googleDriveConfig,
  google_calendar: googleCalendarConfig,
  google_docs: googleDocsConfig,
  google_forms: googleFormsConfig,
};

// ============================================================================
// CRM APPS
// ============================================================================

export const hubspotConfig: AppConfig = {
  id: 'hubspot',
  name: 'HubSpot',
  icon: '🔶',
  color: '#FF7A59',
  description: 'CRM and marketing automation',
  category: 'crm',
  docsUrl: 'https://developers.hubspot.com/docs/api',
  auth: [
    {
      type: 'oauth2',
      name: 'HubSpot Account',
      description: 'Connect your HubSpot account',
      scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.deals.read', 'crm.objects.deals.write'],
    },
    {
      type: 'api-key',
      name: 'Private App Token',
      description: 'Use a HubSpot Private App token',
      fields: [
        { key: 'accessToken', label: 'Access Token', type: 'password', required: true, placeholder: 'pat-xxx-xxx' },
      ],
    },
  ],
  triggers: [
    {
      id: 'new_contact',
      name: 'New Contact',
      description: 'Triggers when a new contact is created',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'contact_updated',
      name: 'Contact Updated',
      description: 'Triggers when a contact is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'properties', label: 'Watch Properties', type: 'json', placeholder: '["email", "firstname"]' },
      ],
    },
    {
      id: 'new_deal',
      name: 'New Deal',
      description: 'Triggers when a new deal is created',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'deal_stage_changed',
      name: 'Deal Stage Changed',
      description: 'Triggers when a deal moves to a new stage',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'pipeline', label: 'Pipeline', type: 'text' },
        { key: 'stage', label: 'Stage Filter', type: 'text', helpText: 'Optional: trigger only for specific stage' },
      ],
    },
    {
      id: 'form_submitted',
      name: 'Form Submitted',
      description: 'Triggers when a HubSpot form is submitted',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'formId', label: 'Form ID', type: 'text', helpText: 'Optional: specific form' },
      ],
    },
  ],
  actions: [
    {
      id: 'create_contact',
      name: 'Create Contact',
      description: 'Create a new contact',
      fields: [
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'firstname', label: 'First Name', type: 'text' },
        { key: 'lastname', label: 'Last Name', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'company', label: 'Company', type: 'text' },
        { key: 'jobtitle', label: 'Job Title', type: 'text' },
        { key: 'lifecyclestage', label: 'Lifecycle Stage', type: 'select', options: [
          { value: 'subscriber', label: 'Subscriber' },
          { value: 'lead', label: 'Lead' },
          { value: 'marketingqualifiedlead', label: 'MQL' },
          { value: 'salesqualifiedlead', label: 'SQL' },
          { value: 'opportunity', label: 'Opportunity' },
          { value: 'customer', label: 'Customer' },
        ]},
        { key: 'customProperties', label: 'Custom Properties', type: 'json' },
      ],
    },
    {
      id: 'update_contact',
      name: 'Update Contact',
      description: 'Update an existing contact',
      fields: [
        { key: 'contactId', label: 'Contact ID', type: 'text', required: true },
        { key: 'properties', label: 'Properties to Update', type: 'json', required: true, helpText: '{"firstname": "John", "lastname": "Doe"}' },
      ],
    },
    {
      id: 'get_contact',
      name: 'Get Contact',
      description: 'Retrieve contact details',
      fields: [
        { key: 'contactId', label: 'Contact ID', type: 'text' },
        { key: 'email', label: 'Or Email', type: 'email' },
        { key: 'properties', label: 'Properties to Return', type: 'json', placeholder: '["email", "firstname"]' },
      ],
    },
    {
      id: 'create_deal',
      name: 'Create Deal',
      description: 'Create a new deal',
      fields: [
        { key: 'dealname', label: 'Deal Name', type: 'text', required: true },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'pipeline', label: 'Pipeline', type: 'text', required: true },
        { key: 'dealstage', label: 'Deal Stage', type: 'text', required: true },
        { key: 'closedate', label: 'Close Date', type: 'datetime' },
        { key: 'associatedContactIds', label: 'Contact IDs', type: 'json', placeholder: '["123", "456"]' },
        { key: 'associatedCompanyIds', label: 'Company IDs', type: 'json' },
      ],
    },
    {
      id: 'update_deal',
      name: 'Update Deal',
      description: 'Update an existing deal',
      fields: [
        { key: 'dealId', label: 'Deal ID', type: 'text', required: true },
        { key: 'properties', label: 'Properties', type: 'json', required: true },
      ],
    },
    {
      id: 'create_company',
      name: 'Create Company',
      description: 'Create a new company',
      fields: [
        { key: 'name', label: 'Company Name', type: 'text', required: true },
        { key: 'domain', label: 'Domain', type: 'text' },
        { key: 'industry', label: 'Industry', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'country', label: 'Country', type: 'text' },
      ],
    },
    {
      id: 'add_note',
      name: 'Add Note',
      description: 'Add a note to a record',
      fields: [
        { key: 'noteBody', label: 'Note Content', type: 'textarea', required: true },
        { key: 'associationType', label: 'Associate To', type: 'select', required: true, options: [
          { value: 'contact', label: 'Contact' },
          { value: 'company', label: 'Company' },
          { value: 'deal', label: 'Deal' },
        ]},
        { key: 'associatedId', label: 'Record ID', type: 'text', required: true },
      ],
    },
  ],
};

export const salesforceConfig: AppConfig = {
  id: 'salesforce',
  name: 'Salesforce',
  icon: '☁️',
  color: '#00A1E0',
  description: 'Enterprise CRM platform',
  category: 'crm',
  docsUrl: 'https://developer.salesforce.com/docs',
  auth: [
    {
      type: 'oauth2',
      name: 'Salesforce Account',
      description: 'Connect your Salesforce org',
      scopes: ['api', 'refresh_token'],
    },
  ],
  triggers: [
    {
      id: 'new_record',
      name: 'New Record',
      description: 'Triggers when a new record is created',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'object', label: 'Object Type', type: 'select', required: true, options: [
          { value: 'Lead', label: 'Lead' },
          { value: 'Contact', label: 'Contact' },
          { value: 'Account', label: 'Account' },
          { value: 'Opportunity', label: 'Opportunity' },
          { value: 'Case', label: 'Case' },
          { value: 'Task', label: 'Task' },
        ]},
      ],
    },
    {
      id: 'record_updated',
      name: 'Record Updated',
      description: 'Triggers when a record is updated',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'object', label: 'Object Type', type: 'select', required: true, options: [
          { value: 'Lead', label: 'Lead' },
          { value: 'Contact', label: 'Contact' },
          { value: 'Account', label: 'Account' },
          { value: 'Opportunity', label: 'Opportunity' },
        ]},
        { key: 'fieldFilter', label: 'Watch Fields', type: 'json', placeholder: '["Status", "Amount"]' },
      ],
    },
    {
      id: 'opportunity_stage_changed',
      name: 'Opportunity Stage Changed',
      description: 'Triggers when opportunity stage changes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'stage', label: 'Target Stage', type: 'text', helpText: 'Optional: specific stage' },
      ],
    },
  ],
  actions: [
    {
      id: 'create_record',
      name: 'Create Record',
      description: 'Create a new Salesforce record',
      fields: [
        { key: 'object', label: 'Object Type', type: 'select', required: true, options: [
          { value: 'Lead', label: 'Lead' },
          { value: 'Contact', label: 'Contact' },
          { value: 'Account', label: 'Account' },
          { value: 'Opportunity', label: 'Opportunity' },
          { value: 'Case', label: 'Case' },
          { value: 'Task', label: 'Task' },
        ]},
        { key: 'fields', label: 'Field Values', type: 'json', required: true, helpText: '{"FirstName": "John", "LastName": "Doe"}' },
      ],
    },
    {
      id: 'update_record',
      name: 'Update Record',
      description: 'Update an existing record',
      fields: [
        { key: 'object', label: 'Object Type', type: 'select', required: true, options: [
          { value: 'Lead', label: 'Lead' },
          { value: 'Contact', label: 'Contact' },
          { value: 'Account', label: 'Account' },
          { value: 'Opportunity', label: 'Opportunity' },
        ]},
        { key: 'recordId', label: 'Record ID', type: 'text', required: true },
        { key: 'fields', label: 'Fields to Update', type: 'json', required: true },
      ],
    },
    {
      id: 'get_record',
      name: 'Get Record',
      description: 'Retrieve a record by ID',
      fields: [
        { key: 'object', label: 'Object Type', type: 'select', required: true, options: [
          { value: 'Lead', label: 'Lead' },
          { value: 'Contact', label: 'Contact' },
          { value: 'Account', label: 'Account' },
          { value: 'Opportunity', label: 'Opportunity' },
        ]},
        { key: 'recordId', label: 'Record ID', type: 'text', required: true },
        { key: 'fields', label: 'Fields', type: 'json', placeholder: '["Name", "Email"]' },
      ],
    },
    {
      id: 'query',
      name: 'SOQL Query',
      description: 'Run a custom SOQL query',
      fields: [
        { key: 'query', label: 'SOQL Query', type: 'textarea', required: true, placeholder: 'SELECT Id, Name FROM Contact WHERE Email != null' },
      ],
    },
    {
      id: 'delete_record',
      name: 'Delete Record',
      description: 'Delete a record',
      fields: [
        { key: 'object', label: 'Object Type', type: 'select', required: true, options: [
          { value: 'Lead', label: 'Lead' },
          { value: 'Contact', label: 'Contact' },
          { value: 'Account', label: 'Account' },
          { value: 'Opportunity', label: 'Opportunity' },
        ]},
        { key: 'recordId', label: 'Record ID', type: 'text', required: true },
      ],
    },
  ],
};

export const pipedriveConfig: AppConfig = {
  id: 'pipedrive',
  name: 'Pipedrive',
  icon: '🎯',
  color: '#017737',
  description: 'Sales CRM and pipeline management',
  category: 'crm',
  docsUrl: 'https://developers.pipedrive.com/docs/api',
  auth: [
    {
      type: 'oauth2',
      name: 'Pipedrive Account',
      description: 'Connect your Pipedrive account',
      scopes: [],
    },
    {
      type: 'api-key',
      name: 'API Token',
      description: 'Use your Pipedrive API token',
      fields: [
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
        { key: 'companyDomain', label: 'Company Domain', type: 'text', required: true, placeholder: 'yourcompany.pipedrive.com' },
      ],
    },
  ],
  triggers: [
    {
      id: 'new_deal',
      name: 'New Deal',
      description: 'Triggers when a new deal is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'deal_updated',
      name: 'Deal Updated',
      description: 'Triggers when a deal is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'deal_stage_changed',
      name: 'Deal Stage Changed',
      description: 'Triggers when deal moves stages',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'stageId', label: 'Stage ID', type: 'text', helpText: 'Optional: specific stage' },
      ],
    },
    {
      id: 'new_person',
      name: 'New Person',
      description: 'Triggers when a new person is added',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'activity_completed',
      name: 'Activity Completed',
      description: 'Triggers when an activity is marked done',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'activityType', label: 'Activity Type', type: 'text' },
      ],
    },
  ],
  actions: [
    {
      id: 'create_deal',
      name: 'Create Deal',
      description: 'Create a new deal',
      fields: [
        { key: 'title', label: 'Deal Title', type: 'text', required: true },
        { key: 'value', label: 'Value', type: 'number' },
        { key: 'currency', label: 'Currency', type: 'text', default: 'USD' },
        { key: 'personId', label: 'Person ID', type: 'text' },
        { key: 'orgId', label: 'Organization ID', type: 'text' },
        { key: 'stageId', label: 'Stage ID', type: 'text' },
        { key: 'expectedCloseDate', label: 'Expected Close Date', type: 'datetime' },
      ],
    },
    {
      id: 'update_deal',
      name: 'Update Deal',
      description: 'Update an existing deal',
      fields: [
        { key: 'dealId', label: 'Deal ID', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'value', label: 'Value', type: 'number' },
        { key: 'stageId', label: 'Stage ID', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'open', label: 'Open' },
          { value: 'won', label: 'Won' },
          { value: 'lost', label: 'Lost' },
        ]},
      ],
    },
    {
      id: 'create_person',
      name: 'Create Person',
      description: 'Create a new person/contact',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'orgId', label: 'Organization ID', type: 'text' },
      ],
    },
    {
      id: 'create_activity',
      name: 'Create Activity',
      description: 'Create a new activity',
      fields: [
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'type', label: 'Activity Type', type: 'select', required: true, options: [
          { value: 'call', label: 'Call' },
          { value: 'meeting', label: 'Meeting' },
          { value: 'task', label: 'Task' },
          { value: 'deadline', label: 'Deadline' },
          { value: 'email', label: 'Email' },
        ]},
        { key: 'dueDate', label: 'Due Date', type: 'datetime' },
        { key: 'dealId', label: 'Deal ID', type: 'text' },
        { key: 'personId', label: 'Person ID', type: 'text' },
        { key: 'note', label: 'Note', type: 'textarea' },
      ],
    },
    {
      id: 'add_note',
      name: 'Add Note',
      description: 'Add a note to a deal or person',
      fields: [
        { key: 'content', label: 'Note Content', type: 'textarea', required: true },
        { key: 'dealId', label: 'Deal ID', type: 'text' },
        { key: 'personId', label: 'Person ID', type: 'text' },
        { key: 'orgId', label: 'Organization ID', type: 'text' },
      ],
    },
  ],
};

export const zohoCrmConfig: AppConfig = {
  id: 'zoho_crm',
  name: 'Zoho CRM',
  icon: '📈',
  color: '#D32F2F',
  description: 'Cloud-based CRM solution',
  category: 'crm',
  docsUrl: 'https://www.zoho.com/crm/developer/docs/',
  auth: [
    {
      type: 'oauth2',
      name: 'Zoho Account',
      description: 'Connect your Zoho account',
      scopes: ['ZohoCRM.modules.ALL', 'ZohoCRM.settings.ALL'],
    },
  ],
  triggers: [
    {
      id: 'new_record',
      name: 'New Record',
      description: 'Triggers when a new record is created',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'module', label: 'Module', type: 'select', required: true, options: [
          { value: 'Leads', label: 'Leads' },
          { value: 'Contacts', label: 'Contacts' },
          { value: 'Accounts', label: 'Accounts' },
          { value: 'Deals', label: 'Deals' },
          { value: 'Tasks', label: 'Tasks' },
        ]},
      ],
    },
    {
      id: 'record_updated',
      name: 'Record Updated',
      description: 'Triggers when a record is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'module', label: 'Module', type: 'select', required: true, options: [
          { value: 'Leads', label: 'Leads' },
          { value: 'Contacts', label: 'Contacts' },
          { value: 'Deals', label: 'Deals' },
        ]},
      ],
    },
  ],
  actions: [
    {
      id: 'create_record',
      name: 'Create Record',
      description: 'Create a new record',
      fields: [
        { key: 'module', label: 'Module', type: 'select', required: true, options: [
          { value: 'Leads', label: 'Leads' },
          { value: 'Contacts', label: 'Contacts' },
          { value: 'Accounts', label: 'Accounts' },
          { value: 'Deals', label: 'Deals' },
        ]},
        { key: 'data', label: 'Record Data', type: 'json', required: true, helpText: '{"Last_Name": "Doe", "Email": "john@example.com"}' },
      ],
    },
    {
      id: 'update_record',
      name: 'Update Record',
      description: 'Update an existing record',
      fields: [
        { key: 'module', label: 'Module', type: 'select', required: true, options: [
          { value: 'Leads', label: 'Leads' },
          { value: 'Contacts', label: 'Contacts' },
          { value: 'Accounts', label: 'Accounts' },
          { value: 'Deals', label: 'Deals' },
        ]},
        { key: 'recordId', label: 'Record ID', type: 'text', required: true },
        { key: 'data', label: 'Update Data', type: 'json', required: true },
      ],
    },
    {
      id: 'search_records',
      name: 'Search Records',
      description: 'Search for records',
      fields: [
        { key: 'module', label: 'Module', type: 'select', required: true, options: [
          { value: 'Leads', label: 'Leads' },
          { value: 'Contacts', label: 'Contacts' },
          { value: 'Accounts', label: 'Accounts' },
          { value: 'Deals', label: 'Deals' },
        ]},
        { key: 'criteria', label: 'Search Criteria', type: 'text', required: true, placeholder: '(Email:equals:john@example.com)' },
      ],
    },
  ],
};

export const freshsalesConfig: AppConfig = {
  id: 'freshsales',
  name: 'Freshsales',
  icon: '🍃',
  color: '#13C26B',
  description: 'Sales CRM by Freshworks',
  category: 'crm',
  docsUrl: 'https://developers.freshsales.io/',
  auth: [
    {
      type: 'api-key',
      name: 'API Key',
      description: 'Use your Freshsales API key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'yourcompany.freshsales.io' },
      ],
    },
  ],
  triggers: [
    {
      id: 'new_lead',
      name: 'New Lead',
      description: 'Triggers when a new lead is created',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'new_contact',
      name: 'New Contact',
      description: 'Triggers when a new contact is created',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'deal_stage_changed',
      name: 'Deal Stage Changed',
      description: 'Triggers when deal stage changes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'create_lead',
      name: 'Create Lead',
      description: 'Create a new lead',
      fields: [
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'company', label: 'Company', type: 'text' },
        { key: 'jobTitle', label: 'Job Title', type: 'text' },
      ],
    },
    {
      id: 'create_contact',
      name: 'Create Contact',
      description: 'Create a new contact',
      fields: [
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'accountId', label: 'Account ID', type: 'text' },
      ],
    },
    {
      id: 'create_deal',
      name: 'Create Deal',
      description: 'Create a new deal',
      fields: [
        { key: 'name', label: 'Deal Name', type: 'text', required: true },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'expectedClose', label: 'Expected Close', type: 'datetime' },
        { key: 'contactId', label: 'Contact ID', type: 'text' },
        { key: 'accountId', label: 'Account ID', type: 'text' },
      ],
    },
    {
      id: 'add_note',
      name: 'Add Note',
      description: 'Add a note to a record',
      fields: [
        { key: 'targetType', label: 'Target Type', type: 'select', required: true, options: [
          { value: 'Lead', label: 'Lead' },
          { value: 'Contact', label: 'Contact' },
          { value: 'Account', label: 'Account' },
          { value: 'Deal', label: 'Deal' },
        ]},
        { key: 'targetId', label: 'Target ID', type: 'text', required: true },
        { key: 'description', label: 'Note', type: 'textarea', required: true },
      ],
    },
  ],
};

// Add CRM apps to the export
APP_CONFIGS.hubspot = hubspotConfig;
APP_CONFIGS.salesforce = salesforceConfig;
APP_CONFIGS.pipedrive = pipedriveConfig;
APP_CONFIGS.zoho_crm = zohoCrmConfig;
APP_CONFIGS.freshsales = freshsalesConfig;

// ============================================================================
// AUTOMATION APPS
// ============================================================================

export const zapierConfig: AppConfig = {
  id: 'zapier',
  name: 'Zapier',
  icon: '⚡',
  color: '#FF4A00',
  description: 'Connect with Zapier webhooks',
  category: 'automation',
  docsUrl: 'https://zapier.com/developer',
  auth: [
    {
      type: 'custom',
      name: 'Webhook',
      description: 'Use Zapier webhooks',
      fields: [
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://hooks.zapier.com/...' },
      ],
    },
  ],
  triggers: [
    {
      id: 'webhook_received',
      name: 'Webhook Received',
      description: 'Triggers when Zapier sends a webhook',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'send_webhook',
      name: 'Send to Zapier',
      description: 'Send data to a Zapier webhook',
      fields: [
        { key: 'data', label: 'Data (JSON)', type: 'json', required: true, helpText: 'Data to send to Zapier' },
      ],
    },
  ],
};

export const makeConfig: AppConfig = {
  id: 'make',
  name: 'Make (Integromat)',
  icon: '🔄',
  color: '#6D00CC',
  description: 'Connect with Make scenarios',
  category: 'automation',
  docsUrl: 'https://www.make.com/en/api-documentation',
  auth: [
    {
      type: 'custom',
      name: 'Webhook',
      description: 'Use Make webhooks',
      fields: [
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'webhook_received',
      name: 'Webhook Received',
      description: 'Triggers when Make sends a webhook',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'send_webhook',
      name: 'Send to Make',
      description: 'Send data to a Make scenario',
      fields: [
        { key: 'data', label: 'Data (JSON)', type: 'json', required: true },
      ],
    },
  ],
};

export const n8nConfig: AppConfig = {
  id: 'n8n',
  name: 'n8n',
  icon: '🔗',
  color: '#EA4B71',
  description: 'Connect with n8n workflows',
  category: 'automation',
  docsUrl: 'https://docs.n8n.io',
  auth: [
    {
      type: 'custom',
      name: 'Webhook',
      description: 'Use n8n webhooks',
      fields: [
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
        { key: 'authHeader', label: 'Auth Header', type: 'password', helpText: 'Optional authentication header' },
      ],
    },
  ],
  triggers: [
    {
      id: 'webhook_received',
      name: 'Webhook Received',
      description: 'Triggers when n8n sends a webhook',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'send_webhook',
      name: 'Send to n8n',
      description: 'Send data to an n8n workflow',
      fields: [
        { key: 'data', label: 'Data (JSON)', type: 'json', required: true },
        { key: 'method', label: 'HTTP Method', type: 'select', options: [
          { value: 'POST', label: 'POST' },
          { value: 'GET', label: 'GET' },
        ], default: 'POST' },
      ],
    },
  ],
};

export const powerAutomateConfig: AppConfig = {
  id: 'power_automate',
  name: 'Power Automate',
  icon: '🔵',
  color: '#0066FF',
  description: 'Microsoft Power Automate flows',
  category: 'automation',
  docsUrl: 'https://docs.microsoft.com/en-us/power-automate/',
  auth: [
    {
      type: 'custom',
      name: 'HTTP Trigger',
      description: 'Use Power Automate HTTP triggers',
      fields: [
        { key: 'flowUrl', label: 'Flow HTTP URL', type: 'url', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'http_request',
      name: 'HTTP Request Received',
      description: 'Triggers when Power Automate sends request',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'trigger_flow',
      name: 'Trigger Flow',
      description: 'Trigger a Power Automate flow',
      fields: [
        { key: 'body', label: 'Request Body', type: 'json', required: true },
      ],
    },
  ],
};

// Add Automation apps
APP_CONFIGS.zapier = zapierConfig;
APP_CONFIGS.make = makeConfig;
APP_CONFIGS.n8n = n8nConfig;
APP_CONFIGS.power_automate = powerAutomateConfig;

// ============================================================================
// STORAGE APPS
// ============================================================================

export const airtableConfig: AppConfig = {
  id: 'airtable',
  name: 'Airtable',
  icon: '📋',
  color: '#18BFFF',
  description: 'Spreadsheet-database hybrid',
  category: 'storage',
  docsUrl: 'https://airtable.com/api',
  auth: [
    {
      type: 'api-key',
      name: 'Personal Access Token',
      description: 'Use your Airtable PAT',
      fields: [
        { key: 'apiKey', label: 'Personal Access Token', type: 'password', required: true, placeholder: 'pat...' },
      ],
    },
    {
      type: 'oauth2',
      name: 'Airtable OAuth',
      description: 'Connect via OAuth',
      scopes: ['data.records:read', 'data.records:write'],
    },
  ],
  triggers: [
    {
      id: 'new_record',
      name: 'New Record',
      description: 'Triggers when a new record is created',
      triggerTypes: ['poll', 'webhook'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', required: true, placeholder: 'appXXXXXXXXXXX' },
        { key: 'tableId', label: 'Table ID/Name', type: 'text', required: true },
        { key: 'viewId', label: 'View ID', type: 'text', helpText: 'Optional: filter by view' },
      ],
    },
    {
      id: 'record_updated',
      name: 'Record Updated',
      description: 'Triggers when a record is modified',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', required: true },
        { key: 'tableId', label: 'Table ID/Name', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'create_record',
      name: 'Create Record',
      description: 'Create a new record',
      fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', required: true },
        { key: 'tableId', label: 'Table ID/Name', type: 'text', required: true },
        { key: 'fields', label: 'Fields', type: 'json', required: true, helpText: '{"Name": "Value", "Status": "Active"}' },
      ],
    },
    {
      id: 'update_record',
      name: 'Update Record',
      description: 'Update an existing record',
      fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', required: true },
        { key: 'tableId', label: 'Table ID/Name', type: 'text', required: true },
        { key: 'recordId', label: 'Record ID', type: 'text', required: true, placeholder: 'recXXXXXXXXX' },
        { key: 'fields', label: 'Fields', type: 'json', required: true },
      ],
    },
    {
      id: 'get_record',
      name: 'Get Record',
      description: 'Retrieve a specific record',
      fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', required: true },
        { key: 'tableId', label: 'Table ID/Name', type: 'text', required: true },
        { key: 'recordId', label: 'Record ID', type: 'text', required: true },
      ],
    },
    {
      id: 'list_records',
      name: 'List Records',
      description: 'Get records from a table',
      fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', required: true },
        { key: 'tableId', label: 'Table ID/Name', type: 'text', required: true },
        { key: 'viewId', label: 'View ID', type: 'text' },
        { key: 'filterByFormula', label: 'Filter Formula', type: 'text', placeholder: "{Status} = 'Active'" },
        { key: 'maxRecords', label: 'Max Records', type: 'number', default: 100 },
        { key: 'sort', label: 'Sort', type: 'json', placeholder: '[{"field": "Name", "direction": "asc"}]' },
      ],
    },
    {
      id: 'delete_record',
      name: 'Delete Record',
      description: 'Delete a record',
      fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', required: true },
        { key: 'tableId', label: 'Table ID/Name', type: 'text', required: true },
        { key: 'recordId', label: 'Record ID', type: 'text', required: true },
      ],
    },
  ],
};

export const notionConfig: AppConfig = {
  id: 'notion',
  name: 'Notion',
  icon: '📓',
  color: '#000000',
  description: 'All-in-one workspace',
  category: 'storage',
  docsUrl: 'https://developers.notion.com',
  auth: [
    {
      type: 'oauth2',
      name: 'Notion Integration',
      description: 'Connect your Notion workspace',
      scopes: [],
    },
    {
      type: 'api-key',
      name: 'Internal Integration',
      description: 'Use an internal integration token',
      fields: [
        { key: 'apiKey', label: 'Integration Token', type: 'password', required: true, placeholder: 'secret_xxx' },
      ],
    },
  ],
  triggers: [
    {
      id: 'new_database_item',
      name: 'New Database Item',
      description: 'Triggers when an item is added to a database',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'databaseId', label: 'Database ID', type: 'text', required: true },
      ],
    },
    {
      id: 'database_item_updated',
      name: 'Database Item Updated',
      description: 'Triggers when a database item is modified',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'databaseId', label: 'Database ID', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'create_page',
      name: 'Create Page',
      description: 'Create a new page',
      fields: [
        { key: 'parentId', label: 'Parent Page/Database ID', type: 'text', required: true },
        { key: 'parentType', label: 'Parent Type', type: 'select', required: true, options: [
          { value: 'page_id', label: 'Page' },
          { value: 'database_id', label: 'Database' },
        ]},
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'properties', label: 'Properties (for DB)', type: 'json', helpText: 'Database properties JSON' },
        { key: 'content', label: 'Content', type: 'textarea' },
      ],
    },
    {
      id: 'update_page',
      name: 'Update Page',
      description: 'Update page properties',
      fields: [
        { key: 'pageId', label: 'Page ID', type: 'text', required: true },
        { key: 'properties', label: 'Properties', type: 'json', required: true },
      ],
    },
    {
      id: 'append_block',
      name: 'Append Content',
      description: 'Append content to a page',
      fields: [
        { key: 'pageId', label: 'Page ID', type: 'text', required: true },
        { key: 'content', label: 'Content', type: 'textarea', required: true },
        { key: 'blockType', label: 'Block Type', type: 'select', options: [
          { value: 'paragraph', label: 'Paragraph' },
          { value: 'heading_1', label: 'Heading 1' },
          { value: 'heading_2', label: 'Heading 2' },
          { value: 'bulleted_list_item', label: 'Bullet Point' },
          { value: 'numbered_list_item', label: 'Numbered List' },
          { value: 'to_do', label: 'To-do' },
        ], default: 'paragraph' },
      ],
    },
    {
      id: 'query_database',
      name: 'Query Database',
      description: 'Query a Notion database',
      fields: [
        { key: 'databaseId', label: 'Database ID', type: 'text', required: true },
        { key: 'filter', label: 'Filter', type: 'json', helpText: 'Notion filter object' },
        { key: 'sorts', label: 'Sorts', type: 'json' },
        { key: 'pageSize', label: 'Page Size', type: 'number', default: 100 },
      ],
    },
    {
      id: 'get_page',
      name: 'Get Page',
      description: 'Retrieve a page',
      fields: [
        { key: 'pageId', label: 'Page ID', type: 'text', required: true },
      ],
    },
  ],
};

export const firebaseConfig: AppConfig = {
  id: 'firebase',
  name: 'Firebase',
  icon: '🔥',
  color: '#FFCA28',
  description: 'Google Firebase backend services',
  category: 'storage',
  docsUrl: 'https://firebase.google.com/docs',
  auth: [
    {
      type: 'custom',
      name: 'Service Account',
      description: 'Use Firebase service account credentials',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'serviceAccount', label: 'Service Account JSON', type: 'json', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'document_created',
      name: 'Document Created',
      description: 'Triggers when a Firestore document is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'collection', label: 'Collection Path', type: 'text', required: true, placeholder: 'users' },
      ],
    },
    {
      id: 'document_updated',
      name: 'Document Updated',
      description: 'Triggers when a document is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'collection', label: 'Collection Path', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'create_document',
      name: 'Create Document',
      description: 'Create a new Firestore document',
      fields: [
        { key: 'collection', label: 'Collection Path', type: 'text', required: true },
        { key: 'documentId', label: 'Document ID', type: 'text', helpText: 'Optional: auto-generated if empty' },
        { key: 'data', label: 'Document Data', type: 'json', required: true },
      ],
    },
    {
      id: 'update_document',
      name: 'Update Document',
      description: 'Update an existing document',
      fields: [
        { key: 'documentPath', label: 'Document Path', type: 'text', required: true, placeholder: 'users/user123' },
        { key: 'data', label: 'Update Data', type: 'json', required: true },
        { key: 'merge', label: 'Merge', type: 'boolean', default: true, helpText: 'Merge with existing data' },
      ],
    },
    {
      id: 'get_document',
      name: 'Get Document',
      description: 'Retrieve a document',
      fields: [
        { key: 'documentPath', label: 'Document Path', type: 'text', required: true },
      ],
    },
    {
      id: 'query_collection',
      name: 'Query Collection',
      description: 'Query documents in a collection',
      fields: [
        { key: 'collection', label: 'Collection Path', type: 'text', required: true },
        { key: 'where', label: 'Where Conditions', type: 'json', placeholder: '[["status", "==", "active"]]' },
        { key: 'orderBy', label: 'Order By', type: 'text' },
        { key: 'limit', label: 'Limit', type: 'number', default: 100 },
      ],
    },
    {
      id: 'delete_document',
      name: 'Delete Document',
      description: 'Delete a document',
      fields: [
        { key: 'documentPath', label: 'Document Path', type: 'text', required: true },
      ],
    },
  ],
};

export const supabaseConfig: AppConfig = {
  id: 'supabase',
  name: 'Supabase',
  icon: '⚡',
  color: '#3ECF8E',
  description: 'Open source Firebase alternative',
  category: 'storage',
  docsUrl: 'https://supabase.com/docs',
  auth: [
    {
      type: 'api-key',
      name: 'Supabase Credentials',
      description: 'Use your Supabase project credentials',
      fields: [
        { key: 'projectUrl', label: 'Project URL', type: 'url', required: true, placeholder: 'https://xxx.supabase.co' },
        { key: 'anonKey', label: 'Anon/Public Key', type: 'password', required: true },
        { key: 'serviceKey', label: 'Service Key', type: 'password', helpText: 'Optional: for admin access' },
      ],
    },
  ],
  triggers: [
    {
      id: 'row_inserted',
      name: 'Row Inserted',
      description: 'Triggers when a row is inserted',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'table', label: 'Table Name', type: 'text', required: true },
        { key: 'schema', label: 'Schema', type: 'text', default: 'public' },
      ],
    },
    {
      id: 'row_updated',
      name: 'Row Updated',
      description: 'Triggers when a row is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'table', label: 'Table Name', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'insert_row',
      name: 'Insert Row',
      description: 'Insert a new row',
      fields: [
        { key: 'table', label: 'Table Name', type: 'text', required: true },
        { key: 'data', label: 'Row Data', type: 'json', required: true },
        { key: 'returning', label: 'Return Data', type: 'boolean', default: true },
      ],
    },
    {
      id: 'update_rows',
      name: 'Update Rows',
      description: 'Update rows matching criteria',
      fields: [
        { key: 'table', label: 'Table Name', type: 'text', required: true },
        { key: 'data', label: 'Update Data', type: 'json', required: true },
        { key: 'match', label: 'Match Criteria', type: 'json', required: true, placeholder: '{"id": "123"}' },
      ],
    },
    {
      id: 'select_rows',
      name: 'Select Rows',
      description: 'Query rows from a table',
      fields: [
        { key: 'table', label: 'Table Name', type: 'text', required: true },
        { key: 'columns', label: 'Columns', type: 'text', default: '*' },
        { key: 'filter', label: 'Filter', type: 'json', placeholder: '{"status": "active"}' },
        { key: 'order', label: 'Order By', type: 'text' },
        { key: 'limit', label: 'Limit', type: 'number' },
      ],
    },
    {
      id: 'delete_rows',
      name: 'Delete Rows',
      description: 'Delete rows matching criteria',
      fields: [
        { key: 'table', label: 'Table Name', type: 'text', required: true },
        { key: 'match', label: 'Match Criteria', type: 'json', required: true },
      ],
    },
    {
      id: 'rpc',
      name: 'Call Function',
      description: 'Call a database function',
      fields: [
        { key: 'functionName', label: 'Function Name', type: 'text', required: true },
        { key: 'params', label: 'Parameters', type: 'json' },
      ],
    },
  ],
};

export const mongodbConfig: AppConfig = {
  id: 'mongodb',
  name: 'MongoDB',
  icon: '🍃',
  color: '#47A248',
  description: 'NoSQL document database',
  category: 'storage',
  docsUrl: 'https://docs.mongodb.com',
  auth: [
    {
      type: 'custom',
      name: 'Connection String',
      description: 'Use MongoDB connection string',
      fields: [
        { key: 'connectionString', label: 'Connection String', type: 'password', required: true, placeholder: 'mongodb+srv://...' },
        { key: 'database', label: 'Database Name', type: 'text', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'document_inserted',
      name: 'Document Inserted',
      description: 'Triggers when a document is inserted',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'collection', label: 'Collection', type: 'text', required: true },
      ],
    },
    {
      id: 'document_updated',
      name: 'Document Updated',
      description: 'Triggers when a document is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'collection', label: 'Collection', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'insert_document',
      name: 'Insert Document',
      description: 'Insert a new document',
      fields: [
        { key: 'collection', label: 'Collection', type: 'text', required: true },
        { key: 'document', label: 'Document', type: 'json', required: true },
      ],
    },
    {
      id: 'update_document',
      name: 'Update Document',
      description: 'Update documents matching filter',
      fields: [
        { key: 'collection', label: 'Collection', type: 'text', required: true },
        { key: 'filter', label: 'Filter', type: 'json', required: true },
        { key: 'update', label: 'Update', type: 'json', required: true, helpText: '{"$set": {"field": "value"}}' },
        { key: 'upsert', label: 'Upsert', type: 'boolean', default: false },
      ],
    },
    {
      id: 'find_documents',
      name: 'Find Documents',
      description: 'Query documents',
      fields: [
        { key: 'collection', label: 'Collection', type: 'text', required: true },
        { key: 'filter', label: 'Filter', type: 'json', default: '{}' },
        { key: 'projection', label: 'Projection', type: 'json', helpText: '{"field": 1}' },
        { key: 'sort', label: 'Sort', type: 'json' },
        { key: 'limit', label: 'Limit', type: 'number', default: 100 },
      ],
    },
    {
      id: 'delete_documents',
      name: 'Delete Documents',
      description: 'Delete documents matching filter',
      fields: [
        { key: 'collection', label: 'Collection', type: 'text', required: true },
        { key: 'filter', label: 'Filter', type: 'json', required: true },
      ],
    },
    {
      id: 'aggregate',
      name: 'Aggregate',
      description: 'Run an aggregation pipeline',
      fields: [
        { key: 'collection', label: 'Collection', type: 'text', required: true },
        { key: 'pipeline', label: 'Pipeline', type: 'json', required: true, placeholder: '[{"$match": {...}}, {"$group": {...}}]' },
      ],
    },
  ],
};

export const awsS3Config: AppConfig = {
  id: 'aws_s3',
  name: 'AWS S3',
  icon: '🪣',
  color: '#FF9900',
  description: 'Amazon S3 cloud storage',
  category: 'storage',
  docsUrl: 'https://docs.aws.amazon.com/s3/',
  auth: [
    {
      type: 'api-key',
      name: 'AWS Credentials',
      description: 'Use AWS access keys',
      fields: [
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
        { key: 'region', label: 'Region', type: 'text', required: true, default: 'us-east-1' },
      ],
    },
  ],
  triggers: [
    {
      id: 'object_created',
      name: 'Object Created',
      description: 'Triggers when a new object is uploaded',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
        { key: 'prefix', label: 'Prefix Filter', type: 'text', helpText: 'Filter by object prefix' },
        { key: 'suffix', label: 'Suffix Filter', type: 'text', helpText: 'Filter by file extension' },
      ],
    },
  ],
  actions: [
    {
      id: 'upload_file',
      name: 'Upload File',
      description: 'Upload a file to S3',
      fields: [
        { key: 'bucket', label: 'Bucket', type: 'text', required: true },
        { key: 'key', label: 'Object Key', type: 'text', required: true, placeholder: 'folder/filename.ext' },
        { key: 'body', label: 'File Content/URL', type: 'url', required: true },
        { key: 'contentType', label: 'Content Type', type: 'text', placeholder: 'application/pdf' },
        { key: 'acl', label: 'ACL', type: 'select', options: [
          { value: 'private', label: 'Private' },
          { value: 'public-read', label: 'Public Read' },
        ], default: 'private' },
      ],
    },
    {
      id: 'get_object',
      name: 'Get Object',
      description: 'Download an object from S3',
      fields: [
        { key: 'bucket', label: 'Bucket', type: 'text', required: true },
        { key: 'key', label: 'Object Key', type: 'text', required: true },
      ],
    },
    {
      id: 'list_objects',
      name: 'List Objects',
      description: 'List objects in a bucket',
      fields: [
        { key: 'bucket', label: 'Bucket', type: 'text', required: true },
        { key: 'prefix', label: 'Prefix', type: 'text' },
        { key: 'maxKeys', label: 'Max Results', type: 'number', default: 1000 },
      ],
    },
    {
      id: 'delete_object',
      name: 'Delete Object',
      description: 'Delete an object',
      fields: [
        { key: 'bucket', label: 'Bucket', type: 'text', required: true },
        { key: 'key', label: 'Object Key', type: 'text', required: true },
      ],
    },
    {
      id: 'copy_object',
      name: 'Copy Object',
      description: 'Copy an object to a new location',
      fields: [
        { key: 'sourceBucket', label: 'Source Bucket', type: 'text', required: true },
        { key: 'sourceKey', label: 'Source Key', type: 'text', required: true },
        { key: 'destBucket', label: 'Destination Bucket', type: 'text', required: true },
        { key: 'destKey', label: 'Destination Key', type: 'text', required: true },
      ],
    },
    {
      id: 'generate_presigned_url',
      name: 'Generate Presigned URL',
      description: 'Create a temporary access URL',
      fields: [
        { key: 'bucket', label: 'Bucket', type: 'text', required: true },
        { key: 'key', label: 'Object Key', type: 'text', required: true },
        { key: 'operation', label: 'Operation', type: 'select', options: [
          { value: 'getObject', label: 'Download' },
          { value: 'putObject', label: 'Upload' },
        ], default: 'getObject' },
        { key: 'expiresIn', label: 'Expires In (seconds)', type: 'number', default: 3600 },
      ],
    },
  ],
};

export const dropboxConfig: AppConfig = {
  id: 'dropbox',
  name: 'Dropbox',
  icon: '📦',
  color: '#0061FF',
  description: 'Cloud file storage and sharing',
  category: 'storage',
  docsUrl: 'https://www.dropbox.com/developers',
  auth: [
    {
      type: 'oauth2',
      name: 'Dropbox Account',
      description: 'Connect your Dropbox account',
      scopes: ['files.metadata.read', 'files.content.write', 'files.content.read'],
    },
  ],
  triggers: [
    {
      id: 'new_file',
      name: 'New File',
      description: 'Triggers when a new file is added',
      triggerTypes: ['poll', 'webhook'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'folder', label: 'Folder Path', type: 'text', default: '', placeholder: '/path/to/folder' },
      ],
    },
    {
      id: 'file_updated',
      name: 'File Updated',
      description: 'Triggers when a file is modified',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'folder', label: 'Folder Path', type: 'text' },
      ],
    },
  ],
  actions: [
    {
      id: 'upload_file',
      name: 'Upload File',
      description: 'Upload a file to Dropbox',
      fields: [
        { key: 'path', label: 'Destination Path', type: 'text', required: true, placeholder: '/folder/filename.ext' },
        { key: 'content', label: 'File Content/URL', type: 'url', required: true },
        { key: 'mode', label: 'Write Mode', type: 'select', options: [
          { value: 'add', label: 'Add (fail if exists)' },
          { value: 'overwrite', label: 'Overwrite' },
        ], default: 'add' },
      ],
    },
    {
      id: 'download_file',
      name: 'Download File',
      description: 'Download a file',
      fields: [
        { key: 'path', label: 'File Path', type: 'text', required: true },
      ],
    },
    {
      id: 'list_folder',
      name: 'List Folder',
      description: 'List contents of a folder',
      fields: [
        { key: 'path', label: 'Folder Path', type: 'text', default: '' },
        { key: 'recursive', label: 'Recursive', type: 'boolean', default: false },
      ],
    },
    {
      id: 'create_folder',
      name: 'Create Folder',
      description: 'Create a new folder',
      fields: [
        { key: 'path', label: 'Folder Path', type: 'text', required: true },
      ],
    },
    {
      id: 'move_file',
      name: 'Move/Rename',
      description: 'Move or rename a file',
      fields: [
        { key: 'fromPath', label: 'From Path', type: 'text', required: true },
        { key: 'toPath', label: 'To Path', type: 'text', required: true },
      ],
    },
    {
      id: 'delete_file',
      name: 'Delete',
      description: 'Delete a file or folder',
      fields: [
        { key: 'path', label: 'Path', type: 'text', required: true },
      ],
    },
    {
      id: 'create_shared_link',
      name: 'Create Shared Link',
      description: 'Create a shareable link',
      fields: [
        { key: 'path', label: 'File Path', type: 'text', required: true },
      ],
    },
  ],
};

// Add Storage apps
APP_CONFIGS.airtable = airtableConfig;
APP_CONFIGS.notion = notionConfig;
APP_CONFIGS.firebase = firebaseConfig;
APP_CONFIGS.supabase = supabaseConfig;
APP_CONFIGS.mongodb = mongodbConfig;
APP_CONFIGS.aws_s3 = awsS3Config;
APP_CONFIGS.dropbox = dropboxConfig;

// ============================================================================
// E-COMMERCE APPS
// ============================================================================

export const stripeConfig: AppConfig = {
  id: 'stripe',
  name: 'Stripe',
  icon: '💳',
  color: '#635BFF',
  description: 'Payment processing platform',
  category: 'ecommerce',
  docsUrl: 'https://stripe.com/docs/api',
  auth: [
    {
      type: 'api-key',
      name: 'Stripe API Key',
      description: 'Use your Stripe secret key',
      fields: [
        { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, placeholder: 'sk_live_xxx or sk_test_xxx' },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', helpText: 'For webhook signature verification' },
      ],
    },
  ],
  triggers: [
    {
      id: 'payment_succeeded',
      name: 'Payment Succeeded',
      description: 'Triggers when a payment is successful',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'payment_failed',
      name: 'Payment Failed',
      description: 'Triggers when a payment fails',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'subscription_created',
      name: 'Subscription Created',
      description: 'Triggers when a new subscription is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'subscription_updated',
      name: 'Subscription Updated',
      description: 'Triggers when a subscription is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'subscription_canceled',
      name: 'Subscription Canceled',
      description: 'Triggers when a subscription is canceled',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'invoice_paid',
      name: 'Invoice Paid',
      description: 'Triggers when an invoice is paid',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'customer_created',
      name: 'Customer Created',
      description: 'Triggers when a new customer is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'create_customer',
      name: 'Create Customer',
      description: 'Create a new Stripe customer',
      fields: [
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'metadata', label: 'Metadata', type: 'json' },
      ],
    },
    {
      id: 'create_payment_intent',
      name: 'Create Payment Intent',
      description: 'Create a payment intent',
      fields: [
        { key: 'amount', label: 'Amount (in cents)', type: 'number', required: true },
        { key: 'currency', label: 'Currency', type: 'text', required: true, default: 'usd' },
        { key: 'customerId', label: 'Customer ID', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'metadata', label: 'Metadata', type: 'json' },
        { key: 'paymentMethodTypes', label: 'Payment Methods', type: 'json', default: '["card"]' },
      ],
    },
    {
      id: 'create_subscription',
      name: 'Create Subscription',
      description: 'Create a new subscription',
      fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', required: true },
        { key: 'priceId', label: 'Price ID', type: 'text', required: true },
        { key: 'trialPeriodDays', label: 'Trial Days', type: 'number' },
        { key: 'metadata', label: 'Metadata', type: 'json' },
      ],
    },
    {
      id: 'cancel_subscription',
      name: 'Cancel Subscription',
      description: 'Cancel a subscription',
      fields: [
        { key: 'subscriptionId', label: 'Subscription ID', type: 'text', required: true },
        { key: 'cancelAtPeriodEnd', label: 'Cancel at Period End', type: 'boolean', default: true },
      ],
    },
    {
      id: 'create_invoice',
      name: 'Create Invoice',
      description: 'Create a new invoice',
      fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', required: true },
        { key: 'autoAdvance', label: 'Auto Finalize', type: 'boolean', default: true },
        { key: 'description', label: 'Description', type: 'text' },
      ],
    },
    {
      id: 'get_customer',
      name: 'Get Customer',
      description: 'Retrieve customer details',
      fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', required: true },
      ],
    },
    {
      id: 'refund_payment',
      name: 'Create Refund',
      description: 'Refund a payment',
      fields: [
        { key: 'paymentIntentId', label: 'Payment Intent ID', type: 'text', required: true },
        { key: 'amount', label: 'Amount (in cents)', type: 'number', helpText: 'Leave empty for full refund' },
        { key: 'reason', label: 'Reason', type: 'select', options: [
          { value: 'duplicate', label: 'Duplicate' },
          { value: 'fraudulent', label: 'Fraudulent' },
          { value: 'requested_by_customer', label: 'Customer Request' },
        ]},
      ],
    },
  ],
};

export const razorpayConfig: AppConfig = {
  id: 'razorpay',
  name: 'Razorpay',
  icon: '💰',
  color: '#528FF0',
  description: 'Indian payment gateway',
  category: 'ecommerce',
  docsUrl: 'https://razorpay.com/docs/api',
  auth: [
    {
      type: 'api-key',
      name: 'Razorpay Credentials',
      description: 'Use your Razorpay API keys',
      fields: [
        { key: 'keyId', label: 'Key ID', type: 'text', required: true, placeholder: 'rzp_live_xxx' },
        { key: 'keySecret', label: 'Key Secret', type: 'password', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
      ],
    },
  ],
  triggers: [
    {
      id: 'payment_captured',
      name: 'Payment Captured',
      description: 'Triggers when payment is captured',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'payment_failed',
      name: 'Payment Failed',
      description: 'Triggers when payment fails',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'subscription_activated',
      name: 'Subscription Activated',
      description: 'Triggers when subscription is activated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'refund_processed',
      name: 'Refund Processed',
      description: 'Triggers when refund is processed',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'create_order',
      name: 'Create Order',
      description: 'Create a new order',
      fields: [
        { key: 'amount', label: 'Amount (in paise)', type: 'number', required: true },
        { key: 'currency', label: 'Currency', type: 'text', default: 'INR' },
        { key: 'receipt', label: 'Receipt ID', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'json' },
      ],
    },
    {
      id: 'capture_payment',
      name: 'Capture Payment',
      description: 'Capture an authorized payment',
      fields: [
        { key: 'paymentId', label: 'Payment ID', type: 'text', required: true },
        { key: 'amount', label: 'Amount', type: 'number', required: true },
        { key: 'currency', label: 'Currency', type: 'text', default: 'INR' },
      ],
    },
    {
      id: 'create_refund',
      name: 'Create Refund',
      description: 'Refund a payment',
      fields: [
        { key: 'paymentId', label: 'Payment ID', type: 'text', required: true },
        { key: 'amount', label: 'Amount (in paise)', type: 'number' },
        { key: 'notes', label: 'Notes', type: 'json' },
      ],
    },
    {
      id: 'get_payment',
      name: 'Get Payment',
      description: 'Fetch payment details',
      fields: [
        { key: 'paymentId', label: 'Payment ID', type: 'text', required: true },
      ],
    },
    {
      id: 'create_customer',
      name: 'Create Customer',
      description: 'Create a customer',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'contact', label: 'Phone', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'json' },
      ],
    },
  ],
};

export const shopifyConfig: AppConfig = {
  id: 'shopify',
  name: 'Shopify',
  icon: '🛒',
  color: '#96BF48',
  description: 'E-commerce platform',
  category: 'ecommerce',
  docsUrl: 'https://shopify.dev/docs/api',
  auth: [
    {
      type: 'api-key',
      name: 'Shopify Admin API',
      description: 'Use your Shopify Admin API credentials',
      fields: [
        { key: 'shopDomain', label: 'Shop Domain', type: 'text', required: true, placeholder: 'your-store.myshopify.com' },
        { key: 'accessToken', label: 'Admin API Access Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'order_created',
      name: 'New Order',
      description: 'Triggers when a new order is placed',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'order_paid',
      name: 'Order Paid',
      description: 'Triggers when an order is paid',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'order_fulfilled',
      name: 'Order Fulfilled',
      description: 'Triggers when an order is fulfilled',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'customer_created',
      name: 'New Customer',
      description: 'Triggers when a customer is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'product_created',
      name: 'New Product',
      description: 'Triggers when a product is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'product_updated',
      name: 'Product Updated',
      description: 'Triggers when a product is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'create_order',
      name: 'Create Order',
      description: 'Create a new order',
      fields: [
        { key: 'lineItems', label: 'Line Items', type: 'json', required: true, helpText: '[{"variant_id": 123, "quantity": 1}]' },
        { key: 'customerId', label: 'Customer ID', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'financialStatus', label: 'Financial Status', type: 'select', options: [
          { value: 'pending', label: 'Pending' },
          { value: 'paid', label: 'Paid' },
        ]},
        { key: 'shippingAddress', label: 'Shipping Address', type: 'json' },
        { key: 'tags', label: 'Tags', type: 'text' },
      ],
    },
    {
      id: 'update_order',
      name: 'Update Order',
      description: 'Update an order',
      fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', required: true },
        { key: 'note', label: 'Note', type: 'textarea' },
        { key: 'tags', label: 'Tags', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
      ],
    },
    {
      id: 'get_order',
      name: 'Get Order',
      description: 'Retrieve order details',
      fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', required: true },
      ],
    },
    {
      id: 'create_product',
      name: 'Create Product',
      description: 'Create a new product',
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'bodyHtml', label: 'Description (HTML)', type: 'textarea' },
        { key: 'vendor', label: 'Vendor', type: 'text' },
        { key: 'productType', label: 'Product Type', type: 'text' },
        { key: 'tags', label: 'Tags', type: 'text' },
        { key: 'variants', label: 'Variants', type: 'json', helpText: '[{"price": "19.99", "sku": "SKU123"}]' },
        { key: 'images', label: 'Image URLs', type: 'json', placeholder: '[{"src": "https://..."}]' },
      ],
    },
    {
      id: 'update_product',
      name: 'Update Product',
      description: 'Update a product',
      fields: [
        { key: 'productId', label: 'Product ID', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'bodyHtml', label: 'Description', type: 'textarea' },
        { key: 'tags', label: 'Tags', type: 'text' },
      ],
    },
    {
      id: 'update_inventory',
      name: 'Update Inventory',
      description: 'Adjust inventory levels',
      fields: [
        { key: 'inventoryItemId', label: 'Inventory Item ID', type: 'text', required: true },
        { key: 'locationId', label: 'Location ID', type: 'text', required: true },
        { key: 'adjustment', label: 'Adjustment', type: 'number', required: true, helpText: 'Positive or negative number' },
      ],
    },
    {
      id: 'create_customer',
      name: 'Create Customer',
      description: 'Create a customer',
      fields: [
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'tags', label: 'Tags', type: 'text' },
        { key: 'addresses', label: 'Addresses', type: 'json' },
      ],
    },
    {
      id: 'fulfill_order',
      name: 'Fulfill Order',
      description: 'Create a fulfillment',
      fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', required: true },
        { key: 'trackingNumber', label: 'Tracking Number', type: 'text' },
        { key: 'trackingCompany', label: 'Tracking Company', type: 'text' },
        { key: 'notifyCustomer', label: 'Notify Customer', type: 'boolean', default: true },
      ],
    },
  ],
};

export const woocommerceConfig: AppConfig = {
  id: 'woocommerce',
  name: 'WooCommerce',
  icon: '🛍️',
  color: '#96588A',
  description: 'WordPress e-commerce plugin',
  category: 'ecommerce',
  docsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
  auth: [
    {
      type: 'api-key',
      name: 'WooCommerce API',
      description: 'Use WooCommerce REST API credentials',
      fields: [
        { key: 'siteUrl', label: 'Site URL', type: 'url', required: true, placeholder: 'https://yourstore.com' },
        { key: 'consumerKey', label: 'Consumer Key', type: 'text', required: true, placeholder: 'ck_xxx' },
        { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'order_created',
      name: 'New Order',
      description: 'Triggers when an order is created',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'order_updated',
      name: 'Order Updated',
      description: 'Triggers when an order status changes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'customer_created',
      name: 'New Customer',
      description: 'Triggers when a customer is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'product_created',
      name: 'New Product',
      description: 'Triggers when a product is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'create_order',
      name: 'Create Order',
      description: 'Create a new order',
      fields: [
        { key: 'lineItems', label: 'Line Items', type: 'json', required: true },
        { key: 'customerId', label: 'Customer ID', type: 'text' },
        { key: 'billing', label: 'Billing Address', type: 'json' },
        { key: 'shipping', label: 'Shipping Address', type: 'json' },
        { key: 'paymentMethod', label: 'Payment Method', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'completed', label: 'Completed' },
        ], default: 'pending' },
      ],
    },
    {
      id: 'update_order',
      name: 'Update Order',
      description: 'Update an order',
      fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', required: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'on-hold', label: 'On Hold' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'refunded', label: 'Refunded' },
        ]},
        { key: 'note', label: 'Order Note', type: 'textarea' },
      ],
    },
    {
      id: 'get_order',
      name: 'Get Order',
      description: 'Retrieve order details',
      fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', required: true },
      ],
    },
    {
      id: 'create_product',
      name: 'Create Product',
      description: 'Create a product',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'type', label: 'Type', type: 'select', options: [
          { value: 'simple', label: 'Simple' },
          { value: 'variable', label: 'Variable' },
        ], default: 'simple' },
        { key: 'regularPrice', label: 'Price', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'shortDescription', label: 'Short Description', type: 'textarea' },
        { key: 'sku', label: 'SKU', type: 'text' },
        { key: 'stockQuantity', label: 'Stock Quantity', type: 'number' },
        { key: 'categories', label: 'Categories', type: 'json', placeholder: '[{"id": 1}]' },
        { key: 'images', label: 'Images', type: 'json', placeholder: '[{"src": "https://..."}]' },
      ],
    },
    {
      id: 'update_stock',
      name: 'Update Stock',
      description: 'Update product stock',
      fields: [
        { key: 'productId', label: 'Product ID', type: 'text', required: true },
        { key: 'stockQuantity', label: 'Stock Quantity', type: 'number', required: true },
        { key: 'stockStatus', label: 'Stock Status', type: 'select', options: [
          { value: 'instock', label: 'In Stock' },
          { value: 'outofstock', label: 'Out of Stock' },
          { value: 'onbackorder', label: 'On Backorder' },
        ]},
      ],
    },
    {
      id: 'create_customer',
      name: 'Create Customer',
      description: 'Create a customer',
      fields: [
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'firstName', label: 'First Name', type: 'text' },
        { key: 'lastName', label: 'Last Name', type: 'text' },
        { key: 'username', label: 'Username', type: 'text' },
        { key: 'billing', label: 'Billing Address', type: 'json' },
        { key: 'shipping', label: 'Shipping Address', type: 'json' },
      ],
    },
  ],
};

export const paypalConfig: AppConfig = {
  id: 'paypal',
  name: 'PayPal',
  icon: '💵',
  color: '#003087',
  description: 'Online payment system',
  category: 'ecommerce',
  docsUrl: 'https://developer.paypal.com/docs/api',
  auth: [
    {
      type: 'api-key',
      name: 'PayPal API',
      description: 'Use your PayPal API credentials',
      fields: [
        { key: 'clientId', label: 'Client ID', type: 'text', required: true },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { key: 'environment', label: 'Environment', type: 'select', options: [
          { value: 'sandbox', label: 'Sandbox' },
          { value: 'live', label: 'Live' },
        ], default: 'sandbox' },
      ],
    },
  ],
  triggers: [
    {
      id: 'payment_completed',
      name: 'Payment Completed',
      description: 'Triggers when a payment is completed',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'payment_refunded',
      name: 'Payment Refunded',
      description: 'Triggers when a payment is refunded',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'subscription_activated',
      name: 'Subscription Activated',
      description: 'Triggers when a subscription is activated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'subscription_cancelled',
      name: 'Subscription Cancelled',
      description: 'Triggers when a subscription is cancelled',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'create_order',
      name: 'Create Order',
      description: 'Create a PayPal order',
      fields: [
        { key: 'amount', label: 'Amount', type: 'number', required: true },
        { key: 'currency', label: 'Currency', type: 'text', default: 'USD' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'returnUrl', label: 'Return URL', type: 'url', required: true },
        { key: 'cancelUrl', label: 'Cancel URL', type: 'url', required: true },
      ],
    },
    {
      id: 'capture_order',
      name: 'Capture Order',
      description: 'Capture an approved order',
      fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', required: true },
      ],
    },
    {
      id: 'refund_capture',
      name: 'Refund Payment',
      description: 'Refund a captured payment',
      fields: [
        { key: 'captureId', label: 'Capture ID', type: 'text', required: true },
        { key: 'amount', label: 'Amount', type: 'number', helpText: 'Leave empty for full refund' },
        { key: 'currency', label: 'Currency', type: 'text', default: 'USD' },
        { key: 'note', label: 'Note to Payer', type: 'text' },
      ],
    },
    {
      id: 'get_order',
      name: 'Get Order Details',
      description: 'Get order details',
      fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', required: true },
      ],
    },
    {
      id: 'create_payout',
      name: 'Create Payout',
      description: 'Send money to recipients',
      fields: [
        { key: 'recipientEmail', label: 'Recipient Email', type: 'email', required: true },
        { key: 'amount', label: 'Amount', type: 'number', required: true },
        { key: 'currency', label: 'Currency', type: 'text', default: 'USD' },
        { key: 'note', label: 'Note', type: 'text' },
      ],
    },
  ],
};

// Add E-commerce apps
APP_CONFIGS.stripe = stripeConfig;
APP_CONFIGS.razorpay = razorpayConfig;
APP_CONFIGS.shopify = shopifyConfig;
APP_CONFIGS.woocommerce = woocommerceConfig;
APP_CONFIGS.paypal = paypalConfig;

// ============================================================================
// PRODUCTIVITY APPS
// ============================================================================

export const trelloConfig: AppConfig = {
  id: 'trello',
  name: 'Trello',
  icon: '📌',
  color: '#0079BF',
  description: 'Kanban-style project management',
  category: 'productivity',
  docsUrl: 'https://developer.atlassian.com/cloud/trello/',
  auth: [
    {
      type: 'api-key',
      name: 'Trello API',
      description: 'Use Trello API key and token',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'text', required: true },
        { key: 'token', label: 'Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'card_created',
      name: 'Card Created',
      description: 'Triggers when a new card is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
        { key: 'listId', label: 'List ID', type: 'text', helpText: 'Optional: specific list' },
      ],
    },
    {
      id: 'card_moved',
      name: 'Card Moved',
      description: 'Triggers when a card is moved to a list',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
        { key: 'listId', label: 'Target List ID', type: 'text', helpText: 'Optional: trigger for specific list' },
      ],
    },
    {
      id: 'card_updated',
      name: 'Card Updated',
      description: 'Triggers when a card is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
      ],
    },
    {
      id: 'comment_added',
      name: 'Comment Added',
      description: 'Triggers when a comment is added',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'create_card',
      name: 'Create Card',
      description: 'Create a new card',
      fields: [
        { key: 'listId', label: 'List ID', type: 'text', required: true },
        { key: 'name', label: 'Card Name', type: 'text', required: true },
        { key: 'desc', label: 'Description', type: 'textarea' },
        { key: 'due', label: 'Due Date', type: 'datetime' },
        { key: 'labels', label: 'Label IDs', type: 'json', placeholder: '["labelId1"]' },
        { key: 'members', label: 'Member IDs', type: 'json' },
        { key: 'pos', label: 'Position', type: 'select', options: [
          { value: 'top', label: 'Top' },
          { value: 'bottom', label: 'Bottom' },
        ], default: 'bottom' },
      ],
    },
    {
      id: 'update_card',
      name: 'Update Card',
      description: 'Update a card',
      fields: [
        { key: 'cardId', label: 'Card ID', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'desc', label: 'Description', type: 'textarea' },
        { key: 'due', label: 'Due Date', type: 'datetime' },
        { key: 'dueComplete', label: 'Due Complete', type: 'boolean' },
        { key: 'closed', label: 'Archived', type: 'boolean' },
      ],
    },
    {
      id: 'move_card',
      name: 'Move Card',
      description: 'Move a card to another list',
      fields: [
        { key: 'cardId', label: 'Card ID', type: 'text', required: true },
        { key: 'listId', label: 'Target List ID', type: 'text', required: true },
        { key: 'pos', label: 'Position', type: 'select', options: [
          { value: 'top', label: 'Top' },
          { value: 'bottom', label: 'Bottom' },
        ]},
      ],
    },
    {
      id: 'add_comment',
      name: 'Add Comment',
      description: 'Add a comment to a card',
      fields: [
        { key: 'cardId', label: 'Card ID', type: 'text', required: true },
        { key: 'text', label: 'Comment', type: 'textarea', required: true },
      ],
    },
    {
      id: 'add_member',
      name: 'Add Member',
      description: 'Add a member to a card',
      fields: [
        { key: 'cardId', label: 'Card ID', type: 'text', required: true },
        { key: 'memberId', label: 'Member ID', type: 'text', required: true },
      ],
    },
    {
      id: 'create_list',
      name: 'Create List',
      description: 'Create a new list',
      fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
        { key: 'name', label: 'List Name', type: 'text', required: true },
        { key: 'pos', label: 'Position', type: 'select', options: [
          { value: 'top', label: 'Top' },
          { value: 'bottom', label: 'Bottom' },
        ]},
      ],
    },
  ],
};

export const asanaConfig: AppConfig = {
  id: 'asana',
  name: 'Asana',
  icon: '✅',
  color: '#F06A6A',
  description: 'Work management platform',
  category: 'productivity',
  docsUrl: 'https://developers.asana.com/docs',
  auth: [
    {
      type: 'oauth2',
      name: 'Asana Account',
      description: 'Connect your Asana account',
      scopes: ['default'],
    },
    {
      type: 'api-key',
      name: 'Personal Access Token',
      description: 'Use a Personal Access Token',
      fields: [
        { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'task_created',
      name: 'Task Created',
      description: 'Triggers when a new task is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
      ],
    },
    {
      id: 'task_completed',
      name: 'Task Completed',
      description: 'Triggers when a task is completed',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
      ],
    },
    {
      id: 'task_updated',
      name: 'Task Updated',
      description: 'Triggers when a task is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'create_task',
      name: 'Create Task',
      description: 'Create a new task',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'name', label: 'Task Name', type: 'text', required: true },
        { key: 'notes', label: 'Description', type: 'textarea' },
        { key: 'dueOn', label: 'Due Date', type: 'datetime' },
        { key: 'assignee', label: 'Assignee ID', type: 'text' },
        { key: 'tags', label: 'Tag IDs', type: 'json' },
      ],
    },
    {
      id: 'update_task',
      name: 'Update Task',
      description: 'Update a task',
      fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'notes', label: 'Description', type: 'textarea' },
        { key: 'completed', label: 'Completed', type: 'boolean' },
        { key: 'dueOn', label: 'Due Date', type: 'datetime' },
        { key: 'assignee', label: 'Assignee ID', type: 'text' },
      ],
    },
    {
      id: 'complete_task',
      name: 'Complete Task',
      description: 'Mark a task as complete',
      fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', required: true },
      ],
    },
    {
      id: 'add_comment',
      name: 'Add Comment',
      description: 'Add a comment to a task',
      fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', required: true },
        { key: 'text', label: 'Comment', type: 'textarea', required: true },
      ],
    },
    {
      id: 'create_subtask',
      name: 'Create Subtask',
      description: 'Create a subtask',
      fields: [
        { key: 'parentTaskId', label: 'Parent Task ID', type: 'text', required: true },
        { key: 'name', label: 'Subtask Name', type: 'text', required: true },
        { key: 'notes', label: 'Description', type: 'textarea' },
      ],
    },
  ],
};

export const jiraConfig: AppConfig = {
  id: 'jira',
  name: 'Jira',
  icon: '🔵',
  color: '#0052CC',
  description: 'Atlassian issue tracking',
  category: 'productivity',
  docsUrl: 'https://developer.atlassian.com/cloud/jira/platform/',
  auth: [
    {
      type: 'oauth2',
      name: 'Atlassian Cloud',
      description: 'Connect via Atlassian OAuth',
      scopes: ['read:jira-work', 'write:jira-work', 'read:jira-user'],
    },
    {
      type: 'api-key',
      name: 'API Token',
      description: 'Use email and API token',
      fields: [
        { key: 'domain', label: 'Jira Domain', type: 'text', required: true, placeholder: 'yourcompany.atlassian.net' },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'issue_created',
      name: 'Issue Created',
      description: 'Triggers when an issue is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectKey', label: 'Project Key', type: 'text' },
        { key: 'issueType', label: 'Issue Type', type: 'text' },
      ],
    },
    {
      id: 'issue_updated',
      name: 'Issue Updated',
      description: 'Triggers when an issue is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectKey', label: 'Project Key', type: 'text' },
      ],
    },
    {
      id: 'issue_transitioned',
      name: 'Issue Status Changed',
      description: 'Triggers when issue status changes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectKey', label: 'Project Key', type: 'text' },
        { key: 'toStatus', label: 'To Status', type: 'text', helpText: 'Optional: specific target status' },
      ],
    },
    {
      id: 'comment_added',
      name: 'Comment Added',
      description: 'Triggers when a comment is added',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectKey', label: 'Project Key', type: 'text' },
      ],
    },
  ],
  actions: [
    {
      id: 'create_issue',
      name: 'Create Issue',
      description: 'Create a new issue',
      fields: [
        { key: 'projectKey', label: 'Project Key', type: 'text', required: true },
        { key: 'issueType', label: 'Issue Type', type: 'select', required: true, options: [
          { value: 'Task', label: 'Task' },
          { value: 'Bug', label: 'Bug' },
          { value: 'Story', label: 'Story' },
          { value: 'Epic', label: 'Epic' },
          { value: 'Sub-task', label: 'Sub-task' },
        ]},
        { key: 'summary', label: 'Summary', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'Highest', label: 'Highest' },
          { value: 'High', label: 'High' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Low', label: 'Low' },
          { value: 'Lowest', label: 'Lowest' },
        ]},
        { key: 'assignee', label: 'Assignee (Account ID)', type: 'text' },
        { key: 'labels', label: 'Labels', type: 'json', placeholder: '["label1", "label2"]' },
        { key: 'customFields', label: 'Custom Fields', type: 'json' },
      ],
    },
    {
      id: 'update_issue',
      name: 'Update Issue',
      description: 'Update an issue',
      fields: [
        { key: 'issueKey', label: 'Issue Key', type: 'text', required: true, placeholder: 'PROJ-123' },
        { key: 'summary', label: 'Summary', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'Highest', label: 'Highest' },
          { value: 'High', label: 'High' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Low', label: 'Low' },
        ]},
        { key: 'assignee', label: 'Assignee', type: 'text' },
      ],
    },
    {
      id: 'transition_issue',
      name: 'Transition Issue',
      description: 'Change issue status',
      fields: [
        { key: 'issueKey', label: 'Issue Key', type: 'text', required: true },
        { key: 'transitionId', label: 'Transition ID', type: 'text', required: true },
        { key: 'comment', label: 'Comment', type: 'textarea' },
      ],
    },
    {
      id: 'add_comment',
      name: 'Add Comment',
      description: 'Add a comment to an issue',
      fields: [
        { key: 'issueKey', label: 'Issue Key', type: 'text', required: true },
        { key: 'body', label: 'Comment', type: 'textarea', required: true },
      ],
    },
    {
      id: 'search_issues',
      name: 'Search Issues (JQL)',
      description: 'Search issues using JQL',
      fields: [
        { key: 'jql', label: 'JQL Query', type: 'textarea', required: true, placeholder: 'project = PROJ AND status = "In Progress"' },
        { key: 'maxResults', label: 'Max Results', type: 'number', default: 50 },
      ],
    },
  ],
};

export const mondayConfig: AppConfig = {
  id: 'monday',
  name: 'Monday.com',
  icon: '📋',
  color: '#FF3D57',
  description: 'Work operating system',
  category: 'productivity',
  docsUrl: 'https://developer.monday.com/api-reference',
  auth: [
    {
      type: 'api-key',
      name: 'API Token',
      description: 'Use your Monday.com API token',
      fields: [
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'item_created',
      name: 'Item Created',
      description: 'Triggers when an item is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
      ],
    },
    {
      id: 'item_changed',
      name: 'Item Changed',
      description: 'Triggers when item columns change',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
        { key: 'columnId', label: 'Column ID', type: 'text', helpText: 'Optional: specific column' },
      ],
    },
    {
      id: 'status_changed',
      name: 'Status Changed',
      description: 'Triggers when status column changes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'create_item',
      name: 'Create Item',
      description: 'Create a new item',
      fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
        { key: 'itemName', label: 'Item Name', type: 'text', required: true },
        { key: 'groupId', label: 'Group ID', type: 'text' },
        { key: 'columnValues', label: 'Column Values', type: 'json', helpText: '{"status": {"label": "Done"}}' },
      ],
    },
    {
      id: 'update_item',
      name: 'Update Item',
      description: 'Update item column values',
      fields: [
        { key: 'itemId', label: 'Item ID', type: 'text', required: true },
        { key: 'boardId', label: 'Board ID', type: 'text', required: true },
        { key: 'columnValues', label: 'Column Values', type: 'json', required: true },
      ],
    },
    {
      id: 'create_update',
      name: 'Add Update',
      description: 'Add an update to an item',
      fields: [
        { key: 'itemId', label: 'Item ID', type: 'text', required: true },
        { key: 'body', label: 'Update Text', type: 'textarea', required: true },
      ],
    },
    {
      id: 'move_item',
      name: 'Move Item to Group',
      description: 'Move item to another group',
      fields: [
        { key: 'itemId', label: 'Item ID', type: 'text', required: true },
        { key: 'groupId', label: 'Target Group ID', type: 'text', required: true },
      ],
    },
  ],
};

export const clickupConfig: AppConfig = {
  id: 'clickup',
  name: 'ClickUp',
  icon: '📊',
  color: '#7B68EE',
  description: 'Project management platform',
  category: 'productivity',
  docsUrl: 'https://clickup.com/api',
  auth: [
    {
      type: 'oauth2',
      name: 'ClickUp Account',
      description: 'Connect your ClickUp account',
      scopes: [],
    },
    {
      type: 'api-key',
      name: 'API Token',
      description: 'Use your API token',
      fields: [
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'task_created',
      name: 'Task Created',
      description: 'Triggers when a task is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'listId', label: 'List ID', type: 'text' },
      ],
    },
    {
      id: 'task_updated',
      name: 'Task Updated',
      description: 'Triggers when a task is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'listId', label: 'List ID', type: 'text' },
      ],
    },
    {
      id: 'task_status_updated',
      name: 'Task Status Changed',
      description: 'Triggers when task status changes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'listId', label: 'List ID', type: 'text' },
      ],
    },
  ],
  actions: [
    {
      id: 'create_task',
      name: 'Create Task',
      description: 'Create a new task',
      fields: [
        { key: 'listId', label: 'List ID', type: 'text', required: true },
        { key: 'name', label: 'Task Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: '1', label: 'Urgent' },
          { value: '2', label: 'High' },
          { value: '3', label: 'Normal' },
          { value: '4', label: 'Low' },
        ]},
        { key: 'dueDate', label: 'Due Date', type: 'datetime' },
        { key: 'assignees', label: 'Assignee IDs', type: 'json' },
        { key: 'tags', label: 'Tags', type: 'json' },
      ],
    },
    {
      id: 'update_task',
      name: 'Update Task',
      description: 'Update a task',
      fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: '1', label: 'Urgent' },
          { value: '2', label: 'High' },
          { value: '3', label: 'Normal' },
          { value: '4', label: 'Low' },
        ]},
      ],
    },
    {
      id: 'add_comment',
      name: 'Add Comment',
      description: 'Add a comment to a task',
      fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', required: true },
        { key: 'commentText', label: 'Comment', type: 'textarea', required: true },
      ],
    },
  ],
};

export const linearConfig: AppConfig = {
  id: 'linear',
  name: 'Linear',
  icon: '📐',
  color: '#5E6AD2',
  description: 'Issue tracking for software teams',
  category: 'productivity',
  docsUrl: 'https://developers.linear.app',
  auth: [
    {
      type: 'oauth2',
      name: 'Linear Account',
      description: 'Connect your Linear workspace',
      scopes: ['read', 'write'],
    },
    {
      type: 'api-key',
      name: 'API Key',
      description: 'Use a Linear API key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'issue_created',
      name: 'Issue Created',
      description: 'Triggers when an issue is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'teamId', label: 'Team ID', type: 'text' },
      ],
    },
    {
      id: 'issue_updated',
      name: 'Issue Updated',
      description: 'Triggers when an issue is updated',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'teamId', label: 'Team ID', type: 'text' },
      ],
    },
    {
      id: 'issue_status_changed',
      name: 'Issue Status Changed',
      description: 'Triggers when issue state changes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'teamId', label: 'Team ID', type: 'text' },
        { key: 'toState', label: 'To State', type: 'text' },
      ],
    },
  ],
  actions: [
    {
      id: 'create_issue',
      name: 'Create Issue',
      description: 'Create a new issue',
      fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: '1', label: 'Urgent' },
          { value: '2', label: 'High' },
          { value: '3', label: 'Medium' },
          { value: '4', label: 'Low' },
          { value: '0', label: 'No Priority' },
        ]},
        { key: 'stateId', label: 'State ID', type: 'text' },
        { key: 'assigneeId', label: 'Assignee ID', type: 'text' },
        { key: 'labelIds', label: 'Label IDs', type: 'json' },
      ],
    },
    {
      id: 'update_issue',
      name: 'Update Issue',
      description: 'Update an issue',
      fields: [
        { key: 'issueId', label: 'Issue ID', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'stateId', label: 'State ID', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'number' },
        { key: 'assigneeId', label: 'Assignee ID', type: 'text' },
      ],
    },
    {
      id: 'add_comment',
      name: 'Add Comment',
      description: 'Add a comment to an issue',
      fields: [
        { key: 'issueId', label: 'Issue ID', type: 'text', required: true },
        { key: 'body', label: 'Comment', type: 'textarea', required: true },
      ],
    },
  ],
};

export const calendlyConfig: AppConfig = {
  id: 'calendly',
  name: 'Calendly',
  icon: '📆',
  color: '#006BFF',
  description: 'Scheduling automation',
  category: 'productivity',
  docsUrl: 'https://developer.calendly.com',
  auth: [
    {
      type: 'oauth2',
      name: 'Calendly Account',
      description: 'Connect your Calendly account',
      scopes: [],
    },
    {
      type: 'api-key',
      name: 'Personal Access Token',
      description: 'Use a Calendly PAT',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'event_created',
      name: 'Event Scheduled',
      description: 'Triggers when an event is scheduled',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'eventType', label: 'Event Type URI', type: 'text', helpText: 'Optional: specific event type' },
      ],
    },
    {
      id: 'event_canceled',
      name: 'Event Canceled',
      description: 'Triggers when an event is canceled',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'event_rescheduled',
      name: 'Event Rescheduled',
      description: 'Triggers when an event is rescheduled',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'get_event',
      name: 'Get Event Details',
      description: 'Retrieve event information',
      fields: [
        { key: 'eventUri', label: 'Event URI', type: 'text', required: true },
      ],
    },
    {
      id: 'list_events',
      name: 'List Events',
      description: 'List scheduled events',
      fields: [
        { key: 'userUri', label: 'User URI', type: 'text', required: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'active', label: 'Active' },
          { value: 'canceled', label: 'Canceled' },
        ]},
        { key: 'minStartTime', label: 'Start After', type: 'datetime' },
        { key: 'maxStartTime', label: 'Start Before', type: 'datetime' },
        { key: 'count', label: 'Count', type: 'number', default: 20 },
      ],
    },
    {
      id: 'cancel_event',
      name: 'Cancel Event',
      description: 'Cancel a scheduled event',
      fields: [
        { key: 'eventUri', label: 'Event URI', type: 'text', required: true },
        { key: 'reason', label: 'Cancellation Reason', type: 'textarea' },
      ],
    },
  ],
};

// Add Productivity apps
APP_CONFIGS.trello = trelloConfig;
APP_CONFIGS.asana = asanaConfig;
APP_CONFIGS.jira = jiraConfig;
APP_CONFIGS.monday = mondayConfig;
APP_CONFIGS.clickup = clickupConfig;
APP_CONFIGS.linear = linearConfig;
APP_CONFIGS.calendly = calendlyConfig;

// ============================================================================
// DEVELOPER APPS
// ============================================================================

export const webhookConfig: AppConfig = {
  id: 'webhook',
  name: 'Webhook',
  icon: '🔗',
  color: '#6366F1',
  description: 'Generic webhook trigger and sender',
  category: 'developer',
  auth: [
    {
      type: 'custom',
      name: 'No Auth',
      description: 'No authentication required',
      fields: [],
    },
    {
      type: 'custom',
      name: 'Custom Headers',
      description: 'Add custom authentication headers',
      fields: [
        { key: 'headers', label: 'Headers (JSON)', type: 'json', placeholder: '{"Authorization": "Bearer xxx"}' },
      ],
    },
  ],
  triggers: [
    {
      id: 'webhook_received',
      name: 'Webhook Received',
      description: 'Triggers when a webhook is received',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'method', label: 'HTTP Method', type: 'multiselect', options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' },
          { value: 'DELETE', label: 'DELETE' },
        ], default: 'POST' },
        { key: 'path', label: 'Path', type: 'text', placeholder: '/my-webhook' },
        { key: 'verifySignature', label: 'Verify Signature', type: 'boolean', default: false },
        { key: 'signatureHeader', label: 'Signature Header', type: 'text', placeholder: 'X-Signature', dependsOn: { field: 'verifySignature', value: 'true' } },
        { key: 'signatureSecret', label: 'Signature Secret', type: 'password', dependsOn: { field: 'verifySignature', value: 'true' } },
      ],
    },
  ],
  actions: [
    {
      id: 'send_webhook',
      name: 'Send Webhook',
      description: 'Send an HTTP request to a URL',
      fields: [
        { key: 'url', label: 'URL', type: 'url', required: true },
        { key: 'method', label: 'Method', type: 'select', required: true, options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' },
          { value: 'DELETE', label: 'DELETE' },
        ], default: 'POST' },
        { key: 'headers', label: 'Headers', type: 'json', placeholder: '{"Content-Type": "application/json"}' },
        { key: 'body', label: 'Body', type: 'json' },
        { key: 'timeout', label: 'Timeout (ms)', type: 'number', default: 30000 },
        { key: 'retries', label: 'Retries', type: 'number', default: 0 },
      ],
    },
  ],
};

export const restApiConfig: AppConfig = {
  id: 'rest_api',
  name: 'REST API',
  icon: '🌐',
  color: '#10B981',
  description: 'Make HTTP requests to any REST API',
  category: 'developer',
  auth: [
    {
      type: 'custom',
      name: 'No Auth',
      description: 'No authentication',
      fields: [],
    },
    {
      type: 'api-key',
      name: 'API Key',
      description: 'API Key authentication',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'headerName', label: 'Header Name', type: 'text', default: 'X-API-Key' },
      ],
    },
    {
      type: 'bearer',
      name: 'Bearer Token',
      description: 'Bearer token authentication',
      fields: [
        { key: 'token', label: 'Bearer Token', type: 'password', required: true },
      ],
    },
    {
      type: 'basic',
      name: 'Basic Auth',
      description: 'Basic authentication',
      fields: [
        { key: 'username', label: 'Username', type: 'text', required: true },
        { key: 'password', label: 'Password', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'poll_endpoint',
      name: 'Poll Endpoint',
      description: 'Poll an API endpoint on a schedule',
      triggerTypes: ['poll', 'schedule'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'url', label: 'URL', type: 'url', required: true },
        { key: 'method', label: 'Method', type: 'select', options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
        ], default: 'GET' },
        { key: 'headers', label: 'Headers', type: 'json' },
        { key: 'body', label: 'Body', type: 'json' },
        { key: 'dedupeKey', label: 'Dedupe Key', type: 'text', helpText: 'JSON path to unique identifier' },
      ],
    },
  ],
  actions: [
    {
      id: 'http_request',
      name: 'HTTP Request',
      description: 'Make an HTTP request',
      fields: [
        { key: 'url', label: 'URL', type: 'url', required: true },
        { key: 'method', label: 'Method', type: 'select', required: true, options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' },
          { value: 'DELETE', label: 'DELETE' },
          { value: 'HEAD', label: 'HEAD' },
          { value: 'OPTIONS', label: 'OPTIONS' },
        ], default: 'GET' },
        { key: 'headers', label: 'Headers', type: 'json' },
        { key: 'queryParams', label: 'Query Parameters', type: 'json' },
        { key: 'body', label: 'Body', type: 'json' },
        { key: 'bodyType', label: 'Body Type', type: 'select', options: [
          { value: 'json', label: 'JSON' },
          { value: 'form', label: 'Form Data' },
          { value: 'raw', label: 'Raw' },
        ], default: 'json' },
        { key: 'timeout', label: 'Timeout (ms)', type: 'number', default: 30000 },
        { key: 'followRedirects', label: 'Follow Redirects', type: 'boolean', default: true },
      ],
    },
  ],
};

export const graphqlConfig: AppConfig = {
  id: 'graphql',
  name: 'GraphQL',
  icon: '◼️',
  color: '#E535AB',
  description: 'Execute GraphQL queries and mutations',
  category: 'developer',
  auth: [
    {
      type: 'custom',
      name: 'No Auth',
      description: 'No authentication',
      fields: [
        { key: 'endpoint', label: 'GraphQL Endpoint', type: 'url', required: true },
      ],
    },
    {
      type: 'bearer',
      name: 'Bearer Token',
      description: 'Bearer token authentication',
      fields: [
        { key: 'endpoint', label: 'GraphQL Endpoint', type: 'url', required: true },
        { key: 'token', label: 'Bearer Token', type: 'password', required: true },
      ],
    },
    {
      type: 'api-key',
      name: 'API Key Header',
      description: 'Custom API key header',
      fields: [
        { key: 'endpoint', label: 'GraphQL Endpoint', type: 'url', required: true },
        { key: 'headerName', label: 'Header Name', type: 'text', required: true },
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'query',
      name: 'Execute Query',
      description: 'Execute a GraphQL query',
      fields: [
        { key: 'query', label: 'Query', type: 'textarea', required: true, placeholder: 'query { users { id name } }' },
        { key: 'variables', label: 'Variables', type: 'json', placeholder: '{"id": "123"}' },
        { key: 'operationName', label: 'Operation Name', type: 'text' },
      ],
    },
    {
      id: 'mutation',
      name: 'Execute Mutation',
      description: 'Execute a GraphQL mutation',
      fields: [
        { key: 'query', label: 'Mutation', type: 'textarea', required: true, placeholder: 'mutation CreateUser($input: UserInput!) { createUser(input: $input) { id } }' },
        { key: 'variables', label: 'Variables', type: 'json', required: true },
        { key: 'operationName', label: 'Operation Name', type: 'text' },
      ],
    },
  ],
};

export const githubConfig: AppConfig = {
  id: 'github',
  name: 'GitHub',
  icon: '🐙',
  color: '#181717',
  description: 'GitHub repositories and issues',
  category: 'developer',
  docsUrl: 'https://docs.github.com/en/rest',
  auth: [
    {
      type: 'oauth2',
      name: 'GitHub Account',
      description: 'Connect your GitHub account',
      scopes: ['repo', 'user', 'workflow'],
    },
    {
      type: 'api-key',
      name: 'Personal Access Token',
      description: 'Use a GitHub PAT',
      fields: [
        { key: 'token', label: 'Personal Access Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'push',
      name: 'Push Event',
      description: 'Triggers on push to repository',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'branch', label: 'Branch Filter', type: 'text', placeholder: 'main' },
      ],
    },
    {
      id: 'pull_request',
      name: 'Pull Request',
      description: 'Triggers on PR events',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'action', label: 'Action', type: 'multiselect', options: [
          { value: 'opened', label: 'Opened' },
          { value: 'closed', label: 'Closed' },
          { value: 'merged', label: 'Merged' },
          { value: 'synchronize', label: 'Synchronized' },
        ]},
      ],
    },
    {
      id: 'issue',
      name: 'Issue Event',
      description: 'Triggers on issue events',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'action', label: 'Action', type: 'multiselect', options: [
          { value: 'opened', label: 'Opened' },
          { value: 'closed', label: 'Closed' },
          { value: 'labeled', label: 'Labeled' },
          { value: 'assigned', label: 'Assigned' },
        ]},
      ],
    },
    {
      id: 'release',
      name: 'Release Published',
      description: 'Triggers when a release is published',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
      ],
    },
    {
      id: 'star',
      name: 'Repository Starred',
      description: 'Triggers when repo is starred',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'create_issue',
      name: 'Create Issue',
      description: 'Create a new issue',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'labels', label: 'Labels', type: 'json', placeholder: '["bug", "help wanted"]' },
        { key: 'assignees', label: 'Assignees', type: 'json', placeholder: '["username"]' },
        { key: 'milestone', label: 'Milestone Number', type: 'number' },
      ],
    },
    {
      id: 'update_issue',
      name: 'Update Issue',
      description: 'Update an issue',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'issueNumber', label: 'Issue Number', type: 'number', required: true },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'state', label: 'State', type: 'select', options: [
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ]},
        { key: 'labels', label: 'Labels', type: 'json' },
      ],
    },
    {
      id: 'create_comment',
      name: 'Create Comment',
      description: 'Add comment to issue/PR',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'issueNumber', label: 'Issue/PR Number', type: 'number', required: true },
        { key: 'body', label: 'Comment', type: 'textarea', required: true },
      ],
    },
    {
      id: 'create_pr',
      name: 'Create Pull Request',
      description: 'Create a pull request',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'body', label: 'Description', type: 'textarea' },
        { key: 'head', label: 'Head Branch', type: 'text', required: true },
        { key: 'base', label: 'Base Branch', type: 'text', required: true, default: 'main' },
        { key: 'draft', label: 'Draft', type: 'boolean', default: false },
      ],
    },
    {
      id: 'merge_pr',
      name: 'Merge Pull Request',
      description: 'Merge a pull request',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'pullNumber', label: 'PR Number', type: 'number', required: true },
        { key: 'commitTitle', label: 'Commit Title', type: 'text' },
        { key: 'commitMessage', label: 'Commit Message', type: 'textarea' },
        { key: 'mergeMethod', label: 'Merge Method', type: 'select', options: [
          { value: 'merge', label: 'Merge' },
          { value: 'squash', label: 'Squash' },
          { value: 'rebase', label: 'Rebase' },
        ], default: 'merge' },
      ],
    },
    {
      id: 'create_release',
      name: 'Create Release',
      description: 'Create a new release',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'tagName', label: 'Tag Name', type: 'text', required: true },
        { key: 'name', label: 'Release Name', type: 'text' },
        { key: 'body', label: 'Release Notes', type: 'textarea' },
        { key: 'draft', label: 'Draft', type: 'boolean', default: false },
        { key: 'prerelease', label: 'Pre-release', type: 'boolean', default: false },
      ],
    },
    {
      id: 'dispatch_workflow',
      name: 'Dispatch Workflow',
      description: 'Trigger a GitHub Actions workflow',
      fields: [
        { key: 'owner', label: 'Owner', type: 'text', required: true },
        { key: 'repo', label: 'Repository', type: 'text', required: true },
        { key: 'workflowId', label: 'Workflow ID/Filename', type: 'text', required: true },
        { key: 'ref', label: 'Branch/Tag', type: 'text', required: true, default: 'main' },
        { key: 'inputs', label: 'Workflow Inputs', type: 'json' },
      ],
    },
  ],
};

export const gitlabConfig: AppConfig = {
  id: 'gitlab',
  name: 'GitLab',
  icon: '🦊',
  color: '#FC6D26',
  description: 'GitLab repositories and CI/CD',
  category: 'developer',
  docsUrl: 'https://docs.gitlab.com/ee/api/',
  auth: [
    {
      type: 'oauth2',
      name: 'GitLab Account',
      description: 'Connect your GitLab account',
      scopes: ['api', 'read_user'],
    },
    {
      type: 'api-key',
      name: 'Personal Access Token',
      description: 'Use a GitLab PAT',
      fields: [
        { key: 'token', label: 'Personal Access Token', type: 'password', required: true },
        { key: 'baseUrl', label: 'GitLab URL', type: 'url', default: 'https://gitlab.com', helpText: 'For self-hosted GitLab' },
      ],
    },
  ],
  triggers: [
    {
      id: 'push',
      name: 'Push Event',
      description: 'Triggers on push to repository',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'branch', label: 'Branch Filter', type: 'text' },
      ],
    },
    {
      id: 'merge_request',
      name: 'Merge Request',
      description: 'Triggers on MR events',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'action', label: 'Action', type: 'multiselect', options: [
          { value: 'open', label: 'Opened' },
          { value: 'close', label: 'Closed' },
          { value: 'merge', label: 'Merged' },
          { value: 'update', label: 'Updated' },
        ]},
      ],
    },
    {
      id: 'issue',
      name: 'Issue Event',
      description: 'Triggers on issue events',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
      ],
    },
    {
      id: 'pipeline',
      name: 'Pipeline Event',
      description: 'Triggers on pipeline status changes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'status', label: 'Status', type: 'multiselect', options: [
          { value: 'success', label: 'Success' },
          { value: 'failed', label: 'Failed' },
          { value: 'running', label: 'Running' },
        ]},
      ],
    },
  ],
  actions: [
    {
      id: 'create_issue',
      name: 'Create Issue',
      description: 'Create a new issue',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'labels', label: 'Labels', type: 'text', placeholder: 'bug,urgent' },
        { key: 'assigneeIds', label: 'Assignee IDs', type: 'json' },
        { key: 'milestoneId', label: 'Milestone ID', type: 'number' },
      ],
    },
    {
      id: 'update_issue',
      name: 'Update Issue',
      description: 'Update an issue',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'issueIid', label: 'Issue IID', type: 'number', required: true },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'stateEvent', label: 'State', type: 'select', options: [
          { value: 'close', label: 'Close' },
          { value: 'reopen', label: 'Reopen' },
        ]},
      ],
    },
    {
      id: 'create_mr',
      name: 'Create Merge Request',
      description: 'Create a merge request',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'sourceBranch', label: 'Source Branch', type: 'text', required: true },
        { key: 'targetBranch', label: 'Target Branch', type: 'text', required: true, default: 'main' },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'assigneeId', label: 'Assignee ID', type: 'number' },
      ],
    },
    {
      id: 'trigger_pipeline',
      name: 'Trigger Pipeline',
      description: 'Trigger a CI/CD pipeline',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'ref', label: 'Branch/Tag', type: 'text', required: true },
        { key: 'variables', label: 'Variables', type: 'json', helpText: '[{"key": "VAR", "value": "val"}]' },
      ],
    },
    {
      id: 'add_comment',
      name: 'Add Note',
      description: 'Add a note/comment',
      fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'issueIid', label: 'Issue IID', type: 'number', required: true },
        { key: 'body', label: 'Comment', type: 'textarea', required: true },
      ],
    },
  ],
};

export const bitbucketConfig: AppConfig = {
  id: 'bitbucket',
  name: 'Bitbucket',
  icon: '🪣',
  color: '#0052CC',
  description: 'Bitbucket repositories and pipelines',
  category: 'developer',
  docsUrl: 'https://developer.atlassian.com/cloud/bitbucket/',
  auth: [
    {
      type: 'oauth2',
      name: 'Bitbucket Account',
      description: 'Connect your Bitbucket account',
      scopes: ['repository', 'pullrequest'],
    },
    {
      type: 'basic',
      name: 'App Password',
      description: 'Use username and app password',
      fields: [
        { key: 'username', label: 'Username', type: 'text', required: true },
        { key: 'appPassword', label: 'App Password', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'push',
      name: 'Push Event',
      description: 'Triggers on push to repository',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', required: true },
        { key: 'repoSlug', label: 'Repository Slug', type: 'text', required: true },
        { key: 'branch', label: 'Branch Filter', type: 'text' },
      ],
    },
    {
      id: 'pull_request',
      name: 'Pull Request',
      description: 'Triggers on PR events',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', required: true },
        { key: 'repoSlug', label: 'Repository Slug', type: 'text', required: true },
        { key: 'event', label: 'Event', type: 'multiselect', options: [
          { value: 'created', label: 'Created' },
          { value: 'updated', label: 'Updated' },
          { value: 'approved', label: 'Approved' },
          { value: 'merged', label: 'Merged' },
          { value: 'declined', label: 'Declined' },
        ]},
      ],
    },
    {
      id: 'issue',
      name: 'Issue Event',
      description: 'Triggers on issue events',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', required: true },
        { key: 'repoSlug', label: 'Repository Slug', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'create_issue',
      name: 'Create Issue',
      description: 'Create a new issue',
      fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', required: true },
        { key: 'repoSlug', label: 'Repository Slug', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'content', label: 'Description', type: 'textarea' },
        { key: 'kind', label: 'Kind', type: 'select', options: [
          { value: 'bug', label: 'Bug' },
          { value: 'enhancement', label: 'Enhancement' },
          { value: 'proposal', label: 'Proposal' },
          { value: 'task', label: 'Task' },
        ]},
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'trivial', label: 'Trivial' },
          { value: 'minor', label: 'Minor' },
          { value: 'major', label: 'Major' },
          { value: 'critical', label: 'Critical' },
          { value: 'blocker', label: 'Blocker' },
        ]},
      ],
    },
    {
      id: 'create_pr',
      name: 'Create Pull Request',
      description: 'Create a pull request',
      fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', required: true },
        { key: 'repoSlug', label: 'Repository Slug', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'sourceBranch', label: 'Source Branch', type: 'text', required: true },
        { key: 'destBranch', label: 'Destination Branch', type: 'text', required: true, default: 'main' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'closeSourceBranch', label: 'Close Source Branch', type: 'boolean', default: true },
      ],
    },
    {
      id: 'add_comment',
      name: 'Add PR Comment',
      description: 'Add comment to pull request',
      fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', required: true },
        { key: 'repoSlug', label: 'Repository Slug', type: 'text', required: true },
        { key: 'pullRequestId', label: 'PR ID', type: 'number', required: true },
        { key: 'content', label: 'Comment', type: 'textarea', required: true },
      ],
    },
    {
      id: 'trigger_pipeline',
      name: 'Trigger Pipeline',
      description: 'Trigger a Bitbucket pipeline',
      fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', required: true },
        { key: 'repoSlug', label: 'Repository Slug', type: 'text', required: true },
        { key: 'target', label: 'Branch/Tag', type: 'text', required: true },
        { key: 'variables', label: 'Variables', type: 'json' },
      ],
    },
  ],
};

// Add Developer apps
APP_CONFIGS.webhook = webhookConfig;
APP_CONFIGS.rest_api = restApiConfig;
APP_CONFIGS.graphql = graphqlConfig;
APP_CONFIGS.github = githubConfig;
APP_CONFIGS.gitlab = gitlabConfig;
APP_CONFIGS.bitbucket = bitbucketConfig;

// ============================================================================
// AI APPS
// ============================================================================

export const openaiConfig: AppConfig = {
  id: 'openai',
  name: 'OpenAI',
  icon: '🤖',
  color: '#412991',
  description: 'GPT models, DALL-E, Whisper',
  category: 'ai',
  docsUrl: 'https://platform.openai.com/docs',
  auth: [
    {
      type: 'api-key',
      name: 'API Key',
      description: 'OpenAI API key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'organization', label: 'Organization ID', type: 'text', helpText: 'Optional organization ID' },
      ],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'chat_completion',
      name: 'Chat Completion',
      description: 'Generate chat completion with GPT',
      fields: [
        { key: 'model', label: 'Model', type: 'select', required: true, options: [
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        ], default: 'gpt-4o-mini' },
        { key: 'systemPrompt', label: 'System Prompt', type: 'textarea' },
        { key: 'userMessage', label: 'User Message', type: 'textarea', required: true },
        { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7, helpText: '0-2, lower is more focused' },
        { key: 'maxTokens', label: 'Max Tokens', type: 'number', default: 1000 },
        { key: 'responseFormat', label: 'Response Format', type: 'select', options: [
          { value: 'text', label: 'Text' },
          { value: 'json_object', label: 'JSON Object' },
        ], default: 'text' },
      ],
    },
    {
      id: 'generate_image',
      name: 'Generate Image',
      description: 'Generate image with DALL-E',
      fields: [
        { key: 'model', label: 'Model', type: 'select', required: true, options: [
          { value: 'dall-e-3', label: 'DALL-E 3' },
          { value: 'dall-e-2', label: 'DALL-E 2' },
        ], default: 'dall-e-3' },
        { key: 'prompt', label: 'Prompt', type: 'textarea', required: true },
        { key: 'size', label: 'Size', type: 'select', options: [
          { value: '1024x1024', label: '1024x1024' },
          { value: '1024x1792', label: '1024x1792 (Portrait)' },
          { value: '1792x1024', label: '1792x1024 (Landscape)' },
        ], default: '1024x1024' },
        { key: 'quality', label: 'Quality', type: 'select', options: [
          { value: 'standard', label: 'Standard' },
          { value: 'hd', label: 'HD' },
        ], default: 'standard' },
        { key: 'style', label: 'Style', type: 'select', options: [
          { value: 'natural', label: 'Natural' },
          { value: 'vivid', label: 'Vivid' },
        ], default: 'vivid' },
      ],
    },
    {
      id: 'transcribe_audio',
      name: 'Transcribe Audio',
      description: 'Transcribe audio with Whisper',
      fields: [
        { key: 'file', label: 'Audio File', type: 'file', required: true },
        { key: 'model', label: 'Model', type: 'select', options: [
          { value: 'whisper-1', label: 'Whisper' },
        ], default: 'whisper-1' },
        { key: 'language', label: 'Language', type: 'text', placeholder: 'en', helpText: 'ISO-639-1 code' },
        { key: 'prompt', label: 'Prompt', type: 'text', helpText: 'Optional context hint' },
      ],
    },
    {
      id: 'create_embedding',
      name: 'Create Embedding',
      description: 'Generate text embeddings',
      fields: [
        { key: 'model', label: 'Model', type: 'select', required: true, options: [
          { value: 'text-embedding-3-large', label: 'Embedding 3 Large' },
          { value: 'text-embedding-3-small', label: 'Embedding 3 Small' },
          { value: 'text-embedding-ada-002', label: 'Ada 002' },
        ], default: 'text-embedding-3-small' },
        { key: 'input', label: 'Input Text', type: 'textarea', required: true },
      ],
    },
    {
      id: 'text_to_speech',
      name: 'Text to Speech',
      description: 'Convert text to speech',
      fields: [
        { key: 'model', label: 'Model', type: 'select', required: true, options: [
          { value: 'tts-1', label: 'TTS-1' },
          { value: 'tts-1-hd', label: 'TTS-1 HD' },
        ], default: 'tts-1' },
        { key: 'input', label: 'Text', type: 'textarea', required: true },
        { key: 'voice', label: 'Voice', type: 'select', required: true, options: [
          { value: 'alloy', label: 'Alloy' },
          { value: 'echo', label: 'Echo' },
          { value: 'fable', label: 'Fable' },
          { value: 'onyx', label: 'Onyx' },
          { value: 'nova', label: 'Nova' },
          { value: 'shimmer', label: 'Shimmer' },
        ], default: 'alloy' },
        { key: 'speed', label: 'Speed', type: 'number', default: 1.0, helpText: '0.25 to 4.0' },
      ],
    },
  ],
};

export const anthropicConfig: AppConfig = {
  id: 'anthropic',
  name: 'Anthropic',
  icon: '🧠',
  color: '#D4A574',
  description: 'Claude AI assistant',
  category: 'ai',
  docsUrl: 'https://docs.anthropic.com/',
  auth: [
    {
      type: 'api-key',
      name: 'API Key',
      description: 'Anthropic API key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'message',
      name: 'Send Message',
      description: 'Generate response with Claude',
      fields: [
        { key: 'model', label: 'Model', type: 'select', required: true, options: [
          { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
        ], default: 'claude-3-5-sonnet-20241022' },
        { key: 'systemPrompt', label: 'System Prompt', type: 'textarea' },
        { key: 'userMessage', label: 'User Message', type: 'textarea', required: true },
        { key: 'maxTokens', label: 'Max Tokens', type: 'number', required: true, default: 1024 },
        { key: 'temperature', label: 'Temperature', type: 'number', default: 1.0, helpText: '0-1' },
        { key: 'topP', label: 'Top P', type: 'number', helpText: 'Nucleus sampling' },
        { key: 'topK', label: 'Top K', type: 'number', helpText: 'Top-k sampling' },
      ],
    },
    {
      id: 'vision',
      name: 'Vision Analysis',
      description: 'Analyze images with Claude',
      fields: [
        { key: 'model', label: 'Model', type: 'select', required: true, options: [
          { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        ], default: 'claude-3-5-sonnet-20241022' },
        { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
        { key: 'prompt', label: 'Prompt', type: 'textarea', required: true, placeholder: 'Describe this image' },
        { key: 'maxTokens', label: 'Max Tokens', type: 'number', default: 1024 },
      ],
    },
  ],
};

export const googleAiConfig: AppConfig = {
  id: 'google_ai',
  name: 'Google AI',
  icon: '✨',
  color: '#4285F4',
  description: 'Gemini models',
  category: 'ai',
  docsUrl: 'https://ai.google.dev/docs',
  auth: [
    {
      type: 'api-key',
      name: 'API Key',
      description: 'Google AI API key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'generate_content',
      name: 'Generate Content',
      description: 'Generate text with Gemini',
      fields: [
        { key: 'model', label: 'Model', type: 'select', required: true, options: [
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
          { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
        ], default: 'gemini-1.5-flash' },
        { key: 'prompt', label: 'Prompt', type: 'textarea', required: true },
        { key: 'systemInstruction', label: 'System Instruction', type: 'textarea' },
        { key: 'temperature', label: 'Temperature', type: 'number', default: 1.0 },
        { key: 'maxOutputTokens', label: 'Max Output Tokens', type: 'number', default: 2048 },
        { key: 'topP', label: 'Top P', type: 'number', default: 0.95 },
        { key: 'topK', label: 'Top K', type: 'number', default: 40 },
      ],
    },
    {
      id: 'analyze_image',
      name: 'Analyze Image',
      description: 'Analyze image with Gemini Vision',
      fields: [
        { key: 'model', label: 'Model', type: 'select', required: true, options: [
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
        ], default: 'gemini-1.5-flash' },
        { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
        { key: 'prompt', label: 'Prompt', type: 'textarea', required: true },
        { key: 'maxOutputTokens', label: 'Max Output Tokens', type: 'number', default: 2048 },
      ],
    },
    {
      id: 'embed_content',
      name: 'Create Embedding',
      description: 'Generate embeddings',
      fields: [
        { key: 'model', label: 'Model', type: 'select', required: true, options: [
          { value: 'text-embedding-004', label: 'Text Embedding 004' },
        ], default: 'text-embedding-004' },
        { key: 'content', label: 'Content', type: 'textarea', required: true },
        { key: 'taskType', label: 'Task Type', type: 'select', options: [
          { value: 'RETRIEVAL_QUERY', label: 'Retrieval Query' },
          { value: 'RETRIEVAL_DOCUMENT', label: 'Retrieval Document' },
          { value: 'SEMANTIC_SIMILARITY', label: 'Semantic Similarity' },
          { value: 'CLASSIFICATION', label: 'Classification' },
          { value: 'CLUSTERING', label: 'Clustering' },
        ]},
      ],
    },
  ],
};

export const elevenLabsConfig: AppConfig = {
  id: 'elevenlabs',
  name: 'ElevenLabs',
  icon: '🔊',
  color: '#000000',
  description: 'AI voice generation',
  category: 'ai',
  docsUrl: 'https://docs.elevenlabs.io/',
  auth: [
    {
      type: 'api-key',
      name: 'API Key',
      description: 'ElevenLabs API key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'text_to_speech',
      name: 'Text to Speech',
      description: 'Convert text to speech',
      fields: [
        { key: 'voiceId', label: 'Voice ID', type: 'text', required: true },
        { key: 'text', label: 'Text', type: 'textarea', required: true },
        { key: 'modelId', label: 'Model', type: 'select', options: [
          { value: 'eleven_multilingual_v2', label: 'Multilingual v2' },
          { value: 'eleven_monolingual_v1', label: 'Monolingual v1' },
          { value: 'eleven_turbo_v2', label: 'Turbo v2' },
        ], default: 'eleven_multilingual_v2' },
        { key: 'stability', label: 'Stability', type: 'number', default: 0.5, helpText: '0-1' },
        { key: 'similarityBoost', label: 'Similarity Boost', type: 'number', default: 0.75, helpText: '0-1' },
        { key: 'style', label: 'Style', type: 'number', default: 0, helpText: '0-1' },
        { key: 'speakerBoost', label: 'Speaker Boost', type: 'boolean', default: true },
      ],
    },
    {
      id: 'voice_clone',
      name: 'Clone Voice',
      description: 'Create a voice clone',
      fields: [
        { key: 'name', label: 'Voice Name', type: 'text', required: true },
        { key: 'files', label: 'Audio Samples', type: 'file', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'labels', label: 'Labels', type: 'json', placeholder: '{"accent": "american"}' },
      ],
    },
    {
      id: 'get_voices',
      name: 'Get Voices',
      description: 'List available voices',
      fields: [],
    },
  ],
};

export const replicateConfig: AppConfig = {
  id: 'replicate',
  name: 'Replicate',
  icon: '🔄',
  color: '#000000',
  description: 'Run AI models in the cloud',
  category: 'ai',
  docsUrl: 'https://replicate.com/docs',
  auth: [
    {
      type: 'api-key',
      name: 'API Token',
      description: 'Replicate API token',
      fields: [
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'prediction_completed',
      name: 'Prediction Completed',
      description: 'Triggers when prediction completes',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'model', label: 'Model', type: 'text', helpText: 'owner/model format' },
      ],
    },
  ],
  actions: [
    {
      id: 'run_model',
      name: 'Run Model',
      description: 'Run a model prediction',
      fields: [
        { key: 'model', label: 'Model', type: 'text', required: true, placeholder: 'stability-ai/sdxl' },
        { key: 'version', label: 'Version', type: 'text', helpText: 'Specific version hash' },
        { key: 'input', label: 'Input', type: 'json', required: true },
        { key: 'webhook', label: 'Webhook URL', type: 'url', helpText: 'For async results' },
        { key: 'webhookEventsFilter', label: 'Webhook Events', type: 'multiselect', options: [
          { value: 'start', label: 'Start' },
          { value: 'output', label: 'Output' },
          { value: 'logs', label: 'Logs' },
          { value: 'completed', label: 'Completed' },
        ]},
      ],
    },
    {
      id: 'get_prediction',
      name: 'Get Prediction',
      description: 'Get prediction status',
      fields: [
        { key: 'predictionId', label: 'Prediction ID', type: 'text', required: true },
      ],
    },
    {
      id: 'cancel_prediction',
      name: 'Cancel Prediction',
      description: 'Cancel a running prediction',
      fields: [
        { key: 'predictionId', label: 'Prediction ID', type: 'text', required: true },
      ],
    },
  ],
};

export const huggingFaceConfig: AppConfig = {
  id: 'huggingface',
  name: 'HuggingFace',
  icon: '🤗',
  color: '#FFD21E',
  description: 'Hugging Face Inference API',
  category: 'ai',
  docsUrl: 'https://huggingface.co/docs/api-inference',
  auth: [
    {
      type: 'api-key',
      name: 'API Token',
      description: 'Hugging Face API token',
      fields: [
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'text_generation',
      name: 'Text Generation',
      description: 'Generate text with a model',
      fields: [
        { key: 'model', label: 'Model', type: 'text', required: true, placeholder: 'gpt2' },
        { key: 'inputs', label: 'Input Text', type: 'textarea', required: true },
        { key: 'maxNewTokens', label: 'Max New Tokens', type: 'number', default: 250 },
        { key: 'temperature', label: 'Temperature', type: 'number', default: 1.0 },
        { key: 'topP', label: 'Top P', type: 'number', default: 0.9 },
        { key: 'repetitionPenalty', label: 'Repetition Penalty', type: 'number', default: 1.0 },
        { key: 'doSample', label: 'Do Sample', type: 'boolean', default: true },
      ],
    },
    {
      id: 'image_classification',
      name: 'Image Classification',
      description: 'Classify an image',
      fields: [
        { key: 'model', label: 'Model', type: 'text', required: true, placeholder: 'google/vit-base-patch16-224' },
        { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
      ],
    },
    {
      id: 'sentiment_analysis',
      name: 'Sentiment Analysis',
      description: 'Analyze text sentiment',
      fields: [
        { key: 'model', label: 'Model', type: 'text', default: 'distilbert-base-uncased-finetuned-sst-2-english' },
        { key: 'inputs', label: 'Text', type: 'textarea', required: true },
      ],
    },
    {
      id: 'question_answering',
      name: 'Question Answering',
      description: 'Answer questions from context',
      fields: [
        { key: 'model', label: 'Model', type: 'text', default: 'deepset/roberta-base-squad2' },
        { key: 'question', label: 'Question', type: 'text', required: true },
        { key: 'context', label: 'Context', type: 'textarea', required: true },
      ],
    },
    {
      id: 'summarization',
      name: 'Summarization',
      description: 'Summarize text',
      fields: [
        { key: 'model', label: 'Model', type: 'text', default: 'facebook/bart-large-cnn' },
        { key: 'inputs', label: 'Text', type: 'textarea', required: true },
        { key: 'minLength', label: 'Min Length', type: 'number', default: 30 },
        { key: 'maxLength', label: 'Max Length', type: 'number', default: 130 },
      ],
    },
    {
      id: 'translation',
      name: 'Translation',
      description: 'Translate text',
      fields: [
        { key: 'model', label: 'Model', type: 'text', required: true, placeholder: 'Helsinki-NLP/opus-mt-en-de' },
        { key: 'inputs', label: 'Text', type: 'textarea', required: true },
      ],
    },
    {
      id: 'image_to_text',
      name: 'Image to Text',
      description: 'Generate text from image',
      fields: [
        { key: 'model', label: 'Model', type: 'text', default: 'Salesforce/blip-image-captioning-base' },
        { key: 'imageUrl', label: 'Image URL', type: 'url', required: true },
      ],
    },
  ],
};

// Add AI apps
APP_CONFIGS.openai = openaiConfig;
APP_CONFIGS.anthropic = anthropicConfig;
APP_CONFIGS.google_ai = googleAiConfig;
APP_CONFIGS.elevenlabs = elevenLabsConfig;
APP_CONFIGS.replicate = replicateConfig;
APP_CONFIGS.huggingface = huggingFaceConfig;

// ============================================================================
// MARKETING APPS
// ============================================================================

export const googleAnalyticsConfig: AppConfig = {
  id: 'google_analytics',
  name: 'Google Analytics',
  icon: '📊',
  color: '#E37400',
  description: 'Web analytics and reporting',
  category: 'marketing',
  docsUrl: 'https://developers.google.com/analytics',
  auth: [
    {
      type: 'oauth2',
      name: 'Google Account',
      description: 'Connect your Google account',
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'run_report',
      name: 'Run Report',
      description: 'Run an Analytics report',
      fields: [
        { key: 'propertyId', label: 'Property ID', type: 'text', required: true, placeholder: 'properties/123456' },
        { key: 'dateRange', label: 'Date Range', type: 'select', required: true, options: [
          { value: '7days', label: 'Last 7 Days' },
          { value: '30days', label: 'Last 30 Days' },
          { value: '90days', label: 'Last 90 Days' },
          { value: 'custom', label: 'Custom Range' },
        ], default: '30days' },
        { key: 'startDate', label: 'Start Date', type: 'datetime', dependsOn: { field: 'dateRange', value: 'custom' } },
        { key: 'endDate', label: 'End Date', type: 'datetime', dependsOn: { field: 'dateRange', value: 'custom' } },
        { key: 'dimensions', label: 'Dimensions', type: 'multiselect', options: [
          { value: 'date', label: 'Date' },
          { value: 'country', label: 'Country' },
          { value: 'city', label: 'City' },
          { value: 'deviceCategory', label: 'Device Category' },
          { value: 'sessionSource', label: 'Session Source' },
          { value: 'pagePath', label: 'Page Path' },
        ]},
        { key: 'metrics', label: 'Metrics', type: 'multiselect', required: true, options: [
          { value: 'sessions', label: 'Sessions' },
          { value: 'totalUsers', label: 'Total Users' },
          { value: 'newUsers', label: 'New Users' },
          { value: 'screenPageViews', label: 'Page Views' },
          { value: 'bounceRate', label: 'Bounce Rate' },
          { value: 'averageSessionDuration', label: 'Avg Session Duration' },
        ]},
      ],
    },
    {
      id: 'get_realtime',
      name: 'Get Realtime Data',
      description: 'Get realtime analytics data',
      fields: [
        { key: 'propertyId', label: 'Property ID', type: 'text', required: true },
        { key: 'dimensions', label: 'Dimensions', type: 'multiselect', options: [
          { value: 'country', label: 'Country' },
          { value: 'city', label: 'City' },
          { value: 'deviceCategory', label: 'Device Category' },
          { value: 'unifiedScreenName', label: 'Screen Name' },
        ]},
        { key: 'metrics', label: 'Metrics', type: 'multiselect', required: true, options: [
          { value: 'activeUsers', label: 'Active Users' },
          { value: 'screenPageViews', label: 'Page Views' },
        ]},
      ],
    },
  ],
};

export const facebookAdsConfig: AppConfig = {
  id: 'facebook_ads',
  name: 'Facebook Ads',
  icon: '📘',
  color: '#1877F2',
  description: 'Facebook & Instagram advertising',
  category: 'marketing',
  docsUrl: 'https://developers.facebook.com/docs/marketing-apis',
  auth: [
    {
      type: 'oauth2',
      name: 'Facebook Account',
      description: 'Connect your Facebook Ads account',
      scopes: ['ads_management', 'ads_read'],
    },
  ],
  triggers: [
    {
      id: 'campaign_status_change',
      name: 'Campaign Status Changed',
      description: 'Triggers when campaign status changes',
      triggerTypes: ['poll'],
      defaultTriggerType: 'poll',
      fields: [
        { key: 'accountId', label: 'Ad Account ID', type: 'text', required: true },
      ],
    },
  ],
  actions: [
    {
      id: 'get_campaigns',
      name: 'Get Campaigns',
      description: 'List ad campaigns',
      fields: [
        { key: 'accountId', label: 'Ad Account ID', type: 'text', required: true },
        { key: 'status', label: 'Status Filter', type: 'multiselect', options: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'PAUSED', label: 'Paused' },
          { value: 'ARCHIVED', label: 'Archived' },
        ]},
        { key: 'limit', label: 'Limit', type: 'number', default: 25 },
      ],
    },
    {
      id: 'get_insights',
      name: 'Get Insights',
      description: 'Get campaign insights',
      fields: [
        { key: 'accountId', label: 'Ad Account ID', type: 'text', required: true },
        { key: 'level', label: 'Level', type: 'select', required: true, options: [
          { value: 'account', label: 'Account' },
          { value: 'campaign', label: 'Campaign' },
          { value: 'adset', label: 'Ad Set' },
          { value: 'ad', label: 'Ad' },
        ]},
        { key: 'datePreset', label: 'Date Preset', type: 'select', options: [
          { value: 'today', label: 'Today' },
          { value: 'yesterday', label: 'Yesterday' },
          { value: 'last_7d', label: 'Last 7 Days' },
          { value: 'last_30d', label: 'Last 30 Days' },
          { value: 'this_month', label: 'This Month' },
        ], default: 'last_7d' },
        { key: 'fields', label: 'Fields', type: 'multiselect', options: [
          { value: 'impressions', label: 'Impressions' },
          { value: 'clicks', label: 'Clicks' },
          { value: 'spend', label: 'Spend' },
          { value: 'cpc', label: 'CPC' },
          { value: 'cpm', label: 'CPM' },
          { value: 'ctr', label: 'CTR' },
          { value: 'reach', label: 'Reach' },
          { value: 'conversions', label: 'Conversions' },
        ]},
      ],
    },
    {
      id: 'update_campaign',
      name: 'Update Campaign',
      description: 'Update campaign settings',
      fields: [
        { key: 'campaignId', label: 'Campaign ID', type: 'text', required: true },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'PAUSED', label: 'Paused' },
        ]},
        { key: 'dailyBudget', label: 'Daily Budget (cents)', type: 'number' },
      ],
    },
  ],
};

export const googleAdsConfig: AppConfig = {
  id: 'google_ads',
  name: 'Google Ads',
  icon: '📣',
  color: '#4285F4',
  description: 'Google advertising platform',
  category: 'marketing',
  docsUrl: 'https://developers.google.com/google-ads/api',
  auth: [
    {
      type: 'oauth2',
      name: 'Google Ads Account',
      description: 'Connect your Google Ads account',
      scopes: ['https://www.googleapis.com/auth/adwords'],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'get_campaigns',
      name: 'Get Campaigns',
      description: 'List ad campaigns',
      fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', required: true },
        { key: 'status', label: 'Status Filter', type: 'multiselect', options: [
          { value: 'ENABLED', label: 'Enabled' },
          { value: 'PAUSED', label: 'Paused' },
          { value: 'REMOVED', label: 'Removed' },
        ]},
      ],
    },
    {
      id: 'get_report',
      name: 'Get Report',
      description: 'Run a Google Ads report',
      fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', required: true },
        { key: 'reportType', label: 'Report Type', type: 'select', required: true, options: [
          { value: 'campaign', label: 'Campaign Performance' },
          { value: 'ad_group', label: 'Ad Group Performance' },
          { value: 'keyword', label: 'Keyword Performance' },
          { value: 'search_term', label: 'Search Terms' },
        ]},
        { key: 'dateRange', label: 'Date Range', type: 'select', options: [
          { value: 'TODAY', label: 'Today' },
          { value: 'YESTERDAY', label: 'Yesterday' },
          { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
          { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
          { value: 'THIS_MONTH', label: 'This Month' },
        ], default: 'LAST_30_DAYS' },
        { key: 'metrics', label: 'Metrics', type: 'multiselect', options: [
          { value: 'impressions', label: 'Impressions' },
          { value: 'clicks', label: 'Clicks' },
          { value: 'cost', label: 'Cost' },
          { value: 'conversions', label: 'Conversions' },
          { value: 'ctr', label: 'CTR' },
          { value: 'averageCpc', label: 'Average CPC' },
        ]},
      ],
    },
    {
      id: 'update_campaign_budget',
      name: 'Update Campaign Budget',
      description: 'Update campaign budget',
      fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', required: true },
        { key: 'campaignId', label: 'Campaign ID', type: 'text', required: true },
        { key: 'budgetAmountMicros', label: 'Budget (micros)', type: 'number', required: true, helpText: 'Amount in micro-units (1,000,000 = $1)' },
      ],
    },
    {
      id: 'update_campaign_status',
      name: 'Update Campaign Status',
      description: 'Enable or pause campaign',
      fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', required: true },
        { key: 'campaignId', label: 'Campaign ID', type: 'text', required: true },
        { key: 'status', label: 'Status', type: 'select', required: true, options: [
          { value: 'ENABLED', label: 'Enabled' },
          { value: 'PAUSED', label: 'Paused' },
        ]},
      ],
    },
  ],
};

export const intercomConfig: AppConfig = {
  id: 'intercom',
  name: 'Intercom',
  icon: '💬',
  color: '#1F8DED',
  description: 'Customer messaging platform',
  category: 'marketing',
  docsUrl: 'https://developers.intercom.com/',
  auth: [
    {
      type: 'oauth2',
      name: 'Intercom Account',
      description: 'Connect your Intercom workspace',
      scopes: ['read', 'write'],
    },
    {
      type: 'api-key',
      name: 'Access Token',
      description: 'Use an access token',
      fields: [
        { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'new_conversation',
      name: 'New Conversation',
      description: 'Triggers on new conversation',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'conversation_reply',
      name: 'Conversation Reply',
      description: 'Triggers on conversation reply',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'replyType', label: 'Reply Type', type: 'select', options: [
          { value: 'user', label: 'User Reply' },
          { value: 'admin', label: 'Admin Reply' },
          { value: 'all', label: 'All Replies' },
        ], default: 'user' },
      ],
    },
    {
      id: 'user_created',
      name: 'User Created',
      description: 'Triggers when user is created',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'user_tag_added',
      name: 'Tag Added to User',
      description: 'Triggers when tag is added',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'tagId', label: 'Tag ID', type: 'text' },
      ],
    },
  ],
  actions: [
    {
      id: 'create_contact',
      name: 'Create Contact',
      description: 'Create a new contact',
      fields: [
        { key: 'role', label: 'Role', type: 'select', required: true, options: [
          { value: 'user', label: 'User' },
          { value: 'lead', label: 'Lead' },
        ]},
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'customAttributes', label: 'Custom Attributes', type: 'json' },
      ],
    },
    {
      id: 'update_contact',
      name: 'Update Contact',
      description: 'Update a contact',
      fields: [
        { key: 'contactId', label: 'Contact ID', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'customAttributes', label: 'Custom Attributes', type: 'json' },
      ],
    },
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Send message to user',
      fields: [
        { key: 'contactId', label: 'Contact ID', type: 'text', required: true },
        { key: 'messageType', label: 'Type', type: 'select', required: true, options: [
          { value: 'in_app', label: 'In-App Message' },
          { value: 'email', label: 'Email' },
        ]},
        { key: 'subject', label: 'Subject', type: 'text', dependsOn: { field: 'messageType', value: 'email' } },
        { key: 'body', label: 'Message Body', type: 'textarea', required: true },
        { key: 'fromId', label: 'From Admin ID', type: 'text', required: true },
      ],
    },
    {
      id: 'add_tag',
      name: 'Add Tag',
      description: 'Add tag to contact',
      fields: [
        { key: 'contactId', label: 'Contact ID', type: 'text', required: true },
        { key: 'tagId', label: 'Tag ID', type: 'text', required: true },
      ],
    },
    {
      id: 'create_note',
      name: 'Create Note',
      description: 'Add note to contact',
      fields: [
        { key: 'contactId', label: 'Contact ID', type: 'text', required: true },
        { key: 'body', label: 'Note', type: 'textarea', required: true },
        { key: 'adminId', label: 'Admin ID', type: 'text', required: true },
      ],
    },
    {
      id: 'reply_conversation',
      name: 'Reply to Conversation',
      description: 'Reply to a conversation',
      fields: [
        { key: 'conversationId', label: 'Conversation ID', type: 'text', required: true },
        { key: 'body', label: 'Message', type: 'textarea', required: true },
        { key: 'adminId', label: 'Admin ID', type: 'text', required: true },
        { key: 'messageType', label: 'Type', type: 'select', options: [
          { value: 'comment', label: 'Comment (visible)' },
          { value: 'note', label: 'Note (internal)' },
        ], default: 'comment' },
      ],
    },
  ],
};

export const linkedinConfig: AppConfig = {
  id: 'linkedin',
  name: 'LinkedIn',
  icon: '💼',
  color: '#0A66C2',
  description: 'Professional network & marketing',
  category: 'marketing',
  docsUrl: 'https://learn.microsoft.com/en-us/linkedin/',
  auth: [
    {
      type: 'oauth2',
      name: 'LinkedIn Account',
      description: 'Connect your LinkedIn account',
      scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'create_post',
      name: 'Create Post',
      description: 'Create a LinkedIn post',
      fields: [
        { key: 'text', label: 'Post Text', type: 'textarea', required: true },
        { key: 'visibility', label: 'Visibility', type: 'select', options: [
          { value: 'PUBLIC', label: 'Public' },
          { value: 'CONNECTIONS', label: 'Connections Only' },
        ], default: 'PUBLIC' },
        { key: 'mediaUrl', label: 'Media URL', type: 'url', helpText: 'Image or video URL' },
        { key: 'articleUrl', label: 'Article URL', type: 'url', helpText: 'Link to share' },
      ],
    },
    {
      id: 'get_profile',
      name: 'Get Profile',
      description: 'Get user profile info',
      fields: [],
    },
    {
      id: 'get_connections',
      name: 'Get Connections',
      description: 'Get connection count',
      fields: [],
    },
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Send InMail/message',
      fields: [
        { key: 'recipientUrn', label: 'Recipient URN', type: 'text', required: true },
        { key: 'subject', label: 'Subject', type: 'text' },
        { key: 'body', label: 'Message', type: 'textarea', required: true },
      ],
    },
  ],
};

// Add Marketing apps
APP_CONFIGS.google_analytics = googleAnalyticsConfig;
APP_CONFIGS.facebook_ads = facebookAdsConfig;
APP_CONFIGS.google_ads = googleAdsConfig;
APP_CONFIGS.intercom = intercomConfig;
APP_CONFIGS.linkedin = linkedinConfig;

// ============================================================================
// SUPPORT APPS
// ============================================================================

export const zendeskConfig: AppConfig = {
  id: 'zendesk',
  name: 'Zendesk',
  icon: '🎫',
  color: '#03363D',
  description: 'Customer service platform',
  category: 'support',
  docsUrl: 'https://developer.zendesk.com/',
  auth: [
    {
      type: 'oauth2',
      name: 'Zendesk Account',
      description: 'Connect your Zendesk account',
      scopes: ['tickets:read', 'tickets:write', 'users:read'],
    },
    {
      type: 'api-key',
      name: 'API Token',
      description: 'Use email/token authentication',
      fields: [
        { key: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'yourcompany' },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'ticket_created',
      name: 'Ticket Created',
      description: 'Triggers when new ticket is created',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'priority', label: 'Priority Filter', type: 'multiselect', options: [
          { value: 'low', label: 'Low' },
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' },
        ]},
      ],
    },
    {
      id: 'ticket_updated',
      name: 'Ticket Updated',
      description: 'Triggers when ticket is updated',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'ticket_status_changed',
      name: 'Ticket Status Changed',
      description: 'Triggers on status change',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'new', label: 'New' },
          { value: 'open', label: 'Open' },
          { value: 'pending', label: 'Pending' },
          { value: 'hold', label: 'On Hold' },
          { value: 'solved', label: 'Solved' },
          { value: 'closed', label: 'Closed' },
        ]},
      ],
    },
    {
      id: 'new_comment',
      name: 'New Comment',
      description: 'Triggers on new ticket comment',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'isPublic', label: 'Comment Type', type: 'select', options: [
          { value: 'true', label: 'Public Only' },
          { value: 'false', label: 'Private Only' },
          { value: 'all', label: 'All Comments' },
        ], default: 'all' },
      ],
    },
  ],
  actions: [
    {
      id: 'create_ticket',
      name: 'Create Ticket',
      description: 'Create a new ticket',
      fields: [
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', required: true },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'low', label: 'Low' },
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' },
        ], default: 'normal' },
        { key: 'type', label: 'Type', type: 'select', options: [
          { value: 'question', label: 'Question' },
          { value: 'incident', label: 'Incident' },
          { value: 'problem', label: 'Problem' },
          { value: 'task', label: 'Task' },
        ]},
        { key: 'requesterId', label: 'Requester ID', type: 'number' },
        { key: 'assigneeId', label: 'Assignee ID', type: 'number' },
        { key: 'groupId', label: 'Group ID', type: 'number' },
        { key: 'tags', label: 'Tags', type: 'json', placeholder: '["tag1", "tag2"]' },
        { key: 'customFields', label: 'Custom Fields', type: 'json' },
      ],
    },
    {
      id: 'update_ticket',
      name: 'Update Ticket',
      description: 'Update an existing ticket',
      fields: [
        { key: 'ticketId', label: 'Ticket ID', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'new', label: 'New' },
          { value: 'open', label: 'Open' },
          { value: 'pending', label: 'Pending' },
          { value: 'hold', label: 'On Hold' },
          { value: 'solved', label: 'Solved' },
          { value: 'closed', label: 'Closed' },
        ]},
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'low', label: 'Low' },
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' },
        ]},
        { key: 'assigneeId', label: 'Assignee ID', type: 'number' },
        { key: 'tags', label: 'Tags', type: 'json' },
      ],
    },
    {
      id: 'add_comment',
      name: 'Add Comment',
      description: 'Add comment to ticket',
      fields: [
        { key: 'ticketId', label: 'Ticket ID', type: 'number', required: true },
        { key: 'body', label: 'Comment', type: 'textarea', required: true },
        { key: 'isPublic', label: 'Public', type: 'boolean', default: true },
        { key: 'authorId', label: 'Author ID', type: 'number' },
      ],
    },
    {
      id: 'search_tickets',
      name: 'Search Tickets',
      description: 'Search for tickets',
      fields: [
        { key: 'query', label: 'Search Query', type: 'text', required: true, placeholder: 'status:open priority:high' },
        { key: 'sortBy', label: 'Sort By', type: 'select', options: [
          { value: 'created_at', label: 'Created Date' },
          { value: 'updated_at', label: 'Updated Date' },
          { value: 'priority', label: 'Priority' },
        ]},
        { key: 'sortOrder', label: 'Sort Order', type: 'select', options: [
          { value: 'asc', label: 'Ascending' },
          { value: 'desc', label: 'Descending' },
        ], default: 'desc' },
      ],
    },
    {
      id: 'get_ticket',
      name: 'Get Ticket',
      description: 'Get ticket details',
      fields: [
        { key: 'ticketId', label: 'Ticket ID', type: 'number', required: true },
      ],
    },
  ],
};

export const freshdeskConfig: AppConfig = {
  id: 'freshdesk',
  name: 'Freshdesk',
  icon: '🎟️',
  color: '#25C16F',
  description: 'Customer support software',
  category: 'support',
  docsUrl: 'https://developers.freshdesk.com/',
  auth: [
    {
      type: 'api-key',
      name: 'API Key',
      description: 'Freshdesk API key',
      fields: [
        { key: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'yourcompany.freshdesk.com' },
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'ticket_created',
      name: 'Ticket Created',
      description: 'Triggers on new ticket',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'ticket_updated',
      name: 'Ticket Updated',
      description: 'Triggers when ticket is updated',
      triggerTypes: ['webhook', 'poll'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'note_created',
      name: 'Note Created',
      description: 'Triggers on new note',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'create_ticket',
      name: 'Create Ticket',
      description: 'Create a new ticket',
      fields: [
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', required: true },
        { key: 'email', label: 'Requester Email', type: 'email', required: true },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: '1', label: 'Low' },
          { value: '2', label: 'Medium' },
          { value: '3', label: 'High' },
          { value: '4', label: 'Urgent' },
        ], default: '1' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: '2', label: 'Open' },
          { value: '3', label: 'Pending' },
          { value: '4', label: 'Resolved' },
          { value: '5', label: 'Closed' },
        ], default: '2' },
        { key: 'type', label: 'Type', type: 'text' },
        { key: 'tags', label: 'Tags', type: 'json' },
      ],
    },
    {
      id: 'update_ticket',
      name: 'Update Ticket',
      description: 'Update a ticket',
      fields: [
        { key: 'ticketId', label: 'Ticket ID', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: '2', label: 'Open' },
          { value: '3', label: 'Pending' },
          { value: '4', label: 'Resolved' },
          { value: '5', label: 'Closed' },
        ]},
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: '1', label: 'Low' },
          { value: '2', label: 'Medium' },
          { value: '3', label: 'High' },
          { value: '4', label: 'Urgent' },
        ]},
        { key: 'agentId', label: 'Agent ID', type: 'number' },
        { key: 'groupId', label: 'Group ID', type: 'number' },
      ],
    },
    {
      id: 'add_note',
      name: 'Add Note',
      description: 'Add note to ticket',
      fields: [
        { key: 'ticketId', label: 'Ticket ID', type: 'number', required: true },
        { key: 'body', label: 'Note', type: 'textarea', required: true },
        { key: 'isPrivate', label: 'Private', type: 'boolean', default: true },
      ],
    },
    {
      id: 'reply_ticket',
      name: 'Reply to Ticket',
      description: 'Send reply to ticket',
      fields: [
        { key: 'ticketId', label: 'Ticket ID', type: 'number', required: true },
        { key: 'body', label: 'Reply', type: 'textarea', required: true },
      ],
    },
    {
      id: 'create_contact',
      name: 'Create Contact',
      description: 'Create a new contact',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
    },
  ],
};

export const crispConfig: AppConfig = {
  id: 'crisp',
  name: 'Crisp',
  icon: '💬',
  color: '#4B5CFF',
  description: 'Business messaging platform',
  category: 'support',
  docsUrl: 'https://docs.crisp.chat/',
  auth: [
    {
      type: 'api-key',
      name: 'API Credentials',
      description: 'Crisp API identifier and key',
      fields: [
        { key: 'websiteId', label: 'Website ID', type: 'text', required: true },
        { key: 'identifier', label: 'API Identifier', type: 'text', required: true },
        { key: 'key', label: 'API Key', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'message_received',
      name: 'Message Received',
      description: 'Triggers on new message',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'fromUser', label: 'From User Only', type: 'boolean', default: true },
      ],
    },
    {
      id: 'session_created',
      name: 'Session Created',
      description: 'Triggers on new chat session',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'user_segment_changed',
      name: 'Segment Changed',
      description: 'Triggers on segment change',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Send message to conversation',
      fields: [
        { key: 'sessionId', label: 'Session ID', type: 'text', required: true },
        { key: 'type', label: 'Type', type: 'select', required: true, options: [
          { value: 'text', label: 'Text' },
          { value: 'note', label: 'Note (Internal)' },
        ], default: 'text' },
        { key: 'content', label: 'Message', type: 'textarea', required: true },
      ],
    },
    {
      id: 'update_profile',
      name: 'Update Profile',
      description: 'Update visitor profile',
      fields: [
        { key: 'sessionId', label: 'Session ID', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'nickname', label: 'Nickname', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'company', label: 'Company', type: 'text' },
        { key: 'data', label: 'Custom Data', type: 'json' },
      ],
    },
    {
      id: 'add_segment',
      name: 'Add Segment',
      description: 'Add segment to conversation',
      fields: [
        { key: 'sessionId', label: 'Session ID', type: 'text', required: true },
        { key: 'segment', label: 'Segment', type: 'text', required: true },
      ],
    },
    {
      id: 'set_state',
      name: 'Set Conversation State',
      description: 'Update conversation state',
      fields: [
        { key: 'sessionId', label: 'Session ID', type: 'text', required: true },
        { key: 'state', label: 'State', type: 'select', required: true, options: [
          { value: 'pending', label: 'Pending' },
          { value: 'unresolved', label: 'Unresolved' },
          { value: 'resolved', label: 'Resolved' },
        ]},
      ],
    },
    {
      id: 'assign_conversation',
      name: 'Assign Conversation',
      description: 'Assign to operator',
      fields: [
        { key: 'sessionId', label: 'Session ID', type: 'text', required: true },
        { key: 'operatorId', label: 'Operator ID', type: 'text', required: true },
      ],
    },
  ],
};

export const tawkConfig: AppConfig = {
  id: 'tawk',
  name: 'Tawk.to',
  icon: '💭',
  color: '#03A84E',
  description: 'Free live chat software',
  category: 'support',
  docsUrl: 'https://developer.tawk.to/',
  auth: [
    {
      type: 'api-key',
      name: 'API Key',
      description: 'Tawk.to API key',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'propertyId', label: 'Property ID', type: 'text', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'chat_started',
      name: 'Chat Started',
      description: 'Triggers when chat starts',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'chat_ended',
      name: 'Chat Ended',
      description: 'Triggers when chat ends',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'ticket_created',
      name: 'Ticket Created',
      description: 'Triggers on new ticket',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'message_received',
      name: 'Message Received',
      description: 'Triggers on new message',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'send_message',
      name: 'Send Message',
      description: 'Send message to visitor',
      fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', required: true },
        { key: 'message', label: 'Message', type: 'textarea', required: true },
      ],
    },
    {
      id: 'create_ticket',
      name: 'Create Ticket',
      description: 'Create a support ticket',
      fields: [
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'message', label: 'Message', type: 'textarea', required: true },
        { key: 'requesterName', label: 'Requester Name', type: 'text', required: true },
        { key: 'requesterEmail', label: 'Requester Email', type: 'email', required: true },
        { key: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ], default: 'medium' },
      ],
    },
    {
      id: 'get_visitor_info',
      name: 'Get Visitor Info',
      description: 'Get visitor information',
      fields: [
        { key: 'visitorId', label: 'Visitor ID', type: 'text', required: true },
      ],
    },
    {
      id: 'ban_visitor',
      name: 'Ban Visitor',
      description: 'Ban a visitor',
      fields: [
        { key: 'visitorId', label: 'Visitor ID', type: 'text', required: true },
        { key: 'reason', label: 'Reason', type: 'textarea' },
      ],
    },
  ],
};

// Add Support apps
APP_CONFIGS.zendesk = zendeskConfig;
APP_CONFIGS.freshdesk = freshdeskConfig;
APP_CONFIGS.crisp = crispConfig;
APP_CONFIGS.tawk = tawkConfig;

// ============================================================================
// VOICE/VIDEO APPS
// ============================================================================

export const twilioVoiceConfig: AppConfig = {
  id: 'twilio_voice',
  name: 'Twilio Voice',
  icon: '📞',
  color: '#F22F46',
  description: 'Voice calls and IVR',
  category: 'voice',
  docsUrl: 'https://www.twilio.com/docs/voice',
  auth: [
    {
      type: 'api-key',
      name: 'Account Credentials',
      description: 'Twilio Account SID and Auth Token',
      fields: [
        { key: 'accountSid', label: 'Account SID', type: 'text', required: true },
        { key: 'authToken', label: 'Auth Token', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'incoming_call',
      name: 'Incoming Call',
      description: 'Triggers on incoming call',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'phoneNumber', label: 'Phone Number', type: 'text', required: true, placeholder: '+1234567890' },
      ],
    },
    {
      id: 'call_completed',
      name: 'Call Completed',
      description: 'Triggers when call ends',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [
        { key: 'phoneNumber', label: 'Phone Number', type: 'text', required: true },
      ],
    },
    {
      id: 'recording_completed',
      name: 'Recording Completed',
      description: 'Triggers when recording is ready',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'transcription_completed',
      name: 'Transcription Completed',
      description: 'Triggers when transcription is ready',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'make_call',
      name: 'Make Call',
      description: 'Initiate an outbound call',
      fields: [
        { key: 'to', label: 'To Number', type: 'text', required: true, placeholder: '+1234567890' },
        { key: 'from', label: 'From Number', type: 'text', required: true },
        { key: 'twiml', label: 'TwiML', type: 'textarea', helpText: 'TwiML instructions for the call' },
        { key: 'url', label: 'TwiML URL', type: 'url', helpText: 'URL returning TwiML' },
        { key: 'record', label: 'Record Call', type: 'boolean', default: false },
        { key: 'machineDetection', label: 'Machine Detection', type: 'select', options: [
          { value: 'Enable', label: 'Enable' },
          { value: 'DetectMessageEnd', label: 'Detect Message End' },
        ]},
        { key: 'timeout', label: 'Timeout (seconds)', type: 'number', default: 30 },
      ],
    },
    {
      id: 'send_sms_during_call',
      name: 'Send SMS',
      description: 'Send SMS during/after call',
      fields: [
        { key: 'to', label: 'To Number', type: 'text', required: true },
        { key: 'from', label: 'From Number', type: 'text', required: true },
        { key: 'body', label: 'Message', type: 'textarea', required: true },
      ],
    },
    {
      id: 'get_call',
      name: 'Get Call Details',
      description: 'Get call information',
      fields: [
        { key: 'callSid', label: 'Call SID', type: 'text', required: true },
      ],
    },
    {
      id: 'update_call',
      name: 'Update Call',
      description: 'Modify an in-progress call',
      fields: [
        { key: 'callSid', label: 'Call SID', type: 'text', required: true },
        { key: 'twiml', label: 'New TwiML', type: 'textarea' },
        { key: 'url', label: 'New TwiML URL', type: 'url' },
        { key: 'status', label: 'Status', type: 'select', options: [
          { value: 'completed', label: 'End Call' },
          { value: 'canceled', label: 'Cancel' },
        ]},
      ],
    },
    {
      id: 'get_recording',
      name: 'Get Recording',
      description: 'Get call recording',
      fields: [
        { key: 'recordingSid', label: 'Recording SID', type: 'text', required: true },
      ],
    },
  ],
};

export const zoomConfig: AppConfig = {
  id: 'zoom',
  name: 'Zoom',
  icon: '📹',
  color: '#2D8CFF',
  description: 'Video conferencing',
  category: 'voice',
  docsUrl: 'https://developers.zoom.us/docs/',
  auth: [
    {
      type: 'oauth2',
      name: 'Zoom Account',
      description: 'Connect your Zoom account',
      scopes: ['meeting:read', 'meeting:write', 'user:read'],
    },
    {
      type: 'api-key',
      name: 'Server-to-Server OAuth',
      description: 'Use S2S OAuth credentials',
      fields: [
        { key: 'accountId', label: 'Account ID', type: 'text', required: true },
        { key: 'clientId', label: 'Client ID', type: 'text', required: true },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      ],
    },
  ],
  triggers: [
    {
      id: 'meeting_started',
      name: 'Meeting Started',
      description: 'Triggers when meeting starts',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'meeting_ended',
      name: 'Meeting Ended',
      description: 'Triggers when meeting ends',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'participant_joined',
      name: 'Participant Joined',
      description: 'Triggers when someone joins',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'recording_completed',
      name: 'Recording Completed',
      description: 'Triggers when recording is ready',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
    {
      id: 'webinar_registered',
      name: 'Webinar Registration',
      description: 'Triggers on new registration',
      triggerTypes: ['webhook'],
      defaultTriggerType: 'webhook',
      fields: [],
    },
  ],
  actions: [
    {
      id: 'create_meeting',
      name: 'Create Meeting',
      description: 'Schedule a new meeting',
      fields: [
        { key: 'topic', label: 'Topic', type: 'text', required: true },
        { key: 'type', label: 'Type', type: 'select', required: true, options: [
          { value: '1', label: 'Instant Meeting' },
          { value: '2', label: 'Scheduled Meeting' },
          { value: '3', label: 'Recurring No Fixed Time' },
          { value: '8', label: 'Recurring Fixed Time' },
        ], default: '2' },
        { key: 'startTime', label: 'Start Time', type: 'datetime' },
        { key: 'duration', label: 'Duration (minutes)', type: 'number', default: 60 },
        { key: 'timezone', label: 'Timezone', type: 'text', default: 'UTC' },
        { key: 'agenda', label: 'Agenda', type: 'textarea' },
        { key: 'password', label: 'Password', type: 'text' },
        { key: 'waitingRoom', label: 'Enable Waiting Room', type: 'boolean', default: true },
        { key: 'joinBeforeHost', label: 'Join Before Host', type: 'boolean', default: false },
        { key: 'muteOnEntry', label: 'Mute on Entry', type: 'boolean', default: false },
        { key: 'autoRecording', label: 'Auto Recording', type: 'select', options: [
          { value: 'local', label: 'Local' },
          { value: 'cloud', label: 'Cloud' },
          { value: 'none', label: 'None' },
        ], default: 'none' },
      ],
    },
    {
      id: 'update_meeting',
      name: 'Update Meeting',
      description: 'Update meeting details',
      fields: [
        { key: 'meetingId', label: 'Meeting ID', type: 'text', required: true },
        { key: 'topic', label: 'Topic', type: 'text' },
        { key: 'startTime', label: 'Start Time', type: 'datetime' },
        { key: 'duration', label: 'Duration (minutes)', type: 'number' },
        { key: 'agenda', label: 'Agenda', type: 'textarea' },
      ],
    },
    {
      id: 'delete_meeting',
      name: 'Delete Meeting',
      description: 'Delete a meeting',
      fields: [
        { key: 'meetingId', label: 'Meeting ID', type: 'text', required: true },
      ],
    },
    {
      id: 'get_meeting',
      name: 'Get Meeting',
      description: 'Get meeting details',
      fields: [
        { key: 'meetingId', label: 'Meeting ID', type: 'text', required: true },
      ],
    },
    {
      id: 'list_meetings',
      name: 'List Meetings',
      description: 'List scheduled meetings',
      fields: [
        { key: 'type', label: 'Type', type: 'select', options: [
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'live', label: 'Live' },
          { value: 'upcoming', label: 'Upcoming' },
        ], default: 'upcoming' },
        { key: 'pageSize', label: 'Page Size', type: 'number', default: 30 },
      ],
    },
    {
      id: 'add_registrant',
      name: 'Add Registrant',
      description: 'Add meeting/webinar registrant',
      fields: [
        { key: 'meetingId', label: 'Meeting ID', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'firstName', label: 'First Name', type: 'text', required: true },
        { key: 'lastName', label: 'Last Name', type: 'text' },
      ],
    },
    {
      id: 'get_recordings',
      name: 'Get Recordings',
      description: 'Get meeting recordings',
      fields: [
        { key: 'meetingId', label: 'Meeting ID', type: 'text', required: true },
      ],
    },
  ],
};

export const googleMeetConfig: AppConfig = {
  id: 'google_meet',
  name: 'Google Meet',
  icon: '🎥',
  color: '#00897B',
  description: 'Google video meetings',
  category: 'voice',
  docsUrl: 'https://developers.google.com/meet',
  auth: [
    {
      type: 'oauth2',
      name: 'Google Account',
      description: 'Connect your Google account',
      scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    },
  ],
  triggers: [],
  actions: [
    {
      id: 'create_meeting',
      name: 'Create Meeting',
      description: 'Create a Google Meet via Calendar',
      fields: [
        { key: 'summary', label: 'Title', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'startTime', label: 'Start Time', type: 'datetime', required: true },
        { key: 'endTime', label: 'End Time', type: 'datetime', required: true },
        { key: 'timezone', label: 'Timezone', type: 'text', default: 'UTC' },
        { key: 'attendees', label: 'Attendees', type: 'json', placeholder: '["email1@example.com", "email2@example.com"]' },
        { key: 'sendUpdates', label: 'Send Invites', type: 'select', options: [
          { value: 'all', label: 'All Attendees' },
          { value: 'externalOnly', label: 'External Only' },
          { value: 'none', label: 'None' },
        ], default: 'all' },
        { key: 'guestsCanModify', label: 'Guests Can Modify', type: 'boolean', default: false },
        { key: 'guestsCanInviteOthers', label: 'Guests Can Invite Others', type: 'boolean', default: true },
      ],
    },
    {
      id: 'get_meeting_link',
      name: 'Get Meeting Link',
      description: 'Get Meet link from calendar event',
      fields: [
        { key: 'eventId', label: 'Event ID', type: 'text', required: true },
        { key: 'calendarId', label: 'Calendar ID', type: 'text', default: 'primary' },
      ],
    },
    {
      id: 'update_meeting',
      name: 'Update Meeting',
      description: 'Update meeting details',
      fields: [
        { key: 'eventId', label: 'Event ID', type: 'text', required: true },
        { key: 'calendarId', label: 'Calendar ID', type: 'text', default: 'primary' },
        { key: 'summary', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'startTime', label: 'Start Time', type: 'datetime' },
        { key: 'endTime', label: 'End Time', type: 'datetime' },
      ],
    },
    {
      id: 'delete_meeting',
      name: 'Delete Meeting',
      description: 'Cancel and delete meeting',
      fields: [
        { key: 'eventId', label: 'Event ID', type: 'text', required: true },
        { key: 'calendarId', label: 'Calendar ID', type: 'text', default: 'primary' },
        { key: 'sendUpdates', label: 'Send Cancellation', type: 'select', options: [
          { value: 'all', label: 'All Attendees' },
          { value: 'externalOnly', label: 'External Only' },
          { value: 'none', label: 'None' },
        ], default: 'all' },
      ],
    },
  ],
};

// Add Voice/Video apps
APP_CONFIGS.twilio_voice = twilioVoiceConfig;
APP_CONFIGS.zoom = zoomConfig;
APP_CONFIGS.google_meet = googleMeetConfig;

// Helper to get config by app ID
export function getAppConfig(appId: string): AppConfig | undefined {
  return APP_CONFIGS[appId];
}

// Helper to get triggers for an app
export function getAppTriggers(appId: string): TriggerConfig[] {
  return APP_CONFIGS[appId]?.triggers || [];
}

// Helper to get actions for an app
export function getAppActions(appId: string): ActionConfig[] {
  return APP_CONFIGS[appId]?.actions || [];
}

// Helper to get auth options for an app
export function getAppAuth(appId: string): AuthConfig[] {
  return APP_CONFIGS[appId]?.auth || [];
}
