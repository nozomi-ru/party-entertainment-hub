import { kvGet, kvPut } from "@/lib/kv";
import {
  bumpExpiresAt,
  createRoomTtl,
  ensureRoomTtl,
  putOptionsForExpiresAt,
} from "@/lib/room-ttl";

export type PollQuestion = {
  q: string;
  choices: string[];
};

export type PollSession = {
  room: string;
  index: number;
  showResults: boolean;
  votes: number[][];
  questions: PollQuestion[];
  updatedAt: number;
  createdAt?: number;
  expiresAt?: number;
};

function sessionKey(room: string) {
  return `poll:${room}`;
}

export async function readPollSession(
  room: string,
): Promise<PollSession | null> {
  const raw = await kvGet(sessionKey(room));
  if (!raw) return null;
  try {
    return ensureRoomTtl(JSON.parse(raw) as PollSession);
  } catch {
    return null;
  }
}

export async function writePollSession(session: PollSession): Promise<void> {
  const withTtl = ensureRoomTtl(session);
  await kvPut(sessionKey(withTtl.room), JSON.stringify(withTtl), putOptionsForExpiresAt(withTtl.expiresAt));
}

export async function openPollSession(
  room: string,
  questions: PollQuestion[],
  votes: number[][],
): Promise<PollSession | null> {
  if (await readPollSession(room)) return null;
  const ttl = createRoomTtl();
  const session: PollSession = {
    room,
    index: 0,
    showResults: false,
    votes,
    questions,
    updatedAt: ttl.createdAt,
    createdAt: ttl.createdAt,
    expiresAt: ttl.expiresAt,
  };
  await writePollSession(session);
  return session;
}

export async function extendPollSession(
  room: string,
): Promise<PollSession | null> {
  const session = await readPollSession(room);
  if (!session) return null;
  session.expiresAt = bumpExpiresAt();
  session.updatedAt = Date.now();
  await writePollSession(session);
  return session;
}
