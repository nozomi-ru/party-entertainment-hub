import { describe, expect, it } from "vitest";
import PartyUI from "../../public/app-tools/shared/ui.js";

const { escapeHtml, parseLines, formatCount } = PartyUI;
const { formatNumberedList, formatGroups, formatPairs } = PartyUI;

describe("escapeHtml", () => {
  it("UT-UI-ESCAPE-01: HTML の特殊文字を実体参照に置き換える", () => {
    expect(escapeHtml('<b>"A" & \'B\'</b>')).toBe(
      "&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;",
    );
  });

  it("UT-UI-ESCAPE-02: 普通の名前はそのまま通す", () => {
    expect(escapeHtml("たろう")).toBe("たろう");
  });

  it("UT-UI-ESCAPE-03: null / undefined は空文字にする", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("parseLines", () => {
  it("UT-UI-LINES-01: 前後の空白と空行を落として件数を返す", () => {
    const result = parseLines("  たろう \n\n はなこ\n   \nじろう");
    expect(result.items).toEqual(["たろう", "はなこ", "じろう"]);
    expect(result.count).toBe(3);
  });

  it("UT-UI-LINES-02: 重複した名前を1回だけ報告する", () => {
    const result = parseLines("たろう\nはなこ\nたろう\nたろう");
    expect(result.duplicates).toEqual(["たろう"]);
    expect(result.count).toBe(4);
  });

  it("UT-UI-LINES-03: 重複が無ければ duplicates は空", () => {
    expect(parseLines("A\nB").duplicates).toEqual([]);
  });

  it("UT-UI-LINES-04: 空文字・null でも落ちない", () => {
    expect(parseLines("")).toEqual({ items: [], count: 0, duplicates: [] });
    expect(parseLines(null)).toEqual({ items: [], count: 0, duplicates: [] });
  });
});

describe("formatCount", () => {
  it("UT-UI-COUNT-01: 件数と単位を並べる", () => {
    expect(formatCount(3, "名")).toBe("3名");
    expect(formatCount(3)).toBe("3件");
  });

  it("UT-UI-COUNT-02: 0 件は未入力だと分かる文言にする", () => {
    expect(formatCount(0, "名")).toBe("未入力（0名）");
  });

  it("UT-UI-COUNT-03: 数値でない値は 0 として扱う", () => {
    expect(formatCount(Number.NaN)).toBe("未入力（0件）");
    expect(formatCount(-5)).toBe("未入力（0件）");
  });
});

describe("コピー用の書式", () => {
  it("UT-UI-FORMAT-01: 順番は1始まりの番号付きにする", () => {
    expect(formatNumberedList(["A", "B", "C"])).toBe("1. A\n2. B\n3. C");
  });

  it("UT-UI-FORMAT-02: グループは名前と人数を添える", () => {
    expect(formatGroups([["A", "B"], ["C"]])).toBe(
      "【チーム1】(2名) A / B\n【チーム2】(1名) C",
    );
  });

  it("UT-UI-FORMAT-03: グループの見出しは差し替えられる", () => {
    expect(formatGroups([["A"]], "班")).toBe("【班1】(1名) A");
  });

  it("UT-UI-FORMAT-04: 割り当ては矢印でつなぐ", () => {
    expect(
      formatPairs([
        ["A", "受付"],
        ["B", "乾杯"],
      ]),
    ).toBe("A → 受付\nB → 乾杯");
  });

  it("UT-UI-FORMAT-05: 空リストは空文字を返す", () => {
    expect(formatNumberedList([])).toBe("");
    expect(formatGroups([])).toBe("");
    expect(formatPairs([])).toBe("");
  });
});
