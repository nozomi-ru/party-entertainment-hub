import { kvGet, kvListAll, kvPut, KV_EVENT_TTL_SECONDS } from "@/lib/kv";
import type { LiveGameId } from "@/lib/live/catalog";
import { createDefaultState } from "@/lib/live/defaults";
import { summarizeLive } from "@/lib/live/summary";
import type { LiveAction, LiveSnapshot, LiveState } from "@/lib/live/types";

function stateKey(game: LiveGameId, room: string) {
  return `live:${game}:${room}:state`;
}

function actionPrefix(game: LiveGameId, room: string) {
  return `live:${game}:${room}:a:`;
}

function actionKey(
  game: LiveGameId,
  room: string,
  guestId: string,
  actionId: string,
) {
  return `${actionPrefix(game, room)}${guestId}:${actionId}`;
}

export async function readLiveState(
  game: LiveGameId,
  room: string,
): Promise<LiveState | null> {
  const raw = await kvGet(stateKey(game, room));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LiveState;
  } catch {
    return null;
  }
}

export async function writeLiveState(state: LiveState): Promise<void> {
  await kvPut(stateKey(state.game, state.room), JSON.stringify(state), {
    expirationTtl: KV_EVENT_TTL_SECONDS,
  });
}

export async function ensureLiveState(
  game: LiveGameId,
  room: string,
): Promise<LiveState> {
  const existing = await readLiveState(game, room);
  if (existing) return existing;
  const created = createDefaultState(game, room);
  await writeLiveState(created);
  return created;
}

export async function listLiveActions(
  game: LiveGameId,
  room: string,
): Promise<LiveAction[]> {
  const rows = await kvListAll(actionPrefix(game, room));
  const actions: LiveAction[] = [];
  for (const row of rows) {
    try {
      actions.push(JSON.parse(row.value) as LiveAction);
    } catch {
      /* skip */
    }
  }
  return actions.sort((a, b) => a.at - b.at);
}

export async function putLiveAction(
  game: LiveGameId,
  room: string,
  action: LiveAction,
): Promise<void> {
  await kvPut(
    actionKey(game, room, action.guestId, action.id),
    JSON.stringify(action),
    { expirationTtl: KV_EVENT_TTL_SECONDS },
  );
}

export async function getLiveSnapshot(
  game: LiveGameId,
  room: string,
): Promise<LiveSnapshot | null> {
  const state = await readLiveState(game, room);
  if (!state) return null;
  const actions = await listLiveActions(game, room);
  return {
    state,
    actions,
    summary: summarizeLive(state, actions),
  };
}

export function newActionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
