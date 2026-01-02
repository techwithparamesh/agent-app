import { drizzle } from "drizzle-orm/mysql2";
import { and, desc, eq } from "drizzle-orm";
import { pool } from "../../../server/db";
import { insuranceLeads, insurancePolicies } from "./insurance.schema";
import type {
  EligibilityCheckInput,
  EligibilityDecision,
  InsuranceLead,
  InsuranceLeadType,
  InsurancePolicy,
  PolicyInfoQuery,
  QuoteRequestInput,
  ClaimEnquiryInput,
  RenewalEnquiryInput,
  DocumentsChecklistQuery,
  HandoffRequestInput,
  TenantId,
} from "./insurance.types";

const db = drizzle(pool, {
  schema: {
    insurancePolicies,
    insuranceLeads,
  },
  mode: "default",
});

function safeTrim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown): string | null {
  const v = safeTrim(value);
  return v.length > 0 ? v : null;
}

function normalizeOptional(value: unknown): string | null {
  const v = safeTrim(value);
  return v.length > 0 ? v : null;
}

function extractInsertId(result: any): number | null {
  if (typeof result?.[0]?.insertId === "number") return result[0].insertId;
  if (typeof result?.insertId === "number") return result.insertId;
  return null;
}

type RuleOp = "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";

type RuleClause = {
  field: string;
  op: RuleOp;
  value?: any;
};

type EligibilityRules = {
  all?: RuleClause[];
  any?: RuleClause[];
  documents?: {
    claims?: string[];
    purchase?: string[];
  };
};

function getPath(obj: any, path: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path.split(".").filter(Boolean);
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function evaluateClause(applicant: Record<string, any>, clause: RuleClause): boolean {
  const actual = getPath(applicant, clause.field);
  const expected = clause.value;

  switch (clause.op) {
    case "eq":
      return actual === expected;
    case "ne":
      return actual !== expected;
    case "gt":
      return typeof actual === "number" && typeof expected === "number" && actual > expected;
    case "gte":
      return typeof actual === "number" && typeof expected === "number" && actual >= expected;
    case "lt":
      return typeof actual === "number" && typeof expected === "number" && actual < expected;
    case "lte":
      return typeof actual === "number" && typeof expected === "number" && actual <= expected;
    case "in":
      return Array.isArray(expected) ? expected.includes(actual) : false;
    case "contains":
      if (typeof actual === "string" && typeof expected === "string") {
        return actual.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      return false;
    default:
      return false;
  }
}

function evaluateEligibility(rules: EligibilityRules, applicant: Record<string, any>): EligibilityDecision {
  const allClauses = Array.isArray(rules.all) ? rules.all : [];
  const anyClauses = Array.isArray(rules.any) ? rules.any : [];

  for (const c of allClauses) {
    if (!c?.field || !c?.op) {
      return { eligible: false, reason: "Invalid eligibility rules" };
    }
    if (!evaluateClause(applicant, c)) {
      return { eligible: false, reason: "Not eligible based on provided information" };
    }
  }

  if (anyClauses.length > 0) {
    const ok = anyClauses.some((c) => c?.field && c?.op && evaluateClause(applicant, c));
    if (!ok) {
      return { eligible: false, reason: "Not eligible based on provided information" };
    }
  }

  return { eligible: true, reason: "Eligible based on provided information" };
}

export class InsuranceService {
  async getPolicyInfo(tenantId: TenantId, query: PolicyInfoQuery): Promise<InsurancePolicy[]> {
    const policyType = safeTrim(query.policyType);

    const where = policyType
      ? and(eq(insurancePolicies.tenantId, tenantId), eq(insurancePolicies.policyType, policyType))
      : eq(insurancePolicies.tenantId, tenantId);

    const rows = await db
      .select()
      .from(insurancePolicies)
      .where(where)
      .orderBy(desc(insurancePolicies.createdAt))
      .limit(50);

    return rows as unknown as InsurancePolicy[];
  }

  async getDocumentsChecklist(
    tenantId: TenantId,
    query: DocumentsChecklistQuery
  ): Promise<{ policyType: string | null; purpose: string; items: string[] }> {
    const policyType = safeTrim(query.policyType);
    const purpose = safeTrim(query.purpose).toLowerCase() || "claims";

    if (!policyType) {
      return { policyType: null, purpose, items: [] };
    }

    const [policy] = await db
      .select()
      .from(insurancePolicies)
      .where(and(eq(insurancePolicies.tenantId, tenantId), eq(insurancePolicies.policyType, policyType)))
      .limit(1);

    if (!policy) {
      return { policyType, purpose, items: [] };
    }

    const rules = (policy as any).eligibilityRules as EligibilityRules | null | undefined;
    const docs = rules?.documents;
    const items =
      purpose === "purchase"
        ? Array.isArray(docs?.purchase)
          ? docs!.purchase!
          : []
        : Array.isArray(docs?.claims)
          ? docs!.claims!
          : [];

    return { policyType, purpose, items };
  }

  async eligibilityCheck(tenantId: TenantId, input: EligibilityCheckInput): Promise<{ decision: EligibilityDecision; leadCaptured: boolean }>
  {
    const policyType = safeTrim(input.policyType);
    const applicant = input.applicant && typeof input.applicant === "object" ? input.applicant : null;

    if (!policyType || !applicant) {
      await this.createLead(tenantId, {
        leadType: "handoff",
        policyType: policyType || null,
        name: "",
        phone: "",
        email: null,
        referenceId: null,
        notes: "Eligibility check requested but required data was missing.",
      });

      return {
        decision: { eligible: false, reason: "Missing required data" },
        leadCaptured: true,
      };
    }

    const [policy] = await db
      .select()
      .from(insurancePolicies)
      .where(and(eq(insurancePolicies.tenantId, tenantId), eq(insurancePolicies.policyType, policyType)))
      .limit(1);

    if (!policy) {
      return { decision: { eligible: false, reason: "No policy rules configured" }, leadCaptured: false };
    }

    const rules = ((policy as any).eligibilityRules as EligibilityRules | null) || null;
    if (!rules || (!Array.isArray(rules.all) && !Array.isArray(rules.any))) {
      return { decision: { eligible: false, reason: "No eligibility rules configured" }, leadCaptured: false };
    }

    return { decision: evaluateEligibility(rules, applicant as any), leadCaptured: false };
  }

  async requestQuote(tenantId: TenantId, input: QuoteRequestInput): Promise<InsuranceLead | null> {
    return this.createLeadFromInput(tenantId, "quote", input);
  }

  async claimEnquiry(tenantId: TenantId, input: ClaimEnquiryInput): Promise<{ lead: InsuranceLead | null; status: string }>
  {
    const lead = await this.createLeadFromInput(tenantId, "claim", input);

    // v1: Only look up if prior data exists (we store enquiries/leads).
    const referenceId = normalizeOptional((input as any).referenceId);
    if (referenceId) {
      const [existing] = await db
        .select()
        .from(insuranceLeads)
        .where(
          and(
            eq(insuranceLeads.tenantId, tenantId),
            eq(insuranceLeads.leadType, "claim"),
            eq(insuranceLeads.referenceId, referenceId)
          )
        )
        .orderBy(desc(insuranceLeads.createdAt))
        .limit(1);

      if (existing) {
        return { lead, status: "We have your claim enquiry on record. A specialist will follow up." };
      }
    }

    return { lead, status: "I don’t have a live claim status available. A specialist will follow up." };
  }

  async renewalEnquiry(tenantId: TenantId, input: RenewalEnquiryInput): Promise<InsuranceLead | null> {
    return this.createLeadFromInput(tenantId, "renewal", input);
  }

  async handoffRequest(tenantId: TenantId, input: HandoffRequestInput): Promise<InsuranceLead | null> {
    return this.createLeadFromInput(tenantId, "handoff", input);
  }

  private async createLeadFromInput(
    tenantId: TenantId,
    leadType: InsuranceLeadType,
    input: any
  ): Promise<InsuranceLead | null> {
    const name = safeTrim(input?.name);
    const phone = safeTrim(input?.phone);

    if (!name || !phone) {
      await this.createLead(tenantId, {
        leadType: "handoff",
        policyType: normalizeOptional(input?.policyType),
        name: name || "",
        phone: phone || "",
        email: normalizeEmail(input?.email),
        referenceId: normalizeOptional(input?.referenceId),
        notes: normalizeOptional(input?.notes) || "Request received but missing name/phone.",
      });

      return null;
    }

    return this.createLead(tenantId, {
      leadType,
      policyType: normalizeOptional(input?.policyType),
      name,
      phone,
      email: normalizeEmail(input?.email),
      referenceId: normalizeOptional(input?.referenceId),
      notes: normalizeOptional(input?.notes),
    });
  }

  private async createLead(
    tenantId: TenantId,
    data: {
      leadType: InsuranceLeadType;
      policyType: string | null;
      name: string;
      phone: string;
      email: string | null;
      referenceId: string | null;
      notes: string | null;
    }
  ): Promise<InsuranceLead | null> {
    const result: any = await db
      .insert(insuranceLeads)
      .values({
        tenantId,
        leadType: data.leadType,
        policyType: data.policyType,
        name: data.name,
        phone: data.phone,
        email: data.email,
        referenceId: data.referenceId,
        notes: data.notes,
      } as any);

    const insertedId = extractInsertId(result);
    if (!insertedId) return null;

    const [row] = await db
      .select()
      .from(insuranceLeads)
      .where(and(eq(insuranceLeads.tenantId, tenantId), eq(insuranceLeads.id, insertedId)))
      .limit(1);

    return (row as unknown as InsuranceLead) ?? null;
  }
}
