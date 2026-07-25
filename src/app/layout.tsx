import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { CloudflareAnalytics } from "@/components/CloudflareAnalytics";
import { pageSeo, siteConfig, siteUrl } from "@/config/site";
import "./globals.css";

/** 欧文ディスプレイのみ Google Fonts。本文は OS の日本語ゴシック（多数の woff2 分割を避ける） */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-display",
  display: "swap",
});

const ogImageUrl = `${siteUrl}${siteConfig.ogImagePath}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: pageSeo.home.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: pageSeo.home.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  keywords: [
    "ことほぎ",
    "Kotohogi",
    "結婚式",
    "パーティー",
    "二次会",
    "余興",
    "ビンゴ",
    "クイズ",
    "アンケート",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: siteConfig.name,
    title: pageSeo.home.title,
    description: pageSeo.home.description,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name}（${siteConfig.nameEn}）`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageSeo.home.title,
    description: pageSeo.home.description,
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="preload"
          as="image"
          href="/hero.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className={`${display.variable} antialiased`}>
        {children}
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
