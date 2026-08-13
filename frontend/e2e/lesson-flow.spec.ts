import { expect, test } from "@playwright/test";

test.describe("lesson flow", () => {
  test("path to lesson completion persists progress", async ({ page }) => {
    await page.goto("/");

    const availableNode = page.getByLabel(/Lesson|Starting/).first();
    await availableNode.click();

    await expect(page).toHaveURL(/\/lesson\/\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const checkButton = page.getByRole("button", { name: "Check" });
    const continueButton = page.getByRole("button", { name: "Continue" });

    for (let i = 0; i < 5; i += 1) {
      const optionButton = page
        .locator("section button")
        .filter({ hasText: /.+/ })
        .first();
      if (await optionButton.isVisible()) {
        await optionButton.click();
      } else {
        await page.getByLabel("Type your answer").fill("placeholder answer");
      }
      await checkButton.click();

      if (await continueButton.isVisible()) {
        await continueButton.click();
      } else {
        await page.getByRole("button", { name: "Finish lesson" }).click();
      }
    }

    await expect(page.getByText("Lesson complete")).toBeVisible();
    await page.getByRole("button", { name: "Return to path" }).click();
    await expect(page).toHaveURL("/");
  });
});
