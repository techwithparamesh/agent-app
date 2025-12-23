/**
 * Node Configuration Fields
 * 
 * Renders the appropriate configuration fields based on node type (trigger/action).
 * Each trigger and action has specific fields relevant to its functionality.
 */

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Info,
  Clock,
  Globe,
  MessageCircle,
  Mail,
  Users,
  FileText,
  Database,
  CreditCard,
  Zap,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================
// TYPES
// ============================================

interface ConfigFieldsProps {
  triggerId?: string;
  actionId?: string;
  nodeType: string;
  appId: string;
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// TRIGGER CONFIGURATION FIELDS
// ============================================

const TriggerConfigFields: Record<string, React.FC<{ config: Record<string, any>; updateConfig: (key: string, value: any) => void }>> = {
  // Manual Trigger
  manual: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex gap-2">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Manual Trigger</p>
            <p className="text-xs text-muted-foreground">
              This workflow will run when you click the "Test" button or manually execute it.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-xs">Test Data (JSON)</Label>
        <Textarea
          value={config.testData || '{\n  "sample": "data"\n}'}
          onChange={(e) => updateConfig('testData', e.target.value)}
          placeholder='Enter test data in JSON format'
          rows={4}
          className="font-mono text-xs resize-none"
        />
        <p className="text-xs text-muted-foreground">
          This data will be used when testing the workflow
        </p>
      </div>
    </div>
  ),

  // Webhook Trigger
  webhook: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Webhook URL</Label>
        <div className="flex gap-2">
          <Input
            value={config.webhookUrl || 'https://api.yourapp.com/webhook/abc123'}
            readOnly
            className="h-9 font-mono text-xs bg-muted"
          />
          <Button variant="outline" size="sm" className="shrink-0">
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Send POST requests to this URL to trigger the workflow
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">HTTP Method</Label>
        <Select value={config.httpMethod || 'POST'} onValueChange={(v) => updateConfig('httpMethod', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Authentication</Label>
        <Select value={config.authType || 'none'} onValueChange={(v) => updateConfig('authType', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Authentication</SelectItem>
            <SelectItem value="header">Header Auth</SelectItem>
            <SelectItem value="basic">Basic Auth</SelectItem>
            <SelectItem value="bearer">Bearer Token</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.authType === 'header' && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Header Name</Label>
            <Input
              value={config.headerName || 'X-API-Key'}
              onChange={(e) => updateConfig('headerName', e.target.value)}
              placeholder="X-API-Key"
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Header Value</Label>
            <Input
              type="password"
              value={config.headerValue || ''}
              onChange={(e) => updateConfig('headerValue', e.target.value)}
              placeholder="Your secret key"
              className="h-9"
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Respond Immediately</Label>
          <p className="text-xs text-muted-foreground">Return 200 before workflow completes</p>
        </div>
        <Switch
          checked={config.respondImmediately ?? true}
          onCheckedChange={(v) => updateConfig('respondImmediately', v)}
        />
      </div>
    </div>
  ),

  // Schedule Trigger
  schedule: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Schedule Type</Label>
        <Select value={config.scheduleType || 'cron'} onValueChange={(v) => updateConfig('scheduleType', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cron">Cron Expression</SelectItem>
            <SelectItem value="interval">Simple Interval</SelectItem>
            <SelectItem value="daily">Daily at Time</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.scheduleType === 'cron' && (
        <div className="space-y-2">
          <Label className="text-xs">Cron Expression</Label>
          <Input
            value={config.cronExpression || '0 9 * * *'}
            onChange={(e) => updateConfig('cronExpression', e.target.value)}
            placeholder="0 9 * * *"
            className="h-9 font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Example: "0 9 * * *" runs daily at 9:00 AM
          </p>
        </div>
      )}

      {config.scheduleType === 'interval' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">Every</Label>
            <Input
              type="number"
              value={config.intervalValue || 15}
              onChange={(e) => updateConfig('intervalValue', parseInt(e.target.value))}
              min={1}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Unit</Label>
            <Select value={config.intervalUnit || 'minutes'} onValueChange={(v) => updateConfig('intervalUnit', v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">Seconds</SelectItem>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {config.scheduleType === 'daily' && (
        <div className="space-y-2">
          <Label className="text-xs">Time</Label>
          <Input
            type="time"
            value={config.dailyTime || '09:00'}
            onChange={(e) => updateConfig('dailyTime', e.target.value)}
            className="h-9"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Timezone</Label>
        <Select value={config.timezone || 'Asia/Kolkata'} onValueChange={(v) => updateConfig('timezone', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
            <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
            <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
            <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
            <SelectItem value="UTC">UTC</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),

  // Interval Trigger
  interval: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Run Every</Label>
          <Input
            type="number"
            value={config.intervalValue || 5}
            onChange={(e) => updateConfig('intervalValue', parseInt(e.target.value))}
            min={1}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Unit</Label>
          <Select value={config.intervalUnit || 'minutes'} onValueChange={(v) => updateConfig('intervalUnit', v)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds">Seconds</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          This workflow will run every {config.intervalValue || 5} {config.intervalUnit || 'minutes'}
        </p>
      </div>
    </div>
  ),

  // WhatsApp Message Trigger
  whatsapp_message: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">WhatsApp Business Account</Label>
        <Select value={config.accountId || ''} onValueChange={(v) => updateConfig('accountId', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="account1">Business Account 1</SelectItem>
            <SelectItem value="new">+ Connect New Account</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Trigger On</Label>
        <Select value={config.messageType || 'all'} onValueChange={(v) => updateConfig('messageType', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="text">Text Messages Only</SelectItem>
            <SelectItem value="media">Media Messages Only</SelectItem>
            <SelectItem value="button">Button Responses</SelectItem>
            <SelectItem value="list">List Responses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Filter by Keyword (optional)</Label>
        <Input
          value={config.keyword || ''}
          onChange={(e) => updateConfig('keyword', e.target.value)}
          placeholder="e.g., /start, help, order"
          className="h-9"
        />
        <p className="text-xs text-muted-foreground">
          Only trigger when message contains this keyword
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Process Bot Messages</Label>
          <p className="text-xs text-muted-foreground">Include messages from other bots</p>
        </div>
        <Switch
          checked={config.processBotMessages ?? false}
          onCheckedChange={(v) => updateConfig('processBotMessages', v)}
        />
      </div>
    </div>
  ),

  // Telegram Message Trigger
  telegram_message: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Telegram Bot Token</Label>
        <Input
          type="password"
          value={config.botToken || ''}
          onChange={(e) => updateConfig('botToken', e.target.value)}
          placeholder="123456:ABC-DEF..."
          className="h-9 font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Get from @BotFather on Telegram
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Update Type</Label>
        <Select value={config.updateType || 'message'} onValueChange={(v) => updateConfig('updateType', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="callback_query">Button Callbacks</SelectItem>
            <SelectItem value="inline_query">Inline Queries</SelectItem>
            <SelectItem value="all">All Updates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Command Filter (optional)</Label>
        <Input
          value={config.command || ''}
          onChange={(e) => updateConfig('command', e.target.value)}
          placeholder="/start, /help"
          className="h-9"
        />
      </div>
    </div>
  ),

  // Slack Message Trigger
  slack_message: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Slack Workspace</Label>
        <Select value={config.workspace || ''} onValueChange={(v) => updateConfig('workspace', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select workspace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">+ Connect Workspace</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Channel</Label>
        <Select value={config.channel || 'all'} onValueChange={(v) => updateConfig('channel', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="direct">Direct Messages Only</SelectItem>
            <SelectItem value="mention">Mentions Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Include Bot Messages</Label>
          <p className="text-xs text-muted-foreground">Trigger on bot messages too</p>
        </div>
        <Switch
          checked={config.includeBots ?? false}
          onCheckedChange={(v) => updateConfig('includeBots', v)}
        />
      </div>
    </div>
  ),

  // Gmail Trigger
  gmail_received: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Gmail Account</Label>
        <Button variant="outline" className="w-full justify-start h-9">
          <Mail className="h-4 w-4 mr-2" />
          Connect Gmail Account
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Label Filter</Label>
        <Select value={config.label || 'INBOX'} onValueChange={(v) => updateConfig('label', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INBOX">Inbox</SelectItem>
            <SelectItem value="UNREAD">Unread Only</SelectItem>
            <SelectItem value="STARRED">Starred</SelectItem>
            <SelectItem value="IMPORTANT">Important</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">From (optional)</Label>
        <Input
          value={config.fromEmail || ''}
          onChange={(e) => updateConfig('fromEmail', e.target.value)}
          placeholder="sender@example.com"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Subject Contains (optional)</Label>
        <Input
          value={config.subjectFilter || ''}
          onChange={(e) => updateConfig('subjectFilter', e.target.value)}
          placeholder="e.g., Order Confirmation"
          className="h-9"
        />
      </div>
    </div>
  ),

  // Stripe Payment Trigger
  stripe_payment: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Stripe Account</Label>
        <Button variant="outline" className="w-full justify-start h-9">
          <CreditCard className="h-4 w-4 mr-2" />
          Connect Stripe Account
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Event Type</Label>
        <Select value={config.eventType || 'payment_intent.succeeded'} onValueChange={(v) => updateConfig('eventType', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="payment_intent.succeeded">Payment Succeeded</SelectItem>
            <SelectItem value="payment_intent.failed">Payment Failed</SelectItem>
            <SelectItem value="charge.refunded">Charge Refunded</SelectItem>
            <SelectItem value="invoice.paid">Invoice Paid</SelectItem>
            <SelectItem value="customer.subscription.created">Subscription Created</SelectItem>
            <SelectItem value="customer.subscription.deleted">Subscription Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Live Mode Only</Label>
          <p className="text-xs text-muted-foreground">Ignore test mode events</p>
        </div>
        <Switch
          checked={config.liveOnly ?? false}
          onCheckedChange={(v) => updateConfig('liveOnly', v)}
        />
      </div>
    </div>
  ),

  // HubSpot Contact Trigger
  hubspot_contact: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">HubSpot Account</Label>
        <Button variant="outline" className="w-full justify-start h-9">
          <Users className="h-4 w-4 mr-2" />
          Connect HubSpot
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Trigger Event</Label>
        <Select value={config.event || 'created'} onValueChange={(v) => updateConfig('event', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Contact Created</SelectItem>
            <SelectItem value="updated">Contact Updated</SelectItem>
            <SelectItem value="deleted">Contact Deleted</SelectItem>
            <SelectItem value="merged">Contacts Merged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Property Filter (optional)</Label>
        <Input
          value={config.propertyFilter || ''}
          onChange={(e) => updateConfig('propertyFilter', e.target.value)}
          placeholder="e.g., lifecyclestage=lead"
          className="h-9"
        />
      </div>
    </div>
  ),

  // Google Sheets Trigger
  google_sheet_row: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Google Account</Label>
        <Button variant="outline" className="w-full justify-start h-9">
          <Database className="h-4 w-4 mr-2" />
          Connect Google Sheets
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Spreadsheet</Label>
        <Select value={config.spreadsheetId || ''} onValueChange={(v) => updateConfig('spreadsheetId', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select spreadsheet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="browse">Browse Spreadsheets...</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Sheet Name</Label>
        <Input
          value={config.sheetName || 'Sheet1'}
          onChange={(e) => updateConfig('sheetName', e.target.value)}
          placeholder="Sheet1"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Trigger On</Label>
        <Select value={config.triggerOn || 'new_row'} onValueChange={(v) => updateConfig('triggerOn', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_row">New Row Added</SelectItem>
            <SelectItem value="row_updated">Row Updated</SelectItem>
            <SelectItem value="any_change">Any Change</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),

  // GitHub Event Trigger
  github_event: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">GitHub Account</Label>
        <Button variant="outline" className="w-full justify-start h-9">
          <Globe className="h-4 w-4 mr-2" />
          Connect GitHub
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Repository</Label>
        <Input
          value={config.repository || ''}
          onChange={(e) => updateConfig('repository', e.target.value)}
          placeholder="owner/repo-name"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Event Type</Label>
        <Select value={config.eventType || 'push'} onValueChange={(v) => updateConfig('eventType', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="push">Push</SelectItem>
            <SelectItem value="pull_request">Pull Request</SelectItem>
            <SelectItem value="issues">Issues</SelectItem>
            <SelectItem value="release">Release</SelectItem>
            <SelectItem value="star">Star</SelectItem>
            <SelectItem value="fork">Fork</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Branch Filter (optional)</Label>
        <Input
          value={config.branch || ''}
          onChange={(e) => updateConfig('branch', e.target.value)}
          placeholder="main, develop"
          className="h-9"
        />
      </div>
    </div>
  ),
};

// ============================================
// ACTION CONFIGURATION FIELDS
// ============================================

const ActionConfigFields: Record<string, React.FC<{ config: Record<string, any>; updateConfig: (key: string, value: any) => void }>> = {
  // HTTP Request
  http_request: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Method</Label>
        <Select value={config.method || 'GET'} onValueChange={(v) => updateConfig('method', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">URL</Label>
        <Input
          value={config.url || ''}
          onChange={(e) => updateConfig('url', e.target.value)}
          placeholder="https://api.example.com/endpoint"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Headers (JSON)</Label>
        <Textarea
          value={config.headers || '{\n  "Content-Type": "application/json"\n}'}
          onChange={(e) => updateConfig('headers', e.target.value)}
          rows={3}
          className="font-mono text-xs resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Body (JSON)</Label>
        <Textarea
          value={config.body || ''}
          onChange={(e) => updateConfig('body', e.target.value)}
          placeholder='{"key": "value"}'
          rows={4}
          className="font-mono text-xs resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Timeout (seconds)</Label>
        <Input
          type="number"
          value={config.timeout || 30}
          onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
          min={1}
          max={120}
          className="h-9"
        />
      </div>
    </div>
  ),

  // Send WhatsApp Message
  send_whatsapp: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">WhatsApp Business Account</Label>
        <Select value={config.accountId || ''} onValueChange={(v) => updateConfig('accountId', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="account1">Business Account 1</SelectItem>
            <SelectItem value="new">+ Connect New Account</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">To (Phone Number)</Label>
        <Input
          value={config.to || ''}
          onChange={(e) => updateConfig('to', e.target.value)}
          placeholder="+919876543210 or {{trigger.from}}"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Message Type</Label>
        <Select value={config.messageType || 'text'} onValueChange={(v) => updateConfig('messageType', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text Message</SelectItem>
            <SelectItem value="template">Template Message</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="buttons">Interactive Buttons</SelectItem>
            <SelectItem value="list">Interactive List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.messageType === 'text' && (
        <div className="space-y-2">
          <Label className="text-xs">Message</Label>
          <Textarea
            value={config.message || ''}
            onChange={(e) => updateConfig('message', e.target.value)}
            placeholder="Enter your message..."
            rows={4}
            className="resize-none"
          />
        </div>
      )}

      {config.messageType === 'template' && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Template Name</Label>
            <Input
              value={config.templateName || ''}
              onChange={(e) => updateConfig('templateName', e.target.value)}
              placeholder="hello_world"
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Template Variables (JSON)</Label>
            <Textarea
              value={config.templateVars || '["value1", "value2"]'}
              onChange={(e) => updateConfig('templateVars', e.target.value)}
              rows={2}
              className="font-mono text-xs resize-none"
            />
          </div>
        </>
      )}
    </div>
  ),

  // Send Email (Gmail)
  send_gmail: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Gmail Account</Label>
        <Button variant="outline" className="w-full justify-start h-9">
          <Mail className="h-4 w-4 mr-2" />
          Connect Gmail Account
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">To</Label>
        <Input
          value={config.to || ''}
          onChange={(e) => updateConfig('to', e.target.value)}
          placeholder="recipient@example.com"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Subject</Label>
        <Input
          value={config.subject || ''}
          onChange={(e) => updateConfig('subject', e.target.value)}
          placeholder="Email subject"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Body</Label>
        <Textarea
          value={config.body || ''}
          onChange={(e) => updateConfig('body', e.target.value)}
          placeholder="Email content..."
          rows={5}
          className="resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">HTML Email</Label>
          <p className="text-xs text-muted-foreground">Send as HTML</p>
        </div>
        <Switch
          checked={config.isHtml ?? false}
          onCheckedChange={(v) => updateConfig('isHtml', v)}
        />
      </div>
    </div>
  ),

  // OpenAI Chat Completion
  openai_chat: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">API Key</Label>
        <Input
          type="password"
          value={config.apiKey || ''}
          onChange={(e) => updateConfig('apiKey', e.target.value)}
          placeholder="sk-..."
          className="h-9 font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Model</Label>
        <Select value={config.model || 'gpt-4o'} onValueChange={(v) => updateConfig('model', v)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4o (Latest)</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">System Prompt</Label>
        <Textarea
          value={config.systemPrompt || ''}
          onChange={(e) => updateConfig('systemPrompt', e.target.value)}
          placeholder="You are a helpful assistant..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">User Message</Label>
        <Textarea
          value={config.userMessage || ''}
          onChange={(e) => updateConfig('userMessage', e.target.value)}
          placeholder="{{trigger.message}} or your prompt"
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Temperature</Label>
          <Input
            type="number"
            value={config.temperature || 0.7}
            onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
            min={0}
            max={2}
            step={0.1}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Max Tokens</Label>
          <Input
            type="number"
            value={config.maxTokens || 1000}
            onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
            min={1}
            max={4096}
            className="h-9"
          />
        </div>
      </div>
    </div>
  ),

  // Create Airtable Record
  create_airtable_record: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Airtable Account</Label>
        <Button variant="outline" className="w-full justify-start h-9">
          <Database className="h-4 w-4 mr-2" />
          Connect Airtable
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Base</Label>
        <Select value={config.baseId || ''} onValueChange={(v) => updateConfig('baseId', v)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select base" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="browse">Browse Bases...</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Table</Label>
        <Input
          value={config.table || ''}
          onChange={(e) => updateConfig('table', e.target.value)}
          placeholder="Table name"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Fields (JSON)</Label>
        <Textarea
          value={config.fields || '{\n  "Name": "{{trigger.name}}",\n  "Email": "{{trigger.email}}"\n}'}
          onChange={(e) => updateConfig('fields', e.target.value)}
          rows={5}
          className="font-mono text-xs resize-none"
        />
      </div>
    </div>
  ),

  // Add Google Sheets Row
  add_sheets_row: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Google Account</Label>
        <Button variant="outline" className="w-full justify-start h-9">
          <Database className="h-4 w-4 mr-2" />
          Connect Google Sheets
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Spreadsheet ID</Label>
        <Input
          value={config.spreadsheetId || ''}
          onChange={(e) => updateConfig('spreadsheetId', e.target.value)}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
          className="h-9 font-mono text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Sheet Name</Label>
        <Input
          value={config.sheetName || 'Sheet1'}
          onChange={(e) => updateConfig('sheetName', e.target.value)}
          placeholder="Sheet1"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Values (JSON Array)</Label>
        <Textarea
          value={config.values || '["{{trigger.name}}", "{{trigger.email}}", "{{trigger.phone}}"]'}
          onChange={(e) => updateConfig('values', e.target.value)}
          rows={3}
          className="font-mono text-xs resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Array of values for each column
        </p>
      </div>
    </div>
  ),
};

// ============================================
// LOGIC NODE CONFIGURATION FIELDS
// ============================================

const LogicConfigFields: Record<string, React.FC<{ config: Record<string, any>; updateConfig: (key: string, value: any) => void }>> = {
  // IF Condition
  condition: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Condition Expression</Label>
        <Textarea
          value={config.expression || '{{trigger.value}} === "yes"'}
          onChange={(e) => updateConfig('expression', e.target.value)}
          placeholder='{{trigger.amount}} > 100'
          rows={2}
          className="font-mono text-xs resize-none"
        />
        <p className="text-xs text-muted-foreground">
          JavaScript expression that evaluates to true or false
        </p>
      </div>

      <div className="p-3 bg-muted/50 rounded-lg space-y-2">
        <p className="text-xs font-medium">Examples:</p>
        <code className="text-xs text-muted-foreground block">{"{{trigger.status}} === 'active'"}</code>
        <code className="text-xs text-muted-foreground block">{"{{trigger.amount}} >= 1000"}</code>
        <code className="text-xs text-muted-foreground block">{"{{trigger.email}}.includes('@gmail')"}</code>
      </div>
    </div>
  ),

  // Delay / Wait
  delay: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Wait For</Label>
          <Input
            type="number"
            value={config.duration || 5}
            onChange={(e) => updateConfig('duration', parseInt(e.target.value))}
            min={1}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Unit</Label>
          <Select value={config.unit || 'seconds'} onValueChange={(v) => updateConfig('unit', v)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds">Seconds</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <div className="flex gap-2">
          <Clock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Workflow will pause</p>
            <p className="text-xs text-muted-foreground">
              The next step will run after {config.duration || 5} {config.unit || 'seconds'}
            </p>
          </div>
        </div>
      </div>
    </div>
  ),

  // Loop
  loop: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Array to Loop</Label>
        <Input
          value={config.array || '{{trigger.items}}'}
          onChange={(e) => updateConfig('array', e.target.value)}
          placeholder="{{trigger.items}}"
          className="h-9 font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Batch Size (optional)</Label>
        <Input
          type="number"
          value={config.batchSize || ''}
          onChange={(e) => updateConfig('batchSize', e.target.value ? parseInt(e.target.value) : '')}
          placeholder="Process all at once"
          className="h-9"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to process all items
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Continue on Error</Label>
          <p className="text-xs text-muted-foreground">Skip failed items</p>
        </div>
        <Switch
          checked={config.continueOnError ?? true}
          onCheckedChange={(v) => updateConfig('continueOnError', v)}
        />
      </div>
    </div>
  ),

  // Switch / Router
  switch: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Value to Match</Label>
        <Input
          value={config.value || '{{trigger.status}}'}
          onChange={(e) => updateConfig('value', e.target.value)}
          placeholder="{{trigger.status}}"
          className="h-9 font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Cases (JSON)</Label>
        <Textarea
          value={config.cases || '{\n  "active": "route1",\n  "pending": "route2",\n  "default": "route3"\n}'}
          onChange={(e) => updateConfig('cases', e.target.value)}
          rows={5}
          className="font-mono text-xs resize-none"
        />
      </div>
    </div>
  ),

  // Filter
  filter: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Array to Filter</Label>
        <Input
          value={config.array || '{{trigger.items}}'}
          onChange={(e) => updateConfig('array', e.target.value)}
          placeholder="{{trigger.items}}"
          className="h-9 font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Filter Condition</Label>
        <Textarea
          value={config.condition || 'item.status === "active"'}
          onChange={(e) => updateConfig('condition', e.target.value)}
          placeholder='item.amount > 100'
          rows={2}
          className="font-mono text-xs resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Use "item" to reference each element
        </p>
      </div>
    </div>
  ),

  // Set Variable
  set_variable: ({ config, updateConfig }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Variable Name</Label>
        <Input
          value={config.variableName || ''}
          onChange={(e) => updateConfig('variableName', e.target.value)}
          placeholder="myVariable"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Value</Label>
        <Textarea
          value={config.value || ''}
          onChange={(e) => updateConfig('value', e.target.value)}
          placeholder='{{trigger.data}} or "static value"'
          rows={3}
          className="font-mono text-xs resize-none"
        />
      </div>
    </div>
  ),
};

// ============================================
// DEFAULT CONFIG (Fallback)
// ============================================

const DefaultConfig: React.FC<{ nodeType: string; config: Record<string, any>; updateConfig: (key: string, value: any) => void }> = ({ nodeType, config, updateConfig }) => (
  <div className="space-y-4">
    <div className="p-4 bg-muted/50 rounded-lg text-center">
      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-medium">Configuration</p>
      <p className="text-xs text-muted-foreground">
        Configure this {nodeType} in the fields below
      </p>
    </div>

    <div className="space-y-2">
      <Label className="text-xs">Custom Configuration (JSON)</Label>
      <Textarea
        value={config.custom || '{}'}
        onChange={(e) => updateConfig('custom', e.target.value)}
        placeholder='{"key": "value"}'
        rows={6}
        className="font-mono text-xs resize-none"
      />
    </div>
  </div>
);

// ============================================
// MAIN EXPORT
// ============================================

export const NodeConfigFields: React.FC<ConfigFieldsProps> = ({
  triggerId,
  actionId,
  nodeType,
  appId,
  config,
  updateConfig,
}) => {
  // Determine which config fields to show
  if (nodeType === 'trigger' && triggerId) {
    const ConfigComponent = TriggerConfigFields[triggerId];
    if (ConfigComponent) {
      return <ConfigComponent config={config} updateConfig={updateConfig} />;
    }
  }

  if (nodeType === 'action' && actionId) {
    const ConfigComponent = ActionConfigFields[actionId];
    if (ConfigComponent) {
      return <ConfigComponent config={config} updateConfig={updateConfig} />;
    }
  }

  // Logic node types
  if (['condition', 'delay', 'loop', 'switch', 'filter', 'router', 'error-handler'].includes(nodeType)) {
    const logicType = nodeType === 'router' ? 'switch' : nodeType === 'error-handler' ? 'condition' : nodeType;
    const ConfigComponent = LogicConfigFields[logicType];
    if (ConfigComponent) {
      return <ConfigComponent config={config} updateConfig={updateConfig} />;
    }
  }

  // Check by appId for common patterns
  if (appId) {
    // Try to find matching trigger/action config
    const TriggerConfigComponent = TriggerConfigFields[appId] || TriggerConfigFields[`${appId}_message`];
    if (TriggerConfigComponent && nodeType === 'trigger') {
      return <TriggerConfigComponent config={config} updateConfig={updateConfig} />;
    }
    
    const ActionConfigComponent = ActionConfigFields[`send_${appId}`] || ActionConfigFields[appId];
    if (ActionConfigComponent && nodeType === 'action') {
      return <ActionConfigComponent config={config} updateConfig={updateConfig} />;
    }
  }

  // Fallback to default
  return <DefaultConfig nodeType={nodeType} config={config} updateConfig={updateConfig} />;
};

export default NodeConfigFields;
