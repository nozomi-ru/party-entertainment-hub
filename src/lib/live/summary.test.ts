import { describe, expect, it } from "vitest";
import {
  buildBingoCard,
  countBingoLines,
  summarizeBuzz,
  summarizeDress,
  summarizeEither,
  summarizeGrade,
  summarizeGraph,
  summarizeRequest,
  summarizeTreasure,
} from "@/lib/live/summary";
import type { LiveAction } from "@/lib/live/types";

function act(
  partial: Partial<LiveAction> & Pick<LiveAction, "kind" | "guestId">,
): LiveAction {
  return {
    id: partial.id ?? `${partial.kind}-${partial.guestId}`,
    guestId: partial.guestId,
    name: partial.name ?? "G",
    kind: partial.kind,
    payload: partial.payload ?? {},
    at: partial.at ?? 1,
  };
}

describe("live summary", () => {
  it("UT-LIVE-01: 早押しは最速が勝者", () => {
    const summary = summarizeBuzz(
      [
        act({ kind: "buzz", guestId: "b", name: "遅い", at: 20, payload: { round: 1 } }),
        act({ kind: "buzz", guestId: "a", name: "速い", at: 10, payload: { round: 1 } }),
      ],
      1,
    );
    expect(summary.winner?.name).toBe("速い");
    expect(summary.buzzCount).toBe(2);
  });

  it("UT-LIVE-02: どっち？はゲスト1票", () => {
    const summary = summarizeEither([
      act({ kind: "vote", guestId: "1", payload: { side: "left" } }),
      act({ kind: "vote", guestId: "1", payload: { side: "right" }, id: "dup" }),
      act({ kind: "vote", guestId: "2", payload: { side: "right" } }),
    ]);
    expect(summary.left).toBe(1);
    expect(summary.right).toBe(1);
    expect(summary.total).toBe(2);
  });

  it("UT-LIVE-03: ドレス色当て正解者", () => {
    const summary = summarizeDress(
      [
        act({ kind: "color", guestId: "1", name: "花子", payload: { colorIndex: 2 } }),
        act({ kind: "color", guestId: "2", name: "太郎", payload: { colorIndex: 0 } }),
      ],
      2,
    );
    expect(summary.winners.map((w) => w.name)).toEqual(["花子"]);
  });

  it("UT-LIVE-04: 宝探しランキング", () => {
    const summary = summarizeTreasure(
      [
        act({ kind: "spot", guestId: "1", name: "A", payload: { spotId: "X" } }),
        act({ kind: "spot", guestId: "1", name: "A", payload: { spotId: "Y" }, id: "2" }),
        act({ kind: "spot", guestId: "2", name: "B", payload: { spotId: "X" } }),
      ],
      [
        { id: "X", points: 10 },
        { id: "Y", points: 20 },
      ],
    );
    expect(summary.ranking[0].name).toBe("A");
    expect(summary.ranking[0].points).toBe(30);
  });

  it("UT-LIVE-05: 格付けランク", () => {
    const summary = summarizeGrade(
      [
        act({
          kind: "answer",
          guestId: "1",
          name: "満点",
          payload: { questionIndex: 0, choiceIndex: 0 },
        }),
        act({
          kind: "answer",
          guestId: "1",
          name: "満点",
          payload: { questionIndex: 1, choiceIndex: 1 },
          id: "a2",
        }),
      ],
      [{ answerIndex: 0 }, { answerIndex: 1 }],
    );
    expect(summary.ranking[0].rankLabel).toBe("S");
    expect(summary.ranking[0].correct).toBe(2);
  });

  it("UT-LIVE-06: リクエストいいね順", () => {
    const summary = summarizeRequest([
      act({
        kind: "post",
        guestId: "1",
        id: "p1",
        payload: { text: "余興" },
        at: 1,
      }),
      act({
        kind: "post",
        guestId: "2",
        id: "p2",
        payload: { text: "写真" },
        at: 2,
      }),
      act({ kind: "like", guestId: "3", payload: { postId: "p2" }, id: "l1" }),
      act({ kind: "like", guestId: "4", payload: { postId: "p2" }, id: "l2" }),
    ]);
    expect(summary.ranking[0].text).toBe("写真");
    expect(summary.ranking[0].likes).toBe(2);
  });

  it("UT-LIVE-07: 相関図ノード", () => {
    const summary = summarizeGraph(
      [
        act({
          kind: "link",
          guestId: "u1",
          payload: { name: "次郎", target: "bride", relation: "友人" },
        }),
      ],
      "花",
      "太郎",
    );
    expect(summary.nodes.some((n) => n.name === "次郎")).toBe(true);
    expect(summary.links.length).toBeGreaterThanOrEqual(2);
  });

  it("UT-LIVE-08: ビンゴカードは決定的・中央 FREE", () => {
    const a = buildBingoCard("guest-1");
    const b = buildBingoCard("guest-1");
    expect(a).toEqual(b);
    expect(a[12]).toBe(0);
    expect(a.filter((n) => n > 0)).toHaveLength(24);
  });

  it("UT-LIVE-09: ビンゴライン数", () => {
    const nums = Array.from({ length: 24 }, (_, i) => i + 1);
    const card: number[] = [];
    for (let i = 0; i < 25; i++) {
      card.push(i === 12 ? 0 : nums.shift()!);
    }
    const lines = countBingoLines(card, Array.from({ length: 24 }, (_, i) => i + 1));
    expect(lines).toBe(12);
  });
});
