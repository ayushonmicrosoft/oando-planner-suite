import { test, expect } from "@playwright/test";

test.describe("Root Page Load", () => {
  test("root page loads successfully with title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/One&Only/);
  });

  test("root page renders dashboard content", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByTestId("button-start-canvas"),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("sign-up page loads without error", async ({ page }) => {
    const response = await page.goto("/sign-up");

    expect(response?.status()).toBeLessThan(500);
  });
});
