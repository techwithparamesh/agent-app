import { z } from 'zod';

const whatsappAuthSchema = z.object({
  phoneNumberId: z.string().min(1),
  accessToken: z.string().min(1),
});

export type WhatsAppExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function asString(value: any) {
  return value == null ? '' : String(value);
}

function parseJsonMaybe(value: any) {
  if (value == null) return undefined;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

async function graphRequest(phoneNumberId: string, accessToken: string, path: string, method: 'GET' | 'POST', body?: any) {
  const url = `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneNumberId)}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`WhatsApp API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeWhatsAppAction(input: WhatsAppExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { phoneNumberId, accessToken } = whatsappAuthSchema.parse({
    phoneNumberId: credential.phoneNumberId,
    accessToken: credential.accessToken,
  });

  const to = asString(config.to).trim();

  if (actionId === 'send_message') {
    if (!to) throw new Error('WhatsApp send_message requires to');
    const message = asString(config.message);
    if (!message) throw new Error('WhatsApp send_message requires message');
    const previewUrl = config.previewUrl !== undefined ? Boolean(config.previewUrl) : true;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body: message,
        preview_url: previewUrl,
      },
    };

    const data = await graphRequest(phoneNumberId, accessToken, '/messages', 'POST', payload);
    return { ok: true, message: data };
  }

  if (actionId === 'send_template') {
    if (!to) throw new Error('WhatsApp send_template requires to');
    const templateName = asString(config.templateName).trim();
    if (!templateName) throw new Error('WhatsApp send_template requires templateName');
    const templateLanguage = asString(config.templateLanguage || 'en').trim() || 'en';

    const templateParams = parseJsonMaybe(config.templateParams);
    const parameters = Array.isArray(templateParams)
      ? templateParams.map((p: any) => ({ type: 'text', text: asString(p) }))
      : [];

    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: templateLanguage },
      },
    };

    if (parameters.length > 0) {
      payload.template.components = [{ type: 'body', parameters }];
    }

    const data = await graphRequest(phoneNumberId, accessToken, '/messages', 'POST', payload);
    return { ok: true, message: data };
  }

  if (actionId === 'send_media') {
    if (!to) throw new Error('WhatsApp send_media requires to');
    const mediaType = asString(config.mediaType).trim();
    const mediaUrl = asString(config.mediaUrl).trim();
    if (!mediaType) throw new Error('WhatsApp send_media requires mediaType');
    if (!mediaUrl) throw new Error('WhatsApp send_media requires mediaUrl');

    const caption = asString(config.caption).trim();
    const filename = asString(config.filename).trim();

    const allowed = new Set(['image', 'video', 'audio', 'document']);
    if (!allowed.has(mediaType)) throw new Error('WhatsApp send_media mediaType must be one of: image, video, audio, document');

    const mediaObj: any = { link: mediaUrl };
    if (caption && (mediaType === 'image' || mediaType === 'video' || mediaType === 'document')) mediaObj.caption = caption;
    if (filename && mediaType === 'document') mediaObj.filename = filename;

    const payload: any = {
      messaging_product: 'whatsapp',
      to,
      type: mediaType,
      [mediaType]: mediaObj,
    };

    const data = await graphRequest(phoneNumberId, accessToken, '/messages', 'POST', payload);
    return { ok: true, message: data };
  }

  if (actionId === 'send_interactive') {
    if (!to) throw new Error('WhatsApp send_interactive requires to');

    const interactiveType = asString(config.interactiveType).trim();
    if (interactiveType !== 'button' && interactiveType !== 'list') {
      throw new Error('WhatsApp send_interactive interactiveType must be button or list');
    }

    const bodyText = asString(config.bodyText);
    if (!bodyText) throw new Error('WhatsApp send_interactive requires bodyText');

    const headerText = asString(config.headerText).trim();
    const footerText = asString(config.footerText).trim();

    const buttons = parseJsonMaybe(config.buttons);
    if (!buttons || typeof buttons !== 'object') throw new Error('WhatsApp send_interactive requires buttons/list items (JSON)');

    const interactive: any = {
      type: interactiveType,
      body: { text: bodyText },
      action: buttons,
    };

    if (headerText) interactive.header = { type: 'text', text: headerText };
    if (footerText) interactive.footer = { text: footerText };

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive,
    };

    const data = await graphRequest(phoneNumberId, accessToken, '/messages', 'POST', payload);
    return { ok: true, message: data };
  }

  if (actionId === 'mark_read') {
    const messageId = asString(config.messageId).trim();
    if (!messageId) throw new Error('WhatsApp mark_read requires messageId');

    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    const data = await graphRequest(phoneNumberId, accessToken, '/messages', 'POST', payload);
    return { ok: true, result: data };
  }

  return { status: 'skipped', reason: `WhatsApp action not implemented: ${actionId}` };
}
