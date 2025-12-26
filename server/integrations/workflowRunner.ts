import { decryptCredentialData } from './crypto';
import { storage } from '../storage';
import { executeOpenAiAction } from './executors/openaiExecutor';
import { executeSlackAction } from './executors/slackExecutor';
import { executeAnthropicAction } from './executors/anthropicExecutor';
import { executeTwilioSmsAction } from './executors/twilioSmsExecutor';
import { executeSendgridAction } from './executors/sendgridExecutor';
import { executeMailgunAction } from './executors/mailgunExecutor';
import { executeStripeAction } from './executors/stripeExecutor';
import { executeShopifyAction } from './executors/shopifyExecutor';
import { executeGithubAction } from './executors/githubExecutor';
import { executeIntercomAction } from './executors/intercomExecutor';
import { executeZendeskAction } from './executors/zendeskExecutor';
import { executeFreshdeskAction } from './executors/freshdeskExecutor';
import { executeCrispAction } from './executors/crispExecutor';
import { executeAsanaAction } from './executors/asanaExecutor';
import { executeJiraAction } from './executors/jiraExecutor';
import { executeMondayAction } from './executors/mondayExecutor';
import { executeGitlabAction } from './executors/gitlabExecutor';
import { executeBitbucketAction } from './executors/bitbucketExecutor';
import { executeTrelloAction } from './executors/trelloExecutor';
import { executeClickupAction } from './executors/clickupExecutor';
import { executeAirtableAction } from './executors/airtableExecutor';
import { executeNotionAction } from './executors/notionExecutor';
import { executeLinearAction } from './executors/linearExecutor';
import { executeTelegramAction } from './executors/telegramExecutor';
import { executeDiscordAction } from './executors/discordExecutor';
import { executeMailchimpAction } from './executors/mailchimpExecutor';
import { executeGoogleSheetsAction } from './executors/googleSheetsExecutor';
import { executeHubspotAction } from './executors/hubspotExecutor';
import { executePayPalAction } from './executors/paypalExecutor';
import { executeWooCommerceAction } from './executors/woocommerceExecutor';
import { executeZoomAction } from './executors/zoomExecutor';
import { executeGoogleDriveAction } from './executors/googleDriveExecutor';
import { executeGoogleCalendarAction } from './executors/googleCalendarExecutor';
import { executeGoogleAiAction } from './executors/googleAiExecutor';
import { executeElevenLabsAction } from './executors/elevenlabsExecutor';
import { executeReplicateAction } from './executors/replicateExecutor';
import { executeHuggingFaceAction } from './executors/huggingfaceExecutor';
import { executeGoogleMeetAction } from './executors/googleMeetExecutor';
import { executeSalesforceAction } from './executors/salesforceExecutor';
import { executePipedriveAction } from './executors/pipedriveExecutor';
import { executeZohoCrmAction } from './executors/zohoCrmExecutor';
import { executeFreshsalesAction } from './executors/freshsalesExecutor';
import { executeZapierAction } from './executors/zapierExecutor';
import { executeMakeAction } from './executors/makeExecutor';
import { executeN8nAction } from './executors/n8nExecutor';
import { executePowerAutomateAction } from './executors/powerAutomateExecutor';
import { executeFirebaseAction } from './executors/firebaseExecutor';
import { executeSupabaseAction } from './executors/supabaseExecutor';
import { executeWhatsAppAction } from './executors/whatsappExecutor';
import { executeMicrosoftTeamsAction } from './executors/microsoftTeamsExecutor';
import { executeGmailAction } from './executors/gmailExecutor';
import { executeOutlookAction } from './executors/outlookExecutor';
import { executeSmtpAction } from './executors/smtpExecutor';
import { executeGoogleDocsAction } from './executors/googleDocsExecutor';
import { executeGoogleFormsAction } from './executors/googleFormsExecutor';
import { executeMongoDbAction } from './executors/mongodbExecutor';
import { executeAwsS3Action } from './executors/awsS3Executor';
import { executeDropboxAction } from './executors/dropboxExecutor';
import { executeRazorpayAction } from './executors/razorpayExecutor';
import { executeCalendlyAction } from './executors/calendlyExecutor';
import { executeWebhookAction } from './executors/webhookExecutor';
import { executeRestApiAction } from './executors/restApiExecutor';
import { executeGraphqlAction } from './executors/graphqlExecutor';
import { executeGoogleAnalyticsAction } from './executors/googleAnalyticsExecutor';
import { executeFacebookAdsAction } from './executors/facebookAdsExecutor';
import { executeGoogleAdsAction } from './executors/googleAdsExecutor';
import { executeLinkedInAction } from './executors/linkedinExecutor';
import { executeTawkAction } from './executors/tawkExecutor';
import { executeTwilioVoiceAction } from './executors/twilioVoiceExecutor';
import { executeScheduleAction } from './executors/scheduleExecutor';
import { executeManualAction } from './executors/manualExecutor';
import { executeIfConditionAction } from './executors/ifConditionExecutor';
import { executeSwitchAction } from './executors/switchExecutor';
import { executeLoopAction } from './executors/loopExecutor';
import { executeSetVariableAction } from './executors/setVariableExecutor';
import { executeCodeAction } from './executors/codeExecutor';
import { executeIftttAction } from './executors/iftttExecutor';
import { executeAzureOpenAiAction } from './executors/azureOpenAiExecutor';
import { executeSlackBotAction } from './executors/slackBotExecutor';
import { executeDiscordBotAction } from './executors/discordBotExecutor';
import { executeSquareAction } from './executors/squareExecutor';
import { executeWebhookOutgoingAction } from './executors/webhookOutgoingExecutor';
import { executeCustomApiAction } from './executors/customApiExecutor';
import { executeCustomIntegrationAction } from './executors/customIntegrationExecutor';
import { executeSegmentAction } from './executors/segmentExecutor';
import { executeMixpanelAction } from './executors/mixpanelExecutor';
import { executeMastodonAction } from './executors/mastodonExecutor';
import { executeRedditAction } from './executors/redditExecutor';
import { executeSnapchatAction } from './executors/snapchatExecutor';
import { executeDriftAction } from './executors/driftExecutor';
import { executeHubspotOauthAction } from './executors/hubspotOauthExecutor';
import { executeHubspotMarketingAction } from './executors/hubspotMarketingExecutor';
import { executeBigQueryAction } from './executors/bigqueryExecutor';
import { executeCosmosDbAction } from './executors/cosmosDbExecutor';
import { executePostgresqlAction } from './executors/postgresqlExecutor';
import { executeMysqlAction } from './executors/mysqlExecutor';
import { executeRedisAction } from './executors/redisExecutor';
import { executeDynamoDbAction } from './executors/dynamodbExecutor';
import { executeElasticsearchAction } from './executors/elasticsearchExecutor';
import { executeLiveAgentAction } from './executors/liveagentExecutor';
import { executeHelpScoutAction } from './executors/helpscoutExecutor';
import { executeTwitterAction } from './executors/twitterExecutor';
import { executeInstagramAction } from './executors/instagramExecutor';
import { executeYouTubeAction } from './executors/youtubeExecutor';
import { executeTikTokAction } from './executors/tiktokExecutor';
import { executePinterestAction } from './executors/pinterestExecutor';

export type WorkflowRunInput = {
  userId: string;
  workflowId: string;
  nodes: any[];
  connections: any[];
  triggerType: string;
  triggerData: Record<string, any>;
};

export type NodeExecutionRecord = {
  nodeId: string;
  nodeName: string;
  status: 'success' | 'error' | 'skipped';
  inputData?: any;
  outputData?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function getNodeId(node: any): string {
  return String(node?.id || '');
}

function getNodeType(node: any): 'trigger' | 'action' | 'unknown' {
  const t = node?.type;
  if (t === 'trigger' || t === 'action') return t;
  return 'unknown';
}

function getNodeAppId(node: any): string {
  return String(node?.appId || node?.config?.appId || '');
}

function getNodeActionId(node: any): string {
  return String(node?.actionId || node?.config?.actionId || node?.config?.selectedActionId || '');
}

function getNodeName(node: any): string {
  return String(node?.name || node?.config?.name || getNodeId(node) || 'Node');
}

function getCredentialId(node: any): string | null {
  const cid = node?.config?.credentialId;
  if (typeof cid === 'string' && cid.length > 0) return cid;
  return null;
}

function extractEdges(connections: any[]): Array<{ from: string; to: string }> {
  const edges: Array<{ from: string; to: string }> = [];
  for (const c of connections || []) {
    const from = String(c?.from || c?.source || c?.sourceId || '');
    const to = String(c?.to || c?.target || c?.targetId || '');
    if (!from || !to) continue;
    edges.push({ from, to });
  }
  return edges;
}

function reachableFrom(startIds: string[], edges: Array<{ from: string; to: string }>) {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }

  const seen = new Set<string>(startIds);
  const queue = [...startIds];
  while (queue.length) {
    const cur = queue.shift()!;
    const next = adj.get(cur) || [];
    for (const n of next) {
      if (seen.has(n)) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return seen;
}

function topoOrder(nodeIds: Set<string>, edges: Array<{ from: string; to: string }>): string[] {
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of nodeIds) indeg.set(id, 0);
  for (const e of edges) {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) continue;
    indeg.set(e.to, (indeg.get(e.to) || 0) + 1);
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }

  const queue: string[] = [];
  for (const [id, d] of indeg.entries()) {
    if (d === 0) queue.push(id);
  }

  const out: string[] = [];
  while (queue.length) {
    const cur = queue.shift()!;
    out.push(cur);
    const next = adj.get(cur) || [];
    for (const n of next) {
      indeg.set(n, (indeg.get(n) || 0) - 1);
      if (indeg.get(n) === 0) queue.push(n);
    }
  }

  // If there is a cycle, fall back to a stable order.
  if (out.length !== nodeIds.size) return Array.from(nodeIds);
  return out;
}

function getValueAtPath(obj: any, path: string): any {
  const parts = path.split('.').filter(Boolean);
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function interpolateString(template: string, context: any): string {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, exprRaw) => {
    const expr = String(exprRaw || '').trim();
    // Support {{trigger.foo}} and {{nodes.<nodeId>.bar}} and {{<nodeId>.bar}}
    const direct = getValueAtPath(context, expr);
    if (direct !== undefined) return typeof direct === 'string' ? direct : JSON.stringify(direct);

    if (expr.startsWith('variables.')) {
      const v = getValueAtPath(context.variables, expr.slice('variables.'.length));
      if (v === undefined) return '';
      return typeof v === 'string' ? v : JSON.stringify(v);
    }

    if (expr.startsWith('trigger.')) {
      const v = getValueAtPath(context.trigger, expr.slice('trigger.'.length));
      if (v === undefined) return '';
      return typeof v === 'string' ? v : JSON.stringify(v);
    }

    if (expr.startsWith('nodes.')) {
      const v = getValueAtPath(context.nodes, expr.slice('nodes.'.length));
      if (v === undefined) return '';
      return typeof v === 'string' ? v : JSON.stringify(v);
    }

    // Try <nodeId>.<path>
    const dotIdx = expr.indexOf('.');
    if (dotIdx > 0) {
      const nodeId = expr.slice(0, dotIdx);
      const subPath = expr.slice(dotIdx + 1);
      const v = getValueAtPath(context.nodes?.[nodeId], subPath);
      if (v === undefined) return '';
      return typeof v === 'string' ? v : JSON.stringify(v);
    }

    return '';
  });
}

function interpolate(value: any, context: any): any {
  if (typeof value === 'string') return interpolateString(value, context);
  if (Array.isArray(value)) return value.map((v) => interpolate(v, context));
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) out[k] = interpolate(v, context);
    return out;
  }
  return value;
}

async function resolveCredential(userId: string, credentialId: string): Promise<Record<string, any>> {
  const cred = await storage.getCredentialById(credentialId);
  if (!cred) throw new Error('Credential not found');
  if (cred.userId !== userId) throw new Error('Forbidden');
  if (cred.isValid === false) throw new Error('Credential is not verified');
  return decryptCredentialData(cred.encryptedData) as any;
}

async function executeNode(node: any, userId: string, context: any): Promise<any> {
  const appId = getNodeAppId(node);
  const actionId = getNodeActionId(node);

  const rawConfig = (node?.config && typeof node.config === 'object') ? node.config : {};
  const config = interpolate(rawConfig, context);

  const credentialId = getCredentialId(node);
  const credential = credentialId ? await resolveCredential(userId, credentialId) : null;

  if (appId === 'openai') {
    if (!credential) throw new Error('Missing credentialId for OpenAI node');
    return executeOpenAiAction({ actionId, config, credential });
  }

  if (appId === 'slack') {
    if (!credential) throw new Error('Missing credentialId for Slack node');
    return executeSlackAction({ actionId, config, credential });
  }

  if (appId === 'slack_bot') {
    if (!credential) throw new Error('Missing credentialId for Slack Bot node');
    return executeSlackBotAction({ actionId, config, credential });
  }

  if (appId === 'anthropic') {
    if (!credential) throw new Error('Missing credentialId for Anthropic node');
    return executeAnthropicAction({ actionId, config, credential });
  }

  if (appId === "twilio_sms" || appId === "sms_twilio") {
    if (!credential) throw new Error("Missing Twilio credential data");
    return executeTwilioSmsAction({ actionId, config, credential });
  }

  if (appId === "sendgrid") {
    if (!credential) throw new Error("Missing SendGrid credential data");
    return executeSendgridAction({ actionId, config, credential });
  }

  if (appId === "mailgun") {
    if (!credential) throw new Error("Missing Mailgun credential data");
    return executeMailgunAction({ actionId, config, credential });
  }

  if (appId === "stripe") {
    if (!credential) throw new Error("Missing Stripe credential data");
    return executeStripeAction({ actionId, config, credential });
  }

  if (appId === "shopify") {
    if (!credential) throw new Error("Missing Shopify credential data");
    return executeShopifyAction({ actionId, config, credential });
  }

  if (appId === 'github') {
    if (!credential) throw new Error('Missing GitHub credential data');
    return executeGithubAction({ actionId, config, credential });
  }

  if (appId === 'intercom') {
    if (!credential) throw new Error('Missing Intercom credential data');
    return executeIntercomAction({ actionId, config, credential });
  }

  if (appId === 'zendesk') {
    if (!credential) throw new Error('Missing Zendesk credential data');
    return executeZendeskAction({ actionId, config, credential });
  }

  if (appId === 'freshdesk') {
    if (!credential) throw new Error('Missing Freshdesk credential data');
    return executeFreshdeskAction({ actionId, config, credential });
  }

  if (appId === 'crisp') {
    if (!credential) throw new Error('Missing Crisp credential data');
    return executeCrispAction({ actionId, config, credential });
  }

  if (appId === 'asana') {
    if (!credential) throw new Error('Missing Asana credential data');
    return executeAsanaAction({ actionId, config, credential });
  }

  if (appId === 'jira') {
    if (!credential) throw new Error('Missing Jira credential data');
    return executeJiraAction({ actionId, config, credential });
  }

  if (appId === 'monday') {
    if (!credential) throw new Error('Missing Monday credential data');
    return executeMondayAction({ actionId, config, credential });
  }

  if (appId === 'gitlab') {
    if (!credential) throw new Error('Missing GitLab credential data');
    return executeGitlabAction({ actionId, config, credential });
  }

  if (appId === 'bitbucket') {
    if (!credential) throw new Error('Missing Bitbucket credential data');
    return executeBitbucketAction({ actionId, config, credential });
  }

  if (appId === 'trello') {
    if (!credential) throw new Error('Missing Trello credential data');
    return executeTrelloAction({ actionId, config, credential });
  }

  if (appId === 'clickup') {
    if (!credential) throw new Error('Missing ClickUp credential data');
    return executeClickupAction({ actionId, config, credential });
  }

  if (appId === 'airtable') {
    if (!credential) throw new Error('Missing Airtable credential data');
    return executeAirtableAction({ actionId, config, credential });
  }

  if (appId === 'notion') {
    if (!credential) throw new Error('Missing Notion credential data');
    return executeNotionAction({ actionId, config, credential });
  }

  if (appId === 'linear') {
    if (!credential) throw new Error('Missing Linear credential data');
    return executeLinearAction({ actionId, config, credential });
  }

  if (appId === 'telegram') {
    if (!credential) throw new Error('Missing Telegram credential data');
    return executeTelegramAction({ actionId, config, credential });
  }

  if (appId === 'discord') {
    if (!credential) throw new Error('Missing Discord credential data');
    return executeDiscordAction({ actionId, config, credential });
  }

  if (appId === 'discord_bot') {
    if (!credential) throw new Error('Missing credentialId for Discord Bot node');
    return executeDiscordBotAction({ actionId, config, credential });
  }

  if (appId === 'square') {
    if (!credential) throw new Error('Missing credentialId for Square node');
    return executeSquareAction({ actionId, config, credential });
  }

  if (appId === 'webhook_outgoing') {
    return executeWebhookOutgoingAction({ actionId, config, credential });
  }

  if (appId === 'custom_api') {
    if (!credential) throw new Error('Missing credentialId for Custom API node');
    return executeCustomApiAction({ actionId, config, credential });
  }

  if (appId === 'custom_integration') {
    return executeCustomIntegrationAction({ actionId, config, credential });
  }

  if (appId === 'segment') {
    if (!credential) throw new Error('Missing credentialId for Segment node');
    return executeSegmentAction({ actionId, config, credential });
  }

  if (appId === 'mixpanel') {
    if (!credential) throw new Error('Missing credentialId for Mixpanel node');
    return executeMixpanelAction({ actionId, config, credential });
  }

  if (appId === 'mastodon') {
    if (!credential) throw new Error('Missing credentialId for Mastodon node');
    return executeMastodonAction({ actionId, config, credential });
  }

  if (appId === 'reddit') {
    if (!credential) throw new Error('Missing credentialId for Reddit node');
    return executeRedditAction({ actionId, config, credential });
  }

  if (appId === 'snapchat') {
    if (!credential) throw new Error('Missing credentialId for Snapchat node');
    return executeSnapchatAction({ actionId, config, credential });
  }

  if (appId === 'drift') {
    if (!credential) throw new Error('Missing credentialId for Drift node');
    return executeDriftAction({ actionId, config, credential });
  }

  if (appId === 'hubspot_oauth') {
    if (!credential) throw new Error('Missing credentialId for HubSpot OAuth node');
    return executeHubspotOauthAction({ actionId, config, credential });
  }

  if (appId === 'hubspot_marketing') {
    if (!credential) throw new Error('Missing credentialId for HubSpot Marketing node');
    return executeHubspotMarketingAction({ actionId, config, credential });
  }

  if (appId === 'bigquery') {
    if (!credential) throw new Error('Missing credentialId for BigQuery node');
    return executeBigQueryAction({ actionId, config, credential });
  }

  if (appId === 'cosmosdb') {
    if (!credential) throw new Error('Missing credentialId for Cosmos DB node');
    return executeCosmosDbAction({ actionId, config, credential });
  }

  if (appId === 'postgresql') {
    if (!credential) throw new Error('Missing credentialId for PostgreSQL node');
    return executePostgresqlAction({ actionId, config, credential });
  }

  if (appId === 'mysql') {
    if (!credential) throw new Error('Missing credentialId for MySQL node');
    return executeMysqlAction({ actionId, config, credential });
  }

  if (appId === 'redis') {
    if (!credential) throw new Error('Missing credentialId for Redis node');
    return executeRedisAction({ actionId, config, credential });
  }

  if (appId === 'dynamodb') {
    if (!credential) throw new Error('Missing credentialId for DynamoDB node');
    return executeDynamoDbAction({ actionId, config, credential });
  }

  if (appId === 'elasticsearch') {
    if (!credential) throw new Error('Missing credentialId for Elasticsearch node');
    return executeElasticsearchAction({ actionId, config, credential });
  }

  if (appId === 'liveagent') {
    if (!credential) throw new Error('Missing credentialId for LiveAgent node');
    return executeLiveAgentAction({ actionId, config, credential });
  }

  if (appId === 'helpscout') {
    if (!credential) throw new Error('Missing credentialId for Help Scout node');
    return executeHelpScoutAction({ actionId, config, credential });
  }

  if (appId === 'twitter') {
    if (!credential) throw new Error('Missing credentialId for Twitter node');
    return executeTwitterAction({ actionId, config, credential });
  }

  if (appId === 'instagram') {
    if (!credential) throw new Error('Missing credentialId for Instagram node');
    return executeInstagramAction({ actionId, config, credential });
  }

  if (appId === 'youtube') {
    if (!credential) throw new Error('Missing credentialId for YouTube node');
    return executeYouTubeAction({ actionId, config, credential });
  }

  if (appId === 'tiktok') {
    if (!credential) throw new Error('Missing credentialId for TikTok node');
    return executeTikTokAction({ actionId, config, credential });
  }

  if (appId === 'pinterest') {
    if (!credential) throw new Error('Missing credentialId for Pinterest node');
    return executePinterestAction({ actionId, config, credential });
  }

  if (appId === 'mailchimp') {
    if (!credential) throw new Error('Missing Mailchimp credential data');
    return executeMailchimpAction({ actionId, config, credential });
  }

  if (appId === 'google_sheets') {
    if (!credential) throw new Error('Missing Google Sheets credential data');
    return executeGoogleSheetsAction({ actionId, config, credential });
  }

  if (appId === 'hubspot') {
    if (!credential) throw new Error('Missing HubSpot credential data');
    return executeHubspotAction({ actionId, config, credential });
  }

  if (appId === 'paypal') {
    if (!credential) throw new Error('Missing PayPal credential data');
    return executePayPalAction({ actionId, config, credential });
  }

  if (appId === 'woocommerce') {
    if (!credential) throw new Error('Missing WooCommerce credential data');
    return executeWooCommerceAction({ actionId, config, credential });
  }

  if (appId === 'zoom') {
    if (!credential) throw new Error('Missing Zoom credential data');
    return executeZoomAction({ actionId, config, credential });
  }

  if (appId === 'google_drive') {
    if (!credential) throw new Error('Missing Google Drive credential data');
    return executeGoogleDriveAction({ actionId, config, credential });
  }

  if (appId === 'google_calendar') {
    if (!credential) throw new Error('Missing Google Calendar credential data');
    return executeGoogleCalendarAction({ actionId, config, credential });
  }

  if (appId === 'google_ai') {
    if (!credential) throw new Error('Missing Google AI credential data');
    return executeGoogleAiAction({ actionId, config, credential });
  }

  if (appId === 'elevenlabs') {
    if (!credential) throw new Error('Missing ElevenLabs credential data');
    return executeElevenLabsAction({ actionId, config, credential });
  }

  if (appId === 'replicate') {
    if (!credential) throw new Error('Missing Replicate credential data');
    return executeReplicateAction({ actionId, config, credential });
  }

  if (appId === 'huggingface') {
    if (!credential) throw new Error('Missing HuggingFace credential data');
    return executeHuggingFaceAction({ actionId, config, credential });
  }

  if (appId === 'google_meet') {
    if (!credential) throw new Error('Missing Google Meet credential data');
    return executeGoogleMeetAction({ actionId, config, credential });
  }

  if (appId === 'salesforce') {
    if (!credential) throw new Error('Missing Salesforce credential data');
    return executeSalesforceAction({ actionId, config, credential });
  }

  if (appId === 'pipedrive') {
    if (!credential) throw new Error('Missing Pipedrive credential data');
    return executePipedriveAction({ actionId, config, credential });
  }

  if (appId === 'zoho_crm') {
    if (!credential) throw new Error('Missing Zoho CRM credential data');
    return executeZohoCrmAction({ actionId, config, credential });
  }

  if (appId === 'freshsales') {
    if (!credential) throw new Error('Missing Freshsales credential data');
    return executeFreshsalesAction({ actionId, config, credential });
  }

  if (appId === 'zapier') {
    if (!credential) throw new Error('Missing Zapier credential data');
    return executeZapierAction({ actionId, config, credential });
  }

  if (appId === 'make') {
    if (!credential) throw new Error('Missing Make credential data');
    return executeMakeAction({ actionId, config, credential });
  }

  if (appId === 'n8n') {
    if (!credential) throw new Error('Missing n8n credential data');
    return executeN8nAction({ actionId, config, credential });
  }

  if (appId === 'power_automate') {
    if (!credential) throw new Error('Missing Power Automate credential data');
    return executePowerAutomateAction({ actionId, config, credential });
  }

  if (appId === 'firebase') {
    if (!credential) throw new Error('Missing Firebase credential data');
    return executeFirebaseAction({ actionId, config, credential });
  }

  if (appId === 'supabase') {
    if (!credential) throw new Error('Missing Supabase credential data');
    return executeSupabaseAction({ actionId, config, credential });
  }

  if (appId === 'whatsapp') {
    if (!credential) throw new Error('Missing WhatsApp credential data');
    return executeWhatsAppAction({ actionId, config, credential });
  }

  if (appId === 'microsoft_teams') {
    if (!credential) throw new Error('Missing Microsoft Teams credential data');
    return executeMicrosoftTeamsAction({ actionId, config, credential });
  }

  if (appId === 'gmail') {
    if (!credential) throw new Error('Missing Gmail credential data');
    return executeGmailAction({ actionId, config, credential });
  }

  if (appId === 'outlook') {
    if (!credential) throw new Error('Missing Outlook credential data');
    return executeOutlookAction({ actionId, config, credential });
  }

  if (appId === 'smtp') {
    if (!credential) throw new Error('Missing SMTP credential data');
    return executeSmtpAction({ actionId, config, credential });
  }

  if (appId === 'google_docs') {
    if (!credential) throw new Error('Missing Google Docs credential data');
    return executeGoogleDocsAction({ actionId, config, credential });
  }

  if (appId === 'google_forms') {
    if (!credential) throw new Error('Missing Google Forms credential data');
    return executeGoogleFormsAction({ actionId, config, credential });
  }

  if (appId === 'mongodb') {
    if (!credential) throw new Error('Missing MongoDB credential data');
    return executeMongoDbAction({ actionId, config, credential });
  }

  if (appId === 'aws_s3') {
    if (!credential) throw new Error('Missing AWS S3 credential data');
    return executeAwsS3Action({ actionId, config, credential });
  }

  if (appId === 'dropbox') {
    if (!credential) throw new Error('Missing Dropbox credential data');
    return executeDropboxAction({ actionId, config, credential });
  }

  if (appId === 'razorpay') {
    if (!credential) throw new Error('Missing Razorpay credential data');
    return executeRazorpayAction({ actionId, config, credential });
  }

  if (appId === 'calendly') {
    if (!credential) throw new Error('Missing Calendly credential data');
    return executeCalendlyAction({ actionId, config, credential });
  }

  if (appId === 'webhook') {
    // Webhook supports "no auth"; credentialId is optional.
    return executeWebhookAction({ actionId, config, credential });
  }

  if (appId === 'rest_api') {
    // REST API supports "no auth"; credentialId is optional.
    return executeRestApiAction({ actionId, config, credential });
  }

  if (appId === 'graphql') {
    if (!credential) throw new Error('Missing GraphQL credential data');
    return executeGraphqlAction({ actionId, config, credential });
  }

  if (appId === 'google_analytics') {
    if (!credential) throw new Error('Missing Google Analytics credential data');
    return executeGoogleAnalyticsAction({ actionId, config, credential });
  }

  if (appId === 'facebook_ads') {
    if (!credential) throw new Error('Missing Facebook Ads credential data');
    return executeFacebookAdsAction({ actionId, config, credential });
  }

  if (appId === 'google_ads') {
    if (!credential) throw new Error('Missing Google Ads credential data');
    return executeGoogleAdsAction({ actionId, config, credential });
  }

  if (appId === 'linkedin') {
    if (!credential) throw new Error('Missing LinkedIn credential data');
    return executeLinkedInAction({ actionId, config, credential });
  }

  if (appId === 'tawk') {
    if (!credential) throw new Error('Missing Tawk credential data');
    return executeTawkAction({ actionId, config, credential });
  }

  if (appId === 'twilio_voice') {
    if (!credential) throw new Error('Missing Twilio Voice credential data');
    return executeTwilioVoiceAction({ actionId, config, credential });
  }

  if (appId === 'schedule') {
    // Trigger-only internal node; safe no-op if used as action.
    return executeScheduleAction({ actionId, config, credential });
  }

  if (appId === 'manual') {
    // Trigger-only internal node; safe no-op if used as action.
    return executeManualAction({ actionId, config, credential });
  }

  if (appId === 'if_condition') {
    // Internal logic node; no auth.
    return executeIfConditionAction({ actionId, config, credential });
  }

  if (appId === 'switch') {
    // Internal logic node; no auth.
    return executeSwitchAction({ actionId, config, credential });
  }

  if (appId === 'loop') {
    // Internal logic node; no auth.
    return executeLoopAction({ actionId, config, credential });
  }

  if (appId === 'set_variable') {
    // Internal logic node; no auth.
    return executeSetVariableAction({ actionId, config, credential });
  }

  if (appId === 'code') {
    // Internal logic node; no auth.
    return executeCodeAction({ actionId, config, credential });
  }

  if (appId === 'ifttt') {
    if (!credential) throw new Error('Missing IFTTT credential data');
    return executeIftttAction({ actionId, config, credential });
  }

  if (appId === 'azure_openai') {
    if (!credential) throw new Error('Missing Azure OpenAI credential data');
    return executeAzureOpenAiAction({ actionId, config, credential });
  }

  // Default behavior: keep workflows runnable while providers are added batch-wise.
  return {
    status: 'skipped',
    reason: `Executor not implemented for ${appId}:${actionId}`,
  };
}

export async function runWorkflow(input: WorkflowRunInput): Promise<{ nodeExecutions: NodeExecutionRecord[]; outputData: any }> {
  const { userId, nodes, connections, triggerData } = input;

  const nodeById = new Map<string, any>();
  for (const n of nodes || []) {
    const id = getNodeId(n);
    if (!id) continue;
    nodeById.set(id, n);
  }

  const triggerNode = (nodes || []).find((n) => getNodeType(n) === 'trigger');
  if (!triggerNode) {
    throw new Error('Workflow has no trigger node');
  }

  const triggerId = getNodeId(triggerNode);
  const edges = extractEdges(connections || []);
  const reachable = reachableFrom([triggerId], edges);

  const orderedIds = topoOrder(reachable, edges);

  const nodeExecutions: NodeExecutionRecord[] = [];
  const context: any = {
    trigger: triggerData || {},
    nodes: {},
    variables: {},
  };

  // Seed trigger output
  context.nodes[triggerId] = { ...context.trigger };
  context.nodes.trigger = { ...context.trigger };

  // Record trigger node execution
  nodeExecutions.push({
    nodeId: triggerId,
    nodeName: getNodeName(triggerNode),
    status: 'success',
    inputData: context.trigger,
    outputData: context.trigger,
    startedAt: nowIso(),
    completedAt: nowIso(),
  });

  for (const id of orderedIds) {
    if (id === triggerId) continue;
    const node = nodeById.get(id);
    if (!node) continue;

    const type = getNodeType(node);
    if (type !== 'action') continue;

    const startedAt = nowIso();
    try {
      const output = await executeNode(node, userId, context);
      const completedAt = nowIso();

      // Apply workflow variables from set_variable nodes.
      try {
        const appId = getNodeAppId(node);
        if (appId === 'set_variable' && output && typeof output === 'object') {
          const name = typeof (output as any).name === 'string' ? String((output as any).name).trim() : '';
          const scope = typeof (output as any).scope === 'string' ? String((output as any).scope) : 'workflow';
          const overwrite = (output as any).overwrite !== undefined ? Boolean((output as any).overwrite) : true;
          if (name && scope === 'workflow') {
            const exists = Object.prototype.hasOwnProperty.call(context.variables, name);
            if (overwrite || !exists) context.variables[name] = (output as any).value;
          }
        }
      } catch {
        // ignore
      }

      context.nodes[id] = output;

      const status: NodeExecutionRecord['status'] = output?.status === 'skipped' ? 'skipped' : 'success';
      nodeExecutions.push({
        nodeId: id,
        nodeName: getNodeName(node),
        status,
        inputData: node?.config,
        outputData: output,
        startedAt,
        completedAt,
      });
    } catch (error: any) {
      const completedAt = nowIso();
      nodeExecutions.push({
        nodeId: id,
        nodeName: getNodeName(node),
        status: 'error',
        inputData: node?.config,
        error: error?.message || 'Node execution failed',
        startedAt,
        completedAt,
      });

      // Stop on first error (n8n-like default behavior)
      throw error;
    }
  }

  const last = nodeExecutions[nodeExecutions.length - 1];
  return {
    nodeExecutions,
    outputData: {
      trigger: context.trigger,
      lastNode: last?.outputData,
      nodes: context.nodes,
    },
  };
}
