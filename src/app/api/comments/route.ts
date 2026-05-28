import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/app/api/token/route";
import { prisma } from "@/lib/prisma";

export interface Comment {
  id: number;
  report_id: number;
  isi: string;
  created_at: string;
}

function serialize(c: { id: bigint; report_id: bigint; isi: string; created_at: Date }): Comment {
  return {
    id: Number(c.id),
    report_id: Number(c.report_id),
    isi: c.isi,
    created_at: c.created_at.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const report_id = searchParams.get("report_id");
    if (!report_id) return NextResponse.json({ comments: [] });

    const comments = await prisma.comment.findMany({
      where: { report_id: BigInt(report_id) },
      orderBy: { created_at: "asc" },
    });
    return NextResponse.json({ comments: comments.map(serialize) });
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
    if (String(isi).trim().length > 1000) {
      return NextResponse.json({ error: "Komentar terlalu panjang (maks 1000 karakter)." }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        report_id: BigInt(report_id),
        isi: String(isi).trim(),
      },
    });
    return NextResponse.json({ comment: serialize(comment) });
  } catch (err) {
    console.error("Comment POST error:", err);
    return NextResponse.json({ error: "Gagal menyimpan komentar." }, { status: 500 });
  }
}
