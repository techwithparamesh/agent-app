import { storage } from '../storage';
import { decryptCredentialData } from './crypto';
import { runWorkflow } from './workflowRunner';
import CronExpressionParser from 'cron-parser';

type PollState = {
  lastRunAt?: string;
  lastSeenAt?: string;
  recentIds?: string[];
};

type ScheduleState = {
  lastRunAt?: string;
  lastScheduledFor?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeNodeId(node: any): string {
  return String(node?.id || '');
}

function findTriggerNode(workflow: any) {
  const nodes = Array.isArray(workflow?.nodes) ? workflow.nodes : [];
  return nodes.find((n: any) => n?.type === 'trigger') || null;
}

function getTriggerAppId(triggerNode: any): string {
  return String(triggerNode?.appId || triggerNode?.config?.appId || '');
}

function getTriggerId(triggerNode: any): string {
  return String(triggerNode?.triggerId || triggerNode?.config?.selectedTriggerId || triggerNode?.config?.triggerId || '');
}

function getTriggerType(triggerNode: any, workflow: any): string {
  return String(triggerNode?.config?.triggerType || workflow?.triggerType || '');
}

function getCredentialId(triggerNode: any): string | null {
  const cid = triggerNode?.config?.credentialId;
  if (typeof cid === 'string' && cid.length > 0) return cid;
  return null;
}

function pollIntervalMinutes(triggerNode: any): number {
  const v = triggerNode?.config?.pollInterval;
  const n = typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? v : 5;
  if (!Number.isFinite(n) || n <= 0) return 5;
  return Math.max(1, Math.min(60 * 24, n));
}

function getPollState(workflow: any): PollState {
  const cfg = workflow?.triggerConfig && typeof workflow.triggerConfig === 'object' ? workflow.triggerConfig : {};
  const ps = (cfg as any)._pollState;
  if (!ps || typeof ps !== 'object') return {};
  return ps as PollState;
}

function setPollState(workflow: any, newState: PollState) {
  const cfg = workflow?.triggerConfig && typeof workflow.triggerConfig === 'object' ? workflow.triggerConfig : {};
  return { ...cfg, _pollState: newState };
}

function getScheduleState(workflow: any): ScheduleState {
  const cfg = workflow?.triggerConfig && typeof workflow.triggerConfig === 'object' ? workflow.triggerConfig : {};
  const ss = (cfg as any)._scheduleState;
  if (!ss || typeof ss !== 'object') return {};
  return ss as ScheduleState;
}

function setScheduleState(workflow: any, newState: ScheduleState) {
  const cfg = workflow?.triggerConfig && typeof workflow.triggerConfig === 'object' ? workflow.triggerConfig : {};
  return { ...cfg, _scheduleState: newState };
}

function getScheduleExpression(triggerNode: any, workflow: any): string {
  const fromNode = triggerNode?.config?.cronExpression;
  if (typeof fromNode === 'string' && fromNode.trim()) return fromNode.trim();
  const fromWorkflow = workflow?.cronExpression;
  if (typeof fromWorkflow === 'string' && fromWorkflow.trim()) return fromWorkflow.trim();
  const fromCfg = workflow?.triggerConfig?.cronExpression;
  if (typeof fromCfg === 'string' && fromCfg.trim()) return fromCfg.trim();
  return '';
}

function getScheduleTimezone(triggerNode: any, workflow: any): string {
  const fromNode = triggerNode?.config?.timezone;
  if (typeof fromNode === 'string' && fromNode.trim()) return fromNode.trim();
  const fromWorkflow = workflow?.timezone;
  if (typeof fromWorkflow === 'string' && fromWorkflow.trim()) return fromWorkflow.trim();
  return 'UTC';
}

function nextScheduleAfter(cronExpression: string, tz: string, afterDate: Date): Date | null {
  try {
    const cron = CronExpressionParser.parse(cronExpression, { currentDate: afterDate, tz });
    return cron.next().toDate();
  } catch {
    return null;
  }
}

function shouldRunPoll(state: PollState, intervalMinutes: number, nowMs: number) {
  if (!state.lastRunAt) return true;
  const lastMs = Date.parse(state.lastRunAt);
  if (!Number.isFinite(lastMs)) return true;
  return nowMs - lastMs >= intervalMinutes * 60_000;
}

function pushRecentId(state: PollState, id: string, max = 100): PollState {
  const cur = Array.isArray(state.recentIds) ? state.recentIds : [];
  const next = [id, ...cur.filter((x) => x !== id)].slice(0, max);
  return { ...state, recentIds: next };
}

async function resolveCredential(userId: string, credentialId: string): Promise<Record<string, any>> {
  const cred = await storage.getCredentialById(credentialId);
  if (!cred) throw new Error('Credential not found');
  if (cred.userId !== userId) throw new Error('Forbidden');
  if (cred.isValid === false) throw new Error('Credential is not verified');
  return decryptCredentialData(cred.encryptedData) as any;
}

async function driveList(accessToken: string, query: string, orderBy: string) {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', query);
  url.searchParams.set('orderBy', orderBy);
  url.searchParams.set('pageSize', '10');
  url.searchParams.set('fields', 'files(id,name,mimeType,createdTime,modifiedTime,parents,webViewLink,webContentLink),nextPageToken');
  url.searchParams.set('supportsAllDrives', 'true');
  url.searchParams.set('includeItemsFromAllDrives', 'true');

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Drive API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

async function driveGet(accessToken: string, fileId: string) {
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
  url.searchParams.set('fields', 'id,name,mimeType,createdTime,modifiedTime,parents,webViewLink,webContentLink');

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Drive API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

async function calendarListEvents(accessToken: string, calendarId: string, params: Record<string, string>) {
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Calendar API error ${res.status}: ${text || res.statusText}`);
  }

  const text = await res.text().catch(() => '');
  return text ? JSON.parse(text) : null;
}

async function pollGoogleDrive(triggerId: string, triggerConfig: any, credential: Record<string, any>, state: PollState) {
  const accessToken = String(credential.accessToken || '');
  if (!accessToken) throw new Error('Google Drive poll requires accessToken');

  const lastSeenAt = state.lastSeenAt || nowIso();

  if (triggerId === 'new_file') {
    const folderId = triggerConfig?.folderId ? String(triggerConfig.folderId).trim() : '';
    const mimeType = triggerConfig?.mimeType ? String(triggerConfig.mimeType).trim() : '';

    const qParts: string[] = ['trashed = false', `createdTime > '${lastSeenAt}'`];
    if (folderId) qParts.push(`'${folderId.replace(/'/g, "\\'")}' in parents`);
    if (mimeType) {
      if (mimeType.endsWith('/*')) {
        const prefix = mimeType.slice(0, -1).replace(/'/g, "\\'");
        qParts.push(`mimeType contains '${prefix}'`);
      } else {
        qParts.push(`mimeType = '${mimeType.replace(/'/g, "\\'")}'`);
      }
    }

    const data = await driveList(accessToken, qParts.join(' and '), 'createdTime desc');
    const files = Array.isArray(data?.files) ? data.files : [];

    const events = [] as any[];
    let nextState: PollState = { ...state, lastSeenAt: nowIso() };

    for (const f of files) {
      const id = String(f?.id || '');
      if (!id) continue;
      if (Array.isArray(state.recentIds) && state.recentIds.includes(id)) continue;
      nextState = pushRecentId(nextState, id);
      events.push({ file: f });
    }

    return { events, nextState };
  }

  if (triggerId === 'file_updated') {
    const fileId = triggerConfig?.fileId ? String(triggerConfig.fileId).trim() : '';
    const folderId = triggerConfig?.folderId ? String(triggerConfig.folderId).trim() : '';

    const events = [] as any[];
    let nextState: PollState = { ...state, lastSeenAt: nowIso() };

    if (fileId) {
      const f = await driveGet(accessToken, fileId);
      const modifiedTime = String(f?.modifiedTime || '');
      if (modifiedTime && Date.parse(modifiedTime) > Date.parse(lastSeenAt)) {
        if (!Array.isArray(state.recentIds) || !state.recentIds.includes(fileId)) {
          nextState = pushRecentId(nextState, fileId);
          events.push({ file: f });
        }
      }
      return { events, nextState };
    }

    const qParts: string[] = ['trashed = false', `modifiedTime > '${lastSeenAt}'`];
    if (folderId) qParts.push(`'${folderId.replace(/'/g, "\\'")}' in parents`);

    const data = await driveList(accessToken, qParts.join(' and '), 'modifiedTime desc');
    const files = Array.isArray(data?.files) ? data.files : [];

    for (const f of files) {
      const id = String(f?.id || '');
      if (!id) continue;
      const dedupeId = `${id}:${String(f?.modifiedTime || '')}`;
      if (Array.isArray(state.recentIds) && state.recentIds.includes(dedupeId)) continue;
      nextState = pushRecentId(nextState, dedupeId);
      events.push({ file: f });
    }

    return { events, nextState };
  }

  return { events: [], nextState: { ...state, lastSeenAt: nowIso() } };
}

async function pollGoogleCalendar(triggerId: string, triggerConfig: any, credential: Record<string, any>, state: PollState) {
  const accessToken = String(credential.accessToken || '');
  if (!accessToken) throw new Error('Google Calendar poll requires accessToken');

  const calendarId = String(triggerConfig?.calendarId || 'primary');
  const lastSeenAt = state.lastSeenAt || nowIso();
  const now = new Date();

  if (triggerId === 'new_event' || triggerId === 'event_updated') {
    const data = await calendarListEvents(accessToken, calendarId, {
      singleEvents: 'true',
      orderBy: 'updated',
      maxResults: '10',
      updatedMin: lastSeenAt,
    });

    const items = Array.isArray(data?.items) ? data.items : [];
    const events = [] as any[];
    let nextState: PollState = { ...state, lastSeenAt: nowIso() };

    for (const ev of items) {
      const eventId = String(ev?.id || '');
      if (!eventId) continue;

      const updated = String(ev?.updated || '');
      const created = String(ev?.created || '');

      if (triggerId === 'new_event') {
        if (!created || Date.parse(created) <= Date.parse(lastSeenAt)) continue;
      }

      if (triggerId === 'event_updated') {
        if (!updated || Date.parse(updated) <= Date.parse(lastSeenAt)) continue;
      }

      const dedupeId = `${eventId}:${updated || created}`;
      if (Array.isArray(state.recentIds) && state.recentIds.includes(dedupeId)) continue;
      nextState = pushRecentId(nextState, dedupeId);
      events.push({ event: ev });
    }

    return { events, nextState };
  }

  if (triggerId === 'event_started') {
    const minutesBefore = Number(triggerConfig?.minutesBefore ?? 0);
    const offsetMs = (Number.isFinite(minutesBefore) ? minutesBefore : 0) * 60_000;

    const targetStart = new Date(now.getTime() + offsetMs);
    const windowStart = new Date(targetStart.getTime() - 60_000);
    const windowEnd = new Date(targetStart.getTime() + 60_000);

    const data = await calendarListEvents(accessToken, calendarId, {
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '10',
      timeMin: windowStart.toISOString(),
      timeMax: windowEnd.toISOString(),
    });

    const items = Array.isArray(data?.items) ? data.items : [];
    const events = [] as any[];
    let nextState: PollState = { ...state, lastSeenAt: nowIso() };

    for (const ev of items) {
      const eventId = String(ev?.id || '');
      if (!eventId) continue;

      const startDt = String(ev?.start?.dateTime || '');
      if (!startDt) continue; // skip all-day

      const startMs = Date.parse(startDt);
      if (!Number.isFinite(startMs)) continue;

      if (startMs < windowStart.getTime() || startMs > windowEnd.getTime()) continue;

      const dedupeId = `${eventId}:${startDt}`;
      if (Array.isArray(state.recentIds) && state.recentIds.includes(dedupeId)) continue;
      nextState = pushRecentId(nextState, dedupeId);
      events.push({ event: ev });
    }

    return { events, nextState };
  }

  return { events: [], nextState: { ...state, lastSeenAt: nowIso() } };
}

async function executePollEvent(workflow: any, triggerNode: any, triggerId: string, eventPayload: any) {
  const triggerData = {
    appId: getTriggerAppId(triggerNode),
    triggerId,
    nodeId: normalizeNodeId(triggerNode),
    event: eventPayload,
    polledAt: nowIso(),
  };

  const execution = await storage.createExecution({
    workflowId: workflow.id,
    status: 'pending',
    triggerType: 'poll',
    triggerData,
    startedAt: new Date(),
  });

  const startedAtMs = Date.now();
  await storage.updateExecution(execution.id, { status: 'running' });

  try {
    const result = await runWorkflow({
      userId: workflow.userId,
      workflowId: workflow.id,
      nodes: workflow.nodes || [],
      connections: workflow.connections || [],
      triggerType: 'poll',
      triggerData,
    });

    const duration = Date.now() - startedAtMs;
    await storage.updateExecution(execution.id, {
      status: 'success',
      completedAt: new Date(),
      duration,
      outputData: result.outputData,
      nodeExecutions: result.nodeExecutions,
    });

    await storage.updateWorkflow(workflow.id, {
      executionCount: (workflow.executionCount || 0) + 1,
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'success',
    });

    return { ok: true, executionId: execution.id };
  } catch (error: any) {
    const duration = Date.now() - startedAtMs;
    await storage.updateExecution(execution.id, {
      status: 'error',
      completedAt: new Date(),
      duration,
      errorMessage: error?.message || 'Workflow execution failed',
      errorStack: error?.stack ? String(error.stack) : undefined,
    });

    await storage.updateWorkflow(workflow.id, {
      executionCount: (workflow.executionCount || 0) + 1,
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'error',
    });

    return { ok: false, executionId: execution.id, error: error?.message || 'Failed' };
  }
}

async function executeScheduleEvent(workflow: any, triggerNode: any, triggerId: string, cronExpression: string, timezone: string, scheduledForIso: string) {
  const triggerData = {
    appId: getTriggerAppId(triggerNode),
    triggerId,
    nodeId: normalizeNodeId(triggerNode),
    cronExpression,
    timezone,
    scheduledFor: scheduledForIso,
    firedAt: nowIso(),
  };

  const execution = await storage.createExecution({
    workflowId: workflow.id,
    status: 'pending',
    triggerType: 'schedule',
    triggerData,
    startedAt: new Date(),
  });

  const startedAtMs = Date.now();
  await storage.updateExecution(execution.id, { status: 'running' });

  try {
    const result = await runWorkflow({
      userId: workflow.userId,
      workflowId: workflow.id,
      nodes: workflow.nodes || [],
      connections: workflow.connections || [],
      triggerType: 'schedule',
      triggerData,
    });

    const duration = Date.now() - startedAtMs;
    await storage.updateExecution(execution.id, {
      status: 'success',
      completedAt: new Date(),
      duration,
      outputData: result.outputData,
      nodeExecutions: result.nodeExecutions,
    });

    await storage.updateWorkflow(workflow.id, {
      executionCount: (workflow.executionCount || 0) + 1,
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'success',
    });

    return { ok: true, executionId: execution.id };
  } catch (error: any) {
    const duration = Date.now() - startedAtMs;
    await storage.updateExecution(execution.id, {
      status: 'error',
      completedAt: new Date(),
      duration,
      errorMessage: error?.message || 'Workflow execution failed',
      errorStack: error?.stack ? String(error.stack) : undefined,
    });

    await storage.updateWorkflow(workflow.id, {
      executionCount: (workflow.executionCount || 0) + 1,
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'error',
    });

    return { ok: false, executionId: execution.id, error: error?.message || 'Failed' };
  }
}

let engineStarted = false;
let timer: NodeJS.Timeout | null = null;

export function startIntegrationTriggerEngine() {
  if (engineStarted) return;
  engineStarted = true;

  const tick = async () => {
    const nowMs = Date.now();
    try {
      const workflows = await storage.getActiveWorkflows();

      for (const workflow of workflows) {
        try {
          const triggerNode = findTriggerNode(workflow);
          if (!triggerNode) continue;

          const tType = getTriggerType(triggerNode, workflow);

          const triggerId = getTriggerId(triggerNode);

          if (tType === 'poll') {
            const appId = getTriggerAppId(triggerNode);

            // Only implement poll handlers for Drive + Calendar in this batch.
            if (appId !== 'google_drive' && appId !== 'google_calendar') continue;

            const intervalMin = pollIntervalMinutes(triggerNode);
            const state = getPollState(workflow);
            if (!shouldRunPoll(state, intervalMin, nowMs)) continue;

            const credentialId = getCredentialId(triggerNode);
            if (!credentialId) continue;
            const credential = await resolveCredential(workflow.userId, credentialId);

            let polled;
            if (appId === 'google_drive') {
              polled = await pollGoogleDrive(triggerId, triggerNode.config || {}, credential, state);
            } else {
              polled = await pollGoogleCalendar(triggerId, triggerNode.config || {}, credential, state);
            }

            let nextState: PollState = polled.nextState || {};
            nextState = { ...nextState, lastRunAt: new Date().toISOString() };

            // Execute events (cap to avoid runaway)
            const events = Array.isArray(polled.events) ? polled.events.slice(0, 5) : [];
            for (const ev of events) {
              await executePollEvent(workflow, triggerNode, triggerId, ev);
            }

            const updatedTriggerConfig = setPollState(workflow, nextState);
            await storage.updateWorkflow(workflow.id, { triggerConfig: updatedTriggerConfig });
            continue;
          }

          if (tType === 'schedule') {
            const cronExpression = getScheduleExpression(triggerNode, workflow);
            if (!cronExpression) continue;
            const timezone = getScheduleTimezone(triggerNode, workflow);

            const state = getScheduleState(workflow);
            const lastRunAtMs = state.lastRunAt ? Date.parse(state.lastRunAt) : NaN;
            const baseDate = Number.isFinite(lastRunAtMs) ? new Date(lastRunAtMs) : new Date(nowMs - 1000);

            const next = nextScheduleAfter(cronExpression, timezone, baseDate);
            if (!next) continue;
            if (next.getTime() > nowMs) continue;

            const scheduledForIso = next.toISOString();
            const lastScheduledForMs = state.lastScheduledFor ? Date.parse(state.lastScheduledFor) : NaN;
            if (Number.isFinite(lastScheduledForMs) && lastScheduledForMs === next.getTime()) continue;

            await executeScheduleEvent(workflow, triggerNode, triggerId, cronExpression, timezone, scheduledForIso);

            const nextState: ScheduleState = { lastRunAt: nowIso(), lastScheduledFor: scheduledForIso };
            const updatedTriggerConfig = setScheduleState(workflow, nextState);
            await storage.updateWorkflow(workflow.id, { triggerConfig: updatedTriggerConfig });
            continue;
          }
        } catch (err) {
          console.error('[TriggerEngine] workflow poll error:', err);
        }
      }
    } catch (err) {
      console.error('[TriggerEngine] tick error:', err);
    }
  };

  timer = setInterval(() => {
    void tick();
  }, 30_000);

  // Kick off soon after startup
  void tick();
}

export function stopIntegrationTriggerEngine() {
  if (timer) clearInterval(timer);
  timer = null;
  engineStarted = false;
}
