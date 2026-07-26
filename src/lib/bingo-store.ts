export type BingoEntry = {
  name: string;
  reportedAt: number;
};

export type BingoSession = {
  room: string;
  entries: BingoEntry[];
  createdAt: number;
};

type KvLike = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
};

type GlobalBingoMemory = typeof globalThis & {
  __weddingBingoMemory?: Map<string, string>;
};

function getMemoryStore(): Map<string, string> {
  const g = globalThis as GlobalBingoMemory;
  if (!g.__weddingBingoMemory) g.__weddingBingoMemory = new Map();
  return g.__weddingBingoMemory;
}

function sessionKey(room: string) {
  return `bingo:${room}`;
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

export async function readBingoSession(
  room: string,
): Promise<BingoSession | null> {
  const key = sessionKey(room);
  const kv = await getKv();
  const raw = kv ? await kv.get(key) : (getMemoryStore().get(key) ?? null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BingoSession;
  } catch {
    return null;
  }
}

export async function writeBingoSession(session: BingoSession): Promise<void> {
  const key = sessionKey(session.room);
  const value = JSON.stringify(session);
  const kv = await getKv();
  if (kv) {
    await kv.put(key, value, { expirationTtl: 60 * 60 * 24 });
    return;
  }
  getMemoryStore().set(key, value);
}
