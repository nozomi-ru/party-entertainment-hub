import { describe, expect, it } from "vitest";
import {
  appLinks,
  problemSolutionIntro,
  problemSolutions,
  siteConfig,
} from "@/config/site";

describe("site config（LP コピー）", () => {
  it("UT-SITE-01: タグラインが実態に合った文言である", () => {
    expect(siteConfig.tagline).toBe(
      "インストール不要。会場のスマホで余興がつながる",
    );
    expect(siteConfig.description).toContain("人間ビンゴ");
    expect(siteConfig.description).toContain("ブラウザだけで");
  });

  it("UT-SITE-02: ヒーロー CTA は1つでツール一覧へ向く", () => {
    expect(appLinks.primaryCta).toEqual({
      label: "余興ツールを見る",
      href: "#tools",
    });
    expect(appLinks).not.toHaveProperty("secondaryCta");
  });

  it("UT-SITE-03: Problem & Solution が3柱・実在機能に沿う", () => {
    expect(problemSolutionIntro.title).toBe(
      "余興の準備から、会場の一体感まで",
    );
    expect(problemSolutions).toHaveLength(3);
    expect(problemSolutions.map((item) => item.id)).toEqual([
      "ready",
      "join",
      "unity",
    ]);
    expect(problemSolutions.map((item) => item.title)).toEqual([
      "配る手間",
      "手元の参加",
      "会場の一体感",
    ]);
  });

  it("UT-SITE-04: 旧コピーや説明だけの CTA を含まない", () => {
    const blob = JSON.stringify({
      tagline: siteConfig.tagline,
      description: siteConfig.description,
      intro: problemSolutionIntro,
      items: problemSolutions,
      links: appLinks,
    });
    expect(blob).not.toContain("景品選び");
    expect(blob).not.toContain("おすすめ景品");
    expect(blob).not.toContain("流れをアプリで可視化");
    expect(blob).not.toContain("幹事さんの不安に、そっと寄り添う");
    expect(blob).not.toContain("アプリを体験する");
    expect(blob).not.toContain("課題と解決を見る");
    expect(blob).not.toContain("司会・幹事はこちら");
  });
});
