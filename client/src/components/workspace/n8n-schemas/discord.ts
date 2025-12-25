/**
 * Discord n8n-style Schema
 * 
 * Comprehensive Discord API operations
 */

import { N8nAppSchema } from './types';

export const discordSchema: N8nAppSchema = {
  id: 'discord',
  name: 'Discord',
  description: 'Discord bot and webhook integrations',
  version: '1.0.0',
  color: '#5865F2',
  icon: 'discord',
  group: ['communication', 'messaging'],
  
  credentials: [
    {
      name: 'discordBotApi',
      displayName: 'Discord Bot Token',
      required: true,
      type: 'string',
    },
    {
      name: 'discordWebhook',
      displayName: 'Discord Webhook URL',
      required: false,
      type: 'string',
    },
  ],
  
  resources: [
    // ============================================
    // MESSAGE RESOURCE
    // ============================================
    {
      id: 'message',
      name: 'Message',
      value: 'message',
      description: 'Send and manage messages',
      operations: [
        {
          id: 'send_message',
          name: 'Send Message',
          value: 'send',
          description: 'Send a message to a channel',
          action: 'Send a message to a Discord channel',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
              description: 'The ID of the channel to send the message to',
              placeholder: '123456789012345678',
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'Message Content',
              type: 'text',
              required: true,
              description: 'The content of the message (up to 2000 characters)',
              placeholder: 'Enter your message...',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'tts',
              name: 'tts',
              displayName: 'Text-to-Speech',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Whether this is a TTS message',
            },
            {
              id: 'embeds',
              name: 'embeds',
              displayName: 'Embeds (JSON)',
              type: 'json',
              required: false,
              description: 'Array of embed objects',
              placeholder: '[{"title": "Embed Title", "description": "Embed description"}]',
            },
            {
              id: 'reply_to',
              name: 'messageReference',
              displayName: 'Reply To Message ID',
              type: 'string',
              required: false,
              description: 'ID of the message to reply to',
            },
          ],
        },
        {
          id: 'edit_message',
          name: 'Edit Message',
          value: 'edit',
          description: 'Edit a message',
          action: 'Edit an existing message',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'New Content',
              type: 'text',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'embeds',
              name: 'embeds',
              displayName: 'Embeds (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'delete_message',
          name: 'Delete Message',
          value: 'delete',
          description: 'Delete a message',
          action: 'Delete a message from a channel',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_message',
          name: 'Get Message',
          value: 'get',
          description: 'Get a specific message',
          action: 'Retrieve a specific message by ID',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_messages',
          name: 'Get Messages',
          value: 'getMany',
          description: 'Get multiple messages',
          action: 'Retrieve multiple messages from a channel',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 50,
              description: 'Max number of messages to return (1-100)',
              typeOptions: {
                minValue: 1,
                maxValue: 100,
              },
            },
            {
              id: 'before',
              name: 'before',
              displayName: 'Before Message ID',
              type: 'string',
              required: false,
              description: 'Get messages before this message ID',
            },
            {
              id: 'after',
              name: 'after',
              displayName: 'After Message ID',
              type: 'string',
              required: false,
              description: 'Get messages after this message ID',
            },
          ],
        },
        {
          id: 'pin_message',
          name: 'Pin Message',
          value: 'pin',
          description: 'Pin a message',
          action: 'Pin a message in a channel',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // CHANNEL RESOURCE
    // ============================================
    {
      id: 'channel',
      name: 'Channel',
      value: 'channel',
      description: 'Manage channels',
      operations: [
        {
          id: 'get_channel',
          name: 'Get Channel',
          value: 'get',
          description: 'Get channel information',
          action: 'Get a channel by ID',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'edit_channel',
          name: 'Edit Channel',
          value: 'edit',
          description: 'Modify a channel',
          action: 'Update a channel\'s settings',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Channel Name',
              type: 'string',
              required: false,
              description: 'New channel name (1-100 characters)',
            },
            {
              id: 'topic',
              name: 'topic',
              displayName: 'Channel Topic',
              type: 'text',
              required: false,
              description: 'Channel topic (0-1024 characters)',
            },
            {
              id: 'nsfw',
              name: 'nsfw',
              displayName: 'NSFW',
              type: 'boolean',
              required: false,
              description: 'Whether the channel is NSFW',
            },
            {
              id: 'rate_limit',
              name: 'rateLimitPerUser',
              displayName: 'Slowmode (seconds)',
              type: 'number',
              required: false,
              description: 'Slowmode rate limit (0-21600 seconds)',
            },
          ],
        },
        {
          id: 'delete_channel',
          name: 'Delete Channel',
          value: 'delete',
          description: 'Delete a channel',
          action: 'Delete a guild channel',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'create_channel',
          name: 'Create Channel',
          value: 'create',
          description: 'Create a new channel',
          action: 'Create a new channel in a guild',
          fields: [
            {
              id: 'guild_id',
              name: 'guildId',
              displayName: 'Server ID',
              type: 'string',
              required: true,
            },
            {
              id: 'name',
              name: 'name',
              displayName: 'Channel Name',
              type: 'string',
              required: true,
              description: 'Channel name (1-100 characters)',
            },
            {
              id: 'type',
              name: 'type',
              displayName: 'Channel Type',
              type: 'options',
              required: true,
              default: '0',
              options: [
                { name: 'Text Channel', value: '0' },
                { name: 'Voice Channel', value: '2' },
                { name: 'Category', value: '4' },
                { name: 'Announcement', value: '5' },
                { name: 'Stage', value: '13' },
                { name: 'Forum', value: '15' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'topic',
              name: 'topic',
              displayName: 'Topic',
              type: 'text',
              required: false,
            },
            {
              id: 'parent_id',
              name: 'parentId',
              displayName: 'Category ID',
              type: 'string',
              required: false,
              description: 'Category to place the channel in',
            },
          ],
        },
      ],
    },
    
    // ============================================
    // WEBHOOK RESOURCE
    // ============================================
    {
      id: 'webhook',
      name: 'Webhook',
      value: 'webhook',
      description: 'Send messages via webhook',
      operations: [
        {
          id: 'send_webhook',
          name: 'Send Webhook Message',
          value: 'send',
          description: 'Send a message via webhook',
          action: 'Send a message using a webhook URL',
          fields: [
            {
              id: 'webhook_url',
              name: 'webhookUrl',
              displayName: 'Webhook URL',
              type: 'string',
              required: true,
              description: 'The Discord webhook URL',
              placeholder: 'https://discord.com/api/webhooks/...',
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'Message Content',
              type: 'text',
              required: true,
              description: 'The message content',
            },
          ],
          optionalFields: [
            {
              id: 'username',
              name: 'username',
              displayName: 'Username Override',
              type: 'string',
              required: false,
              description: 'Override the default webhook username',
            },
            {
              id: 'avatar_url',
              name: 'avatarUrl',
              displayName: 'Avatar URL',
              type: 'string',
              required: false,
              description: 'Override the default webhook avatar',
            },
            {
              id: 'embeds',
              name: 'embeds',
              displayName: 'Embeds (JSON)',
              type: 'json',
              required: false,
              description: 'Array of embed objects',
            },
          ],
        },
      ],
    },
    
    // ============================================
    // MEMBER RESOURCE
    // ============================================
    {
      id: 'member',
      name: 'Member',
      value: 'member',
      description: 'Manage server members',
      operations: [
        {
          id: 'get_member',
          name: 'Get Member',
          value: 'get',
          description: 'Get a server member',
          action: 'Get a guild member by ID',
          fields: [
            {
              id: 'guild_id',
              name: 'guildId',
              displayName: 'Server ID',
              type: 'string',
              required: true,
            },
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_members',
          name: 'Get Members',
          value: 'getMany',
          description: 'Get multiple members',
          action: 'List members in a guild',
          fields: [
            {
              id: 'guild_id',
              name: 'guildId',
              displayName: 'Server ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 100,
              typeOptions: {
                minValue: 1,
                maxValue: 1000,
              },
            },
          ],
        },
        {
          id: 'add_role',
          name: 'Add Role',
          value: 'addRole',
          description: 'Add a role to a member',
          action: 'Add a role to a guild member',
          fields: [
            {
              id: 'guild_id',
              name: 'guildId',
              displayName: 'Server ID',
              type: 'string',
              required: true,
            },
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
            {
              id: 'role_id',
              name: 'roleId',
              displayName: 'Role ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'remove_role',
          name: 'Remove Role',
          value: 'removeRole',
          description: 'Remove a role from a member',
          action: 'Remove a role from a guild member',
          fields: [
            {
              id: 'guild_id',
              name: 'guildId',
              displayName: 'Server ID',
              type: 'string',
              required: true,
            },
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
            {
              id: 'role_id',
              name: 'roleId',
              displayName: 'Role ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'kick_member',
          name: 'Kick Member',
          value: 'kick',
          description: 'Kick a member from the server',
          action: 'Remove a member from a guild',
          fields: [
            {
              id: 'guild_id',
              name: 'guildId',
              displayName: 'Server ID',
              type: 'string',
              required: true,
            },
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'reason',
              name: 'reason',
              displayName: 'Reason',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'ban_member',
          name: 'Ban Member',
          value: 'ban',
          description: 'Ban a member from the server',
          action: 'Ban a user from a guild',
          fields: [
            {
              id: 'guild_id',
              name: 'guildId',
              displayName: 'Server ID',
              type: 'string',
              required: true,
            },
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'reason',
              name: 'reason',
              displayName: 'Reason',
              type: 'string',
              required: false,
            },
            {
              id: 'delete_message_days',
              name: 'deleteMessageDays',
              displayName: 'Delete Message Days',
              type: 'number',
              required: false,
              description: 'Number of days to delete messages (0-7)',
              typeOptions: {
                minValue: 0,
                maxValue: 7,
              },
            },
          ],
        },
      ],
    },
    
    // ============================================
    // REACTION RESOURCE
    // ============================================
    {
      id: 'reaction',
      name: 'Reaction',
      value: 'reaction',
      description: 'Manage message reactions',
      operations: [
        {
          id: 'add_reaction',
          name: 'Add Reaction',
          value: 'add',
          description: 'Add a reaction to a message',
          action: 'React to a message with an emoji',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
            {
              id: 'emoji',
              name: 'emoji',
              displayName: 'Emoji',
              type: 'string',
              required: true,
              description: 'The emoji to react with (e.g., 👍 or custom emoji name)',
              placeholder: '👍',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'remove_reaction',
          name: 'Remove Reaction',
          value: 'remove',
          description: 'Remove a reaction',
          action: 'Remove your reaction from a message',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
            {
              id: 'emoji',
              name: 'emoji',
              displayName: 'Emoji',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: false,
              description: 'User whose reaction to remove (default: self)',
            },
          ],
        },
        {
          id: 'get_reactions',
          name: 'Get Reactions',
          value: 'getMany',
          description: 'Get users who reacted',
          action: 'Get a list of users that reacted with this emoji',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
            {
              id: 'emoji',
              name: 'emoji',
              displayName: 'Emoji',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 25,
            },
          ],
        },
      ],
    },
  ],
};
