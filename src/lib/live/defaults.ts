import type { LiveGameId } from "@/lib/live/catalog";
import type { LiveState } from "@/lib/live/types";

export function createDefaultState(game: LiveGameId, room: string): LiveState {
  const updatedAt = Date.now();
  switch (game) {
    case "buzz":
      return {
        game,
        room,
        phase: "lobby",
        question: "新郎の趣味は？",
        answer: "釣り",
        round: 1,
        updatedAt,
      };
    case "digibingo":
      return {
        game,
        room,
        phase: "lobby",
        drawn: [],
        max: 75,
        updatedAt,
      };
    case "either":
      return {
        game,
        room,
        phase: "lobby",
        question: "どっちが好き？",
        left: "甘いもの",
        right: "しょっぱいもの",
        updatedAt,
      };
    case "dress":
      return {
        game,
        room,
        phase: "lobby",
        colors: ["アイボリー", "シャンパン", "ローズ", "ネイビー"],
        correctIndex: null,
        updatedAt,
      };
    case "treasure":
      return {
        game,
        room,
        phase: "lobby",
        spots: [
          { id: "A", label: "受付", points: 10 },
          { id: "B", label: "高砂", points: 20 },
          { id: "C", label: "ケーキ", points: 15 },
        ],
        updatedAt,
      };
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
    case "request":
      return {
        game,
        room,
        phase: "open",
        title: "やってほしいこと",
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
