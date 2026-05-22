"use client";

import type { GeminiContractResult, ChatMessage, GeminiLetterResult } from "@/lib/types";
import RiskTimeline from "@/components/custom-ui/risk-timeline";
import RiskCalculator from "@/components/custom-ui/risk-calculator";
import BlacklistForm from "@/components/custom-ui/blacklist-form";
import { SadaAvatar } from "@/components/custom-ui/sada-avatar";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  Mail,
  MessageSquare,
  Share2,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface AnalyzeResultProps {
  data: GeminiContractResult;
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  fileName: string;
  onGenerateLetter: () => Promise<GeminiLetterResult>;
}

const riskBadgeStyle = {
  Rendah: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
  Sedang: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
  Tinggi: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
};

const scamBarColor = (s: number) =>
  s >= 70 ? "bg-gradient-to-r from-red-500 to-red-600" : s >= 40 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500";

const scamLabel = (s: number) =>
  s >= 70 ? "Risiko Tinggi" : s >= 40 ? "Risiko Sedang" : "Relatif Aman";

const scamLabelColor = (s: number) =>
  s >= 70
    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
    : s >= 40
      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
      : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";

const card = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-black/20";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
  },
};

const itemTransition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const };

export default function AnalyzeResult({
  data,
  chatHistory,
  isChatLoading,
  fileName,
  onGenerateLetter,
}: AnalyzeResultProps) {
  const [letter, setLetter] = useState<GeminiLetterResult | null>(null);
  const [letterLoading, setLetterLoading] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showBlacklist, setShowBlacklist] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const score = data.scamScore ?? 0;

  const handleExportPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    toast.info("Membuat laporan PDF...");
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const element = printRef.current;
      if (!element) throw new Error("no element");
      const canvas = await html2canvas(element, {
        scale: 2, useCORS: true, logging: false,
        backgroundColor: "#f8fafc", windowWidth: 680,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const ih = (canvas.height * pw) / canvas.width;
      let y = 0;
      while (y < ih) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pw, ih);
        y += ph;
      }
      pdf.save(`laporan-sada-${fileName.replace(/\.[^.]+$/, "")}.pdf`);
      toast.success("PDF berhasil diunduh!");
    } catch {
      toast.error("Gagal membuat PDF. Coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (letter) { setShowLetter((v) => !v); return; }
    setLetterLoading(true);
    try {
      const result = await onGenerateLetter();
      setLetter(result);
      setShowLetter(true);
    } catch { toast.error("Gagal membuat surat balasan"); }
    finally { setLetterLoading(false); }
  };

  const handleCopyLetter = () => {
    if (!letter) return;
    navigator.clipboard.writeText(`${letter.subject}\n\n${letter.letter}`);
    toast.success("Surat disalin!");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🔍 *Laporan Sada AI*\n\n📄 ${fileName}\n⚠️ Risiko: ${data.riskLevel} (${score}/100)\n🚩 Red Flags: ${data.redFlags.length}\n\n` +
      `📝 Ringkasan:\n${data.summary}\n\n` +
      `🚨 Bahaya:\n${data.redFlags.slice(0, 3).map((f) => `• ${f}`).join("\n")}\n\n_Oleh Sada · Legal Mate AI_`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(
      `Laporan Sada — ${fileName}\nRisiko: ${data.riskLevel} (${score}/100)\n\n${data.summary}\n\nRed Flags:\n${data.redFlags.map((f) => `• ${f}`).join("\n")}\n\nRekomendasi:\n${data.recommendations.map((r) => `• ${r}`).join("\n")}`
    );
    toast.success("Ringkasan disalin!");
  };

  return (
    <div className="w-full max-w-lg space-y-4">
      {/* Action bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        {[
          {
            onClick: handleExportPDF,
            disabled: isDownloading,
            icon: isDownloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />,
            label: isDownloading ? "Membuat..." : "Unduh PDF",
            cls: "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm",
          },
          {
            onClick: handleGenerateLetter,
            disabled: letterLoading,
            icon: letterLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />,
            label: letter ? (showLetter ? "Sembunyikan" : "Tampilkan Surat") : "Buat Surat",
            cls: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50",
          },
          {
            onClick: handleShareWhatsApp,
            disabled: false,
            icon: <Share2 className="size-3.5" />,
            label: "WhatsApp",
            cls: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 hover:bg-green-100 dark:hover:bg-green-900/40",
          },
          {
            onClick: handleCopySummary,
            disabled: false,
            icon: <Copy className="size-3.5" />,
            label: "Salin",
            cls: "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700",
          },
          {
            onClick: () => setShowBlacklist((v) => !v),
            disabled: false,
            icon: <ShieldAlert className="size-3.5" />,
            label: "Laporkan",
            cls: score >= 70
              ? "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40 animate-pulse"
              : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 hover:bg-red-100",
          },
        ].map(({ onClick, disabled, icon, label, cls }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all disabled:opacity-60 ${cls}`}
          >
            {icon}
            {label}
          </motion.button>
        ))}
      </motion.div>

      {/* ── PDF CAPTURE AREA ── */}
      <motion.div
        ref={printRef}
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="space-y-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-3xl"
      >
        {/* Sada header (shows in PDF) */}
        <motion.div variants={stagger.item} transition={itemTransition} className={card}>
          <div className="flex items-center gap-3">
            <SadaAvatar size="md" />
            <div>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Sada · Legal Mate AI
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laporan Analisis — {fileName}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Scam meter */}
        <motion.div variants={stagger.item} transition={itemTransition} className={`${card} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-slate-400 dark:text-slate-500" />
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                Indikator Scam
              </p>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scamLabelColor(score)}`}>
              {scamLabel(score)}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>Aman</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{score} / 100</span>
              <span>Bahaya</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                className={`h-full rounded-full ${scamBarColor(score)}`}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={stagger.item} transition={itemTransition} className="grid grid-cols-3 gap-3">
          {[
            { val: data.metrics.klausul, label: "Klausul", style: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" },
            { val: data.riskLevel, label: "Risiko", style: `border ${riskBadgeStyle[data.riskLevel]}` },
            { val: data.redFlags.length, label: "Red Flags", style: "bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400" },
          ].map(({ val, label, style }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.04 }}
              className={`rounded-2xl p-3 text-center shadow-sm dark:shadow-black/20 ${style}`}
            >
              <p className="text-lg font-bold">{val}</p>
              <p className="text-xs opacity-70 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Verdict */}
        <motion.div variants={stagger.item} transition={itemTransition} className={`${card} space-y-3`}>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Verdict</p>
          {[
            { ok: data.verdict.sah, label: data.verdict.sah ? "Dokumen Sah" : "Dokumen Tidak Sah", msg: data.verdict.pesanSah },
            { ok: !data.verdict.bermasalah, label: data.verdict.bermasalah ? "Ada Klausul Bermasalah" : "Tidak Ada Masalah", msg: data.verdict.pesanBermasalah },
          ].map(({ ok, label, msg }, i) => (
            <div key={i} className="flex items-start gap-3">
              {ok ? (
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{msg}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Summary */}
        <motion.div variants={stagger.item} transition={itemTransition} className={`${card} space-y-2`}>
          <div className="flex items-center gap-2">
            <Info className="size-4 text-slate-400 dark:text-slate-500" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Ringkasan</p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.summary}</p>
        </motion.div>

        {/* Timeline */}
        {data.timeline?.length > 0 && (
          <motion.div variants={stagger.item} transition={itemTransition}>
            <RiskTimeline timeline={data.timeline} printMode={isDownloading} />
          </motion.div>
        )}

        {/* Red flags */}
        <motion.div variants={stagger.item} transition={itemTransition} className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 rounded-2xl p-4 shadow-sm dark:shadow-black/20 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-500" />
            <p className="text-xs font-bold text-red-500 uppercase tracking-wide">🚨 Red Flags</p>
          </div>
          <ul className="space-y-2">
            {data.redFlags.map((flag, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2 border border-red-100 dark:border-red-900/50"
              >
                <span className="text-red-500 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                {flag}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div variants={stagger.item} transition={itemTransition} className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 shadow-sm dark:shadow-black/20 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Rekomendasi</p>
          </div>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-3 py-2 border border-emerald-100 dark:border-emerald-900/50"
              >
                <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                {rec}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Safety checklist */}
        {data.safetyChecklist?.length > 0 && (
          <motion.div variants={stagger.item} transition={itemTransition} className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 shadow-sm dark:shadow-black/20 space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-4 text-blue-500" />
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                Checklist Sebelum Tanda Tangan
              </p>
            </div>
            <ul className="space-y-2">
              {data.safetyChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <div className="mt-0.5 w-4 h-4 rounded border-2 border-blue-300 dark:border-blue-700 shrink-0 flex items-center justify-center">
                    <span className="text-[9px] text-blue-400 dark:text-blue-500 font-bold">{i + 1}</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-800 pt-2">
              Dianalisis oleh Sada · Legal Mate AI · {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
            </p>
          </motion.div>
        )}

        {/* Risk Calculator */}
        <motion.div variants={stagger.item} transition={itemTransition}>
          <RiskCalculator data={data} />
        </motion.div>
      </motion.div>

      {/* Blacklist form (outside PDF capture area) */}
      <AnimatePresence>
        {showBlacklist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/50 rounded-2xl p-4 shadow-sm dark:shadow-black/20 space-y-3">
              <BlacklistForm
                prefillModus={data.redFlags.slice(0, 2).join(". ")}
                prefillScamScore={data.scamScore}
                onSuccess={() => setShowBlacklist(false)}
              />
              <div className="flex items-center justify-center">
                <a
                  href="/blacklist"
                  target="_blank"
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  <ExternalLink className="size-3" />
                  Lihat semua laporan komunitas
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter */}
      <AnimatePresence>
        {showLetter && letter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 shadow-sm dark:shadow-black/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-blue-400" />
                  <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Surat Balasan</p>
                </div>
                <button onClick={handleCopyLetter} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <Copy className="size-3" /> Salin
                </button>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Perihal: {letter.subject}</p>
              <pre className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{letter.letter}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat history */}
      {chatHistory.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <MessageSquare className="size-3.5 text-slate-400 dark:text-slate-500" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Percakapan dengan Sada</p>
          </div>
          <AnimatePresence initial={false}>
            {chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.04 * Math.min(i, 6) }}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && <SadaAvatar size="xs" />}
                <div
                  className={`rounded-2xl p-3.5 text-sm leading-relaxed max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-emerald-500 text-white"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm dark:shadow-black/20"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isChatLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5"
            >
              <SadaAvatar size="xs" pulse />
              <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-black/20">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className="h-24" />
    </div>
  );
}
