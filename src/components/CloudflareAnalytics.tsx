/**
 * Cloudflare Web Analytics（LP 用）。
 * トークン未設定時は何も描画しない。
 */
import { cfBeaconToken } from "@/config/site";

export function CloudflareAnalytics() {
  if (!cfBeaconToken) return null;

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: cfBeaconToken })}
    />
  );
}
