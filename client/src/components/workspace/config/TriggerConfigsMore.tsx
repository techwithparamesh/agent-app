/**
 * Additional Trigger Configuration Components
 * 
 * More triggers: Discord, Teams, SMS, Forms, E-commerce, Support, Calendly, etc.
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
  InfoBox,
  SectionHeader,
  CopyableField,
  TagsField,
} from "./FieldComponents";
import {
  MessageCircle,
  Mail,
  FileText,
  ShoppingCart,
  Database,
  Calendar,
  Headphones,
  Phone,
  Video,
  Bell,
  Globe,
  Users,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface TriggerConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// DISCORD TRIGGER
// ============================================

export const DiscordTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-indigo-500" />}
      title="Discord Bot Configuration"
    />

    <CredentialField
      label="Discord Bot"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Discord Bot Token"
      connected={!!config.credential}
      connectionName={config.botName}
    />

    <PasswordField
      label="Bot Token"
      value={config.botToken || ''}
      onChange={(v) => updateConfig('botToken', v)}
      description="Get from Discord Developer Portal"
    />

    <TextField
      label="Server (Guild) ID"
      value={config.guildId || ''}
      onChange={(v) => updateConfig('guildId', v)}
      placeholder="123456789012345678"
      description="Leave empty to listen to all servers"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'messageCreate'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'messageCreate', label: 'New Message' },
        { value: 'messageReactionAdd', label: 'Reaction Added' },
        { value: 'interactionCreate', label: 'Slash Command / Button Click' },
        { value: 'guildMemberAdd', label: 'Member Joined' },
        { value: 'guildMemberRemove', label: 'Member Left' },
        { value: 'voiceStateUpdate', label: 'Voice Channel Update' },
        { value: 'channelCreate', label: 'Channel Created' },
        { value: 'threadCreate', label: 'Thread Created' },
      ]}
    />

    {config.eventType === 'interactionCreate' && (
      <TextField
        label="Command Name"
        value={config.commandName || ''}
        onChange={(v) => updateConfig('commandName', v)}
        placeholder="mycommand"
        description="Slash command to listen for (without /)"
      />
    )}

    <TextField
      label="Channel ID Filter"
      value={config.channelId || ''}
      onChange={(v) => updateConfig('channelId', v)}
      placeholder="123456789012345678"
      description="Only trigger for specific channel"
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
      placeholder="!help, @bot, support"
      description="Only trigger when message contains keywords"
    />

    <TextField
      label="Prefix Filter"
      value={config.prefix || ''}
      onChange={(v) => updateConfig('prefix', v)}
      placeholder="!"
      description="Only trigger messages starting with prefix"
    />

    <SwitchField
      label="Ignore Bot Messages"
      description="Skip messages from other bots"
      value={config.ignoreBots ?? true}
      onChange={(v) => updateConfig('ignoreBots', v)}
    />

    <SwitchField
      label="DMs Only"
      description="Only respond to direct messages"
      value={config.dmOnly ?? false}
      onChange={(v) => updateConfig('dmOnly', v)}
    />
  </div>
);

// ============================================
// MICROSOFT TEAMS TRIGGER
// ============================================

export const TeamsTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-blue-500" />}
      title="Microsoft Teams Configuration"
    />

    <CredentialField
      label="Microsoft Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Microsoft OAuth"
      connected={!!config.credential}
      connectionName={config.accountName}
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
        { value: 'mention', label: 'Bot Mentioned' },
        { value: 'channelCreated', label: 'Channel Created' },
        { value: 'memberAdded', label: 'Member Added' },
        { value: 'memberRemoved', label: 'Member Removed' },
        { value: 'reactionAdded', label: 'Reaction Added' },
        { value: 'cardAction', label: 'Adaptive Card Action' },
      ]}
    />

    <SelectField
      label="Scope"
      value={config.scope || 'all'}
      onChange={(v) => updateConfig('scope', v)}
      options={[
        { value: 'all', label: 'All Conversations' },
        { value: 'channel', label: 'Channels Only' },
        { value: 'personal', label: 'Personal (1:1) Only' },
        { value: 'groupChat', label: 'Group Chats Only' },
      ]}
    />

    <TextField
      label="Team ID Filter"
      value={config.teamId || ''}
      onChange={(v) => updateConfig('teamId', v)}
      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      description="Only trigger for specific team"
    />

    <TextField
      label="Channel ID Filter"
      value={config.channelId || ''}
      onChange={(v) => updateConfig('channelId', v)}
      placeholder="19:xxxxxxxxxxxx@thread.tacv2"
      description="Only trigger for specific channel"
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
      placeholder="help, support, urgent"
      description="Only trigger when message contains keywords"
    />

    <SwitchField
      label="Ignore Own Messages"
      description="Skip messages sent by the bot"
      value={config.ignoreOwn ?? true}
      onChange={(v) => updateConfig('ignoreOwn', v)}
    />

    <SwitchField
      label="Include File Attachments"
      description="Process messages with attached files"
      value={config.includeFiles ?? true}
      onChange={(v) => updateConfig('includeFiles', v)}
    />
  </div>
);

// ============================================
// SMS/TWILIO TRIGGER
// ============================================

export const SmsTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Phone className="h-4 w-4 text-red-500" />}
      title="SMS/Twilio Configuration"
    />

    <CredentialField
      label="Twilio Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Twilio API"
      connected={!!config.credential}
      connectionName={config.accountName}
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

    <TextField
      label="Phone Number"
      value={config.phoneNumber || ''}
      onChange={(v) => updateConfig('phoneNumber', v)}
      placeholder="+1234567890"
      description="Your Twilio phone number"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'incoming'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'incoming', label: 'Incoming SMS' },
        { value: 'delivered', label: 'Message Delivered' },
        { value: 'failed', label: 'Message Failed' },
        { value: 'incoming_call', label: 'Incoming Call' },
        { value: 'call_completed', label: 'Call Completed' },
        { value: 'voicemail', label: 'Voicemail Received' },
      ]}
    />

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Filters"
    />

    <TextField
      label="From Number Filter"
      value={config.fromFilter || ''}
      onChange={(v) => updateConfig('fromFilter', v)}
      placeholder="+919876543210"
      description="Only trigger for messages from specific numbers"
    />

    <TextField
      label="Keyword Filter"
      value={config.keyword || ''}
      onChange={(v) => updateConfig('keyword', v)}
      placeholder="SUBSCRIBE, HELP, STOP"
      description="Only trigger when message contains keywords"
    />

    <SwitchField
      label="Include Media"
      description="Trigger for MMS with media attachments"
      value={config.includeMedia ?? true}
      onChange={(v) => updateConfig('includeMedia', v)}
    />
  </div>
);

// ============================================
// TYPEFORM TRIGGER
// ============================================

export const TypeformTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<FileText className="h-4 w-4 text-purple-500" />}
      title="Typeform Configuration"
    />

    <CredentialField
      label="Typeform Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Typeform API"
      connected={!!config.credential}
      connectionName={config.accountEmail}
    />

    <PasswordField
      label="API Token"
      value={config.apiToken || ''}
      onChange={(v) => updateConfig('apiToken', v)}
      description="Get from Typeform settings > Personal tokens"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Form Settings"
    />

    <TextField
      label="Form ID"
      value={config.formId || ''}
      onChange={(v) => updateConfig('formId', v)}
      placeholder="abc123XYZ"
      description="Form ID from the Typeform URL"
      required
    />

    <SelectField
      label="Trigger On"
      value={config.triggerOn || 'form_response'}
      onChange={(v) => updateConfig('triggerOn', v)}
      options={[
        { value: 'form_response', label: 'New Form Response' },
      ]}
    />

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Output Options"
    />

    <SwitchField
      label="Include Hidden Fields"
      description="Include hidden fields in output"
      value={config.includeHidden ?? true}
      onChange={(v) => updateConfig('includeHidden', v)}
    />

    <SwitchField
      label="Include Metadata"
      description="Include response metadata (browser, platform)"
      value={config.includeMetadata ?? false}
      onChange={(v) => updateConfig('includeMetadata', v)}
    />

    <SwitchField
      label="Use Field Names"
      description="Use field titles instead of IDs as keys"
      value={config.useFieldNames ?? true}
      onChange={(v) => updateConfig('useFieldNames', v)}
    />
  </div>
);

// ============================================
// CALENDLY TRIGGER
// ============================================

export const CalendlyTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Calendar className="h-4 w-4 text-blue-500" />}
      title="Calendly Configuration"
    />

    <CredentialField
      label="Calendly Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Calendly OAuth"
      connected={!!config.credential}
      connectionName={config.accountEmail}
    />

    <PasswordField
      label="Personal Access Token"
      value={config.apiToken || ''}
      onChange={(v) => updateConfig('apiToken', v)}
      description="Get from Calendly integrations page"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'invitee.created'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'invitee.created', label: 'Meeting Scheduled' },
        { value: 'invitee.canceled', label: 'Meeting Canceled' },
        { value: 'invitee.rescheduled', label: 'Meeting Rescheduled' },
        { value: 'routing_form_submission.created', label: 'Routing Form Submitted' },
      ]}
    />

    <TextField
      label="Event Type Filter"
      value={config.eventTypeFilter || ''}
      onChange={(v) => updateConfig('eventTypeFilter', v)}
      placeholder="30 Minute Meeting"
      description="Only trigger for specific meeting types"
    />

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Options"
    />

    <SwitchField
      label="Include Questions & Answers"
      description="Include invitee's form responses"
      value={config.includeAnswers ?? true}
      onChange={(v) => updateConfig('includeAnswers', v)}
    />

    <SwitchField
      label="Include Host Info"
      description="Include meeting host details"
      value={config.includeHost ?? false}
      onChange={(v) => updateConfig('includeHost', v)}
    />

    <SwitchField
      label="Include Tracking UTM"
      description="Include UTM tracking parameters"
      value={config.includeUtm ?? false}
      onChange={(v) => updateConfig('includeUtm', v)}
    />
  </div>
);

// ============================================
// SHOPIFY TRIGGER
// ============================================

export const ShopifyTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<ShoppingCart className="h-4 w-4 text-green-600" />}
      title="Shopify Configuration"
    />

    <CredentialField
      label="Shopify Store"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Shopify API"
      connected={!!config.credential}
      connectionName={config.storeName}
    />

    <TextField
      label="Store Domain"
      value={config.storeDomain || ''}
      onChange={(v) => updateConfig('storeDomain', v)}
      placeholder="your-store.myshopify.com"
      description="Your Shopify store domain"
    />

    <PasswordField
      label="Access Token"
      value={config.accessToken || ''}
      onChange={(v) => updateConfig('accessToken', v)}
      description="Admin API access token"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Webhook Events"
    />

    <SelectField
      label="Topic"
      value={config.topic || 'orders/create'}
      onChange={(v) => updateConfig('topic', v)}
      options={[
        { value: 'orders/create', label: 'Order Created' },
        { value: 'orders/updated', label: 'Order Updated' },
        { value: 'orders/paid', label: 'Order Paid' },
        { value: 'orders/fulfilled', label: 'Order Fulfilled' },
        { value: 'orders/cancelled', label: 'Order Cancelled' },
        { value: 'products/create', label: 'Product Created' },
        { value: 'products/update', label: 'Product Updated' },
        { value: 'products/delete', label: 'Product Deleted' },
        { value: 'customers/create', label: 'Customer Created' },
        { value: 'customers/update', label: 'Customer Updated' },
        { value: 'carts/create', label: 'Cart Created' },
        { value: 'carts/update', label: 'Cart Updated' },
        { value: 'checkouts/create', label: 'Checkout Created' },
        { value: 'refunds/create', label: 'Refund Created' },
        { value: 'inventory_levels/update', label: 'Inventory Updated' },
      ]}
    />

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-blue-500" />}
      title="Filters"
    />

    <TextField
      label="Minimum Order Value"
      value={config.minOrderValue || ''}
      onChange={(v) => updateConfig('minOrderValue', v)}
      placeholder="100"
      description="Only trigger for orders above this amount"
    />

    <TagsField
      label="Product Tags Filter"
      value={config.productTags || []}
      onChange={(v) => updateConfig('productTags', v)}
      placeholder="Add tag"
      description="Only trigger for products with these tags"
    />

    <SwitchField
      label="Include Line Items"
      description="Include full order item details"
      value={config.includeLineItems ?? true}
      onChange={(v) => updateConfig('includeLineItems', v)}
    />

    <SwitchField
      label="Include Customer Data"
      description="Include customer details in output"
      value={config.includeCustomer ?? true}
      onChange={(v) => updateConfig('includeCustomer', v)}
    />
  </div>
);

// ============================================
// WOOCOMMERCE TRIGGER
// ============================================

export const WooCommerceTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<ShoppingCart className="h-4 w-4 text-purple-600" />}
      title="WooCommerce Configuration"
    />

    <CredentialField
      label="WooCommerce Store"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="WooCommerce API"
      connected={!!config.credential}
      connectionName={config.storeUrl}
    />

    <TextField
      label="Store URL"
      value={config.storeUrl || ''}
      onChange={(v) => updateConfig('storeUrl', v)}
      placeholder="https://yourstore.com"
      description="Your WordPress/WooCommerce site URL"
    />

    <TextField
      label="Consumer Key"
      value={config.consumerKey || ''}
      onChange={(v) => updateConfig('consumerKey', v)}
      placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    />

    <PasswordField
      label="Consumer Secret"
      value={config.consumerSecret || ''}
      onChange={(v) => updateConfig('consumerSecret', v)}
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Webhook Events"
    />

    <SelectField
      label="Topic"
      value={config.topic || 'order.created'}
      onChange={(v) => updateConfig('topic', v)}
      options={[
        { value: 'order.created', label: 'Order Created' },
        { value: 'order.updated', label: 'Order Updated' },
        { value: 'order.deleted', label: 'Order Deleted' },
        { value: 'product.created', label: 'Product Created' },
        { value: 'product.updated', label: 'Product Updated' },
        { value: 'product.deleted', label: 'Product Deleted' },
        { value: 'customer.created', label: 'Customer Created' },
        { value: 'customer.updated', label: 'Customer Updated' },
        { value: 'coupon.created', label: 'Coupon Created' },
        { value: 'subscription.created', label: 'Subscription Created' },
        { value: 'subscription.renewed', label: 'Subscription Renewed' },
      ]}
    />

    <SelectField
      label="Order Status Filter"
      value={config.orderStatus || 'any'}
      onChange={(v) => updateConfig('orderStatus', v)}
      options={[
        { value: 'any', label: 'Any Status' },
        { value: 'pending', label: 'Pending Payment' },
        { value: 'processing', label: 'Processing' },
        { value: 'on-hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'refunded', label: 'Refunded' },
        { value: 'failed', label: 'Failed' },
      ]}
    />

    <SwitchField
      label="Include Meta Data"
      description="Include custom meta fields"
      value={config.includeMeta ?? false}
      onChange={(v) => updateConfig('includeMeta', v)}
    />
  </div>
);

// ============================================
// RAZORPAY TRIGGER
// ============================================

export const RazorpayTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
      title="Razorpay Configuration"
    />

    <CredentialField
      label="Razorpay Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Razorpay API"
      connected={!!config.credential}
      connectionName={config.accountName}
    />

    <TextField
      label="Key ID"
      value={config.keyId || ''}
      onChange={(v) => updateConfig('keyId', v)}
      placeholder="rzp_live_xxxxxxxxxxxx"
    />

    <PasswordField
      label="Key Secret"
      value={config.keySecret || ''}
      onChange={(v) => updateConfig('keySecret', v)}
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Webhook Events"
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'payment.captured'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'payment.captured', label: 'Payment Captured' },
        { value: 'payment.failed', label: 'Payment Failed' },
        { value: 'payment.authorized', label: 'Payment Authorized' },
        { value: 'order.paid', label: 'Order Paid' },
        { value: 'refund.created', label: 'Refund Created' },
        { value: 'refund.processed', label: 'Refund Processed' },
        { value: 'subscription.charged', label: 'Subscription Charged' },
        { value: 'subscription.cancelled', label: 'Subscription Cancelled' },
        { value: 'subscription.pending', label: 'Subscription Pending' },
        { value: 'invoice.paid', label: 'Invoice Paid' },
        { value: 'payout.processed', label: 'Payout Processed' },
      ]}
    />

    <TextField
      label="Minimum Amount (paise)"
      value={config.minAmount || ''}
      onChange={(v) => updateConfig('minAmount', v)}
      placeholder="10000"
      description="Only trigger for payments above this (in paise)"
    />

    <SwitchField
      label="Live Mode Only"
      description="Ignore test mode events"
      value={config.liveOnly ?? false}
      onChange={(v) => updateConfig('liveOnly', v)}
    />
  </div>
);

// ============================================
// ZENDESK TRIGGER
// ============================================

export const ZendeskTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Headphones className="h-4 w-4 text-green-500" />}
      title="Zendesk Configuration"
    />

    <CredentialField
      label="Zendesk Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Zendesk API"
      connected={!!config.credential}
      connectionName={config.subdomain}
    />

    <TextField
      label="Subdomain"
      value={config.subdomain || ''}
      onChange={(v) => updateConfig('subdomain', v)}
      placeholder="yourcompany"
      description="Your Zendesk subdomain (yourcompany.zendesk.com)"
    />

    <TextField
      label="Email"
      value={config.email || ''}
      onChange={(v) => updateConfig('email', v)}
      placeholder="admin@company.com"
    />

    <PasswordField
      label="API Token"
      value={config.apiToken || ''}
      onChange={(v) => updateConfig('apiToken', v)}
      description="Get from Admin > Channels > API"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'ticket_created'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'ticket_created', label: 'Ticket Created' },
        { value: 'ticket_updated', label: 'Ticket Updated' },
        { value: 'ticket_solved', label: 'Ticket Solved' },
        { value: 'comment_added', label: 'Comment Added' },
        { value: 'user_created', label: 'User Created' },
        { value: 'organization_created', label: 'Organization Created' },
      ]}
    />

    <SelectField
      label="Ticket Status Filter"
      value={config.statusFilter || 'any'}
      onChange={(v) => updateConfig('statusFilter', v)}
      options={[
        { value: 'any', label: 'Any Status' },
        { value: 'new', label: 'New' },
        { value: 'open', label: 'Open' },
        { value: 'pending', label: 'Pending' },
        { value: 'hold', label: 'On Hold' },
        { value: 'solved', label: 'Solved' },
      ]}
    />

    <SelectField
      label="Priority Filter"
      value={config.priorityFilter || 'any'}
      onChange={(v) => updateConfig('priorityFilter', v)}
      options={[
        { value: 'any', label: 'Any Priority' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'normal', label: 'Normal' },
        { value: 'low', label: 'Low' },
      ]}
    />

    <TagsField
      label="Tag Filter"
      value={config.tags || []}
      onChange={(v) => updateConfig('tags', v)}
      placeholder="Add tag"
      description="Only trigger for tickets with these tags"
    />

    <SwitchField
      label="Include Comments"
      description="Fetch ticket comments"
      value={config.includeComments ?? false}
      onChange={(v) => updateConfig('includeComments', v)}
    />
  </div>
);

// ============================================
// FRESHDESK TRIGGER
// ============================================

export const FreshdeskTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Headphones className="h-4 w-4 text-emerald-500" />}
      title="Freshdesk Configuration"
    />

    <CredentialField
      label="Freshdesk Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Freshdesk API"
      connected={!!config.credential}
      connectionName={config.domain}
    />

    <TextField
      label="Domain"
      value={config.domain || ''}
      onChange={(v) => updateConfig('domain', v)}
      placeholder="yourcompany.freshdesk.com"
    />

    <PasswordField
      label="API Key"
      value={config.apiKey || ''}
      onChange={(v) => updateConfig('apiKey', v)}
      description="Get from Profile Settings > API Key"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'ticket_created'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'ticket_created', label: 'Ticket Created' },
        { value: 'ticket_updated', label: 'Ticket Updated' },
        { value: 'note_added', label: 'Note Added' },
        { value: 'reply_sent', label: 'Reply Sent' },
        { value: 'customer_reply', label: 'Customer Replied' },
        { value: 'contact_created', label: 'Contact Created' },
      ]}
    />

    <SelectField
      label="Priority Filter"
      value={config.priority || 'any'}
      onChange={(v) => updateConfig('priority', v)}
      options={[
        { value: 'any', label: 'Any Priority' },
        { value: '4', label: 'Urgent' },
        { value: '3', label: 'High' },
        { value: '2', label: 'Medium' },
        { value: '1', label: 'Low' },
      ]}
    />

    <SelectField
      label="Source Filter"
      value={config.source || 'any'}
      onChange={(v) => updateConfig('source', v)}
      options={[
        { value: 'any', label: 'Any Source' },
        { value: '1', label: 'Email' },
        { value: '2', label: 'Portal' },
        { value: '3', label: 'Phone' },
        { value: '7', label: 'Chat' },
        { value: '9', label: 'Feedback Widget' },
        { value: '10', label: 'Outbound Email' },
      ]}
    />

    <SwitchField
      label="Include Conversations"
      description="Fetch ticket conversation history"
      value={config.includeConversations ?? false}
      onChange={(v) => updateConfig('includeConversations', v)}
    />
  </div>
);

// ============================================
// INTERCOM TRIGGER
// ============================================

export const IntercomTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-blue-500" />}
      title="Intercom Configuration"
    />

    <CredentialField
      label="Intercom Workspace"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Intercom OAuth"
      connected={!!config.credential}
      connectionName={config.workspaceName}
    />

    <PasswordField
      label="Access Token"
      value={config.accessToken || ''}
      onChange={(v) => updateConfig('accessToken', v)}
      description="Get from Developer Hub"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Events"
    />

    <SelectField
      label="Topic"
      value={config.topic || 'conversation.user.created'}
      onChange={(v) => updateConfig('topic', v)}
      options={[
        { value: 'conversation.user.created', label: 'New Conversation' },
        { value: 'conversation.user.replied', label: 'User Replied' },
        { value: 'conversation.admin.replied', label: 'Admin Replied' },
        { value: 'conversation.admin.closed', label: 'Conversation Closed' },
        { value: 'conversation.admin.opened', label: 'Conversation Opened' },
        { value: 'user.created', label: 'User Created' },
        { value: 'user.tag.created', label: 'User Tagged' },
        { value: 'contact.created', label: 'Contact Created' },
        { value: 'contact.signed_up', label: 'Contact Signed Up' },
        { value: 'ticket.created', label: 'Ticket Created' },
        { value: 'ticket.state.updated', label: 'Ticket State Updated' },
      ]}
    />

    <TagsField
      label="Tag Filter"
      value={config.tags || []}
      onChange={(v) => updateConfig('tags', v)}
      placeholder="Add tag"
      description="Only trigger for conversations with these tags"
    />

    <SwitchField
      label="Include User Data"
      description="Fetch full user profile"
      value={config.includeUser ?? true}
      onChange={(v) => updateConfig('includeUser', v)}
    />

    <SwitchField
      label="Include Conversation Parts"
      description="Fetch all messages in conversation"
      value={config.includeConversation ?? false}
      onChange={(v) => updateConfig('includeConversation', v)}
    />
  </div>
);

// ============================================
// ZOOM TRIGGER
// ============================================

export const ZoomTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Video className="h-4 w-4 text-blue-500" />}
      title="Zoom Configuration"
    />

    <CredentialField
      label="Zoom Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Zoom OAuth"
      connected={!!config.credential}
      connectionName={config.accountEmail}
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Webhook Events"
    />

    <SelectField
      label="Event Type"
      value={config.eventType || 'meeting.started'}
      onChange={(v) => updateConfig('eventType', v)}
      options={[
        { value: 'meeting.started', label: 'Meeting Started' },
        { value: 'meeting.ended', label: 'Meeting Ended' },
        { value: 'meeting.participant_joined', label: 'Participant Joined' },
        { value: 'meeting.participant_left', label: 'Participant Left' },
        { value: 'meeting.registration_created', label: 'Registration Created' },
        { value: 'recording.completed', label: 'Recording Completed' },
        { value: 'webinar.started', label: 'Webinar Started' },
        { value: 'webinar.ended', label: 'Webinar Ended' },
        { value: 'webinar.registration_created', label: 'Webinar Registration' },
      ]}
    />

    <TextField
      label="Host Email Filter"
      value={config.hostFilter || ''}
      onChange={(v) => updateConfig('hostFilter', v)}
      placeholder="host@company.com"
      description="Only trigger for meetings by specific host"
    />

    <SwitchField
      label="Include Participants"
      description="Fetch participant list"
      value={config.includeParticipants ?? false}
      onChange={(v) => updateConfig('includeParticipants', v)}
    />

    <SwitchField
      label="Include Recording URLs"
      description="Include links to recordings"
      value={config.includeRecordings ?? true}
      onChange={(v) => updateConfig('includeRecordings', v)}
    />
  </div>
);

// ============================================
// AIRTABLE TRIGGER
// ============================================

export const AirtableTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Database className="h-4 w-4 text-yellow-500" />}
      title="Airtable Configuration"
    />

    <CredentialField
      label="Airtable Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Airtable API"
      connected={!!config.credential}
      connectionName={config.accountEmail}
    />

    <PasswordField
      label="API Key / Personal Access Token"
      value={config.apiKey || ''}
      onChange={(v) => updateConfig('apiKey', v)}
      description="Get from Account settings"
    />

    <TextField
      label="Base ID"
      value={config.baseId || ''}
      onChange={(v) => updateConfig('baseId', v)}
      placeholder="appXXXXXXXXXXXXXX"
      description="Found in Airtable API documentation"
      required
    />

    <TextField
      label="Table Name"
      value={config.tableName || ''}
      onChange={(v) => updateConfig('tableName', v)}
      placeholder="Tasks"
      description="Name of the table to watch"
      required
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Settings"
    />

    <SelectField
      label="Trigger On"
      value={config.triggerOn || 'newRecord'}
      onChange={(v) => updateConfig('triggerOn', v)}
      options={[
        { value: 'newRecord', label: 'New Record Added' },
        { value: 'recordUpdated', label: 'Record Updated' },
        { value: 'anyChange', label: 'Any Change' },
      ]}
    />

    <TextField
      label="View Name (optional)"
      value={config.viewName || ''}
      onChange={(v) => updateConfig('viewName', v)}
      placeholder="Grid view"
      description="Filter by specific view"
    />

    <TextField
      label="Formula Filter"
      value={config.filterFormula || ''}
      onChange={(v) => updateConfig('filterFormula', v)}
      placeholder="{Status}='Active'"
      description="Airtable formula to filter records"
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
      ]}
    />

    <SwitchField
      label="Include Attachments"
      description="Fetch attachment URLs"
      value={config.includeAttachments ?? true}
      onChange={(v) => updateConfig('includeAttachments', v)}
    />
  </div>
);

// ============================================
// NOTION TRIGGER
// ============================================

export const NotionTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<FileText className="h-4 w-4 text-gray-700" />}
      title="Notion Configuration"
    />

    <CredentialField
      label="Notion Workspace"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Notion OAuth"
      connected={!!config.credential}
      connectionName={config.workspaceName}
    />

    <PasswordField
      label="Integration Token"
      value={config.integrationToken || ''}
      onChange={(v) => updateConfig('integrationToken', v)}
      description="Get from Notion Integrations page"
    />

    <TextField
      label="Database ID"
      value={config.databaseId || ''}
      onChange={(v) => updateConfig('databaseId', v)}
      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      description="ID from database URL or share link"
      required
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Settings"
    />

    <SelectField
      label="Trigger On"
      value={config.triggerOn || 'pageCreated'}
      onChange={(v) => updateConfig('triggerOn', v)}
      options={[
        { value: 'pageCreated', label: 'Page Created' },
        { value: 'pageUpdated', label: 'Page Updated' },
        { value: 'propertyChanged', label: 'Specific Property Changed' },
      ]}
    />

    {config.triggerOn === 'propertyChanged' && (
      <TextField
        label="Property Name"
        value={config.propertyName || ''}
        onChange={(v) => updateConfig('propertyName', v)}
        placeholder="Status"
        description="Property to watch for changes"
      />
    )}

    <TextField
      label="Filter (JSON)"
      value={config.filter || ''}
      onChange={(v) => updateConfig('filter', v)}
      placeholder='{"property": "Status", "select": {"equals": "Done"}}'
      description="Notion filter object (optional)"
    />

    <SelectField
      label="Poll Interval"
      value={config.pollInterval || '5'}
      onChange={(v) => updateConfig('pollInterval', v)}
      options={[
        { value: '1', label: 'Every 1 minute' },
        { value: '5', label: 'Every 5 minutes' },
        { value: '15', label: 'Every 15 minutes' },
      ]}
    />

    <SwitchField
      label="Include Page Content"
      description="Fetch page blocks/content"
      value={config.includeContent ?? false}
      onChange={(v) => updateConfig('includeContent', v)}
    />
  </div>
);

// ============================================
// FIREBASE TRIGGER
// ============================================

export const FirebaseTriggerConfig: React.FC<TriggerConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Database className="h-4 w-4 text-amber-500" />}
      title="Firebase Configuration"
    />

    <CredentialField
      label="Firebase Project"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Firebase Service Account"
      connected={!!config.credential}
      connectionName={config.projectId}
    />

    <TextField
      label="Project ID"
      value={config.projectId || ''}
      onChange={(v) => updateConfig('projectId', v)}
      placeholder="my-project-id"
    />

    <CodeField
      label="Service Account Key (JSON)"
      value={config.serviceAccount || ''}
      onChange={(v) => updateConfig('serviceAccount', v)}
      language="json"
      rows={6}
      description="Your Firebase service account credentials"
    />

    <Separator />

    <SectionHeader
      icon={<Bell className="h-4 w-4 text-amber-500" />}
      title="Trigger Settings"
    />

    <SelectField
      label="Service"
      value={config.service || 'firestore'}
      onChange={(v) => updateConfig('service', v)}
      options={[
        { value: 'firestore', label: 'Firestore' },
        { value: 'realtime', label: 'Realtime Database' },
        { value: 'auth', label: 'Authentication' },
        { value: 'storage', label: 'Cloud Storage' },
      ]}
    />

    {config.service === 'firestore' && (
      <>
        <TextField
          label="Collection Path"
          value={config.collectionPath || ''}
          onChange={(v) => updateConfig('collectionPath', v)}
          placeholder="users or users/{userId}/orders"
          description="Collection to watch (supports subcollections)"
          required
        />
        <SelectField
          label="Event Type"
          value={config.eventType || 'create'}
          onChange={(v) => updateConfig('eventType', v)}
          options={[
            { value: 'create', label: 'Document Created' },
            { value: 'update', label: 'Document Updated' },
            { value: 'delete', label: 'Document Deleted' },
            { value: 'write', label: 'Any Write Operation' },
          ]}
        />
      </>
    )}

    {config.service === 'realtime' && (
      <>
        <TextField
          label="Database Path"
          value={config.databasePath || ''}
          onChange={(v) => updateConfig('databasePath', v)}
          placeholder="/messages or /users/{userId}"
          required
        />
        <SelectField
          label="Event Type"
          value={config.eventType || 'value'}
          onChange={(v) => updateConfig('eventType', v)}
          options={[
            { value: 'value', label: 'Value Changed' },
            { value: 'child_added', label: 'Child Added' },
            { value: 'child_changed', label: 'Child Changed' },
            { value: 'child_removed', label: 'Child Removed' },
          ]}
        />
      </>
    )}

    {config.service === 'auth' && (
      <SelectField
        label="Event Type"
        value={config.eventType || 'user.create'}
        onChange={(v) => updateConfig('eventType', v)}
        options={[
          { value: 'user.create', label: 'User Created' },
          { value: 'user.delete', label: 'User Deleted' },
        ]}
      />
    )}

    {config.service === 'storage' && (
      <>
        <TextField
          label="Bucket"
          value={config.bucket || ''}
          onChange={(v) => updateConfig('bucket', v)}
          placeholder="your-project.appspot.com"
        />
        <SelectField
          label="Event Type"
          value={config.eventType || 'finalize'}
          onChange={(v) => updateConfig('eventType', v)}
          options={[
            { value: 'finalize', label: 'Object Finalized (Uploaded)' },
            { value: 'delete', label: 'Object Deleted' },
            { value: 'archive', label: 'Object Archived' },
            { value: 'metadataUpdate', label: 'Metadata Updated' },
          ]}
        />
        <TextField
          label="Path Filter"
          value={config.pathFilter || ''}
          onChange={(v) => updateConfig('pathFilter', v)}
          placeholder="images/** or uploads/*.pdf"
          description="Filter by file path pattern"
        />
      </>
    )}
  </div>
);

// ============================================
// EXPORT ALL ADDITIONAL TRIGGERS
// ============================================

export const AdditionalTriggerConfigs: Record<string, React.FC<TriggerConfigProps>> = {
  discord_message: DiscordTriggerConfig,
  discord_event: DiscordTriggerConfig,
  teams_message: TeamsTriggerConfig,
  microsoft_teams: TeamsTriggerConfig,
  sms_received: SmsTriggerConfig,
  twilio_message: SmsTriggerConfig,
  typeform_response: TypeformTriggerConfig,
  calendly_event: CalendlyTriggerConfig,
  shopify_order: ShopifyTriggerConfig,
  shopify_product: ShopifyTriggerConfig,
  shopify_customer: ShopifyTriggerConfig,
  woocommerce_order: WooCommerceTriggerConfig,
  woocommerce_product: WooCommerceTriggerConfig,
  razorpay_payment: RazorpayTriggerConfig,
  zendesk_ticket: ZendeskTriggerConfig,
  freshdesk_ticket: FreshdeskTriggerConfig,
  intercom_conversation: IntercomTriggerConfig,
  zoom_meeting: ZoomTriggerConfig,
  zoom_webinar: ZoomTriggerConfig,
  airtable_record: AirtableTriggerConfig,
  notion_page: NotionTriggerConfig,
  notion_database: NotionTriggerConfig,
  firebase_document: FirebaseTriggerConfig,
  firebase_realtime: FirebaseTriggerConfig,
};

export default AdditionalTriggerConfigs;
