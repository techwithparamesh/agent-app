/**
 * Trigger Configuration Components
 * 
 * Production-ready configuration UIs for all trigger types.
 * Follows n8n patterns for comprehensive field coverage.
 */

import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  TextField,
  PasswordField,
  NumberField,
  TextareaField,
  SelectField,
  SwitchField,
  CodeField,
  CredentialField,
  ExpressionField,
  InfoBox,
  SectionHeader,
  CopyableField,
  KeyValueField,
  TagsField,
} from "./FieldComponents";
import {
  Zap,
  Clock,
  Webhook,
  MessageCircle,
  Mail,
  FileText,
  Database,
  CreditCard,
  Users,
  Calendar,
  GitBranch,
  Phone,
  Video,
  ShoppingCart,
  Bell,
  Bot,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface TriggerConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// MANUAL TRIGGER
// ============================================

export const ManualTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <InfoBox type="info" title="Manual Trigger">
      Click the "Test" button or "Execute Workflow" to run this workflow manually.
      Perfect for testing or on-demand operations.
    </InfoBox>

    <SectionHeader
      icon={<Zap className="h-4 w-4 text-amber-500" />}
      title="Execution Settings"
    />

    <SelectField
      label="Execution Mode"
      value={config.executionMode || 'once'}
      onChange={(v) => updateConfig('executionMode', v)}
      options={[
        { value: 'once', label: 'Run Once', description: 'Execute workflow once per trigger' },
        { value: 'each', label: 'Run for Each Item', description: 'Execute for each item in input' },
      ]}
      description="How to handle multiple input items"
    />

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Test Data"
      description="Provide sample data for testing"
    />

    <CodeField
      label="Input Data (JSON)"
      value={config.testData || '{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "message": "Hello!"\n}'}
      onChange={(v) => updateConfig('testData', v)}
      language="json"
      rows={8}
      description="This data will be passed to the next node when testing"
    />

    <SwitchField
      label="Keep Output Schema"
      description="Remember the data structure for downstream nodes"
      value={config.keepSchema ?? true}
      onChange={(v) => updateConfig('keepSchema', v)}
    />
  </div>
);

// ============================================
// WEBHOOK TRIGGER
// ============================================

export const WebhookTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Webhook className="h-4 w-4 text-violet-500" />}
      title="Webhook Configuration"
    />

    <CopyableField
      label="Webhook URL"
      value={config.webhookUrl || `https://api.yourapp.com/webhook/${config.webhookId || 'abc123'}`}
      description="Send HTTP requests to this URL to trigger the workflow"
    />

    <SelectField
      label="HTTP Method"
      value={config.httpMethod || 'POST'}
      onChange={(v) => updateConfig('httpMethod', v)}
      options={[
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' },
        { value: 'HEAD', label: 'HEAD' },
      ]}
    />

    <TextField
      label="Path"
      value={config.path || '/webhook'}
      onChange={(v) => updateConfig('path', v)}
      placeholder="/webhook/my-endpoint"
      description="Custom path for your webhook endpoint"
    />

    <Separator />

    <SectionHeader
      icon={<Users className="h-4 w-4 text-green-500" />}
      title="Authentication"
    />

    <SelectField
      label="Authentication Type"
      value={config.authType || 'none'}
      onChange={(v) => updateConfig('authType', v)}
      options={[
        { value: 'none', label: 'None' },
        { value: 'basicAuth', label: 'Basic Auth' },
        { value: 'headerAuth', label: 'Header Auth' },
        { value: 'jwt', label: 'JWT Token' },
        { value: 'hmac', label: 'HMAC Signature' },
      ]}
    />

    {config.authType === 'basicAuth' && (
      <>
        <TextField
          label="Username"
          value={config.username || ''}
          onChange={(v) => updateConfig('username', v)}
          placeholder="username"
        />
        <PasswordField
          label="Password"
          value={config.password || ''}
          onChange={(v) => updateConfig('password', v)}
        />
      </>
    )}

    {config.authType === 'headerAuth' && (
      <>
        <TextField
          label="Header Name"
          value={config.headerName || 'X-API-Key'}
          onChange={(v) => updateConfig('headerName', v)}
          placeholder="X-API-Key"
        />
        <PasswordField
          label="Header Value"
          value={config.headerValue || ''}
          onChange={(v) => updateConfig('headerValue', v)}
          description="The expected value for the header"
        />
      </>
    )}

    {config.authType === 'hmac' && (
      <>
        <PasswordField
          label="HMAC Secret"
          value={config.hmacSecret || ''}
          onChange={(v) => updateConfig('hmacSecret', v)}
          description="Secret key used to verify webhook signatures"
        />
        <TextField
          label="Signature Header"
          value={config.signatureHeader || 'X-Signature'}
          onChange={(v) => updateConfig('signatureHeader', v)}
          placeholder="X-Signature"
        />
      </>
    )}

    <Separator />

    <SectionHeader
      icon={<Zap className="h-4 w-4 text-amber-500" />}
      title="Response Settings"
    />

    <SwitchField
      label="Respond Immediately"
      description="Return HTTP 200 before workflow completes"
      value={config.respondImmediately ?? true}
      onChange={(v) => updateConfig('respondImmediately', v)}
    />

    {!config.respondImmediately && (
      <>
        <SelectField
          label="Response Code"
          value={config.responseCode || '200'}
          onChange={(v) => updateConfig('responseCode', v)}
          options={[
            { value: '200', label: '200 OK' },
            { value: '201', label: '201 Created' },
            { value: '204', label: '204 No Content' },
            { value: '400', label: '400 Bad Request' },
          ]}
        />
        <CodeField
          label="Response Body"
          value={config.responseBody || '{\n  "success": true,\n  "message": "Webhook received"\n}'}
          onChange={(v) => updateConfig('responseBody', v)}
          language="json"
          rows={4}
        />
      </>
    )}

    <KeyValueField
      label="Response Headers"
      value={config.responseHeaders || []}
      onChange={(v) => updateConfig('responseHeaders', v)}
      keyPlaceholder="Header name"
      valuePlaceholder="Header value"
    />
  </div>
);

// ============================================
// SCHEDULE TRIGGER
// ============================================

export const ScheduleTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Clock className="h-4 w-4 text-orange-500" />}
      title="Schedule Configuration"
    />

    <SelectField
      label="Trigger Mode"
      value={config.mode || 'cron'}
      onChange={(v) => updateConfig('mode', v)}
      options={[
        { value: 'cron', label: 'Cron Expression', description: 'Advanced scheduling' },
        { value: 'interval', label: 'Interval', description: 'Run every X minutes/hours' },
        { value: 'specificTimes', label: 'Specific Times', description: 'Run at exact times' },
      ]}
    />

    {config.mode === 'cron' && (
      <>
        <TextField
          label="Cron Expression"
          value={config.cronExpression || '0 9 * * *'}
          onChange={(v) => updateConfig('cronExpression', v)}
          placeholder="0 9 * * *"
          helpText="Use cron syntax: minute hour day month weekday"
        />
        <InfoBox type="info" title="Cron Examples">
          <ul className="space-y-1 mt-1">
            <li><code className="text-xs">0 9 * * *</code> - Every day at 9:00 AM</li>
            <li><code className="text-xs">*/15 * * * *</code> - Every 15 minutes</li>
            <li><code className="text-xs">0 0 * * 0</code> - Every Sunday at midnight</li>
            <li><code className="text-xs">0 9 1 * *</code> - First day of every month at 9 AM</li>
          </ul>
        </InfoBox>
      </>
    )}

    {config.mode === 'interval' && (
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Every"
          value={config.intervalValue || 15}
          onChange={(v) => updateConfig('intervalValue', v)}
          min={1}
        />
        <SelectField
          label="Unit"
          value={config.intervalUnit || 'minutes'}
          onChange={(v) => updateConfig('intervalUnit', v)}
          options={[
            { value: 'seconds', label: 'Seconds' },
            { value: 'minutes', label: 'Minutes' },
            { value: 'hours', label: 'Hours' },
            { value: 'days', label: 'Days' },
          ]}
        />
      </div>
    )}

    {config.mode === 'specificTimes' && (
      <>
        <SelectField
          label="Repeat"
          value={config.repeatType || 'daily'}
          onChange={(v) => updateConfig('repeatType', v)}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
        <TextField
          label="Time"
          value={config.time || '09:00'}
          onChange={(v) => updateConfig('time', v)}
          type="text"
          placeholder="09:00"
          description="24-hour format (HH:MM)"
        />
        {config.repeatType === 'weekly' && (
          <TagsField
            label="Days of Week"
            value={config.daysOfWeek || ['monday', 'wednesday', 'friday']}
            onChange={(v) => updateConfig('daysOfWeek', v)}
            suggestions={['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']}
          />
        )}
      </>
    )}

    <SelectField
      label="Timezone"
      value={config.timezone || 'Asia/Kolkata'}
      onChange={(v) => updateConfig('timezone', v)}
      options={[
        { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
        { value: 'America/New_York', label: 'America/New_York (EST)' },
        { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
        { value: 'America/Chicago', label: 'America/Chicago (CST)' },
        { value: 'Europe/London', label: 'Europe/London (GMT)' },
        { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
        { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
        { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
        { value: 'UTC', label: 'UTC' },
      ]}
    />

    <Separator />

    <SectionHeader
      icon={<Zap className="h-4 w-4 text-blue-500" />}
      title="Output"
    />

    <SwitchField
      label="Include Timestamp"
      description="Add execution timestamp to output data"
      value={config.includeTimestamp ?? true}
      onChange={(v) => updateConfig('includeTimestamp', v)}
    />
  </div>
);

// ============================================
// WHATSAPP MESSAGE TRIGGER
// ============================================

export const WhatsAppTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-green-500" />}
      title="WhatsApp Configuration"
    />

    <CredentialField
      label="WhatsApp Business Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="WhatsApp Business API"
      connected={!!config.credential}
      connectionName={config.credentialName}
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Trigger On"
      value={config.triggerOn || 'message'}
      onChange={(v) => updateConfig('triggerOn', v)}
      options={[
        { value: 'message', label: 'New Message Received' },
        { value: 'message_status', label: 'Message Status Update' },
        { value: 'button_reply', label: 'Button Reply' },
        { value: 'list_reply', label: 'List Selection' },
        { value: 'media', label: 'Media Received' },
        { value: 'location', label: 'Location Shared' },
        { value: 'contact', label: 'Contact Shared' },
        { value: 'all', label: 'All Events' },
      ]}
    />

    <SelectField
      label="Message Type Filter"
      value={config.messageType || 'all'}
      onChange={(v) => updateConfig('messageType', v)}
      options={[
        { value: 'all', label: 'All Message Types' },
        { value: 'text', label: 'Text Messages Only' },
        { value: 'image', label: 'Images Only' },
        { value: 'video', label: 'Videos Only' },
        { value: 'audio', label: 'Audio/Voice Messages' },
        { value: 'document', label: 'Documents Only' },
        { value: 'sticker', label: 'Stickers Only' },
      ]}
    />

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Filters"
    />

    <TextField
      label="Keyword Filter"
      value={config.keyword || ''}
      onChange={(v) => updateConfig('keyword', v)}
      placeholder="e.g., /start, help, order"
      description="Trigger only when message contains these keywords (comma-separated)"
    />

    <TextField
      label="Phone Number Filter"
      value={config.phoneFilter || ''}
      onChange={(v) => updateConfig('phoneFilter', v)}
      placeholder="+919876543210"
      description="Only trigger for specific phone numbers (comma-separated)"
    />

    <SwitchField
      label="Ignore Group Messages"
      description="Only process direct/private messages"
      value={config.ignoreGroups ?? false}
      onChange={(v) => updateConfig('ignoreGroups', v)}
    />

    <SwitchField
      label="Ignore Bot Messages"
      description="Skip messages from automated systems"
      value={config.ignoreBots ?? true}
      onChange={(v) => updateConfig('ignoreBots', v)}
    />

    <SwitchField
      label="Ignore Own Messages"
      description="Skip messages sent by this account"
      value={config.ignoreOwn ?? true}
      onChange={(v) => updateConfig('ignoreOwn', v)}
    />

    <Separator />

    <SectionHeader
      icon={<Zap className="h-4 w-4 text-violet-500" />}
      title="Output Options"
    />

    <SwitchField
      label="Download Media"
      description="Automatically download media files"
      value={config.downloadMedia ?? true}
      onChange={(v) => updateConfig('downloadMedia', v)}
    />

    <SwitchField
      label="Include Contact Info"
      description="Fetch sender's profile information"
      value={config.includeContact ?? false}
      onChange={(v) => updateConfig('includeContact', v)}
    />
  </div>
);

// ============================================
// TELEGRAM MESSAGE TRIGGER
// ============================================

export const TelegramTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-blue-500" />}
      title="Telegram Bot Configuration"
    />

    <CredentialField
      label="Telegram Bot"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Telegram Bot Token"
      connected={!!config.credential}
      connectionName={config.botUsername}
    />

    <PasswordField
      label="Bot Token"
      value={config.botToken || ''}
      onChange={(v) => updateConfig('botToken', v)}
      placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
      description="Get from @BotFather on Telegram"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Update Type"
      value={config.updateType || 'message'}
      onChange={(v) => updateConfig('updateType', v)}
      options={[
        { value: 'message', label: 'New Message' },
        { value: 'edited_message', label: 'Edited Message' },
        { value: 'callback_query', label: 'Inline Button Click' },
        { value: 'inline_query', label: 'Inline Query' },
        { value: 'channel_post', label: 'Channel Post' },
        { value: 'chat_member', label: 'Chat Member Update' },
        { value: 'all', label: 'All Updates' },
      ]}
    />

    <SelectField
      label="Content Type Filter"
      value={config.contentType || 'all'}
      onChange={(v) => updateConfig('contentType', v)}
      options={[
        { value: 'all', label: 'All Content Types' },
        { value: 'text', label: 'Text Messages' },
        { value: 'photo', label: 'Photos' },
        { value: 'video', label: 'Videos' },
        { value: 'audio', label: 'Audio Files' },
        { value: 'voice', label: 'Voice Messages' },
        { value: 'document', label: 'Documents' },
        { value: 'sticker', label: 'Stickers' },
        { value: 'location', label: 'Locations' },
        { value: 'contact', label: 'Contacts' },
      ]}
    />

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Command & Filters"
    />

    <TextField
      label="Command Filter"
      value={config.command || ''}
      onChange={(v) => updateConfig('command', v)}
      placeholder="/start, /help, /order"
      description="Only trigger for specific bot commands (without /)"
    />

    <TextField
      label="Chat ID Filter"
      value={config.chatIdFilter || ''}
      onChange={(v) => updateConfig('chatIdFilter', v)}
      placeholder="-100123456789"
      description="Only process messages from specific chats (comma-separated)"
    />

    <SwitchField
      label="Private Chats Only"
      description="Ignore group and channel messages"
      value={config.privateOnly ?? false}
      onChange={(v) => updateConfig('privateOnly', v)}
    />

    <SwitchField
      label="Groups Only"
      description="Ignore private messages"
      value={config.groupsOnly ?? false}
      onChange={(v) => updateConfig('groupsOnly', v)}
    />

    <Separator />

    <SectionHeader
      icon={<Zap className="h-4 w-4 text-violet-500" />}
      title="Options"
    />

    <SwitchField
      label="Download Files"
      description="Automatically download received files"
      value={config.downloadFiles ?? false}
      onChange={(v) => updateConfig('downloadFiles', v)}
    />

    <SwitchField
      label="Include Raw Update"
      description="Include original Telegram update object"
      value={config.includeRaw ?? false}
      onChange={(v) => updateConfig('includeRaw', v)}
    />
  </div>
);

// ============================================
// SLACK MESSAGE TRIGGER
// ============================================

export const SlackTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-purple-500" />}
      title="Slack Configuration"
    />

    <CredentialField
      label="Slack Workspace"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Slack OAuth"
      connected={!!config.credential}
      connectionName={config.workspaceName}
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'message'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'message', label: 'New Message' },
        { value: 'app_mention', label: 'App Mention (@bot)' },
        { value: 'reaction_added', label: 'Reaction Added' },
        { value: 'reaction_removed', label: 'Reaction Removed' },
        { value: 'file_shared', label: 'File Shared' },
        { value: 'channel_created', label: 'Channel Created' },
        { value: 'member_joined_channel', label: 'Member Joined' },
        { value: 'slash_command', label: 'Slash Command' },
      ]}
    />

    {config.eventType === 'slash_command' && (
      <TextField
        label="Command Name"
        value={config.slashCommand || ''}
        onChange={(v) => updateConfig('slashCommand', v)}
        prefix="/"
        placeholder="mycommand"
        description="The slash command to listen for"
      />
    )}

    <SelectField
      label="Channel Filter"
      value={config.channelFilter || 'all'}
      onChange={(v) => updateConfig('channelFilter', v)}
      options={[
        { value: 'all', label: 'All Channels' },
        { value: 'public', label: 'Public Channels Only' },
        { value: 'private', label: 'Private Channels Only' },
        { value: 'direct', label: 'Direct Messages Only' },
        { value: 'specific', label: 'Specific Channels' },
      ]}
    />

    {config.channelFilter === 'specific' && (
      <TagsField
        label="Channel IDs"
        value={config.channelIds || []}
        onChange={(v) => updateConfig('channelIds', v)}
        placeholder="C01234567"
        description="Specific channel IDs to monitor"
      />
    )}

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Filters"
    />

    <TextField
      label="Keyword Filter"
      value={config.keyword || ''}
      onChange={(v) => updateConfig('keyword', v)}
      placeholder="help, support, urgent"
      description="Only trigger when message contains these keywords"
    />

    <SwitchField
      label="Ignore Bot Messages"
      description="Skip messages from bots and integrations"
      value={config.ignoreBots ?? true}
      onChange={(v) => updateConfig('ignoreBots', v)}
    />

    <SwitchField
      label="Ignore Thread Replies"
      description="Only trigger on main channel messages"
      value={config.ignoreThreads ?? false}
      onChange={(v) => updateConfig('ignoreThreads', v)}
    />

    <SwitchField
      label="Include Edited Messages"
      description="Also trigger when messages are edited"
      value={config.includeEdited ?? false}
      onChange={(v) => updateConfig('includeEdited', v)}
    />
  </div>
);

// ============================================
// GMAIL TRIGGER
// ============================================

export const GmailTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Mail className="h-4 w-4 text-red-500" />}
      title="Gmail Configuration"
    />

    <CredentialField
      label="Gmail Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      connected={!!config.credential}
      connectionName={config.email}
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Email Filters"
    />

    <SelectField
      label="Label/Folder"
      value={config.label || 'INBOX'}
      onChange={(v) => updateConfig('label', v)}
      options={[
        { value: 'INBOX', label: 'Inbox' },
        { value: 'UNREAD', label: 'Unread Only' },
        { value: 'STARRED', label: 'Starred' },
        { value: 'IMPORTANT', label: 'Important' },
        { value: 'SENT', label: 'Sent' },
        { value: 'DRAFT', label: 'Drafts' },
        { value: 'SPAM', label: 'Spam' },
        { value: 'CATEGORY_PERSONAL', label: 'Personal' },
        { value: 'CATEGORY_SOCIAL', label: 'Social' },
        { value: 'CATEGORY_PROMOTIONS', label: 'Promotions' },
        { value: 'CATEGORY_UPDATES', label: 'Updates' },
      ]}
    />

    <TextField
      label="From Address"
      value={config.from || ''}
      onChange={(v) => updateConfig('from', v)}
      placeholder="sender@example.com"
      description="Filter by sender email address"
    />

    <TextField
      label="To Address"
      value={config.to || ''}
      onChange={(v) => updateConfig('to', v)}
      placeholder="recipient@example.com"
      description="Filter by recipient email address"
    />

    <TextField
      label="Subject Contains"
      value={config.subject || ''}
      onChange={(v) => updateConfig('subject', v)}
      placeholder="Order Confirmation"
      description="Filter by subject line content"
    />

    <SwitchField
      label="Has Attachment"
      description="Only trigger for emails with attachments"
      value={config.hasAttachment ?? false}
      onChange={(v) => updateConfig('hasAttachment', v)}
    />

    <Separator />

    <SectionHeader
      icon={<Zap className="h-4 w-4 text-violet-500" />}
      title="Processing Options"
    />

    <SelectField
      label="Poll Interval"
      value={config.pollInterval || '5'}
      onChange={(v) => updateConfig('pollInterval', v)}
      options={[
        { value: '1', label: 'Every 1 minute' },
        { value: '5', label: 'Every 5 minutes' },
        { value: '15', label: 'Every 15 minutes' },
        { value: '30', label: 'Every 30 minutes' },
        { value: '60', label: 'Every hour' },
      ]}
    />

    <SwitchField
      label="Download Attachments"
      description="Automatically download email attachments"
      value={config.downloadAttachments ?? false}
      onChange={(v) => updateConfig('downloadAttachments', v)}
    />

    <SwitchField
      label="Mark as Read"
      description="Mark emails as read after processing"
      value={config.markAsRead ?? false}
      onChange={(v) => updateConfig('markAsRead', v)}
    />

    <SwitchField
      label="Parse HTML Content"
      description="Extract plain text from HTML emails"
      value={config.parseHtml ?? true}
      onChange={(v) => updateConfig('parseHtml', v)}
    />
  </div>
);

// ============================================
// STRIPE WEBHOOK TRIGGER
// ============================================

export const StripeTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<CreditCard className="h-4 w-4 text-violet-500" />}
      title="Stripe Configuration"
    />

    <CredentialField
      label="Stripe Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Stripe API"
      connected={!!config.credential}
      connectionName={config.accountName}
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Webhook Events"
    />

    <SelectField
      label="Event Category"
      value={config.eventCategory || 'payment'}
      onChange={(v) => updateConfig('eventCategory', v)}
      options={[
        { value: 'payment', label: 'Payments' },
        { value: 'subscription', label: 'Subscriptions' },
        { value: 'customer', label: 'Customers' },
        { value: 'invoice', label: 'Invoices' },
        { value: 'checkout', label: 'Checkout' },
        { value: 'dispute', label: 'Disputes' },
        { value: 'all', label: 'All Events' },
      ]}
    />

    <SelectField
      label="Specific Event"
      value={config.eventType || 'payment_intent.succeeded'}
      onChange={(v) => updateConfig('eventType', v)}
      options={
        config.eventCategory === 'payment' ? [
          { value: 'payment_intent.succeeded', label: 'Payment Succeeded' },
          { value: 'payment_intent.payment_failed', label: 'Payment Failed' },
          { value: 'payment_intent.created', label: 'Payment Intent Created' },
          { value: 'payment_intent.canceled', label: 'Payment Canceled' },
          { value: 'charge.succeeded', label: 'Charge Succeeded' },
          { value: 'charge.failed', label: 'Charge Failed' },
          { value: 'charge.refunded', label: 'Charge Refunded' },
          { value: 'charge.dispute.created', label: 'Dispute Created' },
        ] : config.eventCategory === 'subscription' ? [
          { value: 'customer.subscription.created', label: 'Subscription Created' },
          { value: 'customer.subscription.updated', label: 'Subscription Updated' },
          { value: 'customer.subscription.deleted', label: 'Subscription Canceled' },
          { value: 'customer.subscription.trial_will_end', label: 'Trial Ending Soon' },
          { value: 'customer.subscription.paused', label: 'Subscription Paused' },
          { value: 'customer.subscription.resumed', label: 'Subscription Resumed' },
        ] : config.eventCategory === 'customer' ? [
          { value: 'customer.created', label: 'Customer Created' },
          { value: 'customer.updated', label: 'Customer Updated' },
          { value: 'customer.deleted', label: 'Customer Deleted' },
        ] : config.eventCategory === 'invoice' ? [
          { value: 'invoice.paid', label: 'Invoice Paid' },
          { value: 'invoice.payment_failed', label: 'Invoice Payment Failed' },
          { value: 'invoice.created', label: 'Invoice Created' },
          { value: 'invoice.finalized', label: 'Invoice Finalized' },
          { value: 'invoice.upcoming', label: 'Invoice Upcoming' },
        ] : config.eventCategory === 'checkout' ? [
          { value: 'checkout.session.completed', label: 'Checkout Completed' },
          { value: 'checkout.session.expired', label: 'Checkout Expired' },
          { value: 'checkout.session.async_payment_succeeded', label: 'Async Payment Succeeded' },
          { value: 'checkout.session.async_payment_failed', label: 'Async Payment Failed' },
        ] : [
          { value: 'all', label: 'All Events in Category' },
        ]
      }
    />

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Filters"
    />

    <SwitchField
      label="Live Mode Only"
      description="Ignore events from test mode"
      value={config.liveOnly ?? false}
      onChange={(v) => updateConfig('liveOnly', v)}
    />

    <TextField
      label="Minimum Amount (cents)"
      value={config.minAmount || ''}
      onChange={(v) => updateConfig('minAmount', v)}
      placeholder="1000"
      description="Only trigger for payments above this amount (in cents)"
    />

    <TextField
      label="Currency Filter"
      value={config.currency || ''}
      onChange={(v) => updateConfig('currency', v)}
      placeholder="usd, inr"
      description="Only trigger for specific currencies"
    />

    <TextField
      label="Product/Price Filter"
      value={config.productFilter || ''}
      onChange={(v) => updateConfig('productFilter', v)}
      placeholder="price_xxx, prod_xxx"
      description="Filter by specific product or price IDs"
    />
  </div>
);

// ============================================
// HUBSPOT TRIGGER
// ============================================

export const HubSpotTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Users className="h-4 w-4 text-orange-500" />}
      title="HubSpot Configuration"
    />

    <CredentialField
      label="HubSpot Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="HubSpot OAuth"
      connected={!!config.credential}
      connectionName={config.portalName}
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Object Type"
      value={config.objectType || 'contact'}
      onChange={(v) => updateConfig('objectType', v)}
      options={[
        { value: 'contact', label: 'Contacts' },
        { value: 'company', label: 'Companies' },
        { value: 'deal', label: 'Deals' },
        { value: 'ticket', label: 'Tickets' },
        { value: 'product', label: 'Products' },
        { value: 'line_item', label: 'Line Items' },
        { value: 'quote', label: 'Quotes' },
      ]}
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'created'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'created', label: `${config.objectType || 'Object'} Created` },
        { value: 'updated', label: `${config.objectType || 'Object'} Updated` },
        { value: 'deleted', label: `${config.objectType || 'Object'} Deleted` },
        { value: 'merged', label: `${config.objectType || 'Object'}s Merged` },
        { value: 'restored', label: `${config.objectType || 'Object'} Restored` },
        { value: 'property_change', label: 'Specific Property Changed' },
      ]}
    />

    {config.eventType === 'property_change' && (
      <TextField
        label="Property Name"
        value={config.propertyName || ''}
        onChange={(v) => updateConfig('propertyName', v)}
        placeholder="e.g., lifecyclestage, dealstage"
        description="Trigger when this property changes"
      />
    )}

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Filters"
    />

    <TextField
      label="Filter by Property"
      value={config.filterProperty || ''}
      onChange={(v) => updateConfig('filterProperty', v)}
      placeholder="lifecyclestage=lead"
      description="Only trigger when property matches value"
    />

    <TagsField
      label="Properties to Fetch"
      value={config.propertiesToFetch || ['email', 'firstname', 'lastname']}
      onChange={(v) => updateConfig('propertiesToFetch', v)}
      placeholder="Add property name"
      suggestions={['email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle', 'city', 'country']}
    />

    <SwitchField
      label="Include Association Details"
      description="Fetch associated contacts, companies, deals"
      value={config.includeAssociations ?? false}
      onChange={(v) => updateConfig('includeAssociations', v)}
    />
  </div>
);

// ============================================
// GOOGLE SHEETS TRIGGER
// ============================================

export const GoogleSheetsTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Database className="h-4 w-4 text-green-500" />}
      title="Google Sheets Configuration"
    />

    <CredentialField
      label="Google Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      connected={!!config.credential}
      connectionName={config.email}
    />

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Spreadsheet Settings"
    />

    <TextField
      label="Spreadsheet ID or URL"
      value={config.spreadsheetId || ''}
      onChange={(v) => updateConfig('spreadsheetId', v)}
      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
      description="The ID from the spreadsheet URL or full URL"
    />

    <TextField
      label="Sheet Name"
      value={config.sheetName || 'Sheet1'}
      onChange={(v) => updateConfig('sheetName', v)}
      placeholder="Sheet1"
      description="Name of the specific sheet tab"
    />

    <TextField
      label="Range (optional)"
      value={config.range || ''}
      onChange={(v) => updateConfig('range', v)}
      placeholder="A:Z or A1:D100"
      description="Specific range to monitor"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Settings"
    />

    <SelectField
      label="Trigger On"
      value={config.triggerOn || 'newRow'}
      onChange={(v) => updateConfig('triggerOn', v)}
      options={[
        { value: 'newRow', label: 'New Row Added' },
        { value: 'rowUpdated', label: 'Row Updated' },
        { value: 'rowDeleted', label: 'Row Deleted' },
        { value: 'cellChanged', label: 'Specific Cell Changed' },
        { value: 'anyChange', label: 'Any Change' },
      ]}
    />

    {config.triggerOn === 'cellChanged' && (
      <TextField
        label="Cell Reference"
        value={config.cellReference || ''}
        onChange={(v) => updateConfig('cellReference', v)}
        placeholder="A1 or B2:D2"
        description="Cell or range to watch for changes"
      />
    )}

    <SelectField
      label="Poll Interval"
      value={config.pollInterval || '5'}
      onChange={(v) => updateConfig('pollInterval', v)}
      options={[
        { value: '1', label: 'Every 1 minute' },
        { value: '5', label: 'Every 5 minutes' },
        { value: '15', label: 'Every 15 minutes' },
        { value: '30', label: 'Every 30 minutes' },
      ]}
    />

    <SwitchField
      label="Include Headers"
      description="Use first row as column headers in output"
      value={config.includeHeaders ?? true}
      onChange={(v) => updateConfig('includeHeaders', v)}
    />

    <SwitchField
      label="Skip Empty Rows"
      description="Ignore rows with all empty cells"
      value={config.skipEmpty ?? true}
      onChange={(v) => updateConfig('skipEmpty', v)}
    />
  </div>
);

// ============================================
// GITHUB TRIGGER
// ============================================

export const GitHubTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<GitBranch className="h-4 w-4 text-gray-500" />}
      title="GitHub Configuration"
    />

    <CredentialField
      label="GitHub Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="GitHub OAuth"
      connected={!!config.credential}
      connectionName={config.username}
    />

    <TextField
      label="Repository"
      value={config.repository || ''}
      onChange={(v) => updateConfig('repository', v)}
      placeholder="owner/repo-name"
      description="Repository in format owner/repo"
      required
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Webhook Events"
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'push'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'push', label: 'Push (Code Pushed)' },
        { value: 'pull_request', label: 'Pull Request' },
        { value: 'issues', label: 'Issues' },
        { value: 'issue_comment', label: 'Issue Comments' },
        { value: 'create', label: 'Branch/Tag Created' },
        { value: 'delete', label: 'Branch/Tag Deleted' },
        { value: 'release', label: 'Release Published' },
        { value: 'star', label: 'Repository Starred' },
        { value: 'fork', label: 'Repository Forked' },
        { value: 'workflow_run', label: 'Workflow Run' },
        { value: 'deployment', label: 'Deployment' },
      ]}
    />

    {config.eventType === 'pull_request' && (
      <SelectField
        label="PR Action"
        value={config.prAction || 'all'}
        onChange={(v) => updateConfig('prAction', v)}
        options={[
          { value: 'all', label: 'All Actions' },
          { value: 'opened', label: 'Opened' },
          { value: 'closed', label: 'Closed' },
          { value: 'merged', label: 'Merged' },
          { value: 'synchronize', label: 'Updated' },
          { value: 'review_requested', label: 'Review Requested' },
        ]}
      />
    )}

    {config.eventType === 'issues' && (
      <SelectField
        label="Issue Action"
        value={config.issueAction || 'all'}
        onChange={(v) => updateConfig('issueAction', v)}
        options={[
          { value: 'all', label: 'All Actions' },
          { value: 'opened', label: 'Opened' },
          { value: 'closed', label: 'Closed' },
          { value: 'reopened', label: 'Reopened' },
          { value: 'labeled', label: 'Labeled' },
          { value: 'assigned', label: 'Assigned' },
        ]}
      />
    )}

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Filters"
    />

    <TextField
      label="Branch Filter"
      value={config.branch || ''}
      onChange={(v) => updateConfig('branch', v)}
      placeholder="main, develop, feature/*"
      description="Only trigger for specific branches (supports wildcards)"
    />

    <TextField
      label="Path Filter"
      value={config.pathFilter || ''}
      onChange={(v) => updateConfig('pathFilter', v)}
      placeholder="src/**, *.ts"
      description="Only trigger when files in these paths change"
    />

    <TagsField
      label="Label Filter"
      value={config.labels || []}
      onChange={(v) => updateConfig('labels', v)}
      placeholder="Add label"
      suggestions={['bug', 'enhancement', 'documentation', 'help wanted', 'good first issue']}
    />

    <SwitchField
      label="Include Commit Details"
      description="Fetch full commit information"
      value={config.includeCommits ?? true}
      onChange={(v) => updateConfig('includeCommits', v)}
    />
  </div>
);

// ============================================
// EXPORT ALL TRIGGERS
// ============================================

export const TriggerConfigs: Record<string, React.FC<TriggerConfigProps>> = {
  manual: ManualTriggerConfig,
  webhook: WebhookTriggerConfig,
  schedule: ScheduleTriggerConfig,
  interval: ScheduleTriggerConfig,
  whatsapp_message: WhatsAppTriggerConfig,
  telegram_message: TelegramTriggerConfig,
  slack_message: SlackTriggerConfig,
  gmail_received: GmailTriggerConfig,
  outlook_received: GmailTriggerConfig, // Similar structure
  stripe_payment: StripeTriggerConfig,
  stripe_subscription: StripeTriggerConfig,
  hubspot_contact: HubSpotTriggerConfig,
  hubspot_deal: HubSpotTriggerConfig,
  google_sheet_row: GoogleSheetsTriggerConfig,
  github_event: GitHubTriggerConfig,
};

export default TriggerConfigs;
