export type TenantId = string;

export type PolicyType = string; // health, motor, life, etc.

export interface InsurancePolicy {
  id: number;
  tenantId: TenantId;
  policyType: PolicyType;
  coverageSummary: string | null;
  exclusions: string | null;
  eligibilityRules: Record<string, any> | null;
  createdAt: Date;
}

export type InsuranceLeadType = "quote" | "claim" | "renewal" | "handoff";

export interface InsuranceLead {
  id: number;
  tenantId: TenantId;
  leadType: InsuranceLeadType;
  policyType: PolicyType | null;
  name: string;
  phone: string;
  email: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface PolicyInfoQuery {
  policyType?: string;
}

export interface QuoteRequestInput {
  policyType?: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface ClaimEnquiryInput {
  policyType?: string;
  name: string;
  phone: string;
  email?: string;
  referenceId?: string;
  notes?: string;
}

export interface RenewalEnquiryInput {
  policyType?: string;
  name: string;
  phone: string;
  email?: string;
  referenceId?: string;
  notes?: string;
}

export interface EligibilityCheckInput {
  policyType: string;
  applicant: Record<string, any>;
}

export interface EligibilityDecision {
  eligible: boolean;
  reason: string;
}

export interface HandoffRequestInput {
  policyType?: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface DocumentsChecklistQuery {
  policyType?: string;
  purpose?: string; // claims | purchase
}
