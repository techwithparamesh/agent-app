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
        { id: 'upload_file', name: 'Upload', value: 'upload_file', description: 'Upload file', action: 'Upload file',
          fields: [
            { id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true, description: '/folder/filename.ext' },
            { id: 'content', name: 'content', displayName: 'Content URL', type: 'string', required: true, description: 'URL to fetch file content from' },
          ],
          optionalFields: [
            { id: 'mode', name: 'mode', displayName: 'Mode', type: 'options', required: false, default: 'add', options: [{ name: 'Add', value: 'add' }, { name: 'Overwrite', value: 'overwrite' }] },
          ],
        },
        { id: 'download_file', name: 'Download', value: 'download_file', description: 'Download file', action: 'Download file',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'delete_file', name: 'Delete', value: 'delete_file', description: 'Delete file', action: 'Delete file',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'move_file', name: 'Move', value: 'move_file', description: 'Move file', action: 'Move file',
          fields: [
            { id: 'fromPath', name: 'fromPath', displayName: 'From Path', type: 'string', required: true },
            { id: 'toPath', name: 'toPath', displayName: 'To Path', type: 'string', required: true },
          ],
          optionalFields: [],
        },
      ],
    },
    {
      id: 'folder', name: 'Folder', value: 'folder', description: 'Folder operations',
      operations: [
        { id: 'create_folder', name: 'Create', value: 'create_folder', description: 'Create folder', action: 'Create folder',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [],
        },
        { id: 'list_folder', name: 'List Contents', value: 'list_folder', description: 'List folder contents', action: 'List contents',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true, default: '' }],
          optionalFields: [
            { id: 'recursive', name: 'recursive', displayName: 'Recursive', type: 'boolean', required: false, default: false },
          ],
        },
      ],
    },
    {
      id: 'sharing', name: 'Sharing', value: 'sharing', description: 'Sharing operations',
      operations: [
        { id: 'create_shared_link', name: 'Create Shared Link', value: 'create_shared_link', description: 'Create shared link', action: 'Create link',
          fields: [{ id: 'path', name: 'path', displayName: 'Path', type: 'string', required: true }],
          optionalFields: [],
        },
      ],
    },
  ],
};
