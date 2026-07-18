import { test as base, createBdd } from "playwright-bdd";

/** シナリオ間で共有する最小の状態 */
export type E2EWorld = {
  room: string;
  guestUrl: string;
  shareUrl: string;
  marker: string;
  /** Guest 投票済みを Then で再確認するためのフラグ */
  guestVotedOk: boolean;
  /** クイズ共有後に問題文を確認したか */
  quizMarkerOk: boolean;
};

export const test = base.extend<{ world: E2EWorld }>({
  world: async ({}, use) => {
    await use({
      room: "",
      guestUrl: "",
      shareUrl: "",
      marker: "",
      guestVotedOk: false,
      quizMarkerOk: false,
    });
  },
});

export const { Given, When, Then } = createBdd(test);
