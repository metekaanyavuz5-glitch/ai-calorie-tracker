import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Calorie Tracker",
  description: "Yemek fotoğrafını analiz et, kalori ve besin değerlerini öğren.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="antialiased">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-violet-200 via-violet-50 to-slate-50 dark:from-violet-950/60 dark:via-slate-950 dark:to-slate-950"
        />
        {children}
      </body>
    </html>
  );
}
