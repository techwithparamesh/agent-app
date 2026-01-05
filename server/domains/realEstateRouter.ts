import type { DomainExecutionPlan, DomainRequestContext } from "@shared/domainFramework";
import { getPolicy } from "./policies";
import type { DomainRouter } from "./router";

// Broad set of keywords to detect real estate queries
const REAL_ESTATE_KEYWORDS = [
  // Property types
  "apartment", "flat", "villa", "house", "home", "bungalow", "penthouse",
  "duplex", "studio", "farmhouse", "cottage", "mansion", "condo", "townhouse",
  // BHK variants
  "bhk", "1bhk", "2bhk", "3bhk", "4bhk", "1 bhk", "2 bhk", "3 bhk", "4 bhk",
  "bedroom", "bedrooms", "room", "rooms",
  // Transaction types
  "property", "properties", "listing", "listings",
  "rent", "rental", "lease", "buy", "purchase", "sale", "sell", "selling",
  // Land
  "plot", "land", "site", "acre", "sq ft", "sqft", "square feet", "square foot",
  // Commercial
  "office", "shop", "commercial", "warehouse", "godown",
  // Actions
  "looking for", "searching", "find", "show", "available", "vacancy", "vacant",
  "visit", "viewing", "site visit", "tour",
  // Price related
  "price", "cost", "budget", "lakh", "lakhs", "crore", "crores", "lac", "lacs",
  // Location hints
  "near", "nearby", "close to", "location", "area", "locality", "neighborhood",
];

export class RealEstateDomainRouter implements DomainRouter {
  async plan(ctx: DomainRequestContext): Promise<DomainExecutionPlan | null> {
    const text = ctx.messageText.toLowerCase();
    const looksLikeRealEstate = REAL_ESTATE_KEYWORDS.some((k) => text.includes(k));
    if (!looksLikeRealEstate) return null;

    const entities: Record<string, unknown> = {
      ...extractListingId(text),
      ...extractPriceRange(text),
      ...extractLocationHints(text),
      ...extractPropertyType(text),
      ...extractBedrooms(text),
    };

    const intent = detectIntent(text, entities);

    return {
      domain: "real_estate",
      intent,
      entities,
      policy: getPolicy("real_estate", intent),
    };
  }
}

function detectIntent(text: string, entities: Record<string, unknown>): DomainExecutionPlan["intent"] {
  const hasListingId = typeof entities.listingId === "number";

  // Schedule visit - only if explicitly requesting AND has a listing ID
  if (hasListingId && (text.includes("schedule") || text.includes("book") || text.includes("appointment"))) {
    return "schedule_visit";
  }

  // Availability check - only with listing ID
  if (hasListingId && (text.includes("available") || text.includes("availability") || text.includes("vacant"))) {
    return "availability_check";
  }

  // Similar properties - only with listing ID
  if (hasListingId && (text.includes("similar") || text.includes("like this") || text.includes("alternatives"))) {
    return "similar_properties";
  }

  // Property details - only with explicit listing ID
  if (hasListingId) {
    return "property_details";
  }

  // Everything else is a search - this is the default and most common case
  // Whether user says "show me villas", "villa details", "2bhk in city", etc.
  return "listing_search";
}

function extractListingId(text: string): Record<string, unknown> {
  // Match patterns like: listing #123, property 456, id 789, #123
  const m = text.match(/(?:listing|property|id)\s*#?\s*(\d{1,10})/i) || text.match(/#(\d{1,10})/);
  if (!m) return {};
  const listingId = Number(m[1]);
  return Number.isFinite(listingId) ? { listingId } : {};
}

function extractPropertyType(text: string): Record<string, unknown> {
  const types: Record<string, string> = {
    villa: "villa",
    apartment: "apartment",
    flat: "apartment",
    house: "house",
    "independent house": "independent_house",
    bungalow: "bungalow",
    penthouse: "penthouse",
    duplex: "duplex",
    studio: "studio",
    farmhouse: "farmhouse",
    plot: "plot",
    land: "plot",
    office: "commercial",
    shop: "commercial",
    commercial: "commercial",
  };

  for (const [keyword, type] of Object.entries(types)) {
    if (text.includes(keyword)) {
      return { propertyType: type };
    }
  }
  return {};
}

function extractBedrooms(text: string): Record<string, unknown> {
  // Match: 2bhk, 2 bhk, 2-bhk, 2 bedroom, 2 bedrooms
  const m = text.match(/(\d)\s*[-]?\s*(?:bhk|bedroom|bedrooms|bed)/i);
  if (m) {
    return { bedrooms: m[1] };
  }
  return {};
}

function extractPriceRange(text: string): Record<string, unknown> {
  const between = text.match(/between\s+(\d+(?:\.\d+)?)\s+and\s+(\d+(?:\.\d+)?)/i);
  if (between) {
    const minPrice = Number(between[1]);
    const maxPrice = Number(between[2]);
    const out: Record<string, unknown> = {};
    if (Number.isFinite(minPrice)) out.minPrice = minPrice;
    if (Number.isFinite(maxPrice)) out.maxPrice = maxPrice;
    return out;
  }

  const under = text.match(/(?:under|below)\s+(\d+(?:\.\d+)?)/i);
  if (under) {
    const maxPrice = Number(under[1]);
    return Number.isFinite(maxPrice) ? { maxPrice } : {};
  }

  const above = text.match(/(?:above|over)\s+(\d+(?:\.\d+)?)/i);
  if (above) {
    const minPrice = Number(above[1]);
    return Number.isFinite(minPrice) ? { minPrice } : {};
  }

  return {};
}

function extractLocationHints(text: string): Record<string, unknown> {
  const inMatch = text.match(/\bin\s+([a-z0-9\-\s]{2,40})/i);
  if (!inMatch) return {};

  const raw = inMatch[1].trim();
  if (!raw) return {};

  const normalized = raw.replace(/[^a-z0-9\s\-]/gi, "").trim();
  if (!normalized) return {};

  const slug = normalized
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

  return {
    locationSlug: slug,
    locationQuery: normalized,
  };
}
