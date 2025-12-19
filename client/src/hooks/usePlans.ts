import { useQuery } from "@tanstack/react-query";

export interface PlanFeatures {
  customBranding: boolean;
  analytics: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  webhooks: boolean;
  integrations: boolean;
  aiCapabilities: string[];
  whatsappIncluded: boolean;
  landingPages: boolean;
  websiteScanning: string; // 'basic', 'advanced', 'enterprise'
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number; // in cents
  yearlyPrice: number; // in cents
  messageLimit: number;
  agentLimit: number;
  phoneNumberLimit: number;
  teamMemberLimit: number;
  storageLimit: number; // in MB
  features: PlanFeatures;
  perMessageCost: number | null; // overage cost in cents
  perConversationCost: number | null;
  isActive: boolean;
}

export interface PlansResponse {
  plans: SubscriptionPlan[];
}

/**
 * Hook to fetch subscription plans from the API
 * Use this everywhere pricing is displayed for consistency
 */
export function usePlans() {
  return useQuery<PlansResponse>({
    queryKey: ["/api/billing/plans"],
    queryFn: async () => {
      const response = await fetch("/api/billing/plans");
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Format price from cents to display string
 */
export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  const dollars = cents / 100;
  return `$${dollars.toLocaleString()}`;
}

/**
 * Get yearly savings percentage
 */
export function getYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  if (monthlyPrice === 0) return 0;
  const monthlyTotal = monthlyPrice * 12;
  const yearlyTotal = yearlyPrice * 12;
  return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
}

/**
 * Default fallback plans if API fails (should match database)
 */
export const fallbackPlans: SubscriptionPlan[] = [
  {
    id: "1",
    name: "Free",
    slug: "free",
    description: "Get started with basic features",
    monthlyPrice: 0,
    yearlyPrice: 0,
    messageLimit: 100,
    agentLimit: 1,
    phoneNumberLimit: 0,
    teamMemberLimit: 1,
    storageLimit: 100,
    features: {
      customBranding: false,
      analytics: false,
      apiAccess: false,
      prioritySupport: false,
      webhooks: false,
      integrations: false,
      aiCapabilities: ["basic"],
      whatsappIncluded: false,
      landingPages: false,
      websiteScanning: "basic",
    },
    perMessageCost: null,
    perConversationCost: null,
    isActive: true,
  },
  {
    id: "2",
    name: "Starter",
    slug: "starter",
    description: "Perfect for small businesses",
    monthlyPrice: 1900, // $19
    yearlyPrice: 1520, // $15.20 (20% off)
    messageLimit: 500,
    agentLimit: 3,
    phoneNumberLimit: 1,
    teamMemberLimit: 2,
    storageLimit: 500,
    features: {
      customBranding: false,
      analytics: true,
      apiAccess: false,
      prioritySupport: false,
      webhooks: false,
      integrations: false,
      aiCapabilities: ["basic", "templates"],
      whatsappIncluded: true,
      landingPages: true,
      websiteScanning: "basic",
    },
    perMessageCost: 5, // $0.05 per extra message
    perConversationCost: null,
    isActive: true,
  },
  {
    id: "3",
    name: "Pro",
    slug: "pro",
    description: "Best for growing companies",
    monthlyPrice: 4900, // $49
    yearlyPrice: 3920, // $39.20 (20% off)
    messageLimit: 2000,
    agentLimit: 10,
    phoneNumberLimit: 3,
    teamMemberLimit: 5,
    storageLimit: 2000,
    features: {
      customBranding: true,
      analytics: true,
      apiAccess: true,
      prioritySupport: true,
      webhooks: true,
      integrations: true,
      aiCapabilities: ["basic", "templates", "advanced"],
      whatsappIncluded: true,
      landingPages: true,
      websiteScanning: "advanced",
    },
    perMessageCost: 3, // $0.03 per extra message
    perConversationCost: null,
    isActive: true,
  },
  {
    id: "4",
    name: "Enterprise",
    slug: "enterprise",
    description: "For large organizations",
    monthlyPrice: 14900, // $149
    yearlyPrice: 11920, // $119.20 (20% off)
    messageLimit: 10000,
    agentLimit: -1, // unlimited
    phoneNumberLimit: 10,
    teamMemberLimit: -1, // unlimited
    storageLimit: 10000,
    features: {
      customBranding: true,
      analytics: true,
      apiAccess: true,
      prioritySupport: true,
      webhooks: true,
      integrations: true,
      aiCapabilities: ["basic", "templates", "advanced", "custom"],
      whatsappIncluded: true,
      landingPages: true,
      websiteScanning: "enterprise",
    },
    perMessageCost: 2, // $0.02 per extra message
    perConversationCost: null,
    isActive: true,
  },
];
