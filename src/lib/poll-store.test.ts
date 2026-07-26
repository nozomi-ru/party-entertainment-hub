import { beforeEach, describe, expect, it } from "vitest";
import { resetKvMemoryForTests, KV_EVENT_TTL_SECONDS } from "@/lib/kv";
import {
  extendPollSession,
  openPollSession,
  readPollSession,
  writePollSession,
} from "@/lib/poll-store";

describe("poll-store (メモリ)", () => {
  beforeEach(() => {
    resetKvMemoryForTests();
  });

  it("UT-STORE-01: 書き込んだセッションを読める", async () => {
    const session = {
      room: "T001",
      index: 0,
      showResults: false,
      votes: [[0, 0]],
      questions: [{ q: "テスト", choices: ["A", "B"] }],
      updatedAt: 1,
    };

    await writePollSession(session);
    const read = await readPollSession("T001");
    expect(read).toMatchObject(session);
    expect(read?.createdAt).toBe(1);
    expect(typeof read?.expiresAt).toBe("number");
    expect(read!.expiresAt).toBeGreaterThan(1);
  });

  it("UT-STORE-02: 無いルームは null", async () => {
    await expect(readPollSession("ZZZZ")).resolves.toBeNull();
  });

  it("UT-STORE-03: extendPollSession で expiresAt が進む", async () => {
    const opened = await openPollSession(
      "EX01",
      [{ q: "延長?", choices: ["はい", "いいえ"] }],
      [[0, 0]],
    );
    expect(opened).not.toBeNull();
    const before = opened!.expiresAt;
    const extended = await extendPollSession("EX01");
    expect(extended).not.toBeNull();
    expect(extended!.expiresAt).toBeGreaterThanOrEqual(before);
    expect(extended!.expiresAt).toBeGreaterThan(
      Date.now() + KV_EVENT_TTL_SECONDS * 1000 - 5_000,
    );
  });
});
