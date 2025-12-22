import type { Integration } from './types';

// Additional Storage & Cloud Integrations

export const dropboxIntegration: Integration = {
  id: 'dropbox',
  name: 'Dropbox',
  description: 'Use the Dropbox node to manage files and folders in the cloud. n8n supports upload, download, sharing, and team folder operations.',
  shortDescription: 'Cloud file storage',
  category: 'database',
  icon: 'dropbox',
  color: '#0061FF',
  website: 'https://dropbox.com',
  documentationUrl: 'https://www.dropbox.com/developers',

  features: [
    'File upload/download',
    'Folder management',
    'File sharing',
    'Team folders',
    'Search files',
    'Metadata handling',
    'Version history',
    'Shared links',
  ],

  useCases: [
    'File backup',
    'Document sharing',
    'Asset management',
    'Team collaboration',
    'Archive storage',
    'File sync',
    'Media hosting',
    'Data export',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Dropbox App',
      description: 'Go to dropbox.com/developers/apps and create an app.',
    },
    {
      step: 2,
      title: 'Configure Permissions',
      description: 'Set required scopes for file access.',
    },
    {
      step: 3,
      title: 'Get Credentials',
      description: 'Copy App Key and App Secret.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter credentials and authorize.',
    },
  ],

  operations: [
    {
      name: 'Upload File',
      description: 'Upload a file to Dropbox',
      fields: [
        { name: 'path', type: 'string', required: true, description: 'Destination path' },
        { name: 'file', type: 'binary', required: true, description: 'File content' },
        { name: 'mode', type: 'select', required: false, description: 'add, overwrite, or update' },
      ],
    },
    {
      name: 'Download File',
      description: 'Download a file',
      fields: [
        { name: 'path', type: 'string', required: true, description: 'File path' },
      ],
    },
    {
      name: 'Create Shared Link',
      description: 'Generate shareable link',
      fields: [
        { name: 'path', type: 'string', required: true, description: 'File or folder path' },
        { name: 'settings', type: 'json', required: false, description: 'Link settings' },
      ],
    },
  ],

  triggers: [
    {
      name: 'File Added',
      description: 'Triggers when file is added',
      when: 'New file in folder',
      outputFields: ['name', 'path_lower', 'size', 'client_modified'],
    },
    {
      name: 'File Modified',
      description: 'Triggers on file change',
      when: 'File content modified',
      outputFields: ['name', 'path_lower', 'rev'],
    },
  ],

  actions: [
    {
      name: 'Move File',
      description: 'Move file to new location',
      inputFields: ['from_path', 'to_path'],
      outputFields: ['metadata'],
    },
  ],

  examples: [
    {
      title: 'Report Archival',
      description: 'Archive reports to organized Dropbox folders',
      steps: [
        'Trigger: Monthly report generated',
        'Create year/month folder structure',
        'Upload report PDF',
        'Create shared link for stakeholders',
      ],
      code: `{
  "path": "/Reports/{{year}}/{{month}}/Report_{{formatDate(now(), 'YYYY-MM-DD')}}.pdf",
  "mode": "add",
  "autorename": true,
  "mute": false
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Path not found',
      cause: 'Using wrong path format.',
      solution: 'Use forward slashes and start with "/" for root.',
    },
    {
      problem: 'Insufficient space',
      cause: 'Account storage limit reached.',
      solution: 'Clean up files or upgrade storage plan.',
    },
  ],

  relatedIntegrations: ['google-drive', 'box'],
  externalResources: [
    { title: 'Dropbox API', url: 'https://www.dropbox.com/developers/documentation/http/documentation' },
  ],
};

export const awsS3Integration: Integration = {
  id: 'aws-s3',
  name: 'Amazon S3',
  description: 'Use the AWS S3 node for object storage operations. n8n supports upload, download, and bucket management with scalable cloud storage.',
  shortDescription: 'Scalable object storage',
  category: 'database',
  icon: 'aws',
  color: '#FF9900',
  website: 'https://aws.amazon.com/s3',
  documentationUrl: 'https://docs.aws.amazon.com/s3/',

  features: [
    'Object upload/download',
    'Bucket management',
    'Pre-signed URLs',
    'Versioning',
    'Access control',
    'Lifecycle policies',
    'Event notifications',
    'Cross-region replication',
  ],

  useCases: [
    'File storage',
    'Static hosting',
    'Data backup',
    'Media storage',
    'Log archival',
    'Data lake',
    'CDN origin',
    'Application assets',
  ],

  credentialType: 'custom',
  credentialSteps: [
    {
      step: 1,
      title: 'Create IAM User',
      description: 'In AWS Console, create an IAM user with S3 access.',
    },
    {
      step: 2,
      title: 'Attach S3 Policy',
      description: 'Attach AmazonS3FullAccess or custom S3 policy.',
    },
    {
      step: 3,
      title: 'Get Credentials',
      description: 'Create access key and copy Access Key ID and Secret.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter credentials, region, and bucket name.',
    },
  ],

  operations: [
    {
      name: 'Upload Object',
      description: 'Upload an object to S3',
      fields: [
        { name: 'bucket', type: 'string', required: true, description: 'Bucket name' },
        { name: 'key', type: 'string', required: true, description: 'Object key (path)' },
        { name: 'body', type: 'binary', required: true, description: 'Object content' },
        { name: 'content_type', type: 'string', required: false, description: 'MIME type' },
        { name: 'acl', type: 'select', required: false, description: 'Access control' },
      ],
    },
    {
      name: 'Download Object',
      description: 'Download an object',
      fields: [
        { name: 'bucket', type: 'string', required: true, description: 'Bucket name' },
        { name: 'key', type: 'string', required: true, description: 'Object key' },
      ],
    },
    {
      name: 'Generate Pre-signed URL',
      description: 'Create temporary access URL',
      fields: [
        { name: 'bucket', type: 'string', required: true, description: 'Bucket name' },
        { name: 'key', type: 'string', required: true, description: 'Object key' },
        { name: 'expires', type: 'number', required: false, description: 'Expiry in seconds' },
        { name: 'operation', type: 'select', required: true, description: 'getObject or putObject' },
      ],
    },
    {
      name: 'List Objects',
      description: 'List objects in bucket',
      fields: [
        { name: 'bucket', type: 'string', required: true, description: 'Bucket name' },
        { name: 'prefix', type: 'string', required: false, description: 'Filter by prefix' },
        { name: 'max_keys', type: 'number', required: false, description: 'Max results' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Object Created',
      description: 'Triggers when object is created',
      when: 'New object in bucket (via S3 Events)',
      outputFields: ['bucket', 'key', 'size', 'etag'],
    },
    {
      name: 'Object Deleted',
      description: 'Triggers when object is deleted',
      when: 'Object removed from bucket',
      outputFields: ['bucket', 'key'],
    },
  ],

  actions: [
    {
      name: 'Delete Object',
      description: 'Delete an object',
      inputFields: ['bucket', 'key'],
      outputFields: ['deleted'],
    },
  ],

  examples: [
    {
      title: 'User Upload Handler',
      description: 'Process and store user uploads',
      steps: [
        'Trigger: File uploaded by user',
        'Validate file type and size',
        'Upload to S3 with unique key',
        'Return pre-signed URL',
      ],
      code: `// Upload to S3
{
  "Bucket": "{{s3_bucket}}",
  "Key": "uploads/{{user.id}}/{{timestamp}}_{{file.name}}",
  "Body": "{{file.binary}}",
  "ContentType": "{{file.mime_type}}",
  "Metadata": {
    "uploaded-by": "{{user.id}}",
    "original-name": "{{file.name}}"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Access Denied',
      cause: 'IAM policy doesn\'t allow operation.',
      solution: 'Check IAM policy and bucket policy permissions.',
    },
    {
      problem: 'Bucket not found',
      cause: 'Wrong bucket name or region.',
      solution: 'Verify bucket name and configure correct region.',
    },
  ],

  relatedIntegrations: ['google-drive', 'dropbox'],
  externalResources: [
    { title: 'S3 API Reference', url: 'https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html' },
  ],
};

export const postgresqlIntegration: Integration = {
  id: 'postgresql',
  name: 'PostgreSQL',
  description: 'Use the PostgreSQL node for database operations. n8n supports queries, inserts, updates, and transactions with PostgreSQL databases.',
  shortDescription: 'Advanced relational database',
  category: 'database',
  icon: 'postgresql',
  color: '#336791',
  website: 'https://postgresql.org',
  documentationUrl: 'https://www.postgresql.org/docs/',

  features: [
    'SQL queries',
    'Parameterized queries',
    'Transactions',
    'Batch operations',
    'Connection pooling',
    'JSON support',
    'Full-text search',
    'Stored procedures',
  ],

  useCases: [
    'Data storage',
    'Analytics queries',
    'Report generation',
    'Application backend',
    'Data warehousing',
    'User management',
    'Transaction processing',
    'Data sync',
  ],

  credentialType: 'connection_string',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Connection Details',
      description: 'Obtain host, port, database name, username, and password.',
    },
    {
      step: 2,
      title: 'Configure SSL',
      description: 'Set up SSL certificates if required.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter connection string or individual credentials.',
    },
  ],

  operations: [
    {
      name: 'Execute Query',
      description: 'Run a SQL query',
      fields: [
        { name: 'query', type: 'string', required: true, description: 'SQL query' },
        { name: 'parameters', type: 'array', required: false, description: 'Query parameters' },
      ],
    },
    {
      name: 'Insert',
      description: 'Insert rows into table',
      fields: [
        { name: 'table', type: 'string', required: true, description: 'Table name' },
        { name: 'data', type: 'json', required: true, description: 'Row data' },
        { name: 'returning', type: 'string', required: false, description: 'Columns to return' },
      ],
    },
    {
      name: 'Update',
      description: 'Update rows in table',
      fields: [
        { name: 'table', type: 'string', required: true, description: 'Table name' },
        { name: 'data', type: 'json', required: true, description: 'Update data' },
        { name: 'where', type: 'string', required: true, description: 'WHERE clause' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Upsert',
      description: 'Insert or update on conflict',
      inputFields: ['table', 'data', 'conflict_columns'],
      outputFields: ['rows_affected'],
    },
  ],

  examples: [
    {
      title: 'Customer Analytics Query',
      description: 'Generate customer segment analytics',
      steps: [
        'Trigger: Daily at midnight',
        'Run aggregation query',
        'Format results',
        'Send report',
      ],
      code: `SELECT 
  segment,
  COUNT(*) as customer_count,
  AVG(lifetime_value) as avg_ltv,
  SUM(orders_count) as total_orders
FROM customers
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY segment
ORDER BY avg_ltv DESC`,
    },
  ],

  commonIssues: [
    {
      problem: 'Connection refused',
      cause: 'Database not accessible from AgentForge.',
      solution: 'Check firewall rules and allow AgentForge IP.',
    },
    {
      problem: 'SSL required',
      cause: 'Database requires SSL connection.',
      solution: 'Enable SSL in connection settings.',
    },
  ],

  relatedIntegrations: ['supabase', 'mysql'],
  externalResources: [
    { title: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/current/' },
  ],
};

export const mysqlIntegration: Integration = {
  id: 'mysql',
  name: 'MySQL',
  description: 'Use the MySQL node for database operations. n8n supports queries, stored procedures, and transactions with MySQL and MariaDB.',
  shortDescription: 'Popular relational database',
  category: 'database',
  icon: 'mysql',
  color: '#4479A1',
  website: 'https://mysql.com',
  documentationUrl: 'https://dev.mysql.com/doc/',

  features: [
    'SQL queries',
    'Stored procedures',
    'Transactions',
    'Batch inserts',
    'Connection pooling',
    'Prepared statements',
    'Binary data',
    'Full-text search',
  ],

  useCases: [
    'Web applications',
    'E-commerce data',
    'Content management',
    'User authentication',
    'Log storage',
    'Reporting',
    'Legacy systems',
    'Data migration',
  ],

  credentialType: 'connection_string',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Connection Details',
      description: 'Obtain host, port (3306), database, user, and password.',
    },
    {
      step: 2,
      title: 'Grant Permissions',
      description: 'Ensure user has required table permissions.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter connection credentials.',
    },
  ],

  operations: [
    {
      name: 'Execute Query',
      description: 'Run a SQL query',
      fields: [
        { name: 'query', type: 'string', required: true, description: 'SQL query' },
        { name: 'parameters', type: 'array', required: false, description: 'Query parameters' },
      ],
    },
    {
      name: 'Insert',
      description: 'Insert rows',
      fields: [
        { name: 'table', type: 'string', required: true, description: 'Table name' },
        { name: 'data', type: 'json', required: true, description: 'Row data' },
      ],
    },
    {
      name: 'Call Procedure',
      description: 'Call stored procedure',
      fields: [
        { name: 'procedure', type: 'string', required: true, description: 'Procedure name' },
        { name: 'parameters', type: 'array', required: false, description: 'Procedure parameters' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Batch Insert',
      description: 'Insert multiple rows efficiently',
      inputFields: ['table', 'rows'],
      outputFields: ['affected_rows'],
    },
  ],

  examples: [
    {
      title: 'Order Sync',
      description: 'Sync orders from external system',
      steps: [
        'Trigger: Order received via webhook',
        'Check if order exists',
        'Insert or update order record',
        'Update inventory',
      ],
      code: `INSERT INTO orders (order_id, customer_id, total, status, created_at)
VALUES (?, ?, ?, 'pending', NOW())
ON DUPLICATE KEY UPDATE
  total = VALUES(total),
  status = VALUES(status),
  updated_at = NOW()`,
    },
  ],

  commonIssues: [
    {
      problem: 'Access denied',
      cause: 'Wrong credentials or host not allowed.',
      solution: 'Check user@host permissions with SHOW GRANTS.',
    },
    {
      problem: 'Too many connections',
      cause: 'Connection pool exhausted.',
      solution: 'Increase max_connections or use connection pooling.',
    },
  ],

  relatedIntegrations: ['postgresql', 'mongodb'],
  externalResources: [
    { title: 'MySQL Reference', url: 'https://dev.mysql.com/doc/refman/8.0/en/' },
  ],
};

export const redisIntegration: Integration = {
  id: 'redis',
  name: 'Redis',
  description: 'Use the Redis node for in-memory data operations. n8n supports caching, pub/sub, and data structure operations with Redis.',
  shortDescription: 'In-memory data store',
  category: 'database',
  icon: 'redis',
  color: '#DC382D',
  website: 'https://redis.io',
  documentationUrl: 'https://redis.io/documentation',

  features: [
    'Key-value operations',
    'Pub/Sub messaging',
    'Lists and sets',
    'Hashes',
    'Sorted sets',
    'Transactions',
    'TTL/expiration',
    'Lua scripting',
  ],

  useCases: [
    'Caching',
    'Session storage',
    'Real-time analytics',
    'Message queues',
    'Rate limiting',
    'Leaderboards',
    'Pub/Sub messaging',
    'Job queues',
  ],

  credentialType: 'connection_string',
  credentialSteps: [
    {
      step: 1,
      title: 'Get Redis URL',
      description: 'Obtain host, port (6379), and password if set.',
    },
    {
      step: 2,
      title: 'Configure TLS',
      description: 'Enable TLS if using cloud Redis.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter connection URL or individual settings.',
    },
  ],

  operations: [
    {
      name: 'Get',
      description: 'Get value by key',
      fields: [
        { name: 'key', type: 'string', required: true, description: 'Key name' },
      ],
    },
    {
      name: 'Set',
      description: 'Set key-value pair',
      fields: [
        { name: 'key', type: 'string', required: true, description: 'Key name' },
        { name: 'value', type: 'string', required: true, description: 'Value to store' },
        { name: 'ttl', type: 'number', required: false, description: 'Expiry in seconds' },
      ],
    },
    {
      name: 'Publish',
      description: 'Publish message to channel',
      fields: [
        { name: 'channel', type: 'string', required: true, description: 'Channel name' },
        { name: 'message', type: 'string', required: true, description: 'Message to publish' },
      ],
    },
    {
      name: 'Increment',
      description: 'Increment numeric value',
      fields: [
        { name: 'key', type: 'string', required: true, description: 'Key name' },
        { name: 'amount', type: 'number', required: false, description: 'Increment amount' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Message Received',
      description: 'Triggers on pub/sub message',
      when: 'Message published to subscribed channel',
      outputFields: ['channel', 'message'],
    },
  ],

  actions: [
    {
      name: 'Delete Key',
      description: 'Remove a key',
      inputFields: ['key'],
      outputFields: ['deleted'],
    },
  ],

  examples: [
    {
      title: 'API Rate Limiting',
      description: 'Implement rate limiting with Redis',
      steps: [
        'Trigger: API request received',
        'Get current request count',
        'Increment counter with TTL',
        'Allow or deny based on limit',
      ],
      code: `// Rate limit check
MULTI
INCR rate_limit:{{user_id}}
EXPIRE rate_limit:{{user_id}} 60
EXEC

// Returns current count; limit at 100/minute`,
    },
  ],

  commonIssues: [
    {
      problem: 'Connection refused',
      cause: 'Redis not running or wrong port.',
      solution: 'Verify Redis is running and check port/host.',
    },
    {
      problem: 'AUTH failed',
      cause: 'Wrong password or AUTH not configured.',
      solution: 'Check requirepass in redis.conf.',
    },
  ],

  relatedIntegrations: ['mongodb', 'postgresql'],
  externalResources: [
    { title: 'Redis Commands', url: 'https://redis.io/commands/' },
  ],
};

export const dynamodbIntegration: Integration = {
  id: 'dynamodb',
  name: 'AWS DynamoDB',
  description: 'Use the DynamoDB node to manage items in AWS DynamoDB tables. Supports CRUD operations, queries, and scans for NoSQL data workflows.',
  shortDescription: 'AWS NoSQL database',
  category: 'database',
  icon: 'dynamodb',
  color: '#4053D6',
  website: 'https://aws.amazon.com/dynamodb',
  documentationUrl: 'https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/',

  features: [
    'Item CRUD operations',
    'Query operations',
    'Scan operations',
    'Batch operations',
    'Conditional updates',
    'Transactions',
    'Streams',
    'Global tables',
  ],

  useCases: [
    'Serverless applications',
    'User sessions',
    'Gaming leaderboards',
    'IoT data storage',
    'Mobile backends',
    'Real-time analytics',
    'Shopping carts',
    'Metadata storage',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Create IAM User',
      description: 'In AWS IAM, create a user with DynamoDB access.',
    },
    {
      step: 2,
      title: 'Get Access Keys',
      description: 'Create and download access key ID and secret.',
    },
    {
      step: 3,
      title: 'Note Region',
      description: 'Note the AWS region of your DynamoDB table.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter access keys, region, and table name.',
    },
  ],

  operations: [
    {
      name: 'Put Item',
      description: 'Create or replace an item',
      fields: [
        { name: 'table_name', type: 'string', required: true, description: 'Table name' },
        { name: 'item', type: 'json', required: true, description: 'Item data' },
        { name: 'condition', type: 'string', required: false, description: 'Condition expression' },
      ],
    },
    {
      name: 'Get Item',
      description: 'Retrieve a single item by key',
      fields: [
        { name: 'table_name', type: 'string', required: true, description: 'Table name' },
        { name: 'key', type: 'json', required: true, description: 'Primary key' },
        { name: 'consistent_read', type: 'boolean', required: false, description: 'Strongly consistent read' },
      ],
    },
    {
      name: 'Query',
      description: 'Query items by partition key',
      fields: [
        { name: 'table_name', type: 'string', required: true, description: 'Table name' },
        { name: 'key_condition', type: 'string', required: true, description: 'Key condition expression' },
        { name: 'filter', type: 'string', required: false, description: 'Filter expression' },
        { name: 'limit', type: 'number', required: false, description: 'Max items to return' },
      ],
    },
    {
      name: 'Update Item',
      description: 'Update item attributes',
      fields: [
        { name: 'table_name', type: 'string', required: true, description: 'Table name' },
        { name: 'key', type: 'json', required: true, description: 'Primary key' },
        { name: 'update_expression', type: 'string', required: true, description: 'Update expression' },
        { name: 'expression_values', type: 'json', required: true, description: 'Expression values' },
      ],
    },
    {
      name: 'Delete Item',
      description: 'Delete an item',
      fields: [
        { name: 'table_name', type: 'string', required: true, description: 'Table name' },
        { name: 'key', type: 'json', required: true, description: 'Primary key' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Put Item',
      description: 'Create or update item',
      inputFields: ['table_name', 'item'],
      outputFields: ['Attributes'],
    },
    {
      name: 'Query Items',
      description: 'Query by partition key',
      inputFields: ['table_name', 'key_condition'],
      outputFields: ['Items', 'Count'],
    },
  ],

  examples: [
    {
      title: 'User Session Management',
      description: 'Store and retrieve user sessions',
      steps: [
        'Trigger: User logs in',
        'Create session with TTL',
        'Store in DynamoDB',
        'Query on subsequent requests',
      ],
      code: `{
  "TableName": "UserSessions",
  "Item": {
    "session_id": { "S": "{{generateUUID()}}" },
    "user_id": { "S": "{{user.id}}" },
    "created_at": { "N": "{{timestamp()}}" },
    "ttl": { "N": "{{timestamp() + 86400}}" },
    "data": { "M": {
      "ip": { "S": "{{request.ip}}" },
      "user_agent": { "S": "{{request.userAgent}}" }
    }}
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'ValidationException',
      cause: 'Invalid attribute types or missing required attributes.',
      solution: 'Ensure all attributes match table schema.',
    },
    {
      problem: 'ProvisionedThroughputExceededException',
      cause: 'Request rate exceeds provisioned capacity.',
      solution: 'Enable auto-scaling or increase provisioned capacity.',
    },
    {
      problem: 'ResourceNotFoundException',
      cause: 'Table doesn\'t exist or wrong region.',
      solution: 'Verify table name and AWS region.',
    },
  ],

  relatedIntegrations: ['aws-s3', 'mongodb', 'firebase'],
  externalResources: [
    { title: 'DynamoDB Developer Guide', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/' },
  ],
};

