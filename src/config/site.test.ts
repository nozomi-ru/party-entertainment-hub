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

  it("UT-SITE-02: ヒーロー CTA がツール一覧と課題セクションへ向く", () => {
    expect(appLinks.primaryCta).toEqual({
      label: "余興ツールを見る",
      href: "#tools",
    });
    expect(appLinks.secondaryCta).toEqual({
      label: "課題と解決を見る",
      href: "#solutions",
    });
  });

  it("UT-SITE-03: Problem & Solution が3柱・実在機能に沿う", () => {
    expect(problemSolutionIntro.title).toBe(
      "余興の悩みに、その場で使えるアプリで応える",
    );
    expect(problemSolutions).toHaveLength(3);
    expect(problemSolutions.map((item) => item.id)).toEqual([
      "ready",
      "join",
      "unity",
    ]);
    expect(problemSolutions.map((item) => item.title)).toEqual([
      "余興の準備",
      "ゲストの参加",
      "会場の一体感",
    ]);
  });

  it("UT-SITE-04: 旧コピー（景品選び・流れ可視化など）を含まない", () => {
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
  });
});
