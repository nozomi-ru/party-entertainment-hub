/** ライブ余興カタログ（入口リンク用） */

export type HubLiveId = "dress" | "graph";

/** @deprecated 汎用 /live/{game} は未使用。専用ルートのみ */
export const LIVE_GAME_IDS = [] as const;
export type LiveGameId = (typeof LIVE_GAME_IDS)[number];

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
      "線画ドレスで色予想。投票後はスマホ画面を色にして新婦を迎え、結果発表で正解を公開します。",
  },
  {
    id: "graph",
    title: "新郎新婦との相関図",
    short: "Graph",
    description:
      "ゲストの関係性タグからネットワーク相関図を生成。同じタグ同士も線で結びます。",
  },
];

export function isLiveGameId(value: string): value is LiveGameId {
  return (LIVE_GAME_IDS as readonly string[]).includes(value);
}

export function getLiveGame(id: HubLiveId): LiveGameMeta {
  return LIVE_GAMES.find((g) => g.id === id)!;
}

/** ロール別の入口 URL（専用アプリへ） */
export function liveRolePath(
  id: HubLiveId,
  role: "guest" | "screen" | "admin",
): string {
  if (id === "dress") return `/dress/${role}`;
  if (id === "graph") return `/graph/${role}`;
  return `/live/${id}/${role}`;
}
