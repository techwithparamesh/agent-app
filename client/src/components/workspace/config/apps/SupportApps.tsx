/**
 * Support & Help Desk App Configurations
 * 
 * n8n-style configurations for:
 * - Zendesk
 * - Freshdesk
 * - Crisp
 * - Tawk.to
 */

import React from "react";
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  CredentialField,
  ExpressionField,
  CollectionField,
  KeyValueField,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// ZENDESK CONFIG
// ============================================

export const ZendeskConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Zendesk Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Zendesk API"
      required
    />

    <TextField
      label="Subdomain"
      value={config.subdomain || ''}
      onChange={(v) => updateConfig('subdomain', v)}
      placeholder="yourcompany"
      description="Your Zendesk subdomain (yourcompany.zendesk.com)"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'ticket'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'ticket', label: 'Ticket' },
        { value: 'user', label: 'User' },
        { value: 'organization', label: 'Organization' },
        { value: 'ticketField', label: 'Ticket Field' },
      ]}
      required
    />

    {config.resource === 'ticket' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Ticket' },
            { value: 'get', label: 'Get Ticket' },
            { value: 'getAll', label: 'Get All Tickets' },
            { value: 'update', label: 'Update Ticket' },
            { value: 'delete', label: 'Delete Ticket' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Subject"
              value={config.subject || ''}
              onChange={(v) => updateConfig('subject', v)}
              required
            />

            <TextareaField
              label="Description"
              value={config.description || ''}
              onChange={(v) => updateConfig('description', v)}
              rows={4}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'requesterId', displayName: 'Requester ID', type: 'string' },
                { name: 'requesterEmail', displayName: 'Requester Email', type: 'string' },
                { name: 'assigneeId', displayName: 'Assignee ID', type: 'string' },
                { name: 'status', displayName: 'Status', type: 'options', options: [
                  { value: 'new', label: 'New' },
                  { value: 'open', label: 'Open' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'hold', label: 'Hold' },
                  { value: 'solved', label: 'Solved' },
                ]},
                { name: 'priority', displayName: 'Priority', type: 'options', options: [
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]},
                { name: 'type', displayName: 'Type', type: 'options', options: [
                  { value: 'problem', label: 'Problem' },
                  { value: 'incident', label: 'Incident' },
                  { value: 'question', label: 'Question' },
                  { value: 'task', label: 'Task' },
                ]},
                { name: 'tags', displayName: 'Tags (comma-sep)', type: 'string' },
              ]}
            />
          </>
        )}

        {(config.operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Ticket ID"
            value={config.ticketId || ''}
            onChange={(v) => updateConfig('ticketId', v)}
            required
          />
        )}

        {config.operation === 'update' && (
          <CollectionField
            label="Update Fields"
            value={config.updateFields || {}}
            onChange={(v) => updateConfig('updateFields', v)}
            options={[
              { name: 'status', displayName: 'Status', type: 'options', options: [
                { value: 'open', label: 'Open' },
                { value: 'pending', label: 'Pending' },
                { value: 'solved', label: 'Solved' },
              ]},
              { name: 'priority', displayName: 'Priority', type: 'options', options: [
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]},
              { name: 'comment', displayName: 'Add Comment', type: 'string' },
              { name: 'assigneeId', displayName: 'Assignee ID', type: 'string' },
            ]}
          />
        )}
      </>
    )}

    {config.resource === 'user' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create User' },
            { value: 'get', label: 'Get User' },
            { value: 'getAll', label: 'Get All Users' },
            { value: 'update', label: 'Update User' },
            { value: 'search', label: 'Search Users' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'role', displayName: 'Role', type: 'options', options: [
                  { value: 'end-user', label: 'End User' },
                  { value: 'agent', label: 'Agent' },
                  { value: 'admin', label: 'Admin' },
                ]},
                { name: 'organizationId', displayName: 'Organization ID', type: 'string' },
              ]}
            />
          </>
        )}

        {config.operation === 'search' && (
          <TextField
            label="Search Query"
            value={config.query || ''}
            onChange={(v) => updateConfig('query', v)}
            placeholder="email:john@example.com"
            required
          />
        )}
      </>
    )}
  </div>
);

// ============================================
// FRESHDESK CONFIG
// ============================================

export const FreshdeskConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Freshdesk Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Freshdesk API"
      required
    />

    <TextField
      label="Domain"
      value={config.domain || ''}
      onChange={(v) => updateConfig('domain', v)}
      placeholder="yourcompany.freshdesk.com"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'ticket'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'ticket', label: 'Ticket' },
        { value: 'contact', label: 'Contact' },
        { value: 'company', label: 'Company' },
      ]}
      required
    />

    {config.resource === 'ticket' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Ticket' },
            { value: 'get', label: 'Get Ticket' },
            { value: 'getAll', label: 'Get All Tickets' },
            { value: 'update', label: 'Update Ticket' },
            { value: 'delete', label: 'Delete Ticket' },
            { value: 'reply', label: 'Reply to Ticket' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Subject"
              value={config.subject || ''}
              onChange={(v) => updateConfig('subject', v)}
              required
            />

            <TextareaField
              label="Description"
              value={config.description || ''}
              onChange={(v) => updateConfig('description', v)}
              rows={4}
              required
            />

            <ExpressionField
              label="Requester Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'status', displayName: 'Status', type: 'options', options: [
                  { value: '2', label: 'Open' },
                  { value: '3', label: 'Pending' },
                  { value: '4', label: 'Resolved' },
                  { value: '5', label: 'Closed' },
                ]},
                { name: 'priority', displayName: 'Priority', type: 'options', options: [
                  { value: '1', label: 'Low' },
                  { value: '2', label: 'Medium' },
                  { value: '3', label: 'High' },
                  { value: '4', label: 'Urgent' },
                ]},
                { name: 'type', displayName: 'Type', type: 'string' },
                { name: 'tags', displayName: 'Tags (comma-sep)', type: 'string' },
                { name: 'responder_id', displayName: 'Agent ID', type: 'number' },
                { name: 'group_id', displayName: 'Group ID', type: 'number' },
              ]}
            />
          </>
        )}

        {(config.operation === 'get' || config.operation === 'update' || config.operation === 'delete' || config.operation === 'reply') && (
          <ExpressionField
            label="Ticket ID"
            value={config.ticketId || ''}
            onChange={(v) => updateConfig('ticketId', v)}
            required
          />
        )}

        {config.operation === 'reply' && (
          <TextareaField
            label="Reply Body"
            value={config.body || ''}
            onChange={(v) => updateConfig('body', v)}
            rows={4}
            required
          />
        )}
      </>
    )}

    {config.resource === 'contact' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Contact' },
            { value: 'get', label: 'Get Contact' },
            { value: 'getAll', label: 'Get All Contacts' },
            { value: 'update', label: 'Update Contact' },
            { value: 'delete', label: 'Delete Contact' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required
            />

            <CollectionField
              label="Details"
              value={config.details || {}}
              onChange={(v) => updateConfig('details', v)}
              options={[
                { name: 'name', displayName: 'Name', type: 'string' },
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'company_id', displayName: 'Company ID', type: 'number' },
                { name: 'job_title', displayName: 'Job Title', type: 'string' },
              ]}
            />
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// CRISP CONFIG
// ============================================

export const CrispConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Crisp Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Crisp API"
      required
    />

    <ExpressionField
      label="Website ID"
      value={config.websiteId || ''}
      onChange={(v) => updateConfig('websiteId', v)}
      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'conversation'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'conversation', label: 'Conversation' },
        { value: 'people', label: 'People' },
        { value: 'message', label: 'Message' },
      ]}
      required
    />

    {config.resource === 'conversation' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Conversation' },
            { value: 'getAll', label: 'Get All Conversations' },
            { value: 'setState', label: 'Set State' },
            { value: 'setMeta', label: 'Set Metadata' },
          ]}
        />

        {(config.operation === 'get' || config.operation === 'setState' || config.operation === 'setMeta') && (
          <ExpressionField
            label="Session ID"
            value={config.sessionId || ''}
            onChange={(v) => updateConfig('sessionId', v)}
            required
          />
        )}

        {config.operation === 'setState' && (
          <SelectField
            label="State"
            value={config.state || 'pending'}
            onChange={(v) => updateConfig('state', v)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'unresolved', label: 'Unresolved' },
              { value: 'resolved', label: 'Resolved' },
            ]}
          />
        )}

        {config.operation === 'setMeta' && (
          <KeyValueField
            label="Metadata"
            value={config.metadata || []}
            onChange={(v) => updateConfig('metadata', v)}
            keyPlaceholder="Key"
            valuePlaceholder="Value"
          />
        )}
      </>
    )}

    {config.resource === 'message' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Message' },
            { value: 'getAll', label: 'Get Messages' },
          ]}
        />

        <ExpressionField
          label="Session ID"
          value={config.sessionId || ''}
          onChange={(v) => updateConfig('sessionId', v)}
          required
        />

        {config.operation === 'send' && (
          <>
            <SelectField
              label="Message Type"
              value={config.type || 'text'}
              onChange={(v) => updateConfig('type', v)}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'note', label: 'Note (Private)' },
              ]}
            />

            <TextareaField
              label="Content"
              value={config.content || ''}
              onChange={(v) => updateConfig('content', v)}
              rows={3}
              required
            />
          </>
        )}
      </>
    )}

    {config.resource === 'people' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Person' },
            { value: 'update', label: 'Update Person' },
          ]}
        />

        <ExpressionField
          label="People ID"
          value={config.peopleId || ''}
          onChange={(v) => updateConfig('peopleId', v)}
          required
        />

        {config.operation === 'update' && (
          <CollectionField
            label="Update Fields"
            value={config.updateFields || {}}
            onChange={(v) => updateConfig('updateFields', v)}
            options={[
              { name: 'email', displayName: 'Email', type: 'string' },
              { name: 'nickname', displayName: 'Nickname', type: 'string' },
              { name: 'phone', displayName: 'Phone', type: 'string' },
              { name: 'company', displayName: 'Company', type: 'string' },
            ]}
          />
        )}
      </>
    )}
  </div>
);

// ============================================
// TAWK.TO CONFIG
// ============================================

export const TawkConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Tawk.to Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Tawk.to API"
      required
    />

    <ExpressionField
      label="Property ID"
      value={config.propertyId || ''}
      onChange={(v) => updateConfig('propertyId', v)}
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'chat'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'chat', label: 'Chat' },
        { value: 'visitor', label: 'Visitor' },
        { value: 'ticket', label: 'Ticket' },
      ]}
      required
    />

    {config.resource === 'chat' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Chat' },
            { value: 'getAll', label: 'Get All Chats' },
            { value: 'sendMessage', label: 'Send Message' },
          ]}
        />

        {(config.operation === 'get' || config.operation === 'sendMessage') && (
          <ExpressionField
            label="Chat ID"
            value={config.chatId || ''}
            onChange={(v) => updateConfig('chatId', v)}
            required
          />
        )}

        {config.operation === 'sendMessage' && (
          <TextareaField
            label="Message"
            value={config.message || ''}
            onChange={(v) => updateConfig('message', v)}
            rows={3}
            required
          />
        )}

        {config.operation === 'getAll' && (
          <NumberField
            label="Limit"
            value={config.limit || 50}
            onChange={(v) => updateConfig('limit', v)}
          />
        )}
      </>
    )}

    {config.resource === 'ticket' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Ticket' },
            { value: 'get', label: 'Get Ticket' },
            { value: 'getAll', label: 'Get All Tickets' },
          ]}
        />

        {config.operation === 'create' && (
          <>
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
              rows={4}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'requesterName', displayName: 'Requester Name', type: 'string' },
                { name: 'requesterEmail', displayName: 'Requester Email', type: 'string' },
              ]}
            />
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// EXPORTS
// ============================================

export const SupportAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  zendesk: ZendeskConfig,
  zendesk_ticket: ZendeskConfig,
  
  freshdesk: FreshdeskConfig,
  freshdesk_ticket: FreshdeskConfig,
  
  crisp: CrispConfig,
  crisp_chat: CrispConfig,
  
  tawk: TawkConfig,
  tawk_to: TawkConfig,
  tawkto: TawkConfig,
};

export default SupportAppConfigs;
