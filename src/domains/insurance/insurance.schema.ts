import {
  mysqlTable,
  varchar,
  int,
  text,
  timestamp,
  json,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const insurancePolicies = mysqlTable(
  "insurance_policies",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),

    policyType: varchar("policy_type", { length: 50 }).notNull(),
    coverageSummary: text("coverage_summary"),
    exclusions: text("exclusions"),

    eligibilityRules: json("eligibility_rules").$type<Record<string, any>>(),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    tenantIdx: index("idx_insurance_policies_tenant").on(table.tenantId),
    typeIdx: index("idx_insurance_policies_type").on(table.policyType),
    createdIdx: index("idx_insurance_policies_created").on(table.createdAt),
  })
);

export const insuranceLeads = mysqlTable(
  "insurance_leads",
  {
    id: int("id").autoincrement().primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),

    leadType: varchar("lead_type", { length: 20 }).notNull(), // quote | claim | renewal | handoff
    policyType: varchar("policy_type", { length: 50 }),

    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    email: varchar("email", { length: 320 }),

    referenceId: varchar("reference_id", { length: 100 }),
    notes: text("notes"),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    tenantIdx: index("idx_insurance_leads_tenant").on(table.tenantId),
    leadTypeIdx: index("idx_insurance_leads_lead_type").on(table.leadType),
    policyTypeIdx: index("idx_insurance_leads_policy_type").on(table.policyType),
    createdIdx: index("idx_insurance_leads_created").on(table.createdAt),
  })
);
