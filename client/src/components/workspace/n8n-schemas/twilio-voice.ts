/**
 * Twilio Voice Integration Schema
 * Resources: Call, Recording
 */

import type { N8nAppSchema } from './types';

export const twilioVoiceSchema: N8nAppSchema = {
  id: 'twilio-voice',
  name: 'Twilio Voice',
  description: 'Twilio voice calls',
  icon: 'phone',
  color: '#F22F46',
  version: '1.0',
  group: ['communication'],
  credentials: [
    {
      id: 'twilio_api',
      name: 'Twilio API',
      type: 'apiKey',
      fields: [
        { id: 'account_sid', displayName: 'Account SID', name: 'accountSid', type: 'string', required: true },
        { id: 'auth_token', displayName: 'Auth Token', name: 'authToken', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'call',
      name: 'Call',
      value: 'call',
      description: 'Manage voice calls',
      operations: [
        {
          id: 'make_call',
          name: 'Make Call',
          value: 'make_call',
          description: 'Make a phone call',
          action: 'Make call',
          fields: [
            {
              id: 'to',
              name: 'to',
              displayName: 'To',
              type: 'string',
              required: true,
              description: 'Recipient phone number (E.164 format)',
            },
            {
              id: 'from',
              name: 'from',
              displayName: 'From',
              type: 'string',
              required: true,
              description: 'Twilio phone number',
            },
          ],
          optionalFields: [
            {
              id: 'url',
              name: 'url',
              displayName: 'TwiML URL',
              type: 'string',
              description: 'URL for TwiML instructions',
            },
            {
              id: 'twiml',
              name: 'twiml',
              displayName: 'TwiML',
              type: 'text',
              typeOptions: { rows: 4 },
              description: 'TwiML instructions',
            },
            {
              id: 'status_callback',
              name: 'statusCallback',
              displayName: 'Status Callback URL',
              type: 'string',
            },
            {
              id: 'record',
              name: 'record',
              displayName: 'Record Call',
              type: 'boolean',
              default: false,
            },
          ],
        },
        {
          id: 'send_sms_during_call',
          name: 'Send SMS During Call',
          value: 'send_sms_during_call',
          description: 'Send SMS during an active call',
          action: 'Send SMS during call',
          fields: [
            {
              id: 'call_sid',
              name: 'callSid',
              displayName: 'Call SID',
              type: 'string',
              required: true,
            },
            {
              id: 'to',
              name: 'to',
              displayName: 'To',
              type: 'string',
              required: true,
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Message',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          id: 'get_call',
          name: 'Get Call',
          value: 'get_call',
          description: 'Get call details',
          action: 'Get call',
          fields: [
            {
              id: 'call_sid',
              name: 'callSid',
              displayName: 'Call SID',
              type: 'string',
              required: true,
            },
          ],
        },
        {
          id: 'update_call',
          name: 'Update Call',
          value: 'update_call',
          description: 'Update an active call',
          action: 'Update call',
          fields: [
            {
              id: 'call_sid',
              name: 'callSid',
              displayName: 'Call SID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              options: [
                { name: 'Completed', value: 'completed' },
                { name: 'Canceled', value: 'canceled' },
              ],
            },
            {
              id: 'url',
              name: 'url',
              displayName: 'TwiML URL',
              type: 'string',
            },
            {
              id: 'twiml',
              name: 'twiml',
              displayName: 'TwiML',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      id: 'recording',
      name: 'Recording',
      value: 'recording',
      description: 'Manage recordings',
      operations: [
        {
          id: 'get_recording',
          name: 'Get Recording',
          value: 'get_recording',
          description: 'Get a call recording',
          action: 'Get recording',
          fields: [
            {
              id: 'recording_sid',
              name: 'recordingSid',
              displayName: 'Recording SID',
              type: 'string',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
