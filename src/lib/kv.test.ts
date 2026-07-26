import { beforeEach, describe, expect, it } from "vitest";
import { kvGet, kvList, kvPut, resetKvMemoryForTests } from "@/lib/kv";

describe("kv (メモリ)", () => {
  beforeEach(() => {
    resetKvMemoryForTests();
  });

  it("UT-KV-01: put した値を get できる", async () => {
    await kvPut("demo:a", "hello");
    await expect(kvGet("demo:a")).resolves.toBe("hello");
  });

  it("UT-KV-02: 無いキーは null", async () => {
    await expect(kvGet("demo:missing")).resolves.toBeNull();
  });

  it("UT-KV-03: list は prefix で絞り込む", async () => {
    await kvPut("vote:u1:1", "a");
    await kvPut("vote:u2:2", "b");
    await kvPut("other:x", "c");

    const listed = await kvList({ prefix: "vote:" });
    expect(listed.keys.map((k) => k.name)).toEqual(["vote:u1:1", "vote:u2:2"]);
    expect(listed.list_complete).toBe(true);
  });

  it("UT-KV-04: list は cursor でページングできる", async () => {
    await kvPut("p:1", "1");
    await kvPut("p:2", "2");
    await kvPut("p:3", "3");

    const page1 = await kvList({ prefix: "p:", limit: 2 });
    expect(page1.keys.map((k) => k.name)).toEqual(["p:1", "p:2"]);
    expect(page1.list_complete).toBe(false);

    const page2 = await kvList({
      prefix: "p:",
      limit: 2,
      cursor: page1.cursor,
    });
    expect(page2.keys.map((k) => k.name)).toEqual(["p:3"]);
    expect(page2.list_complete).toBe(true);
  });
});
