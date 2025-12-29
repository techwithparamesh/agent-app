/**
 * HubSpot Marketing Integration Schema
 * Resources: List, Marketing Email
 */

import type { N8nAppSchema } from './types';

export const hubspotMarketingSchema: N8nAppSchema = {
  id: 'hubspot-marketing',
  name: 'HubSpot Marketing',
  description: 'HubSpot marketing automation',
  icon: 'mail',
  color: '#FF7A59',
  version: '1.0',
  group: ['marketing'],
  credentials: [
    {
      id: 'hubspot_oauth2',
      name: 'HubSpot OAuth2',
      type: 'oAuth2',
      fields: [
        { id: 'client_id', displayName: 'Client ID', name: 'clientId', type: 'string', required: true },
        { id: 'client_secret', displayName: 'Client Secret', name: 'clientSecret', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'list',
      name: 'List',
      value: 'list',
      description: 'Manage contact lists',
      operations: [
        {
          id: 'add_to_list',
          name: 'Add to List',
          value: 'add_to_list',
          description: 'Add a contact to a list',
          action: 'Add to list',
          fields: [
            {
              id: 'list_id',
              name: 'listId',
              displayName: 'List ID',
              type: 'string',
              required: true,
            },
            {
              id: 'email',
              name: 'email',
              displayName: 'Contact Email',
              type: 'string',
              required: true,
            },
          ],
        },
      ],
    },
    {
      id: 'email',
      name: 'Marketing Email',
      value: 'email',
      description: 'Send marketing emails',
      operations: [
        {
          id: 'send_marketing_email',
          name: 'Send Marketing Email',
          value: 'send_marketing_email',
          description: 'Send a marketing email to a contact',
          action: 'Send marketing email',
          fields: [
            {
              id: 'email_id',
              name: 'emailId',
              displayName: 'Email ID',
              type: 'string',
              required: true,
              description: 'Marketing email template ID',
            },
            {
              id: 'to_email',
              name: 'toEmail',
              displayName: 'To Email',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'contact_properties',
              name: 'contactProperties',
              displayName: 'Contact Properties (JSON)',
              type: 'json',
              description: 'Custom properties for personalization',
            },
          ],
        },
      ],
    },
  ],
};
