import { beforeEach, describe, expect, it } from "vitest";
import { resetKvMemoryForTests } from "@/lib/kv";
import { handleLiveAdmin, handleLiveGuest } from "@/lib/live/handlers";
import { getLiveSnapshot } from "@/lib/live/store";

describe("live store + handlers", () => {
  beforeEach(() => {
    resetKvMemoryForTests();
  });

  it("UT-LIVE-STORE-01: Admin 作成後に GET 相当で読める", async () => {
    await handleLiveAdmin("either", "E001", { op: "upsert" });
    const snap = await getLiveSnapshot("either", "E001");
    expect(snap?.state.game).toBe("either");
    expect(snap?.state.room).toBe("E001");
  });

  it("UT-LIVE-STORE-02: 投票は個別キーで集計される", async () => {
    await handleLiveAdmin("either", "E002", { op: "openVote" });
    await handleLiveGuest("either", "E002", {
      guestId: "g1",
      name: "花子",
      kind: "vote",
      payload: { side: "left" },
    });
    await handleLiveGuest("either", "E002", {
      guestId: "g2",
      name: "太郎",
      kind: "vote",
      payload: { side: "right" },
    });
    const snap = await getLiveSnapshot("either", "E002");
    const summary = snap?.summary as { left: number; right: number; total: number };
    expect(summary.total).toBe(2);
    expect(summary.left).toBe(1);
    expect(summary.right).toBe(1);
  });

  it("UT-LIVE-STORE-03: 早押しは armed のときだけ受付", async () => {
    await handleLiveAdmin("buzz", "B001", { op: "upsert" });
    await expect(
      handleLiveGuest("buzz", "B001", {
        guestId: "g1",
        kind: "buzz",
        payload: {},
      }),
    ).rejects.toThrow(/armed/i);

    await handleLiveAdmin("buzz", "B001", { op: "arm" });
    await handleLiveGuest("buzz", "B001", {
      guestId: "g1",
      name: "速い",
      kind: "buzz",
      payload: {},
    });
    const snap = await getLiveSnapshot("buzz", "B001");
    const summary = snap?.summary as { winner: { name: string } | null };
    expect(summary.winner?.name).toBe("速い");
  });

  it("UT-LIVE-STORE-04: リクエスト投稿といいね", async () => {
    await handleLiveAdmin("request", "R001", { op: "open" });
    const posted = await handleLiveGuest("request", "R001", {
      guestId: "g1",
      name: "投稿者",
      kind: "post",
      payload: { text: "余興して" },
    });
    const postId = (posted.summary as { ranking: { id: string }[] }).ranking[0]
      .id;
    await handleLiveGuest("request", "R001", {
      guestId: "g2",
      kind: "like",
      payload: { postId },
    });
    const snap = await getLiveSnapshot("request", "R001");
    const ranking = (snap?.summary as { ranking: { likes: number; text: string }[] })
      .ranking;
    expect(ranking[0].text).toBe("余興して");
    expect(ranking[0].likes).toBe(1);
  });
});
