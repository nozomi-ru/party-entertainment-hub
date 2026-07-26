import { beforeEach, describe, expect, it } from "vitest";
import { resetKvMemoryForTests } from "@/lib/kv";
import { handleLiveAdmin, handleLiveGuest } from "@/lib/live/handlers";
import { getLiveSnapshot } from "@/lib/live/store";

describe("live store + handlers", () => {
  beforeEach(() => {
    resetKvMemoryForTests();
  });

  it("UT-LIVE-STORE-01: Admin 作成後に GET 相当で読める", async () => {
    await handleLiveAdmin("grade", "G001", { op: "upsert" });
    const snap = await getLiveSnapshot("grade", "G001");
    expect(snap?.state.game).toBe("grade");
    expect(snap?.state.room).toBe("G001");
  });

  it("UT-LIVE-STORE-04: 格付けは answering のときだけ受付", async () => {
    await handleLiveAdmin("grade", "G001", { op: "upsert" });
    await expect(
      handleLiveGuest("grade", "G001", {
        guestId: "g1",
        kind: "answer",
        payload: { questionIndex: 0, choiceIndex: 0 },
      }),
    ).rejects.toThrow(/not answering/i);

    await handleLiveAdmin("grade", "G001", { op: "start" });
    await handleLiveGuest("grade", "G001", {
      guestId: "g1",
      name: "満点",
      kind: "answer",
      payload: { questionIndex: 0, choiceIndex: 0 },
    });
    const snap = await getLiveSnapshot("grade", "G001");
    const summary = snap?.summary as {
      ranking: { name: string; correct: number }[];
    };
    expect(summary.ranking[0]?.name).toBe("満点");
    expect(summary.ranking[0]?.correct).toBe(1);
  });

  it("UT-LIVE-STORE-05: 相関図リンクを登録できる", async () => {
    await handleLiveAdmin("graph", "R001", { op: "collect" });
    await handleLiveGuest("graph", "R001", {
      guestId: "g1",
      name: "次郎",
      kind: "link",
      payload: { name: "次郎", target: "bride", relation: "友人" },
    });
    const snap = await getLiveSnapshot("graph", "R001");
    const summary = snap?.summary as { nodes: { name: string }[] };
    expect(summary.nodes.some((n) => n.name === "次郎")).toBe(true);
  });
});
