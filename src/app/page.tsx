import NewsFeed from "@/components/custom-ui/news-feed";
import NewsTicker from "@/components/custom-ui/news-ticker";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  FileSearch,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <ShieldCheck className="size-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">Legal Mate</span>
            <span className="hidden sm:inline-block text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5 font-medium">
              by UMKM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#cara-kerja" className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">
              Cara Kerja
            </a>
            <a href="#berita" className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">
              Berita Scam
            </a>
            <Link href="/blacklist" className="hidden md:block text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
              🚨 Blacklist
            </Link>
            <Link
              href="/app"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
            >
              Mulai Gratis
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── TICKER ── */}
      <div className="fixed top-16 left-0 right-0 z-40">
        <NewsTicker />
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 px-6 overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="size-3.5" />
            Didukung Google Gemini AI · Gratis untuk UMKM
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Jangan Tandatangani
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Sebelum Tanya Sada
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Penasihat hukum AI khusus UMKM Indonesia. Upload kontrak, surat perjanjian,
            atau screenshot chat — Sada deteksi <span className="text-red-400 font-medium">jebakan tersembunyi</span>,{" "}
            <span className="text-amber-400 font-medium">klausul tidak adil</span>, dan{" "}
            <span className="text-emerald-400 font-medium">modus manipulasi</span> dalam hitungan detik.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link
              href="/app"
              className="animate-glow flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Analisis Kontrak Sekarang
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#cara-kerja"
              className="flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium text-base rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              Lihat Cara Kerjanya
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            {[
              { value: "100%", label: "Gratis Selamanya" },
              { value: "Gemini", label: "AI Engine" },
              { value: "3 Modus", label: "Analisis Lengkap" },
              { value: "<10d", label: "Waktu Analisis" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating danger card */}
        <div className="relative z-10 mt-16 animate-float">
          <div className="flex items-start gap-3 bg-slate-900/80 border border-red-500/20 rounded-2xl px-5 py-4 shadow-xl shadow-black/30 max-w-xs">
            <div className="p-2 bg-red-500/10 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="size-4 text-red-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wide">Red Flag Terdeteksi</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Denda keterlambatan 5% per hari tanpa batas—{" "}
                <span className="text-red-300">bisa hancurkan bisnis kamu dalam seminggu.</span>"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BREAKING NEWS ── */}
      <div id="berita" className="bg-slate-900 border-t border-slate-800">
        <NewsFeed />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" className="bg-slate-950 border-t border-slate-800 px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">Cara Kerja</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Tiga Langkah. Selesai.</h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Tidak perlu latar belakang hukum. Tidak perlu bayar pengacara.
              Cukup upload dan biarkan Sada bekerja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[calc(33%-1rem)] right-[calc(33%-1rem)] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {[
              {
                step: "01",
                icon: <Upload className="size-6" />,
                title: "Upload Dokumen",
                desc: "Drag & drop kontrak PDF, DOCX, foto, atau screenshot percakapan. Bisa lebih dari satu dokumen sekaligus.",
                color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
                iconColor: "text-blue-400 bg-blue-500/10",
              },
              {
                step: "02",
                icon: <Bot className="size-6" />,
                title: "AI Menganalisis",
                desc: "Sada membaca setiap klausul, mendeteksi modus manipulasi, dan membandingkan isi chat dengan kontrak tertulis.",
                color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
                iconColor: "text-emerald-400 bg-emerald-500/10",
              },
              {
                step: "03",
                icon: <FileText className="size-6" />,
                title: "Terima Laporan + Tindakan",
                desc: "Laporan lengkap: ringkasan, red flags, rekomendasi, timeline risiko. Plus buat surat keberatan otomatis.",
                color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
                iconColor: "text-purple-400 bg-purple-500/10",
              },
            ].map(({ step, icon, title, desc, color, iconColor }) => (
              <div
                key={step}
                className={`relative flex flex-col gap-5 p-6 rounded-2xl bg-gradient-to-br border ${color}`}
              >
                <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  {step}
                </div>
                <div className={`p-3 rounded-xl w-fit ${iconColor}`}>{icon}</div>
                <div className="space-y-2">
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-slate-900 border-t border-slate-800 px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">Kemampuan</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Sada Bisa Apa Saja?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <AlertTriangle className="size-5" />,
                title: "Deteksi Red Flag",
                desc: "Identifikasi klausul berbahaya, denda tersembunyi, dan pasal jebakan sebelum kamu tanda tangan.",
                accent: "text-red-400",
                bg: "bg-red-500/5 border-red-500/10",
              },
              {
                icon: <FileSearch className="size-5" />,
                title: "Analisis Multi-Dokumen",
                desc: "Bandingkan isi chat dengan kontrak. Temukan janji lisan yang bertentangan dengan tulisan.",
                accent: "text-amber-400",
                bg: "bg-amber-500/5 border-amber-500/10",
              },
              {
                icon: <MessageSquare className="size-5" />,
                title: "Chat Interaktif",
                desc: "Tanya Sada tentang klausul spesifik menggunakan bahasa sehari-hari. Tidak perlu jargon hukum.",
                accent: "text-blue-400",
                bg: "bg-blue-500/5 border-blue-500/10",
              },
              {
                icon: <FileText className="size-5" />,
                title: "Buat Surat Keberatan",
                desc: "Generate surat keberatan/balasan formal otomatis berdasarkan hasil analisis dokumen kamu.",
                accent: "text-purple-400",
                bg: "bg-purple-500/5 border-purple-500/10",
              },
              {
                icon: <Zap className="size-5" />,
                title: "Export Laporan PDF",
                desc: "Unduh laporan analisis lengkap dalam format PDF untuk arsip atau bukti hukum.",
                accent: "text-emerald-400",
                bg: "bg-emerald-500/5 border-emerald-500/10",
              },
              {
                icon: <ShieldCheck className="size-5" />,
                title: "100% Gratis",
                desc: "Tidak ada langganan, tidak ada biaya tersembunyi. Sada hadir untuk UMKM yang tidak mampu bayar pengacara.",
                accent: "text-teal-400",
                bg: "bg-teal-500/5 border-teal-500/10",
              },
            ].map(({ icon, title, desc, accent, bg }) => (
              <div
                key={title}
                className={`flex flex-col gap-4 p-5 rounded-2xl border ${bg} hover:brightness-125 transition-all duration-200`}
              >
                <div className={`${accent}`}>{icon}</div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-white text-sm">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-slate-950 border-t border-slate-800 px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium">
            <AlertTriangle className="size-3.5" />
            Setiap hari ada UMKM yang tertipu kontrak bermasalah
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Kamu Tidak Perlu Jadi
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              {" "}Korban Berikutnya
            </span>
          </h2>
          <p className="text-slate-400 text-lg">
            Analisis kontrak pertamamu gratis. Tidak perlu daftar. Tidak perlu kartu kredit.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-emerald-500/20"
          >
            Mulai Analisis Gratis Sekarang
            <ArrowRight className="size-5" />
          </Link>
          <p className="text-xs text-slate-600">
            Didukung Google Gemini AI · Kompetisi #JuaraVibeCoding 2026
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center">
              <ShieldCheck className="size-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-400">Legal Mate</span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            Penasihat hukum AI untuk UMKM Indonesia · Bukan pengganti pengacara profesional
          </p>
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-xs text-slate-500 hover:text-white transition-colors">
              Buka Aplikasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
