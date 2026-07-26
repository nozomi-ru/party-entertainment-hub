import { kvGet, kvPut, KV_EVENT_TTL_SECONDS } from "@/lib/kv";

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
    return JSON.parse(raw) as PollSession;
  } catch {
    return null;
  }
}

export async function writePollSession(session: PollSession): Promise<void> {
  await kvPut(sessionKey(session.room), JSON.stringify(session), {
    expirationTtl: KV_EVENT_TTL_SECONDS,
  });
}
