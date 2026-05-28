"use client";

import BlacklistFeed from "@/components/custom-ui/blacklist-feed";
import BlacklistForm from "@/components/custom-ui/blacklist-form";
import { ThemeToggle } from "@/components/custom-ui/theme-toggle";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Shield, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BlacklistPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0A0805]/90 backdrop-blur-xl border-b border-amber-500/10 dark:border-amber-500/15">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Kembali
            </Link>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-sm shadow-red-500/30">
                <ShieldAlert className="size-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Blacklist Komunitas
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowForm((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all active:scale-95 ${
                showForm
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  : "bg-red-500 hover:bg-red-400 text-white shadow-md shadow-red-500/20"
              }`}
            >
              {showForm ? (
                <>
                  <X className="size-3.5" /> Tutup
                </>
              ) : (
                <>
                  <Plus className="size-3.5" /> Laporkan
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-14 min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 space-y-2"
          >
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-red-500" />
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                Database Penipu UMKM Indonesia
              </p>
            </div>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 leading-relaxed">
              Kumpulan laporan komunitas tentang perusahaan dan individu yang merugikan UMKM.
              Cek sebelum tanda tangan kontrak. Saling jaga, saling lindungi. 🛡️
            </p>
          </motion.div>

          
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm dark:shadow-black/20"
            >
              <BlacklistForm
                onSuccess={() => {
                  setShowForm(false);
                  setRefreshKey((k) => k + 1);
                }}
              />
            </motion.div>
          )}

          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <BlacklistFeed refreshKey={refreshKey} />
          </motion.div>

          <div className="h-8" />
        </div>
      </main>
    </>
  );
}
