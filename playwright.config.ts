import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

/**
 * ガーキン（.feature）→ Playwright テスト生成。
 * 動画は test-results/ に webm で残る（HTML レポートからも再生可能）。
 */
const testDir = defineBddConfig({
  features: "e2e/features/**/*.feature",
  steps: ["e2e/fixtures.ts", "e2e/steps/**/*.ts"],
});

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3100";
const useExternalServer = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  outputDir: "test-results",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    locale: "ja-JP",
    // 常に動画を残す（結果確認用）
    video: "on",
    screenshot: "on",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: useExternalServer
    ? undefined
    : {
        // 開発中の :3000 とぶつからないよう E2E 専用ポート
        command: "npx next dev --port 3100",
        url: "http://127.0.0.1:3100",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
