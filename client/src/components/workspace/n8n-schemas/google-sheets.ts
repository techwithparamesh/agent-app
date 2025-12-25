/**
 * Google Sheets n8n-Style Schema
 * 
 * Resources: Spreadsheet, Sheet, Row
 * Based on: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/
 */

import { N8nAppSchema } from './types';

export const googleSheetsSchema: N8nAppSchema = {
  id: 'googleSheets',
  name: 'Google Sheets',
  icon: 'google-sheets',
  color: '#0F9D58',
  description: 'Read, update, and manage data in Google Sheets spreadsheets',
  version: '1.0',
  subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
  group: ['productivity', 'data'],
  documentationUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/',

  credentials: [
    {
      id: 'google_sheets_oauth2',
      name: 'Google Sheets OAuth2',
      type: 'oAuth2',
      fields: [
        {
          id: 'client_id',
          displayName: 'Client ID',
          name: 'clientId',
          type: 'string',
          required: true,
        },
        {
          id: 'client_secret',
          displayName: 'Client Secret',
          name: 'clientSecret',
          type: 'password',
          required: true,
        },
      ],
    },
    {
      id: 'google_service_account',
      name: 'Google Service Account',
      type: 'apiKey',
      fields: [
        {
          id: 'service_account_json',
          displayName: 'Service Account JSON',
          name: 'serviceAccountJson',
          type: 'password',
          required: true,
          description: 'Paste your service account JSON key file contents',
        },
      ],
    },
  ],

  resources: [
    // ========================================
    // SPREADSHEET RESOURCE
    // ========================================
    {
      id: 'spreadsheet',
      name: 'Spreadsheet',
      value: 'spreadsheet',
      description: 'Create and manage spreadsheets',
      operations: [
        {
          id: 'create_spreadsheet',
          name: 'Create',
          value: 'create',
          description: 'Create a new spreadsheet',
          action: 'Create a spreadsheet',
          fields: [
            {
              id: 'title',
              displayName: 'Title',
              name: 'title',
              type: 'string',
              required: true,
              description: 'The title of the new spreadsheet',
              placeholder: 'My Spreadsheet',
            },
          ],
          optionalFields: [
            {
              id: 'sheets',
              displayName: 'Initial Sheets',
              name: 'sheets',
              type: 'string',
              description: 'Comma-separated list of sheet names to create',
              placeholder: 'Sheet1, Sheet2, Data',
            },
            {
              id: 'locale',
              displayName: 'Locale',
              name: 'locale',
              type: 'options',
              default: 'en_US',
              options: [
                { name: 'English (US)', value: 'en_US' },
                { name: 'English (UK)', value: 'en_GB' },
                { name: 'Spanish', value: 'es' },
                { name: 'French', value: 'fr' },
                { name: 'German', value: 'de' },
                { name: 'Portuguese', value: 'pt_BR' },
                { name: 'Japanese', value: 'ja' },
                { name: 'Chinese (Simplified)', value: 'zh_CN' },
              ],
            },
            {
              id: 'folder_id',
              displayName: 'Folder ID',
              name: 'folderId',
              type: 'string',
              description: 'Google Drive folder ID to create the spreadsheet in',
              placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/v4/spreadsheets',
            },
          },
        },
        {
          id: 'get_spreadsheet',
          name: 'Get',
          value: 'get',
          description: 'Get spreadsheet information',
          action: 'Get spreadsheet info',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
              description: 'Select or enter the spreadsheet ID or URL',
              placeholder: 'https://docs.google.com/spreadsheets/d/...',
            },
          ],
          optionalFields: [
            {
              id: 'include_grid_data',
              displayName: 'Include Grid Data',
              name: 'includeGridData',
              type: 'boolean',
              default: false,
              description: 'Include cell values in the response',
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/v4/spreadsheets/{spreadsheetId}',
            },
          },
        },
        {
          id: 'delete_spreadsheet',
          name: 'Delete',
          value: 'delete',
          description: 'Delete a spreadsheet (moves to trash)',
          action: 'Delete a spreadsheet',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
              description: 'The spreadsheet to delete',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'DELETE',
              url: '/drive/v3/files/{spreadsheetId}',
            },
          },
        },
      ],
    },

    // ========================================
    // SHEET RESOURCE
    // ========================================
    {
      id: 'sheet',
      name: 'Sheet',
      value: 'sheet',
      description: 'Manage sheets within a spreadsheet',
      operations: [
        {
          id: 'create_sheet',
          name: 'Create',
          value: 'create',
          description: 'Create a new sheet in a spreadsheet',
          action: 'Create a sheet',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
              description: 'The spreadsheet to add the sheet to',
            },
            {
              id: 'title',
              displayName: 'Sheet Title',
              name: 'title',
              type: 'string',
              required: true,
              placeholder: 'New Sheet',
            },
          ],
          optionalFields: [
            {
              id: 'index',
              displayName: 'Index',
              name: 'index',
              type: 'number',
              description: 'Position of the sheet (0-based)',
              default: 0,
            },
            {
              id: 'row_count',
              displayName: 'Row Count',
              name: 'rowCount',
              type: 'number',
              default: 1000,
              description: 'Number of rows in the sheet',
            },
            {
              id: 'column_count',
              displayName: 'Column Count',
              name: 'columnCount',
              type: 'number',
              default: 26,
              description: 'Number of columns in the sheet',
            },
            {
              id: 'tab_color',
              displayName: 'Tab Color',
              name: 'tabColor',
              type: 'color',
              description: 'Color of the sheet tab',
            },
            {
              id: 'hidden',
              displayName: 'Hidden',
              name: 'hidden',
              type: 'boolean',
              default: false,
              description: 'Whether the sheet should be hidden',
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/v4/spreadsheets/{spreadsheetId}:batchUpdate',
            },
          },
        },
        {
          id: 'get_many_sheets',
          name: 'Get Many',
          value: 'getMany',
          description: 'Get all sheets in a spreadsheet',
          action: 'Get all sheets',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/v4/spreadsheets/{spreadsheetId}',
            },
          },
        },
        {
          id: 'clear_sheet',
          name: 'Clear',
          value: 'clear',
          description: 'Clear all data from a sheet',
          action: 'Clear a sheet',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
            },
            {
              id: 'sheet_name',
              displayName: 'Sheet',
              name: 'sheetName',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getSheets',
                loadOptionsDependsOn: ['spreadsheetId'],
              },
            },
          ],
          optionalFields: [
            {
              id: 'start_row',
              displayName: 'Start Row',
              name: 'startRow',
              type: 'number',
              description: 'Row to start clearing from (1-based)',
              default: 1,
            },
            {
              id: 'keep_header',
              displayName: 'Keep Header Row',
              name: 'keepHeader',
              type: 'boolean',
              default: true,
              description: 'Keep the first row (headers) when clearing',
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/v4/spreadsheets/{spreadsheetId}/values/{sheetName}:clear',
            },
          },
        },
        {
          id: 'delete_sheet',
          name: 'Delete',
          value: 'delete',
          description: 'Delete a sheet from a spreadsheet',
          action: 'Delete a sheet',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
            },
            {
              id: 'sheet_id',
              displayName: 'Sheet',
              name: 'sheetId',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getSheets',
                loadOptionsDependsOn: ['spreadsheetId'],
              },
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/v4/spreadsheets/{spreadsheetId}:batchUpdate',
            },
          },
        },
        {
          id: 'rename_sheet',
          name: 'Rename',
          value: 'rename',
          description: 'Rename a sheet',
          action: 'Rename a sheet',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
            },
            {
              id: 'sheet_id',
              displayName: 'Sheet',
              name: 'sheetId',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getSheets',
                loadOptionsDependsOn: ['spreadsheetId'],
              },
            },
            {
              id: 'new_name',
              displayName: 'New Name',
              name: 'newName',
              type: 'string',
              required: true,
              placeholder: 'Renamed Sheet',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/v4/spreadsheets/{spreadsheetId}:batchUpdate',
            },
          },
        },
      ],
    },

    // ========================================
    // ROW RESOURCE (Main Data Operations)
    // ========================================
    {
      id: 'row',
      name: 'Row',
      value: 'row',
      description: 'Read, write, update, and delete rows',
      operations: [
        {
          id: 'append_row',
          name: 'Append',
          value: 'append',
          description: 'Append rows to a sheet',
          action: 'Append rows',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
              description: 'Select or enter the spreadsheet',
            },
            {
              id: 'sheet_name',
              displayName: 'Sheet',
              name: 'sheetName',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getSheets',
                loadOptionsDependsOn: ['spreadsheetId'],
              },
            },
            {
              id: 'data_mode',
              displayName: 'Data Mode',
              name: 'dataMode',
              type: 'options',
              required: true,
              default: 'auto',
              options: [
                { name: 'Auto-map from Input', value: 'auto', description: 'Automatically map input fields to columns' },
                { name: 'Map Each Column', value: 'manual', description: 'Manually specify each column value' },
                { name: 'Raw JSON', value: 'raw', description: 'Provide raw row data as JSON' },
              ],
            },
            {
              id: 'columns',
              displayName: 'Column Mappings',
              name: 'columns',
              type: 'fixedCollection',
              description: 'Map columns to values',
              displayOptions: {
                show: { dataMode: ['manual'] },
              },
              fixedCollectionFields: [
                {
                  id: 'column',
                  displayName: 'Column',
                  name: 'column',
                  type: 'string',
                  required: true,
                  placeholder: 'A',
                },
                {
                  id: 'value',
                  displayName: 'Value',
                  name: 'value',
                  type: 'string',
                  required: true,
                },
              ],
            },
            {
              id: 'raw_data',
              displayName: 'Row Data (JSON)',
              name: 'rawData',
              type: 'json',
              description: 'Row data as array of values: ["value1", "value2", ...]',
              displayOptions: {
                show: { dataMode: ['raw'] },
              },
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
          ],
          optionalFields: [
            {
              id: 'value_input_option',
              displayName: 'Value Input Option',
              name: 'valueInputOption',
              type: 'options',
              default: 'USER_ENTERED',
              options: [
                { name: 'User Entered', value: 'USER_ENTERED', description: 'Parse as if typed by user (formulas work)' },
                { name: 'Raw', value: 'RAW', description: 'Store exactly as provided' },
              ],
            },
            {
              id: 'insert_data_option',
              displayName: 'Insert Data Option',
              name: 'insertDataOption',
              type: 'options',
              default: 'INSERT_ROWS',
              options: [
                { name: 'Insert Rows', value: 'INSERT_ROWS', description: 'Insert new rows for the data' },
                { name: 'Overwrite', value: 'OVERWRITE', description: 'Overwrite existing data' },
              ],
            },
            {
              id: 'include_values_in_response',
              displayName: 'Include Values in Response',
              name: 'includeValuesInResponse',
              type: 'boolean',
              default: false,
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/v4/spreadsheets/{spreadsheetId}/values/{sheetName}:append',
            },
          },
        },
        {
          id: 'read_rows',
          name: 'Read',
          value: 'read',
          description: 'Read rows from a sheet',
          action: 'Read rows',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
            },
            {
              id: 'sheet_name',
              displayName: 'Sheet',
              name: 'sheetName',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getSheets',
                loadOptionsDependsOn: ['spreadsheetId'],
              },
            },
          ],
          optionalFields: [
            {
              id: 'return_all',
              displayName: 'Return All',
              name: 'returnAll',
              type: 'boolean',
              default: true,
            },
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 100,
              displayOptions: { show: { returnAll: [false] } },
            },
            {
              id: 'range',
              displayName: 'Range',
              name: 'range',
              type: 'string',
              description: 'A1 notation range (e.g., A1:D10)',
              placeholder: 'A1:Z1000',
            },
            {
              id: 'header_row',
              displayName: 'Header Row',
              name: 'headerRow',
              type: 'number',
              default: 1,
              description: 'Row containing column headers',
            },
            {
              id: 'first_data_row',
              displayName: 'First Data Row',
              name: 'firstDataRow',
              type: 'number',
              default: 2,
              description: 'First row containing data',
            },
            {
              id: 'value_render_option',
              displayName: 'Value Render Option',
              name: 'valueRenderOption',
              type: 'options',
              default: 'FORMATTED_VALUE',
              options: [
                { name: 'Formatted Value', value: 'FORMATTED_VALUE', description: 'Values as displayed' },
                { name: 'Unformatted Value', value: 'UNFORMATTED_VALUE', description: 'Raw values without formatting' },
                { name: 'Formula', value: 'FORMULA', description: 'Show formulas instead of values' },
              ],
            },
            {
              id: 'date_time_render_option',
              displayName: 'Date/Time Render',
              name: 'dateTimeRenderOption',
              type: 'options',
              default: 'FORMATTED_STRING',
              options: [
                { name: 'Formatted String', value: 'FORMATTED_STRING' },
                { name: 'Serial Number', value: 'SERIAL_NUMBER' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/v4/spreadsheets/{spreadsheetId}/values/{range}',
            },
          },
        },
        {
          id: 'update_row',
          name: 'Update',
          value: 'update',
          description: 'Update rows in a sheet',
          action: 'Update rows',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
            },
            {
              id: 'sheet_name',
              displayName: 'Sheet',
              name: 'sheetName',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getSheets',
                loadOptionsDependsOn: ['spreadsheetId'],
              },
            },
            {
              id: 'lookup_column',
              displayName: 'Lookup Column',
              name: 'lookupColumn',
              type: 'string',
              required: true,
              description: 'Column to use for finding the row to update',
              placeholder: 'A',
            },
            {
              id: 'lookup_value',
              displayName: 'Lookup Value',
              name: 'lookupValue',
              type: 'string',
              required: true,
              description: 'Value to match in the lookup column',
            },
            {
              id: 'data_mode',
              displayName: 'Data Mode',
              name: 'dataMode',
              type: 'options',
              required: true,
              default: 'auto',
              options: [
                { name: 'Auto-map from Input', value: 'auto' },
                { name: 'Map Each Column', value: 'manual' },
                { name: 'Raw JSON', value: 'raw' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'value_input_option',
              displayName: 'Value Input Option',
              name: 'valueInputOption',
              type: 'options',
              default: 'USER_ENTERED',
              options: [
                { name: 'User Entered', value: 'USER_ENTERED' },
                { name: 'Raw', value: 'RAW' },
              ],
            },
            {
              id: 'upsert',
              displayName: 'Upsert',
              name: 'upsert',
              type: 'boolean',
              default: false,
              description: 'Create a new row if no matching row is found',
            },
          ],
          routing: {
            request: {
              method: 'PUT',
              url: '/v4/spreadsheets/{spreadsheetId}/values/{range}',
            },
          },
        },
        {
          id: 'delete_row',
          name: 'Delete',
          value: 'delete',
          description: 'Delete rows from a sheet',
          action: 'Delete rows',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
            },
            {
              id: 'sheet_name',
              displayName: 'Sheet',
              name: 'sheetName',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getSheets',
                loadOptionsDependsOn: ['spreadsheetId'],
              },
            },
            {
              id: 'delete_by',
              displayName: 'Delete By',
              name: 'deleteBy',
              type: 'options',
              required: true,
              default: 'rowNumber',
              options: [
                { name: 'Row Number', value: 'rowNumber', description: 'Delete specific row numbers' },
                { name: 'Lookup Value', value: 'lookup', description: 'Delete rows matching a value' },
              ],
            },
            {
              id: 'row_number',
              displayName: 'Row Number',
              name: 'rowNumber',
              type: 'number',
              required: true,
              description: 'The row number to delete (1-based)',
              displayOptions: { show: { deleteBy: ['rowNumber'] } },
            },
            {
              id: 'lookup_column',
              displayName: 'Lookup Column',
              name: 'lookupColumn',
              type: 'string',
              required: true,
              displayOptions: { show: { deleteBy: ['lookup'] } },
            },
            {
              id: 'lookup_value',
              displayName: 'Lookup Value',
              name: 'lookupValue',
              type: 'string',
              required: true,
              displayOptions: { show: { deleteBy: ['lookup'] } },
            },
          ],
          optionalFields: [
            {
              id: 'delete_all_matches',
              displayName: 'Delete All Matches',
              name: 'deleteAllMatches',
              type: 'boolean',
              default: false,
              description: 'Delete all rows matching the lookup value',
              displayOptions: { show: { deleteBy: ['lookup'] } },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/v4/spreadsheets/{spreadsheetId}:batchUpdate',
            },
          },
        },
        {
          id: 'lookup_row',
          name: 'Lookup',
          value: 'lookup',
          description: 'Look up a row by column value',
          action: 'Lookup a row',
          fields: [
            {
              id: 'spreadsheet_id',
              displayName: 'Spreadsheet',
              name: 'spreadsheetId',
              type: 'resourceLocator',
              required: true,
            },
            {
              id: 'sheet_name',
              displayName: 'Sheet',
              name: 'sheetName',
              type: 'options',
              required: true,
              typeOptions: {
                loadOptionsMethod: 'getSheets',
                loadOptionsDependsOn: ['spreadsheetId'],
              },
            },
            {
              id: 'lookup_column',
              displayName: 'Lookup Column',
              name: 'lookupColumn',
              type: 'string',
              required: true,
              description: 'Column to search in (letter or header name)',
              placeholder: 'A or "Email"',
            },
            {
              id: 'lookup_value',
              displayName: 'Lookup Value',
              name: 'lookupValue',
              type: 'string',
              required: true,
              description: 'The value to search for',
            },
          ],
          optionalFields: [
            {
              id: 'return_all_matches',
              displayName: 'Return All Matches',
              name: 'returnAllMatches',
              type: 'boolean',
              default: false,
              description: 'Return all matching rows instead of just the first',
            },
            {
              id: 'header_row',
              displayName: 'Header Row',
              name: 'headerRow',
              type: 'number',
              default: 1,
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/v4/spreadsheets/{spreadsheetId}/values/{range}',
            },
          },
        },
      ],
    },
  ],

  defaults: {
    name: 'Google Sheets',
  },
};

export default googleSheetsSchema;
