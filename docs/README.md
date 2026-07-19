# ことほぎ — ドキュメント

開発者・運用向けの**内部文書**です。  
`docs/` は `public/` の外にあるため、**サイトには公開されません**（エンドユーザーには見えません）。

アプリの起動・デプロイの最短手順だけ知りたいときは、リポジトリ直下の [README.md](../README.md) を見てください。  
この `docs/` は、「なぜこうなっているか」「何が正か」「どのファイルを触るか」を後から思い出すための場所です。

---

## 0. 迷ったらここから

| いま知りたいこと | 開く文書 |
|------------------|----------|
| 何を作るプロダクトか（機能・受け入れ） | [requirements.md](./requirements.md) |
| どう実装・構成しているか（API・KV・画面） | [design.md](./design.md) |
| 自動テストで何を合格とするか | [test-spec.md](./test-spec.md) |
| 利用者ストーリー（SC-*）の合格条件 | [scenario-spec.md](./scenario-spec.md) |
| テストがいつ走るか・コマンド・pre-push | [ops/testing.md](./ops/testing.md) |
| 本番を壊さず Cloudflare で確認する | [ops/preview.md](./ops/preview.md) |
| SEO・Search Console・OGP | [ops/seo.md](./ops/seo.md) |
| 次に何をやるか | [roadmap.md](./roadmap.md) |
| まだ着手しないアプリ案 | [ideas.md](./ideas.md) |
| Qiita など外部向け下書き | [drafts/qiita-cursor-cloudflare.md](./drafts/qiita-cursor-cloudflare.md) |

**仕様の正**は次の4つです。記事や Cursor skill は、同じ内容を複製せずここへリンクします。

- 要件: `requirements.md`
- 設計: `design.md`
- 自動テスト仕様: `test-spec.md`
- シナリオ仕様: `scenario-spec.md`

**手順の正**は `ops/` です（「どう操作するか」）。

- テスト実行: `ops/testing.md`
- 非本番確認: `ops/preview.md`

---

## 1. 文書の役割（仕様と手順を混ぜない）

| 置き場 | 書くこと | 書かないこと |
|--------|----------|--------------|
| `requirements` / `design` / `test-spec` / `scenario-spec` / `roadmap` | プロダクト・テストの事実と方針 | 記事の文体・KPT の長文 |
| `ops/` | 手元・Cloudflare・Git での**手順**と関係ファイルの場所 | 機能要件・合格条件の再定義（正は仕様側） |
| `drafts/` | 読み手向けの説明・振り返り | 実装の唯一の仕様書として扱うこと |
| `.cursor/skills/` | Agent の進め方・チェックリスト | design / test-spec の全文コピー |

変更を入れるときは、だいたい次の順で文書も揃えます。

```text
要件を変える → requirements.md
実装の形を変える → design.md（必要なら roadmap も）
テストの合格条件を変える → test-spec.md / scenario-spec.md
コマンドや CI の動きを変える → ops/testing.md（必要なら workflows）
非本番の手順を変える → ops/preview.md
```

---

## 2. フォルダ構成

```
docs/
├── README.md          ← この目次（いま読んでいるページ）
├── requirements.md    ← プロダクト要件（正）
├── design.md          ← 設計・アーキテクチャ（正）
├── test-spec.md       ← 自動テスト仕様（正）
├── scenario-spec.md   ← シナリオテスト仕様（利用者ストーリー）
├── roadmap.md         ← 次の施策
├── ideas.md           ← アプリ／機能のアイディアメモ（未着手）
├── ops/               ← 運用手順
│   ├── preview.md     ← 非本番（Cloudflare preview）の手順
│   ├── testing.md     ← テストの実行・仕組み・関係資材マップ
│   └── seo.md         ← Search Console・sitemap・OGP・CWV
└── drafts/            ← 外部公開用の下書き（記事など）
    └── qiita-*.md
```

---

## 3. リポジトリ全体の関係資材（コード側）

文書だけ見ても「どのファイル？」が分からないと困るので、よく触る実装の地図です。  
もっと詳しいマップは、各文書の冒頭「関係資材」節と [ops/testing.md §1](./ops/testing.md#1-関係資材マップこのファイルは何) にあります。

| 領域 | 主なパス | 詳しく書いてある文書 |
|------|----------|----------------------|
| LP（紹介ページ） | `src/app/page.tsx`, `src/components/landing/`, `src/config/site.ts` | requirements §4.1 · design §4 |
| ビンゴ | `public/app-tools/wedding-bingo/` | requirements §4.2 · design §6 |
| クイズ | `public/app-tools/wedding-quiz/` | requirements §4.3 · design §7 |
| アンケート UI | `public/app-tools/wedding-poll/` | requirements §4.4 · design §8 |
| アンケート API | `src/app/api/poll/[room]/route.ts` | design §8.6 |
| 正規化・ストア | `src/lib/poll.ts`, `src/lib/poll-store.ts` | design §8.5–8.6 · test-spec |
| URL 圧縮共有 | `public/app-tools/shared/pack.js` | design §5.2 |
| Cloudflare | `wrangler.jsonc`, `open-next.config.ts` | design §9 · ops/preview |
| 単体テスト | `src/lib/*.test.ts`, `vitest.config.ts` | test-spec · ops/testing |
| E2E | `e2e/`, `playwright.config.ts` | scenario-spec · ops/testing |
| pre-push | `.husky/pre-push` | ops/testing §4 |
| CI / Deploy | `.github/workflows/` | ops/testing · design §9 |
| Agent 用メモ | `.cursor/skills/kotohogi-cloudflare/` | この目次の「仕様の正」へ誘導 |

Git に含めない生成物（`node_modules/`, `.next/`, `test-results/` など）はルート [README.md](../README.md) のディレクトリ表を参照してください。

---

## 4. プロダクトの一言まとめ

**ことほぎ**は、結婚式・パーティー二次会の幹事・司会が、特別な機材なしで余興（交流ビンゴ・クイズ・リアルタイムアンケート）を実施できる Web アプリ群と、その紹介用ランディングページです。

| 置き場 | 用途 | 例 |
|--------|------|----|
| 端末 localStorage | 個人状態 | ビンゴの名前、投票済みフラグ |
| URL（`?c=` + UrlPack） | 設定の配布（DB不要） | ビンゴマス、クイズ問題 |
| Cloudflare KV（`POLL_KV`） | 端末横断の共有 | アンケートの票・進行 |

詳細は [requirements.md](./requirements.md) と [design.md](./design.md) へ。
