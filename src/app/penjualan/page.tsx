"use client";

import { ArrowRight, BookOpen, CheckCircle2, Copy, KeyRound, Loader2, PiggyBank, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { securePost } from "@/lib/secureRequest";

const card = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-black/20";
const input = "w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all font-mono tracking-wider uppercase";

export default function PenjualanPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [masukId, setMasukId] = useState("");
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("penjualan_ids") ?? "[]");
      if (Array.isArray(saved)) setRecentIds(saved.slice(0, 3));
    } catch {}
  }, []);

  const handleBuat = async () => {
    setCreating(true);
    try {
      const res = await securePost("/api/penjualan", { nama_usaha: "Usaha Saya" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const id: string = data.book.id;
      setNewId(id);
      const saved = JSON.parse(localStorage.getItem("penjualan_ids") ?? "[]");
      const updated = [id, ...saved.filter((x: string) => x !== id)].slice(0, 10);
      localStorage.setItem("penjualan_ids", JSON.stringify(updated));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat buku.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!newId) return;
    navigator.clipboard.writeText(newId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleMasuk = () => {
    const id = masukId.trim().toUpperCase();
    if (!id.startsWith("JUAL-") || id.length < 7) {
      toast.error("Format ID tidak valid. Contoh: JUAL-AB3X9Z");
      return;
    }
    router.push(`/penjualan/${id}`);
  };

  if (newId) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className={`${card} p-6 space-y-5`}>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="size-7 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Buku Berhasil Dibuat!</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ini adalah ID akses satu-satunya milik kamu</p>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-center space-y-3">
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-widest font-mono">{newId}</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
              >
                {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Tersalin!" : "Salin ID"}
              </button>
            </div>

            <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
              <ShieldCheck className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                <strong>Simpan ID ini!</strong> Satu-satunya cara akses buku kamu. Tidak ada email, tidak ada password — hanya ID ini.
              </p>
            </div>

            <Link
              href={`/penjualan/${newId}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all active:scale-95"
            >
              Buka Buku Saya <ArrowRight className="size-4" />
            </Link>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-600">
            ID sudah otomatis tersimpan di browser ini
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PiggyBank className="size-5 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">Catatan Penjualan</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">BETA</span>
          </Link>
          <Link href="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">← Kembali</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <PiggyBank className="size-3.5" /> Gratis · Tanpa Login · Privat
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            Catatan Penjualan<br />
            <span className="text-emerald-500">untuk UMKM Indonesia</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Catat pemasukan & pengeluaran bisnis kamu tanpa ribet. Tidak perlu daftar, tidak perlu email — cukup simpan ID akses kamu.
          </p>
        </div>

        {/* Two options */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Buat buku baru */}
          <div className={`${card} p-6 space-y-4 flex flex-col`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Buat Buku Baru</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mulai dari awal</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
              Sistem akan membuat ID unik untuk kamu. Simpan ID-nya, dan gunakan setiap kali ingin mengakses catatan kamu.
            </p>
            <button
              onClick={handleBuat}
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
            >
              {creating ? <Loader2 className="size-4 animate-spin" /> : <BookOpen className="size-4" />}
              {creating ? "Membuat..." : "Buat Buku Baru"}
            </button>
          </div>

          {/* Masuk dengan ID */}
          <div className={`${card} p-6 space-y-4 flex flex-col`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <KeyRound className="size-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Masuk dengan ID</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sudah punya buku?</p>
              </div>
            </div>
            <div className="flex-1">
              <input
                className={input}
                placeholder="JUAL-XXXXXX"
                value={masukId}
                onChange={(e) => setMasukId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleMasuk()}
                maxLength={11}
              />
            </div>
            <button
              onClick={handleMasuk}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
            >
              <ArrowRight className="size-4" />
              Buka Buku
            </button>
          </div>
        </div>

        {/* Recent books */}
        {recentIds.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Terakhir Dibuka</p>
            <div className="flex flex-wrap gap-2">
              {recentIds.map((id) => (
                <Link
                  key={id}
                  href={`/penjualan/${id}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                >
                  <BookOpen className="size-3" /> {id}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Features grid */}
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { icon: "📊", label: "Grafik 7 Hari" },
            { icon: "💰", label: "Saldo Otomatis" },
            { icon: "📋", label: "Export Catatan" },
            { icon: "🔒", label: "Privat & Aman" },
          ].map((f) => (
            <div key={f.label} className={`${card} p-4 space-y-1`}>
              <div className="text-2xl">{f.icon}</div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
