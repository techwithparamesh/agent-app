/**
 * Discord Bot Integration Schema
 * Resources: Message
 */

import type { N8nAppSchema } from './types';

export const discordBotSchema: N8nAppSchema = {
  id: 'discord-bot',
  name: 'Discord Bot',
  description: 'Discord bot for server messaging',
  icon: 'message-square',
  color: '#5865F2',
  version: '1.0',
  group: ['communication'],
  credentials: [
    {
      id: 'discord_bot_token',
      name: 'Discord Bot Token',
      type: 'apiKey',
      fields: [
        { id: 'token', displayName: 'Bot Token', name: 'token', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'message',
      name: 'Message',
      value: 'message',
      description: 'Send messages via bot',
      operations: [
        {
          id: 'send_message',
          name: 'Send Message',
          value: 'send_message',
          description: 'Send a message to a channel',
          action: 'Send message',
          fields: [
            {
              id: 'channel_id',
              name: 'channelId',
              displayName: 'Channel ID',
              type: 'string',
              required: true,
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'Message Content',
              type: 'text',
              required: true,
              typeOptions: { rows: 3 },
            },
          ],
          optionalFields: [
            {
              id: 'tts',
              name: 'tts',
              displayName: 'Text-to-Speech',
              type: 'boolean',
              default: false,
            },
            {
              id: 'embed',
              name: 'embed',
              displayName: 'Embed (JSON)',
              type: 'json',
              description: 'Discord embed object as JSON',
            },
          ],
        },
      ],
    },
  ],
};
