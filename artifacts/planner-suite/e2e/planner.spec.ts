import { test, expect } from "@playwright/test";

test.describe("Planner Tool Opening", () => {
  test("canvas planner page loads without error", async ({ page }) => {
    const response = await page.goto("/planner/canvas");

    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/planner\/canvas/);
  });

  test("navigating from dashboard opens canvas planner", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("button-start-canvas").click({ timeout: 15_000 });

    await expect(page).toHaveURL(/\/planner\/canvas/);
    await expect(page).toHaveTitle(/One&Only/);
  });
});
