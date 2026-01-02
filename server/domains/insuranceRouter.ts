import type { DomainExecutionPlan, DomainRequestContext } from "@shared/domainFramework";
import { getPolicy } from "./policies";
import type { DomainRouter } from "./router";

const INSURANCE_KEYWORDS = [
  "insurance",
  "policy",
  "premium",
  "claim",
  "renew",
  "renewal",
  "coverage",
  "exclusion",
  "eligibility",
  "documents",
  "checklist",
  "idv",
];

export class InsuranceDomainRouter implements DomainRouter {
  async plan(ctx: DomainRequestContext): Promise<DomainExecutionPlan | null> {
    const text = ctx.messageText.toLowerCase();
    const looksLikeInsurance = INSURANCE_KEYWORDS.some((k) => text.includes(k));
    if (!looksLikeInsurance) return null;

    const intent = detectInsuranceIntent(text);
    const entities: Record<string, unknown> = {
      ...extractPolicyType(text),
      ...extractReferenceId(text),
    };

    return {
      domain: "insurance",
      intent,
      entities,
      policy: getPolicy("insurance", intent),
    };
  }
}

function detectInsuranceIntent(text: string): DomainExecutionPlan["intent"] {
  if (text.includes("handoff") || text.includes("callback") || text.includes("call me") || text.includes("talk to") || text.includes("human") || text.includes("agent")) {
    return "human_handoff";
  }

  if (text.includes("eligibility") || text.includes("eligible") || text.includes("include") || text.includes("inclusion") || text.includes("covered") || text.includes("cover")) {
    return "eligibility_check";
  }

  if (text.includes("document") || text.includes("documents") || text.includes("checklist") || text.includes("required") || text.includes("requirement")) {
    return "document_checklist";
  }

  if (text.includes("renew") || text.includes("renewal")) {
    return "renewal_enquiry";
  }

  if (text.includes("claim") && (text.includes("status") || text.includes("track") || text.includes("tracking") || text.includes("enquiry") || text.includes("inquiry"))) {
    return "claim_status";
  }

  if (text.includes("quote") || text.includes("get quote") || text.includes("quotation") || text.includes("buy") || text.includes("purchase")) {
    return "quote_request";
  }

  if (text.includes("policy") || text.includes("coverage") || text.includes("exclusion") || text.includes("benefit") || text.includes("info") || text.includes("information")) {
    return "policy_info";
  }

  return "quote_request";
}

function extractPolicyType(text: string): Record<string, unknown> {
  if (text.includes("health")) return { policyType: "health" };
  if (text.includes("motor") || text.includes("car") || text.includes("bike")) return { policyType: "motor" };
  if (text.includes("life")) return { policyType: "life" };
  if (text.includes("travel")) return { policyType: "travel" };
  if (text.includes("home")) return { policyType: "home" };
  return {};
}

function extractReferenceId(text: string): Record<string, unknown> {
  const m = text.match(/(?:claim|policy|reference|ref)\s*#?\s*([a-z0-9\-]{4,32})/i) || text.match(/#([a-z0-9\-]{4,32})/i);
  if (!m) return {};
  const referenceId = String(m[1]).trim();
  return referenceId ? { referenceId } : {};
}
