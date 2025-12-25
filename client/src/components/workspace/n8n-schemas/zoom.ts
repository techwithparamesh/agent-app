/**
 * Zoom n8n-style Schema
 * 
 * Comprehensive Zoom API operations
 */

import { N8nAppSchema } from './types';

export const zoomSchema: N8nAppSchema = {
  id: 'zoom',
  name: 'Zoom',
  description: 'Zoom video conferencing and meetings',
  version: '1.0.0',
  color: '#2D8CFF',
  icon: 'zoom',
  group: ['communication', 'video'],
  
  credentials: [
    {
      name: 'zoomOAuth2',
      displayName: 'Zoom OAuth2',
      required: true,
      type: 'oauth2',
    },
  ],
  
  resources: [
    // ============================================
    // MEETING RESOURCE
    // ============================================
    {
      id: 'meeting',
      name: 'Meeting',
      value: 'meeting',
      description: 'Create and manage meetings',
      operations: [
        {
          id: 'create_meeting',
          name: 'Create Meeting',
          value: 'create',
          description: 'Create a new meeting',
          action: 'Create a new Zoom meeting',
          fields: [
            {
              id: 'topic',
              name: 'topic',
              displayName: 'Topic',
              type: 'string',
              required: true,
              description: 'Meeting topic',
              placeholder: 'Team Sync Meeting',
            },
          ],
          optionalFields: [
            {
              id: 'type',
              name: 'type',
              displayName: 'Meeting Type',
              type: 'options',
              required: false,
              default: '2',
              options: [
                { name: 'Instant Meeting', value: '1' },
                { name: 'Scheduled Meeting', value: '2' },
                { name: 'Recurring Meeting (No Fixed Time)', value: '3' },
                { name: 'Recurring Meeting (Fixed Time)', value: '8' },
              ],
            },
            {
              id: 'start_time',
              name: 'startTime',
              displayName: 'Start Time',
              type: 'dateTime',
              required: false,
              description: 'Meeting start time',
            },
            {
              id: 'duration',
              name: 'duration',
              displayName: 'Duration (minutes)',
              type: 'number',
              required: false,
              default: 60,
              description: 'Meeting duration in minutes',
            },
            {
              id: 'timezone',
              name: 'timezone',
              displayName: 'Timezone',
              type: 'string',
              required: false,
              placeholder: 'America/Los_Angeles',
            },
            {
              id: 'password',
              name: 'password',
              displayName: 'Password',
              type: 'string',
              required: false,
              description: 'Meeting password (max 10 characters)',
            },
            {
              id: 'agenda',
              name: 'agenda',
              displayName: 'Agenda',
              type: 'text',
              required: false,
              description: 'Meeting description/agenda',
            },
            {
              id: 'host_video',
              name: 'hostVideo',
              displayName: 'Host Video',
              type: 'boolean',
              required: false,
              default: true,
              description: 'Start video when host joins',
            },
            {
              id: 'participant_video',
              name: 'participantVideo',
              displayName: 'Participant Video',
              type: 'boolean',
              required: false,
              default: true,
              description: 'Start video when participants join',
            },
            {
              id: 'join_before_host',
              name: 'joinBeforeHost',
              displayName: 'Join Before Host',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'mute_upon_entry',
              name: 'muteUponEntry',
              displayName: 'Mute Upon Entry',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'waiting_room',
              name: 'waitingRoom',
              displayName: 'Enable Waiting Room',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'auto_recording',
              name: 'autoRecording',
              displayName: 'Auto Recording',
              type: 'options',
              required: false,
              default: 'none',
              options: [
                { name: 'None', value: 'none' },
                { name: 'Local', value: 'local' },
                { name: 'Cloud', value: 'cloud' },
              ],
            },
          ],
        },
        {
          id: 'get_meeting',
          name: 'Get Meeting',
          value: 'get',
          description: 'Get meeting details',
          action: 'Retrieve meeting information',
          fields: [
            {
              id: 'meeting_id',
              name: 'meetingId',
              displayName: 'Meeting ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'show_previous_occurrences',
              name: 'showPreviousOccurrences',
              displayName: 'Show Previous Occurrences',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
        {
          id: 'get_meetings',
          name: 'Get Meetings',
          value: 'getMany',
          description: 'Get all meetings',
          action: 'List all meetings for a user',
          fields: [],
          optionalFields: [
            {
              id: 'type',
              name: 'type',
              displayName: 'Type',
              type: 'options',
              required: false,
              default: 'scheduled',
              options: [
                { name: 'Scheduled', value: 'scheduled' },
                { name: 'Live', value: 'live' },
                { name: 'Upcoming', value: 'upcoming' },
              ],
            },
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 30,
              typeOptions: {
                minValue: 1,
                maxValue: 300,
              },
            },
          ],
        },
        {
          id: 'update_meeting',
          name: 'Update Meeting',
          value: 'update',
          description: 'Update a meeting',
          action: 'Update meeting details',
          fields: [
            {
              id: 'meeting_id',
              name: 'meetingId',
              displayName: 'Meeting ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'topic',
              name: 'topic',
              displayName: 'Topic',
              type: 'string',
              required: false,
            },
            {
              id: 'start_time',
              name: 'startTime',
              displayName: 'Start Time',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'duration',
              name: 'duration',
              displayName: 'Duration (minutes)',
              type: 'number',
              required: false,
            },
            {
              id: 'agenda',
              name: 'agenda',
              displayName: 'Agenda',
              type: 'text',
              required: false,
            },
          ],
        },
        {
          id: 'delete_meeting',
          name: 'Delete Meeting',
          value: 'delete',
          description: 'Delete a meeting',
          action: 'Delete a scheduled meeting',
          fields: [
            {
              id: 'meeting_id',
              name: 'meetingId',
              displayName: 'Meeting ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'schedule_for_reminder',
              name: 'scheduleForReminder',
              displayName: 'Notify Host',
              type: 'boolean',
              required: false,
              default: true,
            },
          ],
        },
        {
          id: 'end_meeting',
          name: 'End Meeting',
          value: 'end',
          description: 'End a live meeting',
          action: 'End a meeting in progress',
          fields: [
            {
              id: 'meeting_id',
              name: 'meetingId',
              displayName: 'Meeting ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // REGISTRANT RESOURCE
    // ============================================
    {
      id: 'registrant',
      name: 'Registrant',
      value: 'registrant',
      description: 'Manage meeting registrants',
      operations: [
        {
          id: 'add_registrant',
          name: 'Add Registrant',
          value: 'create',
          description: 'Register someone for a meeting',
          action: 'Add a registrant to a meeting',
          fields: [
            {
              id: 'meeting_id',
              name: 'meetingId',
              displayName: 'Meeting ID',
              type: 'string',
              required: true,
            },
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: true,
            },
            {
              id: 'first_name',
              name: 'firstName',
              displayName: 'First Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'last_name',
              name: 'lastName',
              displayName: 'Last Name',
              type: 'string',
              required: false,
            },
            {
              id: 'phone',
              name: 'phone',
              displayName: 'Phone',
              type: 'string',
              required: false,
            },
            {
              id: 'company',
              name: 'org',
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
          id: 'get_registrants',
          name: 'Get Registrants',
          value: 'getMany',
          description: 'Get meeting registrants',
          action: 'List all registrants for a meeting',
          fields: [
            {
              id: 'meeting_id',
              name: 'meetingId',
              displayName: 'Meeting ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              default: 'approved',
              options: [
                { name: 'Pending', value: 'pending' },
                { name: 'Approved', value: 'approved' },
                { name: 'Denied', value: 'denied' },
              ],
            },
          ],
        },
        {
          id: 'update_registrant_status',
          name: 'Update Registrant Status',
          value: 'updateStatus',
          description: 'Approve or deny registrants',
          action: 'Update registrant status',
          fields: [
            {
              id: 'meeting_id',
              name: 'meetingId',
              displayName: 'Meeting ID',
              type: 'string',
              required: true,
            },
            {
              id: 'action',
              name: 'action',
              displayName: 'Action',
              type: 'options',
              required: true,
              options: [
                { name: 'Approve', value: 'approve' },
                { name: 'Deny', value: 'deny' },
                { name: 'Cancel', value: 'cancel' },
              ],
            },
            {
              id: 'registrants',
              name: 'registrants',
              displayName: 'Registrant Emails',
              type: 'string',
              required: true,
              description: 'Comma-separated list of registrant emails',
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // WEBINAR RESOURCE
    // ============================================
    {
      id: 'webinar',
      name: 'Webinar',
      value: 'webinar',
      description: 'Create and manage webinars',
      operations: [
        {
          id: 'create_webinar',
          name: 'Create Webinar',
          value: 'create',
          description: 'Create a new webinar',
          action: 'Create a new Zoom webinar',
          fields: [
            {
              id: 'topic',
              name: 'topic',
              displayName: 'Topic',
              type: 'string',
              required: true,
            },
            {
              id: 'start_time',
              name: 'startTime',
              displayName: 'Start Time',
              type: 'dateTime',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'duration',
              name: 'duration',
              displayName: 'Duration (minutes)',
              type: 'number',
              required: false,
              default: 60,
            },
            {
              id: 'agenda',
              name: 'agenda',
              displayName: 'Agenda',
              type: 'text',
              required: false,
            },
            {
              id: 'password',
              name: 'password',
              displayName: 'Password',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_webinars',
          name: 'Get Webinars',
          value: 'getMany',
          description: 'Get all webinars',
          action: 'List all webinars',
          fields: [],
          optionalFields: [
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 30,
            },
          ],
        },
        {
          id: 'get_webinar',
          name: 'Get Webinar',
          value: 'get',
          description: 'Get webinar details',
          action: 'Retrieve webinar information',
          fields: [
            {
              id: 'webinar_id',
              name: 'webinarId',
              displayName: 'Webinar ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_webinar',
          name: 'Delete Webinar',
          value: 'delete',
          description: 'Delete a webinar',
          action: 'Delete a scheduled webinar',
          fields: [
            {
              id: 'webinar_id',
              name: 'webinarId',
              displayName: 'Webinar ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // RECORDING RESOURCE
    // ============================================
    {
      id: 'recording',
      name: 'Recording',
      value: 'recording',
      description: 'Manage meeting recordings',
      operations: [
        {
          id: 'get_recordings',
          name: 'Get Recordings',
          value: 'getMany',
          description: 'Get meeting recordings',
          action: 'List all cloud recordings',
          fields: [],
          optionalFields: [
            {
              id: 'from',
              name: 'from',
              displayName: 'From Date',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'to',
              name: 'to',
              displayName: 'To Date',
              type: 'dateTime',
              required: false,
            },
          ],
        },
        {
          id: 'get_meeting_recordings',
          name: 'Get Meeting Recordings',
          value: 'get',
          description: 'Get recordings for a meeting',
          action: 'Get all recordings for a specific meeting',
          fields: [
            {
              id: 'meeting_id',
              name: 'meetingId',
              displayName: 'Meeting ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'delete_recordings',
          name: 'Delete Recordings',
          value: 'delete',
          description: 'Delete meeting recordings',
          action: 'Delete all recordings for a meeting',
          fields: [
            {
              id: 'meeting_id',
              name: 'meetingId',
              displayName: 'Meeting ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'action',
              name: 'action',
              displayName: 'Action',
              type: 'options',
              required: false,
              default: 'trash',
              options: [
                { name: 'Move to Trash', value: 'trash' },
                { name: 'Delete Permanently', value: 'delete' },
              ],
            },
          ],
        },
      ],
    },
    
    // ============================================
    // USER RESOURCE
    // ============================================
    {
      id: 'user',
      name: 'User',
      value: 'user',
      description: 'Manage Zoom users',
      operations: [
        {
          id: 'get_user',
          name: 'Get User',
          value: 'get',
          description: 'Get user information',
          action: 'Retrieve user details',
          fields: [
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID or Email',
              type: 'string',
              required: true,
              default: 'me',
              description: 'User ID, email, or "me" for current user',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_users',
          name: 'Get Users',
          value: 'getMany',
          description: 'Get all users',
          action: 'List all users in account',
          fields: [],
          optionalFields: [
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              default: 'active',
              options: [
                { name: 'Active', value: 'active' },
                { name: 'Inactive', value: 'inactive' },
                { name: 'Pending', value: 'pending' },
              ],
            },
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 30,
            },
          ],
        },
      ],
    },
  ],
};
