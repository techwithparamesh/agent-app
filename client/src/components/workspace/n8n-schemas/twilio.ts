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
        { id: 'send_sms', name: 'Send SMS', value: 'send_sms', description: 'Send SMS message', action: 'Send SMS',
          fields: [
            { id: 'from', name: 'from', displayName: 'From', type: 'string', required: true, description: 'Twilio phone number' },
            { id: 'to', name: 'to', displayName: 'To', type: 'string', required: true, description: 'Recipient phone number' },
            { id: 'body', name: 'body', displayName: 'Message', type: 'string', required: true, typeOptions: { rows: 3 } },
          ],
          optionalFields: [
            { id: 'mediaUrl', name: 'mediaUrl', displayName: 'Media URL', type: 'string', required: false },
          ],
        },
        { id: 'lookup', name: 'Lookup Phone', value: 'lookup', description: 'Lookup phone number info', action: 'Lookup phone',
          fields: [{ id: 'phoneNumber', name: 'phoneNumber', displayName: 'Phone Number', type: 'string', required: true }],
          optionalFields: [
            { id: 'type', name: 'type', displayName: 'Type', type: 'options', required: false, options: [{ name: 'Carrier', value: 'carrier' }, { name: 'Caller Name', value: 'caller-name' }] },
          ],
        },
      ],
    },
    {
      id: 'call', name: 'Call', value: 'call', description: 'Voice call operations',
      operations: [
        { id: 'make_call', name: 'Make Call', value: 'make_call', description: 'Make phone call', action: 'Make call',
          fields: [
            { id: 'from', name: 'from', displayName: 'From', type: 'string', required: true },
            { id: 'to', name: 'to', displayName: 'To', type: 'string', required: true },
          ],
          optionalFields: [
            { id: 'twiml', name: 'twiml', displayName: 'TwiML', type: 'string', required: false, typeOptions: { rows: 5 } },
            { id: 'url', name: 'url', displayName: 'URL', type: 'string', required: false, description: 'TwiML URL (if not using inline TwiML)' },
            { id: 'record', name: 'record', displayName: 'Record', type: 'boolean', required: false, default: false },
            { id: 'machineDetection', name: 'machineDetection', displayName: 'Machine Detection', type: 'options', required: false, options: [{ name: 'Enable', value: 'Enable' }, { name: 'DetectMessageEnd', value: 'DetectMessageEnd' }] },
            { id: 'timeout', name: 'timeout', displayName: 'Timeout', type: 'number', required: false },
          ],
        },
        { id: 'get_call', name: 'Get Call', value: 'get_call', description: 'Get call by SID', action: 'Get call',
          fields: [{ id: 'callSid', name: 'callSid', displayName: 'Call SID', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'update_call', name: 'Update Call', value: 'update_call', description: 'Update active call', action: 'Update call',
          fields: [{ id: 'callSid', name: 'callSid', displayName: 'Call SID', type: 'string', required: true }],
          optionalFields: [
            { id: 'twiml', name: 'twiml', displayName: 'TwiML', type: 'string', required: false },
            { id: 'url', name: 'url', displayName: 'URL', type: 'string', required: false },
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'Completed', value: 'completed' }, { name: 'Canceled', value: 'canceled' }] },
          ],
        },
        { id: 'get_recording', name: 'Get Recording', value: 'get_recording', description: 'Get call recording', action: 'Get recording',
          fields: [{ id: 'recordingSid', name: 'recordingSid', displayName: 'Recording SID', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
  ],
};
