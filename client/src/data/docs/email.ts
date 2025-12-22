import { IntegrationDoc } from './types';

export const emailDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GMAIL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    category: 'email',
    shortDescription: 'Send emails via Gmail API',
    overview: {
      what: 'Gmail integration allows your AI agent to send emails through your Gmail account using Google\'s secure API, perfect for automated email communications.',
      why: 'Gmail is trusted by billions. Sending emails from your Gmail account ensures high deliverability and familiar branding for recipients.',
      useCases: [
        'Automated follow-up emails',
        'Order confirmations',
        'Welcome email sequences',
        'Support ticket responses',
        'Meeting summaries',
        'Report delivery',
      ],
      targetAudience: 'Businesses using Gmail or Google Workspace who want to send automated emails with high deliverability.',
    },
    prerequisites: {
      accounts: [
        'Gmail or Google Workspace account',
        'Google Cloud Console access',
      ],
      permissions: [
        'Gmail API enabled in Google Cloud',
        'OAuth consent screen configured',
      ],
      preparations: [
        'Set up a Google Cloud project',
        'Enable Gmail API',
        'Create OAuth credentials',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Go to Google Cloud Console',
        description: 'Visit console.cloud.google.com and sign in with your Google account.',
        screenshot: 'Google Cloud Console – Homepage',
      },
      {
        step: 2,
        title: 'Create a New Project',
        description: 'Click "Select a project" → "New Project". Name it (e.g., "AgentForge Integration") and click "Create".',
        screenshot: 'Google Cloud – Create Project',
      },
      {
        step: 3,
        title: 'Enable Gmail API',
        description: 'Go to "APIs & Services" → "Library". Search for "Gmail API" and click "Enable".',
        screenshot: 'Google Cloud – Enable Gmail API',
      },
      {
        step: 4,
        title: 'Configure OAuth Consent Screen',
        description: 'Go to "OAuth consent screen". Select "External" user type and fill in app details.',
        screenshot: 'Google Cloud – OAuth Consent Screen',
        tip: 'Add your email as a test user during development.',
      },
      {
        step: 5,
        title: 'Create OAuth Credentials',
        description: 'Go to "Credentials" → "Create Credentials" → "OAuth client ID". Select "Web application".',
        screenshot: 'Google Cloud – Create OAuth Credentials',
      },
      {
        step: 6,
        title: 'Add Redirect URI',
        description: 'Add AgentForge\'s redirect URI to the authorized redirect URIs list.',
        screenshot: 'Google Cloud – Redirect URI',
      },
      {
        step: 7,
        title: 'Copy Credentials',
        description: 'Copy the Client ID and Client Secret.',
        screenshot: 'Google Cloud – OAuth Credentials',
        warning: 'Keep your Client Secret secure!',
      },
      {
        step: 8,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge Dashboard → Integrations → Gmail. Enter your credentials and click "Authorize".',
        screenshot: 'AgentForge – Gmail Integration Form',
      },
      {
        step: 9,
        title: 'Authorize Access',
        description: 'You\'ll be redirected to Google. Sign in and grant permission for AgentForge to send emails.',
        screenshot: 'Google – Authorization Screen',
      },
    ],
    triggers: [
      {
        id: 'email_received',
        name: 'Email Received',
        description: 'Fires when a new email arrives in your inbox.',
        whenItFires: 'When a new email is received matching your filter criteria.',
        exampleScenario: 'When a customer emails support@yourcompany.com, create a support ticket.',
        dataProvided: ['From address', 'Subject', 'Body (text/html)', 'Attachments', 'Labels'],
      },
    ],
    actions: [
      {
        id: 'send_email',
        name: 'Send Email',
        description: 'Send an email from your Gmail account.',
        whenToUse: 'For automated responses, notifications, and outreach.',
        requiredFields: ['To address', 'Subject', 'Body'],
        optionalFields: ['CC', 'BCC', 'Reply-to', 'Attachments'],
        example: 'Send order confirmation email with details and receipt.',
      },
      {
        id: 'send_html_email',
        name: 'Send HTML Email',
        description: 'Send a rich HTML formatted email.',
        whenToUse: 'For branded emails with formatting, images, and links.',
        requiredFields: ['To address', 'Subject', 'HTML body'],
        optionalFields: ['Plain text fallback', 'Attachments'],
        example: 'Send newsletter with images and styled content.',
      },
    ],
    exampleFlow: {
      title: 'Order Confirmation Flow',
      scenario: 'Send confirmation email when order is placed.',
      steps: [
        'Customer completes checkout on your website',
        'Trigger: Order Placed event fires',
        'Workflow retrieves order details from database',
        'Gmail action sends confirmation email',
        'Customer receives branded HTML email with order summary',
      ],
    },
    troubleshooting: [
      {
        error: 'Authorization failed',
        cause: 'OAuth consent not properly configured or credentials invalid.',
        solution: 'Verify OAuth consent screen setup and check credentials. Re-authorize if needed.',
      },
      {
        error: 'Quota exceeded',
        cause: 'Gmail API has daily sending limits (500 emails/day for free, 2000 for Workspace).',
        solution: 'Upgrade to Google Workspace or reduce email volume. Consider SendGrid for high volume.',
      },
      {
        error: 'Token expired',
        cause: 'Refresh token expired or revoked.',
        solution: 'Re-authorize the Gmail connection in AgentForge.',
      },
    ],
    bestPractices: [
      'Use HTML emails for branded communications',
      'Always include a plain text version',
      'Personalize subject lines and content',
      'Don\'t send too many emails - respect inbox',
      'Use Google Workspace for higher sending limits',
      'Monitor bounce rates and clean your list',
      'Include unsubscribe links for marketing emails',
    ],
    faq: [
      {
        question: 'How many emails can I send per day?',
        answer: 'Free Gmail: 500/day. Google Workspace: 2,000/day. For higher volumes, use a dedicated email service.',
      },
      {
        question: 'Will emails go to spam?',
        answer: 'Gmail has good deliverability, but always follow email best practices. Avoid spam trigger words and send to engaged users.',
      },
      {
        question: 'Can I send attachments?',
        answer: 'Yes, attachments up to 25MB are supported. For larger files, use Google Drive links.',
      },
      {
        question: 'Can I use my custom domain email?',
        answer: 'Yes, with Google Workspace you can use your custom domain (e.g., you@yourcompany.com).',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OUTLOOK
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    icon: '📨',
    category: 'email',
    shortDescription: 'Send emails via Outlook/Office 365',
    overview: {
      what: 'Outlook integration enables your AI agent to send emails through Microsoft Outlook or Office 365, ideal for enterprise environments.',
      why: 'Microsoft 365 is the standard for enterprise email. Integrate with Outlook to maintain compliance and use existing infrastructure.',
      useCases: [
        'Internal notifications',
        'Customer communications',
        'Meeting invitations',
        'Report distribution',
        'Automated responses',
        'Workflow notifications',
      ],
      targetAudience: 'Enterprises and businesses using Microsoft 365 or Outlook for email.',
    },
    prerequisites: {
      accounts: [
        'Microsoft 365 or Outlook.com account',
        'Azure Active Directory access (for app registration)',
      ],
      permissions: [
        'Mail.Send permission',
        'Azure AD app registration rights',
      ],
      preparations: [
        'Create Azure AD app registration',
        'Configure API permissions',
        'Generate client secret',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Go to Azure Portal',
        description: 'Visit portal.azure.com and sign in with your Microsoft account.',
        screenshot: 'Azure Portal – Homepage',
      },
      {
        step: 2,
        title: 'Register New Application',
        description: 'Go to "Azure Active Directory" → "App registrations" → "New registration". Name your app.',
        screenshot: 'Azure – App Registration',
      },
      {
        step: 3,
        title: 'Configure Redirect URI',
        description: 'Set the redirect URI type to "Web" and add AgentForge\'s callback URL.',
        screenshot: 'Azure – Redirect URI',
      },
      {
        step: 4,
        title: 'Add API Permissions',
        description: 'Go to "API permissions" → "Add permission" → "Microsoft Graph" → "Mail.Send".',
        screenshot: 'Azure – API Permissions',
      },
      {
        step: 5,
        title: 'Grant Admin Consent',
        description: 'Click "Grant admin consent" if you have admin privileges.',
        screenshot: 'Azure – Grant Consent',
      },
      {
        step: 6,
        title: 'Create Client Secret',
        description: 'Go to "Certificates & secrets" → "New client secret". Copy the value immediately.',
        screenshot: 'Azure – Client Secret',
        warning: 'The secret value is only shown once. Copy it now!',
      },
      {
        step: 7,
        title: 'Copy Application Details',
        description: 'Copy the Application (client) ID and Directory (tenant) ID from the Overview page.',
        screenshot: 'Azure – App Overview',
      },
      {
        step: 8,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → Outlook. Enter Client ID, Client Secret, and Tenant ID.',
        screenshot: 'AgentForge – Outlook Integration Form',
      },
    ],
    triggers: [
      {
        id: 'email_received',
        name: 'Email Received',
        description: 'Fires when a new email arrives.',
        whenItFires: 'When new emails match your specified criteria.',
        exampleScenario: 'Process incoming support emails and create tickets.',
        dataProvided: ['Sender', 'Subject', 'Body', 'Attachments', 'Received time'],
      },
    ],
    actions: [
      {
        id: 'send_email',
        name: 'Send Email',
        description: 'Send an email via Outlook.',
        whenToUse: 'For automated communications in Microsoft environments.',
        requiredFields: ['To', 'Subject', 'Body'],
        optionalFields: ['CC', 'BCC', 'Attachments', 'Importance'],
        example: 'Send project status update to stakeholders.',
      },
    ],
    exampleFlow: {
      title: 'Meeting Follow-up Flow',
      scenario: 'Send meeting summary email after appointment.',
      steps: [
        'Calendar event ends',
        'Trigger: Meeting Ended event',
        'AI summarizes meeting notes',
        'Outlook action sends summary to all attendees',
        'Attendees receive formatted email with action items',
      ],
    },
    troubleshooting: [
      {
        error: 'Insufficient privileges',
        cause: 'API permissions not granted or admin consent missing.',
        solution: 'Verify Mail.Send permission is added and admin consent is granted.',
      },
      {
        error: 'Invalid tenant ID',
        cause: 'Wrong tenant ID or account mismatch.',
        solution: 'Use the correct tenant ID from your Azure AD app registration.',
      },
      {
        error: 'Token request failed',
        cause: 'Client secret expired or invalid.',
        solution: 'Generate a new client secret and update in AgentForge.',
      },
    ],
    bestPractices: [
      'Use application permissions for automated scenarios',
      'Implement proper error handling for bounces',
      'Follow your organization\'s email policies',
      'Use shared mailboxes for team communications',
      'Set appropriate importance levels',
      'Include proper signatures and disclaimers',
    ],
    faq: [
      {
        question: 'Can I send as a shared mailbox?',
        answer: 'Yes, with proper permissions you can send emails on behalf of shared mailboxes.',
      },
      {
        question: 'What are the sending limits?',
        answer: 'Microsoft 365 allows 10,000 recipients per day. Single email limit is 500 recipients.',
      },
      {
        question: 'Do I need admin rights?',
        answer: 'For app registration yes. For sending, only Mail.Send permission is needed.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SMTP EMAIL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'smtp',
    name: 'SMTP Email',
    icon: '✉️',
    category: 'email',
    shortDescription: 'Send emails via any SMTP server',
    overview: {
      what: 'SMTP integration allows your AI agent to send emails through any SMTP server, giving you maximum flexibility for email delivery.',
      why: 'SMTP works with any email provider. Use your existing email infrastructure or hosting provider without vendor lock-in.',
      useCases: [
        'Transactional emails',
        'System notifications',
        'Custom email servers',
        'Self-hosted solutions',
        'Legacy system integration',
        'Development and testing',
      ],
      targetAudience: 'Technical users who want to use their own SMTP server or have specific email infrastructure requirements.',
    },
    prerequisites: {
      accounts: [
        'SMTP server access (hosting provider, self-hosted, or email service)',
      ],
      permissions: [
        'SMTP authentication credentials',
        'Outbound email sending rights',
      ],
      preparations: [
        'Gather SMTP server details (host, port)',
        'Get SMTP username and password',
        'Verify TLS/SSL requirements',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Get SMTP Server Details',
        description: 'Find your SMTP server hostname (e.g., smtp.yourprovider.com) and port (usually 587 for TLS or 465 for SSL).',
        screenshot: 'Email Provider – SMTP Settings Page',
      },
      {
        step: 2,
        title: 'Get Authentication Credentials',
        description: 'Get your SMTP username (usually your email address) and password or app password.',
        screenshot: 'Email Provider – Generate App Password',
        tip: 'Many providers require an "app password" instead of your regular password.',
      },
      {
        step: 3,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → SMTP Email. Enter server, port, username, and password.',
        screenshot: 'AgentForge – SMTP Integration Form',
      },
      {
        step: 4,
        title: 'Configure Security',
        description: 'Select the correct security option: TLS (port 587) or SSL (port 465).',
        screenshot: 'AgentForge – SMTP Security Options',
      },
      {
        step: 5,
        title: 'Test Connection',
        description: 'Click "Test Connection" and send a test email to verify everything works.',
        screenshot: 'AgentForge – SMTP Test Email',
      },
    ],
    triggers: [
      {
        id: 'none',
        name: 'No Triggers',
        description: 'SMTP is for sending emails only. Use other triggers to initiate email sending.',
        whenItFires: 'N/A',
        exampleScenario: 'Combine with form submission trigger to send confirmation emails.',
        dataProvided: [],
      },
    ],
    actions: [
      {
        id: 'send_email',
        name: 'Send Email',
        description: 'Send an email via SMTP.',
        whenToUse: 'For any email sending needs.',
        requiredFields: ['From address', 'To address', 'Subject', 'Body'],
        optionalFields: ['CC', 'BCC', 'Reply-to', 'Attachments', 'HTML body'],
        example: 'Send password reset email with reset link.',
      },
    ],
    exampleFlow: {
      title: 'Password Reset Flow',
      scenario: 'Send password reset email when requested.',
      steps: [
        'User clicks "Forgot Password"',
        'System generates reset token',
        'SMTP action sends email with reset link',
        'User receives email and clicks link',
        'System validates token and allows password change',
      ],
    },
    troubleshooting: [
      {
        error: 'Connection refused',
        cause: 'Wrong port or server blocked.',
        solution: 'Verify server and port. Try alternate ports (587, 465, 25). Check firewall.',
      },
      {
        error: 'Authentication failed',
        cause: 'Wrong credentials or 2FA blocking.',
        solution: 'Use app password if 2FA is enabled. Verify username format.',
      },
      {
        error: 'TLS handshake failed',
        cause: 'Security settings mismatch.',
        solution: 'Try different TLS/SSL settings. Ensure server supports your chosen method.',
      },
      {
        error: 'Emails going to spam',
        cause: 'Missing SPF, DKIM, or DMARC records.',
        solution: 'Configure proper email authentication records in your DNS.',
      },
    ],
    bestPractices: [
      'Always use TLS or SSL - never plain text',
      'Use dedicated SMTP for transactional vs marketing emails',
      'Set up SPF, DKIM, and DMARC records',
      'Monitor deliverability rates',
      'Use app passwords instead of main account passwords',
      'Implement proper bounce handling',
    ],
    faq: [
      {
        question: 'Which port should I use?',
        answer: 'Port 587 with TLS is most common and recommended. Port 465 uses implicit SSL. Port 25 is legacy and often blocked.',
      },
      {
        question: 'Why are my emails going to spam?',
        answer: 'Likely missing SPF/DKIM/DMARC records, poor sender reputation, or spam-like content.',
      },
      {
        question: 'Can I use Gmail\'s SMTP?',
        answer: 'Yes. Use smtp.gmail.com:587 with TLS. You\'ll need an app password if 2FA is enabled.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SENDGRID
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sendgrid',
    name: 'SendGrid',
    icon: '📤',
    category: 'email',
    shortDescription: 'Send transactional emails via SendGrid',
    overview: {
      what: 'SendGrid integration provides enterprise-grade email delivery with analytics, templates, and high deliverability for your AI agent.',
      why: 'SendGrid handles billions of emails and offers superior deliverability, analytics, and scalability for high-volume email needs.',
      useCases: [
        'High-volume transactional emails',
        'Marketing campaigns',
        'Triggered email sequences',
        'Password resets and verifications',
        'Order notifications',
        'Newsletter delivery',
      ],
      targetAudience: 'Businesses needing reliable, scalable email delivery with analytics and high volume capabilities.',
    },
    prerequisites: {
      accounts: [
        'SendGrid account (free tier available)',
      ],
      permissions: [
        'API key with Mail Send permission',
      ],
      preparations: [
        'Verify your sending domain',
        'Create email templates (optional)',
        'Generate API key',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Create SendGrid Account',
        description: 'Go to sendgrid.com and sign up. Free tier includes 100 emails/day.',
        screenshot: 'SendGrid – Sign Up',
      },
      {
        step: 2,
        title: 'Verify Sending Domain',
        description: 'Go to Settings → Sender Authentication. Add and verify your domain with DNS records.',
        screenshot: 'SendGrid – Domain Verification',
        tip: 'Domain verification improves deliverability significantly.',
      },
      {
        step: 3,
        title: 'Create API Key',
        description: 'Go to Settings → API Keys → Create API Key. Select "Restricted Access" and enable "Mail Send".',
        screenshot: 'SendGrid – Create API Key',
      },
      {
        step: 4,
        title: 'Copy API Key',
        description: 'Copy the generated API key immediately - it won\'t be shown again.',
        screenshot: 'SendGrid – Copy API Key',
        warning: 'Save your API key securely! You cannot retrieve it later.',
      },
      {
        step: 5,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → SendGrid. Paste your API key and click "Connect".',
        screenshot: 'AgentForge – SendGrid Integration Form',
      },
      {
        step: 6,
        title: 'Test Email',
        description: 'Send a test email to verify the integration works.',
        screenshot: 'AgentForge – SendGrid Test',
      },
    ],
    triggers: [
      {
        id: 'email_event',
        name: 'Email Event Webhook',
        description: 'Fires when email events occur (delivered, opened, clicked, bounced).',
        whenItFires: 'When configured webhooks receive email status events.',
        exampleScenario: 'When email bounces, update contact status in CRM.',
        dataProvided: ['Event type', 'Email address', 'Timestamp', 'Message ID'],
      },
    ],
    actions: [
      {
        id: 'send_email',
        name: 'Send Email',
        description: 'Send a single email via SendGrid API.',
        whenToUse: 'For transactional emails and notifications.',
        requiredFields: ['To', 'From', 'Subject', 'Content'],
        optionalFields: ['CC', 'BCC', 'Template ID', 'Dynamic data'],
        example: 'Send order confirmation with dynamic order details.',
      },
      {
        id: 'send_template',
        name: 'Send Template Email',
        description: 'Send email using a pre-designed SendGrid template.',
        whenToUse: 'For branded emails with dynamic content.',
        requiredFields: ['To', 'From', 'Template ID', 'Dynamic data'],
        example: 'Send welcome email using branded template with user name.',
      },
    ],
    exampleFlow: {
      title: 'Welcome Email Sequence',
      scenario: 'Send welcome email when user signs up.',
      steps: [
        'User creates account on your platform',
        'Trigger: User Registered event fires',
        'Workflow prepares welcome data (name, login link)',
        'SendGrid action sends welcome template email',
        'User receives branded welcome email',
        'SendGrid tracks open and click events',
      ],
    },
    troubleshooting: [
      {
        error: 'API key invalid',
        cause: 'Key was revoked or copied incorrectly.',
        solution: 'Generate a new API key and update in AgentForge.',
      },
      {
        error: 'Domain not verified',
        cause: 'Sending from unverified domain.',
        solution: 'Complete domain verification in SendGrid settings.',
      },
      {
        error: 'Rate limit exceeded',
        cause: 'Exceeded your plan\'s sending limit.',
        solution: 'Upgrade your SendGrid plan or implement sending queues.',
      },
    ],
    bestPractices: [
      'Always verify your sending domain',
      'Use templates for consistent branding',
      'Set up webhook events for tracking',
      'Monitor deliverability analytics',
      'Segment your email lists',
      'Implement proper unsubscribe handling',
      'Use suppressions to respect user preferences',
    ],
    faq: [
      {
        question: 'How much does SendGrid cost?',
        answer: 'Free tier: 100 emails/day forever. Paid plans start at $15/month for 40,000 emails.',
      },
      {
        question: 'Do I need to verify my domain?',
        answer: 'Strongly recommended. Unverified domains have lower deliverability and daily limits.',
      },
      {
        question: 'Can I track email opens and clicks?',
        answer: 'Yes, SendGrid provides detailed analytics. Enable tracking in your account settings.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAILCHIMP
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    icon: '🐵',
    category: 'email',
    shortDescription: 'Add contacts to Mailchimp lists and send campaigns',
    overview: {
      what: 'Mailchimp integration allows your AI agent to manage email subscribers, add contacts to lists, and trigger email campaigns.',
      why: 'Mailchimp is the leading email marketing platform. Automatically grow your list and nurture leads with targeted campaigns.',
      useCases: [
        'Lead capture to email list',
        'Automated welcome sequences',
        'Abandoned cart emails',
        'Newsletter subscription',
        'Segment-based campaigns',
        'Re-engagement campaigns',
      ],
      targetAudience: 'Marketers and businesses using Mailchimp for email marketing who want to automate list building and engagement.',
    },
    prerequisites: {
      accounts: [
        'Mailchimp account (free tier available)',
      ],
      permissions: [
        'API key access',
        'Audience management rights',
      ],
      preparations: [
        'Create at least one audience (list)',
        'Set up merge fields for contact data',
        'Generate API key',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Log into Mailchimp',
        description: 'Go to mailchimp.com and log into your account.',
        screenshot: 'Mailchimp – Dashboard',
      },
      {
        step: 2,
        title: 'Go to API Keys',
        description: 'Click your profile → Account & billing → Extras → API keys.',
        screenshot: 'Mailchimp – API Keys Page',
      },
      {
        step: 3,
        title: 'Create API Key',
        description: 'Click "Create A Key" and give it a name (e.g., "AgentForge Integration").',
        screenshot: 'Mailchimp – Create API Key',
      },
      {
        step: 4,
        title: 'Copy API Key',
        description: 'Copy the generated API key.',
        screenshot: 'Mailchimp – Copy API Key',
      },
      {
        step: 5,
        title: 'Get Audience ID',
        description: 'Go to Audience → All contacts → Settings → Audience name and defaults. Copy the Audience ID.',
        screenshot: 'Mailchimp – Audience ID',
      },
      {
        step: 6,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge → Integrations → Mailchimp. Enter API key and Audience ID.',
        screenshot: 'AgentForge – Mailchimp Integration Form',
      },
      {
        step: 7,
        title: 'Test Connection',
        description: 'Click "Test Connection" to verify access to your Mailchimp audience.',
        screenshot: 'AgentForge – Mailchimp Test',
      },
    ],
    triggers: [
      {
        id: 'subscriber_added',
        name: 'Subscriber Added',
        description: 'Fires when a new subscriber is added to your audience.',
        whenItFires: 'When someone subscribes via form or API.',
        exampleScenario: 'When new subscriber joins, send welcome message via WhatsApp.',
        dataProvided: ['Email', 'Name', 'Tags', 'Source'],
      },
    ],
    actions: [
      {
        id: 'add_subscriber',
        name: 'Add/Update Subscriber',
        description: 'Add a new subscriber or update existing contact.',
        whenToUse: 'When capturing leads or updating contact info.',
        requiredFields: ['Email address'],
        optionalFields: ['First name', 'Last name', 'Tags', 'Custom fields'],
        example: 'Add lead from chatbot conversation to newsletter list.',
      },
      {
        id: 'add_tags',
        name: 'Add Tags',
        description: 'Add tags to a subscriber for segmentation.',
        whenToUse: 'To segment contacts based on behavior or interests.',
        requiredFields: ['Email address', 'Tags'],
        example: 'Tag subscribers who showed interest in specific products.',
      },
      {
        id: 'trigger_automation',
        name: 'Trigger Automation',
        description: 'Start a Mailchimp automation for a subscriber.',
        whenToUse: 'To enroll contacts in email sequences.',
        requiredFields: ['Email address', 'Automation ID'],
        example: 'Trigger welcome series when lead is captured.',
      },
    ],
    exampleFlow: {
      title: 'Lead Capture to Nurture Flow',
      scenario: 'Capture lead and start email nurture sequence.',
      steps: [
        'Visitor asks about products via chatbot',
        'AI Agent collects email address',
        'Mailchimp action adds subscriber with "interested" tag',
        'Trigger automation action starts product nurture sequence',
        'Subscriber receives targeted email series',
        'AI tracks engagement for follow-up',
      ],
    },
    troubleshooting: [
      {
        error: 'API key invalid',
        cause: 'Key was deleted or incorrectly copied.',
        solution: 'Generate a new API key and update in AgentForge.',
      },
      {
        error: 'Member exists with different signup',
        cause: 'Email already in list with different status.',
        solution: 'Use "Add/Update" action to update existing members.',
      },
      {
        error: 'Invalid resource',
        cause: 'Wrong Audience ID or ID doesn\'t exist.',
        solution: 'Verify the Audience ID from Mailchimp settings.',
      },
    ],
    bestPractices: [
      'Always get proper consent before adding subscribers',
      'Use double opt-in for quality lists',
      'Tag subscribers for better segmentation',
      'Clean your list regularly',
      'Personalize with merge fields',
      'Test emails before sending campaigns',
    ],
    faq: [
      {
        question: 'Is Mailchimp free?',
        answer: 'Yes, free plan includes up to 500 contacts and 1,000 emails/month.',
      },
      {
        question: 'Can I send emails directly?',
        answer: 'This integration manages subscribers. For direct email, create campaigns in Mailchimp or use their API.',
      },
      {
        question: 'What happens if email already exists?',
        answer: 'Using "Add/Update" action will update the existing contact instead of creating a duplicate.',
      },
    ],
  },
];
