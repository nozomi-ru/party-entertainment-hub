import { beforeEach, describe, expect, it } from "vitest";
import { resetKvMemoryForTests } from "@/lib/kv";
import { readPollSession, writePollSession } from "@/lib/poll-store";

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
    await expect(readPollSession("T001")).resolves.toEqual(session);
  });

  it("UT-STORE-02: 無いルームは null", async () => {
    await expect(readPollSession("ZZZZ")).resolves.toBeNull();
  });
});
