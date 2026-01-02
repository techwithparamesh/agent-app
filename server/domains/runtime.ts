import type {
  DomainExecutionPlan,
  DomainExecutionResult,
  DomainRequestContext,
} from "@shared/domainFramework";
import { planDomainExecution, executeDomainPlan } from "./index";

export type DeterministicDomainRunResult =
  | { handled: false }
  | {
      handled: true;
      responseText: string;
      handoff: boolean;
      plan: DomainExecutionPlan;
      result: DomainExecutionResult;
    };

/**
 * Runs deterministic-only domain intents (e.g., e-commerce transactional intents).
 * Policy-enforced:
 * - Only executes when plan.policy.determinism === 'DETERMINISTIC_ONLY'
 * - Never executes domain connectors for LLM_ALLOWED intents
 *
 * This ensures: no hallucinations for transactional data, and no static/live mixing.
 */
export async function runDeterministicDomainIfNeeded(
  ctx: DomainRequestContext
): Promise<DeterministicDomainRunResult> {
  const plan = await planDomainExecution(ctx);

  if (plan.policy.determinism !== "DETERMINISTIC_ONLY") {
    return { handled: false };
  }

  const result = await executeDomainPlan(plan, ctx);

  const responseText =
    typeof result?.message === "string" && result.message.trim().length > 0
      ? result.message
      : "Sorry, I couldn't complete that request right now. Let me connect you with support.";

  return {
    handled: true,
    responseText,
    handoff: Boolean(result?.fallbackToLeadCapture) || responseText !== result?.message,
    plan,
    result,
  };
}
