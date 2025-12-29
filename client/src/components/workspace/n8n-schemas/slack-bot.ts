/**
 * Slack Bot Integration Schema
 * Resources: Message
 */

import type { N8nAppSchema } from './types';

export const slackBotSchema: N8nAppSchema = {
  id: 'slack-bot',
  name: 'Slack Bot',
  description: 'Slack bot integration',
  icon: 'message-square',
  color: '#4A154B',
  version: '1.0',
  group: ['communication'],
  credentials: [
    {
      id: 'slack_bot_token',
      name: 'Slack Bot Token',
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
      description: 'Send messages',
      operations: [
        {
          id: 'post_message',
          name: 'Post Message',
          value: 'post_message',
          description: 'Post a message to a channel',
          action: 'Post message',
          fields: [
            {
              id: 'channel',
              name: 'channel',
              displayName: 'Channel',
              type: 'string',
              required: true,
              description: 'Channel ID or name',
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Message Text',
              type: 'text',
              required: true,
              typeOptions: { rows: 3 },
            },
          ],
          optionalFields: [
            {
              id: 'username',
              name: 'username',
              displayName: 'Bot Username',
              type: 'string',
            },
            {
              id: 'icon_emoji',
              name: 'iconEmoji',
              displayName: 'Icon Emoji',
              type: 'string',
              description: 'Emoji to use as icon (e.g., :robot_face:)',
            },
            {
              id: 'icon_url',
              name: 'iconUrl',
              displayName: 'Icon URL',
              type: 'string',
            },
            {
              id: 'thread_ts',
              name: 'threadTs',
              displayName: 'Thread Timestamp',
              type: 'string',
              description: 'Reply in thread',
            },
            {
              id: 'blocks',
              name: 'blocks',
              displayName: 'Blocks (JSON)',
              type: 'json',
              description: 'Block Kit blocks',
            },
          ],
        },
      ],
    },
  ],
};
