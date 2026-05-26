<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Proyek: UMKM Legal Mate

**Tujuan Proyek:** Aplikasi web analisis kontrak hukum untuk UMKM. Proyek ini dikembangkan khusus untuk kompetisi **#JuaraVibeCoding 2026** oleh Google for Developers.
**Batas Waktu Pengumpulan:** 31 Mei 2026.

## 🛠️ Tech Stack

- **Framework:** Next.js 14/15 (App Router), React, TypeScript.
- **Styling:** Tailwind CSS.
- **UI Components:** shadcn/ui, Lucide React (Icons).
- **AI Engine:** Google Generative AI SDK (`@google/generative-ai`), Model: `gemini-1.5-flash`.
- **Deployment:** Docker, Google Cloud Run.

## 📁 Struktur Direktori Utama

Proyek ini menggunakan struktur `src/` standar Next.js:

- `src/app/` : Menyimpan routing frontend (halaman) dan backend (API routes).
- `src/app/api/analyze/route.ts` : Endpoint backend (Node.js) untuk memproses file dan memanggil API Gemini.
- `src/components/ui/` : Menyimpan komponen _reusable_ dari shadcn/ui.
- `src/components/` : Menyimpan komponen kustom (misal: `FileUpload.tsx`, `ResultCard.tsx`).
- `src/lib/gemini.ts` : Inisialisasi dan konfigurasi SDK Google Gen AI.
- `src/lib/utils.ts` : Fungsi utilitas (biasanya bawaan shadcn untuk Tailwind).

## 📜 Aturan Koding (Developer Guidelines)

Saat memberikan saran kode atau menulis fungsi, harap patuhi aturan berikut:

1. **TypeScript Strict:** Selalu gunakan tipe data eksplisit (Interfaces/Types). Hindari penggunaan `any`.
2. **Komponen Modular:** Pisahkan UI yang kompleks menjadi komponen-komponen kecil di dalam `src/components/`.
3. **Styling:** Gunakan kelas Tailwind CSS murni. Jangan membuat file `.css` terpisah kecuali benar-benar diperlukan untuk animasi khusus.
4. **Error Handling:** Saat memanggil API Gemini, selalu bungkus dalam blok `try...catch` dan kembalikan respons error JSON yang rapi ke frontend.
5. **State Management:** Gunakan React Hooks bawaan (`useState`, `useEffect`, `useRef`).
6. **Vibe/Editor:** Proyek ini dikembangkan sepenuhnya menggunakan `nvim` dan CLI. Berikan perintah CLI (bash) yang tepat jika perlu menginstal _package_ baru.

## 🚀 Panduan Eksekusi (Cheatsheet)

- **Menjalankan Server Lokal:** `npm run dev`
- **Menambahkan Komponen UI Baru:** `npx shadcn-ui@latest add [nama_komponen]`
- **Build Container (Lokal):** `docker build -t gcr.io/PROJECT_ID/legal-mate .`
- **Deploy ke Cloud Run:** `gcloud run deploy legal-mate --image gcr.io/PROJECT_ID/legal-mate --platform managed --region asia-southeast2 --allow-unauthenticated`

## 🎯 Target Pengiriman Lomba (Checklist)

- [ ] Aplikasi berjalan tanpa _error_ di lokal.
- [ ] Menerima input teks/gambar/PDF.
- [ ] Menggunakan prompt khusus dengan _output_ ringkasan, _red flags_, dan rekomendasi.
- [ ] _Image_ Docker berhasil di-_build_.
- [ ] _Deployed_ dan URL Google Cloud Run dapat diakses publik.
- [ ] Video demo selesai direkam (2-3 menit).
<!-- END:nextjs-agent-rules -->
