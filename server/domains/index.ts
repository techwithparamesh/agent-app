import type { DomainExecutionPlan, DomainExecutionResult, DomainRequestContext } from "@shared/domainFramework";
import { CompositeDomainRouter, FallbackKbRouter, KeywordDomainRouter } from "./router";
import { EcommerceDomainRouter } from "./ecommerceRouter";
import { RealEstateDomainRouter } from "./realEstateRouter";
import { InsuranceDomainRouter } from "./insuranceRouter";
import { DomainExecutionOrchestrator } from "./orchestrator";
import { EcommerceDomainExecutor } from "./executors/ecommerceExecutor";
import { RealEstateDomainExecutor } from "./executors/realEstateExecutor";
import { InsuranceDomainExecutor } from "./executors/insuranceExecutor";
import { StubDomainExecutor } from "./executors/stubExecutor";
import { storage } from "../storage";

const router = new CompositeDomainRouter([
  new EcommerceDomainRouter(),
  new RealEstateDomainRouter(),
  new InsuranceDomainRouter(),
  // Future domains: only activate when capability exists + keywords match.
  new KeywordDomainRouter("education", "education", ["course", "admission", "enroll", "tuition"], "informational_qna"),
  new FallbackKbRouter(),
]);

const orchestrator = new DomainExecutionOrchestrator([
  new EcommerceDomainExecutor(),
  new RealEstateDomainExecutor(),
  new InsuranceDomainExecutor(),
  new StubDomainExecutor("education"),
]);

export async function planDomainExecution(ctx: DomainRequestContext): Promise<DomainExecutionPlan> {
  // Provide capabilities for routers that need them (e.g. keyword routers).
  const agent = await storage.getAgentById(ctx.agentId);
  (ctx as any).agentCapabilities = (agent?.capabilities as string[]) || [];

  const plan = await router.plan(ctx);
  // FallbackKbRouter guarantees non-null, but keep this safe.
  return (
    plan || {
      domain: "static_kb",
      intent: "informational_qna",
      entities: {},
      policy: {
        determinism: "LLM_ALLOWED",
        freshness: "CACHE_PREFERRED",
        verification: "NONE",
        rateLimitCost: "LIVE_ONLY",
      },
    }
  );
}

export async function executeDomainPlan(
  plan: DomainExecutionPlan,
  ctx: DomainRequestContext
): Promise<DomainExecutionResult> {
  return orchestrator.execute(plan, ctx);
}
