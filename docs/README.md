# ことほぎ — ドキュメント

開発者・運用向けの内部文書です。  
`docs/` は **サイトには公開されません**（`public/` 外のためエンドユーザーには見えません）。

アプリの起動・デプロイの最短手順はリポジトリ直下の [README.md](../README.md) を見てください。

## どこを読むか

| 目的 | 文書 |
|------|------|
| **何を作るか**（要件） | [requirements.md](./requirements.md) |
| **どう作っているか**（設計・正） | [design.md](./design.md) |
| **自動テストの仕様**（用語・合格条件） | [test-spec.md](./test-spec.md) |
| **シナリオテストの仕様**（利用者ストーリー） | [scenario-spec.md](./scenario-spec.md) |
| **テストの実行手順**（コマンド・動画の見方） | [ops/testing.md](./ops/testing.md) |
| **次にやること** | [roadmap.md](./roadmap.md) |
| **非本番で確認する** | [ops/preview.md](./ops/preview.md) |
| **Qiita 投稿用の下書き** | [drafts/qiita-cursor-cloudflare.md](./drafts/qiita-cursor-cloudflare.md) |

## フォルダの役割

```
docs/
├── README.md          ← この目次
├── requirements.md    ← プロダクト要件（正）
├── design.md          ← 設計・アーキテクチャ（正）
├── test-spec.md       ← 自動テスト仕様（正）
├── scenario-spec.md   ← シナリオテスト仕様（利用者ストーリー）
├── roadmap.md         ← 次の施策
├── ops/               ← 運用手順（デプロイ周り）
│   ├── preview.md
│   └── testing.md     ← テストの実行手順（仕様は test-spec / scenario-spec）
└── drafts/            ← 外部公開用の下書き（記事など）
    └── qiita-*.md
```

リポジトリ側のテスト実装: `e2e/`（シナリオ）、`src/lib/*.test.ts`（単体）、`scripts/smoke.mjs`（任意スモーク）。

| 置き場 | 書くこと | 書かないこと |
|--------|----------|--------------|
| `requirements` / `design` / `test-spec` / `scenario-spec` / `roadmap` | プロダクト・テストの事実と方針 | 記事の文体・KPT の長文 |
| `ops/` | 手元・Cloudflare での手順 | 機能要件・テストケースの再定義 |
| `drafts/` | 読み手向けの説明・振り返り | 実装の唯一の仕様書として扱うこと |
| `.cursor/skills/` | Agent の進め方・チェックリスト | design / test-spec のコピー |

**仕様の正**は `requirements.md`・`design.md`・`test-spec.md`・`scenario-spec.md` です。記事や skill はそこへリンクし、同じ内容を複製しません。
