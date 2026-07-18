---
name: kotohogi-cloudflare
description: >-
  Guides Kotohogi / party-entertainment-hub work: Next.js + OpenNext on Cloudflare
  Workers, POLL_KV, static app-tools, docs/, Host/Guest poll UX, deploy checklists,
  Qiita drafts, and KPT retrospectives. Use when editing this repo, deploying to
  Cloudflare, changing wedding-bingo/quiz/poll, writing docs or Qiita posts, or
  when the user mentions ことほぎ, Workers, KV, OpenNext, or Cursor commit/push ship loop.
---

# Kotohogi × Cloudflare 出荷スキル

このリポジトリ（ことほぎ）向けの進め方。小さく出して直し、共有が必要な所だけクラウドに寄せる。

## アーキテクチャの前提

| 置き場 | 用途 | 例 |
|--------|------|----|
| 端末 localStorage | 個人状態 | ビンゴの名前、投票済み |
| URL (`?c=` + UrlPack) | 設定の配布（DB不要） | ビンゴマス、クイズ問題 |
| Cloudflare KV (`POLL_KV`) | 端末横断の共有 | アンケート票・進行 |

- LP / API: `src/`（Next.js App Router）
- 余興 UI: `public/app-tools/` の静的 HTML（`src/app` に HTML を置かない）
- 内部文書: `docs/`（サイト非公開。`public/` に入れない）
- Worker 名: `kotohogi`（`wrangler.jsonc`）
- ビルド: `npx opennextjs-cloudflare build` → デプロイ: `npx wrangler deploy`
- Windows ARM ではローカル `preview`/`deploy` が落ちやすい → **GitHub → Cloudflare Linux ビルド**を優先

## デプロイ前チェックリスト

```
- [ ] node_modules / .next / .open-next をコミットしていない
- [ ] wrangler.jsonc の POLL_KV id が仮文字 (REPLACE_WITH_...) ではない
- [ ] KV binding 名は POLL_KV（表示名は何でも可）
- [ ] Cloudflare は既存リポ接続（新規リポ作成ではない）
- [ ] Build: npx opennextjs-cloudflare build
- [ ] Deploy: npx wrangler deploy
- [ ] Host/Guest を一度通した（投票・結果表示）
```

詳細は [reference.md](reference.md)。

## アンケート（POLL）の必須 UX

- **Host は投票不可**（進行・結果表示・票クリアのみ）
- **Guest は `?room=XXXX` で自動入室してすぐ投票**
- Host 画面にゲスト用 URL の表示・コピー
- 結果は Host が公開するまでゲストに出さない
- Host 未作成時は Guest が待機ポーリング

## Cursor 出荷ループ

ユーザーが「コミット」「プッシュ」と明示したときのみ Git 操作する（通常の commit ルールに従う）。

推奨ループ:

1. 小さく直す  
2. 差分を確認する  
3. コミット＆プッシュ（依頼時）  
4. Cloudflare 自動デプロイを待つ  
5. 本番 URL で確認  

秘密情報（`.dev.vars` / `.env` / API Token）はコミットしない。

## ドキュメント / Qiita

- 要件・設計: `docs/requirements.md`, `docs/design.md`
- Qiita 下書き: `docs/qiita-cursor-cloudflare.md`
- 読み手向け記事の方針:
  - 有用なことだけ（冗長な内部実装の羅列は避ける）
  - 図・表・mermaid で流れを示す
  - Qiita では `mindmap` を使わない（`flowchart` / `sequenceDiagram`）
  - mermaid は `<br/>`、subgraph への辺、特殊記号を避ける
  - 「高校生でもわかる」など読者を下に見る言い回しは使わない
  - 振り返りは **KPT**（Keep / Problem / Try）で、表＋短い補足

## LP デザイン方針（このリポジトリ）

- ブランド名をヒーローの主信号に
- フルブリード hero、ヒーローにカードやバッジを載せない
- クリーム＋テラコッタ／紫グラデの定番 AI 見た目を避ける
- 現行トーン: cool paper / ink / muted champagne（`globals.css` の CSS 変数）
- Features はカード羅列より区切りリスト寄り、Affiliate だけ操作カード可
- 意図的なモーション 2〜3（fade / line / scroll など）

## よくある失敗と対処

| 症状 | 原因 | 対処 |
|------|------|------|
| デプロイだけ失敗 | KV id が仮 | ダッシュボードの本物 ID を wrangler に書く |
| TS ビルド失敗 `#` | `.d.ts` に `#` コメント | `//` にする |
| アンケート同期しない | binding 名違い / KV未接続 | `POLL_KV` と本番 KV を確認 |
| Guest が入れない | Host 未作成 or URL に room なし | Host 先、`?room=` 付き URL |

## 次の推奨（Try）

詳細はリポジトリの `docs/roadmap.md`。

1. **自動テストを CI/CD に組み込む**（単体 → API → テスト成功後にデプロイ）
2. **ビンゴ／クイズ結果を KV に保存し、管理者が一覧できる**（通知はその次）
3. 公開前チェックリストの習慣化
4. プレビューブランチでの確認（`docs/preview-environment.md`）
