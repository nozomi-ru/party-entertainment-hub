import type { PollQuestion } from "@/lib/poll-store";

/** ルームコードを大文字英数字4文字に正規化（足りなければ短い文字列のまま） */
export function normalizeRoom(room: string): string {
  return room.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

/** 質問構成と票配列の長さを揃え、不正値を落とす */
export function normalizeVotes(
  questions: PollQuestion[],
  votes?: number[][],
): number[][] {
  return questions.map((q, qi) => {
    const row = votes?.[qi];
    if (!row || row.length !== q.choices.length) {
      return Array(q.choices.length).fill(0);
    }
    return row.map((n) => {
      const v = Number(n);
      return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
    });
  });
}
