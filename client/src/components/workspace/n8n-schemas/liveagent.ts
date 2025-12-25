/**
 * LiveAgent n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const liveagentSchema: N8nAppSchema = {
  id: 'liveagent',
  name: 'LiveAgent',
  description: 'LiveAgent help desk software',
  version: '1.0.0',
  color: '#FF6600',
  icon: 'liveagent',
  group: ['support', 'communication'],
  
  credentials: [
    { name: 'liveagentApi', displayName: 'LiveAgent API', required: true, type: 'apiKey',
      properties: [
        { name: 'apiKey', displayName: 'API Key', type: 'string', required: true, typeOptions: { password: true } },
        { name: 'domain', displayName: 'Domain', type: 'string', required: true, description: 'your-domain.ladesk.com' },
      ],
    },
  ],
  
  resources: [
    {
      id: 'ticket', name: 'Ticket', value: 'ticket', description: 'Ticket operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create ticket', action: 'Create ticket',
          fields: [
            { id: 'subject', name: 'subject', displayName: 'Subject', type: 'string', required: true },
            { id: 'message', name: 'message', displayName: 'Message', type: 'string', required: true, typeOptions: { rows: 5 } },
            { id: 'requesterEmail', name: 'requesterEmail', displayName: 'Requester Email', type: 'string', required: true },
          ],
          optionalFields: [
            { id: 'departmentId', name: 'departmentId', displayName: 'Department ID', type: 'string', required: false },
            { id: 'agentId', name: 'agentId', displayName: 'Agent ID', type: 'string', required: false },
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'New', value: 'N' }, { name: 'Open', value: 'T' }, { name: 'Resolved', value: 'R' }, { name: 'Postponed', value: 'P' }] },
            { id: 'priority', name: 'priority', displayName: 'Priority', type: 'options', required: false, options: [{ name: 'Low', value: 'L' }, { name: 'Normal', value: 'N' }, { name: 'High', value: 'H' }] },
          ],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get ticket', action: 'Get ticket',
          fields: [{ id: 'ticketId', name: 'ticketId', displayName: 'Ticket ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List tickets', action: 'List tickets',
          fields: [],
          optionalFields: [
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'All', value: '' }, { name: 'New', value: 'N' }, { name: 'Open', value: 'T' }, { name: 'Resolved', value: 'R' }] },
            { id: 'limit', name: 'limit', displayName: 'Limit', type: 'number', required: false, default: 50 },
          ],
        },
        { id: 'update', name: 'Update', value: 'update', description: 'Update ticket', action: 'Update ticket',
          fields: [{ id: 'ticketId', name: 'ticketId', displayName: 'Ticket ID', type: 'string', required: true }],
          optionalFields: [
            { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'New', value: 'N' }, { name: 'Open', value: 'T' }, { name: 'Resolved', value: 'R' }] },
            { id: 'agentId', name: 'agentId', displayName: 'Agent ID', type: 'string', required: false },
          ],
        },
        { id: 'addMessage', name: 'Add Message', value: 'addMessage', description: 'Add message to ticket', action: 'Add message',
          fields: [
            { id: 'ticketId', name: 'ticketId', displayName: 'Ticket ID', type: 'string', required: true },
            { id: 'message', name: 'message', displayName: 'Message', type: 'string', required: true, typeOptions: { rows: 3 } },
          ],
          optionalFields: [{ id: 'isNote', name: 'isNote', displayName: 'Is Internal Note', type: 'boolean', required: false, default: false }],
        },
      ],
    },
    {
      id: 'contact', name: 'Contact', value: 'contact', description: 'Contact operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create contact', action: 'Create contact',
          fields: [{ id: 'email', name: 'email', displayName: 'Email', type: 'string', required: true }],
          optionalFields: [
            { id: 'firstName', name: 'firstName', displayName: 'First Name', type: 'string', required: false },
            { id: 'lastName', name: 'lastName', displayName: 'Last Name', type: 'string', required: false },
            { id: 'phone', name: 'phone', displayName: 'Phone', type: 'string', required: false },
          ],
        },
        { id: 'get', name: 'Get', value: 'get', description: 'Get contact', action: 'Get contact',
          fields: [{ id: 'contactId', name: 'contactId', displayName: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List contacts', action: 'List contacts',
          fields: [], optionalFields: [{ id: 'limit', name: 'limit', displayName: 'Limit', type: 'number', required: false, default: 50 }] },
      ],
    },
    {
      id: 'agent', name: 'Agent', value: 'agent', description: 'Agent operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List agents', action: 'List agents', fields: [], optionalFields: [] },
        { id: 'get', name: 'Get', value: 'get', description: 'Get agent', action: 'Get agent',
          fields: [{ id: 'agentId', name: 'agentId', displayName: 'Agent ID', type: 'string', required: true }], optionalFields: [] },
      ],
    },
    {
      id: 'department', name: 'Department', value: 'department', description: 'Department operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List departments', action: 'List departments', fields: [], optionalFields: [] },
      ],
    },
  ],
};
