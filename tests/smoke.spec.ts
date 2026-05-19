import { expect, test, type Page } from "@playwright/test";
import { createEmailVerificationToken } from "better-auth/api";

import { affiliateProgram, affiliateReferralsSourceData } from "../src/lib/affiliate-referrals";
import { agentManifest } from "../src/lib/agent-manifest";
import { analyticsDashboard, analyticsExperimentsSourceData } from "../src/lib/analytics-experiments";
import { audienceAutomationSourceData, audienceAutomationWorkspace } from "../src/lib/audience-automation";
import { comparisonSeoTargets, competitors } from "../src/lib/comparison-data";
import { audienceSegments, contentSourceData, plannedPricingTracks, resourceHubItems } from "../src/lib/content-surfaces";
import { commerceTables } from "../src/lib/commerce";
import { checkoutOfferSourceData, checkoutOfferStack } from "../src/lib/checkout-offers";
import { featureCatalog } from "../src/lib/feature-catalog";
import { editableDraftCapability, funnelSourceData, seededFunnel } from "../src/lib/funnels";
import { mobileAdminContract } from "../src/lib/mobile-admin";
import { androidMobileAdminSourceData } from "../src/lib/mobile-admin-android";
import { iosMobileAdminSourceData } from "../src/lib/mobile-admin-ios";
import { productAccessCatalog, productAccessSourceData } from "../src/lib/product-access";
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
  { path: "/funnels/indie-launch-sandbox", heading: "Indie launch sandbox funnel" },
  { path: "/offers/indie-launch-stack", heading: "Indie launch checkout offer stack" },
  { path: "/products/indie-launch-library", heading: "Indie launch product and access library" },
  { path: "/audience/indie-launch-waitlist", heading: "Indie launch waitlist and nurture preview" },
  { path: "/analytics/indie-launch-dashboard", heading: "Indie launch analytics and experiment preview" },
  { path: "/affiliates/indie-launch-partners", heading: "Indie launch partner program preview" },
  { path: "/commerce/checkout/success", heading: "sandbox checkout returned successfully" },
  { path: "/commerce/checkout/cancel", heading: "sandbox checkout was canceled" },
  { path: "/login", heading: "Publisher login is backed by Better Auth" },
  { path: "/admin/roadmap", heading: "Owner access is required" },
  { path: "/admin/work-log", heading: "Owner access is required" },
  { path: "/admin/user-journeys", heading: "Owner access is required" },
  { path: "/admin/funnels", heading: "Owner access is required" },
  { path: "/admin/funnels/funnel-draft-indie-launch-working-copy/preview", heading: "Owner access is required" },
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
    expect(sitemapXml).toContain("https://bumpgrade.com/funnels/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/funnels/indie-launch-sandbox");
    expect(sitemapXml).toContain("https://bumpgrade.com/offers/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/offers/indie-launch-stack");
    expect(sitemapXml).toContain("https://bumpgrade.com/products/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/products/indie-launch-library");
    expect(sitemapXml).toContain("https://bumpgrade.com/audience/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/audience/indie-launch-waitlist");
    expect(sitemapXml).toContain("https://bumpgrade.com/analytics/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/analytics/indie-launch-dashboard");
    expect(sitemapXml).toContain("https://bumpgrade.com/affiliates/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/affiliates/indie-launch-partners");
    expect(sitemapXml).toContain("https://bumpgrade.com/agent-docs");
    expect(sitemapXml).toContain("https://bumpgrade.com/agent-docs/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/mobile-admin/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/mobile-admin/ios/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/admin/funnels");

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

  test("funnel source data exposes a seeded three-step draft funnel", async ({ request, page }) => {
    const response = await request.get("/funnels/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: funnelSourceData.id,
        status: "read-contract-and-owner-preview-ready",
        issue: 95,
        parentIssue: 14,
      }),
    );
    expect(payload.routes).toEqual(expect.arrayContaining(["/funnels/source-data", "/funnels/indie-launch-sandbox"]));
    expect(payload.adminRoutes).toEqual(expect.arrayContaining(["/admin/funnels", "/admin/funnels/:draftId/preview"]));
    expect(payload.editableDraftCapability).toEqual(
      expect.objectContaining({
        id: editableDraftCapability.id,
        status: "owner-session-preview-ready",
        issue: 95,
        adminRoute: "/admin/funnels",
        previewRoutePattern: "/admin/funnels/:draftId/preview",
        createEndpoint: "/api/admin/funnels/drafts",
        editEndpoint: "/api/admin/funnels/drafts",
        auth: "owner-session",
      }),
    );
    expect(payload.funnels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: seededFunnel.id,
          slug: seededFunnel.slug,
          status: "draft",
          revisionId: seededFunnel.revisionId,
          steps: expect.arrayContaining([
            expect.objectContaining({ id: "funnel-step-indie-launch-opt-in", order: 1, kind: "opt_in" }),
            expect.objectContaining({ id: "funnel-step-indie-launch-sales", order: 2, kind: "sales" }),
            expect.objectContaining({ id: "funnel-step-indie-launch-thank-you", order: 3, kind: "thank_you" }),
          ]),
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Issue #79 is read-only");
    expect(payload.caveat).toContain("owner-gated private draft preview");

    await page.goto("/funnels/indie-launch-sandbox");
    await expect(page.getByRole("heading", { name: /Indie launch sandbox funnel/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Three-step launch funnel scaffold/i })).toBeVisible();
    await expect(page.locator("#warm-list-opt-in")).toContainText("Warm list opt-in");
    await expect(page.locator("#offer-sales-page")).toContainText("Offer sales page");
    await expect(page.locator("#thank-you-delivery")).toContainText("Thank-you and delivery");
  });

  test("checkout offer source data exposes a primary offer, bump, upsell, and downsell", async ({ request, page }) => {
    const response = await request.get("/offers/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: checkoutOfferSourceData.id,
        status: "confirmed-sandbox-checkout-start-ready",
        issue: 99,
        parentIssue: 15,
      }),
    );
    expect(payload.routes).toEqual(expect.arrayContaining(["/offers/source-data", "/offers/indie-launch-stack"]));
    expect(payload.sandboxCheckout).toEqual(
      expect.objectContaining({
        endpoint: "/api/commerce/checkout",
        confirmationRequired: true,
        supportsOrderBumps: true,
        allowedOrderBumpPriceIds: expect.arrayContaining(["price-launch-checklist-bump-usd"]),
        rawStripeIdsIncluded: false,
        liveModeEnabled: false,
      }),
    );
    expect(payload.stacks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: checkoutOfferStack.id,
          slug: checkoutOfferStack.slug,
          revisionId: checkoutOfferStack.revisionId,
          primaryOffer: expect.objectContaining({ id: "offer-primary-sandbox-launch-pass", kind: "primary" }),
          orderBumps: expect.arrayContaining([
            expect.objectContaining({ id: "offer-bump-launch-checklist", kind: "order_bump" }),
          ]),
          postPurchasePath: expect.objectContaining({
            offers: expect.arrayContaining([
              expect.objectContaining({ id: "offer-upsell-launch-accelerator", kind: "upsell" }),
              expect.objectContaining({ id: "offer-downsell-launch-review", kind: "downsell" }),
            ]),
          }),
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Issue #99 allows a confirmed sandbox Checkout Session start");
    expect(payload.caveat).toContain("confirmed sandbox checkout start");

    await page.goto("/offers/indie-launch-stack");
    await expect(page.getByRole("heading", { name: /Indie launch checkout offer stack/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Choose the bump, confirm the checkout/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Primary offer, order bump, upsell, and downsell/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch checklist bump" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch accelerator upsell" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch review downsell" })).toBeVisible();
    await page.getByLabel(/Launch checklist bump/i).check();
    await page.getByLabel(/Exact confirmation text/i).fill(checkoutConfirmationText);
    await page.getByRole("button", { name: /Start sandbox checkout/i }).click();
    await expect(page.getByText(/Preview response/i)).toBeVisible();
    await expect(page.getByText(/\$28\.00 total/i)).toBeVisible();
  });

  test("product access source data exposes seeded products, assets, and entitlement templates", async ({ request, page }) => {
    const response = await request.get("/products/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: productAccessSourceData.id,
        status: "read-contract-ready",
        issue: 83,
        parentIssue: 16,
      }),
    );
    expect(payload.routes).toEqual(expect.arrayContaining(["/products/source-data", "/products/indie-launch-library"]));
    expect(payload.catalogs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: productAccessCatalog.id,
          slug: productAccessCatalog.slug,
          revisionId: productAccessCatalog.revisionId,
          products: expect.arrayContaining([
            expect.objectContaining({ id: "product-launch-checklist-download", kind: "digital_download" }),
            expect.objectContaining({ id: "product-launch-course-lite", kind: "course" }),
            expect.objectContaining({ id: "product-launch-membership", kind: "membership" }),
            expect.objectContaining({ id: "product-launch-coaching-session", kind: "coaching_service" }),
            expect.objectContaining({ id: "product-launch-webinar-seat", kind: "event_webinar" }),
            expect.objectContaining({ id: "product-launch-bundle", kind: "bundle" }),
          ]),
          accessRules: expect.arrayContaining([
            expect.objectContaining({ id: "access-rule-download-after-paid-webhook" }),
            expect.objectContaining({ id: "access-rule-membership-active-subscription" }),
          ]),
          entitlementTemplates: expect.arrayContaining([
            expect.objectContaining({ id: "entitlement-template-launch-download" }),
            expect.objectContaining({ id: "entitlement-template-launch-bundle" }),
          ]),
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Issue #83 is read-only");
    expect(payload.caveat).toContain("does not expose private R2 keys");

    await page.goto("/products/indie-launch-library");
    await expect(page.getByRole("heading", { name: /Indie launch product and access library/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Downloads, courses, memberships, services, events, and bundles/i })).toBeVisible();
    await expect(page.getByText("Launch checklist download")).toBeVisible();
    await expect(page.getByText("Launch course lite")).toBeVisible();
    await expect(page.getByText("Launch membership")).toBeVisible();
  });

  test("audience automation source data exposes opt-in, tags, sequences, and automation rules", async ({ request, page }) => {
    const response = await request.get("/audience/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: audienceAutomationSourceData.id,
        status: "read-contract-ready",
        issue: 85,
        parentIssue: 17,
      }),
    );
    expect(payload.routes).toEqual(expect.arrayContaining(["/audience/source-data", "/audience/indie-launch-waitlist"]));
    expect(payload.workspaces).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: audienceAutomationWorkspace.id,
          slug: audienceAutomationWorkspace.slug,
          revisionId: audienceAutomationWorkspace.revisionId,
          forms: expect.arrayContaining([
            expect.objectContaining({
              id: "opt-in-form-indie-launch-waitlist",
              leadMagnetId: "lead-magnet-launch-checklist",
            }),
          ]),
          tags: expect.arrayContaining([
            expect.objectContaining({ id: "tag-lead-magnet-launch-checklist" }),
            expect.objectContaining({ id: "tag-source-funnel-indie-launch" }),
          ]),
          sequences: expect.arrayContaining([
            expect.objectContaining({ id: "sequence-indie-launch-nurture", linkedFormId: "opt-in-form-indie-launch-waitlist" }),
          ]),
          automations: expect.arrayContaining([
            expect.objectContaining({ id: "automation-enroll-waitlist-nurture" }),
          ]),
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Issue #85 is read-only");
    expect(payload.caveat).toContain("does not store subscribers");

    await page.goto("/audience/indie-launch-waitlist");
    await expect(page.getByRole("heading", { name: /Indie launch waitlist and nurture preview/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Indie launch waitlist opt-in/i })).toBeVisible();
    await expect(page.getByText("Launch checklist lead magnet")).toBeVisible();
    await expect(page.getByText("Indie launch nurture sequence")).toBeVisible();
  });

  test("analytics source data exposes events, metrics, and experiment definitions", async ({ request, page }) => {
    const response = await request.get("/analytics/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: analyticsExperimentsSourceData.id,
        status: "read-contract-ready",
        issue: 87,
        parentIssue: 18,
      }),
    );
    expect(payload.routes).toEqual(expect.arrayContaining(["/analytics/source-data", "/analytics/indie-launch-dashboard"]));
    expect(payload.dashboards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: analyticsDashboard.id,
          slug: analyticsDashboard.slug,
          revisionId: analyticsDashboard.revisionId,
          events: expect.arrayContaining([
            expect.objectContaining({ id: "event-funnel-page-view", kind: "page_view" }),
            expect.objectContaining({ id: "event-audience-opt-in-created", kind: "opt_in" }),
            expect.objectContaining({ id: "event-purchase-completed", kind: "purchase" }),
          ]),
          metrics: expect.arrayContaining([
            expect.objectContaining({ id: "metric-funnel-opt-in-rate" }),
            expect.objectContaining({ id: "metric-gross-revenue" }),
          ]),
          experiments: expect.arrayContaining([
            expect.objectContaining({ id: "experiment-opt-in-hero-promise" }),
          ]),
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Issue #87 is read-only");
    expect(payload.caveat).toContain("does not collect live events");

    await page.goto("/analytics/indie-launch-dashboard");
    await expect(page.getByRole("heading", { name: /Indie launch analytics and experiment preview/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Step-level conversion metrics use fixture counts/i })).toBeVisible();
    await expect(page.getByText("Opt-in hero promise test")).toBeVisible();
    await expect(page.getByText("No automated winners")).toBeVisible();
  });

  test("affiliate source data exposes partners, referral links, commissions, and payout review", async ({ request, page }) => {
    const response = await request.get("/affiliates/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: affiliateReferralsSourceData.id,
        status: "read-contract-ready",
        issue: 89,
        parentIssue: 19,
      }),
    );
    expect(payload.routes).toEqual(expect.arrayContaining(["/affiliates/source-data", "/affiliates/indie-launch-partners"]));
    expect(payload.programs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: affiliateProgram.id,
          slug: affiliateProgram.slug,
          revisionId: affiliateProgram.revisionId,
          partners: expect.arrayContaining([
            expect.objectContaining({ id: "affiliate-partner-launch-circle", status: "approved" }),
            expect.objectContaining({ id: "affiliate-partner-template-studio", status: "review" }),
          ]),
          referralLinks: expect.arrayContaining([
            expect.objectContaining({ id: "ref-link-launch-circle-waitlist", code: "LAUNCHCIRCLE" }),
          ]),
          commissionRules: expect.arrayContaining([
            expect.objectContaining({ id: "commission-rule-launch-pass-30" }),
            expect.objectContaining({ id: "commission-rule-refund-holdback" }),
          ]),
          commissionLedger: expect.arrayContaining([
            expect.objectContaining({ id: "commission-ledger-launch-pass-fixture", status: "approved_pending_payout" }),
            expect.objectContaining({ id: "commission-ledger-self-referral-review", status: "review_required" }),
          ]),
          payoutBatches: expect.arrayContaining([
            expect.objectContaining({ id: "payout-batch-indie-launch-may-preview", status: "review_required" }),
          ]),
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Issue #89 is read-only");
    expect(payload.caveat).toContain("does not track live clicks");

    await page.goto("/affiliates/indie-launch-partners");
    await expect(page.getByRole("heading", { name: /Indie launch partner program preview/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Partner links resolve to stable draft attribution rules/i })).toBeVisible();
    await expect(page.locator(".admin-pill").filter({ hasText: /^LAUNCHCIRCLE$/ })).toBeVisible();
    await expect(page.getByText("Possible self-referral")).toBeVisible();
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
        expect.objectContaining({
          id: "journey-publisher-previews-audience-automation",
          featureId: "feature-email-automation-crm",
          issueNumbers: [17, 85],
        }),
        expect.objectContaining({
          id: "journey-publisher-previews-analytics-experiments",
          featureId: "feature-analytics-testing",
          issueNumbers: [18, 87],
        }),
        expect.objectContaining({
          id: "journey-publisher-previews-affiliate-referrals",
          featureId: "feature-affiliates-referrals",
          issueNumbers: [19, 89],
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
        supportsOrderBumps: true,
        orderBumps: expect.arrayContaining([
          expect.objectContaining({ priceId: "price-launch-checklist-bump-usd", unitAmountCents: 1900 }),
        ]),
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
        expect.objectContaining({ id: "mcp-resource-checkout-offers", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-resource-product-access", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-resource-audience-automation", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-resource-analytics-experiments", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-resource-affiliate-referrals", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-tool-create-funnel-draft", status: "planned" }),
        expect.objectContaining({ id: "mcp-tool-propose-update", status: "planned" }),
      ]),
    );
    expect(payload.readContracts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "read-feature-catalog", route: "/features/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-admin-source", route: "/admin/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-agent-manifest", route: "/agent-docs/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-content-surfaces", route: "/content/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-funnel-contract", route: "/funnels/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-admin-draft-funnels", route: "/admin/funnels", auth: "owner-session" }),
        expect.objectContaining({ id: "read-checkout-offer-stack", route: "/offers/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-product-access-catalog", route: "/products/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-audience-automation", route: "/audience/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-analytics-experiments", route: "/analytics/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-affiliate-referrals", route: "/affiliates/source-data", auth: "public" }),
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
        orderBumpPriceIds: ["price-launch-checklist-bump-usd"],
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
        selectedOrderBumpPriceIds: ["price-launch-checklist-bump-usd"],
        totalAmountCents: 2800,
        lineItems: expect.arrayContaining([
          expect.objectContaining({ priceId: sandboxCheckoutOffer.priceId, unitAmountCents: 900 }),
          expect.objectContaining({ priceId: "price-launch-checklist-bump-usd", unitAmountCents: 1900 }),
        ]),
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

    const seedResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "seed",
        idempotencyKey: "playwright-seed-indie-launch-working-copy",
        return: "json",
      },
    });
    expect(seedResponse.ok(), await seedResponse.text()).toBeTruthy();
    const seedPayload = await seedResponse.json();
    expect(seedPayload).toEqual(
      expect.objectContaining({
        ok: true,
        mode: "seed",
        draft: expect.objectContaining({
          id: "funnel-draft-indie-launch-working-copy",
          steps: expect.arrayContaining([
            expect.objectContaining({ order: 1, kind: "opt_in" }),
            expect.objectContaining({ order: 2, kind: "sales" }),
            expect.objectContaining({ order: 3, kind: "thank_you" }),
          ]),
        }),
      }),
    );

    const updateResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "update-step",
        draftId: "funnel-draft-indie-launch-working-copy",
        stepId: "funnel-draft-indie-launch-working-copy-opt_in-1",
        title: "Warm list opt-in edited",
        goal: "Capture qualified subscribers with clearer launch promise copy.",
        kind: "opt_in",
        idempotencyKey: "playwright-update-warm-list-opt-in",
        return: "json",
      },
    });
    expect(updateResponse.ok(), await updateResponse.text()).toBeTruthy();
    const updatePayload = await updateResponse.json();
    expect(updatePayload.draft.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "funnel-draft-indie-launch-working-copy-opt_in-1",
          title: "Warm list opt-in edited",
          goal: "Capture qualified subscribers with clearer launch promise copy.",
        }),
      ]),
    );

    const moveResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "move-step",
        draftId: "funnel-draft-indie-launch-working-copy",
        stepId: "funnel-draft-indie-launch-working-copy-opt_in-1",
        direction: "down",
        idempotencyKey: "playwright-move-warm-list-opt-in-down",
        return: "json",
      },
    });
    expect(moveResponse.ok(), await moveResponse.text()).toBeTruthy();
    const movePayload = await moveResponse.json();
    expect(movePayload.draft.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "funnel-draft-indie-launch-working-copy-sales-2", order: 1 }),
        expect.objectContaining({ id: "funnel-draft-indie-launch-working-copy-opt_in-1", order: 2 }),
      ]),
    );

    await page.goto("/admin/funnels");
    await expect(page.getByRole("heading", { name: /Draft funnel builder backed by D1/i })).toBeVisible();
    const draftCard = page.getByRole("article").filter({ hasText: "funnel-draft-indie-launch-working-copy" });
    await expect(draftCard.getByRole("heading", { name: "Indie launch working draft" })).toBeVisible();
    await expect(draftCard.locator(".admin-step-list").filter({ hasText: "Warm list opt-in edited" })).toBeVisible();
    await expect(draftCard.locator(".admin-step-list > div").first()).toContainText("Offer sales page");
    await expect(draftCard.getByRole("link", { name: /Preview draft/i })).toHaveAttribute(
      "href",
      "/admin/funnels/funnel-draft-indie-launch-working-copy/preview",
    );

    await page.goto("/admin/funnels/funnel-draft-indie-launch-working-copy/preview");
    await expect(page.getByRole("heading", { name: "Indie launch working draft" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Current private funnel sequence" })).toBeVisible();
    await expect(page.locator(".roadmap-grid > article").first()).toContainText("Offer sales page");
    await expect(page.getByRole("heading", { name: "Warm list opt-in edited" })).toBeVisible();
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

  test("navigation does not server-render a false signed-out CTA before session hydration", async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Server HTML is checked once on desktop.");

    const response = await request.get("/admin/for-mark");
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html).not.toContain('class="nav-cta"');
    expect(html).toContain("Owner access is required");
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
