import NewsTicker from "@/components/custom-ui/news-ticker";
import NewsFeed from "@/components/custom-ui/news-feed";
import { ThemeToggle } from "@/components/custom-ui/theme-toggle";
import {
  AlertTriangle, ArrowRight, Bot, FileSearch, FileText,
  MessageSquare, Shield, ShieldAlert, ShieldCheck, Sparkles,
  Upload, Users, Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0805] text-slate-900 dark:text-white selection:bg-amber-500/30">

      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A0805]/85 backdrop-blur-xl border-b border-amber-500/10 dark:border-amber-500/15">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
              <ShieldCheck className="size-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Legal Mate</span>
              <span className="hidden sm:inline text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">by Sada AI</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "#cara-kerja", label: "Cara Kerja" },
              { href: "#fitur", label: "Fitur" },
              { href: "/blacklist", label: "Blacklist" },
              { href: "/penjualan", label: "💰 Penjualan" },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/app"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 text-sm font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
            >
              Mulai Gratis <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      
      <div className="fixed top-16 left-0 right-0 z-40">
        <NewsTicker />
      </div>

      
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-40 pb-24 px-6 overflow-hidden">
        
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(180,120,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(180,120,0,1) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/8 dark:bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-600/5 dark:bg-red-600/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-amber-400/5 dark:bg-amber-400/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/8 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-semibold">
            <Sparkles className="size-3.5" />
            Didukung Google Gemini AI · Untuk UMKM Indonesia Emas 🇮🇩
          </div>

          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight">
            Jangan Tandatangani
            <br />
            <span className="animate-shimmer-gold">
              Sebelum Tanya Sada
            </span>
          </h1>

          
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Penasihat hukum AI khusus UMKM Indonesia. Upload kontrak, surat perjanjian, atau screenshot chat — Sada deteksi{" "}
            <span className="text-red-500 dark:text-red-400 font-semibold">jebakan tersembunyi</span>,{" "}
            <span className="text-amber-600 dark:text-amber-400 font-semibold">klausul tidak adil</span>, dan{" "}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">modus manipulasi</span>{" "}
            dalam hitungan detik.
          </p>

          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/app"
              className="flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-base rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/25 animate-glow-gold"
            >
              Analisis Kontrak Sekarang <ArrowRight className="size-4" />
            </Link>
            <a
              href="#cara-kerja"
              className="flex items-center gap-2 px-7 py-3.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-semibold text-base rounded-2xl border border-slate-200 dark:border-white/10 transition-all"
            >
              Lihat Cara Kerjanya
            </a>
          </div>

          
          <div className="flex flex-wrap justify-center gap-10 pt-4">
            {[
              { value: "100%", label: "Gratis Selamanya" },
              { value: "Gemini", label: "AI Engine" },
              { value: "3 Modus", label: "Analisis Lengkap" },
              { value: "<10d", label: "Waktu Analisis" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        
        <div className="relative z-10 mt-16 animate-float">
          <div className="flex items-start gap-3 bg-white dark:bg-[#130F07]/90 shadow-xl shadow-amber-500/5 dark:shadow-black/50 border border-red-200 dark:border-red-500/25 rounded-2xl px-5 py-4 shadow-2xl shadow-black/10 dark:shadow-black/50 max-w-xs">
            <div className="p-2 bg-red-500/10 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="size-4 text-red-500 dark:text-red-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wide">Red Flag Terdeteksi</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                &ldquo;Denda keterlambatan 5% per hari tanpa batas —{" "}
                <span className="text-red-500 dark:text-red-300 font-medium">bisa hancurkan bisnis kamu dalam seminggu.</span>&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <div id="berita" className="bg-slate-50 dark:bg-[#0D0A06] border-t border-slate-200 dark:border-amber-500/10 py-8">
        <NewsFeed />
      </div>

      
      <section id="cara-kerja" className="bg-white dark:bg-[#0A0805] border-t border-slate-200 dark:border-amber-500/10 px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">Cara Kerja</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Tiga Langkah. Selesai.</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Tidak perlu latar belakang hukum. Tidak perlu bayar pengacara. Cukup upload dan biarkan Sada bekerja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[calc(33%-1rem)] right-[calc(33%-1rem)] h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            {[
              {
                step: "01",
                icon: <Upload className="size-6" />,
                title: "Upload Dokumen",
                desc: "Drag & drop kontrak PDF, DOCX, foto, atau screenshot percakapan.",
                color: "from-blue-500/8 to-blue-600/4 border-blue-500/20",
                iconColor: "text-blue-500 dark:text-blue-400 bg-blue-500/10",
              },
              {
                step: "02",
                icon: <Bot className="size-6" />,
                title: "AI Menganalisis",
                desc: "Sada membaca setiap klausul, mendeteksi modus manipulasi, dan membandingkan isi chat dengan kontrak tertulis.",
                color: "from-amber-500/10 to-amber-600/5 border-amber-500/25",
                iconColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
              },
              {
                step: "03",
                icon: <FileText className="size-6" />,
                title: "Terima Laporan + Tindakan",
                desc: "Laporan lengkap: red flags, rekomendasi, timeline risiko, dan surat keberatan otomatis.",
                color: "from-purple-500/8 to-purple-600/4 border-purple-500/20",
                iconColor: "text-purple-500 dark:text-purple-400 bg-purple-500/10",
              },
            ].map(({ step, icon, title, desc, color, iconColor }) => (
              <div key={step} className={`relative flex flex-col gap-5 p-6 rounded-2xl bg-gradient-to-br border dark:border-opacity-50 ${color}`}>
                <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-white dark:bg-[#0A0805] border border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-600 dark:text-amber-500">
                  {step}
                </div>
                <div className={`p-3 rounded-xl w-fit ${iconColor}`}>{icon}</div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="fitur" className="bg-slate-50 dark:bg-[#0D0A06] border-t border-slate-200 dark:border-amber-500/10 px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">Kemampuan</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Sada Bisa Apa Saja?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <AlertTriangle className="size-5" />,
                title: "Deteksi Red Flag",
                desc: "Identifikasi klausul berbahaya, denda tersembunyi, dan pasal jebakan sebelum kamu tanda tangan.",
                accent: "text-red-500 dark:text-red-400",
                bg: "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/10",
              },
              {
                icon: <FileSearch className="size-5" />,
                title: "Analisis Multi-Dokumen",
                desc: "Bandingkan isi chat dengan kontrak. Temukan janji lisan yang bertentangan dengan tulisan.",
                accent: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/10",
              },
              {
                icon: <MessageSquare className="size-5" />,
                title: "Chat Interaktif",
                desc: "Tanya Sada tentang klausul spesifik menggunakan bahasa sehari-hari.",
                accent: "text-blue-500 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/10",
              },
              {
                icon: <FileText className="size-5" />,
                title: "Buat Surat Keberatan",
                desc: "Generate surat keberatan formal otomatis berdasarkan hasil analisis dokumen kamu.",
                accent: "text-purple-500 dark:text-purple-400",
                bg: "bg-purple-50 dark:bg-purple-500/5 border-purple-200 dark:border-purple-500/10",
              },
              {
                icon: <Zap className="size-5" />,
                title: "Kalkulator Risiko",
                desc: "Hitung worst-case kerugian finansial berdasarkan klausul berbahaya yang ditemukan Sada.",
                accent: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/10",
              },
              {
                icon: <Users className="size-5" />,
                title: "Blacklist Komunitas",
                desc: "Laporkan dan cek perusahaan/individu penipu. Database crowdsourced dari sesama UMKM.",
                accent: "text-rose-500 dark:text-rose-400",
                bg: "bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/10",
              },
            ].map(({ icon, title, desc, accent, bg }) => (
              <div key={title} className={`flex flex-col gap-4 p-5 rounded-2xl border ${bg} hover:scale-[1.02] transition-all duration-200`}>
                <div className={accent}>{icon}</div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-white dark:bg-[#0A0805] border-t border-slate-200 dark:border-amber-500/10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/15 border-2 border-red-200 dark:border-red-900/40">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-red-500" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Blacklist Komunitas</p>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Cek Sebelum Tanda Tangan</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Database crowdsourced laporan penipuan UMKM. Cek reputasi perusahaan atau individu sebelum deal. Laporkan penipu agar UMKM lain waspada.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                href="/blacklist"
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/20"
              >
                <Shield className="size-4" /> Lihat Blacklist
              </Link>
              <Link
                href="/blacklist"
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-center justify-center"
              >
                + Laporkan Penipu
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <section className="bg-slate-50 dark:bg-[#0D0A06] border-t border-slate-200 dark:border-amber-500/10 px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-semibold">
            <Sparkles className="size-3.5" />
            Indonesia Emas 2045 — UMKM yang Cerdas &amp; Berdaya
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
            Kamu Tidak Perlu Jadi{" "}
            <span className="animate-shimmer-gold">
              Korban Berikutnya
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Analisis kontrak pertamamu gratis. Tidak perlu daftar. Tidak perlu kartu kredit.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-amber-500/25 animate-glow-gold"
          >
            Mulai Analisis Gratis Sekarang <ArrowRight className="size-5" />
          </Link>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Didukung Google Gemini AI · Vinco Hackathon 2026 · Indonesia Emas 🇮🇩
          </p>
        </div>
      </section>

      
      <footer className="border-t border-slate-200 dark:border-amber-500/10 px-6 py-8 bg-white dark:bg-[#0A0805]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <ShieldCheck className="size-3 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Legal Mate</span>
            <span className="text-xs text-slate-400 ml-1">by Sada AI</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Sada AI · Untuk UMKM Indonesia Emas 🇮🇩 · Vinco Hackathon 2026
          </p>
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-xs text-amber-600 dark:text-amber-500 hover:underline font-medium">Analisis Kontrak</Link>
            <Link href="/blacklist" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Blacklist</Link>
            <Link href="/penjualan" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">💰 Penjualan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
