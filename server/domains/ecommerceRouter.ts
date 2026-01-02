import type { DomainExecutionPlan, DomainRequestContext } from "@shared/domainFramework";
import { getPolicy } from "./policies";
import type { DomainRouter } from "./router";
import { storage } from "../storage";

/**
 * E-commerce router adapter:
 * - Preserves existing ecommerceIntentRouter detection & entity extraction.
 * - Produces domain-agnostic intents + code-enforced policies.
 */
export class EcommerceDomainRouter implements DomainRouter {
  async plan(ctx: DomainRequestContext): Promise<DomainExecutionPlan | null> {
    const agentId = ctx.agentId;

    // Only route to e-commerce if a connection exists and is active.
    const connection = await storage.getEcommerceConnectionByAgentId(agentId);
    if (!connection?.isActive) return null;

    const { ecommerceIntentRouter } = await import("../ecommerce");
    const ecomIntent = ecommerceIntentRouter.detectIntent(ctx.messageText);
    if (!ecomIntent) return null;

    const entities = ecommerceIntentRouter.extractEntities(ctx.messageText, ecomIntent) as Record<string, unknown>;

    // Map existing ecom intents → domain-agnostic intents
    const mapped = mapEcomIntent(ecomIntent);

    return {
      domain: "ecommerce",
      intent: mapped,
      entities,
      policy: getPolicy("ecommerce", mapped),
    };
  }
}

function mapEcomIntent(ecomIntent: string) {
  switch (ecomIntent) {
    case "product_lookup":
    case "product_recommend":
      return "listing_search" as const;
    case "price_check":
      return "price_check" as const;
    case "stock_check":
      return "availability_check" as const;
    case "order_tracking":
      return "status_check" as const;
    case "refund_request":
      return "human_support" as const;
    default:
      // Unknown ecom intents are treated as informational fallback.
      return "informational_qna" as const;
  }
}
