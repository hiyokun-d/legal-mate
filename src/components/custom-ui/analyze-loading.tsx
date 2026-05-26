"use client";

import { SadaAvatar } from "@/components/custom-ui/sada-avatar";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const steps = [
  "Membaca dan mengekstrak teks dokumen...",
  "Mengidentifikasi klausul dan pasal...",
  "Mengevaluasi risiko hukum...",
  "Menyusun laporan analisis...",
];

interface analyzeLoadingProps {
  onComplete: () => void;
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 block"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function AnalyzeLoading({ onComplete }: analyzeLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (currentStep >= steps.length) { onCompleteRef.current(); return; }
    const t = setTimeout(() => setCurrentStep((p) => p + 1), 700);
    return () => clearTimeout(t);
  }, [currentStep]);

  const progress = Math.min((currentStep / steps.length) * 100, 100);

  return (
    <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-black/20">
      {/* Progress bar top */}
      <div className="h-1 bg-slate-100 dark:bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <div className="p-6 space-y-6">
        {/* Sada header */}
        <div className="flex items-center gap-3">
          <SadaAvatar size="md" pulse glow />
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Sada · Sedang Bekerja
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Menganalisis dokumenmu
              </p>
              <ThinkingDots />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <div className="relative shrink-0 w-5 h-5 flex items-center justify-center">
                  {done ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14 }}
                      className="w-4 h-4 rounded-full bg-amber-500 dark:bg-amber-500 flex items-center justify-center"
                    >
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  ) : active ? (
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500"
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                  )}
                </div>

                <p className={`text-sm transition-all duration-300 ${
                  done
                    ? "text-slate-300 dark:text-slate-600 line-through"
                    : active
                      ? "text-slate-800 dark:text-slate-100 font-semibold"
                      : "text-slate-300 dark:text-slate-600"
                }`}>
                  {step}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center">
          Ini mungkin membutuhkan 10–30 detik
        </p>
      </div>
    </div>
  );
}
