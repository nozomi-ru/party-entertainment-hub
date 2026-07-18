# Cloudflare Workers 用の環境型（`npm run cf-typegen` で再生成可）
interface CloudflareEnv {
  POLL_KV: KVNamespace;
  ASSETS: Fetcher;
  WORKER_SELF_REFERENCE: Fetcher;
}
