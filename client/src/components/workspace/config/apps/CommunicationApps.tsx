/**
 * Communication App Configurations
 * 
 * n8n-style configurations for communication and messaging apps:
 * - Slack (Advanced)
 * - Discord (Advanced)
 * - Microsoft Teams
 * - Twilio (SMS, Voice, WhatsApp)
 * - SendGrid
 * - Mailchimp
 * - Intercom
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
  InfoBox,
  SectionHeader,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// SLACK ADVANCED CONFIG
// ============================================

export const SlackAdvancedConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Slack Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Slack OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'message'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'message', label: 'Message' },
        { value: 'channel', label: 'Channel' },
        { value: 'user', label: 'User' },
        { value: 'file', label: 'File' },
        { value: 'reaction', label: 'Reaction' },
        { value: 'star', label: 'Star' },
        { value: 'userGroup', label: 'User Group' },
      ]}
      required
    />

    {config.resource === 'message' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send' },
            { value: 'update', label: 'Update' },
            { value: 'delete', label: 'Delete' },
            { value: 'getPermalink', label: 'Get Permalink' },
            { value: 'search', label: 'Search' },
          ]}
        />

        <ResourceLocatorField
          label="Channel"
          value={config.channel || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('channel', v)}
          modes={['list', 'id', 'url']}
          listOptions={[
            { value: 'general', label: '#general' },
            { value: 'random', label: '#random' },
            { value: 'engineering', label: '#engineering' },
          ]}
          resourceType="Channel"
          required
        />

        {(config.operation === 'send' || config.operation === 'update') && (
          <>
            <SelectField
              label="Message Type"
              value={config.messageType || 'text'}
              onChange={(v) => updateConfig('messageType', v)}
              options={[
                { value: 'text', label: 'Simple Text' },
                { value: 'blocks', label: 'Blocks (Rich Content)' },
                { value: 'attachment', label: 'Attachment' },
              ]}
            />

            {config.messageType === 'text' && (
              <ExpressionField
                label="Message Text"
                value={config.text || ''}
                onChange={(v) => updateConfig('text', v)}
                placeholder="Hello from the workflow!"
                required
              />
            )}

            {config.messageType === 'blocks' && (
              <TextareaField
                label="Blocks JSON"
                value={config.blocksJson || ''}
                onChange={(v) => updateConfig('blocksJson', v)}
                placeholder='[{"type": "section", "text": {"type": "mrkdwn", "text": "Hello!"}}]'
                rows={6}
                description="Slack Block Kit JSON"
              />
            )}

            <CollectionField
              label="Additional Options"
              value={config.additionalOptions || {}}
              onChange={(v) => updateConfig('additionalOptions', v)}
              options={[
                { name: 'username', displayName: 'Bot Username', type: 'string', placeholder: 'Custom Bot Name' },
                { name: 'iconEmoji', displayName: 'Icon Emoji', type: 'string', placeholder: ':robot_face:' },
                { name: 'iconUrl', displayName: 'Icon URL', type: 'string', placeholder: 'https://...' },
                { name: 'threadTs', displayName: 'Thread Timestamp', type: 'string', description: 'Reply in thread' },
                { name: 'unfurlLinks', displayName: 'Unfurl Links', type: 'boolean' },
                { name: 'unfurlMedia', displayName: 'Unfurl Media', type: 'boolean' },
                { name: 'mrkdwn', displayName: 'Parse Markdown', type: 'boolean', default: true },
              ]}
            />
          </>
        )}

        {config.operation === 'search' && (
          <>
            <ExpressionField
              label="Search Query"
              value={config.query || ''}
              onChange={(v) => updateConfig('query', v)}
              placeholder="from:@user in:#channel text"
              required
            />
            <SelectField
              label="Sort By"
              value={config.sortBy || 'timestamp'}
              onChange={(v) => updateConfig('sortBy', v)}
              options={[
                { value: 'timestamp', label: 'Timestamp' },
                { value: 'score', label: 'Relevance Score' },
              ]}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'channel' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'archive', label: 'Archive' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get Many' },
            { value: 'history', label: 'History' },
            { value: 'invite', label: 'Invite' },
            { value: 'kick', label: 'Kick' },
            { value: 'join', label: 'Join' },
            { value: 'leave', label: 'Leave' },
            { value: 'rename', label: 'Rename' },
            { value: 'setTopic', label: 'Set Topic' },
            { value: 'setPurpose', label: 'Set Purpose' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <TextField
              label="Channel Name"
              value={config.channelName || ''}
              onChange={(v) => updateConfig('channelName', v)}
              placeholder="new-channel"
              required
            />
            <SwitchField
              label="Private Channel"
              value={config.isPrivate || false}
              onChange={(v) => updateConfig('isPrivate', v)}
              description="Create as a private channel"
            />
          </>
        )}

        {(config.operation === 'invite' || config.operation === 'kick') && (
          <ResourceLocatorField
            label="User"
            value={config.user || { mode: 'list', value: '' }}
            onChange={(v) => updateConfig('user', v)}
            modes={['list', 'id']}
            resourceType="User"
            required
          />
        )}
      </>
    )}

    {config.resource === 'file' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'upload'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'upload', label: 'Upload' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get Many' },
          ]}
        />

        {config.operation === 'upload' && (
          <>
            <SelectField
              label="Upload Type"
              value={config.uploadType || 'binary'}
              onChange={(v) => updateConfig('uploadType', v)}
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
            />
            <TextareaField
              label="Initial Comment"
              value={config.initialComment || ''}
              onChange={(v) => updateConfig('initialComment', v)}
              placeholder="Here's the file you requested"
            />
          </>
        )}
      </>
    )}

    {config.resource === 'reaction' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'add'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'add', label: 'Add' },
            { value: 'remove', label: 'Remove' },
            { value: 'get', label: 'Get' },
          ]}
        />
        <TextField
          label="Emoji"
          value={config.emoji || ''}
          onChange={(v) => updateConfig('emoji', v)}
          placeholder="thumbsup"
          description="Emoji name without colons"
          required
        />
        <TextField
          label="Message Timestamp"
          value={config.timestamp || ''}
          onChange={(v) => updateConfig('timestamp', v)}
          placeholder="1234567890.123456"
          required
        />
      </>
    )}
  </div>
);

// ============================================
// DISCORD ADVANCED CONFIG
// ============================================

export const DiscordAdvancedConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Discord Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Discord Bot Token"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'message'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'message', label: 'Message' },
        { value: 'channel', label: 'Channel' },
        { value: 'member', label: 'Member' },
        { value: 'webhook', label: 'Webhook' },
      ]}
      required
    />

    {config.resource === 'message' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Message' },
            { value: 'delete', label: 'Delete Message' },
            { value: 'getAll', label: 'Get Messages' },
          ]}
        />

        <ResourceLocatorField
          label="Server"
          value={config.guildId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('guildId', v)}
          modes={['list', 'id']}
          resourceType="Server"
          required
        />

        <ResourceLocatorField
          label="Channel"
          value={config.channelId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('channelId', v)}
          modes={['list', 'id']}
          resourceType="Channel"
          required
        />

        {config.operation === 'send' && (
          <>
            <ExpressionField
              label="Message Content"
              value={config.content || ''}
              onChange={(v) => updateConfig('content', v)}
              placeholder="Hello from the workflow!"
              required
            />

            <SwitchField
              label="Use Embed"
              value={config.useEmbed || false}
              onChange={(v) => updateConfig('useEmbed', v)}
              description="Send rich embed message"
            />

            {config.useEmbed && (
              <CollectionField
                label="Embed Options"
                value={config.embed || {}}
                onChange={(v) => updateConfig('embed', v)}
                options={[
                  { name: 'title', displayName: 'Title', type: 'string' },
                  { name: 'description', displayName: 'Description', type: 'string' },
                  { name: 'url', displayName: 'URL', type: 'string' },
                  { name: 'color', displayName: 'Color', type: 'string', placeholder: '#5865F2' },
                  { name: 'timestamp', displayName: 'Include Timestamp', type: 'boolean' },
                  { name: 'footerText', displayName: 'Footer Text', type: 'string' },
                  { name: 'thumbnailUrl', displayName: 'Thumbnail URL', type: 'string' },
                  { name: 'imageUrl', displayName: 'Image URL', type: 'string' },
                ]}
              />
            )}

            <SwitchField
              label="Text to Speech"
              value={config.tts || false}
              onChange={(v) => updateConfig('tts', v)}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'channel' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Channel' },
            { value: 'getAll', label: 'Get All Channels' },
            { value: 'create', label: 'Create Channel' },
            { value: 'delete', label: 'Delete Channel' },
            { value: 'update', label: 'Update Channel' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <TextField
              label="Channel Name"
              value={config.channelName || ''}
              onChange={(v) => updateConfig('channelName', v)}
              required
            />
            <SelectField
              label="Channel Type"
              value={config.channelType || '0'}
              onChange={(v) => updateConfig('channelType', v)}
              options={[
                { value: '0', label: 'Text Channel' },
                { value: '2', label: 'Voice Channel' },
                { value: '4', label: 'Category' },
                { value: '5', label: 'Announcement Channel' },
                { value: '13', label: 'Stage Channel' },
                { value: '15', label: 'Forum Channel' },
              ]}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'member' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Member' },
            { value: 'getAll', label: 'Get All Members' },
            { value: 'roleAdd', label: 'Add Role' },
            { value: 'roleRemove', label: 'Remove Role' },
          ]}
        />

        {(config.operation === 'roleAdd' || config.operation === 'roleRemove') && (
          <>
            <TextField
              label="User ID"
              value={config.userId || ''}
              onChange={(v) => updateConfig('userId', v)}
              required
            />
            <TextField
              label="Role ID"
              value={config.roleId || ''}
              onChange={(v) => updateConfig('roleId', v)}
              required
            />
          </>
        )}
      </>
    )}

    {config.resource === 'webhook' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'sendMessage'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'sendMessage', label: 'Send Message' },
          ]}
        />

        <TextField
          label="Webhook URL"
          value={config.webhookUrl || ''}
          onChange={(v) => updateConfig('webhookUrl', v)}
          placeholder="https://discord.com/api/webhooks/..."
          required
        />

        <ExpressionField
          label="Content"
          value={config.content || ''}
          onChange={(v) => updateConfig('content', v)}
        />

        <CollectionField
          label="Webhook Options"
          value={config.webhookOptions || {}}
          onChange={(v) => updateConfig('webhookOptions', v)}
          options={[
            { name: 'username', displayName: 'Override Username', type: 'string' },
            { name: 'avatarUrl', displayName: 'Override Avatar URL', type: 'string' },
            { name: 'threadId', displayName: 'Thread ID', type: 'string' },
          ]}
        />
      </>
    )}
  </div>
);

// ============================================
// MICROSOFT TEAMS CONFIG
// ============================================

export const MicrosoftTeamsConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Microsoft Teams Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Microsoft OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'chatMessage'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'chatMessage', label: 'Chat Message' },
        { value: 'channelMessage', label: 'Channel Message' },
        { value: 'channel', label: 'Channel' },
        { value: 'team', label: 'Team' },
        { value: 'task', label: 'Task (Planner)' },
      ]}
      required
    />

    {config.resource === 'chatMessage' && (
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

        <ResourceLocatorField
          label="Chat"
          value={config.chatId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('chatId', v)}
          modes={['list', 'id']}
          resourceType="Chat"
          required
        />

        {config.operation === 'send' && (
          <>
            <SelectField
              label="Message Type"
              value={config.messageType || 'text'}
              onChange={(v) => updateConfig('messageType', v)}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'html', label: 'HTML' },
              ]}
            />

            <ExpressionField
              label="Message"
              value={config.message || ''}
              onChange={(v) => updateConfig('message', v)}
              placeholder="Hello from the workflow!"
              required
            />

            <CollectionField
              label="Additional Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'importance', displayName: 'Importance', type: 'options', options: [
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]},
              ]}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'channelMessage' && (
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

        <ResourceLocatorField
          label="Team"
          value={config.teamId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('teamId', v)}
          modes={['list', 'id']}
          resourceType="Team"
          required
        />

        <ResourceLocatorField
          label="Channel"
          value={config.channelId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('channelId', v)}
          modes={['list', 'id']}
          resourceType="Channel"
          required
        />

        {config.operation === 'send' && (
          <ExpressionField
            label="Message"
            value={config.message || ''}
            onChange={(v) => updateConfig('message', v)}
            placeholder="Hello team!"
            required
          />
        )}
      </>
    )}

    {config.resource === 'task' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Task' },
            { value: 'get', label: 'Get Task' },
            { value: 'getAll', label: 'Get All Tasks' },
            { value: 'update', label: 'Update Task' },
            { value: 'delete', label: 'Delete Task' },
          ]}
        />

        <ResourceLocatorField
          label="Plan"
          value={config.planId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('planId', v)}
          modes={['list', 'id']}
          resourceType="Plan"
          required
        />

        {config.operation === 'create' && (
          <>
            <TextField
              label="Task Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              required
            />
            <CollectionField
              label="Task Details"
              value={config.taskDetails || {}}
              onChange={(v) => updateConfig('taskDetails', v)}
              options={[
                { name: 'bucketId', displayName: 'Bucket', type: 'string' },
                { name: 'dueDateTime', displayName: 'Due Date', type: 'string' },
                { name: 'percentComplete', displayName: 'Progress (%)', type: 'number' },
                { name: 'priority', displayName: 'Priority', type: 'options', options: [
                  { value: '1', label: 'Urgent' },
                  { value: '3', label: 'Important' },
                  { value: '5', label: 'Medium' },
                  { value: '9', label: 'Low' },
                ]},
              ]}
            />
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// TWILIO CONFIG (SMS, Voice, WhatsApp)
// ============================================

export const TwilioConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Twilio Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Twilio API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'sms'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'sms', label: 'SMS' },
        { value: 'mms', label: 'MMS' },
        { value: 'call', label: 'Voice Call' },
        { value: 'whatsapp', label: 'WhatsApp' },
      ]}
      required
    />

    {(config.resource === 'sms' || config.resource === 'mms') && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Message' },
          ]}
        />

        <ExpressionField
          label="From Number"
          value={config.from || ''}
          onChange={(v) => updateConfig('from', v)}
          placeholder="+1234567890"
          description="Your Twilio phone number"
          required
        />

        <ExpressionField
          label="To Number"
          value={config.to || ''}
          onChange={(v) => updateConfig('to', v)}
          placeholder="+1234567890"
          required
        />

        <TextareaField
          label="Message"
          value={config.body || ''}
          onChange={(v) => updateConfig('body', v)}
          placeholder="Your message here..."
          required
        />

        {config.resource === 'mms' && (
          <FixedCollectionField
            label="Media URLs"
            value={config.mediaUrls || []}
            onChange={(v) => updateConfig('mediaUrls', v)}
            fields={[
              { name: 'url', displayName: 'Media URL', type: 'string', placeholder: 'https://...' },
            ]}
            sortable
          />
        )}

        <CollectionField
          label="Additional Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'statusCallback', displayName: 'Status Callback URL', type: 'string' },
            { name: 'validityPeriod', displayName: 'Validity Period (seconds)', type: 'number' },
            { name: 'maxPrice', displayName: 'Max Price', type: 'string' },
          ]}
        />
      </>
    )}

    {config.resource === 'call' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'make'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'make', label: 'Make Call' },
          ]}
        />

        <ExpressionField
          label="From Number"
          value={config.from || ''}
          onChange={(v) => updateConfig('from', v)}
          placeholder="+1234567890"
          required
        />

        <ExpressionField
          label="To Number"
          value={config.to || ''}
          onChange={(v) => updateConfig('to', v)}
          placeholder="+1234567890"
          required
        />

        <SelectField
          label="Call Action"
          value={config.callAction || 'twiml'}
          onChange={(v) => updateConfig('callAction', v)}
          options={[
            { value: 'twiml', label: 'TwiML Instructions' },
            { value: 'url', label: 'TwiML URL' },
          ]}
        />

        {config.callAction === 'twiml' && (
          <TextareaField
            label="TwiML"
            value={config.twiml || ''}
            onChange={(v) => updateConfig('twiml', v)}
            placeholder='<Response><Say>Hello!</Say></Response>'
            rows={4}
          />
        )}

        {config.callAction === 'url' && (
          <TextField
            label="TwiML URL"
            value={config.twimlUrl || ''}
            onChange={(v) => updateConfig('twimlUrl', v)}
            placeholder="https://..."
          />
        )}
      </>
    )}

    {config.resource === 'whatsapp' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Message' },
            { value: 'sendTemplate', label: 'Send Template' },
          ]}
        />

        <ExpressionField
          label="From (WhatsApp Number)"
          value={config.from || ''}
          onChange={(v) => updateConfig('from', v)}
          placeholder="whatsapp:+1234567890"
          required
        />

        <ExpressionField
          label="To (WhatsApp Number)"
          value={config.to || ''}
          onChange={(v) => updateConfig('to', v)}
          placeholder="whatsapp:+1234567890"
          required
        />

        {config.operation === 'send' && (
          <TextareaField
            label="Message"
            value={config.body || ''}
            onChange={(v) => updateConfig('body', v)}
            required
          />
        )}

        {config.operation === 'sendTemplate' && (
          <>
            <TextField
              label="Template SID"
              value={config.templateSid || ''}
              onChange={(v) => updateConfig('templateSid', v)}
              required
            />
            <KeyValueField
              label="Template Variables"
              value={config.templateVariables || []}
              onChange={(v) => updateConfig('templateVariables', v)}
              keyPlaceholder="Variable"
              valuePlaceholder="Value"
            />
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// SENDGRID CONFIG
// ============================================

export const SendGridConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="SendGrid Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="SendGrid API Key"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'email'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'email', label: 'Email' },
        { value: 'contact', label: 'Contact' },
        { value: 'list', label: 'Contact List' },
      ]}
      required
    />

    {config.resource === 'email' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Email' },
            { value: 'sendTemplate', label: 'Send Template Email' },
          ]}
        />

        <ExpressionField
          label="From Email"
          value={config.fromEmail || ''}
          onChange={(v) => updateConfig('fromEmail', v)}
          placeholder="sender@example.com"
          required
        />

        <TextField
          label="From Name"
          value={config.fromName || ''}
          onChange={(v) => updateConfig('fromName', v)}
          placeholder="Your Company"
        />

        <ExpressionField
          label="To Email"
          value={config.toEmail || ''}
          onChange={(v) => updateConfig('toEmail', v)}
          placeholder="recipient@example.com"
          required
        />

        {config.operation === 'send' && (
          <>
            <ExpressionField
              label="Subject"
              value={config.subject || ''}
              onChange={(v) => updateConfig('subject', v)}
              required
            />

            <SelectField
              label="Content Type"
              value={config.contentType || 'text'}
              onChange={(v) => updateConfig('contentType', v)}
              options={[
                { value: 'text', label: 'Plain Text' },
                { value: 'html', label: 'HTML' },
              ]}
            />

            <TextareaField
              label="Content"
              value={config.content || ''}
              onChange={(v) => updateConfig('content', v)}
              rows={6}
              required
            />
          </>
        )}

        {config.operation === 'sendTemplate' && (
          <>
            <TextField
              label="Template ID"
              value={config.templateId || ''}
              onChange={(v) => updateConfig('templateId', v)}
              required
            />

            <KeyValueField
              label="Dynamic Template Data"
              value={config.dynamicData || []}
              onChange={(v) => updateConfig('dynamicData', v)}
              keyPlaceholder="Variable name"
              valuePlaceholder="Value"
            />
          </>
        )}

        <CollectionField
          label="Additional Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'replyTo', displayName: 'Reply To', type: 'string' },
            { name: 'bccEmail', displayName: 'BCC', type: 'string' },
            { name: 'ccEmail', displayName: 'CC', type: 'string' },
            { name: 'trackOpens', displayName: 'Track Opens', type: 'boolean' },
            { name: 'trackClicks', displayName: 'Track Clicks', type: 'boolean' },
            { name: 'sandboxMode', displayName: 'Sandbox Mode', type: 'boolean' },
          ]}
        />
      </>
    )}

    {config.resource === 'contact' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create/Update Contact' },
            { value: 'get', label: 'Get Contact' },
            { value: 'getAll', label: 'Get All Contacts' },
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
              label="Contact Fields"
              value={config.contactFields || {}}
              onChange={(v) => updateConfig('contactFields', v)}
              options={[
                { name: 'firstName', displayName: 'First Name', type: 'string' },
                { name: 'lastName', displayName: 'Last Name', type: 'string' },
                { name: 'city', displayName: 'City', type: 'string' },
                { name: 'country', displayName: 'Country', type: 'string' },
                { name: 'postalCode', displayName: 'Postal Code', type: 'string' },
              ]}
            />
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// MAILCHIMP CONFIG
// ============================================

export const MailchimpConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Mailchimp Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Mailchimp OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'member'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'member', label: 'List Member' },
        { value: 'campaign', label: 'Campaign' },
        { value: 'listGroup', label: 'List Group' },
      ]}
      required
    />

    {config.resource === 'member' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create/Update Member' },
            { value: 'get', label: 'Get Member' },
            { value: 'getAll', label: 'Get All Members' },
            { value: 'delete', label: 'Delete Member' },
            { value: 'update', label: 'Update Member' },
          ]}
        />

        <ResourceLocatorField
          label="List"
          value={config.listId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('listId', v)}
          modes={['list', 'id']}
          resourceType="Audience List"
          required
        />

        {(config.operation === 'create' || config.operation === 'update') && (
          <>
            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required
            />

            <SelectField
              label="Status"
              value={config.status || 'subscribed'}
              onChange={(v) => updateConfig('status', v)}
              options={[
                { value: 'subscribed', label: 'Subscribed' },
                { value: 'unsubscribed', label: 'Unsubscribed' },
                { value: 'pending', label: 'Pending' },
                { value: 'cleaned', label: 'Cleaned' },
              ]}
            />

            <CollectionField
              label="Merge Fields"
              value={config.mergeFields || {}}
              onChange={(v) => updateConfig('mergeFields', v)}
              options={[
                { name: 'FNAME', displayName: 'First Name', type: 'string' },
                { name: 'LNAME', displayName: 'Last Name', type: 'string' },
                { name: 'PHONE', displayName: 'Phone', type: 'string' },
                { name: 'ADDRESS', displayName: 'Address', type: 'string' },
              ]}
            />

            <SwitchField
              label="Update if Exists"
              value={config.updateIfExists || false}
              onChange={(v) => updateConfig('updateIfExists', v)}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'campaign' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Campaign' },
            { value: 'get', label: 'Get Campaign' },
            { value: 'getAll', label: 'Get All Campaigns' },
            { value: 'send', label: 'Send Campaign' },
            { value: 'delete', label: 'Delete Campaign' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <SelectField
              label="Campaign Type"
              value={config.type || 'regular'}
              onChange={(v) => updateConfig('type', v)}
              options={[
                { value: 'regular', label: 'Regular' },
                { value: 'plaintext', label: 'Plain Text' },
                { value: 'absplit', label: 'A/B Split' },
                { value: 'rss', label: 'RSS' },
              ]}
            />

            <ResourceLocatorField
              label="List"
              value={config.listId || { mode: 'list', value: '' }}
              onChange={(v) => updateConfig('listId', v)}
              modes={['list', 'id']}
              resourceType="Audience List"
              required
            />

            <TextField
              label="Subject Line"
              value={config.subjectLine || ''}
              onChange={(v) => updateConfig('subjectLine', v)}
              required
            />

            <TextField
              label="From Name"
              value={config.fromName || ''}
              onChange={(v) => updateConfig('fromName', v)}
              required
            />

            <TextField
              label="Reply-To Email"
              value={config.replyTo || ''}
              onChange={(v) => updateConfig('replyTo', v)}
              required
            />
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// INTERCOM CONFIG
// ============================================

export const IntercomConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Intercom Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Intercom API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'contact'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'contact', label: 'Contact' },
        { value: 'lead', label: 'Lead' },
        { value: 'user', label: 'User' },
        { value: 'company', label: 'Company' },
        { value: 'conversation', label: 'Conversation' },
        { value: 'message', label: 'Message' },
        { value: 'event', label: 'Event' },
      ]}
      required
    />

    {config.resource === 'contact' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'update', label: 'Update' },
            { value: 'delete', label: 'Delete' },
          ]}
        />

        {(config.operation === 'create' || config.operation === 'update') && (
          <>
            <SelectField
              label="Contact Role"
              value={config.role || 'user'}
              onChange={(v) => updateConfig('role', v)}
              options={[
                { value: 'user', label: 'User' },
                { value: 'lead', label: 'Lead' },
              ]}
            />

            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required={config.operation === 'create'}
            />

            <CollectionField
              label="Additional Fields"
              value={config.additionalFields || {}}
              onChange={(v) => updateConfig('additionalFields', v)}
              options={[
                { name: 'name', displayName: 'Name', type: 'string' },
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'externalId', displayName: 'External ID', type: 'string' },
                { name: 'avatar', displayName: 'Avatar URL', type: 'string' },
                { name: 'signedUpAt', displayName: 'Signed Up At', type: 'string' },
                { name: 'lastSeenAt', displayName: 'Last Seen At', type: 'string' },
                { name: 'unsubscribedFromEmails', displayName: 'Unsubscribed', type: 'boolean' },
              ]}
            />

            <KeyValueField
              label="Custom Attributes"
              value={config.customAttributes || []}
              onChange={(v) => updateConfig('customAttributes', v)}
              keyPlaceholder="Attribute name"
              valuePlaceholder="Value"
            />
          </>
        )}
      </>
    )}

    {config.resource === 'conversation' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'reply', label: 'Reply' },
            { value: 'close', label: 'Close' },
            { value: 'open', label: 'Open' },
            { value: 'assign', label: 'Assign' },
          ]}
        />

        {config.operation === 'reply' && (
          <>
            <TextField
              label="Conversation ID"
              value={config.conversationId || ''}
              onChange={(v) => updateConfig('conversationId', v)}
              required
            />

            <SelectField
              label="Reply Type"
              value={config.replyType || 'comment'}
              onChange={(v) => updateConfig('replyType', v)}
              options={[
                { value: 'comment', label: 'Comment' },
                { value: 'note', label: 'Note' },
              ]}
            />

            <TextareaField
              label="Message"
              value={config.body || ''}
              onChange={(v) => updateConfig('body', v)}
              required
            />
          </>
        )}

        {config.operation === 'assign' && (
          <>
            <TextField
              label="Conversation ID"
              value={config.conversationId || ''}
              onChange={(v) => updateConfig('conversationId', v)}
              required
            />
            <TextField
              label="Assignee ID"
              value={config.assigneeId || ''}
              onChange={(v) => updateConfig('assigneeId', v)}
              required
            />
          </>
        )}
      </>
    )}

    {config.resource === 'message' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Message' },
          ]}
        />

        <SelectField
          label="Message Type"
          value={config.messageType || 'inapp'}
          onChange={(v) => updateConfig('messageType', v)}
          options={[
            { value: 'inapp', label: 'In-app Message' },
            { value: 'email', label: 'Email' },
          ]}
        />

        <TextField
          label="From (Admin ID)"
          value={config.from || ''}
          onChange={(v) => updateConfig('from', v)}
          required
        />

        <SelectField
          label="Send To"
          value={config.sendTo || 'userId'}
          onChange={(v) => updateConfig('sendTo', v)}
          options={[
            { value: 'userId', label: 'User ID' },
            { value: 'email', label: 'Email' },
          ]}
        />

        <ExpressionField
          label={config.sendTo === 'email' ? 'Email' : 'User ID'}
          value={config.recipient || ''}
          onChange={(v) => updateConfig('recipient', v)}
          required
        />

        <TextareaField
          label="Message Body"
          value={config.body || ''}
          onChange={(v) => updateConfig('body', v)}
          required
        />
      </>
    )}

    {config.resource === 'event' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Event' },
            { value: 'getAll', label: 'Get Events' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <TextField
              label="Event Name"
              value={config.eventName || ''}
              onChange={(v) => updateConfig('eventName', v)}
              placeholder="purchased-item"
              required
            />

            <ExpressionField
              label="User ID"
              value={config.userId || ''}
              onChange={(v) => updateConfig('userId', v)}
              required
            />

            <KeyValueField
              label="Event Metadata"
              value={config.metadata || []}
              onChange={(v) => updateConfig('metadata', v)}
              keyPlaceholder="Key"
              valuePlaceholder="Value"
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

export const CommunicationAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  // Slack
  slack_advanced: SlackAdvancedConfig,
  slack: SlackAdvancedConfig,
  slack_action: SlackAdvancedConfig,
  
  // Discord
  discord_advanced: DiscordAdvancedConfig,
  discord: DiscordAdvancedConfig,
  discord_action: DiscordAdvancedConfig,
  
  // Microsoft Teams
  microsoft_teams: MicrosoftTeamsConfig,
  teams: MicrosoftTeamsConfig,
  teams_send: MicrosoftTeamsConfig,
  teams_action: MicrosoftTeamsConfig,
  
  // Twilio
  twilio: TwilioConfig,
  twilio_sms: TwilioConfig,
  twilio_call: TwilioConfig,
  twilio_whatsapp: TwilioConfig,
  
  // SendGrid
  sendgrid: SendGridConfig,
  sendgrid_email: SendGridConfig,
  sendgrid_send: SendGridConfig,
  
  // Mailchimp
  mailchimp: MailchimpConfig,
  mailchimp_subscriber: MailchimpConfig,
  mailchimp_campaign: MailchimpConfig,
  
  // Intercom
  intercom: IntercomConfig,
  intercom_contact: IntercomConfig,
  intercom_message: IntercomConfig,
};

export default CommunicationAppConfigs;
