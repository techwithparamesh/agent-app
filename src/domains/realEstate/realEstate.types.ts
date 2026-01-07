export type TenantId = string;

export type RealEstateListingType = string; // e.g. '1BHK', '2BHK', 'villa'

export interface RealEstateListing {
  id: number;
  tenantId: TenantId;
  title: string;
  city: string;
  area: string | null;
  type: RealEstateListingType | null;
  price: string; // decimal returned as string by mysql2
  available: boolean;
  locationSlug: string | null;
  createdAt: Date | null;
}

export interface RealEstateLocation {
  id: number;
  slug: string;
  description: string | null;
  nearbyLandmarks: string | null;
  createdAt: Date | null;
}

export interface RealEstateVisit {
  id: number;
  tenantId: TenantId;
  listingId: number;
  name: string;
  phone: string;
  preferredDate: string | null; // YYYY-MM-DD
  preferredTime: string | null; // HH:MM:SS
  createdAt: Date;
}

export interface ListingSearchParams {
  q?: string;
  city?: string;
  area?: string;
  type?: string;
  locationSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateVisitInput {
  listingId: number;
  name: string;
  phone: string;
  preferredDate?: string;
  preferredTime?: string;
}

export interface ListingAvailabilityResult {
  found: boolean;
  listingId: number;
  available: boolean;
}

export type PropertyDraftStatus = "active" | "removed_from_website";

export interface RealEstatePropertyDraft {
  id: number;
  tenantId: TenantId;
  agentId: string;
  externalPropertyId?: string | null;
  title: string;
  propertyType: string | null;
  city: string;
  area: string | null;
  price: string;
  bedrooms: string | null;
  description: string | null;
  aiEnabled: boolean;
  listingId: number | null;
  status: PropertyDraftStatus;
  createdAt: Date;
}

export type PropertySyncSourceType = "wordpress" | "custom_api" | "unknown";

export interface RealEstatePropertySyncConfig {
  id: number;
  tenantId: TenantId;
  agentId: string;
  sourceType: PropertySyncSourceType;
  websiteUrl: string | null;
  apiEndpoint: string | null;
  credentialId: string | null;
  autoSyncEnabled: boolean;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertySyncNowInput {
  sourceType: PropertySyncSourceType;
  websiteUrl?: string;
  apiEndpoint?: string;
  apiKey?: string;
  credentialId?: string;
}

export interface CreatePropertyDraftInput {
  title: string;
  propertyType?: string;
  city: string;
  area?: string;
  price: number;
  bedrooms?: string;
  description?: string;
}
