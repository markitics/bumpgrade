import { expect, test, type Page } from "@playwright/test";
import { createEmailVerificationToken } from "better-auth/api";

import { agentManifest } from "../src/lib/agent-manifest";
import { comparisonSeoTargets, competitors } from "../src/lib/comparison-data";
import { audienceSegments, contentSourceData, plannedPricingTracks, resourceHubItems } from "../src/lib/content-surfaces";
import { commerceTables } from "../src/lib/commerce";
import { featureCatalog } from "../src/lib/feature-catalog";
import { mobileAdminContract } from "../src/lib/mobile-admin";
import { androidMobileAdminSourceData } from "../src/lib/mobile-admin-android";
import { iosMobileAdminSourceData } from "../src/lib/mobile-admin-ios";
import { roadmapItems, roadmapLanes } from "../src/lib/roadmap";
import { checkoutConfirmationText, sandboxCheckoutOffer } from "../src/lib/sandbox-checkout";

const routes = [
  { path: "/", heading: "Funnels, checkout, commerce, and agents" },
  { path: "/features", heading: "Aspirational feature catalog" },
  { path: "/compare", heading: "Compare ClickFunnels competitors and indiepreneur platforms" },
  { path: "/roadmap", heading: "Public roadmap from feature evidence" },
  { path: "/users", heading: "Use cases for indiepreneurs" },
  { path: "/developers-and-agents", heading: "APIs and manifests" },
  { path: "/resources", heading: "Guides, comparisons, migrations" },
  { path: "/pricing", heading: "Pricing direction" },
  { path: "/commerce/checkout/success", heading: "sandbox checkout returned successfully" },
  { path: "/commerce/checkout/cancel", heading: "sandbox checkout was canceled" },
  { path: "/login", heading: "Publisher login is backed by Better Auth" },
  { path: "/admin/roadmap", heading: "Owner access is required" },
  { path: "/admin/work-log", heading: "Owner access is required" },
  { path: "/admin/user-journeys", heading: "Owner access is required" },
  { path: "/admin/for-mark", heading: "Owner access is required" },
  { path: "/agent-docs", heading: "Bumpgrade is readable by agents" },
  { path: "/agent-docs/bumpgrade-agent-surface", heading: "Agents get public contracts" },
  { path: "/agent-docs/bumpgrade-commerce-contract", heading: "Stripe commerce has a sandbox checkout path" },
  { path: "/agent-docs/bumpgrade-source-evidence", heading: "Public claims must resolve to source data" },
  { path: "/agent-docs/bumpgrade-admin-surfaces", heading: "Admin pages are owner-gated" },
  { path: "/agent-docs/bumpgrade-mcp", heading: "MCP should wrap the same contracts" },
  { path: "/agent-docs/bumpgrade-mobile-admin", heading: "Mobile admin starts with one contract" },
];

const compareRoutes = competitors.map((competitor) => ({
  path: `/compare/${competitor.slug}`,
  heading: competitor.headline,
}));

const authSecret = "playwright-local-better-auth-secret";

async function signInOrCreateAccount(page: Page, email: string, password: string, name: string) {
  let response = await page.request.post("/api/auth/sign-in/email", {
    data: { email, password, callbackURL: "/admin/roadmap" },
  });

  if (!response.ok()) {
    response = await page.request.post("/api/auth/sign-up/email", {
      data: { email, password, name, callbackURL: "/admin/roadmap" },
    });
  }

  if (!response.ok()) {
    response = await page.request.post("/api/auth/sign-in/email", {
      data: { email, password, callbackURL: "/admin/roadmap" },
    });
  }

  expect(response.ok(), await response.text()).toBe(true);
}

async function verifyEmail(page: Page, email: string) {
  const token = await createEmailVerificationToken(authSecret, email.toLowerCase(), undefined, 3600);

  const response = await page.request.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=/admin/roadmap`, {
    maxRedirects: 0,
  });

  expect([302, 303]).toContain(response.status());
}

async function signInOrCreateOwner(page: Page) {
  const email = "m@rkmoriarty.com";
  await signInOrCreateAccount(page, email, "BumpgradeLocal123!", "Mark");
  await verifyEmail(page, email);
}

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

  test("comparison SEO metadata and source data target ClickFunnels queries", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "SEO metadata is checked once on desktop.");

    await page.goto("/compare");
    await expect(page).toHaveTitle(/ClickFunnels Alternatives and Competitors/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /ClickFunnels alternatives and competitors/i);
    await expect(page.locator(".seo-target-card > span").filter({ hasText: /^ClickFunnels competitors$/ })).toBeVisible();

    await page.goto("/compare/clickfunnels-alternative");
    await expect(page).toHaveTitle(/ClickFunnels Alternative and Competitors for Indiepreneurs/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /ClickFunnels alternative and competitors page/i);
    await expect(page.getByRole("heading", { name: /ClickFunnels alternative and competitors map/i })).toBeVisible();
    await expect(page.locator(".keyword-list li").filter({ hasText: /^ClickFunnels competitors$/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /How Bumpgrade maps the ClickFunnels competitors category/i })).toBeVisible();

    const response = await request.get("/compare/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.seoTargets).toHaveLength(comparisonSeoTargets.length);
    expect(payload.seoTargets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "seo-clickfunnels-alternative",
          primaryKeyword: "ClickFunnels alternative",
          route: "/compare/clickfunnels-alternative",
        }),
        expect.objectContaining({
          id: "seo-clickfunnels-competitors",
          primaryKeyword: "ClickFunnels competitors",
          route: "/compare/clickfunnels-alternative",
          evidenceSourceIds: expect.arrayContaining(["source-clickfunnels-home", "source-clickfunnels-pricing"]),
        }),
      ]),
    );
    expect(payload.competitors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "competitor-clickfunnels",
          sourceIds: expect.arrayContaining(["source-clickfunnels-home", "source-clickfunnels-pricing"]),
          seoKeywords: expect.arrayContaining(["ClickFunnels alternative", "ClickFunnels competitors"]),
          deepDive: expect.objectContaining({
            title: "How Bumpgrade maps the ClickFunnels competitors category",
          }),
        }),
      ]),
    );
  });

  test("sitemap and robots keep comparison routes crawlable", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapXml = await sitemap.text();
    expect(sitemapXml).toContain("https://bumpgrade.com/compare");
    expect(sitemapXml).toContain("https://bumpgrade.com/compare/clickfunnels-alternative");
    expect(sitemapXml).toContain("https://bumpgrade.com/compare/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/content/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/agent-docs");
    expect(sitemapXml).toContain("https://bumpgrade.com/agent-docs/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/mobile-admin/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/mobile-admin/ios/source-data");

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsTxt = await robots.text();
    expect(robotsTxt).toContain("Allow: /");
    expect(robotsTxt).toContain("Disallow: /admin/");
    expect(robotsTxt).toContain("Sitemap: https://bumpgrade.com/sitemap.xml");
  });

  test("feature source data exposes stable feature records", async ({ request }) => {
    const response = await request.get("/features/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.features).toHaveLength(featureCatalog.length);
    expect(payload.features[0]).toEqual(expect.objectContaining({ id: expect.any(String), status: expect.any(String) }));
  });

  test("content source data exposes use cases, resources, and pricing caveats", async ({ request }) => {
    const response = await request.get("/content/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.id).toBe(contentSourceData.id);
    expect(payload.audienceSegments).toHaveLength(audienceSegments.length);
    expect(payload.resourceHubItems).toHaveLength(resourceHubItems.length);
    expect(payload.plannedPricingTracks).toHaveLength(plannedPricingTracks.length);
    expect(payload.routes).toEqual(expect.arrayContaining(["/users", "/resources", "/pricing", "/content/source-data"]));
    expect(payload.audienceSegments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "audience-newsletter-publishers",
          linkedFeatureIds: expect.arrayContaining(["feature-email-automation-crm", "feature-agent-ready-contracts"]),
        }),
      ]),
    );
    expect(payload.resourceHubItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "resource-comparison-hub",
          status: "live",
          evidenceRoutes: expect.arrayContaining(["/compare/source-data"]),
        }),
      ]),
    );
    expect(payload.plannedPricingTracks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "pricing-track-agent",
          notYetClaimed: expect.stringContaining("MCP server packaging"),
        }),
      ]),
    );
    expect(payload.caveat).toContain("does not turn planned product features");
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
        expect.objectContaining({ id: "roadmap-better-auth", status: "shipped", issue: 9 }),
        expect.objectContaining({ id: "roadmap-codex-email", status: "shipped", issue: 10 }),
        expect.objectContaining({ id: "roadmap-stripe-commerce", status: "shipped", issue: 11 }),
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
    expect(payload.attentionItems).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mark-attention-2026-05-18-blocked-valid-stripe-sandbox-secret",
          state: "open",
        }),
      ]),
    );
    expect(payload.attentionItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "mark-attention-2026-05-18-rkmoriarty-auth-alignment",
          state: "open",
          responseInstructions: expect.stringContaining("This page is read-only."),
          responseChannels: expect.arrayContaining([
            expect.objectContaining({ id: "read_only" }),
            expect.objectContaining({ id: "github_issue", label: expect.stringContaining("Issue #61") }),
            expect.objectContaining({ id: "project_email", label: expect.stringContaining("codex@bumpgrade.com") }),
          ]),
        }),
      ]),
    );
    expect(payload.userJourneys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "journey-publisher-plans-first-checkout",
          featureId: "feature-stripe-commerce",
          issueNumbers: [11, 34, 15, 16],
        }),
        expect.objectContaining({
          id: "journey-publisher-checks-mobile-admin",
          featureId: "feature-mobile-admin",
          issueNumbers: [13, 67, 68],
        }),
      ]),
    );
  });

  test("For Mark source data exposes explicit response channels", async ({ request }) => {
    const response = await request.get("/admin/for-mark/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.id).toBe("bumpgrade-admin-for-mark-source-data");
    const attentionItem = payload.attentionItems.find(
      (item: { id: string }) => item.id === "mark-attention-2026-05-18-rkmoriarty-auth-alignment",
    );
    expect(attentionItem).toEqual(
      expect.objectContaining({
        responseInstructions: expect.stringContaining("This page is read-only."),
        responseChannels: expect.arrayContaining([
          expect.objectContaining({
            id: "read_only",
            label: "/admin/for-mark is read-only",
          }),
          expect.objectContaining({
            id: "github_issue",
            label: expect.stringContaining("Issue #61"),
            href: "https://github.com/markitics/bumpgrade/issues/61",
          }),
          expect.objectContaining({
            id: "project_email",
            href: "mailto:codex@bumpgrade.com",
          }),
        ]),
      }),
    );
  });

  test("commerce source data exposes stable payment architecture records", async ({ request }) => {
    const response = await request.get("/commerce/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.id).toBe("bumpgrade-commerce-source-data");
    expect(payload.contract).toEqual(expect.objectContaining({ issue: 11, firstCheckoutIssue: 34 }));
    expect(payload.sandboxCheckout).toEqual(
      expect.objectContaining({
        offer: expect.objectContaining({ priceId: sandboxCheckoutOffer.priceId, unitAmountCents: 900 }),
        confirmation: expect.objectContaining({ required: true, text: checkoutConfirmationText }),
        rawStripeIdsIncluded: false,
      }),
    );
    expect(payload.tables).toHaveLength(commerceTables.length);
    expect(payload.tables).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "commerce_products" }),
        expect.objectContaining({ table: "checkout_intents" }),
        expect.objectContaining({ table: "stripe_webhook_events" }),
        expect.objectContaining({ table: "payment_audit_events" }),
      ]),
    );
  });

  test("agent docs source data exposes stable read contracts and MCP roadmap", async ({ request }) => {
    const response = await request.get("/agent-docs/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.id).toBe("bumpgrade-agent-manifest");
    expect(payload.docs).toHaveLength(agentManifest.docs.length);
    expect(payload.readContracts).toHaveLength(agentManifest.readContracts.length);
    expect(payload.sourceEvidenceRoutes).toHaveLength(agentManifest.sourceEvidenceRoutes.length);
    expect(payload.mcpPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "mcp-resource-features", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-tool-propose-update", status: "planned" }),
      ]),
    );
    expect(payload.readContracts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "read-feature-catalog", route: "/features/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-admin-source", route: "/admin/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-agent-manifest", route: "/agent-docs/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-content-surfaces", route: "/content/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-mobile-admin-contract", route: "/mobile-admin/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-ios-mobile-admin", route: "/mobile-admin/ios/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-android-mobile-admin", route: "/mobile-admin/android/source-data", auth: "public" }),
      ]),
    );
    expect(payload.writeSafetyRules).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Require confirmation, idempotency, stale-state checks"),
        expect.stringContaining("Do not invent pricing"),
      ]),
    );
  });

  test("mobile admin source data splits iOS and Android app slices", async ({ request }) => {
    const response = await request.get("/mobile-admin/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.id).toBe(mobileAdminContract.id);
    expect(payload.parentIssue).toBe(13);
    expect(payload.status).toBe("contract-ready");
    expect(payload.childIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ platform: "ios", issue: 67 }),
        expect.objectContaining({ platform: "android", issue: 68 }),
      ]),
    );
    const iosSlice = payload.childIssues.find((slice: { platform: string }) => slice.platform === "ios");
    expect(iosSlice).toEqual(
      expect.objectContaining({
        status: "simulator-smoke-ready",
        sourceDataRoute: "/mobile-admin/ios/source-data",
        fixturePath: "apps/mobile-admin/fixtures/mobile-admin-contract.json",
        smokeCommand: "npm run mobile:ios:smoke",
      }),
    );
    const androidSlice = payload.childIssues.find((slice: { platform: string }) => slice.platform === "android");
    expect(androidSlice).toEqual(
      expect.objectContaining({
        status: "emulator-smoke-ready",
        sourceDataRoute: "/mobile-admin/android/source-data",
        fixturePath: "apps/mobile-admin/fixtures/mobile-admin-contract.json",
        smokeCommand: "npm run mobile:android:smoke",
      }),
    );
    expect(payload.apiDependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "mobile-api-admin-source", route: "/admin/source-data" }),
        expect.objectContaining({ id: "mobile-api-auth", route: "/api/auth/[...all]", authBoundary: "owner-session" }),
      ]),
    );
    expect(payload.confirmedWriteRules).toEqual(
      expect.arrayContaining([
        expect.stringContaining("first mobile app slices are read-only"),
        expect.stringContaining("same feature, roadmap, commerce, admin, and agent contracts as web"),
      ]),
    );
  });

  test("iOS mobile admin source data exposes scaffold and simulator smoke evidence", async ({ request }) => {
    const response = await request.get("/mobile-admin/ios/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: iosMobileAdminSourceData.id,
        platform: "ios",
        issue: 67,
        status: "simulator-smoke-ready",
        sourceContractRoute: "/mobile-admin/source-data",
        sourceDataRoute: "/mobile-admin/ios/source-data",
        fixturePath: "apps/mobile-admin/fixtures/mobile-admin-contract.json",
        simulatorBundleId: "com.bumpgrade.mobileadmin",
        smokeCommand: "npm run mobile:ios:smoke",
        screenshotPath: "/pr-screenshots/issue-67-ios-mobile-admin-simulator.png",
      }),
    );
    expect(payload.reads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "ios-read-mobile-contract-fixture",
          route: "/mobile-admin/source-data",
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Read-only");
  });

  test("Android mobile admin source data exposes scaffold and emulator smoke evidence", async ({ request }) => {
    const response = await request.get("/mobile-admin/android/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: androidMobileAdminSourceData.id,
        platform: "android",
        issue: 68,
        status: "emulator-smoke-ready",
        sourceContractRoute: "/mobile-admin/source-data",
        sourceDataRoute: "/mobile-admin/android/source-data",
        fixturePath: "apps/mobile-admin/fixtures/mobile-admin-contract.json",
        androidAssetPath: "apps/mobile-admin/android/src/main/assets/mobile-admin-contract.json",
        nativePackage: "com.bumpgrade.mobileadmin",
        defaultAvd: "MusicWebs_API_36",
        smokeCommand: "npm run mobile:android:smoke",
        screenshotPath: "/pr-screenshots/issue-68-android-mobile-admin-emulator.png",
      }),
    );
    expect(payload.reads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "android-read-mobile-contract-fixture",
          route: "/mobile-admin/source-data",
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Read-only");
  });

  test("sandbox checkout API returns redacted preview when Stripe sandbox setup is incomplete", async ({ request }) => {
    const contract = await request.get("/api/commerce/checkout");
    expect(contract.ok()).toBeTruthy();
    const contractPayload = await contract.json();
    expect(contractPayload).toEqual(
      expect.objectContaining({
        id: "bumpgrade-sandbox-checkout-contract",
        mode: "sandbox",
        offer: expect.objectContaining({ priceId: sandboxCheckoutOffer.priceId }),
        redaction: expect.objectContaining({ rawStripeIdsIncluded: false }),
      }),
    );

    const response = await request.post("/api/commerce/checkout", {
      data: {
        confirmationText: checkoutConfirmationText,
        buyerEmail: "sandbox-buyer@example.com",
        idempotencyKey: `playwright-${Date.now()}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "preview",
        redaction: expect.objectContaining({ rawStripeIdsIncluded: false, checkoutUrlIncluded: false }),
      }),
    );
    expect(["missing_or_incomplete_sandbox_secret", "test_environment"]).toContain(payload.reason);
    expect(JSON.stringify(payload)).not.toContain("cs_test_");
  });

  test("stripe webhook stores duplicate-safe redacted test events", async ({ request }) => {
    const eventId = `evt_bumpgrade_playwright_${Date.now()}`;
    const event = {
      id: eventId,
      object: "event",
      api_version: "2026-04-22.dahlia",
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_redacted_by_route",
          object: "checkout.session",
          client_reference_id: "checkout-intent-playwright",
          payment_status: "paid",
          status: "complete",
          metadata: {
            checkout_intent_id: "checkout-intent-playwright",
            product_id: sandboxCheckoutOffer.productId,
            price_id: sandboxCheckoutOffer.priceId,
            audit_correlation_id: "audit-playwright",
          },
        },
      },
    };

    const first = await request.post("/api/stripe/webhook", {
      headers: { "x-bumpgrade-test-webhook": "allow" },
      data: event,
    });
    expect(first.ok()).toBeTruthy();
    await expect(first.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        received: true,
        duplicate: false,
        eventType: "checkout.session.completed",
        checkoutIntentUpdated: false,
        redaction: expect.objectContaining({ rawStripeIdsIncluded: false }),
      }),
    );

    const second = await request.post("/api/stripe/webhook", {
      headers: { "x-bumpgrade-test-webhook": "allow" },
      data: event,
    });
    expect(second.ok()).toBeTruthy();
    await expect(second.json()).resolves.toEqual(expect.objectContaining({ ok: true, duplicate: true }));
  });

  test("allowlisted owner can sign in and open protected admin surfaces", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Auth flow is covered once on the desktop project.");
    await signInOrCreateOwner(page);

    await page.goto("/admin/roadmap");
    await expect(page.getByRole("heading", { name: /Roadmap command center/i })).toBeVisible();

    await page.goto("/admin/for-mark");
    await expect(page.getByRole("heading", { name: /Non-blocking attention/i })).toBeVisible();
    await expect(page.locator("header.site-header").getByRole("link", { name: "Log in / sign up", exact: true })).toHaveCount(0);
  });

  test("unverified owner sees email verification actions instead of technical denial copy", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Auth flow is covered once on the desktop project.");
    await signInOrCreateAccount(page, "unverified-owner@example.com", "BumpgradeLocal123!", "Unverified Owner");

    await page.goto("/admin/for-mark");
    await expect(page.getByRole("heading", { name: /Email not yet verified/i })).toBeVisible();
    await expect(page.getByText("Confirm your Bumpgrade owner email")).toBeVisible();
    await expect(page.getByRole("link", { name: /Open Gmail/i })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("email_unverified");

    const resendButton = page.locator(".verification-actions button");
    await expect(resendButton).toBeVisible();
    const resendText = (await resendButton.textContent()) ?? "";
    if (/Resend confirmation email/i.test(resendText)) {
      await resendButton.click();
    }
    await expect(resendButton).toContainText(/Resend available in/i);
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

    await page.locator("main").click({ position: { x: 16, y: 320 } });
    await expect(panel).toBeHidden();

    await page.getByLabel("Open navigation").click();
    await panel.getByRole("link", { name: "Features", exact: true }).click();
    await expect(page).toHaveURL(/\/features$/);
    await expect(panel).toBeHidden();
  });
});
