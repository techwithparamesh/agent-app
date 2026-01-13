import { db } from "../db";
import { and, eq, ne, gt } from "drizzle-orm";
import { whatsappCloudAuditLog, whatsappCloudKillSwitches, whatsappCloudRiskStates } from "../../shared/schema";

export type RiskSignalType =
  | "message_send_failed"
  | "message_status_failed"
  | "rate_limited"
  | "spike_detected"
  | "block_or_report";

const SCORE_INCREMENTS: Record<RiskSignalType, number> = {
  message_send_failed: 4,
  message_status_failed: 3,
  rate_limited: 1,
  spike_detected: 6,
  block_or_report: 10,
};

export const RISK_THRESHOLDS = {
  warned: 25,
  paused: 50,
  disabled: 80,
} as const;

export type RiskState = "normal" | "warned" | "paused" | "disabled";

export function computeRiskState(score: number): RiskState {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  if (s >= RISK_THRESHOLDS.disabled) return "disabled";
  if (s >= RISK_THRESHOLDS.paused) return "paused";
  if (s >= RISK_THRESHOLDS.warned) return "warned";
  return "normal";
}

function isPolicyDbEnabled(): boolean {
  const dbEnabled = String(process.env.WHATSAPP_POLICY_DB || "").toLowerCase();
  return dbEnabled === "1" || dbEnabled === "true" || dbEnabled === "yes";
}

async function auditRiskEvent(params: {
  userId: string;
  accountId?: string | null;
  action: string;
  details: Record<string, any>;
  status?: "success" | "failure";
  errorMessage?: string;
}): Promise<void> {
  try {
    await db.insert(whatsappCloudAuditLog).values({
      accountId: params.accountId || null,
      userId: params.userId || null,
      action: params.action,
      resourceType: "risk",
      resourceId: params.userId,
      details: params.details,
      ipAddress: null,
      userAgent: null,
      status: params.status || "success",
      errorMessage: params.errorMessage || null,
    });
  } catch {
    // best-effort
  }
}

export async function recordRiskSignal(params: {
  userId: string;
  type: RiskSignalType;
  details?: any;
  now?: Date;
}): Promise<{ score: number; state: string } | null> {
  const now = params.now ?? new Date();
  const inc = SCORE_INCREMENTS[params.type] ?? 1;

  // Feature gate: do not break older DBs.
  if (!isPolicyDbEnabled()) {
    return null;
  }

  try {
    const [existing] = await db
      .select()
      .from(whatsappCloudRiskStates)
      .where(eq(whatsappCloudRiskStates.userId, params.userId))
      .limit(1);

    const prevScore = existing?.score ?? 0;
    const score = Math.min(100, prevScore + inc);

    const reasons = Array.isArray(existing?.reasons) ? existing!.reasons : [];
    reasons.unshift({ type: params.type, at: now.toISOString(), details: params.details });
    const trimmedReasons = reasons.slice(0, 50);

    const prevState = (existing?.state ?? "normal") as RiskState;
    const state = computeRiskState(score);

    if (existing) {
      await db
        .update(whatsappCloudRiskStates)
        .set({
          score,
          state,
          lastSignalAt: now,
          lastEvaluatedAt: now,
          reasons: trimmedReasons,
          updatedAt: now,
        })
        .where(eq(whatsappCloudRiskStates.id, existing.id));
    } else {
      await db.insert(whatsappCloudRiskStates).values({
        userId: params.userId,
        score,
        state,
        lastSignalAt: now,
        lastEvaluatedAt: now,
        reasons: trimmedReasons,
      });
    }

    // Audit state changes + key signals
    if (state !== prevState) {
      await auditRiskEvent({
        userId: params.userId,
        action: "whatsapp_risk_state_changed",
        details: {
          prevState,
          state,
          prevScore,
          score,
          signal: params.type,
        },
      });
    }

    // Auto-action: if disabled, enforce user kill switch.
    if (state === "disabled") {
      const [ks] = await db
        .select()
        .from(whatsappCloudKillSwitches)
        .where(
          and(
            eq(whatsappCloudKillSwitches.scopeType, "user"),
            eq(whatsappCloudKillSwitches.scopeId, params.userId)
          )
        )
        .limit(1);

      if (ks) {
        if (!ks.enabled) {
          await db
            .update(whatsappCloudKillSwitches)
            .set({ enabled: true, reason: "Auto-disabled due to risk score (manual re-enable required)", updatedAt: now })
            .where(eq(whatsappCloudKillSwitches.id, ks.id));

          await auditRiskEvent({
            userId: params.userId,
            action: "whatsapp_kill_switch_enabled_auto_risk",
            details: { scopeType: "user", scopeId: params.userId, score, state },
            status: "failure",
            errorMessage: "Kill switch enabled due to risk score",
          });
        }
      } else {
        await db.insert(whatsappCloudKillSwitches).values({
          scopeType: "user",
          scopeId: params.userId,
          enabled: true,
          reason: "Auto-disabled due to risk score (manual re-enable required)",
        });

        await auditRiskEvent({
          userId: params.userId,
          action: "whatsapp_kill_switch_enabled_auto_risk",
          details: { scopeType: "user", scopeId: params.userId, score, state },
          status: "failure",
          errorMessage: "Kill switch enabled due to risk score",
        });
      }
    }

    return { score, state };
  } catch (err: any) {
    // Missing tables before migration
    if (err?.code === "ER_NO_SUCH_TABLE") return null;
    throw err;
  }
}

export async function applyRiskDecay(params: {
  now?: Date;
  maxRows?: number;
  decayPerDay?: number;
  dryRun?: boolean;
}): Promise<
  | null
  | {
      scanned: number;
      updated: number;
      skippedDisabled: number;
      sample: Array<{ userId: string; prevScore: number; score: number; prevState: RiskState; state: RiskState }>;
    }
> {
  const now = params.now ?? new Date();
  const maxRows = Math.min(5000, Math.max(1, Number(params.maxRows || 1000)));
  const decayPerDay = Math.min(50, Math.max(1, Number(params.decayPerDay || 5)));
  const dryRun = Boolean(params.dryRun);

  if (!isPolicyDbEnabled()) return null;

  try {
    const rows = await db
      .select({
        id: whatsappCloudRiskStates.id,
        userId: whatsappCloudRiskStates.userId,
        score: whatsappCloudRiskStates.score,
        state: whatsappCloudRiskStates.state,
        lastEvaluatedAt: whatsappCloudRiskStates.lastEvaluatedAt,
        lastSignalAt: whatsappCloudRiskStates.lastSignalAt,
        updatedAt: whatsappCloudRiskStates.updatedAt,
      })
      .from(whatsappCloudRiskStates)
      // Constraint: decay only when state is NOT disabled
      .where(and(ne(whatsappCloudRiskStates.state, "disabled"), gt(whatsappCloudRiskStates.score, 0)))
      .limit(maxRows);

    let updated = 0;
    let skippedDisabled = 0;
    const sample: Array<{ userId: string; prevScore: number; score: number; prevState: RiskState; state: RiskState }> = [];

    for (const row of rows) {
      const prevState = (row.state as RiskState) || "normal";
      if (prevState === "disabled") {
        skippedDisabled += 1;
        continue;
      }

      const anchor = row.lastEvaluatedAt || row.lastSignalAt || row.updatedAt || null;
      if (!anchor) continue;

      const days = Math.floor((now.getTime() - new Date(anchor as any).getTime()) / (24 * 60 * 60 * 1000));
      if (days <= 0) continue;

      const prevScore = Number(row.score || 0);
      const nextScore = Math.max(0, prevScore - days * decayPerDay);
      if (nextScore === prevScore) continue;

      const nextState = computeRiskState(nextScore);

      if (!dryRun) {
        await db
          .update(whatsappCloudRiskStates)
          .set({
            score: nextScore,
            state: nextState,
            lastEvaluatedAt: now,
            updatedAt: now,
          })
          .where(eq(whatsappCloudRiskStates.id, row.id));

        if (nextState !== prevState) {
          await auditRiskEvent({
            userId: row.userId,
            action: "whatsapp_risk_state_changed",
            details: {
              prevState,
              state: nextState,
              prevScore,
              score: nextScore,
              signal: "decay",
              days,
              decayPerDay,
            },
          });
        }
      }

      updated += 1;
      if (sample.length < 50) {
        sample.push({ userId: row.userId, prevScore, score: nextScore, prevState, state: nextState });
      }
    }

    return { scanned: rows.length, updated, skippedDisabled, sample };
  } catch (err: any) {
    if (err?.code === "ER_NO_SUCH_TABLE") return null;
    throw err;
  }
}

export async function adminResetRisk(params: {
  userId: string;
  score?: number;
  clearReasons?: boolean;
  now?: Date;
}): Promise<{ userId: string; score: number; state: RiskState } | null> {
  const now = params.now ?? new Date();
  const score = Math.max(0, Math.min(100, Number(params.score ?? 0)));
  const state = computeRiskState(score);

  if (!isPolicyDbEnabled()) return null;

  try {
    const [existing] = await db
      .select({ id: whatsappCloudRiskStates.id })
      .from(whatsappCloudRiskStates)
      .where(eq(whatsappCloudRiskStates.userId, params.userId))
      .limit(1);

    if (existing) {
      await db
        .update(whatsappCloudRiskStates)
        .set({
          score,
          state,
          lastEvaluatedAt: now,
          updatedAt: now,
          ...(params.clearReasons ? { reasons: [] as any } : {}),
        })
        .where(eq(whatsappCloudRiskStates.id, existing.id));
    } else {
      await db.insert(whatsappCloudRiskStates).values({
        userId: params.userId,
        score,
        state,
        lastEvaluatedAt: now,
        lastSignalAt: null,
        reasons: params.clearReasons ? ([] as any) : (undefined as any),
      });
    }

    await auditRiskEvent({
      userId: params.userId,
      action: "whatsapp_risk_reset_admin",
      details: { score, state, clearReasons: Boolean(params.clearReasons) },
    });

    return { userId: params.userId, score, state };
  } catch (err: any) {
    if (err?.code === "ER_NO_SUCH_TABLE") return null;
    throw err;
  }
}
