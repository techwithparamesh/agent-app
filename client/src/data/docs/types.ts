// Integration Documentation Types
// This file defines the structure for all integration documentation

export interface IntegrationDoc {
  id: string;
  name: string;
  icon: string;
  category: IntegrationCategory;
  shortDescription: string;
  overview: {
    what: string;
    why: string;
    useCases: string[];
    targetAudience: string;
  };
  prerequisites: {
    accounts: string[];
    permissions: string[];
    preparations: string[];
  };
  connectionGuide: ConnectionStep[];
  triggers: TriggerDoc[];
  actions: ActionDoc[];
  exampleFlow: {
    title: string;
    scenario: string;
    steps: string[];
  };
  troubleshooting: TroubleshootingItem[];
  bestPractices: string[];
  faq: FAQItem[];
}

export interface ConnectionStep {
  step: number;
  title: string;
  description: string;
  screenshot?: string;
  tip?: string;
  warning?: string;
}

export interface TriggerDoc {
  id: string;
  name: string;
  description: string;
  whenItFires: string;
  exampleScenario: string;
  dataProvided: string[];
}

export interface ActionDoc {
  id: string;
  name: string;
  description: string;
  whenToUse: string;
  requiredFields: string[];
  optionalFields?: string[];
  example: string;
}

export interface TroubleshootingItem {
  error: string;
  cause: string;
  solution: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type IntegrationCategory = 
  | 'communication'
  | 'email'
  | 'crm'
  | 'automation'
  | 'storage'
  | 'ecommerce'
  | 'productivity'
  | 'developer'
  | 'google';

export const categoryLabels: Record<IntegrationCategory, string> = {
  communication: 'Communication',
  email: 'Email',
  crm: 'CRM & Sales',
  automation: 'Automation',
  storage: 'Database & Storage',
  ecommerce: 'E-commerce & Payments',
  productivity: 'Productivity',
  developer: 'Developer Tools',
  google: 'Google Suite',
};

export const categoryIcons: Record<IntegrationCategory, string> = {
  communication: '💬',
  email: '📧',
  crm: '👥',
  automation: '⚡',
  storage: '🗄️',
  ecommerce: '🛒',
  productivity: '📋',
  developer: '🛠️',
  google: '🔷',
};
