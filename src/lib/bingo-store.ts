import { kvGet, kvPut } from "@/lib/kv";
import {
  bumpExpiresAt,
  createRoomTtl,
  ensureRoomTtl,
  putOptionsForExpiresAt,
} from "@/lib/room-ttl";

export type BingoEntry = {
  name: string;
  reportedAt: number;
};

export type BingoSession = {
  room: string;
  entries: BingoEntry[];
  createdAt: number;
  expiresAt?: number;
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
    return ensureRoomTtl(JSON.parse(raw) as BingoSession);
  } catch {
    return null;
  }
}

export async function writeBingoSession(session: BingoSession): Promise<void> {
  const withTtl = ensureRoomTtl(session);
  await kvPut(
    sessionKey(withTtl.room),
    JSON.stringify(withTtl),
    putOptionsForExpiresAt(withTtl.expiresAt),
  );
}

export async function openBingoSession(room: string): Promise<BingoSession | null> {
  if (await readBingoSession(room)) return null;
  const ttl = createRoomTtl();
  const session: BingoSession = {
    room,
    entries: [],
    createdAt: ttl.createdAt,
    expiresAt: ttl.expiresAt,
  };
  await writeBingoSession(session);
  return session;
}

export async function extendBingoSession(
  room: string,
): Promise<BingoSession | null> {
  const session = await readBingoSession(room);
  if (!session) return null;
  session.expiresAt = bumpExpiresAt();
  await writeBingoSession(session);
  return session;
}
