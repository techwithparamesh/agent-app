/**
 * Integration API Routes
























































































































































































}  );    </div>      )}        </p>          </a>            Open in Google Sheets          >            className="hover:underline"            rel="noopener noreferrer"            target="_blank"            href={selectedSpreadsheet.url}          <a          <ExternalLink className="h-3 w-3" />        <p className="text-xs text-muted-foreground flex items-center gap-1">      {selectedSpreadsheet && (      )}        </Alert>          <AlertDescription>{error}</AlertDescription>          <AlertCircle className="h-4 w-4" />        <Alert variant="destructive" className="mt-2">      {error && (      </Select>        </SelectContent>          )}            </SelectItem>              No spreadsheets available            <SelectItem value="__no_items__" disabled>          ) : (            ))              </SelectItem>                </div>                  </a>                    <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />                  >                    className="opacity-0 group-hover:opacity-100 transition-opacity"                    onClick={(e) => e.stopPropagation()}                    rel="noopener noreferrer"                    target="_blank"                    href={spreadsheet.url}                  <a                  <span>{spreadsheet.name}</span>                <div className="flex items-center justify-between w-full gap-2">              <SelectItem key={spreadsheet.id} value={spreadsheet.id}>            spreadsheets.map((spreadsheet) => (          {spreadsheets.length > 0 ? (        <SelectContent>        </SelectTrigger>          </SelectValue>            )}              <span className="text-muted-foreground">Select a spreadsheet</span>            ) : (              selectedSpreadsheet?.name || 'Select a spreadsheet'            ) : value ? (              <span className="text-muted-foreground">No spreadsheets found</span>            ) : spreadsheets.length === 0 && !error ? (              <span className="text-muted-foreground">Connect Google account first</span>            ) : !credentialId ? (              </div>                <span>Loading spreadsheets...</span>                <Loader2 className="h-4 w-4 animate-spin" />              <div className="flex items-center gap-2">            {loading ? (          <SelectValue>        <SelectTrigger id="spreadsheet-select">      >        disabled={disabled || loading || !credentialId}        onValueChange={handleSelect}        value={value}      <Select      </div>        )}          </Button>            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />          >            className="h-7 px-2"            disabled={loading || disabled}            onClick={handleRefresh}            size="sm"            variant="ghost"            type="button"          <Button        {spreadsheets.length > 0 && (        </Label>          <span className="text-destructive ml-1">*</span>          Spreadsheet        <Label htmlFor="spreadsheet-select">      <div className="flex items-center justify-between">    <div className="space-y-2">  return (  const selectedSpreadsheet = spreadsheets.find(s => s.id === value);  }    loadSpreadsheets();  function handleRefresh() {  }    }      onChange(spreadsheetId, selected.name);    if (selected) {    const selected = spreadsheets.find(s => s.id === spreadsheetId);  function handleSelect(spreadsheetId: string) {  }    }      setLoading(false);    } finally {      setSpreadsheets([]);      setError(err.message || 'Failed to load spreadsheets');      console.error('[SpreadsheetPicker] Error loading spreadsheets:', err);    } catch (err: any) {      setSpreadsheets(data.spreadsheets || []);      const data = await response.json();      }        throw new Error(errorData.message || 'Failed to load spreadsheets');        const errorData = await response.json();      if (!response.ok) {      );        `/api/integrations/google-sheets/spreadsheets?credentialId=${credentialId}`      const response = await fetch(    try {    setError(null);    setLoading(true);    }      return;      setError('Please connect your Google account first');    if (!credentialId) {  async function loadSpreadsheets() {  }, [credentialId]);    }      loadSpreadsheets();    if (credentialId) {  useEffect(() => {  const [error, setError] = useState<string | null>(null);  const [loading, setLoading] = useState(false);  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);}: SpreadsheetPickerProps) {  disabled = false,  onChange,  value,  credentialId,export function SpreadsheetPicker({}  disabled?: boolean;  onChange: (spreadsheetId: string, spreadsheetName: string) => void;  value?: string;  credentialId?: string;interface SpreadsheetPickerProps {}  url: string;  name: string;  id: string;interface Spreadsheet {import { AlertCircle } from 'lucide-react';import { Alert, AlertDescription } from '@/components/ui/alert';import { Button } from '@/components/ui/button';import { Loader2, ExternalLink, RefreshCw } from 'lucide-react';import { Label } from '@/components/ui/label';} from '@/components/ui/select';  SelectValue,  SelectTrigger,  SelectItem,  SelectContent,  Select,import {import { useState, useEffect } from 'react'; */ * Matches n8n's resource selection pattern * Loads actual user spreadsheets from Google Sheets API * CRUD operations for managing external integrations
 */

import { Router } from 'express';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { integrations, integrationLogs, agents } from '@shared/schema';
import { integrationService } from './index';
import googleSheetsRouter from './google-sheets/api';

export const integrationRoutes = Router();

// Mount Google Sheets sub-router
integrationRoutes.use('/google-sheets', googleSheetsRouter);

// Get all integrations for user
integrationRoutes.get('/', async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    const userIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, userId))
      .orderBy(desc(integrations.createdAt));

    res.json({ integrations: userIntegrations });
  } catch (error: any) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get integrations for a specific agent
integrationRoutes.get('/agent/:agentId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { agentId } = req.params;

    // Verify agent ownership
    const [agent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.userId, userId)))
      .limit(1);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agentIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.agentId, agentId))
      .orderBy(desc(integrations.createdAt));

    res.json({ integrations: agentIntegrations });
  } catch (error: any) {
    console.error('Error fetching agent integrations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new integration
integrationRoutes.post('/', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { agentId, type, name, description, config, triggers } = req.body;

    if (!type || !name) {
      return res.status(400).json({ error: 'Type and name are required' });
    }

    // Verify agent ownership if agentId provided
    if (agentId) {
      const [agent] = await db
        .select()
        .from(agents)
        .where(and(eq(agents.id, agentId), eq(agents.userId, userId)))
        .limit(1);

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
    }

    // Create integration
    const [result] = await db.insert(integrations).values({
      userId,
      agentId,
      type,
      name,
      description,
      config: config || {},
      triggers: triggers || [],
      isActive: true,
    });

    const [created] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, result.insertId.toString()))
      .limit(1);

    res.status(201).json({ integration: created });
  } catch (error: any) {
    console.error('Error creating integration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an integration
integrationRoutes.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, description, config, triggers, isActive } = req.body;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId)))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Update
    await db.update(integrations)
      .set({
        name: name ?? existing.name,
        description: description ?? existing.description,
        config: config ?? existing.config,
        triggers: triggers ?? existing.triggers,
        isActive: isActive ?? existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(integrations.id, id));

    const [updated] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id))
      .limit(1);

    res.json({ integration: updated });
  } catch (error: any) {
    console.error('Error updating integration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an integration
integrationRoutes.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId)))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Delete logs first (cascade might handle this, but being explicit)
    await db.delete(integrationLogs).where(eq(integrationLogs.integrationId, id));
    
    // Delete integration
    await db.delete(integrations).where(eq(integrations.id, id));

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting integration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test an integration
integrationRoutes.post('/:id/test', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId)))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const result = await integrationService.testIntegration(id);
    res.json(result);
  } catch (error: any) {
    console.error('Error testing integration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get integration logs
integrationRoutes.get('/:id/logs', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.userId, userId)))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const logs = await db
      .select()
      .from(integrationLogs)
      .where(eq(integrationLogs.integrationId, id))
      .orderBy(desc(integrationLogs.createdAt))
      .limit(limit);

    res.json({ logs });
  } catch (error: any) {
    console.error('Error fetching integration logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available trigger events
integrationRoutes.get('/events', async (_req, res) => {
  const events = [
    { id: 'appointment_booked', name: 'Appointment Booked', category: 'appointments' },
    { id: 'appointment_cancelled', name: 'Appointment Cancelled', category: 'appointments' },
    { id: 'appointment_reminder', name: 'Appointment Reminder', category: 'appointments' },
    { id: 'lead_captured', name: 'Lead Captured', category: 'leads' },
    { id: 'message_received', name: 'Message Received', category: 'conversations' },
    { id: 'order_placed', name: 'Order Placed', category: 'orders' },
    { id: 'payment_received', name: 'Payment Received', category: 'billing' },
    { id: 'invoice_sent', name: 'Invoice Sent', category: 'billing' },
    { id: 'complaint_raised', name: 'Complaint Raised', category: 'support' },
    { id: 'feedback_received', name: 'Feedback Received', category: 'support' },
    { id: 'custom', name: 'Custom Event', category: 'custom' },
  ];

  res.json({ events });
});

// Get integration templates
integrationRoutes.get('/templates', async (_req, res) => {
  const templates = [
    {
      id: 'google_sheets_appointments',
      name: 'Google Sheets - Appointments',
      description: 'Automatically log all appointments to a Google Sheet',
      type: 'google_sheets',
      config: {
        sheetName: 'Appointments',
        fieldMappings: [
          { sourceField: 'customerName', targetField: 'Customer Name' },
          { sourceField: 'customerPhone', targetField: 'Phone' },
          { sourceField: 'date', targetField: 'Date' },
          { sourceField: 'time', targetField: 'Time' },
          { sourceField: 'serviceType', targetField: 'Service' },
          { sourceField: 'status', targetField: 'Status' },
        ],
      },
      triggers: [
        { event: 'appointment_booked' },
        { event: 'appointment_cancelled' },
      ],
    },
    {
      id: 'google_sheets_leads',
      name: 'Google Sheets - Leads',
      description: 'Capture all leads in a Google Sheet',
      type: 'google_sheets',
      config: {
        sheetName: 'Leads',
        fieldMappings: [
          { sourceField: 'name', targetField: 'Name' },
          { sourceField: 'phone', targetField: 'Phone' },
          { sourceField: 'email', targetField: 'Email' },
          { sourceField: 'interest', targetField: 'Interest' },
          { sourceField: 'source', targetField: 'Source' },
        ],
      },
      triggers: [{ event: 'lead_captured' }],
    },
    {
      id: 'webhook_zapier',
      name: 'Zapier Webhook',
      description: 'Send events to Zapier for advanced automation',
      type: 'zapier',
      config: {
        webhookMethod: 'POST',
      },
      triggers: [],
    },
    {
      id: 'webhook_make',
      name: 'Make (Integromat) Webhook',
      description: 'Send events to Make for workflow automation',
      type: 'make',
      config: {
        webhookMethod: 'POST',
      },
      triggers: [],
    },
    {
      id: 'email_notifications',
      name: 'Email Notifications',
      description: 'Receive email notifications for events',
      type: 'email',
      config: {},
      triggers: [
        { event: 'appointment_booked' },
        { event: 'lead_captured' },
      ],
    },
  ];

  res.json({ templates });
});
