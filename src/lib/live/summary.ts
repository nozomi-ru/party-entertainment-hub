import type { LiveAction, LiveState } from "@/lib/live/types";

/** アクション一覧から画面用サマリーを純関数で組み立てる（UT-LIVE-*） */

export function summarizeBuzz(actions: LiveAction[], round: number) {
  const buzzes = actions
    .filter((a) => a.kind === "buzz" && a.payload.round === round)
    .sort((a, b) => a.at - b.at);
  const winner = buzzes[0] ?? null;
  return {
    buzzCount: buzzes.length,
    winner: winner
      ? { guestId: winner.guestId, name: winner.name ?? "ゲスト", at: winner.at }
      : null,
    order: buzzes.slice(0, 10).map((b, i) => ({
      rank: i + 1,
      guestId: b.guestId,
      name: b.name ?? "ゲスト",
      at: b.at,
    })),
  };
}

export function summarizeEither(actions: LiveAction[]) {
  let left = 0;
  let right = 0;
  const seen = new Set<string>();
  for (const a of actions) {
    if (a.kind !== "vote") continue;
    if (seen.has(a.guestId)) continue;
    seen.add(a.guestId);
    if (a.payload.side === "left") left += 1;
    if (a.payload.side === "right") right += 1;
  }
  const total = left + right;
  return {
    left,
    right,
    total,
    leftPct: total ? Math.round((left / total) * 100) : 0,
    rightPct: total ? Math.round((right / total) * 100) : 0,
  };
}

export function summarizeDress(actions: LiveAction[], correctIndex: number | null) {
  const votes = new Map<string, { guestId: string; name: string; colorIndex: number }>();
  for (const a of actions) {
    if (a.kind !== "color") continue;
    votes.set(a.guestId, {
      guestId: a.guestId,
      name: a.name ?? "ゲスト",
      colorIndex: Number(a.payload.colorIndex),
    });
  }
  const list = [...votes.values()];
  const winners =
    correctIndex == null
      ? []
      : list.filter((v) => v.colorIndex === correctIndex);
  const counts: Record<number, number> = {};
  for (const v of list) {
    counts[v.colorIndex] = (counts[v.colorIndex] ?? 0) + 1;
  }
  return { voteCount: list.length, counts, winners };
}

export function summarizeTreasure(
  actions: LiveAction[],
  spots: { id: string; points: number }[],
) {
  const spotMap = new Map(spots.map((s) => [s.id, s.points]));
  const scores = new Map<string, { guestId: string; name: string; points: number; spots: string[] }>();
  for (const a of actions) {
    if (a.kind !== "spot") continue;
    const spotId = String(a.payload.spotId ?? "");
    const pts = spotMap.get(spotId) ?? 0;
    const cur = scores.get(a.guestId) ?? {
      guestId: a.guestId,
      name: a.name ?? "ゲスト",
      points: 0,
      spots: [] as string[],
    };
    if (!cur.spots.includes(spotId)) {
      cur.spots.push(spotId);
      cur.points += pts;
      if (a.name) cur.name = a.name;
    }
    scores.set(a.guestId, cur);
  }
  const ranking = [...scores.values()].sort((a, b) => b.points - a.points);
  return { ranking };
}

export function summarizeGrade(
  actions: LiveAction[],
  questions: { answerIndex: number }[],
) {
  const byGuest = new Map<
    string,
    { guestId: string; name: string; answers: Record<number, number> }
  >();
  for (const a of actions) {
    if (a.kind !== "answer") continue;
    const qi = Number(a.payload.questionIndex);
    const choice = Number(a.payload.choiceIndex);
    const cur = byGuest.get(a.guestId) ?? {
      guestId: a.guestId,
      name: a.name ?? "ゲスト",
      answers: {},
    };
    cur.answers[qi] = choice;
    if (a.name) cur.name = a.name;
    byGuest.set(a.guestId, cur);
  }
  const ranking = [...byGuest.values()]
    .map((g) => {
      let correct = 0;
      questions.forEach((q, i) => {
        if (g.answers[i] === q.answerIndex) correct += 1;
      });
      const total = questions.length;
      const rate = total ? correct / total : 0;
      const rankLabel =
        rate >= 1 ? "S" : rate >= 0.7 ? "A" : rate >= 0.4 ? "B" : "C";
      return {
        guestId: g.guestId,
        name: g.name,
        correct,
        total,
        rate,
        rankLabel,
      };
    })
    .sort((a, b) => b.correct - a.correct || a.name.localeCompare(b.name));
  return { ranking };
}

export function summarizeRequest(actions: LiveAction[]) {
  const posts = new Map<
    string,
    { id: string; text: string; guestId: string; name: string; at: number; likes: number }
  >();
  for (const a of actions) {
    if (a.kind === "post") {
      posts.set(a.id, {
        id: a.id,
        text: String(a.payload.text ?? ""),
        guestId: a.guestId,
        name: a.name ?? "ゲスト",
        at: a.at,
        likes: 0,
      });
    }
  }
  for (const a of actions) {
    if (a.kind !== "like") continue;
    const postId = String(a.payload.postId ?? "");
    const post = posts.get(postId);
    if (post) post.likes += 1;
  }
  const ranking = [...posts.values()].sort(
    (a, b) => b.likes - a.likes || a.at - b.at,
  );
  return { ranking };
}

export function summarizeGraph(
  actions: LiveAction[],
  bride: string,
  groom: string,
) {
  const nodes = new Map<string, { id: string; name: string; group: string }>();
  nodes.set("bride", { id: "bride", name: bride, group: "couple" });
  nodes.set("groom", { id: "groom", name: groom, group: "couple" });
  const links: { source: string; target: string; label: string }[] = [];
  links.push({ source: "bride", target: "groom", label: "夫婦" });

  for (const a of actions) {
    if (a.kind !== "link") continue;
    const name = String(a.payload.name ?? a.name ?? "ゲスト").slice(0, 20);
    const target = a.payload.target === "bride" ? "bride" : "groom";
    const relation = String(a.payload.relation ?? "友人").slice(0, 20);
    const nodeId = `g:${a.guestId}`;
    nodes.set(nodeId, { id: nodeId, name, group: "guest" });
    links.push({ source: nodeId, target, label: relation });
  }
  return { nodes: [...nodes.values()], links };
}

export function summarizeLive(state: LiveState, actions: LiveAction[]) {
  switch (state.game) {
    case "buzz":
      return summarizeBuzz(actions, state.round);
    case "digibingo":
      return { drawn: state.drawn, drawnCount: state.drawn.length };
    case "either":
      return summarizeEither(actions);
    case "dress":
      return summarizeDress(actions, state.correctIndex);
    case "treasure":
      return summarizeTreasure(actions, state.spots);
    case "grade":
      return summarizeGrade(actions, state.questions);
    case "request":
      return summarizeRequest(actions);
    case "graph":
      return summarizeGraph(actions, state.bride, state.groom);
  }
}

/** 5×5 ビンゴカード（中央 FREE）。guestId から決定的生成 */
export function buildBingoCard(guestId: string, max = 75): number[] {
  let seed = 0;
  for (let i = 0; i < guestId.length; i++) seed = (seed * 31 + guestId.charCodeAt(i)) >>> 0;
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const nums = pool.slice(0, 24);
  const card: number[] = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) card.push(0);
    else card.push(nums.pop()!);
  }
  return card;
}

export function countBingoLines(card: number[], drawn: number[]): number {
  const set = new Set(drawn);
  const marked = card.map((n, i) => i === 12 || (n > 0 && set.has(n)));
  const lines = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];
  return lines.filter((line) => line.every((i) => marked[i])).length;
}
