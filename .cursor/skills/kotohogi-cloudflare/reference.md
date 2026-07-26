# Kotohogi — Agent 用リファレンス

SKILL.md から必要時のみ読む。  
**リポジトリ構成・API・データモデルの正は [docs/design.md](../../../docs/design.md)。**  
**余興・ライブの見た目の正は [docs/ui-design.md](../../../docs/ui-design.md)。**  
ここでは Agent 向けの短い補足だけ置く。

## すぐ使うパス

| 用途 | パス |
|------|------|
| LP + API | `src/app/` |
| リンク・文言 | `src/config/site.ts` |
| ルーム／票の正規化 | `src/lib/poll.ts` |
| KV / メモリ | `src/lib/poll-store.ts` |
| 余興 HTML | `public/app-tools/` |
| 余興共通スタイル（紙×金） | `public/app-tools/shared/app.css` |
| UI デザイン正本 | `docs/ui-design.md` |
| Next 紙×金フレーム例 | `src/components/dress/DressFrame.tsx` |
| UrlPack | `public/app-tools/shared/pack.js` |
| Worker / KV | `wrangler.jsonc` |
| シナリオ E2E | `e2e/` |
| スモーク | `scripts/smoke.mjs` |

Git に含めない: `node_modules/`, `.next/`, `.open-next/`, `.wrangler/`, `.dev.vars`, `test-results/`, `playwright-report/`, `.features-gen/`

## 公開の経路（使い分け）

| 経路 | コマンド／動き |
|------|----------------|
| 手元 or GitHub Actions Deploy | `npm run deploy`（OpenNext build + deploy） |
| CF ダッシュボード（本番例） | Build: `npx opennextjs-cloudflare build` → Deploy: `npx wrangler deploy` |
| CF ダッシュボード（非本番例） | Deploy: `npx wrangler versions upload` |
| 品質ゲート | `.github/workflows/quality.yml`（unit + e2e）。Test / Deploy から呼び出し |
| ローカル pre-push | `.husky/pre-push` → `npm test`。`--no-verify` で飛ばさない（ユーザー明示時のみ例外） |
| アクセス分析 | [docs/ops/analytics.md](../../../docs/ops/analytics.md)（CF Web Analytics） |

本番 URL 例: `https://kotohogi.nozoisfun.workers.dev/`（環境により異なる場合あり）  
プレビュー手順: [docs/ops/preview.md](../../../docs/ops/preview.md)

## KPT テンプレ（記事・振り返り用）

```markdown
## 振り返り：KPT

| 用語 | 意味 |
|------|------|
| Keep | 続けたいこと |
| Problem | 課題 |
| Try | 次に試すこと |

### Keep
（表 + 各行の補足）

### Problem
（表 + 各行の補足）

### Try
（Problem への対策として書く）
```

## Qiita mermaid 注意

使ってよい: `flowchart`, `sequenceDiagram`  
避ける: `mindmap`、ノード内 `<br/>`、subgraph への `---` 接続、ラベルの `＋` `/` 全角など壊れやすい記号
