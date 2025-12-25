/**
 * Twilio n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const twilioSchema: N8nAppSchema = {
  id: 'twilio',
  name: 'Twilio',
  description: 'Twilio communication APIs',
  version: '1.0.0',
  color: '#F22F46',
  icon: 'twilio',
  group: ['communication', 'sms'],
  
  credentials: [
    { name: 'twilioApi', displayName: 'Twilio API', required: true, type: 'apiKey',
      properties: [
        { name: 'accountSid', displayName: 'Account SID', type: 'string', required: true },
        { name: 'authToken', displayName: 'Auth Token', type: 'string', required: true, typeOptions: { password: true } },
      ],
    },
  ],
  
  resources: [
    {
      id: 'sms', name: 'SMS', value: 'sms', description: 'SMS operations',
      operations: [
        { id: 'send', name: 'Send SMS', value: 'send', description: 'Send SMS message', action: 'Send SMS',
          fields: [
            { id: 'from', name: 'from', displayName: 'From', type: 'string', required: true, description: 'Twilio phone number' },
            { id: 'to', name: 'to', displayName: 'To', type: 'string', required: true, description: 'Recipient phone number' },
            { id: 'body', name: 'body', displayName: 'Message', type: 'string', required: true, typeOptions: { rows: 3 } },
          ],
          optionalFields: [
            { id: 'mediaUrl', name: 'mediaUrl', displayName: 'Media URL', type: 'string', required: false },
            { id: 'statusCallback', name: 'statusCallback', displayName: 'Status Callback URL', type: 'string', required: false },
          ],
        },
        { id: 'getAll', name: 'List Messages', value: 'getAll', description: 'List SMS messages', action: 'List messages',
          fields: [],
          optionalFields: [
            { id: 'to', name: 'to', displayName: 'To', type: 'string', required: false },
            { id: 'from', name: 'from', displayName: 'From', type: 'string', required: false },
            { id: 'dateSent', name: 'dateSent', displayName: 'Date Sent', type: 'dateTime', required: false },
            { id: 'limit', name: 'limit', displayName: 'Limit', type: 'number', required: false, default: 50 },
          ],
        },
        { id: 'get', name: 'Get Message', value: 'get', description: 'Get message by SID', action: 'Get message',
          fields: [{ id: 'messageSid', name: 'messageSid', displayName: 'Message SID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'call', name: 'Call', value: 'call', description: 'Voice call operations',
      operations: [
        { id: 'make', name: 'Make Call', value: 'make', description: 'Make phone call', action: 'Make call',
          fields: [
            { id: 'from', name: 'from', displayName: 'From', type: 'string', required: true },
            { id: 'to', name: 'to', displayName: 'To', type: 'string', required: true },
            { id: 'twiml', name: 'twiml', displayName: 'TwiML', type: 'string', required: true, typeOptions: { rows: 5 } },
          ],
          optionalFields: [
            { id: 'statusCallback', name: 'statusCallback', displayName: 'Status Callback URL', type: 'string', required: false },
            { id: 'record', name: 'record', displayName: 'Record', type: 'boolean', required: false, default: false },
          ],
        },
        { id: 'getAll', name: 'List Calls', value: 'getAll', description: 'List calls', action: 'List calls',
          fields: [],
          optionalFields: [
            { id: 'to', name: 'to', displayName: 'To', type: 'string', required: false },
            { id: 'from', name: 'from', displayName: 'From', type: 'string', required: false },
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'All', value: '' }, { name: 'Queued', value: 'queued' }, { name: 'Ringing', value: 'ringing' }, { name: 'In Progress', value: 'in-progress' }, { name: 'Completed', value: 'completed' }, { name: 'Failed', value: 'failed' }, { name: 'Busy', value: 'busy' }, { name: 'No Answer', value: 'no-answer' }] },
            { id: 'limit', name: 'limit', displayName: 'Limit', type: 'number', required: false, default: 50 },
          ],
        },
        { id: 'get', name: 'Get Call', value: 'get', description: 'Get call by SID', action: 'Get call',
          fields: [{ id: 'callSid', name: 'callSid', displayName: 'Call SID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'phoneNumber', name: 'Phone Number', value: 'phoneNumber', description: 'Phone number operations',
      operations: [
        { id: 'getAll', name: 'List Numbers', value: 'getAll', description: 'List phone numbers', action: 'List numbers',
          fields: [],
          optionalFields: [{ id: 'limit', name: 'limit', displayName: 'Limit', type: 'number', required: false, default: 50 }],
        },
        { id: 'search', name: 'Search Available', value: 'search', description: 'Search available numbers', action: 'Search numbers',
          fields: [{ id: 'countryCode', name: 'countryCode', displayName: 'Country Code', type: 'string', required: true, default: 'US' }],
          optionalFields: [
            { id: 'type', name: 'type', displayName: 'Type', type: 'options', required: false, options: [{ name: 'Local', value: 'local' }, { name: 'Toll-Free', value: 'tollFree' }, { name: 'Mobile', value: 'mobile' }] },
            { id: 'areaCode', name: 'areaCode', displayName: 'Area Code', type: 'string', required: false },
            { id: 'contains', name: 'contains', displayName: 'Contains', type: 'string', required: false },
          ],
        },
      ],
    },
    {
      id: 'whatsapp', name: 'WhatsApp', value: 'whatsapp', description: 'WhatsApp via Twilio',
      operations: [
        { id: 'send', name: 'Send Message', value: 'send', description: 'Send WhatsApp message', action: 'Send WhatsApp',
          fields: [
            { id: 'from', name: 'from', displayName: 'From', type: 'string', required: true, description: 'whatsapp:+number' },
            { id: 'to', name: 'to', displayName: 'To', type: 'string', required: true, description: 'whatsapp:+number' },
            { id: 'body', name: 'body', displayName: 'Message', type: 'string', required: true, typeOptions: { rows: 3 } },
          ],
          optionalFields: [{ id: 'mediaUrl', name: 'mediaUrl', displayName: 'Media URL', type: 'string', required: false }],
        },
      ],
    },
  ],
};
