/** お色直しドレス色当て — 選択肢の定義 */

export type DressColorId =
  | "orange"
  | "bluegray"
  | "white"
  | "champagne"
  | "rose"
  | "navy";

export type DressColorOption = {
  id: DressColorId;
  label: string;
  /** SVG fill */
  fill: string;
  /** ペンライト背景（やや濃いめ） */
  glow: string;
};

export const DRESS_COLORS: DressColorOption[] = [
  {
    id: "orange",
    label: "オレンジ",
    fill: "#E8A87C",
    glow: "#D4895A",
  },
  {
    id: "bluegray",
    label: "ブルーグレー",
    fill: "#8FA3B0",
    glow: "#6F8494",
  },
  {
    id: "white",
    label: "ホワイト",
    fill: "#F5F1EA",
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

export const DRESS_COLOR_IDS = DRESS_COLORS.map((c) => c.id);

export function isDressColorId(value: string): value is DressColorId {
  return (DRESS_COLOR_IDS as readonly string[]).includes(value);
}

export function getDressColor(id: DressColorId): DressColorOption {
  return DRESS_COLORS.find((c) => c.id === id)!;
}
