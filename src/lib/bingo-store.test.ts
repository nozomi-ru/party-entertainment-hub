import { beforeEach, describe, expect, it } from "vitest";
import { resetKvMemoryForTests } from "@/lib/kv";
import { readBingoSession, writeBingoSession } from "@/lib/bingo-store";

describe("bingo-store (メモリ)", () => {
  beforeEach(() => {
    resetKvMemoryForTests();
  });

  it("UT-BINGO-STORE-01: 書き込んだセッションを読める", async () => {
    const session = { room: "B001", entries: [], createdAt: 1 };
    await writeBingoSession(session);
    await expect(readBingoSession("B001")).resolves.toEqual(session);
  });

  it("UT-BINGO-STORE-02: 無いルームは null", async () => {
    await expect(readBingoSession("ZZZZ")).resolves.toBeNull();
  });

  it("UT-BINGO-STORE-03: ビンゴ報告を追加して再読できる", async () => {
    const session = { room: "B002", entries: [], createdAt: 1 };
    await writeBingoSession(session);
    const current = await readBingoSession("B002");
    current!.entries.push({ name: "次郎", reportedAt: 2 });
    await writeBingoSession(current!);
    const updated = await readBingoSession("B002");
    expect(updated?.entries).toHaveLength(1);
    expect(updated?.entries[0].name).toBe("次郎");
  });

  it("UT-BINGO-STORE-04: エントリをクリアできる", async () => {
    const session = {
      room: "B003",
      entries: [{ name: "三郎", reportedAt: 3 }],
      createdAt: 1,
    };
    await writeBingoSession(session);
    const current = await readBingoSession("B003");
    current!.entries = [];
    await writeBingoSession(current!);
    const updated = await readBingoSession("B003");
    expect(updated?.entries).toHaveLength(0);
  });
});
