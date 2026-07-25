# アクセス分析（Cloudflare Web Analytics）

| 項目 | 内容 |
|------|------|
| 最終更新 | 2026-07-21 |
| 採用 | **Cloudflare Web Analytics のみ**（GA4 は使わない） |
| ダッシュボード | Cloudflare → Analytics & Logs → Web Analytics |

Cookie を使わない・ビーコンが小さいので、ことほぎの軽量さ（Lighthouse）と相性がよいです。

---

## 0. 読み方

| 知りたいこと | 節 |
|--------------|-----|
| 初回の手作業（トークン取得） | §1 |
| コードのどこに入れるか | §2 |
| デプロイ後の確認 | §3 |
| 何が分かるか | §4 |

### 関係資材マップ

| パス | 役割 |
|------|------|
| `src/config/site.ts` の `cfBeaconToken` | LP 用。`NEXT_PUBLIC_CF_BEACON_TOKEN` から読む |
| `src/components/CloudflareAnalytics.tsx` | LP に beacon を出す |
| `src/app/layout.tsx` | 上記コンポーネントを読み込み |
| `public/cf-web-analytics.js` | 静的余興 HTML 用。先頭の `TOKEN` を編集 |
| `public/app-tools/wedding-*/index.html` | `/cf-web-analytics.js` を読み込み |

---

## 1. 手作業：トークンを取る（初回だけ）

### 1.1 サイトを追加する

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログインする  
2. 左メニュー（またはホーム）から **Analytics & Logs** → **Web Analytics** を開く  
   - 見つからないときは上部検索で `Web Analytics` と入力する  
3. **Add a site**（サイトを追加）を押す  
4. サイトの URL に次を入れる（カスタムドメインがあればそちら）  

```text
https://kotohogi.nozoisfun.workers.dev
```

5. 追加を完了する（Done / 完了 など）

### 1.2 トークンを控える（ここが本題）

追加直後、または Web Analytics のサイト一覧から該当サイトを開くと、**埋め込み用の JavaScript** が表示されます。だいたい次の形です。

```html
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}'
></script>
```

控えるのは **`token": "` の直後から `"` の手前まで** の文字列だけです。

| すること | しないこと |
|----------|------------|
| `xxxxxxxx...` の英数字だけコピー | `<script>` 全体をそのままコピペして終わる |
| 前後の空白・改行を入れない | `token` という単語自体を値に含める |

例: 上のスニペットなら控える値は `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` だけ。

あとから見直すとき:

1. Web Analytics の一覧でサイト名をクリック  
2. **Manage site** / **JS snippet** / セットアップ案内などから、同じスニペットを再表示  
3. 同様に `token` の値だけコピー  

トークンは HTML に載る公開用 ID です（API 秘密鍵ではありません）。ただし他人のサイトに使わせないよう、リポジトリ外の env にも置けるようにしています。

---

## 2. トークンの入れ方（コード／環境変数）

**同じ token を次の2か所に揃えてください。**

### 2.1 LP（Next.js）

デプロイ環境（GitHub Actions secrets / Cloudflare の環境変数など）に:

```text
NEXT_PUBLIC_CF_BEACON_TOKEN=ここにトークン
```

ローカル確認だけなら `.env.local`（Git にコミットしない）でも可。

未設定のままだと LP にビーコンは出ません（エラーにはなりません）。

### 2.2 余興アプリ（静的 HTML）

[`public/cf-web-analytics.js`](../../public/cf-web-analytics.js) を開き、先頭付近の:

```js
var TOKEN = "";
```

を:

```js
var TOKEN = "ここに同じトークン";
```

に変更してコミット／デプロイする。

空のままだと余興ページでもビーコンは動きません。

---

## 3. デプロイ後の確認

1. 本番の LP（`/`）と余興（例: `/app-tools/wedding-bingo/index.html`）を数回開く  
2. Cloudflare の **Web Analytics** で、数十分〜半日程度で PV が増えるか見る  
3. （任意）ブラウザの開発者ツール → Network で `beacon.min.js` や Cloudflare insights への送信があるか確認  
4. （任意）シークレットで Lighthouse を一度回し、Performance が大きく落ちていないことを確認  

---

## 4. 見られるもの / 見られないもの

| 見られる | 見られない（この構成では） |
|----------|----------------------------|
| ページビュー・ユニークの目安 | ボタン単位の細かいイベント |
| 参照元 | 広告キャンペーンの高度なレポート（GA4 向け） |
| 人気 URL（LP・各余興） | 個人を特定するトラッキング |
| 国・ブラウザ・端末の概況 | アンケートの回答内容（それは KV 側） |

GA4 が必要になったら別途検討します。いまの方針では **入れません**。

---

## 5. トラブルシュート

| 症状 | 確認 |
|------|------|
| 数字が 0 のまま | トークン未設定／LP と `cf-web-analytics.js` で値が違う／サイト URL の登録違い |
| LP だけ増える | `public/cf-web-analytics.js` の `TOKEN` が空 |
| 余興だけ増える | `NEXT_PUBLIC_CF_BEACON_TOKEN` がデプロイに入っていない（ビルド時に埋め込まれる点に注意） |
