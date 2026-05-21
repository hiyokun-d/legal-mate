"use client";

import type { NewsItem } from "@/app/api/news/route";
import { useEffect, useState } from "react";

export default function NewsTicker() {
  const [items, setItems] = useState<NewsItem[]>([]);

  const load = async () => {
    try {
      const res = await fetch("/api/news");
      if (res.ok) setItems(await res.json());
    } catch {}
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  if (items.length === 0) return null;

  // duplicate so the loop looks seamless
  const doubled = [...items, ...items];

  return (
    <div className="w-full bg-red-600 overflow-hidden py-2 border-b border-red-700">
      <div className="flex items-center gap-0">
        {/* fixed label */}
        <div className="shrink-0 flex items-center gap-2 px-4 bg-red-700 h-full self-stretch mr-3 z-10">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-white text-xs font-bold tracking-widest uppercase whitespace-nowrap">
            Siaga
          </span>
        </div>

        {/* scrolling content */}
        <div className="overflow-hidden flex-1">
          <div className="flex gap-8 whitespace-nowrap animate-ticker">
            {doubled.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-100 hover:text-white transition-colors shrink-0"
              >
                <span className="text-red-300 mr-2">▸</span>
                {item.title}
                <span className="text-red-400 ml-2 font-medium">[{item.source}]</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
