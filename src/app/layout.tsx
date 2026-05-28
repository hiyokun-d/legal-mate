import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legal Mate — Penasihat Hukum AI untuk UMKM Indonesia",
  description:
    "Analisis kontrak, deteksi jebakan, dan lindungi bisnis kamu dari penipuan. Didukung Google Gemini AI. Gratis selamanya.",
  metadataBase: new URL("https://legal-mate-full.vercel.app"),
  openGraph: {
    title: "Legal Mate — Jangan Tandatangani Sebelum Tanya Sada",
    description:
      "Penasihat hukum AI khusus UMKM Indonesia. Deteksi red flag kontrak, blacklist komunitas, dan kalkulator risiko finansial. Gratis selamanya.",
    url: "https://legal-mate-full.vercel.app",
    siteName: "Legal Mate",
    images: [
      {
        url: "https://imgdrop.web.id/nfwcX.png",
        width: 1200,
        height: 630,
        alt: "Legal Mate — Penasihat Hukum AI untuk UMKM Indonesia",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Mate — Jangan Tandatangani Sebelum Tanya Sada",
    description:
      "Penasihat hukum AI khusus UMKM Indonesia. Deteksi red flag kontrak dalam hitungan detik.",
    images: ["https://imgdrop.web.id/nfwcX.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        oxanium.variable,
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
