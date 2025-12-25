/**
 * SMTP n8n-style Schema
 * 
 * Generic SMTP email sending operations
 */

import { N8nAppSchema } from './types';

export const smtpSchema: N8nAppSchema = {
  id: 'smtp',
  name: 'SMTP',
  description: 'Send emails via SMTP server',
  version: '1.0.0',
  color: '#6B7280',
  icon: 'smtp',
  group: ['email'],
  
  credentials: [
    {
      name: 'smtpCredentials',
      displayName: 'SMTP Server',
      required: true,
      type: 'custom',
      properties: [
        {
          name: 'host',
          displayName: 'SMTP Host',
          type: 'string',
          required: true,
          placeholder: 'smtp.gmail.com',
        },
        {
          name: 'port',
          displayName: 'SMTP Port',
          type: 'number',
          required: true,
          default: 587,
        },
        {
          name: 'secure',
          displayName: 'Use SSL/TLS',
          type: 'boolean',
          required: false,
          default: false,
        },
        {
          name: 'user',
          displayName: 'Username',
          type: 'string',
          required: true,
        },
        {
          name: 'password',
          displayName: 'Password',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // EMAIL RESOURCE
    // ============================================
    {
      id: 'email',
      name: 'Email',
      value: 'email',
      description: 'Send emails via SMTP',
      operations: [
        {
          id: 'send_email',
          name: 'Send Email',
          value: 'send',
          description: 'Send an email',
          action: 'Send an email via SMTP',
          fields: [
            {
              id: 'from',
              name: 'from',
              displayName: 'From',
              type: 'string',
              required: true,
              placeholder: 'sender@example.com',
              description: 'Sender email address',
            },
            {
              id: 'to',
              name: 'to',
              displayName: 'To',
              type: 'string',
              required: true,
              description: 'Comma-separated recipient addresses',
            },
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'text',
              name: 'text',
              displayName: 'Plain Text Body',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'html',
              name: 'html',
              displayName: 'HTML Body',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'cc',
              name: 'cc',
              displayName: 'CC',
              type: 'string',
              required: false,
              description: 'Comma-separated CC addresses',
            },
            {
              id: 'bcc',
              name: 'bcc',
              displayName: 'BCC',
              type: 'string',
              required: false,
              description: 'Comma-separated BCC addresses',
            },
            {
              id: 'reply_to',
              name: 'replyTo',
              displayName: 'Reply To',
              type: 'string',
              required: false,
            },
            {
              id: 'from_name',
              name: 'fromName',
              displayName: 'From Name',
              type: 'string',
              required: false,
            },
            {
              id: 'priority',
              name: 'priority',
              displayName: 'Priority',
              type: 'options',
              required: false,
              default: 'normal',
              options: [
                { name: 'High', value: 'high' },
                { name: 'Normal', value: 'normal' },
                { name: 'Low', value: 'low' },
              ],
            },
            {
              id: 'attachments',
              name: 'attachments',
              displayName: 'Attachments',
              type: 'json',
              required: false,
              description: 'Array of attachment objects with filename, content, and contentType',
            },
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Custom Headers (JSON)',
              type: 'json',
              required: false,
              description: 'Custom email headers',
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: false,
              description: 'Custom message ID',
            },
            {
              id: 'in_reply_to',
              name: 'inReplyTo',
              displayName: 'In Reply To',
              type: 'string',
              required: false,
              description: 'Message-ID of the message this is a reply to',
            },
            {
              id: 'references',
              name: 'references',
              displayName: 'References',
              type: 'string',
              required: false,
              description: 'Message-ID list for threading',
            },
            {
              id: 'encoding',
              name: 'encoding',
              displayName: 'Encoding',
              type: 'options',
              required: false,
              default: 'utf-8',
              options: [
                { name: 'UTF-8', value: 'utf-8' },
                { name: 'ASCII', value: 'ascii' },
                { name: 'ISO-8859-1', value: 'iso-8859-1' },
              ],
            },
          ],
        },
        {
          id: 'send_template',
          name: 'Send Template Email',
          value: 'sendTemplate',
          description: 'Send using a template',
          action: 'Send an email using a template',
          fields: [
            {
              id: 'from',
              name: 'from',
              displayName: 'From',
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
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
            },
            {
              id: 'template',
              name: 'template',
              displayName: 'HTML Template',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 10,
              },
              description: 'HTML template with {{variable}} placeholders',
            },
            {
              id: 'template_data',
              name: 'templateData',
              displayName: 'Template Data (JSON)',
              type: 'json',
              required: true,
              placeholder: '{"name": "John", "order_id": "12345"}',
              description: 'Variables to replace in the template',
            },
          ],
          optionalFields: [
            {
              id: 'cc',
              name: 'cc',
              displayName: 'CC',
              type: 'string',
              required: false,
            },
            {
              id: 'bcc',
              name: 'bcc',
              displayName: 'BCC',
              type: 'string',
              required: false,
            },
            {
              id: 'attachments',
              name: 'attachments',
              displayName: 'Attachments (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'send_bulk',
          name: 'Send Bulk Emails',
          value: 'sendBulk',
          description: 'Send emails in bulk',
          action: 'Send multiple emails',
          fields: [
            {
              id: 'from',
              name: 'from',
              displayName: 'From',
              type: 'string',
              required: true,
            },
            {
              id: 'recipients',
              name: 'recipients',
              displayName: 'Recipients (JSON Array)',
              type: 'json',
              required: true,
              placeholder: '[{"to": "a@example.com", "subject": "Hello", "body": "Hi"}]',
              description: 'Array of recipient objects with to, subject, and body',
            },
          ],
          optionalFields: [
            {
              id: 'delay',
              name: 'delayBetweenEmails',
              displayName: 'Delay Between Emails (ms)',
              type: 'number',
              required: false,
              default: 100,
              description: 'Delay between sending each email',
            },
            {
              id: 'batch_size',
              name: 'batchSize',
              displayName: 'Batch Size',
              type: 'number',
              required: false,
              default: 50,
              description: 'Number of emails per batch',
            },
          ],
        },
      ],
    },
    
    // ============================================
    // CONNECTION RESOURCE
    // ============================================
    {
      id: 'connection',
      name: 'Connection',
      value: 'connection',
      description: 'Test SMTP connection',
      operations: [
        {
          id: 'test_connection',
          name: 'Test Connection',
          value: 'test',
          description: 'Test SMTP connection',
          action: 'Test the SMTP server connection',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'verify_address',
          name: 'Verify Address',
          value: 'verify',
          description: 'Verify an email address',
          action: 'Verify if an email address exists',
          fields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email Address',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
  ],
};
