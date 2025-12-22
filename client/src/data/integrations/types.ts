// n8n-style Integration Documentation Types

export type IntegrationCategory = 
  | 'communication' 
  | 'email' 
  | 'crm' 
  | 'ecommerce' 
  | 'productivity' 
  | 'database' 
  | 'developer' 
  | 'google'
  | 'ai'
  | 'marketing';

export interface CredentialStep {
  step: number;
  title: string;
  description: string;
  note?: string;
}

export interface Operation {
  name: string;
  description: string;
  fields?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

export interface Trigger {
  name: string;
  description: string;
  when: string;
  outputFields?: string[];
}

export interface Action {
  name: string;
  description: string;
  inputFields?: string[];
  outputFields?: string[];
}

export interface WorkflowExample {
  title: string;
  description: string;
  steps: string[];
  code?: string;
}

export interface CommonIssue {
  problem: string;
  cause: string;
  solution: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: IntegrationCategory;
  icon: string;
  color: string;
  website: string;
  documentationUrl?: string;
  
  // Overview
  features: string[];
  useCases: string[];
  
  // Credentials
  credentialType: 'api_key' | 'oauth2' | 'basic_auth' | 'custom' | 'service_account' | 'connection_string' | 'webhook' | 'none';
  credentialSteps: CredentialStep[];
  requiredScopes?: string[];
  
  // Operations
  operations: Operation[];
  
  // Triggers & Actions
  triggers: Trigger[];
  actions: Action[];
  
  // Examples
  examples: WorkflowExample[];
  
  // Troubleshooting
  commonIssues: CommonIssue[];
  
  // Related
  relatedIntegrations?: string[];
  externalResources?: { title: string; url: string }[];
}

export const categoryLabels: Record<IntegrationCategory, string> = {
  communication: 'Communication',
  email: 'Email',
  crm: 'CRM & Sales',
  ecommerce: 'E-commerce',
  productivity: 'Productivity',
  database: 'Databases',
  developer: 'Developer Tools',
  google: 'Google Services',
  ai: 'AI & Machine Learning',
  marketing: 'Marketing',
};

export const categoryDescriptions: Record<IntegrationCategory, string> = {
  communication: 'Connect messaging platforms like WhatsApp, Slack, Telegram, and Discord',
  email: 'Integrate email services for sending, receiving, and managing emails',
  crm: 'Sync customer data with popular CRM platforms',
  ecommerce: 'Connect your online store and payment systems',
  productivity: 'Integrate project management and productivity tools',
  database: 'Store and retrieve data from various database systems',
  developer: 'Connect developer tools, APIs, and automation platforms',
  google: 'Access Google Workspace services and APIs',
  ai: 'Integrate AI models and machine learning services',
  marketing: 'Connect marketing automation and analytics platforms',
};
