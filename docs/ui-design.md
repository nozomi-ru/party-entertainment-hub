# ことほぎ — UI デザイン（紙×金）

| 項目 | 内容 |
|------|------|
| プロダクト名 | ことほぎ（Kotohogi） |
| この文書の役割 | **余興アプリ／ライブ画面の見た目の正本**（トークン・レイアウト・禁止事項） |
| アーキテクチャの正 | [design.md](./design.md) |
| 最終更新 | 2026-07-26 |

関連: [docs 目次](./README.md) · [要件](./requirements.md) · [設計](./design.md)

---

## 0. この文書の読み方

新しい余興・ライブ画面を作るとき、**ユーザーがデザインを細かく指定しなくても**、この文書どおりに実装する。

| 画面の種類 | 適用するデザイン | 実装の足場 |
|------------|------------------|------------|
| 静的余興（`public/app-tools/`） | **紙×金（本文書）** | `shared/app.css` |
| Next.js のゲスト／司会画面（例: ドレス色当て） | **紙×金（本文書）** | `DressFrame` / `.dress-*`（`globals.css`）または同等 |
| LP（ランディング） | **別トーン**（cool paper / ink / champagne） | `src/components/landing/` · skill の LP 節 |
| 会場プロジェクター全面演出 | 紙×金の上に全画面オーバーレイ可 | ペンライト／ストロボ等 |

**デフォルトは紙×金。** ユーザーが「LP 風に」「ダークに」など明示したときだけ別トーンにする。

---

## 0.1 関係資材マップ

| 領域 | パス |
|------|------|
| 静的余興の共通 CSS（正の実装） | `public/app-tools/shared/app.css` |
| 共通 UI 部品 | `public/app-tools/shared/ui.js` |
| 参照実装（見た目の手本） | `public/app-tools/wedding-bingo/index.html` |
| Next 側の紙×金フレーム | `src/components/dress/DressFrame.tsx` |
| Next 側の紙×金クラス | `src/app/globals.css`（`.dress-*`） |
| LP トーン | `src/app/globals.css` の `--ink` / `--paper` / `--champagne*` |

---

## 1. トーン（一言）

結婚式・二次会の紙のプログラムのような **落ち着いた紙色＋金の差し色＋セリフ書体**。  
紫グラデ・ネオン・ガラスモーフィズム・ダッシュボード感は使わない。

---

## 2. カラー・トークン

実装では必ず CSS 変数名を使う（ハードコード色の散在を避ける）。

| トークン | 値 | 用途 |
|----------|-----|------|
| `--color-bg` | `#fcfbf9` | ページ背景 |
| `--color-surface` | `#ffffff` | カード面 |
| `--color-text` | `#1a1a1a` | 本文・見出し |
| `--color-text-light` | `#4a4a4a` | 補足・リード |
| `--color-gold` | `#b4975a` | アクセント・オーナメント・強調数字 |
| `--color-gold-soft` | `#ede4d2` | 淡い金の面 |
| `--color-border` | `#dcd7d0` | 枠線 |
| `--color-panel` | `#f8f7f5` または `#faf9f7` | 入力欄・内側パネル |
| 内側二重枠 | `#ebe7e0` | カード `::before` の線 |
| `--shadow-card` | `0 10px 30px rgba(0,0,0,0.05)` | カード影 |
| `--radius` | `4px` | 角（大きく丸めない） |

選択中・フォーカスは金（`outline: 2px solid var(--color-gold)`）。エラー文字は落ち着いた赤（例: `#a33`）で十分。派手な赤グラデは不要。

---

## 3. タイポグラフィ

| 役割 | フォント | 使い方 |
|------|----------|--------|
| 欧文タイトル | **Playfair Display** | `h1`・ブランド・英字サブタイトル。`uppercase` + 字間広め |
| 本文・日本語 | **Noto Serif JP**（フォールバック: 游明朝 / Yu Mincho） | 説明・ボタン・ラベル |
| 英字サブ | Playfair Display *italic* | 金色の短いサブタイトル（例: `Color Guess`） |

静的 HTML では Google Fonts を `<link>`。Next の紙×金画面でも同様（ドレスは `src/app/dress/layout.tsx`）。

**使わない:** Inter / Roboto / system-ui だけの余興画面、ゴシックのみの重い UI。

---

## 4. レイアウト骨格（必須）

1. **ページ背景** `--color-bg`、中央寄せ、上下余白あり  
2. **ナビ**（任意だが推奨）: 左にブランド（Playfair・金・uppercase）、右に「ツール一覧」など薄いリンク。最大幅はカードに合わせる（約 480–520px）  
3. **メインカード**  
   - 白地・`border: 1px solid var(--color-border)`・柔らかい影  
   - **二重枠**: 外側ボーダー + `::before` で inset 6px の薄い線  
   - パディングおおよそ `3em 1.5em 2em`、中央揃え  
4. **オーナメント**（カード先頭）  
   - 左右に金の短い水平線 + 中央に小さなダイヤ SVG（金 fill）  
5. **タイトル** Playfair の英字（例: `BINGO` / `DRESS`）  
6. **サブタイトル** 金・italic（任意）  
7. **リード** 日本語の一文（`--color-text-light`）  
8. **本体** その下に操作 UI

参照クラス（静的）: `.card` / `.ornament` / `h1.app-title` / `.app-subtitle` / `.app-lead` / `.app-nav`  
参照クラス（Next ドレス）: `.dress-app` / `.dress-card` / `.dress-ornament` / `.dress-title` / `.dress-subtitle` / `.dress-lead` / `.dress-nav`

---

## 5. 部品ルール

| 部品 | ルール |
|------|--------|
| 主ボタン | 塗りつぶし `#1a1a1a`、白文字、最小高さ 44px、角はほぼ直角〜4px |
| 副ボタン | 白地 + `--color-border` |
| 金ボタン | 背景 `--color-gold`（結果発表など特別操作） |
| 入力 | 左揃えラベル（小さめ・やや太字）、面は `--color-panel`、枠は `--color-border` |
| 選択肢カード | 白地・細い枠。選択中は金枠 + 薄い金の影（黒の太いリングは避ける） |
| モーダル／ノート | `app.css` の使い方ノート・モーダルに合わせる |
| アイコン | 線画・シルエット寄り。絵文字の羅列やカラーアイコンのダッシュボード感は避ける |

---

## 6. モーション

- 控えめに。選択の軽い上下、得票数の短いスケール程度  
- 会場演出（ストロボ・ペンライト全面）はフルスクリーンオーバーレイで紙カードの外に出してよい  
- `prefers-reduced-motion: reduce` では激しい点滅を止める（ドレスの `.dress-strobe` と同様）

---

## 7. やること / やらないこと

**やる**

- 新規余興・ライブ Guest/Admin/Screen は紙×金を既定にする  
- 静的なら `shared/app.css` を読み、固有 CSS だけ足す  
- Next なら既存の `DressFrame` / `.dress-*` を流用するか、同じトークンで同等フレームを作る  
- 手本は `wedding-bingo` の見た目

**やらない**

- ユーザー未指定なのに LP の ink/champagne トーンやダーク全面 UI を余興の既定にする  
- 紫〜インディゴグラデ、ネオン、ガラス、大きな角丸ピルの群れ  
- カードなしのフラットだけの余興（枠とオーナメントがブランド信号）  
- ヒーローにバッジ／ステッカーを重ねる（LP ルールとも共通）

---

## 8. Agent 向けチェックリスト（新規画面）

```
- [ ] 紙背景 + 白カード + 二重枠 + 金オーナメント
- [ ] Playfair（英字タイトル）+ Noto Serif JP（本文）
- [ ] 色はトークン表どおり（金 #b4975a）
- [ ] 静的 → app.css / Next → DressFrame 相当
- [ ] 主操作は 44px 以上、focus-visible あり
- [ ] 派手な AI 定番見た目を避けた
```

見た目の方針を変えるときは **この文書を先に更新**し、`app.css` / `.dress-*` / 参照実装を揃える。
