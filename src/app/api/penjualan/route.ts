import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/api/token/route";
import { prisma } from "@/lib/prisma";

function genId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "JUAL-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function serializeBook(b: { id: string; nama_usaha: string; created_at: Date }) {
  return { id: b.id, nama_usaha: b.nama_usaha, created_at: b.created_at.toISOString() };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });

  try {
    const book = await prisma.ledgerBook.findUnique({ where: { id } });
    if (!book) return NextResponse.json({ error: "Buku tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ book: serializeBook(book) });
  } catch (err) {
    console.error("Penjualan GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();
    const nama_usaha = (body.nama_usaha ?? "Usaha Saya").trim();

    let id = genId();
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await prisma.ledgerBook.findUnique({ where: { id }, select: { id: true } });
      if (!existing) break;
      id = genId();
    }

    const book = await prisma.ledgerBook.create({ data: { id, nama_usaha } });
    return NextResponse.json({ book: serializeBook(book) });
  } catch (err) {
    console.error("Penjualan POST error:", err);
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
    await prisma.ledgerBook.update({
      where: { id },
      data: { nama_usaha: nama_usaha.trim() },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Penjualan PATCH error:", err);
    return NextResponse.json({ error: "Gagal mengupdate nama." }, { status: 500 });
  }
}
