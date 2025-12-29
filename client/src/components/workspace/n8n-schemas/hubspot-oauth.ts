/**
 * HubSpot OAuth Integration Schema
 * Resources: Contact
 */

import type { N8nAppSchema } from './types';

export const hubspotOauthSchema: N8nAppSchema = {
  id: 'hubspot-oauth',
  name: 'HubSpot (OAuth)',
  description: 'HubSpot CRM with OAuth authentication',
  icon: 'users',
  color: '#FF7A59',
  version: '1.0',
  group: ['crm'],
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
      id: 'contact',
      name: 'Contact',
      value: 'contact',
      description: 'Manage contacts',
      operations: [
        {
          id: 'create_contact',
          name: 'Create Contact',
          value: 'create_contact',
          description: 'Create a new contact',
          action: 'Create contact',
          fields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'firstname',
              name: 'firstname',
              displayName: 'First Name',
              type: 'string',
            },
            {
              id: 'lastname',
              name: 'lastname',
              displayName: 'Last Name',
              type: 'string',
            },
            {
              id: 'phone',
              name: 'phone',
              displayName: 'Phone',
              type: 'string',
            },
            {
              id: 'company',
              name: 'company',
              displayName: 'Company',
              type: 'string',
            },
            {
              id: 'jobtitle',
              name: 'jobtitle',
              displayName: 'Job Title',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};
