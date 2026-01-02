import type { DomainExecutionPlan, DomainExecutionResult, DomainRequestContext } from "@shared/domainFramework";
import type { DomainExecutor } from "../orchestrator";
import type { EcomIntent } from "../../ecommerce/intentRouter";

/**
 * Executes e-commerce plans by delegating to the existing ecommerceIntentRouter.
 * This preserves current behavior while aligning under the domain framework.
 */
export class EcommerceDomainExecutor implements DomainExecutor {
  canExecute(plan: DomainExecutionPlan): boolean {
    return plan.domain === "ecommerce";
  }

  async execute(plan: DomainExecutionPlan, ctx: DomainRequestContext): Promise<DomainExecutionResult> {
    const { ecommerceIntentRouter } = await import("../../ecommerce");

    // Map back to existing ecom intents for stable behavior.
    const ecomIntent = mapGenericIntentToEcom(plan.intent);
    if (!ecomIntent) {
      return { handled: true, fallbackToLeadCapture: false, message: undefined };
    }

    const result = await ecommerceIntentRouter.route({
      agentId: ctx.agentId,
      userId: ctx.userId,
      intent: ecomIntent,
      entities: plan.entities,
      conversationId: ctx.conversationId,
      requesterPhone: ctx.requesterPhone,
    });

    return {
      handled: true,
      message: result?.message,
      data: result?.data,
      fallbackToLeadCapture: Boolean(result?.fallbackToLeadCapture),
      handoffContext: result?.fallbackToLeadCapture
        ? "HANDOFF REQUIRED\n- Ask for name, email, and phone\n- Confirm best contact method and time\n- Do NOT request payment details\n- Do NOT attempt checkout/refund automation"
        : undefined,
    };
  }
}

function mapGenericIntentToEcom(intent: DomainExecutionPlan["intent"]): EcomIntent | null {
  switch (intent) {
    case "listing_search":
      return "product_lookup";
    case "price_check":
      return "price_check";
    case "availability_check":
      return "stock_check";
    case "status_check":
      return "order_tracking";
    case "human_support":
      return "refund_request";
    default:
      return null;
  }
}

