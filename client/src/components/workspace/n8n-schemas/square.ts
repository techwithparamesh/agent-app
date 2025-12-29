/**
 * Square Integration Schema
 * Resources: Payment
 */

import type { N8nAppSchema } from './types';

export const squareSchema: N8nAppSchema = {
  id: 'square',
  name: 'Square',
  description: 'Square payment processing',
  icon: 'credit-card',
  color: '#006AFF',
  version: '1.0',
  group: ['payments'],
  credentials: [
    {
      id: 'square_oauth2',
      name: 'Square OAuth2',
      type: 'oAuth2',
      fields: [
        { id: 'access_token', displayName: 'Access Token', name: 'accessToken', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'payment',
      name: 'Payment',
      value: 'payment',
      description: 'Process payments',
      operations: [
        {
          id: 'create_payment',
          name: 'Create Payment',
          value: 'create_payment',
          description: 'Create a payment',
          action: 'Create payment',
          fields: [
            {
              id: 'source_id',
              name: 'sourceId',
              displayName: 'Source ID',
              type: 'string',
              required: true,
              description: 'Payment source (card nonce or customer card ID)',
            },
            {
              id: 'amount',
              name: 'amount',
              displayName: 'Amount (cents)',
              type: 'number',
              required: true,
              description: 'Amount in smallest currency unit',
            },
            {
              id: 'currency',
              name: 'currency',
              displayName: 'Currency',
              type: 'options',
              required: true,
              default: 'USD',
              options: [
                { name: 'USD', value: 'USD' },
                { name: 'CAD', value: 'CAD' },
                { name: 'GBP', value: 'GBP' },
                { name: 'EUR', value: 'EUR' },
                { name: 'AUD', value: 'AUD' },
                { name: 'JPY', value: 'JPY' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'idempotency_key',
              name: 'idempotencyKey',
              displayName: 'Idempotency Key',
              type: 'string',
            },
            {
              id: 'customer_id',
              name: 'customerId',
              displayName: 'Customer ID',
              type: 'string',
            },
            {
              id: 'location_id',
              name: 'locationId',
              displayName: 'Location ID',
              type: 'string',
            },
            {
              id: 'reference_id',
              name: 'referenceId',
              displayName: 'Reference ID',
              type: 'string',
            },
            {
              id: 'note',
              name: 'note',
              displayName: 'Note',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};
