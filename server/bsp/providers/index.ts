/**
 * BSP Provider Interface & Factory
 * 
 * NOTE: BSP providers have been deprecated in favor of direct Meta WhatsApp Cloud API
 * integration via Embedded Signup. See server/whatsapp-cloud/ for the new implementation.
 * 
 * This interface is kept for backward compatibility but new integrations should use
 * the WhatsApp Cloud API directly.
 */

export type BSPProviderType = 'twilio' | 'messagebird' | 'gupshup';

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
 * 
 * @deprecated Use WhatsApp Cloud API direct integration instead (server/whatsapp-cloud/)
 */
export function getBSPProvider(providerType: BSPProviderType): BSPProvider {
  switch (providerType) {
    case 'twilio':
      // TODO: Implement Twilio provider if needed
      throw new Error('Twilio provider not yet implemented. Use WhatsApp Cloud API instead.');
    case 'messagebird':
      // TODO: Implement MessageBird provider if needed
      throw new Error('MessageBird provider not yet implemented. Use WhatsApp Cloud API instead.');
    case 'gupshup':
      // TODO: Implement Gupshup provider if needed
      throw new Error('Gupshup provider not yet implemented. Use WhatsApp Cloud API instead.');
    default:
      throw new Error(`Unknown BSP provider: ${providerType}. Use WhatsApp Cloud API for direct Meta integration.`);
  }
}
