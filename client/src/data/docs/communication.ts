import { IntegrationDoc } from './types';

export const communicationDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // WHATSAPP BUSINESS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: '💬',
    category: 'communication',
    shortDescription: 'Send messages, templates, and media via WhatsApp Business API',
    overview: {
      what: 'WhatsApp Business integration allows your AI agent to communicate with customers through WhatsApp, the world\'s most popular messaging platform with over 2 billion users.',
      why: 'Reach customers on their preferred messaging app. WhatsApp has 98% open rates compared to 20% for email, making it perfect for customer support, notifications, and engagement.',
      useCases: [
        'Automated customer support 24/7',
        'Order confirmations and shipping updates',
        'Appointment reminders and scheduling',
        'Lead qualification and nurturing',
        'Product recommendations and catalogs',
        'Payment reminders and invoices',
      ],
      targetAudience: 'Businesses of all sizes looking to provide instant customer support and automate communications on WhatsApp.',
    },
    prerequisites: {
      accounts: [
        'Meta Business Account (free)',
        'WhatsApp Business Account',
        'Facebook Developer Account',
      ],
      permissions: [
        'Business verification on Meta',
        'WhatsApp Business API access',
        'Phone number for WhatsApp (not linked to personal WhatsApp)',
      ],
      preparations: [
        'Prepare a dedicated phone number for business use',
        'Have your business documents ready for verification',
        'Plan your message templates in advance',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Create a Meta Business Account',
        description: 'Go to business.facebook.com and create a Meta Business Account if you don\'t have one. This is required to access WhatsApp Business API.',
        screenshot: 'Meta Business Suite – Create Account Page',
        tip: 'Use your official business email for verification purposes.',
      },
      {
        step: 2,
        title: 'Set Up WhatsApp Business Account',
        description: 'In Meta Business Suite, go to Settings → WhatsApp Accounts and click "Add" to create a new WhatsApp Business Account.',
        screenshot: 'Meta Business Suite – WhatsApp Accounts Section',
      },
      {
        step: 3,
        title: 'Add a Phone Number',
        description: 'Add a phone number to your WhatsApp Business Account. This number will be used to send and receive messages. Make sure it\'s not already linked to any WhatsApp account.',
        screenshot: 'WhatsApp Business – Add Phone Number',
        warning: 'The phone number cannot be currently registered with WhatsApp. You may need to delete the existing WhatsApp account on that number first.',
      },
      {
        step: 4,
        title: 'Create a System User',
        description: 'Go to Business Settings → Users → System Users and create a new system user. Assign it the WhatsApp Business Account with full control.',
        screenshot: 'Meta Business – System User Creation',
      },
      {
        step: 5,
        title: 'Generate Access Token',
        description: 'For the system user, click "Generate Token" and select the required permissions: whatsapp_business_messaging, whatsapp_business_management.',
        screenshot: 'Meta Business – Generate Access Token',
        tip: 'Copy the token immediately - it won\'t be shown again!',
      },
      {
        step: 6,
        title: 'Get Phone Number ID',
        description: 'In WhatsApp Manager, go to your phone number settings and copy the Phone Number ID (a long numeric string).',
        screenshot: 'WhatsApp Manager – Phone Number ID',
      },
      {
        step: 7,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge Dashboard → Integrations → WhatsApp Business. Enter your Access Token and Phone Number ID, then click "Connect".',
        screenshot: 'AgentForge – WhatsApp Integration Form',
      },
      {
        step: 8,
        title: 'Verify Connection',
        description: 'Click "Test Connection" to verify everything is working. Send a test message to confirm.',
        screenshot: 'AgentForge – WhatsApp Connection Success',
      },
    ],
    triggers: [
      {
        id: 'message_received',
        name: 'Message Received',
        description: 'Fires when a customer sends any message to your WhatsApp Business number.',
        whenItFires: 'Every time a text, image, document, or voice message is received.',
        exampleScenario: 'A customer sends "Hi, what are your business hours?" and the AI agent responds automatically.',
        dataProvided: ['Sender phone number', 'Message content', 'Message type', 'Timestamp', 'Media URL (if applicable)'],
      },
      {
        id: 'message_status',
        name: 'Message Status Update',
        description: 'Fires when the status of a sent message changes.',
        whenItFires: 'When a message is sent, delivered, read, or fails.',
        exampleScenario: 'Track if your promotional message was delivered and read by the customer.',
        dataProvided: ['Message ID', 'Status (sent/delivered/read/failed)', 'Timestamp', 'Recipient number'],
      },
    ],
    actions: [
      {
        id: 'send_text',
        name: 'Send Text Message',
        description: 'Send a plain text message to a WhatsApp user.',
        whenToUse: 'For simple responses, confirmations, or follow-ups.',
        requiredFields: ['Recipient phone number', 'Message text'],
        example: 'Send "Your order #12345 has been confirmed!" to customer.',
      },
      {
        id: 'send_template',
        name: 'Send Template Message',
        description: 'Send a pre-approved message template. Required for initiating conversations.',
        whenToUse: 'For first contact, notifications, or promotional messages.',
        requiredFields: ['Recipient phone number', 'Template name', 'Template parameters'],
        optionalFields: ['Language code', 'Header media'],
        example: 'Send appointment reminder template with date and time variables.',
      },
      {
        id: 'send_media',
        name: 'Send Media Message',
        description: 'Send images, documents, audio, or video files.',
        whenToUse: 'For product images, receipts, brochures, or voice responses.',
        requiredFields: ['Recipient phone number', 'Media URL', 'Media type'],
        optionalFields: ['Caption'],
        example: 'Send product catalog PDF or order invoice to customer.',
      },
      {
        id: 'send_interactive',
        name: 'Send Interactive Message',
        description: 'Send messages with buttons or list menus for easy selection.',
        whenToUse: 'For menus, quick replies, or multiple choice options.',
        requiredFields: ['Recipient phone number', 'Message body', 'Buttons or List items'],
        example: 'Send "How can I help?" with buttons: Support, Sales, Billing.',
      },
    ],
    exampleFlow: {
      title: 'Customer Support Flow',
      scenario: 'A customer asks about their order status via WhatsApp.',
      steps: [
        'Customer sends: "Where is my order #12345?"',
        'Trigger: Message Received fires',
        'AI Agent extracts order number from message',
        'Agent queries your order database via API integration',
        'Agent finds order is "Out for Delivery"',
        'Action: Send Text Message with order status',
        'Customer receives: "Your order #12345 is out for delivery and will arrive by 5 PM today! 📦"',
      ],
    },
    troubleshooting: [
      {
        error: 'Message failed to send - Token expired',
        cause: 'Your access token has expired (tokens expire after 60 days by default).',
        solution: 'Generate a new access token in Meta Business Suite and update it in AgentForge.',
      },
      {
        error: 'Template message rejected',
        cause: 'The message template is not approved or parameters don\'t match.',
        solution: 'Check template approval status in WhatsApp Manager. Ensure parameter count and format match the template.',
      },
      {
        error: 'Cannot send message - 24 hour window closed',
        cause: 'You can only send free-form messages within 24 hours of customer\'s last message.',
        solution: 'Use an approved template message to re-initiate the conversation.',
      },
      {
        error: 'Phone number not registered',
        cause: 'The recipient\'s phone number is not on WhatsApp.',
        solution: 'Verify the phone number format (include country code) and confirm the user has WhatsApp.',
      },
    ],
    bestPractices: [
      'Always use templates for first contact - free-form messages only work within 24-hour window',
      'Keep messages concise - WhatsApp is for quick conversations',
      'Use interactive buttons to guide customers through options',
      'Respond quickly - customers expect fast replies on WhatsApp',
      'Include opt-out instructions in promotional messages',
      'Test templates thoroughly before launching campaigns',
      'Monitor message delivery rates and adjust accordingly',
      'Use media messages sparingly - they consume more bandwidth',
    ],
    faq: [
      {
        question: 'Do I need a special phone number for WhatsApp Business?',
        answer: 'Yes, you need a phone number that is NOT currently registered with WhatsApp. You can use a landline or mobile number. Once connected to Business API, it cannot be used for regular WhatsApp.',
      },
      {
        question: 'How much does WhatsApp Business API cost?',
        answer: 'Meta charges per conversation (24-hour session). Prices vary by country and conversation type (marketing, utility, service). First 1,000 service conversations per month are free.',
      },
      {
        question: 'Can I send promotional messages to anyone?',
        answer: 'No, customers must opt-in to receive marketing messages. You can only send promotional templates to users who have consented.',
      },
      {
        question: 'What\'s the difference between template and session messages?',
        answer: 'Template messages are pre-approved and can be sent anytime. Session messages are free-form but only allowed within 24 hours of customer\'s last message.',
      },
      {
        question: 'How long does business verification take?',
        answer: 'Business verification typically takes 2-5 business days. Have your business documents ready to speed up the process.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TELEGRAM
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    category: 'communication',
    shortDescription: 'Send messages and files to Telegram chats and channels',
    overview: {
      what: 'Telegram integration enables your AI agent to communicate through Telegram bots, reaching users on this fast-growing messaging platform with 800+ million active users.',
      why: 'Telegram is popular for its speed, security, and bot-friendly ecosystem. It\'s perfect for tech-savvy audiences, communities, and international customers.',
      useCases: [
        'Customer support bots',
        'Community management',
        'News and update channels',
        'Notification alerts',
        'Group moderation',
        'Interactive surveys and polls',
      ],
      targetAudience: 'Businesses targeting tech-savvy users, crypto communities, international audiences, or those needing group/channel management.',
    },
    prerequisites: {
      accounts: [
        'Telegram account (free)',
      ],
      permissions: [
        'Ability to create bots via BotFather',
      ],
      preparations: [
        'Think of a unique bot name and username',
        'Prepare a bot profile picture',
        'Plan your bot commands',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Open Telegram and Find BotFather',
        description: 'Open Telegram and search for "@BotFather" - this is Telegram\'s official bot for creating and managing bots.',
        screenshot: 'Telegram – Search for BotFather',
        tip: 'Look for the verified checkmark to ensure you\'re messaging the official BotFather.',
      },
      {
        step: 2,
        title: 'Create a New Bot',
        description: 'Send /newbot command to BotFather. It will ask you for a display name and username for your bot.',
        screenshot: 'BotFather – /newbot Command',
      },
      {
        step: 3,
        title: 'Choose Bot Name and Username',
        description: 'Enter a friendly name (e.g., "My Business Support") and a unique username ending in "bot" (e.g., "mybusiness_support_bot").',
        screenshot: 'BotFather – Bot Name and Username',
        warning: 'Username must be unique and end with "bot". If taken, try adding numbers or your company name.',
      },
      {
        step: 4,
        title: 'Copy Your Bot Token',
        description: 'BotFather will give you an API token. This is your secret key - copy it immediately!',
        screenshot: 'BotFather – Bot Token Display',
        warning: 'Never share your bot token publicly! Anyone with this token can control your bot.',
      },
      {
        step: 5,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge Dashboard → Integrations → Telegram. Paste your bot token and click "Connect".',
        screenshot: 'AgentForge – Telegram Integration Form',
      },
      {
        step: 6,
        title: 'Set Up Webhook (Automatic)',
        description: 'AgentForge automatically configures the webhook URL for your bot. This allows real-time message receiving.',
        screenshot: 'AgentForge – Telegram Webhook Setup',
      },
      {
        step: 7,
        title: 'Test Your Bot',
        description: 'Open your bot in Telegram (search for your bot username), send a message, and verify it appears in AgentForge.',
        screenshot: 'Telegram – Test Bot Conversation',
      },
    ],
    triggers: [
      {
        id: 'message_received',
        name: 'Message Received',
        description: 'Fires when any message is sent to your bot or in a group where your bot is admin.',
        whenItFires: 'Every time a text, photo, document, sticker, or other message type is received.',
        exampleScenario: 'User sends "What services do you offer?" and the AI responds with your service list.',
        dataProvided: ['Chat ID', 'User ID', 'Username', 'Message text', 'Message type', 'Media files'],
      },
      {
        id: 'command_received',
        name: 'Command Received',
        description: 'Fires when a user sends a command starting with "/" (e.g., /start, /help).',
        whenItFires: 'When messages starting with "/" are sent.',
        exampleScenario: 'User sends "/start" and receives a welcome message with menu options.',
        dataProvided: ['Command name', 'Arguments', 'Chat ID', 'User info'],
      },
      {
        id: 'callback_query',
        name: 'Button Clicked',
        description: 'Fires when a user clicks an inline keyboard button.',
        whenItFires: 'When inline buttons are pressed.',
        exampleScenario: 'User clicks "View Products" button and receives a product catalog.',
        dataProvided: ['Callback data', 'Message ID', 'Chat ID', 'User info'],
      },
    ],
    actions: [
      {
        id: 'send_message',
        name: 'Send Message',
        description: 'Send a text message to a user or group.',
        whenToUse: 'For responses, notifications, or updates.',
        requiredFields: ['Chat ID', 'Message text'],
        optionalFields: ['Parse mode (HTML/Markdown)', 'Disable notification'],
        example: 'Send "Welcome! How can I help you today?" to new users.',
      },
      {
        id: 'send_photo',
        name: 'Send Photo',
        description: 'Send an image with optional caption.',
        whenToUse: 'For product images, infographics, or visual content.',
        requiredFields: ['Chat ID', 'Photo URL or file'],
        optionalFields: ['Caption'],
        example: 'Send product image with price and description as caption.',
      },
      {
        id: 'send_document',
        name: 'Send Document',
        description: 'Send files like PDFs, spreadsheets, or any document.',
        whenToUse: 'For reports, invoices, catalogs, or downloadable content.',
        requiredFields: ['Chat ID', 'Document URL or file'],
        optionalFields: ['Caption', 'Filename'],
        example: 'Send price list PDF to interested customers.',
      },
      {
        id: 'send_buttons',
        name: 'Send Inline Keyboard',
        description: 'Send a message with clickable inline buttons.',
        whenToUse: 'For menus, options, or interactive choices.',
        requiredFields: ['Chat ID', 'Message text', 'Button layout'],
        example: 'Send "Choose a category:" with buttons for Products, Services, Support.',
      },
    ],
    exampleFlow: {
      title: 'Product Inquiry Flow',
      scenario: 'A user asks about your products via Telegram bot.',
      steps: [
        'User opens bot and sends /start',
        'Trigger: Command Received fires',
        'AI sends welcome message with category buttons',
        'User clicks "View Products" button',
        'Trigger: Button Clicked fires',
        'AI fetches product list and sends photo carousel',
        'User asks "What\'s the price of Product X?"',
        'AI extracts product name, queries database, responds with price',
      ],
    },
    troubleshooting: [
      {
        error: 'Bot not responding to messages',
        cause: 'Webhook may not be configured correctly or bot token is invalid.',
        solution: 'Verify your bot token in AgentForge. Re-save the integration to refresh the webhook.',
      },
      {
        error: 'Cannot send message - Chat not found',
        cause: 'The user may have blocked the bot or the chat ID is invalid.',
        solution: 'Users must initiate conversation with the bot first. You cannot message users who haven\'t started the bot.',
      },
      {
        error: 'Bot not receiving group messages',
        cause: 'Bot doesn\'t have admin rights or privacy mode is enabled.',
        solution: 'Make the bot an admin in the group, or disable privacy mode via BotFather (/setprivacy).',
      },
      {
        error: 'Rate limit exceeded',
        cause: 'Sending too many messages too quickly (Telegram limits ~30 messages/second).',
        solution: 'Implement delays between bulk messages. Use broadcast queuing for large audiences.',
      },
    ],
    bestPractices: [
      'Set up /start and /help commands for better user experience',
      'Use inline keyboards for easy navigation',
      'Keep messages concise - Telegram users expect quick interactions',
      'Use Markdown formatting for better readability',
      'Set a profile picture and description for your bot via BotFather',
      'Enable group privacy mode unless you need all group messages',
      'Use reply keyboards for frequent actions',
      'Test your bot thoroughly before launching',
    ],
    faq: [
      {
        question: 'Is Telegram bot creation free?',
        answer: 'Yes, creating Telegram bots is completely free. There are no API costs or message fees.',
      },
      {
        question: 'Can my bot message users first?',
        answer: 'No, users must start a conversation with your bot first by sending /start. After that, you can send messages anytime.',
      },
      {
        question: 'Can I use one bot for multiple businesses?',
        answer: 'Technically yes, but it\'s recommended to create separate bots for each business for clarity and management.',
      },
      {
        question: 'How do I add my bot to a group?',
        answer: 'Open the group, click "Add Members", search for your bot username, and add it. Make it admin if it needs to read all messages.',
      },
      {
        question: 'What\'s the message size limit?',
        answer: 'Text messages can be up to 4096 characters. Files can be up to 50MB (2GB for bots with local API).',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SLACK
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'slack',
    name: 'Slack',
    icon: '💼',
    category: 'communication',
    shortDescription: 'Post messages to Slack channels and workspaces',
    overview: {
      what: 'Slack integration allows your AI agent to send notifications, alerts, and messages to Slack channels, keeping your team informed in real-time.',
      why: 'Slack is the hub for team communication. Integrating AI notifications ensures critical updates reach your team instantly where they already work.',
      useCases: [
        'Lead notifications to sales team',
        'Customer support escalations',
        'Order alerts for operations',
        'Error monitoring alerts',
        'Daily summary reports',
        'Team task assignments',
      ],
      targetAudience: 'Teams using Slack for internal communication who want automated notifications and AI-powered alerts.',
    },
    prerequisites: {
      accounts: [
        'Slack workspace (free or paid)',
        'Admin access to add apps (or request from admin)',
      ],
      permissions: [
        'Permission to add incoming webhooks',
        'Access to target channels',
      ],
      preparations: [
        'Decide which channels should receive notifications',
        'Plan notification formats and frequency',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Go to Slack API',
        description: 'Visit api.slack.com and sign in with your Slack workspace credentials.',
        screenshot: 'Slack API Homepage',
      },
      {
        step: 2,
        title: 'Create New App',
        description: 'Click "Create New App" → "From scratch". Name your app (e.g., "AgentForge Notifications") and select your workspace.',
        screenshot: 'Slack – Create New App',
      },
      {
        step: 3,
        title: 'Enable Incoming Webhooks',
        description: 'In your app settings, go to "Incoming Webhooks" and toggle it ON.',
        screenshot: 'Slack – Enable Incoming Webhooks',
      },
      {
        step: 4,
        title: 'Add Webhook to Channel',
        description: 'Click "Add New Webhook to Workspace" and select the channel where you want notifications to appear.',
        screenshot: 'Slack – Select Channel for Webhook',
      },
      {
        step: 5,
        title: 'Copy Webhook URL',
        description: 'Copy the generated Webhook URL. This is what AgentForge will use to send messages.',
        screenshot: 'Slack – Copy Webhook URL',
        tip: 'You can create multiple webhooks for different channels.',
      },
      {
        step: 6,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge Dashboard → Integrations → Slack. Paste your Webhook URL and optionally set a default channel name.',
        screenshot: 'AgentForge – Slack Integration Form',
      },
      {
        step: 7,
        title: 'Test the Connection',
        description: 'Click "Test Connection" to send a test message to your Slack channel.',
        screenshot: 'Slack – Test Message Received',
      },
    ],
    triggers: [
      {
        id: 'internal_event',
        name: 'Internal Event (Outbound Only)',
        description: 'Slack webhooks are outbound-only. Triggers come from other events in your system.',
        whenItFires: 'N/A - Slack integration sends messages based on other triggers.',
        exampleScenario: 'When a new lead is captured, send notification to #sales channel.',
        dataProvided: ['N/A - Outbound only'],
      },
    ],
    actions: [
      {
        id: 'send_message',
        name: 'Send Message',
        description: 'Send a text message to your Slack channel.',
        whenToUse: 'For notifications, alerts, and updates.',
        requiredFields: ['Message text'],
        optionalFields: ['Channel override', 'Username', 'Icon emoji'],
        example: 'Send "🎉 New lead captured: John Doe (john@company.com)"',
      },
      {
        id: 'send_rich_message',
        name: 'Send Rich Message',
        description: 'Send formatted messages with attachments, colors, and fields.',
        whenToUse: 'For detailed notifications with structured data.',
        requiredFields: ['Message blocks or attachments'],
        optionalFields: ['Color', 'Author', 'Footer'],
        example: 'Send lead card with name, email, phone, and source as formatted fields.',
      },
    ],
    exampleFlow: {
      title: 'Lead Alert Flow',
      scenario: 'Notify sales team when a new lead is captured.',
      steps: [
        'Customer fills out contact form on website',
        'AI Agent captures lead information',
        'Trigger: Lead Captured event fires',
        'Workflow sends lead data to Slack action',
        'Sales team receives formatted notification in #leads channel',
        'Team member claims the lead by reacting with emoji',
      ],
    },
    troubleshooting: [
      {
        error: 'Message not appearing in channel',
        cause: 'Webhook URL is incorrect or expired.',
        solution: 'Generate a new webhook URL in Slack and update it in AgentForge.',
      },
      {
        error: 'Channel not found',
        cause: 'The webhook is linked to a deleted or renamed channel.',
        solution: 'Create a new webhook for the correct channel.',
      },
      {
        error: 'Posting to this channel is not allowed',
        cause: 'The channel has restricted permissions.',
        solution: 'Ask a channel admin to allow your app to post, or use a different channel.',
      },
    ],
    bestPractices: [
      'Use rich formatting to make messages scannable',
      'Include action links in notifications',
      'Don\'t flood channels - batch low-priority notifications',
      'Use different channels for different notification types',
      'Add emojis for visual categorization',
      'Include timestamps and relevant context',
      'Set up channel-specific webhooks for better organization',
    ],
    faq: [
      {
        question: 'Can I send messages to multiple channels?',
        answer: 'Yes, create a separate webhook for each channel and configure multiple Slack actions in your workflow.',
      },
      {
        question: 'Can I receive messages from Slack?',
        answer: 'This integration uses incoming webhooks (outbound only). For bidirectional communication, you would need a full Slack bot.',
      },
      {
        question: 'Are there message limits?',
        answer: 'Slack allows 1 message per second per webhook. For higher volumes, implement queuing.',
      },
      {
        question: 'Can I mention users in messages?',
        answer: 'Yes, use <@USER_ID> format to mention users or <!channel> to notify everyone.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCORD
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    category: 'communication',
    shortDescription: 'Send messages to Discord servers and channels',
    overview: {
      what: 'Discord integration enables your AI agent to send notifications and messages to Discord servers via webhooks, perfect for community engagement.',
      why: 'Discord is popular for gaming, crypto, NFT, and tech communities. Reach engaged audiences where they spend their time.',
      useCases: [
        'Community announcements',
        'Product launch notifications',
        'Support ticket alerts',
        'Event reminders',
        'Server activity notifications',
        'Moderation alerts',
      ],
      targetAudience: 'Businesses with Discord communities, gaming companies, crypto/NFT projects, and tech communities.',
    },
    prerequisites: {
      accounts: [
        'Discord account',
        'Discord server with admin permissions',
      ],
      permissions: [
        'Manage Webhooks permission in the target channel',
      ],
      preparations: [
        'Choose the channel for notifications',
        'Plan your message format and branding',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Open Discord Server Settings',
        description: 'Go to your Discord server, click the server name, and select "Server Settings".',
        screenshot: 'Discord – Server Settings',
      },
      {
        step: 2,
        title: 'Go to Integrations',
        description: 'In the left sidebar, click "Integrations".',
        screenshot: 'Discord – Integrations Menu',
      },
      {
        step: 3,
        title: 'Create Webhook',
        description: 'Click "Webhooks" → "New Webhook". Choose the channel where messages should be posted.',
        screenshot: 'Discord – Create Webhook',
      },
      {
        step: 4,
        title: 'Customize Webhook',
        description: 'Give your webhook a name (e.g., "AgentForge Bot") and optionally upload an avatar.',
        screenshot: 'Discord – Customize Webhook',
      },
      {
        step: 5,
        title: 'Copy Webhook URL',
        description: 'Click "Copy Webhook URL" to copy the URL to your clipboard.',
        screenshot: 'Discord – Copy Webhook URL',
        warning: 'Keep this URL secret! Anyone with it can post to your channel.',
      },
      {
        step: 6,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge Dashboard → Integrations → Discord. Paste the webhook URL and click "Connect".',
        screenshot: 'AgentForge – Discord Integration Form',
      },
      {
        step: 7,
        title: 'Send Test Message',
        description: 'Click "Test Connection" to verify the webhook works.',
        screenshot: 'Discord – Test Message in Channel',
      },
    ],
    triggers: [
      {
        id: 'internal_event',
        name: 'Internal Event (Outbound Only)',
        description: 'Discord webhooks are for sending messages only. Triggers come from other system events.',
        whenItFires: 'N/A - Used for outbound notifications.',
        exampleScenario: 'When a user signs up, send welcome announcement to Discord.',
        dataProvided: ['N/A - Outbound only'],
      },
    ],
    actions: [
      {
        id: 'send_message',
        name: 'Send Message',
        description: 'Send a text message to the Discord channel.',
        whenToUse: 'For announcements, alerts, and notifications.',
        requiredFields: ['Message content'],
        optionalFields: ['Username override', 'Avatar URL'],
        example: 'Send "🚀 New product launched! Check it out: [link]"',
      },
      {
        id: 'send_embed',
        name: 'Send Embed',
        description: 'Send rich embedded messages with colors, fields, and images.',
        whenToUse: 'For detailed announcements with structured information.',
        requiredFields: ['Embed title', 'Embed description'],
        optionalFields: ['Color', 'Image', 'Fields', 'Footer', 'Thumbnail'],
        example: 'Send product announcement embed with image, description, and price.',
      },
    ],
    exampleFlow: {
      title: 'Product Launch Announcement',
      scenario: 'Announce a new product to your Discord community.',
      steps: [
        'Admin triggers product launch in your system',
        'Workflow detects new product event',
        'Discord action sends rich embed message',
        'Community sees announcement with product image, description, and link',
        'Members react and discuss in the channel',
      ],
    },
    troubleshooting: [
      {
        error: 'Webhook not working',
        cause: 'Webhook URL is invalid or deleted.',
        solution: 'Create a new webhook and update the URL in AgentForge.',
      },
      {
        error: 'Message not appearing',
        cause: 'You might be rate limited (Discord allows 30 requests/minute per webhook).',
        solution: 'Reduce message frequency or create multiple webhooks.',
      },
      {
        error: 'Embed not displaying correctly',
        cause: 'Embed structure is invalid.',
        solution: 'Verify embed fields follow Discord\'s format. Use Discord\'s embed visualizer to test.',
      },
    ],
    bestPractices: [
      'Use embeds for important announcements',
      'Match your webhook avatar to your brand',
      'Don\'t spam - respect your community',
      'Use @everyone and @here mentions sparingly',
      'Include relevant links and CTAs',
      'Add timestamps to time-sensitive content',
      'Create separate webhooks for different notification types',
    ],
    faq: [
      {
        question: 'Can I receive messages from Discord?',
        answer: 'Webhooks are one-way (sending only). For receiving messages, you would need a full Discord bot.',
      },
      {
        question: 'Can I send to multiple channels?',
        answer: 'Yes, create a webhook for each channel and set up separate Discord actions.',
      },
      {
        question: 'Can I mention roles or users?',
        answer: 'Yes, use <@USER_ID> for users and <@&ROLE_ID> for roles in your message.',
      },
      {
        question: 'What are the rate limits?',
        answer: 'Discord allows 30 requests per minute per webhook. Exceeding this results in temporary blocks.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TWILIO SMS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sms_twilio',
    name: 'Twilio SMS',
    icon: '📱',
    category: 'communication',
    shortDescription: 'Send SMS messages via Twilio',
    overview: {
      what: 'Twilio SMS integration allows your AI agent to send text messages to phone numbers worldwide using Twilio\'s reliable messaging infrastructure.',
      why: 'SMS has 98% open rates and works on any phone, even without internet. Perfect for urgent notifications, verification codes, and reaching customers who prefer text.',
      useCases: [
        'Appointment reminders',
        'Order status updates',
        'Two-factor authentication',
        'Delivery notifications',
        'Emergency alerts',
        'Marketing campaigns (with consent)',
      ],
      targetAudience: 'Businesses needing reliable SMS delivery for notifications, alerts, and customer communication.',
    },
    prerequisites: {
      accounts: [
        'Twilio account (free trial available)',
      ],
      permissions: [
        'Twilio phone number (purchased or toll-free)',
      ],
      preparations: [
        'Verify your Twilio account',
        'Purchase a phone number with SMS capability',
        'For marketing: understand compliance requirements',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Create Twilio Account',
        description: 'Go to twilio.com and sign up for a free account. Verify your email and phone number.',
        screenshot: 'Twilio – Sign Up Page',
      },
      {
        step: 2,
        title: 'Get a Phone Number',
        description: 'In Twilio Console, go to Phone Numbers → Buy a Number. Choose a number with SMS capability.',
        screenshot: 'Twilio – Buy Phone Number',
        tip: 'Toll-free numbers are better for marketing. Local numbers for personal touch.',
      },
      {
        step: 3,
        title: 'Find Account SID',
        description: 'On your Twilio Console dashboard, find and copy your Account SID.',
        screenshot: 'Twilio Console – Account SID',
      },
      {
        step: 4,
        title: 'Find Auth Token',
        description: 'On the same dashboard, click "Show" next to Auth Token and copy it.',
        screenshot: 'Twilio Console – Auth Token',
        warning: 'Keep your Auth Token secret! Regenerate it if compromised.',
      },
      {
        step: 5,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge Dashboard → Integrations → Twilio SMS. Enter Account SID, Auth Token, and your Twilio phone number.',
        screenshot: 'AgentForge – Twilio Integration Form',
      },
      {
        step: 6,
        title: 'Test SMS',
        description: 'Click "Test Connection" and enter a phone number to receive a test SMS.',
        screenshot: 'AgentForge – Twilio Test SMS',
      },
    ],
    triggers: [
      {
        id: 'sms_received',
        name: 'SMS Received',
        description: 'Fires when someone texts your Twilio number.',
        whenItFires: 'When an SMS is received on your Twilio number.',
        exampleScenario: 'Customer texts "STATUS" to check their order status.',
        dataProvided: ['From number', 'Message body', 'Timestamp', 'Media URLs (if MMS)'],
      },
    ],
    actions: [
      {
        id: 'send_sms',
        name: 'Send SMS',
        description: 'Send a text message to any phone number.',
        whenToUse: 'For notifications, alerts, reminders, and updates.',
        requiredFields: ['To phone number', 'Message body'],
        optionalFields: ['Status callback URL'],
        example: 'Send "Your appointment is tomorrow at 2 PM. Reply YES to confirm."',
      },
      {
        id: 'send_mms',
        name: 'Send MMS',
        description: 'Send a message with media (images, videos).',
        whenToUse: 'For visual content like receipts, product images, or promotional graphics.',
        requiredFields: ['To phone number', 'Media URL'],
        optionalFields: ['Message body'],
        example: 'Send order receipt image with "Here\'s your receipt!"',
      },
    ],
    exampleFlow: {
      title: 'Appointment Reminder Flow',
      scenario: 'Send SMS reminder before scheduled appointments.',
      steps: [
        'System checks appointments scheduled for next day',
        'Trigger: Scheduled task runs at 6 PM daily',
        'Workflow fetches all tomorrow\'s appointments',
        'For each appointment, Twilio action sends SMS',
        'Customer receives: "Reminder: Your appointment is tomorrow at 2 PM. Reply YES to confirm."',
        'Customer replies YES',
        'Trigger: SMS Received fires',
        'AI updates appointment as confirmed',
      ],
    },
    troubleshooting: [
      {
        error: 'SMS not delivered',
        cause: 'Invalid phone number format or carrier blocking.',
        solution: 'Use E.164 format (+1234567890). Check Twilio logs for specific error codes.',
      },
      {
        error: 'Error code 21211 - Invalid phone number',
        cause: 'The "To" number is not a valid phone number.',
        solution: 'Verify the phone number format includes country code.',
      },
      {
        error: 'Error code 21614 - Number not SMS capable',
        cause: 'Your Twilio number doesn\'t have SMS capability.',
        solution: 'Purchase a new number with SMS capability or enable SMS on your existing number.',
      },
      {
        error: 'Trial account restrictions',
        cause: 'Trial accounts can only send to verified numbers.',
        solution: 'Upgrade your Twilio account or add the recipient to verified numbers.',
      },
    ],
    bestPractices: [
      'Always include opt-out instructions for marketing messages',
      'Keep messages under 160 characters when possible',
      'Use URL shorteners for links',
      'Include your business name in messages',
      'Respect time zones - don\'t text at odd hours',
      'Get explicit consent before sending marketing SMS',
      'Monitor delivery rates and adjust accordingly',
      'Use alphanumeric sender IDs where supported',
    ],
    faq: [
      {
        question: 'How much does Twilio SMS cost?',
        answer: 'Pricing varies by country. In the US, outbound SMS costs about $0.0079 per message. Check Twilio\'s pricing page for current rates.',
      },
      {
        question: 'Can I send SMS internationally?',
        answer: 'Yes, Twilio supports SMS to most countries. Prices and regulations vary by destination.',
      },
      {
        question: 'What\'s the character limit?',
        answer: 'Standard SMS is 160 characters. Longer messages are split into multiple segments (charged separately).',
      },
      {
        question: 'Do I need consent to send SMS?',
        answer: 'Yes, especially for marketing. Transactional messages (order updates) have more flexibility, but consent is always recommended.',
      },
      {
        question: 'Can I use my existing phone number?',
        answer: 'You can port existing numbers to Twilio, but it\'s often easier to get a new Twilio number.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MICROSOFT TEAMS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    icon: '👥',
    category: 'communication',
    shortDescription: 'Post messages to Microsoft Teams channels',
    overview: {
      what: 'Microsoft Teams integration allows your AI agent to send notifications and messages to Teams channels using incoming webhooks.',
      why: 'Teams is the communication hub for Microsoft 365 organizations. Keep your team informed with automated notifications in their daily workflow.',
      useCases: [
        'Project status updates',
        'Lead notifications for sales',
        'Support ticket escalations',
        'CI/CD deployment alerts',
        'HR announcements',
        'Meeting reminders',
      ],
      targetAudience: 'Organizations using Microsoft 365 and Teams for internal communication.',
    },
    prerequisites: {
      accounts: [
        'Microsoft 365 account with Teams',
        'Access to target Teams channel',
      ],
      permissions: [
        'Permission to add connectors to the channel',
      ],
      preparations: [
        'Identify which channel should receive notifications',
        'Plan notification format and frequency',
      ],
    },
    connectionGuide: [
      {
        step: 1,
        title: 'Open Teams Channel',
        description: 'Open Microsoft Teams and navigate to the channel where you want to receive notifications.',
        screenshot: 'Teams – Select Channel',
      },
      {
        step: 2,
        title: 'Open Channel Settings',
        description: 'Click the three dots (...) next to the channel name and select "Connectors".',
        screenshot: 'Teams – Channel Connectors Menu',
      },
      {
        step: 3,
        title: 'Add Incoming Webhook',
        description: 'Search for "Incoming Webhook" and click "Add" or "Configure".',
        screenshot: 'Teams – Add Incoming Webhook',
      },
      {
        step: 4,
        title: 'Configure Webhook',
        description: 'Give your webhook a name (e.g., "AgentForge Alerts") and optionally upload an icon. Click "Create".',
        screenshot: 'Teams – Configure Webhook',
      },
      {
        step: 5,
        title: 'Copy Webhook URL',
        description: 'Copy the generated webhook URL and click "Done".',
        screenshot: 'Teams – Copy Webhook URL',
      },
      {
        step: 6,
        title: 'Connect in AgentForge',
        description: 'Open AgentForge Dashboard → Integrations → Microsoft Teams. Paste the webhook URL and click "Connect".',
        screenshot: 'AgentForge – Teams Integration Form',
      },
      {
        step: 7,
        title: 'Test Connection',
        description: 'Click "Test Connection" to send a test message to your Teams channel.',
        screenshot: 'Teams – Test Message Received',
      },
    ],
    triggers: [
      {
        id: 'internal_event',
        name: 'Internal Event (Outbound Only)',
        description: 'Teams webhooks are for sending messages only. Triggers come from other system events.',
        whenItFires: 'N/A - Used for outbound notifications.',
        exampleScenario: 'When a support ticket is escalated, notify the team channel.',
        dataProvided: ['N/A - Outbound only'],
      },
    ],
    actions: [
      {
        id: 'send_message',
        name: 'Send Message',
        description: 'Send a simple text message to Teams channel.',
        whenToUse: 'For quick notifications and updates.',
        requiredFields: ['Message text'],
        example: 'Send "🔔 New lead captured: John Doe from Acme Corp"',
      },
      {
        id: 'send_card',
        name: 'Send Adaptive Card',
        description: 'Send a rich formatted card with sections, facts, and buttons.',
        whenToUse: 'For detailed notifications with structured data and actions.',
        requiredFields: ['Card content'],
        optionalFields: ['Theme color', 'Actions'],
        example: 'Send lead card with contact details, source, and "View Lead" button.',
      },
    ],
    exampleFlow: {
      title: 'Support Escalation Flow',
      scenario: 'Notify team when a support ticket needs escalation.',
      steps: [
        'Customer submits high-priority support ticket',
        'AI Agent triages and identifies escalation needed',
        'Trigger: Escalation event fires',
        'Workflow sends adaptive card to #support-escalations',
        'Team sees card with ticket details and "Claim Ticket" button',
        'Team member clicks button to take ownership',
      ],
    },
    troubleshooting: [
      {
        error: 'Message not appearing',
        cause: 'Webhook URL is incorrect or connector was removed.',
        solution: 'Verify the webhook URL is correct. Re-create the connector if needed.',
      },
      {
        error: 'Card not rendering',
        cause: 'Adaptive Card JSON is malformed.',
        solution: 'Test your card format using Microsoft\'s Adaptive Card Designer.',
      },
      {
        error: 'Rate limited',
        cause: 'Sending too many messages too quickly.',
        solution: 'Teams allows about 4 messages per second. Implement queuing for high-volume scenarios.',
      },
    ],
    bestPractices: [
      'Use Adaptive Cards for rich, interactive notifications',
      'Include action buttons for quick responses',
      'Use @mentions to alert specific team members',
      'Color-code messages by priority or type',
      'Don\'t overload channels - use appropriate frequency',
      'Include relevant links and context',
      'Test card formats before deployment',
    ],
    faq: [
      {
        question: 'Can I receive messages from Teams?',
        answer: 'Incoming webhooks are one-way. For bidirectional communication, you would need to build a Teams bot.',
      },
      {
        question: 'Can I send to multiple channels?',
        answer: 'Yes, create a separate webhook for each channel and configure multiple Teams actions.',
      },
      {
        question: 'Can I mention users in messages?',
        answer: 'Direct mentions require the Teams Bot API. Webhooks support limited mention functionality.',
      },
      {
        question: 'What\'s the message size limit?',
        answer: 'Messages can be up to 28 KB in size. For larger content, include links to external resources.',
      },
    ],
  },
];
