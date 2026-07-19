# SEO・OGP・検索登録（わかりやすい運用ガイド）

このページは、「検索や SNS でことほぎを見つけやすくする」ために **何を・なぜ・どこで・誰が（手作業か自動か）** やるかを説明します。

コードを書く作業と、ブラウザでポチポチする手作業が混ざるので、先に役割分担を見てください。

| 項目 | 内容 |
|------|------|
| 最終更新 | 2026-07-19 |
| いまの本番例 | `https://kotohogi.nozoisfun.workers.dev` |
| 公開オリジンの設定 | 環境変数 `NEXT_PUBLIC_SITE_URL`、または `src/config/site.ts` の `siteUrl` |

---

## 0. 全体像：何のためにやるのか

サイトを作っただけでは、Google の検索結果にも、LINE のきれいなカードにも、自動では載りません。

| やりたいこと | なぜ必要か | だいたいの手段 |
|--------------|------------|----------------|
| **検索結果に出す** | Google のロボット（クローラー）に「このサイトがある・巡回してよい」と伝える必要がある | Search Console 登録 + sitemap / robots |
| **URL を貼ったとき見栄えよくする** | 幹事は検索より「URL を直接シェア」が多い。カードのタイトル・説明・画像がないと寂しい | title / description / OGP |
| **表示が遅くない・ずれない** | 遅い・ガタつくページは体験が悪く、長期的には評価にも影響しうる | Lighthouse で見る・画像の扱いを決める |

```text
【コード側で用意するもの】          【あなたが手作業でやること】
sitemap.xml / robots.txt            Google Search Console に登録
ページの title・description・OGP     所有権の「確認」ボタン
og.jpg などの画像                    サイトマップ URL の「送信」
                                      （任意）LINE で見た目チェック
                                      （任意）Lighthouse 計測
```

**大事なこと:**  
コードを push・デプロイしても、Search Console の「確認」と「サイトマップ送信」をしない限り、Google 側の手続きは完了しません。

---

## 0.1 手作業 / 自動（コード）の早見表

| 作業 | 手作業？ | どこでやるか | 備考 |
|------|----------|--------------|------|
| title / description / OGP の実装 | いいえ（実装済み） | リポジトリのコード | 文言変更は `site.ts` など |
| sitemap.xml / robots.txt の生成 | いいえ（実装済み） | デプロイすると URL で公開される | 中身はコードが決める |
| OGP 画像の配置 | いいえ（`public/og.jpg` あり） | リポジトリ → デプロイ | 差し替えはファイル更新 |
| Search Console にサイトを追加 | **はい** | [Google Search Console](https://search.google.com/search-console) の画面 | Google アカウントが必要 |
| 所有権の確認（HTML ファイル方式） | **一部手作業** | ファイルは `public/` に置く（リポ）→ デプロイ → **Search Console で「確認」** | TXT が使えないときの方式 |
| サイトマップの送信 | **はい** | Search Console → サイトマップ | URL を1回（または変更時に）送る |
| robots.txt の登録 | **いいえ** | （不要） | 公開されていれば Google が `/robots.txt` を自動取得する |
| デプロイ後に URL が生きているか見る | 任意（推奨） | ブラウザで本番 URL を開く | 下の §1.3 |
| LINE などでカード表示を見る | **はい（任意）** | LINE のトークなどに URL を貼る | キャッシュで古い表示になることあり |
| Lighthouse で速さ・ずれを測る | **はい（任意）** | Chrome のデベロッパーツール | 本番 or プレビュー URL |

---

## 0.2 関係資材マップ（コードの場所）

| 種類 | パス | 何のため |
|------|------|----------|
| 公開 URL・文言 | `src/config/site.ts`（`siteUrl` / `pageSeo` / `ogImagePath`） | ホストや説明文の差し替え口 |
| LP のメタ・OGP | `src/app/layout.tsx`, `src/app/page.tsx` | トップページの title / OGP / Twitter |
| sitemap | `src/app/sitemap.ts` → 公開後は `/sitemap.xml` | 「巡回してほしいページ一覧」 |
| robots | `src/app/robots.ts` → 公開後は `/robots.txt` | 「どこを巡回してよいか」（`/api/` は拒否） |
| OGP 画像 | `public/og.jpg` | SNS・LINE のカード画像 |
| Search Console 確認用 | `public/googlecc68a1666aefa6bb.html` など | 「このサイトの管理者は私です」の証明ファイル |
| 静的アプリの meta | `public/app-tools/*/index.html` | ビンゴ等を直接シェアしたときの説明・OGP |
| 手順の説明（この文書） | `docs/ops/seo.md` | 手作業のやり方 |
| 環境変数の例 | `.env.example` の `NEXT_PUBLIC_SITE_URL` | カスタムドメイン時のホスト指定 |

---

## 1. 検索に載せる（インデックス登録）

### 1.1 なぜ必要か

- Google は、インターネット上のすべてのサイトを勝手に完璧に把握しているわけではありません。
- **「この URL は正規の所有者のサイトです」** と Search Console で伝え、あわせて **「ここに重要なページがあります」** とサイトマップで案内します。
- `sitemap.xml` や `robots.txt` は「案内板」です。案内板だけ置いても、Search Console で握手しないと Google 側のダッシュボードやリクエストが使えません。

### 1.2 ことほぎでのやり方（いま推奨：HTML ファイル）

いまの公開先は `*.workers.dev` です。  
**ドメイン全体の TXT レコード確認が使えない／使わない**ため、次の組み合わせにしています。

| 項目 | 内容 |
|------|------|
| Search Console の種類 | **URL プレフィックス**（例: `https://kotohogi.nozoisfun.workers.dev/`） |
| 所有権の確認方法 | **HTML ファイルをサイトのルートに置く** |
| ファイルの置き場（リポジトリ） | `public/googlecc68a1666aefa6bb.html` |
| 公開後の URL | `https://kotohogi.nozoisfun.workers.dev/googlecc68a1666aefa6bb.html` |

#### 手順（画面操作はすべて手作業）

**A. Search Console でプロパティを作る（手作業・Google の画面）**

1. ブラウザで [Google Search Console](https://search.google.com/search-console) を開く（Google アカウントでログイン）  
2. プロパティを追加するとき **「URL プレフィックス」** を選ぶ  
3. 次を入力する（末尾の `/` は画面の指示に合わせる）  

```text
https://kotohogi.nozoisfun.workers.dev/
```

**B. 確認用 HTML をサイトに出す（コードは済・デプロイが必要）**

1. 確認方法で **「HTML ファイル」** を選ぶ  
2. Google が表示するファイル名をダウンロードする（例: `googlecc68a1666aefa6bb.html`）  
3. そのファイルをリポジトリの **`public/`** に置く（中身はだいたい1行）  
4. **コミット → プッシュ → Cloudflare のデプロイ完了を待つ**  
   - デプロイしないと、インターネット上にファイルが出ません  

期待する公開 URL の中身の例:

```text
google-site-verification: googlecc68a1666aefa6bb.html
```

**C. 所有権の「確認」ボタン（手作業・Search Console）**

1. ブラウザで確認用 URL を自分で開き、上の1行が見えることを確かめる  
2. Search Console に戻り **「確認」** を押す  
3. 成功と出たら、このサイトの管理者として Google に認められた状態です  

**D. サイトマップを送る（手作業・Search Console）**

1. 左メニューの **「サイトマップ」**（または「Sitemaps」）を開く  
2. 次の URL を登録・送信する  

```text
https://kotohogi.nozoisfun.workers.dev/sitemap.xml
```

| 誰が作るか | 中身 |
|------------|------|
| コード（自動） | `/sitemap.xml` の XML（LP と余興3アプリの URL） |
| あなた（手作業） | Search Console に「この sitemap を見て」と伝える操作 |

送信した直後に検索上位になるわけではありません。まずは「Google が巡回できる状態にした」という意味です。

#### robots.txt は Search Console に「登録」しない

| ファイル | Search Console で送る？ | 理由 |
|----------|-------------------------|------|
| **sitemap.xml** | **送る（手作業）** | 「重要なページ一覧はここ」と Google に明示するため |
| **robots.txt** | **送らない** | サイトのルート（`/robots.txt`）をクローラーが**自分で取りに行く**決まりだから |

`robots.txt` はデプロイされて公開 URL にあれば十分です。Search Console には「サイトマップ送信」のような登録ボタンはありません。

（任意）Search Console のレポートや古い「robots.txt テスター」で、Google がどう読んだかをあとから確認することはできます。必須手順ではありません。

#### （参考）TXT レコード方式はいつ使うか

カスタムドメイン（例: `kotohogi.example.com`）を取り、DNS を Cloudflare で管理しているときは、**ドメインプロパティ + TXT レコード**でも所有権確認できます。  
`workers.dev` だけなら、いまの **HTML ファイル方式で十分**です。

---

### 1.3 デプロイ後にブラウザで見るもの（任意だがわかりやすい）

「コードが本番に載ったか」を自分の目で確かめるチェックです。Search Console の代わりにはなりませんが、失敗の切り分けに使います。

| 開く URL | 何のため | うまくいっているときの目安 |
|----------|----------|----------------------------|
| `…/google….html` | 所有権ファイルが出ているか | 1行の verification 文が見える |
| `…/robots.txt` | クローラーへの案内 | `Allow: /`、`Disallow: /api/`、`Sitemap:` がある |
| `…/sitemap.xml` | ページ一覧 | LP と `app-tools` の3つが `<loc>` にある |
| `…/og.jpg` | 共有用画像 | 画像が表示される |
| `…/` （トップ） | メタタグ | ページの「ソースを表示」で `og:title` や `og:image` がある |

2026-07-19 時点の本番実測（参考）:

| URL | 結果 |
|-----|------|
| 確認用 HTML / robots / sitemap / og.jpg | OK |
| LP の description・og:title・twitter | OK |
| LP の `og:image` | 絶対 URL 指定に修正済み（再デプロイ後にソースで再確認） |

---

### 1.4 カスタムドメインに変えたとき（将来）

ホスト名が変わると、sitemap や OGP の絶対 URL も合わせる必要があります。

1. **手作業 or 設定:** ビルド環境に `NEXT_PUBLIC_SITE_URL=https://あなたのドメイン` を入れる（または `site.ts` の既定を更新）  
2. **コード:** 静的 HTML（`app-tools`）内に書いてある古いホスト名を新しいホストに合わせる  
3. **手作業:** Search Console に新しい URL のプロパティを追加し、所有権確認 → sitemap 再送信  

---

## 2. メタデータと OGP（シェアしたときの見た目）

### 2.1 なぜ必要か

| 用語 | 意味 | 何のため |
|------|------|----------|
| **title** | ブラウザタブや検索結果の見出しになりやすい文字 | 「何のページか」が一目でわかる |
| **description** | ページの短い説明（目安 100〜120 文字） | 検索やシェア時の要約 |
| **OGP** | Open Graph Protocol。SNS が読む特別な meta | LINE 等で URL を貼ったときの **カード（画像・タイトル・説明）** |

結婚式・パーティーの幹事さんは、検索で探すより **チャットで URL を貼る**ことが多いです。  
そのため「検索順位」だけでなく、**OGP が正しく出ることの方が体感インパクトが大きい**ことがあります。

### 2.2 手作業かコードか

| 内容 | 手作業？ | どこ |
|------|----------|------|
| タグを HTML / Next に出す仕組み | いいえ（実装済み） | `layout.tsx` / `page.tsx` / 各 `app-tools` の HTML |
| 文言や画像を変える | コード編集（開発作業） | `src/config/site.ts` の `pageSeo`、必要なら各 HTML の meta、`public/og.jpg` |
| 「ちゃんとカードに見えるか」確かめる | **はい（任意）** | LINE に URL を貼る、または [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) など |

文言を変えたら、**LP 用の `pageSeo` と、対応する `app-tools/*/index.html` の meta を揃える**のが安全です。

### 2.3 ページごとの役割

| ページ | 設定の場所 | ねらい |
|--------|------------|--------|
| LP（`/`） | `pageSeo.home` + layout | ことほぎ全体の紹介 |
| 人間ビンゴ | `wedding-bingo/index.html` | ビンゴ単体でシェアされてもわかる |
| 新郎新婦クイズ | `wedding-quiz/index.html` | クイズ単体でわかる |
| アンケート | `wedding-poll/index.html` | アンケート単体でわかる |

---

## 3. パフォーマンス（Core Web Vitals）

### 3.1 なぜ見るのか

- ページが遅い・表示がガタつくと、ゲストや幹事が使いづらいです。
- Google も「体験の良さ」をシグナルの一つにしています（これがすべてではありません）。
- Cloudflare Workers はネットワーク的には速いことが多いですが、**画像やレイアウトの問題はフロント側**に残ります。

### 3.2 Lighthouse（手作業・Chrome）

| 項目 | 内容 |
|------|------|
| どこで | 自分の PC の **Google Chrome** |
| 対象 URL | 本番、またはプレビューの URL |
| 操作 | ページを開く → F12（デベロッパーツール）→ **Lighthouse** タブ → モバイル想定で計測 |
| 特に見る指標 | **LCP**（大きいコンテンツが映るまでの時間）、**CLS**（読み込み中のレイアウトずれ）、**TBT**（メインスレッドの詰まり） |

コードの自動テスト（Vitest / Playwright）とは別物です。「速さの健康診断」だと思ってください。

**計測のコツ:** 拡張機能が点数を落とすことがあります。警告が出たら **シークレットウィンドウ**で再計測してください。

特に **LastPass**（拡張 ID `hdokiejnpimakedhajhdlcegeplioahd`）は、未使用 JS が約 1MB・メインスレッド 1.5 秒超を食いやすく、Performance が 40 台のままに見えます。**サイト側の問題ではありません。**

### 3.3 実測メモ（2026-07-19）

本番 `https://kotohogi.nozoisfun.workers.dev/` のモバイル Lighthouse 例:

| カテゴリ | 点数 | コメント |
|----------|------|----------|
| Performance | **48** | 拡張機能ありの計測では信用しない |
| Accessibility | 96 | コントラスト指摘あり → 色トークン調整 |
| Best Practices | 100 | 良好 |
| SEO | 100 | 良好 |

| 指標 | 拡張ありの例 | 読み方 |
|------|--------------|--------|
| FCP | 1.4 s | まずまず |
| **LCP** | **18.2 s** | 拡張の長いタスクと重なりやすく、数値が跳ねる |
| **TBT** | **1,610 ms** | レポート上、大半が LastPass の content script |
| CLS | 0 | 良好 |
| 1st party 転送 | 約 330 KiB | `hero.webp` 約 62 KiB まで縮小済み |
| 全体転送（拡張込み） | 約 3.4 MB | うち拡張 JS が約 1 MB |

再計測は必ず **シークレット（拡張オフ）** で。サイト側の残り改善はフォント数とコントラストが中心です。

### 3.4 いま入れた対策（コード側）

| 対策 | 内容 |
|------|------|
| ヒーロー自前配信 | `public/hero.webp`（約 60KB）を同一オリジンで配信。Unsplash 依存をやめた |
| preload | `layout.tsx` で `/hero.webp` を preload |
| フォント削減 | 本文の Zen Kaku（本番で **font preload が約 240 本**）をやめ、OS 日本語ゴシックへ。欧文は Cormorant のみ |
| ヒーロー img | `next/image` ではなく素の `<img decoding="sync" fetchPriority="high">`（LCP 向け） |
| 入場アニメ | `fade-up` から opacity 変化を外し、LCP が透明待ちにならないようにした |
| コントラスト | `--champagne-deep` を濃くし、白背景上の AA を満たしやすくした |
| コード分割 | LP の Features など下部セクションを `dynamic()` で分割 |

**LCP 18.2s の正体（この計測時点の本番）:** HTML 先頭で Zen Kaku 系の **font preload が約 240 本**あり、Slow 4G では `hero.webp` よりフォントが帯域を奪う。フォント削減のデプロイ後に LCP が大きく下がる想定です。

### 3.5 画像配信（方針）

| 項目 | 内容 |
|------|------|
| いまの設定 | `next.config.ts` で `images.unoptimized: true` |
| なぜ | Next.js 標準の画像最適化は Node 依存が強く、Cloudflare Workers / OpenNext ではそのまま使えないことが多い |
| 手作業 | ヒーロー・OGP など大きい画像は、追加・差し替え時に圧縮してから `public/` へ |
| 将来の選択肢 | Cloudflare Images、エッジでのリサイズ |

| ファイル | 用途 | 目安サイズ |
|----------|------|------------|
| `public/hero.webp` | LP ヒーロー（LCP） | 100KB 前後 |
| `public/og.jpg` | SNS シェア用 | 300KB 以下・1200×630 |

---

## 4. おすすめの進め方（最初の一回）

手作業の順番だけ抜き出すと、こうです。

```text
1. コード（sitemap / robots / OGP / 確認用 HTML）が main に載ってデプロイされる
2. ブラウザで google….html / robots.txt / sitemap.xml を開いて生きているか見る
3. Search Console で URL プレフィックスを追加する
4. HTML ファイル方式で「確認」を押す
5. サイトマップに https://…/sitemap.xml を送信する
6. （任意）LINE にトップ URL を貼ってカードを見る
7. （任意）Lighthouse を一度回して記録する
```

### チェックリスト

```
【デプロイ・コード】
- [ ] 本番ホストが siteUrl / NEXT_PUBLIC_SITE_URL と一致している
- [ ] /robots.txt と /sitemap.xml がブラウザで開く
- [ ] 確認用 /google….html がブラウザで開く（HTML 方式のとき）

【Search Console・手作業】
- [ ] URL プレフィックス（またはドメイン）プロパティを作った
- [ ] 所有権の「確認」に成功した
- [ ] sitemap.xml を送信した

【任意】
- [ ] LINE 等で OGP カードを確認した
- [ ] Lighthouse で LCP / CLS を一度見た
```

---

## 5. 次に読むもの

| 目的 | 文書 |
|------|------|
| デプロイ・非本番 | [preview.md](./preview.md) |
| テストの強制タイミング | [testing.md](./testing.md) |
| 設計（Workers / デプロイ） | [design.md](../design.md) §9 |
| 次にやること | [roadmap.md](../roadmap.md) |
| docs 全体の目次 | [README.md](../README.md) |
