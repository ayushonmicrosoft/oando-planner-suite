import { test, expect } from "@playwright/test";

test.describe("Dashboard (Home)", () => {
  test("shows planner tool cards with action buttons", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("button-start-canvas")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("button-start-blueprint")).toBeVisible();
    await expect(page.getByTestId("button-view-3d")).toBeVisible();
  });

  test("shows drawing tools section", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("button-start-floor-plan")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("button-start-shapes")).toBeVisible();
    await expect(page.getByTestId("button-start-site-plan")).toBeVisible();
    await expect(page.getByTestId("button-start-import")).toBeVisible();
  });

  test("shows stats or error state after loading", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("button-start-canvas")).toBeVisible({
      timeout: 15_000,
    });

    const statsVisible = await page
      .getByTestId("text-total-plans")
      .isVisible()
      .catch(() => false);
    const errorVisible = await page
      .getByText("Failed to load statistics")
      .isVisible()
      .catch(() => false);
    const loadingVisible = await page
      .locator("[class*='animate-pulse']")
      .first()
      .isVisible()
      .catch(() => false);

    expect(statsVisible || errorVisible || loadingVisible).toBe(true);
  });

  test("Open Canvas Planner navigates to planner canvas", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("button-start-canvas").click({ timeout: 15_000 });

    await expect(page).toHaveURL(/\/planner\/canvas/);
  });
});
