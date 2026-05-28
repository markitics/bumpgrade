import { expect, test, type Page } from "@playwright/test";

const demoRegionName = "Connected launch workflow demo";

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
}

test.describe("Homepage demo loop", () => {
  test("supports tab controls and arrow-key navigation without layout overflow", async ({ page }) => {
    await page.goto("/");

    const demo = page.getByRole("region", { name: demoRegionName });
    await expect(demo).toBeVisible();
    await expect(demo.getByRole("tablist", { name: "Launch workflow steps" })).toBeVisible();

    const checkoutTab = demo.getByRole("tab", { name: /Checkout/i });
    await checkoutTab.click();
    await expect(checkoutTab).toHaveAttribute("aria-selected", "true");

    const checkoutPanelId = await checkoutTab.getAttribute("aria-controls");
    expect(checkoutPanelId).toBeTruthy();
    await expect(page.locator(`[id="${checkoutPanelId}"]`)).toContainText("Shape the offer");

    await checkoutTab.press("ArrowRight");
    const audienceTab = demo.getByRole("tab", { name: /Audience and email/i });
    await expect(audienceTab).toBeFocused();
    await expect(audienceTab).toHaveAttribute("aria-selected", "true");
    await expectNoHorizontalOverflow(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("region", { name: demoRegionName })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("keeps reduced-motion users in manual control", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const demo = page.getByRole("region", { name: demoRegionName });
    const funnelTab = demo.getByRole("tab", { name: /Funnel/i });
    await expect(funnelTab).toHaveAttribute("aria-selected", "true");

    await page.waitForTimeout(6200);
    await expect(funnelTab).toHaveAttribute("aria-selected", "true");

    const aiHelpTab = demo.getByRole("tab", { name: /AI help/i });
    await aiHelpTab.click();
    await expect(aiHelpTab).toHaveAttribute("aria-selected", "true");

    const transitionDuration = await page
      .locator(".homepage-demo-panel")
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration);

    expect(transitionDuration).toBe("0s");
  });
});
