import { kvGet, kvPut } from "@/lib/kv";
import {
  bumpExpiresAt,
  createRoomTtl,
  ensureRoomTtl,
  putOptionsForExpiresAt,
} from "@/lib/room-ttl";

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
  expiresAt?: number;
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
    return ensureRoomTtl(JSON.parse(raw) as QuizSession);
  } catch {
    return null;
  }
}

export async function writeQuizSession(session: QuizSession): Promise<void> {
  const withTtl = ensureRoomTtl(session);
  await kvPut(
    sessionKey(withTtl.room),
    JSON.stringify(withTtl),
    putOptionsForExpiresAt(withTtl.expiresAt),
  );
}

export async function openQuizSession(room: string): Promise<QuizSession | null> {
  if (await readQuizSession(room)) return null;
  const ttl = createRoomTtl();
  const session: QuizSession = {
    room,
    entries: [],
    createdAt: ttl.createdAt,
    expiresAt: ttl.expiresAt,
  };
  await writeQuizSession(session);
  return session;
}

export async function extendQuizSession(
  room: string,
): Promise<QuizSession | null> {
  const session = await readQuizSession(room);
  if (!session) return null;
  session.expiresAt = bumpExpiresAt();
  await writeQuizSession(session);
  return session;
}
