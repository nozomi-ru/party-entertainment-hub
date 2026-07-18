/**
 * Cloudflare 非本番（または手元）向けの最小スモーク。
 * 使い方: SMOKE_BASE_URL=https://<preview-host> npm run smoke
 *
 * - 本番 URL を渡さないこと
 * - 本番 KV を汚しにくくするためルームは T 始まり（例: T9A1）
 */
const base = (process.env.SMOKE_BASE_URL || "").replace(/\/$/, "");

if (!base) {
  console.error(
    "SMOKE_BASE_URL が未設定です。Cloudflare 非本番の URL を指定してください。\n" +
      "例: SMOKE_BASE_URL=https://xxxx.workers.dev npm run smoke",
  );
  process.exit(1);
}

const room = `T${Math.random().toString(36).slice(2, 5).toUpperCase()}`.slice(
  0,
  4,
);
const pollUrl = `${base}/api/poll/${room}`;

async function main() {
  console.log(`smoke base=${base} room=${room}`);

  const home = await fetch(base);
  if (!home.ok) {
    throw new Error(`LP GET failed: ${home.status}`);
  }

  const upsert = await fetch(pollUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      action: "upsert",
      questions: [{ q: "smoke?", choices: ["yes", "no"] }],
      index: 0,
      showResults: false,
    }),
  });
  if (!upsert.ok) {
    throw new Error(`upsert failed: ${upsert.status} ${await upsert.text()}`);
  }

  const vote = await fetch(pollUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      action: "vote",
      questionIndex: 0,
      choiceIndex: 0,
    }),
  });
  if (!vote.ok) {
    throw new Error(`vote failed: ${vote.status} ${await vote.text()}`);
  }
  const voted = await vote.json();
  if (voted.votes?.[0]?.[0] !== 1) {
    throw new Error(`unexpected votes: ${JSON.stringify(voted.votes)}`);
  }

  const got = await fetch(pollUrl);
  if (!got.ok) {
    throw new Error(`GET failed: ${got.status}`);
  }

  console.log("smoke ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
