/** クライアントでも使えるルームコード生成（英数字4桁） */
export function makeRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(4);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < 4; i++) out += chars[bytes[i] % chars.length];
  return out;
}

export function parseRoomParam(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

export {
  ROOM_TTL_EXTEND_LABEL,
  ROOM_TTL_NOTICE,
} from "@/lib/room-ttl";

/**
 * 既存ルームと衝突しないコードを確保する。
 * `tryOpen` は成功時 true、衝突時 false、その他失敗は throw。
 */
export async function allocateUniqueRoomCode(
  tryOpen: (code: string) => Promise<"ok" | "conflict">,
  maxAttempts = 12,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = makeRoomCode();
    const result = await tryOpen(code);
    if (result === "ok") return code;
  }
  throw new Error("空きルームコードを見つけられませんでした。もう一度お試しください");
}
