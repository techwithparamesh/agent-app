/**
 * Supabase n8n-style Schema
 * 
 * Comprehensive Supabase operations (Database, Auth, Storage, Functions)
 */

import { N8nAppSchema } from './types';

export const supabaseSchema: N8nAppSchema = {
  id: 'supabase',
  name: 'Supabase',
  description: 'Supabase backend-as-a-service',
  version: '1.0.0',
  color: '#3ECF8E',
  icon: 'supabase',
  group: ['database'],
  
  credentials: [
    {
      name: 'supabaseApi',
      displayName: 'Supabase API',
      required: true,
      type: 'apiKey',
      properties: [
        {
          name: 'projectUrl',
          displayName: 'Project URL',
          type: 'string',
          required: true,
          placeholder: 'https://your-project.supabase.co',
        },
        {
          name: 'anonKey',
          displayName: 'Anon/Public Key',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
        {
          name: 'serviceRoleKey',
          displayName: 'Service Role Key',
          type: 'string',
          required: false,
          typeOptions: {
            password: true,
          },
          description: 'Required for admin operations',
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // ROW RESOURCE (Database)
    // ============================================
    {
      id: 'row',
      name: 'Row',
      value: 'row',
      description: 'Database rows',
      operations: [
        {
          id: 'insert_row',
          name: 'Insert Row',
          value: 'insert',
          description: 'Insert a new row',
          action: 'Insert a row',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
            {
              id: 'data',
              name: 'data',
              displayName: 'Row Data',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'return_record',
              name: 'returnRecord',
              displayName: 'Return Record',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'on_conflict',
              name: 'onConflict',
              displayName: 'On Conflict Column',
              type: 'string',
              required: false,
              description: 'Column for upsert behavior',
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
              displayName: 'Table Name',
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
              description: 'Comma-separated column names or *',
            },
            {
              id: 'filters',
              name: 'filters',
              displayName: 'Filters',
              type: 'json',
              required: false,
              description: 'Array of filter objects: [{"column": "status", "operator": "eq", "value": "active"}]',
            },
            {
              id: 'order',
              name: 'order',
              displayName: 'Order By',
              type: 'string',
              required: false,
              placeholder: 'created_at.desc',
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
            {
              id: 'single',
              name: 'single',
              displayName: 'Single Row',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'update_row',
          name: 'Update Row',
          value: 'update',
          description: 'Update rows in a table',
          action: 'Update rows',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
            {
              id: 'data',
              name: 'data',
              displayName: 'Update Data',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'filters',
              name: 'filters',
              displayName: 'Filters',
              type: 'json',
              required: false,
              description: 'Filter to match rows to update',
            },
            {
              id: 'match_column',
              name: 'matchColumn',
              displayName: 'Match Column',
              type: 'string',
              required: false,
            },
            {
              id: 'match_value',
              name: 'matchValue',
              displayName: 'Match Value',
              type: 'string',
              required: false,
            },
            {
              id: 'return_record',
              name: 'returnRecord',
              displayName: 'Return Record',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'upsert_row',
          name: 'Upsert Row',
          value: 'upsert',
          description: 'Insert or update rows',
          action: 'Upsert rows',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
            {
              id: 'data',
              name: 'data',
              displayName: 'Row Data',
              type: 'json',
              required: true,
              description: 'Single object or array of objects',
            },
          ],
          optionalFields: [
            {
              id: 'on_conflict',
              name: 'onConflict',
              displayName: 'On Conflict Column',
              type: 'string',
              required: false,
            },
            {
              id: 'ignore_duplicates',
              name: 'ignoreDuplicates',
              displayName: 'Ignore Duplicates',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'return_record',
              name: 'returnRecord',
              displayName: 'Return Record',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'delete_row',
          name: 'Delete Row',
          value: 'delete',
          description: 'Delete rows from a table',
          action: 'Delete rows',
          fields: [
            {
              id: 'table',
              name: 'table',
              displayName: 'Table Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'filters',
              name: 'filters',
              displayName: 'Filters',
              type: 'json',
              required: false,
            },
            {
              id: 'match_column',
              name: 'matchColumn',
              displayName: 'Match Column',
              type: 'string',
              required: false,
            },
            {
              id: 'match_value',
              name: 'matchValue',
              displayName: 'Match Value',
              type: 'string',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // RPC (Stored Procedures) RESOURCE
    // ============================================
    {
      id: 'rpc',
      name: 'RPC Function',
      value: 'rpc',
      description: 'Database functions',
      operations: [
        {
          id: 'call_function',
          name: 'Call Function',
          value: 'call',
          description: 'Call a database function',
          action: 'Call function',
          fields: [
            {
              id: 'function_name',
              name: 'functionName',
              displayName: 'Function Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'params',
              name: 'params',
              displayName: 'Parameters',
              type: 'json',
              required: false,
              description: 'Function parameters as JSON object',
            },
            {
              id: 'head',
              name: 'head',
              displayName: 'Head Only',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Return count only, not data',
            },
            {
              id: 'count',
              name: 'count',
              displayName: 'Count Algorithm',
              type: 'options',
              required: false,
              options: [
                { name: 'None', value: '' },
                { name: 'Exact', value: 'exact' },
                { name: 'Planned', value: 'planned' },
                { name: 'Estimated', value: 'estimated' },
              ],
            },
          ],
        },
      ],
    },
    
    // ============================================
    // AUTH RESOURCE
    // ============================================
    {
      id: 'auth',
      name: 'Authentication',
      value: 'auth',
      description: 'Supabase Authentication',
      operations: [
        {
          id: 'sign_up',
          name: 'Sign Up',
          value: 'signUp',
          description: 'Sign up a new user',
          action: 'Sign up user',
          fields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: true,
            },
            {
              id: 'password',
              name: 'password',
              displayName: 'Password',
              type: 'string',
              required: true,
              typeOptions: {
                password: true,
              },
            },
          ],
          optionalFields: [
            {
              id: 'email_redirect_to',
              name: 'emailRedirectTo',
              displayName: 'Email Redirect URL',
              type: 'string',
              required: false,
            },
            {
              id: 'data',
              name: 'data',
              displayName: 'User Metadata',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'sign_in',
          name: 'Sign In',
          value: 'signIn',
          description: 'Sign in a user',
          action: 'Sign in user',
          fields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: true,
            },
            {
              id: 'password',
              name: 'password',
              displayName: 'Password',
              type: 'string',
              required: true,
              typeOptions: {
                password: true,
              },
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_user',
          name: 'Get User',
          value: 'getUser',
          description: 'Get user by ID (admin)',
          action: 'Get user',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_users',
          name: 'List Users',
          value: 'listUsers',
          description: 'List all users (admin)',
          action: 'List users',
          fields: [],
          optionalFields: [
            {
              id: 'page',
              name: 'page',
              displayName: 'Page',
              type: 'number',
              required: false,
              default: 1,
            },
            {
              id: 'per_page',
              name: 'perPage',
              displayName: 'Per Page',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'update_user',
          name: 'Update User',
          value: 'updateUser',
          description: 'Update user (admin)',
          action: 'Update user',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: false,
            },
            {
              id: 'password',
              name: 'password',
              displayName: 'Password',
              type: 'string',
              required: false,
              typeOptions: {
                password: true,
              },
            },
            {
              id: 'user_metadata',
              name: 'userMetadata',
              displayName: 'User Metadata',
              type: 'json',
              required: false,
            },
            {
              id: 'app_metadata',
              name: 'appMetadata',
              displayName: 'App Metadata',
              type: 'json',
              required: false,
            },
            {
              id: 'email_confirm',
              name: 'emailConfirm',
              displayName: 'Confirm Email',
              type: 'boolean',
              required: false,
            },
            {
              id: 'ban_duration',
              name: 'banDuration',
              displayName: 'Ban Duration',
              type: 'string',
              required: false,
              description: 'Duration like "24h" or "none" to unban',
            },
          ],
        },
        {
          id: 'delete_user',
          name: 'Delete User',
          value: 'deleteUser',
          description: 'Delete user (admin)',
          action: 'Delete user',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'invite_user',
          name: 'Invite User',
          value: 'inviteUser',
          description: 'Invite user by email (admin)',
          action: 'Invite user',
          fields: [
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'redirect_to',
              name: 'redirectTo',
              displayName: 'Redirect URL',
              type: 'string',
              required: false,
            },
            {
              id: 'data',
              name: 'data',
              displayName: 'User Data',
              type: 'json',
              required: false,
            },
          ],
        },
        {
          id: 'generate_link',
          name: 'Generate Link',
          value: 'generateLink',
          description: 'Generate auth link (admin)',
          action: 'Generate link',
          fields: [
            {
              id: 'type',
              name: 'type',
              displayName: 'Link Type',
              type: 'options',
              required: true,
              options: [
                { name: 'Sign Up', value: 'signup' },
                { name: 'Invite', value: 'invite' },
                { name: 'Magic Link', value: 'magiclink' },
                { name: 'Recovery', value: 'recovery' },
                { name: 'Email Change (Current)', value: 'email_change_current' },
                { name: 'Email Change (New)', value: 'email_change_new' },
              ],
            },
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'redirect_to',
              name: 'redirectTo',
              displayName: 'Redirect URL',
              type: 'string',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // STORAGE RESOURCE
    // ============================================
    {
      id: 'storage',
      name: 'Storage',
      value: 'storage',
      description: 'Supabase Storage',
      operations: [
        {
          id: 'upload_file',
          name: 'Upload File',
          value: 'upload',
          description: 'Upload a file',
          action: 'Upload file',
          fields: [
            {
              id: 'bucket',
              name: 'bucket',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
            {
              id: 'path',
              name: 'path',
              displayName: 'File Path',
              type: 'string',
              required: true,
              placeholder: 'folder/file.png',
            },
            {
              id: 'file_data',
              name: 'fileData',
              displayName: 'File Data',
              type: 'string',
              required: true,
              description: 'Base64 encoded file data',
            },
          ],
          optionalFields: [
            {
              id: 'content_type',
              name: 'contentType',
              displayName: 'Content Type',
              type: 'string',
              required: false,
            },
            {
              id: 'cache_control',
              name: 'cacheControl',
              displayName: 'Cache Control',
              type: 'string',
              required: false,
              default: '3600',
            },
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
          id: 'download_file',
          name: 'Download File',
          value: 'download',
          description: 'Download a file',
          action: 'Download file',
          fields: [
            {
              id: 'bucket',
              name: 'bucket',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
            {
              id: 'path',
              name: 'path',
              displayName: 'File Path',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_public_url',
          name: 'Get Public URL',
          value: 'getPublicUrl',
          description: 'Get public URL for a file',
          action: 'Get public URL',
          fields: [
            {
              id: 'bucket',
              name: 'bucket',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
            {
              id: 'path',
              name: 'path',
              displayName: 'File Path',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'create_signed_url',
          name: 'Create Signed URL',
          value: 'createSignedUrl',
          description: 'Create a signed URL',
          action: 'Create signed URL',
          fields: [
            {
              id: 'bucket',
              name: 'bucket',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
            {
              id: 'path',
              name: 'path',
              displayName: 'File Path',
              type: 'string',
              required: true,
            },
            {
              id: 'expires_in',
              name: 'expiresIn',
              displayName: 'Expires In (seconds)',
              type: 'number',
              required: true,
              default: 3600,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_files',
          name: 'List Files',
          value: 'list',
          description: 'List files in a bucket',
          action: 'List files',
          fields: [
            {
              id: 'bucket',
              name: 'bucket',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'path',
              name: 'path',
              displayName: 'Folder Path',
              type: 'string',
              required: false,
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 100,
            },
            {
              id: 'offset',
              name: 'offset',
              displayName: 'Offset',
              type: 'number',
              required: false,
            },
            {
              id: 'sort_by',
              name: 'sortBy',
              displayName: 'Sort By',
              type: 'options',
              required: false,
              options: [
                { name: 'Name', value: 'name' },
                { name: 'Created At', value: 'created_at' },
                { name: 'Updated At', value: 'updated_at' },
                { name: 'Last Accessed', value: 'last_accessed_at' },
              ],
            },
          ],
        },
        {
          id: 'delete_file',
          name: 'Delete File',
          value: 'remove',
          description: 'Delete a file',
          action: 'Delete file',
          fields: [
            {
              id: 'bucket',
              name: 'bucket',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
            {
              id: 'paths',
              name: 'paths',
              displayName: 'File Paths',
              type: 'string',
              required: true,
              description: 'Comma-separated file paths',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'move_file',
          name: 'Move File',
          value: 'move',
          description: 'Move a file',
          action: 'Move file',
          fields: [
            {
              id: 'bucket',
              name: 'bucket',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
            {
              id: 'from_path',
              name: 'fromPath',
              displayName: 'From Path',
              type: 'string',
              required: true,
            },
            {
              id: 'to_path',
              name: 'toPath',
              displayName: 'To Path',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'copy_file',
          name: 'Copy File',
          value: 'copy',
          description: 'Copy a file',
          action: 'Copy file',
          fields: [
            {
              id: 'bucket',
              name: 'bucket',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
            {
              id: 'from_path',
              name: 'fromPath',
              displayName: 'From Path',
              type: 'string',
              required: true,
            },
            {
              id: 'to_path',
              name: 'toPath',
              displayName: 'To Path',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // BUCKET RESOURCE
    // ============================================
    {
      id: 'bucket',
      name: 'Bucket',
      value: 'bucket',
      description: 'Storage buckets',
      operations: [
        {
          id: 'create_bucket',
          name: 'Create Bucket',
          value: 'create',
          description: 'Create a storage bucket',
          action: 'Create bucket',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'public',
              name: 'public',
              displayName: 'Public',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'file_size_limit',
              name: 'fileSizeLimit',
              displayName: 'File Size Limit (bytes)',
              type: 'number',
              required: false,
            },
            {
              id: 'allowed_mime_types',
              name: 'allowedMimeTypes',
              displayName: 'Allowed MIME Types',
              type: 'string',
              required: false,
              description: 'Comma-separated MIME types',
            },
          ],
        },
        {
          id: 'get_bucket',
          name: 'Get Bucket',
          value: 'get',
          description: 'Get bucket details',
          action: 'Get bucket',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_buckets',
          name: 'List Buckets',
          value: 'getMany',
          description: 'List all buckets',
          action: 'List buckets',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'update_bucket',
          name: 'Update Bucket',
          value: 'update',
          description: 'Update bucket settings',
          action: 'Update bucket',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'public',
              name: 'public',
              displayName: 'Public',
              type: 'boolean',
              required: false,
            },
            {
              id: 'file_size_limit',
              name: 'fileSizeLimit',
              displayName: 'File Size Limit (bytes)',
              type: 'number',
              required: false,
            },
            {
              id: 'allowed_mime_types',
              name: 'allowedMimeTypes',
              displayName: 'Allowed MIME Types',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'empty_bucket',
          name: 'Empty Bucket',
          value: 'empty',
          description: 'Delete all files in a bucket',
          action: 'Empty bucket',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_bucket',
          name: 'Delete Bucket',
          value: 'delete',
          description: 'Delete a bucket',
          action: 'Delete bucket',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Bucket Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // EDGE FUNCTION RESOURCE
    // ============================================
    {
      id: 'function',
      name: 'Edge Function',
      value: 'function',
      description: 'Edge Functions',
      operations: [
        {
          id: 'invoke_function',
          name: 'Invoke Function',
          value: 'invoke',
          description: 'Invoke an edge function',
          action: 'Invoke function',
          fields: [
            {
              id: 'function_name',
              name: 'functionName',
              displayName: 'Function Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'body',
              name: 'body',
              displayName: 'Request Body',
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
          ],
        },
      ],
    },
  ],
};
