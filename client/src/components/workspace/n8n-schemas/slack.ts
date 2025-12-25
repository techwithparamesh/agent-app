/**
 * Slack n8n-Style Schema
 * 
 * Resources: Channel, Message, File, Reaction, Star, User, User Group
 * Based on: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/
 */

import { N8nAppSchema } from './types';

export const slackSchema: N8nAppSchema = {
  id: 'slack',
  name: 'Slack',
  icon: 'slack',
  color: '#4A154B',
  description: 'Send messages, manage channels, and interact with your Slack workspace',
  version: '1.0',
  subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
  group: ['communication'],
  documentationUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/',

  credentials: [
    {
      id: 'slack_oauth2',
      name: 'Slack OAuth2',
      type: 'oAuth2',
      fields: [
        {
          id: 'client_id',
          displayName: 'Client ID',
          name: 'clientId',
          type: 'string',
          required: true,
          description: 'Your Slack App Client ID',
        },
        {
          id: 'client_secret',
          displayName: 'Client Secret',
          name: 'clientSecret',
          type: 'password',
          required: true,
          description: 'Your Slack App Client Secret',
        },
      ],
    },
    {
      id: 'slack_api',
      name: 'Slack Bot Token',
      type: 'apiKey',
      fields: [
        {
          id: 'bot_token',
          displayName: 'Bot Token',
          name: 'accessToken',
          type: 'password',
          required: true,
          description: 'Your Slack Bot User OAuth Token (xoxb-...)',
          placeholder: 'xoxb-...',
        },
      ],
    },
  ],

  resources: [
    // ========================================
    // CHANNEL RESOURCE
    // ========================================
    {
      id: 'channel',
      name: 'Channel',
      value: 'channel',
      description: 'Create, manage, and interact with Slack channels',
      operations: [
        {
          id: 'create_channel',
          name: 'Create',
          value: 'create',
          description: 'Create a new channel',
          action: 'Create a channel',
          fields: [
            {
              id: 'name',
              displayName: 'Channel Name',
              name: 'name',
              type: 'string',
              required: true,
              description: 'Name of the channel to create (lowercase, no spaces)',
              placeholder: 'my-new-channel',
              validation: {
                pattern: '^[a-z0-9-_]+$',
                patternMessage: 'Channel names must be lowercase with hyphens or underscores',
                maxLength: 80,
              },
            },
          ],
          optionalFields: [
            {
              id: 'is_private',
              displayName: 'Private',
              name: 'isPrivate',
              type: 'boolean',
              default: false,
              description: 'Whether the channel should be private',
            },
            {
              id: 'team_id',
              displayName: 'Team ID',
              name: 'teamId',
              type: 'string',
              description: 'Team ID for Enterprise Grid workspaces',
              placeholder: 'T12345678',
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.create',
            },
          },
        },
        {
          id: 'archive_channel',
          name: 'Archive',
          value: 'archive',
          description: 'Archive a channel',
          action: 'Archive a channel',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to archive',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.archive',
            },
          },
        },
        {
          id: 'unarchive_channel',
          name: 'Unarchive',
          value: 'unarchive',
          description: 'Unarchive a channel',
          action: 'Unarchive a channel',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'string',
              required: true,
              description: 'The channel ID to unarchive',
              placeholder: 'C12345678',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.unarchive',
            },
          },
        },
        {
          id: 'close_channel',
          name: 'Close',
          value: 'close',
          description: 'Close a direct message or multi-person direct message',
          action: 'Close a conversation',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The conversation to close',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.close',
            },
          },
        },
        {
          id: 'get_channel',
          name: 'Get',
          value: 'get',
          description: 'Get information about a channel',
          action: 'Get channel info',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to get information about',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
          ],
          optionalFields: [
            {
              id: 'include_locale',
              displayName: 'Include Locale',
              name: 'includeLocale',
              type: 'boolean',
              default: false,
              description: 'Include locale info in response',
            },
            {
              id: 'include_num_members',
              displayName: 'Include Member Count',
              name: 'includeNumMembers',
              type: 'boolean',
              default: false,
              description: 'Include number of members',
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/conversations.info',
            },
          },
        },
        {
          id: 'get_many_channels',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many channels',
          action: 'Get many channels',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
              description: 'Whether to return all results or limit',
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              description: 'Maximum number of results to return',
              displayOptions: {
                show: {
                  returnAll: [false],
                },
              },
              typeOptions: {
                minValue: 1,
                maxValue: 1000,
              },
            },
            {
              id: 'types',
              displayName: 'Channel Types',
              name: 'types',
              type: 'multiOptions',
              default: ['public_channel'],
              description: 'Types of channels to return',
              options: [
                { name: 'Public Channel', value: 'public_channel' },
                { name: 'Private Channel', value: 'private_channel' },
                { name: 'Direct Message', value: 'im' },
                { name: 'Multi-party Direct Message', value: 'mpim' },
              ],
            },
            {
              id: 'exclude_archived',
              displayName: 'Exclude Archived',
              name: 'excludeArchived',
              type: 'boolean',
              default: true,
              description: 'Exclude archived channels from results',
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/conversations.list',
            },
          },
        },
        {
          id: 'history_channel',
          name: 'History',
          value: 'history',
          description: 'Get channel message history',
          action: 'Get message history',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to get history from',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
          ],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
              description: 'Whether to return all messages',
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 100,
              displayOptions: {
                show: {
                  returnAll: [false],
                },
              },
              typeOptions: {
                minValue: 1,
                maxValue: 1000,
              },
            },
            {
              id: 'oldest',
              displayName: 'Oldest',
              name: 'oldest',
              type: 'dateTime',
              description: 'Start of time range (inclusive)',
            },
            {
              id: 'latest',
              displayName: 'Latest',
              name: 'latest',
              type: 'dateTime',
              description: 'End of time range (exclusive)',
            },
            {
              id: 'inclusive',
              displayName: 'Inclusive',
              name: 'inclusive',
              type: 'boolean',
              default: true,
              description: 'Include messages with oldest/latest timestamps',
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/conversations.history',
            },
          },
        },
        {
          id: 'invite_channel',
          name: 'Invite',
          value: 'invite',
          description: 'Invite users to a channel',
          action: 'Invite to channel',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to invite users to',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'users',
              displayName: 'Users',
              name: 'users',
              type: 'multiOptions',
              required: true,
              description: 'The users to invite',
              typeOptions: {
                loadOptionsMethod: 'getUsers',
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.invite',
            },
          },
        },
        {
          id: 'join_channel',
          name: 'Join',
          value: 'join',
          description: 'Join an existing channel',
          action: 'Join a channel',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to join',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.join',
            },
          },
        },
        {
          id: 'kick_channel',
          name: 'Kick',
          value: 'kick',
          description: 'Remove a user from a channel',
          action: 'Remove from channel',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to remove user from',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'user',
              displayName: 'User',
              name: 'user',
              type: 'options',
              required: true,
              description: 'The user to remove',
              typeOptions: {
                loadOptionsMethod: 'getUsers',
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.kick',
            },
          },
        },
        {
          id: 'leave_channel',
          name: 'Leave',
          value: 'leave',
          description: 'Leave a channel',
          action: 'Leave a channel',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to leave',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.leave',
            },
          },
        },
        {
          id: 'members_channel',
          name: 'Members',
          value: 'members',
          description: 'Get all members in a channel',
          action: 'Get channel members',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to get members from',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
          ],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 100,
              displayOptions: {
                show: {
                  returnAll: [false],
                },
              },
              typeOptions: {
                minValue: 1,
                maxValue: 1000,
              },
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/conversations.members',
            },
          },
        },
        {
          id: 'rename_channel',
          name: 'Rename',
          value: 'rename',
          description: 'Rename a channel',
          action: 'Rename a channel',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to rename',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'name',
              displayName: 'New Name',
              name: 'name',
              type: 'string',
              required: true,
              description: 'The new name for the channel',
              placeholder: 'new-channel-name',
              validation: {
                pattern: '^[a-z0-9-_]+$',
                maxLength: 80,
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.rename',
            },
          },
        },
        {
          id: 'replies_channel',
          name: 'Replies',
          value: 'replies',
          description: 'Get replies to a message thread',
          action: 'Get message replies',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel containing the thread',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'ts',
              displayName: 'Thread Timestamp',
              name: 'ts',
              type: 'string',
              required: true,
              description: 'The timestamp of the parent message',
              placeholder: '1234567890.123456',
            },
          ],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 100,
              displayOptions: {
                show: {
                  returnAll: [false],
                },
              },
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/conversations.replies',
            },
          },
        },
        {
          id: 'set_purpose_channel',
          name: 'Set Purpose',
          value: 'setPurpose',
          description: 'Set the purpose of a channel',
          action: 'Set channel purpose',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to set purpose for',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'purpose',
              displayName: 'Purpose',
              name: 'purpose',
              type: 'text',
              required: true,
              description: 'The new purpose for the channel',
              placeholder: 'This channel is for team discussions',
              validation: {
                maxLength: 250,
              },
              typeOptions: {
                rows: 2,
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.setPurpose',
            },
          },
        },
        {
          id: 'set_topic_channel',
          name: 'Set Topic',
          value: 'setTopic',
          description: 'Set the topic of a channel',
          action: 'Set channel topic',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to set topic for',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'topic',
              displayName: 'Topic',
              name: 'topic',
              type: 'string',
              required: true,
              description: 'The new topic for the channel',
              placeholder: 'Current sprint: Feature X',
              validation: {
                maxLength: 250,
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/conversations.setTopic',
            },
          },
        },
      ],
    },

    // ========================================
    // MESSAGE RESOURCE
    // ========================================
    {
      id: 'message',
      name: 'Message',
      value: 'message',
      description: 'Send, update, and delete messages',
      operations: [
        {
          id: 'send_message',
          name: 'Send',
          value: 'send',
          description: 'Send a message to a channel',
          action: 'Send a message',
          fields: [
            {
              id: 'select',
              displayName: 'Send Message To',
              name: 'select',
              type: 'options',
              required: true,
              default: 'channel',
              description: 'Choose where to send the message',
              options: [
                { name: 'Channel', value: 'channel', description: 'Send to a channel' },
                { name: 'User', value: 'user', description: 'Send direct message to user' },
              ],
            },
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to send the message to',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
              displayOptions: {
                show: {
                  select: ['channel'],
                },
              },
            },
            {
              id: 'user',
              displayName: 'User',
              name: 'user',
              type: 'options',
              required: true,
              description: 'The user to send the message to',
              typeOptions: {
                loadOptionsMethod: 'getUsers',
              },
              displayOptions: {
                show: {
                  select: ['user'],
                },
              },
            },
            {
              id: 'message_type',
              displayName: 'Message Type',
              name: 'messageType',
              type: 'options',
              required: true,
              default: 'text',
              description: 'The type of message to send',
              options: [
                { name: 'Text', value: 'text', description: 'Simple text message' },
                { name: 'Block', value: 'block', description: 'Rich block layout message' },
                { name: 'Attachment', value: 'attachment', description: 'Legacy attachment format' },
              ],
            },
            {
              id: 'text',
              displayName: 'Message Text',
              name: 'text',
              type: 'text',
              required: true,
              description: 'The text of the message (supports Slack markdown)',
              placeholder: 'Hello *world*! :wave:',
              displayOptions: {
                show: {
                  messageType: ['text'],
                },
              },
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'blocks_json',
              displayName: 'Blocks (JSON)',
              name: 'blocksJson',
              type: 'json',
              required: true,
              description: 'Block Kit JSON (use Slack Block Kit Builder)',
              displayOptions: {
                show: {
                  messageType: ['block'],
                },
              },
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
            {
              id: 'attachments_json',
              displayName: 'Attachments (JSON)',
              name: 'attachmentsJson',
              type: 'json',
              required: true,
              description: 'Legacy attachments JSON',
              displayOptions: {
                show: {
                  messageType: ['attachment'],
                },
              },
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
          ],
          optionalFields: [
            {
              id: 'as_user',
              displayName: 'Send as User',
              name: 'asUser',
              type: 'boolean',
              default: false,
              description: 'Post the message as the authenticated user instead of as a bot',
            },
            {
              id: 'icon_emoji',
              displayName: 'Icon Emoji',
              name: 'iconEmoji',
              type: 'string',
              description: 'Emoji to use as the icon (override bot icon)',
              placeholder: ':robot_face:',
            },
            {
              id: 'icon_url',
              displayName: 'Icon URL',
              name: 'iconUrl',
              type: 'string',
              description: 'URL to an image to use as the icon',
              placeholder: 'https://example.com/icon.png',
            },
            {
              id: 'username',
              displayName: 'Username',
              name: 'username',
              type: 'string',
              description: 'Set the bot\'s username for this message',
              placeholder: 'MyBot',
            },
            {
              id: 'thread_ts',
              displayName: 'Thread Timestamp',
              name: 'threadTs',
              type: 'string',
              description: 'Reply to a specific message thread',
              placeholder: '1234567890.123456',
            },
            {
              id: 'reply_broadcast',
              displayName: 'Reply Broadcast',
              name: 'replyBroadcast',
              type: 'boolean',
              default: false,
              description: 'Also post reply to the channel',
            },
            {
              id: 'unfurl_links',
              displayName: 'Unfurl Links',
              name: 'unfurlLinks',
              type: 'boolean',
              default: true,
              description: 'Enable unfurling of primarily text-based content',
            },
            {
              id: 'unfurl_media',
              displayName: 'Unfurl Media',
              name: 'unfurlMedia',
              type: 'boolean',
              default: true,
              description: 'Enable unfurling of media content',
            },
            {
              id: 'link_names',
              displayName: 'Link Names',
              name: 'linkNames',
              type: 'boolean',
              default: false,
              description: 'Find and link channel names and usernames',
            },
            {
              id: 'mrkdwn',
              displayName: 'Parse Markdown',
              name: 'mrkdwn',
              type: 'boolean',
              default: true,
              description: 'Parse message text as markdown',
            },
            {
              id: 'metadata',
              displayName: 'Metadata',
              name: 'metadata',
              type: 'json',
              description: 'Message metadata for apps',
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/chat.postMessage',
            },
          },
        },
        {
          id: 'update_message',
          name: 'Update',
          value: 'update',
          description: 'Update a message',
          action: 'Update a message',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel containing the message',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'ts',
              displayName: 'Message Timestamp',
              name: 'ts',
              type: 'string',
              required: true,
              description: 'Timestamp of the message to update',
              placeholder: '1234567890.123456',
            },
            {
              id: 'text',
              displayName: 'New Text',
              name: 'text',
              type: 'text',
              required: true,
              description: 'New text for the message',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'blocks_json',
              displayName: 'Blocks (JSON)',
              name: 'blocksJson',
              type: 'json',
              description: 'Updated Block Kit JSON',
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
            {
              id: 'attachments_json',
              displayName: 'Attachments (JSON)',
              name: 'attachmentsJson',
              type: 'json',
              description: 'Updated attachments',
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
            {
              id: 'link_names',
              displayName: 'Link Names',
              name: 'linkNames',
              type: 'boolean',
              default: false,
            },
            {
              id: 'parse',
              displayName: 'Parse Mode',
              name: 'parse',
              type: 'options',
              default: 'none',
              options: [
                { name: 'None', value: 'none' },
                { name: 'Full', value: 'full' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/chat.update',
            },
          },
        },
        {
          id: 'delete_message',
          name: 'Delete',
          value: 'delete',
          description: 'Delete a message',
          action: 'Delete a message',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel containing the message',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'ts',
              displayName: 'Message Timestamp',
              name: 'ts',
              type: 'string',
              required: true,
              description: 'Timestamp of the message to delete',
              placeholder: '1234567890.123456',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/chat.delete',
            },
          },
        },
        {
          id: 'get_message',
          name: 'Get Permalink',
          value: 'getPermalink',
          description: 'Get a permalink to a message',
          action: 'Get message permalink',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel containing the message',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'ts',
              displayName: 'Message Timestamp',
              name: 'ts',
              type: 'string',
              required: true,
              description: 'Timestamp of the message',
              placeholder: '1234567890.123456',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/chat.getPermalink',
            },
          },
        },
        {
          id: 'schedule_message',
          name: 'Schedule',
          value: 'schedule',
          description: 'Schedule a message to be sent later',
          action: 'Schedule a message',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel to send the scheduled message to',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'text',
              displayName: 'Message Text',
              name: 'text',
              type: 'text',
              required: true,
              description: 'The text of the message',
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'post_at',
              displayName: 'Post At',
              name: 'postAt',
              type: 'dateTime',
              required: true,
              description: 'Unix timestamp for when to send the message',
            },
          ],
          optionalFields: [
            {
              id: 'thread_ts',
              displayName: 'Thread Timestamp',
              name: 'threadTs',
              type: 'string',
              description: 'Reply to a thread',
            },
            {
              id: 'as_user',
              displayName: 'Send as User',
              name: 'asUser',
              type: 'boolean',
              default: false,
            },
            {
              id: 'blocks_json',
              displayName: 'Blocks (JSON)',
              name: 'blocksJson',
              type: 'json',
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/chat.scheduleMessage',
            },
          },
        },
      ],
    },

    // ========================================
    // FILE RESOURCE
    // ========================================
    {
      id: 'file',
      name: 'File',
      value: 'file',
      description: 'Upload, share, and manage files',
      operations: [
        {
          id: 'upload_file',
          name: 'Upload',
          value: 'upload',
          description: 'Upload a file to Slack',
          action: 'Upload a file',
          fields: [
            {
              id: 'channels',
              displayName: 'Channels',
              name: 'channels',
              type: 'multiOptions',
              required: true,
              description: 'Channels to share the file to',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'binary_data',
              displayName: 'Binary Data',
              name: 'binaryData',
              type: 'boolean',
              default: false,
              description: 'Whether the file is binary data or URL/path',
            },
            {
              id: 'file_content',
              displayName: 'File Content',
              name: 'fileContent',
              type: 'text',
              description: 'The file content as text',
              displayOptions: {
                show: {
                  binaryData: [false],
                },
              },
              typeOptions: {
                rows: 6,
              },
            },
          ],
          optionalFields: [
            {
              id: 'filename',
              displayName: 'Filename',
              name: 'filename',
              type: 'string',
              description: 'Name of the file',
              placeholder: 'report.txt',
            },
            {
              id: 'title',
              displayName: 'Title',
              name: 'title',
              type: 'string',
              description: 'Title of the file',
            },
            {
              id: 'initial_comment',
              displayName: 'Initial Comment',
              name: 'initialComment',
              type: 'text',
              description: 'Message to include with the file',
              typeOptions: {
                rows: 2,
              },
            },
            {
              id: 'thread_ts',
              displayName: 'Thread Timestamp',
              name: 'threadTs',
              type: 'string',
              description: 'Upload to a thread',
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/files.upload',
            },
          },
        },
        {
          id: 'get_file',
          name: 'Get',
          value: 'get',
          description: 'Get information about a file',
          action: 'Get file info',
          fields: [
            {
              id: 'file_id',
              displayName: 'File ID',
              name: 'fileId',
              type: 'string',
              required: true,
              description: 'The ID of the file',
              placeholder: 'F1234567890',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/files.info',
            },
          },
        },
        {
          id: 'get_many_files',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many files',
          action: 'Get many files',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              displayOptions: {
                show: {
                  returnAll: [false],
                },
              },
            },
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              description: 'Filter by channel',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'user',
              displayName: 'User',
              name: 'user',
              type: 'options',
              description: 'Filter by user',
              typeOptions: {
                loadOptionsMethod: 'getUsers',
              },
            },
            {
              id: 'types',
              displayName: 'File Types',
              name: 'types',
              type: 'multiOptions',
              description: 'Filter by file type',
              options: [
                { name: 'All', value: 'all' },
                { name: 'Spaces', value: 'spaces' },
                { name: 'Snippets', value: 'snippets' },
                { name: 'Images', value: 'images' },
                { name: 'Google Docs', value: 'gdocs' },
                { name: 'Zip Files', value: 'zips' },
                { name: 'PDFs', value: 'pdfs' },
              ],
            },
            {
              id: 'ts_from',
              displayName: 'From Date',
              name: 'tsFrom',
              type: 'dateTime',
              description: 'Filter files from this date',
            },
            {
              id: 'ts_to',
              displayName: 'To Date',
              name: 'tsTo',
              type: 'dateTime',
              description: 'Filter files to this date',
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/files.list',
            },
          },
        },
        {
          id: 'delete_file',
          name: 'Delete',
          value: 'delete',
          description: 'Delete a file',
          action: 'Delete a file',
          fields: [
            {
              id: 'file_id',
              displayName: 'File ID',
              name: 'fileId',
              type: 'string',
              required: true,
              description: 'The ID of the file to delete',
              placeholder: 'F1234567890',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/files.delete',
            },
          },
        },
      ],
    },

    // ========================================
    // REACTION RESOURCE
    // ========================================
    {
      id: 'reaction',
      name: 'Reaction',
      value: 'reaction',
      description: 'Add and remove reactions from messages',
      operations: [
        {
          id: 'add_reaction',
          name: 'Add',
          value: 'add',
          description: 'Add a reaction to a message',
          action: 'Add a reaction',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              description: 'The channel containing the message',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'ts',
              displayName: 'Message Timestamp',
              name: 'timestamp',
              type: 'string',
              required: true,
              description: 'Timestamp of the message to react to',
              placeholder: '1234567890.123456',
            },
            {
              id: 'emoji',
              displayName: 'Emoji',
              name: 'emoji',
              type: 'string',
              required: true,
              description: 'Emoji name (without colons)',
              placeholder: 'thumbsup',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/reactions.add',
            },
          },
        },
        {
          id: 'remove_reaction',
          name: 'Remove',
          value: 'remove',
          description: 'Remove a reaction from a message',
          action: 'Remove a reaction',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'ts',
              displayName: 'Message Timestamp',
              name: 'timestamp',
              type: 'string',
              required: true,
              placeholder: '1234567890.123456',
            },
            {
              id: 'emoji',
              displayName: 'Emoji',
              name: 'emoji',
              type: 'string',
              required: true,
              description: 'Emoji name to remove',
              placeholder: 'thumbsup',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/reactions.remove',
            },
          },
        },
        {
          id: 'get_reactions',
          name: 'Get',
          value: 'get',
          description: 'Get reactions for a message',
          action: 'Get reactions',
          fields: [
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
            {
              id: 'ts',
              displayName: 'Message Timestamp',
              name: 'timestamp',
              type: 'string',
              required: true,
              placeholder: '1234567890.123456',
            },
          ],
          optionalFields: [
            {
              id: 'full',
              displayName: 'Full',
              name: 'full',
              type: 'boolean',
              default: false,
              description: 'Get full set of reactions',
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/reactions.get',
            },
          },
        },
      ],
    },

    // ========================================
    // STAR RESOURCE
    // ========================================
    {
      id: 'star',
      name: 'Star',
      value: 'star',
      description: 'Star and unstar items',
      operations: [
        {
          id: 'add_star',
          name: 'Add',
          value: 'add',
          description: 'Add a star to a message or file',
          action: 'Add a star',
          fields: [
            {
              id: 'target',
              displayName: 'Star Target',
              name: 'target',
              type: 'options',
              required: true,
              default: 'message',
              options: [
                { name: 'Message', value: 'message' },
                { name: 'File', value: 'file' },
              ],
            },
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
              displayOptions: {
                show: {
                  target: ['message'],
                },
              },
            },
            {
              id: 'ts',
              displayName: 'Message Timestamp',
              name: 'timestamp',
              type: 'string',
              required: true,
              displayOptions: {
                show: {
                  target: ['message'],
                },
              },
            },
            {
              id: 'file_id',
              displayName: 'File ID',
              name: 'fileId',
              type: 'string',
              required: true,
              displayOptions: {
                show: {
                  target: ['file'],
                },
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/stars.add',
            },
          },
        },
        {
          id: 'remove_star',
          name: 'Remove',
          value: 'remove',
          description: 'Remove a star from a message or file',
          action: 'Remove a star',
          fields: [
            {
              id: 'target',
              displayName: 'Star Target',
              name: 'target',
              type: 'options',
              required: true,
              default: 'message',
              options: [
                { name: 'Message', value: 'message' },
                { name: 'File', value: 'file' },
              ],
            },
            {
              id: 'channel',
              displayName: 'Channel',
              name: 'channel',
              type: 'options',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
              displayOptions: {
                show: {
                  target: ['message'],
                },
              },
            },
            {
              id: 'ts',
              displayName: 'Message Timestamp',
              name: 'timestamp',
              type: 'string',
              displayOptions: {
                show: {
                  target: ['message'],
                },
              },
            },
            {
              id: 'file_id',
              displayName: 'File ID',
              name: 'fileId',
              type: 'string',
              displayOptions: {
                show: {
                  target: ['file'],
                },
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/stars.remove',
            },
          },
        },
        {
          id: 'get_many_stars',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get starred items',
          action: 'Get starred items',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 100,
              displayOptions: {
                show: {
                  returnAll: [false],
                },
              },
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/stars.list',
            },
          },
        },
      ],
    },

    // ========================================
    // USER RESOURCE
    // ========================================
    {
      id: 'user',
      name: 'User',
      value: 'user',
      description: 'Get information about users',
      operations: [
        {
          id: 'get_user',
          name: 'Get',
          value: 'get',
          description: 'Get information about a user',
          action: 'Get user info',
          fields: [
            {
              id: 'user',
              displayName: 'User',
              name: 'user',
              type: 'options',
              required: true,
              description: 'The user to get information about',
              typeOptions: {
                loadOptionsMethod: 'getUsers',
              },
            },
          ],
          optionalFields: [
            {
              id: 'include_locale',
              displayName: 'Include Locale',
              name: 'includeLocale',
              type: 'boolean',
              default: false,
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/users.info',
            },
          },
        },
        {
          id: 'get_many_users',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many users',
          action: 'Get many users',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 100,
              displayOptions: {
                show: {
                  returnAll: [false],
                },
              },
            },
            {
              id: 'include_locale',
              displayName: 'Include Locale',
              name: 'includeLocale',
              type: 'boolean',
              default: false,
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/users.list',
            },
          },
        },
        {
          id: 'get_user_status',
          name: 'Get Status',
          value: 'getStatus',
          description: 'Get a user\'s status',
          action: 'Get user status',
          fields: [
            {
              id: 'user',
              displayName: 'User',
              name: 'user',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getUsers',
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/users.profile.get',
            },
          },
        },
        {
          id: 'set_user_status',
          name: 'Update Status',
          value: 'updateStatus',
          description: 'Update the current user\'s status',
          action: 'Update user status',
          fields: [],
          optionalFields: [
            {
              id: 'status_text',
              displayName: 'Status Text',
              name: 'statusText',
              type: 'string',
              description: 'The status text',
              placeholder: 'In a meeting',
            },
            {
              id: 'status_emoji',
              displayName: 'Status Emoji',
              name: 'statusEmoji',
              type: 'string',
              description: 'The status emoji',
              placeholder: ':calendar:',
            },
            {
              id: 'status_expiration',
              displayName: 'Status Expiration',
              name: 'statusExpiration',
              type: 'dateTime',
              description: 'When the status should expire',
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/users.profile.set',
            },
          },
        },
        {
          id: 'get_user_presence',
          name: 'Get Presence',
          value: 'getPresence',
          description: 'Get a user\'s presence (online/away)',
          action: 'Get user presence',
          fields: [
            {
              id: 'user',
              displayName: 'User',
              name: 'user',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getUsers',
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/users.getPresence',
            },
          },
        },
      ],
    },

    // ========================================
    // USER GROUP RESOURCE
    // ========================================
    {
      id: 'userGroup',
      name: 'User Group',
      value: 'userGroup',
      description: 'Manage user groups',
      operations: [
        {
          id: 'create_user_group',
          name: 'Create',
          value: 'create',
          description: 'Create a user group',
          action: 'Create a user group',
          fields: [
            {
              id: 'name',
              displayName: 'Name',
              name: 'name',
              type: 'string',
              required: true,
              description: 'The name of the user group',
              placeholder: 'My Team',
            },
            {
              id: 'handle',
              displayName: 'Handle',
              name: 'handle',
              type: 'string',
              required: true,
              description: 'The mention handle (without @)',
              placeholder: 'my-team',
            },
          ],
          optionalFields: [
            {
              id: 'description',
              displayName: 'Description',
              name: 'description',
              type: 'text',
              description: 'Description of the user group',
              typeOptions: {
                rows: 2,
              },
            },
            {
              id: 'channels',
              displayName: 'Default Channels',
              name: 'channels',
              type: 'multiOptions',
              description: 'Default channels for the group',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/usergroups.create',
            },
          },
        },
        {
          id: 'get_many_user_groups',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many user groups',
          action: 'Get many user groups',
          fields: [],
          optionalFields: [
            {
              id: 'include_count',
              displayName: 'Include Count',
              name: 'includeCount',
              type: 'boolean',
              default: false,
            },
            {
              id: 'include_disabled',
              displayName: 'Include Disabled',
              name: 'includeDisabled',
              type: 'boolean',
              default: false,
            },
            {
              id: 'include_users',
              displayName: 'Include Users',
              name: 'includeUsers',
              type: 'boolean',
              default: false,
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/usergroups.list',
            },
          },
        },
        {
          id: 'update_user_group',
          name: 'Update',
          value: 'update',
          description: 'Update a user group',
          action: 'Update a user group',
          fields: [
            {
              id: 'user_group',
              displayName: 'User Group',
              name: 'usergroup',
              type: 'string',
              required: true,
              description: 'The ID of the user group to update',
              placeholder: 'S1234567890',
            },
          ],
          optionalFields: [
            {
              id: 'name',
              displayName: 'Name',
              name: 'name',
              type: 'string',
            },
            {
              id: 'handle',
              displayName: 'Handle',
              name: 'handle',
              type: 'string',
            },
            {
              id: 'description',
              displayName: 'Description',
              name: 'description',
              type: 'text',
            },
            {
              id: 'channels',
              displayName: 'Default Channels',
              name: 'channels',
              type: 'multiOptions',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/usergroups.update',
            },
          },
        },
        {
          id: 'enable_user_group',
          name: 'Enable',
          value: 'enable',
          description: 'Enable a user group',
          action: 'Enable a user group',
          fields: [
            {
              id: 'user_group',
              displayName: 'User Group',
              name: 'usergroup',
              type: 'string',
              required: true,
              placeholder: 'S1234567890',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/usergroups.enable',
            },
          },
        },
        {
          id: 'disable_user_group',
          name: 'Disable',
          value: 'disable',
          description: 'Disable a user group',
          action: 'Disable a user group',
          fields: [
            {
              id: 'user_group',
              displayName: 'User Group',
              name: 'usergroup',
              type: 'string',
              required: true,
              placeholder: 'S1234567890',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/usergroups.disable',
            },
          },
        },
      ],
    },
  ],

  defaults: {
    name: 'Slack',
  },
};

export default slackSchema;
