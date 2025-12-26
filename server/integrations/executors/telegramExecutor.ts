import { z } from 'zod';

const telegramAuthSchema = z.object({
  botToken: z.string().min(1),
});

export type TelegramExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

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

async function tgRequest(path: string, botToken: string, body: any) {
  const res = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  });

  const text = await res.text().catch(() => '');
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!res.ok) {
    throw new Error(`Telegram API error ${res.status}: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
  }

  if (payload && typeof payload === 'object' && payload.ok === false) {
    throw new Error(`Telegram API error: ${payload.description || 'Unknown error'}`);
  }

  return payload;
}

export async function executeTelegramAction(input: TelegramExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { botToken } = telegramAuthSchema.parse({ botToken: credential.botToken });

  if (actionId === 'send_message') {
    const chatId = String(config.chatId || '').trim();
    const text = String(config.text || '').trim();
    if (!chatId) throw new Error('Telegram send_message requires chatId');
    if (!text) throw new Error('Telegram send_message requires text');

    const payload: any = {
      chat_id: chatId,
      text,
      ...(config.parseMode ? { parse_mode: String(config.parseMode) } : {}),
      ...(config.disablePreview !== undefined ? { disable_web_page_preview: Boolean(config.disablePreview) } : {}),
      ...(config.replyToMessageId ? { reply_to_message_id: Number(config.replyToMessageId) } : {}),
    };

    const data = await tgRequest('sendMessage', botToken, payload);
    return { ok: true, message: data?.result, raw: data };
  }

  if (actionId === 'send_photo') {
    const chatId = String(config.chatId || '').trim();
    const photo = String(config.photo || '').trim();
    if (!chatId) throw new Error('Telegram send_photo requires chatId');
    if (!photo) throw new Error('Telegram send_photo requires photo');

    const payload: any = {
      chat_id: chatId,
      photo,
      ...(config.caption ? { caption: String(config.caption) } : {}),
    };

    const data = await tgRequest('sendPhoto', botToken, payload);
    return { ok: true, message: data?.result, raw: data };
  }

  if (actionId === 'send_document') {
    const chatId = String(config.chatId || '').trim();
    const document = String(config.document || '').trim();
    if (!chatId) throw new Error('Telegram send_document requires chatId');
    if (!document) throw new Error('Telegram send_document requires document');

    const payload: any = {
      chat_id: chatId,
      document,
      ...(config.caption ? { caption: String(config.caption) } : {}),
    };

    const data = await tgRequest('sendDocument', botToken, payload);
    return { ok: true, message: data?.result, raw: data };
  }

  if (actionId === 'send_buttons') {
    const chatId = String(config.chatId || '').trim();
    const text = String(config.text || '').trim();
    if (!chatId) throw new Error('Telegram send_buttons requires chatId');
    if (!text) throw new Error('Telegram send_buttons requires text');

    const buttons = parseJsonMaybe(config.buttons);
    if (!Array.isArray(buttons)) throw new Error('Telegram send_buttons requires buttons (json array)');

    const payload: any = {
      chat_id: chatId,
      text,
      reply_markup: {
        inline_keyboard: buttons,
      },
    };

    const data = await tgRequest('sendMessage', botToken, payload);
    return { ok: true, message: data?.result, raw: data };
  }

  if (actionId === 'edit_message') {
    const chatId = String(config.chatId || '').trim();
    const messageId = String(config.messageId || '').trim();
    const text = String(config.text || '').trim();
    if (!chatId) throw new Error('Telegram edit_message requires chatId');
    if (!messageId) throw new Error('Telegram edit_message requires messageId');
    if (!text) throw new Error('Telegram edit_message requires text');

    const payload: any = {
      chat_id: chatId,
      message_id: Number(messageId),
      text,
    };

    const data = await tgRequest('editMessageText', botToken, payload);
    return { ok: true, result: data?.result, raw: data };
  }

  if (actionId === 'delete_message') {
    const chatId = String(config.chatId || '').trim();
    const messageId = String(config.messageId || '').trim();
    if (!chatId) throw new Error('Telegram delete_message requires chatId');
    if (!messageId) throw new Error('Telegram delete_message requires messageId');

    const payload: any = {
      chat_id: chatId,
      message_id: Number(messageId),
    };

    const data = await tgRequest('deleteMessage', botToken, payload);
    return { ok: true, result: data?.result, raw: data };
  }

  return { status: 'skipped', reason: `Telegram action not implemented: ${actionId}` };
}
