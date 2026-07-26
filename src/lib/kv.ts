/**
 * Cloudflare KV（POLL_KV）への共通アクセス。
 * OpenNext Workers では getCloudflareContext().env.POLL_KV を使う。
 * ローカル next dev ではプロセス内メモリにフォールバックする。
 */

export type KvPutOptions = {
  expirationTtl?: number;
};

export type KvListKey = {
  name: string;
  expiration?: number;
};

export type KvListResult = {
  keys: KvListKey[];
  list_complete: boolean;
  cursor?: string;
};

export type KvListOptions = {
  prefix?: string;
  limit?: number;
  cursor?: string;
};

/** イベント用途の既定 TTL（7日間） */
export const KV_EVENT_TTL_SECONDS = 60 * 60 * 24 * 7;

type KvLike = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: KvPutOptions,
  ): Promise<void>;
  delete?(key: string): Promise<void>;
  list?(options?: KvListOptions): Promise<KvListResult>;
};

type GlobalKvMemory = typeof globalThis & {
  __kotohogiKvMemory?: Map<string, string>;
};

function getMemoryStore(): Map<string, string> {
  const g = globalThis as GlobalKvMemory;
  if (!g.__kotohogiKvMemory) {
    g.__kotohogiKvMemory = new Map();
  }
  return g.__kotohogiKvMemory;
}

/** 単体テスト用: メモリストアを空にする */
export function resetKvMemoryForTests(): void {
  const g = globalThis as GlobalKvMemory;
  g.__kotohogiKvMemory = new Map();
}

async function getPollKv(): Promise<KvLike | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const kv = (env as { POLL_KV?: KvLike } | undefined)?.POLL_KV;
    return kv ?? null;
  } catch {
    return null;
  }
}

export async function kvGet(key: string): Promise<string | null> {
  const kv = await getPollKv();
  if (kv) return kv.get(key);
  return getMemoryStore().get(key) ?? null;
}

export async function kvPut(
  key: string,
  value: string,
  options?: KvPutOptions,
): Promise<void> {
  const kv = await getPollKv();
  if (kv) {
    await kv.put(key, value, options);
    return;
  }
  getMemoryStore().set(key, value);
}

export async function kvDelete(key: string): Promise<void> {
  const kv = await getPollKv();
  if (kv?.delete) {
    await kv.delete(key);
    return;
  }
  getMemoryStore().delete(key);
}

/**
 * prefix 付き一覧。ゲスト行動を一意キーで put し、集計側が list する設計向け。
 * メモリフォールバックでは cursor を開始オフセット（10進文字列）として扱う。
 */
export async function kvList(
  options: KvListOptions = {},
): Promise<KvListResult> {
  const prefix = options.prefix ?? "";
  const limit = options.limit ?? 1000;
  const kv = await getPollKv();

  if (kv?.list) {
    return kv.list({ prefix, limit, cursor: options.cursor });
  }

  const names = [...getMemoryStore().keys()]
    .filter((name) => name.startsWith(prefix))
    .sort();
  const start = options.cursor ? Number.parseInt(options.cursor, 10) || 0 : 0;
  const slice = names.slice(start, start + limit);
  const next = start + slice.length;
  const list_complete = next >= names.length;

  return {
    keys: slice.map((name) => ({ name })),
    list_complete,
    cursor: list_complete ? undefined : String(next),
  };
}

/** prefix 配下のキーをすべて列挙し、値も取得する（集計用） */
export async function kvListAll(
  prefix: string,
): Promise<{ name: string; value: string }[]> {
  const out: { name: string; value: string }[] = [];
  let cursor: string | undefined;
  for (;;) {
    const page = await kvList({ prefix, limit: 1000, cursor });
    for (const key of page.keys) {
      const value = await kvGet(key.name);
      if (value != null) out.push({ name: key.name, value });
    }
    if (page.list_complete || !page.cursor) break;
    cursor = page.cursor;
  }
  return out;
}
