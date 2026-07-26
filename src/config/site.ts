/**
 * サイト全体の差し替え可能な設定。
 * アプリURL・アフィリエイトリンクはここだけ編集すれば反映されます。
 */

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

export const siteConfig = {
  name: "ことほぎ",
  nameEn: "Kotohogi",
  tagline: "幹事の負担を減らし、会場の一体感を最大化する",
  /** LP 用（検索・OGP。おおよそ100〜120文字） */
  description:
    "結婚式・パーティーの余興を支えるWebアプリ。人間ビンゴ・クイズ・リアルタイムアンケートで、幹事の負担を減らし会場の一体感をつくります。",
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
  tools: {
    title: "余興アプリ一覧 | ことほぎ",
    description:
      "結婚式・二次会・パーティーで使える無料の余興アプリ集。ビンゴ・クイズ・アンケート・抽選・割り勘などをスマホから今すぐ。",
  },
  bingoMachine: {
    title: "ビンゴ数字抽選機 | ことほぎ",
    description:
      "数字の範囲を選んでランダム抽選（1〜30・50・75・100）。出た数字を自動記録、大画面表示OK。結婚式・二次会のビンゴ大会に。",
  },
  roulette: {
    title: "抽選ルーレット | ことほぎ",
    description:
      "名前や景品を入れて回すだけ。当選者をランダムに1人選べる抽選ルーレット。二次会やパーティーのプレゼント抽選に。",
  },


  warikan: {
    title: "割り勘計算機 | ことほぎ",
    description:
      "合計金額と人数から一人当たりを自動計算。100円・500円単位で切り上げて端数もキレイに。二次会・飲み会の割り勘に。",
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
} as const;

/** アプリ・セクションへの遷移先 */
export const appLinks = {
  primaryCta: {
    label: "アプリを体験する",
    href: "#features",
  },
  secondaryCta: {
    label: "機能を見る",
    href: "#features",
  },
} as const;

export type ProblemSolutionItem = {
  id: string;
  title: string;
  problem: string;
  solution: string;
  icon: "clipboard" | "gift" | "users";
};

export const problemSolutions: ProblemSolutionItem[] = [
  {
    id: "flow",
    title: "進行の準備",
    problem: "台本づくりや時間配分に追われ、本番まで気が抜けない。",
    solution:
      "余興の流れをアプリで可視化。進行を迷いなく進められます。",
    icon: "clipboard",
  },
  {
    id: "prizes",
    title: "景品選び",
    problem: "何を用意すれば盛り上がるか、判断に時間がかかる。",
    solution:
      "おすすめ景品の導線を用意。選ぶ負担を軽くします。",
    icon: "gift",
  },
  {
    id: "unity",
    title: "会場の一体感",
    problem: "ゲスト同士がよそよそしく、空気が硬くなりがち。",
    solution:
      "クイズやアンケートで、会場全体がひとつになる体験を。",
    icon: "users",
  },
];

export type FeatureItem = {
  id: string;
  title: string;
  description: string;
  /** 幹事・ゲスト向けの短い使い方（余興アプリのみ） */
  howto?: string;
  icon:
    | "help-circle"
    | "bar-chart"
    | "smartphone"
    | "sparkles"
    | "grid"
    | "circle-dot"
    | "target"
    | "route"
    | "users"
    | "list-ordered"
    | "calculator"
    | "crown"
    | "message-circle"
    | "timer"
    | "trophy"
    | "layout-grid";
  /** 実アプリがある場合の遷移先。未設定ならリンクなし */
  href?: string;
};

export const features: FeatureItem[] = [
  {
    id: "human-bingo",
    title: "人間ビンゴ",
    description:
      "ゲスト同士が声をかけ合い、マスを埋めていく交流ビンゴ。結婚式やパーティーのアイスブレイクにぴったりです。",
    howto:
      "幹事がマスを編集して共有URLを配布 → ゲストはマスをタップして名前を入力 → 縦横斜めが揃うとビンゴ。",
    icon: "grid",
    href: "/app-tools/wedding-bingo/index.html",
  },
  {
    id: "quiz",
    title: "新郎新婦クイズ",
    description:
      "二人のエピソードを題材にしたクイズ。結婚式向けの定番として使いつつ、問題は編集できるのでパーティーでも楽しめます。",
    howto:
      "幹事が問題・正解を編集して共有URLを配布 → ゲストは「はじめる」で4択に回答 → 最後にスコアと正解を確認。",
    icon: "help-circle",
    href: "/app-tools/wedding-quiz/index.html",
  },
  {
    id: "poll",
    title: "リアルタイムアンケート",
    description:
      "スマートフォンからその場で投票。結果がすぐに共有され、一体感が生まれます。",
    howto:
      "司会が Host で先に入室し質問を編集 → ゲスト用URLを配布して投票 → 司会が結果表示と次の質問を進行。",
    icon: "bar-chart",
    href: "/app-tools/wedding-poll/index.html",
  },
  {
    id: "mobile",
    title: "スマホ完結の参加",
    description:
      "特別な機材は不要。ゲストは手元の端末からすぐ参加できます。",
    icon: "smartphone",
  },
  {
    id: "atmosphere",
    title: "祝福の空気づくり",
    description:
      "余興のテンポを整え、幹事さんは進行に集中。会場は自然と温かくなります。",
    icon: "sparkles",
  },
];

export type ToolItem = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  href: string;
  category: "together" | "lottery" | "manage";
};

export const toolCategories: Record<
  ToolItem["category"],
  { label: string; labelEn: string }
> = {
  together: { label: "会場でみんなと", labelEn: "Together" },
  lottery: { label: "抽選・くじ引き", labelEn: "Lottery" },
  manage: { label: "幹事の準備・進行", labelEn: "Manage" },
};

export const toolItems: ToolItem[] = [
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
    id: "bingo-machine",
    title: "ビンゴ数字抽選機",
    titleEn: "Machine",
    description: "範囲を選んでランダム抽選（1〜30/50/75/100）。自動記録、大画面OK。",
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
    id: "warikan",
    title: "割り勘計算機",
    titleEn: "Warikan",
    description: "参加者リストと合計から一人当たりを即時計算。集金メモ付き。",
    href: "/app-tools/warikan/index.html",
    category: "manage",
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
];
