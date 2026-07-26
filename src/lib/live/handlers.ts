import type { LiveGameId } from "@/lib/live/catalog";
import { createDefaultState } from "@/lib/live/defaults";
import {
  ensureLiveState,
  getLiveSnapshot,
  listLiveActions,
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

  // ゲーム固有ショートカット
  if (game === "buzz") {
    if (op === "arm") {
      state = {
        ...(state as Extract<LiveState, { game: "buzz" }>),
        phase: "armed",
        updatedAt: Date.now(),
      };
    } else if (op === "lock") {
      state = {
        ...(state as Extract<LiveState, { game: "buzz" }>),
        phase: "locked",
        updatedAt: Date.now(),
      };
    } else if (op === "reveal") {
      state = {
        ...(state as Extract<LiveState, { game: "buzz" }>),
        phase: "reveal",
        updatedAt: Date.now(),
      };
    } else if (op === "next") {
      const prev = state as Extract<LiveState, { game: "buzz" }>;
      state = {
        ...prev,
        phase: "lobby",
        round: prev.round + 1,
        question: String(body.question ?? prev.question),
        answer: String(body.answer ?? prev.answer),
        updatedAt: Date.now(),
      };
    }
  }

  if (game === "digibingo" && op === "draw") {
    const s = state as Extract<LiveState, { game: "digibingo" }>;
    const pool = Array.from({ length: s.max }, (_, i) => i + 1).filter(
      (n) => !s.drawn.includes(n),
    );
    if (pool.length) {
      const n = pool[Math.floor(Math.random() * pool.length)];
      state = {
        ...s,
        phase: "playing",
        drawn: [...s.drawn, n],
        updatedAt: Date.now(),
      };
    }
  }

  if (game === "either") {
    if (op === "openVote") {
      state = {
        ...(state as Extract<LiveState, { game: "either" }>),
        phase: "voting",
        updatedAt: Date.now(),
      };
    } else if (op === "showResults") {
      state = {
        ...(state as Extract<LiveState, { game: "either" }>),
        phase: "results",
        updatedAt: Date.now(),
      };
    }
  }

  if (game === "dress") {
    if (op === "openVote") {
      state = {
        ...(state as Extract<LiveState, { game: "dress" }>),
        phase: "voting",
        correctIndex: null,
        updatedAt: Date.now(),
      };
    } else if (op === "reveal") {
      const idx = Number(body.correctIndex);
      state = {
        ...(state as Extract<LiveState, { game: "dress" }>),
        phase: "reveal",
        correctIndex: Number.isFinite(idx) ? idx : 0,
        updatedAt: Date.now(),
      };
    }
  }

  if (game === "treasure" && op === "start") {
    state = {
      ...(state as Extract<LiveState, { game: "treasure" }>),
      phase: "hunting",
      updatedAt: Date.now(),
    };
  }

  if (game === "grade") {
    if (op === "start") {
      state = {
        ...(state as Extract<LiveState, { game: "grade" }>),
        phase: "answering",
        index: 0,
        updatedAt: Date.now(),
      };
    } else if (op === "next") {
      const s = state as Extract<LiveState, { game: "grade" }>;
      const next = s.index + 1;
      state = {
        ...s,
        index: next,
        phase: next >= s.questions.length ? "results" : "answering",
        updatedAt: Date.now(),
      };
    } else if (op === "results") {
      state = {
        ...(state as Extract<LiveState, { game: "grade" }>),
        phase: "results",
        updatedAt: Date.now(),
      };
    }
  }

  if (game === "request" && (op === "open" || op === "close")) {
    state = {
      ...(state as Extract<LiveState, { game: "request" }>),
      phase: op === "open" ? "open" : "closed",
      updatedAt: Date.now(),
    };
  }

  if (game === "graph" && (op === "collect" || op === "show")) {
    state = {
      ...(state as Extract<LiveState, { game: "graph" }>),
      phase: op === "collect" ? "collect" : "show",
      updatedAt: Date.now(),
    };
  }

  await writeLiveState(state);
  return (await getLiveSnapshot(game, room))!;
}

export async function handleLiveGuest(
  game: LiveGameId,
  room: string,
  body: Record<string, unknown>,
): Promise<LiveSnapshot> {
  const state = await ensureLiveState(game, room);
  const guestId = String(body.guestId ?? "").trim();
  if (!guestId || guestId.length > 64) {
    throw new Error("Invalid guestId");
  }
  const name = clampName(body.name);
  const kind = String(body.kind ?? "");
  const payload = (body.payload as Record<string, unknown>) ?? {};

  // 重複防止: 一部アクションは guestId+kind(+キー) で固定 ID
  let id = newActionId();
  if (kind === "vote" || kind === "color" || kind === "buzz") {
    const round = Number(payload.round ?? (state as { round?: number }).round ?? 0);
    id = `${kind}-${round || "x"}`;
  }
  if (kind === "spot") {
    id = `spot-${String(payload.spotId ?? "")}`;
  }
  if (kind === "answer") {
    id = `ans-${Number(payload.questionIndex)}`;
  }
  if (kind === "like") {
    id = `like-${String(payload.postId ?? "")}`;
  }
  if (kind === "link") {
    id = "link";
  }

  // フェーズガード
  if (game === "buzz") {
    const s = state as Extract<LiveState, { game: "buzz" }>;
    if (kind === "buzz" && s.phase !== "armed") throw new Error("Not armed");
    payload.round = s.round;
  }
  if (game === "either") {
    const s = state as Extract<LiveState, { game: "either" }>;
    if (kind === "vote" && s.phase !== "voting") throw new Error("Voting closed");
  }
  if (game === "dress") {
    const s = state as Extract<LiveState, { game: "dress" }>;
    if (kind === "color" && s.phase !== "voting") throw new Error("Voting closed");
  }
  if (game === "treasure") {
    const s = state as Extract<LiveState, { game: "treasure" }>;
    if (kind === "spot" && s.phase !== "hunting") throw new Error("Not hunting");
    const spotId = String(payload.spotId ?? "");
    if (!s.spots.some((x) => x.id === spotId)) throw new Error("Unknown spot");
  }
  if (game === "grade") {
    const s = state as Extract<LiveState, { game: "grade" }>;
    if (kind === "answer" && s.phase !== "answering") {
      throw new Error("Not answering");
    }
  }
  if (game === "request") {
    const s = state as Extract<LiveState, { game: "request" }>;
    if (kind === "post") {
      if (s.phase !== "open") throw new Error("Closed");
      const text = String(payload.text ?? "").trim().slice(0, 80);
      if (!text) throw new Error("Empty");
      payload.text = text;
      id = newActionId();
    }
    if (kind === "like") {
      const postId = String(payload.postId ?? "");
      const actions = await listLiveActions(game, room);
      if (!actions.some((a) => a.kind === "post" && a.id === postId)) {
        throw new Error("Unknown post");
      }
    }
  }
  if (game === "graph") {
    const s = state as Extract<LiveState, { game: "graph" }>;
    if (kind === "link" && s.phase !== "collect") throw new Error("Closed");
  }
  if (game === "digibingo" && kind === "bingo") {
    // 報告のみ（クライアントでライン判定済み）
    id = "bingo-report";
  }

  const action: LiveAction = {
    id,
    guestId,
    name,
    kind,
    payload,
    at: Date.now(),
  };
  await putLiveAction(game, room, action);
  return (await getLiveSnapshot(game, room))!;
}
