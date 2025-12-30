import dns from "node:dns/promises";
import net from "node:net";

function toIpv4Int(ip: string) {
  const parts = ip.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function inRange(ipInt: number, start: string, end: string) {
  const s = toIpv4Int(start);
  const e = toIpv4Int(end);
  if (s === null || e === null) return false;
  return ipInt >= s && ipInt <= e;
}

export function isPrivateOrLocalIp(ip: string) {
  const normalized = ip.trim().toLowerCase();

  // IPv4-mapped IPv6: ::ffff:127.0.0.1
  if (normalized.startsWith("::ffff:")) {
    const v4 = normalized.slice("::ffff:".length);
    return isPrivateOrLocalIp(v4);
  }

  const kind = net.isIP(normalized);
  if (!kind) return false;

  if (kind === 4) {
    const ipInt = toIpv4Int(normalized);
    if (ipInt === null) return true;

    // localhost / loopback / unspecified / private / link-local / CGNAT / benchmarking / multicast / reserved
    return (
      inRange(ipInt, "0.0.0.0", "0.255.255.255") ||
      inRange(ipInt, "10.0.0.0", "10.255.255.255") ||
      inRange(ipInt, "100.64.0.0", "100.127.255.255") ||
      inRange(ipInt, "127.0.0.0", "127.255.255.255") ||
      inRange(ipInt, "169.254.0.0", "169.254.255.255") ||
      inRange(ipInt, "172.16.0.0", "172.31.255.255") ||
      inRange(ipInt, "192.168.0.0", "192.168.255.255") ||
      inRange(ipInt, "198.18.0.0", "198.19.255.255") ||
      inRange(ipInt, "224.0.0.0", "239.255.255.255") ||
      inRange(ipInt, "240.0.0.0", "255.255.255.255")
    );
  }

  // IPv6 checks (lightweight but effective for localhost + private ranges)
  // - :: / ::1
  // - fe80::/10 link-local
  // - fc00::/7 unique local
  // - 2001:db8::/32 documentation
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("2001:db8:")) return true;

  return false;
}

export function normalizeWebsiteUrlForScan(raw: string) {
  let value = (raw || "").trim();
  if (!value) return value;

  if (!/^https?:\/\//i.test(value)) {
    value = value.replace(/^www\./i, "");
    value = `https://${value}`;
  }

  return value;
}

export function parseHttpUrl(raw: string) {
  const value = normalizeWebsiteUrlForScan(raw);
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

    // Basic hardening: do not allow embedded credentials.
    if (parsed.username || parsed.password) return null;

    return parsed;
  } catch {
    return null;
  }
}

export async function validateScanTargetUrl(target: URL) {
  // Only allow http(s)
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return { ok: false as const, message: "Only http(s) URLs are allowed." };
  }

  // Avoid scanning local/dev names.
  const hostname = target.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    return { ok: false as const, message: "Localhost URLs are not allowed." };
  }

  // Reject direct IP targets that are private/local.
  if (net.isIP(hostname)) {
    if (isPrivateOrLocalIp(hostname)) {
      return { ok: false as const, message: "Private network URLs are not allowed." };
    }
    return { ok: true as const };
  }

  // DNS resolve hostnames and reject if they resolve to private/local IPs.
  // This is a best-effort SSRF guard.
  try {
    const records = await dns.lookup(hostname, { all: true, verbatim: true });
    if (records.some((r) => isPrivateOrLocalIp(r.address))) {
      return { ok: false as const, message: "Private network URLs are not allowed." };
    }
  } catch {
    // If DNS fails, treat as invalid.
    return { ok: false as const, message: "Could not resolve host." };
  }

  return { ok: true as const };
}

export function isSameOrigin(urlA: string, origin: string) {
  try {
    return new URL(urlA).origin === origin;
  } catch {
    return false;
  }
}
