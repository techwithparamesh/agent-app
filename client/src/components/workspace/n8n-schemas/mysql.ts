/**
 * MySQL n8n-style Schema
 * 
 * Comprehensive MySQL database operations
 */

import { N8nAppSchema } from './types';

export const mysqlSchema: N8nAppSchema = {
  id: 'mysql',
  name: 'MySQL',
  description: 'MySQL relational database',
  version: '1.0.0',
  color: '#4479A1',
  icon: 'mysql',
  group: ['database'],
  
  credentials: [
    {
      name: 'mysqlConnection',
      displayName: 'MySQL Connection',
      required: true,
      type: 'custom',
      properties: [
        {
          name: 'host',
          displayName: 'Host',
          type: 'string',
          required: true,
          default: 'localhost',
        },
        {
          name: 'port',
          displayName: 'Port',
          type: 'number',
          required: true,
          default: 3306,
        },
        {
          name: 'database',
          displayName: 'Database',
          type: 'string',
          required: true,
        },
        {
          name: 'user',
          displayName: 'User',
          type: 'string',
          required: true,
        },
        {
          name: 'password',
          displayName: 'Password',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
        {
          name: 'ssl',
          displayName: 'SSL',
          type: 'boolean',
          required: false,
          default: false,
        },
        {
          name: 'connectionString',
          displayName: 'Connection String',
          type: 'string',
          required: false,
          description: 'Overrides other settings if provided',
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // QUERY RESOURCE
    // ============================================
    {
      id: 'query',
      name: 'Query',
      value: 'query',
      description: 'Execute SQL queries',
      operations: [
        {
          id: 'execute_query',
          name: 'Execute Query',
          value: 'execute',
          description: 'Execute a SQL query',
          action: 'Execute query',
          fields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Query',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 5,
              },
            },
          ],
          optionalFields: [
            {
              id: 'parameters',
              name: 'parameters',
              displayName: 'Query Parameters',
              type: 'json',
              required: false,
              description: 'Array of parameters for prepared statements',
            },
          ],
        },
        {
          id: 'execute_many',
          name: 'Execute Many',
          value: 'executeMany',
          description: 'Execute query with multiple parameter sets',
          action: 'Execute batch query',
          fields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Query',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'parameters_batch',
              name: 'parametersBatch',
              displayName: 'Parameters Batch',
              type: 'json',
              required: true,
              description: 'Array of parameter arrays',
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // ROW RESOURCE
    // ============================================
    {
      id: 'row',
      name: 'Row',
      value: 'row',
      description: 'Table row operations',
      operations: [
        {
          id: 'insert_row',
          name: 'Insert Row',
          value: 'insert',
          description: 'Insert a new row',
          action: 'Insert row',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table',
              type: 'string',
              required: true,
            },
            {
              id: 'columns',
              name: 'columns',
              displayName: 'Columns',
              type: 'json',
              required: true,
              description: 'Object with column names and values',
            },
          ],
          optionalFields: [
            {
              id: 'ignore',
              name: 'ignore',
              displayName: 'Ignore Duplicates',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'on_duplicate_key',
              name: 'onDuplicateKey',
              displayName: 'On Duplicate Key Update',
              type: 'json',
              required: false,
              description: 'Columns to update on duplicate key',
            },
          ],
        },
        {
          id: 'insert_many',
          name: 'Insert Many',
          value: 'insertMany',
          description: 'Insert multiple rows',
          action: 'Insert many rows',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table',
              type: 'string',
              required: true,
            },
            {
              id: 'rows',
              name: 'rows',
              displayName: 'Rows',
              type: 'json',
              required: true,
              description: 'Array of row objects',
            },
          ],
          optionalFields: [
            {
              id: 'ignore',
              name: 'ignore',
              displayName: 'Ignore Duplicates',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'select_rows',
          name: 'Select Rows',
          value: 'select',
          description: 'Select rows from a table',
          action: 'Select rows',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'columns',
              name: 'columns',
              displayName: 'Columns',
              type: 'string',
              required: false,
              default: '*',
            },
            {
              id: 'where',
              name: 'where',
              displayName: 'Where Clause',
              type: 'string',
              required: false,
              placeholder: 'status = ? AND created_at > ?',
            },
            {
              id: 'where_params',
              name: 'whereParams',
              displayName: 'Where Parameters',
              type: 'json',
              required: false,
            },
            {
              id: 'order_by',
              name: 'orderBy',
              displayName: 'Order By',
              type: 'string',
              required: false,
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
            },
            {
              id: 'offset',
              name: 'offset',
              displayName: 'Offset',
              type: 'number',
              required: false,
            },
          ],
        },
        {
          id: 'update_rows',
          name: 'Update Rows',
          value: 'update',
          description: 'Update rows in a table',
          action: 'Update rows',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table',
              type: 'string',
              required: true,
            },
            {
              id: 'columns',
              name: 'columns',
              displayName: 'Update Values',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'where',
              name: 'where',
              displayName: 'Where Clause',
              type: 'string',
              required: false,
            },
            {
              id: 'where_params',
              name: 'whereParams',
              displayName: 'Where Parameters',
              type: 'json',
              required: false,
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
            },
          ],
        },
        {
          id: 'upsert_row',
          name: 'Upsert Row',
          value: 'upsert',
          description: 'Insert or update a row',
          action: 'Upsert row',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table',
              type: 'string',
              required: true,
            },
            {
              id: 'columns',
              name: 'columns',
              displayName: 'Columns',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'update_columns',
              name: 'updateColumns',
              displayName: 'Update Columns',
              type: 'string',
              required: false,
              description: 'Columns to update on duplicate (comma-separated)',
            },
          ],
        },
        {
          id: 'delete_rows',
          name: 'Delete Rows',
          value: 'delete',
          description: 'Delete rows from a table',
          action: 'Delete rows',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'where',
              name: 'where',
              displayName: 'Where Clause',
              type: 'string',
              required: false,
            },
            {
              id: 'where_params',
              name: 'whereParams',
              displayName: 'Where Parameters',
              type: 'json',
              required: false,
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // TABLE RESOURCE
    // ============================================
    {
      id: 'table',
      name: 'Table',
      value: 'table',
      description: 'Table management',
      operations: [
        {
          id: 'create_table',
          name: 'Create Table',
          value: 'create',
          description: 'Create a new table',
          action: 'Create table',
          fields: [
            {
              id: 'table_name',
              name: 'tableName',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
            {
              id: 'columns_definition',
              name: 'columnsDefinition',
              displayName: 'Columns',
              type: 'json',
              required: true,
              description: 'Array of column definitions: [{"name": "id", "type": "INT AUTO_INCREMENT PRIMARY KEY"}]',
            },
          ],
          optionalFields: [
            {
              id: 'if_not_exists',
              name: 'ifNotExists',
              displayName: 'If Not Exists',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'engine',
              name: 'engine',
              displayName: 'Storage Engine',
              type: 'options',
              required: false,
              default: 'InnoDB',
              options: [
                { name: 'InnoDB', value: 'InnoDB' },
                { name: 'MyISAM', value: 'MyISAM' },
                { name: 'Memory', value: 'MEMORY' },
                { name: 'CSV', value: 'CSV' },
                { name: 'Archive', value: 'ARCHIVE' },
              ],
            },
            {
              id: 'charset',
              name: 'charset',
              displayName: 'Character Set',
              type: 'string',
              required: false,
              default: 'utf8mb4',
            },
            {
              id: 'collation',
              name: 'collation',
              displayName: 'Collation',
              type: 'string',
              required: false,
              default: 'utf8mb4_unicode_ci',
            },
          ],
        },
        {
          id: 'describe_table',
          name: 'Describe Table',
          value: 'describe',
          description: 'Get table structure',
          action: 'Describe table',
          fields: [
            {
              id: 'table_name',
              name: 'tableName',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_tables',
          name: 'List Tables',
          value: 'getMany',
          description: 'List all tables',
          action: 'List tables',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'drop_table',
          name: 'Drop Table',
          value: 'drop',
          description: 'Drop a table',
          action: 'Drop table',
          fields: [
            {
              id: 'table_name',
              name: 'tableName',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'if_exists',
              name: 'ifExists',
              displayName: 'If Exists',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'truncate_table',
          name: 'Truncate Table',
          value: 'truncate',
          description: 'Truncate a table',
          action: 'Truncate table',
          fields: [
            {
              id: 'table_name',
              name: 'tableName',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'alter_table',
          name: 'Alter Table',
          value: 'alter',
          description: 'Alter table structure',
          action: 'Alter table',
          fields: [
            {
              id: 'table_name',
              name: 'tableName',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
            {
              id: 'operation',
              name: 'operation',
              displayName: 'Operation',
              type: 'options',
              required: true,
              options: [
                { name: 'Add Column', value: 'ADD COLUMN' },
                { name: 'Drop Column', value: 'DROP COLUMN' },
                { name: 'Modify Column', value: 'MODIFY COLUMN' },
                { name: 'Change Column', value: 'CHANGE COLUMN' },
                { name: 'Add Index', value: 'ADD INDEX' },
                { name: 'Drop Index', value: 'DROP INDEX' },
                { name: 'Rename Table', value: 'RENAME TO' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'column_name',
              name: 'columnName',
              displayName: 'Column Name',
              type: 'string',
              required: false,
            },
            {
              id: 'column_definition',
              name: 'columnDefinition',
              displayName: 'Column Definition',
              type: 'string',
              required: false,
            },
            {
              id: 'new_name',
              name: 'newName',
              displayName: 'New Name',
              type: 'string',
              required: false,
            },
            {
              id: 'index_name',
              name: 'indexName',
              displayName: 'Index Name',
              type: 'string',
              required: false,
            },
            {
              id: 'index_columns',
              name: 'indexColumns',
              displayName: 'Index Columns',
              type: 'string',
              required: false,
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
      description: 'Index management',
      operations: [
        {
          id: 'create_index',
          name: 'Create Index',
          value: 'create',
          description: 'Create an index',
          action: 'Create index',
          fields: [
            {
              id: 'index_name',
              name: 'indexName',
              displayName: 'Index Name',
              type: 'string',
              required: true,
            },
            {
              id: 'table_name',
              name: 'tableName',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
            {
              id: 'columns',
              name: 'columns',
              displayName: 'Columns',
              type: 'string',
              required: true,
              description: 'Comma-separated column names',
            },
          ],
          optionalFields: [
            {
              id: 'unique',
              name: 'unique',
              displayName: 'Unique',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'index_type',
              name: 'indexType',
              displayName: 'Index Type',
              type: 'options',
              required: false,
              options: [
                { name: 'B-Tree (Default)', value: 'BTREE' },
                { name: 'Hash', value: 'HASH' },
                { name: 'Full-Text', value: 'FULLTEXT' },
                { name: 'Spatial', value: 'SPATIAL' },
              ],
            },
          ],
        },
        {
          id: 'show_indexes',
          name: 'Show Indexes',
          value: 'getMany',
          description: 'Show indexes on a table',
          action: 'Show indexes',
          fields: [
            {
              id: 'table_name',
              name: 'tableName',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'drop_index',
          name: 'Drop Index',
          value: 'drop',
          description: 'Drop an index',
          action: 'Drop index',
          fields: [
            {
              id: 'index_name',
              name: 'indexName',
              displayName: 'Index Name',
              type: 'string',
              required: true,
            },
            {
              id: 'table_name',
              name: 'tableName',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // STORED PROCEDURE RESOURCE
    // ============================================
    {
      id: 'procedure',
      name: 'Stored Procedure',
      value: 'procedure',
      description: 'Stored procedure operations',
      operations: [
        {
          id: 'call_procedure',
          name: 'Call Procedure',
          value: 'call',
          description: 'Call a stored procedure',
          action: 'Call procedure',
          fields: [
            {
              id: 'procedure_name',
              name: 'procedureName',
              displayName: 'Procedure Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'parameters',
              name: 'parameters',
              displayName: 'Parameters',
              type: 'json',
              required: false,
              description: 'Array of procedure parameters',
            },
          ],
        },
        {
          id: 'list_procedures',
          name: 'List Procedures',
          value: 'getMany',
          description: 'List stored procedures',
          action: 'List procedures',
          fields: [],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // TRANSACTION RESOURCE
    // ============================================
    {
      id: 'transaction',
      name: 'Transaction',
      value: 'transaction',
      description: 'Transaction operations',
      operations: [
        {
          id: 'execute_transaction',
          name: 'Execute Transaction',
          value: 'execute',
          description: 'Execute queries in a transaction',
          action: 'Execute transaction',
          fields: [
            {
              id: 'queries',
              name: 'queries',
              displayName: 'Queries',
              type: 'json',
              required: true,
              description: 'Array of query objects',
            },
          ],
          optionalFields: [
            {
              id: 'isolation_level',
              name: 'isolationLevel',
              displayName: 'Isolation Level',
              type: 'options',
              required: false,
              options: [
                { name: 'Read Uncommitted', value: 'READ UNCOMMITTED' },
                { name: 'Read Committed', value: 'READ COMMITTED' },
                { name: 'Repeatable Read', value: 'REPEATABLE READ' },
                { name: 'Serializable', value: 'SERIALIZABLE' },
              ],
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
      description: 'Database operations',
      operations: [
        {
          id: 'create_database',
          name: 'Create Database',
          value: 'create',
          description: 'Create a new database',
          action: 'Create database',
          fields: [
            {
              id: 'database_name',
              name: 'databaseName',
              displayName: 'Database Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'if_not_exists',
              name: 'ifNotExists',
              displayName: 'If Not Exists',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'charset',
              name: 'charset',
              displayName: 'Character Set',
              type: 'string',
              required: false,
              default: 'utf8mb4',
            },
            {
              id: 'collation',
              name: 'collation',
              displayName: 'Collation',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'list_databases',
          name: 'List Databases',
          value: 'getMany',
          description: 'List all databases',
          action: 'List databases',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'drop_database',
          name: 'Drop Database',
          value: 'drop',
          description: 'Drop a database',
          action: 'Drop database',
          fields: [
            {
              id: 'database_name',
              name: 'databaseName',
              displayName: 'Database Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'if_exists',
              name: 'ifExists',
              displayName: 'If Exists',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'get_status',
          name: 'Get Status',
          value: 'status',
          description: 'Get database status',
          action: 'Get status',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'get_variables',
          name: 'Get Variables',
          value: 'variables',
          description: 'Get server variables',
          action: 'Get variables',
          fields: [],
          optionalFields: [
            {
              id: 'pattern',
              name: 'pattern',
              displayName: 'Variable Pattern',
              type: 'string',
              required: false,
              placeholder: '%timeout%',
            },
          ],
        },
      ],
    },
  ],
};
