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

type KvLike = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
};

type GlobalPollMemory = typeof globalThis & {
  __weddingPollMemory?: Map<string, string>;
};

function getMemoryStore(): Map<string, string> {
  const g = globalThis as GlobalPollMemory;
  if (!g.__weddingPollMemory) {
    g.__weddingPollMemory = new Map();
  }
  return g.__weddingPollMemory;
}

function sessionKey(room: string) {
  return `poll:${room}`;
}

/**
 * Cloudflare KV（本番）→ なければプロセス内メモリ（ローカル next dev）
 * Workers ではインスタンス間でメモリが共有されないため、本番は必ず KV を使う。
 */
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

export async function readPollSession(
  room: string,
): Promise<PollSession | null> {
  const key = sessionKey(room);
  const kv = await getKv();
  const raw = kv ? await kv.get(key) : (getMemoryStore().get(key) ?? null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PollSession;
  } catch {
    return null;
  }
}

export async function writePollSession(session: PollSession): Promise<void> {
  const key = sessionKey(session.room);
  const value = JSON.stringify(session);
  const kv = await getKv();
  if (kv) {
    // イベント用途想定: 24時間で自動削除
    await kv.put(key, value, { expirationTtl: 60 * 60 * 24 });
    return;
  }
  getMemoryStore().set(key, value);
}
