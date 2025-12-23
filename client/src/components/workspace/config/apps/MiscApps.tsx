/**
 * Miscellaneous App Configurations
 * 
 * n8n-style configurations for:
 * - WhatsApp Business
 * - Telegram
 * - Outlook
 * - SMTP
 * - Google Forms
 * - Freshsales
 * - Firebase
 * - Replicate
 */

import React from "react";
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  SwitchField,
  CredentialField,
  ExpressionField,
  CollectionField,
  CodeField,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// WHATSAPP BUSINESS CONFIG
// ============================================

export const WhatsAppConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="WhatsApp Business API Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="WhatsApp Business API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'message'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'message', label: 'Message' },
        { value: 'template', label: 'Template Message' },
        { value: 'media', label: 'Media' },
        { value: 'contact', label: 'Contact' },
      ]}
      required
    />

    {resource === 'message' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Message' },
            { value: 'sendMedia', label: 'Send Media Message' },
            { value: 'sendLocation', label: 'Send Location' },
            { value: 'reply', label: 'Reply to Message' },
          ]}
        />

        <ExpressionField
          label="Phone Number"
          value={config.phoneNumber || ''}
          onChange={(v) => updateConfig('phoneNumber', v)}
          placeholder="+1234567890"
          description="Recipient's phone number with country code"
          required
        />

        {operation === 'send' && (
          <TextareaField
            label="Message"
            value={config.message || ''}
            onChange={(v) => updateConfig('message', v)}
            rows={4}
            required
          />
        )}

        {operation === 'sendMedia' && (
          <>
            <SelectField
              label="Media Type"
              value={config.mediaType || 'image'}
              onChange={(v) => updateConfig('mediaType', v)}
              options={[
                { value: 'image', label: 'Image' },
                { value: 'video', label: 'Video' },
                { value: 'audio', label: 'Audio' },
                { value: 'document', label: 'Document' },
              ]}
            />

            <ExpressionField
              label="Media URL"
              value={config.mediaUrl || ''}
              onChange={(v) => updateConfig('mediaUrl', v)}
              required
            />

            <TextField
              label="Caption"
              value={config.caption || ''}
              onChange={(v) => updateConfig('caption', v)}
            />
          </>
        )}

        {operation === 'sendLocation' && (
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

            <TextField
              label="Location Name"
              value={config.locationName || ''}
              onChange={(v) => updateConfig('locationName', v)}
            />

            <TextField
              label="Address"
              value={config.address || ''}
              onChange={(v) => updateConfig('address', v)}
            />
          </>
        )}

        {operation === 'reply' && (
          <>
            <ExpressionField
              label="Message ID"
              value={config.messageId || ''}
              onChange={(v) => updateConfig('messageId', v)}
              description="ID of message to reply to"
              required
            />

            <TextareaField
              label="Reply Message"
              value={config.message || ''}
              onChange={(v) => updateConfig('message', v)}
              rows={3}
              required
            />
          </>
        )}
      </>
    )}

    {resource === 'template' && (
      <>
        <ExpressionField
          label="Phone Number"
          value={config.phoneNumber || ''}
          onChange={(v) => updateConfig('phoneNumber', v)}
          placeholder="+1234567890"
          required
        />

        <ExpressionField
          label="Template Name"
          value={config.templateName || ''}
          onChange={(v) => updateConfig('templateName', v)}
          required
        />

        <SelectField
          label="Language"
          value={config.language || 'en'}
          onChange={(v) => updateConfig('language', v)}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'pt', label: 'Portuguese' },
            { value: 'hi', label: 'Hindi' },
            { value: 'ar', label: 'Arabic' },
          ]}
        />

        <CodeField
          label="Template Parameters"
          value={config.parameters || '[]'}
          onChange={(v: string) => updateConfig('parameters', v)}
          language="json"
          description='Array of parameter values: ["value1", "value2"]'
        />
      </>
    )}

    {resource === 'media' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'upload'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'upload', label: 'Upload Media' },
            { value: 'get', label: 'Get Media URL' },
            { value: 'delete', label: 'Delete Media' },
          ]}
        />

        {operation === 'upload' && (
          <>
            <ExpressionField
              label="File URL"
              value={config.fileUrl || ''}
              onChange={(v) => updateConfig('fileUrl', v)}
              required
            />

            <SelectField
              label="Media Type"
              value={config.mediaType || 'image/jpeg'}
              onChange={(v) => updateConfig('mediaType', v)}
              options={[
                { value: 'image/jpeg', label: 'JPEG Image' },
                { value: 'image/png', label: 'PNG Image' },
                { value: 'video/mp4', label: 'MP4 Video' },
                { value: 'audio/mpeg', label: 'MP3 Audio' },
                { value: 'application/pdf', label: 'PDF Document' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'delete') && (
          <ExpressionField
            label="Media ID"
            value={config.mediaId || ''}
            onChange={(v) => updateConfig('mediaId', v)}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// TELEGRAM CONFIG
// ============================================

export const TelegramConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Telegram Bot Token"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Telegram Bot API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'message'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'message', label: 'Message' },
        { value: 'chat', label: 'Chat' },
        { value: 'file', label: 'File' },
        { value: 'callback', label: 'Callback Query' },
      ]}
      required
    />

    {resource === 'message' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Message' },
            { value: 'sendPhoto', label: 'Send Photo' },
            { value: 'sendDocument', label: 'Send Document' },
            { value: 'sendVideo', label: 'Send Video' },
            { value: 'edit', label: 'Edit Message' },
            { value: 'delete', label: 'Delete Message' },
          ]}
        />

        <ExpressionField
          label="Chat ID"
          value={config.chatId || ''}
          onChange={(v) => updateConfig('chatId', v)}
          description="User ID, group ID, or @channel_username"
          required
        />

        {operation === 'send' && (
          <>
            <TextareaField
              label="Message"
              value={config.text || ''}
              onChange={(v) => updateConfig('text', v)}
              rows={4}
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
              ]}
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'disableNotification', displayName: 'Silent Message', type: 'boolean' },
                { name: 'protectContent', displayName: 'Protect Content', type: 'boolean' },
                { name: 'disableWebPagePreview', displayName: 'Disable Link Preview', type: 'boolean' },
              ]}
            />

            <CodeField
              label="Inline Keyboard (optional)"
              value={config.replyMarkup || ''}
              onChange={(v: string) => updateConfig('replyMarkup', v)}
              language="json"
              description="JSON array for inline keyboard buttons"
            />
          </>
        )}

        {(operation === 'sendPhoto' || config.operation === 'sendDocument' || config.operation === 'sendVideo') && (
          <>
            <ExpressionField
              label="File URL or File ID"
              value={config.fileUrl || ''}
              onChange={(v) => updateConfig('fileUrl', v)}
              required
            />

            <TextField
              label="Caption"
              value={config.caption || ''}
              onChange={(v) => updateConfig('caption', v)}
            />
          </>
        )}

        {(operation === 'edit' || config.operation === 'delete') && (
          <ExpressionField
            label="Message ID"
            value={config.messageId || ''}
            onChange={(v) => updateConfig('messageId', v)}
            required
          />
        )}

        {operation === 'edit' && (
          <TextareaField
            label="New Message Text"
            value={config.text || ''}
            onChange={(v) => updateConfig('text', v)}
            rows={3}
            required
          />
        )}
      </>
    )}

    {resource === 'chat' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Chat Info' },
            { value: 'getMembers', label: 'Get Chat Members Count' },
            { value: 'leave', label: 'Leave Chat' },
          ]}
        />

        <ExpressionField
          label="Chat ID"
          value={config.chatId || ''}
          onChange={(v) => updateConfig('chatId', v)}
          required
        />
      </>
    )}

    {resource === 'callback' && (
      <>
        <ExpressionField
          label="Callback Query ID"
          value={config.callbackQueryId || ''}
          onChange={(v) => updateConfig('callbackQueryId', v)}
          required
        />

        <TextField
          label="Answer Text"
          value={config.answerText || ''}
          onChange={(v) => updateConfig('answerText', v)}
        />

        <SwitchField
          label="Show Alert"
          value={config.showAlert || false}
          onChange={(v) => updateConfig('showAlert', v)}
        />
      </>
    )}
  </div>
  );
};

// ============================================
// OUTLOOK CONFIG
// ============================================

export const OutlookConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Microsoft OAuth2 Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Microsoft OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'email'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'email', label: 'Email' },
        { value: 'folder', label: 'Folder' },
        { value: 'draft', label: 'Draft' },
        { value: 'contact', label: 'Contact' },
      ]}
      required
    />

    {resource === 'email' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Email' },
            { value: 'get', label: 'Get Email' },
            { value: 'getAll', label: 'Get All Emails' },
            { value: 'reply', label: 'Reply to Email' },
            { value: 'move', label: 'Move Email' },
            { value: 'delete', label: 'Delete Email' },
          ]}
        />

        {operation === 'send' && (
          <>
            <ExpressionField
              label="To"
              value={config.to || ''}
              onChange={(v) => updateConfig('to', v)}
              placeholder="email@example.com"
              required
            />

            <ExpressionField
              label="Subject"
              value={config.subject || ''}
              onChange={(v) => updateConfig('subject', v)}
              required
            />

            <TextareaField
              label="Body"
              value={config.body || ''}
              onChange={(v) => updateConfig('body', v)}
              rows={6}
              required
            />

            <SelectField
              label="Body Type"
              value={config.bodyType || 'HTML'}
              onChange={(v) => updateConfig('bodyType', v)}
              options={[
                { value: 'HTML', label: 'HTML' },
                { value: 'Text', label: 'Plain Text' },
              ]}
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'cc', displayName: 'CC', type: 'string' },
                { name: 'bcc', displayName: 'BCC', type: 'string' },
                { name: 'importance', displayName: 'Importance', type: 'options', options: [
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                ]},
                { name: 'saveToSentItems', displayName: 'Save to Sent Items', type: 'boolean' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'reply' || config.operation === 'delete') && (
          <ExpressionField
            label="Email ID"
            value={config.emailId || ''}
            onChange={(v) => updateConfig('emailId', v)}
            required
          />
        )}

        {operation === 'getAll' && (
          <CollectionField
            label="Filters"
            value={config.filters || {}}
            onChange={(v) => updateConfig('filters', v)}
            options={[
              { name: 'folder', displayName: 'Folder', type: 'options', options: [
                { value: 'inbox', label: 'Inbox' },
                { value: 'sentitems', label: 'Sent Items' },
                { value: 'drafts', label: 'Drafts' },
                { value: 'deleteditems', label: 'Deleted Items' },
              ]},
              { name: 'unread', displayName: 'Unread Only', type: 'boolean' },
              { name: 'hasAttachments', displayName: 'Has Attachments', type: 'boolean' },
              { name: 'limit', displayName: 'Limit', type: 'number' },
            ]}
          />
        )}

        {operation === 'reply' && (
          <TextareaField
            label="Reply Message"
            value={config.replyBody || ''}
            onChange={(v) => updateConfig('replyBody', v)}
            rows={4}
            required
          />
        )}

        {operation === 'move' && (
          <>
            <ExpressionField
              label="Email ID"
              value={config.emailId || ''}
              onChange={(v) => updateConfig('emailId', v)}
              required
            />

            <ExpressionField
              label="Destination Folder ID"
              value={config.folderId || ''}
              onChange={(v) => updateConfig('folderId', v)}
              required
            />
          </>
        )}
      </>
    )}

    {resource === 'contact' && (
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

        {operation === 'create' && (
          <>
            <ExpressionField
              label="First Name"
              value={config.firstName || ''}
              onChange={(v) => updateConfig('firstName', v)}
              required
            />

            <TextField
              label="Last Name"
              value={config.lastName || ''}
              onChange={(v) => updateConfig('lastName', v)}
            />

            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
            />

            <TextField
              label="Phone"
              value={config.phone || ''}
              onChange={(v) => updateConfig('phone', v)}
            />

            <TextField
              label="Company"
              value={config.company || ''}
              onChange={(v) => updateConfig('company', v)}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Contact ID"
            value={config.contactId || ''}
            onChange={(v) => updateConfig('contactId', v)}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// SMTP CONFIG
// ============================================

export const SMTPConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <TextField
      label="SMTP Host"
      value={config.host || ''}
      onChange={(v) => updateConfig('host', v)}
      placeholder="smtp.example.com"
      required
    />

    <NumberField
      label="Port"
      value={config.port || 587}
      onChange={(v) => updateConfig('port', v)}
      required
    />

    <SwitchField
      label="Use SSL/TLS"
      value={config.secure || false}
      onChange={(v) => updateConfig('secure', v)}
    />

    <TextField
      label="Username"
      value={config.username || ''}
      onChange={(v) => updateConfig('username', v)}
    />

    <CredentialField
      label="Password"
      value={config.password || ''}
      onChange={(v) => updateConfig('password', v)}
      credentialType="SMTP Password"
    />

    <ExpressionField
      label="From Email"
      value={config.from || ''}
      onChange={(v) => updateConfig('from', v)}
      placeholder="sender@example.com"
      required
    />

    <TextField
      label="From Name"
      value={config.fromName || ''}
      onChange={(v) => updateConfig('fromName', v)}
    />

    <ExpressionField
      label="To"
      value={config.to || ''}
      onChange={(v) => updateConfig('to', v)}
      placeholder="recipient@example.com"
      description="Comma-separated for multiple recipients"
      required
    />

    <ExpressionField
      label="Subject"
      value={config.subject || ''}
      onChange={(v) => updateConfig('subject', v)}
      required
    />

    <TextareaField
      label="Body"
      value={config.body || ''}
      onChange={(v) => updateConfig('body', v)}
      rows={6}
      required
    />

    <SelectField
      label="Content Type"
      value={config.contentType || 'html'}
      onChange={(v) => updateConfig('contentType', v)}
      options={[
        { value: 'html', label: 'HTML' },
        { value: 'text', label: 'Plain Text' },
      ]}
    />

    <CollectionField
      label="Options"
      value={config.options || {}}
      onChange={(v) => updateConfig('options', v)}
      options={[
        { name: 'cc', displayName: 'CC', type: 'string' },
        { name: 'bcc', displayName: 'BCC', type: 'string' },
        { name: 'replyTo', displayName: 'Reply-To', type: 'string' },
        { name: 'priority', displayName: 'Priority', type: 'options', options: [
          { value: 'high', label: 'High' },
          { value: 'normal', label: 'Normal' },
          { value: 'low', label: 'Low' },
        ]},
      ]}
    />
  </div>
);

// ============================================
// GOOGLE FORMS CONFIG
// ============================================

export const GoogleFormsConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Google OAuth2 Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'getResponses'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'getResponses', label: 'Get Responses' },
        { value: 'getForm', label: 'Get Form Info' },
        { value: 'watchResponses', label: 'Watch New Responses (Trigger)' },
      ]}
      required
    />

    <ExpressionField
      label="Form ID"
      value={config.formId || ''}
      onChange={(v) => updateConfig('formId', v)}
      description="Found in the form URL"
      required
    />

    {operation === 'getResponses' && (
      <CollectionField
        label="Options"
        value={config.options || {}}
        onChange={(v) => updateConfig('options', v)}
        options={[
          { name: 'limit', displayName: 'Limit', type: 'number' },
          { name: 'includeEmail', displayName: 'Include Respondent Email', type: 'boolean' },
        ]}
      />
    )}

    {operation === 'watchResponses' && (
      <>
        <ExpressionField
          label="Webhook URL"
          value={config.webhookUrl || ''}
          onChange={(v) => updateConfig('webhookUrl', v)}
          description="URL to receive new response notifications"
        />

        <SwitchField
          label="Include Full Response"
          value={config.includeFullResponse || true}
          onChange={(v) => updateConfig('includeFullResponse', v)}
        />
      </>
    )}
  </div>
  );
};

// ============================================
// FRESHSALES CONFIG
// ============================================

export const FreshsalesConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Freshsales API Key"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Freshsales API"
      required
    />

    <TextField
      label="Domain"
      value={config.domain || ''}
      onChange={(v) => updateConfig('domain', v)}
      placeholder="yourcompany.freshsales.io"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'contact'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'contact', label: 'Contact' },
        { value: 'lead', label: 'Lead' },
        { value: 'deal', label: 'Deal' },
        { value: 'account', label: 'Account' },
        { value: 'task', label: 'Task' },
      ]}
      required
    />

    {resource === 'contact' && (
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

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required
            />

            <TextField
              label="First Name"
              value={config.firstName || ''}
              onChange={(v) => updateConfig('firstName', v)}
            />

            <TextField
              label="Last Name"
              value={config.lastName || ''}
              onChange={(v) => updateConfig('lastName', v)}
            />

            <CollectionField
              label="Additional Fields"
              value={config.additionalFields || {}}
              onChange={(v) => updateConfig('additionalFields', v)}
              options={[
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'mobile', displayName: 'Mobile', type: 'string' },
                { name: 'company', displayName: 'Company', type: 'string' },
                { name: 'jobTitle', displayName: 'Job Title', type: 'string' },
                { name: 'address', displayName: 'Address', type: 'string' },
                { name: 'city', displayName: 'City', type: 'string' },
                { name: 'state', displayName: 'State', type: 'string' },
                { name: 'country', displayName: 'Country', type: 'string' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Contact ID"
            value={config.contactId || ''}
            onChange={(v) => updateConfig('contactId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'lead' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Lead' },
            { value: 'get', label: 'Get Lead' },
            { value: 'getAll', label: 'Get All Leads' },
            { value: 'update', label: 'Update Lead' },
            { value: 'convert', label: 'Convert to Contact' },
            { value: 'delete', label: 'Delete Lead' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required
            />

            <TextField
              label="First Name"
              value={config.firstName || ''}
              onChange={(v) => updateConfig('firstName', v)}
            />

            <TextField
              label="Last Name"
              value={config.lastName || ''}
              onChange={(v) => updateConfig('lastName', v)}
            />

            <TextField
              label="Company"
              value={config.company || ''}
              onChange={(v) => updateConfig('company', v)}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'convert' || config.operation === 'delete') && (
          <ExpressionField
            label="Lead ID"
            value={config.leadId || ''}
            onChange={(v) => updateConfig('leadId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'deal' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Deal' },
            { value: 'get', label: 'Get Deal' },
            { value: 'getAll', label: 'Get All Deals' },
            { value: 'update', label: 'Update Deal' },
            { value: 'delete', label: 'Delete Deal' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Deal Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <NumberField
              label="Amount"
              value={config.amount || 0}
              onChange={(v) => updateConfig('amount', v)}
            />

            <SelectField
              label="Stage"
              value={config.stage || 'new'}
              onChange={(v) => updateConfig('stage', v)}
              options={[
                { value: 'new', label: 'New' },
                { value: 'qualification', label: 'Qualification' },
                { value: 'proposal', label: 'Proposal' },
                { value: 'negotiation', label: 'Negotiation' },
                { value: 'won', label: 'Won' },
                { value: 'lost', label: 'Lost' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Deal ID"
            value={config.dealId || ''}
            onChange={(v) => updateConfig('dealId', v)}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// FIREBASE CONFIG
// ============================================

export const FirebaseConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const service = config.service || '';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Firebase Service Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Firebase Service Account"
      required
    />

    <TextField
      label="Project ID"
      value={config.projectId || ''}
      onChange={(v) => updateConfig('projectId', v)}
      required
    />

    <SelectField
      label="Service"
      value={config.service || 'firestore'}
      onChange={(v) => updateConfig('service', v)}
      options={[
        { value: 'firestore', label: 'Firestore' },
        { value: 'realtime', label: 'Realtime Database' },
        { value: 'storage', label: 'Cloud Storage' },
        { value: 'auth', label: 'Authentication' },
      ]}
      required
    />

    {config.service === 'firestore' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Document' },
            { value: 'get', label: 'Get Document' },
            { value: 'getAll', label: 'Get All Documents' },
            { value: 'update', label: 'Update Document' },
            { value: 'delete', label: 'Delete Document' },
            { value: 'query', label: 'Query Documents' },
          ]}
        />

        <ExpressionField
          label="Collection"
          value={config.collection || ''}
          onChange={(v) => updateConfig('collection', v)}
          required
        />

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Document ID"
            value={config.documentId || ''}
            onChange={(v) => updateConfig('documentId', v)}
            required
          />
        )}

        {(operation === 'create' || config.operation === 'update') && (
          <CodeField
            label="Document Data"
            value={config.data || '{}'}
            onChange={(v: string) => updateConfig('data', v)}
            language="json"
            required
          />
        )}

        {operation === 'query' && (
          <>
            <TextField
              label="Field"
              value={config.queryField || ''}
              onChange={(v) => updateConfig('queryField', v)}
              required
            />

            <SelectField
              label="Operator"
              value={config.queryOperator || '=='}
              onChange={(v) => updateConfig('queryOperator', v)}
              options={[
                { value: '==', label: 'Equal (==)' },
                { value: '!=', label: 'Not Equal (!=)' },
                { value: '<', label: 'Less Than (<)' },
                { value: '<=', label: 'Less Than or Equal (<=)' },
                { value: '>', label: 'Greater Than (>)' },
                { value: '>=', label: 'Greater Than or Equal (>=)' },
                { value: 'array-contains', label: 'Array Contains' },
                { value: 'in', label: 'In' },
              ]}
            />

            <ExpressionField
              label="Value"
              value={config.queryValue || ''}
              onChange={(v) => updateConfig('queryValue', v)}
              required
            />

            <NumberField
              label="Limit"
              value={config.limit || 100}
              onChange={(v) => updateConfig('limit', v)}
            />
          </>
        )}
      </>
    )}

    {config.service === 'realtime' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'set'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'set', label: 'Set Data' },
            { value: 'get', label: 'Get Data' },
            { value: 'push', label: 'Push Data' },
            { value: 'update', label: 'Update Data' },
            { value: 'remove', label: 'Remove Data' },
          ]}
        />

        <ExpressionField
          label="Path"
          value={config.path || ''}
          onChange={(v) => updateConfig('path', v)}
          placeholder="/users/user123"
          required
        />

        {(operation === 'set' || config.operation === 'push' || config.operation === 'update') && (
          <CodeField
            label="Data"
            value={config.data || '{}'}
            onChange={(v: string) => updateConfig('data', v)}
            language="json"
            required
          />
        )}
      </>
    )}

    {config.service === 'storage' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'upload'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'upload', label: 'Upload File' },
            { value: 'download', label: 'Get Download URL' },
            { value: 'delete', label: 'Delete File' },
            { value: 'list', label: 'List Files' },
          ]}
        />

        <ExpressionField
          label="Bucket"
          value={config.bucket || ''}
          onChange={(v) => updateConfig('bucket', v)}
          placeholder="your-bucket.appspot.com"
        />

        <ExpressionField
          label="File Path"
          value={config.filePath || ''}
          onChange={(v) => updateConfig('filePath', v)}
          placeholder="uploads/file.pdf"
          required
        />

        {operation === 'upload' && (
          <ExpressionField
            label="File URL or Binary Data"
            value={config.fileData || ''}
            onChange={(v) => updateConfig('fileData', v)}
            required
          />
        )}
      </>
    )}

    {config.service === 'auth' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'getUser'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'getUser', label: 'Get User' },
            { value: 'createUser', label: 'Create User' },
            { value: 'updateUser', label: 'Update User' },
            { value: 'deleteUser', label: 'Delete User' },
            { value: 'listUsers', label: 'List Users' },
          ]}
        />

        {(operation === 'getUser' || config.operation === 'updateUser' || config.operation === 'deleteUser') && (
          <ExpressionField
            label="User ID (UID)"
            value={config.uid || ''}
            onChange={(v) => updateConfig('uid', v)}
            required
          />
        )}

        {operation === 'createUser' && (
          <>
            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required
            />

            <CredentialField
              label="Password"
              value={config.password || ''}
              onChange={(v) => updateConfig('password', v)}
              credentialType="Password"
              required
            />

            <TextField
              label="Display Name"
              value={config.displayName || ''}
              onChange={(v) => updateConfig('displayName', v)}
            />
          </>
        )}

        {operation === 'updateUser' && (
          <CollectionField
            label="Update Fields"
            value={config.updateFields || {}}
            onChange={(v) => updateConfig('updateFields', v)}
            options={[
              { name: 'email', displayName: 'Email', type: 'string' },
              { name: 'displayName', displayName: 'Display Name', type: 'string' },
              { name: 'phoneNumber', displayName: 'Phone Number', type: 'string' },
              { name: 'emailVerified', displayName: 'Email Verified', type: 'boolean' },
              { name: 'disabled', displayName: 'Disabled', type: 'boolean' },
            ]}
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// REPLICATE CONFIG
// ============================================

export const ReplicateConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Replicate API Token"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Replicate API"
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'run'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'run', label: 'Run Prediction' },
        { value: 'get', label: 'Get Prediction' },
        { value: 'cancel', label: 'Cancel Prediction' },
        { value: 'listModels', label: 'List Models' },
      ]}
      required
    />

    {operation === 'run' && (
      <>
        <ExpressionField
          label="Model"
          value={config.model || ''}
          onChange={(v) => updateConfig('model', v)}
          placeholder="owner/model:version"
          description="e.g., stability-ai/sdxl:version"
          required
        />

        <CodeField
          label="Input"
          value={config.input || '{}'}
          onChange={(v: string) => updateConfig('input', v)}
          language="json"
          description="Model input parameters as JSON"
          required
        />

        <SwitchField
          label="Wait for Completion"
          value={config.waitForCompletion !== false}
          onChange={(v) => updateConfig('waitForCompletion', v)}
          description="Wait for the prediction to complete before returning"
        />

        {!config.waitForCompletion && (
          <ExpressionField
            label="Webhook URL"
            value={config.webhookUrl || ''}
            onChange={(v) => updateConfig('webhookUrl', v)}
            description="URL to receive prediction completion notification"
          />
        )}

        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'timeout', displayName: 'Timeout (seconds)', type: 'number' },
            { name: 'stream', displayName: 'Stream Output', type: 'boolean' },
          ]}
        />
      </>
    )}

    {(operation === 'get' || config.operation === 'cancel') && (
      <ExpressionField
        label="Prediction ID"
        value={config.predictionId || ''}
        onChange={(v) => updateConfig('predictionId', v)}
        required
      />
    )}

    {operation === 'listModels' && (
      <CollectionField
        label="Filters"
        value={config.filters || {}}
        onChange={(v) => updateConfig('filters', v)}
        options={[
          { name: 'owner', displayName: 'Owner', type: 'string' },
          { name: 'cursor', displayName: 'Cursor (Pagination)', type: 'string' },
        ]}
      />
    )}
  </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export const MiscAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  // WhatsApp
  whatsapp: WhatsAppConfig,
  whatsapp_business: WhatsAppConfig,
  
  // Telegram
  telegram: TelegramConfig,
  telegram_bot: TelegramConfig,
  
  // Email
  outlook: OutlookConfig,
  microsoft_outlook: OutlookConfig,
  
  smtp: SMTPConfig,
  email_smtp: SMTPConfig,
  
  // Google
  google_forms: GoogleFormsConfig,
  gforms: GoogleFormsConfig,
  
  // CRM
  freshsales: FreshsalesConfig,
  freshworks_crm: FreshsalesConfig,
  
  // Storage
  firebase: FirebaseConfig,
  google_firebase: FirebaseConfig,
  
  // AI
  replicate: ReplicateConfig,
  replicate_ai: ReplicateConfig,
};

export default MiscAppConfigs;
