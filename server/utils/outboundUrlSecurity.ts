import net from "node:net";
import { validateScanTargetUrl } from "./scanSecurity";

function isTrue(value: string | undefined) {
  return String(value || "").toLowerCase() === "true";
}

export function parseHttpUrlStrict(raw: string): URL {
  const value = String(raw || "").trim();
  if (!value) {
    throw new Error("URL is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }

  // Basic hardening: do not allow embedded credentials.
  if (parsed.username || parsed.password) {
    throw new Error("URLs with embedded credentials are not allowed");
  }

  return parsed;
}

export function sanitizeUrlForLogs(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    u.username = "";
    u.password = "";
    return u.toString();
  } catch {
    return "(invalid url)";
  }
}

/**
 * Best-effort SSRF protection for *user-configurable* outbound URLs.
 *
 * Default: block private/local IPs & localhost.
 * Override: set OUTBOUND_URL_ALLOW_PRIVATE=true to allow internal URLs (self-hosted deployments).
 */
export async function assertSafeOutboundUrl(rawUrl: string): Promise<URL> {
  const allowPrivate = isTrue(process.env.OUTBOUND_URL_ALLOW_PRIVATE);
  const url = parseHttpUrlStrict(rawUrl);

  // If host is a literal IP and private is allowed, skip the scanSecurity checks.
  if (allowPrivate) {
    // Still block nonsense / empty host.
    const host = url.hostname.trim();
    if (!host) throw new Error("Invalid URL host");
    return url;
  }

  // validateScanTargetUrl includes SSRF best-effort DNS checks.
  const verdict = await validateScanTargetUrl(url);
  if (!verdict.ok) {
    throw new Error(verdict.message || "URL is not allowed");
  }

  // Extra guard: disallow bare private/local IPs even if validateScanTargetUrl is relaxed in the future.
  if (net.isIP(url.hostname) && !allowPrivate) {
    // validateScanTargetUrl already blocks private/local, so this is defense-in-depth.
    throw new Error("IP URLs are not allowed");
  }

  return url;
}
