import {
  kvDelete,
  kvGet,
  kvList,
  kvListAll,
  kvPut,
} from "@/lib/kv";
import {
  bumpExpiresAt,
  createRoomTtl,
  ensureRoomTtl,
  putOptionsForExpiresAt,
  refreshKvPrefixTtl,
  type RoomTtlMeta,
} from "@/lib/room-ttl";
import { parseRoomParam } from "@/lib/live/room-code";
import {
  GRAPH_MESSAGE_MAX,
  GRAPH_NAME_MAX,
  GRAPH_TAG_MAX,
  type GraphNodeRecord,
  type GraphSide,
} from "@/lib/graph/types";
import { normalizeTag } from "@/lib/graph/build";

export function normalizeGraphRoom(raw: unknown): string {
  return parseRoomParam(String(raw ?? ""));
}

function nodeKey(room: string, userId: string): string {
  return `graph:${room}:node:${userId}`;
}

function nodePrefix(room: string): string {
  return `graph:${room}:node:`;
}

function metaKey(room: string): string {
  return `graph:${room}:meta`;
}

function roomPrefix(room: string): string {
  return `graph:${room}:`;
}

export async function readGraphMeta(room: string): Promise<RoomTtlMeta | null> {
  const raw = await kvGet(metaKey(room));
  if (!raw) return null;
  try {
    return ensureRoomTtl(JSON.parse(raw) as Partial<RoomTtlMeta>);
  } catch {
    return null;
  }
}

async function graphPutOptions(room: string) {
  const meta = await readGraphMeta(room);
  const expiresAt = meta?.expiresAt ?? createRoomTtl().expiresAt;
  return putOptionsForExpiresAt(expiresAt);
}

export async function graphRoomExists(room: string): Promise<boolean> {
  if (await kvGet(metaKey(room))) return true;
  const page = await kvList({ prefix: nodePrefix(room), limit: 1 });
  return page.keys.length > 0;
}

/** 未使用ルームを確保。既存なら false */
export async function openGraphRoom(room: string): Promise<boolean> {
  if (await graphRoomExists(room)) return false;
  const ttl = createRoomTtl();
  await kvPut(
    metaKey(room),
    JSON.stringify(ttl),
    putOptionsForExpiresAt(ttl.expiresAt),
  );
  return true;
}

export async function extendGraphRoom(
  room: string,
): Promise<RoomTtlMeta | null> {
  if (!(await graphRoomExists(room))) return null;
  const prev = await readGraphMeta(room);
  const meta: RoomTtlMeta = {
    createdAt: prev?.createdAt ?? Date.now(),
    expiresAt: bumpExpiresAt(),
  };
  await refreshKvPrefixTtl(roomPrefix(room), meta.expiresAt, (name, value) =>
    name === metaKey(room) ? JSON.stringify(meta) : value,
  );
  await kvPut(
    metaKey(room),
    JSON.stringify(meta),
    putOptionsForExpiresAt(meta.expiresAt),
  );
  return meta;
}

export function normalizeGraphSide(raw: unknown): GraphSide | null {
  const s = String(raw ?? "");
  if (s === "groom" || s === "bride") return s;
  return null;
}

export function normalizeGraphTags(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const t = normalizeTag(String(item ?? ""));
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= GRAPH_TAG_MAX) break;
  }
  return out;
}

export function parseGraphNodeRecord(raw: string): GraphNodeRecord | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GraphNodeRecord>;
    const user_id = String(parsed.user_id ?? "").trim().slice(0, 64);
    const name = String(parsed.name ?? "").trim().slice(0, GRAPH_NAME_MAX);
    const side = normalizeGraphSide(parsed.side);
    const tags = normalizeGraphTags(parsed.tags ?? []);
    if (!user_id || !name || !side || !tags) return null;
    return {
      user_id,
      name,
      side,
      tags,
      message: String(parsed.message ?? "")
        .trim()
        .slice(0, GRAPH_MESSAGE_MAX),
      timestamp: Number(parsed.timestamp) || 0,
    };
  } catch {
    return null;
  }
}

export async function listGraphNodes(room: string): Promise<GraphNodeRecord[]> {
  const rows = await kvListAll(nodePrefix(room));
  const out: GraphNodeRecord[] = [];
  for (const row of rows) {
    const node = parseGraphNodeRecord(row.value);
    if (node) out.push(node);
  }
  return out.sort((a, b) => a.timestamp - b.timestamp);
}

export async function putGraphNode(
  room: string,
  node: GraphNodeRecord,
): Promise<void> {
  await kvPut(
    nodeKey(room, node.user_id),
    JSON.stringify(node),
    await graphPutOptions(room),
  );
}

export async function getGraphNode(
  room: string,
  userId: string,
): Promise<GraphNodeRecord | null> {
  const raw = await kvGet(nodeKey(room, userId));
  if (!raw) return null;
  return parseGraphNodeRecord(raw);
}

/** ルーム内のゲストノードをすべて削除（Admin リセット） */
export async function resetGraphRoom(room: string): Promise<number> {
  const rows = await kvListAll(nodePrefix(room));
  for (const row of rows) {
    await kvDelete(row.name);
  }
  return rows.length;
}
