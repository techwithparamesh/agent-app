import { IntegrationDoc } from './types';

export const googleDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE DRIVE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'google_drive',
    name: 'Google Drive',
    icon: '📁',
    category: 'google',
    shortDescription: 'Upload and manage files in Google Drive',
    overview: {
      what: 'Google Drive integration allows your AI agent to upload, download, and manage files in Google Drive.',
      why: 'Google Drive offers 15GB free storage and seamless sharing. Perfect for document management.',
      useCases: ['File uploads', 'Document sharing', 'Backup storage', 'Collaborative documents', 'File organization', 'Media storage'],
      targetAudience: 'Users who need cloud file storage integrated with their AI workflows.',
    },
    prerequisites: {
      accounts: ['Google account'],
      permissions: ['Google Drive API access', 'OAuth consent screen configured'],
      preparations: ['Create Google Cloud project', 'Enable Drive API', 'Create service account or OAuth credentials'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Google Cloud Console', description: 'Visit console.cloud.google.com.', screenshot: 'Google Cloud – Console' },
      { step: 2, title: 'Create/Select Project', description: 'Create a new project or select existing one.', screenshot: 'Google Cloud – Project' },
      { step: 3, title: 'Enable Drive API', description: 'Go to APIs & Services → Library → Search "Google Drive API" → Enable.', screenshot: 'Google Cloud – Enable Drive API' },
      { step: 4, title: 'Create Service Account', description: 'Go to IAM & Admin → Service Accounts → Create Service Account.', screenshot: 'Google Cloud – Service Account' },
      { step: 5, title: 'Generate Key', description: 'Click service account → Keys → Add Key → Create new key (JSON).', screenshot: 'Google Cloud – Generate Key' },
      { step: 6, title: 'Share Folder (Optional)', description: 'To access specific folders, share them with service account email.', screenshot: 'Google Drive – Share Folder', tip: 'Service account email ends with .iam.gserviceaccount.com' },
      { step: 7, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Google Drive. Upload credentials JSON.', screenshot: 'AgentForge – Google Drive Form' },
    ],
    triggers: [
      { id: 'file_created', name: 'File Created', description: 'Fires when new file is uploaded.', whenItFires: 'When file added to monitored folder.', exampleScenario: 'Process uploaded documents automatically.', dataProvided: ['File ID', 'Name', 'MIME type', 'Created time'] },
      { id: 'file_modified', name: 'File Modified', description: 'Fires when file is updated.', whenItFires: 'When file content changes.', exampleScenario: 'Sync updated documents.', dataProvided: ['File ID', 'Name', 'Modified time'] },
    ],
    actions: [
      { id: 'upload_file', name: 'Upload File', description: 'Upload a file to Google Drive.', whenToUse: 'To store files in the cloud.', requiredFields: ['File content', 'File name'], optionalFields: ['Parent folder ID', 'MIME type'], example: 'Upload report.pdf to Reports folder.' },
      { id: 'download_file', name: 'Download File', description: 'Download a file from Drive.', whenToUse: 'To retrieve file content.', requiredFields: ['File ID'], example: 'Download customer contract.' },
      { id: 'create_folder', name: 'Create Folder', description: 'Create a new folder.', whenToUse: 'To organize files.', requiredFields: ['Folder name'], optionalFields: ['Parent folder ID'], example: 'Create "2024 Invoices" folder.' },
      { id: 'share_file', name: 'Share File', description: 'Share file with users or make public.', whenToUse: 'To grant access.', requiredFields: ['File ID', 'Email or "anyone"'], optionalFields: ['Role (reader/writer)'], example: 'Share document with customer.' },
    ],
    exampleFlow: { title: 'Document Upload Flow', scenario: 'Store customer documents.', steps: ['Customer sends document via chat', 'AI receives file', 'Drive action uploads to customer folder', 'Returns shareable link', 'Link sent to customer for confirmation'] },
    troubleshooting: [
      { error: 'Access denied', cause: 'Folder not shared with service account.', solution: 'Share target folder with service account email.' },
      { error: 'File not found', cause: 'Wrong file ID or no access.', solution: 'Verify file ID and sharing settings.' },
      { error: 'Quota exceeded', cause: 'Storage or API quota reached.', solution: 'Check quota in Google Cloud Console.' },
    ],
    bestPractices: ['Organize with folder hierarchy', 'Use meaningful file names', 'Set appropriate sharing permissions', 'Regular cleanup of old files', 'Monitor storage usage'],
    faq: [
      { question: 'How much storage is free?', answer: '15GB shared across Drive, Gmail, and Photos.' },
      { question: 'Can I access My Drive?', answer: 'With OAuth yes. Service accounts have their own Drive.' },
      { question: 'What file types are supported?', answer: 'All file types. Google Docs for editing in browser.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE CALENDAR
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    icon: '📅',
    category: 'google',
    shortDescription: 'Create and manage Google Calendar events',
    overview: {
      what: 'Google Calendar integration allows your AI agent to create, read, and manage calendar events.',
      why: 'Google Calendar is the most popular calendar. Schedule meetings and appointments automatically.',
      useCases: ['Appointment scheduling', 'Meeting creation', 'Availability checking', 'Event reminders', 'Calendar blocking', 'Team scheduling'],
      targetAudience: 'Users who want AI to manage their calendar and schedule appointments.',
    },
    prerequisites: {
      accounts: ['Google account'],
      permissions: ['Google Calendar API access'],
      preparations: ['Enable Calendar API', 'Create credentials', 'Share calendar with service account'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Google Cloud Console', description: 'Visit console.cloud.google.com.', screenshot: 'Google Cloud – Console' },
      { step: 2, title: 'Enable Calendar API', description: 'APIs & Services → Library → Search "Google Calendar API" → Enable.', screenshot: 'Google Cloud – Enable Calendar API' },
      { step: 3, title: 'Create Service Account', description: 'IAM & Admin → Service Accounts → Create.', screenshot: 'Google Cloud – Service Account' },
      { step: 4, title: 'Generate Key', description: 'Service account → Keys → Add Key → JSON.', screenshot: 'Google Cloud – Generate Key' },
      { step: 5, title: 'Share Calendar', description: 'In Google Calendar, share your calendar with service account email.', screenshot: 'Google Calendar – Share', warning: 'Grant "Make changes to events" permission.' },
      { step: 6, title: 'Get Calendar ID', description: 'Calendar Settings → Integrate calendar → Calendar ID.', screenshot: 'Google Calendar – Calendar ID', tip: 'Primary calendar ID is usually your email.' },
      { step: 7, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Google Calendar. Upload credentials and enter Calendar ID.', screenshot: 'AgentForge – Calendar Form' },
    ],
    triggers: [
      { id: 'event_created', name: 'Event Created', description: 'Fires when new event is created.', whenItFires: 'When event added to calendar.', exampleScenario: 'Send meeting prep materials.', dataProvided: ['Event ID', 'Title', 'Start/End time', 'Attendees'] },
      { id: 'event_starting', name: 'Event Starting Soon', description: 'Fires before event starts.', whenItFires: 'X minutes before event.', exampleScenario: 'Send meeting reminder.', dataProvided: ['Event details', 'Time until start'] },
    ],
    actions: [
      { id: 'create_event', name: 'Create Event', description: 'Create a calendar event.', whenToUse: 'To schedule meetings or appointments.', requiredFields: ['Title', 'Start time', 'End time'], optionalFields: ['Description', 'Attendees', 'Location'], example: 'Create "Demo Call" for tomorrow 2pm.' },
      { id: 'get_events', name: 'Get Events', description: 'List events in a time range.', whenToUse: 'To check availability.', requiredFields: ['Start date', 'End date'], example: 'Get all events for next week.' },
      { id: 'update_event', name: 'Update Event', description: 'Modify an existing event.', whenToUse: 'To reschedule or update details.', requiredFields: ['Event ID'], optionalFields: ['Title', 'Time', 'Description'], example: 'Move meeting to 3pm.' },
      { id: 'delete_event', name: 'Delete Event', description: 'Cancel/delete an event.', whenToUse: 'To cancel meetings.', requiredFields: ['Event ID'], example: 'Cancel tomorrow\'s meeting.' },
    ],
    exampleFlow: { title: 'Meeting Scheduling Flow', scenario: 'Schedule a meeting via chat.', steps: ['Customer requests meeting', 'AI checks calendar availability', 'Proposes available slots', 'Customer selects time', 'Calendar action creates event', 'Both parties receive invite'] },
    troubleshooting: [
      { error: 'Calendar not found', cause: 'Wrong calendar ID or no access.', solution: 'Verify calendar ID and sharing settings.' },
      { error: 'Cannot create event', cause: 'Insufficient permissions.', solution: 'Share calendar with "Make changes" permission.' },
      { error: 'Time zone issues', cause: 'Mismatched time zones.', solution: 'Always specify time zone in event creation.' },
    ],
    bestPractices: ['Always include time zone', 'Add descriptions for context', 'Use attendee email for invites', 'Set reminders appropriately', 'Check for conflicts before creating'],
    faq: [
      { question: 'Can I access multiple calendars?', answer: 'Yes, share each calendar and use its specific Calendar ID.' },
      { question: 'Do attendees get invites?', answer: 'Yes, if you add their email as attendees.' },
      { question: 'What about recurring events?', answer: 'Supported via recurrence rules (RRULE format).' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE DOCS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'google_docs',
    name: 'Google Docs',
    icon: '📝',
    category: 'google',
    shortDescription: 'Create and edit Google Docs',
    overview: {
      what: 'Google Docs integration allows your AI agent to create and edit documents in Google Docs.',
      why: 'Google Docs enables real-time collaboration. Perfect for generating reports and documentation.',
      useCases: ['Report generation', 'Document creation', 'Content drafting', 'Meeting notes', 'Proposal writing', 'Template filling'],
      targetAudience: 'Users who need AI to create and manage documents in Google Docs.',
    },
    prerequisites: {
      accounts: ['Google account'],
      permissions: ['Google Docs API access', 'Google Drive API access'],
      preparations: ['Enable Docs API', 'Enable Drive API', 'Create credentials'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Google Cloud Console', description: 'Visit console.cloud.google.com.', screenshot: 'Google Cloud – Console' },
      { step: 2, title: 'Enable Docs API', description: 'APIs & Services → Library → Search "Google Docs API" → Enable.', screenshot: 'Google Cloud – Enable Docs API' },
      { step: 3, title: 'Also Enable Drive API', description: 'Search "Google Drive API" → Enable (needed for file operations).', screenshot: 'Google Cloud – Enable Drive API' },
      { step: 4, title: 'Create Service Account', description: 'IAM & Admin → Service Accounts → Create.', screenshot: 'Google Cloud – Service Account' },
      { step: 5, title: 'Generate Key', description: 'Service account → Keys → Add Key → JSON.', screenshot: 'Google Cloud – Generate Key' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Google Docs. Upload credentials JSON.', screenshot: 'AgentForge – Docs Form' },
    ],
    triggers: [
      { id: 'doc_created', name: 'Document Created', description: 'Fires when new doc is created.', whenItFires: 'When document is created.', exampleScenario: 'Notify team of new document.', dataProvided: ['Document ID', 'Title', 'Created time'] },
    ],
    actions: [
      { id: 'create_doc', name: 'Create Document', description: 'Create a new Google Doc.', whenToUse: 'To generate new documents.', requiredFields: ['Title'], optionalFields: ['Initial content', 'Folder ID'], example: 'Create "Q4 Report" document.' },
      { id: 'get_doc', name: 'Get Document', description: 'Read document content.', whenToUse: 'To retrieve document text.', requiredFields: ['Document ID'], example: 'Get content of meeting notes doc.' },
      { id: 'append_text', name: 'Append Text', description: 'Add text to end of document.', whenToUse: 'To add content to existing doc.', requiredFields: ['Document ID', 'Text'], example: 'Append meeting summary.' },
      { id: 'replace_text', name: 'Replace Text', description: 'Find and replace text in document.', whenToUse: 'For template filling.', requiredFields: ['Document ID', 'Find text', 'Replace with'], example: 'Replace {{name}} with customer name.' },
    ],
    exampleFlow: { title: 'Report Generation Flow', scenario: 'Generate weekly report.', steps: ['Gather data from various sources', 'AI formats report content', 'Docs action creates document', 'Applies formatting and styling', 'Shares with stakeholders'] },
    troubleshooting: [
      { error: 'Document not found', cause: 'Wrong document ID or no access.', solution: 'Verify document ID and sharing settings.' },
      { error: 'Cannot edit', cause: 'Read-only access.', solution: 'Share document with edit permissions.' },
      { error: 'API not enabled', cause: 'Docs API not enabled.', solution: 'Enable Google Docs API in Cloud Console.' },
    ],
    bestPractices: ['Use templates for consistent formatting', 'Organize in Drive folders', 'Share with appropriate permissions', 'Use named ranges for dynamic content', 'Regular backups via export'],
    faq: [
      { question: 'Can I format text?', answer: 'Yes, using the batchUpdate API with formatting requests.' },
      { question: 'Can I add images?', answer: 'Yes, via insertInlineImage request.' },
      { question: 'How do I export as PDF?', answer: 'Use Drive API to export with MIME type application/pdf.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE FORMS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'google_forms',
    name: 'Google Forms',
    icon: '📋',
    category: 'google',
    shortDescription: 'Receive and process Google Forms responses',
    overview: {
      what: 'Google Forms integration allows your AI agent to receive form submissions and trigger workflows.',
      why: 'Google Forms is free and easy to use. Capture structured data and trigger automations.',
      useCases: ['Survey responses', 'Lead capture forms', 'Feedback collection', 'Registration forms', 'Order forms', 'Support requests'],
      targetAudience: 'Users collecting data via Google Forms who want to automate response handling.',
    },
    prerequisites: {
      accounts: ['Google account'],
      permissions: ['Access to form responses'],
      preparations: ['Create Google Form', 'Set up response destination'],
    },
    connectionGuide: [
      { step: 1, title: 'Create Google Form', description: 'Go to forms.google.com and create your form.', screenshot: 'Google Forms – Create Form' },
      { step: 2, title: 'Link to Sheets', description: 'Click "Responses" tab → Sheets icon → Create new spreadsheet.', screenshot: 'Google Forms – Link to Sheets' },
      { step: 3, title: 'Set Up Apps Script Trigger', description: 'In Sheets, go to Extensions → Apps Script.', screenshot: 'Google Sheets – Apps Script' },
      { step: 4, title: 'Add Webhook Code', description: 'Add script to send form data to AgentForge webhook on submit.', screenshot: 'Apps Script – Webhook Code', tip: 'Use UrlFetchApp.fetch() to POST to your webhook URL.' },
      { step: 5, title: 'Create Trigger', description: 'Add trigger for "On form submit" event.', screenshot: 'Apps Script – Create Trigger' },
      { step: 6, title: 'Connect in AgentForge', description: 'Copy your AgentForge webhook URL and paste in the script.', screenshot: 'AgentForge – Forms Webhook' },
    ],
    triggers: [
      { id: 'form_submit', name: 'Form Submitted', description: 'Fires when form is submitted.', whenItFires: 'When someone submits the form.', exampleScenario: 'Process new lead submission.', dataProvided: ['All form fields', 'Timestamp', 'Respondent email (if collected)'] },
    ],
    actions: [
      { id: 'get_responses', name: 'Get Responses', description: 'Retrieve form responses from linked sheet.', whenToUse: 'To analyze collected data.', requiredFields: ['Spreadsheet ID'], optionalFields: ['Date range'], example: 'Get all responses from this week.' },
    ],
    exampleFlow: { title: 'Lead Capture Flow', scenario: 'Process form leads automatically.', steps: ['Visitor fills out contact form', 'Form submission triggers webhook', 'AI receives lead data', 'Creates CRM record', 'Sends welcome email', 'Notifies sales team'] },
    troubleshooting: [
      { error: 'Webhook not firing', cause: 'Trigger not set up correctly.', solution: 'Verify Apps Script trigger is active.' },
      { error: 'Missing data', cause: 'Wrong field references in script.', solution: 'Check form field names match script.' },
      { error: 'Authorization required', cause: 'Script not authorized.', solution: 'Run script manually once to authorize.' },
    ],
    bestPractices: ['Keep forms simple', 'Use validation for data quality', 'Link to Sheets for backup', 'Test webhook with sample submission', 'Monitor for failed submissions'],
    faq: [
      { question: 'Is Google Forms free?', answer: 'Yes, completely free with a Google account.' },
      { question: 'Can I customize the webhook?', answer: 'Yes, modify the Apps Script to send specific data.' },
      { question: 'What about file uploads?', answer: 'File uploads go to Drive. Send file ID in webhook.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE MEET
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'google_meet',
    name: 'Google Meet',
    icon: '🎥',
    category: 'google',
    shortDescription: 'Create Google Meet video conferences',
    overview: {
      what: 'Google Meet integration allows your AI agent to create video conference links for meetings.',
      why: 'Google Meet is free and reliable. Easy video meetings without additional software.',
      useCases: ['Video meeting scheduling', 'Instant meeting links', 'Team meetings', 'Customer calls', 'Webinars', 'Interviews'],
      targetAudience: 'Users who need to create Google Meet links as part of their scheduling workflows.',
    },
    prerequisites: {
      accounts: ['Google Workspace account'],
      permissions: ['Google Calendar API access'],
      preparations: ['Enable Calendar API', 'Set up credentials'],
    },
    connectionGuide: [
      { step: 1, title: 'Enable Calendar API', description: 'Google Meet links are created via Calendar API.', screenshot: 'Google Cloud – Enable Calendar API' },
      { step: 2, title: 'Create Credentials', description: 'Follow Google Calendar integration setup.', screenshot: 'Google Cloud – Credentials' },
      { step: 3, title: 'Workspace Required', description: 'Note: Creating Meet links requires Google Workspace, not personal Gmail.', screenshot: 'Google Workspace – Info', warning: 'Personal Gmail cannot create Meet links via API.' },
      { step: 4, title: 'Configure Calendar Integration', description: 'Meet links are generated when creating calendar events with conferenceData.', screenshot: 'AgentForge – Meet Config' },
    ],
    triggers: [
      { id: 'meeting_started', name: 'Meeting Started', description: 'Fires when meeting begins.', whenItFires: 'When participant joins.', exampleScenario: 'Send meeting materials.', dataProvided: ['Meeting code', 'Start time', 'Participants'] },
    ],
    actions: [
      { id: 'create_meeting', name: 'Create Meeting', description: 'Create calendar event with Meet link.', whenToUse: 'To schedule video meetings.', requiredFields: ['Title', 'Start time', 'End time'], optionalFields: ['Attendees', 'Description'], example: 'Create "Product Demo" meeting for tomorrow.' },
      { id: 'get_meeting_link', name: 'Get Meeting Link', description: 'Generate instant Meet link.', whenToUse: 'For ad-hoc meetings.', requiredFields: [], example: 'Generate a Meet link for quick call.' },
    ],
    exampleFlow: { title: 'Meeting Invite Flow', scenario: 'Schedule video call with customer.', steps: ['Customer requests video call', 'AI checks availability', 'Creates calendar event with Meet', 'Meet link generated automatically', 'Invite sent to customer'] },
    troubleshooting: [
      { error: 'Conference data not created', cause: 'Personal Gmail account.', solution: 'Use Google Workspace account.' },
      { error: 'Permission denied', cause: 'Calendar not shared properly.', solution: 'Check calendar sharing settings.' },
      { error: 'Meet not enabled', cause: 'Meet disabled for workspace.', solution: 'Admin must enable Meet in Workspace admin.' },
    ],
    bestPractices: ['Include meeting agenda in description', 'Set up calendar reminders', 'Share meeting link in advance', 'Use recurring events for regular meetings', 'Enable waiting room for external guests'],
    faq: [
      { question: 'Is Google Meet free?', answer: 'Yes with limits (60 min for 3+ people). Workspace for longer.' },
      { question: 'Can I use with personal Gmail?', answer: 'Creating links via API requires Workspace.' },
      { question: 'What about recordings?', answer: 'Recording requires Workspace Business Standard or higher.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    icon: '📊',
    category: 'google',
    shortDescription: 'Track events and retrieve analytics data',
    overview: {
      what: 'Google Analytics integration allows your AI agent to send events and retrieve analytics data.',
      why: 'Track user interactions and get insights on your AI agent\'s performance.',
      useCases: ['Event tracking', 'Conversion tracking', 'User behavior analysis', 'Performance reporting', 'Goal completion', 'Traffic analysis'],
      targetAudience: 'Users who want to track AI agent interactions and generate analytics reports.',
    },
    prerequisites: {
      accounts: ['Google Analytics account (GA4)'],
      permissions: ['Measurement Protocol API access or Data API'],
      preparations: ['Create GA4 property', 'Get Measurement ID and API secret'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Google Analytics', description: 'Visit analytics.google.com.', screenshot: 'Google Analytics – Home' },
      { step: 2, title: 'Create Property', description: 'Admin → Create Property (if needed).', screenshot: 'Google Analytics – Create Property' },
      { step: 3, title: 'Get Measurement ID', description: 'Admin → Data Streams → Select stream → Measurement ID (G-XXXXXXX).', screenshot: 'Google Analytics – Measurement ID' },
      { step: 4, title: 'Create API Secret', description: 'In data stream, go to Measurement Protocol → Create secret.', screenshot: 'Google Analytics – API Secret' },
      { step: 5, title: 'Copy Credentials', description: 'Copy Measurement ID and API Secret.', screenshot: 'Google Analytics – Copy Credentials' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Google Analytics. Enter Measurement ID and API secret.', screenshot: 'AgentForge – Analytics Form' },
    ],
    triggers: [],
    actions: [
      { id: 'send_event', name: 'Send Event', description: 'Track an event in Google Analytics.', whenToUse: 'To track user actions and conversions.', requiredFields: ['Event name'], optionalFields: ['Event parameters', 'User properties'], example: 'Track "conversation_started" event.' },
      { id: 'get_report', name: 'Get Report', description: 'Retrieve analytics data via Data API.', whenToUse: 'To get performance metrics.', requiredFields: ['Metrics', 'Date range'], optionalFields: ['Dimensions', 'Filters'], example: 'Get pageviews for last 7 days.' },
    ],
    exampleFlow: { title: 'Conversion Tracking Flow', scenario: 'Track customer conversions.', steps: ['Customer completes desired action', 'AI triggers conversion event', 'Event sent to Google Analytics', 'Appears in conversions report', 'Analyze conversion rates'] },
    troubleshooting: [
      { error: 'Events not appearing', cause: 'Wrong Measurement ID or API secret.', solution: 'Verify credentials from GA4 data stream.' },
      { error: 'Debug view empty', cause: 'Debug mode not enabled.', solution: 'Add debug_mode: true to event params.' },
      { error: 'Data API error', cause: 'API not enabled or wrong property.', solution: 'Enable Analytics Data API in Cloud Console.' },
    ],
    bestPractices: ['Use consistent event naming', 'Track meaningful conversions', 'Add relevant parameters', 'Use debug view for testing', 'Document your event schema'],
    faq: [
      { question: 'GA4 vs Universal Analytics?', answer: 'GA4 is current. Universal Analytics is deprecated.' },
      { question: 'How long until data appears?', answer: 'Real-time: immediate. Reports: 24-48 hours.' },
      { question: 'Can I track custom dimensions?', answer: 'Yes, define custom dimensions in GA4 admin.' },
    ],
  },
];
