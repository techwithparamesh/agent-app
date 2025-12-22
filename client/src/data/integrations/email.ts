import { Integration } from './types';

export const gmailIntegration: Integration = {
  id: 'gmail',
  name: 'Gmail',
  description: 'Use the Gmail node to send, receive, and manage emails through Gmail. n8n supports sending emails, reading inbox, managing labels, and searching messages with full OAuth2 authentication.',
  shortDescription: 'Send and receive emails via Gmail',
  category: 'email',
  icon: 'gmail',
  color: '#EA4335',
  website: 'https://gmail.com',
  documentationUrl: 'https://developers.google.com/gmail/api',

  features: [
    'Send emails with attachments',
    'Read and search inbox',
    'Manage labels and folders',
    'Reply and forward messages',
    'Handle email threads',
    'Draft creation and editing',
    'Batch email operations',
    'Real-time email notifications',
  ],

  useCases: [
    'Automated email responses',
    'Lead follow-up sequences',
    'Invoice and receipt sending',
    'Newsletter distribution',
    'Support ticket creation from emails',
    'Email archiving and organization',
    'Appointment confirmations',
    'Password reset notifications',
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
      title: 'Enable Gmail API',
      description: 'In APIs & Services > Library, search for "Gmail API" and enable it.',
    },
    {
      step: 3,
      title: 'Configure OAuth Consent Screen',
      description: 'Set up the OAuth consent screen with your app information and required scopes.',
      note: 'For production, you\'ll need to verify your app with Google.',
    },
    {
      step: 4,
      title: 'Create OAuth Credentials',
      description: 'In Credentials, create OAuth 2.0 Client ID. Choose "Web application" type.',
    },
    {
      step: 5,
      title: 'Add Redirect URI',
      description: 'Add the AgentForge OAuth callback URL to authorized redirect URIs.',
    },
    {
      step: 6,
      title: 'Copy Client ID and Secret',
      description: 'Copy the Client ID and Client Secret from the credentials page.',
    },
    {
      step: 7,
      title: 'Configure in AgentForge',
      description: 'Enter your Client ID and Secret in Integrations > Gmail, then authorize access.',
    },
  ],
  requiredScopes: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
  ],

  operations: [
    {
      name: 'Send Email',
      description: 'Send an email message',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient email address(es)' },
        { name: 'subject', type: 'string', required: true, description: 'Email subject line' },
        { name: 'body', type: 'string', required: true, description: 'Email body (HTML or plain text)' },
        { name: 'cc', type: 'string', required: false, description: 'CC recipients' },
        { name: 'bcc', type: 'string', required: false, description: 'BCC recipients' },
        { name: 'attachments', type: 'binary', required: false, description: 'File attachments' },
      ],
    },
    {
      name: 'Get Messages',
      description: 'Retrieve emails from inbox',
      fields: [
        { name: 'query', type: 'string', required: false, description: 'Search query (Gmail search syntax)' },
        { name: 'maxResults', type: 'number', required: false, description: 'Maximum emails to return' },
        { name: 'labelIds', type: 'array', required: false, description: 'Filter by label IDs' },
      ],
    },
    {
      name: 'Reply to Email',
      description: 'Send a reply to an existing email thread',
      fields: [
        { name: 'messageId', type: 'string', required: true, description: 'Original message ID' },
        { name: 'body', type: 'string', required: true, description: 'Reply body' },
        { name: 'replyAll', type: 'boolean', required: false, description: 'Reply to all recipients' },
      ],
    },
    {
      name: 'Add Label',
      description: 'Add labels to an email',
      fields: [
        { name: 'messageId', type: 'string', required: true, description: 'Message ID' },
        { name: 'labelIds', type: 'array', required: true, description: 'Labels to add' },
      ],
    },
    {
      name: 'Create Draft',
      description: 'Create an email draft',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient email' },
        { name: 'subject', type: 'string', required: true, description: 'Subject line' },
        { name: 'body', type: 'string', required: true, description: 'Email body' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Email Received',
      description: 'Triggers when a new email arrives',
      when: 'New email matches specified criteria',
      outputFields: ['id', 'threadId', 'from', 'to', 'subject', 'body', 'date', 'attachments'],
    },
    {
      name: 'Email Labeled',
      description: 'Triggers when an email receives a specific label',
      when: 'Label is applied to an email',
      outputFields: ['id', 'labelIds', 'subject'],
    },
  ],

  actions: [
    {
      name: 'Send Email',
      description: 'Compose and send a new email',
      inputFields: ['to', 'subject', 'body', 'attachments'],
      outputFields: ['id', 'threadId', 'labelIds'],
    },
    {
      name: 'Forward Email',
      description: 'Forward an email to another address',
      inputFields: ['messageId', 'to', 'comment'],
      outputFields: ['id', 'threadId'],
    },
    {
      name: 'Mark as Read/Unread',
      description: 'Change read status of emails',
      inputFields: ['messageId', 'markAs'],
      outputFields: ['id', 'labelIds'],
    },
    {
      name: 'Delete/Trash Email',
      description: 'Move email to trash or permanently delete',
      inputFields: ['messageId', 'permanent'],
      outputFields: ['ok'],
    },
  ],

  examples: [
    {
      title: 'Auto-Reply to Support Emails',
      description: 'Automatically acknowledge support requests',
      steps: [
        'Trigger: New email with subject containing "support"',
        'Parse email content for ticket details',
        'Create ticket in helpdesk system',
        'Send auto-reply with ticket number',
        'Apply "support" label to original email',
      ],
      code: `{
  "to": "{{original.from}}",
  "subject": "Re: {{original.subject}} [Ticket #{{ticket.id}}]",
  "body": "Thank you for contacting support.\\n\\nYour request has been received and assigned ticket #{{ticket.id}}.\\n\\nWe will respond within 24 hours.\\n\\nBest regards,\\nSupport Team"
}`,
    },
    {
      title: 'Invoice Email Automation',
      description: 'Send invoices when orders are completed',
      steps: [
        'Trigger: Order status changed to "completed"',
        'Generate PDF invoice from order data',
        'Compose email with invoice attached',
        'Send to customer email address',
        'Log sent invoice in spreadsheet',
      ],
    },
  ],

  commonIssues: [
    {
      problem: 'Authentication expired',
      cause: 'OAuth token needs refresh or was revoked.',
      solution: 'Reconnect the Gmail integration in AgentForge settings.',
    },
    {
      problem: 'Email bounced back',
      cause: 'Invalid recipient address or blocked by spam filter.',
      solution: 'Verify recipient email. Check if your domain has proper SPF/DKIM records.',
    },
    {
      problem: 'Attachment too large',
      cause: 'Gmail limits attachments to 25MB.',
      solution: 'Use Google Drive links for large files or compress attachments.',
    },
    {
      problem: 'Daily sending limit exceeded',
      cause: 'Gmail has daily limits (500/day for regular, 2000/day for Workspace).',
      solution: 'Spread sends over time or upgrade to Google Workspace.',
    },
  ],

  relatedIntegrations: ['outlook', 'sendgrid', 'mailchimp'],
  externalResources: [
    { title: 'Gmail API Reference', url: 'https://developers.google.com/gmail/api/reference/rest' },
    { title: 'Search Operators', url: 'https://support.google.com/mail/answer/7190' },
  ],
};

export const sendgridIntegration: Integration = {
  id: 'sendgrid',
  name: 'SendGrid',
  description: 'Use the SendGrid node to send transactional and marketing emails at scale. n8n supports single and bulk email sending, dynamic templates, and contact management.',
  shortDescription: 'Send transactional and marketing emails',
  category: 'email',
  icon: 'sendgrid',
  color: '#1A82E2',
  website: 'https://sendgrid.com',
  documentationUrl: 'https://docs.sendgrid.com',

  features: [
    'Send transactional emails',
    'Use dynamic email templates',
    'Bulk email sending',
    'Contact list management',
    'Email scheduling',
    'Track opens and clicks',
    'Handle bounces and unsubscribes',
    'A/B testing for campaigns',
  ],

  useCases: [
    'Transactional email (receipts, notifications)',
    'User onboarding sequences',
    'Marketing campaigns',
    'Password reset emails',
    'Order confirmations',
    'Event invitations',
    'Digest and summary emails',
    'Re-engagement campaigns',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Create SendGrid Account',
      description: 'Sign up at sendgrid.com if you don\'t have an account.',
    },
    {
      step: 2,
      title: 'Verify Sender Identity',
      description: 'Verify your sender email or domain in Settings > Sender Authentication.',
      note: 'Domain authentication improves deliverability.',
    },
    {
      step: 3,
      title: 'Create API Key',
      description: 'Go to Settings > API Keys and click "Create API Key". Choose "Full Access" or customize permissions.',
    },
    {
      step: 4,
      title: 'Copy API Key',
      description: 'Copy the API key immediately - it won\'t be shown again.',
    },
    {
      step: 5,
      title: 'Configure in AgentForge',
      description: 'Enter your API key in Integrations > SendGrid.',
    },
  ],

  operations: [
    {
      name: 'Send Email',
      description: 'Send a single email',
      fields: [
        { name: 'to', type: 'string', required: true, description: 'Recipient email' },
        { name: 'from', type: 'string', required: true, description: 'Verified sender email' },
        { name: 'subject', type: 'string', required: true, description: 'Email subject' },
        { name: 'content', type: 'string', required: true, description: 'Email body (HTML or text)' },
        { name: 'template_id', type: 'string', required: false, description: 'Dynamic template ID' },
        { name: 'dynamic_template_data', type: 'json', required: false, description: 'Template variables' },
      ],
    },
    {
      name: 'Send Bulk Email',
      description: 'Send personalized emails to multiple recipients',
      fields: [
        { name: 'personalizations', type: 'array', required: true, description: 'Array of recipient objects' },
        { name: 'from', type: 'string', required: true, description: 'Sender email' },
        { name: 'template_id', type: 'string', required: true, description: 'Template ID' },
      ],
    },
    {
      name: 'Add Contact',
      description: 'Add a contact to your list',
      fields: [
        { name: 'email', type: 'string', required: true, description: 'Contact email' },
        { name: 'first_name', type: 'string', required: false, description: 'First name' },
        { name: 'last_name', type: 'string', required: false, description: 'Last name' },
        { name: 'list_ids', type: 'array', required: false, description: 'Contact lists to add to' },
      ],
    },
    {
      name: 'Get Statistics',
      description: 'Retrieve email sending statistics',
      fields: [
        { name: 'start_date', type: 'date', required: true, description: 'Stats start date' },
        { name: 'end_date', type: 'date', required: false, description: 'Stats end date' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Email Event',
      description: 'Triggers on email events (delivered, opened, clicked, bounced)',
      when: 'Email status changes',
      outputFields: ['event', 'email', 'timestamp', 'sg_message_id', 'url'],
    },
    {
      name: 'Bounce Received',
      description: 'Triggers when an email bounces',
      when: 'Email delivery fails',
      outputFields: ['email', 'reason', 'type', 'timestamp'],
    },
    {
      name: 'Unsubscribe',
      description: 'Triggers when a recipient unsubscribes',
      when: 'User clicks unsubscribe link',
      outputFields: ['email', 'timestamp'],
    },
  ],

  actions: [
    {
      name: 'Send Email',
      description: 'Send a transactional email',
      inputFields: ['to', 'from', 'subject', 'content'],
      outputFields: ['message_id', 'status'],
    },
    {
      name: 'Delete Contact',
      description: 'Remove a contact from all lists',
      inputFields: ['email'],
      outputFields: ['job_id'],
    },
  ],

  examples: [
    {
      title: 'Welcome Email Series',
      description: 'Send onboarding emails to new users',
      steps: [
        'Trigger: New user signup',
        'Send welcome email immediately',
        'Wait 3 days',
        'Send feature introduction email',
        'Wait 7 days',
        'Send tips and tricks email',
      ],
      code: `{
  "to": "{{user.email}}",
  "from": "hello@yourcompany.com",
  "template_id": "d-welcome-template-id",
  "dynamic_template_data": {
    "first_name": "{{user.firstName}}",
    "product_name": "AgentForge"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Emails going to spam',
      cause: 'Domain not authenticated or reputation issues.',
      solution: 'Set up domain authentication with SPF, DKIM, and DMARC records.',
    },
    {
      problem: 'API key invalid',
      cause: 'Key deleted or permissions changed.',
      solution: 'Generate a new API key with required permissions.',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'Sending too fast on free plan (100 emails/day).',
      solution: 'Upgrade plan or implement rate limiting.',
    },
  ],

  relatedIntegrations: ['gmail', 'mailchimp', 'mailgun'],
  externalResources: [
    { title: 'SendGrid API Docs', url: 'https://docs.sendgrid.com/api-reference' },
    { title: 'Template Design', url: 'https://sendgrid.com/solutions/email-design/' },
  ],
};

export const mailchimpIntegration: Integration = {
  id: 'mailchimp',
  name: 'Mailchimp',
  description: 'Use the Mailchimp node to manage email marketing campaigns, subscriber lists, and automations. n8n supports contact management, campaign creation, and audience segmentation.',
  shortDescription: 'Email marketing and audience management',
  category: 'email',
  icon: 'mailchimp',
  color: '#FFE01B',
  website: 'https://mailchimp.com',
  documentationUrl: 'https://mailchimp.com/developer/',

  features: [
    'Manage subscriber lists',
    'Create and send campaigns',
    'Audience segmentation',
    'Automated email sequences',
    'A/B testing',
    'Analytics and reporting',
    'Tags and groups',
    'Merge field customization',
  ],

  useCases: [
    'Newsletter campaigns',
    'Subscriber management',
    'Drip marketing automation',
    'Product announcements',
    'Customer re-engagement',
    'Event promotions',
    'E-commerce follow-ups',
    'List segmentation',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Log into Mailchimp',
      description: 'Sign in to your Mailchimp account.',
    },
    {
      step: 2,
      title: 'Navigate to API Keys',
      description: 'Go to Account > Extras > API keys.',
    },
    {
      step: 3,
      title: 'Create API Key',
      description: 'Click "Create A Key" and give it a descriptive name.',
    },
    {
      step: 4,
      title: 'Copy API Key',
      description: 'Copy the generated API key. Note your data center (e.g., us19) from the key.',
    },
    {
      step: 5,
      title: 'Configure in AgentForge',
      description: 'Enter the API key in Integrations > Mailchimp.',
    },
  ],

  operations: [
    {
      name: 'Add/Update Subscriber',
      description: 'Add a new subscriber or update existing',
      fields: [
        { name: 'list_id', type: 'string', required: true, description: 'Audience/list ID' },
        { name: 'email', type: 'string', required: true, description: 'Subscriber email' },
        { name: 'status', type: 'select', required: true, description: 'subscribed, unsubscribed, pending' },
        { name: 'merge_fields', type: 'json', required: false, description: 'Custom fields (FNAME, LNAME, etc.)' },
        { name: 'tags', type: 'array', required: false, description: 'Tags to apply' },
      ],
    },
    {
      name: 'Create Campaign',
      description: 'Create a new email campaign',
      fields: [
        { name: 'type', type: 'select', required: true, description: 'regular, plaintext, absplit' },
        { name: 'list_id', type: 'string', required: true, description: 'Audience to send to' },
        { name: 'subject', type: 'string', required: true, description: 'Email subject line' },
        { name: 'from_name', type: 'string', required: true, description: 'Sender name' },
        { name: 'reply_to', type: 'string', required: true, description: 'Reply-to email' },
      ],
    },
    {
      name: 'Add Tag',
      description: 'Add a tag to a subscriber',
      fields: [
        { name: 'list_id', type: 'string', required: true, description: 'List ID' },
        { name: 'email', type: 'string', required: true, description: 'Subscriber email' },
        { name: 'tag', type: 'string', required: true, description: 'Tag name' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Subscriber Added',
      description: 'Triggers when a new subscriber joins',
      when: 'New subscription confirmed',
      outputFields: ['email', 'merge_fields', 'list_id', 'tags'],
    },
    {
      name: 'Campaign Sent',
      description: 'Triggers when a campaign is sent',
      when: 'Campaign sending completes',
      outputFields: ['campaign_id', 'subject', 'send_time', 'recipient_count'],
    },
    {
      name: 'Subscriber Unsubscribed',
      description: 'Triggers when someone unsubscribes',
      when: 'Subscriber opts out',
      outputFields: ['email', 'list_id', 'reason'],
    },
  ],

  actions: [
    {
      name: 'Add Subscriber',
      description: 'Add a contact to an audience',
      inputFields: ['list_id', 'email', 'merge_fields', 'status'],
      outputFields: ['id', 'email_address', 'status'],
    },
    {
      name: 'Update Subscriber',
      description: 'Update subscriber information',
      inputFields: ['list_id', 'email', 'merge_fields', 'tags'],
      outputFields: ['id', 'email_address', 'status'],
    },
    {
      name: 'Archive Subscriber',
      description: 'Archive a subscriber (soft delete)',
      inputFields: ['list_id', 'email'],
      outputFields: ['complete'],
    },
  ],

  examples: [
    {
      title: 'Sync CRM Contacts',
      description: 'Keep Mailchimp in sync with your CRM',
      steps: [
        'Trigger: New/updated contact in CRM',
        'Check if contact exists in Mailchimp',
        'Add or update subscriber with CRM data',
        'Apply tags based on CRM segment',
      ],
    },
  ],

  commonIssues: [
    {
      problem: 'Subscriber already exists',
      cause: 'Trying to add an existing subscriber as new.',
      solution: 'Use "Add/Update" operation which handles both cases.',
    },
    {
      problem: 'Compliance state error',
      cause: 'User previously unsubscribed (cannot resubscribe via API).',
      solution: 'User must resubscribe through Mailchimp form with double opt-in.',
    },
    {
      problem: 'Invalid merge field',
      cause: 'Merge field doesn\'t exist in the audience.',
      solution: 'Create the merge field in Mailchimp first or use default fields.',
    },
  ],

  relatedIntegrations: ['sendgrid', 'gmail', 'hubspot'],
  externalResources: [
    { title: 'Mailchimp API Docs', url: 'https://mailchimp.com/developer/marketing/api/' },
    { title: 'Merge Fields Guide', url: 'https://mailchimp.com/help/manage-audience-signup-form-fields/' },
  ],
};

export const outlookIntegration: Integration = {
  id: 'outlook',
  name: 'Microsoft Outlook',
  description: 'Use the Outlook node to send, receive, and manage emails through Microsoft 365. n8n supports full email operations, calendar integration, and contact management.',
  shortDescription: 'Microsoft 365 email management',
  category: 'email',
  icon: 'outlook',
  color: '#0078D4',
  website: 'https://outlook.com',
  documentationUrl: 'https://docs.microsoft.com/graph/outlook-mail-concept-overview',

  features: [
    'Send and receive emails',
    'Calendar event management',
    'Contact synchronization',
    'Folder organization',
    'Email search and filtering',
    'Attachments handling',
    'Meeting scheduling',
    'Out of office settings',
  ],

  useCases: [
    'Enterprise email automation',
    'Meeting coordination',
    'Contact management',
    'Email archiving',
    'Calendar sync',
    'Task assignments via email',
    'Automated responses',
    'Team communication',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Register Azure App',
      description: 'Go to Azure Portal > App registrations and create a new app.',
    },
    {
      step: 2,
      title: 'Configure API Permissions',
      description: 'Add Microsoft Graph permissions: Mail.ReadWrite, Mail.Send, Calendars.ReadWrite.',
    },
    {
      step: 3,
      title: 'Create Client Secret',
      description: 'Generate a client secret in Certificates & secrets.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter Tenant ID, Client ID, and Client Secret.',
    },
  ],

  operations: [
    {
      name: 'Send Email',
      description: 'Send an email message',
      fields: [
        { name: 'to', type: 'array', required: true, description: 'Recipient email addresses' },
        { name: 'subject', type: 'string', required: true, description: 'Email subject' },
        { name: 'body', type: 'string', required: true, description: 'Email body (HTML or text)' },
        { name: 'cc', type: 'array', required: false, description: 'CC recipients' },
        { name: 'attachments', type: 'array', required: false, description: 'File attachments' },
      ],
    },
    {
      name: 'Get Messages',
      description: 'Retrieve emails from a folder',
      fields: [
        { name: 'folder', type: 'string', required: false, description: 'Folder name (default: inbox)' },
        { name: 'filter', type: 'string', required: false, description: 'OData filter query' },
        { name: 'top', type: 'number', required: false, description: 'Max messages to return' },
      ],
    },
    {
      name: 'Create Event',
      description: 'Create a calendar event',
      fields: [
        { name: 'subject', type: 'string', required: true, description: 'Event subject' },
        { name: 'start', type: 'datetime', required: true, description: 'Start time' },
        { name: 'end', type: 'datetime', required: true, description: 'End time' },
        { name: 'attendees', type: 'array', required: false, description: 'Attendee emails' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Email Received',
      description: 'Triggers when a new email arrives',
      when: 'New message in inbox',
      outputFields: ['id', 'subject', 'from', 'receivedDateTime', 'bodyPreview'],
    },
    {
      name: 'Calendar Event',
      description: 'Triggers on calendar event changes',
      when: 'Event created/updated/deleted',
      outputFields: ['id', 'subject', 'start', 'end', 'organizer'],
    },
  ],

  actions: [
    {
      name: 'Reply to Email',
      description: 'Send a reply to an email',
      inputFields: ['message_id', 'body'],
      outputFields: ['id'],
    },
    {
      name: 'Move Message',
      description: 'Move email to a folder',
      inputFields: ['message_id', 'folder_id'],
      outputFields: ['id', 'parentFolderId'],
    },
  ],

  examples: [
    {
      title: 'Meeting Scheduler',
      description: 'Auto-schedule meetings from email requests',
      steps: [
        'Trigger: Email received with "meeting" in subject',
        'Extract proposed times from email body',
        'Check calendar availability',
        'Create event and send invite',
      ],
      code: `{
  "subject": "Meeting: {{parsed.topic}}",
  "start": {
    "dateTime": "{{available_slot.start}}",
    "timeZone": "UTC"
  },
  "end": {
    "dateTime": "{{available_slot.end}}",
    "timeZone": "UTC"
  },
  "attendees": [
    {"emailAddress": {"address": "{{email.from}}"}}
  ],
  "body": {
    "contentType": "HTML",
    "content": "Meeting confirmed for {{formatDate(available_slot.start)}}"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Insufficient permissions',
      cause: 'App missing required Graph API permissions.',
      solution: 'Add Mail.Send, Mail.ReadWrite permissions and grant admin consent.',
    },
    {
      problem: 'Token expired',
      cause: 'Access token has expired.',
      solution: 'Implement token refresh or re-authenticate.',
    },
  ],

  relatedIntegrations: ['gmail', 'google-calendar', 'microsoft-teams'],
  externalResources: [
    { title: 'Microsoft Graph Mail API', url: 'https://docs.microsoft.com/graph/api/resources/mail-api-overview' },
  ],
};

export const smtpIntegration: Integration = {
  id: 'smtp',
  name: 'SMTP Email',
  description: 'Use the SMTP node to send emails through any SMTP server. n8n supports custom mail servers, authentication, and advanced email formatting.',
  shortDescription: 'Send email via any SMTP server',
  category: 'email',
  icon: 'email',
  color: '#6B7280',
  website: 'https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol',
  documentationUrl: 'https://datatracker.ietf.org/doc/html/rfc5321',

  features: [
    'Custom SMTP server support',
    'TLS/SSL encryption',
    'HTML and plain text emails',
    'File attachments',
    'Custom headers',
    'Multiple recipients (To/CC/BCC)',
    'Email templates',
    'Bulk sending',
  ],

  useCases: [
    'Custom mail server integration',
    'Transactional emails',
    'System notifications',
    'Internal alerts',
    'Report delivery',
    'Form submissions',
    'Application emails',
    'Legacy system integration',
  ],

  credentialType: 'basic_auth',
  credentialSteps: [
    {
      step: 1,
      title: 'Get SMTP Details',
      description: 'Obtain SMTP host, port, username, and password from your email provider.',
    },
    {
      step: 2,
      title: 'Configure Security',
      description: 'Determine if TLS (port 587) or SSL (port 465) is required.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter SMTP host, port, username, password, and security settings.',
    },
  ],

  operations: [
    {
      name: 'Send Email',
      description: 'Send an email via SMTP',
      fields: [
        { name: 'from', type: 'string', required: true, description: 'Sender email address' },
        { name: 'to', type: 'string', required: true, description: 'Recipient email(s)' },
        { name: 'subject', type: 'string', required: true, description: 'Email subject' },
        { name: 'body', type: 'string', required: true, description: 'Email body' },
        { name: 'html', type: 'boolean', required: false, description: 'Send as HTML' },
        { name: 'cc', type: 'string', required: false, description: 'CC recipients' },
        { name: 'bcc', type: 'string', required: false, description: 'BCC recipients' },
        { name: 'attachments', type: 'array', required: false, description: 'File attachments' },
        { name: 'replyTo', type: 'string', required: false, description: 'Reply-to address' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Send Email',
      description: 'Send email via SMTP',
      inputFields: ['from', 'to', 'subject', 'body'],
      outputFields: ['messageId', 'accepted', 'rejected'],
    },
  ],

  examples: [
    {
      title: 'System Alert Email',
      description: 'Send server alerts via custom SMTP',
      steps: [
        'Trigger: System metric exceeds threshold',
        'Format alert message with details',
        'Send to ops team via SMTP',
        'Log email delivery status',
      ],
      code: `{
  "from": "alerts@company.com",
  "to": "ops-team@company.com",
  "subject": "🚨 Alert: {{alert.type}} on {{alert.server}}",
  "html": true,
  "body": "<h2>System Alert</h2><p><strong>Server:</strong> {{alert.server}}</p><p><strong>Metric:</strong> {{alert.metric}}</p><p><strong>Value:</strong> {{alert.value}}</p><p><strong>Threshold:</strong> {{alert.threshold}}</p><p><strong>Time:</strong> {{formatDate(now())}}</p>"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Connection timeout',
      cause: 'Wrong port or firewall blocking connection.',
      solution: 'Verify port (587 for TLS, 465 for SSL, 25 for unencrypted) and check firewall.',
    },
    {
      problem: 'Authentication failed',
      cause: 'Wrong credentials or app password required.',
      solution: 'For Gmail/Outlook, use app-specific passwords instead of account password.',
    },
    {
      problem: 'Certificate error',
      cause: 'Self-signed certificate on mail server.',
      solution: 'Enable "Allow unauthorized certificates" option or install proper cert.',
    },
  ],

  relatedIntegrations: ['gmail', 'outlook', 'sendgrid'],
  externalResources: [
    { title: 'SMTP Overview', url: 'https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol' },
  ],
};
