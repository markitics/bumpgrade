import { createHash } from "node:crypto";

import { expect, test } from "@playwright/test";

const routeOgImageTargets = [
  { label: "home", path: "/opengraph-image" },
  { label: "pricing", path: "/pricing/opengraph-image" },
  { label: "feature", path: "/features/simple-landing-page/opengraph-image" },
  { label: "comparison", path: "/compare/clickfunnels-alternative/opengraph-image" },
  { label: "importer", path: "/imports/clickfunnels/opengraph-image" },
];

const routeOgMetadataTargets = [
  { pagePath: "/", imagePath: "/opengraph-image" },
  { pagePath: "/pricing", imagePath: "/pricing/opengraph-image" },
  { pagePath: "/features/simple-landing-page", imagePath: "/features/simple-landing-page/opengraph-image" },
  { pagePath: "/compare/clickfunnels-alternative", imagePath: "/compare/clickfunnels-alternative/opengraph-image" },
  { pagePath: "/imports/clickfunnels", imagePath: "/imports/clickfunnels/opengraph-image" },
];

function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.describe("route-specific Open Graph images", () => {
  test("priority marketing routes generate route-specific PNG images", async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Image route coverage only needs one browser project.");

    const hashes = new Map<string, string>();

    for (const target of routeOgImageTargets) {
      const response = await request.get(target.path);
      expect(response.status(), `${target.path} should return HTTP 200`).toBe(200);
      expect(response.headers()["content-type"], `${target.path} should return an image`).toContain("image/png");

      const body = await response.body();
      expect(body.byteLength, `${target.path} should return a generated image body`).toBeGreaterThan(10_000);
      hashes.set(target.label, sha256(body));
    }

    expect(new Set(hashes.values()).size, "Each priority route should produce a distinct image payload").toBe(
      routeOgImageTargets.length,
    );
  });

  test("priority marketing pages advertise generated Open Graph image routes", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Metadata coverage only needs one browser project.");

    for (const target of routeOgMetadataTargets) {
      await page.goto(target.pagePath);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        new RegExp(`${escapeRegExp(target.imagePath)}(\\?|$)`),
      );
    }
  });
});
