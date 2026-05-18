import { expect, test } from "@playwright/test";

import { competitors } from "../src/lib/comparison-data";
import { featureCatalog } from "../src/lib/feature-catalog";
import { roadmapItems, roadmapLanes } from "../src/lib/roadmap";

const routes = [
  { path: "/", heading: "Funnels, checkout, commerce, and agents" },
  { path: "/features", heading: "Aspirational feature catalog" },
  { path: "/compare", heading: "Compare Bumpgrade against indiepreneur platforms" },
  { path: "/roadmap", heading: "Public roadmap from feature evidence" },
  { path: "/users", heading: "Use cases for indiepreneurs" },
  { path: "/developers-and-agents", heading: "Agent-readable contracts" },
  { path: "/resources", heading: "Guides, comparisons, migrations" },
  { path: "/pricing", heading: "Pricing surface" },
  { path: "/login", heading: "Publisher login" },
  { path: "/admin/roadmap", heading: "Roadmap command center" },
  { path: "/admin/work-log", heading: "Durable diary" },
  { path: "/admin/user-journeys", heading: "Journeys connect" },
  { path: "/admin/for-mark", heading: "Non-blocking attention" },
  { path: "/agent-docs/bumpgrade-agent-surface", heading: "Public agent surface" },
];

const compareRoutes = competitors.map((competitor) => ({
  path: `/compare/${competitor.slug}`,
  heading: competitor.headline,
}));

test.describe("Bumpgrade scaffold", () => {
  for (const route of [...routes, ...compareRoutes]) {
    test(`renders ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { name: new RegExp(route.heading, "i") })).toBeVisible();
    });
  }

  test("comparison hub links to every first-wave alternative", async ({ page }) => {
    await page.goto("/compare");
    for (const competitor of competitors) {
      await expect(page.getByRole("link", { name: new RegExp(`${competitor.name} alternative`, "i") })).toBeVisible();
    }
  });

  test("feature source data exposes stable feature records", async ({ request }) => {
    const response = await request.get("/features/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.features).toHaveLength(featureCatalog.length);
    expect(payload.features[0]).toEqual(expect.objectContaining({ id: expect.any(String), status: expect.any(String) }));
  });

  test("roadmap source data exposes stable roadmap records", async ({ request }) => {
    const response = await request.get("/roadmap/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.id).toBe("bumpgrade-roadmap-source-data");
    expect(payload.items).toHaveLength(roadmapItems.length);
    expect(payload.lanes).toHaveLength(roadmapLanes.length);
    expect(payload.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "roadmap-feature-catalog", status: "shipped", issue: 6 }),
        expect.objectContaining({ id: "roadmap-public-roadmap", status: "shipped", issue: 7 }),
        expect.objectContaining({ id: "roadmap-codex-email", status: "blocked", issue: 10 }),
      ]),
    );
  });

  test("admin source data exposes durable admin surface records", async ({ request }) => {
    const response = await request.get("/admin/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.id).toBe("bumpgrade-admin-source-data");
    expect(["d1", "fixture", "mixed"]).toContain(payload.source);
    expect(payload.roadmapItems.length).toBeGreaterThan(0);
    expect(payload.workLogEntries.length).toBeGreaterThan(0);
    expect(payload.userJourneys.length).toBeGreaterThan(0);
    expect(payload.attentionItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mark-attention-2026-05-18-codex-email-blocked",
          state: "open",
        }),
      ]),
    );
  });

  test("desktop navigation exposes required high-level categories", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Desktop nav is hidden on the mobile project.");
    await page.goto("/");
    const header = page.locator("header.site-header");
    const desktopNav = header.locator(".desktop-nav");
    await expect(desktopNav.getByRole("link", { name: "Features", exact: true })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "Users", exact: true })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "Developers and agents", exact: true })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "Resources", exact: true })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: "Pricing", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "Log in / sign up", exact: true })).toBeVisible();
  });

  test("mobile menu exposes required high-level categories", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Mobile menu is only checked on the mobile project.");
    await page.goto("/");
    await page.getByLabel("Open navigation").click();
    const panel = page.locator(".mobile-nav-panel");
    await expect(panel.getByRole("link", { name: "Features", exact: true })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Users", exact: true })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Developers and agents", exact: true })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Resources", exact: true })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Pricing", exact: true })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Log in / sign up", exact: true })).toBeVisible();
  });
});
