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

type KvLike = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
};

type GlobalWishMemory = typeof globalThis & {
  __weddingWishMemory?: Map<string, string>;
};

function getMemoryStore(): Map<string, string> {
  const g = globalThis as GlobalWishMemory;
  if (!g.__weddingWishMemory) {
    g.__weddingWishMemory = new Map();
  }
  return g.__weddingWishMemory;
}

function sessionKey(room: string) {
  return `wish:${room}`;
}

async function getKv(): Promise<KvLike | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const kv = (env as { POLL_KV?: KvLike } | undefined)?.POLL_KV;
    return kv ?? null;
  } catch {
    return null;
  }
}

export async function readWishSession(
  room: string,
): Promise<WishSession | null> {
  const key = sessionKey(room);
  const kv = await getKv();
  const raw = kv ? await kv.get(key) : (getMemoryStore().get(key) ?? null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WishSession;
  } catch {
    return null;
  }
}

export async function writeWishSession(session: WishSession): Promise<void> {
  const key = sessionKey(session.room);
  const value = JSON.stringify(session);
  const kv = await getKv();
  if (kv) {
    await kv.put(key, value, { expirationTtl: 60 * 60 * 24 });
    return;
  }
  getMemoryStore().set(key, value);
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
