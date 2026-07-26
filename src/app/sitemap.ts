import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/** 検索エンジン向けサイトマップ（App Router が /sitemap.xml を生成） */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  /** 静的余興アプリのパス（一覧は LP `#tools`。hub はリダイレクトのみで載せない） */
  const toolPaths = [
    "/app-tools/wedding-bingo/index.html",
    "/app-tools/wedding-quiz/index.html",
    "/app-tools/wedding-poll/index.html",
    "/app-tools/wishboard/index.html",
    "/app-tools/table-talk/index.html",
    "/app-tools/photo-mission/index.html",
    "/app-tools/bingo-machine/index.html",
    "/app-tools/roulette/index.html",
    "/app-tools/countdown/index.html",
    "/app-tools/scoreboard/index.html",
  ];

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...toolPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
