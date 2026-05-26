import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Legal Mate by Sada AI — Penasihat Hukum AI untuk UMKM Indonesia",
  description:
    "Upload kontrak, surat perjanjian, atau screenshot chat. Sada deteksi jebakan tersembunyi, klausul tidak adil, dan modus manipulasi dalam hitungan detik. Gratis untuk UMKM Indonesia.",
  keywords: ["kontrak", "hukum", "UMKM", "Indonesia", "AI", "analisis kontrak", "perlindungan bisnis"],
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
      className={cn("h-full antialiased", inter.variable, "font-sans")}
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
