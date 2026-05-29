import { expect, test, type Page } from "@playwright/test";

const visualPolishRoutes = [
  {
    path: "/users",
    heading: "Use cases for indiepreneurs who sell from an owned audience.",
    selectors: [".marketing-path-panel", ".audience-segment-card", ".audience-launch-rail"],
  },
  {
    path: "/resources",
    heading: "Guides, comparisons, migrations, and launch notes for publishers.",
    selectors: [".marketing-path-panel", "article#comparison-hub", ".feature-proof-grid"],
  },
  {
    path: "/resources/product-notes",
    heading: "Launch guidance and product notes grounded in public Bumpgrade records.",
    selectors: [".marketing-path-panel", ".feature-card", ".feature-proof-grid"],
  },
] as const;

async function visibleOverflowingMarketingElements(page: Page) {
  return page
    .locator("main, section, article, a, img, .marketing-path-panel, .marketing-path-list li, .audience-launch-rail li")
    .evaluateAll((elements) => {
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
            className: String(element.getAttribute("class") ?? ""),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            viewportWidth,
            text: element.textContent?.replace(/\s+/g, " ").trim().slice(0, 120),
          },
        ];
      });
    });
}

test.describe("marketing route visual polish", () => {
  test("keeps audience and resource routes visual, linked, and overflow-free", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Responsive visual coverage only needs one browser project.");

    for (const route of visualPolishRoutes) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(route.path);

      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await expect(page.locator(".marketing-path-media img").first()).toBeVisible();
      for (const selector of route.selectors) {
        await expect(page.locator(selector).first()).toBeVisible();
      }
      expect(await visibleOverflowingMarketingElements(page), `${route.path} desktop overflow`).toEqual([]);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route.path);

      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      await expect(page.locator(".marketing-path-media img").first()).toBeVisible();
      expect(await visibleOverflowingMarketingElements(page), `${route.path} mobile overflow`).toEqual([]);
    }
  });
});
