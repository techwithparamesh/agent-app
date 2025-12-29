/**
 * Replicate Integration Schema
 * Resources: Prediction
 */

import type { N8nAppSchema } from './types';

export const replicateSchema: N8nAppSchema = {
  id: 'replicate',
  name: 'Replicate',
  description: 'Replicate AI model hosting',
  icon: 'cpu',
  color: '#000000',
  version: '1.0',
  group: ['ai'],
  credentials: [
    {
      id: 'replicate_api',
      name: 'Replicate API',
      type: 'apiKey',
      fields: [
        { id: 'api_token', displayName: 'API Token', name: 'apiToken', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'prediction',
      name: 'Prediction',
      value: 'prediction',
      description: 'Run AI model predictions',
      operations: [
        {
          id: 'run_model',
          name: 'Run Model',
          value: 'run_model',
          description: 'Run an AI model',
          action: 'Run model',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'string',
              required: true,
              description: 'Model identifier (owner/name or version)',
            },
            {
              id: 'input',
              name: 'input',
              displayName: 'Input (JSON)',
              type: 'json',
              required: true,
              description: 'Model input parameters as JSON',
            },
          ],
          optionalFields: [
            {
              id: 'wait',
              name: 'wait',
              displayName: 'Wait for Result',
              type: 'boolean',
              default: true,
            },
            {
              id: 'webhook',
              name: 'webhook',
              displayName: 'Webhook URL',
              type: 'string',
              description: 'URL to receive prediction results',
            },
          ],
        },
        {
          id: 'get_prediction',
          name: 'Get Prediction',
          value: 'get_prediction',
          description: 'Get prediction status and result',
          action: 'Get prediction',
          fields: [
            {
              id: 'prediction_id',
              name: 'predictionId',
              displayName: 'Prediction ID',
              type: 'string',
              required: true,
            },
          ],
        },
        {
          id: 'cancel_prediction',
          name: 'Cancel Prediction',
          value: 'cancel_prediction',
          description: 'Cancel a running prediction',
          action: 'Cancel prediction',
          fields: [
            {
              id: 'prediction_id',
              name: 'predictionId',
              displayName: 'Prediction ID',
              type: 'string',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
