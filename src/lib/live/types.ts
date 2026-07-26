import type { LiveGameId } from "@/lib/live/catalog";

/** Admin が書く進行状態（汎用 live API 用・現行ゲームなし） */
export type LiveStateBase = {
  game: LiveGameId;
  room: string;
  phase: string;
  updatedAt: number;
};

export type LiveState = LiveStateBase;

export type LiveAction = {
  id: string;
  guestId: string;
  name?: string;
  kind: string;
  payload: Record<string, unknown>;
  at: number;
};

export type LiveSnapshot = {
  state: LiveState;
  actions: LiveAction[];
  summary: Record<string, unknown>;
};
