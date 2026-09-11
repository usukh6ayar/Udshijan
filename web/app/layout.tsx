import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Ө ө Ү ү (U+04E8/04E9, U+04AE/04AF) нь cyrillic-ext дэд олонлогт байдаг —
// монгол гарчгууд tofu болохгүйн тулд заавал шаардлагатай.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Udshijan — Онлайн дэлгүүр",
    template: "%s · Udshijan",
  },
  description:
    "Өдөр тутмын хэрэгцээт бүхнийг нэг дороос. 10,000-с дээш нэр төрлийн бараа, Улаанбаатар хотод 24–48 цагийн хүргэлт.",
};

export const viewport: Viewport = {
  themeColor: "#17171a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="mn"
      className={`${manrope.variable} ${mono.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
