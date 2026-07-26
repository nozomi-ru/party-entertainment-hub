import {
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
import {
  DEFAULT_DRESS_COLORS,
  findDressColor,
  normalizeDressColors,
  type DressColorOption,
} from "@/lib/dress/colors";
import { parseRoomParam } from "@/lib/live/room-code";

export type DressStatus = "idle" | "voting" | "closed" | "result";

export type DressStateRecord = {
  status: Exclude<DressStatus, "idle">;
  correct_color: string | null;
};

export type DressVoteRecord = {
  user_id: string;
  name: string;
  color: string;
  timestamp: number;
};

export const DRESS_VOTE_PREFIX_TAIL = ":vote:";

export function normalizeDressRoom(raw: unknown): string {
  return parseRoomParam(String(raw ?? ""));
}

function stateKey(room: string): string {
  return `dress:${room}:state`;
}

function colorsKey(room: string): string {
  return `dress:${room}:colors`;
}

function metaKey(room: string): string {
  return `dress:${room}:meta`;
}

function votePrefix(room: string): string {
  return `dress:${room}:vote:`;
}

function voteKey(room: string, userId: string): string {
  return `${votePrefix(room)}${userId}`;
}

function roomPrefix(room: string): string {
  return `dress:${room}:`;
}

export async function readDressMeta(room: string): Promise<RoomTtlMeta | null> {
  const raw = await kvGet(metaKey(room));
  if (!raw) return null;
  try {
    return ensureRoomTtl(JSON.parse(raw) as Partial<RoomTtlMeta>);
  } catch {
    return null;
  }
}

async function dressPutOptions(room: string) {
  const meta = await readDressMeta(room);
  const expiresAt = meta?.expiresAt ?? createRoomTtl().expiresAt;
  return putOptionsForExpiresAt(expiresAt);
}

/** このアプリ内でルームが既に使われているか */
export async function dressRoomExists(room: string): Promise<boolean> {
  if (await kvGet(metaKey(room))) return true;
  if (await kvGet(stateKey(room))) return true;
  if (await kvGet(colorsKey(room))) return true;
  const page = await kvList({ prefix: votePrefix(room), limit: 1 });
  return page.keys.length > 0;
}

/** 未使用ルームを確保。既存なら false */
export async function openDressRoom(room: string): Promise<boolean> {
  if (await dressRoomExists(room)) return false;
  const ttl = createRoomTtl();
  await kvPut(metaKey(room), JSON.stringify(ttl), putOptionsForExpiresAt(ttl.expiresAt));
  return true;
}

export async function extendDressRoom(
  room: string,
): Promise<RoomTtlMeta | null> {
  if (!(await dressRoomExists(room))) return null;
  const prev = await readDressMeta(room);
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

export async function readDressColors(room: string): Promise<DressColorOption[]> {
  const raw = await kvGet(colorsKey(room));
  if (!raw) return DEFAULT_DRESS_COLORS.map((c) => ({ ...c }));
  try {
    const parsed = normalizeDressColors(JSON.parse(raw));
    return parsed ?? DEFAULT_DRESS_COLORS.map((c) => ({ ...c }));
  } catch {
    return DEFAULT_DRESS_COLORS.map((c) => ({ ...c }));
  }
}

export async function writeDressColors(
  room: string,
  colors: DressColorOption[],
): Promise<void> {
  const normalized = normalizeDressColors(colors);
  if (!normalized) throw new Error("Invalid colors");
  await kvPut(colorsKey(room), JSON.stringify(normalized), await dressPutOptions(room));
}

export async function readDressState(
  room: string,
): Promise<DressStateRecord | null> {
  const raw = await kvGet(stateKey(room));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DressStateRecord;
    if (
      parsed.status !== "voting" &&
      parsed.status !== "closed" &&
      parsed.status !== "result"
    ) {
      return null;
    }
    const colors = await readDressColors(room);
    const correct =
      parsed.correct_color &&
      findDressColor(colors, String(parsed.correct_color))
        ? String(parsed.correct_color)
        : null;
    return {
      status: parsed.status,
      correct_color: correct,
    };
  } catch {
    return null;
  }
}

export async function writeDressState(
  room: string,
  state: DressStateRecord,
): Promise<void> {
  await kvPut(stateKey(room), JSON.stringify(state), await dressPutOptions(room));
}

export async function writeDressVote(
  room: string,
  vote: DressVoteRecord,
): Promise<void> {
  await kvPut(voteKey(room, vote.user_id), JSON.stringify(vote), await dressPutOptions(room));
}

export async function listDressVotes(room: string): Promise<DressVoteRecord[]> {
  const colors = await readDressColors(room);
  const allowed = new Set(colors.map((c) => c.id));
  const rows = await kvListAll(votePrefix(room));
  const out: DressVoteRecord[] = [];
  for (const row of rows) {
    try {
      const v = JSON.parse(row.value) as DressVoteRecord;
      const color = String(v.color ?? "");
      if (!v.user_id || !allowed.has(color)) continue;
      out.push({
        user_id: String(v.user_id),
        name: String(v.name ?? "ゲスト").slice(0, 20) || "ゲスト",
        color,
        timestamp: Number(v.timestamp) || 0,
      });
    } catch {
      /* skip */
    }
  }
  return out;
}

export function countVotesByColor(
  votes: DressVoteRecord[],
  colors: DressColorOption[],
): { counts: Record<string, number>; total: number } {
  const counts: Record<string, number> = {};
  for (const c of colors) counts[c.id] = 0;
  const seen = new Set<string>();
  for (const v of votes) {
    if (seen.has(v.user_id)) continue;
    seen.add(v.user_id);
    if (counts[v.color] != null) counts[v.color] += 1;
  }
  return { counts, total: seen.size };
}

export function winnersForColor(
  votes: DressVoteRecord[],
  correct: string,
): { user_id: string; name: string }[] {
  const byUser = new Map<string, DressVoteRecord>();
  for (const v of votes) {
    byUser.set(v.user_id, v);
  }
  return [...byUser.values()]
    .filter((v) => v.color === correct)
    .map((v) => ({ user_id: v.user_id, name: v.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

/** 1人1票に正規化した投票一覧（名前付き） */
export function uniqueVoters(
  votes: DressVoteRecord[],
): { user_id: string; name: string; color: string }[] {
  const byUser = new Map<string, DressVoteRecord>();
  for (const v of votes) {
    byUser.set(v.user_id, v);
  }
  return [...byUser.values()]
    .map((v) => ({
      user_id: v.user_id,
      name: v.name,
      color: v.color,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

export function votersByColorMap(
  votes: DressVoteRecord[],
  colors: DressColorOption[],
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const c of colors) out[c.id] = [];
  for (const v of uniqueVoters(votes)) {
    if (out[v.color]) out[v.color].push(v.name);
  }
  return out;
}

export type DressPublicSnapshot = {
  room: string;
  status: DressStatus;
  colors: DressColorOption[];
  counts: Record<string, number>;
  total: number;
  correct_color: string | null;
  winners: { user_id: string; name: string }[];
  /** 投票者一覧（名前・色） */
  voters: { user_id: string; name: string; color: string }[];
  /** 色ごと投票者名 */
  voters_by_color: Record<string, string[]>;
  createdAt?: number;
  expiresAt?: number;
};

export async function getDressPublicSnapshot(
  room: string,
): Promise<DressPublicSnapshot> {
  const state = await readDressState(room);
  const colors = await readDressColors(room);
  const votes = await listDressVotes(room);
  const meta = await readDressMeta(room);
  const { counts, total } = countVotesByColor(votes, colors);
  const status: DressStatus = state?.status ?? "idle";
  const reveal = status === "result" && state?.correct_color;
  const voters = uniqueVoters(votes);

  return {
    room,
    status,
    colors,
    counts,
    total,
    correct_color: reveal ? state!.correct_color : null,
    winners: reveal ? winnersForColor(votes, state!.correct_color!) : [],
    voters,
    voters_by_color: votersByColorMap(votes, colors),
    createdAt: meta?.createdAt,
    expiresAt: meta?.expiresAt,
  };
}
