// KoboILM (LiteLLM) — OpenAI-compatible API
// No SDK needed, pure fetch
import { NextRequest, NextResponse } from "next/server";
import type { FileContent } from "@/lib/extractFileContent";
import type { ChatMessage, GeminiContractResult } from "@/lib/types";
import { validateToken } from "@/app/api/token/route";

const KOBOI_BASE = "https://litellm.koboi2026.biz.id";
const KOBOI_KEY = process.env.KOBOI_API_KEY!;
const MODEL = "vertex_ai/gemini-2.0-flash";

const SYSTEM_PROMPT = `Anda adalah 'Sada', seorang penasihat hukum AI dan asisten pribadi gratis untuk pelaku UMKM (Usaha Mikro, Kecil, dan Menengah) di Indonesia.

PANDUAN PERSONA & GAYA BAHASA (KASUAL & DEKAT DENGAN RAKYAT):
1. Gunakan bahasa Indonesia yang santai, bersahabat, penuh empati, namun tetap cerdas dan taktis—seperti teman dekat yang mengedukasi di warung kopi.
2. Panggil pengguna dengan sebutan ramah: "Kamu", "Sobat UMKM", atau "Mitra".
3. Berikan penjelasan hukum dengan analogi sederhana.

KEMAMPUAN DETEKSI SCAM & MANIPULASI:
1. Pengetahuan mendalam tentang hukum bisnis Indonesia (KUHPerdata, UU Perlindungan Konsumen, UU ITE, UU Cipta Kerja, dll.).
2. Waspada terhadap modus penipuan bisnis: investasi bodong, pasal jebakan pinjol ilegal, kontrak asimetris, fraud logistik, penahanan dana sepihak, exculpatory clauses.
3. DETEKSI MANIPULASI CHAT: Jika ada screenshot percakapan, analisis pola manipulasi seperti: tekanan waktu palsu ("harus tanda tangan hari ini"), gaslighting, FOMO buatan, ancaman terselubung, janji manis tidak tertulis, pengabaian pertanyaan kritis, bahasa yang membingungkan secara sengaja.

MULTI-DOKUMEN: Jika ada lebih dari 1 file, analisis semua secara holistik. Bandingkan isi chat dengan kontrak—apakah ada janji lisan yang bertentangan dengan klausul tertulis?

ATURAN OUTPUT (WAJIB FORMAT JSON MURNI):
Hanya respons JSON murni. JANGAN gunakan \`\`\`json. Langsung mulai dengan {.

---
MODE 'contract' — Analisis semua dokumen yang dilampirkan:
{
  "metrics": { "klausul": 12 },
  "riskLevel": "Tinggi",
  "scamScore": 82,
  "verdict": {
    "sah": true,
    "pesanSah": "Penjelasan santai soal keabsahan dokumen.",
    "bermasalah": true,
    "pesanBermasalah": "Sebutkan klausul bermasalah atau pola manipulasi yang ditemukan."
  },
  "summary": "Ringkasan 2-3 kalimat sederhana tentang semua dokumen.",
  "redFlags": ["Poin bahaya 1", "Poin bahaya 2"],
  "recommendations": ["Saran taktis 1", "Saran taktis 2"],
  "safetyChecklist": [
    "Verifikasi identitas dan legalitas perusahaan pihak lawan sebelum tanda tangan.",
    "Minta salinan kontrak setidaknya 3 hari sebelum deadline untuk review lebih teliti."
  ],
  "timeline": [
    {
      "section": "Pasal 1 - Definisi",
      "risk": "aman",
      "note": "Definisi standar, tidak ada jebakan."
    },
    {
      "section": "Pasal 3 - Pembayaran",
      "risk": "tinggi",
      "note": "Denda keterlambatan 5% per hari tanpa batas — ini bisa hancurkan keuangan kamu dalam seminggu."
    }
  ]
}
*riskLevel hanya boleh: "Rendah", "Sedang", atau "Tinggi".
*scamScore adalah angka 0-100 (100 = hampir pasti scam/jebakan, 0 = sangat aman). Hitung berdasarkan jumlah red flag, asimetri klausul, pola manipulasi, dan risiko keseluruhan.
*safetyChecklist: 3-5 langkah konkret spesifik untuk dokumen INI yang harus dilakukan sebelum tanda tangan.
*timeline.risk hanya boleh: "tinggi", "sedang", atau "aman". Maksimal 10 poin timeline, urutkan sesuai urutan dokumen. Tulis note dengan bahasa kasual dan konkret—jelaskan KENAPA berbahaya atau aman.

---
MODE 'chat' — Jawab pertanyaan lanjutan:
{ "reply": "Jawaban solutif dan kasual." }`;

interface ContractBody {
  mode: "contract";
  fileContent: FileContent[];
}

interface ChatBody {
  mode: "chat";
  message: string;
  history: ChatMessage[];
}

interface LetterBody {
  mode: "letter";
  analysisResult: GeminiContractResult;
}

type RequestBody = ContractBody | ChatBody | LetterBody;

export async function POST(req: NextRequest) {
  // Security: validate one-time token + origin
  const { valid, error } = validateToken(req);
  if (!valid) return NextResponse.json({ error: error ?? "Unauthorized." }, { status: 401 });

  try {
    const body: RequestBody = await req.json();
    if (!process.env.API_JUARA) {
      console.error("Hey we got an error");
    }

    let contents;

    if (body.mode === "contract") {
      const fileParts = body.fileContent.map((fc) =>
        fc.kind === "binary"
          ? {
              type: "image_url" as const,
              image_url: { url: `data:${fc.mimeType};base64,${fc.base64}` }
            }
          : {
              type: "text" as const,
              text: `KONTEN DOKUMEN (${fc.name}):\n${fc.text}`
            },
      );

      contents = [
        { role: "user", content: [{ type: "text", text: SYSTEM_PROMPT }, ...fileParts] },
      ];
    } else if (body.mode === "chat") {
      contents = [
        { role: "user", content: SYSTEM_PROMPT },
        ...body.history.map((msg) =>
          msg.role === "user"
            ? { role: "user" as const, content: msg.content }
            : { role: "assistant" as const, content: msg.content },
        ),
        { role: "user", content: body.message },
      ];
    } else {
      const { analysisResult } = body;
      const letterPrompt = `Anda adalah Legal Mate. Berdasarkan hasil analisis berikut, buatkan surat keberatan/balasan formal Bahasa Indonesia yang sopan namun tegas untuk dikirim kepada pihak lawan.

Hasil analisis:
- Ringkasan: ${analysisResult.summary}
- Tingkat risiko: ${analysisResult.riskLevel}
- Red Flags: ${analysisResult.redFlags.join("; ")}
- Rekomendasi: ${analysisResult.recommendations.join("; ")}

Format JSON:
{
  "subject": "Perihal surat singkat",
  "letter": "Isi surat lengkap dalam format surat resmi Indonesia dengan kop, tanggal, isi, dan penutup."
}`;

      contents = [{ role: "user", content: letterPrompt }];
    }

    const koboi = await fetch(`${KOBOI_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KOBOI_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: contents,
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!koboi.ok) {
      const err = await koboi.text();
      throw new Error(`KoboILM error ${koboi.status}: ${err}`);
    }

    const koboiData = await koboi.json();
    const text = koboiData.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);
    const tokenUsage = koboiData.usage?.total_tokens ?? 0;
    return NextResponse.json({ ...parsed, _tokenUsage: tokenUsage });
  } catch (err) {
    console.error("Analyze API error:", err);
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) {
      return NextResponse.json(
        { error: "Model AI sedang overload. Tunggu 30 detik lalu coba lagi." },
        { status: 503 },
      );
    }
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
      return NextResponse.json(
        { error: "Kuota API habis untuk hari ini. Coba lagi besok." },
        { status: 429 },
      );
    }
    if (msg.includes("400") || msg.includes("INVALID_ARGUMENT")) {
      return NextResponse.json(
        { error: "Format file tidak didukung atau ukuran terlalu besar." },
        { status: 400 },
      );
    }
    if (msg.includes("401") || msg.includes("API_KEY") || msg.includes("PERMISSION_DENIED")) {
      return NextResponse.json(
        { error: "API key tidak valid. Hubungi admin." },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Gagal menganalisis dokumen. Coba lagi." },
      { status: 500 },
    );
  }
}
