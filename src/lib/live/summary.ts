import type { LiveAction, LiveState } from "@/lib/live/types";

/** アクション一覧から画面用サマリーを純関数で組み立てる（UT-LIVE-*） */

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
    case "grade":
      return summarizeGrade(actions, state.questions);
    case "graph":
      return summarizeGraph(actions, state.bride, state.groom);
  }
}
