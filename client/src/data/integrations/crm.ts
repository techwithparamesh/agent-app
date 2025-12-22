import { Integration } from './types';

export const hubspotIntegration: Integration = {
  id: 'hubspot',
  name: 'HubSpot',
  description: 'Use the HubSpot node to manage contacts, companies, deals, and tickets. n8n supports the full HubSpot CRM API for sales automation, marketing, and customer service workflows.',
  shortDescription: 'CRM, sales, and marketing automation',
  category: 'crm',
  icon: 'hubspot',
  color: '#FF7A59',
  website: 'https://hubspot.com',
  documentationUrl: 'https://developers.hubspot.com/docs/api/overview',

  features: [
    'Contact management',
    'Company and deal tracking',
    'Pipeline automation',
    'Form submissions handling',
    'Email tracking',
    'Task and ticket management',
    'Custom properties',
    'List segmentation',
  ],

  useCases: [
    'Lead capture and nurturing',
    'Sales pipeline automation',
    'Contact syncing across platforms',
    'Deal stage notifications',
    'Customer onboarding flows',
    'Support ticket creation',
    'Marketing campaign tracking',
    'Revenue reporting',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create HubSpot Developer Account',
      description: 'Sign up at developers.hubspot.com if you haven\'t already.',
    },
    {
      step: 2,
      title: 'Create an App',
      description: 'In your developer account, create a new app to get OAuth credentials.',
    },
    {
      step: 3,
      title: 'Configure Scopes',
      description: 'Select the required scopes: crm.objects.contacts, crm.objects.deals, crm.objects.companies.',
      note: 'Only request scopes you actually need.',
    },
    {
      step: 4,
      title: 'Add Redirect URI',
      description: 'Add AgentForge\'s OAuth callback URL to your app settings.',
    },
    {
      step: 5,
      title: 'Copy Credentials',
      description: 'Copy the Client ID and Client Secret from your app\'s Auth settings.',
    },
    {
      step: 6,
      title: 'Configure in AgentForge',
      description: 'Enter credentials in Integrations > HubSpot and complete OAuth flow.',
    },
  ],
  requiredScopes: [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.objects.deals.read',
    'crm.objects.deals.write',
    'crm.objects.companies.read',
  ],

  operations: [
    {
      name: 'Create Contact',
      description: 'Create a new contact in HubSpot',
      fields: [
        { name: 'email', type: 'string', required: true, description: 'Contact email address' },
        { name: 'firstname', type: 'string', required: false, description: 'First name' },
        { name: 'lastname', type: 'string', required: false, description: 'Last name' },
        { name: 'phone', type: 'string', required: false, description: 'Phone number' },
        { name: 'company', type: 'string', required: false, description: 'Company name' },
        { name: 'properties', type: 'json', required: false, description: 'Additional custom properties' },
      ],
    },
    {
      name: 'Get Contact',
      description: 'Retrieve a contact by ID or email',
      fields: [
        { name: 'id', type: 'string', required: false, description: 'Contact ID' },
        { name: 'email', type: 'string', required: false, description: 'Contact email' },
        { name: 'properties', type: 'array', required: false, description: 'Properties to return' },
      ],
    },
    {
      name: 'Create Deal',
      description: 'Create a new deal in pipeline',
      fields: [
        { name: 'dealname', type: 'string', required: true, description: 'Deal name' },
        { name: 'pipeline', type: 'string', required: true, description: 'Pipeline ID' },
        { name: 'dealstage', type: 'string', required: true, description: 'Stage ID' },
        { name: 'amount', type: 'number', required: false, description: 'Deal amount' },
        { name: 'closedate', type: 'date', required: false, description: 'Expected close date' },
        { name: 'hubspot_owner_id', type: 'string', required: false, description: 'Deal owner' },
      ],
    },
    {
      name: 'Update Deal Stage',
      description: 'Move a deal to a different stage',
      fields: [
        { name: 'deal_id', type: 'string', required: true, description: 'Deal ID' },
        { name: 'dealstage', type: 'string', required: true, description: 'New stage ID' },
      ],
    },
    {
      name: 'Create Company',
      description: 'Create a new company record',
      fields: [
        { name: 'name', type: 'string', required: true, description: 'Company name' },
        { name: 'domain', type: 'string', required: false, description: 'Company website domain' },
        { name: 'industry', type: 'string', required: false, description: 'Industry type' },
        { name: 'phone', type: 'string', required: false, description: 'Company phone' },
      ],
    },
    {
      name: 'Associate Records',
      description: 'Link contacts to companies or deals',
      fields: [
        { name: 'from_object', type: 'string', required: true, description: 'Source object type' },
        { name: 'from_id', type: 'string', required: true, description: 'Source record ID' },
        { name: 'to_object', type: 'string', required: true, description: 'Target object type' },
        { name: 'to_id', type: 'string', required: true, description: 'Target record ID' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Contact Created',
      description: 'Triggers when a new contact is created',
      when: 'New contact added to CRM',
      outputFields: ['id', 'email', 'firstname', 'lastname', 'createdate', 'properties'],
    },
    {
      name: 'Deal Stage Changed',
      description: 'Triggers when a deal moves to a new stage',
      when: 'Deal stage is updated',
      outputFields: ['id', 'dealname', 'dealstage', 'pipeline', 'amount'],
    },
    {
      name: 'Form Submitted',
      description: 'Triggers when a HubSpot form is submitted',
      when: 'Form submission received',
      outputFields: ['email', 'form_id', 'submitted_at', 'values'],
    },
    {
      name: 'Deal Created',
      description: 'Triggers when a new deal is created',
      when: 'New deal in pipeline',
      outputFields: ['id', 'dealname', 'amount', 'pipeline', 'dealstage'],
    },
  ],

  actions: [
    {
      name: 'Create/Update Contact',
      description: 'Create or update a contact by email',
      inputFields: ['email', 'firstname', 'lastname', 'properties'],
      outputFields: ['id', 'email', 'createdate'],
    },
    {
      name: 'Add Contact to List',
      description: 'Add a contact to a static list',
      inputFields: ['contact_id', 'list_id'],
      outputFields: ['updated'],
    },
    {
      name: 'Create Task',
      description: 'Create a task associated with a record',
      inputFields: ['subject', 'body', 'due_date', 'owner_id', 'associations'],
      outputFields: ['id', 'subject'],
    },
    {
      name: 'Create Ticket',
      description: 'Create a support ticket',
      inputFields: ['subject', 'content', 'pipeline', 'status', 'priority'],
      outputFields: ['id', 'subject', 'status'],
    },
  ],

  examples: [
    {
      title: 'Lead Qualification Workflow',
      description: 'Automatically qualify and route leads',
      steps: [
        'Trigger: Form submitted on website',
        'Create contact in HubSpot',
        'Score lead based on form data',
        'Create deal if qualified (score > 50)',
        'Assign owner based on territory',
        'Send notification to sales rep',
      ],
      code: `{
  "properties": {
    "email": "{{form.email}}",
    "firstname": "{{form.firstName}}",
    "lastname": "{{form.lastName}}",
    "company": "{{form.company}}",
    "lead_source": "website_form",
    "lead_score": "{{calculated.score}}"
  }
}`,
    },
    {
      title: 'Deal Won Automation',
      description: 'Trigger actions when a deal closes',
      steps: [
        'Trigger: Deal stage changed to "Closed Won"',
        'Create invoice in accounting system',
        'Add customer to onboarding sequence',
        'Update contact lifecycle stage',
        'Notify customer success team',
      ],
    },
  ],

  commonIssues: [
    {
      problem: 'Contact already exists',
      cause: 'Trying to create a contact with existing email.',
      solution: 'Use "Create/Update" operation or search first to check existence.',
    },
    {
      problem: 'Invalid property',
      cause: 'Property name doesn\'t exist in HubSpot.',
      solution: 'Create the custom property in HubSpot settings first.',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'Too many API calls in 10-second window.',
      solution: 'Implement rate limiting. Free accounts: 100/10s, Paid: 150/10s.',
    },
    {
      problem: 'Missing associations',
      cause: 'Trying to associate non-existent records.',
      solution: 'Ensure both records exist before creating association.',
    },
  ],

  relatedIntegrations: ['salesforce', 'pipedrive', 'mailchimp'],
  externalResources: [
    { title: 'HubSpot API Reference', url: 'https://developers.hubspot.com/docs/api/crm/contacts' },
    { title: 'Property Guide', url: 'https://developers.hubspot.com/docs/api/crm/properties' },
  ],
};

export const salesforceIntegration: Integration = {
  id: 'salesforce',
  name: 'Salesforce',
  description: 'Use the Salesforce node to manage leads, contacts, accounts, and opportunities in the world\'s leading CRM. n8n supports SOQL queries, record management, and custom object handling.',
  shortDescription: 'Enterprise CRM and sales management',
  category: 'crm',
  icon: 'salesforce',
  color: '#00A1E0',
  website: 'https://salesforce.com',
  documentationUrl: 'https://developer.salesforce.com/docs',

  features: [
    'Lead and opportunity management',
    'Account and contact handling',
    'Custom object support',
    'SOQL query execution',
    'Bulk data operations',
    'Field-level security respect',
    'Workflow and process builder',
    'Multi-object relationships',
  ],

  useCases: [
    'Enterprise sales automation',
    'Lead scoring and routing',
    'Account-based marketing',
    'Opportunity pipeline management',
    'Customer 360 data sync',
    'Quote and proposal generation',
    'Service case management',
    'Commission calculation',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Connected App',
      description: 'In Salesforce Setup, go to Apps > App Manager and create a new Connected App.',
    },
    {
      step: 2,
      title: 'Enable OAuth',
      description: 'Check "Enable OAuth Settings" and add callback URL.',
    },
    {
      step: 3,
      title: 'Select OAuth Scopes',
      description: 'Add required scopes: api, refresh_token, offline_access.',
      note: 'Full access scope simplifies permissions but follows least privilege.',
    },
    {
      step: 4,
      title: 'Configure Policies',
      description: 'Set OAuth policies (IP relaxation, refresh token policy).',
    },
    {
      step: 5,
      title: 'Get Consumer Credentials',
      description: 'Copy Consumer Key (Client ID) and Consumer Secret.',
    },
    {
      step: 6,
      title: 'Wait for Propagation',
      description: 'Wait 2-10 minutes for the connected app to propagate.',
    },
    {
      step: 7,
      title: 'Configure in AgentForge',
      description: 'Enter credentials and specify your Salesforce instance URL.',
    },
  ],
  requiredScopes: ['api', 'refresh_token', 'offline_access'],

  operations: [
    {
      name: 'Create Record',
      description: 'Create any Salesforce object record',
      fields: [
        { name: 'sobject', type: 'string', required: true, description: 'Object type (Lead, Contact, Account, etc.)' },
        { name: 'fields', type: 'json', required: true, description: 'Field values as key-value pairs' },
      ],
    },
    {
      name: 'Update Record',
      description: 'Update an existing record',
      fields: [
        { name: 'sobject', type: 'string', required: true, description: 'Object type' },
        { name: 'id', type: 'string', required: true, description: 'Record ID (18-char)' },
        { name: 'fields', type: 'json', required: true, description: 'Fields to update' },
      ],
    },
    {
      name: 'Execute SOQL Query',
      description: 'Run a Salesforce Object Query',
      fields: [
        { name: 'query', type: 'string', required: true, description: 'SOQL query string' },
      ],
    },
    {
      name: 'Upsert Record',
      description: 'Insert or update based on external ID',
      fields: [
        { name: 'sobject', type: 'string', required: true, description: 'Object type' },
        { name: 'external_id_field', type: 'string', required: true, description: 'External ID field name' },
        { name: 'external_id_value', type: 'string', required: true, description: 'External ID value' },
        { name: 'fields', type: 'json', required: true, description: 'Field values' },
      ],
    },
    {
      name: 'Delete Record',
      description: 'Delete a record by ID',
      fields: [
        { name: 'sobject', type: 'string', required: true, description: 'Object type' },
        { name: 'id', type: 'string', required: true, description: 'Record ID' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Record Created',
      description: 'Triggers when a record is created',
      when: 'New record in specified object',
      outputFields: ['Id', 'Name', 'CreatedDate', 'all_fields'],
    },
    {
      name: 'Record Updated',
      description: 'Triggers when a record is modified',
      when: 'Record field changes',
      outputFields: ['Id', 'Name', 'LastModifiedDate', 'changed_fields'],
    },
    {
      name: 'Opportunity Stage Changed',
      description: 'Triggers on opportunity stage change',
      when: 'Opportunity moves to new stage',
      outputFields: ['Id', 'Name', 'StageName', 'Amount', 'CloseDate'],
    },
  ],

  actions: [
    {
      name: 'Create Lead',
      description: 'Create a new lead record',
      inputFields: ['FirstName', 'LastName', 'Company', 'Email', 'Phone', 'LeadSource'],
      outputFields: ['Id', 'success'],
    },
    {
      name: 'Convert Lead',
      description: 'Convert lead to account, contact, opportunity',
      inputFields: ['LeadId', 'AccountId', 'OpportunityName', 'DoNotCreateOpportunity'],
      outputFields: ['AccountId', 'ContactId', 'OpportunityId'],
    },
    {
      name: 'Close Opportunity',
      description: 'Mark opportunity as closed won/lost',
      inputFields: ['Id', 'StageName', 'CloseDate'],
      outputFields: ['Id', 'success'],
    },
  ],

  examples: [
    {
      title: 'Lead to Account Sync',
      description: 'Sync web leads to Salesforce',
      steps: [
        'Trigger: New signup on website',
        'Check if lead exists by email (SOQL)',
        'Create or update lead record',
        'Assign to sales queue based on region',
        'Create task for follow-up',
      ],
      code: `{
  "sobject": "Lead",
  "fields": {
    "FirstName": "{{form.firstName}}",
    "LastName": "{{form.lastName}}",
    "Company": "{{form.company}}",
    "Email": "{{form.email}}",
    "LeadSource": "Web",
    "Status": "New"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'INVALID_SESSION_ID',
      cause: 'Session expired or token revoked.',
      solution: 'Reconnect the Salesforce integration to refresh OAuth tokens.',
    },
    {
      problem: 'REQUIRED_FIELD_MISSING',
      cause: 'Required field not provided in request.',
      solution: 'Check object metadata for required fields.',
    },
    {
      problem: 'MALFORMED_QUERY',
      cause: 'SOQL syntax error.',
      solution: 'Validate query in Developer Console before using.',
    },
    {
      problem: 'INSUFFICIENT_ACCESS',
      cause: 'User lacks permission to access object or field.',
      solution: 'Check profile permissions and field-level security.',
    },
  ],

  relatedIntegrations: ['hubspot', 'pipedrive', 'zendesk'],
  externalResources: [
    { title: 'Salesforce REST API', url: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/' },
    { title: 'SOQL Reference', url: 'https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/' },
  ],
};

export const pipedriveIntegration: Integration = {
  id: 'pipedrive',
  name: 'Pipedrive',
  description: 'Use the Pipedrive node to manage your sales pipeline, deals, contacts, and activities. n8n supports the full Pipedrive CRM API for sales-focused automation.',
  shortDescription: 'Sales CRM and pipeline management',
  category: 'crm',
  icon: 'pipedrive',
  color: '#00C65E',
  website: 'https://pipedrive.com',
  documentationUrl: 'https://developers.pipedrive.com/docs/api/v1',

  features: [
    'Deal pipeline management',
    'Person and organization handling',
    'Activity tracking',
    'Product catalog',
    'Custom fields',
    'Email integration',
    'Sales forecasting',
    'Goal tracking',
  ],

  useCases: [
    'Sales pipeline automation',
    'Lead management',
    'Activity scheduling',
    'Deal tracking',
    'Sales reporting',
    'Quote generation',
    'Win/loss analysis',
    'Team performance tracking',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Log into Pipedrive',
      description: 'Sign in to your Pipedrive account.',
    },
    {
      step: 2,
      title: 'Go to Personal Preferences',
      description: 'Click your profile icon > Personal preferences > API.',
    },
    {
      step: 3,
      title: 'Generate API Token',
      description: 'Copy your personal API token or generate a new one.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter the API token in Integrations > Pipedrive.',
    },
  ],

  operations: [
    {
      name: 'Create Deal',
      description: 'Create a new deal in pipeline',
      fields: [
        { name: 'title', type: 'string', required: true, description: 'Deal title' },
        { name: 'value', type: 'number', required: false, description: 'Deal value' },
        { name: 'currency', type: 'string', required: false, description: 'Currency code' },
        { name: 'stage_id', type: 'number', required: false, description: 'Pipeline stage ID' },
        { name: 'person_id', type: 'number', required: false, description: 'Associated person' },
        { name: 'org_id', type: 'number', required: false, description: 'Associated organization' },
      ],
    },
    {
      name: 'Update Deal Stage',
      description: 'Move deal to different stage',
      fields: [
        { name: 'id', type: 'number', required: true, description: 'Deal ID' },
        { name: 'stage_id', type: 'number', required: true, description: 'New stage ID' },
      ],
    },
    {
      name: 'Create Person',
      description: 'Add a new person/contact',
      fields: [
        { name: 'name', type: 'string', required: true, description: 'Person\'s name' },
        { name: 'email', type: 'string', required: false, description: 'Email address' },
        { name: 'phone', type: 'string', required: false, description: 'Phone number' },
        { name: 'org_id', type: 'number', required: false, description: 'Organization ID' },
      ],
    },
    {
      name: 'Create Activity',
      description: 'Schedule an activity (call, meeting, etc.)',
      fields: [
        { name: 'subject', type: 'string', required: true, description: 'Activity subject' },
        { name: 'type', type: 'string', required: true, description: 'call, meeting, task, email' },
        { name: 'due_date', type: 'date', required: true, description: 'Due date' },
        { name: 'deal_id', type: 'number', required: false, description: 'Related deal' },
        { name: 'person_id', type: 'number', required: false, description: 'Related person' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Deal Created',
      description: 'Triggers when a new deal is added',
      when: 'New deal in any pipeline',
      outputFields: ['id', 'title', 'value', 'stage_id', 'person_id'],
    },
    {
      name: 'Deal Stage Changed',
      description: 'Triggers when deal moves stages',
      when: 'Deal stage_id changes',
      outputFields: ['id', 'title', 'old_stage', 'new_stage'],
    },
    {
      name: 'Deal Won',
      description: 'Triggers when a deal is marked as won',
      when: 'Deal status = won',
      outputFields: ['id', 'title', 'value', 'won_time'],
    },
    {
      name: 'Activity Completed',
      description: 'Triggers when an activity is marked done',
      when: 'Activity done = true',
      outputFields: ['id', 'subject', 'type', 'deal_id'],
    },
  ],

  actions: [
    {
      name: 'Create Deal',
      description: 'Add a new deal to pipeline',
      inputFields: ['title', 'value', 'person_id', 'org_id', 'stage_id'],
      outputFields: ['id', 'title', 'add_time'],
    },
    {
      name: 'Mark Activity Done',
      description: 'Complete an activity',
      inputFields: ['id'],
      outputFields: ['id', 'done'],
    },
    {
      name: 'Win Deal',
      description: 'Mark deal as won',
      inputFields: ['id'],
      outputFields: ['id', 'status', 'won_time'],
    },
  ],

  examples: [
    {
      title: 'Automatic Follow-up Activities',
      description: 'Create follow-ups when deals are created',
      steps: [
        'Trigger: New deal created',
        'Create "Discovery Call" activity for tomorrow',
        'Create "Send Proposal" activity for 3 days later',
        'Notify assigned user via Slack',
      ],
    },
  ],

  commonIssues: [
    {
      problem: 'Invalid API token',
      cause: 'Token expired or regenerated.',
      solution: 'Generate a new API token in Pipedrive settings.',
    },
    {
      problem: 'Stage not found',
      cause: 'Using incorrect stage ID.',
      solution: 'Get valid stage IDs from Pipedrive API or use stage name lookup.',
    },
    {
      problem: 'Duplicate person',
      cause: 'Person with same email already exists.',
      solution: 'Search for person first or use merge endpoint.',
    },
  ],

  relatedIntegrations: ['hubspot', 'salesforce', 'slack'],
  externalResources: [
    { title: 'Pipedrive API Docs', url: 'https://developers.pipedrive.com/docs/api/v1' },
  ],
};

export const zohoIntegration: Integration = {
  id: 'zoho',
  name: 'Zoho CRM',
  description: 'Use the Zoho CRM node to manage leads, contacts, accounts, and deals. n8n supports full CRM automation with Zoho\'s comprehensive API.',
  shortDescription: 'Complete CRM solution',
  category: 'crm',
  icon: 'zoho',
  color: '#D32F2F',
  website: 'https://zoho.com/crm',
  documentationUrl: 'https://www.zoho.com/crm/developer/docs/api/v2/',

  features: [
    'Lead management',
    'Contact management',
    'Deal tracking',
    'Account management',
    'Custom modules',
    'Workflow automation',
    'Blueprint processes',
    'Analytics and reports',
  ],

  useCases: [
    'Lead capture',
    'Sales automation',
    'Contact syncing',
    'Pipeline management',
    'Customer service',
    'Marketing automation',
    'Inventory tracking',
    'Project management',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Zoho Developer Account',
      description: 'Go to api-console.zoho.com and create an account.',
    },
    {
      step: 2,
      title: 'Create Client',
      description: 'Create a new client (Server-based Applications).',
    },
    {
      step: 3,
      title: 'Configure Scopes',
      description: 'Add required scopes: ZohoCRM.modules.ALL, ZohoCRM.settings.ALL.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter Client ID, Secret, and authorize.',
    },
  ],

  operations: [
    {
      name: 'Create Record',
      description: 'Create a record in any module',
      fields: [
        { name: 'module', type: 'select', required: true, description: 'Leads, Contacts, Accounts, Deals' },
        { name: 'data', type: 'json', required: true, description: 'Record data' },
        { name: 'trigger', type: 'array', required: false, description: 'Workflow triggers' },
      ],
    },
    {
      name: 'Search Records',
      description: 'Search records with criteria',
      fields: [
        { name: 'module', type: 'select', required: true, description: 'Module to search' },
        { name: 'criteria', type: 'string', required: true, description: 'Search criteria' },
        { name: 'fields', type: 'array', required: false, description: 'Fields to return' },
      ],
    },
    {
      name: 'Update Record',
      description: 'Update an existing record',
      fields: [
        { name: 'module', type: 'select', required: true, description: 'Module name' },
        { name: 'id', type: 'string', required: true, description: 'Record ID' },
        { name: 'data', type: 'json', required: true, description: 'Update data' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Record Created',
      description: 'Triggers when record is created',
      when: 'New record in module',
      outputFields: ['id', 'module', 'data', 'created_time'],
    },
    {
      name: 'Record Updated',
      description: 'Triggers on record update',
      when: 'Record modified',
      outputFields: ['id', 'module', 'modified_fields'],
    },
  ],

  actions: [
    {
      name: 'Convert Lead',
      description: 'Convert lead to contact/account/deal',
      inputFields: ['lead_id', 'deal_data'],
      outputFields: ['contact_id', 'account_id', 'deal_id'],
    },
  ],

  examples: [
    {
      title: 'Lead to Deal Conversion',
      description: 'Auto-convert qualified leads',
      steps: [
        'Trigger: Lead score reaches threshold',
        'Get lead details',
        'Convert to Contact and Deal',
        'Assign to sales rep',
      ],
      code: `{
  "data": [{
    "Lead": "{{lead.id}}",
    "Deals": {
      "Deal_Name": "{{lead.Company}} - New Deal",
      "Stage": "Qualification",
      "Amount": {{lead.Estimated_Value}},
      "Closing_Date": "{{addDays(now(), 30)}}"
    },
    "carry_over_tags": true
  }]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Invalid OAuth token',
      cause: 'Refresh token expired (90 days).',
      solution: 'Re-authorize the connection to get new tokens.',
    },
    {
      problem: 'Duplicate check failed',
      cause: 'Record with same unique field exists.',
      solution: 'Use search before create or upsert operation.',
    },
  ],

  relatedIntegrations: ['hubspot', 'salesforce', 'freshsales'],
  externalResources: [
    { title: 'Zoho CRM API', url: 'https://www.zoho.com/crm/developer/docs/api/v2/' },
  ],
};

export const freshsalesIntegration: Integration = {
  id: 'freshsales',
  name: 'Freshsales',
  description: 'Use the Freshsales node to manage leads, contacts, accounts, and deals. n8n supports sales automation with Freshworks CRM.',
  shortDescription: 'AI-powered sales CRM',
  category: 'crm',
  icon: 'freshsales',
  color: '#F26522',
  website: 'https://freshsales.io',
  documentationUrl: 'https://developers.freshsales.io',

  features: [
    'Lead management',
    'Contact scoring',
    'Deal pipeline',
    'Email tracking',
    'Phone integration',
    'AI insights',
    'Sales sequences',
    'Territory management',
  ],

  useCases: [
    'Lead capture',
    'Sales automation',
    'Pipeline management',
    'Contact engagement',
    'Deal tracking',
    'Sales reporting',
    'Team collaboration',
    'Revenue forecasting',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Get API Key',
      description: 'Go to Settings > API Settings and generate an API key.',
    },
    {
      step: 2,
      title: 'Get Bundle Alias',
      description: 'Note your Freshsales domain (yourcompany.freshsales.io).',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter domain and API key.',
    },
  ],

  operations: [
    {
      name: 'Create Lead',
      description: 'Create a new lead',
      fields: [
        { name: 'email', type: 'string', required: true, description: 'Lead email' },
        { name: 'first_name', type: 'string', required: false, description: 'First name' },
        { name: 'last_name', type: 'string', required: false, description: 'Last name' },
        { name: 'company', type: 'string', required: false, description: 'Company name' },
        { name: 'custom_fields', type: 'json', required: false, description: 'Custom field values' },
      ],
    },
    {
      name: 'Create Deal',
      description: 'Create a new deal',
      fields: [
        { name: 'name', type: 'string', required: true, description: 'Deal name' },
        { name: 'amount', type: 'number', required: true, description: 'Deal amount' },
        { name: 'sales_account_id', type: 'number', required: false, description: 'Account ID' },
        { name: 'deal_stage_id', type: 'number', required: true, description: 'Stage ID' },
      ],
    },
    {
      name: 'Update Contact',
      description: 'Update contact details',
      fields: [
        { name: 'id', type: 'number', required: true, description: 'Contact ID' },
        { name: 'data', type: 'json', required: true, description: 'Update data' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Lead Created',
      description: 'Triggers on new lead',
      when: 'New lead created',
      outputFields: ['id', 'email', 'first_name', 'last_name', 'lead_score'],
    },
    {
      name: 'Deal Stage Changed',
      description: 'Triggers on deal stage change',
      when: 'Deal moves to new stage',
      outputFields: ['id', 'name', 'old_stage', 'new_stage'],
    },
  ],

  actions: [
    {
      name: 'Convert Lead',
      description: 'Convert lead to contact',
      inputFields: ['lead_id'],
      outputFields: ['contact_id', 'account_id'],
    },
  ],

  examples: [
    {
      title: 'Lead Scoring Automation',
      description: 'Auto-assign leads based on score',
      steps: [
        'Trigger: Lead score updated',
        'Check if score exceeds threshold',
        'Assign to senior sales rep',
        'Create follow-up task',
      ],
      code: `{
  "lead": {
    "id": {{lead.id}},
    "owner_id": {{high_value_rep_id}},
    "lead_stage_id": {{qualified_stage_id}}
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'API key invalid',
      cause: 'Key regenerated or incorrect domain.',
      solution: 'Verify domain and regenerate API key if needed.',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'Too many API requests.',
      solution: 'Implement request throttling.',
    },
  ],

  relatedIntegrations: ['zoho', 'hubspot', 'pipedrive'],
  externalResources: [
    { title: 'Freshsales API', url: 'https://developers.freshsales.io/api/' },
  ],
};
