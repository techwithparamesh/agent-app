import { z } from 'zod';

const googleAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export type GoogleAnalyticsExecuteInput = {
  actionId: string;
  config: Record<string, any>;
  credential: Record<string, any>;
};

async function gJson(accessToken: string, url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
    throw new Error(`Google Analytics API error ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }

  return data;
}

function isoDateOnly(value: string) {
  // Accept either full ISO or YYYY-MM-DD.
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function dateRangesFromConfig(config: Record<string, any>): Array<{ startDate: string; endDate: string }> {
  const preset = String(config.dateRange || '30days');
  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const minusDays = (n: number) => {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().slice(0, 10);
  };

  if (preset === '7days') return [{ startDate: minusDays(7), endDate: end.toISOString().slice(0, 10) }];
  if (preset === '90days') return [{ startDate: minusDays(90), endDate: end.toISOString().slice(0, 10) }];
  if (preset === 'custom') {
    const startDate = isoDateOnly(String(config.startDate || ''));
    const endDate = isoDateOnly(String(config.endDate || ''));
    if (!startDate || !endDate) throw new Error('Google Analytics custom dateRange requires startDate and endDate');
    return [{ startDate, endDate }];
  }

  // default 30days
  return [{ startDate: minusDays(30), endDate: end.toISOString().slice(0, 10) }];
}

export async function executeGoogleAnalyticsAction(input: GoogleAnalyticsExecuteInput): Promise<any> {
  const { actionId, config, credential } = input;
  const { accessToken } = googleAuthSchema.parse({ accessToken: credential.accessToken });

  if (actionId === 'run_report') {
    const propertyId = String(config.propertyId || '').trim();
    const dimensions = Array.isArray(config.dimensions) ? config.dimensions.map(String).filter(Boolean) : [];
    const metrics = Array.isArray(config.metrics) ? config.metrics.map(String).filter(Boolean) : [];

    if (!propertyId) throw new Error('Google Analytics run_report requires propertyId');
    if (!metrics.length) throw new Error('Google Analytics run_report requires metrics');

    const body = {
      dateRanges: dateRangesFromConfig(config),
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
    };

    const data = await gJson(accessToken, `https://analyticsdata.googleapis.com/v1beta/${encodeURIComponent(propertyId)}:runReport`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { ok: true, report: data, raw: data };
  }

  if (actionId === 'get_realtime') {
    const propertyId = String(config.propertyId || '').trim();
    const dimensions = Array.isArray(config.dimensions) ? config.dimensions.map(String).filter(Boolean) : [];
    const metrics = Array.isArray(config.metrics) ? config.metrics.map(String).filter(Boolean) : [];

    if (!propertyId) throw new Error('Google Analytics get_realtime requires propertyId');
    if (!metrics.length) throw new Error('Google Analytics get_realtime requires metrics');

    const body = {
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
    };

    const data = await gJson(accessToken, `https://analyticsdata.googleapis.com/v1beta/${encodeURIComponent(propertyId)}:runRealtimeReport`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return { ok: true, report: data, raw: data };
  }

  return { status: 'skipped', message: `Google Analytics action not implemented: ${actionId}` };
}
