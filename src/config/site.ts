/**
 * サイト全体の差し替え可能な設定。
 * アプリURL・アフィリエイトリンクはここだけ編集すれば反映されます。
 */

/** 本番の公開オリジン（末尾スラッシュなし）。カスタムドメイン時は環境変数かここを更新 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kotohogi.nozoisfun.workers.dev"
).replace(/\/$/, "");

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
  icon: "help-circle" | "bar-chart" | "smartphone" | "sparkles" | "grid";
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

export type AffiliateItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  badge: string;
  icon: "shopping-bag" | "package" | "award";
};

/**
 * アフィリエイト・おすすめリンク
 * href を差し替えるだけでカードの遷移先が変わります。
 */
export const affiliateItems: AffiliateItem[] = [
  {
    id: "prize-shop",
    title: "パーティー向け景品セレクト",
    description:
      "ゲストが喜ぶ定番から、ちょっと特別な一品まで。予算別に探しやすいショップです。",
    href: "https://example.com/affiliate/prizes",
    badge: "景品",
    icon: "shopping-bag",
  },
  {
    id: "gift-set",
    title: "パーティーギフトセット",
    description:
      "抽選やビンゴの景品に便利な詰め合わせ。当日の準備時間を短縮できます。",
    href: "https://example.com/affiliate/gift-sets",
    badge: "ギフト",
    icon: "package",
  },
  {
    id: "premium",
    title: "記念品・プチギフト",
    description:
      "お帰りの際に渡す小さな祝福の品。会場の印象を丁寧に締めくくれます。",
    href: "https://example.com/affiliate/memorial",
    badge: "記念品",
    icon: "award",
  },
];
