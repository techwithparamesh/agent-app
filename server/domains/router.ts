import type { DomainExecutionPlan, DomainId, DomainIntent, DomainRequestContext } from "@shared/domainFramework";
import { getPolicy } from "./policies";

export interface DomainRouter {
  /** Returns a plan if this router can handle the message; otherwise null. */
  plan(ctx: DomainRequestContext): Promise<DomainExecutionPlan | null>;
}

/**
 * Simple composite router: tries routers in order.
 * Keeps behavior deterministic and backwards-compatible.
 */
export class CompositeDomainRouter implements DomainRouter {
  constructor(private readonly routers: DomainRouter[]) {}

  async plan(ctx: DomainRequestContext): Promise<DomainExecutionPlan | null> {
    for (const router of this.routers) {
      const p = await router.plan(ctx);
      if (p) return p;
    }
    return null;
  }
}

/**
 * Router used when nothing else matches: treat as informational (static KB).
 */
export class FallbackKbRouter implements DomainRouter {
  async plan(_ctx: DomainRequestContext): Promise<DomainExecutionPlan | null> {
    return {
      domain: "static_kb",
      intent: "informational_qna",
      entities: {},
      policy: getPolicy("static_kb", "informational_qna"),
    };
  }
}

/**
 * Minimal keyword router for future domains.
 * It only activates when the agent has explicitly enabled the domain capability.
 * This prevents accidental cross-domain handling.
 */
export class KeywordDomainRouter implements DomainRouter {
  constructor(
    private readonly domain: DomainId,
    private readonly capability: string,
    private readonly keywords: string[],
    private readonly defaultIntent: DomainIntent
  ) {}

  async plan(ctx: DomainRequestContext): Promise<DomainExecutionPlan | null> {
    const caps = (ctx as any).agentCapabilities as string[] | undefined;
    if (!Array.isArray(caps) || !caps.includes(this.capability)) return null;

    const text = ctx.messageText.toLowerCase();
    const hit = this.keywords.some((k) => text.includes(k));
    if (!hit) return null;

    return {
      domain: this.domain,
      intent: this.defaultIntent,
      entities: {},
      policy: getPolicy(this.domain, this.defaultIntent),
    };
  }
}
