import { describe, expect, it } from "vitest";
import { summarizeGrade, summarizeGraph } from "@/lib/live/summary";
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
});
