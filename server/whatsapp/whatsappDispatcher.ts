/**
 * WhatsApp Dispatcher Service
 * Sends responses back using WhatsApp Business API
 */

import type {
  OutboundMessage,
  AgentConfig,
} from './types';

interface WhatsAppApiResponse {
  messaging_product: string;
  contacts?: Array<{
    input: string;
    wa_id: string;
  }>;
  messages?: Array<{
    id: string;
  }>;
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export class WhatsAppDispatcher {
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';

  /**
   * Send a message via WhatsApp Business API
   */
  async send(
    message: OutboundMessage,
    config: {
      phoneNumberId: string;
      accessToken: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { phoneNumberId, accessToken } = config;

    if (!phoneNumberId || !accessToken) {
      console.error('[WhatsAppDispatcher] Missing configuration');
      return { success: false, error: 'WhatsApp configuration missing' };
    }

    const url = `${this.baseUrl}/${phoneNumberId}/messages`;

    // Build request body
    const body: Record<string, any> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.to,
      type: message.type,
    };

    if (message.type === 'text' && message.text) {
      body.text = message.text;
    } else if (message.type === 'interactive' && message.interactive) {
      body.interactive = message.interactive;
    } else if (message.type === 'template' && message.template) {
      body.template = message.template;
    }

    try {
      console.log(`[WhatsAppDispatcher] Sending ${message.type} message to ${message.to}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data: WhatsAppApiResponse = await response.json();

      if (!response.ok || data.error) {
        console.error('[WhatsAppDispatcher] API error:', data.error);
        return {
          success: false,
          error: data.error?.message || `HTTP ${response.status}`,
        };
      }

      const messageId = data.messages?.[0]?.id;
      console.log(`[WhatsAppDispatcher] Message sent successfully: ${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      console.error('[WhatsAppDispatcher] Network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Send multiple messages in sequence
   */
  async sendMultiple(
    messages: OutboundMessage[],
    config: {
      phoneNumberId: string;
      accessToken: string;
    }
  ): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
    const results: Array<{ success: boolean; messageId?: string; error?: string }> = [];

    for (const message of messages) {
      const result = await this.send(message, config);
      results.push(result);

      // Small delay between messages to avoid rate limiting
      if (messages.length > 1) {
        await this.delay(100);
      }
    }

    return results;
  }

  /**
   * Mark message as read
   */
  async markAsRead(
    messageId: string,
    config: {
      phoneNumberId: string;
      accessToken: string;
    }
  ): Promise<boolean> {
    const { phoneNumberId, accessToken } = config;
    const url = `${this.baseUrl}/${phoneNumberId}/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('[WhatsAppDispatcher] Error marking as read:', error);
      return false;
    }
  }

  /**
   * Send typing indicator (not officially supported but can simulate)
   */
  async sendTypingIndicator(
    _to: string,
    _config: {
      phoneNumberId: string;
      accessToken: string;
    }
  ): Promise<void> {
    // WhatsApp doesn't have official typing indicator API
    // This is a placeholder for future implementation
  }

  /**
   * Download media file
   */
  async downloadMedia(
    mediaId: string,
    accessToken: string
  ): Promise<{ url?: string; error?: string }> {
    try {
      // First, get the media URL
      const metadataResponse = await fetch(
        `${this.baseUrl}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!metadataResponse.ok) {
        return { error: 'Failed to get media metadata' };
      }

      const metadata = await metadataResponse.json();
      return { url: metadata.url };
    } catch (error) {
      console.error('[WhatsAppDispatcher] Error downloading media:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send template message
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: Array<{
      type: 'header' | 'body' | 'button';
      parameters?: Array<{
        type: 'text' | 'currency' | 'date_time';
        text?: string;
      }>;
    }>,
    config: {
      phoneNumberId: string;
      accessToken: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message: OutboundMessage = {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components,
      },
    };

    return this.send(message, config);
  }

  /**
   * Send appointment reminder (using template)
   */
  async sendAppointmentReminder(
    to: string,
    appointment: {
      customerName: string;
      date: string;
      time: string;
      businessName: string;
    },
    config: {
      phoneNumberId: string;
      accessToken: string;
      templateName?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // If template is configured, use it
    if (config.templateName) {
      return this.sendTemplate(
        to,
        config.templateName,
        'en',
        [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: appointment.customerName },
              { type: 'text', text: appointment.date },
              { type: 'text', text: appointment.time },
              { type: 'text', text: appointment.businessName },
            ],
          },
        ],
        {
          phoneNumberId: config.phoneNumberId,
          accessToken: config.accessToken,
        }
      );
    }

    // Fallback to regular message
    const message: OutboundMessage = {
      to,
      type: 'text',
      text: {
        body: `⏰ *Appointment Reminder*\n\nHi ${appointment.customerName},\n\nThis is a reminder for your upcoming appointment:\n\n📅 Date: ${appointment.date}\n🕐 Time: ${appointment.time}\n🏢 ${appointment.businessName}\n\nPlease let us know if you need to reschedule.`,
      },
    };

    return this.send(message, {
      phoneNumberId: config.phoneNumberId,
      accessToken: config.accessToken,
    });
  }

  /**
   * Helper: delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // WhatsApp phone numbers should be in international format without + or 00
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Format phone number for WhatsApp API
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/[^\d]/g, '');
    
    // Remove leading zeros or plus signs
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }
    
    return cleaned;
  }
}

// Export singleton instance
export const whatsappDispatcher = new WhatsAppDispatcher();
