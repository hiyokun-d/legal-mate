"use client";

import { SadaAvatar } from "@/components/custom-ui/sada-avatar";
import { motion } from "framer-motion";
import { ArrowRight, FileSearch, ShieldCheck, Zap } from "lucide-react";

interface analyzeConfirmProps {
  onConfirm: () => void;
}

const features = [
  { icon: FileSearch, text: "Deteksi klausul jebakan & red flags" },
  { icon: ShieldCheck, text: "Analisis keabsahan & risiko hukum" },
  { icon: Zap, text: "Rekomendasi tindakan spesifik" },
];

export default function AnalyzeConfirm({ onConfirm }: analyzeConfirmProps) {
  return (
    <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-black/20 space-y-5">
      {/* Sada greeting */}
      <div className="flex items-start gap-3">
        <SadaAvatar size="md" pulse glow />
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Sada · AI Legal Advisor
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Hai! Sada siap memeriksa dokumenmu.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sada akan membaca setiap klausul dan memberi tahu kamu bagian mana yang berbahaya sebelum kamu tanda tangan.
          </p>
        </div>
      </div>

      {/* Feature list */}
      <div className="space-y-2 pl-1">
        {features.map(({ icon: Icon, text }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.3 }}
            className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300"
          >
            <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 shrink-0">
              <Icon className="size-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            {text}
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onConfirm}
        className="group w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
      >
        Mulai Analisis dengan Sada
        <motion.span
          animate={{ x: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ArrowRight className="size-4" />
        </motion.span>
      </motion.button>
    </div>
  );
}
