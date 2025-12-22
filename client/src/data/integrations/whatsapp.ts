import { Integration } from './types';

export const whatsappIntegration: Integration = {
  id: 'whatsapp',
  name: 'WhatsApp Business',
  description: 'Use the WhatsApp Business node to send and receive messages, templates, media, and interactive elements through WhatsApp Business API. n8n has built-in support for a wide range of WhatsApp features including text messages, template messages, media sharing, and interactive buttons.',
  shortDescription: 'Send and receive WhatsApp messages via Business API',
  category: 'communication',
  icon: 'whatsapp',
  color: '#25D366',
  website: 'https://business.whatsapp.com',
  documentationUrl: 'https://developers.facebook.com/docs/whatsapp',

  features: [
    'Send text messages to customers',
    'Send pre-approved template messages',
    'Share media (images, documents, audio, video)',
    'Create interactive buttons and list messages',
    'Receive incoming messages via webhooks',
    'Manage message templates',
    'Track message delivery status',
    'Support for WhatsApp Flows',
  ],

  useCases: [
    'Customer support automation',
    'Order confirmations and shipping updates',
    'Appointment reminders and booking confirmations',
    'Two-factor authentication (OTP)',
    'Marketing campaigns with template messages',
    'Lead qualification conversations',
    'Payment notifications and invoices',
    'Customer feedback collection',
  ],

  credentialType: 'custom',
  credentialSteps: [
    {
      step: 1,
      title: 'Create a Meta Developer Account',
      description: 'Go to developers.facebook.com and create a developer account if you don\'t have one.',
      note: 'You\'ll need a verified Facebook Business account.',
    },
    {
      step: 2,
      title: 'Create a Meta App',
      description: 'In the Meta Developer Dashboard, click "Create App" and select "Business" as the app type. Give your app a name.',
    },
    {
      step: 3,
      title: 'Add WhatsApp Product',
      description: 'In your app dashboard, click "Add Product" and select WhatsApp. Follow the setup wizard.',
    },
    {
      step: 4,
      title: 'Configure a Phone Number',
      description: 'Add a phone number to your WhatsApp Business account. You can use the test number provided by Meta for development.',
      note: 'Production numbers require business verification.',
    },
    {
      step: 5,
      title: 'Generate Access Token',
      description: 'In the WhatsApp > API Setup section, generate a permanent access token. Copy this token.',
    },
    {
      step: 6,
      title: 'Get Phone Number ID',
      description: 'Find your Phone Number ID in the API Setup section. This identifies which WhatsApp number to use.',
    },
    {
      step: 7,
      title: 'Configure in AgentForge',
      description: 'Go to Integrations > WhatsApp and enter your Access Token and Phone Number ID.',
    },
    {
      step: 8,
      title: 'Set Up Webhook',
      description: 'Configure the webhook URL in Meta Developer Dashboard to receive incoming messages. Use the webhook URL provided in AgentForge.',
      note: 'Verify the webhook with the verification token shown in AgentForge.',
    },
  ],
  requiredScopes: [
    'whatsapp_business_management',
    'whatsapp_business_messaging',
  ],

  operations: [
    {
      name: 'Send Text Message',
      description: 'Send a plain text message to a WhatsApp user',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient phone number with country code (e.g., +1234567890)' },
        { name: 'message', type: 'string', required: true, description: 'The text message to send (max 4096 characters)' },
        { name: 'preview_url', type: 'boolean', required: false, description: 'Whether to show link previews' },
      ],
    },
    {
      name: 'Send Template Message',
      description: 'Send a pre-approved template message. Templates must be approved by Meta before use.',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient phone number' },
        { name: 'template_name', type: 'string', required: true, description: 'Name of the approved template' },
        { name: 'language_code', type: 'string', required: true, description: 'Template language code (e.g., en_US)' },
        { name: 'components', type: 'array', required: false, description: 'Template variables and parameters' },
      ],
    },
    {
      name: 'Send Media Message',
      description: 'Send an image, document, audio, or video file',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient phone number' },
        { name: 'media_type', type: 'select', required: true, description: 'Type of media: image, document, audio, video, sticker' },
        { name: 'media_url', type: 'string', required: true, description: 'Public URL of the media file' },
        { name: 'caption', type: 'string', required: false, description: 'Caption for the media (images and videos only)' },
        { name: 'filename', type: 'string', required: false, description: 'Filename for documents' },
      ],
    },
    {
      name: 'Send Interactive Message',
      description: 'Send a message with buttons or a list menu',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient phone number' },
        { name: 'type', type: 'select', required: true, description: 'Interactive type: button or list' },
        { name: 'body', type: 'string', required: true, description: 'Message body text' },
        { name: 'buttons', type: 'array', required: false, description: 'Button objects (max 3 for button type)' },
        { name: 'sections', type: 'array', required: false, description: 'List sections (for list type)' },
      ],
    },
    {
      name: 'Send Location',
      description: 'Send a location pin to a WhatsApp user',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient phone number' },
        { name: 'latitude', type: 'number', required: true, description: 'Location latitude' },
        { name: 'longitude', type: 'number', required: true, description: 'Location longitude' },
        { name: 'name', type: 'string', required: false, description: 'Location name' },
        { name: 'address', type: 'string', required: false, description: 'Location address' },
      ],
    },
    {
      name: 'Mark as Read',
      description: 'Mark an incoming message as read (shows blue checkmarks)',
      fields: [
        { name: 'message_id', type: 'string', required: true, description: 'ID of the message to mark as read' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Message Received',
      description: 'Triggers when a new message is received from a WhatsApp user',
      when: 'A customer sends any type of message',
      outputFields: ['message_id', 'from', 'timestamp', 'type', 'text', 'media'],
    },
    {
      name: 'Message Status Update',
      description: 'Triggers when a message status changes',
      when: 'Message is sent, delivered, read, or fails',
      outputFields: ['message_id', 'status', 'timestamp', 'recipient_id'],
    },
    {
      name: 'Button Response',
      description: 'Triggers when a user clicks an interactive button',
      when: 'Customer interacts with quick reply or call-to-action buttons',
      outputFields: ['message_id', 'from', 'button_payload', 'button_text'],
    },
    {
      name: 'List Selection',
      description: 'Triggers when a user selects an item from a list message',
      when: 'Customer selects an option from an interactive list',
      outputFields: ['message_id', 'from', 'list_id', 'list_title'],
    },
  ],

  actions: [
    {
      name: 'Send Message',
      description: 'Send a text, media, or template message',
      inputFields: ['to', 'message_type', 'content'],
      outputFields: ['message_id', 'status'],
    },
    {
      name: 'Send Template',
      description: 'Send an approved template message',
      inputFields: ['to', 'template_name', 'language', 'variables'],
      outputFields: ['message_id', 'status'],
    },
    {
      name: 'Upload Media',
      description: 'Upload media to WhatsApp servers for later use',
      inputFields: ['file', 'type'],
      outputFields: ['media_id'],
    },
    {
      name: 'Get Media URL',
      description: 'Get the download URL for a media file',
      inputFields: ['media_id'],
      outputFields: ['url', 'mime_type', 'sha256', 'file_size'],
    },
  ],

  examples: [
    {
      title: 'Send Order Confirmation',
      description: 'Send an order confirmation with details when a new order is placed',
      steps: [
        'Trigger: New order in Shopify',
        'Format order details into message',
        'Send WhatsApp template message with order number and items',
        'Log confirmation in Google Sheets',
      ],
      code: `// Example workflow payload
{
  "to": "{{customer.phone}}",
  "template": "order_confirmation",
  "language": "en_US",
  "components": [
    {
      "type": "body",
      "parameters": [
        { "type": "text", "text": "{{order.number}}" },
        { "type": "text", "text": "{{order.total}}" }
      ]
    }
  ]
}`,
    },
    {
      title: 'Customer Support Bot',
      description: 'Automated customer support with AI-powered responses',
      steps: [
        'Trigger: Message received from WhatsApp',
        'Send message to AI agent for processing',
        'AI searches knowledge base for relevant answer',
        'Send response back to customer via WhatsApp',
        'If AI confidence is low, escalate to human agent',
      ],
    },
    {
      title: 'Appointment Reminder',
      description: 'Send appointment reminders 24 hours before scheduled time',
      steps: [
        'Trigger: Scheduled check every hour',
        'Query appointments happening in 24 hours',
        'For each appointment, send reminder template',
        'Include interactive buttons: Confirm / Reschedule',
        'Handle button responses to update appointment status',
      ],
    },
  ],

  commonIssues: [
    {
      problem: 'Messages not being delivered',
      cause: 'The recipient has not opted in to receive messages, or the 24-hour messaging window has expired.',
      solution: 'Ensure customers have opted in. For messages outside the 24-hour window, use approved template messages.',
    },
    {
      problem: 'Template message rejected',
      cause: 'Template contains policy-violating content or incorrect variable syntax.',
      solution: 'Review Meta\'s template guidelines. Ensure variable placeholders match the approved template exactly.',
    },
    {
      problem: 'Webhook not receiving messages',
      cause: 'Webhook URL not verified or incorrect verification token.',
      solution: 'Re-verify the webhook in Meta Developer Dashboard using the verification token from AgentForge.',
    },
    {
      problem: 'Media upload fails',
      cause: 'File exceeds size limits or is in an unsupported format.',
      solution: 'Check file size limits: Images 5MB, Documents 100MB, Audio 16MB, Video 16MB. Use supported formats.',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'Sending too many messages in a short period.',
      solution: 'Implement message queuing and respect rate limits. New business accounts start with lower limits.',
    },
    {
      problem: 'Invalid phone number format',
      cause: 'Phone number doesn\'t include country code or contains invalid characters.',
      solution: 'Always use international format with country code (e.g., +14155551234). Remove spaces and special characters.',
    },
  ],

  relatedIntegrations: ['telegram', 'slack', 'sms-twilio'],
  externalResources: [
    { title: 'WhatsApp Business API Documentation', url: 'https://developers.facebook.com/docs/whatsapp' },
    { title: 'Message Templates Guidelines', url: 'https://developers.facebook.com/docs/whatsapp/message-templates' },
    { title: 'Webhook Setup Guide', url: 'https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks' },
    { title: 'Business Verification', url: 'https://www.facebook.com/business/help/2058515294227817' },
  ],
};
