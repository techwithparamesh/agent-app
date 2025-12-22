import { IntegrationDoc } from './types';

export const storageDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE SHEETS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    icon: '📊',
    category: 'storage',
    shortDescription: 'Read/write data to Google Sheets',
    overview: {
      what: 'Google Sheets integration allows your AI agent to read from and write data to Google Sheets, perfect for data collection and reporting.',
      why: 'Google Sheets is free, collaborative, and familiar. Use it as a simple database for leads, orders, or any structured data.',
      useCases: [
        'Lead collection spreadsheet',
        'Order tracking',
        'Survey responses',
        'Inventory management',
        'Report generation',
        'Data export for analysis',
      ],
      targetAudience: 'Anyone who wants a simple, free way to store and manage data collected by their AI agent.',
    },
    prerequisites: {
      accounts: ['Google account'],
      permissions: ['Google Sheets API access', 'Share sheet with service account'],
      preparations: ['Create a Google Sheet', 'Note the Spreadsheet ID', 'Enable Google Sheets API'],
    },
    connectionGuide: [
      { step: 1, title: 'Create Google Cloud Project', description: 'Go to console.cloud.google.com and create a new project.', screenshot: 'Google Cloud – Create Project' },
      { step: 2, title: 'Enable Sheets API', description: 'Go to APIs & Services → Library, search for "Google Sheets API" and enable it.', screenshot: 'Google Cloud – Enable Sheets API' },
      { step: 3, title: 'Create Service Account', description: 'Go to IAM & Admin → Service Accounts → Create Service Account.', screenshot: 'Google Cloud – Create Service Account' },
      { step: 4, title: 'Generate Key', description: 'Click on service account → Keys → Add Key → Create new key (JSON).', screenshot: 'Google Cloud – Generate Key', tip: 'Download and save the JSON file securely.' },
      { step: 5, title: 'Get Spreadsheet ID', description: 'Open your Google Sheet. The ID is in the URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit', screenshot: 'Google Sheets – Spreadsheet ID' },
      { step: 6, title: 'Share Sheet with Service Account', description: 'Share the spreadsheet with the service account email (ends with .iam.gserviceaccount.com).', screenshot: 'Google Sheets – Share Dialog', warning: 'Without sharing, the service account cannot access the sheet.' },
      { step: 7, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Google Sheets. Upload credentials JSON and enter Spreadsheet ID.', screenshot: 'AgentForge – Google Sheets Form' },
    ],
    triggers: [
      { id: 'row_added', name: 'Row Added (via polling)', description: 'Detects when new rows are added to the sheet.', whenItFires: 'When polling detects new rows.', exampleScenario: 'When someone adds a row via Google Form, trigger a follow-up.', dataProvided: ['Row number', 'Row data', 'Timestamp'] },
    ],
    actions: [
      { id: 'append_row', name: 'Append Row', description: 'Add a new row to the bottom of the sheet.', whenToUse: 'To record new data entries.', requiredFields: ['Row data (array of values)'], optionalFields: ['Sheet name'], example: 'Append lead data: [Name, Email, Phone, Date]' },
      { id: 'read_rows', name: 'Read Rows', description: 'Read data from the sheet.', whenToUse: 'To retrieve information or check existing data.', requiredFields: ['Range (e.g., A1:D10)'], example: 'Read all leads from column A to D.' },
      { id: 'update_cell', name: 'Update Cell', description: 'Update a specific cell or range.', whenToUse: 'To modify existing data.', requiredFields: ['Range', 'Value'], example: 'Update status column for a specific lead.' },
    ],
    exampleFlow: { title: 'Lead Collection Flow', scenario: 'Collect and store lead information.', steps: ['Customer provides contact info', 'AI validates and formats data', 'Sheets action appends row', 'Data appears in spreadsheet', 'Team reviews new leads daily'] },
    troubleshooting: [
      { error: 'Permission denied', cause: 'Sheet not shared with service account.', solution: 'Share the spreadsheet with service account email.' },
      { error: 'Spreadsheet not found', cause: 'Wrong Spreadsheet ID.', solution: 'Verify ID from the spreadsheet URL.' },
      { error: 'Invalid range', cause: 'Range format incorrect.', solution: 'Use format like "Sheet1!A1:D10" or just "A1:D10".' },
    ],
    bestPractices: ['Use headers in first row', 'Keep data types consistent', 'Use sheet names for multiple data types', 'Regular backups', 'Don\'t exceed 5 million cells'],
    faq: [
      { question: 'Is there a size limit?', answer: 'Google Sheets supports up to 10 million cells per spreadsheet.' },
      { question: 'Can I use multiple sheets?', answer: 'Yes, specify the sheet name in your range (e.g., "Orders!A1:D10").' },
      { question: 'Is it real-time?', answer: 'Writing is instant. For reading triggers, there\'s polling delay.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AIRTABLE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'airtable',
    name: 'Airtable',
    icon: '📑',
    category: 'storage',
    shortDescription: 'Read/write to Airtable bases',
    overview: {
      what: 'Airtable integration connects your AI agent to Airtable\'s powerful database platform, combining spreadsheet simplicity with database power.',
      why: 'Airtable offers relational data, rich field types, and beautiful views. More powerful than spreadsheets, easier than traditional databases.',
      useCases: ['CRM and contact management', 'Project tracking', 'Content calendar', 'Inventory management', 'Product catalog', 'Order management'],
      targetAudience: 'Users who need structured data with relationships, filtering, and views beyond basic spreadsheets.',
    },
    prerequisites: {
      accounts: ['Airtable account (free tier available)'],
      permissions: ['Personal access token or API key'],
      preparations: ['Create a base and table', 'Note Base ID and Table ID'],
    },
    connectionGuide: [
      { step: 1, title: 'Log into Airtable', description: 'Go to airtable.com and sign in.', screenshot: 'Airtable – Dashboard' },
      { step: 2, title: 'Go to Account Settings', description: 'Click your profile → Account → Go to developer hub.', screenshot: 'Airtable – Developer Hub' },
      { step: 3, title: 'Create Personal Access Token', description: 'Click "Create new token". Name it and select scopes (data.records:read, data.records:write).', screenshot: 'Airtable – Create Token' },
      { step: 4, title: 'Copy Token', description: 'Copy the generated token.', screenshot: 'Airtable – Copy Token', warning: 'Token is shown only once!' },
      { step: 5, title: 'Get Base ID', description: 'Open your base. The Base ID is in the URL: airtable.com/[BASE_ID]/...', screenshot: 'Airtable – Base ID' },
      { step: 6, title: 'Get Table ID', description: 'Click on the table. Table ID is in URL after base ID.', screenshot: 'Airtable – Table ID', tip: 'Or use table name instead of ID.' },
      { step: 7, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Airtable. Enter API key, Base ID, and Table ID.', screenshot: 'AgentForge – Airtable Form' },
    ],
    triggers: [
      { id: 'record_created', name: 'Record Created', description: 'Fires when a new record is added.', whenItFires: 'When new records appear in the table.', exampleScenario: 'When new lead record created, send welcome message.', dataProvided: ['Record ID', 'All field values', 'Created time'] },
    ],
    actions: [
      { id: 'create_record', name: 'Create Record', description: 'Create a new record in the table.', whenToUse: 'To add new entries.', requiredFields: ['Field values'], example: 'Create lead record with name, email, status.' },
      { id: 'update_record', name: 'Update Record', description: 'Update an existing record.', whenToUse: 'To modify existing data.', requiredFields: ['Record ID', 'Field values'], example: 'Update lead status to "Qualified".' },
      { id: 'find_records', name: 'Find Records', description: 'Search for records matching criteria.', whenToUse: 'To look up existing data.', requiredFields: ['Filter formula'], example: 'Find all leads from today.' },
    ],
    exampleFlow: { title: 'Lead Management Flow', scenario: 'Capture and manage leads in Airtable.', steps: ['Customer contacts via chat', 'AI collects lead information', 'Airtable action creates record', 'Record appears with "New" status', 'Team filters and works leads'] },
    troubleshooting: [
      { error: 'Invalid API key', cause: 'Token expired or revoked.', solution: 'Generate new personal access token.' },
      { error: 'Table not found', cause: 'Wrong table ID or name.', solution: 'Verify table ID from URL or use exact table name.' },
      { error: 'Field not found', cause: 'Field name mismatch.', solution: 'Use exact field names as they appear in Airtable.' },
    ],
    bestPractices: ['Use descriptive field names', 'Set up views for different purposes', 'Use linked records for relationships', 'Add formulas for computed fields', 'Regular backups via CSV export'],
    faq: [
      { question: 'Is Airtable free?', answer: 'Free tier: 1,200 records per base, 2GB attachments. Paid plans for more.' },
      { question: 'Can I link between tables?', answer: 'Yes, Airtable supports linked records for relational data.' },
      { question: 'What field types are supported?', answer: 'Text, number, date, attachment, checkbox, single/multi-select, linked record, and more.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'notion',
    name: 'Notion',
    icon: '📓',
    category: 'storage',
    shortDescription: 'Create pages and database entries in Notion',
    overview: {
      what: 'Notion integration allows your AI agent to create pages and database entries in Notion, the all-in-one workspace.',
      why: 'Notion combines notes, databases, and wikis. Perfect for knowledge management and team collaboration.',
      useCases: ['Meeting notes creation', 'Task and project tracking', 'Knowledge base updates', 'Content management', 'Customer database', 'Documentation'],
      targetAudience: 'Teams using Notion for project management, knowledge bases, or content management.',
    },
    prerequisites: {
      accounts: ['Notion account'],
      permissions: ['Notion integration created', 'Database/page shared with integration'],
      preparations: ['Create Notion integration', 'Share target pages/databases'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Notion Integrations', description: 'Visit notion.so/my-integrations and sign in.', screenshot: 'Notion – My Integrations' },
      { step: 2, title: 'Create Integration', description: 'Click "New integration". Name it, select workspace, set capabilities.', screenshot: 'Notion – Create Integration' },
      { step: 3, title: 'Copy Secret', description: 'Copy the Internal Integration Token (starts with secret_).', screenshot: 'Notion – Copy Secret' },
      { step: 4, title: 'Share with Integration', description: 'Open target database/page → Share → Invite → Select your integration.', screenshot: 'Notion – Share with Integration', warning: 'Integration can only access pages explicitly shared with it.' },
      { step: 5, title: 'Get Database ID', description: 'Open database as full page. ID is in URL after notion.so/ and before ?', screenshot: 'Notion – Database ID' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Notion. Enter API key and Database ID.', screenshot: 'AgentForge – Notion Form' },
    ],
    triggers: [
      { id: 'page_created', name: 'Page Created', description: 'Fires when new page/item is added to database.', whenItFires: 'When new database entries appear.', exampleScenario: 'When new task created, notify team via Slack.', dataProvided: ['Page ID', 'Properties', 'Created time'] },
    ],
    actions: [
      { id: 'create_page', name: 'Create Database Item', description: 'Create a new item in a Notion database.', whenToUse: 'To add entries to databases.', requiredFields: ['Database ID', 'Properties'], example: 'Create task with title, status, due date.' },
      { id: 'update_page', name: 'Update Page', description: 'Update properties of existing page.', whenToUse: 'To modify existing entries.', requiredFields: ['Page ID', 'Properties'], example: 'Update task status to "Done".' },
      { id: 'append_content', name: 'Append Content', description: 'Add content blocks to a page.', whenToUse: 'To add text, lists, or other content.', requiredFields: ['Page ID', 'Content blocks'], example: 'Append meeting notes to page.' },
    ],
    exampleFlow: { title: 'Task Creation Flow', scenario: 'Create tasks from customer requests.', steps: ['Customer requests feature via chat', 'AI categorizes and prioritizes request', 'Notion action creates task entry', 'Task appears in team\'s Notion board', 'Team reviews and plans work'] },
    troubleshooting: [
      { error: 'Object not found', cause: 'Page/database not shared with integration.', solution: 'Share the specific page/database with your integration.' },
      { error: 'Invalid property', cause: 'Property name or type mismatch.', solution: 'Use exact property names and correct value formats.' },
      { error: 'Invalid API key', cause: 'Token was regenerated.', solution: 'Get new token from integration settings.' },
    ],
    bestPractices: ['Share specific pages, not entire workspace', 'Use database templates', 'Keep property names simple', 'Use relations for connected data', 'Document your database schemas'],
    faq: [
      { question: 'Can I access all my pages?', answer: 'No, only pages explicitly shared with the integration.' },
      { question: 'What property types are supported?', answer: 'Title, text, number, select, multi-select, date, checkbox, URL, email, phone, and more.' },
      { question: 'Can I create pages with content?', answer: 'Yes, use the append content action after creating the page.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FIREBASE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'firebase',
    name: 'Firebase',
    icon: '🔥',
    category: 'storage',
    shortDescription: 'Store data in Firestore database',
    overview: {
      what: 'Firebase integration connects your AI agent to Google\'s Firebase Firestore, a scalable NoSQL cloud database.',
      why: 'Firestore offers real-time sync, offline support, and scales automatically. Ideal for mobile/web apps and real-time data.',
      useCases: ['Real-time data storage', 'User profiles and preferences', 'Chat message storage', 'App state management', 'IoT data collection', 'Session data'],
      targetAudience: 'Developers building apps that need real-time data sync and scalable NoSQL storage.',
    },
    prerequisites: {
      accounts: ['Google account', 'Firebase project'],
      permissions: ['Firebase Admin SDK access'],
      preparations: ['Create Firebase project', 'Generate service account key', 'Set up Firestore database'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Firebase Console', description: 'Visit console.firebase.google.com and sign in.', screenshot: 'Firebase – Console' },
      { step: 2, title: 'Create Project', description: 'Click "Add project" and follow the setup wizard.', screenshot: 'Firebase – Create Project' },
      { step: 3, title: 'Create Firestore Database', description: 'Go to Firestore Database → Create database. Choose region and security rules.', screenshot: 'Firebase – Create Firestore' },
      { step: 4, title: 'Generate Service Account', description: 'Go to Project Settings → Service accounts → Generate new private key.', screenshot: 'Firebase – Service Account' },
      { step: 5, title: 'Download JSON Key', description: 'Download the JSON credentials file.', screenshot: 'Firebase – Download Key', warning: 'Keep this file secure!' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Firebase. Upload credentials and enter project ID.', screenshot: 'AgentForge – Firebase Form' },
    ],
    triggers: [
      { id: 'document_created', name: 'Document Created', description: 'Fires when a new document is added to a collection.', whenItFires: 'Real-time when documents are created.', exampleScenario: 'When new order document created, send confirmation.', dataProvided: ['Document ID', 'Document data', 'Collection path'] },
    ],
    actions: [
      { id: 'create_document', name: 'Create Document', description: 'Create a new document in a collection.', whenToUse: 'To store new data.', requiredFields: ['Collection path', 'Document data'], optionalFields: ['Document ID'], example: 'Create order document with customer and items.' },
      { id: 'update_document', name: 'Update Document', description: 'Update fields in existing document.', whenToUse: 'To modify existing data.', requiredFields: ['Document path', 'Update data'], example: 'Update order status.' },
      { id: 'get_document', name: 'Get Document', description: 'Retrieve a document by path.', whenToUse: 'To read existing data.', requiredFields: ['Document path'], example: 'Get customer profile by ID.' },
    ],
    exampleFlow: { title: 'Order Storage Flow', scenario: 'Store order data in real-time database.', steps: ['Customer places order via chat', 'AI creates order object', 'Firebase action creates document', 'Order appears in Firestore', 'App receives real-time update'] },
    troubleshooting: [
      { error: 'Permission denied', cause: 'Security rules blocking access.', solution: 'Check Firestore security rules. For development, you can temporarily allow all.' },
      { error: 'Project not found', cause: 'Wrong project ID.', solution: 'Verify project ID from Firebase console.' },
      { error: 'Invalid credentials', cause: 'Service account key invalid.', solution: 'Generate new service account key.' },
    ],
    bestPractices: ['Design collection structure carefully', 'Use subcollections for related data', 'Index fields you query on', 'Set appropriate security rules', 'Monitor usage and costs'],
    faq: [
      { question: 'What\'s the pricing?', answer: 'Generous free tier (1GB storage, 50K reads/day). Pay as you go beyond.' },
      { question: 'Is data real-time?', answer: 'Yes, Firestore provides real-time sync for connected clients.' },
      { question: 'SQL or NoSQL?', answer: 'NoSQL document database. Data is stored as JSON-like documents.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SUPABASE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'supabase',
    name: 'Supabase',
    icon: '⚡',
    category: 'storage',
    shortDescription: 'Store data in Supabase PostgreSQL database',
    overview: {
      what: 'Supabase integration connects your AI agent to Supabase, the open-source Firebase alternative with a PostgreSQL database.',
      why: 'Supabase offers SQL power with Firebase-like experience. Real-time subscriptions, auth, and storage built-in.',
      useCases: ['Relational data storage', 'User authentication data', 'Complex queries', 'Full-text search', 'Real-time applications', 'File storage'],
      targetAudience: 'Developers who prefer SQL databases but want modern features like real-time sync and easy APIs.',
    },
    prerequisites: {
      accounts: ['Supabase account (free tier available)'],
      permissions: ['Project access'],
      preparations: ['Create Supabase project', 'Get API URL and keys'],
    },
    connectionGuide: [
      { step: 1, title: 'Create Supabase Account', description: 'Go to supabase.com and sign up.', screenshot: 'Supabase – Sign Up' },
      { step: 2, title: 'Create Project', description: 'Click "New Project". Name it and set database password.', screenshot: 'Supabase – New Project', tip: 'Save the database password securely!' },
      { step: 3, title: 'Wait for Setup', description: 'Wait for the project to be created (1-2 minutes).', screenshot: 'Supabase – Project Setup' },
      { step: 4, title: 'Get API Settings', description: 'Go to Settings → API. Copy Project URL and anon/service_role key.', screenshot: 'Supabase – API Settings' },
      { step: 5, title: 'Create Tables', description: 'Go to Table Editor → New Table. Define your schema.', screenshot: 'Supabase – Table Editor' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Supabase. Enter URL and API key.', screenshot: 'AgentForge – Supabase Form' },
    ],
    triggers: [
      { id: 'row_inserted', name: 'Row Inserted', description: 'Fires when a new row is added to a table.', whenItFires: 'Real-time when rows are inserted.', exampleScenario: 'When new user signs up, send welcome sequence.', dataProvided: ['Row data', 'Table name', 'Timestamp'] },
    ],
    actions: [
      { id: 'insert_row', name: 'Insert Row', description: 'Insert a new row into a table.', whenToUse: 'To add new data.', requiredFields: ['Table name', 'Row data'], example: 'Insert new lead record.' },
      { id: 'update_row', name: 'Update Row', description: 'Update existing rows matching conditions.', whenToUse: 'To modify data.', requiredFields: ['Table name', 'Match conditions', 'Update data'], example: 'Update lead status by email.' },
      { id: 'select_rows', name: 'Select Rows', description: 'Query rows from a table.', whenToUse: 'To retrieve data.', requiredFields: ['Table name'], optionalFields: ['Filters', 'Order', 'Limit'], example: 'Get all active leads.' },
    ],
    exampleFlow: { title: 'Data Query Flow', scenario: 'Look up customer data during conversation.', steps: ['Customer asks about their orders', 'AI extracts customer email', 'Supabase action queries orders table', 'Returns matching orders', 'AI formats and presents order info'] },
    troubleshooting: [
      { error: 'Invalid API key', cause: 'Using wrong key type or key revoked.', solution: 'Use correct key (anon for client, service_role for server).' },
      { error: 'Row level security violation', cause: 'RLS policies blocking access.', solution: 'Disable RLS for the table or use service_role key.' },
      { error: 'Column not found', cause: 'Column name mismatch.', solution: 'Check exact column names in Table Editor.' },
    ],
    bestPractices: ['Use RLS for security', 'Create indexes for query performance', 'Use foreign keys for relationships', 'Leverage PostgreSQL features', 'Monitor database size'],
    faq: [
      { question: 'Is Supabase free?', answer: 'Free tier: 500MB database, 1GB file storage, 50K monthly active users.' },
      { question: 'Can I run raw SQL?', answer: 'Yes, via SQL Editor or postgres connection.' },
      { question: 'Is it real-time?', answer: 'Yes, Supabase has built-in real-time subscriptions.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MONGODB
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: '🍃',
    category: 'storage',
    shortDescription: 'Store data in MongoDB database',
    overview: {
      what: 'MongoDB integration connects your AI agent to MongoDB, the popular document database for flexible, scalable data storage.',
      why: 'MongoDB\'s flexible schema handles any data structure. Perfect for evolving data needs and high-volume applications.',
      useCases: ['Flexible data storage', 'Log and event data', 'Content management', 'IoT data', 'Session management', 'User profiles'],
      targetAudience: 'Developers who need flexible schema, high scalability, and document-based storage.',
    },
    prerequisites: {
      accounts: ['MongoDB Atlas account or self-hosted MongoDB'],
      permissions: ['Database user with read/write access'],
      preparations: ['Create cluster', 'Create database user', 'Whitelist IP addresses'],
    },
    connectionGuide: [
      { step: 1, title: 'Create MongoDB Atlas Account', description: 'Go to mongodb.com/atlas and sign up.', screenshot: 'MongoDB Atlas – Sign Up' },
      { step: 2, title: 'Create Cluster', description: 'Click "Build a Cluster". Free tier (M0) available.', screenshot: 'MongoDB – Create Cluster' },
      { step: 3, title: 'Create Database User', description: 'Go to Database Access → Add New Database User. Set username and password.', screenshot: 'MongoDB – Database User' },
      { step: 4, title: 'Whitelist IPs', description: 'Go to Network Access → Add IP Address. Add 0.0.0.0/0 for all (or specific IPs).', screenshot: 'MongoDB – Network Access', warning: '0.0.0.0/0 allows all IPs. Use specific IPs in production.' },
      { step: 5, title: 'Get Connection String', description: 'Click "Connect" → "Connect your application". Copy connection string.', screenshot: 'MongoDB – Connection String' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → MongoDB. Enter connection string, database, and collection names.', screenshot: 'AgentForge – MongoDB Form', tip: 'Replace <password> in connection string with actual password.' },
    ],
    triggers: [
      { id: 'document_inserted', name: 'Document Inserted', description: 'Fires when documents are added to collection.', whenItFires: 'When new documents appear.', exampleScenario: 'When new log entry added, analyze and alert.', dataProvided: ['Document ID', 'Document data'] },
    ],
    actions: [
      { id: 'insert_document', name: 'Insert Document', description: 'Insert a new document into collection.', whenToUse: 'To store new data.', requiredFields: ['Collection', 'Document'], example: 'Insert conversation log.' },
      { id: 'update_document', name: 'Update Document', description: 'Update documents matching filter.', whenToUse: 'To modify existing data.', requiredFields: ['Collection', 'Filter', 'Update'], example: 'Update user preferences.' },
      { id: 'find_documents', name: 'Find Documents', description: 'Query documents from collection.', whenToUse: 'To retrieve data.', requiredFields: ['Collection'], optionalFields: ['Filter', 'Sort', 'Limit'], example: 'Find user by email.' },
    ],
    exampleFlow: { title: 'Conversation Logging Flow', scenario: 'Store conversation history.', steps: ['Customer starts conversation', 'Each message exchanged', 'MongoDB action logs message document', 'Conversation history stored', 'Can be retrieved for context'] },
    troubleshooting: [
      { error: 'Connection failed', cause: 'IP not whitelisted or wrong credentials.', solution: 'Check network access rules and connection string.' },
      { error: 'Authentication failed', cause: 'Wrong username/password.', solution: 'Verify database user credentials.' },
      { error: 'Collection not found', cause: 'Collection doesn\'t exist.', solution: 'MongoDB creates collections on first insert. Check spelling.' },
    ],
    bestPractices: ['Design documents for your query patterns', 'Use indexes for frequent queries', 'Limit document size (<16MB)', 'Use aggregation for complex queries', 'Monitor cluster metrics'],
    faq: [
      { question: 'Is MongoDB Atlas free?', answer: 'M0 free tier: 512MB storage, shared RAM. Good for development and small apps.' },
      { question: 'SQL or NoSQL?', answer: 'NoSQL document database. Uses JSON-like BSON documents.' },
      { question: 'Can I run complex queries?', answer: 'Yes, MongoDB has powerful aggregation pipeline for complex queries.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AWS S3
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'aws_s3',
    name: 'AWS S3',
    icon: '☁️',
    category: 'storage',
    shortDescription: 'Store files in Amazon S3 buckets',
    overview: {
      what: 'AWS S3 integration allows your AI agent to upload, download, and manage files in Amazon\'s Simple Storage Service.',
      why: 'S3 is the industry standard for cloud file storage. Highly durable, scalable, and cost-effective.',
      useCases: ['File uploads and storage', 'Document management', 'Image and media storage', 'Backup storage', 'Static asset hosting', 'Data lake storage'],
      targetAudience: 'Developers and businesses needing reliable, scalable cloud file storage.',
    },
    prerequisites: {
      accounts: ['AWS account'],
      permissions: ['IAM user with S3 access', 'S3 bucket created'],
      preparations: ['Create S3 bucket', 'Create IAM user with S3 permissions', 'Get access keys'],
    },
    connectionGuide: [
      { step: 1, title: 'Log into AWS Console', description: 'Go to aws.amazon.com and sign in.', screenshot: 'AWS – Console' },
      { step: 2, title: 'Create S3 Bucket', description: 'Go to S3 → Create bucket. Name it and select region.', screenshot: 'AWS S3 – Create Bucket' },
      { step: 3, title: 'Create IAM User', description: 'Go to IAM → Users → Add user. Enable programmatic access.', screenshot: 'AWS IAM – Create User' },
      { step: 4, title: 'Attach S3 Policy', description: 'Attach AmazonS3FullAccess policy (or create custom policy).', screenshot: 'AWS IAM – Attach Policy' },
      { step: 5, title: 'Get Access Keys', description: 'Download or copy Access Key ID and Secret Access Key.', screenshot: 'AWS IAM – Access Keys', warning: 'Secret key is shown only once!' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → AWS S3. Enter access keys, bucket, and region.', screenshot: 'AgentForge – AWS S3 Form' },
    ],
    triggers: [
      { id: 'object_created', name: 'Object Created', description: 'Fires when a file is uploaded to the bucket.', whenItFires: 'When new objects appear in bucket.', exampleScenario: 'When invoice uploaded, process and notify customer.', dataProvided: ['Object key', 'Size', 'Content type'] },
    ],
    actions: [
      { id: 'upload_file', name: 'Upload File', description: 'Upload a file to S3 bucket.', whenToUse: 'To store files.', requiredFields: ['File content or URL', 'Object key'], optionalFields: ['Content type', 'ACL'], example: 'Upload customer document.' },
      { id: 'get_file', name: 'Get File', description: 'Download/get URL for a file.', whenToUse: 'To retrieve or share files.', requiredFields: ['Object key'], optionalFields: ['Signed URL expiry'], example: 'Get download link for invoice.' },
      { id: 'delete_file', name: 'Delete File', description: 'Delete a file from bucket.', whenToUse: 'To remove files.', requiredFields: ['Object key'], example: 'Delete temporary file.' },
    ],
    exampleFlow: { title: 'Document Upload Flow', scenario: 'Store customer documents securely.', steps: ['Customer sends document via chat', 'AI receives file', 'S3 action uploads to bucket', 'Returns secure URL', 'URL stored in CRM for reference'] },
    troubleshooting: [
      { error: 'Access denied', cause: 'IAM permissions insufficient.', solution: 'Check IAM policy includes required S3 actions.' },
      { error: 'Bucket not found', cause: 'Wrong bucket name or region.', solution: 'Verify bucket name and region match exactly.' },
      { error: 'Invalid credentials', cause: 'Access keys wrong or deactivated.', solution: 'Verify or regenerate access keys.' },
    ],
    bestPractices: ['Use least-privilege IAM policies', 'Enable versioning for important files', 'Use lifecycle rules for cost management', 'Enable encryption', 'Use signed URLs for temporary access'],
    faq: [
      { question: 'What\'s the pricing?', answer: 'S3 Standard: ~$0.023/GB/month storage + request charges. Free tier: 5GB for 12 months.' },
      { question: 'Is there a file size limit?', answer: 'Single upload: 5GB. Multipart upload: 5TB per object.' },
      { question: 'Can I make files public?', answer: 'Yes, via bucket policy or object ACL. Use signed URLs for temporary access.' },
    ],
  },
];
