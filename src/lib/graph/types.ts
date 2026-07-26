/** 相関図（Guest Network Graph）の型 */

export type GraphSide = "groom" | "bride";

export type GraphNodeRecord = {
  user_id: string;
  name: string;
  side: GraphSide;
  tags: string[];
  message: string;
  timestamp: number;
};

export type GraphVizNode = {
  id: string;
  name: string;
  group: "couple" | "groom" | "bride";
  kind: "couple" | "guest";
  side?: GraphSide;
  tags?: string[];
  message?: string;
  /** 中心ノード固定用（Screen でセット） */
  fx?: number;
  fy?: number;
};

export type GraphVizLink = {
  source: string;
  target: string;
  kind: "couple" | "tag";
  label?: string;
};

export type GraphVizData = {
  nodes: GraphVizNode[];
  links: GraphVizLink[];
};

/** プリセット関係性タグ */
export const GRAPH_PRESET_TAGS = [
  "親族",
  "大学",
  "会社",
  "趣味の集まり",
  "地元の友人",
  "幼馴染",
  "友人",
] as const;

export const GRAPH_TAG_MAX = 8;
export const GRAPH_NAME_MAX = 20;
export const GRAPH_MESSAGE_MAX = 80;
export const GRAPH_CUSTOM_TAG_MAX = 16;
