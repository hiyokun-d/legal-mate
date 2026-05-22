"use client";

import { AlertTriangle, Building2, Loader2, MapPin, Phone, Send, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BlacklistFormProps {
  prefillNama?: string;
  prefillModus?: string;
  prefillScamScore?: number;
  onSuccess?: () => void;
  compact?: boolean;
}

const JENIS_OPTIONS = [
  "Pinjol Ilegal",
  "Investasi Bodong",
  "Kontrak Jebakan",
  "Franchise Palsu",
  "Tengkulak Nakal",
  "Mitra Fiktif",
  "Penipuan Logistik",
  "Lainnya",
];

const card = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-black/20";

export default function BlacklistForm({
  prefillNama = "",
  prefillModus = "",
  prefillScamScore = 0,
  onSuccess,
  compact = false,
}: BlacklistFormProps) {
  const [nama, setNama] = useState(prefillNama);
  const [jenis, setJenis] = useState(JENIS_OPTIONS[0]);
  const [modus, setModus] = useState(prefillModus);
  const [lokasi, setLokasi] = useState("");
  const [kontak, setKontak] = useState("");
  const [loading, setLoading] = useState(false);

  const inputCls =
    "w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 dark:focus:border-emerald-500 transition-all";

  const handleSubmit = async () => {
    if (!nama.trim() || !modus.trim()) {
      toast.error("Nama dan modus wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, jenis, modus, lokasi, kontak, scam_score: prefillScamScore }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.action === "upvoted") {
        toast.success("Laporan serupa ditemukan — upvote ditambahkan!");
      } else {
        toast.success("Berhasil dilaporkan ke komunitas!");
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal melaporkan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={compact ? "space-y-3" : `${card} space-y-4`}>
      {!compact && (
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-red-500" />
          <p className="text-xs font-bold text-red-500 uppercase tracking-wide">
            Laporkan ke Komunitas
          </p>
        </div>
      )}

      {prefillScamScore >= 70 && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
          <AlertTriangle className="size-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
            Scam Score {prefillScamScore}/100 — sangat dianjurkan laporkan ke komunitas agar UMKM lain waspada.
          </p>
        </div>
      )}

      {/* Nama */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Building2 className="size-3" />
          Nama Perusahaan / Individu
        </label>
        <input
          className={inputCls}
          placeholder="cth: PT Maju Mundur Sejahtera"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
      </div>

      {/* Jenis */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Jenis Pelanggaran
        </label>
        <div className="flex flex-wrap gap-1.5">
          {JENIS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setJenis(opt)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                jenis === opt
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Modus */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Modus / Kronologi Singkat
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          placeholder="Jelaskan modus atau kronologi singkat kejadian..."
          value={modus}
          onChange={(e) => setModus(e.target.value)}
        />
      </div>

      {/* Lokasi & Kontak */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="size-3" /> Lokasi
          </label>
          <input
            className={inputCls}
            placeholder="cth: Jakarta Selatan"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Phone className="size-3" /> Kontak (opsional)
          </label>
          <input
            className={inputCls}
            placeholder="No. WA / email"
            value={kontak}
            onChange={(e) => setKontak(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500 hover:bg-red-400 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {loading ? "Melaporkan..." : "Laporkan ke Komunitas"}
      </button>

      <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center leading-relaxed">
        Laporan bersifat publik dan akan membantu UMKM lain waspada.
        Pastikan informasi yang kamu berikan akurat.
      </p>
    </div>
  );
}
