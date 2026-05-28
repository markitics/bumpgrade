import { expect, test } from "@playwright/test";

import { resourceHubRoutes } from "../src/lib/content-surfaces";

type ContentSourcePayload = {
  routes: string[];
  resourceHubItems: Array<{
    id: string;
    status: string;
    route: string;
  }>;
};

function sitemapUrl(path: string) {
  return `https://bumpgrade.com${path}`;
}

test.describe("resource hub route and status honesty", () => {
  test("resource hub renders planned resources without live badge treatment", async ({ page }) => {
    await page.goto("/resources");

    const launchPlaybook = page.locator("article#launch-playbook");
    await expect(launchPlaybook).toBeVisible();
    await expect(launchPlaybook.locator(".status-badge.planned")).toHaveText("Not live yet");
    await expect(launchPlaybook.locator(".status-badge.live")).toHaveCount(0);
    await expect(launchPlaybook.getByRole("link", { name: "See related features" })).toHaveAttribute("href", "/features");

    const productNotes = page.locator("article#product-notes-blog-index");
    await expect(productNotes).toBeVisible();
    await expect(productNotes.locator(".status-badge.live")).toHaveText("Available now");
    await expect(productNotes.getByRole("link", { name: "Open notes" })).toHaveAttribute(
      "href",
      "/resources/product-notes",
    );
  });

  test("product notes resource route has crawlable metadata and current note links", async ({ page }) => {
    await page.goto("/resources/product-notes");

    await expect(page).toHaveTitle(/Product Notes and Launch Guidance/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      sitemapUrl("/resources/product-notes"),
    );
    await expect(page.getByRole("heading", { name: /Launch guidance and product notes/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to resources" })).toHaveAttribute("href", "/resources");
    await expect(page.getByRole("link", { name: "Open note" }).first()).toBeVisible();
  });

  test("source data and sitemap expose live resource routes without hash-only planned targets", async ({ request }) => {
    const sourceResponse = await request.get("/content/source-data");
    expect(sourceResponse.ok()).toBeTruthy();
    const sourcePayload = (await sourceResponse.json()) as ContentSourcePayload;
    const productNotes = sourcePayload.resourceHubItems.find((item) => item.id === "resource-product-notes-blog-index");
    const launchPlaybook = sourcePayload.resourceHubItems.find((item) => item.id === "resource-launch-playbook");

    expect(productNotes).toEqual(
      expect.objectContaining({
        status: "live",
        route: "/resources/product-notes",
      }),
    );
    expect(launchPlaybook).toEqual(
      expect.objectContaining({
        status: "planned",
        route: "/resources#launch-playbook",
      }),
    );
    for (const route of resourceHubRoutes) {
      expect(sourcePayload.routes, `/content/source-data should expose ${route}`).toContain(route);
    }

    const sitemapResponse = await request.get("/sitemap.xml");
    expect(sitemapResponse.ok()).toBeTruthy();
    const sitemapXml = await sitemapResponse.text();
    expect(sitemapXml).toContain(sitemapUrl("/resources/product-notes"));
    expect(sitemapXml).not.toContain("https://bumpgrade.com/resources#launch-playbook");
  });
});
