/**
 * Make (Integromat) n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const makeSchema: N8nAppSchema = {
  id: 'make',
  name: 'Make',
  description: 'Make (Integromat) automation platform',
  version: '1.0.0',
  color: '#6D00CC',
  icon: 'make',
  group: ['automation'],
  
  credentials: [
    { name: 'makeApi', displayName: 'Make API', required: true, type: 'apiKey',
      properties: [{ name: 'apiKey', displayName: 'API Key', type: 'string', required: true, typeOptions: { password: true } }],
    },
  ],
  
  resources: [
    {
      id: 'scenario', name: 'Scenario', value: 'scenario', description: 'Scenario operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List scenarios', action: 'List scenarios', fields: [], optionalFields: [{ id: 'teamId', name: 'teamId', displayName: 'Team ID', type: 'string', required: false }] },
        { id: 'get', name: 'Get', value: 'get', description: 'Get scenario', action: 'Get scenario',
          fields: [{ id: 'scenarioId', name: 'scenarioId', displayName: 'Scenario ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'run', name: 'Run', value: 'run', description: 'Run scenario', action: 'Run scenario',
          fields: [{ id: 'scenarioId', name: 'scenarioId', displayName: 'Scenario ID', type: 'string', required: true }],
          optionalFields: [{ id: 'data', name: 'data', displayName: 'Input Data (JSON)', type: 'json', required: false }] },
        { id: 'activate', name: 'Activate', value: 'activate', description: 'Activate scenario', action: 'Activate',
          fields: [{ id: 'scenarioId', name: 'scenarioId', displayName: 'Scenario ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'deactivate', name: 'Deactivate', value: 'deactivate', description: 'Deactivate scenario', action: 'Deactivate',
          fields: [{ id: 'scenarioId', name: 'scenarioId', displayName: 'Scenario ID', type: 'string', required: true }], optionalFields: [] },
      ],
    },
    {
      id: 'hook', name: 'Webhook', value: 'hook', description: 'Webhook operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List webhooks', action: 'List webhooks', fields: [], optionalFields: [] },
        { id: 'get', name: 'Get', value: 'get', description: 'Get webhook', action: 'Get webhook',
          fields: [{ id: 'hookId', name: 'hookId', displayName: 'Webhook ID', type: 'string', required: true }], optionalFields: [] },
      ],
    },
  ],
};

export const n8nSchema: N8nAppSchema = {
  id: 'n8n',
  name: 'n8n',
  description: 'n8n workflow automation',
  version: '1.0.0',
  color: '#FF6D5A',
  icon: 'n8n',
  group: ['automation'],
  
  credentials: [
    { name: 'n8nApi', displayName: 'n8n API', required: true, type: 'apiKey',
      properties: [
        { name: 'apiKey', displayName: 'API Key', type: 'string', required: true, typeOptions: { password: true } },
        { name: 'baseUrl', displayName: 'Base URL', type: 'string', required: true },
      ],
    },
  ],
  
  resources: [
    {
      id: 'workflow', name: 'Workflow', value: 'workflow', description: 'Workflow operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List workflows', action: 'List workflows', fields: [], optionalFields: [{ id: 'active', name: 'active', displayName: 'Active Only', type: 'boolean', required: false }] },
        { id: 'get', name: 'Get', value: 'get', description: 'Get workflow', action: 'Get workflow',
          fields: [{ id: 'workflowId', name: 'workflowId', displayName: 'Workflow ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'activate', name: 'Activate', value: 'activate', description: 'Activate workflow', action: 'Activate',
          fields: [{ id: 'workflowId', name: 'workflowId', displayName: 'Workflow ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'deactivate', name: 'Deactivate', value: 'deactivate', description: 'Deactivate workflow', action: 'Deactivate',
          fields: [{ id: 'workflowId', name: 'workflowId', displayName: 'Workflow ID', type: 'string', required: true }], optionalFields: [] },
      ],
    },
    {
      id: 'execution', name: 'Execution', value: 'execution', description: 'Execution operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List executions', action: 'List executions',
          fields: [], optionalFields: [{ id: 'workflowId', name: 'workflowId', displayName: 'Workflow ID', type: 'string', required: false }, { id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'All', value: '' }, { name: 'Success', value: 'success' }, { name: 'Error', value: 'error' }, { name: 'Waiting', value: 'waiting' }] }] },
        { id: 'get', name: 'Get', value: 'get', description: 'Get execution', action: 'Get execution',
          fields: [{ id: 'executionId', name: 'executionId', displayName: 'Execution ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete execution', action: 'Delete execution',
          fields: [{ id: 'executionId', name: 'executionId', displayName: 'Execution ID', type: 'string', required: true }], optionalFields: [] },
      ],
    },
  ],
};

export const iftttSchema: N8nAppSchema = {
  id: 'ifttt',
  name: 'IFTTT',
  description: 'IFTTT automation service',
  version: '1.0.0',
  color: '#000000',
  icon: 'ifttt',
  group: ['automation'],
  
  credentials: [
    { name: 'iftttWebhook', displayName: 'IFTTT Webhook', required: true, type: 'apiKey',
      properties: [{ name: 'webhookKey', displayName: 'Webhook Key', type: 'string', required: true, typeOptions: { password: true } }],
    },
  ],
  
  resources: [
    {
      id: 'trigger', name: 'Trigger', value: 'trigger', description: 'Trigger operations',
      operations: [
        { id: 'fire', name: 'Trigger Event', value: 'fire', description: 'Fire webhook trigger', action: 'Trigger event',
          fields: [{ id: 'eventName', name: 'eventName', displayName: 'Event Name', type: 'string', required: true }],
          optionalFields: [
            { id: 'value1', name: 'value1', displayName: 'Value 1', type: 'string', required: false },
            { id: 'value2', name: 'value2', displayName: 'Value 2', type: 'string', required: false },
            { id: 'value3', name: 'value3', displayName: 'Value 3', type: 'string', required: false },
          ],
        },
      ],
    },
  ],
};

export const powerAutomateSchema: N8nAppSchema = {
  id: 'power-automate',
  name: 'Power Automate',
  description: 'Microsoft Power Automate',
  version: '1.0.0',
  color: '#0066FF',
  icon: 'microsoft',
  group: ['automation'],
  
  credentials: [
    { name: 'powerAutomateOAuth2', displayName: 'Power Automate OAuth2', required: true, type: 'oauth2',
      properties: [{ name: 'accessToken', displayName: 'Access Token', type: 'string', required: true, typeOptions: { password: true } }],
    },
  ],
  
  resources: [
    {
      id: 'flow', name: 'Flow', value: 'flow', description: 'Flow operations',
      operations: [
        { id: 'getAll', name: 'List', value: 'getAll', description: 'List flows', action: 'List flows', fields: [], optionalFields: [] },
        { id: 'get', name: 'Get', value: 'get', description: 'Get flow', action: 'Get flow',
          fields: [{ id: 'flowId', name: 'flowId', displayName: 'Flow ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'run', name: 'Run', value: 'run', description: 'Run flow', action: 'Run flow',
          fields: [{ id: 'flowId', name: 'flowId', displayName: 'Flow ID', type: 'string', required: true }],
          optionalFields: [{ id: 'triggerData', name: 'triggerData', displayName: 'Trigger Data (JSON)', type: 'json', required: false }] },
        { id: 'enable', name: 'Enable', value: 'enable', description: 'Enable flow', action: 'Enable',
          fields: [{ id: 'flowId', name: 'flowId', displayName: 'Flow ID', type: 'string', required: true }], optionalFields: [] },
        { id: 'disable', name: 'Disable', value: 'disable', description: 'Disable flow', action: 'Disable',
          fields: [{ id: 'flowId', name: 'flowId', displayName: 'Flow ID', type: 'string', required: true }], optionalFields: [] },
      ],
    },
    {
      id: 'run', name: 'Run', value: 'run', description: 'Run history operations',
      operations: [
        { id: 'getAll', name: 'List Runs', value: 'getAll', description: 'List flow runs', action: 'List runs',
          fields: [{ id: 'flowId', name: 'flowId', displayName: 'Flow ID', type: 'string', required: true }],
          optionalFields: [{ id: 'status', name: 'status', displayName: 'Status', type: 'options', required: false, options: [{ name: 'All', value: '' }, { name: 'Running', value: 'Running' }, { name: 'Succeeded', value: 'Succeeded' }, { name: 'Failed', value: 'Failed' }] }] },
        { id: 'get', name: 'Get Run', value: 'get', description: 'Get flow run', action: 'Get run',
          fields: [
            { id: 'flowId', name: 'flowId', displayName: 'Flow ID', type: 'string', required: true },
            { id: 'runId', name: 'runId', displayName: 'Run ID', type: 'string', required: true },
          ], optionalFields: [] },
      ],
    },
  ],
};
