/** ライブ余興（Guest / Screen / Admin）のカタログ */

export const LIVE_GAME_IDS = [
  "buzz",
  "digibingo",
  "either",
  "dress",
  "treasure",
  "grade",
  "request",
  "graph",
] as const;

export type LiveGameId = (typeof LIVE_GAME_IDS)[number];

export type LiveGameMeta = {
  id: LiveGameId;
  title: string;
  short: string;
  description: string;
};

export const LIVE_GAMES: LiveGameMeta[] = [
  {
    id: "buzz",
    title: "早押し新郎新婦クイズ",
    short: "Buzz",
    description: "スマホで早押し。最速ゲストをスクリーンで判定します。",
  },
  {
    id: "digibingo",
    title: "全員参加デジタルビンゴ",
    short: "Bingo",
    description: "Admin が数字を抽選し、Guest がカードを照合します。",
  },
  {
    id: "either",
    title: "リアルタイム「どっち？」",
    short: "Either",
    description: "二択投票を個別キーで集計し、グラフで表示します。",
  },
  {
    id: "dress",
    title: "お色直しドレス色当て",
    short: "Dress",
    description: "色を予想し、正解発表時に正解者一覧を表示します。",
  },
  {
    id: "treasure",
    title: "QRコード宝探し",
    short: "Treasure",
    description: "スポット付き URL でポイント加算・ランキング表示。",
  },
  {
    id: "grade",
    title: "ゲスト格付けチェック",
    short: "Grade",
    description: "複数問の正答率でランク付け一覧を表示します。",
  },
  {
    id: "request",
    title: "やってほしいことリクエスト",
    short: "Request",
    description: "投稿といいねで Slido 風にランキングします。",
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

export function getLiveGame(id: LiveGameId): LiveGameMeta {
  return LIVE_GAMES.find((g) => g.id === id)!;
}
