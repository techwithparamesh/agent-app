// Integration Documentation - Central Export
// This file exports all integration documentation for use in the docs page

export * from './types';

import { IntegrationDoc } from './types';
import { communicationDocs } from './communication';
import { emailDocs } from './email';
import { crmDocs } from './crm';
import { automationDocs } from './automation';
import { storageDocs } from './storage';
import { ecommerceDocs } from './ecommerce';
import { productivityDocs } from './productivity';
import { developerDocs } from './developer';
import { googleDocs } from './google';
import { aiDocs } from './ai';

// Export individual category arrays
export {
  communicationDocs,
  emailDocs,
  crmDocs,
  automationDocs,
  storageDocs,
  ecommerceDocs,
  productivityDocs,
  developerDocs,
  googleDocs,
  aiDocs,
};

// Combined array of all integrations
export const allIntegrationDocs: IntegrationDoc[] = [
  ...communicationDocs,
  ...emailDocs,
  ...crmDocs,
  ...automationDocs,
  ...storageDocs,
  ...ecommerceDocs,
  ...productivityDocs,
  ...developerDocs,
  ...googleDocs,
  ...aiDocs,
];

// Helper function to get integration by ID
export function getIntegrationById(id: string): IntegrationDoc | undefined {
  return allIntegrationDocs.find((doc) => doc.id === id);
}

// Helper function to get integrations by category
export function getIntegrationsByCategory(category: string): IntegrationDoc[] {
  return allIntegrationDocs.filter((doc) => doc.category === category);
}

// Helper function to search integrations
export function searchIntegrations(query: string): IntegrationDoc[] {
  const lowerQuery = query.toLowerCase();
  return allIntegrationDocs.filter(
    (doc) =>
      doc.name.toLowerCase().includes(lowerQuery) ||
      doc.shortDescription.toLowerCase().includes(lowerQuery) ||
      doc.overview.useCases.some((uc) => uc.toLowerCase().includes(lowerQuery))
  );
}

// Get all unique categories
export function getCategories(): string[] {
  return Array.from(new Set(allIntegrationDocs.map((doc) => doc.category)));
}

// Statistics
export const integrationStats = {
  total: allIntegrationDocs.length,
  byCategory: {
    communication: communicationDocs.length,
    email: emailDocs.length,
    crm: crmDocs.length,
    automation: automationDocs.length,
    storage: storageDocs.length,
    ecommerce: ecommerceDocs.length,
    productivity: productivityDocs.length,
    developer: developerDocs.length,
    google: googleDocs.length,
  },
};
