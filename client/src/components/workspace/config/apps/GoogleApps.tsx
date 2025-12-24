/**
 * Google App Configurations
 * 
 * n8n-style configurations for Google services:
 * - Google Sheets (Document, Sheet, Rows operations)
 * - Google Drive (File, Folder operations)
 * - Google Calendar (Event, Calendar operations)
 * - Gmail (Message, Draft, Label operations)
 * - Google Docs
 */

import React from "react";
import {
  TextField,
  TextareaField,
  SelectField,
  SwitchField,
  CredentialField,
  ExpressionField,
  KeyValueField,
  CollectionField,
  FixedCollectionField,
  ResourceLocatorField,
  ResourceMapperField,
  DateTimeField,
  FilterField,
  InfoBox,
  SectionHeader,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// GOOGLE SHEETS ADVANCED CONFIG
// ============================================

export const GoogleSheetsAdvancedConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  const dataMode = config.dataMode || '';
  const readDataMode = config.readDataMode || '';
  const deleteMode = config.deleteMode || '';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Google Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'sheet'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'document', label: 'Document (Spreadsheet)' },
        { value: 'sheet', label: 'Sheet (Within Document)' },
      ]}
      required
    />

    {resource === 'document' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Spreadsheet' },
            { value: 'delete', label: 'Delete Spreadsheet' },
          ]}
        />

        {operation === 'create' && (
          <>
            <TextField
              label="Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              placeholder="My New Spreadsheet"
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'locale', displayName: 'Locale', type: 'string', placeholder: 'en_US' },
                { name: 'recalculationInterval', displayName: 'Recalculation Interval', type: 'options', options: [
                  { value: 'ON_CHANGE', label: 'On Change' },
                  { value: 'MINUTE', label: 'Every Minute' },
                  { value: 'HOUR', label: 'Every Hour' },
                ]},
              ]}
            />
          </>
        )}

        {operation === 'delete' && (
          <ResourceLocatorField
            label="Document"
            value={config.documentId || { mode: 'list', value: '' }}
            onChange={(v) => updateConfig('documentId', v)}
            modes={['list', 'id', 'url']}
            resourceType="Spreadsheet"
            required
          />
        )}
      </>
    )}

    {resource === 'sheet' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'appendOrUpdate'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'appendOrUpdate', label: 'Append or Update Row' },
            { value: 'append', label: 'Append Row' },
            { value: 'clear', label: 'Clear Sheet' },
            { value: 'create', label: 'Create Sheet' },
            { value: 'delete', label: 'Delete Sheet' },
            { value: 'deleteRows', label: 'Delete Rows' },
            { value: 'read', label: 'Read Rows' },
          ]}
        />

        <ResourceLocatorField
          label="Document"
          value={config.documentId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('documentId', v)}
          modes={['list', 'id', 'url']}
          resourceType="Spreadsheet"
          required
        />

        {config.operation !== 'create' && (
          <ResourceLocatorField
            label="Sheet"
            value={config.sheetName || { mode: 'list', value: '' }}
            onChange={(v) => updateConfig('sheetName', v)}
            modes={['list', 'id']}
            listOptions={[
              { value: 'Sheet1', label: 'Sheet1' },
            ]}
            resourceType="Sheet"
            required
          />
        )}

        {operation === 'create' && (
          <>
            <TextField
              label="Sheet Title"
              value={config.sheetTitle || ''}
              onChange={(v) => updateConfig('sheetTitle', v)}
              placeholder="New Sheet"
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'hidden', displayName: 'Hidden', type: 'boolean' },
                { name: 'rightToLeft', displayName: 'Right to Left', type: 'boolean' },
                { name: 'tabColor', displayName: 'Tab Color (Hex)', type: 'string', placeholder: '#FF0000' },
              ]}
            />
          </>
        )}

        {(operation === 'appendOrUpdate' || config.operation === 'append') && (
          <>
            <SelectField
              label="Data Mode"
              value={config.dataMode || 'autoMap'}
              onChange={(v) => updateConfig('dataMode', v)}
              options={[
                { value: 'autoMap', label: 'Auto-Map Input Data' },
                { value: 'define', label: 'Define Columns Manually' },
                { value: 'raw', label: 'Raw Data (2D Array)' },
              ]}
            />

            {config.dataMode === 'define' && (
              <ResourceMapperField
                label="Column Mappings"
                value={config.columns || []}
                onChange={(v) => updateConfig('columns', v)}
                sourceFields={[
                  { value: 'field1', label: 'Input Field 1' },
                  { value: 'field2', label: 'Input Field 2' },
                ]}
                targetFields={[
                  { value: 'A', label: 'Column A', type: 'string' },
                  { value: 'B', label: 'Column B', type: 'string' },
                  { value: 'C', label: 'Column C', type: 'string' },
                ]}
              />
            )}

            {operation === 'appendOrUpdate' && (
              <>
                <TextField
                  label="Matching Column"
                  value={config.matchingColumn || ''}
                  onChange={(v) => updateConfig('matchingColumn', v)}
                  placeholder="A"
                  description="Column to use for finding existing rows"
                />

                <CollectionField
                  label="Options"
                  value={config.options || {}}
                  onChange={(v) => updateConfig('options', v)}
                  options={[
                    { name: 'cellFormat', displayName: 'Cell Format', type: 'options', options: [
                      { value: 'RAW', label: 'Raw' },
                      { value: 'USER_ENTERED', label: 'User Entered (Parse formulas)' },
                    ]},
                    { name: 'handlingExtraData', displayName: 'Extra Data Handling', type: 'options', options: [
                      { value: 'insertInNewColumn', label: 'Insert New Columns' },
                      { value: 'ignoreIt', label: 'Ignore' },
                      { value: 'error', label: 'Error' },
                    ]},
                  ]}
                />
              </>
            )}
          </>
        )}

        {operation === 'read' && (
          <>
            <SelectField
              label="Data Mode"
              value={config.readDataMode || 'all'}
              onChange={(v) => updateConfig('readDataMode', v)}
              options={[
                { value: 'all', label: 'Read All Rows' },
                { value: 'range', label: 'Read Range' },
                { value: 'filter', label: 'Read Filtered Rows' },
              ]}
            />

            {config.readDataMode === 'range' && (
              <TextField
                label="Range"
                value={config.range || ''}
                onChange={(v) => updateConfig('range', v)}
                placeholder="A1:Z100"
              />
            )}

            {config.readDataMode === 'filter' && (
              <FilterField
                label="Filter Conditions"
                value={config.filters || { conditions: [] }}
                onChange={(v) => updateConfig('filters', v)}
                fields={[
                  { value: 'column_a', label: 'Column A', type: 'string' },
                  { value: 'column_b', label: 'Column B', type: 'string' },
                  { value: 'column_c', label: 'Column C', type: 'string' },
                ]}
              />
            )}

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'headerRow', displayName: 'Header Row', type: 'number', default: 1 },
                { name: 'dataLocationOnSheet', displayName: 'First Data Row', type: 'number', default: 2 },
                { name: 'outputFormatting', displayName: 'Output Formatting', type: 'options', options: [
                  { value: 'FORMATTED_VALUE', label: 'Formatted' },
                  { value: 'UNFORMATTED_VALUE', label: 'Unformatted' },
                  { value: 'FORMULA', label: 'Formulas' },
                ]},
              ]}
            />
          </>
        )}

        {operation === 'deleteRows' && (
          <>
            <SelectField
              label="Delete Mode"
              value={config.deleteMode || 'byRowNumber'}
              onChange={(v) => updateConfig('deleteMode', v)}
              options={[
                { value: 'byRowNumber', label: 'By Row Number' },
                { value: 'byLookup', label: 'By Lookup Value' },
              ]}
            />

            {config.deleteMode === 'byRowNumber' && (
              <TextField
                label="Row Number(s)"
                value={config.rowNumbers || ''}
                onChange={(v) => updateConfig('rowNumbers', v)}
                placeholder="1, 3, 5-10"
                description="Row numbers to delete (comma-separated or ranges)"
              />
            )}

            {config.deleteMode === 'byLookup' && (
              <>
                <TextField
                  label="Lookup Column"
                  value={config.lookupColumn || ''}
                  onChange={(v) => updateConfig('lookupColumn', v)}
                  placeholder="A"
                />
                <ExpressionField
                  label="Lookup Value"
                  value={config.lookupValue || ''}
                  onChange={(v) => updateConfig('lookupValue', v)}
                />
              </>
            )}
          </>
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// GOOGLE DRIVE CONFIG
// ============================================

export const GoogleDriveConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Google Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'file'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'file', label: 'File' },
        { value: 'folder', label: 'Folder' },
        { value: 'fileFolder', label: 'File/Folder' },
        { value: 'drive', label: 'Shared Drive' },
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
            { value: 'update', label: 'Update' },
            { value: 'share', label: 'Share' },
          ]}
        />

        {operation === 'upload' && (
          <>
            <SelectField
              label="Input Type"
              value={config.inputType || 'binary'}
              onChange={(v) => updateConfig('inputType', v)}
              options={[
                { value: 'binary', label: 'Binary Data' },
                { value: 'url', label: 'From URL' },
              ]}
            />

            <TextField
              label="File Name"
              value={config.fileName || ''}
              onChange={(v) => updateConfig('fileName', v)}
              placeholder="document.pdf"
              required
            />

            <ResourceLocatorField
              label="Parent Folder"
              value={config.parentFolder || { mode: 'list', value: 'root' }}
              onChange={(v) => updateConfig('parentFolder', v)}
              modes={['list', 'id', 'url']}
              listOptions={[
                { value: 'root', label: 'My Drive (Root)' },
              ]}
              resourceType="Folder"
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'keepRevisionForever', displayName: 'Keep Revision Forever', type: 'boolean' },
                { name: 'useContentAsIndexableText', displayName: 'Indexable Content', type: 'boolean' },
                { name: 'ocrLanguage', displayName: 'OCR Language', type: 'string', placeholder: 'en' },
              ]}
            />
          </>
        )}

        {operation === 'download' && (
          <ResourceLocatorField
            label="File"
            value={config.fileId || { mode: 'list', value: '' }}
            onChange={(v) => updateConfig('fileId', v)}
            modes={['list', 'id', 'url']}
            resourceType="File"
            required
          />
        )}

        {operation === 'copy' && (
          <>
            <ResourceLocatorField
              label="Source File"
              value={config.fileId || { mode: 'list', value: '' }}
              onChange={(v) => updateConfig('fileId', v)}
              modes={['list', 'id', 'url']}
              resourceType="File"
              required
            />
            <TextField
              label="New File Name"
              value={config.newFileName || ''}
              onChange={(v) => updateConfig('newFileName', v)}
            />
            <ResourceLocatorField
              label="Destination Folder"
              value={config.destinationFolder || { mode: 'list', value: '' }}
              onChange={(v) => updateConfig('destinationFolder', v)}
              modes={['list', 'id', 'url']}
              resourceType="Folder"
            />
          </>
        )}

        {operation === 'share' && (
          <>
            <ResourceLocatorField
              label="File"
              value={config.fileId || { mode: 'list', value: '' }}
              onChange={(v) => updateConfig('fileId', v)}
              modes={['list', 'id', 'url']}
              resourceType="File"
              required
            />
            <SelectField
              label="Permissions"
              value={config.permissionType || 'user'}
              onChange={(v) => updateConfig('permissionType', v)}
              options={[
                { value: 'user', label: 'User' },
                { value: 'group', label: 'Group' },
                { value: 'domain', label: 'Domain' },
                { value: 'anyone', label: 'Anyone' },
              ]}
            />
            {(config.permissionType === 'user' || config.permissionType === 'group') && (
              <TextField
                label="Email Address"
                value={config.emailAddress || ''}
                onChange={(v) => updateConfig('emailAddress', v)}
                required
              />
            )}
            <SelectField
              label="Role"
              value={config.role || 'reader'}
              onChange={(v) => updateConfig('role', v)}
              options={[
                { value: 'reader', label: 'Viewer' },
                { value: 'commenter', label: 'Commenter' },
                { value: 'writer', label: 'Editor' },
              ]}
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
            { value: 'share', label: 'Share' },
          ]}
        />

        {operation === 'create' && (
          <>
            <TextField
              label="Folder Name"
              value={config.folderName || ''}
              onChange={(v) => updateConfig('folderName', v)}
              required
            />
            <ResourceLocatorField
              label="Parent Folder"
              value={config.parentFolder || { mode: 'list', value: 'root' }}
              onChange={(v) => updateConfig('parentFolder', v)}
              modes={['list', 'id', 'url']}
              listOptions={[
                { value: 'root', label: 'My Drive (Root)' },
              ]}
              resourceType="Folder"
            />
          </>
        )}
      </>
    )}

    {resource === 'fileFolder' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'search'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'search', label: 'Search' },
          ]}
        />

        <TextField
          label="Search Query"
          value={config.queryString || ''}
          onChange={(v) => updateConfig('queryString', v)}
          placeholder="name contains 'report'"
          description="Google Drive search query syntax"
        />

        <CollectionField
          label="Filters"
          value={config.filters || {}}
          onChange={(v) => updateConfig('filters', v)}
          options={[
            { name: 'mimeType', displayName: 'MIME Type', type: 'options', options: [
              { value: 'application/pdf', label: 'PDF' },
              { value: 'application/vnd.google-apps.document', label: 'Google Doc' },
              { value: 'application/vnd.google-apps.spreadsheet', label: 'Google Sheet' },
              { value: 'application/vnd.google-apps.folder', label: 'Folder' },
            ]},
            { name: 'trashed', displayName: 'Include Trashed', type: 'boolean' },
            { name: 'sharedWithMe', displayName: 'Shared With Me Only', type: 'boolean' },
          ]}
        />

        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'limit', displayName: 'Limit', type: 'number', default: 50 },
            { name: 'orderBy', displayName: 'Order By', type: 'options', options: [
              { value: 'modifiedTime desc', label: 'Last Modified' },
              { value: 'createdTime desc', label: 'Created Date' },
              { value: 'name', label: 'Name' },
            ]},
          ]}
        />
      </>
    )}
  </div>
  );
};

// ============================================
// GOOGLE CALENDAR CONFIG
// ============================================

export const GoogleCalendarConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Google Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'event'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'event', label: 'Event' },
        { value: 'calendar', label: 'Calendar' },
      ]}
      required
    />

    {resource === 'event' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Event' },
            { value: 'get', label: 'Get Event' },
            { value: 'getAll', label: 'Get All Events' },
            { value: 'update', label: 'Update Event' },
            { value: 'delete', label: 'Delete Event' },
          ]}
        />

        <ResourceLocatorField
          label="Calendar"
          value={config.calendarId || { mode: 'list', value: 'primary' }}
          onChange={(v) => updateConfig('calendarId', v)}
          modes={['list', 'id']}
          listOptions={[
            { value: 'primary', label: 'Primary Calendar' },
          ]}
          resourceType="Calendar"
          required
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Title"
              value={config.summary || ''}
              onChange={(v) => updateConfig('summary', v)}
              required
            />

            <DateTimeField
              label="Start"
              value={config.start || ''}
              onChange={(v) => updateConfig('start', v)}
              includeTime
              required
            />

            <DateTimeField
              label="End"
              value={config.end || ''}
              onChange={(v) => updateConfig('end', v)}
              includeTime
              required
            />

            <SwitchField
              label="All Day Event"
              value={config.allDay || false}
              onChange={(v) => updateConfig('allDay', v)}
            />

            <CollectionField
              label="Additional Options"
              value={config.additionalOptions || {}}
              onChange={(v) => updateConfig('additionalOptions', v)}
              options={[
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'location', displayName: 'Location', type: 'string' },
                { name: 'colorId', displayName: 'Color ID', type: 'string' },
                { name: 'visibility', displayName: 'Visibility', type: 'options', options: [
                  { value: 'default', label: 'Default' },
                  { value: 'public', label: 'Public' },
                  { value: 'private', label: 'Private' },
                ]},
                { name: 'sendUpdates', displayName: 'Send Notifications', type: 'options', options: [
                  { value: 'all', label: 'All Guests' },
                  { value: 'externalOnly', label: 'External Only' },
                  { value: 'none', label: 'None' },
                ]},
                { name: 'guestsCanModify', displayName: 'Guests Can Modify', type: 'boolean' },
                { name: 'guestsCanInviteOthers', displayName: 'Guests Can Invite', type: 'boolean' },
                { name: 'guestsCanSeeOtherGuests', displayName: 'Guests See Others', type: 'boolean' },
              ]}
            />

            <FixedCollectionField
              label="Attendees"
              value={config.attendees || []}
              onChange={(v) => updateConfig('attendees', v)}
              fields={[
                { name: 'email', displayName: 'Email', type: 'string', placeholder: 'attendee@example.com' },
                { name: 'optional', displayName: 'Optional', type: 'boolean' },
              ]}
              sortable
            />

            <FixedCollectionField
              label="Reminders"
              value={config.reminders || []}
              onChange={(v) => updateConfig('reminders', v)}
              fields={[
                { name: 'method', displayName: 'Method', type: 'options', options: [
                  { value: 'email', label: 'Email' },
                  { value: 'popup', label: 'Popup' },
                ]},
                { name: 'minutes', displayName: 'Minutes Before', type: 'number' },
              ]}
            />
          </>
        )}

        {operation === 'getAll' && (
          <>
            <DateTimeField
              label="Time Min"
              value={config.timeMin || ''}
              onChange={(v) => updateConfig('timeMin', v)}
              includeTime
              description="Events starting after this time"
            />

            <DateTimeField
              label="Time Max"
              value={config.timeMax || ''}
              onChange={(v) => updateConfig('timeMax', v)}
              includeTime
              description="Events starting before this time"
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'maxResults', displayName: 'Max Results', type: 'number', default: 250 },
                { name: 'singleEvents', displayName: 'Expand Recurring', type: 'boolean', default: true },
                { name: 'orderBy', displayName: 'Order By', type: 'options', options: [
                  { value: 'startTime', label: 'Start Time' },
                  { value: 'updated', label: 'Updated Time' },
                ]},
                { name: 'query', displayName: 'Search Query', type: 'string' },
              ]}
            />
          </>
        )}

        {operation === 'get' && (
          <TextField
            label="Event ID"
            value={config.eventId || ''}
            onChange={(v) => updateConfig('eventId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'calendar' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'getAll'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'getAll', label: 'Get All Calendars' },
            { value: 'freeBusy', label: 'Check Availability' },
          ]}
        />

        {operation === 'freeBusy' && (
          <>
            <DateTimeField
              label="Start Time"
              value={config.timeMin || ''}
              onChange={(v) => updateConfig('timeMin', v)}
              includeTime
              required
            />
            <DateTimeField
              label="End Time"
              value={config.timeMax || ''}
              onChange={(v) => updateConfig('timeMax', v)}
              includeTime
              required
            />
            <TextField
              label="Calendar IDs"
              value={config.calendarIds || ''}
              onChange={(v) => updateConfig('calendarIds', v)}
              placeholder="primary, calendar2@group.calendar.google.com"
              description="Comma-separated calendar IDs"
            />
          </>
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// GMAIL CONFIG
// ============================================

export const GmailConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  // Get values with defaults
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  const emailType = config.emailType || 'text';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Gmail Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={resource}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'message', label: 'Message' },
        { value: 'draft', label: 'Draft' },
        { value: 'label', label: 'Label' },
        { value: 'thread', label: 'Thread' },
      ]}
      required
    />

    {resource === 'message' && (
      <>
        <SelectField
          label="Operation"
          value={operation}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Email' },
            { value: 'reply', label: 'Reply to Email' },
            { value: 'get', label: 'Get Email' },
            { value: 'getAll', label: 'Get Many Emails' },
            { value: 'delete', label: 'Delete Email' },
            { value: 'addLabels', label: 'Add Labels' },
            { value: 'removeLabels', label: 'Remove Labels' },
            { value: 'markAsRead', label: 'Mark as Read' },
            { value: 'markAsUnread', label: 'Mark as Unread' },
          ]}
        />

        {operation === 'send' && (
          <>
            <ExpressionField
              label="To"
              value={config.to || ''}
              onChange={(v) => updateConfig('to', v)}
              placeholder="recipient@example.com"
              required
            />

            <ExpressionField
              label="Subject"
              value={config.subject || ''}
              onChange={(v) => updateConfig('subject', v)}
              required
            />

            <SelectField
              label="Email Type"
              value={emailType}
              onChange={(v) => updateConfig('emailType', v)}
              options={[
                { value: 'text', label: 'Plain Text' },
                { value: 'html', label: 'HTML' },
              ]}
            />

            <TextareaField
              label="Message"
              value={config.message || ''}
              onChange={(v) => updateConfig('message', v)}
              rows={6}
              required
            />

            <CollectionField
              label="Additional Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'cc', displayName: 'CC', type: 'string' },
                { name: 'bcc', displayName: 'BCC', type: 'string' },
                { name: 'replyTo', displayName: 'Reply To', type: 'string' },
                { name: 'senderName', displayName: 'Sender Name', type: 'string' },
              ]}
            />

            <SwitchField
              label="Include Attachments"
              value={config.includeAttachments || false}
              onChange={(v) => updateConfig('includeAttachments', v)}
            />
          </>
        )}

        {operation === 'reply' && (
          <>
            <TextField
              label="Message ID"
              value={config.messageId || ''}
              onChange={(v) => updateConfig('messageId', v)}
              required
            />
            <TextareaField
              label="Reply Message"
              value={config.message || ''}
              onChange={(v) => updateConfig('message', v)}
              rows={4}
              required
            />
          </>
        )}

        {operation === 'getAll' && (
          <>
            <TextField
              label="Search Query"
              value={config.query || ''}
              onChange={(v) => updateConfig('query', v)}
              placeholder="from:example@gmail.com is:unread"
              description="Gmail search syntax"
            />
            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'maxResults', displayName: 'Max Results', type: 'number', default: 100 },
                { name: 'labelIds', displayName: 'Label IDs', type: 'string', description: 'Comma-separated' },
                { name: 'includeSpamTrash', displayName: 'Include Spam/Trash', type: 'boolean' },
              ]}
            />
          </>
        )}

        {(operation === 'addLabels' || operation === 'removeLabels') && (
          <>
            <TextField
              label="Message ID"
              value={config.messageId || ''}
              onChange={(v) => updateConfig('messageId', v)}
              required
            />
            <TextField
              label="Label IDs"
              value={config.labelIds || ''}
              onChange={(v) => updateConfig('labelIds', v)}
              placeholder="Label_1, Label_2"
              description="Comma-separated label IDs"
              required
            />
          </>
        )}
      </>
    )}

    {resource === 'draft' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Draft' },
            { value: 'get', label: 'Get Draft' },
            { value: 'getAll', label: 'Get All Drafts' },
            { value: 'delete', label: 'Delete Draft' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="To"
              value={config.to || ''}
              onChange={(v) => updateConfig('to', v)}
              placeholder="recipient@example.com"
              required
            />
            <ExpressionField
              label="Subject"
              value={config.subject || ''}
              onChange={(v) => updateConfig('subject', v)}
              required
            />
            <TextareaField
              label="Message"
              value={config.message || ''}
              onChange={(v) => updateConfig('message', v)}
              rows={6}
              required
            />
          </>
        )}
      </>
    )}

    {resource === 'label' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'getAll'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'getAll', label: 'Get All Labels' },
            { value: 'create', label: 'Create Label' },
            { value: 'delete', label: 'Delete Label' },
          ]}
        />

        {operation === 'create' && (
          <>
            <TextField
              label="Label Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />
            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'labelListVisibility', displayName: 'Show in Label List', type: 'options', options: [
                  { value: 'labelShow', label: 'Show' },
                  { value: 'labelShowIfUnread', label: 'Show if Unread' },
                  { value: 'labelHide', label: 'Hide' },
                ]},
                { name: 'messageListVisibility', displayName: 'Show in Message List', type: 'options', options: [
                  { value: 'show', label: 'Show' },
                  { value: 'hide', label: 'Hide' },
                ]},
                { name: 'backgroundColor', displayName: 'Background Color', type: 'string', placeholder: '#000000' },
                { name: 'textColor', displayName: 'Text Color', type: 'string', placeholder: '#ffffff' },
              ]}
            />
          </>
        )}
      </>
    )}

    {resource === 'thread' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Thread' },
            { value: 'getAll', label: 'Get All Threads' },
            { value: 'delete', label: 'Delete Thread' },
            { value: 'trash', label: 'Move to Trash' },
            { value: 'untrash', label: 'Remove from Trash' },
            { value: 'addLabels', label: 'Add Labels' },
            { value: 'removeLabels', label: 'Remove Labels' },
          ]}
        />

        {operation === 'getAll' && (
          <>
            <TextField
              label="Search Query"
              value={config.query || ''}
              onChange={(v) => updateConfig('query', v)}
              placeholder="from:example@gmail.com"
            />
            <TextField
              label="Max Results"
              value={config.maxResults || ''}
              onChange={(v) => updateConfig('maxResults', v)}
              placeholder="100"
            />
          </>
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// GOOGLE DOCS CONFIG
// ============================================

export const GoogleDocsConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const operation = config.operation || 'send';
  const updateType = config.updateType || '';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Google Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'create'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'create', label: 'Create Document' },
        { value: 'get', label: 'Get Document' },
        { value: 'update', label: 'Update Document' },
      ]}
      required
    />

    {operation === 'create' && (
      <>
        <TextField
          label="Title"
          value={config.title || ''}
          onChange={(v) => updateConfig('title', v)}
          required
        />
        <ResourceLocatorField
          label="Folder"
          value={config.folderId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('folderId', v)}
          modes={['list', 'id']}
          resourceType="Folder"
          description="Optional: Save to specific folder"
        />
      </>
    )}

    {operation === 'get' && (
      <ResourceLocatorField
        label="Document"
        value={config.documentId || { mode: 'list', value: '' }}
        onChange={(v) => updateConfig('documentId', v)}
        modes={['list', 'id', 'url']}
        resourceType="Document"
        required
      />
    )}

    {operation === 'update' && (
      <>
        <ResourceLocatorField
          label="Document"
          value={config.documentId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('documentId', v)}
          modes={['list', 'id', 'url']}
          resourceType="Document"
          required
        />

        <SelectField
          label="Update Type"
          value={config.updateType || 'append'}
          onChange={(v) => updateConfig('updateType', v)}
          options={[
            { value: 'append', label: 'Append Text' },
            { value: 'replaceAll', label: 'Replace All Text' },
          ]}
        />

        {config.updateType === 'append' && (
          <TextareaField
            label="Text to Append"
            value={config.text || ''}
            onChange={(v) => updateConfig('text', v)}
            rows={4}
            required
          />
        )}

        {config.updateType === 'replaceAll' && (
          <FixedCollectionField
            label="Find and Replace"
            value={config.replacements || []}
            onChange={(v) => updateConfig('replacements', v)}
            fields={[
              { name: 'find', displayName: 'Find', type: 'string' },
              { name: 'replace', displayName: 'Replace With', type: 'string' },
              { name: 'matchCase', displayName: 'Match Case', type: 'boolean' },
            ]}
            sortable
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export const GoogleAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  // Google Sheets
  google_sheets_advanced: GoogleSheetsAdvancedConfig,
  google_sheets: GoogleSheetsAdvancedConfig,
  googlesheets: GoogleSheetsAdvancedConfig,
  sheets: GoogleSheetsAdvancedConfig,
  
  // Google Drive
  google_drive: GoogleDriveConfig,
  googledrive: GoogleDriveConfig,
  drive: GoogleDriveConfig,
  
  // Google Calendar
  google_calendar: GoogleCalendarConfig,
  googlecalendar: GoogleCalendarConfig,
  calendar: GoogleCalendarConfig,
  gcal: GoogleCalendarConfig,
  
  // Gmail
  gmail: GmailConfig,
  google_mail: GmailConfig,
  
  // Google Docs
  google_docs: GoogleDocsConfig,
  googledocs: GoogleDocsConfig,
  docs: GoogleDocsConfig,
};

export default GoogleAppConfigs;
