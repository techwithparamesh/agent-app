import { z } from 'zod';

const teamsWebhookAuthSchema = z.object({
  webhookUrl: z.string().min(1),
});

const teamsOAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type MicrosoftTeamsExecuteInput = {
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

async function graphRequest(accessToken: string, path: string, method: 'GET' | 'POST', body?: any) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
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
    throw new Error(`Microsoft Graph error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeMicrosoftTeamsAction(input: MicrosoftTeamsExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;

  if (actionId === 'webhook_send') {
    const { webhookUrl } = teamsWebhookAuthSchema.parse({ webhookUrl: credential.webhookUrl });
    const text = asString(config.text);
    if (!text) throw new Error('Teams webhook_send requires text');

    let url: URL;
    try {
      url = new URL(webhookUrl);
    } catch {
      throw new Error('Teams webhookUrl is not a valid URL');
    }

    const payload: any = {
      text,
    };
    const title = asString(config.title).trim();
    const themeColor = asString(config.themeColor).trim();
    if (title) payload.title = title;
    if (themeColor) payload.themeColor = themeColor;

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text().catch(() => '');
    if (!res.ok) throw new Error(`Teams webhook error ${res.status}: ${responseText || 'Request failed'}`);

    return { ok: true, status: res.status, response: responseText };
  }

  const { accessToken } = teamsOAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'send_message') {
    const teamId = asString(config.teamId).trim();
    const channelId = asString(config.channelId).trim();
    const message = asString(config.message);

    if (!teamId) throw new Error('Teams send_message requires teamId');
    if (!channelId) throw new Error('Teams send_message requires channelId');
    if (!message) throw new Error('Teams send_message requires message');

    const payload = {
      body: {
        contentType: 'html',
        content: message,
      },
    };

    const data = await graphRequest(accessToken, `/teams/${encodeURIComponent(teamId)}/channels/${encodeURIComponent(channelId)}/messages`, 'POST', payload);
    return { ok: true, message: data };
  }

  if (actionId === 'send_card') {
    const teamId = asString(config.teamId).trim();
    const channelId = asString(config.channelId).trim();
    if (!teamId) throw new Error('Teams send_card requires teamId');
    if (!channelId) throw new Error('Teams send_card requires channelId');

    const cardJson = parseJsonMaybe(config.cardJson);
    if (!cardJson || typeof cardJson !== 'object') throw new Error('Teams send_card requires cardJson (json object)');

    const payload = {
      body: {
        contentType: 'html',
        content: ' ',
      },
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          contentUrl: null,
          content: cardJson,
        },
      ],
    };

    const data = await graphRequest(accessToken, `/teams/${encodeURIComponent(teamId)}/channels/${encodeURIComponent(channelId)}/messages`, 'POST', payload);
    return { ok: true, message: data };
  }

  return { status: 'skipped', reason: `Microsoft Teams action not implemented: ${actionId}` };
}
