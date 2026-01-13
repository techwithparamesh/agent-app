import { and, eq, or } from "drizzle-orm";
import { db } from "../db";
import { whatsappCloudAuditLog, whatsappCloudKillSwitches } from "../../shared/schema";

export class WhatsAppPolicyError extends Error {
  code: string;
  httpStatus: number;

  constructor(code: string, message: string, httpStatus: number = 400) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export function isGlobalKillSwitchEnabled(): boolean {
  const v = String(process.env.WHATSAPP_KILL_SWITCH_GLOBAL || "").toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

const killSwitchAuditDedup = new Map<string, number>();

async function auditKillSwitchTrigger(params: {
  userId: string;
  accountId?: string | null;
  phoneRecordId?: string | null;
  reasonCode: "global" | "scoped";
  scopeType?: string;
}): Promise<void> {
  try {
    const key = `${params.reasonCode}:${params.userId}:${params.accountId || ""}:${params.phoneRecordId || ""}:${params.scopeType || ""}`;
    const now = Date.now();
    const last = killSwitchAuditDedup.get(key) || 0;
    if (now - last < 60_000) return;
    killSwitchAuditDedup.set(key, now);

    await db.insert(whatsappCloudAuditLog).values({
      accountId: params.accountId || null,
      userId: params.userId || null,
      action: "whatsapp_kill_switch_blocked",
      resourceType: "policy",
      resourceId: params.scopeType || params.reasonCode,
      details: {
        reasonCode: params.reasonCode,
        scopeType: params.scopeType,
        userId: params.userId,
        accountId: params.accountId || null,
        phoneRecordId: params.phoneRecordId || null,
      },
      ipAddress: null,
      userAgent: null,
      status: "failure",
      errorMessage: "Kill switch blocked outbound WhatsApp send",
    });
  } catch (e: any) {
    // Do not block sending flow due to audit errors
    console.warn("[WhatsApp Policy] Failed to write kill-switch audit", { err: e?.message });
  }
}

/**
 * Kill-switch enforcement.
 *
 * - Global kill switch via env (instant)
 * - Scoped kill switches via DB table (feature-gated)
 */
export async function enforceKillSwitch(params: {
  userId: string;
  accountId?: string | null;
  phoneRecordId?: string | null;
}): Promise<void> {
  if (isGlobalKillSwitchEnabled()) {
    await auditKillSwitchTrigger({
      userId: params.userId,
      accountId: params.accountId,
      phoneRecordId: params.phoneRecordId,
      reasonCode: "global",
      scopeType: "global",
    });
    throw new WhatsAppPolicyError(
      "whatsapp_kill_switch_global",
      "WhatsApp sending is temporarily disabled by the system administrator.",
      503
    );
  }

  const dbEnabled = String(process.env.WHATSAPP_POLICY_DB || "").toLowerCase();
  if (!(dbEnabled === "1" || dbEnabled === "true" || dbEnabled === "yes")) {
    return;
  }

  try {
    const scopePredicates = [
      and(eq(whatsappCloudKillSwitches.scopeType, "user"), eq(whatsappCloudKillSwitches.scopeId, params.userId)),
    ];

    if (params.accountId) {
      scopePredicates.push(
        and(eq(whatsappCloudKillSwitches.scopeType, "account"), eq(whatsappCloudKillSwitches.scopeId, params.accountId))
      );
    }

    if (params.phoneRecordId) {
      scopePredicates.push(
        and(eq(whatsappCloudKillSwitches.scopeType, "phone"), eq(whatsappCloudKillSwitches.scopeId, params.phoneRecordId))
      );
    }

    const rows = await db
      .select({ scopeType: whatsappCloudKillSwitches.scopeType })
      .from(whatsappCloudKillSwitches)
      .where(
        and(
          eq(whatsappCloudKillSwitches.enabled, true),
          or(...scopePredicates)
        )
      );

    if (rows.length > 0) {
      await auditKillSwitchTrigger({
        userId: params.userId,
        accountId: params.accountId,
        phoneRecordId: params.phoneRecordId,
        reasonCode: "scoped",
        scopeType: rows[0]?.scopeType,
      });
      throw new WhatsAppPolicyError(
        "whatsapp_kill_switch_enabled",
        "WhatsApp sending is disabled for this account/phone/user.",
        403
      );
    }
  } catch (err: any) {
    // If the table is not deployed yet, do not break sending unless explicitly enabled.
    if (err?.code === "ER_NO_SUCH_TABLE") {
      return;
    }
    throw err;
  }
}

export function normalizeWaId(input: string): string {
  return String(input || "").replace(/\D/g, "");
}
