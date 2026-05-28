import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomUUID } from "crypto";
import { checkRate, checkBan, getIp, isBrowserRequest } from "@/lib/security";

const SECRET = process.env.KOBOI_API_KEY ?? "dev-secret-not-for-prod";
const TOKEN_TTL_MS = 60_000;

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[];

function isOriginAllowed(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
  if (origin.endsWith(".vercel.app") || origin.includes("vercel.app")) return true;
  if (ALLOWED_ORIGINS.length === 0) {
    console.warn("[token] NEXT_PUBLIC_APP_URL not set — origin check skipped");
    return true;
  }
  return ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export async function GET(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  if (!isBrowserRequest(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const ip = getIp(req);

  const ban = checkBan(ip);
  if (ban.banned) {
    return NextResponse.json(
      { error: "Akses diblokir sementara." },
      { status: 403, headers: { "Retry-After": String(ban.retryAfterSec) } },
    );
  }

  const rl = checkRate(`token:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const exp = Date.now() + TOKEN_TTL_MS;
  const raw = `${randomUUID()}|${exp}`;
  const encodedPayload = Buffer.from(raw).toString("base64url");
  const token = `${encodedPayload}.${sign(encodedPayload)}`;

  return NextResponse.json({ token });
}

export function validateToken(req: NextRequest): { valid: boolean; error?: string } {
  if (!isOriginAllowed(req)) {
    return { valid: false, error: "Unauthorized origin." };
  }

  const token = req.headers.get("x-request-token");
  if (!token) return { valid: false, error: "Missing token." };

  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return { valid: false, error: "Invalid token." };

  const encodedPayload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);

  if (sig !== sign(encodedPayload)) return { valid: false, error: "Invalid token." };

  let raw: string;
  try {
    raw = Buffer.from(encodedPayload, "base64url").toString("utf-8");
  } catch {
    return { valid: false, error: "Invalid token." };
  }

  const exp = parseInt(raw.split("|")[1] ?? "0", 10);
  if (!exp || Date.now() > exp) return { valid: false, error: "Token expired." };

  return { valid: true };
}
