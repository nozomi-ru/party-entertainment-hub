/** party-logic.js（UMD）の型宣言。Vitest / TS から import するため。 */

export type Rng = () => number;

export interface Ladder {
  level: number;
  col: number;
}

export interface DrawResult<T> {
  value: T | null;
  rest: T[];
}

export interface BillSplit {
  total: number;
  people: number;
  unit: number;
  base: number;
  baseUp: number;
  cheaperCount: number;
  payingUp: number;
  perPerson: number[];
  totalCollected: number;
  change: number;
}

export interface KingGameResult {
  numbers: number[];
  king: number;
}

export interface PartyLogicApi {
  mulberry32(seed: number): Rng;
  shuffle<T>(array: T[], rng?: Rng): T[];
  drawOne<T>(pool: T[], rng?: Rng): DrawResult<T>;
  drawDifferent<T>(pool: T[], previous: T | null, rng?: Rng): DrawResult<T>;
  rankScores(scores: number[]): number[];
  splitIntoGroups<T>(items: T[], groupCount: number, rng?: Rng): T[][];
  splitBySize<T>(items: T[], size: number, rng?: Rng): T[][];
  bingoNumbers(max?: number): number[];
  bingoLetter(num: number): string;
  splitBill(total: number, people: number, unit: number): BillSplit;
  generateLadder(width: number, height: number, rng?: Rng): Ladder[];
  resolveLadder(width: number, rungs: Ladder[]): number[];
  kingGame(count: number, rng?: Rng): KingGameResult;
  groupSizes<T>(groups: T[][]): number[];
}

declare const PartyLogic: PartyLogicApi;
export default PartyLogic;
