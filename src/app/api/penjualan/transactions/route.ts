import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/api/token/route";
import { prisma } from "@/lib/prisma";

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

function serialize(t: {
  id: bigint; book_id: string; tanggal: Date; keterangan: string;
  kategori: string; jenis: string; nominal: bigint; created_at: Date;
}): Transaction {
  return {
    id: Number(t.id),
    book_id: t.book_id,
    tanggal: t.tanggal.toISOString().slice(0, 10),
    keterangan: t.keterangan,
    kategori: t.kategori,
    jenis: t.jenis as "pemasukan" | "pengeluaran",
    nominal: Number(t.nominal),
    created_at: t.created_at.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const book_id = searchParams.get("book_id");
    if (!book_id) return NextResponse.json({ transactions: [] });

    const transactions = await prisma.transaction.findMany({
      where: { book_id },
      orderBy: [{ tanggal: "desc" }, { created_at: "desc" }],
    });
    return NextResponse.json({ transactions: transactions.map(serialize) });
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

    const transaction = await prisma.transaction.create({
      data: {
        book_id,
        tanggal: new Date(tanggal),
        keterangan: keterangan.trim(),
        kategori,
        jenis,
        nominal: BigInt(n),
      },
    });
    return NextResponse.json({ transaction: serialize(transaction) });
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

    await prisma.transaction.delete({ where: { id: BigInt(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Transactions DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus transaksi." }, { status: 500 });
  }
}
