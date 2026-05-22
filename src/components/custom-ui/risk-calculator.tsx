"use client";

import type { GeminiContractResult } from "@/lib/types";
import { Calculator, ChevronDown, TrendingDown } from "lucide-react";
import { useState } from "react";

interface RiskCalculatorProps {
  data: GeminiContractResult;
}

const card = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-black/20";

function formatRupiah(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} Rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function estimateWorstCase(nominal: number, data: GeminiContractResult): {
  label: string;
  value: number;
  note: string;
}[] {
  const results = [];
  const score = data.scamScore ?? 0;
  const flags = data.redFlags ?? [];

  // Denda keterlambatan
  const hasDenda = flags.some((f) =>
    /denda|keterlambatan|penalti|penalty/i.test(f)
  );
  if (hasDenda) {
    const rate = score >= 70 ? 0.05 : 0.02;
    const days = score >= 70 ? 30 : 14;
    const total = nominal * rate * days;
    results.push({
      label: `Denda keterlambatan (${(rate * 100).toFixed(0)}%/hari × ${days} hari)`,
      value: total,
      note: "Jika terlambat bayar/deliver sesuai kontrak.",
    });
  }

  // Ganti rugi sepihak
  const hasGantiRugi = flags.some((f) =>
    /ganti rugi|kompensasi|klaim|wanprestasi/i.test(f)
  );
  if (hasGantiRugi) {
    const multiplier = score >= 70 ? 2 : 1.5;
    results.push({
      label: `Potensi klaim ganti rugi (${multiplier}× nominal)`,
      value: nominal * multiplier,
      note: "Klausul ganti rugi asimetris terdeteksi.",
    });
  }

  // Penahanan dana / DP hangus
  const hasPenahanan = flags.some((f) =>
    /tahan|hangus|deposit|dp|uang muka|jaminan/i.test(f)
  );
  if (hasPenahanan) {
    const pct = score >= 70 ? 0.5 : 0.3;
    results.push({
      label: `DP / jaminan hangus (${(pct * 100).toFixed(0)}% nominal)`,
      value: nominal * pct,
      note: "Jika kontrak dibatalkan sepihak oleh pihak lawan.",
    });
  }

  // Bunga pinjol
  const hasBunga = flags.some((f) => /bunga|interest|cicilan|pinjam/i.test(f));
  if (hasBunga) {
    const monthlyRate = score >= 70 ? 0.1 : 0.03;
    results.push({
      label: `Bunga akumulatif 12 bulan (${(monthlyRate * 100).toFixed(0)}%/bln)`,
      value: nominal * monthlyRate * 12,
      note: "Estimasi total bunga selama 1 tahun.",
    });
  }

  // Default: general risk
  if (results.length === 0) {
    const pct = score >= 70 ? 0.8 : score >= 40 ? 0.4 : 0.15;
    results.push({
      label: `Estimasi potensi kerugian (${(pct * 100).toFixed(0)}% dari nominal)`,
      value: nominal * pct,
      note: `Berdasarkan scam score ${score}/100.`,
    });
  }

  return results;
}

export default function RiskCalculator({ data }: RiskCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [rawValue, setRawValue] = useState("");
  const [nominal, setNominal] = useState<number | null>(null);

  const handleInput = (val: string) => {
    const clean = val.replace(/\D/g, "");
    setRawValue(clean ? Number(clean).toLocaleString("id-ID") : "");
    setNominal(clean ? Number(clean) : null);
  };

  const results = nominal ? estimateWorstCase(nominal, data) : [];
  const totalWorstCase = results.reduce((s, r) => s + r.value, 0);

  return (
    <div className={`${card} space-y-3`}>
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <Calculator className="size-4 text-amber-500" />
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            Kalkulator Risiko Finansial
          </p>
        </div>
        <ChevronDown
          className={`size-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Masukkan nominal kontrak untuk estimasi kerugian worst-case berdasarkan red flags yang ditemukan Sada.
          </p>

          {/* Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Nilai Kontrak (Rupiah)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                Rp
              </span>
              <input
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 transition-all"
                placeholder="50.000.000"
                value={rawValue}
                onChange={(e) => handleInput(e.target.value)}
              />
            </div>
          </div>

          {/* Results */}
          {nominal && results.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        {r.label}
                      </p>
                      <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70 mt-0.5">
                        {r.note}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400 shrink-0">
                      {formatRupiah(r.value)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total worst case */}
              <div className="flex items-center justify-between p-3.5 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/60 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingDown className="size-4 text-red-500" />
                  <div>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      Total Worst-Case
                    </p>
                    <p className="text-[10px] text-red-500/70 dark:text-red-400/70">
                      dari nilai kontrak {formatRupiah(nominal)}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-black text-red-600 dark:text-red-400">
                  {formatRupiah(totalWorstCase)}
                </p>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center">
                ⚠️ Estimasi berdasarkan analisis Sada. Bukan kalkulasi hukum resmi.
              </p>
            </div>
          )}

          {nominal && nominal < 1000 && (
            <p className="text-xs text-slate-400 text-center">
              Masukkan nominal yang lebih besar untuk estimasi akurat.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
