/**
 * Event Gateway Service
 * Handles incoming WhatsApp webhook events and normalizes them into internal events
 */

import type {
  WhatsAppWebhookPayload,
  WhatsAppIncomingMessage,
  NormalizedMessage,
  MessageType,
} from './types';

export class EventGateway {
  /**
   * Verify webhook callback from Meta
   */
  verifyWebhook(mode: string, token: string, challenge: string, expectedToken: string): string | null {
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('[EventGateway] Webhook verified successfully');
      return challenge;
    }
    console.warn('[EventGateway] Webhook verification failed');
    return null;
  }

  /**
   * Parse and validate incoming webhook payload
   */
  parseWebhookPayload(body: any): WhatsAppWebhookPayload | null {
    if (!body || body.object !== 'whatsapp_business_account') {
      console.warn('[EventGateway] Invalid webhook payload: not a WhatsApp Business Account event');
      return null;
    }

    if (!body.entry || !Array.isArray(body.entry)) {
      console.warn('[EventGateway] Invalid webhook payload: missing entry array');
      return null;
    }

    return body as WhatsAppWebhookPayload;
  }

  /**
   * Extract messages from webhook payload
   */
  extractMessages(payload: WhatsAppWebhookPayload): NormalizedMessage[] {
    const normalizedMessages: NormalizedMessage[] = [];

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;

        const { value } = change;
        const messages = value.messages || [];
        const contacts = value.contacts || [];
        const metadata = value.metadata;

        for (const message of messages) {
          // Skip status updates
          if (!message.from || !message.id) continue;

          const contact = contacts.find((c) => c.wa_id === message.from);
          const normalized = this.normalizeMessage(message, metadata, contact?.profile?.name);
          
          if (normalized) {
            normalizedMessages.push(normalized);
          }
        }
      }
    }

    return normalizedMessages;
  }

  /**
   * Normalize a single WhatsApp message into internal format
   */
  private normalizeMessage(
    message: WhatsAppIncomingMessage,
    metadata: { display_phone_number: string; phone_number_id: string },
    userName?: string
  ): NormalizedMessage | null {
    const baseMessage: Partial<NormalizedMessage> = {
      messageId: message.id,
      from: message.from,
      phoneNumberId: metadata.phone_number_id,
      businessPhoneNumber: metadata.display_phone_number,
      timestamp: new Date(parseInt(message.timestamp) * 1000),
      userName,
    };

    // Handle context (replies to previous messages)
    if (message.context) {
      baseMessage.context = {
        from: message.context.from,
        messageId: message.context.id,
      };
    }

    switch (message.type) {
      case 'text':
        return {
          ...baseMessage,
          type: 'text',
          content: message.text?.body || '',
        } as NormalizedMessage;

      case 'image':
        return {
          ...baseMessage,
          type: 'image',
          content: message.image?.caption || '[Image received]',
          mediaUrl: message.image?.id,
          mediaType: message.image?.mime_type,
        } as NormalizedMessage;

      case 'document':
        return {
          ...baseMessage,
          type: 'document',
          content: message.document?.caption || `[Document: ${message.document?.filename || 'file'}]`,
          mediaUrl: message.document?.id,
          mediaType: message.document?.mime_type,
        } as NormalizedMessage;

      case 'audio':
        return {
          ...baseMessage,
          type: 'audio',
          content: '[Audio message received]',
          mediaUrl: message.audio?.id,
          mediaType: message.audio?.mime_type,
        } as NormalizedMessage;

      case 'video':
        return {
          ...baseMessage,
          type: 'video',
          content: message.video?.caption || '[Video received]',
          mediaUrl: message.video?.id,
          mediaType: message.video?.mime_type,
        } as NormalizedMessage;

      case 'location':
        return {
          ...baseMessage,
          type: 'location',
          content: message.location?.address || `Location: ${message.location?.latitude}, ${message.location?.longitude}`,
          location: {
            latitude: message.location?.latitude || 0,
            longitude: message.location?.longitude || 0,
            name: message.location?.name,
            address: message.location?.address,
          },
        } as NormalizedMessage;

      case 'interactive':
        const interactive = message.interactive;
        if (interactive?.button_reply) {
          return {
            ...baseMessage,
            type: 'interactive',
            content: interactive.button_reply.title,
            interactiveReply: {
              type: 'button',
              id: interactive.button_reply.id,
              title: interactive.button_reply.title,
            },
          } as NormalizedMessage;
        }
        if (interactive?.list_reply) {
          return {
            ...baseMessage,
            type: 'interactive',
            content: interactive.list_reply.title,
            interactiveReply: {
              type: 'list',
              id: interactive.list_reply.id,
              title: interactive.list_reply.title,
            },
          } as NormalizedMessage;
        }
        return null;

      case 'button':
        return {
          ...baseMessage,
          type: 'button',
          content: message.button?.text || '',
          interactiveReply: {
            type: 'button',
            id: message.button?.payload || '',
            title: message.button?.text || '',
          },
        } as NormalizedMessage;

      default:
        console.warn(`[EventGateway] Unsupported message type: ${message.type}`);
        return null;
    }
  }

  /**
   * Check if payload contains status updates (not messages)
   */
  hasStatusUpdates(payload: WhatsAppWebhookPayload): boolean {
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.value.statuses && change.value.statuses.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Extract status updates from payload
   */
  extractStatusUpdates(payload: WhatsAppWebhookPayload) {
    const statuses: Array<{
      messageId: string;
      status: string;
      timestamp: Date;
      recipientId: string;
      error?: { code: number; message: string };
    }> = [];

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const statusUpdates = change.value.statuses || [];
        for (const status of statusUpdates) {
          statuses.push({
            messageId: status.id,
            status: status.status,
            timestamp: new Date(parseInt(status.timestamp) * 1000),
            recipientId: status.recipient_id,
            error: status.errors?.[0] ? {
              code: status.errors[0].code,
              message: status.errors[0].message,
            } : undefined,
          });
        }
      }
    }

    return statuses;
  }
}

// Export singleton instance
export const eventGateway = new EventGateway();
