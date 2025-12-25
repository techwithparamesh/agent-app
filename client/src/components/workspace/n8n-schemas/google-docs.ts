/**
 * Google Docs n8n-style Schema
 * 
 * Comprehensive Google Docs API operations
 */

import { N8nAppSchema } from './types';

export const googleDocsSchema: N8nAppSchema = {
  id: 'googleDocs',
  name: 'Google Docs',
  description: 'Google Docs document editing',
  version: '1.0.0',
  color: '#4285F4',
  icon: 'google-docs',
  group: ['google', 'productivity'],
  
  credentials: [
    {
      name: 'googleDocsOAuth2',
      displayName: 'Google Docs OAuth2',
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
      name: 'googleDocsServiceAccount',
      displayName: 'Google Docs Service Account',
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
    // DOCUMENT RESOURCE
    // ============================================
    {
      id: 'document',
      name: 'Document',
      value: 'document',
      description: 'Document operations',
      operations: [
        {
          id: 'create_document',
          name: 'Create Document',
          value: 'create',
          description: 'Create a new document',
          action: 'Create document',
          fields: [
            {
              id: 'title',
              name: 'title',
              displayName: 'Title',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'folder_id',
              name: 'folderId',
              displayName: 'Drive Folder ID',
              type: 'string',
              required: false,
              description: 'Create in specific folder',
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Initial Content',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 5,
              },
            },
          ],
        },
        {
          id: 'get_document',
          name: 'Get Document',
          value: 'get',
          description: 'Get a document',
          action: 'Get document',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'suggestions_view_mode',
              name: 'suggestionsViewMode',
              displayName: 'Suggestions View Mode',
              type: 'options',
              required: false,
              options: [
                { name: 'Default for Current Access', value: 'DEFAULT_FOR_CURRENT_ACCESS' },
                { name: 'Suggestions Inline', value: 'SUGGESTIONS_INLINE' },
                { name: 'Preview Suggestions Accepted', value: 'PREVIEW_SUGGESTIONS_ACCEPTED' },
                { name: 'Preview Without Suggestions', value: 'PREVIEW_WITHOUT_SUGGESTIONS' },
              ],
            },
          ],
        },
        {
          id: 'get_as_text',
          name: 'Get Document as Text',
          value: 'getAsText',
          description: 'Get document content as plain text',
          action: 'Get document as text',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_as_markdown',
          name: 'Get Document as Markdown',
          value: 'getAsMarkdown',
          description: 'Get document content as Markdown',
          action: 'Get document as Markdown',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // CONTENT RESOURCE
    // ============================================
    {
      id: 'content',
      name: 'Content',
      value: 'content',
      description: 'Document content operations',
      operations: [
        {
          id: 'insert_text',
          name: 'Insert Text',
          value: 'insertText',
          description: 'Insert text at a location',
          action: 'Insert text',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Text',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 3,
              },
            },
            {
              id: 'location',
              name: 'location',
              displayName: 'Location',
              type: 'options',
              required: true,
              options: [
                { name: 'At Index', value: 'index' },
                { name: 'At End of Segment', value: 'endOfSegment' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'index',
              name: 'index',
              displayName: 'Index',
              type: 'number',
              required: false,
              description: 'Required if Location is At Index',
            },
            {
              id: 'segment_id',
              name: 'segmentId',
              displayName: 'Segment ID',
              type: 'string',
              required: false,
              description: 'Header/Footer/Body ID',
            },
          ],
        },
        {
          id: 'delete_content',
          name: 'Delete Content',
          value: 'deleteContent',
          description: 'Delete content from document',
          action: 'Delete content',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'start_index',
              name: 'startIndex',
              displayName: 'Start Index',
              type: 'number',
              required: true,
            },
            {
              id: 'end_index',
              name: 'endIndex',
              displayName: 'End Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'segment_id',
              name: 'segmentId',
              displayName: 'Segment ID',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'replace_text',
          name: 'Replace All Text',
          value: 'replaceAllText',
          description: 'Replace all occurrences of text',
          action: 'Replace all text',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'find_text',
              name: 'findText',
              displayName: 'Find Text',
              type: 'string',
              required: true,
            },
            {
              id: 'replace_text',
              name: 'replaceText',
              displayName: 'Replace With',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'match_case',
              name: 'matchCase',
              displayName: 'Match Case',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'append_text',
          name: 'Append Text',
          value: 'appendText',
          description: 'Append text to end of document',
          action: 'Append text',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Text',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 3,
              },
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // PARAGRAPH RESOURCE
    // ============================================
    {
      id: 'paragraph',
      name: 'Paragraph',
      value: 'paragraph',
      description: 'Paragraph operations',
      operations: [
        {
          id: 'insert_paragraph',
          name: 'Insert Paragraph',
          value: 'insert',
          description: 'Insert a paragraph',
          action: 'Insert paragraph',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Paragraph Text',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 3,
              },
            },
            {
              id: 'index',
              name: 'index',
              displayName: 'Insert at Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'heading_style',
              name: 'headingStyle',
              displayName: 'Heading Style',
              type: 'options',
              required: false,
              options: [
                { name: 'Normal', value: 'NORMAL_TEXT' },
                { name: 'Title', value: 'TITLE' },
                { name: 'Subtitle', value: 'SUBTITLE' },
                { name: 'Heading 1', value: 'HEADING_1' },
                { name: 'Heading 2', value: 'HEADING_2' },
                { name: 'Heading 3', value: 'HEADING_3' },
                { name: 'Heading 4', value: 'HEADING_4' },
                { name: 'Heading 5', value: 'HEADING_5' },
                { name: 'Heading 6', value: 'HEADING_6' },
              ],
            },
            {
              id: 'alignment',
              name: 'alignment',
              displayName: 'Alignment',
              type: 'options',
              required: false,
              options: [
                { name: 'Start', value: 'START' },
                { name: 'Center', value: 'CENTER' },
                { name: 'End', value: 'END' },
                { name: 'Justified', value: 'JUSTIFIED' },
              ],
            },
          ],
        },
        {
          id: 'update_paragraph_style',
          name: 'Update Paragraph Style',
          value: 'updateStyle',
          description: 'Update paragraph styling',
          action: 'Update paragraph style',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'start_index',
              name: 'startIndex',
              displayName: 'Start Index',
              type: 'number',
              required: true,
            },
            {
              id: 'end_index',
              name: 'endIndex',
              displayName: 'End Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'heading_style',
              name: 'headingStyle',
              displayName: 'Heading Style',
              type: 'options',
              required: false,
              options: [
                { name: 'Normal', value: 'NORMAL_TEXT' },
                { name: 'Title', value: 'TITLE' },
                { name: 'Subtitle', value: 'SUBTITLE' },
                { name: 'Heading 1', value: 'HEADING_1' },
                { name: 'Heading 2', value: 'HEADING_2' },
                { name: 'Heading 3', value: 'HEADING_3' },
                { name: 'Heading 4', value: 'HEADING_4' },
                { name: 'Heading 5', value: 'HEADING_5' },
                { name: 'Heading 6', value: 'HEADING_6' },
              ],
            },
            {
              id: 'alignment',
              name: 'alignment',
              displayName: 'Alignment',
              type: 'options',
              required: false,
              options: [
                { name: 'Start', value: 'START' },
                { name: 'Center', value: 'CENTER' },
                { name: 'End', value: 'END' },
                { name: 'Justified', value: 'JUSTIFIED' },
              ],
            },
            {
              id: 'line_spacing',
              name: 'lineSpacing',
              displayName: 'Line Spacing',
              type: 'number',
              required: false,
            },
            {
              id: 'space_above',
              name: 'spaceAbove',
              displayName: 'Space Above (pt)',
              type: 'number',
              required: false,
            },
            {
              id: 'space_below',
              name: 'spaceBelow',
              displayName: 'Space Below (pt)',
              type: 'number',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // TEXT STYLE RESOURCE
    // ============================================
    {
      id: 'textStyle',
      name: 'Text Style',
      value: 'textStyle',
      description: 'Text styling operations',
      operations: [
        {
          id: 'update_text_style',
          name: 'Update Text Style',
          value: 'update',
          description: 'Update text styling in a range',
          action: 'Update text style',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'start_index',
              name: 'startIndex',
              displayName: 'Start Index',
              type: 'number',
              required: true,
            },
            {
              id: 'end_index',
              name: 'endIndex',
              displayName: 'End Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'bold',
              name: 'bold',
              displayName: 'Bold',
              type: 'boolean',
              required: false,
            },
            {
              id: 'italic',
              name: 'italic',
              displayName: 'Italic',
              type: 'boolean',
              required: false,
            },
            {
              id: 'underline',
              name: 'underline',
              displayName: 'Underline',
              type: 'boolean',
              required: false,
            },
            {
              id: 'strikethrough',
              name: 'strikethrough',
              displayName: 'Strikethrough',
              type: 'boolean',
              required: false,
            },
            {
              id: 'font_size',
              name: 'fontSize',
              displayName: 'Font Size (pt)',
              type: 'number',
              required: false,
            },
            {
              id: 'font_family',
              name: 'fontFamily',
              displayName: 'Font Family',
              type: 'string',
              required: false,
            },
            {
              id: 'foreground_color',
              name: 'foregroundColor',
              displayName: 'Text Color (hex)',
              type: 'string',
              required: false,
            },
            {
              id: 'background_color',
              name: 'backgroundColor',
              displayName: 'Highlight Color (hex)',
              type: 'string',
              required: false,
            },
            {
              id: 'link_url',
              name: 'linkUrl',
              displayName: 'Link URL',
              type: 'string',
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
      description: 'Table operations',
      operations: [
        {
          id: 'insert_table',
          name: 'Insert Table',
          value: 'insert',
          description: 'Insert a table',
          action: 'Insert table',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'rows',
              name: 'rows',
              displayName: 'Rows',
              type: 'number',
              required: true,
            },
            {
              id: 'columns',
              name: 'columns',
              displayName: 'Columns',
              type: 'number',
              required: true,
            },
            {
              id: 'index',
              name: 'index',
              displayName: 'Insert at Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'insert_table_row',
          name: 'Insert Table Row',
          value: 'insertRow',
          description: 'Insert a row in a table',
          action: 'Insert table row',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_start_index',
              name: 'tableStartIndex',
              displayName: 'Table Start Index',
              type: 'number',
              required: true,
            },
            {
              id: 'row_index',
              name: 'rowIndex',
              displayName: 'Row Index',
              type: 'number',
              required: true,
            },
            {
              id: 'insert_below',
              name: 'insertBelow',
              displayName: 'Insert Below',
              type: 'boolean',
              required: true,
              default: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'insert_table_column',
          name: 'Insert Table Column',
          value: 'insertColumn',
          description: 'Insert a column in a table',
          action: 'Insert table column',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_start_index',
              name: 'tableStartIndex',
              displayName: 'Table Start Index',
              type: 'number',
              required: true,
            },
            {
              id: 'column_index',
              name: 'columnIndex',
              displayName: 'Column Index',
              type: 'number',
              required: true,
            },
            {
              id: 'insert_right',
              name: 'insertRight',
              displayName: 'Insert Right',
              type: 'boolean',
              required: true,
              default: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_table_row',
          name: 'Delete Table Row',
          value: 'deleteRow',
          description: 'Delete a row from a table',
          action: 'Delete table row',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_start_index',
              name: 'tableStartIndex',
              displayName: 'Table Start Index',
              type: 'number',
              required: true,
            },
            {
              id: 'row_index',
              name: 'rowIndex',
              displayName: 'Row Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_table_column',
          name: 'Delete Table Column',
          value: 'deleteColumn',
          description: 'Delete a column from a table',
          action: 'Delete table column',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'table_start_index',
              name: 'tableStartIndex',
              displayName: 'Table Start Index',
              type: 'number',
              required: true,
            },
            {
              id: 'column_index',
              name: 'columnIndex',
              displayName: 'Column Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // IMAGE RESOURCE
    // ============================================
    {
      id: 'image',
      name: 'Image',
      value: 'image',
      description: 'Image operations',
      operations: [
        {
          id: 'insert_image',
          name: 'Insert Image',
          value: 'insert',
          description: 'Insert an image',
          action: 'Insert image',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'image_uri',
              name: 'imageUri',
              displayName: 'Image URL',
              type: 'string',
              required: true,
            },
            {
              id: 'index',
              name: 'index',
              displayName: 'Insert at Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'width',
              name: 'width',
              displayName: 'Width (pt)',
              type: 'number',
              required: false,
            },
            {
              id: 'height',
              name: 'height',
              displayName: 'Height (pt)',
              type: 'number',
              required: false,
            },
          ],
        },
        {
          id: 'replace_image',
          name: 'Replace Image',
          value: 'replace',
          description: 'Replace an existing image',
          action: 'Replace image',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'image_object_id',
              name: 'imageObjectId',
              displayName: 'Image Object ID',
              type: 'string',
              required: true,
            },
            {
              id: 'image_uri',
              name: 'imageUri',
              displayName: 'New Image URL',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'image_replace_method',
              name: 'imageReplaceMethod',
              displayName: 'Replace Method',
              type: 'options',
              required: false,
              default: 'CENTER_CROP',
              options: [
                { name: 'Center Crop', value: 'CENTER_CROP' },
              ],
            },
          ],
        },
      ],
    },
    
    // ============================================
    // LIST RESOURCE
    // ============================================
    {
      id: 'list',
      name: 'List',
      value: 'list',
      description: 'List operations',
      operations: [
        {
          id: 'create_bullets',
          name: 'Create Bulleted List',
          value: 'createBullets',
          description: 'Convert text to bulleted list',
          action: 'Create bulleted list',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'start_index',
              name: 'startIndex',
              displayName: 'Start Index',
              type: 'number',
              required: true,
            },
            {
              id: 'end_index',
              name: 'endIndex',
              displayName: 'End Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'bullet_preset',
              name: 'bulletPreset',
              displayName: 'Bullet Style',
              type: 'options',
              required: false,
              default: 'BULLET_DISC_CIRCLE_SQUARE',
              options: [
                { name: 'Disc → Circle → Square', value: 'BULLET_DISC_CIRCLE_SQUARE' },
                { name: 'Diamondx → Arrow → Bullet', value: 'BULLET_DIAMONDX_ARROW3D_SQUARE' },
                { name: 'Checkbox', value: 'BULLET_CHECKBOX' },
                { name: 'Arrow', value: 'BULLET_ARROW_DIAMOND_DISC' },
                { name: 'Star', value: 'BULLET_STAR_CIRCLE_SQUARE' },
                { name: 'Arrow 3D', value: 'BULLET_ARROW3D_CIRCLE_SQUARE' },
                { name: 'Lefttriangle', value: 'BULLET_LEFTTRIANGLE_DIAMOND_DISC' },
                { name: 'Diamondx', value: 'BULLET_DIAMONDX_HOLLOWDIAMOND_SQUARE' },
                { name: 'Diamond', value: 'BULLET_DIAMOND_CIRCLE_SQUARE' },
                { name: 'Numbers', value: 'NUMBERED_DECIMAL_ALPHA_ROMAN' },
                { name: 'Numbers (Nested)', value: 'NUMBERED_DECIMAL_NESTED' },
                { name: 'Uppercase Letters', value: 'NUMBERED_UPPERALPHA_ALPHA_ROMAN' },
                { name: 'Uppercase Roman', value: 'NUMBERED_UPPERROMAN_UPPERALPHA_DECIMAL' },
                { name: 'Lowercase Letters', value: 'NUMBERED_ZERODECIMAL_ALPHA_ROMAN' },
              ],
            },
          ],
        },
        {
          id: 'delete_bullets',
          name: 'Delete List',
          value: 'deleteBullets',
          description: 'Remove list formatting',
          action: 'Delete list',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'start_index',
              name: 'startIndex',
              displayName: 'Start Index',
              type: 'number',
              required: true,
            },
            {
              id: 'end_index',
              name: 'endIndex',
              displayName: 'End Index',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // HEADER/FOOTER RESOURCE
    // ============================================
    {
      id: 'headerFooter',
      name: 'Header/Footer',
      value: 'headerFooter',
      description: 'Header and footer operations',
      operations: [
        {
          id: 'create_header',
          name: 'Create Header',
          value: 'createHeader',
          description: 'Create a header',
          action: 'Create header',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'section_index',
              name: 'sectionIndex',
              displayName: 'Section Index',
              type: 'number',
              required: false,
              default: 0,
            },
            {
              id: 'type',
              name: 'type',
              displayName: 'Header Type',
              type: 'options',
              required: false,
              default: 'DEFAULT',
              options: [
                { name: 'Default', value: 'DEFAULT' },
                { name: 'First Page', value: 'FIRST_PAGE_HEADER' },
              ],
            },
          ],
        },
        {
          id: 'create_footer',
          name: 'Create Footer',
          value: 'createFooter',
          description: 'Create a footer',
          action: 'Create footer',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'section_index',
              name: 'sectionIndex',
              displayName: 'Section Index',
              type: 'number',
              required: false,
              default: 0,
            },
            {
              id: 'type',
              name: 'type',
              displayName: 'Footer Type',
              type: 'options',
              required: false,
              default: 'DEFAULT',
              options: [
                { name: 'Default', value: 'DEFAULT' },
                { name: 'First Page', value: 'FIRST_PAGE_FOOTER' },
              ],
            },
          ],
        },
        {
          id: 'delete_header',
          name: 'Delete Header',
          value: 'deleteHeader',
          description: 'Delete a header',
          action: 'Delete header',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'header_id',
              name: 'headerId',
              displayName: 'Header ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_footer',
          name: 'Delete Footer',
          value: 'deleteFooter',
          description: 'Delete a footer',
          action: 'Delete footer',
          fields: [
            {
              id: 'document_id',
              name: 'documentId',
              displayName: 'Document ID',
              type: 'string',
              required: true,
            },
            {
              id: 'footer_id',
              name: 'footerId',
              displayName: 'Footer ID',
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
