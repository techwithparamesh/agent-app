import type { Integration } from './types';

// Google Workspace Integrations

export const googleDriveIntegration: Integration = {
  id: 'google-drive',
  name: 'Google Drive',
  description: 'Use the Google Drive node to manage files and folders. n8n supports upload, download, sharing, and organization of Drive files.',
  shortDescription: 'Cloud file storage and sharing',
  category: 'google',
  icon: 'google-drive',
  color: '#4285F4',
  website: 'https://drive.google.com',
  documentationUrl: 'https://developers.google.com/drive',

  features: [
    'File upload/download',
    'Folder management',
    'File sharing',
    'Permission control',
    'Search files',
    'Copy and move',
    'Trash management',
    'Metadata handling',
  ],

  useCases: [
    'File backup',
    'Document sharing',
    'Asset management',
    'Report storage',
    'Team collaboration',
    'Archive automation',
    'Attachment handling',
    'Export storage',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Google Cloud Project',
      description: 'Go to console.cloud.google.com and create a project.',
    },
    {
      step: 2,
      title: 'Enable Drive API',
      description: 'Enable the Google Drive API for your project.',
    },
    {
      step: 3,
      title: 'Create OAuth Credentials',
      description: 'Create OAuth 2.0 credentials with Drive scopes.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter credentials and authorize access.',
    },
  ],

  operations: [
    {
      name: 'Upload File',
      description: 'Upload a file to Drive',
      fields: [
        { name: 'file', type: 'binary', required: true, description: 'File to upload' },
        { name: 'name', type: 'string', required: true, description: 'File name' },
        { name: 'folder_id', type: 'string', required: false, description: 'Parent folder ID' },
        { name: 'mime_type', type: 'string', required: false, description: 'File MIME type' },
      ],
    },
    {
      name: 'Download File',
      description: 'Download a file from Drive',
      fields: [
        { name: 'file_id', type: 'string', required: true, description: 'File ID' },
        { name: 'format', type: 'string', required: false, description: 'Export format for Google Docs' },
      ],
    },
    {
      name: 'Create Folder',
      description: 'Create a new folder',
      fields: [
        { name: 'name', type: 'string', required: true, description: 'Folder name' },
        { name: 'parent_id', type: 'string', required: false, description: 'Parent folder ID' },
      ],
    },
    {
      name: 'Share File',
      description: 'Share a file or folder',
      fields: [
        { name: 'file_id', type: 'string', required: true, description: 'File ID' },
        { name: 'email', type: 'string', required: true, description: 'Email to share with' },
        { name: 'role', type: 'select', required: true, description: 'reader, writer, or owner' },
      ],
    },
  ],

  triggers: [
    {
      name: 'File Created',
      description: 'Triggers when a file is added',
      when: 'New file in specified folder',
      outputFields: ['id', 'name', 'mimeType', 'createdTime'],
    },
    {
      name: 'File Updated',
      description: 'Triggers when a file is modified',
      when: 'File modification detected',
      outputFields: ['id', 'name', 'modifiedTime'],
    },
  ],

  actions: [
    {
      name: 'Move File',
      description: 'Move file to different folder',
      inputFields: ['file_id', 'folder_id'],
      outputFields: ['id', 'parents'],
    },
  ],

  examples: [
    {
      title: 'Invoice Archive',
      description: 'Archive invoices to organized Drive folders',
      steps: [
        'Trigger: Invoice generated',
        'Create folder for year/month if not exists',
        'Upload invoice PDF',
        'Share with accounting team',
      ],
      code: `{
  "name": "Invoice_{{invoice.number}}.pdf",
  "parents": ["{{invoices_folder_id}}/{{year}}/{{month}}"],
  "mimeType": "application/pdf",
  "media": "{{invoice.pdf_binary}}"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'File not found',
      cause: 'Invalid file ID or no access permission.',
      solution: 'Verify file ID and ensure the account has access.',
    },
    {
      problem: 'Quota exceeded',
      cause: 'Storage quota or API quota exceeded.',
      solution: 'Check Drive storage and API quotas in Cloud Console.',
    },
  ],

  relatedIntegrations: ['google-sheets', 'dropbox'],
  externalResources: [
    { title: 'Drive API Reference', url: 'https://developers.google.com/drive/api/v3/reference' },
  ],
};

export const googleCalendarIntegration: Integration = {
  id: 'google-calendar',
  name: 'Google Calendar',
  description: 'Use the Google Calendar node to manage events, schedules, and calendars. n8n supports event creation, updates, and availability checking.',
  shortDescription: 'Calendar and scheduling',
  category: 'google',
  icon: 'google-calendar',
  color: '#4285F4',
  website: 'https://calendar.google.com',
  documentationUrl: 'https://developers.google.com/calendar',

  features: [
    'Event creation',
    'Event updates',
    'Calendar management',
    'Availability checking',
    'Recurring events',
    'Attendee management',
    'Reminders',
    'Free/busy lookup',
  ],

  useCases: [
    'Meeting scheduling',
    'Appointment booking',
    'Event reminders',
    'Team calendars',
    'Resource booking',
    'Availability sync',
    'Schedule automation',
    'Conference room booking',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Enable Calendar API',
      description: 'Enable Google Calendar API in Cloud Console.',
    },
    {
      step: 2,
      title: 'Create OAuth Credentials',
      description: 'Create OAuth 2.0 credentials with Calendar scopes.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter credentials and authorize calendar access.',
    },
  ],

  operations: [
    {
      name: 'Create Event',
      description: 'Create a calendar event',
      fields: [
        { name: 'calendar_id', type: 'string', required: true, description: 'Calendar ID (default: primary)' },
        { name: 'summary', type: 'string', required: true, description: 'Event title' },
        { name: 'start', type: 'datetime', required: true, description: 'Start time' },
        { name: 'end', type: 'datetime', required: true, description: 'End time' },
        { name: 'attendees', type: 'array', required: false, description: 'Attendee emails' },
        { name: 'description', type: 'string', required: false, description: 'Event description' },
      ],
    },
    {
      name: 'Update Event',
      description: 'Update an existing event',
      fields: [
        { name: 'event_id', type: 'string', required: true, description: 'Event ID' },
        { name: 'summary', type: 'string', required: false, description: 'New title' },
        { name: 'start', type: 'datetime', required: false, description: 'New start time' },
        { name: 'end', type: 'datetime', required: false, description: 'New end time' },
      ],
    },
    {
      name: 'Find Free Time',
      description: 'Find available slots',
      fields: [
        { name: 'calendars', type: 'array', required: true, description: 'Calendar IDs to check' },
        { name: 'time_min', type: 'datetime', required: true, description: 'Start of range' },
        { name: 'time_max', type: 'datetime', required: true, description: 'End of range' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Event Started',
      description: 'Triggers when an event starts',
      when: 'Event start time reached',
      outputFields: ['id', 'summary', 'start', 'attendees'],
    },
    {
      name: 'Event Created',
      description: 'Triggers when a new event is created',
      when: 'New event on calendar',
      outputFields: ['id', 'summary', 'start', 'end', 'creator'],
    },
  ],

  actions: [
    {
      name: 'Send Invite',
      description: 'Create event with attendees',
      inputFields: ['summary', 'start', 'end', 'attendees'],
      outputFields: ['id', 'htmlLink'],
    },
  ],

  examples: [
    {
      title: 'Auto-Schedule Meetings',
      description: 'Schedule meetings based on availability',
      steps: [
        'Trigger: Meeting request received',
        'Check availability of all attendees',
        'Find first available slot',
        'Create event and send invites',
      ],
      code: `{
  "calendarId": "primary",
  "summary": "{{meeting.title}}",
  "start": {
    "dateTime": "{{available_slot.start}}",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "{{available_slot.end}}",
    "timeZone": "America/New_York"
  },
  "attendees": [
    {"email": "{{attendee1}}"},
    {"email": "{{attendee2}}"}
  ],
  "conferenceData": {
    "createRequest": {"requestId": "{{uuid()}}"}
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Calendar not found',
      cause: 'Invalid calendar ID or no access.',
      solution: 'Use "primary" for main calendar or verify calendar ID.',
    },
    {
      problem: 'Event time conflict',
      cause: 'Overlapping with existing event.',
      solution: 'Check free/busy before creating events.',
    },
  ],

  relatedIntegrations: ['google-meet', 'outlook'],
  externalResources: [
    { title: 'Calendar API Reference', url: 'https://developers.google.com/calendar/api/v3/reference' },
  ],
};

export const googleMeetIntegration: Integration = {
  id: 'google-meet',
  name: 'Google Meet',
  description: 'Use the Google Meet integration to create and manage video conferences. Works with Google Calendar for scheduled meetings.',
  shortDescription: 'Video conferencing',
  category: 'google',
  icon: 'google-meet',
  color: '#00897B',
  website: 'https://meet.google.com',
  documentationUrl: 'https://developers.google.com/meet',

  features: [
    'Create meetings',
    'Generate meet links',
    'Schedule conferences',
    'Meeting recordings',
    'Participant management',
    'Calendar integration',
    'Screen sharing',
    'Live captions',
  ],

  useCases: [
    'Team meetings',
    'Client calls',
    'Webinars',
    'Training sessions',
    'Interviews',
    'Support calls',
    'Remote collaboration',
    'All-hands meetings',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Enable Meet API',
      description: 'Enable Google Meet REST API in Cloud Console.',
    },
    {
      step: 2,
      title: 'Create OAuth Credentials',
      description: 'Create OAuth 2.0 credentials with Meet and Calendar scopes.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter credentials and authorize.',
    },
  ],

  operations: [
    {
      name: 'Create Meeting',
      description: 'Create a new Meet conference',
      fields: [
        { name: 'title', type: 'string', required: true, description: 'Meeting title' },
        { name: 'start_time', type: 'datetime', required: true, description: 'Start time' },
        { name: 'duration', type: 'number', required: true, description: 'Duration in minutes' },
        { name: 'attendees', type: 'array', required: false, description: 'Attendee emails' },
      ],
    },
    {
      name: 'Get Meeting',
      description: 'Get meeting details',
      fields: [
        { name: 'meeting_id', type: 'string', required: true, description: 'Meeting ID or code' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Meeting Started',
      description: 'Triggers when meeting begins',
      when: 'First participant joins',
      outputFields: ['meetingCode', 'participants'],
    },
    {
      name: 'Meeting Ended',
      description: 'Triggers when meeting ends',
      when: 'All participants leave',
      outputFields: ['meetingCode', 'duration', 'recording'],
    },
  ],

  actions: [
    {
      name: 'Generate Link',
      description: 'Create instant meeting link',
      inputFields: [],
      outputFields: ['meetingUri', 'meetingCode'],
    },
  ],

  examples: [
    {
      title: 'Sales Demo Scheduler',
      description: 'Auto-create Meet links for demos',
      steps: [
        'Trigger: Demo requested',
        'Find available slot',
        'Create calendar event with Meet link',
        'Send invite to prospect',
      ],
      code: `// Calendar event with auto Meet
{
  "summary": "Product Demo - {{prospect.company}}",
  "conferenceData": {
    "createRequest": {
      "requestId": "{{uuid()}}",
      "conferenceSolutionKey": {"type": "hangoutsMeet"}
    }
  },
  "conferenceDataVersion": 1
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'No Meet link generated',
      cause: 'conferenceDataVersion not set.',
      solution: 'Include "conferenceDataVersion": 1 in event creation.',
    },
  ],

  relatedIntegrations: ['google-calendar', 'zoom'],
  externalResources: [
    { title: 'Meet REST API', url: 'https://developers.google.com/meet/api/reference/rest' },
  ],
};

export const googleDocsIntegration: Integration = {
  id: 'google-docs',
  name: 'Google Docs',
  description: 'Use the Google Docs node to create and manipulate documents. n8n supports document creation, content insertion, and formatting.',
  shortDescription: 'Document creation and editing',
  category: 'google',
  icon: 'google-docs',
  color: '#4285F4',
  website: 'https://docs.google.com',
  documentationUrl: 'https://developers.google.com/docs',

  features: [
    'Create documents',
    'Insert text',
    'Format content',
    'Replace placeholders',
    'Insert images',
    'Create tables',
    'Export to PDF',
    'Template merging',
  ],

  useCases: [
    'Contract generation',
    'Report creation',
    'Template merging',
    'Letter generation',
    'Proposal creation',
    'Certificate generation',
    'Invoice creation',
    'Meeting notes',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Enable Docs API',
      description: 'Enable Google Docs API in Cloud Console.',
    },
    {
      step: 2,
      title: 'Create OAuth Credentials',
      description: 'Create OAuth 2.0 credentials with Docs and Drive scopes.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter credentials and authorize.',
    },
  ],

  operations: [
    {
      name: 'Create Document',
      description: 'Create a new document',
      fields: [
        { name: 'title', type: 'string', required: true, description: 'Document title' },
        { name: 'content', type: 'string', required: false, description: 'Initial content' },
        { name: 'folder_id', type: 'string', required: false, description: 'Drive folder ID' },
      ],
    },
    {
      name: 'Insert Text',
      description: 'Insert text at location',
      fields: [
        { name: 'document_id', type: 'string', required: true, description: 'Document ID' },
        { name: 'text', type: 'string', required: true, description: 'Text to insert' },
        { name: 'index', type: 'number', required: true, description: 'Insert position' },
      ],
    },
    {
      name: 'Replace Text',
      description: 'Find and replace text',
      fields: [
        { name: 'document_id', type: 'string', required: true, description: 'Document ID' },
        { name: 'find', type: 'string', required: true, description: 'Text to find' },
        { name: 'replace', type: 'string', required: true, description: 'Replacement text' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Merge Template',
      description: 'Replace placeholders in template',
      inputFields: ['document_id', 'replacements'],
      outputFields: ['documentId'],
    },
  ],

  examples: [
    {
      title: 'Contract Generator',
      description: 'Generate contracts from templates',
      steps: [
        'Trigger: Deal closed in CRM',
        'Copy contract template',
        'Replace placeholders with deal data',
        'Export as PDF and email',
      ],
      code: `{
  "requests": [
    {
      "replaceAllText": {
        "containsText": {"text": "{{CLIENT_NAME}}"},
        "replaceText": "{{deal.client_name}}"
      }
    },
    {
      "replaceAllText": {
        "containsText": {"text": "{{CONTRACT_VALUE}}"},
        "replaceText": "{{formatCurrency(deal.value)}}"
      }
    },
    {
      "replaceAllText": {
        "containsText": {"text": "{{DATE}}"},
        "replaceText": "{{formatDate(now())}}"
      }
    }
  ]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Index out of bounds',
      cause: 'Insert position beyond document length.',
      solution: 'Get document length first or use end index.',
    },
  ],

  relatedIntegrations: ['google-drive', 'google-sheets'],
  externalResources: [
    { title: 'Docs API Reference', url: 'https://developers.google.com/docs/api/reference/rest' },
  ],
};

export const googleFormsIntegration: Integration = {
  id: 'google-forms',
  name: 'Google Forms',
  description: 'Use the Google Forms node to create forms and process responses. n8n supports form creation, response retrieval, and automated workflows.',
  shortDescription: 'Form creation and response handling',
  category: 'google',
  icon: 'google-forms',
  color: '#673AB7',
  website: 'https://forms.google.com',
  documentationUrl: 'https://developers.google.com/forms',

  features: [
    'Form creation',
    'Response collection',
    'Real-time notifications',
    'Data export to Sheets',
    'Question management',
    'Form analytics',
    'File uploads',
    'Quiz functionality',
  ],

  useCases: [
    'Survey collection',
    'Lead capture',
    'Event registration',
    'Feedback forms',
    'Quiz creation',
    'Order forms',
    'Contact forms',
    'Application forms',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Enable Forms API',
      description: 'Enable Google Forms API in Cloud Console.',
    },
    {
      step: 2,
      title: 'Create OAuth Credentials',
      description: 'Create OAuth 2.0 credentials with Forms scope.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter credentials and authorize.',
    },
  ],

  operations: [
    {
      name: 'Get Responses',
      description: 'Retrieve form responses',
      fields: [
        { name: 'form_id', type: 'string', required: true, description: 'Form ID' },
        { name: 'filter', type: 'string', required: false, description: 'Response filter' },
      ],
    },
    {
      name: 'Create Form',
      description: 'Create a new form',
      fields: [
        { name: 'title', type: 'string', required: true, description: 'Form title' },
        { name: 'description', type: 'string', required: false, description: 'Form description' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Form Response',
      description: 'Triggers when form is submitted',
      when: 'New response received',
      outputFields: ['responseId', 'answers', 'createTime', 'respondentEmail'],
    },
  ],

  actions: [
    {
      name: 'Process Response',
      description: 'Handle form submission data',
      inputFields: ['form_id', 'response_id'],
      outputFields: ['answers', 'metadata'],
    },
  ],

  examples: [
    {
      title: 'Lead Capture to CRM',
      description: 'Send form submissions to CRM',
      steps: [
        'Trigger: New form response',
        'Extract contact information',
        'Create lead in CRM',
        'Send confirmation email',
      ],
      code: `{
  "form_id": "{{form.id}}",
  "response": {
    "name": "{{response.answers.name}}",
    "email": "{{response.answers.email}}",
    "company": "{{response.answers.company}}",
    "source": "Google Form - {{form.title}}"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Form not found',
      cause: 'Invalid form ID or no access.',
      solution: 'Verify form ID from URL and check sharing permissions.',
    },
  ],

  relatedIntegrations: ['google-sheets', 'hubspot'],
  externalResources: [
    { title: 'Forms API Reference', url: 'https://developers.google.com/forms/api/reference/rest' },
  ],
};
