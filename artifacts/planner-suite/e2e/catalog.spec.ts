import { test, expect } from "@playwright/test";

test.describe("Catalog Browsing", () => {
  test("loads the catalog page with search input", async ({ page }) => {
    await page.goto("/catalog");

    await expect(page.getByTestId("input-search-catalog")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("catalog page displays product catalog heading", async ({ page }) => {
    await page.goto("/catalog");

    await expect(page.getByText("Product Catalog")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("catalog page shows sidebar navigation", async ({ page }) => {
    await page.goto("/catalog");

    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    await expect(sidebar.getByText("Furniture Catalog")).toBeVisible();
  });
});
