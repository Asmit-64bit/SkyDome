import type { Metadata } from "next";
import { Pixelify_Sans, Inter, Silkscreen, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const pixelFont = Pixelify_Sans({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sansFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-number-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const numberFont = Silkscreen({
  variable: "--font-number-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SkyDo — Skyblock Productivity Island",
  description: "A Minecraft Skyblock-inspired productivity system featuring Quests, Minions, Focus Mining, Skills, and a growing Island.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pixelFont.variable} ${sansFont.variable} ${monoFont.variable} ${numberFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans select-none text-[#2B2118]">
        {children}
      </body>
    </html>
  );
}
