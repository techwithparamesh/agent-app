import crypto from "crypto";

export function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function generateWidgetKey() {
  // Public, non-secret identifier (safe to expose).
  // Still generated with strong randomness to prevent trivial scraping/guessing.
  return crypto.randomUUID().replace(/-/g, "");
}

export function deriveAllowedOriginsFromWebsiteUrl(websiteUrl: string | null | undefined) {
  if (!websiteUrl) return [];

  try {
    const parsed = new URL(websiteUrl);
    const host = parsed.host; // includes port if present
    if (!host) return [];

    const origins = new Set<string>();

    // Prefer https by default. Even if the user stored an http websiteUrl,
    // most embedded widgets will run on https in production.
    origins.add(`https://${host}`);

    // Add/remove www variant
    if (host.startsWith("www.")) {
      const withoutWww = host.slice(4);
      origins.add(`https://${withoutWww}`);
    } else {
      origins.add(`https://www.${host}`);
    }

    return Array.from(origins);
  } catch {
    return [];
  }
}

function isLikelyHostname(value: string) {
  // Exclude localhost and raw IPs from wildcard generation.
  if (!value) return false;
  if (value === "localhost") return false;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) return false;
  return value.includes(".");
}

export function deriveSaasAllowedOriginsFromAppUrl(appUrl: string | undefined) {
  if (!appUrl) return [];

  try {
    const parsed = new URL(appUrl);
    const hostname = parsed.hostname;
    if (!hostname) return [];

    const origins: string[] = [];

    // Always allow the SaaS origin and its subdomains (https).
    origins.push(`https://${hostname}`);
    if (isLikelyHostname(hostname)) {
      origins.push(`https://*.${hostname}`);
    }

    // Also allow the exact origin of APP_URL (useful for local/dev).
    // Example: http://localhost:5008
    origins.push(`${parsed.protocol}//${parsed.host}`);

    return Array.from(new Set(origins));
  } catch {
    return [];
  }
}

type OriginPattern = string;

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/$/, "");
}

function patternMatchesOrigin(pattern: OriginPattern, origin: string) {
  const normalizedOrigin = normalizeOrigin(origin);
  const normalizedPattern = normalizeOrigin(pattern);

  if (normalizedPattern === "*") return true;
  if (normalizedPattern === normalizedOrigin) return true;

  // Support simple wildcard subdomains like: https://*.example.com
  if (normalizedPattern.includes("*")) {
    try {
      const patternUrl = new URL(normalizedPattern.replace("*.", "wildcard."));
      const originUrl = new URL(normalizedOrigin);

      if (patternUrl.protocol !== originUrl.protocol) return false;

      const patternHost = patternUrl.hostname;
      const originHost = originUrl.hostname;

      // reverse the earlier replacement
      if (patternHost.startsWith("wildcard.")) {
        const suffix = patternHost.slice("wildcard".length); // includes leading dot
        return originHost.endsWith(suffix);
      }

      return false;
    } catch {
      return false;
    }
  }

  return false;
}

export function isOriginAllowed(params: {
  origin: string | undefined;
  globalAllowedOrigins: string[];
  agentAllowedOrigins: string[];
  enforce: boolean;
}) {
  const { origin, globalAllowedOrigins, agentAllowedOrigins, enforce } = params;

  const allowlist = [...globalAllowedOrigins, ...agentAllowedOrigins].filter(Boolean);

  // If nothing is configured, don't block unless enforcement is on.
  if (allowlist.length === 0) {
    return { allowed: !enforce, reason: enforce ? "origin_required" : "not_enforced" } as const;
  }

  if (!origin) {
    return { allowed: !enforce, reason: enforce ? "origin_missing" : "origin_missing_not_enforced" } as const;
  }

  const ok = allowlist.some((pattern) => patternMatchesOrigin(pattern, origin));
  return { allowed: ok, reason: ok ? "allowed" : "origin_not_allowed" } as const;
}

export function parseCsvEnv(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseBooleanEnv(value: string | undefined) {
  return value === "true" || value === "1";
}

export function parseIntEnv(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
