/**
 * App Schema Registry - Communication Apps
 * 
 * Schema definitions for messaging and communication integrations
 */

import type { AppSchema, FieldSchema } from '../types';

// ============================================
// COMMON COMMUNICATION FIELDS
// ============================================

const messageTextField: FieldSchema = {
  id: 'message',
  name: 'Message',
  description: 'The message content to send',
  type: 'expression',
  placeholder: 'Enter message or use {{variables}}',
  validation: { required: true },
  aiSuggestions: true,
};

const recipientField: FieldSchema = {
  id: 'recipient',
  name: 'Recipient',
  description: 'Who to send the message to',
  type: 'expression',
  validation: { required: true },
};

// ============================================
// WHATSAPP SCHEMA
// ============================================

export const whatsappSchema: AppSchema = {
  id: 'whatsapp',
  name: 'WhatsApp',
  description: 'Send and receive WhatsApp messages via Business API',
  icon: '💬',
  color: '#25D366',
  category: 'Communication',
  tags: ['messaging', 'whatsapp', 'chat'],
  apiBaseUrl: 'https://graph.facebook.com/v18.0',
  apiDocsUrl: 'https://developers.facebook.com/docs/whatsapp',
  version: '1.0.0',
  status: 'stable',
  supportsWebhooks: true,
  
  credentials: [{
    id: 'whatsapp_business',
    name: 'WhatsApp Business API',
    type: 'bearer',
    helpUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
    fields: [
      {
        id: 'accessToken',
        name: 'Access Token',
        description: 'Your WhatsApp Business API access token',
        type: 'secret',
        validation: { required: true },
      },
      {
        id: 'phoneNumberId',
        name: 'Phone Number ID',
        description: 'Your WhatsApp Business phone number ID',
        type: 'text',
        validation: { required: true },
      },
      {
        id: 'businessAccountId',
        name: 'Business Account ID',
        description: 'Your WhatsApp Business Account ID',
        type: 'text',
      },
    ],
  }],
  
  triggers: [
    {
      id: 'whatsapp_message_received',
      appId: 'whatsapp',
      name: 'Message Received',
      description: 'Triggers when a WhatsApp message is received',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'whatsapp_business',
      fields: [
        {
          id: 'messageTypes',
          name: 'Message Types',
          description: 'Filter by message type',
          type: 'multi-select',
          defaultValue: ['text'],
          options: [
            { value: 'text', label: 'Text Messages' },
            { value: 'image', label: 'Images' },
            { value: 'audio', label: 'Audio' },
            { value: 'video', label: 'Video' },
            { value: 'document', label: 'Documents' },
            { value: 'location', label: 'Location' },
            { value: 'contacts', label: 'Contacts' },
            { value: 'sticker', label: 'Stickers' },
          ],
        },
        {
          id: 'filterSender',
          name: 'Filter by Sender',
          description: 'Only trigger for specific phone numbers (comma-separated)',
          type: 'text',
          placeholder: '+1234567890, +0987654321',
        },
      ],
    },
    {
      id: 'whatsapp_status_update',
      appId: 'whatsapp',
      name: 'Message Status Update',
      description: 'Triggers when a message status changes (sent, delivered, read)',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'whatsapp_business',
      fields: [
        {
          id: 'statusTypes',
          name: 'Status Types',
          description: 'Which status updates to trigger on',
          type: 'multi-select',
          defaultValue: ['delivered', 'read'],
          options: [
            { value: 'sent', label: 'Sent' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'read', label: 'Read' },
            { value: 'failed', label: 'Failed' },
          ],
        },
      ],
    },
  ],
  
  actions: [
    {
      id: 'whatsapp_send_text',
      appId: 'whatsapp',
      name: 'Send Text Message',
      description: 'Send a text message to a WhatsApp number',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'whatsapp_business',
      fields: [
        {
          id: 'to',
          name: 'To',
          description: 'Recipient phone number with country code',
          type: 'expression',
          placeholder: '+1234567890 or {{contact.phone}}',
          validation: { required: true, pattern: '^\\+?[1-9]\\d{1,14}$' },
        },
        {
          id: 'body',
          name: 'Message',
          description: 'Text message content',
          type: 'expression',
          validation: { required: true, maxLength: 4096 },
          aiSuggestions: true,
        },
        {
          id: 'previewUrl',
          name: 'Preview URL',
          description: 'Show link preview for URLs in the message',
          type: 'boolean',
          defaultValue: true,
        },
      ],
    },
    {
      id: 'whatsapp_send_template',
      appId: 'whatsapp',
      name: 'Send Template Message',
      description: 'Send a pre-approved template message',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'whatsapp_business',
      fields: [
        {
          id: 'to',
          name: 'To',
          description: 'Recipient phone number',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'templateName',
          name: 'Template Name',
          description: 'Name of the approved template',
          type: 'resource',
          validation: { required: true },
          dynamicOptions: {
            type: 'api',
            endpoint: '/message_templates',
          },
        },
        {
          id: 'language',
          name: 'Language',
          description: 'Template language code',
          type: 'select',
          defaultValue: 'en',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'pt', label: 'Portuguese' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'hi', label: 'Hindi' },
          ],
        },
        {
          id: 'components',
          name: 'Template Variables',
          description: 'Variables to fill in the template',
          type: 'array',
          itemSchema: {
            id: 'variable',
            name: 'Variable',
            type: 'object',
            fields: [
              {
                id: 'type',
                name: 'Type',
                type: 'select',
                options: [
                  { value: 'text', label: 'Text' },
                  { value: 'currency', label: 'Currency' },
                  { value: 'date_time', label: 'Date/Time' },
                ],
              },
              {
                id: 'text',
                name: 'Value',
                type: 'expression',
              },
            ],
          },
        },
      ],
    },
    {
      id: 'whatsapp_send_media',
      appId: 'whatsapp',
      name: 'Send Media',
      description: 'Send image, video, audio, or document',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'whatsapp_business',
      fields: [
        {
          id: 'to',
          name: 'To',
          description: 'Recipient phone number',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'mediaType',
          name: 'Media Type',
          description: 'Type of media to send',
          type: 'select',
          validation: { required: true },
          options: [
            { value: 'image', label: 'Image' },
            { value: 'video', label: 'Video' },
            { value: 'audio', label: 'Audio' },
            { value: 'document', label: 'Document' },
          ],
        },
        {
          id: 'mediaUrl',
          name: 'Media URL',
          description: 'URL of the media file',
          type: 'url',
          validation: { required: true },
        },
        {
          id: 'caption',
          name: 'Caption',
          description: 'Caption for the media (images, videos, documents only)',
          type: 'expression',
          showWhen: [{ field: 'mediaType', condition: 'in', values: ['image', 'video', 'document'] }],
        },
        {
          id: 'filename',
          name: 'Filename',
          description: 'Filename for documents',
          type: 'text',
          showWhen: [{ field: 'mediaType', condition: 'equals', value: 'document' }],
        },
      ],
    },
    {
      id: 'whatsapp_send_buttons',
      appId: 'whatsapp',
      name: 'Send Interactive Buttons',
      description: 'Send a message with interactive buttons',
      category: 'Interactive',
      requiresCredential: true,
      credentialType: 'whatsapp_business',
      fields: [
        {
          id: 'to',
          name: 'To',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'bodyText',
          name: 'Body Text',
          description: 'Main message text',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'headerText',
          name: 'Header Text',
          description: 'Optional header above the body',
          type: 'text',
        },
        {
          id: 'footerText',
          name: 'Footer Text',
          description: 'Optional footer below the body',
          type: 'text',
        },
        {
          id: 'buttons',
          name: 'Buttons',
          description: 'Up to 3 buttons',
          type: 'array',
          validation: { required: true },
          itemSchema: {
            id: 'button',
            name: 'Button',
            type: 'object',
            fields: [
              {
                id: 'id',
                name: 'Button ID',
                type: 'text',
                validation: { required: true },
              },
              {
                id: 'title',
                name: 'Button Title',
                type: 'text',
                validation: { required: true, maxLength: 20 },
              },
            ],
          },
        },
      ],
    },
  ],
};

// ============================================
// TELEGRAM SCHEMA
// ============================================

export const telegramSchema: AppSchema = {
  id: 'telegram',
  name: 'Telegram',
  description: 'Send messages and manage Telegram bots',
  icon: '✈️',
  color: '#0088cc',
  category: 'Communication',
  tags: ['messaging', 'telegram', 'bot'],
  apiBaseUrl: 'https://api.telegram.org',
  apiDocsUrl: 'https://core.telegram.org/bots/api',
  version: '1.0.0',
  status: 'stable',
  supportsWebhooks: true,
  
  credentials: [{
    id: 'telegram_bot',
    name: 'Telegram Bot',
    type: 'apiKey',
    helpUrl: 'https://core.telegram.org/bots#creating-a-new-bot',
    fields: [{
      id: 'botToken',
      name: 'Bot Token',
      description: 'Get this from @BotFather',
      type: 'secret',
      validation: { required: true },
    }],
  }],
  
  triggers: [
    {
      id: 'telegram_message',
      appId: 'telegram',
      name: 'New Message',
      description: 'Triggers when the bot receives a message',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'telegram_bot',
      fields: [
        {
          id: 'updateTypes',
          name: 'Update Types',
          description: 'Which update types to listen for',
          type: 'multi-select',
          defaultValue: ['message'],
          options: [
            { value: 'message', label: 'Messages' },
            { value: 'edited_message', label: 'Edited Messages' },
            { value: 'channel_post', label: 'Channel Posts' },
            { value: 'callback_query', label: 'Callback Queries (Button clicks)' },
            { value: 'inline_query', label: 'Inline Queries' },
          ],
        },
        {
          id: 'chatTypes',
          name: 'Chat Types',
          description: 'Filter by chat type',
          type: 'multi-select',
          options: [
            { value: 'private', label: 'Private Chats' },
            { value: 'group', label: 'Groups' },
            { value: 'supergroup', label: 'Supergroups' },
            { value: 'channel', label: 'Channels' },
          ],
        },
      ],
    },
  ],
  
  actions: [
    {
      id: 'telegram_send_message',
      appId: 'telegram',
      name: 'Send Message',
      description: 'Send a text message',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'telegram_bot',
      fields: [
        {
          id: 'chatId',
          name: 'Chat ID',
          description: 'Unique identifier for the chat or @username',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'text',
          name: 'Message Text',
          description: 'Text of the message (1-4096 characters)',
          type: 'expression',
          validation: { required: true, maxLength: 4096 },
          aiSuggestions: true,
        },
        {
          id: 'parseMode',
          name: 'Parse Mode',
          description: 'Text formatting mode',
          type: 'select',
          defaultValue: 'HTML',
          options: [
            { value: '', label: 'Plain Text' },
            { value: 'HTML', label: 'HTML' },
            { value: 'Markdown', label: 'Markdown' },
            { value: 'MarkdownV2', label: 'Markdown V2' },
          ],
        },
        {
          id: 'disableWebPagePreview',
          name: 'Disable Link Preview',
          description: 'Don\'t show link previews',
          type: 'boolean',
          defaultValue: false,
        },
        {
          id: 'disableNotification',
          name: 'Silent Message',
          description: 'Send without notification sound',
          type: 'boolean',
          defaultValue: false,
        },
        {
          id: 'protectContent',
          name: 'Protect Content',
          description: 'Protect from forwarding and saving',
          type: 'boolean',
          defaultValue: false,
        },
        {
          id: 'replyToMessageId',
          name: 'Reply To Message ID',
          description: 'ID of the message to reply to',
          type: 'number',
        },
      ],
    },
    {
      id: 'telegram_send_photo',
      appId: 'telegram',
      name: 'Send Photo',
      description: 'Send a photo',
      category: 'Media',
      requiresCredential: true,
      credentialType: 'telegram_bot',
      fields: [
        {
          id: 'chatId',
          name: 'Chat ID',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'photo',
          name: 'Photo',
          description: 'Photo URL or file_id',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'caption',
          name: 'Caption',
          description: 'Photo caption (0-1024 characters)',
          type: 'expression',
          validation: { maxLength: 1024 },
        },
        {
          id: 'parseMode',
          name: 'Parse Mode',
          type: 'select',
          options: [
            { value: '', label: 'Plain Text' },
            { value: 'HTML', label: 'HTML' },
            { value: 'MarkdownV2', label: 'Markdown V2' },
          ],
        },
      ],
    },
    {
      id: 'telegram_send_buttons',
      appId: 'telegram',
      name: 'Send Inline Keyboard',
      description: 'Send a message with inline buttons',
      category: 'Interactive',
      requiresCredential: true,
      credentialType: 'telegram_bot',
      fields: [
        {
          id: 'chatId',
          name: 'Chat ID',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'text',
          name: 'Message Text',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'buttons',
          name: 'Buttons',
          description: 'Inline keyboard buttons',
          type: 'array',
          itemSchema: {
            id: 'row',
            name: 'Button Row',
            type: 'array',
            itemSchema: {
              id: 'button',
              name: 'Button',
              type: 'object',
              fields: [
                {
                  id: 'text',
                  name: 'Button Text',
                  type: 'text',
                  validation: { required: true },
                },
                {
                  id: 'callback_data',
                  name: 'Callback Data',
                  description: 'Data sent when button is clicked',
                  type: 'text',
                },
                {
                  id: 'url',
                  name: 'URL',
                  description: 'URL to open',
                  type: 'url',
                },
              ],
            },
          },
        },
      ],
    },
  ],
};

// ============================================
// SLACK SCHEMA
// ============================================

export const slackSchema: AppSchema = {
  id: 'slack',
  name: 'Slack',
  description: 'Send messages, manage channels, and automate Slack workflows',
  icon: '💼',
  color: '#4A154B',
  category: 'Communication',
  tags: ['messaging', 'slack', 'team', 'workspace'],
  apiBaseUrl: 'https://slack.com/api',
  apiDocsUrl: 'https://api.slack.com/docs',
  version: '1.0.0',
  status: 'stable',
  supportsWebhooks: true,
  
  credentials: [
    {
      id: 'slack_oauth',
      name: 'Slack OAuth',
      type: 'oauth2',
      helpUrl: 'https://api.slack.com/authentication/oauth-v2',
      fields: [
        {
          id: 'accessToken',
          name: 'Bot Token',
          description: 'OAuth access token (xoxb-...)',
          type: 'secret',
          validation: { required: true },
        },
      ],
    },
    {
      id: 'slack_webhook',
      name: 'Slack Webhook',
      type: 'custom',
      helpUrl: 'https://api.slack.com/messaging/webhooks',
      fields: [
        {
          id: 'webhookUrl',
          name: 'Webhook URL',
          description: 'Incoming webhook URL',
          type: 'secret',
          validation: { required: true, pattern: '^https://hooks.slack.com/' },
        },
      ],
    },
  ],
  
  triggers: [
    {
      id: 'slack_message',
      appId: 'slack',
      name: 'New Message',
      description: 'Triggers when a message is posted',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'slack_oauth',
      fields: [
        {
          id: 'channel',
          name: 'Channel',
          description: 'Channel to monitor',
          type: 'resource',
          dynamicOptions: {
            type: 'api',
            endpoint: '/conversations.list',
          },
        },
        {
          id: 'messageTypes',
          name: 'Message Types',
          type: 'multi-select',
          defaultValue: ['user'],
          options: [
            { value: 'user', label: 'User Messages' },
            { value: 'bot', label: 'Bot Messages' },
            { value: 'thread', label: 'Thread Replies' },
          ],
        },
        {
          id: 'keywords',
          name: 'Filter by Keywords',
          description: 'Only trigger if message contains these words',
          type: 'array',
          itemSchema: {
            id: 'keyword',
            name: 'Keyword',
            type: 'text',
          },
        },
      ],
    },
    {
      id: 'slack_reaction',
      appId: 'slack',
      name: 'Reaction Added',
      description: 'Triggers when a reaction emoji is added',
      category: 'Reactions',
      requiresCredential: true,
      credentialType: 'slack_oauth',
      fields: [
        {
          id: 'reaction',
          name: 'Reaction',
          description: 'Filter by specific emoji (leave empty for all)',
          type: 'text',
          placeholder: 'thumbsup',
        },
      ],
    },
  ],
  
  actions: [
    {
      id: 'slack_send_message',
      appId: 'slack',
      name: 'Send Message',
      description: 'Post a message to a channel',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'slack_oauth',
      fields: [
        {
          id: 'channel',
          name: 'Channel',
          description: 'Channel to post to',
          type: 'resource',
          validation: { required: true },
          dynamicOptions: {
            type: 'api',
            endpoint: '/conversations.list',
            transform: 'channels.map(c => ({ value: c.id, label: "#" + c.name }))',
          },
        },
        {
          id: 'text',
          name: 'Message',
          description: 'Message text (supports Slack markdown)',
          type: 'expression',
          validation: { required: true },
          aiSuggestions: true,
        },
        {
          id: 'blocks',
          name: 'Blocks',
          description: 'Rich message blocks (Block Kit)',
          type: 'json',
          aiHelp: 'Use Block Kit Builder: https://app.slack.com/block-kit-builder',
        },
        {
          id: 'threadTs',
          name: 'Thread Timestamp',
          description: 'Post as reply to this message',
          type: 'text',
        },
        {
          id: 'username',
          name: 'Bot Username',
          description: 'Override bot username',
          type: 'text',
        },
        {
          id: 'iconEmoji',
          name: 'Bot Icon',
          description: 'Override bot icon with emoji',
          type: 'text',
          placeholder: ':robot_face:',
        },
        {
          id: 'unfurlLinks',
          name: 'Unfurl Links',
          description: 'Show link previews',
          type: 'boolean',
          defaultValue: true,
        },
        {
          id: 'unfurlMedia',
          name: 'Unfurl Media',
          description: 'Show media previews',
          type: 'boolean',
          defaultValue: true,
        },
      ],
    },
    {
      id: 'slack_send_dm',
      appId: 'slack',
      name: 'Send Direct Message',
      description: 'Send a direct message to a user',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'slack_oauth',
      fields: [
        {
          id: 'user',
          name: 'User',
          description: 'User to message',
          type: 'resource',
          validation: { required: true },
          dynamicOptions: {
            type: 'api',
            endpoint: '/users.list',
            transform: 'members.map(u => ({ value: u.id, label: u.real_name || u.name }))',
          },
        },
        {
          id: 'text',
          name: 'Message',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'blocks',
          name: 'Blocks',
          type: 'json',
        },
      ],
    },
    {
      id: 'slack_update_message',
      appId: 'slack',
      name: 'Update Message',
      description: 'Update an existing message',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'slack_oauth',
      fields: [
        {
          id: 'channel',
          name: 'Channel',
          type: 'resource',
          validation: { required: true },
          dynamicOptions: { type: 'api', endpoint: '/conversations.list' },
        },
        {
          id: 'ts',
          name: 'Message Timestamp',
          description: 'Timestamp of the message to update',
          type: 'text',
          validation: { required: true },
        },
        {
          id: 'text',
          name: 'New Message',
          type: 'expression',
          validation: { required: true },
        },
      ],
    },
    {
      id: 'slack_add_reaction',
      appId: 'slack',
      name: 'Add Reaction',
      description: 'Add an emoji reaction to a message',
      category: 'Reactions',
      requiresCredential: true,
      credentialType: 'slack_oauth',
      fields: [
        {
          id: 'channel',
          name: 'Channel',
          type: 'resource',
          validation: { required: true },
          dynamicOptions: { type: 'api', endpoint: '/conversations.list' },
        },
        {
          id: 'timestamp',
          name: 'Message Timestamp',
          type: 'text',
          validation: { required: true },
        },
        {
          id: 'name',
          name: 'Emoji Name',
          description: 'Emoji name without colons',
          type: 'text',
          validation: { required: true },
          placeholder: 'thumbsup',
        },
      ],
    },
    {
      id: 'slack_create_channel',
      appId: 'slack',
      name: 'Create Channel',
      description: 'Create a new Slack channel',
      category: 'Channels',
      requiresCredential: true,
      credentialType: 'slack_oauth',
      fields: [
        {
          id: 'name',
          name: 'Channel Name',
          description: 'Name of the channel (lowercase, no spaces)',
          type: 'text',
          validation: { required: true, pattern: '^[a-z0-9-_]+$' },
        },
        {
          id: 'isPrivate',
          name: 'Private Channel',
          description: 'Create as private channel',
          type: 'boolean',
          defaultValue: false,
        },
        {
          id: 'description',
          name: 'Description',
          description: 'Channel description/purpose',
          type: 'textarea',
        },
      ],
    },
  ],
};

// ============================================
// DISCORD SCHEMA
// ============================================

export const discordSchema: AppSchema = {
  id: 'discord',
  name: 'Discord',
  description: 'Send messages and manage Discord servers',
  icon: '🎮',
  color: '#5865F2',
  category: 'Communication',
  tags: ['messaging', 'discord', 'gaming', 'community'],
  apiBaseUrl: 'https://discord.com/api/v10',
  apiDocsUrl: 'https://discord.com/developers/docs',
  version: '1.0.0',
  status: 'stable',
  supportsWebhooks: true,
  
  credentials: [
    {
      id: 'discord_bot',
      name: 'Discord Bot',
      type: 'bearer',
      helpUrl: 'https://discord.com/developers/applications',
      fields: [
        {
          id: 'botToken',
          name: 'Bot Token',
          description: 'Your Discord bot token',
          type: 'secret',
          validation: { required: true },
        },
      ],
    },
    {
      id: 'discord_webhook',
      name: 'Discord Webhook',
      type: 'custom',
      fields: [
        {
          id: 'webhookUrl',
          name: 'Webhook URL',
          type: 'secret',
          validation: { required: true, pattern: '^https://discord(app)?.com/api/webhooks/' },
        },
      ],
    },
  ],
  
  triggers: [
    {
      id: 'discord_message',
      appId: 'discord',
      name: 'New Message',
      description: 'Triggers when a message is sent',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'discord_bot',
      fields: [
        {
          id: 'guildId',
          name: 'Server',
          type: 'resource',
          dynamicOptions: { type: 'api', endpoint: '/users/@me/guilds' },
        },
        {
          id: 'channelId',
          name: 'Channel',
          type: 'resource',
          dynamicOptions: {
            type: 'dependent',
            dependsOn: ['guildId'],
            endpoint: '/guilds/{guildId}/channels',
          },
        },
      ],
    },
  ],
  
  actions: [
    {
      id: 'discord_send_message',
      appId: 'discord',
      name: 'Send Message',
      description: 'Send a message to a channel',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'discord_bot',
      fields: [
        {
          id: 'channelId',
          name: 'Channel ID',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'content',
          name: 'Message Content',
          description: 'Message text (up to 2000 characters)',
          type: 'expression',
          validation: { required: true, maxLength: 2000 },
        },
        {
          id: 'tts',
          name: 'Text-to-Speech',
          description: 'Send as TTS message',
          type: 'boolean',
          defaultValue: false,
        },
        {
          id: 'embeds',
          name: 'Embeds',
          description: 'Rich embed objects',
          type: 'json',
          aiHelp: 'Discord embed builder: https://discohook.org/',
        },
      ],
    },
    {
      id: 'discord_webhook_send',
      appId: 'discord',
      name: 'Send via Webhook',
      description: 'Send a message using a webhook',
      category: 'Webhooks',
      requiresCredential: true,
      credentialType: 'discord_webhook',
      fields: [
        {
          id: 'content',
          name: 'Message',
          type: 'expression',
        },
        {
          id: 'username',
          name: 'Override Username',
          type: 'text',
        },
        {
          id: 'avatarUrl',
          name: 'Override Avatar',
          type: 'url',
        },
        {
          id: 'embeds',
          name: 'Embeds',
          type: 'json',
        },
      ],
    },
  ],
};

// ============================================
// MICROSOFT TEAMS SCHEMA
// ============================================

export const teamsSchema: AppSchema = {
  id: 'teams',
  name: 'Microsoft Teams',
  description: 'Send messages and notifications to Microsoft Teams',
  icon: '👥',
  color: '#6264A7',
  category: 'Communication',
  tags: ['messaging', 'teams', 'microsoft', 'enterprise'],
  apiBaseUrl: 'https://graph.microsoft.com/v1.0',
  apiDocsUrl: 'https://docs.microsoft.com/graph/api/resources/teams-api-overview',
  version: '1.0.0',
  status: 'stable',
  
  credentials: [
    {
      id: 'teams_oauth',
      name: 'Microsoft OAuth',
      type: 'oauth2',
      helpUrl: 'https://docs.microsoft.com/azure/active-directory/develop/',
      fields: [
        {
          id: 'clientId',
          name: 'Client ID',
          type: 'text',
          validation: { required: true },
        },
        {
          id: 'clientSecret',
          name: 'Client Secret',
          type: 'secret',
          validation: { required: true },
        },
        {
          id: 'tenantId',
          name: 'Tenant ID',
          type: 'text',
          validation: { required: true },
        },
      ],
    },
    {
      id: 'teams_webhook',
      name: 'Teams Webhook',
      type: 'custom',
      fields: [
        {
          id: 'webhookUrl',
          name: 'Webhook URL',
          type: 'secret',
          validation: { required: true },
        },
      ],
    },
  ],
  
  triggers: [
    {
      id: 'teams_message',
      appId: 'teams',
      name: 'New Message',
      description: 'Triggers when a message is posted',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'teams_oauth',
      fields: [
        {
          id: 'teamId',
          name: 'Team',
          type: 'resource',
          dynamicOptions: { type: 'api', endpoint: '/me/joinedTeams' },
        },
        {
          id: 'channelId',
          name: 'Channel',
          type: 'resource',
          dynamicOptions: {
            type: 'dependent',
            dependsOn: ['teamId'],
          },
        },
      ],
    },
  ],
  
  actions: [
    {
      id: 'teams_send_message',
      appId: 'teams',
      name: 'Send Message',
      description: 'Send a message to a Teams channel',
      category: 'Messages',
      requiresCredential: true,
      credentialType: 'teams_oauth',
      fields: [
        {
          id: 'teamId',
          name: 'Team',
          type: 'resource',
          validation: { required: true },
          dynamicOptions: { type: 'api', endpoint: '/me/joinedTeams' },
        },
        {
          id: 'channelId',
          name: 'Channel',
          type: 'resource',
          validation: { required: true },
          dynamicOptions: { type: 'dependent', dependsOn: ['teamId'] },
        },
        {
          id: 'message',
          name: 'Message',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'contentType',
          name: 'Content Type',
          type: 'select',
          defaultValue: 'text',
          options: [
            { value: 'text', label: 'Plain Text' },
            { value: 'html', label: 'HTML' },
          ],
        },
      ],
    },
    {
      id: 'teams_webhook_send',
      appId: 'teams',
      name: 'Send via Webhook',
      description: 'Send a message using incoming webhook',
      category: 'Webhooks',
      requiresCredential: true,
      credentialType: 'teams_webhook',
      fields: [
        {
          id: 'text',
          name: 'Message',
          type: 'expression',
          validation: { required: true },
        },
        {
          id: 'title',
          name: 'Title',
          type: 'text',
        },
        {
          id: 'themeColor',
          name: 'Theme Color',
          description: 'Accent color (hex)',
          type: 'color',
          defaultValue: '#0078D4',
        },
      ],
    },
  ],
};

// Export all communication schemas
export const communicationAppSchemas: AppSchema[] = [
  whatsappSchema,
  telegramSchema,
  slackSchema,
  discordSchema,
  teamsSchema,
];
