/** ライブ余興カタログ（入口リンク用）と live API 用 ID */

export const LIVE_GAME_IDS = ["grade", "graph"] as const;

export type LiveGameId = (typeof LIVE_GAME_IDS)[number];

export type HubLiveId = "dress" | LiveGameId;

export type LiveGameMeta = {
  id: HubLiveId;
  title: string;
  short: string;
  description: string;
};

export const LIVE_GAMES: LiveGameMeta[] = [
  {
    id: "dress",
    title: "お色直しドレス色当て",
    short: "Dress",
    description:
      "線画ドレスで色予想。正解は Admin URL（?ans=）にのみ保持し、結果発表時に公開します。",
  },
  {
    id: "grade",
    title: "ゲスト格付けチェック",
    short: "Grade",
    description: "複数問の正答率でランク付け一覧を表示します。",
  },
  {
    id: "graph",
    title: "新郎新婦との相関図",
    short: "Graph",
    description: "ゲストの関係入力からネットワークグラフを生成します。",
  },
];

export function isLiveGameId(value: string): value is LiveGameId {
  return (LIVE_GAME_IDS as readonly string[]).includes(value);
}

export function getLiveGame(id: HubLiveId): LiveGameMeta {
  return LIVE_GAMES.find((g) => g.id === id)!;
}

/** ロール別の入口 URL（ドレスは専用ルート） */
export function liveRolePath(id: HubLiveId, role: "guest" | "screen" | "admin"): string {
  if (id === "dress") {
    return role === "admin" ? "/dress/admin?ans=orange" : `/dress/${role}`;
  }
  return `/live/${id}/${role}`;
}
