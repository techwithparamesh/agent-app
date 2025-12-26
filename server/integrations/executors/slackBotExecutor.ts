import { z } from 'zod';

const authSchema = z.object({
  botToken: z.string().min(1),
});

export type SlackBotExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function slackPost(botToken: string, url: string, body: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: any = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Slack API error ${res.status}: ${JSON.stringify(data)}`);
  }
  if (!data?.ok) {
    throw new Error(`Slack API error: ${data?.error || 'unknown_error'}`);
  }
  return data;
}

export async function executeSlackBotAction(input: SlackBotExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { botToken } = authSchema.parse({ botToken: credential.botToken });

  if (actionId === 'post_message') {
    const channel = String(config.channel || '').trim();
    const text = String(config.text || '');
    const threadTs = config.threadTs != null ? String(config.threadTs).trim() : '';

    if (!channel) throw new Error('Slack Bot post_message requires channel');
    if (!text) throw new Error('Slack Bot post_message requires text');

    const body: any = { channel, text };
    if (threadTs) body.thread_ts = threadTs;

    const data = await slackPost(botToken, 'https://slack.com/api/chat.postMessage', body);
    return {
      ok: true,
      channel: data?.channel,
      ts: data?.ts,
      message: data?.message,
      raw: data,
    };
  }

  return { status: 'skipped', reason: `Slack Bot action not implemented: ${actionId}` };
}
