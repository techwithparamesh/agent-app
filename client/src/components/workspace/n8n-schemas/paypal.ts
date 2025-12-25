/**
 * PayPal n8n-style Schema
 * 
 * Comprehensive PayPal payment operations
 */

import { N8nAppSchema } from './types';

export const paypalSchema: N8nAppSchema = {
  id: 'paypal',
  name: 'PayPal',
  description: 'PayPal payment platform',
  version: '1.0.0',
  color: '#003087',
  icon: 'paypal',
  group: ['payments'],
  
  credentials: [
    {
      name: 'paypalApi',
      displayName: 'PayPal API',
      required: true,
      type: 'oauth2',
      properties: [
        {
          name: 'clientId',
          displayName: 'Client ID',
          type: 'string',
          required: true,
        },
        {
          name: 'clientSecret',
          displayName: 'Client Secret',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
        {
          name: 'environment',
          displayName: 'Environment',
          type: 'options',
          required: true,
          default: 'sandbox',
          options: [
            { name: 'Sandbox', value: 'sandbox' },
            { name: 'Live', value: 'live' },
          ],
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // ORDER RESOURCE
    // ============================================
    {
      id: 'order',
      name: 'Order',
      value: 'order',
      description: 'PayPal orders',
      operations: [
        {
          id: 'create_order',
          name: 'Create Order',
          value: 'create',
          description: 'Create a new order',
          action: 'Create an order',
          fields: [
            {
              id: 'intent',
              name: 'intent',
              displayName: 'Intent',
              type: 'options',
              required: true,
              default: 'CAPTURE',
              options: [
                { name: 'Capture', value: 'CAPTURE' },
                { name: 'Authorize', value: 'AUTHORIZE' },
              ],
            },
            {
              id: 'purchase_units',
              name: 'purchase_units',
              displayName: 'Purchase Units (JSON)',
              type: 'json',
              required: true,
              placeholder: '[{"amount": {"currency_code": "USD", "value": "100.00"}}]',
            },
          ],
          optionalFields: [
            {
              id: 'payer',
              name: 'payer',
              displayName: 'Payer Info (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"email_address": "buyer@example.com"}',
            },
            {
              id: 'application_context',
              name: 'application_context',
              displayName: 'Application Context (JSON)',
              type: 'json',
              required: false,
              description: 'Return URLs, landing page, etc.',
            },
          ],
        },
        {
          id: 'get_order',
          name: 'Get Order',
          value: 'get',
          description: 'Get an order by ID',
          action: 'Retrieve an order',
          fields: [
            {
              id: 'order_id',
              name: 'orderId',
              displayName: 'Order ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'capture_order',
          name: 'Capture Order',
          value: 'capture',
          description: 'Capture payment for an order',
          action: 'Capture an order',
          fields: [
            {
              id: 'order_id',
              name: 'orderId',
              displayName: 'Order ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'note_to_payer',
              name: 'note_to_payer',
              displayName: 'Note to Payer',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'authorize_order',
          name: 'Authorize Order',
          value: 'authorize',
          description: 'Authorize payment for an order',
          action: 'Authorize an order',
          fields: [
            {
              id: 'order_id',
              name: 'orderId',
              displayName: 'Order ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'update_order',
          name: 'Update Order',
          value: 'update',
          description: 'Update an order',
          action: 'Update an order',
          fields: [
            {
              id: 'order_id',
              name: 'orderId',
              displayName: 'Order ID',
              type: 'string',
              required: true,
            },
            {
              id: 'patch_operations',
              name: 'patch',
              displayName: 'Patch Operations (JSON)',
              type: 'json',
              required: true,
              placeholder: '[{"op": "replace", "path": "/purchase_units/@reference_id==\'default\'/amount", "value": {...}}]',
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // PAYMENT RESOURCE
    // ============================================
    {
      id: 'payment',
      name: 'Payment',
      value: 'payment',
      description: 'Captured payments',
      operations: [
        {
          id: 'get_payment',
          name: 'Get Captured Payment',
          value: 'get',
          description: 'Get a captured payment',
          action: 'Retrieve a captured payment',
          fields: [
            {
              id: 'capture_id',
              name: 'captureId',
              displayName: 'Capture ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'refund_payment',
          name: 'Refund Captured Payment',
          value: 'refund',
          description: 'Refund a captured payment',
          action: 'Refund a payment',
          fields: [
            {
              id: 'capture_id',
              name: 'captureId',
              displayName: 'Capture ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'amount',
              name: 'amount',
              displayName: 'Amount (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"value": "10.00", "currency_code": "USD"}',
              description: 'Leave empty for full refund',
            },
            {
              id: 'invoice_id',
              name: 'invoice_id',
              displayName: 'Invoice ID',
              type: 'string',
              required: false,
            },
            {
              id: 'note_to_payer',
              name: 'note_to_payer',
              displayName: 'Note to Payer',
              type: 'string',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // AUTHORIZATION RESOURCE
    // ============================================
    {
      id: 'authorization',
      name: 'Authorization',
      value: 'authorization',
      description: 'Payment authorizations',
      operations: [
        {
          id: 'get_authorization',
          name: 'Get Authorization',
          value: 'get',
          description: 'Get an authorization',
          action: 'Retrieve an authorization',
          fields: [
            {
              id: 'authorization_id',
              name: 'authorizationId',
              displayName: 'Authorization ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'capture_authorization',
          name: 'Capture Authorization',
          value: 'capture',
          description: 'Capture an authorized payment',
          action: 'Capture an authorization',
          fields: [
            {
              id: 'authorization_id',
              name: 'authorizationId',
              displayName: 'Authorization ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'amount',
              name: 'amount',
              displayName: 'Amount (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"value": "100.00", "currency_code": "USD"}',
            },
            {
              id: 'final_capture',
              name: 'final_capture',
              displayName: 'Final Capture',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'invoice_id',
              name: 'invoice_id',
              displayName: 'Invoice ID',
              type: 'string',
              required: false,
            },
            {
              id: 'note_to_payer',
              name: 'note_to_payer',
              displayName: 'Note to Payer',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'void_authorization',
          name: 'Void Authorization',
          value: 'void',
          description: 'Void an authorization',
          action: 'Void an authorization',
          fields: [
            {
              id: 'authorization_id',
              name: 'authorizationId',
              displayName: 'Authorization ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'reauthorize',
          name: 'Reauthorize',
          value: 'reauthorize',
          description: 'Reauthorize an authorized payment',
          action: 'Reauthorize a payment',
          fields: [
            {
              id: 'authorization_id',
              name: 'authorizationId',
              displayName: 'Authorization ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'amount',
              name: 'amount',
              displayName: 'Amount (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"value": "100.00", "currency_code": "USD"}',
            },
          ],
        },
      ],
    },
    
    // ============================================
    // REFUND RESOURCE
    // ============================================
    {
      id: 'refund',
      name: 'Refund',
      value: 'refund',
      description: 'Payment refunds',
      operations: [
        {
          id: 'get_refund',
          name: 'Get Refund',
          value: 'get',
          description: 'Get a refund by ID',
          action: 'Retrieve a refund',
          fields: [
            {
              id: 'refund_id',
              name: 'refundId',
              displayName: 'Refund ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // PAYOUT RESOURCE
    // ============================================
    {
      id: 'payout',
      name: 'Payout',
      value: 'payout',
      description: 'Payouts (batch payments)',
      operations: [
        {
          id: 'create_payout',
          name: 'Create Payout',
          value: 'create',
          description: 'Create a payout batch',
          action: 'Create a payout',
          fields: [
            {
              id: 'sender_batch_header',
              name: 'sender_batch_header',
              displayName: 'Sender Batch Header (JSON)',
              type: 'json',
              required: true,
              placeholder: '{"sender_batch_id": "batch_001", "email_subject": "You have a payout!"}',
            },
            {
              id: 'items',
              name: 'items',
              displayName: 'Payout Items (JSON)',
              type: 'json',
              required: true,
              placeholder: '[{"recipient_type": "EMAIL", "amount": {"value": "10.00", "currency": "USD"}, "receiver": "user@example.com"}]',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_payout',
          name: 'Get Payout',
          value: 'get',
          description: 'Get a payout batch',
          action: 'Retrieve a payout batch',
          fields: [
            {
              id: 'payout_batch_id',
              name: 'payoutBatchId',
              displayName: 'Payout Batch ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'page',
              name: 'page',
              displayName: 'Page',
              type: 'number',
              required: false,
              default: 1,
            },
            {
              id: 'page_size',
              name: 'page_size',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 1000,
            },
          ],
        },
        {
          id: 'get_payout_item',
          name: 'Get Payout Item',
          value: 'getItem',
          description: 'Get a single payout item',
          action: 'Retrieve a payout item',
          fields: [
            {
              id: 'payout_item_id',
              name: 'payoutItemId',
              displayName: 'Payout Item ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'cancel_payout_item',
          name: 'Cancel Payout Item',
          value: 'cancelItem',
          description: 'Cancel an unclaimed payout item',
          action: 'Cancel a payout item',
          fields: [
            {
              id: 'payout_item_id',
              name: 'payoutItemId',
              displayName: 'Payout Item ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
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
      description: 'Recurring subscriptions',
      operations: [
        {
          id: 'create_subscription',
          name: 'Create Subscription',
          value: 'create',
          description: 'Create a subscription',
          action: 'Create a subscription',
          fields: [
            {
              id: 'plan_id',
              name: 'plan_id',
              displayName: 'Plan ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'start_time',
              name: 'start_time',
              displayName: 'Start Time',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'quantity',
              name: 'quantity',
              displayName: 'Quantity',
              type: 'number',
              required: false,
            },
            {
              id: 'subscriber',
              name: 'subscriber',
              displayName: 'Subscriber (JSON)',
              type: 'json',
              required: false,
              placeholder: '{"name": {"given_name": "John", "surname": "Doe"}, "email_address": "john@example.com"}',
            },
            {
              id: 'application_context',
              name: 'application_context',
              displayName: 'Application Context (JSON)',
              type: 'json',
              required: false,
            },
            {
              id: 'custom_id',
              name: 'custom_id',
              displayName: 'Custom ID',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_subscription',
          name: 'Get Subscription',
          value: 'get',
          description: 'Get a subscription',
          action: 'Retrieve a subscription',
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
          id: 'update_subscription',
          name: 'Update Subscription',
          value: 'update',
          description: 'Update a subscription',
          action: 'Update a subscription',
          fields: [
            {
              id: 'subscription_id',
              name: 'subscriptionId',
              displayName: 'Subscription ID',
              type: 'string',
              required: true,
            },
            {
              id: 'patch_operations',
              name: 'patch',
              displayName: 'Patch Operations (JSON)',
              type: 'json',
              required: true,
              placeholder: '[{"op": "replace", "path": "/billing_info/outstanding_balance", "value": {...}}]',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'activate_subscription',
          name: 'Activate Subscription',
          value: 'activate',
          description: 'Activate a subscription',
          action: 'Activate a subscription',
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
              id: 'reason',
              name: 'reason',
              displayName: 'Reason',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'suspend_subscription',
          name: 'Suspend Subscription',
          value: 'suspend',
          description: 'Suspend a subscription',
          action: 'Suspend a subscription',
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
              id: 'reason',
              name: 'reason',
              displayName: 'Reason',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'cancel_subscription',
          name: 'Cancel Subscription',
          value: 'cancel',
          description: 'Cancel a subscription',
          action: 'Cancel a subscription',
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
              id: 'reason',
              name: 'reason',
              displayName: 'Reason',
              type: 'string',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // INVOICE RESOURCE
    // ============================================
    {
      id: 'invoice',
      name: 'Invoice',
      value: 'invoice',
      description: 'Invoices',
      operations: [
        {
          id: 'create_invoice',
          name: 'Create Invoice',
          value: 'create',
          description: 'Create a draft invoice',
          action: 'Create an invoice',
          fields: [
            {
              id: 'detail',
              name: 'detail',
              displayName: 'Invoice Detail (JSON)',
              type: 'json',
              required: true,
              placeholder: '{"invoice_number": "INV-001", "currency_code": "USD"}',
            },
          ],
          optionalFields: [
            {
              id: 'invoicer',
              name: 'invoicer',
              displayName: 'Invoicer Info (JSON)',
              type: 'json',
              required: false,
            },
            {
              id: 'primary_recipients',
              name: 'primary_recipients',
              displayName: 'Primary Recipients (JSON)',
              type: 'json',
              required: false,
              placeholder: '[{"billing_info": {"email_address": "customer@example.com"}}]',
            },
            {
              id: 'items',
              name: 'items',
              displayName: 'Items (JSON)',
              type: 'json',
              required: false,
              placeholder: '[{"name": "Product", "quantity": "1", "unit_amount": {"currency_code": "USD", "value": "100.00"}}]',
            },
            {
              id: 'configuration',
              name: 'configuration',
              displayName: 'Configuration (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'get_invoice',
          name: 'Get Invoice',
          value: 'get',
          description: 'Get an invoice',
          action: 'Retrieve an invoice',
          fields: [
            {
              id: 'invoice_id',
              name: 'invoiceId',
              displayName: 'Invoice ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_invoices',
          name: 'Get Invoices',
          value: 'getMany',
          description: 'Get all invoices',
          action: 'List invoices',
          fields: [],
          optionalFields: [
            {
              id: 'page',
              name: 'page',
              displayName: 'Page',
              type: 'number',
              required: false,
              default: 1,
            },
            {
              id: 'page_size',
              name: 'page_size',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 20,
            },
          ],
        },
        {
          id: 'send_invoice',
          name: 'Send Invoice',
          value: 'send',
          description: 'Send an invoice',
          action: 'Send an invoice',
          fields: [
            {
              id: 'invoice_id',
              name: 'invoiceId',
              displayName: 'Invoice ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: false,
            },
            {
              id: 'note',
              name: 'note',
              displayName: 'Note',
              type: 'string',
              required: false,
            },
            {
              id: 'send_to_invoicer',
              name: 'send_to_invoicer',
              displayName: 'Send Copy to Invoicer',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'cancel_invoice',
          name: 'Cancel Invoice',
          value: 'cancel',
          description: 'Cancel a sent invoice',
          action: 'Cancel an invoice',
          fields: [
            {
              id: 'invoice_id',
              name: 'invoiceId',
              displayName: 'Invoice ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: false,
            },
            {
              id: 'note',
              name: 'note',
              displayName: 'Note',
              type: 'string',
              required: false,
            },
            {
              id: 'send_to_invoicer',
              name: 'send_to_invoicer',
              displayName: 'Send Copy to Invoicer',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'send_to_recipient',
              name: 'send_to_recipient',
              displayName: 'Send to Recipient',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'delete_invoice',
          name: 'Delete Invoice',
          value: 'delete',
          description: 'Delete a draft invoice',
          action: 'Delete an invoice',
          fields: [
            {
              id: 'invoice_id',
              name: 'invoiceId',
              displayName: 'Invoice ID',
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
