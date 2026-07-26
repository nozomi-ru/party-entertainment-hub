import { WISH_LIMITS } from "@/lib/wish-store";

/** ルームコードを大文字英数字4文字に正規化 */
export function normalizeWishRoom(room: string): string {
  return room.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

export function clampWishText(text: string, maxLen: number): string {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export function normalizeWishEntry(
  name: unknown,
  text: unknown,
): { name: string; text: string; ok: boolean } {
  const n = clampWishText(String(name ?? ""), WISH_LIMITS.maxName);
  const t = clampWishText(String(text ?? ""), WISH_LIMITS.maxText);
  return { name: n, text: t, ok: n.length > 0 && t.length > 0 };
}

export function normalizeWishTitle(title: unknown): string {
  const t = clampWishText(String(title ?? ""), WISH_LIMITS.maxTitle);
  return t || "お二人へのメッセージ";
}

export function newWishId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
