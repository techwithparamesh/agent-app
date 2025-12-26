import { z } from 'zod';

const replicateAuthSchema = z.object({
  apiToken: z.string().min(1),
});

export type ReplicateExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

function parseOwnerName(model: string) {
  const trimmed = model.trim();
  const parts = trimmed.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  return { owner: parts[0], name: parts.slice(1).join('/') };
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

async function repJson(url: string, apiToken: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Token ${apiToken}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
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
    throw new Error(`Replicate API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

export async function executeReplicateAction(input: ReplicateExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiToken } = replicateAuthSchema.parse({ apiToken: credential.apiToken });

  if (actionId === 'run_model') {
    const model = String(config.model || '').trim();
    if (!model) throw new Error('Replicate run_model requires model');

    const version = config.version != null ? String(config.version).trim() : '';
    const inputObj = parseJsonMaybe(config.input);
    if (!inputObj || typeof inputObj !== 'object') throw new Error('Replicate run_model requires input (JSON object)');

    const webhook = config.webhook != null ? String(config.webhook).trim() : '';

    let webhookEventsFilter: any = config.webhookEventsFilter;
    if (typeof webhookEventsFilter === 'string') {
      const parsed = parseJsonMaybe(webhookEventsFilter);
      webhookEventsFilter = parsed ?? webhookEventsFilter;
    }

    const webhookEvents = Array.isArray(webhookEventsFilter)
      ? webhookEventsFilter.map((x: any) => String(x)).filter(Boolean)
      : undefined;

    const bodyBase: any = {
      input: inputObj,
      ...(webhook ? { webhook } : {}),
      ...(webhookEvents && webhookEvents.length ? { webhook_events_filter: webhookEvents } : {}),
    };

    let url: string;
    let body: any;

    if (version) {
      url = 'https://api.replicate.com/v1/predictions';
      body = { ...bodyBase, version };
    } else {
      const parsedModel = parseOwnerName(model);
      if (!parsedModel) throw new Error('Invalid model format. Expected owner/model.');
      url = `https://api.replicate.com/v1/models/${encodeURIComponent(parsedModel.owner)}/${encodeURIComponent(parsedModel.name)}/predictions`;
      body = bodyBase;
    }

    const data = await repJson(url, apiToken, { method: 'POST', body: JSON.stringify(body) });
    return { ok: true, prediction: data, raw: data };
  }

  if (actionId === 'get_prediction') {
    const predictionId = String(config.predictionId || '').trim();
    if (!predictionId) throw new Error('Replicate get_prediction requires predictionId');

    const data = await repJson(`https://api.replicate.com/v1/predictions/${encodeURIComponent(predictionId)}`, apiToken, {
      method: 'GET',
    });

    return { ok: true, prediction: data, raw: data };
  }

  if (actionId === 'cancel_prediction') {
    const predictionId = String(config.predictionId || '').trim();
    if (!predictionId) throw new Error('Replicate cancel_prediction requires predictionId');

    const data = await repJson(`https://api.replicate.com/v1/predictions/${encodeURIComponent(predictionId)}/cancel`, apiToken, {
      method: 'POST',
    });

    return { ok: true, prediction: data, raw: data };
  }

  return {
    status: 'skipped',
    reason: `Replicate action not implemented: ${actionId}`,
  };
}
