import { Router } from "express";
import type { Request, Response } from "express";
import { RealEstateService } from "./realEstate.service";
import { storage } from "../../../server/storage";
import { decrypt, encrypt } from "../../../server/utils/encryption";

function getTenantId(req: Request): string | null {
  // First check session-based auth (local login) - this is most reliable in production
  const sessionUserId = (req as any)?.session?.userId;
  if (typeof sessionUserId === "string" && sessionUserId.length > 0) {
    return sessionUserId;
  }
  
  // Fall back to user object set by middleware
  const user = (req as any)?.user;
  const tenantId = user?.claims?.sub ?? user?.id;
  return typeof tenantId === "string" && tenantId.length > 0 ? tenantId : null;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return undefined;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

const service = new RealEstateService();

export const realEstateRoutes = Router();

// Base path (for mounting): /api/domains/real-estate

realEstateRoutes.get("/property-sync/config", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ message: "Unauthorized" });

  const agentId = typeof req.query.agentId === "string" ? req.query.agentId.trim() : "";
  if (!agentId) return res.status(400).json({ message: "agentId query param is required" });

  const agent = await storage.getAgentById(agentId);
  if (!agent) return res.status(404).json({ message: "Agent not found" });
  if (agent.userId !== tenantId) return res.status(403).json({ message: "Forbidden" });

  try {
    const config = await service.getPropertySyncConfig(tenantId, agentId);
    const hasApiKey = Boolean(config?.credentialId);
    return res.json({
      config: config
        ? {
            sourceType: (config as any).sourceType,
            websiteUrl: (config as any).websiteUrl,
            apiEndpoint: (config as any).apiEndpoint,
            lastSyncedAt: (config as any).lastSyncedAt,
            hasApiKey,
          }
        : null,
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch sync config" });
  }
});

realEstateRoutes.post("/property-sync/sync", async (req: Request, res: Response) => {
  const user = (req as any)?.user;
  console.log("[PropertySync] user object:", JSON.stringify(user));
  const tenantId = getTenantId(req);
  console.log("[PropertySync] extracted tenantId:", tenantId);
  if (!tenantId) return res.status(401).json({ message: "Unauthorized" });

  const agentId = typeof (req.body as any)?.agentId === "string" ? (req.body as any).agentId.trim() : "";
  const sourceType = typeof (req.body as any)?.sourceType === "string" ? (req.body as any).sourceType.trim() : "";
  const websiteUrl = typeof (req.body as any)?.websiteUrl === "string" ? (req.body as any).websiteUrl : undefined;
  const apiEndpoint = typeof (req.body as any)?.apiEndpoint === "string" ? (req.body as any).apiEndpoint : undefined;
  const apiKey = typeof (req.body as any)?.apiKey === "string" ? (req.body as any).apiKey : undefined;

  if (!agentId) return res.status(400).json({ message: "agentId is required" });
  if (!sourceType || !["wordpress", "custom_api", "unknown"].includes(sourceType)) {
    return res.status(400).json({ message: "Invalid sourceType" });
  }

  const agent = await storage.getAgentById(agentId);
  console.log("[PropertySync] agent lookup - agentId:", agentId, "found:", !!agent, "agent.userId:", agent?.userId, "tenantId:", tenantId, "match:", agent?.userId === tenantId);
  if (!agent) return res.status(404).json({ message: "Agent not found" });
  if (agent.userId !== tenantId) return res.status(403).json({ message: "Forbidden" });

  let credentialId: string | undefined;
  let resolvedApiKey: string | undefined = apiKey;

  if (sourceType === "custom_api") {
    const appId = `real_estate_property_sync:${agentId}`;
    const existing = await storage.getCredentialByUserAndApp(tenantId, appId);

    if (typeof apiKey === "string" && apiKey.trim().length > 0) {
      const encryptedData = encrypt(JSON.stringify({ apiKey: apiKey.trim() }));
      if (existing) {
        await storage.updateCredential(existing.id, {
          name: existing.name || `Property Sync (${agentId})`,
          credentialType: existing.credentialType || "api_key",
          encryptedData,
          isValid: true,
        } as any);
        credentialId = existing.id;
      } else {
        const created = await storage.createCredential(tenantId, {
          name: `Property Sync (${agentId})`,
          appId,
          credentialType: "api_key",
          encryptedData,
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        credentialId = created.id;
      }
      resolvedApiKey = apiKey.trim();
    } else if (existing?.encryptedData) {
      credentialId = existing.id;
      const decrypted = decrypt(String(existing.encryptedData));
      try {
        const parsed = JSON.parse(decrypted || "{}");
        if (typeof parsed?.apiKey === "string") {
          resolvedApiKey = parsed.apiKey;
        }
      } catch {
        // ignore
      }
    }
  }

  try {
    const result = await service.syncPropertiesNow(tenantId, agentId, {
      sourceType: sourceType as any,
      websiteUrl,
      apiEndpoint,
      apiKey: resolvedApiKey,
      credentialId,
    });

    return res.json({
      imported: result.imported,
      skipped: result.skipped,
      fetched: result.fetched,
      message:
        result.imported > 0
          ? `${result.imported} properties imported for review.`
          : "No new properties were imported.",
    });
  } catch {
    return res.status(500).json({ message: "Failed to sync properties" });
  }
});

realEstateRoutes.get("/listings", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const items = await service.searchListings(tenantId, {
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      city: typeof req.query.city === "string" ? req.query.city : undefined,
      area: typeof req.query.area === "string" ? req.query.area : undefined,
      type: typeof req.query.type === "string" ? req.query.type : undefined,
      locationSlug: typeof req.query.location_slug === "string" ? req.query.location_slug : undefined,
      minPrice: parseNumber(req.query.min_price),
      maxPrice: parseNumber(req.query.max_price),
      available: parseBoolean(req.query.available),
      limit: parseNumber(req.query.limit),
      offset: parseNumber(req.query.offset),
    });

    return res.json({ items });
  } catch {
    return res.status(500).json({ error: "Failed to fetch listings" });
  }
});

realEstateRoutes.get("/listings/:id", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid listing id" });

  try {
    const listing = await service.getListingById(tenantId, id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    return res.json({ listing });
  } catch {
    return res.status(500).json({ error: "Failed to fetch listing" });
  }
});

realEstateRoutes.get("/listings/:id/availability", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid listing id" });

  try {
    const availability = await service.getListingAvailability(tenantId, id);
    if (!availability.found) return res.status(404).json({ error: "Listing not found" });
    return res.json({ availability });
  } catch {
    return res.status(500).json({ error: "Failed to fetch availability" });
  }
});

realEstateRoutes.get("/listings/:id/similar", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid listing id" });

  const limit = parseNumber(req.query.limit);

  try {
    const items = await service.getSimilarListings(tenantId, id, typeof limit === "number" ? limit : 10);
    return res.json({ items });
  } catch {
    return res.status(500).json({ error: "Failed to fetch similar listings" });
  }
});

realEstateRoutes.get("/locations/:slug", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const slug = String(req.params.slug || "");
  if (!slug.trim()) return res.status(400).json({ error: "Invalid location slug" });

  try {
    const location = await service.getLocationBySlugScoped(tenantId, slug);
    if (!location) return res.status(404).json({ error: "Location not found" });
    return res.json({ location });
  } catch {
    return res.status(500).json({ error: "Failed to fetch location" });
  }
});

realEstateRoutes.post("/visits", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const listingId = Number((req.body as any)?.listingId);
  const name = typeof (req.body as any)?.name === "string" ? (req.body as any).name : "";
  const phone = typeof (req.body as any)?.phone === "string" ? (req.body as any).phone : "";
  const preferredDate = typeof (req.body as any)?.preferredDate === "string" ? (req.body as any).preferredDate : undefined;
  const preferredTime = typeof (req.body as any)?.preferredTime === "string" ? (req.body as any).preferredTime : undefined;

  if (!Number.isFinite(listingId)) return res.status(400).json({ error: "Invalid listingId" });
  if (name.trim().length < 2) return res.status(400).json({ error: "Invalid name" });
  if (phone.trim().length < 5) return res.status(400).json({ error: "Invalid phone" });

  try {
    const visit = await service.createVisit(tenantId, {
      listingId,
      name,
      phone,
      preferredDate,
      preferredTime,
    });

    if (!visit) {
      return res.status(404).json({ error: "Listing not found" });
    }

    return res.status(201).json({ visit });
  } catch {
    return res.status(500).json({ error: "Failed to schedule visit" });
  }
});

realEstateRoutes.post("/properties/draft", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const agentId = typeof (req.body as any)?.agentId === "string" ? (req.body as any).agentId.trim() : "";
  const title = typeof (req.body as any)?.title === "string" ? (req.body as any).title : "";
  const propertyType = typeof (req.body as any)?.propertyType === "string" ? (req.body as any).propertyType : undefined;
  const city = typeof (req.body as any)?.city === "string" ? (req.body as any).city : "";
  const area = typeof (req.body as any)?.area === "string" ? (req.body as any).area : undefined;
  const price = parseNumber((req.body as any)?.price);
  const bedrooms = typeof (req.body as any)?.bedrooms === "string" ? (req.body as any).bedrooms : undefined;
  const description = typeof (req.body as any)?.description === "string" ? (req.body as any).description : undefined;

  if (!agentId) return res.status(400).json({ error: "agentId is required" });
  if (title.trim().length < 2) return res.status(400).json({ error: "title is required (min 2 chars)" });
  if (city.trim().length < 2) return res.status(400).json({ error: "city is required (min 2 chars)" });
  if (typeof price !== "number" || price <= 0) return res.status(400).json({ error: "price must be a positive number" });

  try {
    const draft = await service.createPropertyDraft(tenantId, agentId, {
      title,
      propertyType,
      city,
      area,
      price,
      bedrooms,
      description,
    });

    if (!draft) {
      return res.status(500).json({ error: "Failed to create draft" });
    }

    return res.status(201).json({ draft });
  } catch {
    return res.status(500).json({ error: "Failed to create property draft" });
  }
});

realEstateRoutes.get("/properties/drafts", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const agentId = typeof req.query.agentId === "string" ? req.query.agentId.trim() : "";
  const status = typeof req.query.status === "string" ? req.query.status.trim() : undefined;

  if (!agentId) return res.status(400).json({ error: "agentId query param is required" });

  try {
    const drafts = await service.getPropertyDrafts(tenantId, agentId, status);
    return res.json({ drafts });
  } catch {
    return res.status(500).json({ error: "Failed to fetch drafts" });
  }
});

realEstateRoutes.post("/properties/:id/approve", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const draftId = Number(req.params.id);
  if (!Number.isFinite(draftId)) return res.status(400).json({ error: "Invalid draft id" });

  const agentId = typeof (req.body as any)?.agentId === "string" ? (req.body as any).agentId.trim() : "";
  if (!agentId) return res.status(400).json({ error: "agentId is required" });

  try {
    const result = await service.approvePropertyDraft(tenantId, agentId, draftId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true, listingId: result.listingId });
  } catch {
    return res.status(500).json({ error: "Failed to approve draft" });
  }
});

realEstateRoutes.post("/properties/:id/reject", async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  if (!tenantId) return res.status(401).json({ error: "Unauthorized" });

  const draftId = Number(req.params.id);
  if (!Number.isFinite(draftId)) return res.status(400).json({ error: "Invalid draft id" });

  const agentId = typeof (req.body as any)?.agentId === "string" ? (req.body as any).agentId.trim() : "";
  if (!agentId) return res.status(400).json({ error: "agentId is required" });

  try {
    const result = await service.rejectPropertyDraft(tenantId, agentId, draftId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to reject draft" });
  }
});
