import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { createEmailVerificationToken } from "better-auth/api";

import {
  affiliateCommissionLedgerConfirmationText,
  affiliateCommissionReviewActionConfirmationText,
} from "../src/lib/affiliate-commission-ledger";
import { affiliateProgram, affiliateReferralsSourceData } from "../src/lib/affiliate-referrals";
import { agentManifest } from "../src/lib/agent-manifest";
import { analyticsDashboard, analyticsExperimentsSourceData } from "../src/lib/analytics-experiments";
import {
  audienceBroadcastPreviewSafetyIssue,
  audienceBroadcastPreviewSafetyStatus,
  audienceBroadcastQueueReadinessIssue,
  audienceBroadcastQueueReadinessStatus,
  audienceBroadcastReadinessIssue,
  audienceBroadcastReadinessStatus,
  audienceBroadcastScheduleIntentApiRoute,
  audienceBroadcastScheduleIntentConfirmationText,
  audienceBroadcastScheduleIntentIssue,
  audienceBroadcastScheduleIntentStatus,
} from "../src/lib/audience-broadcasts";
import { audienceCrmTimelineConfirmationText } from "../src/lib/audience-crm";
import { audienceAutomationSourceData, audienceAutomationWorkspace } from "../src/lib/audience-automation";
import { comparisonSeoTargets, competitors } from "../src/lib/comparison-data";
import { audienceSegments, contentSourceData, plannedPricingTracks, resourceHubItems } from "../src/lib/content-surfaces";
import { commerceTables } from "../src/lib/commerce";
import { checkoutOfferSourceData, checkoutOfferStack } from "../src/lib/checkout-offers";
import { featureCatalog } from "../src/lib/feature-catalog";
import {
  draftFunnelCheckoutLinkConfirmationText,
  draftFunnelPublishConfirmationText,
  draftFunnelTemplateCreationConfirmationText,
} from "../src/lib/funnel-drafts";
import {
  checkoutLinkingCapability,
  editableDraftCapability,
  funnelSourceData,
  publicFunnelCheckoutStartCapability,
  seededFunnel,
  templateDraftCreationCapability,
} from "../src/lib/funnels";
import { mobileAdminContract } from "../src/lib/mobile-admin";
import { androidMobileAdminSourceData } from "../src/lib/mobile-admin-android";
import {
  mobileAdminDashboardIssue,
  mobileAdminDashboardRoute,
  mobileAdminDashboardStatus,
} from "../src/lib/mobile-admin-dashboard";
import { iosMobileAdminSourceData } from "../src/lib/mobile-admin-ios";
import { customerProductEntitlementLookupSummary } from "../src/lib/customer-product-entitlements";
import {
  productAssetUploadConfirmationText,
  productAssetUploadIntentStatus,
  productAssetUploadMaxBytes,
} from "../src/lib/product-asset-uploads";
import { productAccessCatalog, productAccessSourceData } from "../src/lib/product-access";
import { productDownloadTokenSummary } from "../src/lib/product-download-tokens";
import {
  productEntitlementRevocationIntentIssue,
  productEntitlementRevocationIntentStatus,
} from "../src/lib/product-entitlement-inspection";
import { postPurchaseDecisionConfirmationText } from "../src/lib/post-purchase-decisions";
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
  { path: "/products/entitlements", heading: "Customer product access lookup" },
  { path: "/audience/indie-launch-waitlist", heading: "Indie launch waitlist and nurture preview" },
  { path: "/analytics/indie-launch-dashboard", heading: "Indie launch analytics and experiment preview" },
  { path: "/affiliates/indie-launch-partners", heading: "Indie launch partner program preview" },
  { path: "/commerce/checkout/success", heading: "sandbox checkout returned successfully" },
  { path: "/commerce/checkout/cancel", heading: "sandbox checkout was canceled" },
  { path: "/login", heading: "Publisher login is backed by Better Auth" },
  { path: "/admin/roadmap", heading: "Owner access is required" },
  { path: "/admin/work-log", heading: "Owner access is required" },
  { path: "/admin/user-journeys", heading: "Owner access is required" },
  { path: "/admin/audience", heading: "Owner access is required" },
  { path: "/admin/funnels", heading: "Owner access is required" },
  { path: "/admin/funnels/funnel-draft-indie-launch-working-copy/preview", heading: "Owner access is required" },
  { path: "/admin/products", heading: "Owner access is required" },
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

async function postCheckoutSessionWebhook(
  request: APIRequestContext,
  input: {
    checkoutIntentId: string;
    eventId: string;
    type: "checkout.session.completed" | "checkout.session.expired";
    paymentStatus?: "paid" | "unpaid";
    status?: "complete" | "expired";
  },
) {
  const event = {
    id: input.eventId,
    object: "event",
    api_version: "2026-04-22.dahlia",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    type: input.type,
    data: {
      object: {
        id: "cs_test_redacted_by_route",
        object: "checkout.session",
        client_reference_id: input.checkoutIntentId,
        payment_status: input.paymentStatus ?? "paid",
        status: input.status ?? "complete",
        metadata: {
          checkout_intent_id: input.checkoutIntentId,
          product_id: sandboxCheckoutOffer.productId,
          price_id: sandboxCheckoutOffer.priceId,
          audit_correlation_id: "audit-playwright-product-inspection",
        },
      },
    },
  };

  const webhook = await request.post("/api/stripe/webhook", {
    headers: { "x-bumpgrade-test-webhook": "allow" },
    data: event,
  });
  expect(webhook.ok(), await webhook.text()).toBeTruthy();
  return webhook.json();
}

async function grantSandboxProductEntitlements(request: APIRequestContext, buyerEmail: string) {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
  const checkout = await request.post("/api/commerce/checkout", {
    headers: { "x-bumpgrade-test-checkout-write": "allow" },
    data: {
      confirmationText: checkoutConfirmationText,
      orderBumpPriceIds: ["price-launch-checklist-bump-usd"],
      buyerEmail,
      idempotencyKey: `playwright-product-entitlements-${suffix}`,
    },
  });
  expect(checkout.ok(), await checkout.text()).toBeTruthy();
  const checkoutPayload = await checkout.json();
  expect(checkoutPayload.checkoutIntentId).toEqual(expect.stringMatching(/^checkout-intent-/));

  const eventId = `evt_bumpgrade_product_inspection_${suffix.replaceAll("-", "_")}`;
  const webhookPayload = await postCheckoutSessionWebhook(request, {
    checkoutIntentId: checkoutPayload.checkoutIntentId,
    eventId,
    type: "checkout.session.completed",
  });
  expect(webhookPayload).toEqual(
    expect.objectContaining({
      ok: true,
      duplicate: false,
      entitlementGrantsCreated: 2,
    }),
  );

  return {
    buyerEmail,
    eventId,
    checkoutIntentId: checkoutPayload.checkoutIntentId as string,
  };
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
    expect(sitemapXml).toContain("https://bumpgrade.com/products/entitlements");
    expect(sitemapXml).toContain("https://bumpgrade.com/api/products/entitlements");
    expect(sitemapXml).toContain("https://bumpgrade.com/api/products/download-tokens");
    expect(sitemapXml).toContain("https://bumpgrade.com/audience/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/audience/indie-launch-waitlist");
    expect(sitemapXml).toContain("https://bumpgrade.com/analytics/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/analytics/indie-launch-dashboard");
    expect(sitemapXml).toContain("https://bumpgrade.com/affiliates/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/affiliates/indie-launch-partners");
    expect(sitemapXml).toContain("https://bumpgrade.com/agent-docs");
    expect(sitemapXml).toContain("https://bumpgrade.com/agent-docs/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/mobile-admin/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/mobile-admin/dashboard/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/mobile-admin/ios/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/mobile-admin/android/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/admin/funnels");
    expect(sitemapXml).toContain("https://bumpgrade.com/admin/products");

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
        status: "public-funnel-checkout-start-ready",
        issue: 165,
        parentIssue: 14,
      }),
    );
    expect(payload.routes).toEqual(expect.arrayContaining(["/funnels/source-data", "/api/commerce/checkout", "/funnels/indie-launch-sandbox"]));
    expect(payload.adminRoutes).toEqual(expect.arrayContaining(["/admin/funnels", "/admin/funnels/:draftId/preview"]));
    expect(payload.editableDraftCapability).toEqual(
      expect.objectContaining({
        id: editableDraftCapability.id,
        status: "owner-session-publish-ready",
        issue: 135,
        adminRoute: "/admin/funnels",
        previewRoutePattern: "/admin/funnels/:draftId/preview",
        createEndpoint: "/api/admin/funnels/drafts",
        editEndpoint: "/api/admin/funnels/drafts",
        publishEndpoint: "/api/admin/funnels/drafts",
        checkoutLinkEndpoint: "/api/admin/funnels/drafts",
        auth: "owner-session",
      }),
    );
    expect(payload.publishedD1Funnels).toEqual(expect.any(Array));
    expect(payload.privateDraftsIncluded).toBe(false);
    expect(payload.rawOwnerDataIncluded).toBe(false);
    expect(payload.templateDraftCreationCapability).toEqual(
      expect.objectContaining({
        id: templateDraftCreationCapability.id,
        status: "owner-session-confirmed-write-ready",
        issue: 161,
        adminRoute: "/admin/funnels",
        createEndpoint: "/api/admin/funnels/drafts",
        auth: "owner-session",
        confirmationRequired: true,
        idempotencyRequired: true,
      }),
    );
    expect(payload.checkoutLinkingCapability).toEqual(
      expect.objectContaining({
        id: checkoutLinkingCapability.id,
        status: "owner-session-confirmed-write-ready",
        issue: 163,
        adminRoute: "/admin/funnels",
        createEndpoint: "/api/admin/funnels/drafts",
        auth: "owner-session",
        confirmationRequired: true,
        idempotencyRequired: true,
        staleRevisionRequired: true,
        liveBillingEnabled: false,
      }),
    );
    expect(payload.publicFunnelCheckoutStartCapability).toEqual(
      expect.objectContaining({
        id: publicFunnelCheckoutStartCapability.id,
        status: "sandbox-checkout-start-ready",
        issue: 165,
        publicRoutePattern: "/funnels/:slug",
        checkoutEndpoint: "/api/commerce/checkout",
        requiresPublishedFunnel: true,
        requiresCheckoutLink: true,
        confirmationRequired: true,
        idempotencyRequired: true,
        supportsOrderBumps: true,
        liveBillingEnabled: false,
        rawStripeIdsIncluded: false,
      }),
    );
    expect(payload.templateLibraryIssue).toBe(159);
    expect(payload.stableIds).toEqual(
      expect.arrayContaining([
        "funnelTemplateId",
        "funnelBlockTemplateId",
        "funnelCheckoutLinkId",
        "checkoutIntentId",
        "checkoutOfferStackId",
        "offerId",
      ]),
    );
    expect(payload.templates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "template-launch-sales-stack",
          title: "Launch sales funnel",
          draftCreation: "owner-session-confirmed-write",
          steps: expect.arrayContaining([
            expect.objectContaining({ order: 1, kind: "opt_in" }),
            expect.objectContaining({ order: 2, kind: "sales" }),
            expect.objectContaining({ order: 3, kind: "thank_you" }),
          ]),
        }),
      ]),
    );
    expect(payload.blockLibrary).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "block-template-proof",
          kind: "proof",
          agentEditable: true,
        }),
        expect.objectContaining({
          id: "block-template-checkout",
          kind: "checkout",
          agentEditable: false,
        }),
      ]),
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
    expect(payload.caveat).toContain("exact-confirmed public publishing");
    expect(payload.caveat).toContain("owner-session checkout-offer linking");
    expect(payload.caveat).toContain("public sandbox checkout start rendering");
    expect(payload.caveat).toContain("Direct agent template creation");

    await page.goto("/funnels/indie-launch-sandbox");
    await expect(page.getByRole("heading", { name: /Indie launch sandbox funnel/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Three-step launch funnel scaffold/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reusable funnel shapes before template writes exist/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reusable page blocks with write boundaries/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Launch sales funnel/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Checkout handoff/i }).last()).toBeVisible();
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
        status: "post-purchase-decision-ready",
        issue: 117,
        parentIssue: 15,
      }),
    );
    expect(payload.routes).toEqual(
      expect.arrayContaining(["/offers/source-data", "/offers/indie-launch-stack", "/api/commerce/post-purchase-decisions"]),
    );
    expect(payload.sandboxCheckout).toEqual(
      expect.objectContaining({
        endpoint: "/api/commerce/checkout",
        confirmationRequired: true,
        supportsOrderBumps: true,
        supportsReferralAttributionEvidence: true,
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
    expect(payload.writeBoundary).toContain("Issue #111 allows eligible referral click IDs");
    expect(payload.writeBoundary).toContain("Issue #113 allows review-only commission ledger evidence");
    expect(payload.writeBoundary).toContain("Issue #115 allows owner-gated review");
    expect(payload.writeBoundary).toContain("Issue #117 allows non-billing post-purchase");
    expect(payload.postPurchaseDecisions).toEqual(
      expect.objectContaining({
        status: "non-billing-decision-ready",
        issue: 117,
        apiRoute: "/api/commerce/post-purchase-decisions",
      }),
    );
    expect(payload.postPurchaseDecisionSummary).toEqual(
      expect.objectContaining({
        status: "available",
        rawRowsIncluded: false,
        privateDataIncluded: false,
        billingMutationsIncluded: false,
        fulfillmentRowsIncluded: false,
        entitlementRowsIncluded: false,
      }),
    );
    expect(payload.caveat).toContain("confirmed sandbox checkout start");
    expect(payload.caveat).toContain("non-billing post-purchase");
    expect(payload.caveat).toContain("review-only commission ledger evidence");

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
        status: "owner-product-revocation-intents-ready",
        issue: 179,
        parentIssue: 16,
      }),
    );
    expect(payload.routes).toEqual(
      expect.arrayContaining([
        "/products/source-data",
        "/products/indie-launch-library",
        "/products/entitlements",
        "/api/products/entitlements",
        "/api/products/download-tokens",
        "/api/admin/products/assets",
      ]),
    );
    expect(payload.entitlementWrites).toEqual(
      expect.objectContaining({
        status: "sandbox-webhook-grants-ready",
        issue: 101,
        tables: expect.arrayContaining(["product_entitlements", "product_fulfillment_tasks"]),
      }),
    );
    expect(payload.entitlementInspection).toEqual(
      expect.objectContaining({
        status: "owner-product-entitlement-inspection-ready",
        issue: 139,
        parentIssue: 16,
        ownerRoute: "/admin/products",
        redaction: expect.objectContaining({
          privateBuyerDataIncluded: false,
          rawBuyerEmailIncluded: false,
          rawStripeIdsIncluded: false,
          signedUrlsIncluded: false,
        }),
      }),
    );
    expect(payload.customerEntitlementLookup).toEqual(
      expect.objectContaining({
        id: customerProductEntitlementLookupSummary.id,
        status: "customer-product-entitlement-lookup-ready",
        issue: 141,
        route: "/products/entitlements",
        apiRoute: "/api/products/entitlements",
        redaction: expect.objectContaining({
          buyerEmailIncluded: false,
          buyerEmailHashIncluded: false,
          rawStripeIdsIncluded: false,
          sourceStripeEventIdsIncluded: false,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          metadataJsonIncluded: false,
        }),
      }),
    );
    expect(payload.sandboxDownloadTokens).toEqual(
      expect.objectContaining({
        id: productDownloadTokenSummary.id,
        status: "private-r2-download-delivery-ready",
        issue: 146,
        followsIssue: 143,
        redemptionRevalidationIssue: 147,
        apiRoute: "/api/products/download-tokens",
        downloadRoutePrefix: "/api/products/downloads",
        privateAssetBucketBinding: "PRODUCT_ASSETS",
        deliveryMode: "private-r2-fixture",
        privateAssetDelivery: expect.objectContaining({
          r2Backed: true,
          seededAssetId: "asset-launch-checklist-pdf",
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
        }),
        redemptionRevalidation: expect.objectContaining({
          entitlementStatus: "active",
          trustedCheckoutStatuses: ["paid", "completed"],
          checkoutIntentLinkRequired: true,
          assetScopeCheckedBeforeRead: true,
          tokenConsumedAfterPrivateAssetRead: true,
        }),
        redaction: expect.objectContaining({
          buyerEmailIncluded: false,
          buyerEmailHashIncluded: false,
          rawStripeIdsIncluded: false,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          metadataJsonIncluded: false,
        }),
      }),
    );
    expect(payload.ownerAssetUploadIntents).toEqual(
      expect.objectContaining({
        id: "owner-private-product-asset-upload-intents",
        status: productAssetUploadIntentStatus,
        issue: 151,
        parentIssue: 16,
        apiRoute: "/api/admin/products/assets",
        ownerAuthBoundary: "Better Auth owner session",
        confirmation: expect.objectContaining({
          required: true,
          text: productAssetUploadConfirmationText,
        }),
        staleStateCheck: expect.objectContaining({
          required: true,
          field: "expectedCatalogRevisionId",
          currentRevisionId: productAccessCatalog.revisionId,
        }),
        maxPayloadBytes: productAssetUploadMaxBytes,
        privateAssetBucketBinding: "PRODUCT_ASSETS",
        counts: expect.objectContaining({
          uploadRecords: expect.any(Number),
          storedPrivateUploads: expect.any(Number),
        }),
        redaction: expect.objectContaining({
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          rawUploadBodyIncluded: false,
          privateMetadataIncluded: false,
          rawOwnerEmailIncluded: false,
          buyerDataIncluded: false,
        }),
        rawRowsIncluded: false,
      }),
    );
    expect(payload.revocationIntents).toEqual(
      expect.objectContaining({
        id: "product-entitlement-revocation-intent-contract",
        status: productEntitlementRevocationIntentStatus,
        issue: productEntitlementRevocationIntentIssue,
        parentIssue: 16,
        ownerRoute: "/admin/products",
        publicSourceDataRoute: "/products/source-data",
        counts: expect.objectContaining({
          revocationIntents: expect.any(Number),
          dryRunIntents: expect.any(Number),
          destructiveActionsEnabled: 0,
          entitlementMutationsEnabled: 0,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "revocation-intent-launch-download-dry-run",
            productId: "product-launch-checklist-download",
            productTitle: "Launch checklist download",
            entitlementTemplateId: "entitlement-template-launch-download",
            accessRuleId: "access-rule-download-after-paid-webhook",
            destructiveActionEnabled: false,
            entitlementMutationEnabled: false,
          }),
        ]),
        redaction: expect.objectContaining({
          privateBuyerDataIncluded: false,
          rawBuyerEmailIncluded: false,
          actorEmailIncluded: false,
          rawStripeIdsIncluded: false,
          entitlementMutationEnabled: false,
          destructiveActionEnabled: false,
        }),
      }),
    );
    expect(payload.grantMappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourcePriceId: sandboxCheckoutOffer.priceId,
          entitlementTemplateId: "entitlement-template-launch-bundle",
        }),
        expect.objectContaining({
          sourcePriceId: "price-launch-checklist-bump-usd",
          entitlementTemplateId: "entitlement-template-launch-download",
        }),
      ]),
    );
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
    expect(payload.writeBoundary).toContain("Issue #101 can grant idempotent sandbox product entitlement rows");
    expect(payload.writeBoundary).toContain("issue #151 lets verified owners create small private asset upload records");
    expect(payload.writeBoundary).toContain("issue #179 exposes non-destructive revocation intent readiness");
    expect(payload.caveat).toContain("sandbox webhook-backed entitlement row grants");
    expect(payload.caveat).toContain("owner-confirmed small private asset upload records");
    expect(payload.caveat).toContain("non-destructive revocation intent readiness");

    await page.goto("/products/indie-launch-library");
    await expect(page.getByRole("heading", { name: /Indie launch product and access library/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Downloads, courses, memberships, services, events, and bundles/i })).toBeVisible();
    await expect(page.getByText("Launch checklist download")).toBeVisible();
    await expect(page.getByText("Launch course lite")).toBeVisible();
    await expect(page.getByText("Launch membership")).toBeVisible();
  });

  test("customer product entitlement lookup exposes redacted checkout access state", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Customer entitlement lookup is covered once on desktop.");

    const buyerEmail = `product-customer-${Date.now()}@example.com`;
    const grant = await grantSandboxProductEntitlements(request, buyerEmail);

    const response = await request.get(`/api/products/entitlements?checkoutIntentId=${encodeURIComponent(grant.checkoutIntentId)}`);
    expect(response.ok(), await response.text()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        status: "customer-product-entitlement-lookup-ready",
        issue: 141,
        checkoutIntentId: grant.checkoutIntentId,
        checkout: expect.objectContaining({
          checkoutIntentId: grant.checkoutIntentId,
          privateDataIncluded: false,
          rawStripeIdsIncluded: false,
        }),
        counts: expect.objectContaining({
          entitlements: 2,
          activeEntitlements: 2,
          fulfillmentTasks: 2,
        }),
        redaction: expect.objectContaining({
          buyerEmailIncluded: false,
          buyerEmailHashIncluded: false,
          rawStripeIdsIncluded: false,
          sourceStripeEventIdsIncluded: false,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          metadataJsonIncluded: false,
        }),
      }),
    );
    expect(payload.entitlements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productTitle: "Launch bundle",
          fulfillment: expect.objectContaining({ status: "queued" }),
          downloadDelivery: expect.objectContaining({
            available: true,
            assetId: "asset-launch-checklist-pdf",
            deliveryMode: "private-r2-fixture",
            r2Backed: true,
            privateR2KeysIncluded: false,
            signedUrlsIncluded: false,
          }),
        }),
        expect.objectContaining({
          productTitle: "Launch checklist download",
          fulfillment: expect.objectContaining({ status: "queued" }),
          downloadDelivery: expect.objectContaining({
            available: true,
            assetId: "asset-launch-checklist-pdf",
            deliveryMode: "private-r2-fixture",
            r2Backed: true,
            privateR2KeysIncluded: false,
            signedUrlsIncluded: false,
          }),
        }),
      ]),
    );
    const downloadable = payload.entitlements.find(
      (entitlement: { downloadDelivery?: { available?: boolean } }) => entitlement.downloadDelivery?.available,
    ) as { id: string } | undefined;
    expect(downloadable).toEqual(expect.objectContaining({ id: expect.stringMatching(/^entitlement-/) }));
    if (!downloadable) throw new Error("Expected at least one downloadable entitlement.");

    const token = await request.post("/api/products/download-tokens", {
      data: {
        checkoutIntentId: grant.checkoutIntentId,
        entitlementId: downloadable.id,
      },
    });
    expect(token.status(), await token.text()).toBe(201);
    const tokenPayload = await token.json();
    expect(tokenPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "private-r2-download-delivery-ready",
        issue: 146,
        token: expect.stringMatching(/^download-token-/),
        downloadUrl: expect.stringContaining("/api/products/downloads?token=download-token-"),
        asset: expect.objectContaining({
          assetId: "asset-launch-checklist-pdf",
          fileName: "asset-launch-checklist-pdf.txt",
          deliveryMode: "private-r2-fixture",
          r2Backed: true,
        }),
        redaction: expect.objectContaining({
          buyerEmailIncluded: false,
          buyerEmailHashIncluded: false,
          rawStripeIdsIncluded: false,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          metadataJsonIncluded: false,
        }),
      }),
    );
    const tokenText = JSON.stringify(tokenPayload);
    expect(tokenText).not.toContain(buyerEmail);
    expect(tokenText).not.toContain(grant.eventId);
    expect(tokenText).not.toContain("cs_test");
    expect(tokenText).not.toContain("r2://");

    const download = await request.get(tokenPayload.downloadUrl);
    expect(download.ok(), await download.text()).toBeTruthy();
    expect(download.headers()["content-disposition"]).toContain("asset-launch-checklist-pdf.txt");
    expect(download.headers()["x-bumpgrade-delivery"]).toContain("private-r2-fixture");
    expect(download.headers()["x-bumpgrade-redaction"]).toContain("private-r2-keys=false");
    const downloadText = await download.text();
    expect(downloadText).toContain("Bumpgrade Launch Checklist");
    expect(downloadText).toContain("entitlement-scoped R2 delivery through Bumpgrade");
    expect(downloadText).not.toContain(buyerEmail);
    expect(downloadText).not.toContain(grant.eventId);
    expect(downloadText).not.toContain("products/fixtures/");
    expect(downloadText).not.toContain("signed_url");

    const replay = await request.get(tokenPayload.downloadUrl);
    expect(replay.status()).toBe(410);

    const staleBuyerEmail = `product-stale-token-${Date.now()}@example.com`;
    const staleGrant = await grantSandboxProductEntitlements(request, staleBuyerEmail);
    const staleLookup = await request.get(`/api/products/entitlements?checkoutIntentId=${encodeURIComponent(staleGrant.checkoutIntentId)}`);
    expect(staleLookup.ok(), await staleLookup.text()).toBeTruthy();
    const stalePayload = await staleLookup.json();
    const staleDownloadable = stalePayload.entitlements.find(
      (entitlement: { downloadDelivery?: { available?: boolean } }) => entitlement.downloadDelivery?.available,
    ) as { id: string } | undefined;
    expect(staleDownloadable).toEqual(expect.objectContaining({ id: expect.stringMatching(/^entitlement-/) }));
    if (!staleDownloadable) throw new Error("Expected at least one stale-state test entitlement.");

    const staleToken = await request.post("/api/products/download-tokens", {
      data: {
        checkoutIntentId: staleGrant.checkoutIntentId,
        entitlementId: staleDownloadable.id,
      },
    });
    expect(staleToken.status(), await staleToken.text()).toBe(201);
    const staleTokenPayload = await staleToken.json();

    const staleEventId = `evt_bumpgrade_product_stale_${Date.now()}`;
    await postCheckoutSessionWebhook(request, {
      checkoutIntentId: staleGrant.checkoutIntentId,
      eventId: staleEventId,
      type: "checkout.session.expired",
      paymentStatus: "unpaid",
      status: "expired",
    });

    const staleDownload = await request.get(staleTokenPayload.downloadUrl);
    expect(staleDownload.status()).toBe(409);
    const staleDownloadPayload = await staleDownload.json();
    expect(staleDownloadPayload).toEqual(
      expect.objectContaining({
        ok: false,
        message: "Download token checkout state is no longer eligible.",
        redaction: expect.objectContaining({
          buyerEmailIncluded: false,
          rawStripeIdsIncluded: false,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
        }),
      }),
    );
    const staleDownloadText = JSON.stringify(staleDownloadPayload);
    expect(staleDownloadText).not.toContain(staleBuyerEmail);
    expect(staleDownloadText).not.toContain(staleGrant.eventId);
    expect(staleDownloadText).not.toContain(staleEventId);
    expect(staleDownloadText).not.toContain("cs_test");

    await postCheckoutSessionWebhook(request, {
      checkoutIntentId: staleGrant.checkoutIntentId,
      eventId: `evt_bumpgrade_product_restored_${Date.now()}`,
      type: "checkout.session.completed",
    });
    const restoredDownload = await request.get(staleTokenPayload.downloadUrl);
    expect(restoredDownload.ok(), await restoredDownload.text()).toBeTruthy();
    const restoredDownloadText = await restoredDownload.text();
    expect(restoredDownloadText).toContain("Bumpgrade Launch Checklist");
    const restoredReplay = await request.get(staleTokenPayload.downloadUrl);
    expect(restoredReplay.status()).toBe(410);

    const payloadText = JSON.stringify(payload);
    expect(payloadText).not.toContain(buyerEmail);
    expect(payloadText).not.toContain(grant.eventId);
    expect(payloadText).not.toContain("cs_test");
    expect(payloadText).not.toContain("r2://");
    expect(payloadText).not.toContain("signed_url");

    const invalid = await request.get("/api/products/entitlements?checkoutIntentId=not-a-real-intent");
    expect(invalid.status()).toBe(400);
    await expect(invalid.json()).resolves.toEqual(expect.objectContaining({ source: "invalid" }));

    await page.goto(`/products/entitlements?checkout_intent_id=${encodeURIComponent(grant.checkoutIntentId)}`);
    await expect(page.getByRole("heading", { name: /Customer product access lookup/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Product access and fulfillment state/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch bundle" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch checklist download" })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(buyerEmail);
    await expect(page.locator("body")).not.toContainText(grant.eventId);
  });

  test("product entitlement inspection exposes aggregate source data and owner rows", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Owner product inspection is covered once on desktop.");

    const buyerEmail = `product-owner-${Date.now()}@example.com`;
    const grant = await grantSandboxProductEntitlements(request, buyerEmail);

    const response = await request.get("/products/source-data");
    expect(response.ok(), await response.text()).toBeTruthy();
    const payload = await response.json();
    expect(payload.entitlementInspection).toEqual(
      expect.objectContaining({
        status: "owner-product-entitlement-inspection-ready",
        issue: 139,
        ownerRoute: "/admin/products",
        publicSourceDataRoute: "/products/source-data",
        redaction: expect.objectContaining({
          privateBuyerDataIncluded: false,
          rawBuyerEmailIncluded: false,
          rawStripeIdsIncluded: false,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
        }),
      }),
    );
    expect(payload.entitlementInspection.counts.entitlements).toBeGreaterThanOrEqual(2);
    expect(payload.entitlementInspection.counts.fulfillmentTasks).toBeGreaterThanOrEqual(2);
    expect(payload.revocationIntents).toEqual(
      expect.objectContaining({
        status: productEntitlementRevocationIntentStatus,
        issue: productEntitlementRevocationIntentIssue,
        counts: expect.objectContaining({
          revocationIntents: expect.any(Number),
          destructiveActionsEnabled: 0,
          entitlementMutationsEnabled: 0,
        }),
      }),
    );
    expect(payload.revocationIntents.counts.revocationIntents).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(payload)).not.toContain(grant.buyerEmail);
    expect(JSON.stringify(payload)).not.toContain(grant.eventId);

    await signInOrCreateOwner(page);
    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: /Product entitlement inspection without public buyer leaks/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Access removal stays blocked until revocation checks are explicit/i })).toBeVisible();
    await expect(page.locator("body")).toContainText("Revocation intents");
    await expect(page.locator("body")).toContainText("owner confirmed dry run");
    await expect(page.locator("body")).toContainText(grant.buyerEmail);
    await expect(page.locator("body")).toContainText("Launch bundle");
    await expect(page.locator("body")).toContainText("Launch checklist download");
    await expect(page.locator("body")).toContainText(grant.checkoutIntentId);
    await expect(page.locator("body")).not.toContainText(grant.eventId);
  });

  test("owner private product asset upload intents require auth, confirmation, idempotency, and redaction", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Owner product asset upload intents are covered once on desktop.");

    const idempotencyKey = `playwright-product-asset-upload-${Date.now()}`;
    const uploadBody = `Private owner-upload fixture body ${Date.now()}`;
    const requestBody = {
      productId: "product-launch-checklist-download",
      assetId: "asset-launch-checklist-pdf",
      fileName: "mark-private-checklist.txt",
      contentType: "text/plain; charset=utf-8",
      bodyText: uploadBody,
      confirmationText: productAssetUploadConfirmationText,
      idempotencyKey,
      expectedCatalogRevisionId: productAccessCatalog.revisionId,
    };

    const unauthorized = await request.post("/api/admin/products/assets", { data: requestBody });
    expect(unauthorized.status()).toBe(401);
    await expect(unauthorized.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "owner_session_required",
        redaction: expect.objectContaining({
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          rawUploadBodyIncluded: false,
        }),
      }),
    );

    await signInOrCreateOwner(page);
    const contract = await page.request.get("/api/admin/products/assets");
    expect(contract.ok(), await contract.text()).toBeTruthy();
    await expect(contract.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: productAssetUploadIntentStatus,
        issue: 151,
        route: "/api/admin/products/assets",
        confirmation: expect.objectContaining({ text: productAssetUploadConfirmationText }),
        redaction: expect.objectContaining({
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          rawUploadBodyIncluded: false,
          rawOwnerEmailIncluded: false,
        }),
      }),
    );

    const created = await page.request.post("/api/admin/products/assets", { data: requestBody });
    expect(created.status(), await created.text()).toBe(201);
    const createdPayload = await created.json();
    expect(createdPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: productAssetUploadIntentStatus,
        issue: 151,
        duplicate: false,
        upload: expect.objectContaining({
          uploadId: expect.stringMatching(/^product-asset-upload-/),
          productId: requestBody.productId,
          assetId: requestBody.assetId,
          fileName: requestBody.fileName,
          contentType: requestBody.contentType,
          byteCount: new TextEncoder().encode(uploadBody).byteLength,
          bodySha256: expect.stringMatching(/^[a-f0-9]{64}$/),
          storedPrivate: true,
          redaction: expect.objectContaining({
            rawR2KeysIncluded: false,
            signedUrlsIncluded: false,
            rawUploadBodyIncluded: false,
            rawOwnerEmailIncluded: false,
            buyerDataIncluded: false,
          }),
        }),
      }),
    );
    const createdText = JSON.stringify(createdPayload);
    expect(createdText).not.toContain(uploadBody);
    expect(createdText).not.toContain("products/uploads/");
    expect(createdText).not.toContain("signed_url");
    expect(createdText).not.toContain("m@rkmoriarty.com");

    const replay = await page.request.post("/api/admin/products/assets", { data: requestBody });
    expect(replay.status(), await replay.text()).toBe(200);
    await expect(replay.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "owner-private-asset-upload-intent-replayed",
        duplicate: true,
        upload: expect.objectContaining({
          uploadId: createdPayload.upload.uploadId,
          bodySha256: createdPayload.upload.bodySha256,
        }),
      }),
    );

    const conflict = await page.request.post("/api/admin/products/assets", {
      data: { ...requestBody, bodyText: `${uploadBody} changed` },
    });
    expect(conflict.status()).toBe(409);
    await expect(conflict.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "idempotency_conflict",
        redaction: expect.objectContaining({
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          rawUploadBodyIncluded: false,
        }),
      }),
    );

    const sourceData = await request.get("/products/source-data");
    expect(sourceData.ok(), await sourceData.text()).toBeTruthy();
    const sourcePayload = await sourceData.json();
    expect(sourcePayload.ownerAssetUploadIntents.counts.uploadRecords).toBeGreaterThanOrEqual(1);
    expect(sourcePayload.ownerAssetUploadIntents.counts.storedPrivateUploads).toBeGreaterThanOrEqual(1);
    const sourceText = JSON.stringify(sourcePayload);
    expect(sourceText).not.toContain(uploadBody);
    expect(sourceText).not.toContain("products/uploads/");
    expect(sourceText).not.toContain("m@rkmoriarty.com");
  });

  test("audience automation source data exposes opt-in, tags, sequences, and automation rules", async ({ request, page }) => {
    const response = await request.get("/audience/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: audienceAutomationSourceData.id,
        status: audienceBroadcastQueueReadinessStatus,
        issue: audienceBroadcastQueueReadinessIssue,
        parentIssue: 17,
      }),
    );
    expect(payload.routes).toEqual(
      expect.arrayContaining([
        "/audience/source-data",
        "/api/audience/opt-in",
        "/api/audience/unsubscribe",
        "/api/admin/audience/notes",
        audienceBroadcastScheduleIntentApiRoute,
        "/audience/indie-launch-waitlist",
        "/admin/audience",
      ]),
    );
    expect(payload.subscriberInspection).toEqual(
      expect.objectContaining({
        status: "owner-subscriber-inspection-ready",
        issue: 137,
        ownerRoute: "/admin/audience",
        counts: expect.objectContaining({
          subscribers: expect.any(Number),
          unsubscribedSubscribers: expect.any(Number),
          consentEvents: expect.any(Number),
          tagAssignments: expect.any(Number),
          sequenceEnrollments: expect.any(Number),
          suppressionEntries: expect.any(Number),
          activeSuppressionEntries: expect.any(Number),
          timelineEntries: expect.any(Number),
          activeTimelineEntries: expect.any(Number),
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawEmailIncluded: false,
          rawNameIncluded: false,
          rawIpIncluded: false,
          rawUserAgentIncluded: false,
          rawSuppressionHashIncluded: false,
          suppressionReasonIncluded: false,
          privateTimelineNoteBodiesIncluded: false,
          timelineActorEmailIncluded: false,
        }),
      }),
    );
    expect(payload.broadcastScheduleIntents).toEqual(
      expect.objectContaining({
        status: audienceBroadcastScheduleIntentStatus,
        issue: audienceBroadcastScheduleIntentIssue,
        apiRoute: audienceBroadcastScheduleIntentApiRoute,
        ownerRoute: "/admin/audience",
        confirmation: expect.objectContaining({
          required: true,
          text: audienceBroadcastScheduleIntentConfirmationText,
        }),
        counts: expect.objectContaining({
          scheduleIntents: expect.any(Number),
          activeDryRunIntents: expect.any(Number),
          readyRecipientsReserved: expect.any(Number),
          heldRecipientsSnapshotted: expect.any(Number),
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          actorEmailIncluded: false,
          providerMessageIdsIncluded: false,
          sendQueueRowsCreated: false,
        }),
      }),
    );
    expect(payload.broadcastPreviewSafety).toEqual(
      expect.objectContaining({
        status: audienceBroadcastPreviewSafetyStatus,
        issue: audienceBroadcastPreviewSafetyIssue,
        counts: expect.objectContaining({
          previewSafetyRecords: expect.any(Number),
          unsubscribeFooterRequiredRecords: expect.any(Number),
          senderDomainsReady: expect.any(Number),
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          personalizedBodyIncluded: false,
          providerMessageIdsIncluded: false,
          sendQueueRowsCreated: false,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-preview-safety-launch-window",
            draftId: "broadcast-draft-launch-window",
            unsubscribeFooterRequired: true,
            sendQueueRowsCreated: false,
            providerMessageIdsIncluded: false,
          }),
        ]),
      }),
    );
    expect(payload.broadcastQueueReadiness).toEqual(
      expect.objectContaining({
        status: audienceBroadcastQueueReadinessStatus,
        issue: audienceBroadcastQueueReadinessIssue,
        counts: expect.objectContaining({
          queueReadinessRecords: expect.any(Number),
          dryRunQueues: expect.any(Number),
          providerSendEnabledRecords: expect.any(Number),
          recipientPayloadsCreatedRecords: expect.any(Number),
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          recipientPayloadsIncluded: false,
          providerMessageIdsIncluded: false,
          sendQueueRowsCreated: false,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-queue-readiness-launch-window",
            draftId: "broadcast-draft-launch-window",
            queueMode: "dry_run_contract",
            providerSendEnabled: false,
            recipientPayloadsCreated: false,
            sendQueueRowsCreated: false,
            providerMessageIdsIncluded: false,
          }),
        ]),
      }),
    );
    const beforeSubscriberCount = payload.subscriberInspection.counts.subscribers;
    const beforeSuppressionCount = payload.subscriberInspection.counts.suppressionEntries;
    const beforeBroadcastScopedCount = payload.broadcastReadiness.counts.scopedSubscribers;
    const beforeBroadcastSuppressionCount = payload.broadcastReadiness.counts.activeSuppressionEntries;
    expect(payload.broadcastReadiness).toEqual(
      expect.objectContaining({
        status: audienceBroadcastReadinessStatus,
        issue: audienceBroadcastReadinessIssue,
        counts: expect.objectContaining({
          broadcastDrafts: expect.any(Number),
          scopedSubscribers: expect.any(Number),
          consentedSubscribers: expect.any(Number),
          readyRecipients: expect.any(Number),
          suppressedRecipients: expect.any(Number),
          unsubscribedRecipients: expect.any(Number),
          missingConsentRecipients: expect.any(Number),
          activeSuppressionEntries: expect.any(Number),
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          suppressionHashesIncluded: false,
          providerMessageIdsIncluded: false,
          sendQueueRowsCreated: false,
        }),
        drafts: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-draft-launch-window",
            readyRecipientCount: expect.any(Number),
            sendQueueRowsCreated: false,
            providerMessageIdsIncluded: false,
          }),
        ]),
      }),
    );
    expect(payload.optInWrites).toEqual(
      expect.objectContaining({
        status: "subscriber-capture-ready",
        issue: 103,
        apiRoute: "/api/audience/opt-in",
        tables: expect.arrayContaining([
          "audience_subscribers",
          "audience_consent_events",
          "audience_tag_assignments",
          "audience_sequence_enrollments",
        ]),
      }),
    );
    expect(payload.unsubscribeWrites).toEqual(
      expect.objectContaining({
        status: "unsubscribe-suppression-ready",
        issue: 167,
        apiRoute: "/api/audience/unsubscribe",
        tables: expect.arrayContaining(["audience_subscribers", "audience_suppression_entries"]),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          subscriberExistenceRevealed: false,
          rawEmailIncludedInSourceData: false,
        }),
      }),
    );
    expect(payload.crmTimelineWrites).toEqual(
      expect.objectContaining({
        status: "owner-crm-timeline-ready",
        issue: 169,
        apiRoute: "/api/admin/audience/notes",
        auth: "owner-session",
        tables: expect.arrayContaining(["audience_subscribers", "audience_timeline_entries"]),
        confirmation: expect.objectContaining({
          required: true,
          text: audienceCrmTimelineConfirmationText,
        }),
      }),
    );
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
          unsubscribeManagement: expect.objectContaining({
            apiRoute: "/api/audience/unsubscribe",
            issue: 167,
          }),
          crmTimeline: expect.objectContaining({
            apiRoute: "/api/admin/audience/notes",
            issue: 169,
          }),
          broadcastScheduleIntentApiRoute: audienceBroadcastScheduleIntentApiRoute,
          broadcastDrafts: expect.arrayContaining([
            expect.objectContaining({ id: "broadcast-draft-launch-window" }),
          ]),
          automations: expect.arrayContaining([
            expect.objectContaining({ id: "automation-enroll-waitlist-nurture" }),
          ]),
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Issue #103 can capture explicit-consent opt-ins");
    expect(payload.caveat).toContain("consent-backed subscriber capture");

    await page.goto("/audience/indie-launch-waitlist");
    await expect(page.getByRole("heading", { name: /Indie launch waitlist and nurture preview/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Indie launch waitlist opt-in/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Unsubscribe evidence is captured/i })).toBeVisible();
    await expect(page.getByText("Launch checklist lead magnet")).toBeVisible();
    await expect(page.getByText("Indie launch nurture sequence")).toBeVisible();

    const browserEmail = `playwright-waitlist-${Date.now()}@example.com`;
    const optInForm = page.getByRole("form", { name: "Audience opt-in" });
    await optInForm.getByLabel("Email address").fill(browserEmail);
    await optInForm.getByLabel("First name, optional").fill("Playwright");
    await optInForm.getByLabel(/I want the launch checklist/i).check();
    await optInForm.getByRole("button", { name: /Join waitlist/i }).click();
    await expect(page.getByText("Waitlist opt-in saved")).toBeVisible();
    await expect(page.getByText("Email delivery remains disabled")).toBeVisible();

    const unsubscribeForm = page.getByRole("form", { name: "Audience unsubscribe" });
    await unsubscribeForm.getByLabel("Email address").fill(` ${browserEmail.toUpperCase()} `);
    await unsubscribeForm.getByLabel("Reason, optional").fill("  Browser smoke  ");
    await unsubscribeForm.getByRole("button", { name: /Record unsubscribe/i }).click();
    await expect(page.getByText("Unsubscribe preference recorded")).toBeVisible();
    await expect(page.getByText("List membership is not exposed")).toBeVisible();

    const afterResponse = await request.get("/audience/source-data");
    expect(afterResponse.ok()).toBeTruthy();
    const afterPayload = await afterResponse.json();
    expect(afterPayload.subscriberInspection.counts.subscribers).toBeGreaterThanOrEqual(beforeSubscriberCount + 1);
    expect(afterPayload.subscriberInspection.counts.suppressionEntries).toBeGreaterThanOrEqual(beforeSuppressionCount + 1);
    expect(afterPayload.broadcastReadiness.counts.scopedSubscribers).toBeGreaterThanOrEqual(beforeBroadcastScopedCount + 1);
    expect(afterPayload.broadcastReadiness.counts.activeSuppressionEntries).toBeGreaterThanOrEqual(
      beforeBroadcastSuppressionCount + 1,
    );
    expect(JSON.stringify(afterPayload.subscriberInspection)).not.toContain("@example.com");
    expect(JSON.stringify(afterPayload.broadcastReadiness)).not.toContain("@example.com");
    expect(JSON.stringify(afterPayload.broadcastPreviewSafety)).not.toContain("@example.com");
    expect(JSON.stringify(afterPayload.broadcastQueueReadiness)).not.toContain("@example.com");
    expect(JSON.stringify(afterPayload.subscriberInspection)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.broadcastReadiness)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.broadcastPreviewSafety)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.broadcastQueueReadiness)).not.toContain("Browser smoke");
  });

  test("audience opt-in API validates consent, normalizes email, and replays idempotent responses", async ({ request }) => {
    const idempotencyKey = `playwright-audience-opt-in-${Date.now()}`;
    const payload = {
      email: "  M@RKMORIARTY.COM ",
      firstName: " Mark ",
      consent: true,
      formId: "opt-in-form-indie-launch-waitlist",
      idempotencyKey,
    };

    const firstResponse = await request.post("/api/audience/opt-in", { data: payload });
    expect(firstResponse.ok(), await firstResponse.text()).toBeTruthy();
    const firstResult = await firstResponse.json();
    expect(firstResult).toEqual(
      expect.objectContaining({
        ok: true,
        status: "subscribed",
        duplicate: false,
        normalizedEmail: "m@rkmoriarty.com",
        firstName: "Mark",
        formId: "opt-in-form-indie-launch-waitlist",
        sequenceId: "sequence-indie-launch-nurture",
        emailDeliveryEnabled: false,
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          providerIdsIncluded: false,
        }),
      }),
    );
    expect(firstResult.tagIds).toEqual(
      expect.arrayContaining(["tag-lead-magnet-launch-checklist", "tag-source-funnel-indie-launch"]),
    );

    const duplicateResponse = await request.post("/api/audience/opt-in", { data: payload });
    expect(duplicateResponse.ok(), await duplicateResponse.text()).toBeTruthy();
    const duplicateResult = await duplicateResponse.json();
    expect(duplicateResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        subscriberId: firstResult.subscriberId,
        normalizedEmail: "m@rkmoriarty.com",
      }),
    );

    const invalidEmailResponse = await request.post("/api/audience/opt-in", {
      data: { ...payload, email: "not-an-email", idempotencyKey: `${idempotencyKey}-invalid-email` },
    });
    expect(invalidEmailResponse.status()).toBe(400);
    await expect(invalidEmailResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "invalid_email" }),
    );

    const missingConsentResponse = await request.post("/api/audience/opt-in", {
      data: { ...payload, consent: false, idempotencyKey: `${idempotencyKey}-missing-consent` },
    });
    expect(missingConsentResponse.status()).toBe(400);
    await expect(missingConsentResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "consent_required" }),
    );
  });

  test("audience unsubscribe API records suppression evidence without revealing membership", async ({ request }) => {
    const suffix = Date.now();
    const knownEmail = `playwright-known-unsub-${suffix}@example.com`;
    const optInResponse = await request.post("/api/audience/opt-in", {
      data: {
        email: knownEmail,
        firstName: "Known",
        consent: true,
        formId: "opt-in-form-indie-launch-waitlist",
        idempotencyKey: `playwright-known-unsub-opt-in-${suffix}`,
      },
    });
    expect(optInResponse.ok(), await optInResponse.text()).toBeTruthy();

    const idempotencyKey = `playwright-audience-unsubscribe-${suffix}`;
    const firstResponse = await request.post("/api/audience/unsubscribe", {
      data: {
        email: ` ${knownEmail.toUpperCase()} `,
        reason: "  no longer interested  ",
        idempotencyKey,
      },
    });
    expect(firstResponse.ok(), await firstResponse.text()).toBeTruthy();
    const firstResult = await firstResponse.json();
    expect(firstResult).toEqual(
      expect.objectContaining({
        ok: true,
        status: "unsubscribed",
        duplicate: false,
        normalizedEmail: knownEmail,
        emailDeliveryEnabled: false,
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          providerIdsIncluded: false,
          subscriberExistenceRevealed: false,
        }),
      }),
    );
    expect(firstResult.suppressionEntryId).toMatch(/^suppression-/);
    expect(JSON.stringify(firstResult)).not.toContain("subscriber-");

    const duplicateResponse = await request.post("/api/audience/unsubscribe", {
      data: {
        email: knownEmail,
        idempotencyKey,
      },
    });
    expect(duplicateResponse.ok(), await duplicateResponse.text()).toBeTruthy();
    await expect(duplicateResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        suppressionEntryId: firstResult.suppressionEntryId,
        normalizedEmail: knownEmail,
      }),
    );

    const unknownEmail = `playwright-unknown-unsub-${suffix}@example.com`;
    const unknownResponse = await request.post("/api/audience/unsubscribe", {
      data: {
        email: unknownEmail,
        idempotencyKey: `${idempotencyKey}-unknown`,
      },
    });
    expect(unknownResponse.ok(), await unknownResponse.text()).toBeTruthy();
    await expect(unknownResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "unsubscribed",
        normalizedEmail: unknownEmail,
        redaction: expect.objectContaining({
          subscriberExistenceRevealed: false,
        }),
      }),
    );

    const sourceResponse = await request.get("/audience/source-data");
    expect(sourceResponse.ok(), await sourceResponse.text()).toBeTruthy();
    const sourcePayload = await sourceResponse.json();
    expect(sourcePayload.subscriberInspection.counts.suppressionEntries).toBeGreaterThanOrEqual(2);
    expect(sourcePayload.subscriberInspection.counts.unsubscribedSubscribers).toBeGreaterThanOrEqual(1);
    const sourceText = JSON.stringify(sourcePayload);
    expect(sourceText).not.toContain(knownEmail);
    expect(sourceText).not.toContain(unknownEmail);
    expect(sourceText).not.toContain("no longer interested");

    const invalidEmailResponse = await request.post("/api/audience/unsubscribe", {
      data: { email: "not-an-email", idempotencyKey: `${idempotencyKey}-invalid` },
    });
    expect(invalidEmailResponse.status()).toBe(400);
    await expect(invalidEmailResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "invalid_email" }),
    );

    const unauthorizedNoteResponse = await request.post("/api/admin/audience/notes", {
      data: {
        subscriberId: "subscriber-not-public",
        expectedSubscriberStatus: "subscribed",
        noteBody: "Should not be public",
        confirmationText: audienceCrmTimelineConfirmationText,
        idempotencyKey: `${idempotencyKey}-unauthorized-note`,
      },
    });
    expect(unauthorizedNoteResponse.status()).toBe(401);
    await expect(unauthorizedNoteResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    const unauthorizedScheduleIntentResponse = await request.post(audienceBroadcastScheduleIntentApiRoute, {
      data: {
        draftId: "broadcast-draft-launch-window",
        expectedDraftUpdatedAt: "2026-05-19T00:00:00.000Z",
        expectedReadyRecipientCount: 0,
        confirmationText: audienceBroadcastScheduleIntentConfirmationText,
        idempotencyKey: `${idempotencyKey}-unauthorized-schedule-intent`,
      },
    });
    expect(unauthorizedScheduleIntentResponse.status()).toBe(401);
    await expect(unauthorizedScheduleIntentResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );
  });

  test("analytics source data exposes events, metrics, and experiment definitions", async ({ request, page }) => {
    const response = await request.get("/analytics/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: analyticsExperimentsSourceData.id,
        status: "time-windowed-dashboard-ready",
        issue: 129,
        parentIssue: 18,
      }),
    );
    expect(payload.routes).toEqual(
      expect.arrayContaining([
        "/analytics/source-data",
        "/api/analytics/events",
        "/api/analytics/assignments",
        "/funnels/indie-launch-sandbox",
        "/analytics/indie-launch-dashboard",
      ]),
    );
    expect(payload.stableIds).toEqual(
      expect.arrayContaining([
        "analyticsEventVariantAggregateId",
        "analyticsEventSourceAggregateId",
        "analyticsTimeWindow",
        "experimentAssignmentId",
        "variantId",
        "utmSource",
        "utmMedium",
        "utmCampaign",
        "referrerHost",
      ]),
    );
    expect(payload.eventWrites).toEqual(
      expect.objectContaining({
        status: "event-capture-attribution-ready",
        issue: 125,
        apiRoute: "/api/analytics/events",
        tables: expect.arrayContaining(["analytics_events", "analytics_event_ingestions"]),
      }),
    );
    expect(payload.pageViewBeacon).toEqual(
      expect.objectContaining({
        status: "source-attributed-page-view-beacon-ready",
        issue: 125,
        sourceRoute: "/funnels/indie-launch-sandbox",
        eventDefinitionId: "event-funnel-page-view",
        experimentId: "experiment-opt-in-hero-promise",
        apiRoute: "/api/analytics/events",
        assignmentApiRoute: "/api/analytics/assignments",
      }),
    );
    expect(payload.assignmentWrites).toEqual(
      expect.objectContaining({
        status: "assignment-ready",
        issue: 107,
        apiRoute: "/api/analytics/assignments",
        tables: expect.arrayContaining(["analytics_experiment_assignments"]),
      }),
    );
    expect(payload.conversionReport).toEqual(
      expect.objectContaining({
        status: "conversion-report-ready",
        issue: 119,
        sourceDataRoute: "/analytics/source-data",
        tables: expect.arrayContaining(["analytics_events"]),
      }),
    );
    expect(payload.funnelConversionReport).toEqual(
      expect.objectContaining({
        id: "analytics-funnel-conversion-report-indie-launch",
        status: "available",
        issue: 119,
        rawRowsIncluded: false,
        privateDataIncluded: false,
        timeWindow: expect.objectContaining({ key: "all" }),
        rows: expect.arrayContaining([
          expect.objectContaining({
            metricId: "funnel-metric-waitlist-opt-in",
            visitorEventId: "event-funnel-page-view",
            conversionEventId: "event-audience-opt-in-created",
          }),
        ]),
      }),
    );
    expect(payload.eventSummary).toEqual(
      expect.objectContaining({
        status: "available",
        timeWindow: expect.objectContaining({ key: "all" }),
        aggregateVariantCounts: expect.any(Array),
        aggregateSourceCounts: expect.any(Array),
        rawRowsIncluded: false,
        privateDataIncluded: false,
      }),
    );
    expect(payload.assignmentSummary).toEqual(
      expect.objectContaining({
        status: "available",
        rawRowsIncluded: false,
        privateDataIncluded: false,
      }),
    );
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
    expect(payload.writeBoundary).toContain(
      "Issues #105, #107, #119, #121, #123, #125, #127, and #129 can capture seeded analytics events",
    );
    expect(payload.caveat).toContain("fixed-window aggregate source and conversion filters");
    expect(payload.timeWindows).toEqual(
      expect.objectContaining({
        default: "all",
        selected: "all",
        supported: expect.arrayContaining([
          expect.objectContaining({ key: "24h", label: "24 hours" }),
          expect.objectContaining({ key: "7d", label: "7 days" }),
          expect.objectContaining({ key: "30d", label: "30 days" }),
        ]),
      }),
    );

    await page.goto("/analytics/indie-launch-dashboard");
    await expect(page.getByRole("heading", { name: /Indie launch analytics and experiment preview/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Step-level conversion metrics come from aggregate captured events/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Source attribution stays aggregate-only/i })).toBeVisible();
    await expect(page.getByRole("group", { name: "Conversion window" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Source window" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Deterministic assignment can be audited before traffic writes exist/i })).toBeVisible();
    await expect(page.getByText("Opt-in hero promise test")).toBeVisible();
    await expect(page.getByText("No automated winners")).toBeVisible();
  });

  test("analytics event API validates seeded events and replays idempotent responses", async ({ request, page }) => {
    const idempotencyKey = `playwright-analytics-event-${Date.now()}`;
    const payload = {
      eventDefinitionId: "event-funnel-page-view",
      sourceRoute: "/funnels/indie-launch-sandbox",
      idempotencyKey,
      anonymousId: "playwright-anonymous-visitor",
      publicProperties: {
        route: "/funnels/indie-launch-sandbox",
        funnelId: "funnel-indie-launch-sandbox",
        stepId: "funnel-step-indie-launch-opt-in",
        variantId: "variant-opt-in-outcome-first",
        utmSource: " newsletter ",
        utmMedium: "email",
        utmCampaign: "Launch Week",
        utmContent: "button-top",
        utmTerm: "creator course",
        referrerHost: "https://private.example/referrer?secret=1",
        fullReferrer: "https://private.example/referrer",
      },
    };

    const firstResponse = await request.post("/api/analytics/events", { data: payload });
    expect(firstResponse.ok(), await firstResponse.text()).toBeTruthy();
    const firstResult = await firstResponse.json();
    expect(firstResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: false,
        status: "recorded",
        eventDefinitionId: "event-funnel-page-view",
        eventKind: "page_view",
        sourceRoute: "/funnels/indie-launch-sandbox",
        privateDataIncluded: false,
        rawRequestDataIncluded: false,
      }),
    );
    expect(firstResult.publicProperties).toEqual(
      expect.objectContaining({
        route: "/funnels/indie-launch-sandbox",
        funnelId: "funnel-indie-launch-sandbox",
        stepId: "funnel-step-indie-launch-opt-in",
        variantId: "variant-opt-in-outcome-first",
        utmSource: "newsletter",
        utmMedium: "email",
        utmCampaign: "Launch Week",
        utmContent: "button-top",
        utmTerm: "creator course",
        referrerHost: "private.example",
      }),
    );
    expect(firstResult.publicProperties).not.toHaveProperty("fullReferrer");
    expect(JSON.stringify(firstResult.publicProperties)).not.toContain("secret");

    const duplicateResponse = await request.post("/api/analytics/events", { data: payload });
    expect(duplicateResponse.ok(), await duplicateResponse.text()).toBeTruthy();
    const duplicateResult = await duplicateResponse.json();
    expect(duplicateResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        analyticsEventId: firstResult.analyticsEventId,
        eventDefinitionId: "event-funnel-page-view",
      }),
    );

    const unsupportedEventResponse = await request.post("/api/analytics/events", {
      data: { ...payload, eventDefinitionId: "event-private-custom", idempotencyKey: `${idempotencyKey}-unsupported` },
    });
    expect(unsupportedEventResponse.status()).toBe(400);
    await expect(unsupportedEventResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_event" }),
    );

    const unsupportedRouteResponse = await request.post("/api/analytics/events", {
      data: { ...payload, sourceRoute: "/private-admin", idempotencyKey: `${idempotencyKey}-source` },
    });
    expect(unsupportedRouteResponse.status()).toBe(400);
    await expect(unsupportedRouteResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_source_route" }),
    );

    const missingIdempotencyResponse = await request.post("/api/analytics/events", {
      data: { ...payload, idempotencyKey: "" },
    });
    expect(missingIdempotencyResponse.status()).toBe(400);
    await expect(missingIdempotencyResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_required" }),
    );

    const sourceData = await (await request.get("/analytics/source-data")).json();
    expect(sourceData.eventSummary.aggregateCounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event_definition_id: "event-funnel-page-view",
          total_events: expect.any(Number),
        }),
      ]),
    );
    expect(sourceData.eventSummary.aggregateSourceCounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event_definition_id: "event-funnel-page-view",
          source_route: "/funnels/indie-launch-sandbox",
          utm_source: "newsletter",
          utm_medium: "email",
          utm_campaign: "Launch Week",
          referrer_host: "private.example",
          total_events: expect.any(Number),
        }),
      ]),
    );
    expect(JSON.stringify(sourceData.eventSummary.aggregateSourceCounts)).not.toContain("secret");

    const windowedSourceData = await (await request.get("/analytics/source-data?window=24h")).json();
    expect(windowedSourceData.timeWindows).toEqual(expect.objectContaining({ selected: "24h" }));
    expect(windowedSourceData.eventSummary.timeWindow).toEqual(expect.objectContaining({ key: "24h" }));
    expect(windowedSourceData.funnelConversionReport.timeWindow).toEqual(expect.objectContaining({ key: "24h" }));
    expect(windowedSourceData.eventSummary.aggregateSourceCounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event_definition_id: "event-funnel-page-view",
          utm_source: "newsletter",
          utm_campaign: "Launch Week",
          referrer_host: "private.example",
        }),
      ]),
    );

    await page.goto("/analytics/indie-launch-dashboard");
    await expect(page.getByRole("heading", { name: /Source attribution stays aggregate-only/i })).toBeVisible();
    await page.getByRole("group", { name: "Conversion window" }).getByRole("button", { name: "24 hours" }).click();
    await expect(
      page.getByRole("group", { name: "Conversion window" }).getByRole("button", { name: "24 hours" }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("group", { name: "Source window" }).getByRole("button", { name: "24 hours" }).click();
    await expect(
      page.getByRole("group", { name: "Source window" }).getByRole("button", { name: "24 hours" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("row", { name: /newsletter.*Launch Week.*private\.example/i }).first(),
    ).toBeVisible();
    await expect(page.getByText("secret")).toHaveCount(0);
  });

  test("analytics event API ignores known bot page-view traffic without adding event rows", async ({ request }) => {
    const countPageViews = async () => {
      const response = await request.get("/analytics/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      return payload.eventSummary.aggregateCounts
        .filter((row: { event_definition_id: string }) => row.event_definition_id === "event-funnel-page-view")
        .reduce((total: number, row: { total_events: number }) => total + Number(row.total_events ?? 0), 0);
    };

    const beforeCount = await countPageViews();
    const botResponse = await request.post("/api/analytics/events", {
      headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" },
      data: {
        eventDefinitionId: "event-funnel-page-view",
        sourceRoute: "/funnels/indie-launch-sandbox",
        idempotencyKey: `playwright-bot-page-view-${Date.now()}`,
        anonymousId: "playwright-bot-visitor",
        publicProperties: {
          route: "/funnels/indie-launch-sandbox",
          funnelId: "funnel-indie-launch-sandbox",
          stepId: "funnel-step-indie-launch-opt-in",
          fullReferrer: "https://private.example/referrer",
        },
      },
    });

    expect(botResponse.ok(), await botResponse.text()).toBeTruthy();
    await expect(botResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: false,
        recorded: false,
        status: "ignored",
        ignoredReason: "bot_or_crawler",
        eventDefinitionId: "event-funnel-page-view",
        privateDataIncluded: false,
        rawRequestDataIncluded: false,
      }),
    );
    await expect.poll(countPageViews).toBe(beforeCount);
  });

  test("funnel preview emits one session-idempotent page-view beacon with variant evidence", async ({
    request,
    page,
  }) => {
    const waitlistRow = async () => {
      const response = await request.get("/analytics/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      const report = payload.funnelConversionReport;
      expect(report.rawRowsIncluded).toBe(false);
      expect(report.privateDataIncluded).toBe(false);
      return report.rows.find(
        (candidate: { metricId: string }) => candidate.metricId === "funnel-metric-waitlist-opt-in",
      ) as {
        visitorCount: number;
        reportMode: "captured_events" | "fixture_fallback";
      };
    };
    const assignmentCount = async () => {
      const response = await request.get("/analytics/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      return payload.assignmentSummary.aggregateCounts
        .filter((row: { experiment_id: string }) => row.experiment_id === "experiment-opt-in-hero-promise")
        .reduce((total: number, row: { total_assignments: number }) => total + Number(row.total_assignments ?? 0), 0);
    };
    const variantCount = async () => {
      const response = await request.get("/analytics/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      return payload.eventSummary.aggregateVariantCounts
        .filter(
          (row: { event_definition_id: string; source_route: string; variant_id: string }) =>
            row.event_definition_id === "event-funnel-page-view" &&
            row.source_route === "/funnels/indie-launch-sandbox" &&
            row.variant_id.startsWith("variant-opt-in-"),
        )
        .reduce((total: number, row: { total_events: number }) => total + Number(row.total_events ?? 0), 0);
    };
    const sourceCount = async () => {
      const response = await request.get("/analytics/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      return payload.eventSummary.aggregateSourceCounts
        .filter(
          (row: { event_definition_id: string; source_route: string; utm_source: string; utm_campaign: string }) =>
            row.event_definition_id === "event-funnel-page-view" &&
            row.source_route === "/funnels/indie-launch-sandbox" &&
            row.utm_source === "newsletter" &&
            row.utm_campaign === "Playwright Launch",
        )
        .reduce((total: number, row: { total_events: number }) => total + Number(row.total_events ?? 0), 0);
    };

    const before = await waitlistRow();
    const beforeVisitors = before.reportMode === "captured_events" ? before.visitorCount : 0;
    const beforeAssignments = await assignmentCount();
    const beforeVariantEvents = await variantCount();
    const beforeSourceEvents = await sourceCount();

    await page.goto(
      "/funnels/indie-launch-sandbox?utm_source=newsletter&utm_medium=email&utm_campaign=Playwright%20Launch&utm_content=hero-button&utm_term=creator-course",
      { referer: "https://newsletter.example/archive?subscriber=private" },
    );
    await expect(page.getByRole("heading", { name: /Indie launch sandbox funnel/i })).toBeVisible();
    await expect.poll(async () => (await waitlistRow()).visitorCount).toBe(beforeVisitors + 1);
    await expect.poll(assignmentCount).toBe(beforeAssignments + 1);
    await expect.poll(variantCount).toBe(beforeVariantEvents + 1);
    await expect.poll(sourceCount).toBe(beforeSourceEvents + 1);

    await page.reload();
    await expect(page.getByRole("heading", { name: /Indie launch sandbox funnel/i })).toBeVisible();
    await expect.poll(async () => (await waitlistRow()).visitorCount).toBe(beforeVisitors + 1);
    await expect.poll(assignmentCount).toBe(beforeAssignments + 1);
    await expect.poll(variantCount).toBe(beforeVariantEvents + 1);
    await expect.poll(sourceCount).toBe(beforeSourceEvents + 1);
  });

  test("analytics source data reports funnel conversion from captured events without raw rows", async ({ request }) => {
    const reportRow = async () => {
      const response = await request.get("/analytics/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      const report = payload.funnelConversionReport;
      expect(report).toEqual(
        expect.objectContaining({
          rawRowsIncluded: false,
          privateDataIncluded: false,
        }),
      );
      expect(JSON.stringify(report)).not.toContain("client_correlation_hash");
      expect(JSON.stringify(report)).not.toContain("user_agent_hash");
      expect(JSON.stringify(report)).not.toContain("raw analytics event rows");
      return report.rows.find(
        (candidate: { metricId: string }) => candidate.metricId === "funnel-metric-waitlist-opt-in",
      ) as {
        visitorCount: number;
        conversionCount: number;
        conversionRate: number;
        reportMode: "captured_events" | "fixture_fallback";
      };
    };

    const before = await reportRow();
    const beforeVisitors = before.reportMode === "captured_events" ? before.visitorCount : 0;
    const beforeConversions = before.reportMode === "captured_events" ? before.conversionCount : 0;
    const suffix = Date.now();
    const viewPayload = {
      eventDefinitionId: "event-funnel-page-view",
      sourceRoute: "/funnels/indie-launch-sandbox",
      idempotencyKey: `playwright-analytics-report-view-${suffix}`,
      anonymousId: "playwright-report-visitor",
      publicProperties: {
        route: "/funnels/indie-launch-sandbox",
        funnelId: "funnel-indie-launch-sandbox",
        stepId: "funnel-step-indie-launch-opt-in",
        variantId: "variant-opt-in-outcome-first",
      },
    };
    const optInPayload = {
      eventDefinitionId: "event-audience-opt-in-created",
      sourceRoute: "/audience/indie-launch-waitlist",
      idempotencyKey: `playwright-analytics-report-opt-in-${suffix}`,
      anonymousId: "playwright-report-visitor",
      publicProperties: {
        formId: "opt-in-form-indie-launch-waitlist",
        segmentId: "segment-warm-launch-list",
        leadMagnetId: "lead-magnet-launch-readiness-checklist",
        consentVersion: "issue-119-report-test",
      },
    };

    const view = await request.post("/api/analytics/events", { data: viewPayload });
    expect(view.ok(), await view.text()).toBeTruthy();
    const duplicateView = await request.post("/api/analytics/events", { data: viewPayload });
    expect(duplicateView.ok(), await duplicateView.text()).toBeTruthy();
    await expect(duplicateView.json()).resolves.toEqual(expect.objectContaining({ ok: true, duplicate: true }));

    const optIn = await request.post("/api/analytics/events", { data: optInPayload });
    expect(optIn.ok(), await optIn.text()).toBeTruthy();
    const duplicateOptIn = await request.post("/api/analytics/events", { data: optInPayload });
    expect(duplicateOptIn.ok(), await duplicateOptIn.text()).toBeTruthy();
    await expect(duplicateOptIn.json()).resolves.toEqual(expect.objectContaining({ ok: true, duplicate: true }));

    const after = await reportRow();
    expect(after.reportMode).toBe("captured_events");
    expect(after.visitorCount).toBe(beforeVisitors + 1);
    expect(after.conversionCount).toBe(beforeConversions + 1);
    expect(after.conversionRate).toBeCloseTo((beforeConversions + 1) / (beforeVisitors + 1), 3);
  });

  test("analytics assignment API validates seeded experiments and keeps deterministic replay stable", async ({ request }) => {
    const countFor = async () => {
      const response = await request.get("/analytics/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      const rows = payload.assignmentSummary.aggregateCounts.filter(
        (candidate: { experiment_id: string }) => candidate.experiment_id === "experiment-opt-in-hero-promise",
      );
      return rows.reduce((total: number, row: { total_assignments: number }) => total + row.total_assignments, 0);
    };
    const beforeCount = await countFor();
    const idempotencyKey = `playwright-analytics-assignment-${Date.now()}`;
    const payload = {
      experimentId: "experiment-opt-in-hero-promise",
      sourceRoute: "/funnels/indie-launch-sandbox",
      anonymousAssignmentKey: "playwright-stable-assignment-key",
      idempotencyKey,
    };

    const firstResponse = await request.post("/api/analytics/assignments", { data: payload });
    expect(firstResponse.ok(), await firstResponse.text()).toBeTruthy();
    const firstResult = await firstResponse.json();
    expect(firstResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: false,
        status: "assigned",
        experimentId: "experiment-opt-in-hero-promise",
        sourceRoute: "/funnels/indie-launch-sandbox",
        privateDataIncluded: false,
        rawRequestDataIncluded: false,
      }),
    );
    expect(["variant-opt-in-outcome-first", "variant-opt-in-speed-first"]).toContain(firstResult.variantId);
    expect(firstResult.assignmentBucket).toBeGreaterThanOrEqual(0);
    expect(firstResult.assignmentBucket).toBeLessThan(100);
    expect(firstResult).not.toHaveProperty("anonymousAssignmentKey");

    const duplicateResponse = await request.post("/api/analytics/assignments", { data: payload });
    expect(duplicateResponse.ok(), await duplicateResponse.text()).toBeTruthy();
    const duplicateResult = await duplicateResponse.json();
    expect(duplicateResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        experimentAssignmentId: firstResult.experimentAssignmentId,
        variantId: firstResult.variantId,
        assignmentBucket: firstResult.assignmentBucket,
      }),
    );

    const stableReplayResponse = await request.post("/api/analytics/assignments", {
      data: { ...payload, idempotencyKey: `${idempotencyKey}-stable-replay` },
    });
    expect(stableReplayResponse.ok(), await stableReplayResponse.text()).toBeTruthy();
    const stableReplayResult = await stableReplayResponse.json();
    expect(stableReplayResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: false,
        variantId: firstResult.variantId,
        assignmentBucket: firstResult.assignmentBucket,
      }),
    );

    const unsupportedExperimentResponse = await request.post("/api/analytics/assignments", {
      data: { ...payload, experimentId: "experiment-private-custom", idempotencyKey: `${idempotencyKey}-unsupported` },
    });
    expect(unsupportedExperimentResponse.status()).toBe(400);
    await expect(unsupportedExperimentResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_experiment" }),
    );

    const unsupportedRouteResponse = await request.post("/api/analytics/assignments", {
      data: { ...payload, sourceRoute: "/private-admin", idempotencyKey: `${idempotencyKey}-source` },
    });
    expect(unsupportedRouteResponse.status()).toBe(400);
    await expect(unsupportedRouteResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_source_route" }),
    );

    const missingAssignmentKeyResponse = await request.post("/api/analytics/assignments", {
      data: { ...payload, anonymousAssignmentKey: "", idempotencyKey: `${idempotencyKey}-missing-key` },
    });
    expect(missingAssignmentKeyResponse.status()).toBe(400);
    await expect(missingAssignmentKeyResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "assignment_key_required" }),
    );

    const missingIdempotencyResponse = await request.post("/api/analytics/assignments", {
      data: { ...payload, idempotencyKey: "" },
    });
    expect(missingIdempotencyResponse.status()).toBe(400);
    await expect(missingIdempotencyResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_required" }),
    );

    await expect.poll(countFor).toBe(beforeCount + 2);
  });

  test("audience opt-in records one privacy-safe analytics event across idempotent replay", async ({ request }) => {
    const countFor = async () => {
      const response = await request.get("/analytics/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      const row = payload.eventSummary.aggregateCounts.find(
        (candidate: { event_definition_id: string }) =>
          candidate.event_definition_id === "event-audience-opt-in-created",
      );
      return row?.total_events ?? 0;
    };
    const beforeCount = await countFor();
    const idempotencyKey = `playwright-audience-analytics-${Date.now()}`;
    const optInPayload = {
      email: `playwright-analytics-${Date.now()}@example.com`,
      firstName: "Analytics",
      consent: true,
      formId: "opt-in-form-indie-launch-waitlist",
      idempotencyKey,
    };

    const firstResponse = await request.post("/api/audience/opt-in", { data: optInPayload });
    expect(firstResponse.ok(), await firstResponse.text()).toBeTruthy();
    const duplicateResponse = await request.post("/api/audience/opt-in", { data: optInPayload });
    expect(duplicateResponse.ok(), await duplicateResponse.text()).toBeTruthy();
    const duplicatePayload = await duplicateResponse.json();
    expect(duplicatePayload.duplicate).toBe(true);

    await expect.poll(countFor).toBe(beforeCount + 1);
  });

  test("affiliate source data exposes partners, referral links, commissions, and payout review", async ({ request, page }) => {
    const response = await request.get("/affiliates/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: affiliateReferralsSourceData.id,
        status: "owner-review-actions-ready",
        issue: 115,
        parentIssue: 19,
      }),
    );
    expect(payload.routes).toEqual(
      expect.arrayContaining([
        "/affiliates/source-data",
        "/api/affiliates/clicks",
        "/api/commerce/checkout",
        "/api/affiliates/commission-ledger",
        "/api/admin/affiliates/commission-ledger/actions",
        "/affiliates/indie-launch-partners",
      ]),
    );
    expect(payload.clickWrites).toEqual(
      expect.objectContaining({
        status: "click-capture-ready",
        issue: 109,
        apiRoute: "/api/affiliates/clicks",
        tables: expect.arrayContaining(["affiliate_referral_clicks"]),
      }),
    );
    expect(payload.clickSummary).toEqual(
      expect.objectContaining({
        status: "available",
        rawRowsIncluded: false,
        privateDataIncluded: false,
      }),
    );
    expect(payload.checkoutAttribution).toEqual(
      expect.objectContaining({
        status: "checkout-attribution-evidence-ready",
        issue: 111,
        tables: expect.arrayContaining(["checkout_referral_attributions"]),
      }),
    );
    expect(payload.checkoutAttributionSummary).toEqual(
      expect.objectContaining({
        status: "available",
        rawRowsIncluded: false,
        privateDataIncluded: false,
        commissionRowsIncluded: false,
      }),
    );
    expect(payload.commissionLedgerWrites).toEqual(
      expect.objectContaining({
        status: "owner-review-actions-ready",
        issue: 115,
        apiRoute: "/api/affiliates/commission-ledger",
        tables: expect.arrayContaining(["affiliate_commission_ledger_entries", "affiliate_commission_ledger_actions"]),
      }),
    );
    expect(payload.commissionReviewActions.contract).toEqual(
      expect.objectContaining({
        status: "owner-review-actions-ready",
        issue: 115,
        apiRoute: "/api/admin/affiliates/commission-ledger/actions",
      }),
    );
    expect(payload.commissionLedgerSummary).toEqual(
      expect.objectContaining({
        status: "available",
        rawRowsIncluded: false,
        privateDataIncluded: false,
        payableRowsIncluded: false,
        payoutRowsIncluded: false,
        partnerNotificationsIncluded: false,
      }),
    );
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
    expect(payload.writeBoundary).toContain("Issue #109 can capture seeded referral clicks");
    expect(payload.writeBoundary).toContain("Issue #111 can attach validated referral click evidence");
    expect(payload.writeBoundary).toContain("Issue #113 can create review-only");
    expect(payload.writeBoundary).toContain("Issue #115 can apply owner-gated review");
    expect(payload.caveat).toContain("review-only commission ledger evidence");

    await page.goto("/affiliates/indie-launch-partners");
    await expect(page.getByRole("heading", { name: /Indie launch partner program preview/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Partner links can connect privacy-safe clicks to checkout evidence/i })).toBeVisible();
    await expect(page.locator(".admin-pill").filter({ hasText: /^LAUNCHCIRCLE$/ })).toBeVisible();
    await expect(page.getByText("Possible self-referral")).toBeVisible();
  });

  test("affiliate click API validates seeded links and replays idempotent responses", async ({ request }) => {
    const countFor = async () => {
      const response = await request.get("/affiliates/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      const row = payload.clickSummary.aggregateCounts.find(
        (candidate: { referral_link_id: string }) => candidate.referral_link_id === "ref-link-launch-circle-waitlist",
      );
      return row?.total_clicks ?? 0;
    };
    const beforeCount = await countFor();
    const idempotencyKey = `playwright-referral-click-${Date.now()}`;
    const payload = {
      referralLinkId: "ref-link-launch-circle-waitlist",
      destinationRoute: "/funnels/indie-launch-sandbox",
      anonymousVisitorKey: "playwright-referral-visitor",
      idempotencyKey,
    };

    const firstResponse = await request.post("/api/affiliates/clicks", { data: payload });
    expect(firstResponse.ok(), await firstResponse.text()).toBeTruthy();
    const firstResult = await firstResponse.json();
    expect(firstResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: false,
        status: "recorded",
        referralLinkId: "ref-link-launch-circle-waitlist",
        referralCode: "LAUNCHCIRCLE",
        partnerId: "affiliate-partner-launch-circle",
        destinationRoute: "/funnels/indie-launch-sandbox",
        privateDataIncluded: false,
        rawRequestDataIncluded: false,
      }),
    );
    expect(firstResult).not.toHaveProperty("anonymousVisitorKey");

    const duplicateResponse = await request.post("/api/affiliates/clicks", { data: payload });
    expect(duplicateResponse.ok(), await duplicateResponse.text()).toBeTruthy();
    const duplicateResult = await duplicateResponse.json();
    expect(duplicateResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        referralClickId: firstResult.referralClickId,
      }),
    );

    const codeResponse = await request.post("/api/affiliates/clicks", {
      data: {
        code: "launchcircle",
        destinationRoute: "/funnels/indie-launch-sandbox",
        idempotencyKey: `${idempotencyKey}-code`,
      },
    });
    expect(codeResponse.ok(), await codeResponse.text()).toBeTruthy();
    const codeResult = await codeResponse.json();
    expect(codeResult.referralLinkId).toBe("ref-link-launch-circle-waitlist");

    const unsupportedLinkResponse = await request.post("/api/affiliates/clicks", {
      data: { ...payload, referralLinkId: "ref-link-private", idempotencyKey: `${idempotencyKey}-unsupported` },
    });
    expect(unsupportedLinkResponse.status()).toBe(400);
    await expect(unsupportedLinkResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_referral_link" }),
    );

    const unsupportedRouteResponse = await request.post("/api/affiliates/clicks", {
      data: { ...payload, destinationRoute: "/private-admin", idempotencyKey: `${idempotencyKey}-route` },
    });
    expect(unsupportedRouteResponse.status()).toBe(400);
    await expect(unsupportedRouteResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_destination_route" }),
    );

    const missingIdempotencyResponse = await request.post("/api/affiliates/clicks", {
      data: { ...payload, idempotencyKey: "" },
    });
    expect(missingIdempotencyResponse.status()).toBe(400);
    await expect(missingIdempotencyResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_required" }),
    );

    await expect.poll(countFor).toBe(beforeCount + 2);
  });

  test("checkout API attaches referral click evidence without creating commissions", async ({ request }) => {
    const countFor = async () => {
      const response = await request.get("/commerce/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      const row = payload.referralAttribution.summary.aggregateCounts.find(
        (candidate: { referral_link_id: string }) => candidate.referral_link_id === "ref-link-launch-circle-waitlist",
      );
      return row?.total_checkouts ?? 0;
    };
    const beforeCount = await countFor();
    const clickIdempotencyKey = `playwright-referral-checkout-click-${Date.now()}`;
    const clickResponse = await request.post("/api/affiliates/clicks", {
      data: {
        referralLinkId: "ref-link-launch-circle-waitlist",
        destinationRoute: "/funnels/indie-launch-sandbox",
        anonymousVisitorKey: "playwright-referral-checkout-visitor",
        idempotencyKey: clickIdempotencyKey,
      },
    });
    expect(clickResponse.ok(), await clickResponse.text()).toBeTruthy();
    const clickResult = await clickResponse.json();

    const checkoutPayload = {
      confirmationText: checkoutConfirmationText,
      orderBumpPriceIds: ["price-launch-checklist-bump-usd"],
      referralClickId: clickResult.referralClickId,
      idempotencyKey: `playwright-referral-checkout-${Date.now()}`,
    };
    const checkoutResponse = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: checkoutPayload,
    });
    expect(checkoutResponse.ok(), await checkoutResponse.text()).toBeTruthy();
    const checkoutResult = await checkoutResponse.json();
    expect(checkoutResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: false,
        reason: "test_checkout_intent_created",
        checkoutIntentId: expect.stringMatching(/^checkout-intent-/),
        totalAmountCents: 2800,
        referralAttribution: expect.objectContaining({
          checkoutIntentId: expect.stringMatching(/^checkout-intent-/),
          referralClickId: clickResult.referralClickId,
          referralLinkId: "ref-link-launch-circle-waitlist",
          referralCode: "LAUNCHCIRCLE",
          partnerId: "affiliate-partner-launch-circle",
          attributionStatus: "checkout_intent_attached",
          commissionCreated: false,
          payableCommissionCreated: false,
          privateDataIncluded: false,
          rawRequestDataIncluded: false,
        }),
      }),
    );
    expect(checkoutResult.referralAttribution.checkoutIntentId).toBe(checkoutResult.checkoutIntentId);

    const duplicateCheckoutResponse = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: checkoutPayload,
    });
    expect(duplicateCheckoutResponse.ok(), await duplicateCheckoutResponse.text()).toBeTruthy();
    const duplicateCheckoutResult = await duplicateCheckoutResponse.json();
    expect(duplicateCheckoutResult).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        checkoutIntentId: checkoutResult.checkoutIntentId,
        referralAttribution: expect.objectContaining({
          referralClickId: clickResult.referralClickId,
          commissionCreated: false,
          payableCommissionCreated: false,
        }),
      }),
    );

    const missingClickResponse = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: { ...checkoutPayload, referralClickId: "referral-click-missing", idempotencyKey: `${checkoutPayload.idempotencyKey}-missing` },
    });
    expect(missingClickResponse.status()).toBe(400);
    await expect(missingClickResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "referral_click_not_found" }),
    );

    const routeMismatchClickResponse = await request.post("/api/affiliates/clicks", {
      data: {
        referralLinkId: "ref-link-template-partner-sales",
        destinationRoute: "/offers/indie-launch-stack",
        idempotencyKey: `${clickIdempotencyKey}-route-mismatch`,
      },
    });
    expect(routeMismatchClickResponse.ok(), await routeMismatchClickResponse.text()).toBeTruthy();
    const routeMismatchClick = await routeMismatchClickResponse.json();
    const routeMismatchCheckoutResponse = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: {
        ...checkoutPayload,
        referralClickId: routeMismatchClick.referralClickId,
        idempotencyKey: `${checkoutPayload.idempotencyKey}-route-mismatch`,
      },
    });
    expect(routeMismatchCheckoutResponse.status()).toBe(400);
    await expect(routeMismatchCheckoutResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "referral_click_route_mismatch" }),
    );

    const secondClickResponse = await request.post("/api/affiliates/clicks", {
      data: {
        code: "launchcircle",
        destinationRoute: "/funnels/indie-launch-sandbox",
        idempotencyKey: `${clickIdempotencyKey}-second-valid`,
      },
    });
    expect(secondClickResponse.ok(), await secondClickResponse.text()).toBeTruthy();
    const secondClick = await secondClickResponse.json();
    const conflictingReplayResponse = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: {
        ...checkoutPayload,
        referralClickId: secondClick.referralClickId,
      },
    });
    expect(conflictingReplayResponse.status()).toBe(409);
    await expect(conflictingReplayResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "checkout_referral_attribution_conflict" }),
    );

    await expect.poll(countFor).toBe(beforeCount + 1);
  });

  test("commission ledger API creates review-only evidence from attributed checkouts", async ({ request }) => {
    const countFor = async () => {
      const response = await request.get("/affiliates/source-data");
      expect(response.ok()).toBeTruthy();
      const payload = await response.json();
      return payload.commissionLedgerSummary.aggregateCounts
        .filter((candidate: { referral_link_id: string }) => candidate.referral_link_id === "ref-link-launch-circle-waitlist")
        .reduce((sum: number, row: { total_ledgers: number }) => sum + row.total_ledgers, 0);
    };
    const beforeCount = await countFor();
    const contractResponse = await request.get("/api/affiliates/commission-ledger");
    expect(contractResponse.ok(), await contractResponse.text()).toBeTruthy();
    await expect(contractResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        issue: 115,
        status: "owner-review-actions-ready",
        confirmation: expect.objectContaining({ text: affiliateCommissionLedgerConfirmationText }),
        redaction: expect.objectContaining({
          payableCommissionCreated: false,
          payoutCreated: false,
          taxDataIncluded: false,
        }),
      }),
    );

    const suffix = Date.now();
    const clickResponse = await request.post("/api/affiliates/clicks", {
      data: {
        referralLinkId: "ref-link-launch-circle-waitlist",
        destinationRoute: "/funnels/indie-launch-sandbox",
        idempotencyKey: `playwright-commission-click-${suffix}`,
      },
    });
    expect(clickResponse.ok(), await clickResponse.text()).toBeTruthy();
    const clickResult = await clickResponse.json();
    const checkoutResponse = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: {
        confirmationText: checkoutConfirmationText,
        orderBumpPriceIds: ["price-launch-checklist-bump-usd"],
        referralClickId: clickResult.referralClickId,
        idempotencyKey: `playwright-commission-checkout-${suffix}`,
      },
    });
    expect(checkoutResponse.ok(), await checkoutResponse.text()).toBeTruthy();
    const checkoutResult = await checkoutResponse.json();

    const ledgerPayload = {
      checkoutIntentId: checkoutResult.checkoutIntentId,
      confirmationText: affiliateCommissionLedgerConfirmationText,
      idempotencyKey: `playwright-commission-ledger-${suffix}`,
    };
    const ledgerResponse = await request.post("/api/affiliates/commission-ledger", { data: ledgerPayload });
    expect(ledgerResponse.ok(), await ledgerResponse.text()).toBeTruthy();
    const ledgerResult = await ledgerResponse.json();
    expect(ledgerResult).toEqual(
      expect.objectContaining({
        ok: true,
        status: "review_only_commission_recorded",
        duplicate: false,
        commissionLedger: expect.objectContaining({
          checkoutIntentId: checkoutResult.checkoutIntentId,
          referralAttributionId: expect.stringMatching(/^checkout-referral-/),
          referralClickId: clickResult.referralClickId,
          referralLinkId: "ref-link-launch-circle-waitlist",
          partnerId: "affiliate-partner-launch-circle",
          commissionRuleIds: expect.arrayContaining([
            "commission-rule-launch-pass-30",
            "commission-rule-checklist-bump-10",
          ]),
          grossSaleCents: 2800,
          commissionCents: 460,
          ledgerStatus: "review_only",
          reviewStatus: "refund_window_open",
          payoutStatus: "not_payable",
          payableCommissionCreated: false,
          payoutCreated: false,
          taxDataIncluded: false,
          partnerNotificationSent: false,
          privateDataIncluded: false,
          rawStripeIdsIncluded: false,
        }),
      }),
    );

    const duplicateResponse = await request.post("/api/affiliates/commission-ledger", { data: ledgerPayload });
    expect(duplicateResponse.ok(), await duplicateResponse.text()).toBeTruthy();
    const duplicateResult = await duplicateResponse.json();
    expect(duplicateResult).toEqual(
      expect.objectContaining({
        ok: true,
        status: "review_only_commission_replayed",
        duplicate: true,
        commissionLedger: expect.objectContaining({
          commissionLedgerId: ledgerResult.commissionLedger.commissionLedgerId,
          payoutStatus: "not_payable",
        }),
      }),
    );

    const sameCheckoutDifferentLedgerResponse = await request.post("/api/affiliates/commission-ledger", {
      data: { ...ledgerPayload, idempotencyKey: `${ledgerPayload.idempotencyKey}-conflict` },
    });
    expect(sameCheckoutDifferentLedgerResponse.status()).toBe(409);
    await expect(sameCheckoutDifferentLedgerResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "commission_ledger_checkout_conflict" }),
    );

    const missingCheckoutResponse = await request.post("/api/affiliates/commission-ledger", {
      data: {
        checkoutIntentId: "checkout-intent-missing",
        confirmationText: affiliateCommissionLedgerConfirmationText,
        idempotencyKey: `${ledgerPayload.idempotencyKey}-missing`,
      },
    });
    expect(missingCheckoutResponse.status()).toBe(400);
    await expect(missingCheckoutResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "checkout_intent_not_found" }),
    );

    const unattributedCheckoutResponse = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: {
        confirmationText: checkoutConfirmationText,
        idempotencyKey: `playwright-commission-unattributed-checkout-${suffix}`,
      },
    });
    expect(unattributedCheckoutResponse.ok(), await unattributedCheckoutResponse.text()).toBeTruthy();
    const unattributedCheckout = await unattributedCheckoutResponse.json();
    const unattributedLedgerResponse = await request.post("/api/affiliates/commission-ledger", {
      data: {
        checkoutIntentId: unattributedCheckout.checkoutIntentId,
        confirmationText: affiliateCommissionLedgerConfirmationText,
        idempotencyKey: `${ledgerPayload.idempotencyKey}-unattributed`,
      },
    });
    expect(unattributedLedgerResponse.status()).toBe(400);
    await expect(unattributedLedgerResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "checkout_referral_attribution_required" }),
    );

    const missingConfirmationResponse = await request.post("/api/affiliates/commission-ledger", {
      data: { ...ledgerPayload, confirmationText: "not confirmed", idempotencyKey: `${ledgerPayload.idempotencyKey}-no-confirm` },
    });
    expect(missingConfirmationResponse.status()).toBe(400);
    await expect(missingConfirmationResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "commission_ledger_confirmation_required" }),
    );

    await expect.poll(countFor).toBe(beforeCount + 1);
  });

  test("owner can review and reverse commission ledger evidence without payout state", async ({ page, request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Owner-gated review action flow is covered once on desktop.");

    const signedOutResponse = await request.post("/api/admin/affiliates/commission-ledger/actions", {
      data: {
        commissionLedgerId: "commission-ledger-missing",
        actionKind: "mark_reviewed",
        confirmationText: affiliateCommissionReviewActionConfirmationText,
        idempotencyKey: "playwright-signed-out-commission-review",
        expectedUpdatedAt: 1,
      },
    });
    expect(signedOutResponse.status()).toBe(401);
    await expect(signedOutResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    await signInOrCreateOwner(page);

    const suffix = Date.now();
    const clickResponse = await page.request.post("/api/affiliates/clicks", {
      data: {
        referralLinkId: "ref-link-launch-circle-waitlist",
        destinationRoute: "/funnels/indie-launch-sandbox",
        idempotencyKey: `playwright-commission-review-click-${suffix}`,
      },
    });
    expect(clickResponse.ok(), await clickResponse.text()).toBeTruthy();
    const clickResult = await clickResponse.json();
    const checkoutResponse = await page.request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: {
        confirmationText: checkoutConfirmationText,
        orderBumpPriceIds: ["price-launch-checklist-bump-usd"],
        referralClickId: clickResult.referralClickId,
        idempotencyKey: `playwright-commission-review-checkout-${suffix}`,
      },
    });
    expect(checkoutResponse.ok(), await checkoutResponse.text()).toBeTruthy();
    const checkoutResult = await checkoutResponse.json();

    const ledgerResponse = await page.request.post("/api/affiliates/commission-ledger", {
      data: {
        checkoutIntentId: checkoutResult.checkoutIntentId,
        confirmationText: affiliateCommissionLedgerConfirmationText,
        idempotencyKey: `playwright-commission-review-ledger-${suffix}`,
      },
    });
    expect(ledgerResponse.ok(), await ledgerResponse.text()).toBeTruthy();
    const ledgerResult = await ledgerResponse.json();
    const createdLedger = ledgerResult.commissionLedger;
    expect(createdLedger).toEqual(
      expect.objectContaining({
        commissionCents: 460,
        ledgerStatus: "review_only",
        reviewStatus: "refund_window_open",
        payoutStatus: "not_payable",
        updatedAt: expect.any(Number),
      }),
    );

    const contractResponse = await page.request.get("/api/admin/affiliates/commission-ledger/actions");
    expect(contractResponse.ok(), await contractResponse.text()).toBeTruthy();
    await expect(contractResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        issue: 115,
        status: "owner-review-actions-ready",
        confirmation: expect.objectContaining({ text: affiliateCommissionReviewActionConfirmationText }),
        redaction: expect.objectContaining({
          payableCommissionCreated: false,
          payoutCreated: false,
          taxDataIncluded: false,
          partnerNotificationSent: false,
        }),
      }),
    );

    const reviewPayload = {
      commissionLedgerId: createdLedger.commissionLedgerId,
      actionKind: "mark_reviewed",
      confirmationText: affiliateCommissionReviewActionConfirmationText,
      idempotencyKey: `playwright-commission-review-action-${suffix}`,
      expectedUpdatedAt: createdLedger.updatedAt,
      reason: "Public note: source checkout and referral attribution match.",
    };
    const reviewResponse = await page.request.post("/api/admin/affiliates/commission-ledger/actions", {
      data: reviewPayload,
    });
    expect(reviewResponse.ok(), await reviewResponse.text()).toBeTruthy();
    const reviewResult = await reviewResponse.json();
    expect(reviewResult).toEqual(
      expect.objectContaining({
        ok: true,
        status: "commission_review_action_recorded",
        duplicate: false,
        reviewAction: expect.objectContaining({
          actionKind: "mark_reviewed",
          previousReviewStatus: "refund_window_open",
          nextReviewStatus: "owner_reviewed",
          nextPayoutStatus: "not_payable",
          privateDataIncluded: false,
          payoutCreated: false,
          taxDataIncluded: false,
          partnerNotificationSent: false,
        }),
        commissionLedger: expect.objectContaining({
          commissionLedgerId: createdLedger.commissionLedgerId,
          ledgerStatus: "review_only",
          reviewStatus: "owner_reviewed",
          payoutStatus: "not_payable",
          updatedAt: expect.any(Number),
        }),
      }),
    );
    expect(reviewResult.commissionLedger.updatedAt).toBeGreaterThan(createdLedger.updatedAt);

    const duplicateReview = await page.request.post("/api/admin/affiliates/commission-ledger/actions", {
      data: reviewPayload,
    });
    expect(duplicateReview.ok(), await duplicateReview.text()).toBeTruthy();
    await expect(duplicateReview.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "commission_review_action_replayed",
        duplicate: true,
        reviewAction: expect.objectContaining({ actionId: reviewResult.reviewAction.actionId }),
      }),
    );

    const staleResponse = await page.request.post("/api/admin/affiliates/commission-ledger/actions", {
      data: {
        ...reviewPayload,
        actionKind: "hold_for_review",
        idempotencyKey: `${reviewPayload.idempotencyKey}-stale`,
      },
    });
    expect(staleResponse.status()).toBe(409);
    await expect(staleResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "commission_review_stale_state" }),
    );

    const reverseResponse = await page.request.post("/api/admin/affiliates/commission-ledger/actions", {
      data: {
        commissionLedgerId: createdLedger.commissionLedgerId,
        actionKind: "reverse_evidence",
        confirmationText: affiliateCommissionReviewActionConfirmationText,
        idempotencyKey: `playwright-commission-review-reverse-${suffix}`,
        expectedUpdatedAt: reviewResult.commissionLedger.updatedAt,
        reason: "Public note: reversal before payout eligibility.",
      },
    });
    expect(reverseResponse.ok(), await reverseResponse.text()).toBeTruthy();
    const reverseResult = await reverseResponse.json();
    expect(reverseResult).toEqual(
      expect.objectContaining({
        ok: true,
        status: "commission_review_action_recorded",
        commissionLedger: expect.objectContaining({
          ledgerStatus: "reversed",
          reviewStatus: "owner_reversed",
          payoutStatus: "not_payable",
          payoutCreated: false,
          taxDataIncluded: false,
          partnerNotificationSent: false,
        }),
      }),
    );

    const secondReviewResponse = await page.request.post("/api/admin/affiliates/commission-ledger/actions", {
      data: {
        commissionLedgerId: createdLedger.commissionLedgerId,
        actionKind: "mark_reviewed",
        confirmationText: affiliateCommissionReviewActionConfirmationText,
        idempotencyKey: `playwright-commission-review-after-reverse-${suffix}`,
        expectedUpdatedAt: reverseResult.commissionLedger.updatedAt,
      },
    });
    expect(secondReviewResponse.status()).toBe(409);
    await expect(secondReviewResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "commission_review_already_reversed" }),
    );

    const sourceDataResponse = await page.request.get("/affiliates/source-data");
    expect(sourceDataResponse.ok(), await sourceDataResponse.text()).toBeTruthy();
    const sourceData = await sourceDataResponse.json();
    expect(sourceData.commissionReviewActions.contract.issue).toBe(115);
    expect(sourceData.commissionLedgerSummary.reviewActionCounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action_kind: "mark_reviewed", next_payout_status: "not_payable" }),
        expect.objectContaining({ action_kind: "reverse_evidence", next_payout_status: "not_payable" }),
      ]),
    );
    expect(sourceData.commissionLedgerSummary).toEqual(
      expect.objectContaining({
        rawRowsIncluded: false,
        privateDataIncluded: false,
        payableRowsIncluded: false,
        payoutRowsIncluded: false,
        taxRowsIncluded: false,
        partnerNotificationsIncluded: false,
      }),
    );
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
          issueNumbers: [11, 34, 15, 16, 81, 99, 101, 111, 113, 115, 117],
        }),
        expect.objectContaining({
          id: "journey-buyer-chooses-post-purchase-offer",
          featureId: "feature-checkout-offers",
          issueNumbers: [15, 99, 117],
        }),
        expect.objectContaining({
          id: "journey-publisher-previews-product-access",
          featureId: "feature-products-access",
          issueNumbers: [16, 83, 101, 139, 141, 143, 146, 147, 151, 179],
        }),
        expect.objectContaining({
          id: "journey-publisher-verifies-sandbox-entitlement-grant",
          featureId: "feature-products-access",
          issueNumbers: [16, 83, 99, 101, 139, 141, 143, 146, 147, 151, 179],
        }),
        expect.objectContaining({
          id: "journey-publisher-checks-mobile-admin",
          featureId: "feature-mobile-admin",
          issueNumbers: [13, 67, 68, 153, 155, 157],
        }),
        expect.objectContaining({
          id: "journey-publisher-previews-audience-automation",
          featureId: "feature-email-automation-crm",
          issueNumbers: [17, 85, 103, 137, 167, 169, 171, 173, 175, 177],
        }),
        expect.objectContaining({
          id: "journey-visitor-joins-indie-launch-waitlist",
          featureId: "feature-email-automation-crm",
          issueNumbers: [17, 85, 103, 167],
        }),
        expect.objectContaining({
          id: "journey-publisher-previews-analytics-experiments",
          featureId: "feature-analytics-testing",
          issueNumbers: [18, 87, 105, 107, 119, 121, 123, 125, 127, 129],
        }),
        expect.objectContaining({
          id: "journey-publisher-reads-funnel-conversion-report",
          featureId: "feature-analytics-testing",
          issueNumbers: [18, 87, 105, 107, 119, 121, 123, 125, 127, 129],
        }),
        expect.objectContaining({
          id: "journey-agent-records-privacy-safe-analytics-event",
          featureId: "feature-analytics-testing",
          issueNumbers: [18, 87, 105, 121, 125],
        }),
        expect.objectContaining({
          id: "journey-agent-assigns-privacy-safe-experiment-variant",
          featureId: "feature-analytics-testing",
          issueNumbers: [18, 87, 105, 107],
        }),
        expect.objectContaining({
          id: "journey-publisher-previews-affiliate-referrals",
          featureId: "feature-affiliates-referrals",
          issueNumbers: [19, 89, 109, 111, 113, 115],
        }),
        expect.objectContaining({
          id: "journey-agent-records-privacy-safe-referral-click",
          featureId: "feature-affiliates-referrals",
          issueNumbers: [19, 89, 109],
        }),
        expect.objectContaining({
          id: "journey-agent-attaches-referral-click-to-checkout",
          featureId: "feature-affiliates-referrals",
          issueNumbers: [19, 109, 111],
        }),
        expect.objectContaining({
          id: "journey-agent-creates-review-only-commission-evidence",
          featureId: "feature-affiliates-referrals",
          issueNumbers: [19, 109, 111, 113],
        }),
        expect.objectContaining({
          id: "journey-owner-reviews-commission-ledger-evidence",
          featureId: "feature-affiliates-referrals",
          issueNumbers: [19, 113, 115],
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
        supportsReferralAttributionEvidence: true,
        postPurchaseDecisionRoute: "/api/commerce/post-purchase-decisions",
        postPurchaseRoutePrefix: "/commerce/post-purchase",
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
        expect.objectContaining({ table: "checkout_referral_attributions" }),
        expect.objectContaining({ table: "checkout_post_purchase_decisions" }),
        expect.objectContaining({ table: "affiliate_commission_ledger_entries" }),
        expect.objectContaining({ table: "affiliate_commission_ledger_actions" }),
        expect.objectContaining({ table: "product_entitlements" }),
        expect.objectContaining({ table: "product_fulfillment_tasks" }),
        expect.objectContaining({ table: "product_asset_uploads" }),
        expect.objectContaining({ table: "product_entitlement_revocation_intents" }),
        expect.objectContaining({ table: "stripe_webhook_events" }),
        expect.objectContaining({ table: "payment_audit_events" }),
      ]),
    );
    expect(payload.referralAttribution).toEqual(
      expect.objectContaining({
        contract: expect.objectContaining({
          status: "checkout-attribution-evidence-ready",
          issue: 111,
          checkoutApiRoute: "/api/commerce/checkout",
        }),
        summary: expect.objectContaining({
          status: "available",
          rawRowsIncluded: false,
          privateDataIncluded: false,
          commissionRowsIncluded: false,
        }),
      }),
    );
    expect(payload.affiliateCommissionLedger).toEqual(
      expect.objectContaining({
        contract: expect.objectContaining({
          status: "owner-review-actions-ready",
          issue: 115,
          apiRoute: "/api/affiliates/commission-ledger",
        }),
        ownerReviewActions: expect.objectContaining({
          status: "owner-review-actions-ready",
          issue: 115,
          apiRoute: "/api/admin/affiliates/commission-ledger/actions",
        }),
        summary: expect.objectContaining({
          status: "available",
          rawRowsIncluded: false,
          privateDataIncluded: false,
          payableRowsIncluded: false,
          payoutRowsIncluded: false,
          partnerNotificationsIncluded: false,
        }),
      }),
    );
    expect(payload.postPurchaseDecisions).toEqual(
      expect.objectContaining({
        contract: expect.objectContaining({
          status: "non-billing-decision-ready",
          issue: 117,
          apiRoute: "/api/commerce/post-purchase-decisions",
        }),
        summary: expect.objectContaining({
          status: "available",
          rawRowsIncluded: false,
          privateDataIncluded: false,
          billingMutationsIncluded: false,
          fulfillmentRowsIncluded: false,
          entitlementRowsIncluded: false,
        }),
      }),
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
        expect.objectContaining({
          id: "mcp-resource-checkout-offers",
          status: "ready-contract",
          purpose: expect.stringContaining("aggregate post-purchase decision evidence"),
        }),
        expect.objectContaining({ id: "mcp-resource-product-access", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-tool-create-product-asset-upload-intent", status: "planned" }),
        expect.objectContaining({ id: "mcp-resource-mobile-admin-dashboard", status: "ready-contract" }),
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
        expect.objectContaining({
          id: "read-product-access-catalog",
          route: "/products/source-data",
          auth: "public",
          stableIds: expect.arrayContaining(["productEntitlementRevocationIntentId"]),
          safeForAgents: expect.arrayContaining(["Inspect non-destructive revocation intent readiness"]),
        }),
        expect.objectContaining({
          id: "read-customer-product-entitlements",
          route: "/api/products/entitlements",
          auth: "public",
        }),
        expect.objectContaining({
          id: "create-sandbox-product-download-token",
          route: "/api/products/download-tokens",
          auth: "public",
        }),
        expect.objectContaining({ id: "read-admin-product-entitlements", route: "/admin/products", auth: "owner-session" }),
        expect.objectContaining({
          id: "create-owner-product-asset-upload-intent",
          route: "/api/admin/products/assets",
          auth: "owner-session",
        }),
        expect.objectContaining({
          id: "read-audience-automation",
          route: "/audience/source-data",
          auth: "public",
          stableIds: expect.arrayContaining([
            "broadcastReadinessId",
            "broadcastScheduleIntentId",
            "broadcastPreviewSafetyId",
            "broadcastQueueReadinessId",
          ]),
          safeForAgents: expect.arrayContaining([
            "Inspect suppression-aware broadcast readiness without recipient exposure",
            "Inspect public-safe dry-run broadcast schedule intent counts without actor email or recipient payloads",
            "Inspect broadcast preview and unsubscribe-footer safety without personalized body or recipient exposure",
            "Inspect delivery queue readiness without recipient payloads, queue rows, or provider sends",
          ]),
        }),
        expect.objectContaining({
          id: "create-audience-unsubscribe-suppression",
          route: "/api/audience/unsubscribe",
          auth: "public",
        }),
        expect.objectContaining({
          id: "create-owner-audience-crm-note",
          route: "/api/admin/audience/notes",
          auth: "owner-session",
        }),
        expect.objectContaining({
          id: "create-owner-broadcast-schedule-intent",
          route: audienceBroadcastScheduleIntentApiRoute,
          auth: "owner-session",
        }),
        expect.objectContaining({ id: "read-admin-audience-subscribers", route: "/admin/audience", auth: "owner-session" }),
        expect.objectContaining({ id: "read-analytics-experiments", route: "/analytics/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-affiliate-referrals", route: "/affiliates/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-mobile-admin-contract", route: "/mobile-admin/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-mobile-admin-dashboard", route: "/mobile-admin/dashboard/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-ios-mobile-admin", route: "/mobile-admin/ios/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-android-mobile-admin", route: "/mobile-admin/android/source-data", auth: "public" }),
      ]),
    );
    expect(payload.readContracts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "read-checkout-offer-stack",
          stableIds: expect.arrayContaining(["postPurchaseDecisionId"]),
          safeForAgents: expect.arrayContaining(["Inspect aggregate non-billing post-purchase decision counts"]),
        }),
        expect.objectContaining({
          id: "read-analytics-experiments",
          stableIds: expect.arrayContaining([
            "analyticsEventVariantAggregateId",
            "experimentAssignmentId",
            "analyticsFunnelConversionReportId",
            "analyticsPageViewBeaconId",
          ]),
        }),
        expect.objectContaining({
          id: "read-affiliate-referrals",
          stableIds: expect.arrayContaining([
            "referralClickId",
            "checkoutIntentId",
            "referralAttributionId",
            "reviewOnlyCommissionLedgerId",
          ]),
        }),
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
    expect(payload.publicBaseUrl).toBe("https://bumpgrade.com");
    expect(payload.status).toBe("contract-ready");
    expect(payload.liveDashboard).toEqual(
      expect.objectContaining({
        issue: mobileAdminDashboardIssue,
        renderedInScaffoldsIssue: 155,
        liveHydrationIssue: 157,
        route: mobileAdminDashboardRoute,
        status: "live-public-source-data-ready",
      }),
    );
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
        expect.objectContaining({ id: "mobile-api-dashboard", route: "/mobile-admin/dashboard/source-data" }),
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

  test("mobile admin dashboard source data exposes one public-safe live digest", async ({ request }) => {
    const response = await request.get(mobileAdminDashboardRoute);
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    const payload = JSON.parse(text);

    expect(payload).toEqual(
      expect.objectContaining({
        id: "bumpgrade-mobile-admin-dashboard-source-data",
        status: mobileAdminDashboardStatus,
        issue: mobileAdminDashboardIssue,
        parentIssue: 13,
        featureId: "feature-mobile-admin",
        route: mobileAdminDashboardRoute,
      }),
    );
    expect(payload.sourceRoutes).toEqual(
      expect.arrayContaining([
        "/mobile-admin/source-data",
        "/mobile-admin/dashboard/source-data",
        "/mobile-admin/ios/source-data",
        "/mobile-admin/android/source-data",
        "/features/source-data",
        "/roadmap/source-data",
        "/admin/source-data",
        "/commerce/source-data",
        "/agent-docs/source-data",
      ]),
    );
    expect(payload.redaction).toEqual(
      expect.objectContaining({
        privateBuyerDataIncluded: false,
        rawInboxBodiesIncluded: false,
        ownerEmailValuesIncluded: false,
        sessionIdentifiersIncluded: false,
        r2ObjectKeysIncluded: false,
        signedUrlsIncluded: false,
        uploadBodiesIncluded: false,
        secretValuesIncluded: false,
        writeTokensIncluded: false,
      }),
    );
    expect(payload.platformStatus).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ platform: "ios", issue: 67, sourceDataRoute: "/mobile-admin/ios/source-data" }),
        expect.objectContaining({ platform: "android", issue: 68, sourceDataRoute: "/mobile-admin/android/source-data" }),
      ]),
    );
    expect(payload.featureSummary).toEqual(
      expect.objectContaining({
        total: featureCatalog.length,
        mobileFeature: expect.objectContaining({ id: "feature-mobile-admin", issue: 13 }),
      }),
    );
    expect(payload.adminDigest).toEqual(
      expect.objectContaining({
        source: expect.stringMatching(/^(d1|fixture|mixed)$/),
        counts: expect.objectContaining({
          roadmapItems: expect.any(Number),
          workLogEntries: expect.any(Number),
          userJourneys: expect.any(Number),
          openAttentionItems: expect.any(Number),
        }),
      }),
    );
    expect(payload.commerceDigest).toEqual(
      expect.objectContaining({
        sourceDataRoute: "/commerce/source-data",
        tableCount: commerceTables.length,
        privateFieldsIncluded: false,
      }),
    );
    expect(payload.agentDigest).toEqual(
      expect.objectContaining({
        sourceDataRoute: "/agent-docs/source-data",
        mobileReadContracts: expect.arrayContaining([
          expect.objectContaining({ id: "read-mobile-admin-contract" }),
          expect.objectContaining({ id: "read-mobile-admin-dashboard" }),
        ]),
      }),
    );
    expect(text).not.toContain("products/uploads/");
    expect(text).not.toContain("signed_url");
    expect(text).not.toContain("BETTER_AUTH_SECRET");
    expect(text).not.toContain("STRIPE_SECRET_KEY");
    expect(text).not.toContain("m@rkmoriarty.com");
    expect(text).not.toContain("mark@awesound.com");
    expect(text).not.toContain("markmoriarty@stripe.com");
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
        dashboardPanelIssue: 155,
        liveHydrationIssue: 157,
        liveDashboardUrl: "https://bumpgrade.com/mobile-admin/dashboard/source-data",
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
        expect.objectContaining({
          id: "ios-read-live-mobile-dashboard",
          route: "/mobile-admin/dashboard/source-data",
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
        dashboardPanelIssue: 155,
        liveHydrationIssue: 157,
        liveDashboardUrl: "https://bumpgrade.com/mobile-admin/dashboard/source-data",
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
        expect.objectContaining({
          id: "android-read-live-mobile-dashboard",
          route: "/mobile-admin/dashboard/source-data",
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

  test("paid checkout webhook grants sandbox product entitlements once", async ({ request }) => {
    const idempotencyKey = `playwright-entitlements-${Date.now()}`;
    const checkout = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: {
        confirmationText: checkoutConfirmationText,
        orderBumpPriceIds: ["price-launch-checklist-bump-usd"],
        buyerEmail: "sandbox-buyer@example.com",
        idempotencyKey,
      },
    });
    expect(checkout.ok()).toBeTruthy();
    const checkoutPayload = await checkout.json();
    expect(checkoutPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "preview",
        reason: "test_checkout_intent_created",
        totalAmountCents: 2800,
      }),
    );
    expect(checkoutPayload.checkoutIntentId).toEqual(expect.stringMatching(/^checkout-intent-/));

    const eventId = `evt_bumpgrade_entitlements_${Date.now()}`;
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
          client_reference_id: checkoutPayload.checkoutIntentId,
          payment_status: "paid",
          status: "complete",
          metadata: {
            checkout_intent_id: checkoutPayload.checkoutIntentId,
            product_id: sandboxCheckoutOffer.productId,
            price_id: sandboxCheckoutOffer.priceId,
            audit_correlation_id: "audit-playwright-entitlements",
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
        duplicate: false,
        eventType: "checkout.session.completed",
        checkoutIntentUpdated: true,
        entitlementGrantsCreated: 2,
        entitlementGrantsSkipped: 0,
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

  test("post-purchase decision API records non-billing upsell and downsell evidence", async ({ request, page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Post-purchase decision flow is covered once on desktop.");

    const sourceBefore = await request.get("/offers/source-data");
    expect(sourceBefore.ok()).toBeTruthy();
    const beforePayload = await sourceBefore.json();
    const beforeAccepted =
      beforePayload.postPurchaseDecisionSummary.aggregateCounts.find(
        (row: { decision_kind: string }) => row.decision_kind === "accept_upsell_follow_up",
      )?.total_decisions ?? 0;
    const beforeDeclinedDownsell =
      beforePayload.postPurchaseDecisionSummary.aggregateCounts.find(
        (row: { decision_kind: string }) => row.decision_kind === "decline_downsell",
      )?.total_decisions ?? 0;

    const suffix = Date.now();
    const checkout = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: {
        confirmationText: checkoutConfirmationText,
        orderBumpPriceIds: ["price-launch-checklist-bump-usd"],
        buyerEmail: "post-purchase-buyer@example.com",
        idempotencyKey: `playwright-post-purchase-checkout-${suffix}`,
      },
    });
    expect(checkout.ok(), await checkout.text()).toBeTruthy();
    const checkoutPayload = await checkout.json();
    expect(checkoutPayload.checkoutIntentId).toEqual(expect.stringMatching(/^checkout-intent-/));

    const ineligible = await request.post("/api/commerce/post-purchase-decisions", {
      data: {
        checkoutIntentId: checkoutPayload.checkoutIntentId,
        decisionKind: "accept_upsell_follow_up",
        confirmationText: postPurchaseDecisionConfirmationText,
        idempotencyKey: `playwright-post-purchase-ineligible-${suffix}`,
        expectedCheckoutUpdatedAt: 1,
      },
    });
    expect(ineligible.status()).toBe(409);
    await expect(ineligible.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "post_purchase_checkout_not_eligible" }),
    );

    const event = {
      id: `evt_bumpgrade_post_purchase_${suffix}`,
      object: "event",
      api_version: "2026-04-22.dahlia",
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_redacted_by_route",
          object: "checkout.session",
          client_reference_id: checkoutPayload.checkoutIntentId,
          payment_status: "paid",
          status: "complete",
          metadata: {
            checkout_intent_id: checkoutPayload.checkoutIntentId,
            product_id: sandboxCheckoutOffer.productId,
            price_id: sandboxCheckoutOffer.priceId,
            audit_correlation_id: "audit-playwright-post-purchase",
          },
        },
      },
    };

    const webhook = await request.post("/api/stripe/webhook", {
      headers: { "x-bumpgrade-test-webhook": "allow" },
      data: event,
    });
    expect(webhook.ok(), await webhook.text()).toBeTruthy();

    const contract = await request.get(`/api/commerce/post-purchase-decisions?checkoutIntentId=${checkoutPayload.checkoutIntentId}`);
    expect(contract.ok(), await contract.text()).toBeTruthy();
    const contractPayload = await contract.json();
    expect(contractPayload).toEqual(
      expect.objectContaining({
        ok: true,
        issue: 117,
        status: "non-billing-decision-ready",
        checkout: expect.objectContaining({
          checkoutIntentId: checkoutPayload.checkoutIntentId,
          status: "paid",
          eligible: true,
          updatedAt: expect.any(Number),
          privateDataIncluded: false,
          rawStripeIdsIncluded: false,
        }),
      }),
    );

    await page.goto(`/commerce/post-purchase/${checkoutPayload.checkoutIntentId}`);
    await expect(page.getByRole("heading", { name: /Choose the next Bumpgrade launch offer/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch accelerator upsell" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch review downsell" })).toBeVisible();

    const decisionPayload = {
      checkoutIntentId: checkoutPayload.checkoutIntentId,
      decisionKind: "accept_upsell_follow_up",
      confirmationText: postPurchaseDecisionConfirmationText,
      idempotencyKey: `playwright-post-purchase-decision-${suffix}`,
      expectedCheckoutUpdatedAt: contractPayload.checkout.updatedAt,
    };
    const decision = await request.post("/api/commerce/post-purchase-decisions", { data: decisionPayload });
    expect(decision.ok(), await decision.text()).toBeTruthy();
    const decisionResult = await decision.json();
    expect(decisionResult).toEqual(
      expect.objectContaining({
        ok: true,
        status: "post_purchase_decision_recorded",
        duplicate: false,
        decision: expect.objectContaining({
          checkoutIntentId: checkoutPayload.checkoutIntentId,
          presentedOfferId: "offer-upsell-launch-accelerator",
          decisionKind: "accept_upsell_follow_up",
          stripeChargeCreated: false,
          paymentIntentCreated: false,
          fulfillmentCreated: false,
          entitlementGranted: false,
          privateDataIncluded: false,
          rawStripeIdsIncluded: false,
        }),
      }),
    );

    const duplicate = await request.post("/api/commerce/post-purchase-decisions", { data: decisionPayload });
    expect(duplicate.ok(), await duplicate.text()).toBeTruthy();
    await expect(duplicate.json()).resolves.toEqual(
      expect.objectContaining({ ok: true, status: "post_purchase_decision_replayed", duplicate: true }),
    );

    const downsellDeclinePayload = {
      ...decisionPayload,
      decisionKind: "decline_downsell",
      idempotencyKey: `playwright-post-purchase-downsell-decline-${suffix}`,
    };
    const downsellDecline = await request.post("/api/commerce/post-purchase-decisions", {
      data: downsellDeclinePayload,
    });
    expect(downsellDecline.ok(), await downsellDecline.text()).toBeTruthy();
    await expect(downsellDecline.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "post_purchase_decision_recorded",
        duplicate: false,
        decision: expect.objectContaining({
          checkoutIntentId: checkoutPayload.checkoutIntentId,
          presentedOfferId: "offer-downsell-launch-review",
          decisionKind: "decline_downsell",
          stripeChargeCreated: false,
          paymentIntentCreated: false,
          fulfillmentCreated: false,
          entitlementGranted: false,
          privateDataIncluded: false,
          rawStripeIdsIncluded: false,
        }),
      }),
    );

    const stale = await request.post("/api/commerce/post-purchase-decisions", {
      data: {
        ...decisionPayload,
        idempotencyKey: `${decisionPayload.idempotencyKey}-stale`,
        decisionKind: "accept_downsell_follow_up",
        expectedCheckoutUpdatedAt: contractPayload.checkout.updatedAt - 1,
      },
    });
    expect(stale.status()).toBe(409);
    await expect(stale.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "post_purchase_checkout_stale_state" }),
    );

    const sourceAfter = await request.get("/offers/source-data");
    expect(sourceAfter.ok()).toBeTruthy();
    const afterPayload = await sourceAfter.json();
    const afterAccepted =
      afterPayload.postPurchaseDecisionSummary.aggregateCounts.find(
        (row: { decision_kind: string }) => row.decision_kind === "accept_upsell_follow_up",
      )?.total_decisions ?? 0;
    expect(afterAccepted).toBe(beforeAccepted + 1);
    const afterDeclinedDownsell =
      afterPayload.postPurchaseDecisionSummary.aggregateCounts.find(
        (row: { decision_kind: string }) => row.decision_kind === "decline_downsell",
      )?.total_decisions ?? 0;
    expect(afterDeclinedDownsell).toBe(beforeDeclinedDownsell + 1);
  });

  test("checkout success page waits for trusted webhook state before post-purchase CTA", async ({ request, page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Checkout success polling is covered once on desktop.");

    await page.goto("/commerce/checkout/success");
    await expect(page.getByRole("heading", { name: /sandbox checkout returned successfully/i })).toBeVisible();
    await expect(page.getByText("No checkout intent was returned with this success page.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Continue offer path/i })).toHaveCount(0);

    const suffix = Date.now();
    const checkout = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: {
        confirmationText: checkoutConfirmationText,
        orderBumpPriceIds: ["price-launch-checklist-bump-usd"],
        buyerEmail: "checkout-success-buyer@example.com",
        idempotencyKey: `playwright-checkout-success-${suffix}`,
      },
    });
    expect(checkout.ok(), await checkout.text()).toBeTruthy();
    const checkoutPayload = await checkout.json();
    expect(checkoutPayload.checkoutIntentId).toEqual(expect.stringMatching(/^checkout-intent-/));

    await page.goto(`/commerce/checkout/success?checkout_intent_id=${checkoutPayload.checkoutIntentId}`);
    await expect(page.getByText(/Waiting for webhook confirmation/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Continue offer path/i })).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("cs_test");
    await expect(page.locator("body")).not.toContainText("pi_test");

    const event = {
      id: `evt_bumpgrade_checkout_success_${suffix}`,
      object: "event",
      api_version: "2026-04-22.dahlia",
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_redacted_by_route",
          object: "checkout.session",
          client_reference_id: checkoutPayload.checkoutIntentId,
          payment_status: "paid",
          status: "complete",
          metadata: {
            checkout_intent_id: checkoutPayload.checkoutIntentId,
            product_id: sandboxCheckoutOffer.productId,
            price_id: sandboxCheckoutOffer.priceId,
            audit_correlation_id: "audit-playwright-checkout-success",
          },
        },
      },
    };

    const webhook = await request.post("/api/stripe/webhook", {
      headers: { "x-bumpgrade-test-webhook": "allow" },
      data: event,
    });
    expect(webhook.ok(), await webhook.text()).toBeTruthy();

    const continueLink = page.getByRole("link", { name: /Continue offer path/i });
    await expect(continueLink).toBeVisible({ timeout: 8000 });
    await expect(continueLink).toHaveAttribute("href", `/commerce/post-purchase/${checkoutPayload.checkoutIntentId}`);
    await expect(page.getByText("Trusted checkout evidence is ready for the post-purchase path.")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("cs_test");
    await expect(page.locator("body")).not.toContainText("pi_test");
  });

  test("allowlisted owner can sign in and open protected admin surfaces", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Auth flow is covered once on the desktop project.");
    await signInOrCreateOwner(page);

    await page.goto("/admin/roadmap");
    await expect(page.getByRole("heading", { name: /Roadmap command center/i })).toBeVisible();

    await page.goto("/admin/for-mark");
    await expect(page.getByRole("heading", { name: /Non-blocking attention/i })).toBeVisible();
    await expect(page.locator("header.site-header").getByRole("link", { name: "Log in / sign up", exact: true })).toHaveCount(0);

    const audienceEmail = `owner-audience-${Date.now()}@example.com`;
    const audienceOptInResponse = await page.request.post("/api/audience/opt-in", {
      data: {
        email: ` ${audienceEmail.toUpperCase()} `,
        firstName: " Owner Contact ",
        consent: true,
        formId: "opt-in-form-indie-launch-waitlist",
        idempotencyKey: `playwright-owner-audience-${Date.now()}`,
      },
    });
    expect(audienceOptInResponse.ok(), await audienceOptInResponse.text()).toBeTruthy();
    const audienceOptInPayload = await audienceOptInResponse.json();
    const audienceUnsubscribeResponse = await page.request.post("/api/audience/unsubscribe", {
      data: {
        email: ` ${audienceEmail.toUpperCase()} `,
        reason: "owner smoke",
        idempotencyKey: `playwright-owner-audience-unsubscribe-${Date.now()}`,
      },
    });
    expect(audienceUnsubscribeResponse.ok(), await audienceUnsubscribeResponse.text()).toBeTruthy();
    const ownerNoteBody = `Owner CRM note ${Date.now()}`;
    const ownerNoteIdempotencyKey = `playwright-owner-audience-note-${Date.now()}`;
    const audienceNoteResponse = await page.request.post("/api/admin/audience/notes", {
      data: {
        subscriberId: audienceOptInPayload.subscriberId,
        expectedSubscriberStatus: "unsubscribed",
        noteBody: ownerNoteBody,
        confirmationText: audienceCrmTimelineConfirmationText,
        idempotencyKey: ownerNoteIdempotencyKey,
      },
    });
    expect(audienceNoteResponse.ok(), await audienceNoteResponse.text()).toBeTruthy();
    const audienceNotePayload = await audienceNoteResponse.json();
    expect(audienceNotePayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "crm_timeline_note_recorded",
        duplicate: false,
        note: expect.objectContaining({
          subscriberId: audienceOptInPayload.subscriberId,
          body: ownerNoteBody,
          privateNoteBodyIncluded: true,
        }),
      }),
    );
    const replayNoteResponse = await page.request.post("/api/admin/audience/notes", {
      data: {
        subscriberId: audienceOptInPayload.subscriberId,
        expectedSubscriberStatus: "unsubscribed",
        noteBody: ownerNoteBody,
        confirmationText: audienceCrmTimelineConfirmationText,
        idempotencyKey: ownerNoteIdempotencyKey,
      },
    });
    expect(replayNoteResponse.ok(), await replayNoteResponse.text()).toBeTruthy();
    await expect(replayNoteResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        note: expect.objectContaining({ id: audienceNotePayload.note.id }),
      }),
    );
    const audienceSourceAfterNote = await page.request.get("/audience/source-data");
    expect(audienceSourceAfterNote.ok(), await audienceSourceAfterNote.text()).toBeTruthy();
    const audienceSourceAfterNotePayload = await audienceSourceAfterNote.json();
    expect(audienceSourceAfterNotePayload.subscriberInspection.counts.timelineEntries).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(audienceSourceAfterNotePayload.subscriberInspection)).not.toContain(ownerNoteBody);

    const broadcastDraft = audienceSourceAfterNotePayload.broadcastReadiness.drafts.find(
      (draft: { id: string }) => draft.id === "broadcast-draft-launch-window",
    );
    expect(broadcastDraft).toEqual(
      expect.objectContaining({
        id: "broadcast-draft-launch-window",
        updatedAt: expect.any(String),
        readyRecipientCount: expect.any(Number),
      }),
    );
    const scheduleIntentIdempotencyKey = `playwright-broadcast-schedule-intent-${Date.now()}`;
    const scheduleIntentResponse = await page.request.post(audienceBroadcastScheduleIntentApiRoute, {
      data: {
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        requestedSendAt: "2026-05-21T16:00",
        confirmationText: audienceBroadcastScheduleIntentConfirmationText,
        idempotencyKey: scheduleIntentIdempotencyKey,
      },
    });
    expect(scheduleIntentResponse.ok(), await scheduleIntentResponse.text()).toBeTruthy();
    const scheduleIntentPayload = await scheduleIntentResponse.json();
    expect(scheduleIntentPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "broadcast_schedule_intent_recorded",
        duplicate: false,
        intent: expect.objectContaining({
          draftId: broadcastDraft.id,
          readyRecipientCount: broadcastDraft.readyRecipientCount,
          sendQueueRowsCreated: false,
          providerMessageIdsIncluded: false,
        }),
        redaction: expect.objectContaining({
          actorEmailIncluded: false,
          rawRecipientEmailsIncluded: false,
          sendQueueRowsCreated: false,
        }),
      }),
    );
    const replayScheduleIntentResponse = await page.request.post(audienceBroadcastScheduleIntentApiRoute, {
      data: {
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        requestedSendAt: "2026-05-21T16:00",
        confirmationText: audienceBroadcastScheduleIntentConfirmationText,
        idempotencyKey: scheduleIntentIdempotencyKey,
      },
    });
    expect(replayScheduleIntentResponse.ok(), await replayScheduleIntentResponse.text()).toBeTruthy();
    await expect(replayScheduleIntentResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        intent: expect.objectContaining({ id: scheduleIntentPayload.intent.id }),
      }),
    );
    const staleScheduleIntentResponse = await page.request.post(audienceBroadcastScheduleIntentApiRoute, {
      data: {
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount + 1,
        confirmationText: audienceBroadcastScheduleIntentConfirmationText,
        idempotencyKey: `playwright-broadcast-schedule-intent-stale-${Date.now()}`,
      },
    });
    expect(staleScheduleIntentResponse.status()).toBe(409);
    await expect(staleScheduleIntentResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_readiness_count",
        currentReadyRecipientCount: broadcastDraft.readyRecipientCount,
      }),
    );
    const audienceSourceAfterSchedule = await page.request.get("/audience/source-data");
    expect(audienceSourceAfterSchedule.ok(), await audienceSourceAfterSchedule.text()).toBeTruthy();
    const audienceSourceAfterSchedulePayload = await audienceSourceAfterSchedule.json();
    expect(audienceSourceAfterSchedulePayload.broadcastScheduleIntents.counts.scheduleIntents).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastScheduleIntents)).not.toContain("m@rkmoriarty.com");
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastScheduleIntents)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastPreviewSafety.counts.previewSafetyRecords).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastPreviewSafety)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastQueueReadiness.counts.queueReadinessRecords).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastQueueReadiness)).not.toContain(audienceEmail);

    await page.goto("/admin/audience");
    await expect(page.getByRole("heading", { name: /Subscriber inspection without public contact leaks/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Suppressions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "CRM notes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Broadcast readiness" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Schedule intents" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preview safety" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue readiness" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preview copy stays separate from delivery" })).toBeVisible();
    await expect(page.getByText("Your Bumpgrade launch window is ready to preview")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue gates are visible before producers exist" })).toBeVisible();
    await expect(page.getByText("audience-broadcast-delivery-dry-run")).toBeVisible();
    await expect(page.getByText("Dry-run schedule intents", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Owner intent is recorded before any delivery queue exists" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Draft sends stay blocked until readiness is explicit" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record dry-run schedule intent/i })).toBeVisible();
    await expect(page.getByText("Launch window announcement")).toBeVisible();
    const audienceCard = page.getByRole("article").filter({ hasText: audienceEmail.toLowerCase() });
    await expect(audienceCard.getByRole("heading", { name: audienceEmail.toLowerCase() })).toBeVisible();
    await expect(audienceCard.getByText("unsubscribed")).toBeVisible();
    await expect(audienceCard.getByText("First name: Owner Contact")).toBeVisible();
    await expect(audienceCard.getByText("lead-magnet:launch-checklist")).toBeVisible();
    await expect(audienceCard.getByText("Indie launch nurture sequence")).toBeVisible();
    await expect(audienceCard.getByText(ownerNoteBody)).toBeVisible();

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

    const templateDraftIdempotencyKey = `playwright-template-draft-${Date.now()}`;
    const templateDraftTitle = `Post-purchase template draft ${Date.now()}`;
    const templateDraftResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "create-from-template",
        templateId: "template-post-purchase-offer",
        title: templateDraftTitle,
        confirmationText: draftFunnelTemplateCreationConfirmationText,
        idempotencyKey: templateDraftIdempotencyKey,
        return: "json",
      },
    });
    expect(templateDraftResponse.ok(), await templateDraftResponse.text()).toBeTruthy();
    const templateDraftPayload = await templateDraftResponse.json();
    expect(templateDraftPayload).toEqual(
      expect.objectContaining({
        ok: true,
        mode: "create-from-template",
        draft: expect.objectContaining({
          title: templateDraftTitle,
          sourceIssueNumber: 161,
          parentIssueNumber: 14,
          steps: expect.arrayContaining([
            expect.objectContaining({ order: 1, kind: "checkout", title: "Trusted checkout handoff" }),
            expect.objectContaining({ order: 2, kind: "upsell", title: "Follow-up offer" }),
            expect.objectContaining({ order: 3, kind: "thank_you", title: "Final confirmation" }),
          ]),
        }),
      }),
    );
    const templateDraftReplay = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "create-from-template",
        templateId: "template-post-purchase-offer",
        title: `${templateDraftTitle} replay should not create a second draft`,
        confirmationText: draftFunnelTemplateCreationConfirmationText,
        idempotencyKey: templateDraftIdempotencyKey,
        return: "json",
      },
    });
    expect(templateDraftReplay.ok(), await templateDraftReplay.text()).toBeTruthy();
    const templateDraftReplayPayload = await templateDraftReplay.json();
    expect(templateDraftReplayPayload.draft.id).toBe(templateDraftPayload.draft.id);

    const checkoutLinkIdempotencyKey = `playwright-checkout-link-${Date.now()}`;
    const checkoutLinkResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "link-checkout",
        draftId: "funnel-draft-indie-launch-working-copy",
        stepId: "funnel-draft-indie-launch-working-copy-sales-2",
        offerId: checkoutOfferStack.primaryOffer.id,
        expectedRevisionId: seedPayload.draft.revisionId,
        confirmationText: draftFunnelCheckoutLinkConfirmationText,
        idempotencyKey: checkoutLinkIdempotencyKey,
        return: "json",
      },
    });
    expect(checkoutLinkResponse.ok(), await checkoutLinkResponse.text()).toBeTruthy();
    const checkoutLinkPayload = await checkoutLinkResponse.json();
    const linkedSalesStep = checkoutLinkPayload.draft.steps.find(
      (step: { id: string }) => step.id === "funnel-draft-indie-launch-working-copy-sales-2",
    );
    expect(linkedSalesStep).toEqual(
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            kind: "checkout",
            checkoutLink: expect.objectContaining({
              status: "owner-session-linked",
              issue: 163,
              offerStackId: checkoutOfferStack.id,
              offerId: checkoutOfferStack.primaryOffer.id,
              priceId: checkoutOfferStack.primaryOffer.priceId,
              mode: "sandbox",
              liveBillingEnabled: false,
              rawStripeIdsIncluded: false,
            }),
          }),
        ]),
      }),
    );

    const checkoutLinkReplay = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "link-checkout",
        draftId: "funnel-draft-indie-launch-working-copy",
        stepId: "funnel-draft-indie-launch-working-copy-sales-2",
        offerId: checkoutOfferStack.primaryOffer.id,
        expectedRevisionId: seedPayload.draft.revisionId,
        confirmationText: draftFunnelCheckoutLinkConfirmationText,
        idempotencyKey: checkoutLinkIdempotencyKey,
        return: "json",
      },
    });
    expect(checkoutLinkReplay.ok(), await checkoutLinkReplay.text()).toBeTruthy();
    const checkoutLinkReplayPayload = await checkoutLinkReplay.json();
    expect(checkoutLinkReplayPayload.draft.id).toBe(checkoutLinkPayload.draft.id);

    const staleCheckoutLinkResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "link-checkout",
        draftId: "funnel-draft-indie-launch-working-copy",
        stepId: "funnel-draft-indie-launch-working-copy-sales-2",
        offerId: checkoutOfferStack.primaryOffer.id,
        expectedRevisionId: seedPayload.draft.revisionId,
        confirmationText: draftFunnelCheckoutLinkConfirmationText,
        idempotencyKey: `playwright-checkout-link-stale-${Date.now()}`,
        return: "json",
      },
    });
    expect(staleCheckoutLinkResponse.status()).toBe(503);
    const staleCheckoutLinkPayload = await staleCheckoutLinkResponse.json();
    expect(staleCheckoutLinkPayload).toEqual(expect.objectContaining({ error: expect.stringContaining("revision changed") }));

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
        expect.objectContaining({
          id: "funnel-draft-indie-launch-working-copy-sales-2",
          order: 1,
          blocks: expect.arrayContaining([
            expect.objectContaining({
              kind: "checkout",
              checkoutLink: expect.objectContaining({ offerId: checkoutOfferStack.primaryOffer.id }),
            }),
          ]),
        }),
        expect.objectContaining({ id: "funnel-draft-indie-launch-working-copy-opt_in-1", order: 2 }),
      ]),
    );

    const stalePublishResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "publish",
        draftId: "funnel-draft-indie-launch-working-copy",
        expectedRevisionId: "stale-revision",
        confirmationText: draftFunnelPublishConfirmationText,
        idempotencyKey: `playwright-publish-stale-${Date.now()}`,
        return: "json",
      },
    });
    expect(stalePublishResponse.status()).toBe(503);
    const stalePublishPayload = await stalePublishResponse.json();
    expect(stalePublishPayload).toEqual(expect.objectContaining({ error: expect.stringContaining("revision changed") }));

    const publishResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "publish",
        draftId: "funnel-draft-indie-launch-working-copy",
        expectedRevisionId: movePayload.draft.revisionId,
        confirmationText: draftFunnelPublishConfirmationText,
        idempotencyKey: `playwright-publish-indie-launch-working-copy-${Date.now()}`,
        return: "json",
      },
    });
    expect(publishResponse.ok(), await publishResponse.text()).toBeTruthy();
    const publishPayload = await publishResponse.json();
    expect(publishPayload.draft).toEqual(
      expect.objectContaining({
        id: "funnel-draft-indie-launch-working-copy",
        status: "published",
        previewRoute: "/funnels/indie-launch-working-copy",
      }),
    );

    await page.goto("/admin/funnels");
    await expect(page.getByRole("heading", { name: /Draft funnel builder backed by D1/i })).toBeVisible();
    const draftCard = page.getByRole("article").filter({ hasText: "funnel-draft-indie-launch-working-copy" });
    await expect(draftCard.getByRole("heading", { name: "Indie launch working draft" })).toBeVisible();
    await expect(draftCard.locator(".admin-step-list").filter({ hasText: "Warm list opt-in edited" })).toBeVisible();
    await expect(draftCard.locator(".admin-step-list").filter({ hasText: checkoutOfferStack.primaryOffer.title })).toBeVisible();
    await expect(draftCard.locator(".admin-step-list > div").first()).toContainText("Offer sales page");
    await expect(draftCard.getByRole("link", { name: /Preview draft/i })).toHaveAttribute(
      "href",
      "/admin/funnels/funnel-draft-indie-launch-working-copy/preview",
    );
    await expect(draftCard.getByRole("link", { name: /Public route/i })).toHaveAttribute(
      "href",
      "/funnels/indie-launch-working-copy",
    );

    await page.goto("/admin/funnels/funnel-draft-indie-launch-working-copy/preview");
    await expect(page.getByRole("heading", { name: "Indie launch working draft" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Current private funnel sequence" })).toBeVisible();
    await expect(page.locator(".roadmap-grid > article").first()).toContainText("Offer sales page");
    await expect(page.getByRole("heading", { name: "Warm list opt-in edited" })).toBeVisible();

    await page.goto("/funnels/indie-launch-working-copy");
    await expect(page.getByRole("heading", { name: "Indie launch working draft" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Published funnel sequence" })).toBeVisible();
    await expect(page.locator(".roadmap-grid > article").first()).toContainText("Offer sales page");
    await expect(page.getByRole("heading", { name: "Warm list opt-in edited" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Start the sandbox checkout from this published funnel." })).toBeVisible();
    await page.getByLabel(/Launch checklist bump/i).check();
    await page.getByLabel(/Exact confirmation text/i).fill(checkoutConfirmationText);
    await page.getByRole("button", { name: /Start sandbox checkout/i }).click();
    await expect(page.getByText(/Preview response/i)).toBeVisible();
    await expect(page.getByText(/\$28\.00 total/i)).toBeVisible();
    await expect(page.locator("body")).not.toContainText("m@rkmoriarty.com");

    const publishedSourceResponse = await page.request.get("/funnels/source-data");
    expect(publishedSourceResponse.ok()).toBeTruthy();
    const publishedSource = await publishedSourceResponse.json();
    expect(publishedSource.routes).toEqual(expect.arrayContaining(["/funnels/indie-launch-working-copy"]));
    expect(publishedSource.publishedD1Funnels).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "indie-launch-working-copy",
          status: "published",
          previewRoute: "/funnels/indie-launch-working-copy",
          issue: 135,
          steps: expect.arrayContaining([
            expect.objectContaining({
              id: "funnel-draft-indie-launch-working-copy-sales-2",
              blocks: expect.arrayContaining([
                expect.objectContaining({
                  kind: "checkout",
                  checkoutLink: expect.objectContaining({
                    offerId: checkoutOfferStack.primaryOffer.id,
                    liveBillingEnabled: false,
                    rawStripeIdsIncluded: false,
                  }),
                }),
              ]),
            }),
          ]),
        }),
      ]),
    );
    expect(publishedSource.privateDraftsIncluded).toBe(false);
    expect(publishedSource.rawOwnerDataIncluded).toBe(false);
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
    if (await resendButton.isEnabled()) {
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
