import type { DomainExecutionPlan, DomainRequestContext } from "@shared/domainFramework";
import { getPolicy } from "./policies";
import type { DomainRouter } from "./router";

const REAL_ESTATE_KEYWORDS = [
  "apartment",
  "villa",
  "property",
  "listing",
  "rent",
  "rental",
  "buy",
  "sale",
  "house",
  "plot",
  "bhk",
  "site visit",
  "viewing",
  "visit",
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
    };

    const intent = detectIntent(text);

    return {
      domain: "real_estate",
      intent,
      entities,
      policy: getPolicy("real_estate", intent),
    };
  }
}

function detectIntent(text: string): DomainExecutionPlan["intent"] {
  if (text.includes("schedule") || text.includes("book") || text.includes("appointment") || text.includes("site visit") || text.includes("viewing")) {
    return "schedule_visit";
  }

  if (text.includes("available") || text.includes("availability") || text.includes("vacant")) {
    return "availability_check";
  }

  if (text.includes("similar") || text.includes("like this") || text.includes("alternatives")) {
    return "similar_properties";
  }

  if (text.includes("details") || text.includes("more info") || text.includes("tell me about") || text.includes("show me") || text.includes("specs")) {
    return "property_details";
  }

  if (text.includes("area") || text.includes("neighborhood") || text.includes("locality") || text.includes("landmark") || text.includes("location")) {
    return "location_info";
  }

  if (text.includes("budget") || text.includes("under") || text.includes("below") || text.includes("between") || text.includes("min") || text.includes("max")) {
    return "price_filter";
  }

  return "listing_search";
}

function extractListingId(text: string): Record<string, unknown> {
  const m = text.match(/(?:listing|property|id)\s*#?\s*(\d{1,10})/i) || text.match(/#(\d{1,10})/);
  if (!m) return {};
  const listingId = Number(m[1]);
  return Number.isFinite(listingId) ? { listingId } : {};
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
