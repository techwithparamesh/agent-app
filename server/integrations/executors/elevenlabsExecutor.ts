import { z } from 'zod';

const elevenLabsAuthSchema = z.object({
  apiKey: z.string().min(1),
});

export type ElevenLabsExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function elFetch(url: string, apiKey: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      'xi-api-key': apiKey,
      Accept: init?.headers && (init.headers as any)['Accept'] ? (init.headers as any)['Accept'] : '*/*',
      ...(init?.headers || {}),
    },
  });
}

async function elJson(url: string, apiKey: string, init?: RequestInit) {
  const res = await elFetch(url, apiKey, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
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
    throw new Error(`ElevenLabs API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function safeNum(value: any, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
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

async function fetchAsBytes(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch file URL (${res.status}): ${text || res.statusText}`);
  }
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const bytes = Buffer.from(await res.arrayBuffer());
  return { bytes, contentType };
}

export async function executeElevenLabsAction(input: ElevenLabsExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { apiKey } = elevenLabsAuthSchema.parse({ apiKey: credential.apiKey });

  if (actionId === 'get_voices') {
    const search = String(config.search || '').trim().toLowerCase();
    const includeLegacy = Boolean(config.includeLegacy);

    const data = await elJson('https://api.elevenlabs.io/v1/voices', apiKey, { method: 'GET' });
    const voices = Array.isArray(data?.voices) ? data.voices : [];

    const filtered = voices.filter((v: any) => {
      const name = typeof v?.name === 'string' ? v.name : '';
      if (search && !name.toLowerCase().includes(search)) return false;
      if (!includeLegacy) {
        const isLegacy = Boolean(v?.labels?.legacy) || Boolean(v?.is_legacy) || Boolean(v?.isLegacy);
        if (isLegacy) return false;
      }
      return true;
    });

    return {
      ok: true,
      voices: filtered,
      raw: data,
    };
  }

  if (actionId === 'text_to_speech') {
    const voiceId = String(config.voiceId || '').trim();
    const text = String(config.text || '').trim();
    if (!voiceId) throw new Error('ElevenLabs text_to_speech requires voiceId');
    if (!text) throw new Error('ElevenLabs text_to_speech requires text');

    const modelId = String(config.modelId || 'eleven_multilingual_v2');
    const stability = safeNum(config.stability, 0.5);
    const similarityBoost = safeNum(config.similarityBoost, 0.75);
    const style = safeNum(config.style, 0);
    const speakerBoost = config.speakerBoost != null ? Boolean(config.speakerBoost) : true;

    const body = {
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: speakerBoost,
      },
    };

    const res = await elFetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, apiKey, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`ElevenLabs API error ${res.status}: ${errText || res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || 'audio/mpeg';
    const buf = Buffer.from(await res.arrayBuffer());

    return {
      ok: true,
      voiceId,
      modelId,
      contentType,
      audioBase64: buf.toString('base64'),
    };
  }

  if (actionId === 'voice_clone') {
    const name = String(config.name || '').trim();
    if (!name) throw new Error('ElevenLabs voice_clone requires name');

    const description = config.description != null ? String(config.description) : '';

    const labelsObj = parseJsonMaybe(config.labels);
    const labels = labelsObj && typeof labelsObj === 'object' ? labelsObj : undefined;

    let filesValue: any = config.files;
    if (typeof filesValue === 'string') {
      const parsed = parseJsonMaybe(filesValue);
      filesValue = parsed ?? filesValue;
    }

    const urls: string[] = Array.isArray(filesValue)
      ? filesValue.map((u: any) => String(u)).filter(Boolean)
      : [String(filesValue || '').trim()].filter(Boolean);

    if (!urls.length) {
      return {
        status: 'skipped',
        reason: 'voice_clone requires audio file URLs in the files field (file upload support is limited)'
      };
    }

    const boundary = `----agentapp-elevenlabs-${Date.now()}`;
    const encoder = new TextEncoder();

    const parts: Uint8Array[] = [];

    const pushField = (fieldName: string, value: string) => {
      parts.push(encoder.encode(`--${boundary}\r\n`));
      parts.push(encoder.encode(`Content-Disposition: form-data; name=\"${fieldName}\"\r\n\r\n`));
      parts.push(encoder.encode(value));
      parts.push(encoder.encode(`\r\n`));
    };

    pushField('name', name);
    if (description) pushField('description', description);
    if (labels) pushField('labels', JSON.stringify(labels));

    let i = 0;
    for (const url of urls.slice(0, 10)) {
      i += 1;
      const { bytes, contentType } = await fetchAsBytes(url);
      const filename = `sample-${i}`;

      parts.push(encoder.encode(`--${boundary}\r\n`));
      parts.push(
        encoder.encode(
          `Content-Disposition: form-data; name=\"files\"; filename=\"${filename}\"\r\nContent-Type: ${contentType}\r\n\r\n`
        )
      );
      parts.push(new Uint8Array(bytes));
      parts.push(encoder.encode(`\r\n`));
    }

    parts.push(encoder.encode(`--${boundary}--\r\n`));

    const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
    const bodyBytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const p of parts) {
      bodyBytes.set(p, offset);
      offset += p.length;
    }

    const res = await elFetch('https://api.elevenlabs.io/v1/voices/add', apiKey, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: bodyBytes as any,
    });

    const text = await res.text().catch(() => '');
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      throw new Error(`ElevenLabs API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }

    return { ok: true, voice: data, raw: data };
  }

  return {
    status: 'skipped',
    reason: `ElevenLabs action not implemented: ${actionId}`,
  };
}
