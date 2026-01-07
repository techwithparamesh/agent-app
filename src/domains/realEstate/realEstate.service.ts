import { drizzle } from "drizzle-orm/mysql2";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { pool } from "../../../server/db";
import {
  realEstateListings,
  realEstateLocations,
  realEstateVisits,
  realEstatePropertyDrafts,
  realEstatePropertySyncConfigs,
} from "./realEstate.schema";
import type {
  CreatePropertyDraftInput,
  CreateVisitInput,
  ListingAvailabilityResult,
  ListingSearchParams,
  RealEstateListing,
  RealEstateLocation,
  RealEstatePropertyDraft,
  RealEstatePropertySyncConfig,
  RealEstateVisit,
  TenantId,
  PropertySyncSourceType,
  PropertySyncNowInput,
  PropertyDraftStatus,
} from "./realEstate.types";

const db = drizzle(pool, {
  schema: {
    realEstateListings,
    realEstateLocations,
    realEstateVisits,
    realEstatePropertyDrafts,
    realEstatePropertySyncConfigs,
  },
  mode: "default",
});

function stripHtml(input: string): string {
  const withoutTags = input.replace(/<[^>]*>/g, " ");
  const withoutEntities = withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'");
  return withoutEntities.replace(/\s+/g, " ").trim();
}

function parsePriceToNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const cleaned = value.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const withProtocol = raw.match(/^https?:\/\//i) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class RealEstateService {
  async getPropertySyncConfig(
    tenantId: TenantId,
    agentId: string
  ): Promise<RealEstatePropertySyncConfig | null> {
    const [row] = await db
      .select()
      .from(realEstatePropertySyncConfigs)
      .where(and(eq(realEstatePropertySyncConfigs.tenantId, tenantId), eq(realEstatePropertySyncConfigs.agentId, agentId)))
      .limit(1);

    return (row as unknown as RealEstatePropertySyncConfig) ?? null;
  }

  async upsertPropertySyncConfig(
    tenantId: TenantId,
    agentId: string,
    input: {
      sourceType: PropertySyncSourceType;
      websiteUrl?: string | null;
      apiEndpoint?: string | null;
      credentialId?: string | null;
      touchLastSynced?: boolean;
    }
  ): Promise<RealEstatePropertySyncConfig> {
    const existing = await this.getPropertySyncConfig(tenantId, agentId);

    const updateValues = {
      sourceType: input.sourceType,
      websiteUrl: input.websiteUrl ?? null,
      apiEndpoint: input.apiEndpoint ?? null,
      credentialId: input.credentialId ?? null,
      lastSyncedAt: input.touchLastSynced ? new Date() : existing?.lastSyncedAt ?? null,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(realEstatePropertySyncConfigs)
        .set(updateValues as any)
        .where(and(eq(realEstatePropertySyncConfigs.tenantId, tenantId), eq(realEstatePropertySyncConfigs.agentId, agentId)));

      return (await this.getPropertySyncConfig(tenantId, agentId)) as RealEstatePropertySyncConfig;
    }

    const insertValues = {
      tenantId,
      agentId,
      sourceType: input.sourceType,
      websiteUrl: input.websiteUrl ?? null,
      apiEndpoint: input.apiEndpoint ?? null,
      credentialId: input.credentialId ?? null,
      lastSyncedAt: input.touchLastSynced ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result: any = await db.insert(realEstatePropertySyncConfigs).values(insertValues as any);
    const insertedId: number | undefined =
      typeof result?.[0]?.insertId === "number"
        ? result[0].insertId
        : typeof result?.insertId === "number"
          ? result.insertId
          : undefined;

    const [row] = await db
      .select()
      .from(realEstatePropertySyncConfigs)
      .where(
        insertedId
          ? and(
              eq(realEstatePropertySyncConfigs.tenantId, tenantId),
              eq(realEstatePropertySyncConfigs.agentId, agentId),
              eq(realEstatePropertySyncConfigs.id, insertedId)
            )
          : and(eq(realEstatePropertySyncConfigs.tenantId, tenantId), eq(realEstatePropertySyncConfigs.agentId, agentId))
      )
      .limit(1);

    return row as unknown as RealEstatePropertySyncConfig;
  }

  async updateAutoSyncEnabled(
    tenantId: TenantId,
    agentId: string,
    autoSyncEnabled: boolean
  ): Promise<{ success: boolean }> {
    const existing = await this.getPropertySyncConfig(tenantId, agentId);
    if (!existing) {
      return { success: false };
    }

    await db
      .update(realEstatePropertySyncConfigs)
      .set({ autoSyncEnabled, updatedAt: new Date() })
      .where(
        and(
          eq(realEstatePropertySyncConfigs.tenantId, tenantId),
          eq(realEstatePropertySyncConfigs.agentId, agentId)
        )
      );

    return { success: true };
  }

  async getAutoSyncEnabledConfigs(): Promise<RealEstatePropertySyncConfig[]> {
    const rows = await db
      .select()
      .from(realEstatePropertySyncConfigs)
      .where(eq(realEstatePropertySyncConfigs.autoSyncEnabled, true));

    return rows as unknown as RealEstatePropertySyncConfig[];
  }

  private async importDrafts(
    tenantId: TenantId,
    agentId: string,
    drafts: Array<{
      externalPropertyId: string;
      title: string;
      propertyType?: string | null;
      city: string;
      area?: string | null;
      price: number;
      bedrooms?: string | null;
      description?: string | null;
    }>
  ): Promise<{ imported: number; skipped: number; removed: number; reactivated: number }> {
    if (drafts.length === 0) {
      // Handle case where website returns no properties - mark all existing as removed
      const existingDrafts = await db
        .select()
        .from(realEstatePropertyDrafts)
        .where(and(
          eq(realEstatePropertyDrafts.tenantId, tenantId),
          eq(realEstatePropertyDrafts.agentId, agentId),
          eq(realEstatePropertyDrafts.status, "active")
        ));

      let removed = 0;
      for (const draft of existingDrafts) {
        if ((draft as any).externalPropertyId) {
          await this.markPropertyAsRemoved(tenantId, agentId, (draft as any).id);
          removed++;
        }
      }

      return { imported: 0, skipped: 0, removed, reactivated: 0 };
    }

    const externalIds = Array.from(new Set(drafts.map((d) => d.externalPropertyId))).slice(0, 500);
    const fetchedExternalIdSet = new Set(externalIds);

    // Get all existing drafts for this agent (both active and removed)
    const existingRows = await db
      .select()
      .from(realEstatePropertyDrafts)
      .where(and(
        eq(realEstatePropertyDrafts.tenantId, tenantId),
        eq(realEstatePropertyDrafts.agentId, agentId)
      ));

    const existingByExternalId = new Map<string, any>();
    for (const row of existingRows) {
      const extId = (row as any).externalPropertyId;
      if (typeof extId === "string") {
        existingByExternalId.set(extId, row);
      }
    }

    let imported = 0;
    let skipped = 0;
    let reactivated = 0;

    // Import new properties and reactivate removed ones that reappeared
    for (const d of drafts) {
      const existing = existingByExternalId.get(d.externalPropertyId);

      if (existing) {
        const status = (existing as any).status as string;
        if (status === "removed_from_website") {
          // Property reappeared - reactivate it
          await this.reactivateProperty(tenantId, agentId, (existing as any).id, d);
          reactivated++;
        } else {
          skipped++;
        }
        continue;
      }

      // New property - auto-enable for AI
      const listingResult: any = await db.insert(realEstateListings).values({
        tenantId,
        title: d.title,
        city: d.city,
        area: d.area ?? null,
        type: d.propertyType ?? null,
        price: String(d.price),
        available: true,
        locationSlug: null,
      } as any);

      const listingId: number | undefined =
        typeof listingResult?.[0]?.insertId === "number"
          ? listingResult[0].insertId
          : typeof listingResult?.insertId === "number"
            ? listingResult.insertId
            : undefined;

      await db.insert(realEstatePropertyDrafts).values({
        tenantId,
        agentId,
        externalPropertyId: d.externalPropertyId,
        title: d.title,
        propertyType: d.propertyType ?? null,
        city: d.city,
        area: d.area ?? null,
        price: String(d.price),
        bedrooms: d.bedrooms ?? null,
        description: d.description ?? null,
        aiEnabled: true,
        listingId: listingId ?? null,
        status: "active",
      } as any);

      imported++;
    }

    // Mark properties that are no longer on the website as removed
    let removed = 0;
    for (const [extId, existing] of existingByExternalId) {
      if (!fetchedExternalIdSet.has(extId) && (existing as any).status === "active") {
        await this.markPropertyAsRemoved(tenantId, agentId, (existing as any).id);
        removed++;
      }
    }

    return { imported, skipped, removed, reactivated };
  }

  private async markPropertyAsRemoved(
    tenantId: TenantId,
    agentId: string,
    draftId: number
  ): Promise<void> {
    const [draft] = await db
      .select()
      .from(realEstatePropertyDrafts)
      .where(
        and(
          eq(realEstatePropertyDrafts.tenantId, tenantId),
          eq(realEstatePropertyDrafts.agentId, agentId),
          eq(realEstatePropertyDrafts.id, draftId)
        )
      )
      .limit(1);

    if (!draft) return;

    const listingId = (draft as any).listingId as number | null;

    // Remove from listings to hide from AI
    if (listingId) {
      await db
        .delete(realEstateListings)
        .where(
          and(
            eq(realEstateListings.tenantId, tenantId),
            eq(realEstateListings.id, listingId)
          )
        );
    }

    await db
      .update(realEstatePropertyDrafts)
      .set({
        aiEnabled: false,
        listingId: null,
        status: "removed_from_website",
      })
      .where(
        and(
          eq(realEstatePropertyDrafts.tenantId, tenantId),
          eq(realEstatePropertyDrafts.agentId, agentId),
          eq(realEstatePropertyDrafts.id, draftId)
        )
      );
  }

  private async reactivateProperty(
    tenantId: TenantId,
    agentId: string,
    draftId: number,
    propertyData: {
      title: string;
      propertyType?: string | null;
      city: string;
      area?: string | null;
      price: number;
      bedrooms?: string | null;
      description?: string | null;
    }
  ): Promise<void> {
    // Create new listing
    const listingResult: any = await db.insert(realEstateListings).values({
      tenantId,
      title: propertyData.title,
      city: propertyData.city,
      area: propertyData.area ?? null,
      type: propertyData.propertyType ?? null,
      price: String(propertyData.price),
      available: true,
      locationSlug: null,
    } as any);

    const listingId: number | undefined =
      typeof listingResult?.[0]?.insertId === "number"
        ? listingResult[0].insertId
        : typeof listingResult?.insertId === "number"
          ? listingResult.insertId
          : undefined;

    // Update draft with new data and reactivate
    await db
      .update(realEstatePropertyDrafts)
      .set({
        title: propertyData.title,
        propertyType: propertyData.propertyType ?? null,
        city: propertyData.city,
        area: propertyData.area ?? null,
        price: String(propertyData.price),
        bedrooms: propertyData.bedrooms ?? null,
        description: propertyData.description ?? null,
        aiEnabled: true,
        listingId: listingId ?? null,
        status: "active",
      })
      .where(
        and(
          eq(realEstatePropertyDrafts.tenantId, tenantId),
          eq(realEstatePropertyDrafts.agentId, agentId),
          eq(realEstatePropertyDrafts.id, draftId)
        )
      );
  }

  private async fetchWordPressProperties(
    websiteUrl: string
  ): Promise<
    Array<{
      externalPropertyId: string;
      title: string;
      propertyType?: string | null;
      city: string;
      area?: string | null;
      price: number;
      bedrooms?: string | null;
      description?: string | null;
    }>
  > {
    const normalized = normalizeUrl(websiteUrl);
    if (!normalized) return [];

    const base = new URL(normalized);
    const apiBase = `${base.origin}/wp-json/wp/v2`;

    const typesRes = await fetch(`${apiBase}/types`, { headers: { Accept: "application/json" } });
    if (!typesRes.ok) return [];
    const typesJson: any = await typesRes.json();
    const types: any[] = Object.values(typesJson || {});

    const candidates = types
      .filter((t) => t && typeof t === "object")
      .filter((t) => {
        const name = String(t.name || "").toLowerCase();
        const slug = String(t.slug || "").toLowerCase();
        const restBase = String(t.rest_base || "").toLowerCase();
        return [name, slug, restBase].some((s) => s.includes("property") || s.includes("listing") || s.includes("estate"));
      })
      .slice(0, 3);

    if (candidates.length === 0) return [];

    const results: any[] = [];
    for (const t of candidates) {
      const restBase = String(t.rest_base || "").trim();
      if (!restBase) continue;

      for (let page = 1; page <= 5; page++) {
        const url = `${apiBase}/${restBase}?per_page=100&page=${page}`;
        const r = await fetch(url, { headers: { Accept: "application/json" } });
        if (!r.ok) break;
        const items: any[] = await r.json();
        if (!Array.isArray(items) || items.length === 0) break;
        results.push(...items.map((it) => ({ type: restBase, item: it })));
        if (items.length < 100) break;
      }
    }

    const mapped: any[] = [];
    for (const entry of results) {
      const restBase = String(entry.type);
      const it = entry.item || {};
      const id = it.id;
      if (typeof id !== "number") continue;

      const title = stripHtml(String(it?.title?.rendered || "")).trim();
      const description = stripHtml(String(it?.content?.rendered || "")).trim();

      const meta = (it?.meta && typeof it.meta === "object") ? it.meta : {};
      const acf = (it?.acf && typeof it.acf === "object") ? it.acf : {};
      const get = (key: string) => (acf?.[key] ?? meta?.[key] ?? it?.[key] ?? null);

      const city = String(get("city") || get("location_city") || "").trim();
      const area = String(get("area") || get("location_area") || "").trim();
      const propertyType = String(get("property_type") || get("type") || "").trim();
      const bedrooms = String(get("bedrooms") || get("bhk") || "").trim();
      const priceRaw = get("price") || get("amount") || get("cost");
      const price = parsePriceToNumber(priceRaw);

      if (!title || !city || !price) continue;

      mapped.push({
        externalPropertyId: `wp:${restBase}:${id}`,
        title,
        propertyType: propertyType || null,
        city,
        area: area || null,
        price,
        bedrooms: bedrooms || null,
        description: description || null,
      });
    }

    return mapped;
  }

  private async fetchCustomApiProperties(
    apiEndpoint: string,
    apiKey?: string
  ): Promise<
    Array<{
      externalPropertyId: string;
      title: string;
      propertyType?: string | null;
      city: string;
      area?: string | null;
      price: number;
      bedrooms?: string | null;
      description?: string | null;
    }>
  > {
    const normalized = normalizeUrl(apiEndpoint);
    if (!normalized) return [];

    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey && apiKey.trim()) {
      headers.Authorization = `Bearer ${apiKey.trim()}`;
    }

    const r = await fetch(normalized, { headers });
    if (!r.ok) return [];
    const json: any = await r.json();

    const items: any[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.properties)
        ? json.properties
        : Array.isArray(json?.items)
          ? json.items
          : [];

    const mapped: any[] = [];
    for (const it of items) {
      if (!it || typeof it !== "object") continue;

      const externalId = String(it.external_property_id ?? it.externalPropertyId ?? it.externalId ?? it.id ?? "").trim();
      const title = String(it.title ?? it.name ?? "").trim();
      const city = String(it.city ?? "").trim();
      const area = String(it.area ?? "").trim();
      const propertyType = String(it.property_type ?? it.propertyType ?? it.type ?? "").trim();
      const bedrooms = String(it.bedrooms ?? it.bhk ?? "").trim();
      const price = parsePriceToNumber(it.price ?? it.amount ?? it.cost);
      const description = String(it.description ?? "").trim();

      if (!externalId || !title || !city || !price) continue;

      mapped.push({
        externalPropertyId: `api:${externalId}`,
        title,
        propertyType: propertyType || null,
        city,
        area: area || null,
        price,
        bedrooms: bedrooms || null,
        description: description || null,
      });
    }

    return mapped;
  }

  async syncPropertiesNow(
    tenantId: TenantId,
    agentId: string,
    input: PropertySyncNowInput
  ): Promise<{ imported: number; skipped: number; fetched: number; removed: number; reactivated: number }> {
    const sourceType = input.sourceType;

    if (sourceType === "wordpress") {
      const websiteUrl = typeof input.websiteUrl === "string" ? input.websiteUrl : "";
      const fetched = await this.fetchWordPressProperties(websiteUrl);
      const result = await this.importDrafts(tenantId, agentId, fetched);
      await this.upsertPropertySyncConfig(tenantId, agentId, {
        sourceType,
        websiteUrl: websiteUrl || null,
        apiEndpoint: null,
        credentialId: null,
        touchLastSynced: true,
      });
      return { ...result, fetched: fetched.length };
    }

    if (sourceType === "custom_api") {
      const apiEndpoint = typeof input.apiEndpoint === "string" ? input.apiEndpoint : "";
      const fetched = await this.fetchCustomApiProperties(apiEndpoint, input.apiKey);
      const result = await this.importDrafts(tenantId, agentId, fetched);
      await this.upsertPropertySyncConfig(tenantId, agentId, {
        sourceType,
        websiteUrl: null,
        apiEndpoint: apiEndpoint || null,
        credentialId: typeof input.credentialId === "string" ? input.credentialId : null,
        touchLastSynced: true,
      });
      return { ...result, fetched: fetched.length };
    }

    await this.upsertPropertySyncConfig(tenantId, agentId, {
      sourceType: "unknown",
      websiteUrl: typeof input.websiteUrl === "string" ? input.websiteUrl : null,
      apiEndpoint: null,
      credentialId: null,
      touchLastSynced: true,
    });

    return { imported: 0, skipped: 0, fetched: 0, removed: 0, reactivated: 0 };
  }

  async searchListings(tenantId: TenantId, params: ListingSearchParams): Promise<RealEstateListing[]> {
    const limit = clampNumber(params.limit ?? 20, 1, 100);
    const offset = Math.max(0, params.offset ?? 0);

    const conditions = [eq(realEstateListings.tenantId, tenantId)];

    if (typeof params.available === "boolean") {
      conditions.push(eq(realEstateListings.available, params.available));
    }

    if (params.city && params.city.trim().length > 0) {
      conditions.push(eq(realEstateListings.city, params.city.trim()));
    }

    if (params.area && params.area.trim().length > 0) {
      conditions.push(eq(realEstateListings.area, params.area.trim()));
    }

    if (params.type && params.type.trim().length > 0) {
      conditions.push(eq(realEstateListings.type, params.type.trim()));
    }

    if (params.locationSlug && params.locationSlug.trim().length > 0) {
      conditions.push(eq(realEstateListings.locationSlug, params.locationSlug.trim()));
    }

    if (typeof params.minPrice === "number" && Number.isFinite(params.minPrice)) {
      conditions.push(sql`${realEstateListings.price} >= ${params.minPrice}`);
    }

    if (typeof params.maxPrice === "number" && Number.isFinite(params.maxPrice)) {
      conditions.push(sql`${realEstateListings.price} <= ${params.maxPrice}`);
    }

    const q = params.q?.trim();
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(
        or(
          like(realEstateListings.title, pattern),
          like(realEstateListings.city, pattern),
          like(realEstateListings.area, pattern),
          like(realEstateListings.type, pattern)
        )!
      );
    }

    const rows = await db
      .select()
      .from(realEstateListings)
      .where(and(...conditions))
      .orderBy(desc(realEstateListings.createdAt))
      .limit(limit)
      .offset(offset);

    return rows as unknown as RealEstateListing[];
  }

  async getListingById(tenantId: TenantId, id: number): Promise<RealEstateListing | null> {
    const [row] = await db
      .select()
      .from(realEstateListings)
      .where(and(eq(realEstateListings.tenantId, tenantId), eq(realEstateListings.id, id)))
      .limit(1);

    return (row as unknown as RealEstateListing) ?? null;
  }

  async getListingAvailability(tenantId: TenantId, id: number): Promise<ListingAvailabilityResult> {
    const listing = await this.getListingById(tenantId, id);
    if (!listing) {
      return { found: false, listingId: id, available: false };
    }
    return { found: true, listingId: id, available: Boolean(listing.available) };
  }

  async getSimilarListings(tenantId: TenantId, id: number, limit: number = 10): Promise<RealEstateListing[]> {
    const base = await this.getListingById(tenantId, id);
    if (!base) return [];

    const safeLimit = clampNumber(limit, 1, 20);

    const conditions = [
      eq(realEstateListings.tenantId, tenantId),
      sql`${realEstateListings.id} <> ${id}`,
    ];

    if (base.locationSlug) {
      conditions.push(eq(realEstateListings.locationSlug, base.locationSlug));
    } else {
      conditions.push(eq(realEstateListings.city, base.city));
    }

    if (base.type) {
      conditions.push(eq(realEstateListings.type, base.type));
    }

    const rows = await db
      .select()
      .from(realEstateListings)
      .where(and(...conditions))
      .orderBy(desc(realEstateListings.available), desc(realEstateListings.createdAt))
      .limit(safeLimit);

    return rows as unknown as RealEstateListing[];
  }

  async getLocationBySlugScoped(tenantId: TenantId, slug: string): Promise<RealEstateLocation | null> {
    const normalized = slug.trim();
    if (!normalized) return null;

    const [hasTenantListing] = await db
      .select({ id: realEstateListings.id })
      .from(realEstateListings)
      .where(and(eq(realEstateListings.tenantId, tenantId), eq(realEstateListings.locationSlug, normalized)))
      .limit(1);

    if (!hasTenantListing) return null;

    const [row] = await db
      .select()
      .from(realEstateLocations)
      .where(eq(realEstateLocations.slug, normalized))
      .limit(1);

    return (row as unknown as RealEstateLocation) ?? null;
  }

  async createVisit(tenantId: TenantId, input: CreateVisitInput): Promise<RealEstateVisit | null> {
    const listing = await this.getListingById(tenantId, input.listingId);
    if (!listing) return null;

    const insertValues = {
      tenantId,
      listingId: input.listingId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      preferredDate: input.preferredDate?.trim() || null,
      preferredTime: input.preferredTime?.trim() || null,
    };

    const result: any = await db.insert(realEstateVisits).values(insertValues as any);

    const insertedId: number | undefined =
      typeof result?.[0]?.insertId === "number"
        ? result[0].insertId
        : typeof result?.insertId === "number"
          ? result.insertId
          : undefined;

    if (!insertedId) return null;

    const [row] = await db
      .select()
      .from(realEstateVisits)
      .where(and(eq(realEstateVisits.tenantId, tenantId), eq(realEstateVisits.id, insertedId)))
      .limit(1);

    return (row as unknown as RealEstateVisit) ?? null;
  }

  async createPropertyDraft(
    tenantId: TenantId,
    agentId: string,
    input: CreatePropertyDraftInput
  ): Promise<RealEstatePropertyDraft | null> {
    const insertValues = {
      tenantId,
      agentId,
      title: input.title.trim(),
      propertyType: input.propertyType?.trim() || null,
      city: input.city.trim(),
      area: input.area?.trim() || null,
      price: String(input.price),
      bedrooms: input.bedrooms?.trim() || null,
      description: input.description?.trim() || null,
      status: "pending" as const,
    };

    const result: any = await db.insert(realEstatePropertyDrafts).values(insertValues as any);

    const insertedId: number | undefined =
      typeof result?.[0]?.insertId === "number"
        ? result[0].insertId
        : typeof result?.insertId === "number"
          ? result.insertId
          : undefined;

    if (!insertedId) return null;

    const [row] = await db
      .select()
      .from(realEstatePropertyDrafts)
      .where(
        and(
          eq(realEstatePropertyDrafts.tenantId, tenantId),
          eq(realEstatePropertyDrafts.agentId, agentId),
          eq(realEstatePropertyDrafts.id, insertedId)
        )
      )
      .limit(1);

    return (row as unknown as RealEstatePropertyDraft) ?? null;
  }

  async getPropertyDrafts(
    tenantId: TenantId,
    agentId: string,
    aiEnabled?: boolean
  ): Promise<RealEstatePropertyDraft[]> {
    const conditions = [
      eq(realEstatePropertyDrafts.tenantId, tenantId),
      eq(realEstatePropertyDrafts.agentId, agentId),
    ];

    if (typeof aiEnabled === "boolean") {
      conditions.push(eq(realEstatePropertyDrafts.aiEnabled, aiEnabled));
    }

    const rows = await db
      .select()
      .from(realEstatePropertyDrafts)
      .where(and(...conditions))
      .orderBy(desc(realEstatePropertyDrafts.createdAt));

    return rows as unknown as RealEstatePropertyDraft[];
  }

  async getPropertyDraftById(
    tenantId: TenantId,
    agentId: string,
    draftId: number
  ): Promise<RealEstatePropertyDraft | null> {
    const [row] = await db
      .select()
      .from(realEstatePropertyDrafts)
      .where(
        and(
          eq(realEstatePropertyDrafts.tenantId, tenantId),
          eq(realEstatePropertyDrafts.agentId, agentId),
          eq(realEstatePropertyDrafts.id, draftId)
        )
      )
      .limit(1);

    return (row as unknown as RealEstatePropertyDraft) ?? null;
  }

  async enableAiForProperty(
    tenantId: TenantId,
    agentId: string,
    draftId: number
  ): Promise<{ success: boolean; listingId?: number; error?: string }> {
    try {
      return await db.transaction(async (tx) => {
        const [draft] = await tx
          .select()
          .from(realEstatePropertyDrafts)
          .where(
            and(
              eq(realEstatePropertyDrafts.tenantId, tenantId),
              eq(realEstatePropertyDrafts.agentId, agentId),
              eq(realEstatePropertyDrafts.id, draftId)
            )
          )
          .limit(1);

        if (!draft) {
          return { success: false as const, error: "Property not found" };
        }

        if ((draft as any).aiEnabled === true) {
          return { success: true as const, listingId: (draft as any).listingId ?? undefined };
        }

        // Insert into listings to make visible to AI
        const insertResult: any = await tx.insert(realEstateListings).values({
          tenantId,
          title: (draft as any).title,
          city: (draft as any).city,
          area: (draft as any).area ?? null,
          type: (draft as any).propertyType ?? null,
          price: (draft as any).price,
          available: true,
          locationSlug: null,
        } as any);

        const listingId: number | undefined =
          typeof insertResult?.[0]?.insertId === "number"
            ? insertResult[0].insertId
            : typeof insertResult?.insertId === "number"
              ? insertResult.insertId
              : undefined;

        if (!listingId) {
          return { success: false as const, error: "Failed to create listing" };
        }

        await tx
          .update(realEstatePropertyDrafts)
          .set({ aiEnabled: true, listingId, status: "active" })
          .where(
            and(
              eq(realEstatePropertyDrafts.tenantId, tenantId),
              eq(realEstatePropertyDrafts.agentId, agentId),
              eq(realEstatePropertyDrafts.id, draftId)
            )
          );

        return { success: true as const, listingId };
      });
    } catch (err) {
      return { success: false, error: "Failed to enable AI for property" };
    }
  }

  async disableAiForProperty(
    tenantId: TenantId,
    agentId: string,
    draftId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await db.transaction(async (tx) => {
        const [draft] = await tx
          .select()
          .from(realEstatePropertyDrafts)
          .where(
            and(
              eq(realEstatePropertyDrafts.tenantId, tenantId),
              eq(realEstatePropertyDrafts.agentId, agentId),
              eq(realEstatePropertyDrafts.id, draftId)
            )
          )
          .limit(1);

        if (!draft) {
          return { success: false as const, error: "Property not found" };
        }

        if ((draft as any).aiEnabled === false) {
          return { success: true as const };
        }

        const listingId = (draft as any).listingId as number | null;

        // Remove from listings to hide from AI
        if (listingId) {
          await tx
            .delete(realEstateListings)
            .where(
              and(
                eq(realEstateListings.tenantId, tenantId),
                eq(realEstateListings.id, listingId)
              )
            );
        }

        await tx
          .update(realEstatePropertyDrafts)
          .set({ aiEnabled: false, listingId: null })
          .where(
            and(
              eq(realEstatePropertyDrafts.tenantId, tenantId),
              eq(realEstatePropertyDrafts.agentId, agentId),
              eq(realEstatePropertyDrafts.id, draftId)
            )
          );

        return { success: true as const };
      });
    } catch (err) {
      return { success: false, error: "Failed to disable AI for property" };
    }
  }
}
