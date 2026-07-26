import type { LiveGameId } from "@/lib/live/catalog";
import { createDefaultState } from "@/lib/live/defaults";
import {
  ensureLiveState,
  getLiveSnapshot,
  newActionId,
  putLiveAction,
  writeLiveState,
} from "@/lib/live/store";
import type { LiveAction, LiveSnapshot, LiveState } from "@/lib/live/types";

function clampName(raw: unknown): string {
  return String(raw ?? "ゲスト").trim().slice(0, 20) || "ゲスト";
}

export async function handleLiveAdmin(
  game: LiveGameId,
  room: string,
  body: Record<string, unknown>,
): Promise<LiveSnapshot> {
  const op = String(body.op ?? "upsert");
  let state = await ensureLiveState(game, room);

  if (op === "reset") {
    state = createDefaultState(game, room);
    await writeLiveState(state);
    return (await getLiveSnapshot(game, room))!;
  }

  if (op === "patch" && body.state && typeof body.state === "object") {
    state = {
      ...state,
      ...(body.state as object),
      game,
      room,
      updatedAt: Date.now(),
    } as LiveState;
    await writeLiveState(state);
    return (await getLiveSnapshot(game, room))!;
  }

  await writeLiveState(state);
  return (await getLiveSnapshot(game, room))!;
}

export async function handleLiveGuest(
  game: LiveGameId,
  room: string,
  body: Record<string, unknown>,
): Promise<LiveSnapshot> {
  await ensureLiveState(game, room);
  const guestId = String(body.guestId ?? "").trim();
  if (!guestId || guestId.length > 64) {
    throw new Error("Invalid guestId");
  }
  const name = clampName(body.name);
  const kind = String(body.kind ?? "");
  const payload = (body.payload as Record<string, unknown>) ?? {};

  const action: LiveAction = {
    id: newActionId(),
    guestId,
    name,
    kind,
    payload,
    at: Date.now(),
  };
  await putLiveAction(game, room, action);
  return (await getLiveSnapshot(game, room))!;
}
