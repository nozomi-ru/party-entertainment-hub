import { kvGet, kvPut, KV_EVENT_TTL_SECONDS } from "@/lib/kv";

export type BingoEntry = {
  name: string;
  reportedAt: number;
};

export type BingoSession = {
  room: string;
  entries: BingoEntry[];
  createdAt: number;
};

function sessionKey(room: string) {
  return `bingo:${room}`;
}

export async function readBingoSession(
  room: string,
): Promise<BingoSession | null> {
  const raw = await kvGet(sessionKey(room));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BingoSession;
  } catch {
    return null;
  }
}

export async function writeBingoSession(session: BingoSession): Promise<void> {
  await kvPut(sessionKey(session.room), JSON.stringify(session), {
    expirationTtl: KV_EVENT_TTL_SECONDS,
  });
}
