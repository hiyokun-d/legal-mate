"use client";

import type { Transaction } from "@/app/api/penjualan/transactions/route";
import { secureDelete, securePost, securePatch } from "@/lib/secureRequest";
import {
  ArrowDownCircle, ArrowUpCircle, CalendarDays, Check, ChevronDown, ClipboardCopy,
  KeyRound, Loader2, PiggyBank, Plus, Trash2, TrendingUp, Wallet, X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

const card = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-black/20";
const inp = "w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all";

const PEMASUKAN_KAT = ["Penjualan Produk","Jasa","Piutang Masuk","Lain-lain"];
const PENGELUARAN_KAT = ["Bahan Baku","Operasional","Gaji","Sewa","Transportasi","Hutang Keluar","Lain-lain"];

function fmtRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function fmtInput(v: string) {
  const num = v.replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
}

interface Book {
  id: string;
  nama_usaha: string;
  created_at: string;
}

type Filter = "semua" | "minggu" | "bulan";
type JenisFilter = "semua" | "pemasukan" | "pengeluaran";

export default function LedgerPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Editable name
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  // Form
  const [jenis, setJenis] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [tanggal, setTanggal] = useState(today());
  const [keterangan, setKeterangan] = useState("");
  const [kategori, setKategori] = useState(PEMASUKAN_KAT[0]);
  const [nominal, setNominal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [filter, setFilter] = useState<Filter>("bulan");
  const [jenisFilter, setJenisFilter] = useState<JenisFilter>("semua");

  // Fetch book
  const fetchBook = useCallback(async () => {
    const res = await fetch(`/api/penjualan?id=${encodeURIComponent(bookId)}`);
    if (res.status === 404) { setNotFound(true); setLoading(false); return; }
    const data = await res.json();
    setBook(data.book);
    setNameVal(data.book.nama_usaha);
  }, [bookId]);

  // Fetch transactions
  const fetchTxs = useCallback(async () => {
    const res = await fetch(`/api/penjualan/transactions?book_id=${encodeURIComponent(bookId)}`);
    const data = await res.json();
    setTxs(data.transactions ?? []);
  }, [bookId]);

  useEffect(() => {
    Promise.all([fetchBook(), fetchTxs()]).finally(() => setLoading(false));
  }, [fetchBook, fetchTxs]);

  // Save ID to localStorage
  useEffect(() => {
    if (!book) return;
    try {
      const saved = JSON.parse(localStorage.getItem("penjualan_ids") ?? "[]");
      const updated = [bookId, ...saved.filter((x: string) => x !== bookId)].slice(0, 10);
      localStorage.setItem("penjualan_ids", JSON.stringify(updated));
    } catch {}
  }, [book, bookId]);

  // Summary
  const summary = useMemo(() => {
    const totalPemasukan = txs.filter(t => t.jenis === "pemasukan").reduce((s, t) => s + t.nominal, 0);
    const totalPengeluaran = txs.filter(t => t.jenis === "pengeluaran").reduce((s, t) => s + t.nominal, 0);
    const bulanIni = new Date().toISOString().slice(0, 7);
    const txBulan = txs.filter(t => t.tanggal.startsWith(bulanIni)).length;
    return { totalPemasukan, totalPengeluaran, saldo: totalPemasukan - totalPengeluaran, txBulan };
  }, [txs]);

  // Chart data — last 7 days
  const chartData = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days.map(date => ({
      date: dayLabel(date),
      Pemasukan: txs.filter(t => t.tanggal === date && t.jenis === "pemasukan").reduce((s, t) => s + t.nominal, 0) / 1000,
      Pengeluaran: txs.filter(t => t.tanggal === date && t.jenis === "pengeluaran").reduce((s, t) => s + t.nominal, 0) / 1000,
    }));
  }, [txs]);

  // Filtered txs
  const filteredTxs = useMemo(() => {
    let res = [...txs];
    if (jenisFilter !== "semua") res = res.filter(t => t.jenis === jenisFilter);
    if (filter === "minggu") {
      const d = new Date(); d.setDate(d.getDate() - 7);
      res = res.filter(t => new Date(t.tanggal) >= d);
    } else if (filter === "bulan") {
      const m = new Date().toISOString().slice(0, 7);
      res = res.filter(t => t.tanggal.startsWith(m));
    }
    return res;
  }, [txs, filter, jenisFilter]);

  // Submit transaction
  const handleSubmit = async () => {
    const nominalNum = parseInt(nominal.replace(/\./g, ""));
    if (!keterangan.trim() || !tanggal || isNaN(nominalNum) || nominalNum <= 0) {
      toast.error("Lengkapi semua field ya."); return;
    }
    setSubmitting(true);
    try {
      const res = await securePost("/api/penjualan/transactions", {
        book_id: bookId, tanggal, keterangan, kategori, jenis, nominal: nominalNum,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTxs(prev => [data.transaction, ...prev].sort((a, b) =>
        b.tanggal.localeCompare(a.tanggal) || b.created_at.localeCompare(a.created_at)
      ));
      setKeterangan(""); setNominal("");
      toast.success(jenis === "pemasukan" ? "Pemasukan dicatat!" : "Pengeluaran dicatat!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete transaction
  const handleDelete = async (id: number) => {
    setTxs(prev => prev.filter(t => t.id !== id));
    try {
      await secureDelete("/api/penjualan/transactions", { id });
    } catch {
      await fetchTxs();
      toast.error("Gagal menghapus.");
    }
  };

  // Save name
  const handleSaveName = async () => {
    if (!nameVal.trim() || !book) return;
    setEditingName(false);
    setBook(b => b ? { ...b, nama_usaha: nameVal.trim() } : b);
    try {
      await securePatch("/api/penjualan", { id: bookId, nama_usaha: nameVal.trim() });
    } catch {
      toast.error("Gagal simpan nama.");
    }
  };

  // Export
  const handleExport = () => {
    const lines = [
      `=== CATATAN PENJUALAN ===`,
      `Usaha: ${book?.nama_usaha ?? bookId}`,
      `ID: ${bookId}`,
      `Diekspor: ${new Date().toLocaleString("id-ID")}`,
      ``,
      `RINGKASAN`,
      `Total Pemasukan  : ${fmtRp(summary.totalPemasukan)}`,
      `Total Pengeluaran: ${fmtRp(summary.totalPengeluaran)}`,
      `Saldo Bersih     : ${fmtRp(summary.saldo)}`,
      ``,
      `TRANSAKSI (${filteredTxs.length} data)`,
      `─`.repeat(50),
      ...filteredTxs.map(t =>
        `[${t.tanggal}] ${t.jenis === "pemasukan" ? "+" : "-"}${fmtRp(t.nominal).replace("Rp ","")} | ${t.keterangan} (${t.kategori})`
      ),
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => toast.success("Catatan berhasil disalin!"));
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <Loader2 className="size-6 text-emerald-500 animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-4xl">📒</div>
      <p className="font-bold text-slate-900 dark:text-white text-lg">Buku tidak ditemukan</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">ID <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{bookId}</span> tidak ada di database.</p>
      <Link href="/penjualan" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all active:scale-95 text-sm">
        ← Kembali ke Halaman Utama
      </Link>
    </div>
  );

  const katOptions = jenis === "pemasukan" ? PEMASUKAN_KAT : PENGELUARAN_KAT;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <PiggyBank className="size-5 text-emerald-500 shrink-0" />
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={nameRef}
                  className="text-sm font-bold bg-transparent border-b-2 border-emerald-400 text-slate-900 dark:text-white outline-none max-w-[180px]"
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-1 text-emerald-500 hover:text-emerald-400"><Check className="size-3.5" /></button>
                <button onClick={() => setEditingName(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="size-3.5" /></button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingName(true); setTimeout(() => nameRef.current?.select(), 50); }}
                className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate"
              >
                {book?.nama_usaha ?? bookId}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <KeyRound className="size-3 text-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{bookId}</span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            >
              <ClipboardCopy className="size-3.5" /> Export
            </button>
            <Link href="/penjualan" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Ganti</Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Pemasukan", val: fmtRp(summary.totalPemasukan), icon: ArrowUpCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Total Pengeluaran", val: fmtRp(summary.totalPengeluaran), icon: ArrowDownCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
            { label: "Saldo Bersih", val: fmtRp(summary.saldo), icon: Wallet, color: summary.saldo >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500", bg: "bg-white dark:bg-slate-900" },
            { label: "Tx Bulan Ini", val: `${summary.txBulan}x`, icon: CalendarDays, color: "text-slate-500", bg: "bg-white dark:bg-slate-900" },
          ].map(({ label, val, icon: Icon, color, bg }) => (
            <div key={label} className={`${card} ${bg} p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">{label}</p>
                <Icon className={`size-4 ${color} shrink-0`} />
              </div>
              <p className={`text-base font-black ${color} leading-tight`}>{val}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className={`${card} p-4 space-y-3`}>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">7 Hari Terakhir <span className="text-slate-400 font-normal">(dalam ribuan Rp)</span></p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-500" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "currentColor" }} className="text-slate-500" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-slate-900, #0f172a)", border: "1px solid #334155", borderRadius: 12, fontSize: 11 }}
                formatter={(v: number) => [`Rp ${(v * 1000).toLocaleString("id-ID")}`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Pemasukan" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Add Transaction Form */}
        <div className={`${card} p-4 space-y-4`}>
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-slate-400" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Catat Transaksi</p>
          </div>

          {/* Jenis toggle */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { setJenis("pemasukan"); setKategori(PEMASUKAN_KAT[0]); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-all ${jenis === "pemasukan" ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
            >
              <ArrowUpCircle className="size-4" /> Pemasukan
            </button>
            <button
              onClick={() => { setJenis("pengeluaran"); setKategori(PENGELUARAN_KAT[0]); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-all ${jenis === "pengeluaran" ? "bg-red-500 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
            >
              <ArrowDownCircle className="size-4" /> Pengeluaran
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tanggal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tanggal</label>
              <input type="date" className={inp} value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kategori</label>
              <div className="relative">
                <select
                  className={`${inp} appearance-none pr-8`}
                  value={kategori}
                  onChange={e => setKategori(e.target.value)}
                >
                  {katOptions.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Keterangan</label>
            <input
              className={inp}
              placeholder={jenis === "pemasukan" ? "cth: Jual baju batik 5 pcs" : "cth: Beli bahan baku kain"}
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nominal (Rupiah)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">Rp</span>
              <input
                className={`${inp} pl-9`}
                placeholder="0"
                value={nominal}
                inputMode="numeric"
                onChange={e => setNominal(fmtInput(e.target.value))}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-all active:scale-95 text-sm text-white disabled:opacity-60 ${jenis === "pemasukan" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-red-500 hover:bg-red-400"}`}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {submitting ? "Menyimpan..." : `Catat ${jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran"}`}
          </button>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1">
              {(["minggu","bulan","semua"] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all capitalize ${filter === f ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400"}`}
                >
                  {f === "minggu" ? "7 Hari" : f === "bulan" ? "Bulan Ini" : "Semua"}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(["semua","pemasukan","pengeluaran"] as JenisFilter[]).map(j => (
                <button
                  key={j}
                  onClick={() => setJenisFilter(j)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all capitalize ${jenisFilter === j ? (j === "pemasukan" ? "bg-emerald-500 text-white" : j === "pengeluaran" ? "bg-red-500 text-white" : "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900") : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400"}`}
                >
                  {j === "semua" ? "Semua" : j === "pemasukan" ? "↑ Masuk" : "↓ Keluar"}
                </button>
              ))}
            </div>
          </div>

          {filteredTxs.length === 0 ? (
            <div className={`${card} p-8 text-center space-y-2`}>
              <div className="text-3xl">📭</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada transaksi di periode ini.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTxs.map(tx => (
                <div key={tx.id} className={`${card} flex items-center gap-3 px-4 py-3`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tx.jenis === "pemasukan" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"}`}>
                    {tx.jenis === "pemasukan"
                      ? <ArrowUpCircle className="size-4 text-emerald-500" />
                      : <ArrowDownCircle className="size-4 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{tx.keterangan}</p>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">{tx.kategori}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tx.tanggal}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className={`text-sm font-black ${tx.jenis === "pemasukan" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                      {tx.jenis === "pemasukan" ? "+" : "-"}{fmtRp(tx.nominal)}
                    </p>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTxs.length > 0 && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-600">
              {filteredTxs.length} transaksi · {fmtRp(filteredTxs.filter(t=>t.jenis==="pemasukan").reduce((s,t)=>s+t.nominal,0))} masuk · {fmtRp(filteredTxs.filter(t=>t.jenis==="pengeluaran").reduce((s,t)=>s+t.nominal,0))} keluar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
