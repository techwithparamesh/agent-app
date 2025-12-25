/**
 * HubSpot n8n-Style Schema
 * 
 * Resources: Contact, Contact List, Company, Deal, Engagement, Form, Ticket
 * Based on: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.hubspot/
 */

import { N8nAppSchema } from './types';

export const hubspotSchema: N8nAppSchema = {
  id: 'hubspot',
  name: 'HubSpot',
  icon: 'hubspot',
  color: '#FF7A59',
  description: 'Manage contacts, companies, deals, and more in HubSpot CRM',
  version: '1.0',
  subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
  group: ['crm', 'marketing'],
  documentationUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.hubspot/',

  credentials: [
    {
      id: 'hubspot_api',
      name: 'HubSpot API',
      type: 'apiKey',
      fields: [
        {
          id: 'api_key',
          displayName: 'Private App Access Token',
          name: 'accessToken',
          type: 'password',
          required: true,
          description: 'Your HubSpot Private App access token',
          placeholder: 'pat-na1-...',
        },
      ],
    },
    {
      id: 'hubspot_oauth2',
      name: 'HubSpot OAuth2',
      type: 'oAuth2',
      fields: [
        {
          id: 'client_id',
          displayName: 'Client ID',
          name: 'clientId',
          type: 'string',
          required: true,
        },
        {
          id: 'client_secret',
          displayName: 'Client Secret',
          name: 'clientSecret',
          type: 'password',
          required: true,
        },
      ],
    },
  ],

  resources: [
    // ========================================
    // CONTACT RESOURCE
    // ========================================
    {
      id: 'contact',
      name: 'Contact',
      value: 'contact',
      description: 'Create and manage contacts',
      operations: [
        {
          id: 'create_contact',
          name: 'Create',
          value: 'create',
          description: 'Create a contact',
          action: 'Create a contact',
          fields: [
            {
              id: 'email',
              displayName: 'Email',
              name: 'email',
              type: 'string',
              required: true,
              description: 'Primary email of the contact',
              placeholder: 'john@example.com',
            },
          ],
          optionalFields: [
            {
              id: 'firstname',
              displayName: 'First Name',
              name: 'firstname',
              type: 'string',
              placeholder: 'John',
            },
            {
              id: 'lastname',
              displayName: 'Last Name',
              name: 'lastname',
              type: 'string',
              placeholder: 'Doe',
            },
            {
              id: 'phone',
              displayName: 'Phone',
              name: 'phone',
              type: 'string',
              placeholder: '+1 555 123 4567',
            },
            {
              id: 'company',
              displayName: 'Company',
              name: 'company',
              type: 'string',
            },
            {
              id: 'jobtitle',
              displayName: 'Job Title',
              name: 'jobtitle',
              type: 'string',
            },
            {
              id: 'website',
              displayName: 'Website',
              name: 'website',
              type: 'string',
              placeholder: 'https://example.com',
            },
            {
              id: 'address',
              displayName: 'Street Address',
              name: 'address',
              type: 'string',
            },
            {
              id: 'city',
              displayName: 'City',
              name: 'city',
              type: 'string',
            },
            {
              id: 'state',
              displayName: 'State/Region',
              name: 'state',
              type: 'string',
            },
            {
              id: 'zip',
              displayName: 'Postal Code',
              name: 'zip',
              type: 'string',
            },
            {
              id: 'country',
              displayName: 'Country',
              name: 'country',
              type: 'string',
            },
            {
              id: 'lifecyclestage',
              displayName: 'Lifecycle Stage',
              name: 'lifecyclestage',
              type: 'options',
              options: [
                { name: 'Subscriber', value: 'subscriber' },
                { name: 'Lead', value: 'lead' },
                { name: 'Marketing Qualified Lead', value: 'marketingqualifiedlead' },
                { name: 'Sales Qualified Lead', value: 'salesqualifiedlead' },
                { name: 'Opportunity', value: 'opportunity' },
                { name: 'Customer', value: 'customer' },
                { name: 'Evangelist', value: 'evangelist' },
                { name: 'Other', value: 'other' },
              ],
            },
            {
              id: 'hs_lead_status',
              displayName: 'Lead Status',
              name: 'hs_lead_status',
              type: 'options',
              options: [
                { name: 'New', value: 'NEW' },
                { name: 'Open', value: 'OPEN' },
                { name: 'In Progress', value: 'IN_PROGRESS' },
                { name: 'Open Deal', value: 'OPEN_DEAL' },
                { name: 'Unqualified', value: 'UNQUALIFIED' },
                { name: 'Attempted to Contact', value: 'ATTEMPTED_TO_CONTACT' },
                { name: 'Connected', value: 'CONNECTED' },
                { name: 'Bad Timing', value: 'BAD_TIMING' },
              ],
            },
            {
              id: 'hubspot_owner_id',
              displayName: 'Owner',
              name: 'hubspot_owner_id',
              type: 'options',
              description: 'The owner of the contact',
              typeOptions: {
                loadOptionsMethod: 'getOwners',
              },
            },
            {
              id: 'custom_properties',
              displayName: 'Custom Properties',
              name: 'customProperties',
              type: 'json',
              description: 'Additional custom properties as JSON',
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/crm/v3/objects/contacts',
            },
          },
        },
        {
          id: 'get_contact',
          name: 'Get',
          value: 'get',
          description: 'Get a contact by ID',
          action: 'Get a contact',
          fields: [
            {
              id: 'contact_id',
              displayName: 'Contact ID',
              name: 'contactId',
              type: 'string',
              required: true,
              description: 'The ID of the contact',
              placeholder: '12345',
            },
          ],
          optionalFields: [
            {
              id: 'properties',
              displayName: 'Properties',
              name: 'properties',
              type: 'multiOptions',
              description: 'Properties to include in response',
              options: [
                { name: 'Email', value: 'email' },
                { name: 'First Name', value: 'firstname' },
                { name: 'Last Name', value: 'lastname' },
                { name: 'Phone', value: 'phone' },
                { name: 'Company', value: 'company' },
                { name: 'Job Title', value: 'jobtitle' },
                { name: 'Website', value: 'website' },
                { name: 'Lifecycle Stage', value: 'lifecyclestage' },
                { name: 'Lead Status', value: 'hs_lead_status' },
                { name: 'Owner', value: 'hubspot_owner_id' },
                { name: 'Create Date', value: 'createdate' },
                { name: 'Last Modified', value: 'lastmodifieddate' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/crm/v3/objects/contacts/{contactId}',
            },
          },
        },
        {
          id: 'get_many_contacts',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many contacts',
          action: 'Get many contacts',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              displayOptions: {
                show: { returnAll: [false] },
              },
              typeOptions: { minValue: 1, maxValue: 100 },
            },
            {
              id: 'properties',
              displayName: 'Properties',
              name: 'properties',
              type: 'multiOptions',
              options: [
                { name: 'Email', value: 'email' },
                { name: 'First Name', value: 'firstname' },
                { name: 'Last Name', value: 'lastname' },
                { name: 'Phone', value: 'phone' },
                { name: 'Company', value: 'company' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/crm/v3/objects/contacts',
            },
          },
        },
        {
          id: 'update_contact',
          name: 'Update',
          value: 'update',
          description: 'Update a contact',
          action: 'Update a contact',
          fields: [
            {
              id: 'contact_id',
              displayName: 'Contact ID',
              name: 'contactId',
              type: 'string',
              required: true,
              placeholder: '12345',
            },
          ],
          optionalFields: [
            {
              id: 'email',
              displayName: 'Email',
              name: 'email',
              type: 'string',
            },
            {
              id: 'firstname',
              displayName: 'First Name',
              name: 'firstname',
              type: 'string',
            },
            {
              id: 'lastname',
              displayName: 'Last Name',
              name: 'lastname',
              type: 'string',
            },
            {
              id: 'phone',
              displayName: 'Phone',
              name: 'phone',
              type: 'string',
            },
            {
              id: 'company',
              displayName: 'Company',
              name: 'company',
              type: 'string',
            },
            {
              id: 'jobtitle',
              displayName: 'Job Title',
              name: 'jobtitle',
              type: 'string',
            },
            {
              id: 'lifecyclestage',
              displayName: 'Lifecycle Stage',
              name: 'lifecyclestage',
              type: 'options',
              options: [
                { name: 'Subscriber', value: 'subscriber' },
                { name: 'Lead', value: 'lead' },
                { name: 'Marketing Qualified Lead', value: 'marketingqualifiedlead' },
                { name: 'Sales Qualified Lead', value: 'salesqualifiedlead' },
                { name: 'Opportunity', value: 'opportunity' },
                { name: 'Customer', value: 'customer' },
                { name: 'Evangelist', value: 'evangelist' },
                { name: 'Other', value: 'other' },
              ],
            },
            {
              id: 'custom_properties',
              displayName: 'Custom Properties',
              name: 'customProperties',
              type: 'json',
              typeOptions: { alwaysOpenEditWindow: true },
            },
          ],
          routing: {
            request: {
              method: 'PATCH',
              url: '/crm/v3/objects/contacts/{contactId}',
            },
          },
        },
        {
          id: 'delete_contact',
          name: 'Delete',
          value: 'delete',
          description: 'Delete a contact',
          action: 'Delete a contact',
          fields: [
            {
              id: 'contact_id',
              displayName: 'Contact ID',
              name: 'contactId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'DELETE',
              url: '/crm/v3/objects/contacts/{contactId}',
            },
          },
        },
        {
          id: 'search_contacts',
          name: 'Search',
          value: 'search',
          description: 'Search contacts',
          action: 'Search contacts',
          fields: [
            {
              id: 'filter_groups',
              displayName: 'Filter Type',
              name: 'filterType',
              type: 'options',
              required: true,
              default: 'simple',
              options: [
                { name: 'Simple', value: 'simple' },
                { name: 'Advanced (JSON)', value: 'advanced' },
              ],
            },
            {
              id: 'property_name',
              displayName: 'Property',
              name: 'propertyName',
              type: 'options',
              required: true,
              displayOptions: { show: { filterType: ['simple'] } },
              options: [
                { name: 'Email', value: 'email' },
                { name: 'First Name', value: 'firstname' },
                { name: 'Last Name', value: 'lastname' },
                { name: 'Phone', value: 'phone' },
                { name: 'Company', value: 'company' },
                { name: 'Lifecycle Stage', value: 'lifecyclestage' },
                { name: 'Lead Status', value: 'hs_lead_status' },
              ],
            },
            {
              id: 'operator',
              displayName: 'Operator',
              name: 'operator',
              type: 'options',
              required: true,
              displayOptions: { show: { filterType: ['simple'] } },
              options: [
                { name: 'Equals', value: 'EQ' },
                { name: 'Not Equals', value: 'NEQ' },
                { name: 'Contains', value: 'CONTAINS_TOKEN' },
                { name: 'Greater Than', value: 'GT' },
                { name: 'Less Than', value: 'LT' },
                { name: 'Has Property', value: 'HAS_PROPERTY' },
                { name: 'Not Has Property', value: 'NOT_HAS_PROPERTY' },
              ],
            },
            {
              id: 'value',
              displayName: 'Value',
              name: 'value',
              type: 'string',
              required: true,
              displayOptions: { show: { filterType: ['simple'] } },
            },
            {
              id: 'filter_json',
              displayName: 'Filter JSON',
              name: 'filterJson',
              type: 'json',
              required: true,
              displayOptions: { show: { filterType: ['advanced'] } },
              typeOptions: { alwaysOpenEditWindow: true },
            },
          ],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              displayOptions: { show: { returnAll: [false] } },
            },
            {
              id: 'sorts',
              displayName: 'Sort By',
              name: 'sorts',
              type: 'options',
              options: [
                { name: 'Create Date (Newest)', value: 'createdate_desc' },
                { name: 'Create Date (Oldest)', value: 'createdate_asc' },
                { name: 'Last Modified (Newest)', value: 'lastmodifieddate_desc' },
                { name: 'Last Modified (Oldest)', value: 'lastmodifieddate_asc' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/crm/v3/objects/contacts/search',
            },
          },
        },
      ],
    },

    // ========================================
    // COMPANY RESOURCE
    // ========================================
    {
      id: 'company',
      name: 'Company',
      value: 'company',
      description: 'Create and manage companies',
      operations: [
        {
          id: 'create_company',
          name: 'Create',
          value: 'create',
          description: 'Create a company',
          action: 'Create a company',
          fields: [
            {
              id: 'name',
              displayName: 'Company Name',
              name: 'name',
              type: 'string',
              required: true,
              placeholder: 'Acme Inc',
            },
          ],
          optionalFields: [
            {
              id: 'domain',
              displayName: 'Domain',
              name: 'domain',
              type: 'string',
              placeholder: 'acme.com',
            },
            {
              id: 'industry',
              displayName: 'Industry',
              name: 'industry',
              type: 'string',
            },
            {
              id: 'phone',
              displayName: 'Phone',
              name: 'phone',
              type: 'string',
            },
            {
              id: 'city',
              displayName: 'City',
              name: 'city',
              type: 'string',
            },
            {
              id: 'state',
              displayName: 'State/Region',
              name: 'state',
              type: 'string',
            },
            {
              id: 'country',
              displayName: 'Country',
              name: 'country',
              type: 'string',
            },
            {
              id: 'numberofemployees',
              displayName: 'Number of Employees',
              name: 'numberofemployees',
              type: 'number',
            },
            {
              id: 'annualrevenue',
              displayName: 'Annual Revenue',
              name: 'annualrevenue',
              type: 'number',
            },
            {
              id: 'description',
              displayName: 'Description',
              name: 'description',
              type: 'text',
              typeOptions: { rows: 3 },
            },
            {
              id: 'hubspot_owner_id',
              displayName: 'Owner',
              name: 'hubspot_owner_id',
              type: 'options',
              typeOptions: { loadOptionsMethod: 'getOwners' },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/crm/v3/objects/companies',
            },
          },
        },
        {
          id: 'get_company',
          name: 'Get',
          value: 'get',
          description: 'Get a company by ID',
          action: 'Get a company',
          fields: [
            {
              id: 'company_id',
              displayName: 'Company ID',
              name: 'companyId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'properties',
              displayName: 'Properties',
              name: 'properties',
              type: 'multiOptions',
              options: [
                { name: 'Name', value: 'name' },
                { name: 'Domain', value: 'domain' },
                { name: 'Industry', value: 'industry' },
                { name: 'Phone', value: 'phone' },
                { name: 'City', value: 'city' },
                { name: 'Number of Employees', value: 'numberofemployees' },
                { name: 'Annual Revenue', value: 'annualrevenue' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/crm/v3/objects/companies/{companyId}',
            },
          },
        },
        {
          id: 'get_many_companies',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many companies',
          action: 'Get many companies',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              displayOptions: { show: { returnAll: [false] } },
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/crm/v3/objects/companies',
            },
          },
        },
        {
          id: 'update_company',
          name: 'Update',
          value: 'update',
          description: 'Update a company',
          action: 'Update a company',
          fields: [
            {
              id: 'company_id',
              displayName: 'Company ID',
              name: 'companyId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'name',
              displayName: 'Name',
              name: 'name',
              type: 'string',
            },
            {
              id: 'domain',
              displayName: 'Domain',
              name: 'domain',
              type: 'string',
            },
            {
              id: 'industry',
              displayName: 'Industry',
              name: 'industry',
              type: 'string',
            },
            {
              id: 'phone',
              displayName: 'Phone',
              name: 'phone',
              type: 'string',
            },
            {
              id: 'numberofemployees',
              displayName: 'Number of Employees',
              name: 'numberofemployees',
              type: 'number',
            },
            {
              id: 'annualrevenue',
              displayName: 'Annual Revenue',
              name: 'annualrevenue',
              type: 'number',
            },
          ],
          routing: {
            request: {
              method: 'PATCH',
              url: '/crm/v3/objects/companies/{companyId}',
            },
          },
        },
        {
          id: 'delete_company',
          name: 'Delete',
          value: 'delete',
          description: 'Delete a company',
          action: 'Delete a company',
          fields: [
            {
              id: 'company_id',
              displayName: 'Company ID',
              name: 'companyId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'DELETE',
              url: '/crm/v3/objects/companies/{companyId}',
            },
          },
        },
        {
          id: 'search_companies',
          name: 'Search',
          value: 'search',
          description: 'Search companies',
          action: 'Search companies',
          fields: [
            {
              id: 'query',
              displayName: 'Search Query',
              name: 'query',
              type: 'string',
              required: true,
              placeholder: 'acme',
            },
          ],
          optionalFields: [
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/crm/v3/objects/companies/search',
            },
          },
        },
      ],
    },

    // ========================================
    // DEAL RESOURCE
    // ========================================
    {
      id: 'deal',
      name: 'Deal',
      value: 'deal',
      description: 'Create and manage deals',
      operations: [
        {
          id: 'create_deal',
          name: 'Create',
          value: 'create',
          description: 'Create a deal',
          action: 'Create a deal',
          fields: [
            {
              id: 'dealname',
              displayName: 'Deal Name',
              name: 'dealname',
              type: 'string',
              required: true,
              placeholder: 'New Enterprise Deal',
            },
            {
              id: 'pipeline',
              displayName: 'Pipeline',
              name: 'pipeline',
              type: 'options',
              required: true,
              typeOptions: { loadOptionsMethod: 'getPipelines' },
            },
            {
              id: 'dealstage',
              displayName: 'Deal Stage',
              name: 'dealstage',
              type: 'options',
              required: true,
              typeOptions: { loadOptionsMethod: 'getDealStages', loadOptionsDependsOn: ['pipeline'] },
            },
          ],
          optionalFields: [
            {
              id: 'amount',
              displayName: 'Amount',
              name: 'amount',
              type: 'number',
              description: 'Deal amount',
            },
            {
              id: 'closedate',
              displayName: 'Close Date',
              name: 'closedate',
              type: 'dateTime',
            },
            {
              id: 'dealtype',
              displayName: 'Deal Type',
              name: 'dealtype',
              type: 'options',
              options: [
                { name: 'New Business', value: 'newbusiness' },
                { name: 'Existing Business', value: 'existingbusiness' },
              ],
            },
            {
              id: 'hubspot_owner_id',
              displayName: 'Owner',
              name: 'hubspot_owner_id',
              type: 'options',
              typeOptions: { loadOptionsMethod: 'getOwners' },
            },
            {
              id: 'description',
              displayName: 'Description',
              name: 'description',
              type: 'text',
              typeOptions: { rows: 3 },
            },
            {
              id: 'hs_priority',
              displayName: 'Priority',
              name: 'hs_priority',
              type: 'options',
              options: [
                { name: 'Low', value: 'low' },
                { name: 'Medium', value: 'medium' },
                { name: 'High', value: 'high' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/crm/v3/objects/deals',
            },
          },
        },
        {
          id: 'get_deal',
          name: 'Get',
          value: 'get',
          description: 'Get a deal by ID',
          action: 'Get a deal',
          fields: [
            {
              id: 'deal_id',
              displayName: 'Deal ID',
              name: 'dealId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'properties',
              displayName: 'Properties',
              name: 'properties',
              type: 'multiOptions',
              options: [
                { name: 'Deal Name', value: 'dealname' },
                { name: 'Amount', value: 'amount' },
                { name: 'Close Date', value: 'closedate' },
                { name: 'Deal Stage', value: 'dealstage' },
                { name: 'Pipeline', value: 'pipeline' },
                { name: 'Deal Type', value: 'dealtype' },
                { name: 'Owner', value: 'hubspot_owner_id' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/crm/v3/objects/deals/{dealId}',
            },
          },
        },
        {
          id: 'get_many_deals',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many deals',
          action: 'Get many deals',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              displayOptions: { show: { returnAll: [false] } },
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/crm/v3/objects/deals',
            },
          },
        },
        {
          id: 'update_deal',
          name: 'Update',
          value: 'update',
          description: 'Update a deal',
          action: 'Update a deal',
          fields: [
            {
              id: 'deal_id',
              displayName: 'Deal ID',
              name: 'dealId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'dealname',
              displayName: 'Deal Name',
              name: 'dealname',
              type: 'string',
            },
            {
              id: 'amount',
              displayName: 'Amount',
              name: 'amount',
              type: 'number',
            },
            {
              id: 'dealstage',
              displayName: 'Deal Stage',
              name: 'dealstage',
              type: 'options',
              typeOptions: { loadOptionsMethod: 'getDealStages' },
            },
            {
              id: 'closedate',
              displayName: 'Close Date',
              name: 'closedate',
              type: 'dateTime',
            },
            {
              id: 'hubspot_owner_id',
              displayName: 'Owner',
              name: 'hubspot_owner_id',
              type: 'options',
              typeOptions: { loadOptionsMethod: 'getOwners' },
            },
          ],
          routing: {
            request: {
              method: 'PATCH',
              url: '/crm/v3/objects/deals/{dealId}',
            },
          },
        },
        {
          id: 'delete_deal',
          name: 'Delete',
          value: 'delete',
          description: 'Delete a deal',
          action: 'Delete a deal',
          fields: [
            {
              id: 'deal_id',
              displayName: 'Deal ID',
              name: 'dealId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'DELETE',
              url: '/crm/v3/objects/deals/{dealId}',
            },
          },
        },
        {
          id: 'search_deals',
          name: 'Search',
          value: 'search',
          description: 'Search deals',
          action: 'Search deals',
          fields: [
            {
              id: 'query',
              displayName: 'Search Query',
              name: 'query',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/crm/v3/objects/deals/search',
            },
          },
        },
      ],
    },

    // ========================================
    // TICKET RESOURCE
    // ========================================
    {
      id: 'ticket',
      name: 'Ticket',
      value: 'ticket',
      description: 'Create and manage support tickets',
      operations: [
        {
          id: 'create_ticket',
          name: 'Create',
          value: 'create',
          description: 'Create a ticket',
          action: 'Create a ticket',
          fields: [
            {
              id: 'subject',
              displayName: 'Subject',
              name: 'subject',
              type: 'string',
              required: true,
              placeholder: 'Support request',
            },
            {
              id: 'hs_pipeline',
              displayName: 'Pipeline',
              name: 'hs_pipeline',
              type: 'options',
              required: true,
              typeOptions: { loadOptionsMethod: 'getTicketPipelines' },
            },
            {
              id: 'hs_pipeline_stage',
              displayName: 'Pipeline Stage',
              name: 'hs_pipeline_stage',
              type: 'options',
              required: true,
              typeOptions: { loadOptionsMethod: 'getTicketStages', loadOptionsDependsOn: ['hs_pipeline'] },
            },
          ],
          optionalFields: [
            {
              id: 'content',
              displayName: 'Description',
              name: 'content',
              type: 'text',
              typeOptions: { rows: 4 },
            },
            {
              id: 'hs_ticket_priority',
              displayName: 'Priority',
              name: 'hs_ticket_priority',
              type: 'options',
              options: [
                { name: 'Low', value: 'LOW' },
                { name: 'Medium', value: 'MEDIUM' },
                { name: 'High', value: 'HIGH' },
              ],
            },
            {
              id: 'hs_ticket_category',
              displayName: 'Category',
              name: 'hs_ticket_category',
              type: 'options',
              options: [
                { name: 'General Inquiry', value: 'GENERAL_INQUIRY' },
                { name: 'Product Issue', value: 'PRODUCT_ISSUE' },
                { name: 'Billing Issue', value: 'BILLING_ISSUE' },
                { name: 'Feature Request', value: 'FEATURE_REQUEST' },
              ],
            },
            {
              id: 'hubspot_owner_id',
              displayName: 'Owner',
              name: 'hubspot_owner_id',
              type: 'options',
              typeOptions: { loadOptionsMethod: 'getOwners' },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/crm/v3/objects/tickets',
            },
          },
        },
        {
          id: 'get_ticket',
          name: 'Get',
          value: 'get',
          description: 'Get a ticket by ID',
          action: 'Get a ticket',
          fields: [
            {
              id: 'ticket_id',
              displayName: 'Ticket ID',
              name: 'ticketId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/crm/v3/objects/tickets/{ticketId}',
            },
          },
        },
        {
          id: 'get_many_tickets',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many tickets',
          action: 'Get many tickets',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              displayOptions: { show: { returnAll: [false] } },
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/crm/v3/objects/tickets',
            },
          },
        },
        {
          id: 'update_ticket',
          name: 'Update',
          value: 'update',
          description: 'Update a ticket',
          action: 'Update a ticket',
          fields: [
            {
              id: 'ticket_id',
              displayName: 'Ticket ID',
              name: 'ticketId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'subject',
              displayName: 'Subject',
              name: 'subject',
              type: 'string',
            },
            {
              id: 'content',
              displayName: 'Description',
              name: 'content',
              type: 'text',
            },
            {
              id: 'hs_pipeline_stage',
              displayName: 'Pipeline Stage',
              name: 'hs_pipeline_stage',
              type: 'options',
              typeOptions: { loadOptionsMethod: 'getTicketStages' },
            },
            {
              id: 'hs_ticket_priority',
              displayName: 'Priority',
              name: 'hs_ticket_priority',
              type: 'options',
              options: [
                { name: 'Low', value: 'LOW' },
                { name: 'Medium', value: 'MEDIUM' },
                { name: 'High', value: 'HIGH' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'PATCH',
              url: '/crm/v3/objects/tickets/{ticketId}',
            },
          },
        },
        {
          id: 'delete_ticket',
          name: 'Delete',
          value: 'delete',
          description: 'Delete a ticket',
          action: 'Delete a ticket',
          fields: [
            {
              id: 'ticket_id',
              displayName: 'Ticket ID',
              name: 'ticketId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'DELETE',
              url: '/crm/v3/objects/tickets/{ticketId}',
            },
          },
        },
      ],
    },

    // ========================================
    // ENGAGEMENT RESOURCE
    // ========================================
    {
      id: 'engagement',
      name: 'Engagement',
      value: 'engagement',
      description: 'Create notes, tasks, calls, emails, and meetings',
      operations: [
        {
          id: 'create_engagement',
          name: 'Create',
          value: 'create',
          description: 'Create an engagement',
          action: 'Create an engagement',
          fields: [
            {
              id: 'type',
              displayName: 'Type',
              name: 'type',
              type: 'options',
              required: true,
              options: [
                { name: 'Note', value: 'NOTE' },
                { name: 'Task', value: 'TASK' },
                { name: 'Call', value: 'CALL' },
                { name: 'Email', value: 'EMAIL' },
                { name: 'Meeting', value: 'MEETING' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'body',
              displayName: 'Body/Content',
              name: 'body',
              type: 'text',
              typeOptions: { rows: 4 },
            },
            {
              id: 'subject',
              displayName: 'Subject',
              name: 'subject',
              type: 'string',
              displayOptions: { show: { type: ['TASK', 'EMAIL', 'MEETING'] } },
            },
            {
              id: 'timestamp',
              displayName: 'Timestamp',
              name: 'timestamp',
              type: 'dateTime',
            },
            {
              id: 'hubspot_owner_id',
              displayName: 'Owner',
              name: 'hubspot_owner_id',
              type: 'options',
              typeOptions: { loadOptionsMethod: 'getOwners' },
            },
            {
              id: 'contact_ids',
              displayName: 'Associated Contacts',
              name: 'contactIds',
              type: 'string',
              description: 'Comma-separated contact IDs',
            },
            {
              id: 'company_ids',
              displayName: 'Associated Companies',
              name: 'companyIds',
              type: 'string',
              description: 'Comma-separated company IDs',
            },
            {
              id: 'deal_ids',
              displayName: 'Associated Deals',
              name: 'dealIds',
              type: 'string',
              description: 'Comma-separated deal IDs',
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/engagements/v1/engagements',
            },
          },
        },
        {
          id: 'get_engagement',
          name: 'Get',
          value: 'get',
          description: 'Get an engagement by ID',
          action: 'Get an engagement',
          fields: [
            {
              id: 'engagement_id',
              displayName: 'Engagement ID',
              name: 'engagementId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/engagements/v1/engagements/{engagementId}',
            },
          },
        },
        {
          id: 'get_many_engagements',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many engagements',
          action: 'Get many engagements',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              displayOptions: { show: { returnAll: [false] } },
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/engagements/v1/engagements/paged',
            },
          },
        },
        {
          id: 'delete_engagement',
          name: 'Delete',
          value: 'delete',
          description: 'Delete an engagement',
          action: 'Delete an engagement',
          fields: [
            {
              id: 'engagement_id',
              displayName: 'Engagement ID',
              name: 'engagementId',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'DELETE',
              url: '/engagements/v1/engagements/{engagementId}',
            },
          },
        },
      ],
    },

    // ========================================
    // FORM RESOURCE
    // ========================================
    {
      id: 'form',
      name: 'Form',
      value: 'form',
      description: 'Get forms and submissions',
      operations: [
        {
          id: 'get_many_forms',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get many forms',
          action: 'Get many forms',
          fields: [],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              displayOptions: { show: { returnAll: [false] } },
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/forms/v2/forms',
            },
          },
        },
        {
          id: 'get_submissions',
          name: 'Get Submissions',
          value: 'getSubmissions',
          description: 'Get form submissions',
          action: 'Get form submissions',
          fields: [
            {
              id: 'form_id',
              displayName: 'Form',
              name: 'formId',
              type: 'options',
              required: true,
              typeOptions: { loadOptionsMethod: 'getForms' },
            },
          ],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: false,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 50,
              displayOptions: { show: { returnAll: [false] } },
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/form-integrations/v1/submissions/forms/{formId}',
            },
          },
        },
      ],
    },
  ],

  defaults: {
    name: 'HubSpot',
  },
};

export default hubspotSchema;
