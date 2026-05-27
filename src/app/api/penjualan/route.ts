import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/api/token/route";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sbHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

function genId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "JUAL-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/ledger_books?id=eq.${encodeURIComponent(id)}&select=*`,
    { headers: sbHeaders }
  );
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Buku tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ book: rows[0] });
}

export async function POST(req: NextRequest) {
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();
    const nama_usaha = (body.nama_usaha ?? "Usaha Saya").trim();

    let id = genId();
    for (let attempt = 0; attempt < 5; attempt++) {
      const check = await fetch(
        `${SUPABASE_URL}/rest/v1/ledger_books?id=eq.${id}&select=id`,
        { headers: sbHeaders }
      );
      const existing = await check.json();
      if (!Array.isArray(existing) || existing.length === 0) break;
      id = genId();
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/ledger_books`, {
      method: "POST",
      headers: { ...sbHeaders, "Prefer": "return=representation" },
      body: JSON.stringify({ id, nama_usaha }),
    });
    const inserted = await res.json();
    return NextResponse.json({ book: inserted[0] });
  } catch {
    return NextResponse.json({ error: "Gagal membuat buku." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

  try {
    const { id, nama_usaha } = await req.json();
    if (!id || !nama_usaha?.trim()) {
      return NextResponse.json({ error: "ID dan nama wajib." }, { status: 400 });
    }
    await fetch(`${SUPABASE_URL}/rest/v1/ledger_books?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...sbHeaders, "Prefer": "return=minimal" },
      body: JSON.stringify({ nama_usaha: nama_usaha.trim() }),
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal mengupdate nama." }, { status: 500 });
  }
}
