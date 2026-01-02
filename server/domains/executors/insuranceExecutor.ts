import type { DomainExecutionPlan, DomainExecutionResult, DomainRequestContext } from "@shared/domainFramework";
import type { DomainExecutor } from "../orchestrator";

export class InsuranceDomainExecutor implements DomainExecutor {
  canExecute(plan: DomainExecutionPlan): boolean {
    return plan.domain === "insurance";
  }

  async execute(plan: DomainExecutionPlan, ctx: DomainRequestContext): Promise<DomainExecutionResult> {
    try {
      const { InsuranceService } = await import("../../../src/domains/insurance/insurance.service");
      const service = new InsuranceService();

      const policyType = typeof plan.entities?.policyType === "string" ? (plan.entities.policyType as string) : undefined;
      const referenceId = typeof plan.entities?.referenceId === "string" ? (plan.entities.referenceId as string) : undefined;

      switch (plan.intent) {
        case "policy_info": {
          const items = await service.getPolicyInfo(ctx.userId, { policyType });
          return {
            handled: true,
            message: items.length ? formatPolicyInfo(items) : "No policy information is configured for that type.",
            data: { items },
          };
        }

        case "document_checklist": {
          const checklist = await service.getDocumentsChecklist(ctx.userId, {
            policyType,
            purpose: inferPurpose(ctx.messageText),
          });

          return {
            handled: true,
            message: checklist.items.length ? formatChecklist(checklist) : "No document checklist is available for that request.",
            data: { checklist },
          };
        }

        case "eligibility_check": {
          // Deterministic & rule-based only. If we don't have applicant data, handoff.
          const applicant = typeof plan.entities?.applicant === "object" && plan.entities.applicant ? (plan.entities.applicant as any) : null;
          if (!policyType || !applicant) {
            return {
              handled: true,
              fallbackToLeadCapture: true,
              message: "I can check eligibility, but I need your policy type and basic details (e.g., age, city, any relevant info).",
              handoffContext:
                "HANDOFF REQUIRED\n- Ask for policy type\n- Ask for basic applicant details\n- Ask for name and phone\n- Do NOT quote prices",
              reason: "missing_applicant_data",
            };
          }

          const result = await service.eligibilityCheck(ctx.userId, { policyType, applicant });

          return {
            handled: true,
            message: result.decision.eligible ? "YES — eligible." : "NO — not eligible.",
            data: result,
          };
        }

        case "claim_status": {
          return {
            handled: true,
            fallbackToLeadCapture: true,
            message: "I can help with a claim status enquiry. Please share your name, phone, and claim reference number.",
            handoffContext:
              "HANDOFF REQUIRED\n- Ask for name and phone\n- Ask for claim reference ID\n- Ask for policy type (optional)\n- Confirm preferred callback time",
            reason: referenceId ? "claim_status_requires_handoff" : "missing_reference_id",
          };
        }

        case "renewal_enquiry": {
          return {
            handled: true,
            fallbackToLeadCapture: true,
            message: "I can help with a renewal enquiry. Please share your name, phone, and policy reference number.",
            handoffContext:
              "HANDOFF REQUIRED\n- Ask for name and phone\n- Ask for policy reference ID\n- Ask for policy type (optional)\n- Confirm preferred callback time",
            reason: referenceId ? "renewal_requires_handoff" : "missing_reference_id",
          };
        }

        case "human_handoff": {
          return {
            handled: true,
            fallbackToLeadCapture: true,
            message: "Sure — I’ll have a specialist call you back. Please share your name and phone number.",
            handoffContext:
              "HANDOFF REQUIRED\n- Ask for name and phone\n- Ask what they need help with (quote/claim/renewal)\n- Confirm best callback time",
            reason: "handoff_requested",
          };
        }

        case "quote_request":
        default: {
          return {
            handled: true,
            fallbackToLeadCapture: true,
            message: "I can help with an insurance quote request. Please share your name, phone, policy type, and any notes.",
            handoffContext:
              "HANDOFF REQUIRED\n- Ask for policy type\n- Ask for name and phone\n- Ask for email (optional)\n- Ask for brief notes\n- Do NOT quote prices",
            reason: "quote_request_handoff",
          };
        }
      }
    } catch {
      return {
        handled: true,
        fallbackToLeadCapture: true,
        message: "Sorry, I couldn't complete that request. Let me connect you with a specialist.",
        handoffContext:
          "HANDOFF REQUIRED\n- Ask for name and phone\n- Ask for policy type\n- Confirm best callback time",
        reason: "insurance_executor_error",
      };
    }
  }
}

function inferPurpose(messageText: string): string {
  const t = messageText.toLowerCase();
  if (t.includes("purchase") || t.includes("buy") || t.includes("new policy")) return "purchase";
  return "claims";
}

function formatPolicyInfo(items: any[]): string {
  const top = items.slice(0, 5);
  const lines = top.map((p) => {
    const summary = p.coverageSummary ? String(p.coverageSummary) : "(no summary)";
    const exclusions = p.exclusions ? String(p.exclusions) : "(no exclusions listed)";
    return `Policy: ${p.policyType}\nCoverage: ${summary}\nExclusions: ${exclusions}`;
  });
  return lines.join("\n\n---\n\n");
}

function formatChecklist(checklist: any): string {
  const header = `Documents (${checklist.purpose}) for ${checklist.policyType || "policy"}:`;
  const lines = Array.isArray(checklist.items) ? checklist.items.slice(0, 20).map((d: any) => `- ${String(d)}`) : [];
  return [header, ...lines].join("\n");
}
