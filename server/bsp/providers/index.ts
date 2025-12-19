/**
 * BSP Provider Interface & Factory
 * Supports multiple WhatsApp Business Service Providers
 */

import { Dialog360Provider, dialog360 } from './360dialog';

export type BSPProviderType = '360dialog' | 'twilio' | 'messagebird' | 'gupshup';

export interface BSPProvider {
  // Account Management
  createClient(request: any): Promise<any>;
  getClient(clientId: string): Promise<any>;
  
  // Phone Number Management  
  requestPhoneNumber(clientApiKey: string, request: any): Promise<any>;
  getPhoneNumberStatus(clientApiKey: string): Promise<any>;
  
  // Webhook Configuration
  setWebhook(clientApiKey: string, webhookUrl: string): Promise<void>;
  
  // Template Management
  createTemplate(clientApiKey: string, template: any): Promise<any>;
  getTemplates(clientApiKey: string): Promise<any[]>;
  
  // Messaging
  sendMessage(clientApiKey: string, request: any): Promise<{ messageId: string }>;
  sendTemplateMessage(clientApiKey: string, to: string, templateName: string, languageCode: string, parameters?: any[]): Promise<{ messageId: string }>;
  sendTextMessage(clientApiKey: string, to: string, text: string): Promise<{ messageId: string }>;
  sendButtonMessage(clientApiKey: string, to: string, bodyText: string, buttons: any[]): Promise<{ messageId: string }>;
  
  // Media
  uploadMedia(clientApiKey: string, file: Buffer, mimeType: string): Promise<string>;
  
  // Message Status
  markAsRead(clientApiKey: string, messageId: string): Promise<void>;
}

/**
 * Get the BSP provider instance based on provider type
 */
export function getBSPProvider(providerType: BSPProviderType): BSPProvider {
  switch (providerType) {
    case '360dialog':
      return dialog360;
    case 'twilio':
      // TODO: Implement Twilio provider
      throw new Error('Twilio provider not yet implemented');
    case 'messagebird':
      // TODO: Implement MessageBird provider
      throw new Error('MessageBird provider not yet implemented');
    case 'gupshup':
      // TODO: Implement Gupshup provider
      throw new Error('Gupshup provider not yet implemented');
    default:
      throw new Error(`Unknown BSP provider: ${providerType}`);
  }
}

export { dialog360, Dialog360Provider };
