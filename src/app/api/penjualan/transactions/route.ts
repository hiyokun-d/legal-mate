import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/api/token/route";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sbHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
};

export interface Transaction {
  id: number;
  book_id: string;
  tanggal: string;
  keterangan: string;
  kategori: string;
  jenis: "pemasukan" | "pengeluaran";
  nominal: number;
  created_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const book_id = searchParams.get("book_id");
    if (!book_id) return NextResponse.json({ transactions: [] });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/transactions?book_id=eq.${encodeURIComponent(book_id)}&order=tanggal.desc,created_at.desc&select=*`,
      { headers: sbHeaders }
    );
    if (!res.ok) throw new Error(`Supabase error ${res.status}`);
    const transactions = await res.json();
    return NextResponse.json({ transactions: Array.isArray(transactions) ? transactions : [] });
  } catch (err) {
    console.error("Transactions GET error:", err);
    return NextResponse.json({ transactions: [] });
  }
}

export async function POST(req: NextRequest) {
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();
    const { book_id, tanggal, keterangan, kategori, jenis, nominal } = body;

    if (!book_id || !tanggal || !keterangan?.trim() || !kategori || !jenis || !nominal) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }
    if (!["pemasukan", "pengeluaran"].includes(jenis)) {
      return NextResponse.json({ error: "Jenis tidak valid." }, { status: 400 });
    }
    const n = parseInt(String(nominal), 10);
    if (isNaN(n) || n <= 0) {
      return NextResponse.json({ error: "Nominal tidak valid." }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
      method: "POST",
      headers: { ...sbHeaders, "Prefer": "return=representation" },
      body: JSON.stringify({
        book_id,
        tanggal,
        keterangan: keterangan.trim(),
        kategori,
        jenis,
        nominal: n,
      }),
    });
    const inserted = await res.json();
    return NextResponse.json({ transaction: inserted[0] });
  } catch (err) {
    console.error("Transactions POST error:", err);
    return NextResponse.json({ error: "Gagal menyimpan transaksi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });

    await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`, {
      method: "DELETE",
      headers: { ...sbHeaders, "Prefer": "return=minimal" },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Transactions DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus transaksi." }, { status: 500 });
  }
}
