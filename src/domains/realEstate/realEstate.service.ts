import { drizzle } from "drizzle-orm/mysql2";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { pool } from "../../../server/db";
import {
  realEstateListings,
  realEstateLocations,
  realEstateVisits,
} from "./realEstate.schema";
import type {
  CreateVisitInput,
  ListingAvailabilityResult,
  ListingSearchParams,
  RealEstateListing,
  RealEstateLocation,
  RealEstateVisit,
  TenantId,
} from "./realEstate.types";

const db = drizzle(pool, {
  schema: {
    realEstateListings,
    realEstateLocations,
    realEstateVisits,
  },
  mode: "default",
});

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class RealEstateService {
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
}
