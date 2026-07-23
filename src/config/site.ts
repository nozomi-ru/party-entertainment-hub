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
      "結婚式・二次会・パーティーで使える無料の余興アプリ集。ビンゴ・クイズ・アンケート・抽選・あみだくじ・割り勘などをスマホから今すぐ。",
  },
  bingoMachine: {
    title: "ビンゴ数字抽選機 | ことほぎ",
    description:
      "1〜75の数字をランダムに抽選するビンゴマシン。出た数字を自動記録、大画面表示OK。結婚式・二次会のビンゴ大会に。",
  },
  roulette: {
    title: "抽選ルーレット | ことほぎ",
    description:
      "名前や景品を入れて回すだけ。当選者をランダムに1人選べる抽選ルーレット。二次会やパーティーのプレゼント抽選に。",
  },
  amidakuji: {
    title: "あみだくじメーカー | ことほぎ",
    description:
      "参加者と結果を入れるだけで作れるオンラインあみだくじ。役割分担・景品決め・順番決めを線をたどるアニメで発表。",
  },
  groupMaker: {
    title: "グループ分け・チーム分けメーカー | ことほぎ",
    description:
      "名前を入れて押すだけで公平にランダムなチーム分け。人数指定でもグループ数指定でもOK。イベントやゲームの班分けに。",
  },
  orderPicker: {
    title: "順番決め・くじ引き | ことほぎ",
    description:
      "名前をシャッフルして、発表・スピーチ・出し物の順番をランダムに決定。公平な順番決めをその場で。",
  },
  warikan: {
    title: "割り勘計算機 | ことほぎ",
    description:
      "合計金額と人数から一人当たりを自動計算。100円・500円単位で切り上げて端数もキレイに。二次会・飲み会の割り勘に。",
  },
  kingGame: {
    title: "王様ゲーム | ことほぎ",
    description:
      "スマホ1台で番号を配り、王様と指令をその場で決定。二次会・パーティー・飲み会の盛り上げに。",
  },
  talkTheme: {
    title: "トークテーマガチャ | ことほぎ",
    description:
      "押すだけで会話ネタ・質問がランダムに出るガチャ。初対面のアイスブレイクや沈黙対策に。カテゴリ・自作リスト対応。",
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
    id: "bingo-machine",
    title: "ビンゴ数字抽選機",
    description:
      "1〜75の数字をランダムに抽選するビンゴマシン。出た数字は自動記録、大画面表示にも対応します。",
    howto:
      "幹事が「抽選する」を押すたびに未出の数字が1つ出る → 会場の大画面に映して読み上げ → 履歴は自動保存。",
    icon: "circle-dot",
    href: "/app-tools/bingo-machine/index.html",
  },
  {
    id: "roulette",
    title: "抽選ルーレット",
    description:
      "名前や景品を入れて回すだけ。当選者をランダムに1人選べます。プレゼント抽選や指名決めに。",
    howto:
      "幹事が候補を1行ずつ入力 → 「回す」で当選を1つ選出 → 「当選を除いて続ける」で連続抽選もできる。",
    icon: "target",
    href: "/app-tools/roulette/index.html",
  },
  {
    id: "amidakuji",
    title: "あみだくじ",
    description:
      "参加者と結果を入れるだけのオンラインあみだくじ。役割分担・景品決め・順番決めに使えます。",
    howto:
      "幹事が参加者と結果を入力 → 「あみだを作る」で横線をランダム生成 → 「結果を見る」で担当を発表。",
    icon: "route",
    href: "/app-tools/amidakuji/index.html",
  },
  {
    id: "group-maker",
    title: "グループ分け・チーム分け",
    description:
      "名前を入れて押すだけで、公平にランダムなチーム分け。人数指定でもグループ数指定でもOKです。",
    howto:
      "幹事が参加者を1行ずつ入力 → グループ数か1組の人数を選ぶ → 「チーム分けする」で均等に配分。",
    icon: "users",
    href: "/app-tools/group-maker/index.html",
  },
  {
    id: "order-picker",
    title: "順番決め・くじ引き",
    description:
      "発表・スピーチ・出し物の順番を、その場で公平にシャッフルして決められます。",
    howto:
      "幹事が候補を1行ずつ入力 → 「順番を決める」でランダムに並び替え → 上から順に発表。",
    icon: "list-ordered",
    href: "/app-tools/order-picker/index.html",
  },
  {
    id: "warikan",
    title: "割り勘計算機",
    description:
      "合計金額と人数から一人当たりを自動計算。100円・500円単位で切り上げて端数もキレイに調整します。",
    howto:
      "幹事が合計金額・人数・切り上げ単位を入力 → 多く払う人／少なく払う人の内訳と余りを確認。",
    icon: "calculator",
    href: "/app-tools/warikan/index.html",
  },
  {
    id: "king-game",
    title: "王様ゲーム",
    description:
      "スマホ1台で番号を配り、王様と指令をその場で決定。二次会・パーティーの盛り上げに。",
    howto:
      "司会が人数を入れて番号を配る → スマホを回して各自が自分の番号を確認 → 「王様と指令を決める」で発表。",
    icon: "crown",
    href: "/app-tools/king-game/index.html",
  },
  {
    id: "talk-theme",
    title: "トークテーマガチャ",
    description:
      "押すだけで会話ネタ・質問がランダムに出るガチャ。初対面のアイスブレイクや沈黙対策に。",
    howto:
      "司会がカテゴリを選ぶ（自作リストも可）→ 「テーマを引く」で1つ表示 → テーブルごとに順番に話す。",
    icon: "message-circle",
    href: "/app-tools/talk-theme/index.html",
  },
  {
    id: "countdown",
    title: "カウントダウンタイマー",
    description:
      "残り時間を大きく表示するタイマー。入場・開演・スピーチの持ち時間管理に。全画面表示に対応します。",
    howto:
      "司会が時間をプリセットか分秒で設定 → 「スタート」で開始 → 「全画面」で会場の大画面に投影。",
    icon: "timer",
    href: "/app-tools/countdown/index.html",
  },
  {
    id: "scoreboard",
    title: "得点板・スコアボード",
    description:
      "チーム対抗ゲームの得点をその場で加算・減算。順位表示と自動保存で進行がスムーズになります。",
    howto:
      "司会がチーム名を編集 → ＋／−で得点を動かす → トップは金枠で強調、点数は自動保存。",
    icon: "trophy",
    href: "/app-tools/scoreboard/index.html",
  },
  {
    id: "tools-hub",
    title: "余興アプリ一覧を見る",
    description:
      "ここで紹介したアプリをまとめた一覧ページ。当日その場で開いて、必要な余興をすぐに選べます。",
    howto:
      "幹事・司会が一覧をブックマーク → 当日は開くだけで、ビンゴ・抽選・進行ツールにすぐアクセス。",
    icon: "layout-grid",
    href: "/app-tools/index.html",
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
