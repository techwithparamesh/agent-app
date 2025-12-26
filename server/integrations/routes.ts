/**
 * Integration API Routes
 * CRUD operations for managing external integrations
 */

import { Router } from 'express';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { integrations, integrationLogs, agents } from '@shared/schema';
import { integrationService } from './index';
import { storage } from '../storage';
import { decryptCredentialData } from './crypto';
import googleSheetsRouter from './google-sheets';
import trelloRouter from './trello';
import asanaRouter from './asana';
import jiraRouter from './jira';
import mondayRouter from './monday';
import clickupRouter from './clickup';
import linearRouter from './linear';
import calendlyRouter from './calendly';
import razorpayOptionsRouter from './razorpay';
import webhookOptionsRouter from './webhook';
import restApiOptionsRouter from './rest-api';
import graphqlOptionsRouter from './graphql';
import githubRouter from './github';
import gitlabRouter from './gitlab';
import bitbucketRouter from './bitbucket';
import openaiRouter from './openai';
import anthropicRouter from './anthropic';
import googleAiRouter from './google-ai';
import elevenlabsRouter from './elevenlabs';
import replicateRouter from './replicate';
import huggingfaceRouter from './huggingface';
import sendgridRouter from "./sendgrid";
import mailgunRouter from "./mailgun";
import twilioSmsRouter from "./twilio-sms";
import stripeRouter from "./stripe";
import shopifyRouter from "./shopify";
import googleAnalyticsRouter from './google-analytics';
import facebookAdsRouter from './facebook-ads';
import googleAdsRouter from './google-ads';
import linkedinOptionsRouter from './linkedin';
import tawkOptionsRouter from './tawk';
import scheduleOptionsRouter from './schedule';
import manualOptionsRouter from './manual';
import ifConditionOptionsRouter from './if-condition';
import switchOptionsRouter from './switch';
import loopOptionsRouter from './loop';
import setVariableOptionsRouter from './set-variable';
import codeOptionsRouter from './code';
import iftttOptionsRouter from './ifttt';
import azureOpenAiOptionsRouter from './azure-openai';
import intercomRouter from './intercom';
import zendeskOptionsRouter from './zendesk';
import freshdeskOptionsRouter from './freshdesk';
import crispOptionsRouter from './crisp';
import twilioVoiceOptionsRouter from './twilio-voice';
import zoomOptionsRouter from './zoom';
import googleMeetOptionsRouter from './google-meet';
import telegramOptionsRouter from './telegram';
import discordOptionsRouter from './discord';
import discordBotOptionsRouter from './discord-bot';
import mailchimpOptionsRouter from './mailchimp';
import googleSheetsOptionsRouter from './google-sheets-options';
import hubspotOptionsRouter from './hubspot';
import paypalOptionsRouter from './paypal';
import woocommerceOptionsRouter from './woocommerce';
import googleDriveOptionsRouter from './google-drive';
import googleCalendarOptionsRouter from './google-calendar';
import googleDocsOptionsRouter from './google-docs';
import googleFormsOptionsRouter from './google-forms';
import salesforceOptionsRouter from './salesforce';
import pipedriveOptionsRouter from './pipedrive';
import zohoCrmOptionsRouter from './zoho-crm';
import freshsalesOptionsRouter from './freshsales';
import zapierOptionsRouter from './zapier';
import makeOptionsRouter from './make';
import n8nOptionsRouter from './n8n';
import powerAutomateOptionsRouter from './power-automate';
import firebaseOptionsRouter from './firebase';
import supabaseOptionsRouter from './supabase';
import mongodbOptionsRouter from './mongodb';
import awsS3OptionsRouter from './aws-s3';
import dropboxOptionsRouter from './dropbox';
import whatsappOptionsRouter from './whatsapp';
import microsoftTeamsOptionsRouter from './microsoft-teams';
import gmailOptionsRouter from './gmail';
import outlookOptionsRouter from './outlook';
import smtpOptionsRouter from './smtp';
import slackBotOptionsRouter from './slack-bot';
import squareOptionsRouter from './square';
import webhookOutgoingOptionsRouter from './webhook-outgoing';
import customApiOptionsRouter from './custom-api';
import customIntegrationOptionsRouter from './custom-integration';
import segmentOptionsRouter from './segment';
import mixpanelOptionsRouter from './mixpanel';
import mastodonOptionsRouter from './mastodon';
import redditOptionsRouter from './reddit';
import snapchatOptionsRouter from './snapchat';
import driftOptionsRouter from './drift';
import hubspotOauthOptionsRouter from './hubspot-oauth';
import hubspotMarketingOptionsRouter from './hubspot-marketing';
import bigqueryOptionsRouter from './bigquery';
import cosmosdbOptionsRouter from './cosmosdb';
import postgresqlOptionsRouter from './postgresql';
import mysqlOptionsRouter from './mysql';
import redisOptionsRouter from './redis';
import dynamodbOptionsRouter from './dynamodb';
import elasticsearchOptionsRouter from './elasticsearch';
import liveagentOptionsRouter from './liveagent';
import helpscoutOptionsRouter from './helpscout';
import twitterOptionsRouter from './twitter';
import instagramOptionsRouter from './instagram';
import youtubeOptionsRouter from './youtube';
import tiktokOptionsRouter from './tiktok';
import pinterestOptionsRouter from './pinterest';

export const integrationRoutes = Router();

// Mount Google Sheets sub-router
integrationRoutes.use('/google-sheets', googleSheetsRouter);

// Resolve auth fields from a stored credentialId (n8n-style)
integrationRoutes.use('/options', async (req, res, next) => {
  try {
    const body = (req as any).body;
    const credentialId = body?.credentialId;
    if (!credentialId || typeof credentialId !== 'string') return next();

    const userId = (req as any).user?.claims?.sub;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const credential = await storage.getCredentialById(credentialId);
    if (!credential) return res.status(404).json({ message: 'Credential not found' });
    if (credential.userId !== userId) return res.status(403).json({ message: 'Forbidden' });
    if (credential.isValid === false) {
      return res.status(400).json({ message: 'Credential is not verified' });
    }

    const decrypted = decryptCredentialData(credential.encryptedData);

    const authKeys = Array.isArray(body?.authKeys)
      ? body.authKeys.filter((k: any) => typeof k === 'string')
      : [];

    const resolveAuthValue = (key: string): any => {
      if (decrypted && Object.prototype.hasOwnProperty.call(decrypted, key)) return (decrypted as any)[key];

      // Common fallbacks between schemas/templates
      if (key === 'accessToken') return decrypted?.accessToken || decrypted?.token || decrypted?.botToken;
      if (key === 'token') return decrypted?.token || decrypted?.accessToken || decrypted?.botToken;
      if (key === 'apiKey') return decrypted?.apiKey || decrypted?.key;
      if (key === 'botToken') return decrypted?.botToken || decrypted?.accessToken || decrypted?.token;
      return undefined;
    };

    for (const key of authKeys) {
      const current = body?.[key];
      if (current !== undefined && current !== null && String(current).length > 0) continue;
      const value = resolveAuthValue(key);
      if (value !== undefined) body[key] = value;
    }

    return next();
  } catch (error: any) {
    console.error('[Integrations Options] credentialId middleware error:', error);
    return res.status(500).json({ message: 'Failed to resolve credentials' });
  }
});

// Dynamic options loaders (used by the workflow builder config UI)
integrationRoutes.use('/options/trello', trelloRouter);
integrationRoutes.use('/options/asana', asanaRouter);
integrationRoutes.use('/options/jira', jiraRouter);
integrationRoutes.use('/options/monday', mondayRouter);
integrationRoutes.use('/options/clickup', clickupRouter);
integrationRoutes.use('/options/linear', linearRouter);
integrationRoutes.use('/options/calendly', calendlyRouter);
integrationRoutes.use('/options/razorpay', razorpayOptionsRouter);
integrationRoutes.use('/options/webhook', webhookOptionsRouter);
integrationRoutes.use('/options/rest_api', restApiOptionsRouter);
integrationRoutes.use('/options/graphql', graphqlOptionsRouter);
integrationRoutes.use('/options/github', githubRouter);
integrationRoutes.use('/options/gitlab', gitlabRouter);
integrationRoutes.use('/options/bitbucket', bitbucketRouter);
integrationRoutes.use('/options/openai', openaiRouter);
integrationRoutes.use('/options/anthropic', anthropicRouter);
integrationRoutes.use('/options/google_ai', googleAiRouter);
integrationRoutes.use('/options/elevenlabs', elevenlabsRouter);
integrationRoutes.use('/options/replicate', replicateRouter);
integrationRoutes.use('/options/huggingface', huggingfaceRouter);
  integrationRoutes.use("/options/sendgrid", sendgridRouter);
  integrationRoutes.use("/options/mailgun", mailgunRouter);
  integrationRoutes.use("/options/twilio_sms", twilioSmsRouter);
  integrationRoutes.use("/options/stripe", stripeRouter);
  integrationRoutes.use("/options/shopify", shopifyRouter);
integrationRoutes.use('/options/google_analytics', googleAnalyticsRouter);
integrationRoutes.use('/options/facebook_ads', facebookAdsRouter);
integrationRoutes.use('/options/google_ads', googleAdsRouter);
integrationRoutes.use('/options/linkedin', linkedinOptionsRouter);
integrationRoutes.use('/options/tawk', tawkOptionsRouter);
integrationRoutes.use('/options/schedule', scheduleOptionsRouter);
integrationRoutes.use('/options/manual', manualOptionsRouter);
integrationRoutes.use('/options/if_condition', ifConditionOptionsRouter);
integrationRoutes.use('/options/switch', switchOptionsRouter);
integrationRoutes.use('/options/loop', loopOptionsRouter);
integrationRoutes.use('/options/set_variable', setVariableOptionsRouter);
integrationRoutes.use('/options/code', codeOptionsRouter);
integrationRoutes.use('/options/ifttt', iftttOptionsRouter);
integrationRoutes.use('/options/azure_openai', azureOpenAiOptionsRouter);
integrationRoutes.use('/options/intercom', intercomRouter);
integrationRoutes.use('/options/zendesk', zendeskOptionsRouter);
integrationRoutes.use('/options/freshdesk', freshdeskOptionsRouter);
integrationRoutes.use('/options/crisp', crispOptionsRouter);
integrationRoutes.use('/options/twilio_voice', twilioVoiceOptionsRouter);
integrationRoutes.use('/options/zoom', zoomOptionsRouter);
integrationRoutes.use('/options/google_meet', googleMeetOptionsRouter);
integrationRoutes.use('/options/telegram', telegramOptionsRouter);
integrationRoutes.use('/options/discord', discordOptionsRouter);
integrationRoutes.use('/options/discord_bot', discordBotOptionsRouter);
integrationRoutes.use('/options/mailchimp', mailchimpOptionsRouter);
integrationRoutes.use('/options/google_sheets', googleSheetsOptionsRouter);
integrationRoutes.use('/options/hubspot', hubspotOptionsRouter);
integrationRoutes.use('/options/salesforce', salesforceOptionsRouter);
integrationRoutes.use('/options/pipedrive', pipedriveOptionsRouter);
integrationRoutes.use('/options/zoho_crm', zohoCrmOptionsRouter);
integrationRoutes.use('/options/freshsales', freshsalesOptionsRouter);
integrationRoutes.use('/options/zapier', zapierOptionsRouter);
integrationRoutes.use('/options/make', makeOptionsRouter);
integrationRoutes.use('/options/n8n', n8nOptionsRouter);
integrationRoutes.use('/options/power_automate', powerAutomateOptionsRouter);
integrationRoutes.use('/options/firebase', firebaseOptionsRouter);
integrationRoutes.use('/options/supabase', supabaseOptionsRouter);
integrationRoutes.use('/options/mongodb', mongodbOptionsRouter);
integrationRoutes.use('/options/aws_s3', awsS3OptionsRouter);
integrationRoutes.use('/options/dropbox', dropboxOptionsRouter);
integrationRoutes.use('/options/whatsapp', whatsappOptionsRouter);
integrationRoutes.use('/options/microsoft_teams', microsoftTeamsOptionsRouter);
integrationRoutes.use('/options/gmail', gmailOptionsRouter);
integrationRoutes.use('/options/outlook', outlookOptionsRouter);
integrationRoutes.use('/options/smtp', smtpOptionsRouter);
integrationRoutes.use('/options/slack_bot', slackBotOptionsRouter);
integrationRoutes.use('/options/square', squareOptionsRouter);
integrationRoutes.use('/options/webhook_outgoing', webhookOutgoingOptionsRouter);
integrationRoutes.use('/options/custom_api', customApiOptionsRouter);
integrationRoutes.use('/options/custom_integration', customIntegrationOptionsRouter);
integrationRoutes.use('/options/segment', segmentOptionsRouter);
integrationRoutes.use('/options/mixpanel', mixpanelOptionsRouter);
integrationRoutes.use('/options/mastodon', mastodonOptionsRouter);
integrationRoutes.use('/options/reddit', redditOptionsRouter);
integrationRoutes.use('/options/snapchat', snapchatOptionsRouter);
integrationRoutes.use('/options/drift', driftOptionsRouter);
integrationRoutes.use('/options/hubspot_oauth', hubspotOauthOptionsRouter);
integrationRoutes.use('/options/hubspot_marketing', hubspotMarketingOptionsRouter);
integrationRoutes.use('/options/bigquery', bigqueryOptionsRouter);
integrationRoutes.use('/options/cosmosdb', cosmosdbOptionsRouter);
integrationRoutes.use('/options/postgresql', postgresqlOptionsRouter);
integrationRoutes.use('/options/mysql', mysqlOptionsRouter);
integrationRoutes.use('/options/redis', redisOptionsRouter);
integrationRoutes.use('/options/dynamodb', dynamodbOptionsRouter);
integrationRoutes.use('/options/elasticsearch', elasticsearchOptionsRouter);
integrationRoutes.use('/options/liveagent', liveagentOptionsRouter);
integrationRoutes.use('/options/helpscout', helpscoutOptionsRouter);
integrationRoutes.use('/options/twitter', twitterOptionsRouter);
integrationRoutes.use('/options/instagram', instagramOptionsRouter);
integrationRoutes.use('/options/youtube', youtubeOptionsRouter);
integrationRoutes.use('/options/tiktok', tiktokOptionsRouter);
integrationRoutes.use('/options/pinterest', pinterestOptionsRouter);
integrationRoutes.use('/options/paypal', paypalOptionsRouter);
integrationRoutes.use('/options/woocommerce', woocommerceOptionsRouter);
integrationRoutes.use('/options/google_drive', googleDriveOptionsRouter);
integrationRoutes.use('/options/google_calendar', googleCalendarOptionsRouter);
integrationRoutes.use('/options/google_docs', googleDocsOptionsRouter);
integrationRoutes.use('/options/google_forms', googleFormsOptionsRouter);

// Catch-all: if an app has no server-side options loader yet, return an empty list
// rather than a 404 (keeps the UI error-free while providers are implemented).
integrationRoutes.all('/options/:appId/*', async (req, res) => {
  return res.json({ options: [] });
});
integrationRoutes.all('/options/:appId', async (req, res) => {
  return res.json({ options: [] });
});

// Get all integrations for user
integrationRoutes.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
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
    const userId = (req as any).user?.claims?.sub;
    const { agentId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
    const userId = (req as any).user?.claims?.sub;
    const { agentId, type, name, description, config, triggers } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
    const userId = (req as any).user?.claims?.sub;
    const { id } = req.params;
    const { name, description, config, triggers, isActive } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
    const userId = (req as any).user?.claims?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
    const userId = (req as any).user?.claims?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
    const userId = (req as any).user?.claims?.sub;
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
