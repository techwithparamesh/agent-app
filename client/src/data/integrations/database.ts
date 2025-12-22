import { Integration } from './types';

export const airtableIntegration: Integration = {
  id: 'airtable',
  name: 'Airtable',
  description: 'Use the Airtable node to work with bases, tables, and records. n8n supports CRUD operations, filtering, sorting, and linked records for flexible database workflows.',
  shortDescription: 'Spreadsheet-database hybrid',
  category: 'database',
  icon: 'airtable',
  color: '#18BFFF',
  website: 'https://airtable.com',
  documentationUrl: 'https://airtable.com/developers/web/api/introduction',

  features: [
    'Record CRUD operations',
    'Advanced filtering',
    'Sorting and pagination',
    'Linked records',
    'Attachments handling',
    'Formula fields',
    'Views support',
    'Batch operations',
  ],

  useCases: [
    'Content management',
    'Inventory tracking',
    'CRM lite',
    'Project databases',
    'Event management',
    'Product catalogs',
    'Survey responses',
    'Asset management',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Go to Account Settings',
      description: 'Click your profile picture > Account.',
    },
    {
      step: 2,
      title: 'Generate API Key',
      description: 'In Developer hub, create a personal access token.',
    },
    {
      step: 3,
      title: 'Configure Scopes',
      description: 'Add scopes: data.records:read, data.records:write, schema.bases:read.',
    },
    {
      step: 4,
      title: 'Select Bases',
      description: 'Choose which bases the token can access.',
    },
    {
      step: 5,
      title: 'Copy Token',
      description: 'Copy the generated personal access token.',
    },
    {
      step: 6,
      title: 'Configure in AgentForge',
      description: 'Enter the token in Integrations > Airtable.',
    },
  ],

  operations: [
    {
      name: 'List Records',
      description: 'Get records from a table',
      fields: [
        { name: 'base_id', type: 'string', required: true, description: 'Base ID (starts with app)' },
        { name: 'table_name', type: 'string', required: true, description: 'Table name or ID' },
        { name: 'view', type: 'string', required: false, description: 'View name to filter by' },
        { name: 'filter_by_formula', type: 'string', required: false, description: 'Airtable formula filter' },
        { name: 'sort', type: 'array', required: false, description: 'Sort configuration' },
        { name: 'max_records', type: 'number', required: false, description: 'Max records to return' },
      ],
    },
    {
      name: 'Get Record',
      description: 'Get a single record by ID',
      fields: [
        { name: 'base_id', type: 'string', required: true, description: 'Base ID' },
        { name: 'table_name', type: 'string', required: true, description: 'Table name' },
        { name: 'record_id', type: 'string', required: true, description: 'Record ID (starts with rec)' },
      ],
    },
    {
      name: 'Create Record',
      description: 'Create a new record',
      fields: [
        { name: 'base_id', type: 'string', required: true, description: 'Base ID' },
        { name: 'table_name', type: 'string', required: true, description: 'Table name' },
        { name: 'fields', type: 'json', required: true, description: 'Field values as object' },
      ],
    },
    {
      name: 'Update Record',
      description: 'Update an existing record',
      fields: [
        { name: 'base_id', type: 'string', required: true, description: 'Base ID' },
        { name: 'table_name', type: 'string', required: true, description: 'Table name' },
        { name: 'record_id', type: 'string', required: true, description: 'Record ID' },
        { name: 'fields', type: 'json', required: true, description: 'Fields to update' },
      ],
    },
    {
      name: 'Delete Record',
      description: 'Delete a record',
      fields: [
        { name: 'base_id', type: 'string', required: true, description: 'Base ID' },
        { name: 'table_name', type: 'string', required: true, description: 'Table name' },
        { name: 'record_id', type: 'string', required: true, description: 'Record ID' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Record Created',
      description: 'Triggers when a new record is added',
      when: 'New record in table (polling)',
      outputFields: ['id', 'createdTime', 'fields'],
    },
    {
      name: 'Record Updated',
      description: 'Triggers when a record is modified',
      when: 'Record lastModifiedTime changes',
      outputFields: ['id', 'fields', 'lastModifiedTime'],
    },
  ],

  actions: [
    {
      name: 'Create Record',
      description: 'Add a new record to a table',
      inputFields: ['base_id', 'table_name', 'fields'],
      outputFields: ['id', 'createdTime', 'fields'],
    },
    {
      name: 'Find Record',
      description: 'Find a record by field value',
      inputFields: ['base_id', 'table_name', 'search_field', 'search_value'],
      outputFields: ['id', 'fields'],
    },
  ],

  examples: [
    {
      title: 'Sync Form to Airtable',
      description: 'Log form submissions to Airtable',
      steps: [
        'Trigger: Form submission webhook',
        'Map form fields to Airtable columns',
        'Create record in Submissions table',
        'If priority field = "urgent", send Slack notification',
      ],
      code: `{
  "base_id": "appXXXXXXXXXXXXXX",
  "table_name": "Submissions",
  "fields": {
    "Name": "{{form.name}}",
    "Email": "{{form.email}}",
    "Message": "{{form.message}}",
    "Submitted At": "{{formatDate(now(), 'YYYY-MM-DD')}}",
    "Status": "New"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'INVALID_PERMISSIONS',
      cause: 'Token doesn\'t have access to the base.',
      solution: 'Regenerate token with the base selected in scope.',
    },
    {
      problem: 'Field not found',
      cause: 'Field name doesn\'t match exactly.',
      solution: 'Use exact field names including capitalization and spaces.',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'More than 5 requests/second.',
      solution: 'Implement rate limiting with 200ms delays between requests.',
    },
    {
      problem: 'Invalid filter formula',
      cause: 'Syntax error in filterByFormula.',
      solution: 'Test formula in Airtable first. Use {Field Name} syntax for field references.',
    },
  ],

  relatedIntegrations: ['google-sheets', 'notion', 'firebase'],
  externalResources: [
    { title: 'Airtable Web API', url: 'https://airtable.com/developers/web/api/introduction' },
    { title: 'Formula Reference', url: 'https://support.airtable.com/docs/formula-field-reference' },
  ],
};

export const firebaseIntegration: Integration = {
  id: 'firebase',
  name: 'Firebase',
  description: 'Use the Firebase node to work with Firestore and Realtime Database. n8n supports document operations, queries, and real-time listeners.',
  shortDescription: 'Google\'s app development platform',
  category: 'database',
  icon: 'firebase',
  color: '#FFCA28',
  website: 'https://firebase.google.com',
  documentationUrl: 'https://firebase.google.com/docs',

  features: [
    'Firestore operations',
    'Realtime Database',
    'Document CRUD',
    'Collection queries',
    'Compound queries',
    'Batch operations',
    'Transaction support',
    'Real-time updates',
  ],

  useCases: [
    'Real-time sync',
    'User data storage',
    'App backend',
    'Chat applications',
    'Live dashboards',
    'IoT data storage',
    'Mobile app data',
    'Serverless backend',
  ],

  credentialType: 'service_account',
  credentialSteps: [
    {
      step: 1,
      title: 'Go to Firebase Console',
      description: 'Open console.firebase.google.com and select your project.',
    },
    {
      step: 2,
      title: 'Navigate to Service Accounts',
      description: 'Go to Project Settings > Service accounts.',
    },
    {
      step: 3,
      title: 'Generate Private Key',
      description: 'Click "Generate new private key" to download JSON credentials.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Upload or paste the service account JSON in Integrations > Firebase.',
    },
  ],

  operations: [
    {
      name: 'Get Document',
      description: 'Get a single Firestore document',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection path' },
        { name: 'document_id', type: 'string', required: true, description: 'Document ID' },
      ],
    },
    {
      name: 'Query Collection',
      description: 'Query documents in a collection',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection path' },
        { name: 'where', type: 'array', required: false, description: 'Where conditions [field, op, value]' },
        { name: 'order_by', type: 'string', required: false, description: 'Field to order by' },
        { name: 'limit', type: 'number', required: false, description: 'Max documents to return' },
      ],
    },
    {
      name: 'Create Document',
      description: 'Create a new document',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection path' },
        { name: 'document_id', type: 'string', required: false, description: 'Document ID (auto-generated if omitted)' },
        { name: 'data', type: 'json', required: true, description: 'Document data' },
      ],
    },
    {
      name: 'Update Document',
      description: 'Update document fields',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection path' },
        { name: 'document_id', type: 'string', required: true, description: 'Document ID' },
        { name: 'data', type: 'json', required: true, description: 'Fields to update' },
        { name: 'merge', type: 'boolean', required: false, description: 'Merge with existing data' },
      ],
    },
    {
      name: 'Delete Document',
      description: 'Delete a document',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection path' },
        { name: 'document_id', type: 'string', required: true, description: 'Document ID' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Document Created',
      description: 'Triggers when a document is created',
      when: 'New document in collection',
      outputFields: ['id', 'data', 'createTime'],
    },
    {
      name: 'Document Updated',
      description: 'Triggers when a document changes',
      when: 'Document data modified',
      outputFields: ['id', 'data', 'updateTime', 'before', 'after'],
    },
    {
      name: 'Document Deleted',
      description: 'Triggers when a document is deleted',
      when: 'Document removed',
      outputFields: ['id', 'data'],
    },
  ],

  actions: [
    {
      name: 'Set Document',
      description: 'Create or overwrite a document',
      inputFields: ['collection', 'document_id', 'data'],
      outputFields: ['id', 'writeTime'],
    },
    {
      name: 'Increment Field',
      description: 'Atomically increment a numeric field',
      inputFields: ['collection', 'document_id', 'field', 'increment_by'],
      outputFields: ['id', 'new_value'],
    },
  ],

  examples: [
    {
      title: 'User Activity Logging',
      description: 'Log user actions to Firestore',
      steps: [
        'Trigger: User action event',
        'Create document in activities collection',
        'Include user ID, action type, timestamp',
        'Update user\'s lastActive field',
      ],
      code: `{
  "collection": "activities",
  "data": {
    "userId": "{{user.id}}",
    "action": "{{event.type}}",
    "details": "{{event.data}}",
    "timestamp": "{{serverTimestamp()}}",
    "ip": "{{request.ip}}"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Permission denied',
      cause: 'Firestore security rules blocking access.',
      solution: 'Check security rules or use admin SDK credentials.',
    },
    {
      problem: 'Document not found',
      cause: 'Invalid document path or ID.',
      solution: 'Verify collection and document path. Paths are case-sensitive.',
    },
    {
      problem: 'Invalid query',
      cause: 'Query requires an index.',
      solution: 'Create the required composite index in Firebase console (link in error).',
    },
  ],

  relatedIntegrations: ['mongodb', 'airtable', 'supabase'],
  externalResources: [
    { title: 'Firestore Documentation', url: 'https://firebase.google.com/docs/firestore' },
    { title: 'Security Rules', url: 'https://firebase.google.com/docs/firestore/security/get-started' },
  ],
};

export const mongodbIntegration: Integration = {
  id: 'mongodb',
  name: 'MongoDB',
  description: 'Use the MongoDB node to work with collections and documents. n8n supports all CRUD operations, aggregations, and advanced queries.',
  shortDescription: 'NoSQL document database',
  category: 'database',
  icon: 'mongodb',
  color: '#47A248',
  website: 'https://mongodb.com',
  documentationUrl: 'https://www.mongodb.com/docs/',

  features: [
    'Document CRUD',
    'Advanced queries',
    'Aggregation pipelines',
    'Bulk operations',
    'Index management',
    'Change streams',
    'Transactions',
    'Atlas integration',
  ],

  useCases: [
    'Application data storage',
    'Content management',
    'Real-time analytics',
    'IoT data',
    'Mobile backends',
    'Session storage',
    'Catalog management',
    'Event logging',
  ],

  credentialType: 'connection_string',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Connection String',
      description: 'In MongoDB Atlas, click Connect > Drivers and copy connection string.',
    },
    {
      step: 2,
      title: 'Replace Password',
      description: 'Replace <password> placeholder with your database user password.',
    },
    {
      step: 3,
      title: 'Whitelist IP',
      description: 'In Network Access, add AgentForge\'s IP or allow access from anywhere.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter connection string and database name in Integrations > MongoDB.',
    },
  ],

  operations: [
    {
      name: 'Find Documents',
      description: 'Query documents in a collection',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection name' },
        { name: 'filter', type: 'json', required: false, description: 'Query filter' },
        { name: 'projection', type: 'json', required: false, description: 'Fields to return' },
        { name: 'sort', type: 'json', required: false, description: 'Sort order' },
        { name: 'limit', type: 'number', required: false, description: 'Max documents' },
      ],
    },
    {
      name: 'Insert Document',
      description: 'Insert a new document',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection name' },
        { name: 'document', type: 'json', required: true, description: 'Document to insert' },
      ],
    },
    {
      name: 'Update Documents',
      description: 'Update matching documents',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection name' },
        { name: 'filter', type: 'json', required: true, description: 'Query filter' },
        { name: 'update', type: 'json', required: true, description: 'Update operations' },
        { name: 'upsert', type: 'boolean', required: false, description: 'Insert if not found' },
      ],
    },
    {
      name: 'Delete Documents',
      description: 'Delete matching documents',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection name' },
        { name: 'filter', type: 'json', required: true, description: 'Query filter' },
      ],
    },
    {
      name: 'Aggregate',
      description: 'Run aggregation pipeline',
      fields: [
        { name: 'collection', type: 'string', required: true, description: 'Collection name' },
        { name: 'pipeline', type: 'array', required: true, description: 'Aggregation stages' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Document Inserted',
      description: 'Triggers on new document',
      when: 'Change stream insert event',
      outputFields: ['_id', 'document', 'operationType'],
    },
    {
      name: 'Document Updated',
      description: 'Triggers on document change',
      when: 'Change stream update event',
      outputFields: ['_id', 'updateDescription', 'operationType'],
    },
  ],

  actions: [
    {
      name: 'Insert Document',
      description: 'Add a document to collection',
      inputFields: ['collection', 'document'],
      outputFields: ['insertedId'],
    },
    {
      name: 'Find One and Update',
      description: 'Find and update a single document',
      inputFields: ['collection', 'filter', 'update', 'returnDocument'],
      outputFields: ['value'],
    },
  ],

  examples: [
    {
      title: 'Event Logging',
      description: 'Log events to MongoDB',
      steps: [
        'Trigger: Any workflow event',
        'Format event data with timestamp',
        'Insert document to events collection',
        'Run cleanup aggregation for old events',
      ],
      code: `{
  "collection": "events",
  "document": {
    "type": "{{event.type}}",
    "source": "{{event.source}}",
    "data": "{{event.data}}",
    "timestamp": { "$date": "{{now()}}" },
    "metadata": {
      "workflowId": "{{workflow.id}}",
      "environment": "production"
    }
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Connection refused',
      cause: 'IP not whitelisted in Atlas.',
      solution: 'Add IP to Network Access whitelist in MongoDB Atlas.',
    },
    {
      problem: 'Authentication failed',
      cause: 'Wrong credentials or password encoding.',
      solution: 'Verify username/password. URL-encode special characters in password.',
    },
    {
      problem: 'Query timeout',
      cause: 'Unindexed query on large collection.',
      solution: 'Create appropriate indexes for your queries.',
    },
  ],

  relatedIntegrations: ['firebase', 'postgresql', 'airtable'],
  externalResources: [
    { title: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual/' },
    { title: 'Query Operators', url: 'https://www.mongodb.com/docs/manual/reference/operator/query/' },
  ],
};

export const supabaseIntegration: Integration = {
  id: 'supabase',
  name: 'Supabase',
  description: 'Use the Supabase node for PostgreSQL database operations, authentication, and real-time subscriptions. n8n supports full database CRUD and auth management.',
  shortDescription: 'Open source Firebase alternative',
  category: 'database',
  icon: 'supabase',
  color: '#3ECF8E',
  website: 'https://supabase.com',
  documentationUrl: 'https://supabase.com/docs',

  features: [
    'PostgreSQL operations',
    'Row Level Security',
    'Real-time subscriptions',
    'Authentication',
    'Storage',
    'Edge Functions',
    'Database migrations',
    'Auto-generated APIs',
  ],

  useCases: [
    'Application backend',
    'User authentication',
    'Real-time apps',
    'File storage',
    'Serverless functions',
    'Multi-tenant apps',
    'API development',
    'Dashboard data',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Project URL',
      description: 'In Supabase dashboard, go to Settings > API and copy the Project URL.',
    },
    {
      step: 2,
      title: 'Get API Key',
      description: 'Copy the anon/public key or service_role key (for admin access).',
      note: 'Use service_role key carefully - it bypasses RLS.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter Project URL and API key in Integrations > Supabase.',
    },
  ],

  operations: [
    {
      name: 'Select',
      description: 'Query rows from a table',
      fields: [
        { name: 'table', type: 'string', required: true, description: 'Table name' },
        { name: 'columns', type: 'string', required: false, description: 'Columns to select (default: *)' },
        { name: 'filter', type: 'json', required: false, description: 'Filter conditions' },
        { name: 'order', type: 'string', required: false, description: 'Order by column' },
        { name: 'limit', type: 'number', required: false, description: 'Max rows' },
      ],
    },
    {
      name: 'Insert',
      description: 'Insert new row(s)',
      fields: [
        { name: 'table', type: 'string', required: true, description: 'Table name' },
        { name: 'data', type: 'json', required: true, description: 'Row data (object or array)' },
      ],
    },
    {
      name: 'Update',
      description: 'Update existing rows',
      fields: [
        { name: 'table', type: 'string', required: true, description: 'Table name' },
        { name: 'data', type: 'json', required: true, description: 'Update data' },
        { name: 'match', type: 'json', required: true, description: 'Filter for rows to update' },
      ],
    },
    {
      name: 'Delete',
      description: 'Delete rows',
      fields: [
        { name: 'table', type: 'string', required: true, description: 'Table name' },
        { name: 'match', type: 'json', required: true, description: 'Filter for rows to delete' },
      ],
    },
    {
      name: 'RPC',
      description: 'Call a database function',
      fields: [
        { name: 'function', type: 'string', required: true, description: 'Function name' },
        { name: 'params', type: 'json', required: false, description: 'Function parameters' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Row Inserted',
      description: 'Triggers when a row is inserted',
      when: 'INSERT operation on table',
      outputFields: ['new', 'table', 'schema'],
    },
    {
      name: 'Row Updated',
      description: 'Triggers when a row is updated',
      when: 'UPDATE operation',
      outputFields: ['old', 'new', 'table'],
    },
    {
      name: 'Row Deleted',
      description: 'Triggers when a row is deleted',
      when: 'DELETE operation',
      outputFields: ['old', 'table'],
    },
  ],

  actions: [
    {
      name: 'Upsert',
      description: 'Insert or update based on conflict',
      inputFields: ['table', 'data', 'onConflict'],
      outputFields: ['data'],
    },
  ],

  examples: [
    {
      title: 'User Activity Logging',
      description: 'Track user actions in Supabase',
      steps: [
        'Trigger: User performs action in app',
        'Format event data with timestamp',
        'Insert into activity_logs table',
        'Query for real-time dashboard',
      ],
      code: `// Insert activity log
await supabase
  .from('activity_logs')
  .insert({
    user_id: '{{user.id}}',
    action: '{{event.type}}',
    metadata: { page: '{{event.page}}', duration: {{event.duration}} },
    created_at: new Date().toISOString()
  })`,
    },
  ],

  commonIssues: [
    {
      problem: 'RLS policy violation',
      cause: 'Row Level Security blocking access.',
      solution: 'Check RLS policies or use service_role key.',
    },
    {
      problem: 'Invalid API key',
      cause: 'Using wrong key type or expired key.',
      solution: 'Verify API key in Supabase dashboard.',
    },
  ],

  relatedIntegrations: ['firebase', 'postgresql', 'mongodb'],
  externalResources: [
    { title: 'Supabase Documentation', url: 'https://supabase.com/docs' },
    { title: 'JavaScript Client', url: 'https://supabase.com/docs/reference/javascript' },
  ],
};

export const elasticsearchIntegration: Integration = {
  id: 'elasticsearch',
  name: 'Elasticsearch',
  description: 'Use the Elasticsearch node to search, index, and manage documents. n8n supports full-text search, aggregations, and bulk operations for powerful search workflows.',
  shortDescription: 'Search and analytics engine',
  category: 'database',
  icon: 'elasticsearch',
  color: '#FED10A',
  website: 'https://elastic.co',
  documentationUrl: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html',

  features: [
    'Full-text search',
    'Document indexing',
    'Aggregations',
    'Bulk operations',
    'Index management',
    'Query DSL',
    'Scroll API',
    'Geo queries',
  ],

  useCases: [
    'Full-text search',
    'Log analytics',
    'Application search',
    'Business analytics',
    'Security analytics',
    'Geo search',
    'E-commerce search',
    'Observability',
  ],

  credentialType: 'basic_auth',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Cluster Info',
      description: 'Note your Elasticsearch cluster URL and port.',
    },
    {
      step: 2,
      title: 'Get Credentials',
      description: 'Get username and password (or API key for Elastic Cloud).',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter cluster URL and authentication details.',
    },
  ],

  operations: [
    {
      name: 'Search',
      description: 'Search documents in an index',
      fields: [
        { name: 'index', type: 'string', required: true, description: 'Index name' },
        { name: 'query', type: 'json', required: true, description: 'Elasticsearch query DSL' },
        { name: 'size', type: 'number', required: false, description: 'Results per page' },
        { name: 'from', type: 'number', required: false, description: 'Offset for pagination' },
      ],
    },
    {
      name: 'Index Document',
      description: 'Add or update a document',
      fields: [
        { name: 'index', type: 'string', required: true, description: 'Index name' },
        { name: 'id', type: 'string', required: false, description: 'Document ID (auto-generated if empty)' },
        { name: 'document', type: 'json', required: true, description: 'Document body' },
      ],
    },
    {
      name: 'Delete Document',
      description: 'Delete a document by ID',
      fields: [
        { name: 'index', type: 'string', required: true, description: 'Index name' },
        { name: 'id', type: 'string', required: true, description: 'Document ID' },
      ],
    },
    {
      name: 'Bulk',
      description: 'Perform bulk indexing operations',
      fields: [
        { name: 'operations', type: 'array', required: true, description: 'Array of bulk operations' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Search Documents',
      description: 'Full-text search',
      inputFields: ['index', 'query'],
      outputFields: ['hits', 'total', 'aggregations'],
    },
    {
      name: 'Index Document',
      description: 'Index a document',
      inputFields: ['index', 'document'],
      outputFields: ['_id', '_version', 'result'],
    },
  ],

  examples: [
    {
      title: 'Product Search',
      description: 'Full-text search for products',
      steps: [
        'Trigger: User search query',
        'Build Elasticsearch query with filters',
        'Execute search with aggregations',
        'Return formatted results',
      ],
      code: `{
  "index": "products",
  "query": {
    "bool": {
      "must": [
        { "multi_match": { "query": "{{search.term}}", "fields": ["name^2", "description"] } }
      ],
      "filter": [
        { "term": { "category": "{{search.category}}" } },
        { "range": { "price": { "gte": {{search.min_price}}, "lte": {{search.max_price}} } } }
      ]
    }
  },
  "aggs": {
    "categories": { "terms": { "field": "category" } },
    "price_ranges": { "histogram": { "field": "price", "interval": 50 } }
  },
  "size": 20
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Connection refused',
      cause: 'Wrong host or port, or cluster not running.',
      solution: 'Verify cluster URL and ensure Elasticsearch is running.',
    },
    {
      problem: 'Authentication failed',
      cause: 'Invalid credentials.',
      solution: 'Check username/password or API key.',
    },
    {
      problem: 'Index not found',
      cause: 'Index doesn\'t exist.',
      solution: 'Create the index first or check for typos.',
    },
  ],

  relatedIntegrations: ['mongodb', 'postgresql'],
  externalResources: [
    { title: 'Elasticsearch Guide', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html' },
  ],
};
