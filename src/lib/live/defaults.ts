import type { LiveGameId } from "@/lib/live/catalog";
import type { LiveState } from "@/lib/live/types";

export function createDefaultState(game: LiveGameId, room: string): LiveState {
  const updatedAt = Date.now();
  switch (game) {
    case "grade":
      return {
        game,
        room,
        phase: "lobby",
        questions: [
          {
            q: "出会った季節は？",
            choices: ["春", "夏", "秋", "冬"],
            answerIndex: 0,
          },
          {
            q: "デートの定番は？",
            choices: ["映画", "カフェ", "散歩", "旅行"],
            answerIndex: 1,
          },
          {
            q: "二人の合言葉は？",
            choices: ["がんばろう", "大好き", "ありがとう", "おやすみ"],
            answerIndex: 2,
          },
        ],
        index: 0,
        updatedAt,
      };
    case "graph":
      return {
        game,
        room,
        phase: "collect",
        bride: "新婦",
        groom: "新郎",
        updatedAt,
      };
  }
}
