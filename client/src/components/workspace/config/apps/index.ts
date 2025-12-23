/**
 * App Configurations Index
 * 
 * Exports all n8n-style app configurations
 */

// Communication Apps
export { 
  CommunicationAppConfigs,
  SlackAdvancedConfig,
  DiscordAdvancedConfig,
  MicrosoftTeamsConfig,
  TwilioConfig,
  SendGridConfig,
  MailchimpConfig,
  IntercomConfig,
} from './CommunicationApps';

// Google Apps
export {
  GoogleAppConfigs,
  GoogleSheetsAdvancedConfig,
  GoogleDriveConfig,
  GoogleCalendarConfig,
  GmailConfig,
  GoogleDocsConfig,
} from './GoogleApps';

// CRM Apps
export {
  CRMAppConfigs,
  HubSpotAdvancedConfig,
  SalesforceConfig,
  PipedriveConfig,
  ZohoCRMConfig,
  MondayConfig,
} from './CRMApps';

// AI Apps
export {
  AIAppConfigs,
  OpenAIAdvancedConfig,
  AnthropicConfig,
  GoogleGeminiConfig,
  HuggingFaceConfig,
  StabilityAIConfig,
  PerplexityConfig,
} from './AIApps';

// Cloud Storage Apps
export {
  CloudStorageAppConfigs,
  AWSS3Config,
  DropboxConfig,
  AirtableConfig,
  NotionConfig,
  SupabaseConfig,
  MongoDBConfig,
  PostgresConfig,
  RedisConfig,
} from './CloudStorageApps';

// Payment Apps
export {
  PaymentAppConfigs,
  StripeAdvancedConfig,
  PayPalConfig,
  RazorpayConfig,
  ShopifyConfig,
  WooCommerceConfig,
} from './PaymentApps';

// Productivity Apps
export {
  ProductivityAppConfigs,
  AsanaConfig,
  TrelloConfig,
  GitHubConfig,
  JiraConfig,
  GitLabConfig,
  LinearConfig,
  ClickUpConfig,
  TodoistConfig,
} from './ProductivityApps';

// Support Apps
export {
  SupportAppConfigs,
  ZendeskConfig,
  FreshdeskConfig,
  CrispConfig,
  TawkConfig,
} from './SupportApps';

// Developer Apps
export {
  DeveloperAppConfigs,
  WebhookConfig,
  RestApiConfig,
  GraphQLConfig,
  BitbucketConfig,
} from './DeveloperApps';

// Marketing Apps
export {
  MarketingAppConfigs,
  GoogleAnalyticsConfig,
  FacebookAdsConfig,
  GoogleAdsConfig,
  LinkedInConfig,
} from './MarketingApps';

// Automation Apps
export {
  AutomationAppConfigs,
  ZapierConfig,
  MakeConfig,
  N8nConfig,
  PowerAutomateConfig,
} from './AutomationApps';

// Voice & Video Apps
export {
  VoiceVideoAppConfigs,
  TwilioVoiceConfig,
  ZoomConfig,
  GoogleMeetConfig,
  ElevenLabsConfig,
  CalendlyConfig,
} from './VoiceVideoApps';

// Misc Apps (WhatsApp, Telegram, Outlook, SMTP, Google Forms, Freshsales, Firebase, Replicate)
export {
  MiscAppConfigs,
  WhatsAppConfig,
  TelegramConfig,
  OutlookConfig,
  SMTPConfig,
  GoogleFormsConfig,
  FreshsalesConfig,
  FirebaseConfig,
  ReplicateConfig,
} from './MiscApps';

// Combined exports
import { CommunicationAppConfigs } from './CommunicationApps';
import { GoogleAppConfigs } from './GoogleApps';
import { CRMAppConfigs } from './CRMApps';
import { AIAppConfigs } from './AIApps';
import { CloudStorageAppConfigs } from './CloudStorageApps';
import { PaymentAppConfigs } from './PaymentApps';
import { ProductivityAppConfigs } from './ProductivityApps';
import { SupportAppConfigs } from './SupportApps';
import { DeveloperAppConfigs } from './DeveloperApps';
import { MarketingAppConfigs } from './MarketingApps';
import { AutomationAppConfigs } from './AutomationApps';
import { VoiceVideoAppConfigs } from './VoiceVideoApps';
import { MiscAppConfigs } from './MiscApps';

export const AllAppConfigs = {
  ...CommunicationAppConfigs,
  ...GoogleAppConfigs,
  ...CRMAppConfigs,
  ...AIAppConfigs,
  ...CloudStorageAppConfigs,
  ...PaymentAppConfigs,
  ...ProductivityAppConfigs,
  ...SupportAppConfigs,
  ...DeveloperAppConfigs,
  ...MarketingAppConfigs,
  ...AutomationAppConfigs,
  ...VoiceVideoAppConfigs,
  ...MiscAppConfigs,
};

export default AllAppConfigs;
