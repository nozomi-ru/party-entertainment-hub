import { beforeEach, describe, expect, it } from "vitest";
import { resetKvMemoryForTests } from "@/lib/kv";
import { readQuizSession, writeQuizSession } from "@/lib/quiz-store";

describe("quiz-store (メモリ)", () => {
  beforeEach(() => {
    resetKvMemoryForTests();
  });

  it("UT-QUIZ-STORE-01: 書き込んだセッションを読める", async () => {
    const session = { room: "Q001", entries: [], createdAt: 1 };
    await writeQuizSession(session);
    await expect(readQuizSession("Q001")).resolves.toEqual(session);
  });

  it("UT-QUIZ-STORE-02: 無いルームは null", async () => {
    await expect(readQuizSession("ZZZZ")).resolves.toBeNull();
  });

  it("UT-QUIZ-STORE-03: エントリを追加して再読できる", async () => {
    const session = { room: "Q002", entries: [], createdAt: 1 };
    await writeQuizSession(session);
    const current = await readQuizSession("Q002");
    current!.entries.push({ name: "太郎", score: 3, total: 5, submittedAt: 2 });
    await writeQuizSession(current!);
    const updated = await readQuizSession("Q002");
    expect(updated?.entries).toHaveLength(1);
    expect(updated?.entries[0].name).toBe("太郎");
  });

  it("UT-QUIZ-STORE-04: エントリをクリアできる", async () => {
    const session = {
      room: "Q003",
      entries: [{ name: "花子", score: 5, total: 5, submittedAt: 3 }],
      createdAt: 1,
    };
    await writeQuizSession(session);
    const current = await readQuizSession("Q003");
    current!.entries = [];
    await writeQuizSession(current!);
    const updated = await readQuizSession("Q003");
    expect(updated?.entries).toHaveLength(0);
  });
});
