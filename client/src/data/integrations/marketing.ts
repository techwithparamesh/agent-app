import type { Integration } from './types';

// Marketing & Analytics Integrations

export const googleAnalyticsIntegration: Integration = {
  id: 'google-analytics',
  name: 'Google Analytics',
  description: 'Use the Google Analytics node to track events, retrieve reports, and manage properties. n8n supports GA4 with comprehensive reporting capabilities.',
  shortDescription: 'Web analytics and tracking',
  category: 'marketing',
  icon: 'google-analytics',
  color: '#F9AB00',
  website: 'https://analytics.google.com',
  documentationUrl: 'https://developers.google.com/analytics',

  features: [
    'Event tracking',
    'Pageview tracking',
    'User analytics',
    'Real-time reports',
    'Custom dimensions',
    'E-commerce tracking',
    'Audience insights',
    'Conversion tracking',
  ],

  useCases: [
    'Website analytics',
    'User behavior tracking',
    'Conversion optimization',
    'Marketing attribution',
    'A/B test analysis',
    'ROI measurement',
    'Audience segmentation',
    'Performance monitoring',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Google Cloud Project',
      description: 'Go to console.cloud.google.com and create a new project.',
    },
    {
      step: 2,
      title: 'Enable Analytics API',
      description: 'Enable the Google Analytics Data API and Admin API.',
    },
    {
      step: 3,
      title: 'Create OAuth Credentials',
      description: 'Create OAuth 2.0 credentials with appropriate redirect URI.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter Client ID and Secret, then authorize.',
    },
  ],

  operations: [
    {
      name: 'Send Event',
      description: 'Send custom event to GA4',
      fields: [
        { name: 'measurement_id', type: 'string', required: true, description: 'GA4 Measurement ID' },
        { name: 'client_id', type: 'string', required: true, description: 'Client ID' },
        { name: 'event_name', type: 'string', required: true, description: 'Event name' },
        { name: 'params', type: 'json', required: false, description: 'Event parameters' },
      ],
    },
    {
      name: 'Run Report',
      description: 'Get analytics report data',
      fields: [
        { name: 'property_id', type: 'string', required: true, description: 'GA4 Property ID' },
        { name: 'dimensions', type: 'array', required: false, description: 'Report dimensions' },
        { name: 'metrics', type: 'array', required: true, description: 'Report metrics' },
        { name: 'date_range', type: 'json', required: true, description: 'Date range for report' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Track Event',
      description: 'Send event to Google Analytics',
      inputFields: ['event_name', 'params'],
      outputFields: ['status'],
    },
  ],

  examples: [
    {
      title: 'Conversion Tracking',
      description: 'Track form submissions as conversions',
      steps: [
        'Trigger: Form submitted',
        'Extract form data and user info',
        'Send conversion event to GA4',
        'Log for attribution reporting',
      ],
      code: `{
  "measurement_id": "G-XXXXXXXXXX",
  "client_id": "{{session.client_id}}",
  "events": [{
    "name": "form_submit",
    "params": {
      "form_name": "{{form.name}}",
      "form_destination": "{{form.destination}}",
      "value": {{form.value || 0}}
    }
  }]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Events not appearing',
      cause: 'Events can take up to 24 hours to appear in reports.',
      solution: 'Use Real-time report to verify events immediately.',
    },
    {
      problem: 'Invalid measurement ID',
      cause: 'Using UA property ID instead of GA4.',
      solution: 'Use GA4 Measurement ID starting with G-.',
    },
  ],

  relatedIntegrations: ['google-ads', 'facebook-ads'],
  externalResources: [
    { title: 'GA4 API Reference', url: 'https://developers.google.com/analytics/devguides/reporting/data/v1' },
  ],
};

export const facebookAdsIntegration: Integration = {
  id: 'facebook-ads',
  name: 'Facebook Ads',
  description: 'Use the Facebook Ads node to manage campaigns, ad sets, and ads. n8n supports creating, updating, and analyzing Facebook advertising.',
  shortDescription: 'Facebook advertising management',
  category: 'marketing',
  icon: 'facebook',
  color: '#1877F2',
  website: 'https://facebook.com/business',
  documentationUrl: 'https://developers.facebook.com/docs/marketing-apis',

  features: [
    'Campaign management',
    'Ad set creation',
    'Ad creative',
    'Audience targeting',
    'Budget optimization',
    'Performance reporting',
    'Custom audiences',
    'Pixel events',
  ],

  useCases: [
    'Ad campaign automation',
    'Performance monitoring',
    'Budget management',
    'Audience sync',
    'Lead generation',
    'Retargeting campaigns',
    'A/B testing',
    'ROI analysis',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Facebook App',
      description: 'Go to developers.facebook.com and create a new app.',
    },
    {
      step: 2,
      title: 'Add Marketing API',
      description: 'Add the Marketing API product to your app.',
    },
    {
      step: 3,
      title: 'Generate Access Token',
      description: 'Generate a user access token with ads_management permissions.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter access token and ad account ID.',
    },
  ],

  operations: [
    {
      name: 'Create Campaign',
      description: 'Create a new ad campaign',
      fields: [
        { name: 'name', type: 'string', required: true, description: 'Campaign name' },
        { name: 'objective', type: 'select', required: true, description: 'Campaign objective' },
        { name: 'status', type: 'select', required: true, description: 'ACTIVE or PAUSED' },
        { name: 'budget', type: 'number', required: false, description: 'Daily budget in cents' },
      ],
    },
    {
      name: 'Get Insights',
      description: 'Get campaign performance data',
      fields: [
        { name: 'object_id', type: 'string', required: true, description: 'Campaign/AdSet/Ad ID' },
        { name: 'fields', type: 'array', required: true, description: 'Metrics to retrieve' },
        { name: 'date_preset', type: 'string', required: false, description: 'Date range preset' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Lead Received',
      description: 'Triggers when a lead form is submitted',
      when: 'Lead form submission',
      outputFields: ['lead_id', 'form_id', 'field_data', 'created_time'],
    },
  ],

  actions: [
    {
      name: 'Pause Campaign',
      description: 'Pause an active campaign',
      inputFields: ['campaign_id'],
      outputFields: ['id', 'effective_status'],
    },
  ],

  examples: [
    {
      title: 'Auto-pause Low Performers',
      description: 'Automatically pause ads with high CPA',
      steps: [
        'Trigger: Daily at 9 AM',
        'Get insights for all active ads',
        'Filter ads with CPA > $50',
        'Pause underperforming ads',
      ],
      code: `// Get ad insights
GET /{{ad_account_id}}/ads?fields=id,name,insights{cost_per_action_type}

// Pause ad with high CPA
POST /{{ad_id}}
{ "status": "PAUSED" }`,
    },
  ],

  commonIssues: [
    {
      problem: 'Access token expired',
      cause: 'Short-lived tokens expire in hours.',
      solution: 'Use a system user token or implement token refresh.',
    },
    {
      problem: 'Ad account not found',
      cause: 'Token doesn\'t have access to the ad account.',
      solution: 'Verify ad account ID and user permissions.',
    },
  ],

  relatedIntegrations: ['google-ads', 'google-analytics'],
  externalResources: [
    { title: 'Marketing API Reference', url: 'https://developers.facebook.com/docs/marketing-api' },
  ],
};

export const googleAdsIntegration: Integration = {
  id: 'google-ads',
  name: 'Google Ads',
  description: 'Use the Google Ads node to manage campaigns, keywords, and ads. n8n supports search, display, and video campaign management.',
  shortDescription: 'Google advertising platform',
  category: 'marketing',
  icon: 'google',
  color: '#4285F4',
  website: 'https://ads.google.com',
  documentationUrl: 'https://developers.google.com/google-ads/api',

  features: [
    'Campaign management',
    'Keyword management',
    'Ad group operations',
    'Bidding strategies',
    'Performance reports',
    'Conversion tracking',
    'Audience management',
    'Budget control',
  ],

  useCases: [
    'PPC automation',
    'Keyword optimization',
    'Budget management',
    'Performance monitoring',
    'Bid adjustments',
    'Ad testing',
    'Report generation',
    'Campaign scaling',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Google Cloud Project',
      description: 'Create or select a project in Google Cloud Console.',
    },
    {
      step: 2,
      title: 'Enable Google Ads API',
      description: 'Enable the Google Ads API for your project.',
    },
    {
      step: 3,
      title: 'Get Developer Token',
      description: 'Apply for a Google Ads API developer token.',
    },
    {
      step: 4,
      title: 'Configure OAuth',
      description: 'Set up OAuth credentials and authorize.',
    },
  ],

  operations: [
    {
      name: 'Search Campaigns',
      description: 'Query campaigns with GAQL',
      fields: [
        { name: 'query', type: 'string', required: true, description: 'Google Ads Query Language' },
        { name: 'customer_id', type: 'string', required: true, description: 'Customer ID' },
      ],
    },
    {
      name: 'Update Campaign',
      description: 'Update campaign settings',
      fields: [
        { name: 'campaign_id', type: 'string', required: true, description: 'Campaign ID' },
        { name: 'status', type: 'select', required: false, description: 'Campaign status' },
        { name: 'budget', type: 'number', required: false, description: 'Daily budget' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Adjust Bid',
      description: 'Update keyword bid',
      inputFields: ['keyword_id', 'bid_amount'],
      outputFields: ['resource_name', 'status'],
    },
  ],

  examples: [
    {
      title: 'Daily Performance Report',
      description: 'Generate daily campaign performance email',
      steps: [
        'Trigger: Daily at 8 AM',
        'Query campaign metrics for yesterday',
        'Format data into report',
        'Send email to stakeholders',
      ],
      code: `SELECT
  campaign.name,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions
FROM campaign
WHERE segments.date = '{{yesterday}}'
ORDER BY metrics.cost_micros DESC`,
    },
  ],

  commonIssues: [
    {
      problem: 'Developer token pending',
      cause: 'New tokens have limited access.',
      solution: 'Apply for basic or standard access level.',
    },
    {
      problem: 'Customer ID format',
      cause: 'Using dashes in customer ID.',
      solution: 'Remove dashes from customer ID (1234567890 not 123-456-7890).',
    },
  ],

  relatedIntegrations: ['google-analytics', 'facebook-ads'],
  externalResources: [
    { title: 'Google Ads API Docs', url: 'https://developers.google.com/google-ads/api/docs/start' },
  ],
};

export const intercomIntegration: Integration = {
  id: 'intercom',
  name: 'Intercom',
  description: 'Use the Intercom node to manage conversations, contacts, and messages. n8n supports customer engagement and support workflows.',
  shortDescription: 'Customer messaging platform',
  category: 'marketing',
  icon: 'intercom',
  color: '#6AFDEF',
  website: 'https://intercom.com',
  documentationUrl: 'https://developers.intercom.com',

  features: [
    'Conversation management',
    'Contact management',
    'Message sending',
    'Event tracking',
    'Custom attributes',
    'Tags and segments',
    'Notes and tasks',
    'Bot conversations',
  ],

  useCases: [
    'Customer support',
    'Lead qualification',
    'Onboarding automation',
    'User engagement',
    'In-app messaging',
    'Support ticketing',
    'Customer feedback',
    'Sales outreach',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Access Token',
      description: 'Go to Settings > Developers > Developer Hub and create an app.',
    },
    {
      step: 2,
      title: 'Generate Token',
      description: 'Create an access token with required permissions.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter access token in Integrations > Intercom.',
    },
  ],

  operations: [
    {
      name: 'Create Contact',
      description: 'Create a new contact/lead',
      fields: [
        { name: 'email', type: 'string', required: false, description: 'Contact email' },
        { name: 'phone', type: 'string', required: false, description: 'Phone number' },
        { name: 'name', type: 'string', required: false, description: 'Full name' },
        { name: 'custom_attributes', type: 'json', required: false, description: 'Custom attributes' },
      ],
    },
    {
      name: 'Send Message',
      description: 'Send an in-app or email message',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'User ID or email' },
        { name: 'body', type: 'string', required: true, description: 'Message body' },
        { name: 'message_type', type: 'select', required: true, description: 'inapp or email' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Conversation Started',
      description: 'Triggers when a new conversation starts',
      when: 'User initiates conversation',
      outputFields: ['conversation_id', 'user', 'message'],
    },
    {
      name: 'User Event',
      description: 'Triggers on custom user events',
      when: 'Event tracked for user',
      outputFields: ['event_name', 'user_id', 'metadata'],
    },
  ],

  actions: [
    {
      name: 'Reply to Conversation',
      description: 'Send a reply in a conversation',
      inputFields: ['conversation_id', 'body'],
      outputFields: ['conversation_id', 'type'],
    },
  ],

  examples: [
    {
      title: 'Welcome Message Automation',
      description: 'Send personalized welcome to new signups',
      steps: [
        'Trigger: New user signup',
        'Create Intercom contact with user data',
        'Send personalized in-app welcome message',
        'Tag user for onboarding sequence',
      ],
      code: `{
  "message_type": "inapp",
  "body": "Welcome to {{product_name}}, {{user.first_name}}! 🎉\\n\\nI'm here to help you get started. What brings you here today?",
  "from": {
    "type": "admin",
    "id": "{{support_admin_id}}"
  },
  "to": {
    "type": "user",
    "user_id": "{{user.intercom_id}}"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'User not found',
      cause: 'Using wrong identifier type.',
      solution: 'Use user_id, email, or external_id consistently.',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'Too many API requests.',
      solution: 'Implement request throttling and batch operations.',
    },
  ],

  relatedIntegrations: ['hubspot', 'zendesk', 'slack'],
  externalResources: [
    { title: 'Intercom API Reference', url: 'https://developers.intercom.com/docs/references/rest-api/api.intercom.io/Contacts/contact/' },
  ],
};

export const twilioIntegration: Integration = {
  id: 'twilio',
  name: 'Twilio',
  description: 'Use the Twilio node for SMS, voice calls, and WhatsApp messaging. n8n supports programmable messaging and voice capabilities.',
  shortDescription: 'SMS, voice, and messaging APIs',
  category: 'marketing',
  icon: 'twilio',
  color: '#F22F46',
  website: 'https://twilio.com',
  documentationUrl: 'https://www.twilio.com/docs',

  features: [
    'SMS messaging',
    'MMS messaging',
    'Voice calls',
    'WhatsApp messaging',
    'Phone number management',
    'Verification',
    'Call recording',
    'IVR systems',
  ],

  useCases: [
    'SMS notifications',
    'Two-factor authentication',
    'Appointment reminders',
    'Marketing campaigns',
    'Customer support',
    'Voice bots',
    'Phone verification',
    'Alert systems',
  ],

  credentialType: 'basic_auth',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Account SID',
      description: 'Find your Account SID in Twilio Console dashboard.',
    },
    {
      step: 2,
      title: 'Get Auth Token',
      description: 'Copy your Auth Token from the same page.',
    },
    {
      step: 3,
      title: 'Get Phone Number',
      description: 'Buy or configure a Twilio phone number.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter Account SID, Auth Token, and phone number.',
    },
  ],

  operations: [
    {
      name: 'Send SMS',
      description: 'Send an SMS message',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient phone number (E.164)' },
        { name: 'body', type: 'string', required: true, description: 'Message text' },
        { name: 'from', type: 'string', required: false, description: 'Sender phone number' },
        { name: 'media_url', type: 'string', required: false, description: 'MMS media URL' },
      ],
    },
    {
      name: 'Make Call',
      description: 'Initiate a voice call',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient phone number' },
        { name: 'twiml', type: 'string', required: false, description: 'TwiML instructions' },
        { name: 'url', type: 'string', required: false, description: 'TwiML URL' },
      ],
    },
    {
      name: 'Verify Phone',
      description: 'Send verification code',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Phone number to verify' },
        { name: 'channel', type: 'select', required: true, description: 'sms or call' },
      ],
    },
  ],

  triggers: [
    {
      name: 'SMS Received',
      description: 'Triggers when SMS is received',
      when: 'Incoming message to Twilio number',
      outputFields: ['From', 'To', 'Body', 'MessageSid'],
    },
    {
      name: 'Call Received',
      description: 'Triggers on incoming call',
      when: 'Call to Twilio number',
      outputFields: ['From', 'To', 'CallSid', 'CallStatus'],
    },
  ],

  actions: [
    {
      name: 'Send SMS',
      description: 'Send text message',
      inputFields: ['to', 'body'],
      outputFields: ['sid', 'status', 'date_sent'],
    },
  ],

  examples: [
    {
      title: 'Order Confirmation SMS',
      description: 'Send SMS when order is placed',
      steps: [
        'Trigger: New order created',
        'Format confirmation message',
        'Send SMS to customer',
        'Log delivery status',
      ],
      code: `{
  "to": "{{order.customer.phone}}",
  "from": "+1234567890",
  "body": "Thanks for your order #{{order.id}}! Your {{order.items.length}} item(s) will ship soon. Track at: {{order.tracking_url}}"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Invalid phone number',
      cause: 'Phone number not in E.164 format.',
      solution: 'Use +[country code][number] format (e.g., +14155551234).',
    },
    {
      problem: 'Unverified number',
      cause: 'Trial account can only send to verified numbers.',
      solution: 'Verify recipient number or upgrade account.',
    },
  ],

  relatedIntegrations: ['whatsapp', 'slack'],
  externalResources: [
    { title: 'Twilio API Docs', url: 'https://www.twilio.com/docs/usage/api' },
  ],
};
