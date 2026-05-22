"use client";

import type { BlacklistReport } from "@/app/api/blacklist/route";
import { AlertTriangle, ChevronUp, Loader2, MapPin, Phone, Search, Shield, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const card = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-black/20";

const jenisColor: Record<string, string> = {
  "Pinjol Ilegal": "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50",
  "Investasi Bodong": "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50",
  "Kontrak Jebakan": "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50",
  "Franchise Palsu": "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50",
  "Tengkulak Nakal": "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/50",
  "Mitra Fiktif": "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900/50",
  "Penipuan Logistik": "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50",
  "Lainnya": "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
};

const scamBarColor = (s: number) =>
  s >= 70 ? "bg-gradient-to-r from-red-500 to-red-600" : s >= 40 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export default function BlacklistFeed({ refreshKey }: { refreshKey?: number }) {
  const [reports, setReports] = useState<BlacklistReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [upvoted, setUpvoted] = useState<Set<number>>(new Set());

  const fetchReports = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blacklist?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setReports(data.reports ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("Gagal memuat blacklist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(search);
  }, [fetchReports, search, refreshKey]);

  const handleSearch = () => setSearch(query);

  const handleUpvote = async (id: number) => {
    if (upvoted.has(id)) return;
    setUpvoted((prev) => new Set([...prev, id]));
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
    try {
      await fetch("/api/blacklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      // silently fail, UI already updated
    }
  };

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-slate-400 dark:text-slate-500" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Database Komunitas
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          {total} laporan
        </span>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <input
            className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
            placeholder="Cari nama perusahaan / modus..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all active:scale-95"
        >
          Cari
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-5 text-emerald-500 animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className={`${card} p-8 text-center space-y-2`}>
          <Shield className="size-8 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {search ? "Tidak ada hasil untuk pencarian ini." : "Belum ada laporan. Jadilah yang pertama!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className={`${card} p-4 space-y-3`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {report.nama}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${jenisColor[report.jenis] ?? jenisColor["Lainnya"]}`}>
                      {report.jenis}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {timeAgo(report.created_at)}
                    {report.lokasi && ` · ${report.lokasi}`}
                  </p>
                </div>

                {/* Upvote */}
                <button
                  onClick={() => handleUpvote(report.id)}
                  disabled={upvoted.has(report.id)}
                  className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 ${
                    upvoted.has(report.id)
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  <ChevronUp className="size-3.5" />
                  <span className="text-[10px] font-bold">{report.upvotes}</span>
                </button>
              </div>

              {/* Scam score */}
              {report.scam_score > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>Scam Score</span>
                    <span className="font-bold">{report.scam_score}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${scamBarColor(report.scam_score)}`}
                      style={{ width: `${report.scam_score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Modus */}
              <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 border border-slate-100 dark:border-slate-700">
                <AlertTriangle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{report.modus}</p>
              </div>

              {/* Kontak */}
              {report.kontak && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  <Phone className="size-3" />
                  <span>{report.kontak}</span>
                </div>
              )}

              {report.lokasi && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  <MapPin className="size-3" />
                  <span>{report.lokasi}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
