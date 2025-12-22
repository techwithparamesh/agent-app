import { IntegrationDoc } from './types';

export const crmDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // HUBSPOT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: '🧲',
    category: 'crm',
    shortDescription: 'Manage contacts, deals, and tickets in HubSpot CRM',
    overview: {
      what: 'HubSpot integration connects your AI agent to HubSpot CRM, allowing automatic contact creation, deal management, and ticket handling.',
      why: 'HubSpot is a leading CRM platform. Automatically sync conversation data, create leads, and manage your sales pipeline.',
      useCases: [
        'Auto-create contacts from conversations',
        'Update deal stages based on responses',
        'Create support tickets',
        'Sync conversation history',
        'Lead scoring updates',
        'Task creation for sales team',
      ],
      targetAudience: 'Sales and support teams using HubSpot CRM who want to automate data entry and pipeline management.',
    },
    prerequisites: {
      accounts: [
        'HubSpot account (free CRM available)',
      ],
      permissions: [
        'API key or Private App access',
        'CRM object access (Contacts, Deals, Tickets)',
      ],
      preparations: [
        'Set up your HubSpot pipeline stages',
        'Configure custom properties if needed',
        'Create a Private App for API access',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Log into HubSpot',
        description: 'Go to hubspot.com and log into your account.',
        screenshot: 'HubSpot – Dashboard',
      },
      {
        step: 2,
        title: 'Go to Private Apps',
        description: 'Click Settings (gear icon) → Integrations → Private Apps.',
        screenshot: 'HubSpot – Private Apps',
      },
      {
        step: 3,
        title: 'Create Private App',
        description: 'Click "Create a private app". Name it "AgentForge Integration".',
        screenshot: 'HubSpot – Create Private App',
      },
      {
        step: 4,
        title: 'Configure Scopes',
        description: 'Go to "Scopes" tab. Select: crm.objects.contacts.write, crm.objects.deals.write, crm.objects.tickets.write.',
        screenshot: 'HubSpot – Configure Scopes',
      },
      {
        step: 5,
        title: 'Create App',
        description: 'Click "Create app" and confirm. Copy the access token shown.',
        screenshot: 'HubSpot – Copy Access Token',
        warning: 'Save this token securely - you\'ll need it for AgentForge.',
      },
      {
        step: 6,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → HubSpot. Paste your access token and click "Connect".',
        screenshot: 'AgentForge – HubSpot Integration Form',
      },
      {
        step: 7,
        title: 'Test Connection',
        description: 'Click "Test Connection" to verify API access.',
        screenshot: 'AgentForge – HubSpot Test',
      },
    ],
    triggers: [
      {
        id: 'contact_created',
        name: 'Contact Created (via Webhook)',
        description: 'Fires when a new contact is created in HubSpot.',
        whenItFires: 'When contacts are added via any source.',
        exampleScenario: 'When new contact appears, send welcome WhatsApp message.',
        dataProvided: ['Contact ID', 'Email', 'Name', 'Phone', 'Custom properties'],
      },
      {
        id: 'deal_stage_changed',
        name: 'Deal Stage Changed',
        description: 'Fires when a deal moves to a different stage.',
        whenItFires: 'When deal stage is updated.',
        exampleScenario: 'When deal moves to "Proposal", send pricing document.',
        dataProvided: ['Deal ID', 'Deal name', 'New stage', 'Amount'],
      },
    ],
    actions: [
      {
        id: 'create_contact',
        name: 'Create Contact',
        description: 'Create a new contact in HubSpot CRM.',
        whenToUse: 'When capturing lead information from conversations.',
        requiredFields: ['Email or Phone'],
        optionalFields: ['First name', 'Last name', 'Company', 'Custom properties'],
        example: 'Create contact from WhatsApp lead with conversation notes.',
      },
      {
        id: 'update_contact',
        name: 'Update Contact',
        description: 'Update existing contact properties.',
        whenToUse: 'To add information gathered during conversation.',
        requiredFields: ['Contact ID or Email'],
        optionalFields: ['Any contact property'],
        example: 'Update contact with product interest from chat.',
      },
      {
        id: 'create_deal',
        name: 'Create Deal',
        description: 'Create a new deal in your pipeline.',
        whenToUse: 'When lead shows buying intent.',
        requiredFields: ['Deal name', 'Pipeline', 'Stage'],
        optionalFields: ['Amount', 'Close date', 'Associated contact'],
        example: 'Create deal when customer requests a quote.',
      },
      {
        id: 'create_ticket',
        name: 'Create Ticket',
        description: 'Create a support ticket.',
        whenToUse: 'When customer raises an issue.',
        requiredFields: ['Ticket name', 'Pipeline', 'Status'],
        optionalFields: ['Description', 'Priority', 'Associated contact'],
        example: 'Create ticket for unresolved customer issues.',
      },
    ],
    exampleFlow: {
      title: 'Lead Qualification Flow',
      scenario: 'Qualify lead from conversation and create deal.',
      steps: [
        'Customer asks about enterprise pricing via chat',
        'AI Agent qualifies lead (budget, timeline, authority)',
        'HubSpot action creates/updates contact with info',
        'AI detects high intent from responses',
        'HubSpot action creates deal in "Qualified" stage',
        'Sales rep receives notification in HubSpot',
      ],
    },
    troubleshooting: [
      {
        error: 'Invalid access token',
        cause: 'Token expired or was regenerated.',
        solution: 'Generate new token in HubSpot Private Apps and update.',
      },
      {
        error: 'Contact already exists',
        cause: 'Email already in CRM.',
        solution: 'Use search first, then update or create. Or use "Update" action.',
      },
      {
        error: 'Property does not exist',
        cause: 'Using custom property that wasn\'t created.',
        solution: 'Create the property in HubSpot Settings → Properties first.',
      },
    ],
    bestPractices: [
      'Always search before creating to avoid duplicates',
      'Use lifecycle stages to track lead progress',
      'Associate contacts with deals and tickets',
      'Log conversation summaries in notes',
      'Set up lead scoring based on engagement',
      'Use custom properties for specific data points',
    ],
    faq: [
      {
        question: 'Is HubSpot CRM free?',
        answer: 'Yes, HubSpot offers a free CRM with unlimited contacts. Paid tiers add features.',
      },
      {
        question: 'Can I use API key instead of Private App?',
        answer: 'HubSpot deprecated API keys. Private Apps are now required for new integrations.',
      },
      {
        question: 'How do I avoid duplicate contacts?',
        answer: 'Search by email first. HubSpot also has built-in deduplication tools.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SALESFORCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '☁️',
    category: 'crm',
    shortDescription: 'Sync with Salesforce CRM',
    overview: {
      what: 'Salesforce integration connects your AI agent to the world\'s #1 CRM platform, enabling automated lead management and data sync.',
      why: 'Salesforce powers enterprise sales teams globally. Keep your CRM updated automatically with conversation data.',
      useCases: [
        'Lead creation from conversations',
        'Opportunity management',
        'Case creation for support',
        'Account updates',
        'Activity logging',
        'Custom object operations',
      ],
      targetAudience: 'Enterprise sales and support teams using Salesforce who need automated CRM data entry.',
    },
    prerequisites: {
      accounts: [
        'Salesforce account (any edition)',
      ],
      permissions: [
        'API Enabled permission',
        'Object-level permissions for Leads, Contacts, etc.',
      ],
      preparations: [
        'Enable API access in your org',
        'Create a Connected App',
        'Note your instance URL',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Log into Salesforce',
        description: 'Go to your Salesforce instance and log in.',
        screenshot: 'Salesforce – Login',
      },
      {
        step: 2,
        title: 'Go to App Manager',
        description: 'Setup → Apps → App Manager → New Connected App.',
        screenshot: 'Salesforce – App Manager',
      },
      {
        step: 3,
        title: 'Configure Connected App',
        description: 'Enter app name, enable OAuth, add callback URL, select scopes (Full access or specific).',
        screenshot: 'Salesforce – Connected App Setup',
      },
      {
        step: 4,
        title: 'Get Consumer Credentials',
        description: 'After saving, click "Manage Consumer Details". Copy Consumer Key and Secret.',
        screenshot: 'Salesforce – Consumer Credentials',
      },
      {
        step: 5,
        title: 'Note Instance URL',
        description: 'Copy your Salesforce instance URL (e.g., https://yourcompany.my.salesforce.com).',
        screenshot: 'Salesforce – Instance URL',
      },
      {
        step: 6,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → Salesforce. Enter instance URL and OAuth credentials.',
        screenshot: 'AgentForge – Salesforce Integration Form',
      },
      {
        step: 7,
        title: 'Authorize',
        description: 'Click "Connect" to authorize via OAuth. Grant permissions when prompted.',
        screenshot: 'Salesforce – OAuth Authorization',
      },
    ],
    triggers: [
      {
        id: 'lead_created',
        name: 'Lead Created',
        description: 'Fires when a new lead is created.',
        whenItFires: 'When leads are added to Salesforce.',
        exampleScenario: 'When web lead created, send automated follow-up message.',
        dataProvided: ['Lead ID', 'Name', 'Email', 'Company', 'Status'],
      },
    ],
    actions: [
      {
        id: 'create_lead',
        name: 'Create Lead',
        description: 'Create a new lead in Salesforce.',
        whenToUse: 'When capturing new prospects.',
        requiredFields: ['Last Name', 'Company'],
        optionalFields: ['Email', 'Phone', 'Source', 'Custom fields'],
        example: 'Create lead from chatbot qualification conversation.',
      },
      {
        id: 'create_contact',
        name: 'Create Contact',
        description: 'Create a contact (usually linked to an Account).',
        whenToUse: 'For known customers or converted leads.',
        requiredFields: ['Last Name'],
        optionalFields: ['Account ID', 'Email', 'Phone'],
        example: 'Create contact after deal is won.',
      },
      {
        id: 'create_case',
        name: 'Create Case',
        description: 'Create a support case.',
        whenToUse: 'When customer needs support assistance.',
        requiredFields: ['Subject'],
        optionalFields: ['Description', 'Priority', 'Contact ID'],
        example: 'Create case for escalated support issues.',
      },
      {
        id: 'update_record',
        name: 'Update Record',
        description: 'Update any Salesforce record.',
        whenToUse: 'To modify existing records with new info.',
        requiredFields: ['Object type', 'Record ID'],
        optionalFields: ['Any field values'],
        example: 'Update lead status after conversation.',
      },
    ],
    exampleFlow: {
      title: 'Lead to Case Flow',
      scenario: 'Convert conversation into CRM records.',
      steps: [
        'Prospect inquires via WhatsApp',
        'AI qualifies and captures info',
        'Salesforce action creates Lead',
        'Customer asks support question',
        'Salesforce action creates Case linked to Lead',
        'Support rep sees full context in Salesforce',
      ],
    },
    troubleshooting: [
      {
        error: 'INVALID_SESSION_ID',
        cause: 'OAuth token expired.',
        solution: 'Re-authorize the Salesforce connection.',
      },
      {
        error: 'REQUIRED_FIELD_MISSING',
        cause: 'Missing required fields for the object.',
        solution: 'Check Salesforce field requirements. Last Name and Company are required for Leads.',
      },
      {
        error: 'INSUFFICIENT_ACCESS',
        cause: 'User lacks permissions for the object or operation.',
        solution: 'Check profile permissions in Salesforce Setup.',
      },
    ],
    bestPractices: [
      'Map conversation fields to Salesforce fields properly',
      'Use Lead conversion when appropriate',
      'Log activities for audit trail',
      'Set up assignment rules for lead routing',
      'Use validation rules carefully',
      'Consider Salesforce limits (API calls, storage)',
    ],
    faq: [
      {
        question: 'Which Salesforce edition do I need?',
        answer: 'Any edition with API access. Professional+ or add API to lower tiers.',
      },
      {
        question: 'What about Salesforce limits?',
        answer: 'Each edition has API call limits. Monitor usage in Setup → Company Information.',
      },
      {
        question: 'Can I update custom objects?',
        answer: 'Yes, you can create and update any object you have access to.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PIPEDRIVE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    icon: '🔧',
    category: 'crm',
    shortDescription: 'Manage deals and contacts in Pipedrive',
    overview: {
      what: 'Pipedrive integration enables your AI agent to manage your sales pipeline, create deals, and update contacts automatically.',
      why: 'Pipedrive is built for salespeople. Keep your pipeline updated in real-time with conversation outcomes.',
      useCases: [
        'Automatic deal creation',
        'Contact management',
        'Pipeline stage updates',
        'Activity scheduling',
        'Lead capture',
        'Notes and conversation logging',
      ],
      targetAudience: 'Sales teams using Pipedrive CRM who want automated pipeline management.',
    },
    prerequisites: {
      accounts: [
        'Pipedrive account',
      ],
      permissions: [
        'API access enabled',
        'Deal and contact permissions',
      ],
      preparations: [
        'Set up your pipeline stages',
        'Get your API token',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Log into Pipedrive',
        description: 'Go to pipedrive.com and log into your account.',
        screenshot: 'Pipedrive – Dashboard',
      },
      {
        step: 2,
        title: 'Go to Personal Preferences',
        description: 'Click your profile → Personal preferences.',
        screenshot: 'Pipedrive – Personal Preferences',
      },
      {
        step: 3,
        title: 'Find API Token',
        description: 'Scroll down to "API" section and copy your personal API token.',
        screenshot: 'Pipedrive – API Token',
        warning: 'Keep this token secure - it provides full access to your account.',
      },
      {
        step: 4,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → Pipedrive. Paste your API token.',
        screenshot: 'AgentForge – Pipedrive Integration Form',
      },
      {
        step: 5,
        title: 'Test Connection',
        description: 'Click "Test Connection" to verify API access.',
        screenshot: 'AgentForge – Pipedrive Test',
      },
    ],
    triggers: [
      {
        id: 'deal_created',
        name: 'Deal Created',
        description: 'Fires when a new deal is added.',
        whenItFires: 'When deals are created in Pipedrive.',
        exampleScenario: 'Send welcome message when new deal enters pipeline.',
        dataProvided: ['Deal ID', 'Title', 'Value', 'Stage', 'Person'],
      },
      {
        id: 'deal_updated',
        name: 'Deal Stage Changed',
        description: 'Fires when deal moves to different stage.',
        whenItFires: 'When deal stage is updated.',
        exampleScenario: 'Notify team when deal reaches negotiation stage.',
        dataProvided: ['Deal ID', 'New stage', 'Previous stage'],
      },
    ],
    actions: [
      {
        id: 'create_deal',
        name: 'Create Deal',
        description: 'Create a new deal in your pipeline.',
        whenToUse: 'When prospect shows buying intent.',
        requiredFields: ['Title'],
        optionalFields: ['Value', 'Currency', 'Stage', 'Person ID', 'Organization ID'],
        example: 'Create deal when customer requests pricing.',
      },
      {
        id: 'create_person',
        name: 'Create Person',
        description: 'Create a new contact (person).',
        whenToUse: 'When capturing lead information.',
        requiredFields: ['Name'],
        optionalFields: ['Email', 'Phone', 'Organization'],
        example: 'Create person from chatbot conversation.',
      },
      {
        id: 'update_deal',
        name: 'Update Deal',
        description: 'Update deal properties or move stages.',
        whenToUse: 'To reflect conversation outcomes.',
        requiredFields: ['Deal ID'],
        optionalFields: ['Title', 'Value', 'Stage', 'Status'],
        example: 'Move deal to "Proposal" after sending quote.',
      },
      {
        id: 'add_note',
        name: 'Add Note',
        description: 'Add a note to a deal, person, or organization.',
        whenToUse: 'To log conversation summaries.',
        requiredFields: ['Content', 'Entity type', 'Entity ID'],
        example: 'Add conversation summary as deal note.',
      },
    ],
    exampleFlow: {
      title: 'Sales Pipeline Flow',
      scenario: 'Move deal through pipeline based on conversation.',
      steps: [
        'Lead contacts via WhatsApp asking about product',
        'AI creates Person in Pipedrive',
        'AI qualifies lead and creates Deal',
        'Customer agrees to demo',
        'AI updates Deal to "Demo Scheduled" stage',
        'Sales rep sees deal ready in pipeline',
      ],
    },
    troubleshooting: [
      {
        error: 'Invalid API token',
        cause: 'Token was regenerated or expired.',
        solution: 'Get new API token from Pipedrive preferences.',
      },
      {
        error: 'Pipeline/Stage not found',
        cause: 'Using wrong pipeline or stage ID.',
        solution: 'Check pipeline configuration in Pipedrive settings.',
      },
      {
        error: 'Person/Organization not found',
        cause: 'Invalid ID or entity was deleted.',
        solution: 'Create new entity or verify ID exists.',
      },
    ],
    bestPractices: [
      'Create Person before Deal to link them',
      'Use consistent pipeline stages',
      'Add notes for conversation context',
      'Schedule activities for follow-ups',
      'Keep deal values updated',
      'Use filters to manage pipeline view',
    ],
    faq: [
      {
        question: 'Can I use multiple pipelines?',
        answer: 'Yes, specify the pipeline ID when creating deals.',
      },
      {
        question: 'How do I link contacts to deals?',
        answer: 'Create the Person first, then use their ID when creating the Deal.',
      },
      {
        question: 'Can I add custom fields?',
        answer: 'Yes, custom fields are supported. Use the field key when setting values.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ZOHO CRM
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'zoho_crm',
    name: 'Zoho CRM',
    icon: '📈',
    category: 'crm',
    shortDescription: 'Sync leads and contacts with Zoho CRM',
    overview: {
      what: 'Zoho CRM integration connects your AI agent to Zoho\'s comprehensive CRM platform for lead and contact management.',
      why: 'Zoho CRM offers powerful features at competitive pricing. Automate your sales data entry and pipeline management.',
      useCases: [
        'Lead creation from conversations',
        'Contact updates',
        'Deal management',
        'Task creation',
        'Module record operations',
        'Workflow triggers',
      ],
      targetAudience: 'Businesses using Zoho CRM who want automated lead capture and pipeline management.',
    },
    prerequisites: {
      accounts: [
        'Zoho CRM account',
        'Zoho API Console access',
      ],
      permissions: [
        'API access',
        'Module-level permissions',
      ],
      preparations: [
        'Register application in Zoho API Console',
        'Configure OAuth scopes',
        'Get client credentials',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Go to Zoho API Console',
        description: 'Visit api-console.zoho.com and sign in.',
        screenshot: 'Zoho API Console – Homepage',
      },
      {
        step: 2,
        title: 'Create Application',
        description: 'Click "Add Client" → "Server-based Applications".',
        screenshot: 'Zoho – Create Application',
      },
      {
        step: 3,
        title: 'Configure Application',
        description: 'Enter app name, homepage URL, and authorized redirect URI.',
        screenshot: 'Zoho – App Configuration',
      },
      {
        step: 4,
        title: 'Get Client Credentials',
        description: 'Copy the Client ID and Client Secret.',
        screenshot: 'Zoho – Client Credentials',
      },
      {
        step: 5,
        title: 'Generate Tokens',
        description: 'Generate authorization code and exchange for refresh token.',
        screenshot: 'Zoho – Token Generation',
      },
      {
        step: 6,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → Zoho CRM. Enter credentials.',
        screenshot: 'AgentForge – Zoho Integration Form',
      },
    ],
    triggers: [
      {
        id: 'lead_created',
        name: 'Lead Created',
        description: 'Fires when a new lead is added.',
        whenItFires: 'When leads are created in Zoho CRM.',
        exampleScenario: 'Send automated follow-up when web lead arrives.',
        dataProvided: ['Lead ID', 'Name', 'Email', 'Phone', 'Source'],
      },
    ],
    actions: [
      {
        id: 'create_lead',
        name: 'Create Lead',
        description: 'Create a new lead in Zoho CRM.',
        whenToUse: 'When capturing prospect information.',
        requiredFields: ['Last Name'],
        optionalFields: ['Company', 'Email', 'Phone', 'Source'],
        example: 'Create lead from chatbot conversation.',
      },
      {
        id: 'update_record',
        name: 'Update Record',
        description: 'Update any module record.',
        whenToUse: 'To modify existing records.',
        requiredFields: ['Module', 'Record ID'],
        optionalFields: ['Any field values'],
        example: 'Update lead status after qualification.',
      },
      {
        id: 'create_deal',
        name: 'Create Deal',
        description: 'Create a new deal/potential.',
        whenToUse: 'When lead converts to opportunity.',
        requiredFields: ['Deal Name', 'Stage'],
        optionalFields: ['Amount', 'Account', 'Contact'],
        example: 'Create deal when customer shows buying intent.',
      },
    ],
    exampleFlow: {
      title: 'Lead to Deal Flow',
      scenario: 'Convert chat lead to CRM deal.',
      steps: [
        'Visitor asks about services via chat',
        'AI collects contact information',
        'Zoho action creates Lead',
        'AI qualifies budget and timeline',
        'Zoho action creates Deal linked to Lead',
        'Sales team sees qualified opportunity',
      ],
    },
    troubleshooting: [
      {
        error: 'Invalid OAuth token',
        cause: 'Refresh token expired or revoked.',
        solution: 'Re-authorize the Zoho connection.',
      },
      {
        error: 'MANDATORY_NOT_FOUND',
        cause: 'Required field missing.',
        solution: 'Check Zoho module configuration for required fields.',
      },
      {
        error: 'API limit exceeded',
        cause: 'Hit daily API request limit.',
        solution: 'Upgrade Zoho plan or optimize API usage.',
      },
    ],
    bestPractices: [
      'Map all required fields correctly',
      'Use lookup fields for relationships',
      'Follow Zoho\'s API best practices',
      'Monitor API usage',
      'Set up proper lead sources',
      'Use tags for organization',
    ],
    faq: [
      {
        question: 'What are Zoho\'s API limits?',
        answer: 'Varies by edition. Free: 1000/day, Professional: 5000/day, Enterprise: 25000/day.',
      },
      {
        question: 'Can I access custom modules?',
        answer: 'Yes, custom modules are accessible via API with proper configuration.',
      },
      {
        question: 'How do I handle duplicates?',
        answer: 'Search before creating, or use Zoho\'s deduplication rules.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRESHSALES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'freshsales',
    name: 'Freshsales',
    icon: '🌱',
    category: 'crm',
    shortDescription: 'Manage Freshsales contacts and deals',
    overview: {
      what: 'Freshsales integration connects your AI agent to Freshworks\' CRM platform for contact and deal management.',
      why: 'Freshsales offers AI-powered lead scoring and intuitive interface. Automate your sales pipeline management.',
      useCases: [
        'Lead capture and scoring',
        'Contact management',
        'Deal creation',
        'Task assignments',
        'Activity logging',
        'Pipeline updates',
      ],
      targetAudience: 'Sales teams using Freshsales CRM who want automated data entry and pipeline management.',
    },
    prerequisites: {
      accounts: [
        'Freshsales account',
      ],
      permissions: [
        'API key access',
        'Contact and deal permissions',
      ],
      preparations: [
        'Get API key from settings',
        'Note your Freshsales domain',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Log into Freshsales',
        description: 'Go to your Freshsales account and log in.',
        screenshot: 'Freshsales – Dashboard',
      },
      {
        step: 2,
        title: 'Go to API Settings',
        description: 'Click your profile → Settings → API Settings.',
        screenshot: 'Freshsales – API Settings',
      },
      {
        step: 3,
        title: 'Copy API Key',
        description: 'Copy your API key from the settings page.',
        screenshot: 'Freshsales – Copy API Key',
      },
      {
        step: 4,
        title: 'Note Your Domain',
        description: 'Note your Freshsales domain (e.g., yourcompany.freshsales.io).',
        screenshot: 'Freshsales – Domain',
      },
      {
        step: 5,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → Freshsales. Enter API key and domain.',
        screenshot: 'AgentForge – Freshsales Integration Form',
      },
      {
        step: 6,
        title: 'Test Connection',
        description: 'Click "Test Connection" to verify.',
        screenshot: 'AgentForge – Freshsales Test',
      },
    ],
    triggers: [
      {
        id: 'lead_created',
        name: 'Lead Created',
        description: 'Fires when a new lead is added.',
        whenItFires: 'When leads are created in Freshsales.',
        exampleScenario: 'Notify sales rep when high-score lead arrives.',
        dataProvided: ['Lead ID', 'Name', 'Email', 'Score', 'Source'],
      },
    ],
    actions: [
      {
        id: 'create_lead',
        name: 'Create Lead',
        description: 'Create a new lead.',
        whenToUse: 'When capturing prospect information.',
        requiredFields: ['Email or Phone'],
        optionalFields: ['Name', 'Company', 'Source', 'Custom fields'],
        example: 'Create lead from chatbot conversation.',
      },
      {
        id: 'create_contact',
        name: 'Create Contact',
        description: 'Create a new contact.',
        whenToUse: 'For qualified leads or customers.',
        requiredFields: ['Email or Phone'],
        optionalFields: ['Name', 'Company', 'Account ID'],
        example: 'Create contact after lead qualification.',
      },
      {
        id: 'create_deal',
        name: 'Create Deal',
        description: 'Create a new deal.',
        whenToUse: 'When opportunity is identified.',
        requiredFields: ['Name'],
        optionalFields: ['Amount', 'Stage', 'Contact ID'],
        example: 'Create deal when customer requests proposal.',
      },
    ],
    exampleFlow: {
      title: 'Lead Scoring Flow',
      scenario: 'Capture and score leads automatically.',
      steps: [
        'Visitor engages with chatbot',
        'AI collects qualification data',
        'Freshsales action creates Lead',
        'Freshsales AI scores the lead',
        'High-score leads get priority notification',
        'Sales rep prioritizes hot leads',
      ],
    },
    troubleshooting: [
      {
        error: 'Invalid API key',
        cause: 'Key was revoked or expired.',
        solution: 'Generate new API key from Freshsales settings.',
      },
      {
        error: 'Domain not found',
        cause: 'Wrong domain specified.',
        solution: 'Verify your Freshsales domain URL.',
      },
      {
        error: 'Duplicate record',
        cause: 'Contact with same email exists.',
        solution: 'Search before creating or update existing.',
      },
    ],
    bestPractices: [
      'Use lead scoring for prioritization',
      'Link contacts to accounts',
      'Log activities for context',
      'Use tags for segmentation',
      'Set up territory management',
      'Monitor deal pipeline regularly',
    ],
    faq: [
      {
        question: 'Does Freshsales have a free tier?',
        answer: 'Yes, Freshsales offers a free tier with basic CRM features.',
      },
      {
        question: 'How does lead scoring work?',
        answer: 'Freshsales uses AI to score leads based on engagement and profile data.',
      },
      {
        question: 'Can I customize deal stages?',
        answer: 'Yes, deal stages are fully customizable in settings.',
      },
    ],
  },
];
