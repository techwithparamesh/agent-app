import type { Integration } from './types';

// Automation Platform Integrations

export const makeIntegration: Integration = {
  id: 'make',
  name: 'Make (Integromat)',
  description: 'Use the Make node to trigger scenarios and exchange data with Make automation platform. n8n supports webhook triggers and actions.',
  shortDescription: 'Visual automation platform',
  category: 'developer',
  icon: 'make',
  color: '#6D00CC',
  website: 'https://make.com',
  documentationUrl: 'https://www.make.com/en/api-documentation',

  features: [
    'Webhook triggers',
    'Scenario execution',
    'Data exchange',
    'Error handling',
    'Scheduling',
    'Multi-step workflows',
    'App connections',
    'Data transformation',
  ],

  useCases: [
    'Cross-platform automation',
    'Legacy system integration',
    'Complex workflows',
    'Data sync',
    'Notification routing',
    'Process automation',
    'API orchestration',
    'Backup workflows',
  ],

  credentialType: 'webhook',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Make Scenario',
      description: 'Create a new scenario in Make with a Webhooks module.',
    },
    {
      step: 2,
      title: 'Get Webhook URL',
      description: 'Copy the webhook URL from the Webhooks module.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter the webhook URL to trigger Make scenarios.',
    },
  ],

  operations: [
    {
      name: 'Trigger Scenario',
      description: 'Send data to trigger a Make scenario',
      fields: [
        { name: 'webhook_url', type: 'string', required: true, description: 'Make webhook URL' },
        { name: 'data', type: 'json', required: true, description: 'Data to send' },
      ],
    },
  ],

  triggers: [
    {
      name: 'From Make',
      description: 'Receive data from Make scenario',
      when: 'Make sends webhook',
      outputFields: ['data'],
    },
  ],

  actions: [
    {
      name: 'Execute Scenario',
      description: 'Trigger Make scenario via webhook',
      inputFields: ['webhook_url', 'data'],
      outputFields: ['status', 'response'],
    },
  ],

  examples: [
    {
      title: 'Data Sync Pipeline',
      description: 'Sync data across multiple platforms via Make',
      steps: [
        'Trigger: Data updated in source system',
        'Send to Make webhook',
        'Make routes to multiple destinations',
        'Log sync status',
      ],
      code: `{
  "webhook_url": "https://hook.make.com/xxxxx",
  "data": {
    "action": "sync_customer",
    "customer": {
      "id": "{{customer.id}}",
      "email": "{{customer.email}}",
      "name": "{{customer.name}}",
      "updated_at": "{{now()}}"
    }
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Webhook not responding',
      cause: 'Scenario is not active.',
      solution: 'Ensure the scenario is turned on in Make.',
    },
    {
      problem: 'Data not received',
      cause: 'Webhook expecting specific structure.',
      solution: 'Check the data structure expected by the Webhooks module.',
    },
  ],

  relatedIntegrations: ['zapier', 'n8n', 'power-automate'],
  externalResources: [
    { title: 'Make API Docs', url: 'https://www.make.com/en/api-documentation' },
  ],
};

export const n8nIntegration: Integration = {
  id: 'n8n',
  name: 'n8n',
  description: 'Use the n8n node to trigger workflows and exchange data with n8n instances. Perfect for distributed automation architectures.',
  shortDescription: 'Open-source workflow automation',
  category: 'developer',
  icon: 'n8n',
  color: '#EA4B71',
  website: 'https://n8n.io',
  documentationUrl: 'https://docs.n8n.io',

  features: [
    'Webhook triggers',
    'Workflow execution',
    'Self-hosted support',
    'Open source',
    'Custom nodes',
    'Error workflows',
    'Credential sharing',
    'Sub-workflows',
  ],

  useCases: [
    'Distributed automation',
    'Self-hosted workflows',
    'Complex data processing',
    'Custom integrations',
    'Enterprise automation',
    'Microservice orchestration',
    'Event-driven workflows',
    'Data pipelines',
  ],

  credentialType: 'webhook',
  credentialSteps: [
    {
      step: 1,
      title: 'Create n8n Workflow',
      description: 'Create a workflow with Webhook trigger node.',
    },
    {
      step: 2,
      title: 'Get Webhook URL',
      description: 'Copy the Production or Test webhook URL.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter the webhook URL to trigger n8n workflows.',
    },
  ],

  operations: [
    {
      name: 'Trigger Workflow',
      description: 'Send data to trigger n8n workflow',
      fields: [
        { name: 'webhook_url', type: 'string', required: true, description: 'n8n webhook URL' },
        { name: 'data', type: 'json', required: true, description: 'Data payload' },
        { name: 'method', type: 'select', required: false, description: 'HTTP method' },
      ],
    },
  ],

  triggers: [
    {
      name: 'From n8n',
      description: 'Receive data from n8n workflow',
      when: 'n8n sends webhook',
      outputFields: ['body', 'headers', 'query'],
    },
  ],

  actions: [
    {
      name: 'Execute Workflow',
      description: 'Trigger n8n workflow',
      inputFields: ['webhook_url', 'data'],
      outputFields: ['status', 'data'],
    },
  ],

  examples: [
    {
      title: 'Sub-Workflow Execution',
      description: 'Call specialized n8n workflows',
      steps: [
        'Trigger: Main process needs specialized handling',
        'Send to n8n specialized workflow',
        'n8n processes and returns result',
        'Continue main workflow',
      ],
      code: `{
  "webhook_url": "https://n8n.company.com/webhook/xxx",
  "method": "POST",
  "data": {
    "task": "process_document",
    "document_url": "{{document.url}}",
    "options": {
      "extract_text": true,
      "generate_summary": true
    }
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Webhook inactive',
      cause: 'Workflow not activated.',
      solution: 'Activate the workflow in n8n to enable production webhook.',
    },
    {
      problem: 'Authentication required',
      cause: 'Webhook configured with authentication.',
      solution: 'Include required authentication headers.',
    },
  ],

  relatedIntegrations: ['make', 'zapier', 'webhooks'],
  externalResources: [
    { title: 'n8n Documentation', url: 'https://docs.n8n.io' },
  ],
};

export const iftttIntegration: Integration = {
  id: 'ifttt',
  name: 'IFTTT',
  description: 'Use the IFTTT node to trigger applets and send data via Webhooks. n8n supports the IFTTT Maker/Webhooks service.',
  shortDescription: 'If This Then That automation',
  category: 'developer',
  icon: 'ifttt',
  color: '#000000',
  website: 'https://ifttt.com',
  documentationUrl: 'https://ifttt.com/docs',

  features: [
    'Webhook triggers',
    'Applet execution',
    'Event sending',
    'Value passing',
    'Consumer IoT',
    'Smart home control',
    'Social media',
    'Notification routing',
  ],

  useCases: [
    'Smart home automation',
    'Social media posting',
    'Notification routing',
    'IoT device control',
    'Personal automation',
    'Cross-service triggers',
    'Simple workflows',
    'Consumer integrations',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Webhooks Key',
      description: 'Go to ifttt.com/maker_webhooks and click Documentation.',
    },
    {
      step: 2,
      title: 'Copy Key',
      description: 'Copy your unique Webhooks key from the documentation page.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter your IFTTT Webhooks key.',
    },
  ],

  operations: [
    {
      name: 'Trigger Event',
      description: 'Trigger an IFTTT applet',
      fields: [
        { name: 'event_name', type: 'string', required: true, description: 'Event name' },
        { name: 'value1', type: 'string', required: false, description: 'Value 1' },
        { name: 'value2', type: 'string', required: false, description: 'Value 2' },
        { name: 'value3', type: 'string', required: false, description: 'Value 3' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Send Event',
      description: 'Trigger IFTTT applet',
      inputFields: ['event_name', 'value1', 'value2', 'value3'],
      outputFields: ['success'],
    },
  ],

  examples: [
    {
      title: 'Smart Home Alert',
      description: 'Turn on lights when alert triggered',
      steps: [
        'Trigger: Security alert detected',
        'Send event to IFTTT',
        'IFTTT turns on smart lights',
        'Send notification to phone',
      ],
      code: `{
  "event_name": "security_alert",
  "value1": "{{alert.type}}",
  "value2": "{{alert.location}}",
  "value3": "{{formatDate(now())}}"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Event not triggering',
      cause: 'Event name mismatch.',
      solution: 'Ensure event name exactly matches the applet trigger.',
    },
    {
      problem: 'Applet disabled',
      cause: 'IFTTT applet turned off.',
      solution: 'Check applet status in IFTTT.',
    },
  ],

  relatedIntegrations: ['zapier', 'make'],
  externalResources: [
    { title: 'IFTTT Webhooks', url: 'https://ifttt.com/maker_webhooks' },
  ],
};

export const powerAutomateIntegration: Integration = {
  id: 'power-automate',
  name: 'Power Automate',
  description: 'Use the Power Automate node to trigger flows and exchange data with Microsoft Power Automate. Supports HTTP triggers and connectors.',
  shortDescription: 'Microsoft workflow automation',
  category: 'developer',
  icon: 'microsoft',
  color: '#0066FF',
  website: 'https://powerautomate.microsoft.com',
  documentationUrl: 'https://docs.microsoft.com/power-automate/',

  features: [
    'HTTP triggers',
    'Flow execution',
    'Microsoft 365 integration',
    'Dataverse connector',
    'Approval workflows',
    'AI Builder',
    'Desktop flows (RPA)',
    'Business process flows',
  ],

  useCases: [
    'Microsoft 365 automation',
    'Approval workflows',
    'Document processing',
    'Data collection',
    'Email automation',
    'SharePoint workflows',
    'Teams notifications',
    'Enterprise integration',
  ],

  credentialType: 'webhook',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Flow',
      description: 'Create a flow with "When HTTP request is received" trigger.',
    },
    {
      step: 2,
      title: 'Get HTTP POST URL',
      description: 'Save the flow to generate the HTTP POST URL.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter the flow HTTP POST URL.',
    },
  ],

  operations: [
    {
      name: 'Trigger Flow',
      description: 'Send data to trigger a Power Automate flow',
      fields: [
        { name: 'flow_url', type: 'string', required: true, description: 'Flow HTTP URL' },
        { name: 'data', type: 'json', required: true, description: 'Request body' },
      ],
    },
  ],

  triggers: [
    {
      name: 'From Power Automate',
      description: 'Receive data from Power Automate',
      when: 'Flow sends HTTP request',
      outputFields: ['body', 'headers'],
    },
  ],

  actions: [
    {
      name: 'Execute Flow',
      description: 'Trigger Power Automate flow',
      inputFields: ['flow_url', 'data'],
      outputFields: ['status', 'response'],
    },
  ],

  examples: [
    {
      title: 'SharePoint Document Processing',
      description: 'Process documents uploaded to SharePoint',
      steps: [
        'Trigger: Document uploaded',
        'Send to Power Automate',
        'Flow extracts data with AI Builder',
        'Returns structured data',
      ],
      code: `{
  "flow_url": "https://prod-xx.westus.logic.azure.com/workflows/xxx",
  "data": {
    "document_url": "{{sharepoint.file_url}}",
    "document_name": "{{sharepoint.file_name}}",
    "library": "{{sharepoint.library}}",
    "processing_options": {
      "extract_tables": true,
      "ocr": true
    }
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Flow not found',
      cause: 'URL expired or flow deleted.',
      solution: 'Regenerate HTTP URL by saving the flow again.',
    },
    {
      problem: 'Schema validation failed',
      cause: 'Request body doesn\'t match expected schema.',
      solution: 'Match the JSON schema defined in the HTTP trigger.',
    },
  ],

  relatedIntegrations: ['microsoft-teams', 'outlook', 'zapier'],
  externalResources: [
    { title: 'Power Automate Docs', url: 'https://docs.microsoft.com/power-automate/' },
  ],
};
