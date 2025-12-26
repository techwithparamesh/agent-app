import { z } from 'zod';

const discordAuthSchema = z
  .object({
    botToken: z.string().min(1).optional(),
    webhookUrl: z.string().min(1).url().optional(),
  })
  .refine((v) => Boolean(v.botToken || v.webhookUrl), 'Discord requires botToken or webhookUrl');

export type DiscordExecuteInput = {
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

function colorHexToInt(hex?: string) {
  if (!hex) return undefined;
  const s = String(hex).trim().replace(/^#/, '');
  if (!s) return undefined;
  const n = Number.parseInt(s, 16);
  return Number.isFinite(n) ? n : undefined;
}

async function discordApiRequest(path: string, botToken: string, method: 'POST', body: any) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Discord API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

async function discordWebhookRequest(webhookUrl: string, body: any) {
  const res = await fetch(`${webhookUrl}?wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  });

  const text = await res.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Discord webhook error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeDiscordAction(input: DiscordExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { botToken, webhookUrl } = discordAuthSchema.parse({
    botToken: credential.botToken,
    webhookUrl: credential.webhookUrl,
  });

  if (actionId === 'send_message') {
    if (!botToken) throw new Error('Discord send_message requires botToken credential');
    const channelId = String(config.channelId || '').trim();
    const content = String(config.content || '').trim();
    if (!channelId) throw new Error('Discord send_message requires channelId');
    if (!content) throw new Error('Discord send_message requires content');

    const data = await discordApiRequest(`/channels/${encodeURIComponent(channelId)}/messages`, botToken, 'POST', {
      content,
      ...(config.tts !== undefined ? { tts: Boolean(config.tts) } : {}),
    });

    return { ok: true, message: data, raw: data };
  }

  if (actionId === 'send_embed') {
    if (!botToken) throw new Error('Discord send_embed requires botToken credential');
    const channelId = String(config.channelId || '').trim();
    if (!channelId) throw new Error('Discord send_embed requires channelId');

    const embed: any = {
      ...(config.title ? { title: String(config.title) } : {}),
      ...(config.description ? { description: String(config.description) } : {}),
    };

    const color = colorHexToInt(config.color);
    if (color !== undefined) embed.color = color;
    if (config.thumbnailUrl) embed.thumbnail = { url: String(config.thumbnailUrl) };
    if (config.imageUrl) embed.image = { url: String(config.imageUrl) };
    if (config.footer) embed.footer = { text: String(config.footer) };

    const data = await discordApiRequest(`/channels/${encodeURIComponent(channelId)}/messages`, botToken, 'POST', {
      embeds: [embed],
    });

    return { ok: true, message: data, raw: data };
  }

  if (actionId === 'webhook_send') {
    if (!webhookUrl) throw new Error('Discord webhook_send requires webhookUrl credential');

    const embeds = parseJsonMaybe(config.embeds);
    const body: any = {
      ...(config.content ? { content: String(config.content) } : {}),
      ...(config.username ? { username: String(config.username) } : {}),
      ...(config.avatarUrl ? { avatar_url: String(config.avatarUrl) } : {}),
      ...(Array.isArray(embeds) ? { embeds } : {}),
    };

    const data = await discordWebhookRequest(webhookUrl, body);
    return { ok: true, message: data, raw: data };
  }

  return { status: 'skipped', reason: `Discord action not implemented: ${actionId}` };
}
