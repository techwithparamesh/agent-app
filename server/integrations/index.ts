/**
 * Integration Service
 * Handles external integrations: Google Sheets, Webhooks, Email, Custom APIs
 */

import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { integrations, integrationLogs } from '@shared/schema';

// Integration Types
export type IntegrationType = 'google_sheets' | 'webhook' | 'zapier' | 'make' | 'email' | 'whatsapp_template' | 'custom_api';

export type TriggerEvent = 
  | 'appointment_booked' 
  | 'appointment_cancelled' 
  | 'appointment_reminder'
  | 'lead_captured' 
  | 'message_received' 
  | 'order_placed' 
  | 'payment_received' 
  | 'invoice_sent'
  | 'complaint_raised' 
  | 'feedback_received'
  | 'custom';

// Schema-compatible event type (matches database enum)
type SchemaEvent = 'appointment_booked' | 'appointment_cancelled' | 'lead_captured' | 
  'message_received' | 'order_placed' | 'payment_received' | 'complaint_raised' | 
  'feedback_received' | 'custom';

export interface IntegrationPayload {
  event: TriggerEvent;
  agentId: string;
  userId: string;
  data: Record<string, any>;
  timestamp: string;
}

/**
 * Main Integration Service
 */
export class IntegrationService {
  
  /**
   * Trigger integrations for a specific event
   */
  async triggerEvent(payload: IntegrationPayload): Promise<void> {
    console.log(`[Integrations] Triggering event: ${payload.event} for agent: ${payload.agentId}`);
    
    // Find all active integrations for this agent and event
    const activeIntegrations = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.agentId, payload.agentId),
          eq(integrations.isActive, true)
        )
      );

    // Filter integrations that match this trigger event
    const matchingIntegrations = activeIntegrations.filter(integration => {
      const triggers = integration.triggers as Array<{ event: string; conditions?: Record<string, any> }> || [];
      return triggers.some(trigger => trigger.event === payload.event || trigger.event === 'custom');
    });

    console.log(`[Integrations] Found ${matchingIntegrations.length} matching integrations`);

    // Execute each integration
    for (const integration of matchingIntegrations) {
      await this.executeIntegration(integration, payload);
    }
  }

  /**
   * Execute a single integration
   */
  private async executeIntegration(integration: any, payload: IntegrationPayload): Promise<void> {
    const startTime = Date.now();
    let status = 'success';
    let errorMessage: string | null = null;
    let outputData: Record<string, any> = {};

    try {
      switch (integration.type) {
        case 'google_sheets':
          outputData = await this.executeGoogleSheets(integration, payload);
          break;
        case 'webhook':
        case 'zapier':
        case 'make':
          outputData = await this.executeWebhook(integration, payload);
          break;
        case 'email':
          outputData = await this.executeEmail(integration, payload);
          break;
        case 'custom_api':
          outputData = await this.executeCustomApi(integration, payload);
          break;
        default:
          throw new Error(`Unknown integration type: ${integration.type}`);
      }

      // Update last triggered
      await db.update(integrations)
        .set({ 
          lastTriggeredAt: new Date(),
          lastError: null,
          errorCount: 0,
        })
        .where(eq(integrations.id, integration.id));

    } catch (error: any) {
      status = 'failed';
      errorMessage = error.message;
      console.error(`[Integrations] Error executing ${integration.type}:`, error);

      // Update error info
      await db.update(integrations)
        .set({ 
          lastError: errorMessage,
          errorCount: (integration.errorCount || 0) + 1,
        })
        .where(eq(integrations.id, integration.id));
    }

    // Log execution
    await db.insert(integrationLogs).values({
      integrationId: integration.id,
      triggerEvent: payload.event,
      inputData: payload.data,
      outputData,
      status,
      errorMessage,
      executionTimeMs: Date.now() - startTime,
    });
  }

  /**
   * Execute Google Sheets integration
   */
  private async executeGoogleSheets(integration: any, payload: IntegrationPayload): Promise<Record<string, any>> {
    const config = integration.config;
    
    if (!config?.spreadsheetId || !config?.sheetName) {
      throw new Error('Google Sheets integration missing spreadsheetId or sheetName');
    }

    // Map fields according to configuration
    const rowData = this.mapFields(payload.data, config.fieldMappings || []);
    
    // Use webhook approach - Google Apps Script or similar
    // This is the most reliable cross-platform approach
    if (config.webhookUrl) {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: config.spreadsheetId,
          sheetName: config.sheetName,
          data: rowData,
          event: payload.event,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Sheets webhook error: ${response.statusText}`);
      }

      return { success: true, row: rowData };
    }

    // Full Google Sheets API integration (requires googleapis package)
    // This would use service account credentials
    try {
      // @ts-ignore - googleapis is optional
      const { google } = await import('googleapis');
      
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(config.credentials || '{}'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      
      // Get headers from first row
      const headerResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `${config.sheetName}!1:1`,
      });
      
      const headers = headerResponse.data.values?.[0] || [];
      
      // Build row based on headers
      const row = headers.map((header: string) => rowData[header] || '');
      
      // Append row
      await sheets.spreadsheets.values.append({
        spreadsheetId: config.spreadsheetId,
        range: `${config.sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });

      return { success: true, row: rowData, headers };
    } catch (error: any) {
      // googleapis not installed or credentials invalid
      throw new Error(`Google Sheets API error: ${error.message}. Consider using webhook URL instead.`);
    }
  }

  /**
   * Execute Webhook integration (also handles Zapier, Make)
   */
  private async executeWebhook(integration: any, payload: IntegrationPayload): Promise<Record<string, any>> {
    const config = integration.config;
    
    if (!config?.webhookUrl) {
      throw new Error('Webhook URL is required');
    }

    // Map fields
    const mappedData = this.mapFields(payload.data, config.fieldMappings || []);
    
    // Build request body
    const body = {
      event: payload.event,
      timestamp: payload.timestamp,
      agentId: payload.agentId,
      data: mappedData,
    };

    const response = await fetch(config.webhookUrl, {
      method: config.webhookMethod || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.webhookHeaders,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = { status: response.status };
    }

    return { success: true, response: responseData };
  }

  /**
   * Execute Email integration
   */
  private async executeEmail(integration: any, payload: IntegrationPayload): Promise<Record<string, any>> {
    const config = integration.config;
    
    if (!config?.toEmails || config.toEmails.length === 0) {
      throw new Error('Email recipients required');
    }

    // Map fields for email template
    const mappedData = this.mapFields(payload.data, config.fieldMappings || []);
    
    // Build email content
    const subject = this.buildEmailSubject(payload.event, mappedData);
    const body = this.buildEmailBody(payload.event, mappedData);

    // Use nodemailer for direct SMTP
    if (config.smtpHost) {
      try {
        // @ts-ignore - nodemailer is optional
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.default.createTransport({
          host: config.smtpHost,
          port: config.smtpPort || 587,
          secure: config.smtpPort === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
        });

        await transporter.sendMail({
          from: config.fromEmail || config.smtpUser,
          to: config.toEmails.join(', '),
          subject,
          html: body,
        });

        return { success: true, recipients: config.toEmails.length };
      } catch (error: any) {
        throw new Error(`Email sending failed: ${error.message}`);
      }
    }

    // Fallback to webhook-based email (e.g., SendGrid, Mailgun webhook)
    if (config.emailWebhookUrl) {
      const response = await fetch(config.emailWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: config.toEmails,
          subject,
          html: body,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email webhook error: ${response.statusText}`);
      }

      return { success: true, recipients: config.toEmails.length };
    }

    throw new Error('SMTP configuration or email webhook URL required');
  }

  /**
   * Execute Custom API integration
   */
  private async executeCustomApi(integration: any, payload: IntegrationPayload): Promise<Record<string, any>> {
    const config = integration.config;
    
    if (!config?.apiUrl) {
      throw new Error('API URL is required');
    }

    const mappedData = this.mapFields(payload.data, config.fieldMappings || []);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.apiHeaders,
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: payload.event,
        data: mappedData,
        timestamp: payload.timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    return { success: true, response: responseData };
  }

  /**
   * Map fields according to configuration
   */
  private mapFields(data: Record<string, any>, mappings: Array<{ sourceField: string; targetField: string; transform?: string }>): Record<string, any> {
    if (!mappings || mappings.length === 0) {
      return data;
    }

    const result: Record<string, any> = {};
    
    for (const mapping of mappings) {
      let value = data[mapping.sourceField];
      
      // Apply transforms
      if (value !== undefined && mapping.transform) {
        switch (mapping.transform) {
          case 'uppercase':
            value = String(value).toUpperCase();
            break;
          case 'lowercase':
            value = String(value).toLowerCase();
            break;
          case 'date':
            value = new Date(value).toLocaleDateString();
            break;
          case 'datetime':
            value = new Date(value).toLocaleString();
            break;
          case 'number':
            value = Number(value);
            break;
        }
      }
      
      result[mapping.targetField] = value;
    }

    // Include unmapped fields
    for (const key of Object.keys(data)) {
      if (!mappings.find(m => m.sourceField === key)) {
        result[key] = data[key];
      }
    }

    return result;
  }

  /**
   * Build email subject based on event
   */
  private buildEmailSubject(event: TriggerEvent, data: Record<string, any>): string {
    const subjects: Record<TriggerEvent, string> = {
      appointment_booked: `New Appointment: ${data.customerName || 'Customer'} - ${data.date || ''}`,
      appointment_cancelled: `Appointment Cancelled: ${data.customerName || 'Customer'}`,
      appointment_reminder: `Reminder: Appointment with ${data.customerName || 'Customer'}`,
      lead_captured: `New Lead: ${data.name || data.customerName || 'Unknown'}`,
      message_received: `New WhatsApp Message from ${data.userPhone || 'Customer'}`,
      order_placed: `New Order #${data.orderId || ''} from ${data.customerName || 'Customer'}`,
      payment_received: `Payment Received: ${data.amount || ''} from ${data.customerName || 'Customer'}`,
      invoice_sent: `Invoice Sent to ${data.customerEmail || data.customerName || 'Customer'}`,
      complaint_raised: `New Complaint from ${data.customerName || 'Customer'}`,
      feedback_received: `New Feedback: ${data.rating || ''} stars`,
      custom: data.subject || 'Notification',
    };
    return subjects[event] || 'Notification';
  }

  /**
   * Build email body based on event
   */
  private buildEmailBody(event: TriggerEvent, data: Record<string, any>): string {
    const dataRows = Object.entries(data)
      .map(([key, value]) => `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${key}</td><td style="padding:8px;border:1px solid #ddd;">${value}</td></tr>`)
      .join('');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #333;">New ${event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            ${dataRows}
          </table>
          <p style="color: #666; margin-top: 20px; font-size: 12px;">
            This is an automated notification from your AI agent.
          </p>
        </body>
      </html>
    `;
  }

  /**
   * Create a new integration
   */
  async createIntegration(data: {
    userId: string;
    agentId: string;
    type: IntegrationType;
    name: string;
    description?: string;
    config: Record<string, any>;
    triggers: Array<{ event: TriggerEvent; conditions?: Record<string, any> }>;
  }): Promise<string> {
    // Map triggers to schema-compatible format
    const schemaTriggers = data.triggers.map(t => ({
      event: (t.event === 'appointment_reminder' || t.event === 'invoice_sent' ? 'custom' : t.event) as SchemaEvent,
      conditions: t.conditions,
    }));

    const [result] = await db.insert(integrations).values({
      userId: data.userId,
      agentId: data.agentId,
      type: data.type,
      name: data.name,
      description: data.description,
      config: data.config,
      triggers: schemaTriggers,
      isActive: true,
    });

    return result.insertId.toString();
  }

  /**
   * Get integrations for an agent
   */
  async getIntegrationsByAgent(agentId: string) {
    return db.select().from(integrations).where(eq(integrations.agentId, agentId));
  }

  /**
   * Get integration logs
   */
  async getIntegrationLogs(integrationId: string, limit = 50) {
    return db
      .select()
      .from(integrationLogs)
      .where(eq(integrationLogs.integrationId, integrationId))
      .orderBy(integrationLogs.createdAt)
      .limit(limit);
  }

  /**
   * Test an integration
   */
  async testIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, integrationId));
    
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    const testPayload: IntegrationPayload = {
      event: 'custom',
      agentId: integration.agentId || '',
      userId: integration.userId,
      data: {
        test: true,
        message: 'This is a test from your AI agent integration',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    try {
      await this.executeIntegration(integration, testPayload);
      return { success: true, message: 'Test successful! Check your destination for the test data.' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

// Singleton instance
export const integrationService = new IntegrationService();
