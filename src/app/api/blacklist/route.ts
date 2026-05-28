import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/api/token/route";
import { prisma } from "@/lib/prisma";
import { checkRate, checkBan, getIp } from "@/lib/security";

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

function serialize(r: {
  id: bigint; nama: string; jenis: string; modus: string;
  lokasi: string; kontak: string; scam_score: number; upvotes: number; created_at: Date;
}): BlacklistReport {
  return {
    id: Number(r.id),
    nama: r.nama,
    jenis: r.jenis,
    modus: r.modus,
    lokasi: r.lokasi,
    kontak: r.kontak,
    scam_score: r.scam_score,
    upvotes: r.upvotes,
    created_at: r.created_at.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = q
      ? {
          OR: [
            { nama: { contains: q, mode: "insensitive" as const } },
            { modus: { contains: q, mode: "insensitive" as const } },
            { jenis: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: [{ upvotes: "desc" }, { created_at: "desc" }],
        take: limit,
        skip,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({ reports: reports.map(serialize), total, page, limit });
  } catch (err) {
    console.error("Blacklist GET error:", err);
    return NextResponse.json({ error: "Gagal mengambil data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

  const ip = getIp(req);

  const ban = checkBan(ip);
  if (ban.banned) {
    return NextResponse.json(
      { error: "Akses diblokir sementara." },
      { status: 403, headers: { "Retry-After": String(ban.retryAfterSec) } },
    );
  }

  const rl = checkRate(`blacklist:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak laporan. Tunggu sebentar." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

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

    const existing = await prisma.report.findFirst({
      where: { nama: { equals: String(nama).trim(), mode: "insensitive" } },
      select: { id: true },
    });

    if (existing) {
      await prisma.report.update({
        where: { id: existing.id },
        data: { upvotes: { increment: 1 } },
      });
      return NextResponse.json({ action: "upvoted", id: Number(existing.id) });
    }

    const created = await prisma.report.create({
      data: {
        nama: String(nama).trim(),
        jenis: String(jenis).trim(),
        modus: String(modus).trim(),
        lokasi: lokasi ? String(lokasi).trim() : "",
        kontak: kontak ? String(kontak).trim() : "",
        scam_score: isNaN(score) ? 0 : score,
      },
    });
    return NextResponse.json({ action: "created", id: Number(created.id) });
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

    const existing = await prisma.report.findUnique({
      where: { id: BigInt(id) },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

    await prisma.report.update({
      where: { id: BigInt(id) },
      data: { upvotes: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blacklist PATCH error:", err);
    return NextResponse.json({ error: "Gagal upvote." }, { status: 500 });
  }
}
