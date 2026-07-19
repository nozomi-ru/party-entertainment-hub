import type { Metadata } from "next";
import { Cormorant_Garamond, Zen_Kaku_Gothic_New } from "next/font/google";
import { pageSeo, siteConfig, siteUrl } from "@/config/site";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
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
        url: siteConfig.ogImagePath,
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
      <body className={`${display.variable} ${body.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
