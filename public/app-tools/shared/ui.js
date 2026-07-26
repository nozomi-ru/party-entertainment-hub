/**
 * ことほぎ 余興アプリ共通の「画面まわりの部品」。
 * ブラウザでは <script src="../shared/ui.js"> で window.PartyUI として使い、
 * Node（Vitest）では import して純粋関数だけ単体テストする（party-logic.js と同じ UMD 風）。
 *
 * 乱数やゲームのルールは party-logic.js の担当。ここは
 * 「入力の見せ方・結果の伝え方・会場での操作性」だけを扱う。
 */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.PartyUI = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  /**
   * 参加者名などをそのまま innerHTML に流しても表示が壊れないようにする。
   */
  function escapeHtml(value) {
    if (value == null) return "";
    return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
  }

  /**
   * 複数行テキストを「1行1件」のリストに直す。
   * 前後の空白と空行を落とし、件数と重複（2回目以降に現れた名前）も併せて返す。
   */
  function parseLines(text) {
    const items = String(text == null ? "" : text)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const seen = new Set();
    const duplicates = [];
    for (const item of items) {
      if (seen.has(item)) {
        if (!duplicates.includes(item)) duplicates.push(item);
      } else {
        seen.add(item);
      }
    }
    return { items, count: items.length, duplicates };
  }

  /**
   * 「1. たろう」形式。順番決めの結果をそのまま共有できる形にする。
   */
  function formatNumberedList(items) {
    const list = Array.isArray(items) ? items : [];
    return list.map((item, i) => `${i + 1}. ${item}`).join("\n");
  }

  /**
   * 「【チーム1】(3名) たろう / はなこ / じろう」形式。
   */
  function formatGroups(groups, labelPrefix) {
    const list = Array.isArray(groups) ? groups : [];
    const prefix = labelPrefix || "チーム";
    return list
      .map(
        (members, i) =>
          `【${prefix}${i + 1}】(${members.length}名) ${members.join(" / ")}`,
      )
      .join("\n");
  }

  /**
   * 「たろう → 受付」形式。あみだくじ・割り当て結果の共有に使う。
   */
  function formatPairs(pairs) {
    const list = Array.isArray(pairs) ? pairs : [];
    return list.map(([from, to]) => `${from} → ${to}`).join("\n");
  }

  /**
   * 「3件」「参加者 3名」のような件数ラベル。0 件のときは空文字ではなく明示する。
   */
  function formatCount(count, unit) {
    const n = Math.max(0, Math.floor(Number(count)) || 0);
    const suffix = unit || "件";
    return n === 0 ? `未入力（0${suffix}）` : `${n}${suffix}`;
  }

  /* ------------------------------------------------------------------ *
   * ここから下は DOM を触る。Node から import しても即座には動かないよう、
   * document/navigator の参照は関数の中だけで行う。
   * ------------------------------------------------------------------ */

  function el(target) {
    if (!target) return null;
    if (typeof target === "string") {
      return typeof document === "undefined"
        ? null
        : document.getElementById(target);
    }
    return target;
  }

  /** 端末が「動きを減らす」設定なら true。演出を短縮する判断に使う。 */
  function prefersReducedMotion() {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * 入力の不足をその場に出す（alert を使わない）。
   * message が空なら消す。
   */
  function setError(target, message) {
    const node = el(target);
    if (!node) return;
    node.textContent = message || "";
    node.hidden = !message;
  }

  function clearError(target) {
    setError(target, "");
  }

  /** 補助テキスト（件数・注意）の更新。message が空なら隠す。 */
  function setHint(target, message) {
    const node = el(target);
    if (!node) return;
    node.textContent = message || "";
    node.hidden = !message;
  }

  let toastTimer = null;

  /** 画面下に短く出る通知。操作を止めないフィードバック用。 */
  function toast(message) {
    if (typeof document === "undefined") return;
    let node = document.getElementById("party-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "party-toast";
      node.className = "party-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 2200);
  }

  /**
   * クリップボードへコピーする。Clipboard API が使えない場面（http・古い Safari）では
   * 一時的な textarea + execCommand に落とす。成否を Promise<boolean> で返す。
   */
  function copyText(text) {
    if (typeof document === "undefined") return Promise.resolve(false);
    const value = String(text == null ? "" : text);
    if (!value) return Promise.resolve(false);

    const fallback = () => {
      try {
        const area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(area);
        return ok;
      } catch {
        return false;
      }
    };

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      return navigator.clipboard
        .writeText(value)
        .then(() => true)
        .catch(() => fallback());
    }
    return Promise.resolve(fallback());
  }

  /** コピー＋通知をひとまとめにした、ボタンから直接呼べる版。 */
  function copyWithToast(text, okMessage) {
    return copyText(text).then((ok) => {
      toast(ok ? okMessage || "コピーしました" : "コピーできませんでした");
      return ok;
    });
  }

  /**
   * 抽選機やタイマーを会場の画面に映している間、スリープで暗くならないようにする。
   * Screen Wake Lock 非対応のブラウザでは何もしない（例外も出さない）。
   */
  function createWakeLock() {
    let sentinel = null;
    let wanted = false;

    const supported = () =>
      typeof navigator !== "undefined" && "wakeLock" in navigator;

    async function acquire() {
      if (!wanted || !supported() || sentinel) return;
      try {
        sentinel = await navigator.wakeLock.request("screen");
        sentinel.addEventListener("release", () => {
          sentinel = null;
        });
      } catch {
        sentinel = null;
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") acquire();
      });
    }

    return {
      supported,
      enable() {
        wanted = true;
        acquire();
      },
      disable() {
        wanted = false;
        if (sentinel) {
          try {
            sentinel.release();
          } catch {
            /* 解放できなくても操作は続行する */
          }
          sentinel = null;
        }
      },
    };
  }

  // 自前のキー操作を横取りすると二重に動く要素。
  // 例: ボタンにフォーカスがある状態のスペースは、ボタン自身の実行に任せる。
  const SHORTCUT_SKIP_TAGS = [
    "input",
    "textarea",
    "select",
    "button",
    "a",
    "summary",
  ];

  /**
   * 入力欄やボタン以外にフォーカスがあるときだけ効くショートカット。
   * handlers は { " ": fn, r: fn } のようにキー名（小文字）で渡す。
   */
  function bindShortcuts(handlers) {
    if (typeof document === "undefined") return;
    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const tag = target && target.tagName ? target.tagName.toLowerCase() : "";
      if (SHORTCUT_SKIP_TAGS.includes(tag)) return;
      if (target && target.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const handler = handlers[event.key] || handlers[event.key.toLowerCase()];
      if (!handler) return;
      event.preventDefault();
      handler(event);
    });
  }

  /** フッターの年号。全ツールで同じことを書かないための共通処理。 */
  function initFooterYear(id) {
    const node = el(id || "year");
    if (node) node.textContent = String(new Date().getFullYear());
  }

  const ROOM_TTL_NOTICE =
    "ルームのデータは削除期限を過ぎると自動削除されます。Host は「削除期限を1週間延長」で延ばせます。同じコードのルームは、有効な間は再作成できません。";
  const ROOM_TTL_EXTEND_LABEL = "削除期限を1週間延長";

  function formatExpiresAtJa(expiresAt) {
    const ms = Number(expiresAt);
    if (!Number.isFinite(ms) || ms <= 0) return "";
    try {
      return new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(ms));
    } catch {
      return new Date(ms).toLocaleString("ja-JP");
    }
  }

  /**
   * Host 画面の削除期限表示を更新する。
   * deadlineEl / extendBtn は省略可。expiresAt が無いときは期限行を隠す。
   */
  function updateRoomTtlUi(options) {
    const opts = options || {};
    const noticeEl = typeof opts.noticeEl === "string" ? el(opts.noticeEl) : opts.noticeEl;
    const deadlineEl =
      typeof opts.deadlineEl === "string" ? el(opts.deadlineEl) : opts.deadlineEl;
    const extendBtn =
      typeof opts.extendBtn === "string" ? el(opts.extendBtn) : opts.extendBtn;
    if (noticeEl) noticeEl.textContent = ROOM_TTL_NOTICE;
    const expiresAt = Number(opts.expiresAt);
    const has = Number.isFinite(expiresAt) && expiresAt > 0;
    if (deadlineEl) {
      deadlineEl.hidden = !has;
      if (has) {
        deadlineEl.textContent =
          "削除期限: " + formatExpiresAtJa(expiresAt) + "（日本時間）";
      }
    }
    if (extendBtn) {
      extendBtn.hidden = !has;
      extendBtn.disabled = Boolean(opts.busy) || !has;
      if (!extendBtn.dataset.ttlLabelSet) {
        extendBtn.textContent = ROOM_TTL_EXTEND_LABEL;
        extendBtn.dataset.ttlLabelSet = "1";
      }
    }
  }

  return {
    escapeHtml,
    parseLines,
    formatNumberedList,
    formatGroups,
    formatPairs,
    formatCount,
    prefersReducedMotion,
    setError,
    clearError,
    setHint,
    toast,
    copyText,
    copyWithToast,
    createWakeLock,
    bindShortcuts,
    initFooterYear,
    ROOM_TTL_NOTICE,
    ROOM_TTL_EXTEND_LABEL,
    formatExpiresAtJa,
    updateRoomTtlUi,
  };
});
