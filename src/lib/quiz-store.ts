import { kvGet, kvPut, KV_EVENT_TTL_SECONDS } from "@/lib/kv";

export type QuizEntry = {
  name: string;
  score: number;
  total: number;
  submittedAt: number;
};

export type QuizSession = {
  room: string;
  entries: QuizEntry[];
  createdAt: number;
};

function sessionKey(room: string) {
  return `quiz:${room}`;
}

export async function readQuizSession(
  room: string,
): Promise<QuizSession | null> {
  const raw = await kvGet(sessionKey(room));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QuizSession;
  } catch {
    return null;
  }
}

export async function writeQuizSession(session: QuizSession): Promise<void> {
  await kvPut(sessionKey(session.room), JSON.stringify(session), {
    expirationTtl: KV_EVENT_TTL_SECONDS,
  });
}
