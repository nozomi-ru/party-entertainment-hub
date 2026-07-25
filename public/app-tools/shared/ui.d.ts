/** ui.js（UMD）の型宣言。Vitest / TS から import するため。 */

export interface ParsedLines {
  items: string[];
  count: number;
  duplicates: string[];
}

export interface WakeLockController {
  supported(): boolean;
  enable(): void;
  disable(): void;
}

export type ShortcutHandlers = Record<string, (event: KeyboardEvent) => void>;

export interface PartyUiApi {
  escapeHtml(value: unknown): string;
  parseLines(text: unknown): ParsedLines;
  formatNumberedList(items: string[]): string;
  formatGroups(groups: string[][], labelPrefix?: string): string;
  formatPairs(pairs: [string, string][]): string;
  formatCount(count: number, unit?: string): string;
  prefersReducedMotion(): boolean;
  setError(target: string | HTMLElement, message: string): void;
  clearError(target: string | HTMLElement): void;
  setHint(target: string | HTMLElement, message: string): void;
  toast(message: string): void;
  copyText(text: string): Promise<boolean>;
  copyWithToast(text: string, okMessage?: string): Promise<boolean>;
  createWakeLock(): WakeLockController;
  bindShortcuts(handlers: ShortcutHandlers): void;
  initFooterYear(id?: string): void;
}

declare const PartyUI: PartyUiApi;
export default PartyUI;
