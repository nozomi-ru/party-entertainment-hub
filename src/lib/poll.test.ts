import { describe, expect, it } from "vitest";
import { normalizeRoom, normalizeVotes } from "@/lib/poll";
import type { PollQuestion } from "@/lib/poll-store";

describe("normalizeRoom", () => {
  it("UT-ROOM-01: 記号を除き大文字化する", () => {
    expect(normalizeRoom("ab-12")).toBe("AB12");
  });

  it("UT-ROOM-02: 空白を除去して大文字化する", () => {
    expect(normalizeRoom("  xy9z  ")).toBe("XY9Z");
  });

  it("UT-ROOM-03: 5文字以上は先頭4文字にする", () => {
    expect(normalizeRoom("toolongroom")).toBe("TOOL");
  });

  it("UT-ROOM-04: 4文字未満はそのまま返す（長さチェックは API 側）", () => {
    expect(normalizeRoom("a1")).toBe("A1");
    expect(normalizeRoom("")).toBe("");
  });
});

describe("normalizeVotes", () => {
  const questions: PollQuestion[] = [
    { q: "好きな色は？", choices: ["赤", "青", "緑"] },
    { q: "好きな季節は？", choices: ["春", "夏"] },
  ];

  it("UT-VOTE-01: votes が無いときはゼロ埋めする", () => {
    expect(normalizeVotes(questions)).toEqual([
      [0, 0, 0],
      [0, 0],
    ]);
  });

  it("UT-VOTE-02: 選択肢の長さが違う行はリセットする", () => {
    expect(
      normalizeVotes(questions, [
        [1, 2],
        [3, 4],
      ]),
    ).toEqual([
      [0, 0, 0],
      [3, 4],
    ]);
  });

  it("UT-VOTE-03: 負数・非数は 0、正数は切り捨てる", () => {
    expect(
      normalizeVotes(questions, [
        [1.9, -1, Number.NaN],
        [0, 2.2],
      ]),
    ).toEqual([
      [1, 0, 0],
      [0, 2],
    ]);
  });
});
