"use client";

import type { TimelinePoint } from "@/lib/types";
import { AlertTriangle, CheckCircle2, ChevronDown, Eye, ShieldAlert } from "lucide-react";
import { useState } from "react";

interface RiskTimelineProps {
  timeline: TimelinePoint[];
  printMode?: boolean;
}

const RISK = {
  tinggi: {
    dot: "bg-red-500",
    ring: "ring-red-200",
    badge: "bg-red-50 text-red-600 border border-red-200",
    line: "bg-gradient-to-b from-red-300 to-red-200",
    card: "bg-red-50 border-red-200",
    text: "text-red-700",
    label: "Berbahaya",
    Icon: AlertTriangle,
    glow: "shadow-lg shadow-red-100",
    pulse: true,
  },
  sedang: {
    dot: "bg-amber-400",
    ring: "ring-amber-200",
    badge: "bg-amber-50 text-amber-600 border border-amber-200",
    line: "bg-gradient-to-b from-amber-200 to-amber-100",
    card: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    label: "Hati-hati",
    Icon: ShieldAlert,
    glow: "shadow-md shadow-amber-100",
    pulse: false,
  },
  aman: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    line: "bg-gradient-to-b from-emerald-200 to-slate-100",
    card: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    label: "Aman",
    Icon: CheckCircle2,
    glow: "",
    pulse: false,
  },
};

function lineColor(current: TimelinePoint, next: TimelinePoint | undefined) {
  if (!next) return "bg-slate-100";
  const order = { tinggi: 3, sedang: 2, aman: 1 };
  const higher = order[current.risk] >= order[next.risk] ? current.risk : next.risk;
  return RISK[higher].line;
}

export default function RiskTimeline({ timeline, printMode = false }: RiskTimelineProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const counts = {
    tinggi: timeline.filter((t) => t.risk === "tinggi").length,
    sedang: timeline.filter((t) => t.risk === "sedang").length,
    aman: timeline.filter((t) => t.risk === "aman").length,
  };

  const toggle = (i: number) => setActiveIndex(activeIndex === i ? null : i);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-black/20">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="size-4 text-slate-400 dark:text-slate-500" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Peta Risiko Kontrak
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2">
          {counts.tinggi > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
              <span className="size-1.5 rounded-full bg-red-500 inline-block" />
              {counts.tinggi} Berbahaya
            </span>
          )}
          {counts.sedang > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <span className="size-1.5 rounded-full bg-amber-400 inline-block" />
              {counts.sedang} Hati-hati
            </span>
          )}
          {counts.aman > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
              {counts.aman} Aman
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 py-3">
        {timeline.map((point, i) => {
          const cfg = RISK[point.risk];
          const isActive = printMode || activeIndex === i;
          const isLast = i === timeline.length - 1;
          const isDimmed = activeIndex !== null && !isActive;

          return (
            <div
              key={i}
              className={`transition-opacity duration-200 ${isDimmed ? "opacity-40" : "opacity-100"}`}
            >
              <div className="flex gap-3">
                {/* Left: dot + line */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => toggle(i)}
                    className={`relative size-3 rounded-full ring-2 ${cfg.dot} ${cfg.ring} shrink-0 mt-0.5 transition-transform duration-150 hover:scale-125 ${
                      isActive ? "scale-125" : ""
                    } ${cfg.pulse && !isActive ? "animate-pulse" : ""}`}
                    aria-label={`${point.section} — ${cfg.label}`}
                  />
                  {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-[24px] mt-1 ${lineColor(point, timeline[i + 1])}`} />
                  )}
                </div>

                {/* Right: content */}
                <div className="flex-1 pb-3">
                  <button
                    onClick={() => toggle(i)}
                    className="w-full text-left flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <cfg.Icon
                        className={`size-3.5 shrink-0 ${
                          point.risk === "tinggi"
                            ? "text-red-400"
                            : point.risk === "sedang"
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }`}
                      />
                      <span
                        className={`text-sm truncate transition-colors ${
                          isActive ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                        }`}
                      >
                        {point.section}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <ChevronDown
                        className={`size-3.5 text-slate-300 transition-transform duration-200 ${
                          isActive ? "rotate-180 text-slate-500" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded note */}
                  {isActive && (
                    <div
                      className={`mt-2 p-3 rounded-xl border text-xs leading-relaxed ${cfg.card} ${cfg.text} ${cfg.glow} animate-in fade-in slide-in-from-top-1 duration-150`}
                    >
                      {point.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-slate-300 pb-3">
        Klik bagian manapun untuk lihat detail
      </p>
    </div>
  );
}
