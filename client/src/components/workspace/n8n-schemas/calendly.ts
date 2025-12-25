/**
 * Calendly n8n-style Schema
 * 
 * Comprehensive Calendly scheduling operations
 */

import { N8nAppSchema } from './types';

export const calendlySchema: N8nAppSchema = {
  id: 'calendly',
  name: 'Calendly',
  description: 'Calendly scheduling platform',
  version: '1.0.0',
  color: '#006BFF',
  icon: 'calendly',
  group: ['productivity'],
  
  credentials: [
    {
      name: 'calendlyApi',
      displayName: 'Calendly API',
      required: true,
      type: 'oauth2',
      properties: [
        {
          name: 'accessToken',
          displayName: 'Personal Access Token',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // EVENT RESOURCE
    // ============================================
    {
      id: 'event',
      name: 'Event',
      value: 'event',
      description: 'Scheduled events',
      operations: [
        {
          id: 'get_event',
          name: 'Get Event',
          value: 'get',
          description: 'Get an event by UUID',
          action: 'Retrieve an event',
          fields: [
            {
              id: 'event_uuid',
              name: 'eventUuid',
              displayName: 'Event UUID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_events',
          name: 'Get Events',
          value: 'getMany',
          description: 'Get scheduled events',
          action: 'List events',
          fields: [
            {
              id: 'user',
              name: 'user',
              displayName: 'User URI',
              type: 'string',
              required: true,
              description: 'User URI (from /users/me endpoint)',
            },
          ],
          optionalFields: [
            {
              id: 'organization',
              name: 'organization',
              displayName: 'Organization URI',
              type: 'string',
              required: false,
            },
            {
              id: 'count',
              name: 'count',
              displayName: 'Count',
              type: 'number',
              required: false,
              default: 20,
            },
            {
              id: 'invitee_email',
              name: 'inviteeEmail',
              displayName: 'Invitee Email',
              type: 'string',
              required: false,
            },
            {
              id: 'max_start_time',
              name: 'maxStartTime',
              displayName: 'Max Start Time',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'min_start_time',
              name: 'minStartTime',
              displayName: 'Min Start Time',
              type: 'dateTime',
              required: false,
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              options: [
                { name: 'Active', value: 'active' },
                { name: 'Canceled', value: 'canceled' },
              ],
            },
            {
              id: 'sort',
              name: 'sort',
              displayName: 'Sort',
              type: 'options',
              required: false,
              options: [
                { name: 'Start Time Ascending', value: 'start_time:asc' },
                { name: 'Start Time Descending', value: 'start_time:desc' },
              ],
            },
          ],
        },
        {
          id: 'cancel_event',
          name: 'Cancel Event',
          value: 'cancel',
          description: 'Cancel a scheduled event',
          action: 'Cancel an event',
          fields: [
            {
              id: 'event_uuid',
              name: 'eventUuid',
              displayName: 'Event UUID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'reason',
              name: 'reason',
              displayName: 'Cancellation Reason',
              type: 'string',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // EVENT TYPE RESOURCE
    // ============================================
    {
      id: 'eventType',
      name: 'Event Type',
      value: 'eventType',
      description: 'Calendly event types',
      operations: [
        {
          id: 'get_event_type',
          name: 'Get Event Type',
          value: 'get',
          description: 'Get an event type by UUID',
          action: 'Retrieve an event type',
          fields: [
            {
              id: 'event_type_uuid',
              name: 'eventTypeUuid',
              displayName: 'Event Type UUID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_event_types',
          name: 'Get Event Types',
          value: 'getMany',
          description: 'Get all event types',
          action: 'List event types',
          fields: [
            {
              id: 'user',
              name: 'user',
              displayName: 'User URI',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'organization',
              name: 'organization',
              displayName: 'Organization URI',
              type: 'string',
              required: false,
            },
            {
              id: 'active',
              name: 'active',
              displayName: 'Active Only',
              type: 'boolean',
              required: false,
              default: true,
            },
            {
              id: 'count',
              name: 'count',
              displayName: 'Count',
              type: 'number',
              required: false,
              default: 20,
            },
            {
              id: 'sort',
              name: 'sort',
              displayName: 'Sort',
              type: 'options',
              required: false,
              options: [
                { name: 'Name Ascending', value: 'name:asc' },
                { name: 'Name Descending', value: 'name:desc' },
              ],
            },
          ],
        },
      ],
    },
    
    // ============================================
    // INVITEE RESOURCE
    // ============================================
    {
      id: 'invitee',
      name: 'Invitee',
      value: 'invitee',
      description: 'Event invitees',
      operations: [
        {
          id: 'get_invitee',
          name: 'Get Invitee',
          value: 'get',
          description: 'Get an invitee by UUID',
          action: 'Retrieve an invitee',
          fields: [
            {
              id: 'event_uuid',
              name: 'eventUuid',
              displayName: 'Event UUID',
              type: 'string',
              required: true,
            },
            {
              id: 'invitee_uuid',
              name: 'inviteeUuid',
              displayName: 'Invitee UUID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_invitees',
          name: 'Get Invitees',
          value: 'getMany',
          description: 'Get invitees for an event',
          action: 'List invitees',
          fields: [
            {
              id: 'event_uuid',
              name: 'eventUuid',
              displayName: 'Event UUID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'count',
              name: 'count',
              displayName: 'Count',
              type: 'number',
              required: false,
              default: 20,
            },
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: false,
            },
            {
              id: 'status',
              name: 'status',
              displayName: 'Status',
              type: 'options',
              required: false,
              options: [
                { name: 'Active', value: 'active' },
                { name: 'Canceled', value: 'canceled' },
              ],
            },
            {
              id: 'sort',
              name: 'sort',
              displayName: 'Sort',
              type: 'options',
              required: false,
              options: [
                { name: 'Created At Ascending', value: 'created_at:asc' },
                { name: 'Created At Descending', value: 'created_at:desc' },
              ],
            },
          ],
        },
      ],
    },
    
    // ============================================
    // SCHEDULING LINK RESOURCE
    // ============================================
    {
      id: 'schedulingLink',
      name: 'Scheduling Link',
      value: 'schedulingLink',
      description: 'Single-use scheduling links',
      operations: [
        {
          id: 'create_scheduling_link',
          name: 'Create Scheduling Link',
          value: 'create',
          description: 'Create a single-use scheduling link',
          action: 'Create scheduling link',
          fields: [
            {
              id: 'owner',
              name: 'owner',
              displayName: 'Owner URI',
              type: 'string',
              required: true,
              description: 'Event type URI',
            },
            {
              id: 'owner_type',
              name: 'ownerType',
              displayName: 'Owner Type',
              type: 'options',
              required: true,
              default: 'EventType',
              options: [
                { name: 'Event Type', value: 'EventType' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'max_event_count',
              name: 'maxEventCount',
              displayName: 'Max Event Count',
              type: 'number',
              required: false,
              default: 1,
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
      description: 'Calendly users',
      operations: [
        {
          id: 'get_current_user',
          name: 'Get Current User',
          value: 'getMe',
          description: 'Get the current authenticated user',
          action: 'Get current user',
          fields: [],
          optionalFields: [],
        },
        {
          id: 'get_user',
          name: 'Get User',
          value: 'get',
          description: 'Get a user by UUID',
          action: 'Retrieve a user',
          fields: [
            {
              id: 'user_uuid',
              name: 'userUuid',
              displayName: 'User UUID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // ORGANIZATION RESOURCE
    // ============================================
    {
      id: 'organization',
      name: 'Organization',
      value: 'organization',
      description: 'Calendly organizations',
      operations: [
        {
          id: 'get_organization_membership',
          name: 'Get Organization Membership',
          value: 'getMembership',
          description: 'Get organization membership',
          action: 'Get membership',
          fields: [
            {
              id: 'membership_uuid',
              name: 'membershipUuid',
              displayName: 'Membership UUID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_organization_memberships',
          name: 'Get Organization Memberships',
          value: 'getMemberships',
          description: 'Get all organization memberships',
          action: 'List memberships',
          fields: [
            {
              id: 'organization',
              name: 'organization',
              displayName: 'Organization URI',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'count',
              name: 'count',
              displayName: 'Count',
              type: 'number',
              required: false,
              default: 20,
            },
            {
              id: 'email',
              name: 'email',
              displayName: 'Email',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'remove_user',
          name: 'Remove User from Organization',
          value: 'removeUser',
          description: 'Remove a user from the organization',
          action: 'Remove user',
          fields: [
            {
              id: 'membership_uuid',
              name: 'membershipUuid',
              displayName: 'Membership UUID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // WEBHOOK SUBSCRIPTION RESOURCE
    // ============================================
    {
      id: 'webhookSubscription',
      name: 'Webhook Subscription',
      value: 'webhookSubscription',
      description: 'Webhook subscriptions',
      operations: [
        {
          id: 'create_webhook',
          name: 'Create Webhook Subscription',
          value: 'create',
          description: 'Create a webhook subscription',
          action: 'Create webhook',
          fields: [
            {
              id: 'url',
              name: 'url',
              displayName: 'Callback URL',
              type: 'string',
              required: true,
            },
            {
              id: 'events',
              name: 'events',
              displayName: 'Events',
              type: 'multiOptions',
              required: true,
              options: [
                { name: 'Invitee Created', value: 'invitee.created' },
                { name: 'Invitee Canceled', value: 'invitee.canceled' },
                { name: 'Routing Form Submission Created', value: 'routing_form_submission.created' },
              ],
            },
            {
              id: 'organization',
              name: 'organization',
              displayName: 'Organization URI',
              type: 'string',
              required: true,
            },
            {
              id: 'scope',
              name: 'scope',
              displayName: 'Scope',
              type: 'options',
              required: true,
              options: [
                { name: 'Organization', value: 'organization' },
                { name: 'User', value: 'user' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'user',
              name: 'user',
              displayName: 'User URI',
              type: 'string',
              required: false,
              description: 'Required when scope is "user"',
            },
            {
              id: 'signing_key',
              name: 'signingKey',
              displayName: 'Signing Key',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_webhooks',
          name: 'Get Webhook Subscriptions',
          value: 'getMany',
          description: 'Get all webhook subscriptions',
          action: 'List webhooks',
          fields: [
            {
              id: 'organization',
              name: 'organization',
              displayName: 'Organization URI',
              type: 'string',
              required: true,
            },
            {
              id: 'scope',
              name: 'scope',
              displayName: 'Scope',
              type: 'options',
              required: true,
              options: [
                { name: 'Organization', value: 'organization' },
                { name: 'User', value: 'user' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'user',
              name: 'user',
              displayName: 'User URI',
              type: 'string',
              required: false,
            },
            {
              id: 'count',
              name: 'count',
              displayName: 'Count',
              type: 'number',
              required: false,
              default: 20,
            },
          ],
        },
        {
          id: 'delete_webhook',
          name: 'Delete Webhook Subscription',
          value: 'delete',
          description: 'Delete a webhook subscription',
          action: 'Delete webhook',
          fields: [
            {
              id: 'webhook_uuid',
              name: 'webhookUuid',
              displayName: 'Webhook UUID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // AVAILABILITY RESOURCE
    // ============================================
    {
      id: 'availability',
      name: 'Availability',
      value: 'availability',
      description: 'User availability',
      operations: [
        {
          id: 'get_user_availability_schedules',
          name: 'Get Availability Schedules',
          value: 'getSchedules',
          description: 'Get user availability schedules',
          action: 'List availability schedules',
          fields: [
            {
              id: 'user',
              name: 'user',
              displayName: 'User URI',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_user_busy_times',
          name: 'Get User Busy Times',
          value: 'getBusyTimes',
          description: 'Get user busy times',
          action: 'Get busy times',
          fields: [
            {
              id: 'user',
              name: 'user',
              displayName: 'User URI',
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
            {
              id: 'end_time',
              name: 'endTime',
              displayName: 'End Time',
              type: 'dateTime',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
  ],
};
