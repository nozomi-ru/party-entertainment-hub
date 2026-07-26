import {
  KV_EVENT_TTL_SECONDS,
  kvGet,
  kvListAll,
  kvPut,
} from "@/lib/kv";
import {
  DRESS_COLORS,
  type DressColorId,
  isDressColorId,
} from "@/lib/dress/colors";

export type DressStatus = "idle" | "voting" | "closed" | "result";

export type DressStateRecord = {
  status: Exclude<DressStatus, "idle">;
  correct_color: DressColorId | null;
};

export type DressVoteRecord = {
  user_id: string;
  name: string;
  color: DressColorId;
  timestamp: number;
};

export const DRESS_STATE_KEY = "dress_state";
export const DRESS_VOTE_PREFIX = "dress_vote_";

function voteKey(userId: string): string {
  return `${DRESS_VOTE_PREFIX}${userId}`;
}

export async function readDressState(): Promise<DressStateRecord | null> {
  const raw = await kvGet(DRESS_STATE_KEY);
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
    return {
      status: parsed.status,
      correct_color:
        parsed.correct_color && isDressColorId(parsed.correct_color)
          ? parsed.correct_color
          : null,
    };
  } catch {
    return null;
  }
}

export async function writeDressState(state: DressStateRecord): Promise<void> {
  await kvPut(DRESS_STATE_KEY, JSON.stringify(state), {
    expirationTtl: KV_EVENT_TTL_SECONDS,
  });
}

export async function writeDressVote(vote: DressVoteRecord): Promise<void> {
  await kvPut(voteKey(vote.user_id), JSON.stringify(vote), {
    expirationTtl: KV_EVENT_TTL_SECONDS,
  });
}

export async function listDressVotes(): Promise<DressVoteRecord[]> {
  const rows = await kvListAll(DRESS_VOTE_PREFIX);
  const out: DressVoteRecord[] = [];
  for (const row of rows) {
    try {
      const v = JSON.parse(row.value) as DressVoteRecord;
      if (!v.user_id || !isDressColorId(v.color)) continue;
      out.push({
        user_id: String(v.user_id),
        name: String(v.name ?? "ゲスト").slice(0, 20) || "ゲスト",
        color: v.color,
        timestamp: Number(v.timestamp) || 0,
      });
    } catch {
      /* skip */
    }
  }
  return out;
}

export function countVotesByColor(votes: DressVoteRecord[]) {
  const counts: Record<DressColorId, number> = {
    orange: 0,
    bluegray: 0,
    white: 0,
    champagne: 0,
    rose: 0,
    navy: 0,
  };
  const seen = new Set<string>();
  for (const v of votes) {
    if (seen.has(v.user_id)) continue;
    seen.add(v.user_id);
    counts[v.color] += 1;
  }
  const total = [...seen].length;
  return { counts, total };
}

export function winnersForColor(
  votes: DressVoteRecord[],
  correct: DressColorId,
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

export type DressPublicSnapshot = {
  status: DressStatus;
  colors: { id: DressColorId; label: string; fill: string; glow: string }[];
  counts: Record<DressColorId, number>;
  total: number;
  /** result 時のみ公開（カンニング防止） */
  correct_color: DressColorId | null;
  winners: { user_id: string; name: string }[];
};

export async function getDressPublicSnapshot(): Promise<DressPublicSnapshot> {
  const state = await readDressState();
  const votes = await listDressVotes();
  const { counts, total } = countVotesByColor(votes);
  const status: DressStatus = state?.status ?? "idle";
  const reveal = status === "result" && state?.correct_color;

  return {
    status,
    colors: DRESS_COLORS.map((c) => ({
      id: c.id,
      label: c.label,
      fill: c.fill,
      glow: c.glow,
    })),
    counts,
    total,
    correct_color: reveal ? state!.correct_color : null,
    winners: reveal ? winnersForColor(votes, state!.correct_color!) : [],
  };
}
