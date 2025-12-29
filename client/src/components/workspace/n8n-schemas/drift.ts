/**
 * Drift Integration Schema
 * Resources: Message
 */

import type { N8nAppSchema } from './types';

export const driftSchema: N8nAppSchema = {
  id: 'drift',
  name: 'Drift',
  description: 'Drift conversational marketing platform',
  icon: 'message-circle',
  color: '#4E7FFF',
  version: '1.0',
  group: ['marketing'],
  credentials: [
    {
      id: 'drift_oauth2',
      name: 'Drift OAuth2',
      type: 'oAuth2',
      fields: [
        { id: 'client_id', displayName: 'Client ID', name: 'clientId', type: 'string', required: true },
        { id: 'client_secret', displayName: 'Client Secret', name: 'clientSecret', type: 'string', required: true },
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
          id: 'send_message',
          name: 'Send Message',
          value: 'send_message',
          description: 'Send a message to a conversation',
          action: 'Send message',
          fields: [
            {
              id: 'conversation_id',
              name: 'conversationId',
              displayName: 'Conversation ID',
              type: 'string',
              required: true,
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Message Body',
              type: 'text',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'type',
              name: 'type',
              displayName: 'Message Type',
              type: 'options',
              default: 'chat',
              options: [
                { name: 'Chat', value: 'chat' },
                { name: 'Private Note', value: 'private_note' },
              ],
            },
          ],
        },
      ],
    },
  ],
};
