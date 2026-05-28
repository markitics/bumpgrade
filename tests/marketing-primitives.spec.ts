import { expect, test, type Page } from "@playwright/test";

const migratedRoutes = [
  {
    path: "/features",
    heading: "Everything a publisher needs to launch, sell, deliver, and improve an offer.",
    links: ["See launch pricing", "Compare alternatives", "Learn more"],
    selectors: [".marketing-features-hero", ".spotlight-feature-card", ".marketing-feature-card"],
  },
  {
    path: "/compare",
    heading: "Compare ClickFunnels competitors and indiepreneur platforms.",
    links: ["See features", "Compare ClickFunnels", "Open comparison"],
    selectors: [".compare-hero", ".seo-target-card", ".alternative-card", ".comparison-table"],
  },
] as const;

async function visibleOverflowingMarketingElements(page: Page) {
  return page.locator("main, section, article, a, .comparison-table, .comparison-table-row").evaluateAll((elements) => {
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

test.describe("shared marketing primitives", () => {
  for (const route of migratedRoutes) {
    test(`${route.path} keeps migrated marketing sections readable on desktop`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(route.path);

      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      for (const selector of route.selectors) {
        await expect(page.locator(selector).first()).toBeVisible();
      }
      for (const linkName of route.links) {
        await expect(page.getByRole("link", { name: linkName }).first()).toBeVisible();
      }
      expect(await visibleOverflowingMarketingElements(page)).toEqual([]);
    });

    test(`${route.path} keeps migrated marketing sections readable on mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route.path);

      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      for (const selector of route.selectors) {
        await expect(page.locator(selector).first()).toBeVisible();
      }
      expect(await visibleOverflowingMarketingElements(page)).toEqual([]);
    });
  }
});
