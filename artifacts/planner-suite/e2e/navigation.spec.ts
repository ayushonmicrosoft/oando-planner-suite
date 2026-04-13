import { test, expect } from "@playwright/test";

test.describe("Sidebar Navigation", () => {
  test("sidebar shows all main navigation links", async ({ page }) => {
    await page.goto("/catalog");

    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    await expect(sidebar.getByText("Dashboard")).toBeVisible();
    await expect(sidebar.getByText("Canvas Planner")).toBeVisible();
    await expect(sidebar.getByText("3D Viewer")).toBeVisible();
    await expect(sidebar.getByText("Site Plan")).toBeVisible();
    await expect(sidebar.getByText("Import & Scale")).toBeVisible();
  });

  test("sidebar shows resource links", async ({ page }) => {
    await page.goto("/catalog");

    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    await expect(sidebar.getByText("Templates")).toBeVisible();
    await expect(sidebar.getByText("Furniture Catalog")).toBeVisible();
    await expect(sidebar.getByText("Saved Plans")).toBeVisible();
  });

  test("clicking Dashboard navigates to home", async ({ page }) => {
    await page.goto("/catalog");

    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    await sidebar.getByText("Dashboard").click();
    await expect(page).toHaveURL("/");
  });

  test("clicking Furniture Catalog navigates to catalog", async ({
    page,
  }) => {
    await page.goto("/plans");

    const sidebar = page.locator('[data-sidebar="sidebar"]');
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    await sidebar.getByText("Furniture Catalog").click();
    await expect(page).toHaveURL(/\/catalog/);
  });
});
