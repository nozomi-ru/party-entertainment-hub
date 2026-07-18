# Kotohogi Cloudflare — 詳細リファレンス

SKILL.md から必要時のみ読む。

## リポジトリ地図

```
src/app/                 LP + API
src/components/landing/  LP セクション
src/config/site.ts       リンク・文言の単一設定源
src/lib/poll-store.ts    KV / メモリ永続化
public/app-tools/        ビンゴ・クイズ・アンケート HTML
public/app-tools/shared/pack.js   UrlPack (LZ-String)
docs/                    要件・設計・Qiita（非公開）
wrangler.jsonc           Worker / KV / assets
```

Git に含めない: `node_modules/`, `.next/`, `.open-next/`, `.wrangler/`, `.dev.vars`

## wrangler 要点

- `name`: `kotohogi`
- `main`: `.open-next/worker.js`
- `assets.directory`: `.open-next/assets`
- `compatibility_flags`: `nodejs_compat`, `global_fetch_strictly_public`
- `kv_namespaces[0].binding`: **`POLL_KV`**（コードの `env.POLL_KV` と一致必須）
- KV TTL: 24h（`poll-store.ts`）

## アンケート API

`GET|POST /api/poll/[room]`

- ルーム: 大文字英数字、ちょうど 4 文字
- actions: `upsert` | `vote` | `tally` | `setIndex` | `toggleResults` | `clearVotes`
- upsert 時は票配列を質問構成に正規化する（長さずれ防止）

## Guest URL 形式

```
/app-tools/wedding-poll/index.html?room=XXXX
```

- `?room=` のみ → Guest 自動入室
- `?mode=host` → Host
- Host 未作成時は 1s 間隔で待機

## Cloudflare ダッシュボード連携

1. Workers → Import 既存 GitHub リポ（新規リポ作成にしない）
2. Build: `npx opennextjs-cloudflare build`
3. Deploy（本番）: `npx wrangler deploy`
4. Deploy（非本番）: `npx wrangler versions upload`
5. 非本番ブランチのビルド: オン（`preview` 等で確認）
6. 本番確認: `https://kotohogi.nozoisfun.workers.dev/`（環境により異なる場合あり）

プレビュー手順の詳細: リポジトリの `docs/preview-environment.md`

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
