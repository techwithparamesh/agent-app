/**
 * Microsoft Outlook n8n-style Schema
 * 
 * Comprehensive Microsoft Outlook/Office 365 Mail API operations
 */

import { N8nAppSchema } from './types';

export const outlookSchema: N8nAppSchema = {
  id: 'outlook',
  name: 'Microsoft Outlook',
  description: 'Microsoft Outlook email and calendar',
  version: '1.0.0',
  color: '#0078D4',
  icon: 'outlook',
  group: ['email', 'productivity'],
  
  credentials: [
    {
      name: 'microsoftOAuth2',
      displayName: 'Microsoft OAuth2',
      required: true,
      type: 'oauth2',
    },
  ],
  
  resources: [
    // ============================================
    // MESSAGE RESOURCE
    // ============================================
    {
      id: 'message',
      name: 'Message',
      value: 'message',
      description: 'Email messages',
      operations: [
        {
          id: 'send_message',
          name: 'Send Message',
          value: 'send',
          description: 'Send an email',
          action: 'Send an email message',
          fields: [
            {
              id: 'to',
              name: 'toRecipients',
              displayName: 'To',
              type: 'string',
              required: true,
              description: 'Comma-separated email addresses',
            },
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'body',
              name: 'body',
              displayName: 'Body',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'body_type',
              name: 'bodyContentType',
              displayName: 'Body Content Type',
              type: 'options',
              required: false,
              default: 'html',
              options: [
                { name: 'HTML', value: 'html' },
                { name: 'Text', value: 'text' },
              ],
            },
            {
              id: 'cc',
              name: 'ccRecipients',
              displayName: 'CC',
              type: 'string',
              required: false,
            },
            {
              id: 'bcc',
              name: 'bccRecipients',
              displayName: 'BCC',
              type: 'string',
              required: false,
            },
            {
              id: 'reply_to',
              name: 'replyTo',
              displayName: 'Reply To',
              type: 'string',
              required: false,
            },
            {
              id: 'importance',
              name: 'importance',
              displayName: 'Importance',
              type: 'options',
              required: false,
              default: 'normal',
              options: [
                { name: 'Low', value: 'low' },
                { name: 'Normal', value: 'normal' },
                { name: 'High', value: 'high' },
              ],
            },
            {
              id: 'attachments',
              name: 'attachments',
              displayName: 'Attachments (JSON)',
              type: 'json',
              required: false,
            },
            {
              id: 'save_to_sent',
              name: 'saveToSentItems',
              displayName: 'Save to Sent Items',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'get_message',
          name: 'Get Message',
          value: 'get',
          description: 'Get a message by ID',
          action: 'Retrieve an email message',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'include_body',
              name: 'includeBody',
              displayName: 'Include Body',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'get_messages',
          name: 'Get Messages',
          value: 'getMany',
          description: 'Get messages from a folder',
          action: 'List email messages',
          fields: [],
          optionalFields: [
            {
              id: 'folder',
              name: 'folderId',
              displayName: 'Folder',
              type: 'options',
              required: false,
              default: 'inbox',
              options: [
                { name: 'Inbox', value: 'inbox' },
                { name: 'Sent Items', value: 'sentitems' },
                { name: 'Drafts', value: 'drafts' },
                { name: 'Deleted Items', value: 'deleteditems' },
                { name: 'Archive', value: 'archive' },
                { name: 'Junk Email', value: 'junkemail' },
              ],
            },
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter (OData)',
              type: 'string',
              required: false,
              placeholder: "isRead eq false",
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 10,
            },
            {
              id: 'search',
              name: 'search',
              displayName: 'Search',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'reply_message',
          name: 'Reply to Message',
          value: 'reply',
          description: 'Reply to an email',
          action: 'Reply to an email message',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
            {
              id: 'comment',
              name: 'comment',
              displayName: 'Reply Body',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 5,
              },
            },
          ],
          optionalFields: [
            {
              id: 'reply_all',
              name: 'replyAll',
              displayName: 'Reply All',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'forward_message',
          name: 'Forward Message',
          value: 'forward',
          description: 'Forward an email',
          action: 'Forward an email message',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
            {
              id: 'to',
              name: 'toRecipients',
              displayName: 'To',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'comment',
              name: 'comment',
              displayName: 'Comment',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'move_message',
          name: 'Move Message',
          value: 'move',
          description: 'Move to another folder',
          action: 'Move an email to a folder',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
            {
              id: 'destination_folder',
              name: 'destinationId',
              displayName: 'Destination Folder',
              type: 'options',
              required: true,
              options: [
                { name: 'Inbox', value: 'inbox' },
                { name: 'Sent Items', value: 'sentitems' },
                { name: 'Drafts', value: 'drafts' },
                { name: 'Deleted Items', value: 'deleteditems' },
                { name: 'Archive', value: 'archive' },
              ],
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_message',
          name: 'Delete Message',
          value: 'delete',
          description: 'Delete a message',
          action: 'Delete an email message',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'mark_as_read',
          name: 'Mark as Read',
          value: 'markAsRead',
          description: 'Mark message as read',
          action: 'Mark email as read',
          fields: [
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // DRAFT RESOURCE
    // ============================================
    {
      id: 'draft',
      name: 'Draft',
      value: 'draft',
      description: 'Email drafts',
      operations: [
        {
          id: 'create_draft',
          name: 'Create Draft',
          value: 'create',
          description: 'Create a draft email',
          action: 'Create an email draft',
          fields: [
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'to',
              name: 'toRecipients',
              displayName: 'To',
              type: 'string',
              required: false,
            },
            {
              id: 'body',
              name: 'body',
              displayName: 'Body',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 5,
              },
            },
            {
              id: 'cc',
              name: 'ccRecipients',
              displayName: 'CC',
              type: 'string',
              required: false,
            },
            {
              id: 'bcc',
              name: 'bccRecipients',
              displayName: 'BCC',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'send_draft',
          name: 'Send Draft',
          value: 'send',
          description: 'Send a draft',
          action: 'Send an email draft',
          fields: [
            {
              id: 'draft_id',
              name: 'draftId',
              displayName: 'Draft ID',
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
      description: 'Mail folders',
      operations: [
        {
          id: 'get_folders',
          name: 'Get Folders',
          value: 'getMany',
          description: 'Get all mail folders',
          action: 'List all mail folders',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'create_folder',
          name: 'Create Folder',
          value: 'create',
          description: 'Create a new folder',
          action: 'Create a mail folder',
          fields: [
            {
              id: 'display_name',
              name: 'displayName',
              displayName: 'Folder Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'parent_folder',
              name: 'parentFolderId',
              displayName: 'Parent Folder',
              type: 'string',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // CALENDAR EVENT RESOURCE
    // ============================================
    {
      id: 'event',
      name: 'Calendar Event',
      value: 'event',
      description: 'Calendar events',
      operations: [
        {
          id: 'create_event',
          name: 'Create Event',
          value: 'create',
          description: 'Create a calendar event',
          action: 'Create a new calendar event',
          fields: [
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: true,
            },
            {
              id: 'start',
              name: 'start',
              displayName: 'Start Time',
              type: 'dateTime',
              required: true,
            },
            {
              id: 'end',
              name: 'end',
              displayName: 'End Time',
              type: 'dateTime',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'body',
              name: 'body',
              displayName: 'Description',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 3,
              },
            },
            {
              id: 'location',
              name: 'location',
              displayName: 'Location',
              type: 'string',
              required: false,
            },
            {
              id: 'attendees',
              name: 'attendees',
              displayName: 'Attendees',
              type: 'string',
              required: false,
              description: 'Comma-separated email addresses',
            },
            {
              id: 'is_online_meeting',
              name: 'isOnlineMeeting',
              displayName: 'Online Meeting',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'online_meeting_provider',
              name: 'onlineMeetingProvider',
              displayName: 'Online Meeting Provider',
              type: 'options',
              required: false,
              options: [
                { name: 'Teams for Business', value: 'teamsForBusiness' },
                { name: 'Skype for Business', value: 'skypeForBusiness' },
                { name: 'Skype for Consumer', value: 'skypeForConsumer' },
              ],
              displayOptions: {
                show: {
                  isOnlineMeeting: [true],
                },
              },
            },
            {
              id: 'reminder',
              name: 'reminderMinutesBeforeStart',
              displayName: 'Reminder (minutes)',
              type: 'number',
              required: false,
              default: 15,
            },
            {
              id: 'is_all_day',
              name: 'isAllDay',
              displayName: 'All Day Event',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'show_as',
              name: 'showAs',
              displayName: 'Show As',
              type: 'options',
              required: false,
              default: 'busy',
              options: [
                { name: 'Free', value: 'free' },
                { name: 'Tentative', value: 'tentative' },
                { name: 'Busy', value: 'busy' },
                { name: 'Out of Office', value: 'oof' },
                { name: 'Working Elsewhere', value: 'workingElsewhere' },
              ],
            },
            {
              id: 'timezone',
              name: 'timeZone',
              displayName: 'Time Zone',
              type: 'string',
              required: false,
              placeholder: 'America/New_York',
            },
          ],
        },
        {
          id: 'get_events',
          name: 'Get Events',
          value: 'getMany',
          description: 'Get calendar events',
          action: 'List calendar events',
          fields: [],
          optionalFields: [
            {
              id: 'calendar_id',
              name: 'calendarId',
              displayName: 'Calendar ID',
              type: 'string',
              required: false,
            },
            {
              id: 'start_date',
              name: 'startDateTime',
              displayName: 'Start Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'end_date',
              name: 'endDateTime',
              displayName: 'End Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 10,
            },
          ],
        },
        {
          id: 'get_event',
          name: 'Get Event',
          value: 'get',
          description: 'Get a calendar event',
          action: 'Retrieve a calendar event',
          fields: [
            {
              id: 'event_id',
              name: 'eventId',
              displayName: 'Event ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'update_event',
          name: 'Update Event',
          value: 'update',
          description: 'Update a calendar event',
          action: 'Update a calendar event',
          fields: [
            {
              id: 'event_id',
              name: 'eventId',
              displayName: 'Event ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'subject',
              name: 'subject',
              displayName: 'Subject',
              type: 'string',
              required: false,
            },
            {
              id: 'start',
              name: 'start',
              displayName: 'Start Time',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'end',
              name: 'end',
              displayName: 'End Time',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'location',
              name: 'location',
              displayName: 'Location',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'delete_event',
          name: 'Delete Event',
          value: 'delete',
          description: 'Delete a calendar event',
          action: 'Delete a calendar event',
          fields: [
            {
              id: 'event_id',
              name: 'eventId',
              displayName: 'Event ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // CONTACT RESOURCE
    // ============================================
    {
      id: 'contact',
      name: 'Contact',
      value: 'contact',
      description: 'Outlook contacts',
      operations: [
        {
          id: 'create_contact',
          name: 'Create Contact',
          value: 'create',
          description: 'Create a contact',
          action: 'Create a new contact',
          fields: [
            {
              id: 'given_name',
              name: 'givenName',
              displayName: 'First Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'surname',
              name: 'surname',
              displayName: 'Last Name',
              type: 'string',
              required: false,
            },
            {
              id: 'email',
              name: 'emailAddresses',
              displayName: 'Email',
              type: 'string',
              required: false,
            },
            {
              id: 'phone',
              name: 'mobilePhone',
              displayName: 'Mobile Phone',
              type: 'string',
              required: false,
            },
            {
              id: 'business_phone',
              name: 'businessPhones',
              displayName: 'Business Phone',
              type: 'string',
              required: false,
            },
            {
              id: 'company',
              name: 'companyName',
              displayName: 'Company',
              type: 'string',
              required: false,
            },
            {
              id: 'job_title',
              name: 'jobTitle',
              displayName: 'Job Title',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_contacts',
          name: 'Get Contacts',
          value: 'getMany',
          description: 'Get all contacts',
          action: 'List all contacts',
          fields: [],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 10,
            },
          ],
        },
        {
          id: 'get_contact',
          name: 'Get Contact',
          value: 'get',
          description: 'Get a contact',
          action: 'Retrieve a contact',
          fields: [
            {
              id: 'contact_id',
              name: 'contactId',
              displayName: 'Contact ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_contact',
          name: 'Delete Contact',
          value: 'delete',
          description: 'Delete a contact',
          action: 'Delete a contact',
          fields: [
            {
              id: 'contact_id',
              name: 'contactId',
              displayName: 'Contact ID',
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
