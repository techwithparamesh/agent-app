/**
 * Tawk.to Integration Schema
 * Resources: Ticket, Message, Visitor
 */

import type { N8nAppSchema } from './types';

export const tawkSchema: N8nAppSchema = {
  id: 'tawk',
  name: 'Tawk.to',
  description: 'Tawk.to live chat',
  icon: 'message-circle',
  color: '#03C54A',
  version: '1.0',
  group: ['communication'],
  credentials: [
    {
      id: 'tawk_api',
      name: 'Tawk API',
      type: 'apiKey',
      fields: [
        { id: 'api_key', displayName: 'API Key', name: 'apiKey', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'ticket',
      name: 'Ticket',
      value: 'ticket',
      description: 'Manage tickets',
      operations: [
        {
          id: 'create_ticket',
          name: 'Create Ticket',
          value: 'create_ticket',
          description: 'Create a support ticket',
          action: 'Create ticket',
          fields: [
            {
              id: 'property_id',
              name: 'propertyId',
              displayName: 'Property ID',
              type: 'string',
              required: true,
            },
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
            },
            {
              id: 'message',
              name: 'message',
              displayName: 'Message',
              type: 'text',
              required: true,
              typeOptions: { rows: 4 },
            },
          ],
          optionalFields: [
            {
              id: 'requester_name',
              name: 'requesterName',
              displayName: 'Requester Name',
              type: 'string',
            },
            {
              id: 'requester_email',
              name: 'requesterEmail',
              displayName: 'Requester Email',
              type: 'string',
            },
          ],
        },
      ],
    },
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
          description: 'Send a chat message',
          action: 'Send message',
          fields: [
            {
              id: 'property_id',
              name: 'propertyId',
              displayName: 'Property ID',
              type: 'string',
              required: true,
            },
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message',
              name: 'message',
              displayName: 'Message',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      id: 'visitor',
      name: 'Visitor',
      value: 'visitor',
      description: 'Manage visitors',
      operations: [
        {
          id: 'get_visitor_info',
          name: 'Get Visitor Info',
          value: 'get_visitor_info',
          description: 'Get visitor information',
          action: 'Get visitor info',
          fields: [
            {
              id: 'property_id',
              name: 'propertyId',
              displayName: 'Property ID',
              type: 'string',
              required: true,
            },
            {
              id: 'visitor_id',
              name: 'visitorId',
              displayName: 'Visitor ID',
              type: 'string',
              required: true,
            },
          ],
        },
        {
          id: 'ban_visitor',
          name: 'Ban Visitor',
          value: 'ban_visitor',
          description: 'Ban a visitor',
          action: 'Ban visitor',
          fields: [
            {
              id: 'property_id',
              name: 'propertyId',
              displayName: 'Property ID',
              type: 'string',
              required: true,
            },
            {
              id: 'visitor_id',
              name: 'visitorId',
              displayName: 'Visitor ID',
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
            },
          ],
        },
      ],
    },
  ],
};
