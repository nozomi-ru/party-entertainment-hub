import type { LiveGameId } from "@/lib/live/catalog";

/** Admin が書く進行状態（単一キー・Admin のみ上書き） */
export type LiveStateBase = {
  game: LiveGameId;
  room: string;
  phase: string;
  updatedAt: number;
};

export type BuzzState = LiveStateBase & {
  game: "buzz";
  phase: "lobby" | "armed" | "locked" | "reveal";
  question: string;
  answer: string;
  round: number;
};

export type DigibingoState = LiveStateBase & {
  game: "digibingo";
  phase: "lobby" | "playing" | "ended";
  drawn: number[];
  max: number;
};

export type EitherState = LiveStateBase & {
  game: "either";
  phase: "lobby" | "voting" | "results";
  question: string;
  left: string;
  right: string;
};

export type DressState = LiveStateBase & {
  game: "dress";
  phase: "lobby" | "voting" | "reveal";
  colors: string[];
  correctIndex: number | null;
};

export type TreasureState = LiveStateBase & {
  game: "treasure";
  phase: "lobby" | "hunting" | "ended";
  spots: { id: string; label: string; points: number }[];
};

export type GradeState = LiveStateBase & {
  game: "grade";
  phase: "lobby" | "answering" | "results";
  questions: { q: string; choices: string[]; answerIndex: number }[];
  index: number;
};

export type RequestState = LiveStateBase & {
  game: "request";
  phase: "open" | "closed";
  title: string;
};

export type GraphState = LiveStateBase & {
  game: "graph";
  phase: "collect" | "show";
  bride: string;
  groom: string;
};

export type LiveState =
  | BuzzState
  | DigibingoState
  | EitherState
  | DressState
  | TreasureState
  | GradeState
  | RequestState
  | GraphState;

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
