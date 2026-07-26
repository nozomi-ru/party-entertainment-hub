import { kvGet, kvPut, KV_EVENT_TTL_SECONDS } from "@/lib/kv";

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
    return JSON.parse(raw) as WishSession;
  } catch {
    return null;
  }
}

export async function writeWishSession(session: WishSession): Promise<void> {
  await kvPut(sessionKey(session.room), JSON.stringify(session), {
    expirationTtl: KV_EVENT_TTL_SECONDS,
  });
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
