/**
 * サイト全体の差し替え可能な設定。
 * アプリURL・アフィリエイトリンクはここだけ編集すれば反映されます。
 */

export const siteConfig = {
  name: "ことほぎ",
  nameEn: "Kotohogi",
  tagline: "幹事の負担を減らし、会場の一体感を最大化する",
  description:
    "エンジニアが実際の結婚式二次会を経験してつくった、余興支援Webアプリ。進行・クイズ・アンケートで幹事さんを支えます。",
  copyrightYear: 2026,
  author: "Kotohogi",
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
  icon: "help-circle" | "bar-chart" | "smartphone" | "sparkles" | "grid";
  /** 実アプリがある場合の遷移先。未設定ならリンクなし */
  href?: string;
};

export const features: FeatureItem[] = [
  {
    id: "human-bingo",
    title: "人間ビンゴ",
    description:
      "ゲスト同士が声をかけ合い、マスを埋めていく交流ビンゴ。二次会のアイスブレイクにぴったりです。",
    icon: "grid",
    href: "/app-tools/wedding-bingo/index.html",
  },
  {
    id: "quiz",
    title: "新郎新婦クイズ",
    description:
      "二人のエピソードを題材にしたクイズで、ゲストの笑顔と会場の声が重なります。",
    icon: "help-circle",
    href: "/app-tools/wedding-quiz/index.html",
  },
  {
    id: "poll",
    title: "リアルタイムアンケート",
    description:
      "スマートフォンからその場で投票。結果がすぐに共有され、一体感が生まれます。",
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
    title: "二次会向け景品セレクト",
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
