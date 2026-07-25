/**
 * Cloudflare Web Analytics（静的ページ・余興アプリ用）
 *
 * 使い方:
 * 1. Cloudflare Dashboard → Web Analytics でサイトを追加し token を取得
 * 2. 下の TOKEN にその値を入れる（空のままだと何もしない）
 * 3. LP 側は NEXT_PUBLIC_CF_BEACON_TOKEN に同じ値を設定（docs/ops/analytics.md）
 */
(function () {
  var TOKEN = "";

  if (!TOKEN) return;

  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: TOKEN }));
  document.head.appendChild(s);
})();
