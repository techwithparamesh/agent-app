import { Router } from 'express';
import { z } from 'zod';

const discordOptionsRouter = Router();

const baseSchema = z.object({
  botToken: z.string().min(1),
});

const channelsSchema = baseSchema.extend({
  guildId: z.string().min(1),
});

async function discordGetJson(url: string, botToken: string) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bot ${botToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Discord API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

// POST /api/integrations/options/discord/channels
// Body: { botToken, guildId }
discordOptionsRouter.post('/channels', async (req, res) => {
  try {
    const { botToken, guildId } = channelsSchema.parse(req.body);

    const channels = await discordGetJson(
      `https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/channels`,
      botToken
    );

    const options = Array.isArray(channels)
      ? channels
          .filter((c: any) => c && c.id && c.name)
          .map((c: any) => ({ value: String(c.id), label: String(c.name) }))
      : [];

    return res.json({ options });
  } catch (error: any) {
    console.error('[Discord Options] channels error:', error);
    return res.status(400).json({ message: error?.message || 'Failed to load Discord channels' });
  }
});

export default discordOptionsRouter;
