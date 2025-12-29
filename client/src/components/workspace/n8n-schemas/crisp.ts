/**
 * Crisp Integration Schema
 * Resources: Message, Profile, Segment, Conversation
 */

import type { N8nAppSchema } from './types';

export const crispSchema: N8nAppSchema = {
  id: 'crisp',
  name: 'Crisp',
  description: 'Crisp customer messaging platform',
  icon: 'message-circle',
  color: '#4B5CFA',
  version: '1.0',
  group: ['communication'],
  credentials: [
    {
      id: 'crisp_api',
      name: 'Crisp API',
      type: 'apiKey',
      fields: [
        { id: 'identifier', displayName: 'Identifier', name: 'identifier', type: 'string', required: true },
        { id: 'key', displayName: 'API Key', name: 'key', type: 'string', required: true },
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
              id: 'website_id',
              name: 'websiteId',
              displayName: 'Website ID',
              type: 'string',
              required: true,
            },
            {
              id: 'session_id',
              name: 'sessionId',
              displayName: 'Session ID',
              type: 'string',
              required: true,
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'Message Content',
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
              default: 'text',
              options: [
                { name: 'Text', value: 'text' },
                { name: 'File', value: 'file' },
                { name: 'Note', value: 'note' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'profile',
      name: 'Profile',
      value: 'profile',
      description: 'Manage visitor profiles',
      operations: [
        {
          id: 'update_profile',
          name: 'Update Profile',
          value: 'update_profile',
          description: 'Update a visitor profile',
          action: 'Update profile',
          fields: [
            {
              id: 'website_id',
              name: 'websiteId',
              displayName: 'Website ID',
              type: 'string',
              required: true,
            },
            {
              id: 'session_id',
              name: 'sessionId',
              displayName: 'Session ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
            },
            {
              id: 'nickname',
              name: 'nickname',
              displayName: 'Nickname',
              type: 'string',
            },
            {
              id: 'phone',
              name: 'phone',
              displayName: 'Phone',
              type: 'string',
            },
            {
              id: 'company',
              name: 'company',
              displayName: 'Company',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      id: 'segment',
      name: 'Segment',
      value: 'segment',
      description: 'Manage segments',
      operations: [
        {
          id: 'add_segment',
          name: 'Add Segment',
          value: 'add_segment',
          description: 'Add a segment to a visitor',
          action: 'Add segment',
          fields: [
            {
              id: 'website_id',
              name: 'websiteId',
              displayName: 'Website ID',
              type: 'string',
              required: true,
            },
            {
              id: 'session_id',
              name: 'sessionId',
              displayName: 'Session ID',
              type: 'string',
              required: true,
            },
            {
              id: 'segment',
              name: 'segment',
              displayName: 'Segment Name',
              type: 'string',
              required: true,
            },
          ],
        },
      ],
    },
    {
      id: 'conversation',
      name: 'Conversation',
      value: 'conversation',
      description: 'Manage conversations',
      operations: [
        {
          id: 'set_state',
          name: 'Set State',
          value: 'set_state',
          description: 'Set conversation state',
          action: 'Set state',
          fields: [
            {
              id: 'website_id',
              name: 'websiteId',
              displayName: 'Website ID',
              type: 'string',
              required: true,
            },
            {
              id: 'session_id',
              name: 'sessionId',
              displayName: 'Session ID',
              type: 'string',
              required: true,
            },
            {
              id: 'state',
              name: 'state',
              displayName: 'State',
              type: 'options',
              required: true,
              options: [
                { name: 'Pending', value: 'pending' },
                { name: 'Unresolved', value: 'unresolved' },
                { name: 'Resolved', value: 'resolved' },
              ],
            },
          ],
        },
        {
          id: 'assign_conversation',
          name: 'Assign Conversation',
          value: 'assign_conversation',
          description: 'Assign conversation to an operator',
          action: 'Assign conversation',
          fields: [
            {
              id: 'website_id',
              name: 'websiteId',
              displayName: 'Website ID',
              type: 'string',
              required: true,
            },
            {
              id: 'session_id',
              name: 'sessionId',
              displayName: 'Session ID',
              type: 'string',
              required: true,
            },
            {
              id: 'operator_id',
              name: 'operatorId',
              displayName: 'Operator ID',
              type: 'string',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
