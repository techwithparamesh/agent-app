import type { DomainExecutionPlan, DomainExecutionResult, DomainRequestContext } from "@shared/domainFramework";
import type { DomainExecutor } from "../orchestrator";

/**
 * Safe default executor for future domains.
 * It never calls an LLM, never invents data, and always offers handoff.
 */
export class StubDomainExecutor implements DomainExecutor {
  constructor(private readonly domain: DomainExecutionPlan["domain"]) {}

  canExecute(plan: DomainExecutionPlan): boolean {
    return plan.domain === this.domain;
  }

  async execute(_plan: DomainExecutionPlan, _ctx: DomainRequestContext): Promise<DomainExecutionResult> {
    return {
      handled: true,
      fallbackToLeadCapture: true,
      message: "I can help with that, but I need a specialist to follow up. Let me take your details.",
      handoffContext: "HANDOFF REQUIRED\n- Ask for name, email, and phone\n- Confirm best contact method and time\n- Do NOT request payment details",
      reason: "stub_domain",
    };
  }
}
