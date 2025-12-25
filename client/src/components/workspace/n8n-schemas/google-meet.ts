/**
 * Google Meet n8n-style Schema
 * 
 * Comprehensive Google Meet API operations
 */

import { N8nAppSchema } from './types';

export const googleMeetSchema: N8nAppSchema = {
  id: 'googleMeet',
  name: 'Google Meet',
  description: 'Google Meet video conferencing',
  version: '1.0.0',
  color: '#00897B',
  icon: 'google-meet',
  group: ['google', 'communication'],
  
  credentials: [
    {
      name: 'googleMeetOAuth2',
      displayName: 'Google Meet OAuth2',
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
      name: 'googleMeetServiceAccount',
      displayName: 'Google Meet Service Account',
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
    // SPACE RESOURCE
    // ============================================
    {
      id: 'space',
      name: 'Space',
      value: 'space',
      description: 'Meeting space operations',
      operations: [
        {
          id: 'create_space',
          name: 'Create Space',
          value: 'create',
          description: 'Create a meeting space',
          action: 'Create space',
          fields: [],
          optionalFields: [
            {
              id: 'config_access_type',
              name: 'configAccessType',
              displayName: 'Access Type',
              type: 'options',
              required: false,
              default: 'OPEN',
              options: [
                { name: 'Open', value: 'OPEN' },
                { name: 'Trusted', value: 'TRUSTED' },
                { name: 'Restricted', value: 'RESTRICTED' },
              ],
            },
            {
              id: 'config_entry_point_access',
              name: 'configEntryPointAccess',
              displayName: 'Entry Point Access',
              type: 'options',
              required: false,
              default: 'ALL',
              options: [
                { name: 'All', value: 'ALL' },
                { name: 'Creator App Only', value: 'CREATOR_APP_ONLY' },
              ],
            },
          ],
        },
        {
          id: 'get_space',
          name: 'Get Space',
          value: 'get',
          description: 'Get a meeting space',
          action: 'Get space',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Space Name',
              type: 'string',
              required: true,
              description: 'Format: spaces/{space}',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'update_space',
          name: 'Update Space',
          value: 'update',
          description: 'Update a meeting space',
          action: 'Update space',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Space Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'config_access_type',
              name: 'configAccessType',
              displayName: 'Access Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Open', value: 'OPEN' },
                { name: 'Trusted', value: 'TRUSTED' },
                { name: 'Restricted', value: 'RESTRICTED' },
              ],
            },
            {
              id: 'config_entry_point_access',
              name: 'configEntryPointAccess',
              displayName: 'Entry Point Access',
              type: 'options',
              required: false,
              options: [
                { name: 'All', value: 'ALL' },
                { name: 'Creator App Only', value: 'CREATOR_APP_ONLY' },
              ],
            },
          ],
        },
        {
          id: 'end_active_conference',
          name: 'End Active Conference',
          value: 'endActiveConference',
          description: 'End an active conference',
          action: 'End active conference',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Space Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // CONFERENCE RECORD RESOURCE
    // ============================================
    {
      id: 'conferenceRecord',
      name: 'Conference Record',
      value: 'conferenceRecord',
      description: 'Conference record operations',
      operations: [
        {
          id: 'get_conference_record',
          name: 'Get Conference Record',
          value: 'get',
          description: 'Get a conference record',
          action: 'Get conference record',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Conference Record Name',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{conferenceRecord}',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_conference_records',
          name: 'List Conference Records',
          value: 'getMany',
          description: 'List conference records',
          action: 'List conference records',
          fields: [],
          optionalFields: [
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
              type: 'string',
              required: false,
              description: 'Filter expression',
            },
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 25,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // PARTICIPANT RESOURCE
    // ============================================
    {
      id: 'participant',
      name: 'Participant',
      value: 'participant',
      description: 'Participant operations',
      operations: [
        {
          id: 'get_participant',
          name: 'Get Participant',
          value: 'get',
          description: 'Get a participant',
          action: 'Get participant',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Participant Name',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}/participants/{participant}',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_participants',
          name: 'List Participants',
          value: 'getMany',
          description: 'List participants',
          action: 'List participants',
          fields: [
            {
              id: 'parent',
              name: 'parent',
              displayName: 'Conference Record',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}',
            },
          ],
          optionalFields: [
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
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
      ],
    },
    
    // ============================================
    // PARTICIPANT SESSION RESOURCE
    // ============================================
    {
      id: 'participantSession',
      name: 'Participant Session',
      value: 'participantSession',
      description: 'Participant session operations',
      operations: [
        {
          id: 'get_session',
          name: 'Get Participant Session',
          value: 'get',
          description: 'Get a participant session',
          action: 'Get participant session',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Session Name',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}/participants/{participant}/participantSessions/{session}',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_sessions',
          name: 'List Participant Sessions',
          value: 'getMany',
          description: 'List participant sessions',
          action: 'List participant sessions',
          fields: [
            {
              id: 'parent',
              name: 'parent',
              displayName: 'Participant',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}/participants/{participant}',
            },
          ],
          optionalFields: [
            {
              id: 'filter',
              name: 'filter',
              displayName: 'Filter',
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
      ],
    },
    
    // ============================================
    // RECORDING RESOURCE
    // ============================================
    {
      id: 'recording',
      name: 'Recording',
      value: 'recording',
      description: 'Recording operations',
      operations: [
        {
          id: 'get_recording',
          name: 'Get Recording',
          value: 'get',
          description: 'Get a recording',
          action: 'Get recording',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Recording Name',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}/recordings/{recording}',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_recordings',
          name: 'List Recordings',
          value: 'getMany',
          description: 'List recordings',
          action: 'List recordings',
          fields: [
            {
              id: 'parent',
              name: 'parent',
              displayName: 'Conference Record',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}',
            },
          ],
          optionalFields: [
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 25,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // TRANSCRIPT RESOURCE
    // ============================================
    {
      id: 'transcript',
      name: 'Transcript',
      value: 'transcript',
      description: 'Transcript operations',
      operations: [
        {
          id: 'get_transcript',
          name: 'Get Transcript',
          value: 'get',
          description: 'Get a transcript',
          action: 'Get transcript',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Transcript Name',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}/transcripts/{transcript}',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_transcripts',
          name: 'List Transcripts',
          value: 'getMany',
          description: 'List transcripts',
          action: 'List transcripts',
          fields: [
            {
              id: 'parent',
              name: 'parent',
              displayName: 'Conference Record',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}',
            },
          ],
          optionalFields: [
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 25,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // TRANSCRIPT ENTRY RESOURCE
    // ============================================
    {
      id: 'transcriptEntry',
      name: 'Transcript Entry',
      value: 'transcriptEntry',
      description: 'Transcript entry operations',
      operations: [
        {
          id: 'get_entry',
          name: 'Get Transcript Entry',
          value: 'get',
          description: 'Get a transcript entry',
          action: 'Get transcript entry',
          fields: [
            {
              id: 'name',
              name: 'name',
              displayName: 'Entry Name',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}/transcripts/{transcript}/entries/{entry}',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_entries',
          name: 'List Transcript Entries',
          value: 'getMany',
          description: 'List transcript entries',
          action: 'List transcript entries',
          fields: [
            {
              id: 'parent',
              name: 'parent',
              displayName: 'Transcript',
              type: 'string',
              required: true,
              description: 'Format: conferenceRecords/{record}/transcripts/{transcript}',
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
      ],
    },
  ],
};
