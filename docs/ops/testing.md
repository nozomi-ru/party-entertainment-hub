# テストの実行手順（わかりやすい操作ガイド）

このページは、**「テストがいつ・どこで・なぜ走るのか」**と、**「自分はどのコマンドを打てばいいか」**を、あとから読み返しても分かるように書いた運用手順です。

課金のある外部テストサービスは使いません。  
**会場が使う本番データ（本番 KV）は、自動テストから書き換えません。**

---

## 0. まず：どの文書を読めばよいか

テストまわりは「仕様」と「手順」を分けています。混ざると「何が正か」が分からなくなるためです。

| 文書 | パス | 役割（何が書いてあるか） |
|------|------|--------------------------|
| **このページ** | `docs/ops/testing.md` | 仕組みの説明、コマンド、強制タイミング、動画の見方、関係ファイルの場所 |
| [自動テスト仕様書](../test-spec.md) | `docs/test-spec.md` | **何を合格とするか**・用語・層（L1/L2/L2b）の定義。仕様の正本 |
| [シナリオテスト仕様書](../scenario-spec.md) | `docs/scenario-spec.md` | 利用者ストーリー（SC-*）の合格条件の正本 |
| [プレビュー手順](./preview.md) | `docs/ops/preview.md` | Cloudflare 非本番の作り方・確認の仕方 |
| [ドキュメント目次](../README.md) | `docs/README.md` | `docs/` 全体の地図 |
| リポジトリ README | [`README.md`](../../README.md) | 最短の起動・テスト・デプロイ入口 |

用語（CI、E2E、ガーキン、husky、pre-push など）は、仕様書の [用語集](../test-spec.md#1-用語集この文書で使う言葉) を参照してください。このページでも必要なものは平易に説明します。

---

## 1. 関係資材マップ（「このファイルは何？」）

困ったとき・直したいときは、まずここを見て「どこを開くか」を決めてください。

### 1.1 文書（読むもの）

| パス | 内容 |
|------|------|
| `docs/ops/testing.md` | **いま読んでいるページ**（実行と仕組み） |
| `docs/test-spec.md` | 単体・スモーク・E2E の仕様・用語・いつ走るかの仕様まとめ |
| `docs/scenario-spec.md` | SC-LP / SC-POLL / SC-BINGO / SC-QUIZ の合格条件 |
| `docs/ops/preview.md` | 非本番（preview）の手順 |
| `docs/design.md` | アプリ設計（API・KV など）。テスト対象の理解用 |
| `docs/roadmap.md` | これから足すテスト（UT-API など） |
| `docs/drafts/qiita-cursor-cloudflare.md` | 外部向け記事の下書き（仕様の正ではない） |
| `.cursor/skills/kotohogi-cloudflare/SKILL.md` | Cursor Agent 向けの短い進め方・チェックリスト |

### 1.2 単体テスト（L1・部品）

| パス | 内容 |
|------|------|
| `package.json` の `"test": "vitest run"` | `npm test` の実体 |
| `vitest.config.ts` | Vitest の設定 |
| `src/lib/poll.ts` | ルームコード・票の正規化など（テストしやすい部品） |
| `src/lib/poll.test.ts` | 正規化の単体テスト（UT-ROOM / UT-VOTE） |
| `src/lib/poll-store.test.ts` | メモリ上の poll-store の単体（UT-STORE） |
| `src/app/api/poll/[room]/route.ts` | アンケート API（単体の対象外寄り。正規化は `poll.ts` 側） |

### 1.3 E2E（L2b・ブラウザ自動操作）

| パス | 内容 |
|------|------|
| `package.json` の `test:e2e` など | `bddgen && playwright test` |
| `playwright.config.ts` | ポート 3100、動画録画 `video: "on"` など |
| `e2e/features/*.feature` | 日本語ガーキン（シナリオ文） |
| `e2e/steps/app.steps.ts` | 「もし〜」の行に対応する実際の操作 |
| `e2e/fixtures.ts` | Playwright-BDD 用の共通準備 |
| `test-results/` | ローカル実行後の動画・失敗時の痕跡（**Git にコミットしない**） |
| `playwright-report/` | HTML レポート（`npm run test:e2e:report` で見る） |

### 1.4 スモーク（L2・短い疎通）

| パス | 内容 |
|------|------|
| `scripts/smoke.mjs` | `SMOKE_BASE_URL` 向けに GET/POST を数回打つ |
| `package.json` の `"smoke"` | `npm run smoke` |

### 1.5 ローカル強制（push 直前）

| パス | 内容 |
|------|------|
| `.husky/pre-push` | **push 直前に `npm test` を実行するスクリプト** |
| `package.json` の `"prepare": "husky"` | `npm install` 後に husky を有効化する |

### 1.6 GitHub 上の強制（CI / デプロイ）

| パス | 内容 |
|------|------|
| `.github/workflows/quality.yml` | **Quality**：`unit`（単体＋任意スモーク）と `e2e`。他から呼び出される本体 |
| `.github/workflows/test.yml` | すべての push / PR で Quality を呼ぶ |
| `.github/workflows/deploy-cloudflare.yml` | `main` などで Quality 成功後にだけ `npm run deploy` |
| GitHub Secrets | 任意の `SMOKE_BASE_URL`、デプロイ用の Cloudflare トークン類 |

### 1.7 成果物（実行のあと）

| 場所 | 内容 |
|------|------|
| ローカル `test-results/**/video.webm` | E2E の録画 |
| ローカル `playwright-report/` | レポート UI |
| GitHub Actions Artifact **`e2e-videos`** | CI 上の録画＋レポート（ZIP でダウンロード） |

---

## 2. なぜこう分けているか（設計の意図）

自動テストは「全部をいつも全部やる」と遅くて面倒になり、結局スキップされがちです。  
このリポジトリでは **速さ・重さ・危険度** で役割を分けています。

| 層 | 何を見るか | 速さ | いつ強制するか |
|----|------------|------|----------------|
| **L1 単体** | 関数など小さな部品 | とても速い（秒） | **自分の PC の push 直前**＋ GitHub |
| **L2b E2E** | ブラウザでの一連の操作 | 遅い（分） | **GitHub のみ強制**（手元は任意） |
| **L2 スモーク** | 公開 URL への短い疎通 | 中程度 | Secret があるときだけ CI で任意 |
| **L3 手動** | 見た目・当日オペの感覚 | 人の時間 | 本番前に人がやる（自動化しない） |

**ローカル pre-push では単体だけ**にしている理由:

- push のたびに E2E を走らせると待ち時間が長く、習慣が壊れやすい
- 単体は「明らかに壊れた変更」をすぐ止めるのに十分効く
- 重い E2E と録画は GitHub 上でまとめて担保する

**本番デプロイの前に Quality をもう一度通す**理由:

- Test ワークフローと Deploy ワークフローは別定義なので、デプロイ直前にも同じ門を通す
- 「テストは通ったつもりだが、デプロイだけ別経路で載った」を防ぐ

---

## 3. いちばん大事な流れ（頭の中の地図）

```text
コードを書く
  → git commit（ここではテストは強制しない。途中保存しやすくするため）
  → git push しようとする
        ├─ 【自分の PC】husky の pre-push が起動
        │     → npm test（単体だけ）
        │     → 失敗したら push は中止（GitHub に届かない）
        │     → 成功したらリモートへ送信
        └─ 【GitHub】到着後に Actions が動く
              → Test ワークフロー → Quality（単体 + E2E）
  → 必要なら Cloudflare 非本番（preview）で人が確認
  → main に入れる
        └─ 【GitHub】Deploy ワークフロー
              → 同じ Quality をもう一度
              → 成功したときだけ npm run deploy（本番公開）
```

番号で言うと:

```text
① 部品のテスト（単体 L1）     … npm test / push 前 husky
② ブラウザ自動操作（E2E L2b） … npm run test:e2e / GitHub Quality
③ Cloudflare の非本番（L2/L3）… preview + 任意スモーク
④ 本番（main）                … Quality 成功後にだけ Deploy
```

---

## 4. pre-push / husky とは何か（ローカルの門番）

### 4.1 言葉の意味

| 言葉 | 意味 |
|------|------|
| **Git フック** | `commit` や `push` の直前・直後に、自動でスクリプトを走らせる仕組み |
| **pre-push** | 「リモートへ送る直前」に走るフック。ここで失敗すると **push 自体がキャンセル**される |
| **husky** | そのフック用スクリプトを、リポジトリ内の `.husky/` で管理しやすくする道具 |

このプロジェクトの pre-push の中身は、実質これだけです（ファイル: `.husky/pre-push`）:

```text
npm test
```

つまり **「GitHub に送る前に、自分の PC で単体テストを必ず通す」** という意味です。

### 4.2 いつ有効になるか

1. リポジトリを clone（または取得）する  
2. `npm install` する  
3. `package.json` の `"prepare": "husky"` が動き、`.husky/pre-push` が使えるようになる  
4. 以降、`git push` のたびに単体が走る  

Husky が効いていないように見えるときは、まず `npm install` をもう一度試してください。

### 4.3 コミットでは走らない理由

`git commit` ではテストを強制していません。  
理由は、作業中の「いったん記録しておきたい」を邪魔しないためです。  
**「共有する（push）」タイミングで門を通す**、という方針です。

### 4.4 注意（回避できること）

ローカルの husky は、意図的に `--no-verify` などで飛ばせます。  
そのため **本番相当の「絶対に止める」力は、GitHub のステータスチェック（Branch protection）側が本丸**です。手順は後述の「Branch protection」を見てください。

---

## 5. いつ・どこで・何が強制されるか（一覧）

| あなたがすること | 場所 | 強制？ | 実際に走ること | 関係ファイル |
|------------------|------|--------|----------------|--------------|
| `git commit` | 自分の PC | なし | — | — |
| `git push` | 自分の PC（husky） | **単体のみ** | `npm test` | `.husky/pre-push` |
| どのブランチへの push / PR | GitHub **Test** | **単体 + E2E** | Quality | `test.yml` → `quality.yml` |
| `main` / `master` への push | GitHub **Deploy** | **単体 + E2E → 成功後デプロイ** | Quality 再実行 → `npm run deploy` | `deploy-cloudflare.yml` |
| スモーク | GitHub の `unit` ジョブ（任意） | Secret があるときだけ | `npm run smoke` | Secret `SMOKE_BASE_URL` |

- **Test**: すべてのブランチの push、およびすべての PR  
- **Deploy**: `main` / `master` と、手動実行（`workflow_dispatch`）のみ  

仕様としての同じ表は [test-spec.md の §9](../test-spec.md#9-いつどこで走らせるか) にもあります。操作の詳細は **このページが正**です。

---

## 6. 初回セットアップ（clone したあと / E2E 初回）

```powershell
npm install
npm run test:e2e:install
```

| コマンド | 何が起きるか |
|----------|----------------|
| `npm install` | 依存関係の導入。あわせて husky（pre-push）が有効化されやすい |
| `npm run test:e2e:install` | Playwright が使う Chromium を PC にダウンロード |

`test:e2e:install` を忘れると、E2E 実行時に  
`Executable doesn't exist at ...\ms-playwright\...`  
のようになり、シナリオが全部失敗します。  
ブラウザ本体は `%LOCALAPPDATA%\ms-playwright\` 付近に入ります（Git 管理外）。

---

## 7. ① 単体テスト（L1）のやり方

```bash
npm test
```

| 項目 | 内容 |
|------|------|
| 何が走る | Vitest（`vitest run`） |
| 主なファイル | `src/lib/poll.test.ts`, `src/lib/poll-store.test.ts` |
| 成功の目安 | ターミナルに Tests passed。いまはおおよそ 9 件前後 |
| 失敗したら | 表示された `UT-...` 名を手がかりに、対応する `*.test.ts` と本体（多くは `src/lib/poll.ts`）を直す |
| push との関係 | 同じ `npm test` が pre-push でも走る |

開発中に繰り返し見るとき:

```bash
npm run test:watch
```

---

## 8. ② E2E（L2b）— ガーキン + 動画

合格条件の正本は [scenario-spec.md](../scenario-spec.md) です。  
「どんなシナリオがあるか」の一覧は [test-spec.md の §8](../test-spec.md#8-l2b-e2eガーキン--動画いま実装済みの内容) も参照してください。

### 8.1 手元で全部走らせる

```bash
npm run test:e2e
npm run test:e2e:report
```

何も指定しないとき:

- 開発サーバーをポート **3100** で自動起動する（`playwright.config.ts`）
- アンケートは **メモリ上**（本番 KV は触らない）
- 各シナリオの操作が **動画（webm）** として残る

### 8.2 動画・レポートの見方

| 成果物 | 場所 | 見方 |
|--------|------|------|
| 各シナリオの録画 | `test-results/**/video.webm` | ファイルを開く |
| Guest 側の録画（ある場合） | `test-results/guest-videos/` | 同上 |
| まとめページ | `playwright-report/` | `npm run test:e2e:report` |
| GitHub 上 | Actions の Artifact **`e2e-videos`** | 実行結果から ZIP をダウンロード |

### 8.3 プレビュー URL に向けて E2E する（任意）

**本番 URL は指定しないこと。**

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

---

## 9. ③ Cloudflare 非本番（L2 / L3）

手順の詳細: [preview.md](./preview.md)

任意のスモーク（ブラウザは開かず、短い HTTP だけ）:

```powershell
$env:SMOKE_BASE_URL="https://プレビューのホスト"
npm run smoke
```

```bat
set SMOKE_BASE_URL=https://プレビューのホスト
npm run smoke
```

実装ファイルは `scripts/smoke.mjs` です。

GitHub リポジトリに Secret `SMOKE_BASE_URL` を入れると、Quality の **unit** ジョブでも同じスモークが走ります。未設定ならスキップされます。

### KV についての約束

| やってよい | やらない |
|------------|----------|
| 単体・既定の E2E はメモリ／ローカル | CI や手元から **本番** `POLL_KV` を更新する |
| プレビュー専用 KV に分離する（推奨） | 本番データで試し投票する |

`preview_id` の分離など、非本番の注意は [preview.md](./preview.md) と [roadmap.md](../roadmap.md) を見てください。

---

## 10. ④ 本番へ載せるとき

1. 非本番（preview）で問題ないことを確認する  
2. `main` にマージする（可能なら Branch protection で `unit` / `e2e` 必須）  
3. GitHub の **Deploy to Cloudflare** が、Quality 成功後にだけ `npm run deploy` する  
4. 本番 URL で Host / Guest を一度通す（人が見る L3）

デプロイのチェックリスト要約は、Cursor skill（`.cursor/skills/kotohogi-cloudflare/SKILL.md`）にもあります。

---

## 11. GitHub で「マージも強制する」（推奨・設定は1回）

ローカル pre-push だけでは、`--no-verify` などで回避できてしまいます。  
**「赤いチェックのまま main に入れない」** ようにするには、GitHub 側の設定が必要です。

1. リポジトリの **Settings → Branches**  
2. `main` の **Branch protection** を開く（または作る）  
3. **Require status checks to pass before merging** をオン  
4. 必須チェックに Quality 由来の **`unit`** と **`e2e`** を追加  
   - 表示名は `Test / quality / unit` のように見えることがあります。一覧から選ぶ  
5. Force push はオフ推奨  

一度設定すれば、以降は PR のマージボタンがステータスに連動します。

---

## 12. 困ったとき

| 症状 | まず確認すること | 関係資材 |
|------|------------------|----------|
| push が単体で止まる | 手元で `npm test` を単独実行し、失敗した `UT-...` を直す | `src/lib/*.test.ts`, `.husky/pre-push` |
| husky が動いていない | `npm install` し直す。`.husky/pre-push` があるか見る | `package.json` の `prepare` |
| GitHub が赤い | Actions → 失敗ジョブのログ。E2E なら Artifact `e2e-videos` | `quality.yml`, `test.yml` |
| 動画が無い / Executable doesn't exist | 先に `npm run test:e2e:install`。ローカルは `test-results/` | `playwright.config.ts` |
| アンケートが本番と混ざる | プレビュー KV / `preview_id` 分離 | [preview.md](./preview.md) |
| 「何を合格とすべきか」が分からない | 仕様書を開く（手順書ではない） | [test-spec.md](../test-spec.md), [scenario-spec.md](../scenario-spec.md) |

---

## 13. 次に読むもの

| 目的 | 文書 |
|------|------|
| 合格条件・用語・層の定義 | [test-spec.md](../test-spec.md) |
| シナリオ ID（SC-*）の詳細 | [scenario-spec.md](../scenario-spec.md) |
| 非本番の作り方 | [preview.md](./preview.md) |
| 設計（API・KV） | [design.md](../design.md) |
| これから足すテスト | [roadmap.md](../roadmap.md) |
| docs 全体の目次 | [docs/README.md](../README.md) |
| 最短コマンド入口 | [リポジトリ README](../../README.md) |
