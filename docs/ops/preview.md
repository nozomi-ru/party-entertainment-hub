# プレビュー（非本番）環境の使い方

本番（`main` → 公開中の Worker URL）を壊さずに、変更を Cloudflare 上で確認するための**運用手順**です。

**本番相当の動作確認は、まずここで行う**（単体テストだけでは足りない）という位置づけです。  
テスト全体の順番・強制タイミングは [testing.md](./testing.md)。  
プロダクトの要件・設計は [../requirements.md](../requirements.md) / [../design.md](../design.md) を参照してください。

Cloudflare の Git 連携で **「非本番ブランチのビルド」** をオンにしている前提で書きます。

---

## 0. この文書の読み方

| 読みたいこと | 読む場所 |
|--------------|----------|
| 本番とプレビューのちがい | §1 |
| ダッシュボードの初回設定 | §2 |
| 毎回の確認手順 | §3 |
| アンケート KV が混ざる問題 | §4 |
| うまくいかないとき | §5 |
| ローカル `npm run dev` とのちがい | §6 |
| テスト・スモークとの関係 | [testing.md](./testing.md) |

---

## 0.1 関係資材マップ

| 種類 | パス / 場所 | 役割 |
|------|-------------|------|
| この手順書 | `docs/ops/preview.md` | 非本番の操作手順（正） |
| テスト全体の流れ | `docs/ops/testing.md` | L1→E2E→preview→本番の順番 |
| Workers / KV 設定 | `wrangler.jsonc` | `POLL_KV` の `id` / `preview_id` |
| デプロイ（本番向け GHA） | `.github/workflows/deploy-cloudflare.yml` | `main` で Quality 後に deploy |
| スモークスクリプト | `scripts/smoke.mjs` | プレビュー URL への短い疎通 |
| 設計（環境差分） | `docs/design.md` §9.4 | メモリ vs KV |
| ロードマップ（KV 分離） | `docs/roadmap.md` | `preview_id` 分離タスク |
| Cloudflare ダッシュボード | Worker `kotohogi` の Builds / Deployments | ビルド結果とプレビュー URL |

---

## 1. 全体像（なぜプレビューが必要か）

ローカルの `npm run dev` では、アンケートが **メモリ** で動きます。  
本番に近い「Workers + KV」での挙動は、**Cloudflare 上の非本番**で確かめるのが安全です。

```text
main ブランチ  ──ビルド──► 本番 Worker（会場が使う URL）
preview など   ──ビルド──► 非本番（プレビュー / Versions）
```

| | 本番 | 非本番（プレビュー） |
|--|------|----------------------|
| ブランチ | `main` | `preview` など `main` 以外 |
| デプロイ（ダッシュボード例） | `npx wrangler deploy` | `npx wrangler versions upload` |
| デプロイ（このリポの GHA） | `npm run deploy`（Quality 成功後） | CF 非本番ビルド、または手元確認 |
| 用途 | 会場・公開用 | デザインや機能の試し打ち |
| 失敗したとき | 会場に影響しうる | 本番 URL はそのまま |

Windows ARM では手元の `npm run preview` / `deploy` が失敗しやすいため、**非本番ブランチ + Cloudflare Linux ビルド**が特に有効です。

---

## 2. 初回だけ：ダッシュボード確認

Cloudflare → 対象 Worker（kotohogi）→ **Settings / Builds** あたりで次を確認します。

| 項目 | 推奨 |
|------|------|
| 本番ブランチ | `main` |
| 非本番ブランチのビルド | **オン** |
| 本番の Deploy | `npx wrangler deploy` |
| 非本番の Deploy | `npx wrangler versions upload` |
| Build | `npx opennextjs-cloudflare build` |

すでにオンにしてある場合は、そのままで大丈夫です。  
手元から本番相当を出す場合のコマンドはルート [README.md](../../README.md) の「Cloudflare へのデプロイ」も参照してください（推奨は GitHub Actions の `npm run deploy`）。

---

## 3. 毎回の流れ（確認したいとき）

### 3.1 変更をコミットする

`main` に直接載せる前に、確認用ブランチへ出します。

```bash
git checkout -b preview
git add -A
git commit -m "WIP: preview check"
git push -u origin preview
```

（すでに `preview` がある場合は `git checkout preview` → マージ or cherry-pick → push）

`git push` すると、ローカルでは husky が **単体テスト**を走らせます（詳細は [testing.md](./testing.md)）。  
続けて GitHub 上で Quality（単体 + E2E）も走ります。

### 3.2 Cloudflare でビルドを見る

ダッシュボード → **Deployments / Builds** で、ブランチ `preview` のビルドが走っているか確認します。

### 3.3 プレビュー URL を開く

ビルド成功後、同じ画面に **プレビュー用の URL** または **Version** へのリンクが出ます。  
それを開いて LP・ビンゴ・クイズ・アンケートを確認します。

※ URL の形は Cloudflare の UI 更新で変わることがあります。ダッシュボードの表示を正とします。

人が見る観点（L3）の例は [test-spec.md の手動確認](../test-spec.md#10-l3-手動確認自動化しないが本番前に必要な観点) です。

### 3.4 任意：スモークを打つ

プレビュー URL が分かったら、手元から最小スモークもできます（本番 URL は使わない）。

```powershell
# PowerShell
$env:SMOKE_BASE_URL="https://<プレビューのホスト>"
npm run smoke
```

```bat
REM cmd.exe
set SMOKE_BASE_URL=https://<プレビューのホスト>
npm run smoke
```

実装: `scripts/smoke.mjs`。仕様: [test-spec.md §7](../test-spec.md#7-l2-スモークいま実装済みの内容)。

GitHub に Secret `SMOKE_BASE_URL` を入れると、CI の unit ジョブでも同じスモークが走ることがあります（未設定ならスキップ）。

### 3.5 問題なければ本番へ

```bash
git checkout main
git merge preview
git push origin main
```

`main` への push で、GitHub の **Deploy** が Quality 成功後に本番を更新します（`.github/workflows/deploy-cloudflare.yml`）。

可能なら Branch protection で `unit` / `e2e` を必須にしてください（手順は [testing.md](./testing.md)）。

---

## 4. アンケート（KV）について

いまの `wrangler.jsonc` では、本番用 `id` と `preview_id` が同じ KV を指していることがあります。

| 状況 | 意味 |
|------|------|
| 同じ ID | プレビューと本番で **同じ投票データ倉庫** を共有しうる（危険） |
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

この分離はロードマップの残タスクでもあります（[roadmap.md](../roadmap.md)）。  
**自動テストから本番 KV を書き換えない**約束は [testing.md](./testing.md) / [test-spec.md](../test-spec.md) にも書いてあります。

---

## 5. うまくいかないとき

| 症状 | 確認 | 関係資材 |
|------|------|----------|
| `preview` を push してもビルドされない | 非本番ブランチのビルドがオンか | Cloudflare Builds 設定 |
| ビルドは成功するが URL が分からない | Deployments 画面のプレビュー / Versions リンク | ダッシュボード |
| 本番の見た目が変わってしまった | 誤って `main` に push していないか | Git 履歴 |
| アンケートが本番と混ざる | `preview_id` が本番と同じになっていないか | `wrangler.jsonc` |
| push が単体で止まる | 手元で `npm test` | [testing.md](./testing.md) |
| GitHub の Test が赤い | Actions のログ / Artifact `e2e-videos` | `quality.yml` |

---

## 6. ローカル確認との違い

| | ローカル `npm run dev` | Cloudflare 非本番 |
|--|------------------------|-------------------|
| 実行環境 | 自分の PC | Cloudflare Workers |
| アンケート | メモリ（KV なし） | KV（設定どおり） |
| 向き | 実装中の高速確認 | **本番に近い最終確認** |
| 入口 | `http://localhost:3000` | ダッシュボードのプレビュー URL |

---

## 7. 次に読むもの

| 目的 | 文書 |
|------|------|
| テストの強制タイミング・コマンド | [testing.md](./testing.md) |
| 設計・KV | [design.md](../design.md) |
| 受け入れ・手動観点 | [requirements.md](../requirements.md) · [test-spec.md](../test-spec.md) |
| これから（KV 分離など） | [roadmap.md](../roadmap.md) |
| docs 目次 | [README.md](../README.md) |
