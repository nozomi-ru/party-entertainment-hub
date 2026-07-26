/**
 * サイト全体の差し替え可能な設定。
 * アプリURL・アフィリエイトリンクはここだけ編集すれば反映されます。
 */

import { LIVE_GAMES, liveRolePath } from "@/lib/live/catalog";

/** 本番の公開オリジン（末尾スラッシュなし）。カスタムドメイン時は環境変数かここを更新 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kotohogi.nozoisfun.workers.dev"
).replace(/\/$/, "");

/**
 * Cloudflare Web Analytics の beacon トークン。
 * 未設定ならビーコンを出さない。手順は docs/ops/analytics.md。
 * 静的余興 HTML 用は public/cf-web-analytics.js 先頭の TOKEN も同じ値に揃える。
 */
export const cfBeaconToken = (
  process.env.NEXT_PUBLIC_CF_BEACON_TOKEN ?? ""
).trim();

/**
 * Google AdSense のパブリッシャー ID（サイト認証・広告用）。
 * 空ならスクリプトを出さない。差し替え時はここか環境変数を更新。
 */
export const adsenseClientId = (
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "ca-pub-4114564041726790"
).trim();

export const siteConfig = {
  name: "ことほぎ",
  nameEn: "Kotohogi",
  tagline: "インストール不要。会場のスマホで余興がつながる",
  /** LP 用（検索・OGP。おおよそ100〜120文字） */
  description:
    "結婚式・二次会向けの余興Webアプリ。人間ビンゴ・新郎新婦クイズ・リアルタイムアンケート・祝福メッセージに加え、抽選やタイマーなど幹事用ツールもブラウザだけで使えます。",
  copyrightYear: 2026,
  author: "Kotohogi",
  /** SNS共有カード用画像（public/og.jpg） */
  ogImagePath: "/og.jpg",
} as const;

/** ページ／静的アプリごとの title・description（SEO・OGP） */
export const pageSeo = {
  home: {
    title: "ことほぎ | 結婚式・パーティーの余興アプリ",
    description: siteConfig.description,
  },
  bingo: {
    title: "人間ビンゴ | ことほぎ",
    description:
      "ゲスト同士が声をかけ合いマスを埋める交流ビンゴ。共有URLで同じマスを配れ、結婚式やパーティーのアイスブレイクに使えます。",
  },
  quiz: {
    title: "新郎新婦クイズ | ことほぎ",
    description:
      "二人のエピソードを4択クイズに。問題を編集してURL共有でき、ゲストはその場で正解とスコアを確認できます。",
  },
  poll: {
    title: "リアルタイムアンケート | ことほぎ",
    description:
      "司会がルームを開き、ゲストはスマホから投票。結果表示のタイミングも司会がコントロールできるライブアンケートです。",
  },
  bingoMachine: {
    title: "ビンゴ数字抽選機 | ことほぎ",
    description:
      "開始〜終了の数字範囲を自由に指定してランダム抽選。出た数字を自動記録、大画面表示OK。結婚式・二次会のビンゴ大会に。",
  },
  roulette: {
    title: "抽選ルーレット | ことほぎ",
    description:
      "名前や景品を入れて回すだけ。当選者をランダムに1人選べる抽選ルーレット。二次会やパーティーのプレゼント抽選に。",
  },


  countdown: {
    title: "カウントダウンタイマー | ことほぎ",
    description:
      "残り時間を大きく表示するカウントダウンタイマー。入場・開演・スピーチの持ち時間管理に。全画面・アラート付き。",
  },
  scoreboard: {
    title: "得点板・スコアボード | ことほぎ",
    description:
      "チーム対抗ゲームの得点をその場で加減算できるスコアボード。クイズ大会・ゲーム大会の点数管理に。自動保存・順位表示。",
  },
  wishboard: {
    title: "祝福メッセージボード | ことほぎ",
    description:
      "ゲストがスマホから新郎新婦へ短い祝福を送れるデジタル寄せ書き。司会がルームを開き、大画面で読み上げ・表示できます。",
  },
  tableTalk: {
    title: "テーブルトークカード | ことほぎ",
    description:
      "席ごとの会話が弾むアイスブレイク質問カード。カテゴリを選んで1枚引き、発表モードで大画面に映せます。",
  },
  photoMission: {
    title: "フォトミッション | ことほぎ",
    description:
      "撮る写真のお題リスト。達成をチェックして進捗を共有。アップロード不要で結婚式・二次会その場で使えます。",
  },
} as const;

/** アプリ・セクションへの遷移先（ヒーローは主CTA1つのみ） */
export const appLinks = {
  primaryCta: {
    label: "余興ツールを見る",
    href: "#tools",
  },
} as const;

export type ProblemSolutionItem = {
  id: string;
  title: string;
  problem: string;
  solution: string;
  icon: "clipboard" | "smartphone" | "users";
};

/** Problem & Solution セクション見出し（LP-02 / LP-05） */
export const problemSolutionIntro = {
  eyebrow: "Problem & Solution",
  title: "余興の準備から、会場の一体感まで",
  description:
    "ブラウザだけで始められます。インストールや特別な機材は不要です。",
} as const;

export const problemSolutions: ProblemSolutionItem[] = [
  {
    id: "ready",
    title: "配る手間",
    problem: "余興の設定をゲストへ配るのに、印刷や説明がかさむ。",
    solution:
      "URL ひとつでビンゴ・クイズ・アンケートを共有。その場で編集できます。",
    icon: "clipboard",
  },
  {
    id: "join",
    title: "手元の参加",
    problem: "ゲストが受け身になり、手元から動くきっかけが少ない。",
    solution:
      "スマホのブラウザから投票・早押し・ビンゴ記入。アプリ不要です。",
    icon: "smartphone",
  },
  {
    id: "unity",
    title: "会場の一体感",
    problem: "ゲスト同士がよそよそしく、空気が硬くなりがち。",
    solution:
      "ライブ余興やトークカードで、会場が同じ時間を共有できます。",
    icon: "users",
  },
];

export type ToolItem = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  href: string;
  category: "live" | "together" | "lottery" | "manage";
};

export const toolCategories: Record<
  ToolItem["category"],
  { label: string; labelEn: string }
> = {
  live: { label: "ライブ余興（会場同期）", labelEn: "Live" },
  together: { label: "会場でみんなと", labelEn: "Together" },
  lottery: { label: "抽選・くじ引き", labelEn: "Lottery" },
  manage: { label: "幹事の準備・進行", labelEn: "Manage" },
};

/** ライブ余興は catalog を正とし、LP からは Admin 入口へ */
const liveToolItems: ToolItem[] = LIVE_GAMES.map((game) => ({
  id: `live-${game.id}`,
  title: game.title,
  titleEn: game.short,
  description: game.description,
  href: liveRolePath(game.id, "admin"),
  category: "live",
}));

export const toolItems: ToolItem[] = [
  ...liveToolItems,
  {
    id: "human-bingo",
    title: "人間ビンゴ",
    titleEn: "Bingo",
    description: "声をかけ合ってマスを埋める交流ビンゴ。アイスブレイクに。",
    href: "/app-tools/wedding-bingo/index.html",
    category: "together",
  },
  {
    id: "quiz",
    title: "新郎新婦クイズ",
    titleEn: "Quiz",
    description: "二人のエピソードを4択に。URL共有で別端末でも同じ問題。",
    href: "/app-tools/wedding-quiz/index.html",
    category: "together",
  },
  {
    id: "poll",
    title: "リアルタイムアンケート",
    titleEn: "Poll",
    description: "司会がルームを開き、ゲストがスマホから投票・結果表示。",
    href: "/app-tools/wedding-poll/index.html",
    category: "together",
  },
  {
    id: "wishboard",
    title: "祝福メッセージボード",
    titleEn: "Wish",
    description: "ゲストがスマホから短い祝福を送るデジタル寄せ書き。",
    href: "/app-tools/wishboard/index.html",
    category: "together",
  },
  {
    id: "table-talk",
    title: "テーブルトークカード",
    titleEn: "Talk",
    description: "席の会話が弾む質問を1枚ずつ引くアイスブレイク。",
    href: "/app-tools/table-talk/index.html",
    category: "together",
  },
  {
    id: "photo-mission",
    title: "フォトミッション",
    titleEn: "Photo",
    description: "撮る写真のお題リスト。チェックして進捗を共有。",
    href: "/app-tools/photo-mission/index.html",
    category: "together",
  },
  {
    id: "bingo-machine",
    title: "ビンゴ数字抽選機",
    titleEn: "Machine",
    description: "開始〜終了を自由に指定してランダム抽選。自動記録、大画面OK。",
    href: "/app-tools/bingo-machine/index.html",
    category: "lottery",
  },
  {
    id: "roulette",
    title: "抽選ルーレット",
    titleEn: "Roulette",
    description: "名前や景品を入れて回すだけ。当選者を1人選びます。",
    href: "/app-tools/roulette/index.html",
    category: "lottery",
  },

  {
    id: "countdown",
    title: "カウントダウンタイマー",
    titleEn: "Countdown",
    description: "残り時間を大きく表示。入場・開演・持ち時間管理に。",
    href: "/app-tools/countdown/index.html",
    category: "manage",
  },
  {
    id: "scoreboard",
    title: "得点板・スコアボード",
    titleEn: "Score",
    description: "チーム対抗ゲームの点数をその場で加減算・自動保存。",
    href: "/app-tools/scoreboard/index.html",
    category: "manage",
  },
];

export type AffiliateBanner = {
  id: string;
  href: string;
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  trackingPixelSrc: string;
  alt: string;
};

/**
 * A8.net バナー広告（LP Affiliate セクション）
 * タグ差し替え時はこの配列だけ更新すれば反映されます。
 */
export const affiliateBanners: AffiliateBanner[] = [
  {
    id: "a8-336x280",
    href: "https://px.a8.net/svt/ejp?a8mat=4B85P5+3AHA5U+FOG+3H7O8H",
    imageSrc:
      "https://www26.a8.net/svt/bgt?aid=260721113199&wid=001&eno=01&mid=s00000002032021031000&mc=1",
    imageWidth: 336,
    imageHeight: 280,
    trackingPixelSrc:
      "https://www19.a8.net/0.gif?a8mat=4B85P5+3AHA5U+FOG+3H7O8H",
    alt: "IBJ Matching（旧PARTY☆PARTY）婚活パーティー・街コン",
  },
  {
    id: "a8-300x250",
    href: "https://px.a8.net/svt/ejp?a8mat=4B85P5+2MNXYQ+4YJS+614CX",
    imageSrc:
      "https://www27.a8.net/svt/bgt?aid=260721113159&wid=001&eno=01&mid=s00000023140001013000&mc=1",
    imageWidth: 300,
    imageHeight: 250,
    trackingPixelSrc:
      "https://www15.a8.net/0.gif?a8mat=4B85P5+2MNXYQ+4YJS+614CX",
    alt: "parcy's（パーシーズ）恋愛・結婚のパーソナル診断",
  },
  {
    id: "a8-300x250-2",
    href: "https://px.a8.net/svt/ejp?a8mat=4B89KT+6YNIGI+5VGS+61Z81",
    imageSrc:
      "https://www29.a8.net/svt/bgt?aid=260726141421&wid=001&eno=01&mid=s00000027406001017000&mc=1",
    imageWidth: 300,
    imageHeight: 250,
    trackingPixelSrc:
      "https://www17.a8.net/0.gif?a8mat=4B89KT+6YNIGI+5VGS+61Z81",
    alt: "おすすめサービス（PR）",
  },
];
