import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/api/token/route";

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
    if (q) {
      const eq = encodeURIComponent(q);
      filter = `&or=(nama.ilike.*${eq}*,modus.ilike.*${eq}*,jenis.ilike.*${eq}*)`;
    }

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

    if (!dataRes.ok) throw new Error(`Supabase data error ${dataRes.status}`);
    if (!countRes.ok) throw new Error(`Supabase count error ${countRes.status}`);

    const reports: BlacklistReport[] = await dataRes.json();
    const total = parseInt(countRes.headers.get("content-range")?.split("/")[1] ?? "0");

    return NextResponse.json({ reports, total, page, limit });
  } catch (err) {
    console.error("Blacklist GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();
    const { nama, jenis, modus, lokasi, kontak, scam_score } = body;

    if (!nama || !jenis || !modus) {
      return NextResponse.json({ error: "Nama, jenis, dan modus wajib diisi." }, { status: 400 });
    }
    if (String(nama).length > 200 || String(jenis).length > 100 || String(modus).length > 1000) {
      return NextResponse.json({ error: "Input terlalu panjang." }, { status: 400 });
    }
    if (lokasi && String(lokasi).length > 200) {
      return NextResponse.json({ error: "Lokasi terlalu panjang." }, { status: 400 });
    }
    if (kontak && String(kontak).length > 200) {
      return NextResponse.json({ error: "Kontak terlalu panjang." }, { status: 400 });
    }
    const score = Number(scam_score);
    if (scam_score !== undefined && (isNaN(score) || score < 0 || score > 100)) {
      return NextResponse.json({ error: "Scam score tidak valid (0–100)." }, { status: 400 });
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
          nama: String(nama).trim(),
          jenis: String(jenis).trim(),
          modus: String(modus).trim(),
          lokasi: (lokasi ? String(lokasi) : "").trim(),
          kontak: (kontak ? String(kontak) : "").trim(),
          scam_score: isNaN(score) ? 0 : score,
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
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

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
