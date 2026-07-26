import type {
  GraphNodeRecord,
  GraphVizData,
  GraphVizLink,
  GraphVizNode,
} from "@/lib/graph/types";

export type BuildGraphOptions = {
  brideName?: string;
  groomName?: string;
};

/**
 * ゲスト配列から force-graph 用 nodes / links を生成する。
 * - 主線: ゲスト → 新郎 or 新婦
 * - 副線: 共通タグを持つゲスト同士
 */
export function buildGraph(
  guests: GraphNodeRecord[],
  options: BuildGraphOptions = {},
): GraphVizData {
  const brideName = options.brideName?.trim() || "新婦";
  const groomName = options.groomName?.trim() || "新郎";

  const nodes: GraphVizNode[] = [
    {
      id: "bride",
      name: brideName,
      group: "couple",
      kind: "couple",
      side: "bride",
    },
    {
      id: "groom",
      name: groomName,
      group: "couple",
      kind: "couple",
      side: "groom",
    },
  ];

  const links: GraphVizLink[] = [
    { source: "bride", target: "groom", kind: "couple", label: "夫婦" },
  ];

  const byId = new Map<string, GraphNodeRecord>();
  for (const g of guests) {
    if (!g.user_id || !g.name) continue;
    byId.set(g.user_id, g);
    const nodeId = guestNodeId(g.user_id);
    nodes.push({
      id: nodeId,
      name: g.name,
      group: g.side === "bride" ? "bride" : "groom",
      kind: "guest",
      side: g.side,
      tags: g.tags,
      message: g.message,
    });
    links.push({
      source: nodeId,
      target: g.side === "bride" ? "bride" : "groom",
      kind: "couple",
    });
  }

  const guestList = [...byId.values()];
  const seenPairs = new Set<string>();
  for (let i = 0; i < guestList.length; i++) {
    for (let j = i + 1; j < guestList.length; j++) {
      const a = guestList[i];
      const b = guestList[j];
      const shared = sharedTags(a.tags, b.tags);
      if (shared.length === 0) continue;
      const idA = guestNodeId(a.user_id);
      const idB = guestNodeId(b.user_id);
      const pairKey = idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);
      links.push({
        source: idA,
        target: idB,
        kind: "tag",
        label: shared[0],
      });
    }
  }

  return { nodes, links };
}

export function guestNodeId(userId: string): string {
  return `g:${userId}`;
}

function sharedTags(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(normalizeTag).filter(Boolean));
  const out: string[] = [];
  for (const t of a) {
    const n = normalizeTag(t);
    if (n && setB.has(n)) out.push(n);
  }
  return out;
}

export function normalizeTag(raw: string): string {
  return raw.trim().slice(0, 16);
}
