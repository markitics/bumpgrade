import { expect, test, type Page } from "@playwright/test";

import { canonicalPricingRoute } from "../src/lib/pricing-plans";

const matrixSelector = ".pricing-feature-table";
const matrixElementSelector = ".pricing-feature-table, .pricing-feature-row";

async function visibleOverflowingPricingElements(page: Page) {
  return page.locator(matrixElementSelector).evaluateAll((elements) => {
    const viewportWidth = document.documentElement.clientWidth;

    return elements.flatMap((element, index) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const visible = style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;

      if (!visible || (rect.left >= -1 && rect.right <= viewportWidth + 1)) {
        return [];
      }

      return [
        {
          index,
          className: String(element.getAttribute("class")),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          viewportWidth,
          text: element.textContent?.replace(/\s+/g, " ").trim().slice(0, 120),
        },
      ];
    });
  });
}

test.describe("pricing feature comparison", () => {
  test("stacks readable plan details inside a 390px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(canonicalPricingRoute);

    const matrix = page.locator(matrixSelector);
    await expect(page.getByRole("heading", { name: "Current plan boundaries are explicit and adjustable." })).toBeVisible();
    await expect(matrix).toBeVisible();

    for (const planName of ["Experiment", "Grow", "Enterprise"]) {
      await expect(matrix.locator(".pricing-feature-mobile-plan-label").filter({ hasText: planName }).first()).toBeVisible();
    }

    await expect(matrix.getByText("Included with custom implementation support")).toBeVisible();
    expect(await visibleOverflowingPricingElements(page)).toEqual([]);
  });

  test("keeps the desktop matrix headers and rows within the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(canonicalPricingRoute);

    const matrix = page.locator(matrixSelector);
    await expect(matrix.getByRole("columnheader", { name: "Capability" })).toBeVisible();

    for (const planName of ["Experiment", "Grow", "Enterprise"]) {
      await expect(matrix.getByRole("columnheader", { name: planName })).toBeVisible();
    }

    await expect(matrix.locator(".pricing-feature-mobile-plan-label").first()).toBeHidden();
    expect(await visibleOverflowingPricingElements(page)).toEqual([]);
  });
});
