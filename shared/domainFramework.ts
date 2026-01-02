export type DomainId = 'static_kb' | 'ecommerce' | 'real_estate' | 'insurance' | 'education';

export type DomainIntent =
  | 'listing_search'
  | 'property_details'
  | 'price_filter'
  | 'location_info'
  | 'similar_properties'
  | 'schedule_visit'
  | 'policy_info'
  | 'claim_status'
  | 'renewal_enquiry'
  | 'document_checklist'
  | 'eligibility_check'
  | 'human_handoff'
  | 'price_check'
  | 'availability_check'
  | 'quote_request'
  | 'status_check'
  | 'schedule_action'
  | 'human_support'
  | 'informational_qna';

export type FreshnessMode = 'ALWAYS_LIVE' | 'CACHE_OK' | 'CACHE_PREFERRED';

export type DeterminismMode = 'DETERMINISTIC_ONLY' | 'LLM_ALLOWED';

export type VerificationMode = 'NONE' | 'SOFT' | 'STRONG';

export interface ExecutionPolicy {
  determinism: DeterminismMode;
  freshness: FreshnessMode;
  verification: VerificationMode;
  /**
   * Default TTL in milliseconds if freshness allows caching.
   * Code may override based on domain rules.
   */
  defaultTtlMs?: number;
  /**
   * Rate-limit cost model. In general we only charge live calls.
   */
  rateLimitCost: 'LIVE_ONLY' | 'ALWAYS';
}

export interface DomainExecutionPlan {
  domain: DomainId;
  intent: DomainIntent;
  entities: Record<string, unknown>;
  policy: ExecutionPolicy;
}

export interface DomainExecutionResult {
  handled: boolean;
  /** Deterministic recommended response text for transactional/sensitive intents. */
  message?: string;
  /** Optional structured data (should not contain raw PII). */
  data?: unknown;
  /** Whether to fall back to lead capture / human handoff. */
  fallbackToLeadCapture?: boolean;
  /** Additional instructions for handoff flows (safe text). */
  handoffContext?: string;
  /** Debuggable, non-sensitive reason for result (optional). */
  reason?: string;
}

export interface DomainRequestContext {
  agentId: string;
  userId: string;
  conversationId?: string;
  requesterPhone?: string;
  requesterEmail?: string;
  messageText: string;
}
