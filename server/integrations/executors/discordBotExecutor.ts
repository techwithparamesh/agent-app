import { z } from 'zod';

const authSchema = z.object({
  botToken: z.string().min(1),
});

export type DiscordBotExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function discordJson(botToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bot ${botToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
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

export async function executeDiscordBotAction(input: DiscordBotExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { botToken } = authSchema.parse({ botToken: credential.botToken });

  if (actionId === 'send_message') {
    const channelId = String(config.channelId || '').trim();
    const content = String(config.content || '');

    if (!channelId) throw new Error('Discord Bot send_message requires channelId');
    if (!content) throw new Error('Discord Bot send_message requires content');

    const data = await discordJson(botToken, `https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    return { ok: true, id: data?.id, channelId: data?.channel_id, raw: data };
  }

  return { status: 'skipped', reason: `Discord Bot action not implemented: ${actionId}` };
}
