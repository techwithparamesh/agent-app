import type { DomainExecutionPlan, DomainExecutionResult, DomainRequestContext } from "@shared/domainFramework";
import { requiredCapability } from "./policies";
import { storage } from "../storage";

export interface DomainExecutor {
  canExecute(plan: DomainExecutionPlan): boolean;
  execute(plan: DomainExecutionPlan, ctx: DomainRequestContext): Promise<DomainExecutionResult>;
}

export class DomainExecutionOrchestrator {
  constructor(private readonly executors: DomainExecutor[]) {}

  async execute(plan: DomainExecutionPlan, ctx: DomainRequestContext): Promise<DomainExecutionResult> {
    // 1) Agent must exist
    const agent = await storage.getAgentById(ctx.agentId);
    if (!agent) {
      return { handled: true, fallbackToLeadCapture: true, message: "Agent not found." };
    }

    // 2) Capability gating (code-enforced)
    const caps = (agent.capabilities as string[]) || [];
    const needed = requiredCapability(plan.domain, plan.intent);
    if (needed && !caps.includes(needed)) {
      return {
        handled: true,
        fallbackToLeadCapture: true,
        message: "I'm not able to help with that right now. Let me connect you with someone who can.",
        handoffContext: "HANDOFF REQUIRED\n- Ask for name, email, and phone\n- Confirm best contact method and time\n- Do NOT request payment details",
        reason: `capability_missing:${needed}`,
      };
    }

    // 2b) Domain connection gating (per-tenant enablement)
    // Real estate must not be enabled globally; require an active domain_connection.
    if (plan.domain === "real_estate") {
      const connections = await storage.getDomainConnectionsByAgentId(ctx.agentId);
      const enabled = connections.some(
        (c) => c.domain === "real_estate" && c.isActive && c.userId === ctx.userId
      );

      if (!enabled) {
        return {
          handled: true,
          fallbackToLeadCapture: true,
          message: "I can help with property requests, but a specialist needs to follow up. Let me take your details.",
          handoffContext:
            "HANDOFF REQUIRED\n- Ask for city and area\n- Ask for budget and property type\n- Ask for name, email, and phone\n- Confirm best contact time",
          reason: "domain_disabled:real_estate",
        };
      }
    }

    if (plan.domain === "insurance") {
      const connections = await storage.getDomainConnectionsByAgentId(ctx.agentId);
      const enabled = connections.some(
        (c) => c.domain === "insurance" && c.isActive && c.userId === ctx.userId
      );

      if (!enabled) {
        return {
          handled: true,
          fallbackToLeadCapture: true,
          message: "I can help with insurance enquiries, but a specialist needs to follow up. Let me take your details.",
          handoffContext:
            "HANDOFF REQUIRED\n- Ask what they need (quote/claim/renewal)\n- Ask for policy type\n- Ask for name, email, and phone\n- Confirm best callback time\n- Do NOT quote prices",
          reason: "domain_disabled:insurance",
        };
      }
    }

    // Provide capabilities to routers that optionally need them.
    (ctx as any).agentCapabilities = caps;

    // 3) Dispatch to executor
    const executor = this.executors.find((e) => e.canExecute(plan));
    if (!executor) {
      return {
        handled: false,
        fallbackToLeadCapture: false,
        reason: "no_executor",
      };
    }

    try {
      return await executor.execute(plan, ctx);
    } catch (e) {
      return {
        handled: true,
        fallbackToLeadCapture: true,
        message: "Sorry, I couldn't complete that request. Let me connect you with support.",
        handoffContext: "HANDOFF REQUIRED\n- Ask for name, email, and phone\n- Confirm best contact method and time\n- Do NOT request payment details",
        reason: e instanceof Error ? e.message : "executor_error",
      };
    }
  }
}
