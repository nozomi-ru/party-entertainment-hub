# SEO・OGP・検索登録（運用手順）

ことほぎを検索結果や SNS 共有で見つけやすくするための手順です。  
実装の正（メタ・sitemap のコード）は `src/app/` と `src/config/site.ts` にあります。

| 項目 | 内容 |
|------|------|
| 最終更新 | 2026-07-19 |
| 公開オリジンの設定 | `NEXT_PUBLIC_SITE_URL` または `src/config/site.ts` の `siteUrl` 既定値 |

---

## 0. 関係資材マップ

| 種類 | パス | 役割 |
|------|------|------|
| 公開 URL・文言 | `src/config/site.ts`（`siteUrl` / `pageSeo` / `ogImagePath`） | 差し替え口 |
| LP メタ・OGP | `src/app/layout.tsx`, `src/app/page.tsx` | title / description / Open Graph / Twitter |
| sitemap | `src/app/sitemap.ts` → `/sitemap.xml` | クローラー向け一覧 |
| robots | `src/app/robots.ts` → `/robots.txt` | 巡回許可（`/api/` は拒否） |
| OGP 画像 | `public/og.jpg` | LINE / SNS のカード画像 |
| Search Console 確認用 | `public/google*.html` | HTML ファイル方式の所有権確認 |
| 静的アプリ meta | `public/app-tools/*/index.html` | アプリ直リンク用の description / OGP |
| 画像最適化方針 | `next.config.ts`（いま `images.unoptimized: true`） | Workers 向け |

---

## 1. 検索エンジンへのインデックス登録（必須・手作業あり）

コードだけでは Google の結果に載りません。**Search Console への登録**が必要です。

### 1.1 Google Search Console（URL プレフィックス + HTML ファイル）

`*.workers.dev` のように **TXT（ドメインプロパティ）が使えない／使わない**場合は、次の手順です。

1. [Google Search Console](https://search.google.com/search-console) で **URL プレフィックス**プロパティを追加  
   例: `https://kotohogi.nozoisfun.workers.dev/`  
2. 確認方法で **HTML ファイル**を選ぶ  
3. Google が指示するファイル名（例: `googlecc68a1666aefa6bb.html`）を **`public/` に置く**（このリポジトリでは配置済み）  
4. デプロイ後、次の URL が本文どおり開けることを確認する  

```text
https://kotohogi.nozoisfun.workers.dev/googlecc68a1666aefa6bb.html
```

期待する本文（例）:

```text
google-site-verification: googlecc68a1666aefa6bb.html
```

5. Search Console の **確認** を押す  
6. 成功後、左メニューの **サイトマップ** から次を送信する  

```text
https://<あなたの公開ホスト>/sitemap.xml
```

例:

```text
https://kotohogi.nozoisfun.workers.dev/sitemap.xml
```

※ カスタムドメインで DNS を Cloudflare 管理している場合は、ドメインプロパティ + TXT でも確認できます。どちらでも所有権が取れれば十分です。
### 1.2 デプロイ後の確認

| URL | 期待 |
|-----|------|
| `/robots.txt` | `Sitemap:` 行があり、`Disallow: /api/` がある |
| `/sitemap.xml` | LP と3つの余興 HTML の URL が並ぶ |
| `/` のソース | `og:title` / `og:image` などがある |

カスタムドメインに切り替えたら:

1. `NEXT_PUBLIC_SITE_URL=https://あなたのドメイン` をビルド環境に設定（または `site.ts` の既定を更新）  
2. 静的 HTML 内の `https://kotohogi.nozoisfun.workers.dev/...` も同じホストに合わせる  
3. Search Console に新ドメインを追加し、sitemap を再送信  

---

## 2. メタデータと OGP（実装済みの方針）

| 面 | 方針 |
|----|------|
| LP | `pageSeo.home` の title / description（おおよそ100〜120文字） |
| 余興3アプリ | 各 HTML に固有の title / description / OGP |
| OGP 画像 | `public/og.png`（絶対 URL で参照） |
| 共有体験 | LINE 等でのカード表示を優先（二次会は URL 直シェアが多い） |

文言を変えたいときは **`src/config/site.ts` の `pageSeo`** と、対応する `app-tools/*/index.html` の `<meta>` を揃えて更新する。

OGP の見え方確認: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) や LINE の実際の投稿プレビューなど。キャッシュが残る場合はデバッガで再取得する。

---

## 3. パフォーマンス（Core Web Vitals）

Workers のエッジ配信で TTFB は比較的有利です。フロントの描画も確認します。

### 3.1 Lighthouse

1. 本番（またはプレビュー）URL を Chrome で開く  
2. DevTools → **Lighthouse** → モバイル想定で計測  
3. **LCP**（最大コンテンツの描画）と **CLS**（レイアウトずれ）を特に見る  
4. LP ヒーロー画像（Unsplash）が LCP になりやすい → サイズ・読み込み優先度を見直す  

### 3.2 画像配信（Cloudflare Workers 上の注意）

このリポジトリはいま **`images.unoptimized: true`** です。

| 理由 | Next.js の Image Optimization は Node 依存があり、Workers / OpenNext ではそのまま使えないことが多い |
| いま | `<img>` または unoptimized のまま外部 URL（Unsplash）を表示 |
| 次の選択肢 | Cloudflare Images / カスタムローダーでエッジリサイズ / 手元で圧縮した静的アセット |

`public/og.jpg` は共有用のため、**ファイルサイズが大きいと SNS 取得が遅くなる**ことがあります。差し替え時は目安 300KB 以下・1200×630 前後を推奨します。

---

## 4. チェックリスト

```
- [ ] NEXT_PUBLIC_SITE_URL（または site.ts 既定）が本番ホストと一致
- [ ] デプロイ後に /robots.txt と /sitemap.xml が 200
- [ ] Search Console 所有権確認済み（HTML ファイル or TXT）
- [ ] 確認用 HTML（使う場合）が https://…/google….html で開ける
- [ ] Search Console に sitemap.xml を送信済み
- [ ] LINE 等で LP URL を貼り、OGP カードが出る
- [ ] Lighthouse で LCP / CLS を一度記録した
```

---

## 5. 次に読むもの

| 目的 | 文書 |
|------|------|
| 公開・プレビュー | [preview.md](./preview.md) |
| 設計（デプロイ） | [design.md](../design.md) §9 |
| ロードマップ | [roadmap.md](../roadmap.md) |
