// Export all integration types
export * from './types';

// Import integrations from each category
import { whatsappIntegration } from './whatsapp';
import { slackIntegration, telegramIntegration, discordIntegration } from './communication';
import { gmailIntegration, sendgridIntegration, mailchimpIntegration, outlookIntegration, smtpIntegration } from './email';
import { hubspotIntegration, salesforceIntegration, pipedriveIntegration, zohoIntegration, freshsalesIntegration } from './crm';
import { shopifyIntegration, stripeIntegration, woocommerceIntegration, paypalIntegration, razorpayIntegration } from './ecommerce';
import { googleSheetsIntegration, notionIntegration, trelloIntegration, asanaIntegration, jiraIntegration, mondayIntegration, clickupIntegration, calendlyIntegration } from './productivity';
import { airtableIntegration, firebaseIntegration, mongodbIntegration, supabaseIntegration, elasticsearchIntegration } from './database';
import { webhooksIntegration, restApiIntegration, githubIntegration, zapierIntegration, gitlabIntegration, bitbucketIntegration, graphqlIntegration } from './developer';
import { openaiIntegration, anthropicIntegration, googleAiIntegration, elevenLabsIntegration } from './ai';

// New imports - Marketing
import { googleAnalyticsIntegration, facebookAdsIntegration, googleAdsIntegration, intercomIntegration, twilioIntegration } from './marketing';

// New imports - Google Workspace
import { googleDriveIntegration, googleCalendarIntegration, googleMeetIntegration, googleDocsIntegration, googleFormsIntegration } from './google';

// New imports - Support & Communication
import { zendeskIntegration, freshdeskIntegration, microsoftTeamsIntegration, zoomIntegration, linkedinIntegration, liveagentIntegration, helpscoutIntegration } from './support';

// New imports - Cloud & Storage
import { dropboxIntegration, awsS3Integration, postgresqlIntegration, mysqlIntegration, redisIntegration, dynamodbIntegration } from './cloud';

// New imports - Automation
import { makeIntegration, n8nIntegration, iftttIntegration, powerAutomateIntegration } from './automation';

// New imports - Social Media
import { twitterIntegration, instagramIntegration, youtubeIntegration, tiktokIntegration, pinterestIntegration } from './social';

import type { Integration, IntegrationCategory } from './types';

// All integrations array (76 total)
export const allIntegrations: Integration[] = [
  // Communication (10)
  whatsappIntegration,
  slackIntegration,
  telegramIntegration,
  discordIntegration,
  microsoftTeamsIntegration,
  zoomIntegration,
  zendeskIntegration,
  freshdeskIntegration,
  liveagentIntegration,
  helpscoutIntegration,
  
  // Email (5)
  gmailIntegration,
  sendgridIntegration,
  mailchimpIntegration,
  outlookIntegration,
  smtpIntegration,
  
  // CRM (6)
  hubspotIntegration,
  salesforceIntegration,
  pipedriveIntegration,
  intercomIntegration,
  zohoIntegration,
  freshsalesIntegration,
  
  // E-commerce (5)
  shopifyIntegration,
  stripeIntegration,
  woocommerceIntegration,
  paypalIntegration,
  razorpayIntegration,
  
  // Productivity (8)
  googleSheetsIntegration,
  notionIntegration,
  trelloIntegration,
  asanaIntegration,
  jiraIntegration,
  mondayIntegration,
  clickupIntegration,
  calendlyIntegration,
  
  // Database (10)
  airtableIntegration,
  firebaseIntegration,
  mongodbIntegration,
  supabaseIntegration,
  postgresqlIntegration,
  mysqlIntegration,
  redisIntegration,
  dropboxIntegration,
  awsS3Integration,
  elasticsearchIntegration,
  
  // Developer (11)
  webhooksIntegration,
  restApiIntegration,
  githubIntegration,
  zapierIntegration,
  gitlabIntegration,
  bitbucketIntegration,
  graphqlIntegration,
  makeIntegration,
  n8nIntegration,
  iftttIntegration,
  powerAutomateIntegration,
  
  // Google Workspace (5)
  googleDriveIntegration,
  googleCalendarIntegration,
  googleMeetIntegration,
  googleDocsIntegration,
  googleFormsIntegration,
  
  // AI (4)
  openaiIntegration,
  anthropicIntegration,
  googleAiIntegration,
  elevenLabsIntegration,
  
  // Marketing (5)
  googleAnalyticsIntegration,
  facebookAdsIntegration,
  googleAdsIntegration,
  twilioIntegration,
  linkedinIntegration,
  
  // Database (11)
  dynamodbIntegration,
  
  // Social Media (5)
  twitterIntegration,
  instagramIntegration,
  youtubeIntegration,
  tiktokIntegration,
  pinterestIntegration,
];

// Group integrations by category
export const integrationsByCategory: Record<IntegrationCategory, Integration[]> = {
  communication: [
    whatsappIntegration, slackIntegration, telegramIntegration, discordIntegration,
    microsoftTeamsIntegration, zoomIntegration, zendeskIntegration, freshdeskIntegration,
    liveagentIntegration, helpscoutIntegration
  ],
  email: [gmailIntegration, sendgridIntegration, mailchimpIntegration, outlookIntegration, smtpIntegration],
  crm: [hubspotIntegration, salesforceIntegration, pipedriveIntegration, intercomIntegration, zohoIntegration, freshsalesIntegration],
  ecommerce: [shopifyIntegration, stripeIntegration, woocommerceIntegration, paypalIntegration, razorpayIntegration],
  productivity: [googleSheetsIntegration, notionIntegration, trelloIntegration, asanaIntegration, jiraIntegration, mondayIntegration, clickupIntegration, calendlyIntegration],
  database: [
    airtableIntegration, firebaseIntegration, mongodbIntegration, supabaseIntegration,
    postgresqlIntegration, mysqlIntegration, redisIntegration, dropboxIntegration, awsS3Integration, elasticsearchIntegration, dynamodbIntegration
  ],
  developer: [webhooksIntegration, restApiIntegration, githubIntegration, zapierIntegration, gitlabIntegration, bitbucketIntegration, graphqlIntegration, makeIntegration, n8nIntegration, iftttIntegration, powerAutomateIntegration],
  google: [googleDriveIntegration, googleCalendarIntegration, googleMeetIntegration, googleDocsIntegration, googleFormsIntegration],
  ai: [openaiIntegration, anthropicIntegration, googleAiIntegration, elevenLabsIntegration],
  marketing: [googleAnalyticsIntegration, facebookAdsIntegration, googleAdsIntegration, twilioIntegration, linkedinIntegration, twitterIntegration, instagramIntegration, youtubeIntegration, tiktokIntegration, pinterestIntegration],
};

// Helper functions
export function getIntegrationById(id: string): Integration | undefined {
  return allIntegrations.find(i => i.id === id);
}

export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return integrationsByCategory[category] || [];
}

export function searchIntegrations(query: string): Integration[] {
  const lowerQuery = query.toLowerCase();
  return allIntegrations.filter(
    i =>
      i.name.toLowerCase().includes(lowerQuery) ||
      i.description.toLowerCase().includes(lowerQuery) ||
      i.shortDescription.toLowerCase().includes(lowerQuery) ||
      i.features.some(f => f.toLowerCase().includes(lowerQuery)) ||
      i.useCases.some(u => u.toLowerCase().includes(lowerQuery))
  );
}

export function getFeaturedIntegrations(): Integration[] {
  const featuredIds = ['whatsapp', 'slack', 'hubspot', 'shopify', 'openai', 'google-sheets'];
  return featuredIds.map(id => getIntegrationById(id)).filter(Boolean) as Integration[];
}

// Re-export individual integrations for direct imports
export {
  // Communication (10)
  whatsappIntegration,
  slackIntegration,
  telegramIntegration,
  discordIntegration,
  microsoftTeamsIntegration,
  zoomIntegration,
  zendeskIntegration,
  freshdeskIntegration,
  liveagentIntegration,
  helpscoutIntegration,
  
  // Email (5)
  gmailIntegration,
  sendgridIntegration,
  mailchimpIntegration,
  outlookIntegration,
  smtpIntegration,
  
  // CRM (6)
  hubspotIntegration,
  salesforceIntegration,
  pipedriveIntegration,
  intercomIntegration,
  zohoIntegration,
  freshsalesIntegration,
  
  // E-commerce (5)
  shopifyIntegration,
  stripeIntegration,
  woocommerceIntegration,
  paypalIntegration,
  razorpayIntegration,
  
  // Productivity (8)
  googleSheetsIntegration,
  notionIntegration,
  trelloIntegration,
  asanaIntegration,
  jiraIntegration,
  mondayIntegration,
  clickupIntegration,
  calendlyIntegration,
  
  // Database (11)
  airtableIntegration,
  firebaseIntegration,
  mongodbIntegration,
  supabaseIntegration,
  postgresqlIntegration,
  mysqlIntegration,
  redisIntegration,
  dropboxIntegration,
  awsS3Integration,
  elasticsearchIntegration,
  dynamodbIntegration,
  
  // Developer (11)
  webhooksIntegration,
  restApiIntegration,
  githubIntegration,
  zapierIntegration,
  gitlabIntegration,
  bitbucketIntegration,
  graphqlIntegration,
  makeIntegration,
  n8nIntegration,
  iftttIntegration,
  powerAutomateIntegration,
  
  // Google Workspace (5)
  googleDriveIntegration,
  googleCalendarIntegration,
  googleMeetIntegration,
  googleDocsIntegration,
  googleFormsIntegration,
  
  // AI (4)
  openaiIntegration,
  anthropicIntegration,
  googleAiIntegration,
  elevenLabsIntegration,
  
  // Marketing (5)
  googleAnalyticsIntegration,
  facebookAdsIntegration,
  googleAdsIntegration,
  twilioIntegration,
  linkedinIntegration,
  
  // Social Media (5)
  twitterIntegration,
  instagramIntegration,
  youtubeIntegration,
  tiktokIntegration,
  pinterestIntegration,
};
