import type { Metadata } from "next";
import { Great_Vibes, Geist_Mono } from "next/font/google";
import "./globals.css";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-great-vibes",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Слово.AI — Персональный AI-Репетитор по Русскому Языку | RAG & Gemini 3.5 Flash-Lite",
  description:
    "Интеллектуальный SaaS-сервис изучения русского языка с векторным RAG-движком, проверкой произношения, грамматики, аудированием и индивидуальной программой от A1 до C2.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${greatVibes.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#D8D2CF] text-[#2E3604] font-mono antialiased selection:bg-[#E19D29] selection:text-[#2E3604]">
        {children}
      </body>
    </html>
  );
}
