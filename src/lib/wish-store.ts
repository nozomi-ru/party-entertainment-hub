import { kvGet, kvPut } from "@/lib/kv";
import {
  bumpExpiresAt,
  createRoomTtl,
  ensureRoomTtl,
  putOptionsForExpiresAt,
} from "@/lib/room-ttl";

export type WishMessage = {
  id: string;
  name: string;
  text: string;
  createdAt: number;
};

export type WishSession = {
  room: string;
  title: string;
  /** Host が true にしたときだけゲスト側にも壁を見せる */
  showWall: boolean;
  messages: WishMessage[];
  updatedAt: number;
  createdAt?: number;
  expiresAt?: number;
};

export const WISH_LIMITS = {
  maxName: 20,
  maxText: 120,
  maxMessages: 300,
  maxTitle: 40,
} as const;

function sessionKey(room: string) {
  return `wish:${room}`;
}

export async function readWishSession(
  room: string,
): Promise<WishSession | null> {
  const raw = await kvGet(sessionKey(room));
  if (!raw) return null;
  try {
    return ensureRoomTtl(JSON.parse(raw) as WishSession);
  } catch {
    return null;
  }
}

export async function writeWishSession(session: WishSession): Promise<void> {
  const withTtl = ensureRoomTtl(session);
  await kvPut(
    sessionKey(withTtl.room),
    JSON.stringify(withTtl),
    putOptionsForExpiresAt(withTtl.expiresAt),
  );
}

export async function openWishSession(
  room: string,
  title: string,
): Promise<WishSession | null> {
  if (await readWishSession(room)) return null;
  const ttl = createRoomTtl();
  const session: WishSession = {
    room,
    title,
    showWall: false,
    messages: [],
    updatedAt: ttl.createdAt,
    createdAt: ttl.createdAt,
    expiresAt: ttl.expiresAt,
  };
  await writeWishSession(session);
  return session;
}

export async function extendWishSession(
  room: string,
): Promise<WishSession | null> {
  const session = await readWishSession(room);
  if (!session) return null;
  session.expiresAt = bumpExpiresAt();
  session.updatedAt = Date.now();
  await writeWishSession(session);
  return session;
}

/** ゲスト向け: 壁非公開なら本文を伏せる（件数と自分の投稿確認用に id は残す） */
export function toGuestView(session: WishSession): WishSession {
  if (session.showWall) return session;
  return {
    ...session,
    messages: session.messages.map((m) => ({
      ...m,
      name: "",
      text: "",
    })),
  };
}
