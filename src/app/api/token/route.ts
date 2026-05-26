import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// In-memory token store: token -> expires timestamp
const tokenStore = new Map<string, number>();

// Cleanup expired tokens tiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [token, expires] of tokenStore.entries()) {
    if (expires < now) tokenStore.delete(token);
  }
}, 5 * 60 * 1000);

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[];

function isOriginAllowed(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const origin = req.headers.get("origin") ?? req.headers.get("referer") ?? "";
  // Allow Vercel deployments (.vercel.app) dan custom domain dari NEXT_PUBLIC_APP_URL
  if (origin.endsWith(".vercel.app") || origin.includes("vercel.app")) return true;
  if (ALLOWED_ORIGINS.length === 0) return true; // fallback jika env belum di-set
  return ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
}

export async function GET(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const token = randomUUID();
  tokenStore.set(token, Date.now() + 60_000); // valid 60 detik

  return NextResponse.json({ token });
}

// Validator — diimpor oleh route lain
export function validateToken(req: NextRequest): { valid: boolean; error?: string } {
  // Layer 2: Origin
  if (!isOriginAllowed(req)) {
    return { valid: false, error: "Unauthorized origin." };
  }

  // Layer 1: One-time token
  const token = req.headers.get("x-request-token");
  if (!token) return { valid: false, error: "Missing token." };

  const expires = tokenStore.get(token);
  if (!expires) return { valid: false, error: "Invalid token." };
  if (expires < Date.now()) {
    tokenStore.delete(token);
    return { valid: false, error: "Token expired." };
  }

  // Hapus setelah dipakai — one-time!
  tokenStore.delete(token);
  return { valid: true };
}
