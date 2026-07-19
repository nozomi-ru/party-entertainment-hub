import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/** クローラー向け robots.txt（App Router が /robots.txt を生成） */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
