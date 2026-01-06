import {
  mysqlTable,
  varchar,
  int,
  boolean,
  text,
  timestamp,
  decimal,
  index,
  uniqueIndex,
  date,
  time,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const realEstateLocations = mysqlTable(
  "real_estate_locations",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    nearbyLandmarks: text("nearby_landmarks"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    slugUnique: uniqueIndex("uq_real_estate_locations_slug").on(table.slug),
  })
);

export const realEstateListings = mysqlTable(
  "real_estate_listings",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),

    title: varchar("title", { length: 500 }).notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    area: varchar("area", { length: 255 }),
    type: varchar("type", { length: 100 }),

    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    available: boolean("available").notNull().default(true),

    locationSlug: varchar("location_slug", { length: 255 }),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    tenantIdx: index("idx_real_estate_listings_tenant").on(table.tenantId),
    locationSlugIdx: index("idx_real_estate_listings_location_slug").on(table.locationSlug),
    cityIdx: index("idx_real_estate_listings_city").on(table.city),
    availableIdx: index("idx_real_estate_listings_available").on(table.available),
    priceIdx: index("idx_real_estate_listings_price").on(table.price),
  })
);

export const realEstateVisits = mysqlTable(
  "real_estate_visits",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    listingId: int("listing_id").notNull().references(() => realEstateListings.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),

    preferredDate: date("preferred_date"),
    preferredTime: time("preferred_time"),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    tenantIdx: index("idx_real_estate_visits_tenant").on(table.tenantId),
    listingIdx: index("idx_real_estate_visits_listing").on(table.listingId),
    createdIdx: index("idx_real_estate_visits_created").on(table.createdAt),
  })
);

export const realEstatePropertyDrafts = mysqlTable(
  "real_estate_property_drafts",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    agentId: varchar("agent_id", { length: 36 }).notNull(),

    externalPropertyId: varchar("external_property_id", { length: 191 }),

    title: varchar("title", { length: 500 }).notNull(),
    propertyType: varchar("property_type", { length: 100 }),
    city: varchar("city", { length: 255 }).notNull(),
    area: varchar("area", { length: 255 }),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    bedrooms: varchar("bedrooms", { length: 50 }),
    description: text("description"),

    status: varchar("status", { length: 20 }).notNull().default("pending"),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    tenantIdx: index("idx_real_estate_property_drafts_tenant").on(table.tenantId),
    agentIdx: index("idx_real_estate_property_drafts_agent").on(table.agentId),
    // Unique per agent (not per tenant) so different agents can import the same properties
    agentExternalIdx: uniqueIndex("uq_real_estate_property_drafts_agent_external").on(
      table.agentId,
      table.externalPropertyId
    ),
    statusIdx: index("idx_real_estate_property_drafts_status").on(table.status),
    createdIdx: index("idx_real_estate_property_drafts_created").on(table.createdAt),
  })
);

export const realEstatePropertySyncConfigs = mysqlTable(
  "real_estate_property_sync_configs",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    agentId: varchar("agent_id", { length: 36 }).notNull(),

    sourceType: varchar("source_type", { length: 30 }).notNull(),
    websiteUrl: varchar("website_url", { length: 2048 }),
    apiEndpoint: varchar("api_endpoint", { length: 2048 }),
    credentialId: varchar("credential_id", { length: 36 }),

    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    tenantIdx: index("idx_real_estate_property_sync_configs_tenant").on(table.tenantId),
    agentIdx: index("idx_real_estate_property_sync_configs_agent").on(table.agentId),
    tenantAgentUnique: uniqueIndex("uq_real_estate_property_sync_configs_tenant_agent").on(
      table.tenantId,
      table.agentId
    ),
  })
);
