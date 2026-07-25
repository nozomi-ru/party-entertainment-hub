# ことほぎ — Landing Page

結婚式・パーティーの余興を支援する Web アプリの紹介・配布用ランディングページです。

## 技術スタック

- Next.js (App Router)
- Tailwind CSS v4
- Lucide React
- Cloudflare Workers（`@opennextjs/cloudflare`）
- Cloudflare KV（リアルタイムアンケートの同期）

## 開発ドキュメント

内部文書は [`docs/`](./docs/)（サイト非公開）。  
**迷ったら目次** [docs/README.md](./docs/README.md)（各文書の関係・コード側の資材地図あり）。

| 文書 | 内容 |
|------|------|
| [要件](./docs/requirements.md) | 何を作るか（機能 ID・受け入れ） |
| [設計](./docs/design.md) | どう作っているか（API・KV・パス） |
| [自動テスト仕様](./docs/test-spec.md) | 何をどう自動検証するか |
| [シナリオテスト仕様](./docs/scenario-spec.md) | 利用者ストーリー（E2E / SC-*） |
| [テスト実行手順](./docs/ops/testing.md) | 仕組み・pre-push・関係ファイル・コマンド |
| [プレビュー手順](./docs/ops/preview.md) | 非本番ブランチでの確認・KV 注意 |
| [SEO・OGP](./docs/ops/seo.md) | Search Console・sitemap・共有カード |
| [アクセス分析](./docs/ops/analytics.md) | Cloudflare Web Analytics |
| [ロードマップ](./docs/roadmap.md) | 次にやること |

## ディレクトリ構成（何をデプロイするか）

静的ファイルを個別に選んで上げる構成ではありません。  
**下の「含める」一式を Git に載せ、Cloudflare 側でビルド**します。

```
party-entertainment-hub/
│
├── src/                      ✅ 含める … Next.js 本体（LP・API）
│   ├── app/                  … ページ・レイアウト・API ルート
│   ├── components/           … UI コンポーネント
│   ├── config/               … リンク等の差し替え設定
│   └── lib/                  … 共通ロジック
│
├── public/                   ✅ 含める … そのまま配信される静的ファイル
│   └── app-tools/            … ビンゴ / クイズ / アンケート（HTML）
│
├── e2e/                      ✅ 含める … シナリオ E2E（ガーキン）
├── scripts/                  ✅ 含める … smoke など補助スクリプト
├── package.json              ✅ 含める … 依存関係の定義
├── package-lock.json         ✅ 含める
├── wrangler.jsonc            ✅ 含める … Cloudflare Workers / KV 設定
├── next.config.ts            ✅ 含める
├── open-next.config.ts       ✅ 含める
├── vitest.config.ts          ✅ 含める
├── playwright.config.ts      ✅ 含める
├── tsconfig.json ほか設定    ✅ 含める
├── .github/workflows/        ✅ 含める … Test（Quality）/ Deploy（品質ゲート必須）
├── docs/                     ✅ 含める … 要件・設計・テスト仕様（サイト非公開。構成は docs/README.md）
│
├── node_modules/             ❌ 含めない … ローカル専用（自動生成）
├── .next/                    ❌ 含めない … Next ビルドキャッシュ
├── .open-next/               ❌ 含めない … Cloudflare 向けビルド出力
├── .wrangler/                ❌ 含めない … wrangler ローカル状態
├── test-results/             ❌ 含めない … Playwright 録画・結果
├── playwright-report/        ❌ 含めない … E2E HTML レポート
├── .features-gen/            ❌ 含めない … bddgen 生成物
└── .dev.vars / .env*         ❌ 含めない … 秘密情報
```

| 記号 | 意味 |
|------|------|
| ✅ | Git にコミットする。Cloudflare（Git 連携 / `npm run deploy`）の入力になる |
| ❌ | `.gitignore` 済み。手元や CI で生成されるので上げない |

余興アプリ（ビンゴ等）の編集場所は **`public/app-tools/` のみ**です。`src/` には置きません。

## リンクの差し替え

`src/config/site.ts` を編集してください。

- `appLinks.primaryCta.href` … CTA の遷移先
- `features[].href` … Features から各アプリへの URL
- `affiliateItems[].href` … アフィリエイト／おすすめショップの URL

## ローカル開発

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

単体テスト（ロジックの早期検知・KV 不使用）:

```bash
npm test
```

`git push` 時は husky の **pre-push** が単体を**自動実行**（失敗したら push 中止）。  
GitHub では push / PR のたびに単体 + E2E を強制。  
仕組み・関係ファイルの場所・コマンドは [`docs/ops/testing.md`](./docs/ops/testing.md) を読んでください。

E2E（**ガーキン記法**・結果は動画で確認。初回はブラウザ導入が必要）:

```powershell
npm run test:e2e:install
npm run test:e2e
npm run test:e2e:report
```

**本番相当の確認は Cloudflare 非本番が先**（手順: [`docs/ops/testing.md`](./docs/ops/testing.md) / [`docs/ops/preview.md`](./docs/ops/preview.md)）:

```powershell
# PowerShell
$env:SMOKE_BASE_URL="https://<preview-host>"
npm run smoke
```

- ビンゴ / クイズ: 設定は URL（`?c=`）に圧縮して共有（DB不要）
- アンケート: ローカルではメモリ同期。Cloudflare 本番では KV 同期

## Cloudflare へのデプロイ

推奨: GitHub / GitLab を Cloudflare に接続し、**Linux 上でビルド**してください。  
（Windows ARM では `wrangler` 付属の `workerd` が入らないため、ローカルの `npm run preview` / `deploy` は使えないことがあります。）

### 1. KV ネームスペースを作成

Cloudflare ダッシュボード、または x64 / macOS / Linux 環境で:

```bash
npx wrangler login
npx wrangler kv namespace create POLL_KV
npx wrangler kv namespace create POLL_KV --preview
```

表示された ID を `wrangler.jsonc` の `kv_namespaces[0].id` / `preview_id` に書き換えてください。

### 2. デプロイ

```bash
npm run deploy
```

または Cloudflare の Git 連携で、ビルドコマンドを次に設定します。

- Build command: `npx opennextjs-cloudflare build`
- Deploy: Workers 向け OpenNext 出力（リポジトリ接続時の案内に従う）

Workers ランタイムでの確認（x64 / macOS / Linux）:

```bash
npm run preview
```

### 3. プレビュー（非本番）で確認する

本番（`main`）を触らずに確かめる場合は、Cloudflare の **非本番ブランチのビルド** を使います。

1. `preview` など `main` 以外のブランチに push  
2. ダッシュボードの Deployments でビルド成功を確認  
3. 表示されたプレビュー URL / Version で動作確認  
4. 問題なければ `main` にマージして本番反映  

詳細手順・KV の分離方法は [`docs/ops/preview.md`](./docs/ops/preview.md) を参照してください。

### 注意

- アンケートは本番で **Cloudflare KV** にルーム状態を保存します（TTL 24時間）
- 旧構成の「サーバーメモリ同期」は Cloudflare ではインスタンス間で共有されないため、KV に変更済みです
- ローカル `npm run dev` では KV が無い場合メモリにフォールバックします
- `images.unoptimized: true` のため、外部画像（Unsplash）も追加設定なしで表示できます
