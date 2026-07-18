# テストの実行手順（わかりやすい操作ガイド）

このページは **「いま、自分は何をすればいいか」** のための手順書です。

| 文書 | 役割 |
|------|------|
| **このページ**（`ops/testing.md`） | コマンドの打ち方、いつ強制で走るか、動画の見方 |
| [自動テスト仕様書](../test-spec.md) | 何を合格とするか・用語・層の定義 |
| [シナリオテスト仕様書](../scenario-spec.md) | 利用者ストーリー（SC-*）の合格条件 |

課金のある外部テストサービスは使いません。  
**会場が使う本番データ（本番 KV）は、自動テストから書き換えません。**

用語（CI、E2E、ガーキン、husky など）は仕様書の [用語集](../test-spec.md#1-用語集この文書で使う言葉) を参照してください。

---

## いちばん大事な流れ（全体像）

```text
① 部品のテスト（単体 L1）     … npm test / push 前 husky
② ブラウザ自動操作（E2E L2b） … npm run test:e2e / GitHub Quality
③ Cloudflare の非本番（L2/L3）… preview + 任意スモーク
④ 本番（main）                … Quality 成功後にだけ Deploy
```

```text
コードを書く
  → git commit（テスト強制なし）
  → git push
        ├─ 自分の PC: husky が単体を実行（失敗 → push 中止）
        └─ GitHub Test: Quality（unit + e2e）を実行
  → preview で本番相当を確認
  → main へ
        └─ GitHub Deploy: 同じ Quality をもう一度 → 成功時のみデプロイ
```

### 初回だけ（clone したあと / E2E 初回）

```powershell
npm install
npm run test:e2e:install
```

`test:e2e:install` は Playwright が使う Chromium を PC にダウンロードします。  
これをしないと `Executable doesn't exist at ...\ms-playwright\...` で全部失敗します。

### GitHub で「マージも強制」（推奨・設定は1回）

1. Settings → Branches → `main` の Branch protection  
2. **Require status checks to pass before merging** をオン  
3. 必須チェックに Quality 由来の **`unit`** と **`e2e`** を追加  
   （表示名は `Test / quality / unit` のように見えることがあります。一覧から選ぶ）  
4. Force push はオフ推奨  

ローカル husky は `--no-verify` で回避できるため、**本番相当の強制は GitHub のステータスチェック**が本丸です。

---

## いつ・どこで・何が強制されるか

| 操作 | 場所 | 強制 | 内容 |
|------|------|------|------|
| コミット | ローカル | なし | WIP しやすくする |
| プッシュ | ローカル husky | **単体** | `npm test` |
| プッシュ / PR | GitHub **Test** | **単体 + E2E** | `.github/workflows/quality.yml` |
| main へプッシュ | GitHub **Deploy** | **単体 + E2E → デプロイ** | Deploy が Quality を再実行してから公開 |
| スモーク | GitHub unit（任意） | Secret があるときだけ | `SMOKE_BASE_URL` |

- **Test**: すべてのブランチの push / すべての PR  
- **Deploy**: `main` / `master` と手動実行のみ  

---

## ① 単体テスト（L1）

```bash
npm test
```

失敗したら: 表示された `UT-...` の名前を手がかりに `src/lib/*.test.ts` と本体を直す。

---

## ② E2E（L2b）— ガーキン + 動画

合格条件の正本: [scenario-spec.md](../scenario-spec.md)

```bash
npm run test:e2e
npm run test:e2e:report
```

動画: `test-results/**/video.webm`、または GitHub Artifact **`e2e-videos`**

### 環境変数（シェル別）

**PowerShell（この PC の既定）:**

```powershell
$env:E2E_BASE_URL="https://プレビューのホスト"
npm run test:e2e
```

**cmd.exe:**

```bat
set E2E_BASE_URL=https://プレビューのホスト
npm run test:e2e
```

本番 URL は指定しないこと。

---

## ③ Cloudflare 非本番（L2 / L3）

手順: [preview.md](./preview.md)

任意のスモーク:

```powershell
$env:SMOKE_BASE_URL="https://プレビューのホスト"
npm run smoke
```

```bat
set SMOKE_BASE_URL=https://プレビューのホスト
npm run smoke
```

GitHub に Secret `SMOKE_BASE_URL` を入れると、Quality の unit ジョブでも同じスモークが走ります（未設定ならスキップ）。

### KV

| やってよい | やらない |
|------------|----------|
| 単体はメモリ | CI から本番 `POLL_KV` を更新 |
| プレビュー専用 KV に分離（推奨） | 本番データで試し投票 |

---

## ④ 本番へ

1. 非本番で問題なし  
2. `main` にマージ（可能なら Branch protection）  
3. Deploy が Quality 成功後にだけ `npm run deploy`  

---

## 困ったとき

| 症状 | 確認 |
|------|------|
| push が単体で止まる | `npm test` を単独実行 |
| GitHub が赤い | Actions → 失敗ジョブのログ。E2E なら Artifact `e2e-videos` |
| 動画が無い / Executable doesn't exist | 先に `npm run test:e2e:install`。ローカル動画は `test-results/`。CI は Artifact `e2e-videos` |
| アンケートが本番と混ざる | `preview_id` 分離（preview.md） |

---

## 次に読むもの

| 目的 | 文書 |
|------|------|
| 合格条件・用語 | [test-spec.md](../test-spec.md) |
| シナリオ ID（SC-*） | [scenario-spec.md](../scenario-spec.md) |
| プレビュー | [preview.md](./preview.md) |
