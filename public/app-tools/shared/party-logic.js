/**
 * ことほぎ 余興アプリ共通の「純粋ロジック」。
 * ブラウザでは <script src="../shared/party-logic.js"> で window.PartyLogic として使い、
 * Node（Vitest）では import して単体テストする（UMD 風の両対応）。
 *
 * ここには DOM を触らない・乱数の種を外から渡せる関数だけを置く（テストしやすさのため）。
 */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.PartyLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /**
   * 種から決定的な擬似乱数生成器を作る（mulberry32）。
   * 種を固定するとテストで再現できる。0〜1 未満の数を返す関数。
   */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** rng 未指定時は Math.random を使う */
  function ensureRng(rng) {
    return typeof rng === "function" ? rng : Math.random;
  }

  /**
   * Fisher–Yates で新しい配列を返す（元配列は壊さない）。
   */
  function shuffle(array, rng) {
    const r = ensureRng(rng);
    const out = array.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  /**
   * 配列から1つランダムに選び、選ばれた値と残りを返す。
   * 空配列なら { value: null, rest: [] }。
   */
  function drawOne(pool, rng) {
    if (!Array.isArray(pool) || pool.length === 0) {
      return { value: null, rest: [] };
    }
    const r = ensureRng(rng);
    const idx = Math.floor(r() * pool.length);
    const rest = pool.slice();
    const value = rest.splice(idx, 1)[0];
    return { value, rest };
  }

  /**
   * drawOne と同じだが、previous と同じ値を避けて選ぶ。
   * 「同じお題が2回続く」ような、ランダムでも体験として困る結果を防ぐ。
   * previous 以外に候補が無いときだけ previous を返す。
   */
  function drawDifferent(pool, previous, rng) {
    if (!Array.isArray(pool) || pool.length === 0) {
      return { value: null, rest: [] };
    }
    const candidates = pool.filter((item) => item !== previous);
    if (candidates.length === 0) return drawOne(pool, rng);
    const { value } = drawOne(candidates, rng);
    const rest = pool.slice();
    rest.splice(rest.indexOf(value), 1);
    return { value, rest };
  }

  /**
   * items を groupCount 個のグループへ、できるだけ均等にランダム配分する。
   * 余りは先頭グループから1人ずつ多くなる。
   */
  function splitIntoGroups(items, groupCount, rng) {
    const n = Array.isArray(items) ? items.length : 0;
    const count = Math.max(1, Math.floor(groupCount) || 1);
    const groups = Array.from({ length: count }, () => []);
    if (n === 0) return groups;
    const shuffled = shuffle(items, rng);
    shuffled.forEach((item, i) => {
      groups[i % count].push(item);
    });
    return groups;
  }

  /**
   * items を「1グループ最大 size 人」で分ける。切り上げでグループ数が決まる。
   */
  function splitBySize(items, size, rng) {
    const n = Array.isArray(items) ? items.length : 0;
    const per = Math.max(1, Math.floor(size) || 1);
    if (n === 0) return [];
    const shuffled = shuffle(items, rng);
    const groups = [];
    for (let i = 0; i < shuffled.length; i += per) {
      groups.push(shuffled.slice(i, i + per));
    }
    return groups;
  }

  /**
   * ビンゴ数字抽選機の全数字。
   * - bingoNumbers() → 1〜75
   * - bingoNumbers(50) → 1〜50（従来互換）
   * - bingoNumbers(10, 40) → 10〜40
   */
  function bingoNumbers(minOrMax, maybeMax) {
    let min = 1;
    let max = 75;
    if (maybeMax != null) {
      min = Math.floor(Number(minOrMax));
      max = Math.floor(Number(maybeMax));
    } else if (minOrMax != null) {
      max = Math.floor(Number(minOrMax));
    }
    if (!Number.isFinite(min)) min = 1;
    if (!Number.isFinite(max)) max = 75;
    min = Math.max(1, Math.min(min, 9999));
    max = Math.max(min, Math.min(max, 9999));
    const list = [];
    for (let i = min; i <= max; i++) list.push(i);
    return list;
  }

  /**
   * ビンゴのアルファベット列（B I N G O）を数字から求める。1〜75 前提。
   */
  function bingoLetter(num) {
    if (num >= 1 && num <= 15) return "B";
    if (num <= 30) return "I";
    if (num <= 45) return "N";
    if (num <= 60) return "G";
    if (num <= 75) return "O";
    return "";
  }

  /**
   * 割り勘計算。total を people で割り、unit（例: 100円）単位で切り上げる。
   * 端数を負担する人数 extraCount と、通常額 base・多く払う額 baseUp を返す。
   */
  function splitBill(total, people, unit) {
    const sum = Math.max(0, Math.floor(total) || 0);
    const n = Math.max(1, Math.floor(people) || 1);
    const u = Math.max(1, Math.floor(unit) || 1);

    const exact = sum / n;
    const baseUp = Math.ceil(exact / u) * u; // 切り上げた1人あたり
    const collected = baseUp * n;
    const overflow = collected - sum; // 余分に集まる額
    const cheaperCount = Math.floor(overflow / u); // 1段安くできる人数
    const base = baseUp - u >= 0 ? baseUp - u : 0;

    const payingUp = n - cheaperCount; // baseUp を払う人数
    const perPerson = [];
    for (let i = 0; i < n; i++) {
      perPerson.push(i < payingUp ? baseUp : base);
    }
    const totalCollected = perPerson.reduce((a, b) => a + b, 0);
    return {
      total: sum,
      people: n,
      unit: u,
      base, // 少なく払う人の額
      baseUp, // 多く払う人の額
      cheaperCount, // base を払う人数
      payingUp, // baseUp を払う人数
      perPerson, // 各人の支払い（多い人が先頭）
      totalCollected, // 実際に集まる合計（total 以上）
      change: totalCollected - sum, // 余り（幹事のプールなど）
    };
  }

  /**
   * あみだくじの横線をランダム生成する。
   * width: 縦線の本数, height: 段数。返り値は [{ level, col }]（col と col+1 をつなぐ）。
   * 同じ段で隣り合う線が重ならないようにする。
   */
  function generateLadder(width, height, rng) {
    const w = Math.max(2, Math.floor(width) || 2);
    const h = Math.max(1, Math.floor(height) || 1);
    const r = ensureRng(rng);
    const rungs = [];
    for (let level = 0; level < h; level++) {
      let col = 0;
      while (col < w - 1) {
        if (r() < 0.5) {
          rungs.push({ level, col });
          col += 2; // 隣接する線を避ける
        } else {
          col += 1;
        }
      }
    }
    return rungs;
  }

  /**
   * あみだくじを解く。width 本の縦線に対し、上の位置 i が下のどの位置に着くかの配列を返す。
   * result[i] = j は「上の i 番目 → 下の j 番目」。
   */
  function resolveLadder(width, rungs) {
    const w = Math.max(2, Math.floor(width) || 2);
    const list = Array.isArray(rungs) ? rungs.slice() : [];
    list.sort((a, b) => a.level - b.level || a.col - b.col);
    const pos = [];
    for (let i = 0; i < w; i++) pos.push(i);
    // 各縦線の現在位置を追跡: line[i] は「上から i 番目の線」がいまいる列
    const line = pos.slice();
    // 列 -> 線 の逆引き
    const colToLine = pos.slice();
    for (const rung of list) {
      const c = rung.col;
      if (c < 0 || c >= w - 1) continue;
      const a = colToLine[c];
      const b = colToLine[c + 1];
      colToLine[c] = b;
      colToLine[c + 1] = a;
      line[a] = c + 1;
      line[b] = c;
    }
    // line[i] = 最終列。result[i] = line[i]
    return line;
  }

  /**
   * 王様ゲーム: count 人に 1..count の番号をランダム配分し、王様の番号を決める。
   * numbers[i] は「席 i の人が引いた番号」。king はその番号（1..count）。
   */
  function kingGame(count, rng) {
    const n = Math.max(2, Math.floor(count) || 2);
    const nums = [];
    for (let i = 1; i <= n; i++) nums.push(i);
    const numbers = shuffle(nums, rng);
    const r = ensureRng(rng);
    const king = Math.floor(r() * n) + 1;
    return { numbers, king };
  }

  /**
   * 得点配列から順位（1始まり）を求める。同点は同じ順位で、その分だけ次が飛ぶ
   * （10, 10, 5 なら 1, 1, 3）。得点板の表示に使う。
   */
  function rankScores(scores) {
    const list = (Array.isArray(scores) ? scores : []).map(
      (s) => Number(s) || 0,
    );
    return list.map((score) => list.filter((other) => other > score).length + 1);
  }

  /**
   * 均等配分の検証などに使う: グループの人数配列。
   */
  function groupSizes(groups) {
    return groups.map((g) => g.length);
  }

  /**
   * テキストを trim して最大長に切り詰める（寄せ書き・お題など共通）。
   */
  function clampText(text, maxLen) {
    const max = Math.max(0, Math.floor(maxLen) || 0);
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);
  }

  /**
   * カテゴリでカード／お題を絞り込む。category が空 or "all" なら全部。
   */
  function filterByCategory(items, category) {
    const list = Array.isArray(items) ? items : [];
    if (!category || category === "all") return list.slice();
    return list.filter((item) => item && item.category === category);
  }

  /**
   * フォトミッションなどの進捗。percent は 0〜100 の整数。
   */
  function missionProgress(doneCount, total) {
    const t = Math.max(0, Math.floor(Number(total)) || 0);
    const d = Math.max(0, Math.min(t, Math.floor(Number(doneCount)) || 0));
    return {
      done: d,
      total: t,
      remaining: t - d,
      percent: t === 0 ? 0 : Math.round((d / t) * 100),
    };
  }

  /**
   * 寄せ書きメッセージをコピー用テキストに整形する。
   */
  function formatWishExport(messages) {
    const list = Array.isArray(messages) ? messages : [];
    return list
      .map((m, i) => {
        const name = m && m.name != null ? String(m.name) : "";
        const text = m && m.text != null ? String(m.text) : "";
        return `${i + 1}. ${name}\n${text}`;
      })
      .join("\n\n");
  }

  return {
    mulberry32,
    shuffle,
    drawOne,
    drawDifferent,
    rankScores,
    splitIntoGroups,
    splitBySize,
    bingoNumbers,
    bingoLetter,
    splitBill,
    generateLadder,
    resolveLadder,
    kingGame,
    groupSizes,
    clampText,
    filterByCategory,
    missionProgress,
    formatWishExport,
  };
});
