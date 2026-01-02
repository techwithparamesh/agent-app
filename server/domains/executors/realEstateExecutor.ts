import type { DomainExecutionPlan, DomainExecutionResult, DomainRequestContext } from "@shared/domainFramework";
import type { DomainExecutor } from "../orchestrator";

export class RealEstateDomainExecutor implements DomainExecutor {
  canExecute(plan: DomainExecutionPlan): boolean {
    return plan.domain === "real_estate";
  }

  async execute(plan: DomainExecutionPlan, ctx: DomainRequestContext): Promise<DomainExecutionResult> {
    try {
      const { RealEstateService } = await import("../../../src/domains/realEstate/realEstate.service");
      const service = new RealEstateService();

      const listingId = typeof plan.entities?.listingId === "number" ? (plan.entities.listingId as number) : undefined;
      const locationSlug = typeof plan.entities?.locationSlug === "string" ? (plan.entities.locationSlug as string) : undefined;
      const minPrice = typeof plan.entities?.minPrice === "number" ? (plan.entities.minPrice as number) : undefined;
      const maxPrice = typeof plan.entities?.maxPrice === "number" ? (plan.entities.maxPrice as number) : undefined;

      switch (plan.intent) {
        case "availability_check": {
          if (!listingId) {
            return {
              handled: true,
              fallbackToLeadCapture: true,
              message: "I can check availability, but I need the listing ID. Please share the listing ID and your preferred timeframe.",
              handoffContext:
                "HANDOFF REQUIRED\n- Ask for listing ID\n- Ask for preferred move-in date/timeframe\n- Ask for name and phone\n- Confirm city/area",
              reason: "missing_listing_id",
            };
          }
          const availability = await service.getListingAvailability(ctx.userId, listingId);
          if (!availability.found) {
            return { handled: true, message: "I couldn't find that listing.", data: { availability } };
          }
          return {
            handled: true,
            message: availability.available
              ? `Yes — listing #${listingId} is currently available.`
              : `Listing #${listingId} is currently not available.`,
            data: { availability },
          };
        }

        case "property_details": {
          if (!listingId) {
            return {
              handled: true,
              fallbackToLeadCapture: true,
              message: "I can share property details, but I need the listing ID. Please share the listing ID you’re interested in.",
              handoffContext:
                "HANDOFF REQUIRED\n- Ask for listing ID\n- Ask what details they want (price, area, amenities)\n- Ask for name and phone",
              reason: "missing_listing_id",
            };
          }
          const listing = await service.getListingById(ctx.userId, listingId);
          if (!listing) {
            return { handled: true, message: "I couldn't find that listing." };
          }
          return {
            handled: true,
            message: formatListingDetails(listing),
            data: { listing },
          };
        }

        case "similar_properties": {
          if (!listingId) {
            return {
              handled: true,
              fallbackToLeadCapture: true,
              message: "I can suggest similar properties, but I need the listing ID. Please share the listing ID.",
              handoffContext:
                "HANDOFF REQUIRED\n- Ask for listing ID\n- Ask budget and preferred area\n- Ask for name and phone",
              reason: "missing_listing_id",
            };
          }
          const items = await service.getSimilarListings(ctx.userId, listingId, 10);
          return {
            handled: true,
            message: items.length ? formatListingList(items) : "No similar properties found.",
            data: { items },
          };
        }

        case "location_info": {
          if (!locationSlug) {
            return {
              handled: true,
              fallbackToLeadCapture: true,
              message: "I can share area information, but I need the location/area name. Which area are you interested in?",
              handoffContext:
                "HANDOFF REQUIRED\n- Ask for city and area/locality\n- Ask budget and property type\n- Ask for name and phone",
              reason: "missing_location",
            };
          }
          const location = await service.getLocationBySlugScoped(ctx.userId, locationSlug);
          if (!location) {
            return { handled: true, message: "I don't have info for that location yet.", data: { locationSlug } };
          }
          return {
            handled: true,
            message: formatLocationInfo(location),
            data: { location },
          };
        }

        case "schedule_visit": {
          if (!listingId) {
            return {
              handled: true,
              fallbackToLeadCapture: true,
              message: "I can help schedule a site visit. Please share the listing ID, your name, phone number, and preferred date/time.",
              handoffContext:
                "HANDOFF REQUIRED\n- Ask for listing ID\n- Ask for name and phone\n- Ask for preferred date and time\n- Confirm city/area",
              reason: "missing_visit_details",
            };
          }

          const name = typeof plan.entities?.name === "string" ? (plan.entities.name as string) : undefined;
          const phone = typeof plan.entities?.phone === "string" ? (plan.entities.phone as string) : undefined;
          const preferredDate = typeof plan.entities?.preferredDate === "string" ? (plan.entities.preferredDate as string) : undefined;
          const preferredTime = typeof plan.entities?.preferredTime === "string" ? (plan.entities.preferredTime as string) : undefined;

          if (!name || !phone) {
            return {
              handled: true,
              fallbackToLeadCapture: true,
              message: "To schedule a visit, please share your name and phone number (and preferred date/time if you have it).",
              handoffContext:
                "HANDOFF REQUIRED\n- Ask for name and phone\n- Ask for preferred date and time\n- Confirm listing ID",
              reason: "missing_contact",
            };
          }

          const visit = await service.createVisit(ctx.userId, {
            listingId,
            name,
            phone,
            preferredDate,
            preferredTime,
          });

          if (!visit) {
            return { handled: true, message: "I couldn't schedule that visit because the listing wasn't found." };
          }

          return {
            handled: true,
            message: "Scheduled your site visit request. Our team will confirm shortly.",
            data: { visit },
          };
        }

        case "price_filter":
        case "listing_search": {
          const items = await service.searchListings(ctx.userId, {
            q: ctx.messageText,
            locationSlug,
            minPrice,
            maxPrice,
            available: true,
            limit: 10,
            offset: 0,
          });

          return {
            handled: true,
            message: items.length ? formatListingList(items) : "No matching properties found.",
            data: { items },
          };
        }

        default:
          return {
            handled: true,
            fallbackToLeadCapture: true,
            message: "I can help with real estate, but I need a specialist to follow up. Let me take your details.",
            handoffContext:
              "HANDOFF REQUIRED\n- Ask for city and area\n- Ask for budget and property type\n- Ask for name, phone, and preferred contact time",
            reason: "unsupported_intent",
          };
      }
    } catch {
      return {
        handled: true,
        fallbackToLeadCapture: true,
        message: "Sorry, I couldn't complete that request. Let me connect you with a specialist.",
        handoffContext:
          "HANDOFF REQUIRED\n- Ask for city and area\n- Ask for budget and property type\n- Ask for name and phone",
        reason: "real_estate_executor_error",
      };
    }
  }
}

function formatListingDetails(listing: any): string {
  const parts = [
    `${listing.title}`,
    `City: ${listing.city}${listing.area ? `, Area: ${listing.area}` : ""}`,
    listing.type ? `Type: ${listing.type}` : undefined,
    `Price: ${listing.price}`,
    `Available: ${listing.available ? "Yes" : "No"}`,
    listing.locationSlug ? `Location: ${listing.locationSlug}` : undefined,
  ].filter(Boolean);

  return parts.join("\n");
}

function formatListingList(items: any[]): string {
  const lines = items.slice(0, 10).map((l) => {
    const area = l.area ? `, ${l.area}` : "";
    const type = l.type ? ` (${l.type})` : "";
    const avail = l.available ? "Available" : "Not available";
    return `#${l.id} - ${l.title}${type} - ${l.city}${area} - ${l.price} - ${avail}`;
  });
  return lines.join("\n");
}

function formatLocationInfo(location: any): string {
  const parts = [
    `Location: ${location.slug}`,
    location.description ? `Info: ${location.description}` : undefined,
    location.nearbyLandmarks ? `Nearby: ${location.nearbyLandmarks}` : undefined,
  ].filter(Boolean);
  return parts.join("\n");
}
