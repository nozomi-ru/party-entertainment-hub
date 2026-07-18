/**
 * URL に設定データを埋め込むための薄いラッパー。
 * 依存: LZString（lz-string）。各 HTML で先に読み込んでください。
 */
(function (global) {
  "use strict";

  function pack(data) {
    if (typeof LZString === "undefined") {
      throw new Error("LZString is required");
    }
    return LZString.compressToEncodedURIComponent(JSON.stringify(data));
  }

  function unpack(encoded) {
    if (!encoded || typeof LZString === "undefined") return null;
    try {
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (json == null || json === "") return null;
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function readFromLocation() {
    const params = new URLSearchParams(location.search);
    let encoded = params.get("c");
    if (!encoded && location.hash) {
      const hash = location.hash.replace(/^#/, "");
      if (hash.startsWith("c=")) {
        encoded = decodeURIComponent(hash.slice(2));
      } else {
        encoded = new URLSearchParams(hash).get("c");
      }
    }
    return unpack(encoded);
  }

  function buildShareUrl(data) {
    const encoded = pack(data);
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("c", encoded);
    return url.toString();
  }

  async function copyShareUrl(data) {
    const shareUrl = buildShareUrl(data);
    try {
      await navigator.clipboard.writeText(shareUrl);
      return { ok: true, url: shareUrl, length: shareUrl.length };
    } catch {
      return { ok: false, url: shareUrl, length: shareUrl.length };
    }
  }

  global.UrlPack = { pack, unpack, readFromLocation, buildShareUrl, copyShareUrl };
})(typeof window !== "undefined" ? window : globalThis);
