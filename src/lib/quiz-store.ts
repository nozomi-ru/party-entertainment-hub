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
};

type KvLike = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
};

type GlobalQuizMemory = typeof globalThis & {
  __weddingQuizMemory?: Map<string, string>;
};

function getMemoryStore(): Map<string, string> {
  const g = globalThis as GlobalQuizMemory;
  if (!g.__weddingQuizMemory) g.__weddingQuizMemory = new Map();
  return g.__weddingQuizMemory;
}

function sessionKey(room: string) {
  return `quiz:${room}`;
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

export async function readQuizSession(
  room: string,
): Promise<QuizSession | null> {
  const key = sessionKey(room);
  const kv = await getKv();
  const raw = kv ? await kv.get(key) : (getMemoryStore().get(key) ?? null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QuizSession;
  } catch {
    return null;
  }
}

export async function writeQuizSession(session: QuizSession): Promise<void> {
  const key = sessionKey(session.room);
  const value = JSON.stringify(session);
  const kv = await getKv();
  if (kv) {
    await kv.put(key, value, { expirationTtl: 60 * 60 * 24 });
    return;
  }
  getMemoryStore().set(key, value);
}
