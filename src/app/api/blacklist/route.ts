import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sbHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

export interface BlacklistReport {
  id: number;
  nama: string;
  jenis: string;
  modus: string;
  lokasi: string;
  kontak: string;
  scam_score: number;
  upvotes: number;
  created_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 10;
    const offset = (page - 1) * limit;

    let filter = "";
    if (q) filter = `&or=(nama.ilike.*${q}*,modus.ilike.*${q}*,jenis.ilike.*${q}*)`;

    const [dataRes, countRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/reports?select=*&order=upvotes.desc,created_at.desc&limit=${limit}&offset=${offset}${filter}`,
        { headers: sbHeaders }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/reports?select=id${filter}`,
        { headers: { ...sbHeaders, "Prefer": "count=exact" } }
      ),
    ]);

    const reports: BlacklistReport[] = await dataRes.json();
    const total = parseInt(countRes.headers.get("content-range")?.split("/")[1] ?? "0");

    return NextResponse.json({ reports, total, page, limit });
  } catch (err) {
    console.error("Blacklist GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, jenis, modus, lokasi, kontak, scam_score } = body;

    if (!nama || !jenis || !modus) {
      return NextResponse.json({ error: "Nama, jenis, dan modus wajib diisi." }, { status: 400 });
    }

    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/reports?select=id,upvotes&nama=ilike.${encodeURIComponent(nama.trim())}&limit=1`,
      { headers: sbHeaders }
    );
    const existing: BlacklistReport[] = await checkRes.json();

    if (existing.length > 0) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/reports?id=eq.${existing[0].id}`,
        {
          method: "PATCH",
          headers: { ...sbHeaders, "Prefer": "return=minimal" },
          body: JSON.stringify({ upvotes: existing[0].upvotes + 1 }),
        }
      );
      return NextResponse.json({ action: "upvoted", id: existing[0].id });
    }

    const insertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/reports`,
      {
        method: "POST",
        headers: { ...sbHeaders, "Prefer": "return=representation" },
        body: JSON.stringify({
          nama: nama.trim(),
          jenis: jenis.trim(),
          modus: modus.trim(),
          lokasi: (lokasi ?? "").trim(),
          kontak: (kontak ?? "").trim(),
          scam_score: scam_score ?? 0,
        }),
      }
    );
    const inserted = await insertRes.json();
    return NextResponse.json({ action: "created", id: inserted[0]?.id ?? 0 });
  } catch (err) {
    console.error("Blacklist POST error:", err);
    return NextResponse.json({ error: "Gagal menyimpan laporan." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });

    const getRes = await fetch(
      `${SUPABASE_URL}/rest/v1/reports?select=upvotes&id=eq.${id}`,
      { headers: sbHeaders }
    );
    const rows: { upvotes: number }[] = await getRes.json();
    if (!rows.length) return NextResponse.json({ error: "Not found." }, { status: 404 });

    await fetch(
      `${SUPABASE_URL}/rest/v1/reports?id=eq.${id}`,
      {
        method: "PATCH",
        headers: { ...sbHeaders, "Prefer": "return=minimal" },
        body: JSON.stringify({ upvotes: rows[0].upvotes + 1 }),
      }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blacklist PATCH error:", err);
    return NextResponse.json({ error: "Gagal upvote." }, { status: 500 });
  }
}
