import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/api/token/route";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sbHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

export interface Comment {
  id: number;
  report_id: number;
  isi: string;
  created_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const report_id = searchParams.get("report_id");
    if (!report_id) return NextResponse.json({ comments: [] });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/comments?report_id=eq.${report_id}&order=created_at.asc`,
      { headers: sbHeaders }
    );
    const comments: Comment[] = await res.json();
    return NextResponse.json({ comments: Array.isArray(comments) ? comments : [] });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest) {
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

  try {
    const { report_id, isi } = await req.json();
    if (!report_id || !isi?.trim()) {
      return NextResponse.json({ error: "report_id dan isi wajib." }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
      method: "POST",
      headers: { ...sbHeaders, "Prefer": "return=representation" },
      body: JSON.stringify({ report_id, isi: isi.trim() }),
    });
    const inserted = await res.json();
    return NextResponse.json({ comment: inserted[0] });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan komentar." }, { status: 500 });
  }
}
