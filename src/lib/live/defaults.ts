import type { LiveGameId } from "@/lib/live/catalog";
import type { LiveState } from "@/lib/live/types";

export function createDefaultState(game: LiveGameId, room: string): LiveState {
  void room;
  const _never: never = game;
  throw new Error(`Unsupported live game: ${String(_never)}`);
}
