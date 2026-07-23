import { describe, expect, it } from "vitest";
import PartyLogic from "../../public/app-tools/shared/party-logic.js";

const { mulberry32, shuffle, drawOne, splitIntoGroups, splitBySize } =
  PartyLogic;
const { bingoNumbers, bingoLetter, splitBill } = PartyLogic;
const { generateLadder, resolveLadder, kingGame, groupSizes } = PartyLogic;

/** テスト用の決定的な乱数（種固定） */
function seeded(seed = 42) {
  return mulberry32(seed);
}

describe("shuffle", () => {
  it("UT-PARTY-SHUFFLE-01: 元の要素を過不足なく保つ", () => {
    const src = [1, 2, 3, 4, 5];
    const out = shuffle(src, seeded());
    expect(out).toHaveLength(src.length);
    expect([...out].sort((a, b) => a - b)).toEqual(src);
  });

  it("UT-PARTY-SHUFFLE-02: 元配列を破壊しない", () => {
    const src = [1, 2, 3];
    shuffle(src, seeded());
    expect(src).toEqual([1, 2, 3]);
  });

  it("UT-PARTY-SHUFFLE-03: 同じ種なら同じ並びで再現できる", () => {
    const src = ["a", "b", "c", "d"];
    expect(shuffle(src, mulberry32(7))).toEqual(shuffle(src, mulberry32(7)));
  });
});

describe("drawOne", () => {
  it("UT-PARTY-DRAW-01: 1つ選び残りは1つ減る", () => {
    const { value, rest } = drawOne([10, 20, 30], seeded());
    expect([10, 20, 30]).toContain(value);
    expect(rest).toHaveLength(2);
    expect(rest).not.toContain(value);
  });

  it("UT-PARTY-DRAW-02: 空配列なら null", () => {
    expect(drawOne([], seeded())).toEqual({ value: null, rest: [] });
  });
});

describe("splitIntoGroups", () => {
  it("UT-PARTY-GROUP-01: 全員が過不足なく振り分けられる", () => {
    const members = ["A", "B", "C", "D", "E"];
    const groups = splitIntoGroups(members, 2, seeded());
    expect(groups).toHaveLength(2);
    expect(groups.flat().sort()).toEqual([...members].sort());
  });

  it("UT-PARTY-GROUP-02: 人数差は最大1（均等配分）", () => {
    const members = Array.from({ length: 10 }, (_, i) => i);
    const sizes = groupSizes(splitIntoGroups(members, 3, seeded()));
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
    expect(sizes.reduce((a, b) => a + b, 0)).toBe(10);
  });

  it("UT-PARTY-GROUP-03: 空入力でも指定数の空グループを返す", () => {
    expect(splitIntoGroups([], 3, seeded())).toEqual([[], [], []]);
  });
});

describe("splitBySize", () => {
  it("UT-PARTY-SIZE-01: 各グループは最大 size 人", () => {
    const members = Array.from({ length: 7 }, (_, i) => i);
    const groups = splitBySize(members, 3, seeded());
    expect(groups.every((g) => g.length <= 3)).toBe(true);
    expect(groups.flat()).toHaveLength(7);
  });
});

describe("bingoNumbers / bingoLetter", () => {
  it("UT-PARTY-BINGO-01: 既定で1〜75の連番", () => {
    const nums = bingoNumbers();
    expect(nums[0]).toBe(1);
    expect(nums[nums.length - 1]).toBe(75);
    expect(nums).toHaveLength(75);
  });

  it("UT-PARTY-BINGO-02: 列の頭文字が範囲どおり", () => {
    expect(bingoLetter(1)).toBe("B");
    expect(bingoLetter(15)).toBe("B");
    expect(bingoLetter(16)).toBe("I");
    expect(bingoLetter(45)).toBe("N");
    expect(bingoLetter(60)).toBe("G");
    expect(bingoLetter(75)).toBe("O");
  });
});

describe("splitBill", () => {
  it("UT-PARTY-BILL-01: 割り切れるときは全員同額", () => {
    const r = splitBill(10000, 5, 100);
    expect(r.perPerson).toEqual([2000, 2000, 2000, 2000, 2000]);
    expect(r.change).toBe(0);
  });

  it("UT-PARTY-BILL-02: 100円単位で切り上げ、集金は合計以上", () => {
    const r = splitBill(10000, 3, 100);
    expect(r.baseUp).toBe(3400);
    expect(r.totalCollected).toBeGreaterThanOrEqual(10000);
    expect(r.perPerson.reduce((a, b) => a + b, 0)).toBe(r.totalCollected);
  });

  it("UT-PARTY-BILL-03: 端数を一部の人が負担し差は unit 以内", () => {
    const r = splitBill(10000, 3, 100);
    const max = Math.max(...r.perPerson);
    const min = Math.min(...r.perPerson);
    expect(max - min).toBeLessThanOrEqual(r.unit);
    expect(r.perPerson).toHaveLength(3);
  });
});

describe("generateLadder / resolveLadder", () => {
  it("UT-PARTY-AMIDA-01: 解は上位置の並べ替え（全単射）", () => {
    const width = 6;
    const rungs = generateLadder(width, 12, seeded());
    const result = resolveLadder(width, rungs);
    expect(result).toHaveLength(width);
    expect([...result].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("UT-PARTY-AMIDA-02: 横線が無ければ恒等（そのまま下りる）", () => {
    expect(resolveLadder(4, [])).toEqual([0, 1, 2, 3]);
  });

  it("UT-PARTY-AMIDA-03: 1本の横線は隣同士を入れ替える", () => {
    expect(resolveLadder(3, [{ level: 0, col: 0 }])).toEqual([1, 0, 2]);
  });

  it("UT-PARTY-AMIDA-04: 生成される横線は隣接して重ならない", () => {
    const rungs = generateLadder(5, 20, seeded(99));
    const byLevel = new Map<number, number[]>();
    for (const { level, col } of rungs) {
      const arr = byLevel.get(level) ?? [];
      arr.push(col);
      byLevel.set(level, arr);
    }
    for (const cols of byLevel.values()) {
      const sorted = [...cols].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("kingGame", () => {
  it("UT-PARTY-KING-01: 1..count を1つずつ配り王様番号は範囲内", () => {
    const { numbers, king } = kingGame(5, seeded());
    expect([...numbers].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
    expect(king).toBeGreaterThanOrEqual(1);
    expect(king).toBeLessThanOrEqual(5);
  });
});
