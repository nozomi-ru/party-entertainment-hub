import { describe, expect, it } from "vitest";
import { summarizeLive } from "@/lib/live/summary";

describe("live summary", () => {
  it("UT-LIVE-00: 現行ゲームなしのとき空サマリー", () => {
    const summary = summarizeLive(
      { game: undefined as never, room: "X", phase: "", updatedAt: 0 },
      [],
    );
    expect(summary).toEqual({});
  });
});
