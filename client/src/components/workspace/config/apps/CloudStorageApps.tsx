/**
 * Cloud Storage & Database App Configurations
 * 
 * n8n-style configurations for storage and database services:
 * - AWS S3
 * - Dropbox
 * - Box
 * - OneDrive
 * - Airtable
 * - Notion
 * - Supabase
 * - MongoDB
 * - PostgreSQL
 * - MySQL
 * - Redis
 * - Firebase/Firestore
 */

import React from "react";
import {
  TextField,
  TextareaField,
  SelectField,
  SwitchField,
  NumberField,
  CredentialField,
  ExpressionField,
  KeyValueField,
  CollectionField,
  FixedCollectionField,
  ResourceLocatorField,
  ResourceMapperField,
  FilterField,
  CodeField,
  InfoBox,
  SectionHeader,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// AWS S3 CONFIG
// ============================================

export const AWSS3Config: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="AWS Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="AWS"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'file'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'file', label: 'File' },
        { value: 'bucket', label: 'Bucket' },
        { value: 'folder', label: 'Folder' },
      ]}
      required
    />

    {resource === 'file' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'upload'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'upload', label: 'Upload' },
            { value: 'download', label: 'Download' },
            { value: 'delete', label: 'Delete' },
            { value: 'copy', label: 'Copy' },
            { value: 'getAll', label: 'List Files' },
          ]}
        />

        <TextField
          label="Bucket Name"
          value={config.bucketName || ''}
          onChange={(v) => updateConfig('bucketName', v)}
          required
        />

        {operation === 'upload' && (
          <>
            <ExpressionField
              label="File Key (Path)"
              value={config.fileKey || ''}
              onChange={(v) => updateConfig('fileKey', v)}
              placeholder="folder/file.pdf"
              required
            />

            <SelectField
              label="Input Type"
              value={config.inputType || 'binary'}
              onChange={(v) => updateConfig('inputType', v)}
              options={[
                { value: 'binary', label: 'Binary Data' },
                { value: 'fileName', label: 'File from Disk' },
              ]}
            />

            <CollectionField
              label="Upload Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'acl', displayName: 'ACL', type: 'options', options: [
                  { value: 'private', label: 'Private' },
                  { value: 'public-read', label: 'Public Read' },
                  { value: 'public-read-write', label: 'Public Read Write' },
                  { value: 'authenticated-read', label: 'Authenticated Read' },
                  { value: 'bucket-owner-read', label: 'Bucket Owner Read' },
                  { value: 'bucket-owner-full-control', label: 'Bucket Owner Full Control' },
                ]},
                { name: 'contentType', displayName: 'Content Type', type: 'string' },
                { name: 'storageClass', displayName: 'Storage Class', type: 'options', options: [
                  { value: 'STANDARD', label: 'Standard' },
                  { value: 'REDUCED_REDUNDANCY', label: 'Reduced Redundancy' },
                  { value: 'STANDARD_IA', label: 'Standard IA' },
                  { value: 'ONEZONE_IA', label: 'One Zone IA' },
                  { value: 'GLACIER', label: 'Glacier' },
                  { value: 'DEEP_ARCHIVE', label: 'Glacier Deep Archive' },
                ]},
                { name: 'serverSideEncryption', displayName: 'Server Side Encryption', type: 'options', options: [
                  { value: 'none', label: 'None' },
                  { value: 'AES256', label: 'AES256' },
                  { value: 'aws:kms', label: 'AWS KMS' },
                ]},
              ]}
            />

            <KeyValueField
              label="Metadata"
              value={config.metadata || []}
              onChange={(v) => updateConfig('metadata', v)}
              keyPlaceholder="Key"
              valuePlaceholder="Value"
            />
          </>
        )}

        {(operation === 'download' || config.operation === 'delete') && (
          <ExpressionField
            label="File Key (Path)"
            value={config.fileKey || ''}
            onChange={(v) => updateConfig('fileKey', v)}
            placeholder="folder/file.pdf"
            required
          />
        )}

        {operation === 'copy' && (
          <>
            <TextField
              label="Source Bucket"
              value={config.sourceBucket || ''}
              onChange={(v) => updateConfig('sourceBucket', v)}
              required
            />
            <ExpressionField
              label="Source Key"
              value={config.sourceKey || ''}
              onChange={(v) => updateConfig('sourceKey', v)}
              required
            />
            <ExpressionField
              label="Destination Key"
              value={config.destinationKey || ''}
              onChange={(v) => updateConfig('destinationKey', v)}
              required
            />
          </>
        )}

        {operation === 'getAll' && (
          <CollectionField
            label="List Options"
            value={config.options || {}}
            onChange={(v) => updateConfig('options', v)}
            options={[
              { name: 'prefix', displayName: 'Prefix (Folder)', type: 'string' },
              { name: 'maxKeys', displayName: 'Max Results', type: 'number', default: 1000 },
              { name: 'fetchOwner', displayName: 'Fetch Owner Info', type: 'boolean' },
            ]}
          />
        )}
      </>
    )}

    {resource === 'bucket' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'getAll'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'getAll', label: 'List All' },
            { value: 'delete', label: 'Delete' },
          ]}
        />

        {operation === 'create' && (
          <>
            <TextField
              label="Bucket Name"
              value={config.bucketName || ''}
              onChange={(v) => updateConfig('bucketName', v)}
              required
            />
            <TextField
              label="Region"
              value={config.region || ''}
              onChange={(v) => updateConfig('region', v)}
              placeholder="us-east-1"
            />
          </>
        )}
      </>
    )}

    <TextField
      label="Region"
      value={config.region || ''}
      onChange={(v) => updateConfig('region', v)}
      placeholder="us-east-1"
    />
  </div>
  );
};

// ============================================
// DROPBOX CONFIG
// ============================================

export const DropboxConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Dropbox Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Dropbox OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'file'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'file', label: 'File' },
        { value: 'folder', label: 'Folder' },
        { value: 'search', label: 'Search' },
      ]}
      required
    />

    {resource === 'file' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'upload'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'upload', label: 'Upload' },
            { value: 'download', label: 'Download' },
            { value: 'copy', label: 'Copy' },
            { value: 'delete', label: 'Delete' },
            { value: 'move', label: 'Move' },
            { value: 'share', label: 'Get Share Link' },
          ]}
        />

        {operation === 'upload' && (
          <>
            <ExpressionField
              label="File Path"
              value={config.path || ''}
              onChange={(v) => updateConfig('path', v)}
              placeholder="/folder/filename.pdf"
              required
            />
            <SelectField
              label="Mode"
              value={config.mode || 'add'}
              onChange={(v) => updateConfig('mode', v)}
              options={[
                { value: 'add', label: 'Add (Fail if exists)' },
                { value: 'overwrite', label: 'Overwrite' },
              ]}
            />
          </>
        )}

        {(operation === 'download' || config.operation === 'delete' || config.operation === 'share') && (
          <ExpressionField
            label="File Path"
            value={config.path || ''}
            onChange={(v) => updateConfig('path', v)}
            placeholder="/folder/filename.pdf"
            required
          />
        )}

        {(operation === 'copy' || config.operation === 'move') && (
          <>
            <ExpressionField
              label="From Path"
              value={config.fromPath || ''}
              onChange={(v) => updateConfig('fromPath', v)}
              required
            />
            <ExpressionField
              label="To Path"
              value={config.toPath || ''}
              onChange={(v) => updateConfig('toPath', v)}
              required
            />
          </>
        )}
      </>
    )}

    {resource === 'folder' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'delete', label: 'Delete' },
            { value: 'list', label: 'List Contents' },
          ]}
        />

        <ExpressionField
          label="Folder Path"
          value={config.path || ''}
          onChange={(v) => updateConfig('path', v)}
          placeholder="/folder"
          required
        />

        {operation === 'list' && (
          <CollectionField
            label="Options"
            value={config.options || {}}
            onChange={(v) => updateConfig('options', v)}
            options={[
              { name: 'recursive', displayName: 'Recursive', type: 'boolean' },
              { name: 'limit', displayName: 'Limit', type: 'number' },
            ]}
          />
        )}
      </>
    )}

    {resource === 'search' && (
      <>
        <ExpressionField
          label="Search Query"
          value={config.query || ''}
          onChange={(v) => updateConfig('query', v)}
          required
        />
        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'path', displayName: 'Search in Path', type: 'string' },
            { name: 'maxResults', displayName: 'Max Results', type: 'number', default: 100 },
            { name: 'fileExtensions', displayName: 'File Extensions', type: 'string', placeholder: 'pdf, docx' },
          ]}
        />
      </>
    )}
  </div>
  );
};

// ============================================
// AIRTABLE CONFIG
// ============================================

export const AirtableConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const dataMode = config.dataMode || '';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Airtable Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Airtable Personal Access Token"
      required
    />

    <ResourceLocatorField
      label="Base"
      value={config.baseId || { mode: 'list', value: '' }}
      onChange={(v) => updateConfig('baseId', v)}
      modes={['list', 'id']}
      resourceType="Base"
      required
    />

    <ResourceLocatorField
      label="Table"
      value={config.tableId || { mode: 'list', value: '' }}
      onChange={(v) => updateConfig('tableId', v)}
      modes={['list', 'id']}
      resourceType="Table"
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'read'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'create', label: 'Create Record' },
        { value: 'read', label: 'Get Record' },
        { value: 'update', label: 'Update Record' },
        { value: 'upsert', label: 'Upsert Record' },
        { value: 'delete', label: 'Delete Record' },
        { value: 'search', label: 'Search Records' },
        { value: 'list', label: 'List Records' },
      ]}
    />

    {(operation === 'read' || config.operation === 'update' || config.operation === 'delete') && (
      <ExpressionField
        label="Record ID"
        value={config.recordId || ''}
        onChange={(v) => updateConfig('recordId', v)}
        placeholder="rec..."
        required
      />
    )}

    {(operation === 'create' || config.operation === 'update' || config.operation === 'upsert') && (
      <>
        <SelectField
          label="Data Mode"
          value={config.dataMode || 'manual'}
          onChange={(v) => updateConfig('dataMode', v)}
          options={[
            { value: 'manual', label: 'Define Fields Manually' },
            { value: 'autoMap', label: 'Auto-Map from Input' },
            { value: 'raw', label: 'Raw JSON' },
          ]}
        />

        {config.dataMode === 'manual' && (
          <KeyValueField
            label="Fields"
            value={config.fields || []}
            onChange={(v) => updateConfig('fields', v)}
            keyPlaceholder="Field Name"
            valuePlaceholder="Value"
          />
        )}

        {config.dataMode === 'raw' && (
          <TextareaField
            label="Fields JSON"
            value={config.fieldsJson || ''}
            onChange={(v) => updateConfig('fieldsJson', v)}
            placeholder='{"Name": "John", "Email": "john@example.com"}'
            rows={4}
          />
        )}

        {operation === 'upsert' && (
          <TextField
            label="Merge Field"
            value={config.mergeField || ''}
            onChange={(v) => updateConfig('mergeField', v)}
            placeholder="Field to match records by"
            required
          />
        )}
      </>
    )}

    {(operation === 'search' || config.operation === 'list') && (
      <>
        <TextField
          label="Filter Formula"
          value={config.filterFormula || ''}
          onChange={(v) => updateConfig('filterFormula', v)}
          placeholder='{Status} = "Active"'
          description="Airtable formula syntax"
        />

        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'maxRecords', displayName: 'Max Records', type: 'number' },
            { name: 'pageSize', displayName: 'Page Size', type: 'number', default: 100 },
            { name: 'view', displayName: 'View Name', type: 'string' },
            { name: 'sort', displayName: 'Sort Field', type: 'string' },
            { name: 'sortDirection', displayName: 'Sort Direction', type: 'options', options: [
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' },
            ]},
          ]}
        />
      </>
    )}

    <SwitchField
      label="Return All"
      value={config.returnAll || false}
      onChange={(v) => updateConfig('returnAll', v)}
      description="Return all records (may be slow for large tables)"
    />
  </div>
  );
};

// ============================================
// NOTION CONFIG
// ============================================

export const NotionConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Notion Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Notion API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'page'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'page', label: 'Page' },
        { value: 'database', label: 'Database' },
        { value: 'databaseItem', label: 'Database Item' },
        { value: 'block', label: 'Block' },
        { value: 'user', label: 'User' },
      ]}
      required
    />

    {resource === 'page' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'get', label: 'Get' },
            { value: 'update', label: 'Update' },
            { value: 'archive', label: 'Archive' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ResourceLocatorField
              label="Parent"
              value={config.parentId || { mode: 'list', value: '' }}
              onChange={(v) => updateConfig('parentId', v)}
              modes={['list', 'id']}
              resourceType="Page or Database"
              required
            />

            <TextField
              label="Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              required
            />

            <TextareaField
              label="Content (Markdown)"
              value={config.content || ''}
              onChange={(v) => updateConfig('content', v)}
              rows={6}
              description="Content in Markdown format"
            />

            <CollectionField
              label="Properties"
              value={config.properties || {}}
              onChange={(v) => updateConfig('properties', v)}
              options={[
                { name: 'icon', displayName: 'Icon (Emoji)', type: 'string', placeholder: '📄' },
                { name: 'coverUrl', displayName: 'Cover Image URL', type: 'string' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'archive') && (
          <ResourceLocatorField
            label="Page"
            value={config.pageId || { mode: 'list', value: '' }}
            onChange={(v) => updateConfig('pageId', v)}
            modes={['list', 'id', 'url']}
            resourceType="Page"
            required
          />
        )}
      </>
    )}

    {resource === 'database' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'query', label: 'Query' },
          ]}
        />

        {config.operation !== 'getAll' && (
          <ResourceLocatorField
            label="Database"
            value={config.databaseId || { mode: 'list', value: '' }}
            onChange={(v) => updateConfig('databaseId', v)}
            modes={['list', 'id', 'url']}
            resourceType="Database"
            required
          />
        )}

        {operation === 'query' && (
          <>
            <TextareaField
              label="Filter (JSON)"
              value={config.filter || ''}
              onChange={(v) => updateConfig('filter', v)}
              placeholder='{"property": "Status", "select": {"equals": "Done"}}'
              rows={4}
            />

            <CollectionField
              label="Sort"
              value={config.sorts || {}}
              onChange={(v) => updateConfig('sorts', v)}
              options={[
                { name: 'property', displayName: 'Sort Property', type: 'string' },
                { name: 'direction', displayName: 'Direction', type: 'options', options: [
                  { value: 'ascending', label: 'Ascending' },
                  { value: 'descending', label: 'Descending' },
                ]},
              ]}
            />

            <TextField
              label="Page Size"
              value={config.pageSize || ''}
              onChange={(v) => updateConfig('pageSize', v)}
              placeholder="100"
            />
          </>
        )}
      </>
    )}

    {resource === 'databaseItem' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'update', label: 'Update' },
            { value: 'get', label: 'Get' },
          ]}
        />

        <ResourceLocatorField
          label="Database"
          value={config.databaseId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('databaseId', v)}
          modes={['list', 'id', 'url']}
          resourceType="Database"
          required
        />

        {(operation === 'create' || config.operation === 'update') && (
          <KeyValueField
            label="Properties"
            value={config.properties || []}
            onChange={(v) => updateConfig('properties', v)}
            keyPlaceholder="Property Name"
            valuePlaceholder="Value"
          />
        )}

        {(operation === 'update' || config.operation === 'get') && (
          <TextField
            label="Page ID"
            value={config.pageId || ''}
            onChange={(v) => updateConfig('pageId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'block' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'append'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'append', label: 'Append Children' },
            { value: 'getAll', label: 'Get Children' },
            { value: 'delete', label: 'Delete' },
          ]}
        />

        <TextField
          label="Block/Page ID"
          value={config.blockId || ''}
          onChange={(v) => updateConfig('blockId', v)}
          required
        />

        {operation === 'append' && (
          <TextareaField
            label="Content (Markdown)"
            value={config.content || ''}
            onChange={(v) => updateConfig('content', v)}
            rows={6}
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// SUPABASE CONFIG
// ============================================

export const SupabaseConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const dataMode = config.dataMode || '';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Supabase Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Supabase API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'row'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'row', label: 'Database Row' },
        { value: 'storage', label: 'Storage' },
        { value: 'rpc', label: 'RPC Function' },
      ]}
      required
    />

    {resource === 'row' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Insert' },
            { value: 'read', label: 'Select' },
            { value: 'update', label: 'Update' },
            { value: 'upsert', label: 'Upsert' },
            { value: 'delete', label: 'Delete' },
          ]}
        />

        <TextField
          label="Table Name"
          value={config.table || ''}
          onChange={(v) => updateConfig('table', v)}
          required
        />

        {(operation === 'create' || config.operation === 'upsert') && (
          <>
            <SelectField
              label="Data Mode"
              value={config.dataMode || 'manual'}
              onChange={(v) => updateConfig('dataMode', v)}
              options={[
                { value: 'manual', label: 'Define Fields' },
                { value: 'json', label: 'Raw JSON' },
              ]}
            />

            {config.dataMode === 'manual' && (
              <KeyValueField
                label="Fields"
                value={config.fields || []}
                onChange={(v) => updateConfig('fields', v)}
                keyPlaceholder="Column"
                valuePlaceholder="Value"
              />
            )}

            {config.dataMode === 'json' && (
              <TextareaField
                label="Data JSON"
                value={config.dataJson || ''}
                onChange={(v) => updateConfig('dataJson', v)}
                rows={4}
              />
            )}
          </>
        )}

        {operation === 'read' && (
          <>
            <TextField
              label="Select Columns"
              value={config.select || ''}
              onChange={(v) => updateConfig('select', v)}
              placeholder="*, id, name, created_at"
              description="Comma-separated columns or * for all"
            />

            <FilterField
              label="Filters"
              value={config.filters || { conditions: [] }}
              onChange={(v) => updateConfig('filters', v)}
              fields={[
                { value: 'column', label: 'Column', type: 'string' },
              ]}
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'limit', displayName: 'Limit', type: 'number' },
                { name: 'offset', displayName: 'Offset', type: 'number' },
                { name: 'orderBy', displayName: 'Order By', type: 'string' },
                { name: 'orderDirection', displayName: 'Order Direction', type: 'options', options: [
                  { value: 'asc', label: 'Ascending' },
                  { value: 'desc', label: 'Descending' },
                ]},
              ]}
            />
          </>
        )}

        {operation === 'update' && (
          <>
            <KeyValueField
              label="Update Fields"
              value={config.fields || []}
              onChange={(v) => updateConfig('fields', v)}
              keyPlaceholder="Column"
              valuePlaceholder="New Value"
            />
            <FilterField
              label="Match Conditions"
              value={config.filters || { conditions: [] }}
              onChange={(v) => updateConfig('filters', v)}
              fields={[
                { value: 'column', label: 'Column', type: 'string' },
              ]}
            />
          </>
        )}

        {operation === 'delete' && (
          <FilterField
            label="Delete Where"
            value={config.filters || { conditions: [] }}
            onChange={(v) => updateConfig('filters', v)}
            fields={[
              { value: 'column', label: 'Column', type: 'string' },
            ]}
          />
        )}
      </>
    )}

    {resource === 'storage' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'upload'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'upload', label: 'Upload File' },
            { value: 'download', label: 'Download File' },
            { value: 'delete', label: 'Delete File' },
            { value: 'list', label: 'List Files' },
            { value: 'getPublicUrl', label: 'Get Public URL' },
          ]}
        />

        <TextField
          label="Bucket"
          value={config.bucket || ''}
          onChange={(v) => updateConfig('bucket', v)}
          required
        />

        {(operation === 'upload' || config.operation === 'download' || config.operation === 'delete' || config.operation === 'getPublicUrl') && (
          <ExpressionField
            label="File Path"
            value={config.filePath || ''}
            onChange={(v) => updateConfig('filePath', v)}
            placeholder="folder/filename.pdf"
            required
          />
        )}

        {operation === 'list' && (
          <TextField
            label="Folder Path"
            value={config.folderPath || ''}
            onChange={(v) => updateConfig('folderPath', v)}
          />
        )}
      </>
    )}

    {resource === 'rpc' && (
      <>
        <TextField
          label="Function Name"
          value={config.functionName || ''}
          onChange={(v) => updateConfig('functionName', v)}
          required
        />
        <KeyValueField
          label="Parameters"
          value={config.params || []}
          onChange={(v) => updateConfig('params', v)}
          keyPlaceholder="Parameter"
          valuePlaceholder="Value"
        />
      </>
    )}
  </div>
  );
};

// ============================================
// MONGODB CONFIG
// ============================================

export const MongoDBConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="MongoDB Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="MongoDB"
      required
    />

    <TextField
      label="Database"
      value={config.database || ''}
      onChange={(v) => updateConfig('database', v)}
      required
    />

    <TextField
      label="Collection"
      value={config.collection || ''}
      onChange={(v) => updateConfig('collection', v)}
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'find'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'insert', label: 'Insert' },
        { value: 'find', label: 'Find' },
        { value: 'findOne', label: 'Find One' },
        { value: 'update', label: 'Update' },
        { value: 'updateOne', label: 'Update One' },
        { value: 'delete', label: 'Delete' },
        { value: 'deleteOne', label: 'Delete One' },
        { value: 'aggregate', label: 'Aggregate' },
        { value: 'count', label: 'Count' },
      ]}
    />

    {operation === 'insert' && (
      <>
        <SelectField
          label="Insert Mode"
          value={config.insertMode || 'single'}
          onChange={(v) => updateConfig('insertMode', v)}
          options={[
            { value: 'single', label: 'Single Document' },
            { value: 'multiple', label: 'Multiple Documents' },
          ]}
        />
        <TextareaField
          label="Document(s) JSON"
          value={config.document || ''}
          onChange={(v) => updateConfig('document', v)}
          placeholder='{"name": "John", "age": 30}'
          rows={6}
          required
        />
      </>
    )}

    {(operation === 'find' || config.operation === 'findOne' || config.operation === 'count') && (
      <>
        <TextareaField
          label="Query (JSON)"
          value={config.query || ''}
          onChange={(v) => updateConfig('query', v)}
          placeholder='{"status": "active"}'
          rows={4}
        />

        {operation === 'find' && (
          <CollectionField
            label="Options"
            value={config.options || {}}
            onChange={(v) => updateConfig('options', v)}
            options={[
              { name: 'limit', displayName: 'Limit', type: 'number' },
              { name: 'skip', displayName: 'Skip', type: 'number' },
              { name: 'sort', displayName: 'Sort (JSON)', type: 'string', placeholder: '{"createdAt": -1}' },
              { name: 'projection', displayName: 'Projection (JSON)', type: 'string', placeholder: '{"name": 1, "_id": 0}' },
            ]}
          />
        )}
      </>
    )}

    {(operation === 'update' || config.operation === 'updateOne') && (
      <>
        <TextareaField
          label="Filter (JSON)"
          value={config.filter || ''}
          onChange={(v) => updateConfig('filter', v)}
          placeholder='{"_id": "..."}'
          rows={3}
          required
        />
        <TextareaField
          label="Update (JSON)"
          value={config.update || ''}
          onChange={(v) => updateConfig('update', v)}
          placeholder='{"$set": {"status": "updated"}}'
          rows={4}
          required
        />
        <SwitchField
          label="Upsert"
          value={config.upsert || false}
          onChange={(v) => updateConfig('upsert', v)}
        />
      </>
    )}

    {(operation === 'delete' || config.operation === 'deleteOne') && (
      <TextareaField
        label="Filter (JSON)"
        value={config.filter || ''}
        onChange={(v) => updateConfig('filter', v)}
        placeholder='{"status": "inactive"}'
        rows={4}
        required
      />
    )}

    {operation === 'aggregate' && (
      <TextareaField
        label="Pipeline (JSON Array)"
        value={config.pipeline || ''}
        onChange={(v) => updateConfig('pipeline', v)}
        placeholder='[{"$match": {...}}, {"$group": {...}}]'
        rows={8}
        required
      />
    )}
  </div>
  );
};

// ============================================
// POSTGRES CONFIG
// ============================================

export const PostgresConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const operation = config.operation || 'send';
  const dataMode = config.dataMode || '';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="PostgreSQL Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="PostgreSQL"
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'executeQuery'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'executeQuery', label: 'Execute Query' },
        { value: 'insert', label: 'Insert' },
        { value: 'update', label: 'Update' },
        { value: 'delete', label: 'Delete' },
      ]}
    />

    {operation === 'executeQuery' && (
      <>
        <TextareaField
          label="Query"
          value={config.query || ''}
          onChange={(v) => updateConfig('query', v)}
          placeholder="SELECT * FROM users WHERE id = $1"
          rows={6}
          required
        />

        <FixedCollectionField
          label="Query Parameters"
          value={config.parameters || []}
          onChange={(v) => updateConfig('parameters', v)}
          fields={[
            { name: 'value', displayName: 'Value', type: 'string' },
          ]}
          sortable
          description="Parameters in order ($1, $2, etc.)"
        />
      </>
    )}

    {operation === 'insert' && (
      <>
        <TextField
          label="Table"
          value={config.table || ''}
          onChange={(v) => updateConfig('table', v)}
          required
        />
        <SelectField
          label="Data Mode"
          value={config.dataMode || 'manual'}
          onChange={(v) => updateConfig('dataMode', v)}
          options={[
            { value: 'manual', label: 'Define Columns' },
            { value: 'autoMap', label: 'Auto-Map Input' },
          ]}
        />
        {config.dataMode === 'manual' && (
          <KeyValueField
            label="Columns"
            value={config.columns || []}
            onChange={(v) => updateConfig('columns', v)}
            keyPlaceholder="Column"
            valuePlaceholder="Value"
          />
        )}
        <SelectField
          label="On Conflict"
          value={config.onConflict || 'nothing'}
          onChange={(v) => updateConfig('onConflict', v)}
          options={[
            { value: 'nothing', label: 'Do Nothing' },
            { value: 'update', label: 'Update' },
          ]}
        />
      </>
    )}

    {operation === 'update' && (
      <>
        <TextField
          label="Table"
          value={config.table || ''}
          onChange={(v) => updateConfig('table', v)}
          required
        />
        <KeyValueField
          label="Set Values"
          value={config.setValues || []}
          onChange={(v) => updateConfig('setValues', v)}
          keyPlaceholder="Column"
          valuePlaceholder="New Value"
        />
        <TextField
          label="Where Clause"
          value={config.where || ''}
          onChange={(v) => updateConfig('where', v)}
          placeholder="id = $1"
          required
        />
        <FixedCollectionField
          label="Where Parameters"
          value={config.whereParams || []}
          onChange={(v) => updateConfig('whereParams', v)}
          fields={[
            { name: 'value', displayName: 'Value', type: 'string' },
          ]}
          sortable
        />
      </>
    )}

    {operation === 'delete' && (
      <>
        <TextField
          label="Table"
          value={config.table || ''}
          onChange={(v) => updateConfig('table', v)}
          required
        />
        <TextField
          label="Where Clause"
          value={config.where || ''}
          onChange={(v) => updateConfig('where', v)}
          placeholder="id = $1"
          required
        />
        <FixedCollectionField
          label="Where Parameters"
          value={config.whereParams || []}
          onChange={(v) => updateConfig('whereParams', v)}
          fields={[
            { name: 'value', displayName: 'Value', type: 'string' },
          ]}
          sortable
        />
      </>
    )}

    <CollectionField
      label="Options"
      value={config.options || {}}
      onChange={(v) => updateConfig('options', v)}
      options={[
        { name: 'returnResults', displayName: 'Return Results', type: 'boolean', default: true },
        { name: 'timeout', displayName: 'Timeout (ms)', type: 'number' },
      ]}
    />
  </div>
  );
};

// ============================================
// REDIS CONFIG
// ============================================

export const RedisConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Redis Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Redis"
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'get'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'get', label: 'Get' },
        { value: 'set', label: 'Set' },
        { value: 'delete', label: 'Delete' },
        { value: 'incr', label: 'Increment' },
        { value: 'decr', label: 'Decrement' },
        { value: 'keys', label: 'Get Keys' },
        { value: 'hget', label: 'Hash Get' },
        { value: 'hset', label: 'Hash Set' },
        { value: 'hgetall', label: 'Hash Get All' },
        { value: 'lpush', label: 'List Push (Left)' },
        { value: 'rpush', label: 'List Push (Right)' },
        { value: 'lpop', label: 'List Pop (Left)' },
        { value: 'rpop', label: 'List Pop (Right)' },
        { value: 'lrange', label: 'List Range' },
        { value: 'publish', label: 'Publish' },
      ]}
    />

    {(operation === 'get' || config.operation === 'delete' || config.operation === 'incr' || config.operation === 'decr') && (
      <ExpressionField
        label="Key"
        value={config.key || ''}
        onChange={(v) => updateConfig('key', v)}
        required
      />
    )}

    {operation === 'set' && (
      <>
        <ExpressionField
          label="Key"
          value={config.key || ''}
          onChange={(v) => updateConfig('key', v)}
          required
        />
        <ExpressionField
          label="Value"
          value={config.value || ''}
          onChange={(v) => updateConfig('value', v)}
          required
        />
        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'expireTime', displayName: 'Expire Time (seconds)', type: 'number' },
            { name: 'setOnlyIfNotExists', displayName: 'Set Only If Not Exists (NX)', type: 'boolean' },
            { name: 'setOnlyIfExists', displayName: 'Set Only If Exists (XX)', type: 'boolean' },
          ]}
        />
      </>
    )}

    {operation === 'keys' && (
      <ExpressionField
        label="Pattern"
        value={config.pattern || ''}
        onChange={(v) => updateConfig('pattern', v)}
        placeholder="user:*"
        required
      />
    )}

    {(operation === 'hget' || config.operation === 'hset' || config.operation === 'hgetall') && (
      <>
        <ExpressionField
          label="Key"
          value={config.key || ''}
          onChange={(v) => updateConfig('key', v)}
          required
        />
        {(operation === 'hget' || config.operation === 'hset') && (
          <ExpressionField
            label="Field"
            value={config.field || ''}
            onChange={(v) => updateConfig('field', v)}
            required
          />
        )}
        {operation === 'hset' && (
          <ExpressionField
            label="Value"
            value={config.value || ''}
            onChange={(v) => updateConfig('value', v)}
            required
          />
        )}
      </>
    )}

    {(operation === 'lpush' || config.operation === 'rpush') && (
      <>
        <ExpressionField
          label="Key"
          value={config.key || ''}
          onChange={(v) => updateConfig('key', v)}
          required
        />
        <ExpressionField
          label="Value"
          value={config.value || ''}
          onChange={(v) => updateConfig('value', v)}
          required
        />
      </>
    )}

    {(operation === 'lpop' || config.operation === 'rpop') && (
      <ExpressionField
        label="Key"
        value={config.key || ''}
        onChange={(v) => updateConfig('key', v)}
        required
      />
    )}

    {operation === 'lrange' && (
      <>
        <ExpressionField
          label="Key"
          value={config.key || ''}
          onChange={(v) => updateConfig('key', v)}
          required
        />
        <TextField
          label="Start Index"
          value={config.start || '0'}
          onChange={(v) => updateConfig('start', v)}
        />
        <TextField
          label="End Index"
          value={config.end || '-1'}
          onChange={(v) => updateConfig('end', v)}
        />
      </>
    )}

    {operation === 'publish' && (
      <>
        <ExpressionField
          label="Channel"
          value={config.channel || ''}
          onChange={(v) => updateConfig('channel', v)}
          required
        />
        <ExpressionField
          label="Message"
          value={config.message || ''}
          onChange={(v) => updateConfig('message', v)}
          required
        />
      </>
    )}
  </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export const CloudStorageAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  // AWS S3
  aws_s3: AWSS3Config,
  s3: AWSS3Config,
  amazon_s3: AWSS3Config,
  
  // Dropbox
  dropbox: DropboxConfig,
  
  // Airtable
  airtable: AirtableConfig,
  airtable_db: AirtableConfig,
  
  // Notion
  notion: NotionConfig,
  notion_db: NotionConfig,
  
  // Supabase
  supabase: SupabaseConfig,
  supabase_db: SupabaseConfig,
  
  // MongoDB
  mongodb: MongoDBConfig,
  mongo: MongoDBConfig,
  
  // PostgreSQL
  postgres: PostgresConfig,
  postgresql: PostgresConfig,
  pg: PostgresConfig,
  
  // Redis
  redis: RedisConfig,
};

export default CloudStorageAppConfigs;
