import { expect, test, type Page } from "@playwright/test";

const beforeAfterRoutes = [
  {
    path: "/imports",
    heading: "See how old-platform material becomes a private launch review path.",
    visualLabel: "Importer source material becomes a private Bumpgrade review map",
    visualText: ["Public page URL", "Private launch map"],
  },
  {
    path: "/imports/clickfunnels",
    heading: "See the private review path before starting the ClickFunnels import.",
    visualLabel: "ClickFunnels source material becomes a private Bumpgrade review map",
    visualText: ["Funnel URL or export", "Safe export analysis"],
  },
  {
    path: "/imports/samcart",
    heading: "See the private review path before starting the SamCart import.",
    visualLabel: "SamCart source material becomes a private Bumpgrade review map",
    visualText: ["Checkout page or export", "Safe export analysis"],
  },
  {
    path: "/offers/indie-launch-stack",
    heading: "See how offer notes become a protected checkout path.",
    visualLabel: "Indie launch checkout offer stack source notes become a protected checkout path",
    visualText: ["Bumpgrade launch pass", "Launch checklist bump"],
  },
] as const;

const privateLeakTerms = /m@rkmoriarty\.com|mark@awesound\.com|price_|prod_|sk_(?:test|live)|whsec_|source-data|source data|draft_|raw customer|raw subscriber/i;

async function overflowingBeforeAfterElements(page: Page) {
  return page
    .locator(
      "main, section, .before-after-visual, .before-after-stage, .before-after-pane, .before-after-artifacts li, .before-after-review-rail li, .before-after-safety span, .before-after-preview-image img",
    )
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

test.describe("before-after marketing visuals", () => {
  test("render on importer and offer marketing pages without private identifiers", async ({ page }) => {
    for (const route of beforeAfterRoutes) {
      await page.goto(route.path);

      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
      const visual = page.locator(".before-after-visual").first();
      await expect(visual).toBeVisible();
      await expect(visual).toHaveAttribute("aria-label", route.visualLabel);
      await expect(visual.locator(".before-after-pane.before")).toBeVisible();
      await expect(visual.locator(".before-after-pane.after")).toBeVisible();
      await expect(visual.locator(".before-after-preview-image img")).toBeVisible();

      const visualText = await visual.innerText();
      for (const expectedText of route.visualText) {
        expect(visualText).toContain(expectedText);
      }
      expect(visualText).not.toMatch(privateLeakTerms);
    }
  });

  test("stay overflow-free on desktop and mobile widths", async ({ page }) => {
    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);

      for (const route of beforeAfterRoutes) {
        await page.goto(route.path);
        expect(await overflowingBeforeAfterElements(page), `${route.path} ${viewport.width}px overflow`).toEqual([]);
      }
    }
  });

  test("source-data describes the visual contract with public-safe fields", async ({ request }) => {
    const [importResponse, offerResponse] = await Promise.all([
      request.get("/imports/source-data"),
      request.get("/offers/source-data"),
    ]);

    expect(importResponse.ok()).toBeTruthy();
    expect(offerResponse.ok()).toBeTruthy();

    const importPayload = await importResponse.json();
    const offerPayload = await offerResponse.json();
    const publicVisuals = [
      importPayload.beforeAfterVisual,
      importPayload.platforms.find((platform: { slug: string }) => platform.slug === "clickfunnels")?.beforeAfterVisual,
      offerPayload.beforeAfterVisual,
    ];

    for (const visual of publicVisuals) {
      expect(visual).toEqual(expect.objectContaining({ issue: 554 }));
      expect(JSON.stringify(visual)).not.toMatch(privateLeakTerms);
    }
  });
});
