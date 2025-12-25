/**
 * Microsoft Teams n8n-style Schema
 * 
 * Comprehensive Microsoft Teams API operations
 */

import { N8nAppSchema } from './types';

export const microsoftTeamsSchema: N8nAppSchema = {
  id: 'microsoft-teams',
  name: 'Microsoft Teams',
  description: 'Microsoft Teams messaging and collaboration',
  version: '1.0.0',
  color: '#6264A7',
  icon: 'microsoft-teams',
  group: ['communication', 'productivity'],
  
  credentials: [
    {
      name: 'microsoftOAuth2',
      displayName: 'Microsoft OAuth2',
      required: true,
      type: 'oauth2',
    },
  ],
  
  resources: [
    // ============================================
    // MESSAGE RESOURCE
    // ============================================
    {
      id: 'chatMessage',
      name: 'Chat Message',
      value: 'chatMessage',
      description: 'Send and manage chat messages',
      operations: [
        {
          id: 'send_message',
          name: 'Send Message',
          value: 'send',
          description: 'Send a message to a chat or channel',
          action: 'Send a message to a Teams chat or channel',
          fields: [
            {
              id: 'message_type',
              name: 'messageType',
              displayName: 'Message Type',
              type: 'options',
              required: true,
              default: 'channel',
              options: [
                { name: 'Channel Message', value: 'channel', description: 'Send to a channel' },
                { name: 'Chat Message', value: 'chat', description: 'Send to a chat' },
              ],
            },
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
              type: 'options',
              required: true,
              description: 'Select the team',
              typeOptions: {
                loadOptionsMethod: 'getTeams',
              },
              displayOptions: {
                show: {
                  messageType: ['channel'],
                },
              },
            },
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel',
              type: 'options',
              required: true,
              description: 'Select the channel',
              typeOptions: {
                loadOptionsMethod: 'getChannels',
              },
              displayOptions: {
                show: {
                  messageType: ['channel'],
                },
              },
            },
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat',
              type: 'options',
              required: true,
              description: 'Select the chat',
              typeOptions: {
                loadOptionsMethod: 'getChats',
              },
              displayOptions: {
                show: {
                  messageType: ['chat'],
                },
              },
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'Message Content',
              type: 'text',
              required: true,
              description: 'The content of the message',
              placeholder: 'Enter your message...',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'content_type',
              name: 'contentType',
              displayName: 'Content Type',
              type: 'options',
              required: false,
              default: 'text',
              options: [
                { name: 'Text', value: 'text' },
                { name: 'HTML', value: 'html' },
              ],
            },
            {
              id: 'importance',
              name: 'importance',
              displayName: 'Importance',
              type: 'options',
              required: false,
              default: 'normal',
              options: [
                { name: 'Normal', value: 'normal' },
                { name: 'High', value: 'high' },
                { name: 'Urgent', value: 'urgent' },
              ],
            },
            {
              id: 'attachments',
              name: 'attachments',
              displayName: 'Attachments (JSON)',
              type: 'json',
              required: false,
              description: 'Array of attachment objects',
            },
          ],
        },
        {
          id: 'get_messages',
          name: 'Get Messages',
          value: 'getMany',
          description: 'Get messages from a chat or channel',
          action: 'Retrieve messages from a Teams chat or channel',
          fields: [
            {
              id: 'message_type',
              name: 'messageType',
              displayName: 'Message Type',
              type: 'options',
              required: true,
              default: 'channel',
              options: [
                { name: 'Channel Messages', value: 'channel' },
                { name: 'Chat Messages', value: 'chat' },
              ],
            },
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
              type: 'string',
              required: true,
              displayOptions: {
                show: {
                  messageType: ['channel'],
                },
              },
            },
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel',
              type: 'string',
              required: true,
              displayOptions: {
                show: {
                  messageType: ['channel'],
                },
              },
            },
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
              displayOptions: {
                show: {
                  messageType: ['chat'],
                },
              },
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
              description: 'Maximum number of messages to return',
            },
          ],
        },
        {
          id: 'reply_to_message',
          name: 'Reply to Message',
          value: 'reply',
          description: 'Reply to a channel message',
          action: 'Reply to a message in a channel',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team ID',
              type: 'string',
              required: true,
            },
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
              description: 'ID of the message to reply to',
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'Reply Content',
              type: 'text',
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
      description: 'Manage team channels',
      operations: [
        {
          id: 'create_channel',
          name: 'Create Channel',
          value: 'create',
          description: 'Create a new channel',
          action: 'Create a new channel in a team',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
              type: 'string',
              required: true,
            },
            {
              id: 'name',
              name: 'displayName',
              displayName: 'Channel Name',
              type: 'string',
              required: true,
              description: 'Name of the channel',
            },
          ],
          optionalFields: [
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
              required: false,
            },
            {
              id: 'membership_type',
              name: 'membershipType',
              displayName: 'Membership Type',
              type: 'options',
              required: false,
              default: 'standard',
              options: [
                { name: 'Standard', value: 'standard' },
                { name: 'Private', value: 'private' },
                { name: 'Shared', value: 'shared' },
              ],
            },
          ],
        },
        {
          id: 'get_channels',
          name: 'Get Channels',
          value: 'getMany',
          description: 'Get all channels in a team',
          action: 'List all channels in a team',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_channel',
          name: 'Get Channel',
          value: 'get',
          description: 'Get a specific channel',
          action: 'Get channel details',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
              type: 'string',
              required: true,
            },
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
          id: 'update_channel',
          name: 'Update Channel',
          value: 'update',
          description: 'Update a channel',
          action: 'Update channel properties',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
              type: 'string',
              required: true,
            },
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
              name: 'displayName',
              displayName: 'New Name',
              type: 'string',
              required: false,
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
              required: false,
            },
          ],
        },
        {
          id: 'delete_channel',
          name: 'Delete Channel',
          value: 'delete',
          description: 'Delete a channel',
          action: 'Delete a channel from a team',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
              type: 'string',
              required: true,
            },
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
      ],
    },
    
    // ============================================
    // CHAT RESOURCE
    // ============================================
    {
      id: 'chat',
      name: 'Chat',
      value: 'chat',
      description: 'Manage chats',
      operations: [
        {
          id: 'create_chat',
          name: 'Create Chat',
          value: 'create',
          description: 'Create a new chat',
          action: 'Create a new chat with members',
          fields: [
            {
              id: 'chat_type',
              name: 'chatType',
              displayName: 'Chat Type',
              type: 'options',
              required: true,
              default: 'oneOnOne',
              options: [
                { name: 'One on One', value: 'oneOnOne' },
                { name: 'Group', value: 'group' },
              ],
            },
            {
              id: 'members',
              name: 'members',
              displayName: 'Members (User IDs)',
              type: 'string',
              required: true,
              description: 'Comma-separated list of user IDs',
            },
          ],
          optionalFields: [
            {
              id: 'topic',
              name: 'topic',
              displayName: 'Chat Topic',
              type: 'string',
              required: false,
              description: 'Topic for group chats',
              displayOptions: {
                show: {
                  chatType: ['group'],
                },
              },
            },
          ],
        },
        {
          id: 'get_chats',
          name: 'Get Chats',
          value: 'getMany',
          description: 'Get all chats',
          action: 'List all chats for the current user',
          fields: [],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'get_chat',
          name: 'Get Chat',
          value: 'get',
          description: 'Get a specific chat',
          action: 'Get chat details',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // TEAM RESOURCE
    // ============================================
    {
      id: 'team',
      name: 'Team',
      value: 'team',
      description: 'Manage teams',
      operations: [
        {
          id: 'get_teams',
          name: 'Get Teams',
          value: 'getMany',
          description: 'Get all teams',
          action: 'List all teams the user is a member of',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'get_team',
          name: 'Get Team',
          value: 'get',
          description: 'Get a specific team',
          action: 'Get team details',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
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
      description: 'Manage team members',
      operations: [
        {
          id: 'get_members',
          name: 'Get Members',
          value: 'getMany',
          description: 'Get team members',
          action: 'List all members of a team',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'add_member',
          name: 'Add Member',
          value: 'add',
          description: 'Add a member to a team',
          action: 'Add a user to a team',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
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
              id: 'roles',
              name: 'roles',
              displayName: 'Roles',
              type: 'multiOptions',
              required: false,
              options: [
                { name: 'Owner', value: 'owner' },
                { name: 'Member', value: 'member' },
              ],
            },
          ],
        },
        {
          id: 'remove_member',
          name: 'Remove Member',
          value: 'remove',
          description: 'Remove a member from a team',
          action: 'Remove a user from a team',
          fields: [
            {
              id: 'team_id',
              name: 'teamId',
              displayName: 'Team',
              type: 'string',
              required: true,
            },
            {
              id: 'membership_id',
              name: 'membershipId',
              displayName: 'Membership ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
  ],
};
