/**
 * Dropbox n8n-style Schema
 */

import { N8nAppSchema } from './types';

export const dropboxSchema: N8nAppSchema = {
  id: 'dropbox',
  name: 'Dropbox',
  description: 'Dropbox cloud storage',
  version: '1.0.0',
  color: '#0061FF',
  icon: 'dropbox',
  group: ['storage', 'cloud'],
  
  credentials: [
    { name: 'dropboxOAuth2', displayName: 'Dropbox OAuth2', required: true, type: 'oauth2',
      properties: [{ name: 'accessToken', displayName: 'Access Token', type: 'string', required: true, typeOptions: { password: true } }],
    },
  ],
  
  resources: [
    {
      id: 'file', name: 'File', value: 'file', description: 'File operations',
      operations: [
        { id: 'upload', name: 'Upload', value: 'upload', description: 'Upload file', action: 'Upload file',
          fields: [
            { id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true, description: '/folder/filename.ext' },
            { id: 'binaryData', name: 'binaryData', displayName: 'Binary Data', type: 'boolean', required: true, default: true },
          ],
          optionalFields: [
            { id: 'mode', name: 'mode', displayName: 'Mode', type: 'options', required: false, options: [{ name: 'Add', value: 'add' }, { name: 'Overwrite', value: 'overwrite' }] },
            { id: 'autorename', name: 'autorename', displayName: 'Auto Rename', type: 'boolean', required: false, default: true },
          ],
        },
        { id: 'download', name: 'Download', value: 'download', description: 'Download file', action: 'Download file',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [{ id: 'binaryPropertyName', name: 'binaryPropertyName', displayName: 'Binary Property', type: 'string', required: false, default: 'data' }],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete file', action: 'Delete file',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'copy', name: 'Copy', value: 'copy', description: 'Copy file', action: 'Copy file',
          fields: [
            { id: 'fromPath', name: 'fromPath', displayName: 'From Path', type: 'string', required: true },
            { id: 'toPath', name: 'toPath', displayName: 'To Path', type: 'string', required: true },
          ],
          optionalFields: [{ id: 'autorename', name: 'autorename', displayName: 'Auto Rename', type: 'boolean', required: false, default: false }],
        },
        { id: 'move', name: 'Move', value: 'move', description: 'Move file', action: 'Move file',
          fields: [
            { id: 'fromPath', name: 'fromPath', displayName: 'From Path', type: 'string', required: true },
            { id: 'toPath', name: 'toPath', displayName: 'To Path', type: 'string', required: true },
          ],
          optionalFields: [{ id: 'autorename', name: 'autorename', displayName: 'Auto Rename', type: 'boolean', required: false, default: false }],
        },
        { id: 'getMetadata', name: 'Get Metadata', value: 'getMetadata', description: 'Get file metadata', action: 'Get metadata',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'search', name: 'Search', value: 'search', description: 'Search files', action: 'Search files',
          fields: [{ id: 'query', name: 'query', displayName: 'Query', type: 'string', required: true }],
          optionalFields: [
            { id: 'path', name: 'path', displayName: 'Path', type: 'string', required: false, description: 'Folder to search in' },
            { id: 'maxResults', name: 'maxResults', displayName: 'Max Results', type: 'number', required: false, default: 100 },
          ],
        },
      ],
    },
    {
      id: 'folder', name: 'Folder', value: 'folder', description: 'Folder operations',
      operations: [
        { id: 'create', name: 'Create', value: 'create', description: 'Create folder', action: 'Create folder',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [{ id: 'autorename', name: 'autorename', displayName: 'Auto Rename', type: 'boolean', required: false, default: false }],
        },
        { id: 'delete', name: 'Delete', value: 'delete', description: 'Delete folder', action: 'Delete folder',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'list', name: 'List Contents', value: 'list', description: 'List folder contents', action: 'List contents',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true, default: '' }],
          optionalFields: [
            { id: 'recursive', name: 'recursive', displayName: 'Recursive', type: 'boolean', required: false, default: false },
            { id: 'includeDeleted', name: 'includeDeleted', displayName: 'Include Deleted', type: 'boolean', required: false, default: false },
            { id: 'limit', name: 'limit', displayName: 'Limit', type: 'number', required: false, default: 2000 },
          ],
        },
      ],
    },
    {
      id: 'sharing', name: 'Sharing', value: 'sharing', description: 'Sharing operations',
      operations: [
        { id: 'createLink', name: 'Create Shared Link', value: 'createLink', description: 'Create shared link', action: 'Create link',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [
            { id: 'settings', name: 'settings', displayName: 'Settings (JSON)', type: 'json', required: false },
          ],
        },
        { id: 'listLinks', name: 'List Shared Links', value: 'listLinks', description: 'List shared links', action: 'List links',
          fields: [],
          optionalFields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: false }],
        },
        { id: 'revokeLink', name: 'Revoke Shared Link', value: 'revokeLink', description: 'Revoke shared link', action: 'Revoke link',
          fields: [{ id: 'url', name: 'url', displayName: 'Shared Link URL', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
  ],
};
