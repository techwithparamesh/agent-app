/**
 * n8n-Style Schema Registry
 * 
 * Central export for all n8n-style app schemas
 */

// Types
export * from './types';

// Schema Registry Types
import { N8nAppSchema, N8nResource, N8nOperation, N8nSchemaRegistry } from './types';

// Communication Schemas
import { whatsappSchema } from './whatsapp';
import { slackSchema } from './slack';
import { telegramSchema } from './telegram';
import { discordSchema } from './discord';
import { microsoftTeamsSchema } from './microsoft-teams';
import { zoomSchema } from './zoom';

// Email Schemas
import { gmailSchema } from './gmail';
import { sendgridSchema } from './sendgrid';
import { mailchimpSchema } from './mailchimp';
import { outlookSchema } from './outlook';
import { smtpSchema } from './smtp';

// CRM Schemas
import { hubspotSchema } from './hubspot';
import { salesforceSchema } from './salesforce';
import { pipedriveSchema } from './pipedrive';
import { zohoSchema } from './zoho';
import { freshsalesSchema } from './freshsales';
import { intercomSchema } from './intercom';

// E-commerce Schemas
import { shopifySchema } from './shopify';
import { stripeSchema } from './stripe';
import { woocommerceSchema } from './woocommerce';
import { paypalSchema } from './paypal';
import { razorpaySchema } from './razorpay';

// Productivity Schemas
import { googleSheetsSchema } from './google-sheets';
import { notionSchema } from './notion';
import { trelloSchema } from './trello';
import { asanaSchema } from './asana';
import { jiraSchema } from './jira';
import { mondaySchema } from './monday';
import { clickupSchema } from './clickup';
import { calendlySchema } from './calendly';

// Database Schemas
import { airtableSchema } from './airtable';
import { firebaseSchema } from './firebase';
import { mongodbSchema } from './mongodb';
import { supabaseSchema } from './supabase';
import { postgresqlSchema } from './postgresql';
import { mysqlSchema } from './mysql';
import { redisSchema } from './redis';
import { dynamodbSchema } from './dynamodb';
import { elasticsearchSchema } from './elasticsearch';

// Developer Schemas
import { webhooksSchema } from './webhooks';
import { restApiSchema } from './rest-api';
import { githubSchema } from './github';
import { gitlabSchema } from './gitlab';
import { bitbucketSchema } from './bitbucket';
import { graphqlSchema } from './graphql';

// Google Workspace Schemas
import { googleDriveSchema } from './google-drive';
import { googleCalendarSchema } from './google-calendar';
import { googleMeetSchema } from './google-meet';
import { googleDocsSchema } from './google-docs';
import { googleFormsSchema } from './google-forms';
import { googleAnalyticsSchema } from './google-analytics';
import { googleAdsSchema } from './google-ads';

// AI Schemas
import { openAiSchema } from './openai';
import { anthropicSchema } from './anthropic';
import { googleAISchema } from './google-ai';
import { elevenLabsSchema } from './elevenlabs';

// Support Schemas
import { zendeskSchema } from './zendesk';
import { freshdeskSchema } from './freshdesk';
import { liveagentSchema } from './liveagent';
import { helpscoutSchema } from './helpscout';

// Marketing Schemas
import { facebookAdsSchema } from './facebook-ads';
import { twilioSchema } from './twilio';

// Cloud & Storage Schemas
import { dropboxSchema } from './dropbox';
import { awsS3Schema } from './aws-s3';
import { awsSesSchema } from './aws-ses';
import { awsLambdaSchema } from './aws-lambda';

// Social Media Schemas
import { twitterSchema } from './twitter';
import { instagramSchema } from './instagram';
import { youtubeSchema } from './youtube';
import { tiktokSchema } from './tiktok';
import { pinterestSchema } from './pinterest';
import { linkedinSchema } from './linkedin';

// Automation Schemas
import { makeSchema, n8nSchema, iftttSchema, powerAutomateSchema } from './automation';

// Export all individual schemas
export { whatsappSchema } from './whatsapp';
export { slackSchema } from './slack';
export { telegramSchema } from './telegram';
export { discordSchema } from './discord';
export { microsoftTeamsSchema } from './microsoft-teams';
export { zoomSchema } from './zoom';
export { gmailSchema } from './gmail';
export { sendgridSchema } from './sendgrid';
export { mailchimpSchema } from './mailchimp';
export { outlookSchema } from './outlook';
export { smtpSchema } from './smtp';
export { hubspotSchema } from './hubspot';
export { salesforceSchema } from './salesforce';
export { pipedriveSchema } from './pipedrive';
export { zohoSchema } from './zoho';
export { freshsalesSchema } from './freshsales';
export { intercomSchema } from './intercom';
export { shopifySchema } from './shopify';
export { stripeSchema } from './stripe';
export { woocommerceSchema } from './woocommerce';
export { paypalSchema } from './paypal';
export { razorpaySchema } from './razorpay';
export { googleSheetsSchema } from './google-sheets';
export { notionSchema } from './notion';
export { trelloSchema } from './trello';
export { asanaSchema } from './asana';
export { jiraSchema } from './jira';
export { mondaySchema } from './monday';
export { clickupSchema } from './clickup';
export { calendlySchema } from './calendly';
export { airtableSchema } from './airtable';
export { firebaseSchema } from './firebase';
export { mongodbSchema } from './mongodb';
export { supabaseSchema } from './supabase';
export { postgresqlSchema } from './postgresql';
export { mysqlSchema } from './mysql';
export { redisSchema } from './redis';
export { dynamodbSchema } from './dynamodb';
export { elasticsearchSchema } from './elasticsearch';
export { webhooksSchema } from './webhooks';
export { restApiSchema } from './rest-api';
export { githubSchema } from './github';
export { gitlabSchema } from './gitlab';
export { bitbucketSchema } from './bitbucket';
export { graphqlSchema } from './graphql';
export { googleDriveSchema } from './google-drive';
export { googleCalendarSchema } from './google-calendar';
export { googleMeetSchema } from './google-meet';
export { googleDocsSchema } from './google-docs';
export { googleFormsSchema } from './google-forms';
export { googleAnalyticsSchema } from './google-analytics';
export { googleAdsSchema } from './google-ads';
export { openAiSchema } from './openai';
export { anthropicSchema } from './anthropic';
export { googleAISchema } from './google-ai';
export { elevenLabsSchema } from './elevenlabs';
export { zendeskSchema } from './zendesk';
export { freshdeskSchema } from './freshdesk';
export { liveagentSchema } from './liveagent';
export { helpscoutSchema } from './helpscout';
export { facebookAdsSchema } from './facebook-ads';
export { twilioSchema } from './twilio';
export { dropboxSchema } from './dropbox';
export { awsS3Schema } from './aws-s3';
export { awsSesSchema } from './aws-ses';
export { awsLambdaSchema } from './aws-lambda';
export { twitterSchema } from './twitter';
export { instagramSchema } from './instagram';
export { youtubeSchema } from './youtube';
export { tiktokSchema } from './tiktok';
export { pinterestSchema } from './pinterest';
export { linkedinSchema } from './linkedin';
export { makeSchema, n8nSchema, iftttSchema, powerAutomateSchema } from './automation';

// All schemas array (76 total)
const allSchemas: N8nAppSchema[] = [
  // Communication (6)
  whatsappSchema, slackSchema, telegramSchema, discordSchema, microsoftTeamsSchema, zoomSchema,
  // Email (5)
  gmailSchema, sendgridSchema, mailchimpSchema, outlookSchema, smtpSchema,
  // CRM (6)
  hubspotSchema, salesforceSchema, pipedriveSchema, zohoSchema, freshsalesSchema, intercomSchema,
  // E-commerce (5)
  shopifySchema, stripeSchema, woocommerceSchema, paypalSchema, razorpaySchema,
  // Productivity (8)
  googleSheetsSchema, notionSchema, trelloSchema, asanaSchema, jiraSchema, mondaySchema, clickupSchema, calendlySchema,
  // Database (9)
  airtableSchema, firebaseSchema, mongodbSchema, supabaseSchema, postgresqlSchema, mysqlSchema, redisSchema, dynamodbSchema, elasticsearchSchema,
  // Developer (6)
  webhooksSchema, restApiSchema, githubSchema, gitlabSchema, bitbucketSchema, graphqlSchema,
  // Google Workspace (7)
  googleDriveSchema, googleCalendarSchema, googleMeetSchema, googleDocsSchema, googleFormsSchema, googleAnalyticsSchema, googleAdsSchema,
  // AI (4)
  openAiSchema, anthropicSchema, googleAISchema, elevenLabsSchema,
  // Support (4)
  zendeskSchema, freshdeskSchema, liveagentSchema, helpscoutSchema,
  // Marketing (2)
  facebookAdsSchema, twilioSchema,
  // Cloud & Storage (4)
  dropboxSchema, awsS3Schema, awsSesSchema, awsLambdaSchema,
  // Social Media (6)
  twitterSchema, instagramSchema, youtubeSchema, tiktokSchema, pinterestSchema, linkedinSchema,
  // Automation (4)
  makeSchema, n8nSchema, iftttSchema, powerAutomateSchema,
];

// Create the registry
const schemaMap = new Map<string, N8nAppSchema>();
allSchemas.forEach(schema => {
  schemaMap.set(schema.id, schema);
});

export const n8nSchemaRegistry: N8nSchemaRegistry = {
  apps: schemaMap,
  
  getApp: (appId: string): N8nAppSchema | undefined => {
    return schemaMap.get(appId);
  },
  
  getResource: (appId: string, resourceId: string): N8nResource | undefined => {
    const app = schemaMap.get(appId);
    if (!app) return undefined;
    return app.resources.find(r => r.id === resourceId || r.value === resourceId);
  },
  
  getOperation: (appId: string, resourceId: string, operationId: string): N8nOperation | undefined => {
    const resource = n8nSchemaRegistry.getResource(appId, resourceId);
    if (!resource) return undefined;
    return resource.operations.find(o => o.id === operationId || o.value === operationId);
  },
  
  searchApps: (query: string): N8nAppSchema[] => {
    const lowerQuery = query.toLowerCase();
    return allSchemas.filter(schema => 
      schema.name.toLowerCase().includes(lowerQuery) ||
      schema.description.toLowerCase().includes(lowerQuery) ||
      schema.group.some(g => g.toLowerCase().includes(lowerQuery))
    );
  },
};

// Helper to get all available apps
export const getAllN8nApps = (): N8nAppSchema[] => allSchemas;

// Helper to get apps by group
export const getN8nAppsByGroup = (group: string): N8nAppSchema[] => {
  return allSchemas.filter(schema => 
    schema.group.some(g => g.toLowerCase() === group.toLowerCase())
  );
};

// Default export
export default n8nSchemaRegistry;
