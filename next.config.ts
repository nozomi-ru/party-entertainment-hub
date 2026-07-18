import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers では画像最適化なしでも外部画像を表示できるようオフ
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

// 注意:
// initOpenNextCloudflareForDev() は wrangler/workerd を読み込むため、
// Windows ARM (win32 arm64) では npm run dev が即クラッシュする。
// ローカル開発では呼ばない。アンケート API はメモリにフォールバックする。
// Cloudflare バインディング付きの確認は Linux/macOS/x64 で `npm run preview` を使う。
