/**
 * 匿名ゲストセッション（UUID）。
 * ブラウザ: localStorage + Cookie。サーバー: Cookie ヘッダから読み取り。
 * Node crypto は使わず、Web Crypto の randomUUID を使う。
 */

export const GUEST_ID_STORAGE_KEY = "kotohogi_guest_id";
export const GUEST_ID_COOKIE = "kotohogi_guest_id";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidGuestId(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function createGuestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // ごく古い環境向けのフォールバック（ブラウザ／Workers では通常到達しない）
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

function writeCookie(id: string): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${GUEST_ID_COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

/** Cookie ヘッダ文字列からゲスト ID を取り出す（API / RSC 向け） */
export function readGuestIdFromCookieHeader(
  cookieHeader: string | null | undefined,
): string | null {
  if (!cookieHeader) return null;
  const segments = cookieHeader.split(";");
  for (const segment of segments) {
    const trimmed = segment.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq);
    if (name !== GUEST_ID_COOKIE) continue;
    const value = decodeURIComponent(trimmed.slice(eq + 1));
    return isValidGuestId(value) ? value : null;
  }
  return null;
}

/**
 * 既存 ID を localStorage → Cookie の順で探し、なければ新規発行して両方に保存。
 * クライアント専用。
 */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") {
    throw new Error("getOrCreateGuestId is client-only");
  }

  const fromStorage = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
  if (isValidGuestId(fromStorage)) {
    writeCookie(fromStorage);
    return fromStorage;
  }

  const fromCookie = readCookie(GUEST_ID_COOKIE);
  if (isValidGuestId(fromCookie)) {
    window.localStorage.setItem(GUEST_ID_STORAGE_KEY, fromCookie);
    return fromCookie;
  }

  const id = createGuestId();
  window.localStorage.setItem(GUEST_ID_STORAGE_KEY, id);
  writeCookie(id);
  return id;
}
