import type { LiveGameId } from "@/lib/live/catalog";

/** Admin が書く進行状態（単一キー・Admin のみ上書き） */
export type LiveStateBase = {
  game: LiveGameId;
  room: string;
  phase: string;
  updatedAt: number;
};

export type GradeState = LiveStateBase & {
  game: "grade";
  phase: "lobby" | "answering" | "results";
  questions: { q: string; choices: string[]; answerIndex: number }[];
  index: number;
};

export type GraphState = LiveStateBase & {
  game: "graph";
  phase: "collect" | "show";
  bride: string;
  groom: string;
};

export type LiveState = GradeState | GraphState;

/** ゲスト行動（一意キーで put） */
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
