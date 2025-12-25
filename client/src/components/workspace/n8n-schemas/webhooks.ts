/**
 * Webhooks n8n-style Schema
 * 
 * Generic webhook trigger and operations
 */

import { N8nAppSchema } from './types';

export const webhooksSchema: N8nAppSchema = {
  id: 'webhooks',
  name: 'Webhooks',
  description: 'Receive and send webhook requests',
  version: '1.0.0',
  color: '#885577',
  icon: 'webhooks',
  group: ['developer'],
  
  credentials: [
    {
      name: 'webhookAuth',
      displayName: 'Webhook Authentication',
      required: false,
      type: 'custom',
      properties: [
        {
          name: 'headerAuth',
          displayName: 'Header Authentication',
          type: 'boolean',
          required: false,
        },
        {
          name: 'headerName',
          displayName: 'Header Name',
          type: 'string',
          required: false,
          default: 'Authorization',
        },
        {
          name: 'headerValue',
          displayName: 'Header Value',
          type: 'string',
          required: false,
          typeOptions: {
            password: true,
          },
        },
        {
          name: 'hmacSecret',
          displayName: 'HMAC Secret',
          type: 'string',
          required: false,
          typeOptions: {
            password: true,
          },
          description: 'Secret for HMAC signature verification',
        },
        {
          name: 'basicAuthUser',
          displayName: 'Basic Auth Username',
          type: 'string',
          required: false,
        },
        {
          name: 'basicAuthPassword',
          displayName: 'Basic Auth Password',
          type: 'string',
          required: false,
          typeOptions: {
            password: true,
          },
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // TRIGGER RESOURCE
    // ============================================
    {
      id: 'trigger',
      name: 'Webhook Trigger',
      value: 'trigger',
      description: 'Receive incoming webhooks',
      operations: [
        {
          id: 'receive',
          name: 'On Webhook',
          value: 'receive',
          description: 'Trigger on incoming webhook',
          action: 'Receive webhook',
          fields: [
            {
              id: 'http_method',
              name: 'httpMethod',
              displayName: 'HTTP Method',
              type: 'options',
              required: true,
              default: 'POST',
              options: [
                { name: 'GET', value: 'GET' },
                { name: 'POST', value: 'POST' },
                { name: 'PUT', value: 'PUT' },
                { name: 'PATCH', value: 'PATCH' },
                { name: 'DELETE', value: 'DELETE' },
                { name: 'HEAD', value: 'HEAD' },
                { name: 'OPTIONS', value: 'OPTIONS' },
              ],
            },
            {
              id: 'path',
              name: 'path',
              displayName: 'Path',
              type: 'string',
              required: true,
              default: '/webhook',
              description: 'Webhook endpoint path',
            },
          ],
          optionalFields: [
            {
              id: 'authentication',
              name: 'authentication',
              displayName: 'Authentication',
              type: 'options',
              required: false,
              default: 'none',
              options: [
                { name: 'None', value: 'none' },
                { name: 'Basic Auth', value: 'basicAuth' },
                { name: 'Header Auth', value: 'headerAuth' },
                { name: 'HMAC Signature', value: 'hmac' },
              ],
            },
            {
              id: 'response_mode',
              name: 'responseMode',
              displayName: 'Response Mode',
              type: 'options',
              required: false,
              default: 'onReceived',
              options: [
                { name: 'When Received', value: 'onReceived' },
                { name: 'Last Node', value: 'lastNode' },
                { name: 'Custom Response', value: 'responseNode' },
              ],
            },
            {
              id: 'response_code',
              name: 'responseCode',
              displayName: 'Response Code',
              type: 'number',
              required: false,
              default: 200,
            },
            {
              id: 'response_data',
              name: 'responseData',
              displayName: 'Response Data',
              type: 'options',
              required: false,
              options: [
                { name: 'All Entries', value: 'allEntries' },
                { name: 'First Entry (JSON)', value: 'firstEntryJson' },
                { name: 'First Entry (Binary)', value: 'firstEntryBinary' },
                { name: 'No Response Body', value: 'noData' },
              ],
            },
            {
              id: 'response_content_type',
              name: 'responseContentType',
              displayName: 'Response Content Type',
              type: 'string',
              required: false,
              default: 'application/json',
            },
            {
              id: 'raw_body',
              name: 'rawBody',
              displayName: 'Raw Body',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Return raw body as string',
            },
            {
              id: 'allowed_origins',
              name: 'allowedOrigins',
              displayName: 'Allowed Origins (CORS)',
              type: 'string',
              required: false,
              default: '*',
            },
          ],
        },
      ],
    },
    
    // ============================================
    // SEND RESOURCE
    // ============================================
    {
      id: 'send',
      name: 'Send Webhook',
      value: 'send',
      description: 'Send outgoing webhooks',
      operations: [
        {
          id: 'post',
          name: 'POST Request',
          value: 'post',
          description: 'Send POST webhook',
          action: 'Send POST webhook',
          fields: [
            {
              id: 'url',
              name: 'url',
              displayName: 'URL',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'body',
              name: 'body',
              displayName: 'Body',
              type: 'json',
              required: false,
            },
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Headers',
              type: 'json',
              required: false,
            },
            {
              id: 'content_type',
              name: 'contentType',
              displayName: 'Content Type',
              type: 'options',
              required: false,
              default: 'application/json',
              options: [
                { name: 'JSON', value: 'application/json' },
                { name: 'Form Data', value: 'multipart/form-data' },
                { name: 'Form URL Encoded', value: 'application/x-www-form-urlencoded' },
                { name: 'Raw', value: 'raw' },
              ],
            },
            {
              id: 'timeout',
              name: 'timeout',
              displayName: 'Timeout (ms)',
              type: 'number',
              required: false,
              default: 30000,
            },
            {
              id: 'retry_on_fail',
              name: 'retryOnFail',
              displayName: 'Retry on Fail',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'max_retries',
              name: 'maxRetries',
              displayName: 'Max Retries',
              type: 'number',
              required: false,
              default: 3,
            },
          ],
        },
        {
          id: 'get',
          name: 'GET Request',
          value: 'get',
          description: 'Send GET webhook',
          action: 'Send GET webhook',
          fields: [
            {
              id: 'url',
              name: 'url',
              displayName: 'URL',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'query_params',
              name: 'queryParams',
              displayName: 'Query Parameters',
              type: 'json',
              required: false,
            },
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Headers',
              type: 'json',
              required: false,
            },
            {
              id: 'timeout',
              name: 'timeout',
              displayName: 'Timeout (ms)',
              type: 'number',
              required: false,
              default: 30000,
            },
          ],
        },
        {
          id: 'put',
          name: 'PUT Request',
          value: 'put',
          description: 'Send PUT webhook',
          action: 'Send PUT webhook',
          fields: [
            {
              id: 'url',
              name: 'url',
              displayName: 'URL',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'body',
              name: 'body',
              displayName: 'Body',
              type: 'json',
              required: false,
            },
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Headers',
              type: 'json',
              required: false,
            },
            {
              id: 'content_type',
              name: 'contentType',
              displayName: 'Content Type',
              type: 'options',
              required: false,
              default: 'application/json',
              options: [
                { name: 'JSON', value: 'application/json' },
                { name: 'Form Data', value: 'multipart/form-data' },
                { name: 'Form URL Encoded', value: 'application/x-www-form-urlencoded' },
              ],
            },
            {
              id: 'timeout',
              name: 'timeout',
              displayName: 'Timeout (ms)',
              type: 'number',
              required: false,
              default: 30000,
            },
          ],
        },
        {
          id: 'patch',
          name: 'PATCH Request',
          value: 'patch',
          description: 'Send PATCH webhook',
          action: 'Send PATCH webhook',
          fields: [
            {
              id: 'url',
              name: 'url',
              displayName: 'URL',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'body',
              name: 'body',
              displayName: 'Body',
              type: 'json',
              required: false,
            },
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Headers',
              type: 'json',
              required: false,
            },
            {
              id: 'timeout',
              name: 'timeout',
              displayName: 'Timeout (ms)',
              type: 'number',
              required: false,
              default: 30000,
            },
          ],
        },
        {
          id: 'delete',
          name: 'DELETE Request',
          value: 'delete',
          description: 'Send DELETE webhook',
          action: 'Send DELETE webhook',
          fields: [
            {
              id: 'url',
              name: 'url',
              displayName: 'URL',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Headers',
              type: 'json',
              required: false,
            },
            {
              id: 'timeout',
              name: 'timeout',
              displayName: 'Timeout (ms)',
              type: 'number',
              required: false,
              default: 30000,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // RESPONSE RESOURCE
    // ============================================
    {
      id: 'response',
      name: 'Webhook Response',
      value: 'response',
      description: 'Respond to webhook',
      operations: [
        {
          id: 'respond',
          name: 'Respond',
          value: 'respond',
          description: 'Respond to incoming webhook',
          action: 'Respond to webhook',
          fields: [],
          optionalFields: [
            {
              id: 'response_code',
              name: 'responseCode',
              displayName: 'Response Code',
              type: 'number',
              required: false,
              default: 200,
            },
            {
              id: 'response_body',
              name: 'responseBody',
              displayName: 'Response Body',
              type: 'json',
              required: false,
            },
            {
              id: 'response_headers',
              name: 'responseHeaders',
              displayName: 'Response Headers',
              type: 'json',
              required: false,
            },
            {
              id: 'content_type',
              name: 'contentType',
              displayName: 'Content Type',
              type: 'string',
              required: false,
              default: 'application/json',
            },
          ],
        },
      ],
    },
    
    // ============================================
    // SUBSCRIPTION RESOURCE
    // ============================================
    {
      id: 'subscription',
      name: 'Subscription',
      value: 'subscription',
      description: 'Webhook subscriptions',
      operations: [
        {
          id: 'create_subscription',
          name: 'Create Subscription',
          value: 'create',
          description: 'Subscribe to webhook',
          action: 'Create subscription',
          fields: [
            {
              id: 'target_url',
              name: 'targetUrl',
              displayName: 'Target URL',
              type: 'string',
              required: true,
            },
            {
              id: 'events',
              name: 'events',
              displayName: 'Events',
              type: 'string',
              required: true,
              description: 'Comma-separated event types',
            },
          ],
          optionalFields: [
            {
              id: 'secret',
              name: 'secret',
              displayName: 'Secret',
              type: 'string',
              required: false,
              typeOptions: {
                password: true,
              },
            },
            {
              id: 'active',
              name: 'active',
              displayName: 'Active',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'delete_subscription',
          name: 'Delete Subscription',
          value: 'delete',
          description: 'Unsubscribe from webhook',
          action: 'Delete subscription',
          fields: [
            {
              id: 'subscription_id',
              name: 'subscriptionId',
              displayName: 'Subscription ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'test_subscription',
          name: 'Test Subscription',
          value: 'test',
          description: 'Send test webhook',
          action: 'Test subscription',
          fields: [
            {
              id: 'subscription_id',
              name: 'subscriptionId',
              displayName: 'Subscription ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'test_payload',
              name: 'testPayload',
              displayName: 'Test Payload',
              type: 'json',
              required: false,
            },
          ],
        },
      ],
    },
  ],
};
