/**
 * LLM-powered Real Estate Search
 * 
 * Uses the unified LLM interface to understand user intent and match against actual database values.
 * Automatically uses whichever LLM provider is configured (Claude, OpenAI, Gemini, Groq).
 */

import type { RealEstateListing } from "../../../src/domains/realEstate/realEstate.types";
import { llm, parseJSON, isLLMAvailable } from "../../lib/llm";

// ============================================================================
// Types
// ============================================================================

export interface SearchIntent {
  action: "search" | "details" | "compare" | "schedule_visit" | "general_inquiry";
  filters: {
    propertyType?: string;
    city?: string;
    area?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: string;
  };
  listingIds?: number[];
  propertyName?: string;  // For "details about raja villa" type queries
  question?: string;
}

export interface DatabaseContext {
  propertyTypes: string[];
  cities: string[];
  areas: string[];
}

// ============================================================================
// LLM-powered Intent Parsing
// ============================================================================

/**
 * Use LLM to understand user intent and extract search parameters.
 * The key innovation: we tell the LLM what values actually exist in the database,
 * so it can map user terms like "apartment" to the exact database value "Apartments".
 */
export async function parseUserIntent(
  message: string,
  dbContext: DatabaseContext
): Promise<SearchIntent> {
  const systemPrompt = `You are a real estate search assistant. Analyze the user's message and extract their search intent.

IMPORTANT: The database contains these EXACT values. You must match user terms to these exact values:

Available property types: ${dbContext.propertyTypes.length > 0 ? dbContext.propertyTypes.join(", ") : "None yet"}
Available cities: ${dbContext.cities.length > 0 ? dbContext.cities.join(", ") : "None yet"}
Available areas: ${dbContext.areas.length > 0 ? dbContext.areas.join(", ") : "None yet"}

Return a JSON object:
{
  "action": "search" | "details" | "compare" | "schedule_visit" | "general_inquiry",
  "filters": {
    "propertyType": "EXACT match from available types above, or null if not specified",
    "city": "EXACT match from available cities above, or null if not specified",
    "area": "EXACT match from available areas above, or null if not specified",
    "minPrice": number or null,
    "maxPrice": number or null,
    "bedrooms": "string like '2' or '3' or null"
  },
  "listingIds": [array of listing IDs if user mentions specific ones like #14 or listing 2],
  "propertyName": "the specific property name/title user is asking about, or null",
  "question": "what the user is asking if it's a general inquiry"
}

MATCHING RULES:
- "apartment", "apartments", "flat", "flats" → match to property type containing "Apartment" (case-insensitive)
- "villa", "villas" → match to property type containing "Villa"
- "house", "houses", "independent house" → match to property type containing "House" or "Independent"
- "land", "lands", "plot", "plots" → match to property type containing "Land" or "Plot"
- "commercial", "office", "shop" → match to property type containing "Commercial"

PRICE CONVERSION (Indian currency):
- "50 lakhs" or "50 lakh" = 5000000
- "1 crore" = 10000000
- "1.5 crore" = 15000000
- "under X" → maxPrice = X
- "above X" or "over X" → minPrice = X
- "between X and Y" → minPrice = X, maxPrice = Y

BEDROOM EXTRACTION:
- "2bhk", "2 bhk", "2-bhk", "2 bedroom", "two bedroom" → bedrooms: "2"
- "3bhk" → bedrooms: "3"

ACTION DETECTION:
- "show", "list", "find", "search", "looking for" → action: "search"
- "details", "info", "tell me about", "more about", "more details" → action: "details"
- "compare" → action: "compare"
- "schedule", "book", "visit", "appointment" → action: "schedule_visit"
- General questions about real estate → action: "general_inquiry"

PROPERTY NAME EXTRACTION (Important!):
- When user asks for details about a specific property, extract the property name
- "show me details about raja villa" → action: "details", propertyName: "raja villa"
- "tell me more about countryside luxury villa" → action: "details", propertyName: "countryside luxury villa"
- "info on green meadows apartment" → action: "details", propertyName: "green meadows apartment"

Return ONLY valid JSON. No markdown, no code blocks, no explanation.`;

  const content = await llm.chat(systemPrompt, message, true);
  const parsed = parseJSON<SearchIntent>(content);
  
  if (parsed) {
    console.log("[RealEstate LLM] Parsed intent:", JSON.stringify(parsed));
    return parsed;
  }

  // Fallback to basic search
  return { action: "search", filters: {} };
}

/**
 * Generate a natural, helpful response using LLM
 */
export async function generateSmartResponse(
  listings: RealEstateListing[],
  intent: SearchIntent,
  userMessage: string
): Promise<string> {
  // If no LLM available or simple case, use formatted output
  if (!isLLMAvailable()) {
    return formatListingsSimple(listings, intent);
  }

  if (listings.length === 0) {
    return generateNoResultsResponse(intent, userMessage);
  }

  // For details request or few items, show detailed view
  const isDetailRequest = intent.action === "details" || 
    /\b(detail|details|info|information|more about|tell me)\b/i.test(userMessage);

  if (isDetailRequest || listings.length <= 3) {
    return formatListingsDetailed(listings);
  }

  // For list view, format as a nice list
  return formatListingsList(listings, userMessage);
}

async function generateNoResultsResponse(intent: SearchIntent, userMessage: string): Promise<string> {
  const systemPrompt = `You are a helpful real estate assistant. The user searched for properties but none matched.
Generate a friendly, helpful response (2-3 sentences max).
- Acknowledge what they searched for
- Suggest they try different criteria (broader search, different area, adjust budget)
- Be encouraging and helpful
Don't mention technical details or database.`;

  const content = await llm.chat(
    systemPrompt,
    `User asked: "${userMessage}"\nFilters tried: ${JSON.stringify(intent.filters)}`
  );

  return content || `I couldn't find any properties matching your search. Try adjusting your criteria - perhaps a different property type, area, or budget range?`;
}

function formatListingsDetailed(listings: RealEstateListing[]): string {
  const formatted = listings.map((l) => {
    const price = formatPrice(l.price);
    return [
      `**${l.title}**`,
      `📍 ${l.city}${l.area ? `, ${l.area}` : ""}`,
      `🏠 Type: ${l.type || "N/A"}`,
      `💰 Price: ${price}`,
      `✅ ${l.available ? "Available" : "Not Available"}`,
    ].join("\n");
  });

  const header = listings.length === 1 
    ? "Here are the details:" 
    : `Found ${listings.length} properties:`;

  return `${header}\n\n${formatted.join("\n\n---\n\n")}`;
}

function formatListingsList(listings: RealEstateListing[], userMessage: string): string {
  const lines = listings.slice(0, 10).map((l, i) => {
    const price = formatPrice(l.price);
    const type = l.type ? ` (${l.type})` : "";
    const area = l.area ? `, ${l.area}` : "";
    return `${i + 1}. **#${l.id} - ${l.title}**${type}\n   📍 ${l.city}${area} | 💰 ${price}`;
  });

  return `Found ${listings.length} properties:\n\n${lines.join("\n\n")}\n\n💡 Ask for details about any property by number or say "tell me more about #X"`;
}

function formatListingsSimple(listings: RealEstateListing[], intent: SearchIntent): string {
  if (listings.length === 0) {
    return `I couldn't find any properties matching your search. Try different criteria like:\n- Different property type\n- Another area or city\n- Adjusted budget range`;
  }

  return formatListingsList(listings, "");
}

function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

// ============================================================================
// Database Context Helpers
// ============================================================================

/**
 * Get distinct values from the database to provide context to LLM
 */
export async function getDbContext(tenantId: string): Promise<DatabaseContext> {
  try {
    const { RealEstateService } = await import("../../../src/domains/realEstate/realEstate.service");
    const service = new RealEstateService();
    
    // Get all listings for this tenant to extract unique values
    const allListings = await service.searchListings(tenantId, { limit: 100 });
    
    const propertyTypes = [...new Set(allListings.map(l => l.type).filter(Boolean))] as string[];
    const cities = [...new Set(allListings.map(l => l.city).filter(Boolean))] as string[];
    const areas = [...new Set(allListings.map(l => l.area).filter(Boolean))] as string[];

    console.log("[RealEstate LLM] DB Context - Types:", propertyTypes, "Cities:", cities, "Areas:", areas);

    return { propertyTypes, cities, areas };
  } catch (error) {
    console.error("[RealEstate LLM] Failed to get DB context:", error);
    return { propertyTypes: [], cities: [], areas: [] };
  }
}
