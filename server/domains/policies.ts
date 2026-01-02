import type { DomainId, DomainIntent, ExecutionPolicy } from "@shared/domainFramework";

/**
 * Code-enforced intent policy. UI configuration may only reduce capability,
 * never weaken determinism/verification/freshness requirements.
 */
export function getPolicy(domain: DomainId, intent: DomainIntent): ExecutionPolicy {
  // Informational Q&A is allowed to use the KB + LLM.
  if (intent === "informational_qna") {
    return {
      determinism: "LLM_ALLOWED",
      freshness: "CACHE_PREFERRED",
      verification: "NONE",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  // Human support is always deterministic and safe.
  if (intent === "human_support") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_PREFERRED",
      verification: "NONE",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  // Insurance intents (deterministic, rules-based / lead capture)
  if (intent === "policy_info") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_OK",
      verification: "NONE",
      defaultTtlMs: 60 * 60_000,
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "document_checklist") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_OK",
      verification: "NONE",
      defaultTtlMs: 60 * 60_000,
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "eligibility_check") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_OK",
      verification: "STRONG",
      defaultTtlMs: 10 * 60_000,
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "claim_status") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "ALWAYS_LIVE",
      verification: "STRONG",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "renewal_enquiry") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "ALWAYS_LIVE",
      verification: "SOFT",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "human_handoff") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_PREFERRED",
      verification: "NONE",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  // Transactional/sensitive intents: deterministic only.
  if (intent === "status_check") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "ALWAYS_LIVE",
      verification: "STRONG",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "availability_check") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "ALWAYS_LIVE",
      verification: "SOFT",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "property_details") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_OK",
      verification: "NONE",
      defaultTtlMs: 5 * 60_000,
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "price_filter") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_OK",
      verification: "NONE",
      defaultTtlMs: 60_000,
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "location_info") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_OK",
      verification: "NONE",
      defaultTtlMs: 30 * 60_000,
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "similar_properties") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_OK",
      verification: "NONE",
      defaultTtlMs: 5 * 60_000,
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "schedule_visit") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "ALWAYS_LIVE",
      verification: "SOFT",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "quote_request") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "ALWAYS_LIVE",
      verification: "SOFT",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "schedule_action") {
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "ALWAYS_LIVE",
      verification: "SOFT",
      rateLimitCost: "LIVE_ONLY",
    };
  }

  if (intent === "price_check") {
    // Price can change; allow short caching by default, domain-specific connectors
    // can ignore caching if the system-of-record requires strict live calls.
    return {
      determinism: "DETERMINISTIC_ONLY",
      freshness: "CACHE_OK",
      verification: "NONE",
      defaultTtlMs: 60_000,
      rateLimitCost: "LIVE_ONLY",
    };
  }

  // listing_search
  return {
    determinism: "DETERMINISTIC_ONLY",
    freshness: "CACHE_OK",
    verification: "NONE",
    defaultTtlMs: 5 * 60_000,
    rateLimitCost: "LIVE_ONLY",
  };
}

/**
 * Domain-agnostic intent → capability mapping.
 * Capabilities are additive; domain connectors may apply stricter rules.
 */
export function requiredCapability(domain: DomainId, intent: DomainIntent): string {
  switch (domain) {
    case "ecommerce": {
      if (intent === "status_check") return "orders";
      return "ecommerce";
    }
    case "real_estate":
      return "real_estate";
    case "insurance":
      return "insurance";
    case "education":
      return "education";
    case "static_kb":
    default:
      return "knowledge";
  }
}
