/**
 * Response Composer Service
 * Combines tool results, business rules, agent tone & language
 * Generates WhatsApp-ready responses with interactive elements
 */

import type {
  OutboundMessage,
  InteractiveMessage,
  InteractiveButton,
  ListSection,
  ToolResult,
  AgentConfig,
  ConversationContext,
  AvailableSlot,
} from './types';

export class ResponseComposer {
  /**
   * Compose a text response
   */
  composeTextResponse(to: string, text: string): OutboundMessage {
    return {
      to,
      type: 'text',
      text: {
        body: this.sanitizeText(text),
        preview_url: this.containsUrl(text),
      },
    };
  }

  /**
   * Compose a button response (max 3 buttons)
   */
  composeButtonResponse(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    header?: string,
    footer?: string
  ): OutboundMessage {
    // WhatsApp limits to 3 buttons
    const limitedButtons = buttons.slice(0, 3);

    const interactive: InteractiveMessage = {
      type: 'button',
      body: {
        text: this.sanitizeText(bodyText),
      },
      action: {
        buttons: limitedButtons.map((btn) => ({
          type: 'reply',
          reply: {
            id: btn.id.substring(0, 256), // Max 256 chars
            title: btn.title.substring(0, 20), // Max 20 chars
          },
        })),
      },
    };

    if (header) {
      interactive.header = {
        type: 'text',
        text: header.substring(0, 60), // Max 60 chars
      };
    }

    if (footer) {
      interactive.footer = {
        text: footer.substring(0, 60), // Max 60 chars
      };
    }

    return {
      to,
      type: 'interactive',
      interactive,
    };
  }

  /**
   * Compose a list response (for more than 3 options)
   */
  composeListResponse(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    header?: string,
    footer?: string
  ): OutboundMessage {
    const interactive: InteractiveMessage = {
      type: 'list',
      body: {
        text: this.sanitizeText(bodyText),
      },
      action: {
        button: buttonText.substring(0, 20), // Max 20 chars
        sections: sections.map((section) => ({
          title: section.title?.substring(0, 24), // Max 24 chars
          rows: section.rows.slice(0, 10).map((row) => ({ // Max 10 rows per section
            id: row.id.substring(0, 200), // Max 200 chars
            title: row.title.substring(0, 24), // Max 24 chars
            description: row.description?.substring(0, 72), // Max 72 chars
          })),
        })),
      },
    };

    if (header) {
      interactive.header = {
        type: 'text',
        text: header.substring(0, 60),
      };
    }

    if (footer) {
      interactive.footer = {
        text: footer.substring(0, 60),
      };
    }

    return {
      to,
      type: 'interactive',
      interactive,
    };
  }

  /**
   * Compose response for available time slots
   */
  composeAvailabilityResponse(
    to: string,
    date: string,
    slots: AvailableSlot[],
    agentConfig: AgentConfig
  ): OutboundMessage {
    if (slots.length === 0) {
      return this.composeTextResponse(
        to,
        `Sorry, there are no available slots for ${date}. Would you like to check another date?`
      );
    }

    // If 3 or fewer slots, use buttons
    if (slots.length <= 3) {
      return this.composeButtonResponse(
        to,
        `Available times for ${date}:`,
        slots.map((slot) => ({
          id: `slot_${slot.date}_${slot.time}`,
          title: slot.time,
        })),
        '📅 Select a Time',
        agentConfig.businessInfo?.name
      );
    }

    // More than 3 slots, use list
    return this.composeListResponse(
      to,
      `Please select your preferred time for ${date}:`,
      'Select Time',
      [{
        title: 'Available Slots',
        rows: slots.slice(0, 10).map((slot) => ({
          id: `slot_${slot.date}_${slot.time}`,
          title: slot.time,
          description: slot.serviceType || 'General appointment',
        })),
      }],
      '📅 Available Times',
      agentConfig.businessInfo?.name
    );
  }

  /**
   * Compose confirmation response
   */
  composeConfirmationResponse(
    to: string,
    action: string,
    details: Record<string, string>,
    agentConfig: AgentConfig
  ): OutboundMessage {
    // Build details text
    let detailsText = '';
    for (const [key, value] of Object.entries(details)) {
      if (value) {
        detailsText += `\n• ${this.formatFieldName(key)}: ${value}`;
      }
    }

    const bodyText = `Please confirm your ${action}:${detailsText}`;

    return this.composeButtonResponse(
      to,
      bodyText,
      [
        { id: 'confirm_yes', title: '✅ Confirm' },
        { id: 'confirm_no', title: '❌ Cancel' },
        { id: 'confirm_edit', title: '✏️ Edit' },
      ],
      `Confirm ${action}`,
      agentConfig.businessInfo?.name
    );
  }

  /**
   * Compose booking confirmation response
   */
  composeBookingConfirmation(
    to: string,
    bookingDetails: {
      appointmentId: string;
      customerName: string;
      date: string;
      time: string;
      serviceType?: string;
    },
    agentConfig: AgentConfig
  ): OutboundMessage {
    const emoji = this.getServiceEmoji(bookingDetails.serviceType);
    
    let message = `✅ *Booking Confirmed!*\n\n`;
    message += `${emoji} *${agentConfig.businessInfo?.name || agentConfig.name}*\n\n`;
    message += `📅 Date: ${this.formatDate(bookingDetails.date)}\n`;
    message += `🕐 Time: ${bookingDetails.time}\n`;
    message += `👤 Name: ${bookingDetails.customerName}\n`;
    if (bookingDetails.serviceType) {
      message += `📋 Service: ${bookingDetails.serviceType}\n`;
    }
    message += `\n📝 Booking ID: ${bookingDetails.appointmentId.slice(0, 8).toUpperCase()}\n`;
    message += `\nWe'll send you a reminder before your appointment. See you soon! 😊`;

    if (agentConfig.businessInfo?.address) {
      message += `\n\n📍 ${agentConfig.businessInfo.address}`;
    }

    return this.composeTextResponse(to, message);
  }

  /**
   * Compose handoff notification
   */
  composeHandoffResponse(
    to: string,
    queuePosition: number,
    estimatedWait?: string
  ): OutboundMessage {
    let message = `👋 I'm connecting you with a human representative.\n\n`;
    message += `📊 Your position in queue: #${queuePosition}\n`;
    if (estimatedWait) {
      message += `⏱️ Estimated wait: ${estimatedWait}\n`;
    }
    message += `\nPlease stay on this chat. Someone will be with you shortly!`;

    return this.composeTextResponse(to, message);
  }

  /**
   * Compose error response
   */
  composeErrorResponse(to: string, userFriendlyMessage: string): OutboundMessage {
    return this.composeTextResponse(
      to,
      `I apologize, but ${userFriendlyMessage}. Please try again or type "help" for assistance.`
    );
  }

  /**
   * Compose welcome message
   */
  composeWelcomeMessage(to: string, agentConfig: AgentConfig): OutboundMessage {
    const welcomeMessage = agentConfig.welcomeMessage || 
      `Hello! 👋 Welcome to ${agentConfig.name}!\n\nHow can I help you today?`;

    // If agent has specific capabilities, offer as options
    const capabilities = agentConfig.capabilities || [];
    
    if (capabilities.length > 0 && capabilities.length <= 3) {
      const buttons = capabilities.slice(0, 3).map((cap) => ({
        id: `capability_${cap}`,
        title: this.formatCapability(cap),
      }));

      return this.composeButtonResponse(
        to,
        welcomeMessage,
        buttons,
        undefined,
        agentConfig.businessInfo?.name
      );
    }

    return this.composeTextResponse(to, welcomeMessage);
  }

  /**
   * Compose response from tool result
   */
  composeFromToolResult(
    to: string,
    toolResult: ToolResult,
    agentConfig: AgentConfig,
    context: ConversationContext
  ): OutboundMessage {
    // If tool provides options, format as interactive
    if (toolResult.options && toolResult.options.length > 0) {
      const options = toolResult.options as AvailableSlot[];
      
      if (options.length <= 3) {
        return this.composeButtonResponse(
          to,
          toolResult.message,
          options.map((opt) => ({
            id: `option_${opt.date}_${opt.time}`,
            title: opt.time,
          }))
        );
      }
      
      return this.composeListResponse(
        to,
        toolResult.message,
        'Select Option',
        [{
          title: 'Available Options',
          rows: options.slice(0, 10).map((opt) => ({
            id: `option_${opt.date}_${opt.time}`,
            title: opt.time,
            description: `${opt.date}`,
          })),
        }]
      );
    }

    // Simple text response
    return this.composeTextResponse(to, toolResult.message);
  }

  // ========== HELPER METHODS ==========

  /**
   * Sanitize text for WhatsApp
   */
  private sanitizeText(text: string): string {
    // WhatsApp max message length is 4096
    let sanitized = text.substring(0, 4000);
    
    // Escape special markdown characters if needed
    // WhatsApp supports *bold*, _italic_, ~strikethrough~, ```code```
    
    return sanitized;
  }

  /**
   * Check if text contains URL
   */
  private containsUrl(text: string): boolean {
    return /https?:\/\/[^\s]+/i.test(text);
  }

  /**
   * Format field name for display
   */
  private formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ');
  }

  /**
   * Format date for display
   */
  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Get emoji for service type
   */
  private getServiceEmoji(serviceType?: string): string {
    if (!serviceType) return '📋';
    
    const service = serviceType.toLowerCase();
    
    if (service.includes('hair') || service.includes('salon')) return '💇';
    if (service.includes('spa') || service.includes('massage')) return '💆';
    if (service.includes('dental') || service.includes('tooth')) return '🦷';
    if (service.includes('medical') || service.includes('doctor')) return '🏥';
    if (service.includes('car') || service.includes('auto')) return '🚗';
    if (service.includes('food') || service.includes('restaurant')) return '🍽️';
    if (service.includes('legal') || service.includes('lawyer')) return '⚖️';
    if (service.includes('education') || service.includes('class')) return '📚';
    
    return '📋';
  }

  /**
   * Format capability for button text
   */
  private formatCapability(capability: string): string {
    const formatted = capability
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    
    // Capitalize first letter and truncate for button
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).substring(0, 19);
  }
}

// Export singleton instance
export const responseComposer = new ResponseComposer();
