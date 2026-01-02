import { Router } from "express";
import type { Request, Response } from "express";
import { InsuranceService } from "./insurance.service";

function getTenantId(req: Request): string | null {
  const user = (req as any)?.user;
  const tenantId = user?.id;
  return typeof tenantId === "string" && tenantId.length > 0 ? tenantId : null;
}

const service = new InsuranceService();

export const insuranceRoutes = Router();

// Base path (for mounting): /api/domains/insurance

insuranceRoutes.get("/policies/info", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const items = await service.getPolicyInfo(tenantId, {
      policyType: typeof req.query.policy_type === "string" ? req.query.policy_type : undefined,
    });

    return res.json({ items });
  } catch {
    return res.status(500).json({ error: "Failed to fetch policy info" });
  }
});

insuranceRoutes.get("/documents/checklist", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const checklist = await service.getDocumentsChecklist(tenantId, {
      policyType: typeof req.query.policy_type === "string" ? req.query.policy_type : undefined,
      purpose: typeof req.query.purpose === "string" ? req.query.purpose : undefined,
    });

    return res.json({ checklist });
  } catch {
    return res.status(500).json({ error: "Failed to fetch documents checklist" });
  }
});

insuranceRoutes.post("/eligibility/check", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const policyType = typeof (req.body as any)?.policyType === "string" ? (req.body as any).policyType : "";
  const applicant = (req.body as any)?.applicant;

  if (!policyType.trim() || !applicant || typeof applicant !== "object") {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const result = await service.eligibilityCheck(tenantId, { policyType, applicant });
    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Eligibility check failed" });
  }
});

insuranceRoutes.post("/quotes/request", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const name = typeof (req.body as any)?.name === "string" ? (req.body as any).name : "";
  const phone = typeof (req.body as any)?.phone === "string" ? (req.body as any).phone : "";

  if (name.trim().length < 2 || phone.trim().length < 5) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const lead = await service.requestQuote(tenantId, {
      policyType: typeof (req.body as any)?.policyType === "string" ? (req.body as any).policyType : undefined,
      name,
      phone,
      email: typeof (req.body as any)?.email === "string" ? (req.body as any).email : undefined,
      notes: typeof (req.body as any)?.notes === "string" ? (req.body as any).notes : undefined,
    });

    return res.status(201).json({ lead, message: "Quote request received." });
  } catch {
    return res.status(500).json({ error: "Failed to create quote request" });
  }
});

insuranceRoutes.post("/claims/enquiry", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const name = typeof (req.body as any)?.name === "string" ? (req.body as any).name : "";
  const phone = typeof (req.body as any)?.phone === "string" ? (req.body as any).phone : "";

  if (name.trim().length < 2 || phone.trim().length < 5) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const result = await service.claimEnquiry(tenantId, {
      policyType: typeof (req.body as any)?.policyType === "string" ? (req.body as any).policyType : undefined,
      name,
      phone,
      email: typeof (req.body as any)?.email === "string" ? (req.body as any).email : undefined,
      referenceId: typeof (req.body as any)?.referenceId === "string" ? (req.body as any).referenceId : undefined,
      notes: typeof (req.body as any)?.notes === "string" ? (req.body as any).notes : undefined,
    });

    return res.status(201).json({ ...result });
  } catch {
    return res.status(500).json({ error: "Failed to submit claim enquiry" });
  }
});

insuranceRoutes.post("/renewals/enquiry", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const name = typeof (req.body as any)?.name === "string" ? (req.body as any).name : "";
  const phone = typeof (req.body as any)?.phone === "string" ? (req.body as any).phone : "";

  if (name.trim().length < 2 || phone.trim().length < 5) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const lead = await service.renewalEnquiry(tenantId, {
      policyType: typeof (req.body as any)?.policyType === "string" ? (req.body as any).policyType : undefined,
      name,
      phone,
      email: typeof (req.body as any)?.email === "string" ? (req.body as any).email : undefined,
      referenceId: typeof (req.body as any)?.referenceId === "string" ? (req.body as any).referenceId : undefined,
      notes: typeof (req.body as any)?.notes === "string" ? (req.body as any).notes : undefined,
    });

    return res.status(201).json({ lead, message: "Renewal enquiry received." });
  } catch {
    return res.status(500).json({ error: "Failed to submit renewal enquiry" });
  }
});

insuranceRoutes.post("/handoff/request", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const name = typeof (req.body as any)?.name === "string" ? (req.body as any).name : "";
  const phone = typeof (req.body as any)?.phone === "string" ? (req.body as any).phone : "";

  if (name.trim().length < 2 || phone.trim().length < 5) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const lead = await service.handoffRequest(tenantId, {
      policyType: typeof (req.body as any)?.policyType === "string" ? (req.body as any).policyType : undefined,
      name,
      phone,
      email: typeof (req.body as any)?.email === "string" ? (req.body as any).email : undefined,
      notes: typeof (req.body as any)?.notes === "string" ? (req.body as any).notes : undefined,
    });

    return res.status(201).json({ lead, message: "Callback request received." });
  } catch {
    return res.status(500).json({ error: "Failed to submit handoff request" });
  }
});
