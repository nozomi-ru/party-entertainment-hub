# プレビュー（非本番）環境の使い方

本番（`main` → `kotohogi.*.workers.dev`）を壊さずに、変更を確認するための手順です。

Cloudflare の Git 連携で **「非本番ブランチのビルド」** をオンにしている前提です。

---

## 全体像

```text
main ブランチ  ──ビルド──► 本番 Worker（いつも公開している URL）
preview など   ──ビルド──► 非本番（プレビュー / Versions）
```

| | 本番 | 非本番（プレビュー） |
|--|------|----------------------|
| ブランチ | `main` | `preview` など `main` 以外 |
| デプロイ | `npx wrangler deploy` | `npx wrangler versions upload`（設定時の例） |
| 用途 | 会場・公開用 | デザインや機能の試し打ち |

---

## 初回だけ：ダッシュボード確認

Cloudflare → 対象 Worker（kotohogi）→ **Settings / Builds** あたりで次を確認します。

| 項目 | 推奨 |
|------|------|
| 本番ブランチ | `main` |
| 非本番ブランチのビルド | **オン** |
| 本番の Deploy | `npx wrangler deploy` |
| 非本番の Deploy | `npx wrangler versions upload` |
| Build | `npx opennextjs-cloudflare build` |

すでにオンにしてある場合は、そのままで大丈夫です。

---

## 毎回の流れ（確認したいとき）

### 1. 変更をコミットする

`main` に直接載せる前に、確認用ブランチへ出します。

```bash
git checkout -b preview
git add -A
git commit -m "WIP: preview check"
git push -u origin preview
```

（すでに `preview` がある場合は `git checkout preview` → マージ or cherry-pick → push）

### 2. Cloudflare でビルドを見る

ダッシュボード → **Deployments / Builds** で、ブランチ `preview` のビルドが走っているか確認します。

### 3. プレビュー URL を開く

ビルド成功後、同じ画面に **プレビュー用の URL** または **Version** へのリンクが出ます。  
それを開いて LP・ビンゴ・クイズ・アンケートを確認します。

※ URL の形は Cloudflare の UI 更新で変わることがあります。ダッシュボードの表示を正とします。

### 4. 問題なければ本番へ

```bash
git checkout main
git merge preview
git push origin main
```

`main` への push で本番が更新されます。

---

## アンケート（KV）について

いまの `wrangler.jsonc` では、本番用 `id` と `preview_id` が同じ KV を指しています。

| 状況 | 意味 |
|------|------|
| 同じ ID | プレビューと本番で **同じ投票データ倉庫** を共有しうる |
| 別 ID | プレビュー用に独立した倉庫（おすすめ） |

プレビューだけ別倉庫にしたい場合:

1. Cloudflare で KV を新規作成（例: `POLL_KV_PREVIEW`）
2. その ID を `wrangler.jsonc` の `preview_id` だけに書く
3. コミットして `preview` / `main` それぞれに反映

```jsonc
"kv_namespaces": [
  {
    "binding": "POLL_KV",
    "id": "<本番用ID>",
    "preview_id": "<プレビュー専用ID>"
  }
]
```

---

## うまくいかないとき

| 症状 | 確認 |
|------|------|
| `preview` を push してもビルドされない | 非本番ブランチのビルドがオンか |
| ビルドは成功するが URL が分からない | Deployments 画面のプレビュー / Versions リンク |
| 本番の見た目が変わってしまった | 誤って `main` に push していないか |
| アンケートが本番と混ざる | `preview_id` が本番と同じになっていないか |

---

## ローカル確認との違い

| | ローカル `npm run dev` | Cloudflare 非本番 |
|--|------------------------|-------------------|
| 実行環境 | 自分の PC | Cloudflare Workers |
| アンケート | メモリ（KV なし） | KV（設定どおり） |
| 向き | 実装中の高速確認 | **本番に近い最終確認** |

Windows ARM ではローカル `npm run preview` が使えないことがあるため、非本番ブランチでの確認が特に有効です。
