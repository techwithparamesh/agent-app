/**
 * MongoDB n8n-style Schema
 * 
 * Comprehensive MongoDB database operations
 */

import { N8nAppSchema } from './types';

export const mongodbSchema: N8nAppSchema = {
  id: 'mongodb',
  name: 'MongoDB',
  description: 'MongoDB NoSQL database',
  version: '1.0.0',
  color: '#13AA52',
  icon: 'mongodb',
  group: ['database'],
  
  credentials: [
    {
      name: 'mongodbApi',
      displayName: 'MongoDB Connection',
      required: true,
      type: 'connectionString',
      properties: [
        {
          name: 'connectionString',
          displayName: 'Connection String',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
          placeholder: 'mongodb+srv://user:password@cluster.mongodb.net/dbname',
        },
        {
          name: 'database',
          displayName: 'Default Database',
          type: 'string',
          required: false,
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // DOCUMENT RESOURCE
    // ============================================
    {
      id: 'document',
      name: 'Document',
      value: 'document',
      description: 'MongoDB documents',
      operations: [
        {
          id: 'insert_one',
          name: 'Insert One',
          value: 'insertOne',
          description: 'Insert a single document',
          action: 'Insert one document',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'document',
              name: 'document',
              displayName: 'Document',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'insert_many',
          name: 'Insert Many',
          value: 'insertMany',
          description: 'Insert multiple documents',
          action: 'Insert many documents',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'documents',
              name: 'documents',
              displayName: 'Documents',
              type: 'json',
              required: true,
              description: 'Array of documents',
            },
          ],
          optionalFields: [
            {
              id: 'ordered',
              name: 'ordered',
              displayName: 'Ordered',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'find_one',
          name: 'Find One',
          value: 'findOne',
          description: 'Find a single document',
          action: 'Find one document',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Query Filter',
              type: 'json',
              required: false,
              default: '{}',
            },
            {
              id: 'projection',
              name: 'projection',
              displayName: 'Projection',
              type: 'json',
              required: false,
              description: 'Fields to include/exclude',
            },
          ],
        },
        {
          id: 'find',
          name: 'Find',
          value: 'find',
          description: 'Find multiple documents',
          action: 'Find documents',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Query Filter',
              type: 'json',
              required: false,
              default: '{}',
            },
            {
              id: 'projection',
              name: 'projection',
              displayName: 'Projection',
              type: 'json',
              required: false,
            },
            {
              id: 'sort',
              name: 'sort',
              displayName: 'Sort',
              type: 'json',
              required: false,
              placeholder: '{"createdAt": -1}',
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
            },
            {
              id: 'skip',
              name: 'skip',
              displayName: 'Skip',
              type: 'number',
              required: false,
            },
          ],
        },
        {
          id: 'update_one',
          name: 'Update One',
          value: 'updateOne',
          description: 'Update a single document',
          action: 'Update one document',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'json',
              required: true,
            },
            {
              id: 'update',
              name: 'update',
              displayName: 'Update',
              type: 'json',
              required: true,
              placeholder: '{"$set": {"field": "value"}}',
            },
          ],
          optionalFields: [
            {
              id: 'upsert',
              name: 'upsert',
              displayName: 'Upsert',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'update_many',
          name: 'Update Many',
          value: 'updateMany',
          description: 'Update multiple documents',
          action: 'Update many documents',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'json',
              required: true,
            },
            {
              id: 'update',
              name: 'update',
              displayName: 'Update',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'upsert',
              name: 'upsert',
              displayName: 'Upsert',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'replace_one',
          name: 'Replace One',
          value: 'replaceOne',
          description: 'Replace a single document',
          action: 'Replace one document',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'json',
              required: true,
            },
            {
              id: 'replacement',
              name: 'replacement',
              displayName: 'Replacement Document',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'upsert',
              name: 'upsert',
              displayName: 'Upsert',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'delete_one',
          name: 'Delete One',
          value: 'deleteOne',
          description: 'Delete a single document',
          action: 'Delete one document',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_many',
          name: 'Delete Many',
          value: 'deleteMany',
          description: 'Delete multiple documents',
          action: 'Delete many documents',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'count',
          name: 'Count Documents',
          value: 'countDocuments',
          description: 'Count documents matching a filter',
          action: 'Count documents',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Query Filter',
              type: 'json',
              required: false,
              default: '{}',
            },
          ],
        },
        {
          id: 'distinct',
          name: 'Distinct',
          value: 'distinct',
          description: 'Get distinct values for a field',
          action: 'Get distinct values',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'field',
              name: 'field',
              displayName: 'Field',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Query Filter',
              type: 'json',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // AGGREGATE RESOURCE
    // ============================================
    {
      id: 'aggregate',
      name: 'Aggregate',
      value: 'aggregate',
      description: 'MongoDB aggregation pipeline',
      operations: [
        {
          id: 'run_aggregate',
          name: 'Run Aggregation',
          value: 'aggregate',
          description: 'Run an aggregation pipeline',
          action: 'Run aggregation',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'pipeline',
              name: 'pipeline',
              displayName: 'Pipeline',
              type: 'json',
              required: true,
              description: 'Array of aggregation stages',
            },
          ],
          optionalFields: [
            {
              id: 'allow_disk_use',
              name: 'allowDiskUse',
              displayName: 'Allow Disk Use',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // INDEX RESOURCE
    // ============================================
    {
      id: 'index',
      name: 'Index',
      value: 'index',
      description: 'Collection indexes',
      operations: [
        {
          id: 'create_index',
          name: 'Create Index',
          value: 'createIndex',
          description: 'Create an index',
          action: 'Create an index',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'keys',
              name: 'keys',
              displayName: 'Index Keys',
              type: 'json',
              required: true,
              placeholder: '{"field": 1}',
            },
          ],
          optionalFields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Index Name',
              type: 'string',
              required: false,
            },
            {
              id: 'unique',
              name: 'unique',
              displayName: 'Unique',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'sparse',
              name: 'sparse',
              displayName: 'Sparse',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'background',
              name: 'background',
              displayName: 'Background',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'expire_after_seconds',
              name: 'expireAfterSeconds',
              displayName: 'Expire After Seconds (TTL)',
              type: 'number',
              required: false,
            },
          ],
        },
        {
          id: 'get_indexes',
          name: 'Get Indexes',
          value: 'getIndexes',
          description: 'List all indexes on a collection',
          action: 'List indexes',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'drop_index',
          name: 'Drop Index',
          value: 'dropIndex',
          description: 'Drop an index',
          action: 'Drop an index',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection',
              type: 'string',
              required: true,
            },
            {
              id: 'index_name',
              name: 'indexName',
              displayName: 'Index Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // COLLECTION RESOURCE
    // ============================================
    {
      id: 'collection',
      name: 'Collection',
      value: 'collection',
      description: 'Database collections',
      operations: [
        {
          id: 'create_collection',
          name: 'Create Collection',
          value: 'createCollection',
          description: 'Create a collection',
          action: 'Create a collection',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'options',
              name: 'options',
              displayName: 'Options',
              type: 'json',
              required: false,
              description: 'Collection options (capped, size, max, etc.)',
            },
          ],
        },
        {
          id: 'list_collections',
          name: 'List Collections',
          value: 'listCollections',
          description: 'List all collections in a database',
          action: 'List collections',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'drop_collection',
          name: 'Drop Collection',
          value: 'dropCollection',
          description: 'Drop a collection',
          action: 'Drop a collection',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Collection Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'rename_collection',
          name: 'Rename Collection',
          value: 'renameCollection',
          description: 'Rename a collection',
          action: 'Rename a collection',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database',
              type: 'string',
              required: true,
            },
            {
              id: 'collection',
              name: 'collection',
              displayName: 'Current Name',
              type: 'string',
              required: true,
            },
            {
              id: 'new_name',
              name: 'newName',
              displayName: 'New Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'drop_target',
              name: 'dropTarget',
              displayName: 'Drop Target',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // DATABASE RESOURCE
    // ============================================
    {
      id: 'database',
      name: 'Database',
      value: 'database',
      description: 'MongoDB databases',
      operations: [
        {
          id: 'list_databases',
          name: 'List Databases',
          value: 'listDatabases',
          description: 'List all databases',
          action: 'List databases',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'drop_database',
          name: 'Drop Database',
          value: 'dropDatabase',
          description: 'Drop a database',
          action: 'Drop a database',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'stats',
          name: 'Database Stats',
          value: 'stats',
          description: 'Get database statistics',
          action: 'Get database stats',
          fields: [
            {
              id: 'database',
              name: 'database',
              displayName: 'Database Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
  ],
};
