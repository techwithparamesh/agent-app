/**
 * GraphQL n8n-style Schema
 * 
 * Comprehensive GraphQL API operations
 */

import { N8nAppSchema } from './types';

export const graphqlSchema: N8nAppSchema = {
  id: 'graphql',
  name: 'GraphQL',
  description: 'GraphQL API requests',
  version: '1.0.0',
  color: '#E10098',
  icon: 'graphql',
  group: ['developer'],
  
  credentials: [
    {
      name: 'graphqlApi',
      displayName: 'GraphQL API',
      required: true,
      type: 'custom',
      properties: [
        {
          name: 'endpoint',
          displayName: 'GraphQL Endpoint',
          type: 'string',
          required: true,
        },
        {
          name: 'authType',
          displayName: 'Authentication Type',
          type: 'options',
          required: false,
          options: [
            { name: 'None', value: 'none' },
            { name: 'Bearer Token', value: 'bearer' },
            { name: 'Basic Auth', value: 'basic' },
            { name: 'API Key', value: 'apiKey' },
            { name: 'OAuth2', value: 'oauth2' },
          ],
        },
        {
          name: 'token',
          displayName: 'Bearer Token',
          type: 'string',
          required: false,
          typeOptions: {
            password: true,
          },
        },
        {
          name: 'username',
          displayName: 'Username',
          type: 'string',
          required: false,
        },
        {
          name: 'password',
          displayName: 'Password',
          type: 'string',
          required: false,
          typeOptions: {
            password: true,
          },
        },
        {
          name: 'apiKey',
          displayName: 'API Key',
          type: 'string',
          required: false,
          typeOptions: {
            password: true,
          },
        },
        {
          name: 'apiKeyHeader',
          displayName: 'API Key Header Name',
          type: 'string',
          required: false,
          default: 'X-API-Key',
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
      description: 'GraphQL query operations',
      operations: [
        {
          id: 'execute_query',
          name: 'Execute Query',
          value: 'execute',
          description: 'Execute a GraphQL query',
          action: 'Execute query',
          fields: [
            {
              id: 'query',
              name: 'query',
              displayName: 'Query',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 10,
              },
              description: 'GraphQL query string',
            },
          ],
          optionalFields: [
            {
              id: 'variables',
              name: 'variables',
              displayName: 'Variables',
              type: 'json',
              required: false,
              description: 'Query variables as JSON',
            },
            {
              id: 'operation_name',
              name: 'operationName',
              displayName: 'Operation Name',
              type: 'string',
              required: false,
            },
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Additional Headers',
              type: 'json',
              required: false,
            },
            {
              id: 'timeout',
              name: 'timeout',
              displayName: 'Timeout (ms)',
              type: 'number',
              required: false,
              default: 30000,
            },
          ],
        },
        {
          id: 'execute_raw',
          name: 'Execute Raw Request',
          value: 'executeRaw',
          description: 'Execute raw GraphQL request with full control',
          action: 'Execute raw request',
          fields: [
            {
              id: 'endpoint',
              name: 'endpoint',
              displayName: 'Endpoint URL',
              type: 'string',
              required: true,
              description: 'Override the default endpoint',
            },
            {
              id: 'query',
              name: 'query',
              displayName: 'Query',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 10,
              },
            },
          ],
          optionalFields: [
            {
              id: 'variables',
              name: 'variables',
              displayName: 'Variables',
              type: 'json',
              required: false,
            },
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Headers',
              type: 'json',
              required: false,
            },
            {
              id: 'method',
              name: 'method',
              displayName: 'HTTP Method',
              type: 'options',
              required: false,
              default: 'POST',
              options: [
                { name: 'POST', value: 'POST' },
                { name: 'GET', value: 'GET' },
              ],
            },
          ],
        },
      ],
    },
    
    // ============================================
    // MUTATION RESOURCE
    // ============================================
    {
      id: 'mutation',
      name: 'Mutation',
      value: 'mutation',
      description: 'GraphQL mutation operations',
      operations: [
        {
          id: 'execute_mutation',
          name: 'Execute Mutation',
          value: 'execute',
          description: 'Execute a GraphQL mutation',
          action: 'Execute mutation',
          fields: [
            {
              id: 'mutation',
              name: 'mutation',
              displayName: 'Mutation',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 10,
              },
              description: 'GraphQL mutation string',
            },
          ],
          optionalFields: [
            {
              id: 'variables',
              name: 'variables',
              displayName: 'Variables',
              type: 'json',
              required: false,
            },
            {
              id: 'operation_name',
              name: 'operationName',
              displayName: 'Operation Name',
              type: 'string',
              required: false,
            },
            {
              id: 'headers',
              name: 'headers',
              displayName: 'Additional Headers',
              type: 'json',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // SUBSCRIPTION RESOURCE
    // ============================================
    {
      id: 'subscription',
      name: 'Subscription',
      value: 'subscription',
      description: 'GraphQL subscription operations',
      operations: [
        {
          id: 'subscribe',
          name: 'Subscribe',
          value: 'subscribe',
          description: 'Subscribe to GraphQL subscription',
          action: 'Subscribe',
          fields: [
            {
              id: 'subscription',
              name: 'subscription',
              displayName: 'Subscription Query',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 10,
              },
            },
          ],
          optionalFields: [
            {
              id: 'variables',
              name: 'variables',
              displayName: 'Variables',
              type: 'json',
              required: false,
            },
            {
              id: 'ws_endpoint',
              name: 'wsEndpoint',
              displayName: 'WebSocket Endpoint',
              type: 'string',
              required: false,
              description: 'WebSocket URL (defaults to endpoint with ws:// protocol)',
            },
            {
              id: 'connection_params',
              name: 'connectionParams',
              displayName: 'Connection Parameters',
              type: 'json',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // INTROSPECTION RESOURCE
    // ============================================
    {
      id: 'introspection',
      name: 'Introspection',
      value: 'introspection',
      description: 'GraphQL schema introspection',
      operations: [
        {
          id: 'get_schema',
          name: 'Get Schema',
          value: 'getSchema',
          description: 'Get full GraphQL schema',
          action: 'Get schema',
          fields: [],
          optionalFields: [
            {
              id: 'include_deprecated',
              name: 'includeDeprecated',
              displayName: 'Include Deprecated',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'get_types',
          name: 'Get Types',
          value: 'getTypes',
          description: 'Get available types',
          action: 'Get types',
          fields: [],
          optionalFields: [
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Type Filter',
              type: 'options',
              required: false,
              options: [
                { name: 'All', value: 'all' },
                { name: 'Objects', value: 'OBJECT' },
                { name: 'Interfaces', value: 'INTERFACE' },
                { name: 'Unions', value: 'UNION' },
                { name: 'Enums', value: 'ENUM' },
                { name: 'Input Objects', value: 'INPUT_OBJECT' },
                { name: 'Scalars', value: 'SCALAR' },
              ],
            },
          ],
        },
        {
          id: 'get_type',
          name: 'Get Type Details',
          value: 'getType',
          description: 'Get details for a specific type',
          action: 'Get type details',
          fields: [
            {
              id: 'type_name',
              name: 'typeName',
              displayName: 'Type Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_queries',
          name: 'Get Available Queries',
          value: 'getQueries',
          description: 'List available queries',
          action: 'Get available queries',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'get_mutations',
          name: 'Get Available Mutations',
          value: 'getMutations',
          description: 'List available mutations',
          action: 'Get available mutations',
          fields: [],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // BATCH RESOURCE
    // ============================================
    {
      id: 'batch',
      name: 'Batch',
      value: 'batch',
      description: 'Batch GraphQL operations',
      operations: [
        {
          id: 'batch_queries',
          name: 'Batch Queries',
          value: 'execute',
          description: 'Execute multiple queries in a single request',
          action: 'Execute batch queries',
          fields: [
            {
              id: 'queries',
              name: 'queries',
              displayName: 'Queries',
              type: 'json',
              required: true,
              description: 'Array of {query, variables, operationName} objects',
            },
          ],
          optionalFields: [
            {
              id: 'continue_on_error',
              name: 'continueOnError',
              displayName: 'Continue on Error',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // PERSISTED QUERIES RESOURCE
    // ============================================
    {
      id: 'persistedQueries',
      name: 'Persisted Queries',
      value: 'persistedQueries',
      description: 'Automatic Persisted Queries (APQ)',
      operations: [
        {
          id: 'execute_persisted',
          name: 'Execute Persisted Query',
          value: 'execute',
          description: 'Execute query using persisted query hash',
          action: 'Execute persisted query',
          fields: [
            {
              id: 'hash',
              name: 'hash',
              displayName: 'Query Hash',
              type: 'string',
              required: true,
              description: 'SHA-256 hash of the query',
            },
          ],
          optionalFields: [
            {
              id: 'variables',
              name: 'variables',
              displayName: 'Variables',
              type: 'json',
              required: false,
            },
            {
              id: 'query',
              name: 'query',
              displayName: 'Query (Fallback)',
              type: 'string',
              required: false,
              description: 'Query to send if hash not found',
            },
          ],
        },
      ],
    },
  ],
};
