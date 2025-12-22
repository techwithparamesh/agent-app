import { IntegrationDoc } from './types';

export const automationDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ZAPIER
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'zapier',
    name: 'Zapier',
    icon: '⚡',
    category: 'automation',
    shortDescription: 'Connect to 5000+ apps via Zapier webhooks',
    overview: {
      what: 'Zapier integration allows your AI agent to trigger Zapier workflows (Zaps), connecting to over 5000 applications without coding.',
      why: 'Zapier is the universal connector. If an app isn\'t directly integrated, Zapier probably supports it. Extend your agent\'s capabilities infinitely.',
      useCases: [
        'Connect to niche applications',
        'Multi-step workflows',
        'Data transformation',
        'Cross-platform automation',
        'Legacy system integration',
        'Custom business logic',
      ],
      targetAudience: 'Users who need to connect their AI agent to apps not directly integrated, or create complex multi-step workflows.',
    },
    prerequisites: {
      accounts: [
        'Zapier account (free tier available)',
      ],
      permissions: [
        'Ability to create Zaps',
        'Webhook trigger access',
      ],
      preparations: [
        'Plan your workflow',
        'Know which apps you want to connect',
        'Have those app accounts ready',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Log into Zapier',
        description: 'Go to zapier.com and log into your account.',
        screenshot: 'Zapier – Dashboard',
      },
      {
        step: 2,
        title: 'Create New Zap',
        description: 'Click "Create Zap" or "+ Create" button.',
        screenshot: 'Zapier – Create Zap',
      },
      {
        step: 3,
        title: 'Choose Webhook Trigger',
        description: 'Search for "Webhooks by Zapier" and select "Catch Hook" as the trigger.',
        screenshot: 'Zapier – Webhooks Trigger',
      },
      {
        step: 4,
        title: 'Copy Webhook URL',
        description: 'Zapier will generate a unique webhook URL. Copy this URL.',
        screenshot: 'Zapier – Copy Webhook URL',
        tip: 'This URL is unique to your Zap. Keep it secure.',
      },
      {
        step: 5,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → Zapier. Paste the webhook URL.',
        screenshot: 'AgentForge – Zapier Integration Form',
      },
      {
        step: 6,
        title: 'Test the Trigger',
        description: 'Click "Test Connection" in AgentForge. Return to Zapier and click "Test trigger".',
        screenshot: 'Zapier – Test Trigger',
      },
      {
        step: 7,
        title: 'Add Action Steps',
        description: 'In Zapier, add the apps and actions you want to trigger. Use the data from the webhook.',
        screenshot: 'Zapier – Add Actions',
      },
      {
        step: 8,
        title: 'Publish Zap',
        description: 'Once configured, click "Publish" to activate your Zap.',
        screenshot: 'Zapier – Publish Zap',
      },
    ],
    triggers: [
      {
        id: 'webhook_trigger',
        name: 'Webhook Trigger',
        description: 'Zapier is typically used as an action (outbound). For inbound triggers, use Zapier\'s "Webhooks by Zapier" app in your Zap to send data back.',
        whenItFires: 'When Zapier sends data back via webhook.',
        exampleScenario: 'When a Salesforce record is created, Zapier triggers your agent.',
        dataProvided: ['Custom data from Zapier workflow'],
      },
    ],
    actions: [
      {
        id: 'trigger_zap',
        name: 'Trigger Zap',
        description: 'Send data to a Zapier webhook to trigger a Zap.',
        whenToUse: 'To connect to any of Zapier\'s 5000+ integrated apps.',
        requiredFields: ['Webhook URL'],
        optionalFields: ['Custom data payload (JSON)'],
        example: 'Trigger Zap to add lead to Salesforce, send Slack notification, and create Trello card.',
      },
    ],
    exampleFlow: {
      title: 'Multi-App Workflow',
      scenario: 'Capture lead and update multiple systems.',
      steps: [
        'Customer provides contact info via chatbot',
        'AI Agent captures name, email, company',
        'Zapier action sends data to webhook',
        'Zap Step 1: Add contact to Mailchimp',
        'Zap Step 2: Create lead in Salesforce',
        'Zap Step 3: Send notification to Slack',
        'Zap Step 4: Add row to Google Sheet',
      ],
    },
    troubleshooting: [
      {
        error: 'Webhook not triggering',
        cause: 'Zap is not published or webhook URL is wrong.',
        solution: 'Ensure Zap is published (turned ON). Verify webhook URL is correct.',
      },
      {
        error: 'Data not appearing in Zap',
        cause: 'Data format mismatch or Zap not tested with sample data.',
        solution: 'Send test data first, then configure Zap fields using that sample.',
      },
      {
        error: 'Zap task errors',
        cause: 'Problem with connected app or missing required fields.',
        solution: 'Check Zap history for error details. Fix the specific step that failed.',
      },
    ],
    bestPractices: [
      'Always test with sample data first',
      'Name your Zaps clearly',
      'Use Zapier\'s built-in filters to reduce task usage',
      'Monitor task usage to stay within limits',
      'Use Paths for conditional logic',
      'Document your Zaps for team reference',
      'Use Formatter steps for data transformation',
    ],
    faq: [
      {
        question: 'How much does Zapier cost?',
        answer: 'Free tier: 100 tasks/month, 5 Zaps. Paid plans start at $19.99/month for more tasks and features.',
      },
      {
        question: 'What counts as a task?',
        answer: 'Each successful action step counts as one task. Multi-step Zaps use multiple tasks.',
      },
      {
        question: 'Can I receive data from Zapier?',
        answer: 'Yes, use "Webhooks by Zapier" action in your Zap to POST data back to AgentForge.',
      },
      {
        question: 'Is there a delay in Zapier?',
        answer: 'Free tier: 15-minute polling. Paid: 1-2 minutes. Webhooks are instant.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAKE (INTEGROMAT)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'make',
    name: 'Make (Integromat)',
    icon: '🔄',
    category: 'automation',
    shortDescription: 'Trigger Make scenarios via webhook',
    overview: {
      what: 'Make (formerly Integromat) integration enables your AI agent to trigger complex automation scenarios with visual workflow builder.',
      why: 'Make offers more powerful data transformation and complex logic than other automation tools, with a visual builder.',
      useCases: [
        'Complex multi-step workflows',
        'Data aggregation and transformation',
        'Conditional branching',
        'Error handling workflows',
        'Scheduled operations',
        'API orchestration',
      ],
      targetAudience: 'Users who need powerful automation with complex logic, data transformation, and visual workflow design.',
    },
    prerequisites: {
      accounts: [
        'Make account (free tier available)',
      ],
      permissions: [
        'Ability to create scenarios',
        'Webhook module access',
      ],
      preparations: [
        'Plan your automation scenario',
        'Have connected app accounts ready',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Log into Make',
        description: 'Go to make.com and log into your account.',
        screenshot: 'Make – Dashboard',
      },
      {
        step: 2,
        title: 'Create New Scenario',
        description: 'Click "Create a new scenario".',
        screenshot: 'Make – New Scenario',
      },
      {
        step: 3,
        title: 'Add Webhook Module',
        description: 'Click the + button, search for "Webhooks", select "Custom webhook".',
        screenshot: 'Make – Add Webhook',
      },
      {
        step: 4,
        title: 'Create Webhook',
        description: 'Click "Add" to create a new webhook. Name it (e.g., "AgentForge Trigger").',
        screenshot: 'Make – Create Webhook',
      },
      {
        step: 5,
        title: 'Copy Webhook URL',
        description: 'Copy the generated webhook URL.',
        screenshot: 'Make – Copy URL',
      },
      {
        step: 6,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → Make. Paste the webhook URL.',
        screenshot: 'AgentForge – Make Integration Form',
      },
      {
        step: 7,
        title: 'Determine Data Structure',
        description: 'Click "Test Connection" in AgentForge. In Make, click "Re-determine data structure".',
        screenshot: 'Make – Determine Structure',
        tip: 'This teaches Make what data to expect from your agent.',
      },
      {
        step: 8,
        title: 'Build Your Scenario',
        description: 'Add more modules to your scenario and map data from the webhook.',
        screenshot: 'Make – Build Scenario',
      },
      {
        step: 9,
        title: 'Activate Scenario',
        description: 'Turn on the scenario using the toggle at the bottom.',
        screenshot: 'Make – Activate',
      },
    ],
    triggers: [
      {
        id: 'webhook_response',
        name: 'Webhook Response',
        description: 'Make can send data back via webhook response or separate webhook call.',
        whenItFires: 'When Make scenario completes and sends response.',
        exampleScenario: 'Make fetches data from API and returns processed results.',
        dataProvided: ['Custom response data from scenario'],
      },
    ],
    actions: [
      {
        id: 'trigger_scenario',
        name: 'Trigger Scenario',
        description: 'Send data to Make webhook to start a scenario.',
        whenToUse: 'For complex automations requiring data transformation or multiple steps.',
        requiredFields: ['Webhook URL'],
        optionalFields: ['Custom data payload'],
        example: 'Trigger scenario to fetch customer data, process it, and update multiple systems.',
      },
    ],
    exampleFlow: {
      title: 'Data Processing Flow',
      scenario: 'Process and route lead data to multiple systems.',
      steps: [
        'Customer submits inquiry via chatbot',
        'AI Agent sends data to Make webhook',
        'Make Router: Check customer location',
        'Branch 1 (US): Add to US CRM, notify US team',
        'Branch 2 (EU): Add to EU CRM, notify EU team',
        'Both: Send confirmation email, log to analytics',
      ],
    },
    troubleshooting: [
      {
        error: 'Scenario not running',
        cause: 'Scenario is not activated.',
        solution: 'Toggle the scenario ON in Make dashboard.',
      },
      {
        error: 'Data structure error',
        cause: 'Webhook received different data than expected.',
        solution: 'Re-determine data structure after sending new test data.',
      },
      {
        error: 'Operation limit reached',
        cause: 'Exceeded monthly operation limit.',
        solution: 'Upgrade plan or optimize scenarios to use fewer operations.',
      },
    ],
    bestPractices: [
      'Use routers for conditional logic',
      'Add error handlers to scenarios',
      'Use aggregators for batch processing',
      'Schedule non-urgent scenarios',
      'Test thoroughly before activating',
      'Monitor execution history',
      'Use data stores for persistence',
    ],
    faq: [
      {
        question: 'What\'s an operation in Make?',
        answer: 'Each module execution counts as one operation. A 5-module scenario uses 5 operations per run.',
      },
      {
        question: 'How is Make different from Zapier?',
        answer: 'Make offers more complex logic (routers, iterators, aggregators), visual builder, and often better pricing for high-volume use.',
      },
      {
        question: 'Can scenarios run on schedule?',
        answer: 'Yes, you can set scenarios to run at specific intervals or times.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // N8N
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'n8n',
    name: 'n8n',
    icon: '🔗',
    category: 'automation',
    shortDescription: 'Trigger n8n workflows',
    overview: {
      what: 'n8n integration connects your AI agent to this powerful, self-hostable workflow automation tool with 200+ integrations.',
      why: 'n8n is open-source and self-hostable, giving you full control. No operation limits mean unlimited automation.',
      useCases: [
        'Self-hosted automation',
        'Complex workflow logic',
        'Custom code integration',
        'Data privacy-focused workflows',
        'Developer-friendly automation',
        'Internal tool integration',
      ],
      targetAudience: 'Technical users and organizations who want self-hosted, code-extensible automation with no operation limits.',
    },
    prerequisites: {
      accounts: [
        'n8n instance (self-hosted or n8n.cloud)',
      ],
      permissions: [
        'Workflow creation rights',
        'Webhook node access',
      ],
      preparations: [
        'Set up n8n instance',
        'Plan your workflow',
        'Ensure webhook endpoint is accessible',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Access n8n',
        description: 'Open your n8n instance (self-hosted or n8n.cloud).',
        screenshot: 'n8n – Dashboard',
      },
      {
        step: 2,
        title: 'Create New Workflow',
        description: 'Click "New Workflow" or the + button.',
        screenshot: 'n8n – New Workflow',
      },
      {
        step: 3,
        title: 'Add Webhook Node',
        description: 'Click + to add a node, search for "Webhook" and add it.',
        screenshot: 'n8n – Add Webhook',
      },
      {
        step: 4,
        title: 'Configure Webhook',
        description: 'Set HTTP Method to POST. Note the webhook URL shown.',
        screenshot: 'n8n – Webhook Config',
        tip: 'For production, use "Production URL" not "Test URL".',
      },
      {
        step: 5,
        title: 'Copy Webhook URL',
        description: 'Copy the production webhook URL.',
        screenshot: 'n8n – Copy URL',
      },
      {
        step: 6,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → n8n. Paste the webhook URL.',
        screenshot: 'AgentForge – n8n Integration Form',
      },
      {
        step: 7,
        title: 'Build Workflow',
        description: 'Add more nodes to process the incoming data.',
        screenshot: 'n8n – Build Workflow',
      },
      {
        step: 8,
        title: 'Activate Workflow',
        description: 'Toggle the workflow to Active.',
        screenshot: 'n8n – Activate',
      },
    ],
    triggers: [
      {
        id: 'webhook_response',
        name: 'Workflow Response',
        description: 'n8n can return data via the Respond to Webhook node.',
        whenItFires: 'When workflow completes and sends response.',
        exampleScenario: 'Workflow processes request and returns result to agent.',
        dataProvided: ['Custom response from workflow'],
      },
    ],
    actions: [
      {
        id: 'trigger_workflow',
        name: 'Trigger Workflow',
        description: 'Send data to n8n webhook to start a workflow.',
        whenToUse: 'For self-hosted automation without operation limits.',
        requiredFields: ['Webhook URL'],
        optionalFields: ['Custom data payload'],
        example: 'Trigger workflow to process customer data through internal systems.',
      },
    ],
    exampleFlow: {
      title: 'Internal Systems Flow',
      scenario: 'Update multiple internal systems.',
      steps: [
        'Customer requests information via chat',
        'AI Agent sends request to n8n',
        'n8n queries internal database',
        'n8n processes and formats data',
        'n8n updates CRM and logs activity',
        'n8n returns response to agent',
        'Agent sends formatted response to customer',
      ],
    },
    troubleshooting: [
      {
        error: 'Webhook not reachable',
        cause: 'Self-hosted n8n not exposed to internet.',
        solution: 'Use ngrok, Cloudflare Tunnel, or proper hosting with SSL.',
      },
      {
        error: 'Workflow not triggering',
        cause: 'Workflow not activated or using test URL.',
        solution: 'Ensure workflow is active and using production URL.',
      },
      {
        error: 'Authentication failed',
        cause: 'Webhook authentication configured but not provided.',
        solution: 'Add authentication headers if webhook requires them.',
      },
    ],
    bestPractices: [
      'Use production URLs not test URLs',
      'Add error handling nodes',
      'Use IF nodes for conditional logic',
      'Add Respond to Webhook for sync responses',
      'Monitor executions regularly',
      'Back up your workflows',
      'Use environment variables for secrets',
    ],
    faq: [
      {
        question: 'Is n8n free?',
        answer: 'n8n is open-source and free to self-host. n8n.cloud offers managed hosting with free and paid tiers.',
      },
      {
        question: 'Can I write custom code?',
        answer: 'Yes! n8n has Code nodes for JavaScript and Python.',
      },
      {
        question: 'What\'s the difference from Zapier/Make?',
        answer: 'n8n is self-hostable, open-source, has no operation limits, and allows custom code.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IFTTT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ifttt',
    name: 'IFTTT',
    icon: '🔀',
    category: 'automation',
    shortDescription: 'Trigger IFTTT applets',
    overview: {
      what: 'IFTTT (If This Then That) integration lets your AI agent trigger simple automations across 700+ services.',
      why: 'IFTTT excels at simple, single-action automations. Great for smart home, social media, and consumer app integrations.',
      useCases: [
        'Smart home automation',
        'Social media posting',
        'IoT device control',
        'Simple notifications',
        'Consumer app connections',
        'Location-based triggers',
      ],
      targetAudience: 'Users needing simple automations for consumer apps, smart home devices, and social media.',
    },
    prerequisites: {
      accounts: [
        'IFTTT account',
      ],
      permissions: [
        'Webhooks service enabled',
      ],
      preparations: [
        'Get your IFTTT Webhooks key',
        'Create applets using Webhooks trigger',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Log into IFTTT',
        description: 'Go to ifttt.com and log into your account.',
        screenshot: 'IFTTT – Dashboard',
      },
      {
        step: 2,
        title: 'Go to Webhooks Service',
        description: 'Search for "Webhooks" service and click on it.',
        screenshot: 'IFTTT – Webhooks Service',
      },
      {
        step: 3,
        title: 'Get Documentation',
        description: 'Click "Documentation" to see your unique webhook key.',
        screenshot: 'IFTTT – Webhooks Documentation',
      },
      {
        step: 4,
        title: 'Copy Webhook Key',
        description: 'Copy your unique webhook key from the URL shown.',
        screenshot: 'IFTTT – Webhook Key',
        tip: 'The key is the long string after /use/ in the URL.',
      },
      {
        step: 5,
        title: 'Create an Applet',
        description: 'Click "Create" → Choose Webhooks as "If This" trigger → Set an event name.',
        screenshot: 'IFTTT – Create Applet',
      },
      {
        step: 6,
        title: 'Configure Action',
        description: 'Choose "Then That" action (e.g., send notification, post to social media).',
        screenshot: 'IFTTT – Configure Action',
      },
      {
        step: 7,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → IFTTT. Enter your webhook key and event name.',
        screenshot: 'AgentForge – IFTTT Integration Form',
      },
    ],
    triggers: [
      {
        id: 'none',
        name: 'Outbound Only',
        description: 'IFTTT webhooks are typically used to trigger applets, not receive data.',
        whenItFires: 'N/A - Used for triggering IFTTT applets.',
        exampleScenario: 'Trigger applet when customer completes purchase.',
        dataProvided: [],
      },
    ],
    actions: [
      {
        id: 'trigger_applet',
        name: 'Trigger Applet',
        description: 'Trigger an IFTTT applet via webhook.',
        whenToUse: 'For simple automations with consumer apps and smart devices.',
        requiredFields: ['Event name'],
        optionalFields: ['Value1', 'Value2', 'Value3'],
        example: 'Trigger applet to turn on smart light when VIP customer messages.',
      },
    ],
    exampleFlow: {
      title: 'Smart Notification Flow',
      scenario: 'Flash smart light for VIP customer messages.',
      steps: [
        'VIP customer sends message',
        'AI Agent detects VIP status',
        'IFTTT action triggers "vip_message" event',
        'IFTTT applet receives trigger',
        'Smart light flashes specific color',
        'Team knows VIP needs attention',
      ],
    },
    troubleshooting: [
      {
        error: 'Applet not triggering',
        cause: 'Event name mismatch or applet not active.',
        solution: 'Verify event name matches exactly. Ensure applet is enabled.',
      },
      {
        error: 'Values not passing through',
        cause: 'Incorrect value field configuration.',
        solution: 'Use value1, value2, value3 in your applet\'s ingredient fields.',
      },
      {
        error: 'Webhook key invalid',
        cause: 'Key was regenerated.',
        solution: 'Get new key from Webhooks documentation page.',
      },
    ],
    bestPractices: [
      'Use clear event names',
      'Test applets before relying on them',
      'Use value fields for dynamic data',
      'Combine with other tools for complex needs',
      'Monitor applet activity',
      'Keep applets simple and focused',
    ],
    faq: [
      {
        question: 'Is IFTTT free?',
        answer: 'IFTTT offers a free tier with limited applets. Pro plans allow unlimited applets and faster execution.',
      },
      {
        question: 'How many values can I send?',
        answer: 'IFTTT webhooks support 3 values: value1, value2, and value3.',
      },
      {
        question: 'Can I receive data from IFTTT?',
        answer: 'IFTTT can send webhooks as actions. Create an applet with Webhooks as the action to send data.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // POWER AUTOMATE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'power_automate',
    name: 'Power Automate',
    icon: '⚙️',
    category: 'automation',
    shortDescription: 'Trigger Microsoft Power Automate flows',
    overview: {
      what: 'Power Automate integration enables your AI agent to trigger Microsoft\'s automation platform, ideal for Microsoft 365 environments.',
      why: 'Power Automate integrates deeply with Microsoft ecosystem. Perfect for organizations using Teams, SharePoint, Dynamics, and Office 365.',
      useCases: [
        'Microsoft 365 automation',
        'SharePoint workflows',
        'Dynamics 365 integration',
        'Teams notifications',
        'Office document automation',
        'Business process automation',
      ],
      targetAudience: 'Organizations using Microsoft 365 who want to automate business processes across Microsoft ecosystem.',
    },
    prerequisites: {
      accounts: [
        'Microsoft 365 account with Power Automate license',
      ],
      permissions: [
        'Flow creation rights',
        'Premium connectors (for HTTP triggers)',
      ],
      preparations: [
        'Access Power Automate portal',
        'Have target Microsoft services ready',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Go to Power Automate',
        description: 'Visit flow.microsoft.com and sign in with your Microsoft account.',
        screenshot: 'Power Automate – Homepage',
      },
      {
        step: 2,
        title: 'Create New Flow',
        description: 'Click "Create" → "Instant cloud flow" (or Automated).',
        screenshot: 'Power Automate – Create Flow',
      },
      {
        step: 3,
        title: 'Choose HTTP Trigger',
        description: 'Search for "When a HTTP request is received" and select it.',
        screenshot: 'Power Automate – HTTP Trigger',
        tip: 'This requires a premium license.',
      },
      {
        step: 4,
        title: 'Define Request Body',
        description: 'Optionally define a JSON schema for the expected request body.',
        screenshot: 'Power Automate – Request Schema',
      },
      {
        step: 5,
        title: 'Save to Get URL',
        description: 'Save the flow. The HTTP POST URL will be generated.',
        screenshot: 'Power Automate – Generated URL',
      },
      {
        step: 6,
        title: 'Copy Webhook URL',
        description: 'Copy the generated HTTP POST URL.',
        screenshot: 'Power Automate – Copy URL',
        warning: 'This URL contains a secret key. Keep it secure.',
      },
      {
        step: 7,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → Power Automate. Paste the URL.',
        screenshot: 'AgentForge – Power Automate Integration Form',
      },
      {
        step: 8,
        title: 'Add Actions',
        description: 'Add actions to your flow (send email, create item, notify Teams, etc.).',
        screenshot: 'Power Automate – Add Actions',
      },
    ],
    triggers: [
      {
        id: 'http_response',
        name: 'Flow Response',
        description: 'Power Automate can send HTTP response back.',
        whenItFires: 'When flow completes and returns response.',
        exampleScenario: 'Flow processes request and returns confirmation.',
        dataProvided: ['Custom response data'],
      },
    ],
    actions: [
      {
        id: 'trigger_flow',
        name: 'Trigger Flow',
        description: 'Send HTTP request to trigger a Power Automate flow.',
        whenToUse: 'For Microsoft 365 automation and business processes.',
        requiredFields: ['Flow URL'],
        optionalFields: ['Request body (JSON)'],
        example: 'Trigger flow to create SharePoint item and send Teams notification.',
      },
    ],
    exampleFlow: {
      title: 'Microsoft 365 Integration Flow',
      scenario: 'Create document and notify team.',
      steps: [
        'Customer requests proposal via chat',
        'AI Agent collects requirements',
        'Power Automate action triggers flow',
        'Flow creates Word document from template',
        'Flow saves to SharePoint',
        'Flow sends Teams notification with link',
        'Sales rep downloads and customizes proposal',
      ],
    },
    troubleshooting: [
      {
        error: 'Flow not triggering',
        cause: 'Flow is turned off or URL is incorrect.',
        solution: 'Ensure flow is turned on. Verify URL is complete.',
      },
      {
        error: 'HTTP trigger requires premium',
        cause: 'HTTP triggers need premium connector license.',
        solution: 'Upgrade to premium Power Automate license.',
      },
      {
        error: 'Unauthorized',
        cause: 'URL expired or regenerated.',
        solution: 'Get new URL from flow trigger settings.',
      },
    ],
    bestPractices: [
      'Define JSON schema for better data handling',
      'Add response action for synchronous flows',
      'Use variables for complex logic',
      'Add error handling (Try-Catch)',
      'Monitor flow runs regularly',
      'Use child flows for reusability',
      'Set appropriate timeouts',
    ],
    faq: [
      {
        question: 'Do I need premium license?',
        answer: 'HTTP triggers require premium connectors. Many other triggers work with standard license.',
      },
      {
        question: 'Can I use with on-premises systems?',
        answer: 'Yes, via on-premises data gateway.',
      },
      {
        question: 'What\'s the difference from Logic Apps?',
        answer: 'Power Automate is for end-users; Logic Apps is for developers (Azure-based).',
      },
    ],
  },
];
