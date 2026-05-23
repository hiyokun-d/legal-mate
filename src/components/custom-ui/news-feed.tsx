"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { NewsItem } from "@/app/api/news/route";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Baru saja";
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}d lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
}

function riskTag(title: string): { label: string; color: string } {
  const t = title.toLowerCase();
  if (
    t.includes("penipuan") ||
    t.includes("scam") ||
    t.includes("tipu") ||
    t.includes("modus")
  )
    return {
      label: "Penipuan",
      color: "bg-red-500/20 text-red-300 border-red-500/30",
    };
  if (
    t.includes("investasi") ||
    t.includes("bodong") ||
    t.includes("palsu") ||
    t.includes("ilegal")
  )
    return {
      label: "Investasi Bodong",
      color: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    };
  if (
    t.includes("kontrak") ||
    t.includes("perjanjian") ||
    t.includes("klausul")
  )
    return {
      label: "Kontrak",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    };
  return {
    label: "Waspada",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  };
}

export default function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const load = async (manual = false) => {
    if (manual) setLoading(true);
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        setItems(await res.json());
        setLastUpdate(new Date());
        setElapsed(0);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const refresh = setInterval(load, 60_000);
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, []);

  const displayed = items.slice(0, 9);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-16 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <h2 className="text-2xl font-bold text-white">
              Penipuan &amp; Scam Terkini
            </h2>
          </div>
          <p className="text-slate-400 text-sm pl-6">
            Berita nyata dari media Indonesia — diperbarui otomatis setiap menit
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-slate-500 tabular-nums">
              {elapsed < 60 ? `${elapsed}d` : `${Math.floor(elapsed / 60)}m`}{" "}
              lalu
            </span>
          )}
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-slate-800/50 border border-slate-700/50 animate-pulse"
            />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Gagal memuat berita. Periksa koneksi internet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((item, i) => {
            const tag = riskTag(item.title);
            return (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between gap-3 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-500 hover:bg-slate-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tag.color}`}
                    >
                      {tag.label}
                    </span>
                    <span className="text-[10px] text-slate-500 tabular-nums shrink-0">
                      {timeAgo(item.pubDate)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 leading-relaxed line-clamp-3 group-hover:text-white transition-colors">
                    {item.title}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium truncate">
                    {item.source}
                  </span>
                  <ExternalLink className="size-3 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </div>
              </a>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-slate-600">
        Sumber: Google News Indonesia · Data diambil langsung dari media
        terpercaya
      </p>
    </section>
  );
}
