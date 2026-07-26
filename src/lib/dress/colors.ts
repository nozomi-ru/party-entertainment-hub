/** お色直しドレス色当て — 色オプション（既定値＋正規化） */

export type DressColorOption = {
  id: string;
  label: string;
  /** SVG fill */
  fill: string;
  /** ペンライト背景（やや濃いめ） */
  glow: string;
};

/** 未設定時の初期候補 */
export const DEFAULT_DRESS_COLORS: DressColorOption[] = [
  {
    id: "orange",
    label: "オレンジ",
    fill: "#E09B4A",
    glow: "#C47E32",
  },
  {
    id: "bluegray",
    label: "ブルーグレー",
    fill: "#5C6B78",
    glow: "#3E4A55",
  },
  {
    id: "white",
    label: "ホワイト",
    fill: "#F7F2EA",
    glow: "#E8E0D4",
  },
  {
    id: "champagne",
    label: "シャンパン",
    fill: "#D4B896",
    glow: "#C0A078",
  },
  {
    id: "rose",
    label: "ローズ",
    fill: "#C98B9A",
    glow: "#B06F80",
  },
  {
    id: "navy",
    label: "ネイビー",
    fill: "#2C3E6B",
    glow: "#1E2C4D",
  },
];

export const DRESS_COLOR_MIN = 2;
export const DRESS_COLOR_MAX = 8;

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

/** fill からペンライト用のやや暗い色を作る */
export function deriveGlow(fill: string): string {
  const m = fill.trim().match(HEX_RE);
  if (!m) return "#888888";
  const n = Number.parseInt(m[1], 16);
  const r = Math.max(0, ((n >> 16) & 255) - 28);
  const g = Math.max(0, ((n >> 8) & 255) - 28);
  const b = Math.max(0, (n & 255) - 28);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function slugifyColorId(label: string, used: Set<string>): string {
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "color";
  let id = base;
  let i = 2;
  while (used.has(id)) {
    id = `${base}-${i}`;
    i += 1;
  }
  used.add(id);
  return id;
}

export function newColorId(used: Set<string>): string {
  let i = 1;
  let id = `c${i}`;
  while (used.has(id)) {
    i += 1;
    id = `c${i}`;
  }
  used.add(id);
  return id;
}

/**
 * Admin / API から受け取った色配列を正規化する。
 * 失敗時は null（呼び出し側で 400）。
 */
export function normalizeDressColors(raw: unknown): DressColorOption[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length < DRESS_COLOR_MIN || raw.length > DRESS_COLOR_MAX) return null;

  const used = new Set<string>();
  const out: DressColorOption[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const label = String(row.label ?? "")
      .trim()
      .slice(0, 20);
    const fill = String(row.fill ?? "")
      .trim()
      .toUpperCase();
    if (!label || !isValidHex(fill)) return null;

    let id = String(row.id ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 32);
    if (!id || used.has(id)) {
      id = slugifyColorId(label, used);
    } else {
      used.add(id);
    }

    const glowRaw = String(row.glow ?? "").trim().toUpperCase();
    const glow = isValidHex(glowRaw) ? glowRaw : deriveGlow(fill);

    out.push({ id, label, fill, glow });
  }

  return out;
}

export function findDressColor(
  colors: DressColorOption[],
  id: string,
): DressColorOption | undefined {
  return colors.find((c) => c.id === id);
}
