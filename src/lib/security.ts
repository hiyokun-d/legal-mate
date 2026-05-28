type RateRecord = { count: number; resetAt: number };
type BanRecord  = { until: number };

const rateStore   = new Map<string, RateRecord>();
const banStore    = new Map<string, BanRecord>();
const strikeStore = new Map<string, number>();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of banStore.entries())  if (v.until  < now) banStore.delete(k);
  for (const [k, v] of rateStore.entries()) if (v.resetAt < now) rateStore.delete(k);
}, 5 * 60_000);

// ── IP utils ──────────────────────────────────────────────────────────────────

export function getIp(req: Request): string {
  const fwd = (req.headers as Headers).get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : "unknown").toLowerCase();
}

export function banIp(ip: string, ms: number): void {
  banStore.set(ip, { until: Date.now() + ms });
}

export function checkBan(ip: string): { banned: boolean; retryAfterSec: number } {
  const rec = banStore.get(ip);
  if (!rec) return { banned: false, retryAfterSec: 0 };
  if (rec.until < Date.now()) { banStore.delete(ip); return { banned: false, retryAfterSec: 0 }; }
  return { banned: true, retryAfterSec: Math.ceil((rec.until - Date.now()) / 1000) };
}

export function recordJailbreakStrike(ip: string): void {
  const n = (strikeStore.get(ip) ?? 0) + 1;
  strikeStore.set(ip, n);
  if (n >= 3) banIp(ip, 15 * 60_000);
  else if (n === 2) banIp(ip, 5 * 60_000);
}

// ── Rate limiting ─────────────────────────────────────────────────────────────

export function checkRate(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const rec = rateStore.get(key);
  if (!rec || rec.resetAt < now) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  rec.count += 1;
  return {
    allowed: rec.count <= limit,
    retryAfterSec: rec.count <= limit ? 0 : Math.ceil((rec.resetAt - now) / 1000),
  };
}

// ── Bot / curl / automation detection ────────────────────────────────────────
//
// Two-stage check:
//   1. UA signature match  — catches tools that don't spoof
//   2. Browser fingerprint — catches tools that DO spoof the UA
//
// Browser fingerprint works because real browsers ALWAYS send:
//   • sec-fetch-site   (added by browser fetch API, not settable by cross-origin JS)
//   • sec-fetch-mode
//   • accept-language
//   • accept with a multi-type value
//
// curl, httpx, python-requests, etc. never send sec-fetch-* by default.
// Even when a script manually adds a fake browser UA, it almost never
// adds all four of these headers correctly.

const BOT_UA_PATTERNS = [
  /^$/,
  /^curl\//i,
  /^python-requests\//i,
  /^python\//i,
  /^node-fetch/i,
  /^node\.js/i,
  /^axios\//i,
  /^go-http-client\//i,
  /^java\//i,
  /^okhttp\//i,
  /^libwww-perl\//i,
  /^wget\//i,
  /^scrapy\//i,
  /^httpx\//i,
  /^aiohttp\//i,
  /^ruby/i,
  /^php\//i,
  /^perl\//i,
  /^rust/i,
  /^undici\//i,
  /^got\//i,
  /^superagent\//i,
  /^pycurl\//i,
  /^http\.rb\//i,
  /^faraday\//i,
  /^guzzle\//i,
  /libcurl/i,
  /HTTPie\//i,
  /insomnia\//i,
  /^PostmanRuntime\//i,
];

export function isBotUA(ua: string | null): boolean {
  if (!ua || ua.trim() === "") return true;
  return BOT_UA_PATTERNS.some((re) => re.test(ua.trim()));
}

export function isBrowserRequest(req: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const h = req.headers as Headers;
  const ua = h.get("user-agent") ?? "";

  if (isBotUA(ua)) return false;

  const secFetchSite = h.get("sec-fetch-site");
  const secFetchMode = h.get("sec-fetch-mode");
  const acceptLang   = h.get("accept-language");
  const accept       = h.get("accept") ?? "";

  const hasSecFetch   = secFetchSite !== null && secFetchMode !== null;
  const hasAcceptLang = acceptLang !== null && acceptLang.length > 0;
  const hasRichAccept = accept.includes(",") || accept.includes("text/html") || accept.includes("application/json");

  const browserSignals = [hasSecFetch, hasAcceptLang, hasRichAccept].filter(Boolean).length;

  return browserSignals >= 2;
}

// ── Text hardening ────────────────────────────────────────────────────────────

export function hardenText(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[​-‍⁠﻿­]/g, "")
    .replace(/[іІ]/g, "i")
    .replace(/[аА]/g, "a")
    .replace(/[еЕ]/g, "e")
    .replace(/[оО]/g, "o")
    .replace(/[рР]/g, "p")
    .replace(/[сС]/g, "c")
    .replace(/[уУ]/g, "y")
    .replace(/[хХ]/g, "x")
    .trim();
}

export function stripInjectionMarkers(text: string): string {
  return text
    .replace(/\[SYSTEM\][\s\S]*$/gim, "[dihapus]")
    .replace(/\[INST\][\s\S]*?\[\/INST\]/gim, "[dihapus]")
    .replace(/<\|.*?\|>/gi, "[dihapus]")
    .replace(/###\s*(SYSTEM|INSTRUCTION|PROMPT)[\s\S]*$/gim, "[dihapus]")
    .replace(/<<<[\s\S]*?>>>/g, "[dihapus]")
    .replace(/[​-‍⁠﻿­]/g, "")
    .trim()
    .slice(0, 3000);
}

// ── Request body size check ───────────────────────────────────────────────────

const MAX_BODY_BYTES = 12 * 1024 * 1024;

export function isBodyTooLarge(req: Request): boolean {
  const len = (req.headers as Headers).get("content-length");
  if (!len) return false;
  return parseInt(len, 10) > MAX_BODY_BYTES;
}
