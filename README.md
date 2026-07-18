# ことほぎ — Landing Page

結婚式・パーティー二次会の余興を支援する Web アプリの紹介・配布用ランディングページです。

## 技術スタック

- Next.js (App Router)
- Tailwind CSS v4
- Lucide React
- Cloudflare Workers（`@opennextjs/cloudflare`）
- Cloudflare KV（リアルタイムアンケートの同期）

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
├── package.json              ✅ 含める … 依存関係の定義
├── package-lock.json         ✅ 含める
├── wrangler.jsonc            ✅ 含める … Cloudflare Workers / KV 設定
├── next.config.ts            ✅ 含める
├── open-next.config.ts       ✅ 含める
├── tsconfig.json ほか設定    ✅ 含める
├── .github/workflows/        ✅ 含める … CI デプロイ（任意）
│
├── node_modules/             ❌ 含めない … ローカル専用（自動生成）
├── .next/                    ❌ 含めない … Next ビルドキャッシュ
├── .open-next/               ❌ 含めない … Cloudflare 向けビルド出力
├── .wrangler/                ❌ 含めない … wrangler ローカル状態
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

### 注意

- アンケートは本番で **Cloudflare KV** にルーム状態を保存します（TTL 24時間）
- 旧構成の「サーバーメモリ同期」は Cloudflare ではインスタンス間で共有されないため、KV に変更済みです
- ローカル `npm run dev` では KV が無い場合メモリにフォールバックします
- `images.unoptimized: true` のため、外部画像（Unsplash）も追加設定なしで表示できます
