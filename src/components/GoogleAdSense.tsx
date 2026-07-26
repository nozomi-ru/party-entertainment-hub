/**
 * Google AdSense（サイト認証・広告スクリプト）。
 * クライアント ID 未設定時は何も描画しない。
 */
import Script from "next/script";
import { adsenseClientId } from "@/config/site";

export function GoogleAdSense() {
  if (!adsenseClientId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
