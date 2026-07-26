import { beforeEach, describe, expect, it } from "vitest";
import { resetKvMemoryForTests } from "@/lib/kv";
import {
  getDressPublicSnapshot,
  listDressVotes,
  readDressState,
  writeDressState,
  writeDressVote,
} from "@/lib/dress/store";

describe("dress store", () => {
  beforeEach(() => {
    resetKvMemoryForTests();
  });

  it("UT-DRESS-01: 初期は idle で正解を公開しない", async () => {
    const snap = await getDressPublicSnapshot();
    expect(snap.status).toBe("idle");
    expect(snap.correct_color).toBeNull();
    expect(snap.total).toBe(0);
  });

  it("UT-DRESS-02: 投票は個別キーで集計される", async () => {
    await writeDressState({ status: "voting", correct_color: null });
    await writeDressVote({
      user_id: "u1",
      name: "花子",
      color: "orange",
      timestamp: 1,
    });
    await writeDressVote({
      user_id: "u2",
      name: "太郎",
      color: "navy",
      timestamp: 2,
    });
    const snap = await getDressPublicSnapshot();
    expect(snap.total).toBe(2);
    expect(snap.counts.orange).toBe(1);
    expect(snap.counts.navy).toBe(1);
    expect(snap.correct_color).toBeNull();
  });

  it("UT-DRESS-03: result 時だけ正解と正解者を返す", async () => {
    await writeDressState({ status: "voting", correct_color: null });
    await writeDressVote({
      user_id: "u1",
      name: "花子",
      color: "rose",
      timestamp: 1,
    });
    await writeDressVote({
      user_id: "u2",
      name: "太郎",
      color: "orange",
      timestamp: 2,
    });
    await writeDressState({ status: "result", correct_color: "rose" });
    const snap = await getDressPublicSnapshot();
    expect(snap.correct_color).toBe("rose");
    expect(snap.winners.map((w) => w.name)).toEqual(["花子"]);
  });

  it("UT-DRESS-04: 同一 user の再投票は上書き", async () => {
    await writeDressState({ status: "voting", correct_color: null });
    await writeDressVote({
      user_id: "u1",
      name: "花子",
      color: "orange",
      timestamp: 1,
    });
    await writeDressVote({
      user_id: "u1",
      name: "花子",
      color: "white",
      timestamp: 2,
    });
    const votes = await listDressVotes();
    expect(votes).toHaveLength(1);
    expect(votes[0].color).toBe("white");
    const state = await readDressState();
    expect(state?.correct_color).toBeNull();
  });
});
