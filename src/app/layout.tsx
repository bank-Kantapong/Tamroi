import type { Metadata } from "next";
import { Prompt, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const promptFont = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

const ibmThaiFont = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TAMROI (ตามรอย) — แจกแพลนเที่ยวพร้อมพิกัด กดตามรอยได้ทันที",
  description:
    "รวมรูทเที่ยวคัดสรรทั่วไทย ดูจุดแวะเรียงลำดับบนแผนที่อินเทอร์แอคทีฟ พร้อมกดเปิดนำทางทั้งทริปใน Google Maps ได้ทันที",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${promptFont.variable} ${ibmThaiFont.variable}`}
    >
      <body suppressHydrationWarning className="flex min-h-screen flex-col font-sans">
        <LanguageProvider>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
