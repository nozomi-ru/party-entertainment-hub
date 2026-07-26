import { beforeEach, describe, expect, it } from "vitest";
import { buildGraph } from "@/lib/graph/build";
import {
  listGraphNodes,
  putGraphNode,
  resetGraphRoom,
} from "@/lib/graph/store";
import { resetKvMemoryForTests } from "@/lib/kv";
import type { GraphNodeRecord } from "@/lib/graph/types";

const ROOM = "GR01";

function node(
  partial: Partial<GraphNodeRecord> & Pick<GraphNodeRecord, "user_id" | "name">,
): GraphNodeRecord {
  return {
    user_id: partial.user_id,
    name: partial.name,
    side: partial.side ?? "groom",
    tags: partial.tags ?? ["大学"],
    message: partial.message ?? "",
    timestamp: partial.timestamp ?? 1,
  };
}

describe("graph buildGraph", () => {
  it("UT-GRAPH-01: 新郎新婦とゲスト主線", () => {
    const { nodes, links } = buildGraph([
      node({ user_id: "u1", name: "太郎", side: "groom", tags: ["会社"] }),
      node({ user_id: "u2", name: "花子", side: "bride", tags: ["大学"] }),
    ]);
    expect(nodes.some((n) => n.id === "bride")).toBe(true);
    expect(nodes.some((n) => n.id === "groom")).toBe(true);
    expect(links.some((l) => l.source === "g:u1" && l.target === "groom")).toBe(
      true,
    );
    expect(links.some((l) => l.source === "g:u2" && l.target === "bride")).toBe(
      true,
    );
  });

  it("UT-GRAPH-02: 共通タグでゲスト同士が結ばれる", () => {
    const { links } = buildGraph([
      node({ user_id: "a", name: "A", tags: ["大学", "趣味の集まり"] }),
      node({ user_id: "b", name: "B", tags: ["大学"] }),
      node({ user_id: "c", name: "C", side: "bride", tags: ["会社"] }),
    ]);
    const tagLinks = links.filter((l) => l.kind === "tag");
    expect(tagLinks).toHaveLength(1);
    expect(
      [tagLinks[0].source, tagLinks[0].target].sort().join("|"),
    ).toBe("g:a|g:b");
  });
});

describe("graph store", () => {
  beforeEach(() => {
    resetKvMemoryForTests();
  });

  it("UT-GRAPH-03: put / list / reset", async () => {
    await putGraphNode(
      ROOM,
      node({ user_id: "u1", name: "次郎", tags: ["友人"] }),
    );
    let list = await listGraphNodes(ROOM);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("次郎");

    const deleted = await resetGraphRoom(ROOM);
    expect(deleted).toBe(1);
    list = await listGraphNodes(ROOM);
    expect(list).toHaveLength(0);
  });

  it("UT-GRAPH-04: 同じルームコードは再作成できない", async () => {
    const { openGraphRoom } = await import("@/lib/graph/store");
    expect(await openGraphRoom("GX01")).toBe(true);
    expect(await openGraphRoom("GX01")).toBe(false);
  });
});
