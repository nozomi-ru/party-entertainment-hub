import { beforeEach, describe, expect, it } from "vitest";
import { resetKvMemoryForTests } from "@/lib/kv";
import {
  getDressPublicSnapshot,
  listDressVotes,
  readDressState,
  writeDressColors,
  writeDressState,
  writeDressVote,
} from "@/lib/dress/store";
import { normalizeDressColors } from "@/lib/dress/colors";

const ROOM = "ABCD";

describe("dress store", () => {
  beforeEach(() => {
    resetKvMemoryForTests();
  });

  it("UT-DRESS-01: 初期は idle で既定色・正解非公開", async () => {
    const snap = await getDressPublicSnapshot(ROOM);
    expect(snap.room).toBe(ROOM);
    expect(snap.status).toBe("idle");
    expect(snap.correct_color).toBeNull();
    expect(snap.total).toBe(0);
    expect(snap.colors.length).toBeGreaterThanOrEqual(2);
  });

  it("UT-DRESS-02: 投票は個別キーで集計される", async () => {
    await writeDressState(ROOM, { status: "voting", correct_color: null });
    await writeDressVote(ROOM, {
      user_id: "u1",
      name: "花子",
      color: "orange",
      timestamp: 1,
    });
    await writeDressVote(ROOM, {
      user_id: "u2",
      name: "太郎",
      color: "navy",
      timestamp: 2,
    });
    const snap = await getDressPublicSnapshot(ROOM);
    expect(snap.total).toBe(2);
    expect(snap.counts.orange).toBe(1);
    expect(snap.counts.navy).toBe(1);
    expect(snap.correct_color).toBeNull();
    expect(snap.voters.map((v) => v.name).sort()).toEqual(["太郎", "花子"]);
    expect(snap.voters_by_color.orange).toEqual(["花子"]);
    expect(snap.voters_by_color.navy).toEqual(["太郎"]);
  });

  it("UT-DRESS-03: result 時だけ正解と正解者を返す", async () => {
    await writeDressState(ROOM, { status: "voting", correct_color: null });
    await writeDressVote(ROOM, {
      user_id: "u1",
      name: "花子",
      color: "rose",
      timestamp: 1,
    });
    await writeDressVote(ROOM, {
      user_id: "u2",
      name: "太郎",
      color: "orange",
      timestamp: 2,
    });
    await writeDressState(ROOM, { status: "result", correct_color: "rose" });
    const snap = await getDressPublicSnapshot(ROOM);
    expect(snap.correct_color).toBe("rose");
    expect(snap.winners.map((w) => w.name)).toEqual(["花子"]);
  });

  it("UT-DRESS-04: 同一 user の再投票は上書き", async () => {
    await writeDressState(ROOM, { status: "voting", correct_color: null });
    await writeDressVote(ROOM, {
      user_id: "u1",
      name: "花子",
      color: "orange",
      timestamp: 1,
    });
    await writeDressVote(ROOM, {
      user_id: "u1",
      name: "花子",
      color: "white",
      timestamp: 2,
    });
    const votes = await listDressVotes(ROOM);
    expect(votes).toHaveLength(1);
    expect(votes[0].color).toBe("white");
    const state = await readDressState(ROOM);
    expect(state?.correct_color).toBeNull();
  });

  it("UT-DRESS-05: UI から色を差し替えられる", async () => {
    await writeDressColors(ROOM, [
      { id: "a", label: "赤", fill: "#AA3333", glow: "#882222" },
      { id: "b", label: "青", fill: "#3355AA", glow: "#224488" },
    ]);
    const snap = await getDressPublicSnapshot(ROOM);
    expect(snap.colors.map((c) => c.label)).toEqual(["赤", "青"]);
  });

  it("UT-DRESS-08: ルームが違えば票は混ざらない", async () => {
    await writeDressState("AAAA", { status: "voting", correct_color: null });
    await writeDressVote("AAAA", {
      user_id: "u1",
      name: "A",
      color: "orange",
      timestamp: 1,
    });
    await writeDressState("BBBB", { status: "voting", correct_color: null });
    const snapB = await getDressPublicSnapshot("BBBB");
    expect(snapB.total).toBe(0);
    const snapA = await getDressPublicSnapshot("AAAA");
    expect(snapA.total).toBe(1);
  });

  it("UT-DRESS-09: 同じルームコードは再作成できない", async () => {
    const { openDressRoom } = await import("@/lib/dress/store");
    expect(await openDressRoom("ZZ99")).toBe(true);
    expect(await openDressRoom("ZZ99")).toBe(false);
  });
});

describe("normalizeDressColors", () => {
  it("UT-DRESS-06: 不正な配列は null", () => {
    expect(normalizeDressColors([])).toBeNull();
    expect(normalizeDressColors([{ label: "x", fill: "red" }])).toBeNull();
  });

  it("UT-DRESS-07: glow 未指定なら fill から生成", () => {
    const colors = normalizeDressColors([
      { label: "金", fill: "#B4975A" },
      { label: "白", fill: "#F5F1EA" },
    ]);
    expect(colors).not.toBeNull();
    expect(colors![0].glow.startsWith("#")).toBe(true);
    expect(colors![0].id.length).toBeGreaterThan(0);
  });
});
