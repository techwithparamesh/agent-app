/**
 * 360Dialog BSP Integration
 * Official WhatsApp Business API partner
 * 
 * Documentation: https://docs.360dialog.com/
 */

import { storage } from '../../storage';

export interface Dialog360Config {
  partnerId: string;
  apiKey: string;
  baseUrl: string;
}

export interface CreateClientRequest {
  businessName: string;
  businessEmail: string;
  businessWebsite?: string;
  businessAddress?: string;
  businessCategory?: string;
}

export interface CreateClientResponse {
  clientId: string;
  apiKey: string;
  wabaId: string;
  status: string;
}

export interface RequestPhoneNumberRequest {
  clientId: string;
  phoneNumber: string;
  displayName: string;
  category: string;
}

export interface PhoneNumberResponse {
  phoneNumberId: string;
  phoneNumber: string;
  displayPhoneNumber: string;
  status: string;
  qualityRating: string;
  messagingLimit: string;
}

export interface TemplateRequest {
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    buttons?: Array<{
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
}

export interface SendMessageRequest {
  to: string;
  type: 'text' | 'template' | 'image' | 'document' | 'interactive';
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: 'header' | 'body' | 'button';
      parameters: Array<{ type: string; text?: string; image?: { link: string } }>;
    }>;
  };
  interactive?: {
    type: 'button' | 'list';
    body: { text: string };
    action: any;
  };
}

export class Dialog360Provider {
  private config: Dialog360Config;
  private baseUrl: string;

  constructor() {
    this.config = {
      partnerId: process.env.DIALOG360_PARTNER_ID || '',
      apiKey: process.env.DIALOG360_API_KEY || '',
      baseUrl: process.env.DIALOG360_API_URL || 'https://waba.360dialog.io',
    };
    this.baseUrl = this.config.baseUrl;
  }

  /**
   * Create a new client account (WABA) via 360dialog Partner API
   */
  async createClient(request: CreateClientRequest): Promise<CreateClientResponse> {
    const response = await fetch(`${this.baseUrl}/v1/partners/${this.config.partnerId}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': this.config.apiKey,
      },
      body: JSON.stringify({
        partner_payload: {
          business_name: request.businessName,
          business_email: request.businessEmail,
          business_website: request.businessWebsite,
          business_address: request.businessAddress,
          business_vertical: request.businessCategory,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`360dialog API error: ${error}`);
    }

    const data = await response.json();
    return {
      clientId: data.client_id,
      apiKey: data.api_key,
      wabaId: data.waba_id,
      status: data.status,
    };
  }

  /**
   * Get client details
   */
  async getClient(clientId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v1/partners/${this.config.partnerId}/clients/${clientId}`, {
      method: 'GET',
      headers: {
        'D360-API-KEY': this.config.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`360dialog API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Request a phone number for a client
   */
  async requestPhoneNumber(clientApiKey: string, request: RequestPhoneNumberRequest): Promise<PhoneNumberResponse> {
    const response = await fetch(`${this.baseUrl}/v1/configs/phone_number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': clientApiKey,
      },
      body: JSON.stringify({
        phone_number: request.phoneNumber,
        display_name: request.displayName,
        category: request.category,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`360dialog API error: ${error}`);
    }

    const data = await response.json();
    return {
      phoneNumberId: data.phone_number_id,
      phoneNumber: data.phone_number,
      displayPhoneNumber: data.display_phone_number,
      status: data.status,
      qualityRating: data.quality_rating,
      messagingLimit: data.messaging_limit,
    };
  }

  /**
   * Get phone number status
   */
  async getPhoneNumberStatus(clientApiKey: string): Promise<PhoneNumberResponse> {
    const response = await fetch(`${this.baseUrl}/v1/configs/phone_number`, {
      method: 'GET',
      headers: {
        'D360-API-KEY': clientApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`360dialog API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Set webhook URL for a client
   */
  async setWebhook(clientApiKey: string, webhookUrl: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/configs/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': clientApiKey,
      },
      body: JSON.stringify({
        url: webhookUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`360dialog API error: ${error}`);
    }
  }

  /**
   * Create message template
   */
  async createTemplate(clientApiKey: string, template: TemplateRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/v1/configs/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': clientApiKey,
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`360dialog API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Get all templates
   */
  async getTemplates(clientApiKey: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/v1/configs/templates`, {
      method: 'GET',
      headers: {
        'D360-API-KEY': clientApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`360dialog API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.waba_templates || [];
  }

  /**
   * Send a message via WhatsApp
   */
  async sendMessage(clientApiKey: string, request: SendMessageRequest): Promise<{ messageId: string }> {
    const { to, type, ...messageContent } = request;
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': clientApiKey,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type,
        ...messageContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`360dialog API error: ${error}`);
    }

    const data = await response.json();
    return { messageId: data.messages?.[0]?.id || data.message_id };
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(
    clientApiKey: string,
    to: string,
    templateName: string,
    languageCode: string,
    parameters?: Array<{ type: string; text: string }>
  ): Promise<{ messageId: string }> {
    const components: Array<{ type: 'header' | 'body' | 'button'; parameters: Array<{ type: string; text?: string }> }> | undefined = 
      parameters?.length ? [
        {
          type: 'body' as const,
          parameters: parameters.map(p => ({ type: p.type, text: p.text })),
        },
      ] : undefined;

    return this.sendMessage(clientApiKey, {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    });
  }

  /**
   * Send a text message (within 24-hour window)
   */
  async sendTextMessage(clientApiKey: string, to: string, text: string): Promise<{ messageId: string }> {
    return this.sendMessage(clientApiKey, {
      to,
      type: 'text',
      text: { body: text },
    });
  }

  /**
   * Send interactive buttons message
   */
  async sendButtonMessage(
    clientApiKey: string,
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<{ messageId: string }> {
    return this.sendMessage(clientApiKey, {
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    });
  }

  /**
   * Upload media
   */
  async uploadMedia(clientApiKey: string, file: Buffer, mimeType: string): Promise<string> {
    const formData = new FormData();
    // Convert Buffer to ArrayBuffer then to Blob for compatibility
    const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
    formData.append('file', new Blob([arrayBuffer], { type: mimeType }));
    formData.append('messaging_product', 'whatsapp');

    const response = await fetch(`${this.baseUrl}/v1/media`, {
      method: 'POST',
      headers: {
        'D360-API-KEY': clientApiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`360dialog API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Mark message as read
   */
  async markAsRead(clientApiKey: string, messageId: string): Promise<void> {
    await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': clientApiKey,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  }
}

export const dialog360 = new Dialog360Provider();
