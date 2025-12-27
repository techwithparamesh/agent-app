import { z } from 'zod';

const slackAuthSchema = z.object({
  botToken: z.string().min(1),
});

async function slackPost(token: string, method: string, body: any) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new Error(`Slack API error: ${data?.error || res.statusText}`);
  }
  return data;
}

async function slackPostMultipart(token: string, method: string, form: FormData) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: form,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    throw new Error(`Slack API error: ${data?.error || res.statusText}`);
  }
  return data;
}

export type SlackExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

export async function executeSlackAction(input: SlackExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { botToken } = slackAuthSchema.parse({ botToken: credential.botToken || credential.token || credential.accessToken });

  if (actionId === 'send_message') {
    const channel = String(config.channel || '').trim();
    const text = String(config.text || '');
    if (!channel) throw new Error('Slack send_message requires channel');
    if (!text) throw new Error('Slack send_message requires text');

    const body: any = {
      channel,
      text,
    };

    if (config.username) body.username = String(config.username);
    if (config.iconEmoji) body.icon_emoji = String(config.iconEmoji);
    if (config.threadTs) body.thread_ts = String(config.threadTs);

    const data = await slackPost(botToken, 'chat.postMessage', body);
    return { ok: true, channel: data.channel, ts: data.ts, message: data.message };
  }

  if (actionId === 'send_blocks') {
    const channel = String(config.channel || '').trim();
    const text = String(config.text || '');
    if (!channel) throw new Error('Slack send_blocks requires channel');
    if (!text) throw new Error('Slack send_blocks requires text');

    const blocks = config.blocks;
    if (!Array.isArray(blocks)) throw new Error('Slack send_blocks requires blocks as JSON array');

    const data = await slackPost(botToken, 'chat.postMessage', { channel, text, blocks });
    return { ok: true, channel: data.channel, ts: data.ts, message: data.message };
  }

  if (actionId === 'send_dm') {
    const user = String(config.user || '').trim();
    const text = String(config.text || '');
    if (!user) throw new Error('Slack send_dm requires user');
    if (!text) throw new Error('Slack send_dm requires text');

    const open = await slackPost(botToken, 'conversations.open', { users: user });
    const channelId = open?.channel?.id;
    if (!channelId) throw new Error('Slack conversations.open did not return a channel id');

    const sent = await slackPost(botToken, 'chat.postMessage', { channel: channelId, text });
    return { ok: true, channel: sent.channel, ts: sent.ts, message: sent.message };
  }

  if (actionId === 'add_reaction') {
    const channel = String(config.channel || '').trim();
    const timestamp = String(config.timestamp || '').trim();
    const emoji = String(config.emoji || '').trim();
    if (!channel) throw new Error('Slack add_reaction requires channel');
    if (!timestamp) throw new Error('Slack add_reaction requires timestamp');
    if (!emoji) throw new Error('Slack add_reaction requires emoji');

    const data = await slackPost(botToken, 'reactions.add', { channel, timestamp, name: emoji });
    return { ok: true, raw: data };
  }

  if (actionId === 'update_message') {
    const channel = String(config.channel || '').trim();
    const ts = String(config.ts || '').trim();
    const text = String(config.text || '');
    if (!channel) throw new Error('Slack update_message requires channel');
    if (!ts) throw new Error('Slack update_message requires ts');
    if (!text) throw new Error('Slack update_message requires text');

    const data = await slackPost(botToken, 'chat.update', { channel, ts, text });
    return { ok: true, channel: data.channel, ts: data.ts, message: data.message };
  }

  if (actionId === 'upload_file') {
    const channels = Array.isArray(config.channels)
      ? config.channels.map(String).filter(Boolean).join(',')
      : String(config.channels || '').trim();
    const fileUrl = String(config.fileUrl || '').trim();
    if (!channels) throw new Error('Slack upload_file requires channels');
    if (!fileUrl) throw new Error('Slack upload_file requires fileUrl');

    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      const text = await fileRes.text().catch(() => '');
      throw new Error(`Slack upload_file could not fetch fileUrl (${fileRes.status}): ${text || fileRes.statusText}`);
    }

    const ab = await fileRes.arrayBuffer();
    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';
    const blob = new Blob([ab], { type: contentType });

    const filename = String(config.filename || '').trim() || new URL(fileUrl).pathname.split('/').filter(Boolean).pop() || 'file';
    const title = config.title != null ? String(config.title) : undefined;
    const initialComment = config.initialComment != null ? String(config.initialComment) : undefined;

    const form = new FormData();
    form.append('channels', channels);
    form.append('file', blob, filename);
    if (title) form.append('title', title);
    if (initialComment) form.append('initial_comment', initialComment);

    const data = await slackPostMultipart(botToken, 'files.upload', form);
    return { ok: true, file: data.file, raw: data };
  }

  return {
    status: 'skipped',
    reason: `Slack action not implemented: ${actionId}`,
  };
}
