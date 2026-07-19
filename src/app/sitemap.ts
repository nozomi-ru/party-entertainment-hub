import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/** 検索エンジン向けサイトマップ（App Router が /sitemap.xml を生成） */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/app-tools/wedding-bingo/index.html`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/app-tools/wedding-quiz/index.html`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/app-tools/wedding-poll/index.html`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
