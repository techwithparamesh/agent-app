/**
 * Additional Action Configuration Components
 * 
 * More actions: Telegram, Slack, Discord, CRM, Storage, etc.
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
  KeyValueField,
  TagsField,
} from "./FieldComponents";
import {
  MessageCircle,
  Send,
  Users,
  Database,
  FileText,
  Phone,
  Video,
  Upload,
  Download,
  Calendar,
  CreditCard,
  Mail,
  Settings,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface ActionConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// SEND TELEGRAM MESSAGE
// ============================================

export const SendTelegramConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-blue-500" />}
      title="Send Telegram Message"
    />

    <CredentialField
      label="Telegram Bot"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Telegram Bot Token"
      connected={!!config.credential}
    />

    <PasswordField
      label="Bot Token"
      value={config.botToken || ''}
      onChange={(v) => updateConfig('botToken', v)}
      placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
    />

    <Separator />

    <SectionHeader
      icon={<Send className="h-4 w-4 text-blue-500" />}
      title="Message Settings"
    />

    <ExpressionField
      label="Chat ID"
      value={config.chatId || ''}
      onChange={(v) => updateConfig('chatId', v)}
      placeholder="{{$node.trigger.data.chat.id}} or -100123456789"
      description="User ID, group ID, or channel username"
      required
    />

    <SelectField
      label="Message Type"
      value={config.messageType || 'text'}
      onChange={(v) => updateConfig('messageType', v)}
      options={[
        { value: 'text', label: 'Text Message' },
        { value: 'photo', label: 'Photo' },
        { value: 'video', label: 'Video' },
        { value: 'document', label: 'Document' },
        { value: 'audio', label: 'Audio' },
        { value: 'voice', label: 'Voice Message' },
        { value: 'location', label: 'Location' },
        { value: 'contact', label: 'Contact' },
        { value: 'poll', label: 'Poll' },
        { value: 'sticker', label: 'Sticker' },
      ]}
    />

    {config.messageType === 'text' && (
      <>
        <ExpressionField
          label="Message Text"
          value={config.text || ''}
          onChange={(v) => updateConfig('text', v)}
          placeholder="Hello {{$node.trigger.data.from.first_name}}!"
          required
        />
        <SelectField
          label="Parse Mode"
          value={config.parseMode || 'HTML'}
          onChange={(v) => updateConfig('parseMode', v)}
          options={[
            { value: 'HTML', label: 'HTML' },
            { value: 'Markdown', label: 'Markdown' },
            { value: 'MarkdownV2', label: 'MarkdownV2' },
            { value: '', label: 'None' },
          ]}
        />
        <SwitchField
          label="Disable Link Preview"
          value={config.disableLinkPreview ?? false}
          onChange={(v) => updateConfig('disableLinkPreview', v)}
        />
      </>
    )}

    {['photo', 'video', 'document', 'audio', 'voice'].includes(config.messageType) && (
      <>
        <ExpressionField
          label="File URL or ID"
          value={config.fileUrl || ''}
          onChange={(v) => updateConfig('fileUrl', v)}
          placeholder="https://example.com/image.jpg"
          required
        />
        <TextField
          label="Caption (optional)"
          value={config.caption || ''}
          onChange={(v) => updateConfig('caption', v)}
        />
      </>
    )}

    {config.messageType === 'location' && (
      <>
        <ExpressionField
          label="Latitude"
          value={config.latitude || ''}
          onChange={(v) => updateConfig('latitude', v)}
          required
        />
        <ExpressionField
          label="Longitude"
          value={config.longitude || ''}
          onChange={(v) => updateConfig('longitude', v)}
          required
        />
      </>
    )}

    {config.messageType === 'poll' && (
      <>
        <TextField
          label="Question"
          value={config.question || ''}
          onChange={(v) => updateConfig('question', v)}
          required
        />
        <TagsField
          label="Options"
          value={config.options || ['Option 1', 'Option 2']}
          onChange={(v) => updateConfig('options', v)}
          placeholder="Add option"
        />
        <SwitchField
          label="Anonymous Poll"
          value={config.isAnonymous ?? true}
          onChange={(v) => updateConfig('isAnonymous', v)}
        />
        <SwitchField
          label="Allow Multiple Answers"
          value={config.allowsMultipleAnswers ?? false}
          onChange={(v) => updateConfig('allowsMultipleAnswers', v)}
        />
      </>
    )}

    <Separator />

    <SectionHeader
      icon={<Settings className="h-4 w-4 text-gray-500" />}
      title="Options"
    />

    <SwitchField
      label="Disable Notification"
      description="Send silently without notification"
      value={config.disableNotification ?? false}
      onChange={(v) => updateConfig('disableNotification', v)}
    />

    <SwitchField
      label="Protect Content"
      description="Prevent forwarding and saving"
      value={config.protectContent ?? false}
      onChange={(v) => updateConfig('protectContent', v)}
    />

    <ExpressionField
      label="Reply to Message ID (optional)"
      value={config.replyToMessageId || ''}
      onChange={(v) => updateConfig('replyToMessageId', v)}
      placeholder="{{$node.trigger.data.message_id}}"
    />

    <SwitchField
      label="Add Inline Keyboard"
      value={config.addKeyboard ?? false}
      onChange={(v) => updateConfig('addKeyboard', v)}
    />

    {config.addKeyboard && (
      <CodeField
        label="Inline Keyboard (JSON)"
        value={config.keyboard || '[[{"text":"Button 1","callback_data":"btn1"}],[{"text":"Open URL","url":"https://example.com"}]]'}
        onChange={(v) => updateConfig('keyboard', v)}
        language="json"
        rows={4}
      />
    )}
  </div>
);

// ============================================
// SEND SLACK MESSAGE
// ============================================

export const SendSlackConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-purple-500" />}
      title="Send Slack Message"
    />

    <CredentialField
      label="Slack Workspace"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Slack OAuth"
      connected={!!config.credential}
    />

    <Separator />

    <SectionHeader
      icon={<Send className="h-4 w-4 text-blue-500" />}
      title="Message Settings"
    />

    <SelectField
      label="Send To"
      value={config.destination || 'channel'}
      onChange={(v) => updateConfig('destination', v)}
      options={[
        { value: 'channel', label: 'Channel' },
        { value: 'user', label: 'User (DM)' },
        { value: 'webhook', label: 'Incoming Webhook' },
      ]}
    />

    {config.destination === 'channel' && (
      <ExpressionField
        label="Channel"
        value={config.channel || ''}
        onChange={(v) => updateConfig('channel', v)}
        placeholder="#general or C01234567"
        description="Channel name or ID"
        required
      />
    )}

    {config.destination === 'user' && (
      <ExpressionField
        label="User"
        value={config.user || ''}
        onChange={(v) => updateConfig('user', v)}
        placeholder="@username or U01234567"
        required
      />
    )}

    {config.destination === 'webhook' && (
      <TextField
        label="Webhook URL"
        value={config.webhookUrl || ''}
        onChange={(v) => updateConfig('webhookUrl', v)}
        placeholder="https://hooks.slack.com/services/..."
        required
      />
    )}

    <SelectField
      label="Message Format"
      value={config.format || 'text'}
      onChange={(v) => updateConfig('format', v)}
      options={[
        { value: 'text', label: 'Simple Text' },
        { value: 'blocks', label: 'Block Kit (Rich)' },
        { value: 'attachment', label: 'Attachment' },
      ]}
    />

    {config.format === 'text' && (
      <ExpressionField
        label="Message Text"
        value={config.text || ''}
        onChange={(v) => updateConfig('text', v)}
        placeholder="Hello {{$node.trigger.data.user}}!"
        description="Supports Slack markdown"
        required
      />
    )}

    {config.format === 'blocks' && (
      <CodeField
        label="Block Kit JSON"
        value={config.blocks || '[\n  {\n    "type": "section",\n    "text": {\n      "type": "mrkdwn",\n      "text": "Hello *world*!"\n    }\n  }\n]'}
        onChange={(v) => updateConfig('blocks', v)}
        language="json"
        rows={10}
        description="Use Slack Block Kit Builder to design"
      />
    )}

    {config.format === 'attachment' && (
      <>
        <TextField
          label="Fallback Text"
          value={config.fallback || ''}
          onChange={(v) => updateConfig('fallback', v)}
          required
        />
        <TextField
          label="Title"
          value={config.title || ''}
          onChange={(v) => updateConfig('title', v)}
        />
        <TextareaField
          label="Text"
          value={config.attachmentText || ''}
          onChange={(v) => updateConfig('attachmentText', v)}
          rows={3}
        />
        <TextField
          label="Color"
          value={config.color || '#36a64f'}
          onChange={(v) => updateConfig('color', v)}
          placeholder="#36a64f"
        />
      </>
    )}

    <Separator />

    <SectionHeader
      icon={<Settings className="h-4 w-4 text-gray-500" />}
      title="Options"
    />

    <TextField
      label="Username Override"
      value={config.username || ''}
      onChange={(v) => updateConfig('username', v)}
      placeholder="Bot Name"
    />

    <TextField
      label="Icon URL or Emoji"
      value={config.iconUrl || ''}
      onChange={(v) => updateConfig('iconUrl', v)}
      placeholder=":robot_face: or https://..."
    />

    <SwitchField
      label="Unfurl Links"
      description="Show previews for URLs"
      value={config.unfurlLinks ?? true}
      onChange={(v) => updateConfig('unfurlLinks', v)}
    />

    <SwitchField
      label="Reply in Thread"
      value={config.replyInThread ?? false}
      onChange={(v) => updateConfig('replyInThread', v)}
    />

    {config.replyInThread && (
      <ExpressionField
        label="Thread Timestamp"
        value={config.threadTs || ''}
        onChange={(v) => updateConfig('threadTs', v)}
        placeholder="{{$node.trigger.data.ts}}"
      />
    )}
  </div>
);

// ============================================
// SEND DISCORD MESSAGE
// ============================================

export const SendDiscordConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-indigo-500" />}
      title="Send Discord Message"
    />

    <SelectField
      label="Send Method"
      value={config.method || 'webhook'}
      onChange={(v) => updateConfig('method', v)}
      options={[
        { value: 'webhook', label: 'Webhook' },
        { value: 'bot', label: 'Bot Token' },
      ]}
    />

    {config.method === 'webhook' ? (
      <TextField
        label="Webhook URL"
        value={config.webhookUrl || ''}
        onChange={(v) => updateConfig('webhookUrl', v)}
        placeholder="https://discord.com/api/webhooks/..."
        required
      />
    ) : (
      <>
        <PasswordField
          label="Bot Token"
          value={config.botToken || ''}
          onChange={(v) => updateConfig('botToken', v)}
          required
        />
        <ExpressionField
          label="Channel ID"
          value={config.channelId || ''}
          onChange={(v) => updateConfig('channelId', v)}
          required
        />
      </>
    )}

    <Separator />

    <SectionHeader
      icon={<Send className="h-4 w-4 text-blue-500" />}
      title="Message Content"
    />

    <ExpressionField
      label="Message Content"
      value={config.content || ''}
      onChange={(v) => updateConfig('content', v)}
      placeholder="Hello from the workflow!"
      description="Plain text message (up to 2000 chars)"
    />

    <SwitchField
      label="Add Embed"
      value={config.addEmbed ?? false}
      onChange={(v) => updateConfig('addEmbed', v)}
    />

    {config.addEmbed && (
      <>
        <TextField
          label="Embed Title"
          value={config.embedTitle || ''}
          onChange={(v) => updateConfig('embedTitle', v)}
        />
        <TextareaField
          label="Embed Description"
          value={config.embedDescription || ''}
          onChange={(v) => updateConfig('embedDescription', v)}
          rows={3}
        />
        <TextField
          label="Embed Color (hex)"
          value={config.embedColor || '#5865F2'}
          onChange={(v) => updateConfig('embedColor', v)}
          placeholder="#5865F2"
        />
        <TextField
          label="Embed URL"
          value={config.embedUrl || ''}
          onChange={(v) => updateConfig('embedUrl', v)}
        />
        <TextField
          label="Thumbnail URL"
          value={config.thumbnailUrl || ''}
          onChange={(v) => updateConfig('thumbnailUrl', v)}
        />
        <TextField
          label="Image URL"
          value={config.imageUrl || ''}
          onChange={(v) => updateConfig('imageUrl', v)}
        />
        <CodeField
          label="Embed Fields (JSON)"
          value={config.embedFields || '[{"name":"Field 1","value":"Value 1","inline":true}]'}
          onChange={(v) => updateConfig('embedFields', v)}
          language="json"
          rows={4}
        />
      </>
    )}

    <Separator />

    <SectionHeader
      icon={<Settings className="h-4 w-4 text-gray-500" />}
      title="Options"
    />

    <TextField
      label="Username Override"
      value={config.username || ''}
      onChange={(v) => updateConfig('username', v)}
    />

    <TextField
      label="Avatar URL"
      value={config.avatarUrl || ''}
      onChange={(v) => updateConfig('avatarUrl', v)}
    />

    <SwitchField
      label="Text to Speech (TTS)"
      value={config.tts ?? false}
      onChange={(v) => updateConfig('tts', v)}
    />
  </div>
);

// ============================================
// HUBSPOT CRM
// ============================================

export const HubSpotActionConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Users className="h-4 w-4 text-orange-500" />}
      title="HubSpot CRM"
    />

    <CredentialField
      label="HubSpot Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="HubSpot OAuth"
      connected={!!config.credential}
    />

    <Separator />

    <SectionHeader
      icon={<Settings className="h-4 w-4 text-gray-500" />}
      title="Operation"
    />

    <SelectField
      label="Object Type"
      value={config.objectType || 'contact'}
      onChange={(v) => updateConfig('objectType', v)}
      options={[
        { value: 'contact', label: 'Contact' },
        { value: 'company', label: 'Company' },
        { value: 'deal', label: 'Deal' },
        { value: 'ticket', label: 'Ticket' },
        { value: 'product', label: 'Product' },
        { value: 'note', label: 'Note/Engagement' },
      ]}
    />

    <SelectField
      label="Operation"
      value={config.operation || 'create'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'get', label: 'Get by ID' },
        { value: 'search', label: 'Search' },
        { value: 'delete', label: 'Delete' },
        { value: 'associate', label: 'Create Association' },
      ]}
    />

    {config.operation === 'update' || config.operation === 'get' || config.operation === 'delete' ? (
      <ExpressionField
        label={`${config.objectType} ID`}
        value={config.objectId || ''}
        onChange={(v) => updateConfig('objectId', v)}
        placeholder="{{$node.previous.data.id}}"
        required
      />
    ) : null}

    {config.operation === 'search' && (
      <>
        <SelectField
          label="Search By"
          value={config.searchBy || 'email'}
          onChange={(v) => updateConfig('searchBy', v)}
          options={
            config.objectType === 'contact'
              ? [
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' },
                  { value: 'firstname', label: 'First Name' },
                  { value: 'lastname', label: 'Last Name' },
                ]
              : config.objectType === 'company'
              ? [
                  { value: 'name', label: 'Company Name' },
                  { value: 'domain', label: 'Domain' },
                ]
              : config.objectType === 'deal'
              ? [
                  { value: 'dealname', label: 'Deal Name' },
                  { value: 'pipeline', label: 'Pipeline' },
                ]
              : [{ value: 'name', label: 'Name' }]
          }
        />
        <ExpressionField
          label="Search Value"
          value={config.searchValue || ''}
          onChange={(v) => updateConfig('searchValue', v)}
          required
        />
      </>
    )}

    {(config.operation === 'create' || config.operation === 'update') && (
      <>
        <Separator />
        <SectionHeader
          icon={<FileText className="h-4 w-4 text-blue-500" />}
          title="Properties"
        />

        {config.objectType === 'contact' && (
          <>
            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              placeholder="{{$node.trigger.data.email}}"
              required={config.operation === 'create'}
            />
            <ExpressionField
              label="First Name"
              value={config.firstname || ''}
              onChange={(v) => updateConfig('firstname', v)}
            />
            <ExpressionField
              label="Last Name"
              value={config.lastname || ''}
              onChange={(v) => updateConfig('lastname', v)}
            />
            <ExpressionField
              label="Phone"
              value={config.phone || ''}
              onChange={(v) => updateConfig('phone', v)}
            />
            <ExpressionField
              label="Company"
              value={config.company || ''}
              onChange={(v) => updateConfig('company', v)}
            />
            <ExpressionField
              label="Job Title"
              value={config.jobtitle || ''}
              onChange={(v) => updateConfig('jobtitle', v)}
            />
            <SelectField
              label="Lifecycle Stage"
              value={config.lifecyclestage || ''}
              onChange={(v) => updateConfig('lifecyclestage', v)}
              options={[
                { value: '', label: 'Not Set' },
                { value: 'subscriber', label: 'Subscriber' },
                { value: 'lead', label: 'Lead' },
                { value: 'marketingqualifiedlead', label: 'Marketing Qualified Lead' },
                { value: 'salesqualifiedlead', label: 'Sales Qualified Lead' },
                { value: 'opportunity', label: 'Opportunity' },
                { value: 'customer', label: 'Customer' },
                { value: 'evangelist', label: 'Evangelist' },
              ]}
            />
          </>
        )}

        {config.objectType === 'deal' && (
          <>
            <ExpressionField
              label="Deal Name"
              value={config.dealname || ''}
              onChange={(v) => updateConfig('dealname', v)}
              required={config.operation === 'create'}
            />
            <ExpressionField
              label="Amount"
              value={config.amount || ''}
              onChange={(v) => updateConfig('amount', v)}
            />
            <TextField
              label="Pipeline"
              value={config.pipeline || 'default'}
              onChange={(v) => updateConfig('pipeline', v)}
            />
            <TextField
              label="Deal Stage"
              value={config.dealstage || ''}
              onChange={(v) => updateConfig('dealstage', v)}
            />
            <TextField
              label="Close Date"
              value={config.closedate || ''}
              onChange={(v) => updateConfig('closedate', v)}
              placeholder="YYYY-MM-DD"
            />
          </>
        )}

        <Separator />

        <SectionHeader
          icon={<Settings className="h-4 w-4 text-gray-500" />}
          title="Additional Properties"
        />

        <KeyValueField
          label="Custom Properties"
          value={config.customProperties || []}
          onChange={(v) => updateConfig('customProperties', v)}
          keyPlaceholder="Property name"
          valuePlaceholder="Value"
        />
      </>
    )}
  </div>
);

// ============================================
// GOOGLE SHEETS ACTION
// ============================================

export const GoogleSheetsActionConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Database className="h-4 w-4 text-green-500" />}
      title="Google Sheets"
    />

    <CredentialField
      label="Google Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      connected={!!config.credential}
    />

    <TextField
      label="Spreadsheet ID or URL"
      value={config.spreadsheetId || ''}
      onChange={(v) => updateConfig('spreadsheetId', v)}
      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
      required
    />

    <TextField
      label="Sheet Name"
      value={config.sheetName || 'Sheet1'}
      onChange={(v) => updateConfig('sheetName', v)}
    />

    <Separator />

    <SelectField
      label="Operation"
      value={config.operation || 'append'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'append', label: 'Append Row' },
        { value: 'update', label: 'Update Row' },
        { value: 'read', label: 'Read Data' },
        { value: 'delete', label: 'Delete Row' },
        { value: 'clear', label: 'Clear Range' },
        { value: 'lookup', label: 'Lookup Value' },
      ]}
    />

    {config.operation === 'append' && (
      <>
        <SelectField
          label="Data Input Method"
          value={config.inputMethod || 'columns'}
          onChange={(v) => updateConfig('inputMethod', v)}
          options={[
            { value: 'columns', label: 'Map to Columns' },
            { value: 'json', label: 'JSON Object' },
            { value: 'array', label: 'Array of Values' },
          ]}
        />

        {config.inputMethod === 'columns' && (
          <KeyValueField
            label="Column Mapping"
            value={config.columnMapping || []}
            onChange={(v) => updateConfig('columnMapping', v)}
            keyPlaceholder="Column (A, B, C...)"
            valuePlaceholder="Value or {{expression}}"
          />
        )}

        {config.inputMethod === 'json' && (
          <CodeField
            label="Row Data (JSON)"
            value={config.rowData || '{\n  "Name": "{{$node.trigger.data.name}}",\n  "Email": "{{$node.trigger.data.email}}"\n}'}
            onChange={(v) => updateConfig('rowData', v)}
            language="json"
            rows={6}
            description="Keys should match header row"
          />
        )}
      </>
    )}

    {config.operation === 'update' && (
      <>
        <TextField
          label="Row Number"
          value={config.rowNumber || ''}
          onChange={(v) => updateConfig('rowNumber', v)}
          placeholder="2"
          description="Row number to update (1-based)"
          required
        />
        <KeyValueField
          label="Column Updates"
          value={config.columnUpdates || []}
          onChange={(v) => updateConfig('columnUpdates', v)}
          keyPlaceholder="Column (A, B, C...)"
          valuePlaceholder="New value"
        />
      </>
    )}

    {config.operation === 'read' && (
      <>
        <TextField
          label="Range"
          value={config.range || 'A:Z'}
          onChange={(v) => updateConfig('range', v)}
          placeholder="A1:D100 or A:Z"
        />
        <SwitchField
          label="First Row is Header"
          value={config.headerRow ?? true}
          onChange={(v) => updateConfig('headerRow', v)}
        />
        <NumberField
          label="Max Rows"
          value={config.maxRows || 100}
          onChange={(v) => updateConfig('maxRows', v)}
          min={1}
          max={10000}
        />
      </>
    )}

    {config.operation === 'lookup' && (
      <>
        <TextField
          label="Lookup Column"
          value={config.lookupColumn || 'A'}
          onChange={(v) => updateConfig('lookupColumn', v)}
          placeholder="A"
          required
        />
        <ExpressionField
          label="Lookup Value"
          value={config.lookupValue || ''}
          onChange={(v) => updateConfig('lookupValue', v)}
          placeholder="{{$node.trigger.data.email}}"
          required
        />
        <TextField
          label="Return Columns"
          value={config.returnColumns || ''}
          onChange={(v) => updateConfig('returnColumns', v)}
          placeholder="B,C,D or leave empty for all"
        />
      </>
    )}
  </div>
);

// ============================================
// STRIPE ACTION
// ============================================

export const StripeActionConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<CreditCard className="h-4 w-4 text-violet-500" />}
      title="Stripe"
    />

    <CredentialField
      label="Stripe Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Stripe API"
      connected={!!config.credential}
    />

    <PasswordField
      label="Secret Key"
      value={config.secretKey || ''}
      onChange={(v) => updateConfig('secretKey', v)}
      placeholder="sk_live_..."
    />

    <Separator />

    <SelectField
      label="Resource"
      value={config.resource || 'customer'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'customer', label: 'Customers' },
        { value: 'paymentIntent', label: 'Payment Intents' },
        { value: 'charge', label: 'Charges' },
        { value: 'subscription', label: 'Subscriptions' },
        { value: 'invoice', label: 'Invoices' },
        { value: 'product', label: 'Products' },
        { value: 'price', label: 'Prices' },
        { value: 'refund', label: 'Refunds' },
      ]}
    />

    <SelectField
      label="Operation"
      value={config.operation || 'create'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'get', label: 'Get' },
        { value: 'list', label: 'List All' },
        { value: 'delete', label: 'Delete' },
      ]}
    />

    {(config.operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
      <ExpressionField
        label={`${config.resource} ID`}
        value={config.resourceId || ''}
        onChange={(v) => updateConfig('resourceId', v)}
        placeholder="cus_xxx or pi_xxx"
        required
      />
    )}

    {config.resource === 'customer' && config.operation === 'create' && (
      <>
        <ExpressionField
          label="Email"
          value={config.email || ''}
          onChange={(v) => updateConfig('email', v)}
          required
        />
        <ExpressionField
          label="Name"
          value={config.name || ''}
          onChange={(v) => updateConfig('name', v)}
        />
        <TextField
          label="Phone"
          value={config.phone || ''}
          onChange={(v) => updateConfig('phone', v)}
        />
        <TextField
          label="Description"
          value={config.description || ''}
          onChange={(v) => updateConfig('description', v)}
        />
      </>
    )}

    {config.resource === 'paymentIntent' && config.operation === 'create' && (
      <>
        <ExpressionField
          label="Amount (in cents)"
          value={config.amount || ''}
          onChange={(v) => updateConfig('amount', v)}
          placeholder="1000"
          description="Amount in smallest currency unit"
          required
        />
        <SelectField
          label="Currency"
          value={config.currency || 'usd'}
          onChange={(v) => updateConfig('currency', v)}
          options={[
            { value: 'usd', label: 'USD' },
            { value: 'inr', label: 'INR' },
            { value: 'eur', label: 'EUR' },
            { value: 'gbp', label: 'GBP' },
          ]}
        />
        <ExpressionField
          label="Customer ID"
          value={config.customer || ''}
          onChange={(v) => updateConfig('customer', v)}
          placeholder="cus_xxx"
        />
        <SwitchField
          label="Automatic Payment Methods"
          value={config.automaticPaymentMethods ?? true}
          onChange={(v) => updateConfig('automaticPaymentMethods', v)}
        />
      </>
    )}

    {config.resource === 'subscription' && config.operation === 'create' && (
      <>
        <ExpressionField
          label="Customer ID"
          value={config.customer || ''}
          onChange={(v) => updateConfig('customer', v)}
          required
        />
        <ExpressionField
          label="Price ID"
          value={config.priceId || ''}
          onChange={(v) => updateConfig('priceId', v)}
          placeholder="price_xxx"
          required
        />
        <NumberField
          label="Trial Days"
          value={config.trialDays || 0}
          onChange={(v) => updateConfig('trialDays', v)}
          min={0}
        />
      </>
    )}

    <Separator />

    <KeyValueField
      label="Metadata"
      value={config.metadata || []}
      onChange={(v) => updateConfig('metadata', v)}
      keyPlaceholder="Key"
      valuePlaceholder="Value"
    />
  </div>
);

// ============================================
// FILE UPLOAD / CLOUD STORAGE
// ============================================

export const CloudStorageConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Upload className="h-4 w-4 text-blue-500" />}
      title="Cloud Storage"
    />

    <SelectField
      label="Provider"
      value={config.provider || 's3'}
      onChange={(v) => updateConfig('provider', v)}
      options={[
        { value: 's3', label: 'Amazon S3' },
        { value: 'gcs', label: 'Google Cloud Storage' },
        { value: 'azure', label: 'Azure Blob Storage' },
        { value: 'cloudinary', label: 'Cloudinary' },
        { value: 'supabase', label: 'Supabase Storage' },
      ]}
    />

    <CredentialField
      label={`${config.provider || 'Storage'} Credentials`}
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Cloud Storage"
      connected={!!config.credential}
    />

    {config.provider === 's3' && (
      <>
        <TextField
          label="Bucket Name"
          value={config.bucket || ''}
          onChange={(v) => updateConfig('bucket', v)}
          required
        />
        <TextField
          label="Region"
          value={config.region || 'us-east-1'}
          onChange={(v) => updateConfig('region', v)}
        />
        <TextField
          label="Access Key ID"
          value={config.accessKeyId || ''}
          onChange={(v) => updateConfig('accessKeyId', v)}
        />
        <PasswordField
          label="Secret Access Key"
          value={config.secretAccessKey || ''}
          onChange={(v) => updateConfig('secretAccessKey', v)}
        />
      </>
    )}

    <Separator />

    <SelectField
      label="Operation"
      value={config.operation || 'upload'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'upload', label: 'Upload File' },
        { value: 'download', label: 'Download File' },
        { value: 'delete', label: 'Delete File' },
        { value: 'list', label: 'List Files' },
        { value: 'getUrl', label: 'Get Signed URL' },
      ]}
    />

    {config.operation === 'upload' && (
      <>
        <ExpressionField
          label="File Content/URL"
          value={config.fileContent || ''}
          onChange={(v) => updateConfig('fileContent', v)}
          placeholder="{{$node.previous.data.fileUrl}}"
          description="File URL, base64, or binary data"
          required
        />
        <ExpressionField
          label="File Path/Key"
          value={config.filePath || ''}
          onChange={(v) => updateConfig('filePath', v)}
          placeholder="uploads/{{$execution.id}}/file.pdf"
          required
        />
        <TextField
          label="Content Type"
          value={config.contentType || ''}
          onChange={(v) => updateConfig('contentType', v)}
          placeholder="application/pdf"
        />
        <SwitchField
          label="Public Access"
          value={config.publicAccess ?? false}
          onChange={(v) => updateConfig('publicAccess', v)}
        />
      </>
    )}

    {(config.operation === 'download' || config.operation === 'delete' || config.operation === 'getUrl') && (
      <ExpressionField
        label="File Path/Key"
        value={config.filePath || ''}
        onChange={(v) => updateConfig('filePath', v)}
        placeholder="uploads/file.pdf"
        required
      />
    )}

    {config.operation === 'getUrl' && (
      <NumberField
        label="Expiry (seconds)"
        value={config.expiry || 3600}
        onChange={(v) => updateConfig('expiry', v)}
        min={60}
        max={604800}
        description="How long the signed URL is valid"
      />
    )}

    {config.operation === 'list' && (
      <>
        <TextField
          label="Prefix/Folder"
          value={config.prefix || ''}
          onChange={(v) => updateConfig('prefix', v)}
          placeholder="uploads/"
        />
        <NumberField
          label="Max Results"
          value={config.maxResults || 100}
          onChange={(v) => updateConfig('maxResults', v)}
          min={1}
          max={1000}
        />
      </>
    )}
  </div>
);

// ============================================
// TWILIO SMS
// ============================================

export const TwilioSmsConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Phone className="h-4 w-4 text-red-500" />}
      title="Send SMS (Twilio)"
    />

    <CredentialField
      label="Twilio Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Twilio"
      connected={!!config.credential}
    />

    <TextField
      label="Account SID"
      value={config.accountSid || ''}
      onChange={(v) => updateConfig('accountSid', v)}
      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    />

    <PasswordField
      label="Auth Token"
      value={config.authToken || ''}
      onChange={(v) => updateConfig('authToken', v)}
    />

    <Separator />

    <SelectField
      label="Operation"
      value={config.operation || 'send'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'send', label: 'Send SMS' },
        { value: 'call', label: 'Make Voice Call' },
        { value: 'lookup', label: 'Phone Number Lookup' },
      ]}
    />

    {config.operation === 'send' && (
      <>
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
          placeholder="{{$node.trigger.data.phone}}"
          required
        />
        <ExpressionField
          label="Message"
          value={config.body || ''}
          onChange={(v) => updateConfig('body', v)}
          placeholder="Hello {{$node.trigger.data.name}}!"
          required
        />
        <TextField
          label="Media URL (MMS)"
          value={config.mediaUrl || ''}
          onChange={(v) => updateConfig('mediaUrl', v)}
          placeholder="https://example.com/image.jpg"
          description="Optional image/media URL"
        />
      </>
    )}

    {config.operation === 'call' && (
      <>
        <ExpressionField
          label="From Number"
          value={config.from || ''}
          onChange={(v) => updateConfig('from', v)}
          required
        />
        <ExpressionField
          label="To Number"
          value={config.to || ''}
          onChange={(v) => updateConfig('to', v)}
          required
        />
        <TextareaField
          label="TwiML or URL"
          value={config.twiml || '<Response><Say>Hello from your workflow!</Say></Response>'}
          onChange={(v) => updateConfig('twiml', v)}
          rows={4}
          description="TwiML instructions or URL to TwiML"
        />
      </>
    )}

    {config.operation === 'lookup' && (
      <ExpressionField
        label="Phone Number"
        value={config.phoneNumber || ''}
        onChange={(v) => updateConfig('phoneNumber', v)}
        placeholder="+1234567890"
        required
      />
    )}
  </div>
);

// ============================================
// CALENDAR (GOOGLE CALENDAR)
// ============================================

export const GoogleCalendarConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Calendar className="h-4 w-4 text-blue-500" />}
      title="Google Calendar"
    />

    <CredentialField
      label="Google Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      connected={!!config.credential}
    />

    <TextField
      label="Calendar ID"
      value={config.calendarId || 'primary'}
      onChange={(v) => updateConfig('calendarId', v)}
      placeholder="primary or calendar@group.calendar.google.com"
    />

    <Separator />

    <SelectField
      label="Operation"
      value={config.operation || 'create'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'create', label: 'Create Event' },
        { value: 'update', label: 'Update Event' },
        { value: 'get', label: 'Get Event' },
        { value: 'delete', label: 'Delete Event' },
        { value: 'list', label: 'List Events' },
        { value: 'freebusy', label: 'Check Free/Busy' },
      ]}
    />

    {(config.operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
      <ExpressionField
        label="Event ID"
        value={config.eventId || ''}
        onChange={(v) => updateConfig('eventId', v)}
        required
      />
    )}

    {(config.operation === 'create' || config.operation === 'update') && (
      <>
        <ExpressionField
          label="Event Title"
          value={config.summary || ''}
          onChange={(v) => updateConfig('summary', v)}
          placeholder="Meeting with {{$node.trigger.data.name}}"
          required={config.operation === 'create'}
        />
        <TextareaField
          label="Description"
          value={config.description || ''}
          onChange={(v) => updateConfig('description', v)}
          rows={3}
        />
        <TextField
          label="Location"
          value={config.location || ''}
          onChange={(v) => updateConfig('location', v)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Start Time"
            value={config.startTime || ''}
            onChange={(v) => updateConfig('startTime', v)}
            placeholder="2024-01-15T10:00:00"
            required={config.operation === 'create'}
          />
          <TextField
            label="End Time"
            value={config.endTime || ''}
            onChange={(v) => updateConfig('endTime', v)}
            placeholder="2024-01-15T11:00:00"
            required={config.operation === 'create'}
          />
        </div>
        <SelectField
          label="Timezone"
          value={config.timezone || 'Asia/Kolkata'}
          onChange={(v) => updateConfig('timezone', v)}
          options={[
            { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
            { value: 'America/New_York', label: 'America/New_York (EST)' },
            { value: 'Europe/London', label: 'Europe/London (GMT)' },
            { value: 'UTC', label: 'UTC' },
          ]}
        />
        <TagsField
          label="Attendees"
          value={config.attendees || []}
          onChange={(v) => updateConfig('attendees', v)}
          placeholder="Add email"
        />
        <SwitchField
          label="Send Notifications"
          value={config.sendNotifications ?? true}
          onChange={(v) => updateConfig('sendNotifications', v)}
        />
        <SelectField
          label="Add Video Conference"
          value={config.conferenceType || 'none'}
          onChange={(v) => updateConfig('conferenceType', v)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'hangoutsMeet', label: 'Google Meet' },
          ]}
        />
      </>
    )}

    {config.operation === 'list' && (
      <>
        <TextField
          label="Start Date"
          value={config.timeMin || ''}
          onChange={(v) => updateConfig('timeMin', v)}
          placeholder="2024-01-01"
        />
        <TextField
          label="End Date"
          value={config.timeMax || ''}
          onChange={(v) => updateConfig('timeMax', v)}
          placeholder="2024-01-31"
        />
        <NumberField
          label="Max Results"
          value={config.maxResults || 10}
          onChange={(v) => updateConfig('maxResults', v)}
          min={1}
          max={2500}
        />
      </>
    )}
  </div>
);

// ============================================
// EXPORT ALL ADDITIONAL ACTION CONFIGS
// ============================================

export const AdditionalActionConfigs: Record<string, React.FC<ActionConfigProps>> = {
  send_telegram: SendTelegramConfig,
  telegram_send: SendTelegramConfig,
  send_slack: SendSlackConfig,
  slack_send: SendSlackConfig,
  slack_message: SendSlackConfig,
  send_discord: SendDiscordConfig,
  discord_send: SendDiscordConfig,
  discord_message: SendDiscordConfig,
  hubspot_create: HubSpotActionConfig,
  hubspot_update: HubSpotActionConfig,
  hubspot_action: HubSpotActionConfig,
  google_sheets: GoogleSheetsActionConfig,
  google_sheets_append: GoogleSheetsActionConfig,
  google_sheets_update: GoogleSheetsActionConfig,
  sheets_append: GoogleSheetsActionConfig,
  stripe: StripeActionConfig,
  stripe_create_customer: StripeActionConfig,
  stripe_create_charge: StripeActionConfig,
  stripe_create_subscription: StripeActionConfig,
  cloud_storage: CloudStorageConfig,
  s3_upload: CloudStorageConfig,
  gcs_upload: CloudStorageConfig,
  file_upload: CloudStorageConfig,
  send_sms: TwilioSmsConfig,
  twilio_sms: TwilioSmsConfig,
  twilio_call: TwilioSmsConfig,
  google_calendar: GoogleCalendarConfig,
  calendar_create: GoogleCalendarConfig,
};

export default AdditionalActionConfigs;
