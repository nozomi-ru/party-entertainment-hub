import { expect, type Page } from "@playwright/test";
import { Given, When, Then } from "../fixtures";

function makeTestRoom(): string {
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `T${suffix}`.slice(0, 4).padEnd(4, "0");
}

async function fillBingoCell(page: Page, cellIndex: number, name: string) {
  await page.locator("#bingo-board .cell").nth(cellIndex).click();
  await expect(page.locator("#name-modal")).toBeVisible();
  await page.locator("#name-input").fill(name);
  await page.locator("#submit-name").click();
  await expect(page.locator("#name-modal")).toBeHidden();
}

function extractShareUrl(raw: string, pageUrl: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/https?:\/\/\S+/);
  const candidate = match?.[0] ?? trimmed;
  const absolute = candidate.includes("://")
    ? candidate
    : new URL(candidate, pageUrl).toString();
  if (!/[?&]c=/.test(absolute)) {
    throw new Error(`共有URLに c= がありません: ${absolute}`);
  }
  return absolute;
}

When("LPを開く", async ({ page }) => {
  await page.goto("/");
});

Given("LPを開いている", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "ことほぎ" }),
  ).toBeVisible();
});

Then("画面に {string} と表示される", async ({ page }, text: string) => {
  if (text === "ことほぎ") {
    await expect(
      page.getByRole("heading", { level: 1, name: "ことほぎ" }),
    ).toBeVisible();
    return;
  }
  await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
});

When("{string} のアプリリンクを開く", async ({ page }, title: string) => {
  await page.getByRole("link", { name: new RegExp(title) }).first().click();
});

Then(
  "Featuresに {string} の使い方が表示される",
  async ({ page }, title: string) => {
    const link = page.getByRole("link", { name: new RegExp(title) }).first();
    await expect(link).toBeVisible();
    await expect(link.getByText("使い方", { exact: true })).toBeVisible();
    // 幹事向けの短い手順文が入っていること
    await expect(link).toContainText(/幹事|司会/);
  },
);

Then("ビンゴ画面が表示される", async ({ page }) => {
  await expect(page.locator("#main-title")).toHaveText(/Bingo/i);
  await expect(page.locator("#bingo-board")).toBeVisible();
});

Then("クイズ画面が表示される", async ({ page }) => {
  await expect(page.locator("#main-title")).toHaveText(/Quiz/i);
  await expect(page.locator("#btn-start")).toBeVisible();
});

Then("アンケート開始画面が表示される", async ({ page }) => {
  await expect(page.locator("#view-start")).toBeVisible();
  await expect(page.locator("#btn-enter")).toBeVisible();
});

Given("アンケート開始画面を開いている", async ({ page }) => {
  await page.goto("/app-tools/wedding-poll/index.html");
  await expect(page.locator("#view-start")).toBeVisible();
});

Then("アンケートの使い方の要点が表示される", async ({ page }) => {
  await expect(page.locator("#host-howto-start")).toBeVisible();
  await expect(page.locator("#host-howto-start")).toContainText("使い方の要点");
  await expect(page.locator("#host-howto-start")).toContainText("Host");
});

Then("司会向けの使い方の要点が表示される", async ({ page }) => {
  await expect(page.locator("#host-howto-start")).toBeVisible();
  await expect(page.locator("#host-howto-start")).toContainText("司会向け");
});

When("Hostモードを選ぶ", async ({ page }) => {
  await page.locator("#mode-host").click();
  await expect(page.locator("#mode-host")).toHaveClass(/selected/);
});

Then("Hostに質問編集ボタンがある", async ({ page }) => {
  await expect(page.locator("#btn-edit-questions")).toBeVisible();
  await expect(page.locator("#btn-edit-questions")).toHaveText(
    /質問・選択肢を編集/,
  );
  await expect(page.locator("#host-controls .howto-note")).toContainText(
    "司会向け",
  );
});

When(
  "Hostが先頭の質問文を {string} に変更して保存する",
  async ({ page }, question: string) => {
    await page.locator("#btn-edit-questions").click();
    await expect(page.locator("#admin-panel")).toBeVisible();
    await page.locator("#admin-form .admin-q").first().fill(question);
    await page.locator("#admin-save").click();
    await expect(page.locator("#admin-panel")).toBeHidden({ timeout: 15_000 });
  },
);

Then(
  "セッションの質問文に {string} と表示される",
  async ({ page }, question: string) => {
    await expect(page.locator("#question-text")).toContainText(question, {
      timeout: 15_000,
    });
  },
);

When("GuestがそのURLを開く", async ({ browser, world }) => {
  expect(world.guestUrl).toBeTruthy();
  const context = await browser.newContext({
    locale: "ja-JP",
    recordVideo: { dir: "test-results/guest-videos" },
  });
  await context.addInitScript(() => {
    localStorage.clear();
  });
  const guestPage = await context.newPage();
  await guestPage.goto(world.guestUrl!);
  await expect(guestPage.locator("#view-session")).toBeVisible({
    timeout: 20_000,
  });
  world.guestQuestionText =
    (await guestPage.locator("#question-text").innerText()).trim();
  await guestPage.close();
  await context.close();
});

Then(
  "Guestの質問文に {string} と表示される",
  async ({ world }, question: string) => {
    expect(world.guestQuestionText).toContain(question);
  },
);

When("Hostとして新しいテストルームに入室する", async ({ page, world }) => {
  world.room = makeTestRoom();
  await page.evaluate(() => localStorage.clear());
  await page.locator("#mode-host").click();
  await page.locator("#room-input").fill(world.room);
  await page.locator("#btn-enter").click();
  await expect(page.locator("#view-session")).toBeVisible({ timeout: 20_000 });
});

Then("Hostのセッション画面が表示される", async ({ page }) => {
  await expect(page.locator("#view-session")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("#role-label")).toContainText("Host");
});

Then("ゲスト用URLが表示される", async ({ page, world }) => {
  const input = page.locator("#guest-url");
  await expect(input).not.toHaveValue("");
  world.guestUrl = await input.inputValue();
  expect(world.guestUrl).toContain("room=");
});

When(
  "GuestがそのURLで先頭の選択肢に投票する",
  async ({ browser, world }) => {
    expect(world.guestUrl).toBeTruthy();
    world.guestVotedOk = false;
    const context = await browser.newContext({
      locale: "ja-JP",
      recordVideo: { dir: "test-results/guest-videos" },
    });
    await context.addInitScript(() => {
      localStorage.clear();
    });
    const guestPage = await context.newPage();
    await guestPage.goto(world.guestUrl);
    await expect(guestPage.locator("#view-session")).toBeVisible({
      timeout: 20_000,
    });
    const firstOption = guestPage.locator("#options .option-btn").first();
    await expect(firstOption).toBeEnabled({ timeout: 20_000 });
    await firstOption.click();
    await expect(guestPage.locator("#voted-note")).toBeVisible({
      timeout: 15_000,
    });
    world.guestVotedOk = true;
    await guestPage.close();
    await context.close();
  },
);

Then("Guestは投票済みと表示される", async ({ world }) => {
  expect(world.guestVotedOk).toBe(true);
});

When("Hostが結果を表示する", async ({ page, world }) => {
  expect(world.room).toBeTruthy();
  await expect
    .poll(async () => {
      const res = await page.request.get(`/api/poll/${world.room}`);
      if (!res.ok()) return 0;
      const data = (await res.json()) as { votes?: number[][] };
      return data.votes?.[0]?.[0] ?? 0;
    }, { timeout: 15_000 })
    .toBeGreaterThan(0);

  await page.locator("#btn-toggle-results").click();
  await expect(page.locator("#results")).toHaveClass(/show/, {
    timeout: 15_000,
  });
});

Then("Hostの結果に投票が反映されている", async ({ page, world }) => {
  await expect(page.locator("#results")).toHaveClass(/show/);
  await expect(page.locator("#total-votes")).toContainText(/[1-9]/);
  const res = await page.request.get(`/api/poll/${world.room}`);
  expect(res.ok()).toBeTruthy();
  const data = (await res.json()) as { votes: number[][] };
  expect(data.votes[0][0]).toBeGreaterThanOrEqual(1);
});

Then("Hostの選択肢は無効である", async ({ page }) => {
  const first = page.locator("#options .option-btn").first();
  await expect(first).toBeDisabled();
  await expect(first).toHaveClass(/host-readonly/);
});

When(
  "Hostが選択肢を強制クリックしても票は増えない",
  async ({ page, world }) => {
    expect(world.room).toBeTruthy();
    const before = await page.request.get(`/api/poll/${world.room}`);
    const beforeData = (await before.json()) as { votes: number[][] };
    const sumBefore = beforeData.votes.flat().reduce((a, b) => a + b, 0);

    await page.locator("#options .option-btn").first().click({ force: true });
    await page.waitForTimeout(800);

    const after = await page.request.get(`/api/poll/${world.room}`);
    const afterData = (await after.json()) as { votes: number[][] };
    const sumAfter = afterData.votes.flat().reduce((a, b) => a + b, 0);
    expect(sumAfter).toBe(sumBefore);
  },
);

Then("ルームの票はすべてゼロのままである", async ({ page, world }) => {
  const res = await page.request.get(`/api/poll/${world.room}`);
  expect(res.ok()).toBeTruthy();
  const data = (await res.json()) as { votes: number[][] };
  expect(data.votes.flat().every((n) => n === 0)).toBe(true);
});

Given("ビンゴ画面を開いている", async ({ page }) => {
  await page.goto("/app-tools/wedding-bingo/index.html");
  await page.evaluate(() => {
    localStorage.removeItem("bingoLabels");
    localStorage.removeItem("bingoNames");
  });
  await page.reload();
  await expect(page.locator("#bingo-board")).toBeVisible();
});

Then("ビンゴの使い方の要点が表示される", async ({ page }) => {
  await expect(page.locator("#admin-panel .howto-note")).toBeVisible();
  await expect(page.locator("#admin-panel .howto-note")).toContainText(
    "使い方の要点",
  );
  await expect(page.locator("#admin-panel .howto-note")).toContainText(
    "共有URL",
  );
});

When("幹事用の編集画面を開く", async ({ page }) => {
  await page.locator("#open-editor").click();
  await expect(page.locator("#admin-panel")).toBeVisible();
});

When("編集画面を閉じる", async ({ page }) => {
  await page.locator("#admin-close").click();
  await expect(page.locator("#admin-panel")).toBeHidden();
});

When(
  "中央行の左右マスに名前を登録してビンゴにする",
  async ({ page }) => {
    await fillBingoCell(page, 3, "ゲスト左");
    await fillBingoCell(page, 5, "ゲスト右");
  },
);

Then("ビンゴ達成が表示される", async ({ page }) => {
  await expect(page.locator("#bingo-msg")).toBeVisible();
  await expect(page.locator("#bingo-count-text")).toContainText(/BINGO/i);
});

Then("ビンゴ達成の日時が表示される", async ({ page }) => {
  await expect(page.locator("#display-time")).toContainText(/達成:/);
});

Given("クイズ画面を開いている", async ({ page }) => {
  await page.goto("/app-tools/wedding-quiz/index.html");
  await page.evaluate(() => {
    localStorage.removeItem("weddingQuizQuestions");
  });
  await page.reload();
  await expect(page.locator("#btn-start")).toBeVisible();
});

Then("クイズの使い方の要点が表示される", async ({ page }) => {
  await expect(page.locator("#admin-panel .howto-note")).toBeVisible();
  await expect(page.locator("#admin-panel .howto-note")).toContainText(
    "使い方の要点",
  );
  await expect(page.locator("#admin-panel .howto-note")).toContainText(
    "共有URL",
  );
});

When(
  "問題に目印 {string} を付けて共有URLを作る",
  async ({ page, world }, marker: string) => {
    world.marker = marker;
    const panel = page.locator("#admin-panel");
    if (!(await panel.isVisible())) {
      await page.locator("#open-editor").click();
      await expect(panel).toBeVisible();
    }
    await page.locator("#admin-form .admin-q").first().fill(marker);
    await page.locator("#admin-copy-url").click();
    await expect(page.locator("#share-box")).toBeVisible();
    const shared = (await page.locator("#share-box").innerText()).trim();
    world.shareUrl = extractShareUrl(shared, page.url());
  },
);

When(
  "別端末相当でその共有URLからクイズを開始する",
  async ({ browser, world }) => {
    expect(world.shareUrl).toBeTruthy();
    world.quizMarkerOk = false;
    const context = await browser.newContext({
      locale: "ja-JP",
      recordVideo: { dir: "test-results/guest-videos" },
    });
    await context.addInitScript(() => {
      localStorage.clear();
    });
    const guestPage = await context.newPage();
    await guestPage.goto(world.shareUrl);
    await guestPage.locator("#btn-start").click();
    await expect(guestPage.locator("#view-quiz")).toBeVisible();
    await expect(guestPage.locator("#question-text")).toContainText(
      world.marker,
    );
    world.quizMarkerOk = true;
    await guestPage.close();
    await context.close();
  },
);

Then("問題文に {string} と表示される", async ({ world }, marker: string) => {
  expect(world.quizMarkerOk).toBe(true);
  expect(world.marker).toBe(marker);
});
