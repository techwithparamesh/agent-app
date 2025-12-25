/**
 * Google Drive n8n-style Schema
 * 
 * Comprehensive Google Drive API operations
 */

import { N8nAppSchema } from './types';

export const googleDriveSchema: N8nAppSchema = {
  id: 'googleDrive',
  name: 'Google Drive',
  description: 'Google Drive file storage',
  version: '1.0.0',
  color: '#4285F4',
  icon: 'google-drive',
  group: ['google', 'storage'],
  
  credentials: [
    {
      name: 'googleDriveOAuth2',
      displayName: 'Google Drive OAuth2',
      required: true,
      type: 'oauth2',
      properties: [
        {
          name: 'accessToken',
          displayName: 'Access Token',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
        {
          name: 'refreshToken',
          displayName: 'Refresh Token',
          type: 'string',
          required: false,
          typeOptions: {
            password: true,
          },
        },
      ],
    },
    {
      name: 'googleDriveServiceAccount',
      displayName: 'Google Drive Service Account',
      required: true,
      type: 'serviceAccount',
      properties: [
        {
          name: 'serviceAccountKey',
          displayName: 'Service Account JSON',
          type: 'json',
          required: true,
        },
        {
          name: 'impersonateUser',
          displayName: 'Impersonate User Email',
          type: 'string',
          required: false,
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // FILE RESOURCE
    // ============================================
    {
      id: 'file',
      name: 'File',
      value: 'file',
      description: 'File operations',
      operations: [
        {
          id: 'upload_file',
          name: 'Upload File',
          value: 'upload',
          description: 'Upload a file to Drive',
          action: 'Upload file',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'File Name',
              type: 'string',
              required: true,
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'Content',
              type: 'string',
              required: true,
              description: 'File content or base64 encoded binary',
            },
          ],
          optionalFields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Parent Folder ID',
              type: 'string',
              required: false,
            },
            {
              id: 'mime_type',
              name: 'mimeType',
              displayName: 'MIME Type',
              type: 'string',
              required: false,
            },
            {
              id: 'convert_to_google',
              name: 'convertToGoogle',
              displayName: 'Convert to Google Format',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'starred',
              name: 'starred',
              displayName: 'Starred',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'get_file',
          name: 'Get File',
          value: 'get',
          description: 'Get file metadata',
          action: 'Get file',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'fields',
              name: 'fields',
              displayName: 'Fields',
              type: 'string',
              required: false,
              description: 'Comma-separated fields to return',
            },
          ],
        },
        {
          id: 'download_file',
          name: 'Download File',
          value: 'download',
          description: 'Download file content',
          action: 'Download file',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'export_format',
              name: 'exportFormat',
              displayName: 'Export Format',
              type: 'options',
              required: false,
              description: 'For Google Docs files',
              options: [
                { name: 'PDF', value: 'application/pdf' },
                { name: 'Microsoft Word', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
                { name: 'Plain Text', value: 'text/plain' },
                { name: 'HTML', value: 'text/html' },
                { name: 'Rich Text', value: 'application/rtf' },
                { name: 'EPUB', value: 'application/epub+zip' },
              ],
            },
          ],
        },
        {
          id: 'list_files',
          name: 'List Files',
          value: 'getMany',
          description: 'List files',
          action: 'List files',
          fields: [],
          optionalFields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Folder ID',
              type: 'string',
              required: false,
              description: 'List files in specific folder',
            },
            {
              id: 'q',
              name: 'q',
              displayName: 'Query',
              type: 'string',
              required: false,
              description: 'Search query',
            },
            {
              id: 'order_by',
              name: 'orderBy',
              displayName: 'Order By',
              type: 'options',
              required: false,
              options: [
                { name: 'Created Time', value: 'createdTime' },
                { name: 'Modified Time', value: 'modifiedTime' },
                { name: 'Name', value: 'name' },
                { name: 'Folder', value: 'folder' },
                { name: 'Modified By Me Time', value: 'modifiedByMeTime' },
                { name: 'Viewed By Me Time', value: 'viewedByMeTime' },
              ],
            },
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 100,
            },
            {
              id: 'include_trash',
              name: 'includeTrash',
              displayName: 'Include Trashed',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'shared_drive_id',
              name: 'sharedDriveId',
              displayName: 'Shared Drive ID',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'update_file',
          name: 'Update File',
          value: 'update',
          description: 'Update file metadata or content',
          action: 'Update file',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'New Name',
              type: 'string',
              required: false,
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'New Content',
              type: 'string',
              required: false,
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
            {
              id: 'starred',
              name: 'starred',
              displayName: 'Starred',
              type: 'boolean',
              required: false,
            },
            {
              id: 'add_parents',
              name: 'addParents',
              displayName: 'Add to Folders',
              type: 'string',
              required: false,
              description: 'Comma-separated folder IDs',
            },
            {
              id: 'remove_parents',
              name: 'removeParents',
              displayName: 'Remove from Folders',
              type: 'string',
              required: false,
              description: 'Comma-separated folder IDs',
            },
          ],
        },
        {
          id: 'copy_file',
          name: 'Copy File',
          value: 'copy',
          description: 'Copy a file',
          action: 'Copy file',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'New Name',
              type: 'string',
              required: false,
            },
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Destination Folder ID',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'delete_file',
          name: 'Delete File',
          value: 'delete',
          description: 'Delete a file',
          action: 'Delete file',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'permanent',
              name: 'permanent',
              displayName: 'Permanent Delete',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Skip trash and delete permanently',
            },
          ],
        },
        {
          id: 'move_file',
          name: 'Move File',
          value: 'move',
          description: 'Move a file to another folder',
          action: 'Move file',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
            {
              id: 'destination_folder_id',
              name: 'destinationFolderId',
              displayName: 'Destination Folder ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // FOLDER RESOURCE
    // ============================================
    {
      id: 'folder',
      name: 'Folder',
      value: 'folder',
      description: 'Folder operations',
      operations: [
        {
          id: 'create_folder',
          name: 'Create Folder',
          value: 'create',
          description: 'Create a folder',
          action: 'Create folder',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Folder Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'parent_folder_id',
              name: 'parentFolderId',
              displayName: 'Parent Folder ID',
              type: 'string',
              required: false,
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_folder',
          name: 'Get Folder',
          value: 'get',
          description: 'Get folder metadata',
          action: 'Get folder',
          fields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Folder ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_folders',
          name: 'List Folders',
          value: 'getMany',
          description: 'List folders',
          action: 'List folders',
          fields: [],
          optionalFields: [
            {
              id: 'parent_folder_id',
              name: 'parentFolderId',
              displayName: 'Parent Folder ID',
              type: 'string',
              required: false,
            },
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
        {
          id: 'delete_folder',
          name: 'Delete Folder',
          value: 'delete',
          description: 'Delete a folder',
          action: 'Delete folder',
          fields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Folder ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // PERMISSION RESOURCE
    // ============================================
    {
      id: 'permission',
      name: 'Permission',
      value: 'permission',
      description: 'File permission operations',
      operations: [
        {
          id: 'share_file',
          name: 'Share File',
          value: 'create',
          description: 'Share a file',
          action: 'Share file',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
            {
              id: 'role',
              name: 'role',
              displayName: 'Role',
              type: 'options',
              required: true,
              options: [
                { name: 'Viewer', value: 'reader' },
                { name: 'Commenter', value: 'commenter' },
                { name: 'Editor', value: 'writer' },
                { name: 'Organizer', value: 'organizer' },
                { name: 'Owner', value: 'owner' },
              ],
            },
            {
              id: 'type',
              name: 'type',
              displayName: 'Type',
              type: 'options',
              required: true,
              options: [
                { name: 'User', value: 'user' },
                { name: 'Group', value: 'group' },
                { name: 'Domain', value: 'domain' },
                { name: 'Anyone', value: 'anyone' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'email_address',
              name: 'emailAddress',
              displayName: 'Email Address',
              type: 'string',
              required: false,
              description: 'Required for user/group type',
            },
            {
              id: 'domain',
              name: 'domain',
              displayName: 'Domain',
              type: 'string',
              required: false,
              description: 'Required for domain type',
            },
            {
              id: 'send_notification',
              name: 'sendNotification',
              displayName: 'Send Notification Email',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'email_message',
              name: 'emailMessage',
              displayName: 'Email Message',
              type: 'string',
              required: false,
            },
            {
              id: 'allow_file_discovery',
              name: 'allowFileDiscovery',
              displayName: 'Allow File Discovery',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'expiration_time',
              name: 'expirationTime',
              displayName: 'Expiration Time',
              type: 'string',
              required: false,
              description: 'ISO 8601 datetime',
            },
          ],
        },
        {
          id: 'list_permissions',
          name: 'List Permissions',
          value: 'getMany',
          description: 'List file permissions',
          action: 'List permissions',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'update_permission',
          name: 'Update Permission',
          value: 'update',
          description: 'Update a permission',
          action: 'Update permission',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
            {
              id: 'permission_id',
              name: 'permissionId',
              displayName: 'Permission ID',
              type: 'string',
              required: true,
            },
            {
              id: 'role',
              name: 'role',
              displayName: 'New Role',
              type: 'options',
              required: true,
              options: [
                { name: 'Viewer', value: 'reader' },
                { name: 'Commenter', value: 'commenter' },
                { name: 'Editor', value: 'writer' },
                { name: 'Organizer', value: 'organizer' },
              ],
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_permission',
          name: 'Delete Permission',
          value: 'delete',
          description: 'Remove a permission',
          action: 'Delete permission',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
            {
              id: 'permission_id',
              name: 'permissionId',
              displayName: 'Permission ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // SHARED DRIVE RESOURCE
    // ============================================
    {
      id: 'sharedDrive',
      name: 'Shared Drive',
      value: 'sharedDrive',
      description: 'Shared Drive operations',
      operations: [
        {
          id: 'create_drive',
          name: 'Create Shared Drive',
          value: 'create',
          description: 'Create a shared drive',
          action: 'Create shared drive',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Drive Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'theme_id',
              name: 'themeId',
              displayName: 'Theme ID',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_drive',
          name: 'Get Shared Drive',
          value: 'get',
          description: 'Get shared drive',
          action: 'Get shared drive',
          fields: [
            {
              id: 'drive_id',
              name: 'driveId',
              displayName: 'Drive ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_drives',
          name: 'List Shared Drives',
          value: 'getMany',
          description: 'List shared drives',
          action: 'List shared drives',
          fields: [],
          optionalFields: [
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 10,
            },
            {
              id: 'q',
              name: 'q',
              displayName: 'Query',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'delete_drive',
          name: 'Delete Shared Drive',
          value: 'delete',
          description: 'Delete a shared drive',
          action: 'Delete shared drive',
          fields: [
            {
              id: 'drive_id',
              name: 'driveId',
              displayName: 'Drive ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // REVISION RESOURCE
    // ============================================
    {
      id: 'revision',
      name: 'Revision',
      value: 'revision',
      description: 'File revision operations',
      operations: [
        {
          id: 'get_revision',
          name: 'Get Revision',
          value: 'get',
          description: 'Get a file revision',
          action: 'Get revision',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
            {
              id: 'revision_id',
              name: 'revisionId',
              displayName: 'Revision ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_revisions',
          name: 'List Revisions',
          value: 'getMany',
          description: 'List file revisions',
          action: 'List revisions',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 100,
            },
          ],
        },
        {
          id: 'delete_revision',
          name: 'Delete Revision',
          value: 'delete',
          description: 'Delete a file revision',
          action: 'Delete revision',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
            },
            {
              id: 'revision_id',
              name: 'revisionId',
              displayName: 'Revision ID',
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
