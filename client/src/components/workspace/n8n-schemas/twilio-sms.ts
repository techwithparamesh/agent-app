/**
 * Twilio SMS Integration Schema
 * Resources: SMS, Lookup
 */

import type { N8nAppSchema } from './types';

export const twilioSmsSchema: N8nAppSchema = {
  id: 'twilio-sms',
  name: 'Twilio SMS',
  description: 'Twilio SMS messaging',
  icon: 'message-square',
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
      id: 'sms',
      name: 'SMS',
      value: 'sms',
      description: 'Send SMS messages',
      operations: [
        {
          id: 'send_sms',
          name: 'Send SMS',
          value: 'send_sms',
          description: 'Send an SMS message',
          action: 'Send SMS',
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
              description: 'Twilio phone number or messaging service SID',
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Message',
              type: 'text',
              required: true,
              typeOptions: { rows: 3 },
            },
          ],
          optionalFields: [
            {
              id: 'status_callback',
              name: 'statusCallback',
              displayName: 'Status Callback URL',
              type: 'string',
            },
            {
              id: 'media_url',
              name: 'mediaUrl',
              displayName: 'Media URL',
              type: 'string',
              description: 'URL of media to send (MMS)',
            },
          ],
        },
      ],
    },
    {
      id: 'lookup',
      name: 'Lookup',
      value: 'lookup',
      description: 'Phone number lookup',
      operations: [
        {
          id: 'lookup',
          name: 'Lookup Phone',
          value: 'lookup',
          description: 'Look up phone number information',
          action: 'Lookup phone',
          fields: [
            {
              id: 'phone_number',
              name: 'phoneNumber',
              displayName: 'Phone Number',
              type: 'string',
              required: true,
              description: 'Phone number to look up',
            },
          ],
          optionalFields: [
            {
              id: 'type',
              name: 'type',
              displayName: 'Lookup Type',
              type: 'options',
              options: [
                { name: 'Carrier', value: 'carrier' },
                { name: 'Caller Name', value: 'caller-name' },
              ],
            },
          ],
        },
      ],
    },
  ],
};
