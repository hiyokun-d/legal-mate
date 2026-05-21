"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";

  return (
    <motion.button
      whileTap={{ scale: 0.85, rotate: isDark ? -30 : 30 }}
      whileHover={{ scale: 1.08 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ y: 14, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -14, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="block"
          >
            <Sun className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ y: 14, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -14, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="block"
          >
            <Moon className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
