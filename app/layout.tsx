import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Calorie Tracker",
  description: "Yemek fotoğrafını analiz et, kalori ve besin değerlerini öğren.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
