"use client";

import { Clock, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface TokenWidgetProps {
  totalTokens: number;
}

const DAILY_LIMIT = 1_000_000;

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TokenWidget({ totalTokens }: TokenWidgetProps) {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const pct = Math.min((totalTokens / DAILY_LIMIT) * 100, 100);

  useEffect(() => {
    const id = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const barColor =
    pct > 80 ? "bg-red-400" : pct > 50 ? "bg-amber-400" : "bg-emerald-400";

  const textColor =
    pct > 80
      ? "text-red-500"
      : pct > 50
        ? "text-amber-500"
        : "text-emerald-500";

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm px-3 py-2.5 w-44 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap
              className={`size-3 ${textColor} transition-colors duration-500`}
            />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Tokens
            </span>
          </div>
          <span className="text-sm font-bold text-slate-800 tabular-nums transition-all duration-300">
            {totalTokens.toLocaleString()}
          </span>
        </div>

        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${Math.max(pct, totalTokens > 0 ? 2 : 0)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="tabular-nums">
            {totalTokens >= 1000
              ? `${(totalTokens / 1000).toFixed(1)}K`
              : totalTokens}{" "}
            / 1M
          </span>
          <div className="flex items-center gap-1">
            <Clock className="size-2.5 shrink-0" />
            <span className="tabular-nums">{countdown}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
