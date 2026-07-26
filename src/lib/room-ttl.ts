import {
  KV_EVENT_TTL_SECONDS,
  kvListAll,
  kvPut,
  type KvPutOptions,
} from "@/lib/kv";

export { KV_EVENT_TTL_SECONDS };

export type RoomTtlMeta = {
  createdAt: number;
  expiresAt: number;
};

/** 新規ルーム用の作成日時・削除期限 */
export function createRoomTtl(now = Date.now()): RoomTtlMeta {
  return {
    createdAt: now,
    expiresAt: now + KV_EVENT_TTL_SECONDS * 1000,
  };
}

/** 削除期限を「今から1週間後」に延長 */
export function bumpExpiresAt(now = Date.now()): number {
  return now + KV_EVENT_TTL_SECONDS * 1000;
}

/** Cloudflare KV の expirationTtl 最短は 60 秒 */
export function ttlSecondsUntil(expiresAt: number, now = Date.now()): number {
  const sec = Math.floor((expiresAt - now) / 1000);
  return Math.max(60, sec);
}

export function putOptionsForExpiresAt(
  expiresAt: number,
  now = Date.now(),
): KvPutOptions {
  return { expirationTtl: ttlSecondsUntil(expiresAt, now) };
}

/**
 * 古いセッション向け: expiresAt が無ければ createdAt / updatedAt から推定。
 */
export function resolveExpiresAt(
  fields: {
    expiresAt?: number;
    createdAt?: number;
    updatedAt?: number;
  },
  now = Date.now(),
): number {
  if (typeof fields.expiresAt === "number" && fields.expiresAt > 0) {
    return fields.expiresAt;
  }
  const base =
    (typeof fields.createdAt === "number" && fields.createdAt > 0
      ? fields.createdAt
      : null) ??
    (typeof fields.updatedAt === "number" && fields.updatedAt > 0
      ? fields.updatedAt
      : null) ??
    now;
  return base + KV_EVENT_TTL_SECONDS * 1000;
}

/** createdAt / expiresAt を補完したオブジェクトを返す */
export function ensureRoomTtl<T extends object>(
  session: T & {
    expiresAt?: number;
    createdAt?: number;
    updatedAt?: number;
  },
  now = Date.now(),
): T & RoomTtlMeta {
  const createdAt =
    typeof session.createdAt === "number" && session.createdAt > 0
      ? session.createdAt
      : typeof session.updatedAt === "number" && session.updatedAt > 0
        ? session.updatedAt
        : now;
  const expiresAt = resolveExpiresAt({ ...session, createdAt }, now);
  return { ...session, createdAt, expiresAt };
}

export function formatExpiresAtJa(expiresAt: number): string {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(expiresAt));
  } catch {
    return new Date(expiresAt).toLocaleString("ja-JP");
  }
}

/** ルーム TTL の注意文言（UI 共通） */
export const ROOM_TTL_NOTICE =
  "ルームのデータは削除期限を過ぎると自動削除されます。Host は「削除期限を1週間延長」で延ばせます。同じコードのルームは、有効な間は再作成できません。";

export const ROOM_TTL_EXTEND_LABEL = "削除期限を1週間延長";

/** prefix 配下のキーを、指定の削除期限で書き直す（延長用） */
export async function refreshKvPrefixTtl(
  prefix: string,
  expiresAt: number,
  rewrite?: (name: string, value: string) => string,
): Promise<number> {
  const rows = await kvListAll(prefix);
  const opts = putOptionsForExpiresAt(expiresAt);
  for (const row of rows) {
    const value = rewrite ? rewrite(row.name, row.value) : row.value;
    await kvPut(row.name, value, opts);
  }
  return rows.length;
}
