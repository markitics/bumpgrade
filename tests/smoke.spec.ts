import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { createEmailVerificationToken } from "better-auth/api";

import {
  affiliateCommissionLedgerConfirmationText,
  affiliateCommissionReviewActionConfirmationText,
} from "../src/lib/affiliate-commission-ledger";
import {
  affiliatePayoutPreparationRecordApiRoute,
  affiliatePayoutPreparationRecordConfirmationText,
  affiliatePayoutPreparationRecordStatus,
} from "../src/lib/affiliate-payout-preparation-records";
import {
  affiliateFraudReviewRecordApiRoute,
  affiliateFraudReviewRecordConfirmationText,
  affiliateFraudReviewRecordStatus,
} from "../src/lib/affiliate-fraud-review-records";
import {
  affiliatePartnerNotificationReadinessRecordApiRoute,
  affiliatePartnerNotificationReadinessRecordConfirmationText,
  affiliatePartnerNotificationReadinessRecordStatus,
} from "../src/lib/affiliate-partner-notification-readiness-records";
import { affiliateProgram, affiliateReferralsSourceData } from "../src/lib/affiliate-referrals";
import { agentManifest } from "../src/lib/agent-manifest";
import { analyticsDashboard, analyticsExperimentsSourceData } from "../src/lib/analytics-experiments";
import {
  audienceBroadcastDeliveryBatchApiRoute,
  audienceBroadcastDeliveryBatchConfirmationText,
  audienceBroadcastDeliveryBatchIssue,
  audienceBroadcastDeliveryBatchStatus,
  audienceBroadcastDeliveryQueueMessageApiRoute,
  audienceBroadcastDeliveryQueueMessageConfirmationText,
  audienceBroadcastDeliveryQueueMessageIssue,
  audienceBroadcastDeliveryQueueMessageStatus,
  audienceBroadcastDispatchAttemptApiRoute,
  audienceBroadcastDispatchAttemptConfirmationText,
  audienceBroadcastDispatchAttemptIssue,
  audienceBroadcastDispatchAttemptStatus,
  audienceBroadcastDispatchPreflightApiRoute,
  audienceBroadcastDispatchPreflightConfirmationText,
  audienceBroadcastDispatchPreflightIssue,
  audienceBroadcastDispatchPreflightStatus,
  audienceBroadcastPreviewSafetyIssue,
  audienceBroadcastPreviewSafetyStatus,
  audienceBroadcastProviderEventReadinessIssue,
  audienceBroadcastProviderEventReadinessStatus,
  audienceBroadcastProviderRateLimitReadinessIssue,
  audienceBroadcastProviderRateLimitReadinessStatus,
  audienceBroadcastProviderResponseReadinessIssue,
  audienceBroadcastProviderResponseReadinessStatus,
  audienceBroadcastQueueConsumerReadinessIssue,
  audienceBroadcastQueueConsumerReadinessStatus,
  audienceBroadcastQueueProducerReadinessIssue,
  audienceBroadcastQueueProducerReadinessStatus,
  audienceBroadcastQueueReadinessIssue,
  audienceBroadcastQueueReadinessStatus,
  audienceBroadcastReadinessIssue,
  audienceBroadcastReadinessStatus,
  audienceBroadcastScheduleIntentApiRoute,
  audienceBroadcastScheduleIntentConfirmationText,
  audienceBroadcastScheduleIntentIssue,
  audienceBroadcastScheduleIntentStatus,
  audienceBroadcastSendPayloadReadinessIssue,
  audienceBroadcastSendPayloadReadinessStatus,
  audienceBroadcastSenderDomainReadinessIssue,
  audienceBroadcastSenderDomainReadinessStatus,
} from "../src/lib/audience-broadcasts";
import { audienceCrmTimelineConfirmationText } from "../src/lib/audience-crm";
import { audienceAutomationSourceData, audienceAutomationWorkspace } from "../src/lib/audience-automation";
import {
  audienceImportIntentApiRoute,
  audienceImportIntentConfirmationText,
  audienceImportIntentIssue,
  audienceImportIntentStatus,
  audienceImportPreflightApiRoute,
  audienceImportPreflightConfirmationText,
  audienceImportPreflightIssue,
  audienceImportPreflightStatus,
} from "../src/lib/audience-imports";
import { comparisonSeoTargets, competitors } from "../src/lib/comparison-data";
import { audienceSegments, contentSourceData, plannedPricingTracks, resourceHubItems } from "../src/lib/content-surfaces";
import { describeBetterAuthSessionBoundary } from "../src/lib/auth";
import { commerceTables } from "../src/lib/commerce";
import { checkoutOfferSourceData, checkoutOfferStack } from "../src/lib/checkout-offers";
import {
  analyticsExperimentDecisionApiRoute,
  analyticsExperimentDecisionConfirmationText,
  analyticsExperimentDecisionIssue,
  analyticsExperimentDecisionStatus,
} from "../src/lib/analytics-experiment-decisions";
import {
  analyticsNotificationInboxApiRoute,
  analyticsNotificationInboxConfirmationText,
  analyticsNotificationInboxIssue,
  analyticsNotificationInboxStatus,
} from "../src/lib/analytics-notification-inbox";
import {
  analyticsAlertAnomalyIssue,
  analyticsAlertAnomalyStatus,
  analyticsCohortComparisonIssue,
  analyticsCohortComparisonStatus,
  analyticsNotificationAdminInboxChannelId,
  analyticsNotificationReadinessId,
  analyticsNotificationReadinessIssue,
  analyticsNotificationReadinessStatus,
  analyticsReportExportIssue,
  analyticsReportExportStatus,
} from "../src/lib/analytics-report-exports";
import { featureCatalog } from "../src/lib/feature-catalog";
import { marketingFeatures } from "../src/lib/marketing-features";
import {
  draftFunnelCheckoutLinkConfirmationText,
  draftFunnelDuplicationConfirmationText,
  draftFunnelPublishConfirmationText,
  draftFunnelTemplateCreationConfirmationText,
} from "../src/lib/funnel-drafts";
import {
  checkoutLinkingCapability,
  draftFunnelDuplicationCapability,
  editableDraftCapability,
  funnelSourceData,
  publicFunnelCheckoutStartCapability,
  seededFunnel,
  templateDraftCreationCapability,
  webinarResourceTemplateCapability,
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
  subscriptionMembershipAccessIssue,
  subscriptionMembershipAccessStatus,
  subscriptionMembershipCommerceProductId,
  subscriptionMembershipPriceId,
} from "../src/lib/product-entitlements";
import {
  productEntitlementRevocationConfirmationText,
  productEntitlementRevocationIntentApiRoute,
  productEntitlementRevocationIntentIssue,
  productEntitlementRevocationIntentStatus,
  productEntitlementRevocationIntentWriteIssue,
} from "../src/lib/product-entitlement-inspection";
import {
  productProtectedContentDeliveryApiRoute,
  productProtectedContentDeliveryIssue,
  productProtectedContentDeliveryStatus,
  productProtectedContentIssue,
  productProtectedContentStatus,
} from "../src/lib/product-protected-content";
import { postPurchaseDecisionConfirmationText } from "../src/lib/post-purchase-decisions";
import { publisherTenantSourceData } from "../src/lib/publisher-tenants";
import { roadmapItems, roadmapLanes } from "../src/lib/roadmap";
import { checkoutConfirmationText, sandboxCheckoutOffer } from "../src/lib/sandbox-checkout";

const routes = [
  { path: "/", heading: "Launch offers with funnels" },
  { path: "/features", heading: "Everything a publisher needs" },
  { path: "/features/email-campaigns", heading: "Capture subscribers and prepare campaigns" },
  { path: "/features/order-bump", heading: "Offer the right bump" },
  { path: "/features/ai-business-coach", heading: "Turn scattered launch ideas" },
  { path: "/features/simple-landing-page", heading: "Give a launch idea a public page" },
  { path: "/compare", heading: "Compare ClickFunnels competitors and indiepreneur platforms" },
  { path: "/roadmap", heading: "Public roadmap from feature evidence" },
  { path: "/users", heading: "Use cases for indiepreneurs" },
  { path: "/developers-and-agents", heading: "APIs and manifests" },
  { path: "/resources", heading: "Guides, comparisons, migrations" },
  { path: "/pricing", heading: "Launch pricing" },
  { path: "/account/setup", heading: "Choose the Bumpgrade subdomain" },
  { path: "/funnels/indie-launch-sandbox", heading: "Indie launch funnel" },
  { path: "/offers/indie-launch-stack", heading: "Indie launch checkout offer stack" },
  { path: "/products/indie-launch-library", heading: "Indie launch product and access library" },
  { path: "/products/entitlements", heading: "Customer product access lookup" },
  { path: "/audience/indie-launch-waitlist", heading: "Indie launch waitlist and nurture" },
  { path: "/analytics/indie-launch-dashboard", heading: "Indie launch analytics and experiments" },
  { path: "/affiliates/indie-launch-partners", heading: "Indie launch partner program" },
  { path: "/commerce/checkout/success", heading: "checkout returned successfully" },
  { path: "/commerce/checkout/cancel", heading: "checkout was canceled" },
  { path: "/login", heading: "Publisher login for Bumpgrade accounts" },
  { path: "/admin/roadmap", heading: "Owner access is required" },
  { path: "/admin/work-log", heading: "Owner access is required" },
  { path: "/admin/user-journeys", heading: "Owner access is required" },
  { path: "/admin/audience", heading: "Owner access is required" },
  { path: "/admin/funnels", heading: "Owner access is required" },
  { path: "/admin/funnels/funnel-draft-indie-launch-working-copy/preview", heading: "Owner access is required" },
  { path: "/admin/products", heading: "Owner access is required" },
  { path: "/admin/analytics", heading: "Owner access is required" },
  { path: "/admin/affiliates", heading: "Owner access is required" },
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
    productId?: string;
    priceId?: string;
    subscriptionId?: string;
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
        subscription: input.subscriptionId ?? null,
        client_reference_id: input.checkoutIntentId,
        payment_status: input.paymentStatus ?? "paid",
        status: input.status ?? "complete",
        metadata: {
          checkout_intent_id: input.checkoutIntentId,
          product_id: input.productId ?? sandboxCheckoutOffer.productId,
          price_id: input.priceId ?? sandboxCheckoutOffer.priceId,
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

async function postSubscriptionWebhook(
  request: APIRequestContext,
  input: {
    checkoutIntentId: string;
    subscriptionId: string;
    eventId: string;
    type: "customer.subscription.created" | "customer.subscription.updated" | "customer.subscription.deleted";
    status: "active" | "trialing" | "canceled" | "unpaid" | "incomplete_expired";
    cancelAtPeriodEnd?: boolean;
  },
) {
  const now = Math.floor(Date.now() / 1000);
  const event = {
    id: input.eventId,
    object: "event",
    api_version: "2026-04-22.dahlia",
    created: now,
    livemode: false,
    type: input.type,
    data: {
      object: {
        id: input.subscriptionId,
        object: "subscription",
        status: input.status,
        customer: "cus_test_redacted_by_route",
        current_period_start: now,
        current_period_end: now + 30 * 24 * 60 * 60,
        cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
        metadata: {
          checkout_intent_id: input.checkoutIntentId,
          bumpgrade_price_id: subscriptionMembershipPriceId,
        },
        items: {
          data: [
            {
              price: {
                id: "price_test_redacted_dynamic_membership",
              },
            },
          ],
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

  test("homepage feature highlights use customer-facing availability labels", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /AI business coach/i })).toBeVisible();
    await expect(page.getByText("Available now").first()).toBeVisible();
    await expect(page.getByText("Launch preview")).toHaveCount(0);
    await expect(page.getByText("In build")).toHaveCount(0);
  });

  test("public launch pages avoid internal build language", async ({ page }) => {
    const internalTerms = /\b(?:Cloudflare|D1|database|admin|roadmap|pending|planned|preview|sandbox)\b|source-data|launch-preview/i;

    const publicCopyRoutes = [
      "/",
      "/features",
      ...marketingFeatures.map((feature) => `/features/${feature.slug}`),
      "/compare",
      ...competitors.map((competitor) => `/compare/${competitor.slug}`),
      "/users",
      "/resources",
      "/pricing",
      "/account/setup",
    ];

    for (const path of publicCopyRoutes) {
      await page.goto(path);
      const visibleText = await page.locator("body").innerText();
      expect(visibleText).not.toMatch(internalTerms);
    }

    await page.goto("/users");
    await expect(page.getByText("Best for").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "See launch pricing" })).toBeVisible();

    await page.goto("/resources");
    await expect(page.getByText("Available now").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Request a guide" })).toBeVisible();
  });

  test("public example routes avoid test-fixture wording", async ({ page }) => {
    const testFixtureTerms = /\b(?:preview|sandbox)\b/i;
    const publicExampleRoutes = [
      "/funnels/indie-launch-sandbox",
      "/offers/indie-launch-stack",
      "/products/indie-launch-library",
      "/products/entitlements",
      "/audience/indie-launch-waitlist",
      "/analytics/indie-launch-dashboard",
      "/affiliates/indie-launch-partners",
      "/commerce/checkout/success",
      "/commerce/checkout/cancel",
    ];

    for (const path of publicExampleRoutes) {
      await page.goto(path);
      const visibleText = await page.locator("body").innerText();
      expect(visibleText).not.toMatch(testFixtureTerms);
    }
  });

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
    expect(sitemapXml).toContain("https://bumpgrade.com/features/email-campaigns");
    expect(sitemapXml).toContain("https://bumpgrade.com/features/order-bump");
    expect(sitemapXml).toContain("https://bumpgrade.com/features/ai-business-coach");
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
    expect(sitemapXml).toContain("https://bumpgrade.com/api/products/protected-content");
    expect(sitemapXml).toContain("https://bumpgrade.com/audience/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/audience/indie-launch-waitlist");
    expect(sitemapXml).toContain("https://bumpgrade.com/analytics/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/analytics/indie-launch-dashboard");
    expect(sitemapXml).toContain("https://bumpgrade.com/affiliates/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/affiliates/indie-launch-partners");
    expect(sitemapXml).toContain("https://bumpgrade.com/agent-docs");
    expect(sitemapXml).toContain("https://bumpgrade.com/agent-docs/source-data");
    expect(sitemapXml).toContain("https://bumpgrade.com/account/setup");
    expect(sitemapXml).toContain("https://bumpgrade.com/account/source-data");
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
    expect(payload.features.filter((feature: { status: string }) => feature.status === "pending")).toHaveLength(0);
    expect(payload.features).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "feature-funnel-builder", status: "launch-preview" }),
        expect.objectContaining({ id: "feature-checkout-offers", status: "launch-preview" }),
        expect.objectContaining({ id: "feature-email-automation-crm", status: "launch-preview" }),
      ]),
    );
    expect(payload.marketingFeatures).toHaveLength(marketingFeatures.length);
    expect(payload.marketingFeatures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "email-campaigns", status: "live", nextStep: expect.objectContaining({ href: "/audience/indie-launch-waitlist" }) }),
        expect.objectContaining({ slug: "order-bump", status: "live", nextStep: expect.objectContaining({ href: "/offers/indie-launch-stack" }) }),
        expect.objectContaining({ slug: "ai-business-coach", status: "launch-preview", proofRoutes: expect.arrayContaining(["/agent-docs/source-data"]) }),
      ]),
    );
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
    expect(payload.launchSignupPolicy).toEqual(
      expect.objectContaining({
        id: "launch-signup-paid-domain-readiness",
        status: "live",
        issueNumbers: expect.arrayContaining([222, 223, 225, 226]),
        defaultSubdomain: expect.stringContaining("paid plan or launch-pilot entitlement"),
        customDomain: expect.stringContaining("domain they already own"),
        domainPurchase: expect.stringContaining("does not sell, register, renew, transfer, price, or check availability"),
        payments: expect.arrayContaining([
          expect.stringContaining("Stripe invoice"),
          expect.stringContaining("live Stripe path is verified"),
        ]),
        evidenceRoutes: expect.arrayContaining(["/pricing", "/account/setup", "/account/source-data"]),
      }),
    );
    expect(payload.caveat).toContain("does not turn planned product features");
  });

  test("publisher account source data exposes paid subdomain setup contract", async ({ request }) => {
    const response = await request.get("/account/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: publisherTenantSourceData.id,
        status: "live",
        parentIssue: 221,
        issue: 222,
      }),
    );
    expect(payload.routes).toEqual(
      expect.objectContaining({
        accountSetup: "/account/setup",
        accountSourceData: "/account/source-data",
        reserveSubdomainApi: "/api/account/publisher/subdomain",
        customDomainApi: "/api/account/publisher/custom-domain",
      }),
    );
    expect(payload.subdomainPolicy).toEqual(
      expect.objectContaining({
        defaultDomain: "bumpgrade.com",
        paidPlanRequired: true,
        emailVerificationRequired: true,
        reservedNames: expect.arrayContaining(["admin", "api", "www", "pricing", "features"]),
      }),
    );
    expect(payload.crossSubdomainAuth).toEqual(
      expect.objectContaining({
        status: "configured",
        issue: 224,
        cookieDomain: "bumpgrade.com",
        trustedOriginPattern: "https://*.bumpgrade.com",
        trustedOrigins: expect.arrayContaining(["https://*.bumpgrade.com"]),
        crossSubDomainCookiesEnabled: true,
        bumpgradeHostedSubdomainsShareLogin: true,
      }),
    );
    expect(payload.customerAuthPolicy).toEqual(
      expect.objectContaining({
        status: "configured",
        issue: 224,
        sharedIdentityProvider: "https://bumpgrade.com",
        appliesTo: expect.arrayContaining(["bumpgrade.com", "*.bumpgrade.com"]),
        customDomains: expect.objectContaining({
          canShareBumpgradeCookieDirectly: false,
          behavior: expect.stringContaining("login handoff"),
        }),
        adminBoundary: expect.stringContaining("Owner/admin sessions remain allowlisted"),
      }),
    );
    expect(payload.customDomainPolicy).toEqual(
      expect.objectContaining({
        status: "live",
        issue: 223,
        domainRequirement: expect.stringContaining("does not sell or register domains"),
        paidPlanRequired: true,
        defaultBumpgradeHostnameRequiredFirst: true,
        dnsInstruction: expect.objectContaining({
          recordType: "CNAME",
          recordValue: "custom-domains.bumpgrade.com",
        }),
        statuses: expect.arrayContaining(["pending_dns", "dns_verified", "ssl_pending", "active"]),
      }),
    );
    expect(payload.domainPurchasePolicy).toEqual(
      expect.objectContaining({
        status: "not_offered_yet",
        issue: 225,
        currentLaunchAnswer: expect.stringContaining("does not sell, register, renew, or transfer domains today"),
        whatWorksToday: expect.arrayContaining([
          expect.stringContaining("reserve a default *.bumpgrade.com hostname"),
          expect.stringContaining("connect an existing custom domain"),
        ]),
        notClaimed: expect.arrayContaining([
          expect.stringContaining("Domain registration"),
          expect.stringContaining("Registrar pricing"),
        ]),
      }),
    );
    expect(payload.notIncludedYet).toEqual(
      expect.arrayContaining(["Buying, registering, renewing, or transferring domains through Bumpgrade."]),
    );
  });

  test("Better Auth production session boundary is explicit about subdomains and custom domains", () => {
    const boundary = describeBetterAuthSessionBoundary({
      authUrl: "https://bumpgrade.com",
      siteUrl: "https://bumpgrade.com",
    });

    expect(boundary).toEqual(
      expect.objectContaining({
        cookieDomain: "bumpgrade.com",
        crossSubDomainCookiesEnabled: true,
        bumpgradeHostedSubdomainsShareLogin: true,
        customDomainsCanShareCookieDirectly: false,
      }),
    );
    expect(boundary.trustedOrigins).toEqual(expect.arrayContaining(["https://bumpgrade.com", "https://*.bumpgrade.com"]));
    expect(boundary.customDomainAuthStrategy).toContain("central bumpgrade.com auth session");
    expect(boundary.isolationBoundary).toContain("shared session proves identity only");
  });

  test("funnel source data exposes a seeded three-step draft funnel", async ({ request, page }) => {
    const response = await request.get("/funnels/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: funnelSourceData.id,
        status: "draft-duplication-ready",
        issue: 215,
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
        duplicateEndpoint: "/api/admin/funnels/drafts",
        publishEndpoint: "/api/admin/funnels/drafts",
        checkoutLinkEndpoint: "/api/admin/funnels/drafts",
        auth: "owner-session",
      }),
    );
    expect(payload.publishedD1Funnels).toEqual(expect.any(Array));
    expect(payload.privateDraftsIncluded).toBe(false);
    expect(payload.rawOwnerDataIncluded).toBe(false);
    expect(payload.draftFunnelDuplicationCapability).toEqual(
      expect.objectContaining({
        id: draftFunnelDuplicationCapability.id,
        status: "owner-session-confirmed-write-ready",
        issue: 215,
        adminRoute: "/admin/funnels",
        duplicateEndpoint: "/api/admin/funnels/drafts",
        auth: "owner-session",
        confirmationRequired: true,
        idempotencyRequired: true,
        staleRevisionRequired: true,
        copiesOrderedSteps: true,
        copiesBlocks: true,
        copiesCheckoutLinks: false,
        publishesDuplicate: false,
        rawOwnerDataIncluded: false,
      }),
    );
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
    expect(payload.webinarResourceTemplateCapability).toEqual(
      expect.objectContaining({
        id: webinarResourceTemplateCapability.id,
        status: "owner-session-template-ready",
        issue: 213,
        adminRoute: "/admin/funnels",
        createEndpoint: "/api/admin/funnels/drafts",
        auth: "owner-session",
        confirmationRequired: true,
        idempotencyRequired: true,
        stepKinds: expect.arrayContaining(["webinar", "resource"]),
        blockKinds: expect.arrayContaining(["webinar", "resource"]),
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
        "funnelWebinarResourceTemplateId",
        "funnelDraftDuplicateId",
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
        expect.objectContaining({
          id: "template-webinar-registration-replay",
          title: "Webinar registration and replay funnel",
          sourceIssue: 213,
          steps: expect.arrayContaining([
            expect.objectContaining({ order: 1, kind: "webinar" }),
            expect.objectContaining({ order: 2, kind: "resource" }),
          ]),
        }),
        expect.objectContaining({
          id: "template-resource-library-opt-in",
          title: "Resource library opt-in funnel",
          sourceIssue: 213,
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
        expect.objectContaining({
          id: "block-template-webinar",
          kind: "webinar",
          agentEditable: true,
        }),
        expect.objectContaining({
          id: "block-template-resource",
          kind: "resource",
          agentEditable: true,
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
    expect(payload.caveat).toContain("webinar and resource page shapes");
    expect(payload.caveat).toContain("private draft duplication");
    expect(payload.caveat).toContain("Direct agent template creation");

    await page.goto("/funnels/indie-launch-sandbox");
    await expect(page.getByRole("heading", { name: /Indie launch funnel/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Three-step launch funnel/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reusable funnel shapes for private draft starts/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reusable page blocks with write boundaries/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Launch sales funnel/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Webinar registration and replay funnel/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Resource library promise/i })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: /Choose the bump and review the checkout path/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Primary offer, order bump, upsell, and downsell/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch checklist bump" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch accelerator upsell" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Launch review downsell" })).toBeVisible();
    await page.getByLabel(/Launch checklist bump/i).check();
    await page.getByLabel(/Exact confirmation text/i).fill(checkoutConfirmationText);
    await page.getByRole("button", { name: /Review checkout path/i }).click();
    await expect(page.getByText(/Checkout setup check/i)).toBeVisible();
    await expect(page.getByText(/\$28\.00 total/i)).toBeVisible();
  });

  test("product access source data exposes seeded products, assets, and entitlement templates", async ({ request, page }) => {
    const response = await request.get("/products/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        id: productAccessSourceData.id,
        status: subscriptionMembershipAccessStatus,
        issue: subscriptionMembershipAccessIssue,
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
        "/api/products/protected-content",
        "/api/admin/products/assets",
        productEntitlementRevocationIntentApiRoute,
      ]),
    );
    expect(payload.entitlementWrites).toEqual(
      expect.objectContaining({
        status: "sandbox-webhook-grants-ready",
        issue: 101,
        tables: expect.arrayContaining(["product_entitlements", "product_fulfillment_tasks"]),
      }),
    );
    expect(payload.subscriptionMembershipAccess).toEqual(
      expect.objectContaining({
        id: "subscription-membership-access-contract",
        status: subscriptionMembershipAccessStatus,
        issue: subscriptionMembershipAccessIssue,
        sourcePriceId: subscriptionMembershipPriceId,
        sourceCommerceProductId: subscriptionMembershipCommerceProductId,
        productId: "product-launch-membership",
        entitlementTemplateId: "entitlement-template-launch-membership",
        accessRuleId: "access-rule-membership-active-subscription",
        counts: expect.objectContaining({
          billingSubscriptions: expect.any(Number),
          membershipEntitlements: expect.any(Number),
        }),
        redaction: expect.objectContaining({
          rawStripeSubscriptionIdsIncluded: false,
          rawStripeCustomerIdsIncluded: false,
          customerPortalUrlIncluded: false,
          memberPostsIncluded: false,
          progressDataIncluded: false,
        }),
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
        apiRoute: productEntitlementRevocationIntentApiRoute,
        writeIssue: productEntitlementRevocationIntentWriteIssue,
        confirmation: expect.objectContaining({
          required: true,
          text: productEntitlementRevocationConfirmationText,
        }),
        staleStateCheck: expect.objectContaining({
          required: true,
          field: "expectedEntitlementStatus",
        }),
        counts: expect.objectContaining({
          revocationIntents: expect.any(Number),
          dryRunIntents: expect.any(Number),
          ownerConfirmedIntents: expect.any(Number),
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
            ownerConfirmed: false,
            privateReasonRecorded: false,
            targetEntitlementIncluded: false,
            destructiveActionEnabled: false,
            entitlementMutationEnabled: false,
          }),
        ]),
        redaction: expect.objectContaining({
          privateBuyerDataIncluded: false,
          rawBuyerEmailIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          rawStripeIdsIncluded: false,
          targetEntitlementIdsIncluded: false,
          privateReasonIncluded: false,
          entitlementMutationEnabled: false,
          destructiveActionEnabled: false,
        }),
      }),
    );
    expect(payload.protectedContent).toEqual(
      expect.objectContaining({
        id: "product-protected-content-readiness-contract",
        status: productProtectedContentStatus,
        issue: productProtectedContentIssue,
        parentIssue: 16,
        ownerRoute: "/admin/products",
        counts: expect.objectContaining({
          protectedContentItems: expect.any(Number),
          courseItems: expect.any(Number),
          membershipItems: expect.any(Number),
          deliveryEnabled: 2,
          protectedBodiesIncluded: 0,
        }),
        delivery: expect.objectContaining({
          status: productProtectedContentDeliveryStatus,
          issue: productProtectedContentDeliveryIssue,
          apiRoute: productProtectedContentDeliveryApiRoute,
          authBoundary: "checkout-intent-and-entitlement-bearer-reference",
          deliveryMode: "seeded-protected-fixture",
          redaction: expect.objectContaining({
            protectedBodyIncludedInSourceData: false,
            buyerEmailIncluded: false,
            rawStripeIdsIncluded: false,
            signedUrlsIncluded: false,
          }),
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "protected-content-launch-course-module-1",
            productId: "product-launch-course-lite",
            contentKind: "course_module",
            deliveryEnabled: true,
            protectedBodyIncluded: false,
          }),
          expect.objectContaining({
            id: "protected-content-launch-member-area",
            productId: "product-launch-membership",
            contentKind: "member_area",
            deliveryEnabled: true,
            protectedBodyIncluded: false,
          }),
        ]),
        redaction: expect.objectContaining({
          privateContentBodiesIncluded: false,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          buyerDataIncluded: false,
          progressDataIncluded: false,
          deliveryEnabled: false,
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
    expect(payload.writeBoundary).toContain("issue #181 exposes protected content readiness");
    expect(payload.writeBoundary).toContain("issue #185 returns seeded protected fixture bodies");
    expect(payload.writeBoundary).toContain("issue #187 syncs checkout-linked membership entitlement state");
    expect(payload.caveat).toContain("sandbox webhook-backed entitlement row grants");
    expect(payload.caveat).toContain("subscription-backed membership entitlement state");
    expect(payload.caveat).toContain("owner-confirmed small private asset upload records");
    expect(payload.caveat).toContain("owner-confirmed non-destructive revocation intent records");
    expect(payload.caveat).toContain("protected content readiness");
    expect(payload.caveat).toContain("checkout-intent-scoped protected fixture delivery");

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
          id: expect.stringMatching(/^entitlement-/),
          productId: "product-launch-bundle",
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
          id: expect.stringMatching(/^entitlement-/),
          productId: "product-launch-checklist-download",
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
    const bundleEntitlement = payload.entitlements.find(
      (entitlement: { productId?: string }) => entitlement.productId === "product-launch-bundle",
    ) as { id: string } | undefined;
    const downloadOnlyEntitlement = payload.entitlements.find(
      (entitlement: { productId?: string }) => entitlement.productId === "product-launch-checklist-download",
    ) as { id: string } | undefined;
    expect(bundleEntitlement).toEqual(expect.objectContaining({ id: expect.stringMatching(/^entitlement-/) }));
    expect(downloadOnlyEntitlement).toEqual(expect.objectContaining({ id: expect.stringMatching(/^entitlement-/) }));
    if (!bundleEntitlement || !downloadOnlyEntitlement) throw new Error("Expected bundle and download entitlements.");

    const protectedContent = await request.get(
      `${productProtectedContentDeliveryApiRoute}?${new URLSearchParams({
        checkoutIntentId: grant.checkoutIntentId,
        entitlementId: bundleEntitlement.id,
        protectedContentId: "protected-content-launch-course-module-1",
      }).toString()}`,
    );
    expect(protectedContent.status(), await protectedContent.text()).toBe(200);
    const protectedContentPayload = await protectedContent.json();
    expect(protectedContentPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: productProtectedContentDeliveryStatus,
        issue: productProtectedContentDeliveryIssue,
        followsIssue: productProtectedContentIssue,
        checkoutIntentId: grant.checkoutIntentId,
        entitlementId: bundleEntitlement.id,
        protectedContent: expect.objectContaining({
          id: "protected-content-launch-course-module-1",
          productId: "product-launch-course-lite",
          title: "Launch course module readiness",
          contentKind: "course_module",
          deliveryMode: "seeded-protected-fixture",
          bodyFormat: "markdown",
          body: expect.stringContaining("Launch course module fixture"),
          protectedBodyIncluded: true,
        }),
        access: expect.objectContaining({
          entitlementStatus: "active",
          checkoutStatus: "paid",
          entitlementScopeMatched: true,
          staleStateChecked: true,
          privateProgressWritten: false,
        }),
        redaction: expect.objectContaining({
          buyerEmailIncluded: false,
          buyerEmailHashIncluded: false,
          rawStripeIdsIncluded: false,
          sourceStripeEventIdsIncluded: false,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          metadataJsonIncluded: false,
          protectedBodyIncludedInSourceData: false,
          progressDataIncluded: false,
        }),
      }),
    );
    const protectedContentText = JSON.stringify(protectedContentPayload);
    expect(protectedContentText).not.toContain(buyerEmail);
    expect(protectedContentText).not.toContain(grant.eventId);
    expect(protectedContentText).not.toContain("cs_test");
    expect(protectedContentText).not.toContain("signed_url");
    expect(protectedContentText).not.toContain("products/fixtures/");

    const mismatchedProtectedContent = await request.get(
      `${productProtectedContentDeliveryApiRoute}?${new URLSearchParams({
        checkoutIntentId: grant.checkoutIntentId,
        entitlementId: downloadOnlyEntitlement.id,
        protectedContentId: "protected-content-launch-course-module-1",
      }).toString()}`,
    );
    expect(mismatchedProtectedContent.status()).toBe(409);
    const mismatchedPayload = await mismatchedProtectedContent.json();
    expect(mismatchedPayload).toEqual(
      expect.objectContaining({
        ok: false,
        status: "not_eligible",
        issue: productProtectedContentDeliveryIssue,
        redaction: expect.objectContaining({
          buyerEmailIncluded: false,
          rawStripeIdsIncluded: false,
          signedUrlsIncluded: false,
        }),
      }),
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

    const staleBundleEntitlement = stalePayload.entitlements.find(
      (entitlement: { productId?: string }) => entitlement.productId === "product-launch-bundle",
    ) as { id: string } | undefined;
    expect(staleBundleEntitlement).toEqual(expect.objectContaining({ id: expect.stringMatching(/^entitlement-/) }));
    if (!staleBundleEntitlement) throw new Error("Expected stale bundle entitlement.");
    const staleProtectedContent = await request.get(
      `${productProtectedContentDeliveryApiRoute}?${new URLSearchParams({
        checkoutIntentId: staleGrant.checkoutIntentId,
        entitlementId: staleBundleEntitlement.id,
        protectedContentId: "protected-content-launch-member-area",
      }).toString()}`,
    );
    expect(staleProtectedContent.status()).toBe(409);
    const staleProtectedPayload = await staleProtectedContent.json();
    expect(staleProtectedPayload).toEqual(
      expect.objectContaining({
        ok: false,
        status: "not_eligible",
        issue: productProtectedContentDeliveryIssue,
        redaction: expect.objectContaining({
          buyerEmailIncluded: false,
          rawStripeIdsIncluded: false,
          signedUrlsIncluded: false,
        }),
      }),
    );
    const staleProtectedText = JSON.stringify(staleProtectedPayload);
    expect(staleProtectedText).not.toContain(staleBuyerEmail);
    expect(staleProtectedText).not.toContain(staleGrant.eventId);
    expect(staleProtectedText).not.toContain(staleEventId);

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

  test("subscription webhook syncs membership entitlement state from billing status", async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Subscription membership access is covered once on desktop.");

    const suffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
    const buyerEmail = `subscription-member-${suffix}@example.com`;
    const subscriptionId = `sub_bumpgrade_membership_${suffix.replaceAll("-", "_")}`;
    const checkout = await request.post("/api/commerce/checkout", {
      headers: { "x-bumpgrade-test-checkout-write": "allow" },
      data: {
        priceId: subscriptionMembershipPriceId,
        confirmationText: checkoutConfirmationText,
        buyerEmail,
        idempotencyKey: `playwright-membership-subscription-${suffix}`,
      },
    });
    expect(checkout.ok(), await checkout.text()).toBeTruthy();
    const checkoutPayload = await checkout.json();
    expect(checkoutPayload.checkoutIntentId).toEqual(expect.stringMatching(/^checkout-intent-/));
    expect(checkoutPayload.lineItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          priceId: subscriptionMembershipPriceId,
          billingInterval: "month",
          unitAmountCents: 2900,
        }),
      ]),
    );

    const checkoutWebhook = await postCheckoutSessionWebhook(request, {
      checkoutIntentId: checkoutPayload.checkoutIntentId,
      eventId: `evt_bumpgrade_membership_checkout_${suffix.replaceAll("-", "_")}`,
      type: "checkout.session.completed",
      productId: subscriptionMembershipCommerceProductId,
      priceId: subscriptionMembershipPriceId,
      subscriptionId,
    });
    expect(checkoutWebhook).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: false,
        checkoutIntentUpdated: true,
        entitlementGrantsCreated: 0,
      }),
    );

    const activeEventId = `evt_bumpgrade_membership_active_${suffix.replaceAll("-", "_")}`;
    const activeWebhook = await postSubscriptionWebhook(request, {
      checkoutIntentId: checkoutPayload.checkoutIntentId,
      subscriptionId,
      eventId: activeEventId,
      type: "customer.subscription.updated",
      status: "active",
    });
    expect(activeWebhook).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: false,
        subscriptionUpdated: true,
        membershipEntitlementUpdated: true,
        membershipEntitlementStatus: "active",
        membershipEntitlementId: expect.stringMatching(/^entitlement-/),
        redaction: expect.objectContaining({ rawStripeIdsIncluded: false }),
      }),
    );

    const duplicateActiveWebhook = await request.post("/api/stripe/webhook", {
      headers: { "x-bumpgrade-test-webhook": "allow" },
      data: {
        id: activeEventId,
        object: "event",
        api_version: "2026-04-22.dahlia",
        created: Math.floor(Date.now() / 1000),
        livemode: false,
        type: "customer.subscription.updated",
        data: {
          object: {
            id: subscriptionId,
            object: "subscription",
            status: "active",
            customer: "cus_test_redacted_by_route",
            metadata: {
              checkout_intent_id: checkoutPayload.checkoutIntentId,
              bumpgrade_price_id: subscriptionMembershipPriceId,
            },
            items: { data: [{ price: { id: "price_test_redacted_dynamic_membership" } }] },
          },
        },
      },
    });
    expect(duplicateActiveWebhook.ok(), await duplicateActiveWebhook.text()).toBeTruthy();
    await expect(duplicateActiveWebhook.json()).resolves.toEqual(expect.objectContaining({ duplicate: true }));

    const activeLookup = await request.get(
      `/api/products/entitlements?checkoutIntentId=${encodeURIComponent(checkoutPayload.checkoutIntentId)}`,
    );
    expect(activeLookup.ok(), await activeLookup.text()).toBeTruthy();
    const activeLookupPayload = await activeLookup.json();
    expect(activeLookupPayload).toEqual(
      expect.objectContaining({
        counts: expect.objectContaining({
          entitlements: 1,
          activeEntitlements: 1,
          fulfillmentTasks: 1,
        }),
        redaction: expect.objectContaining({
          buyerEmailIncluded: false,
          rawStripeIdsIncluded: false,
          metadataJsonIncluded: false,
        }),
      }),
    );
    expect(activeLookupPayload.entitlements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productId: "product-launch-membership",
          productTitle: "Launch membership",
          entitlementTemplateId: "entitlement-template-launch-membership",
          accessRuleId: "access-rule-membership-active-subscription",
          status: "active",
          grantKind: "sandbox_subscription_webhook",
          grantSummary: expect.stringContaining("trusted Stripe Billing subscription state"),
          sourcePriceLabel: "Launch membership monthly",
          sourcePriceAmount: "29.00 USD",
          fulfillment: expect.objectContaining({
            status: "active",
            kind: "membership",
            summary: expect.stringContaining("subscription state"),
          }),
          downloadDelivery: expect.objectContaining({
            available: false,
            privateR2KeysIncluded: false,
            signedUrlsIncluded: false,
          }),
        }),
      ]),
    );
    const activeLookupText = JSON.stringify(activeLookupPayload);
    expect(activeLookupText).not.toContain(buyerEmail);
    expect(activeLookupText).not.toContain(subscriptionId);
    expect(activeLookupText).not.toContain(activeEventId);
    expect(activeLookupText).not.toContain("cus_test");

    const canceledEventId = `evt_bumpgrade_membership_canceled_${suffix.replaceAll("-", "_")}`;
    const canceledWebhook = await postSubscriptionWebhook(request, {
      checkoutIntentId: checkoutPayload.checkoutIntentId,
      subscriptionId,
      eventId: canceledEventId,
      type: "customer.subscription.deleted",
      status: "canceled",
    });
    expect(canceledWebhook).toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: false,
        subscriptionUpdated: true,
        membershipEntitlementUpdated: true,
        membershipEntitlementStatus: "inactive",
      }),
    );

    const inactiveLookup = await request.get(
      `/api/products/entitlements?checkoutIntentId=${encodeURIComponent(checkoutPayload.checkoutIntentId)}`,
    );
    expect(inactiveLookup.ok(), await inactiveLookup.text()).toBeTruthy();
    const inactiveLookupPayload = await inactiveLookup.json();
    expect(inactiveLookupPayload.counts).toEqual(
      expect.objectContaining({
        entitlements: 1,
        activeEntitlements: 0,
        fulfillmentTasks: 1,
      }),
    );
    expect(inactiveLookupPayload.entitlements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productId: "product-launch-membership",
          status: "inactive",
          fulfillment: expect.objectContaining({ status: "paused" }),
        }),
      ]),
    );

    const sourceData = await request.get("/products/source-data");
    expect(sourceData.ok(), await sourceData.text()).toBeTruthy();
    const sourcePayload = await sourceData.json();
    expect(sourcePayload.subscriptionMembershipAccess).toEqual(
      expect.objectContaining({
        issue: subscriptionMembershipAccessIssue,
        counts: expect.objectContaining({
          billingSubscriptions: expect.any(Number),
          membershipEntitlements: expect.any(Number),
          inactiveMembershipEntitlements: expect.any(Number),
        }),
        redaction: expect.objectContaining({
          rawStripeSubscriptionIdsIncluded: false,
          rawStripeCustomerIdsIncluded: false,
          customerPortalUrlIncluded: false,
        }),
      }),
    );
    expect(sourcePayload.subscriptionMembershipAccess.counts.membershipEntitlements).toBeGreaterThanOrEqual(1);
    expect(sourcePayload.subscriptionMembershipAccess.counts.inactiveMembershipEntitlements).toBeGreaterThanOrEqual(1);
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
        apiRoute: productEntitlementRevocationIntentApiRoute,
        writeIssue: productEntitlementRevocationIntentWriteIssue,
        counts: expect.objectContaining({
          revocationIntents: expect.any(Number),
          ownerConfirmedIntents: expect.any(Number),
          destructiveActionsEnabled: 0,
          entitlementMutationsEnabled: 0,
        }),
      }),
    );
    expect(payload.revocationIntents.counts.revocationIntents).toBeGreaterThanOrEqual(1);
    expect(payload.protectedContent).toEqual(
      expect.objectContaining({
        status: productProtectedContentStatus,
        issue: productProtectedContentIssue,
        counts: expect.objectContaining({
          protectedContentItems: expect.any(Number),
          deliveryEnabled: 2,
          protectedBodiesIncluded: 0,
        }),
        delivery: expect.objectContaining({
          status: productProtectedContentDeliveryStatus,
          issue: productProtectedContentDeliveryIssue,
          apiRoute: productProtectedContentDeliveryApiRoute,
        }),
      }),
    );
    expect(payload.protectedContent.counts.protectedContentItems).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(payload)).not.toContain(grant.buyerEmail);
    expect(JSON.stringify(payload)).not.toContain(grant.eventId);

    await signInOrCreateOwner(page);
    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: /Product entitlement inspection without public buyer leaks/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Access removal intents stay non-destructive/i })).toBeVisible();
    await expect(page.locator("body")).toContainText("Revocation intents");
    await expect(page.locator("body")).toContainText("owner confirmed dry run");
    await expect(page.getByRole("button", { name: /Record access-removal intent/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Lesson and member delivery stays blocked until entitlement checks are live/i })).toBeVisible();
    await expect(page.locator("body")).toContainText("Launch course module readiness");
    await expect(page.locator("body")).toContainText("Launch member area readiness");
    await expect(page.locator("body")).toContainText(grant.buyerEmail);
    await expect(page.locator("body")).toContainText("Launch bundle");
    await expect(page.locator("body")).toContainText("Launch checklist download");
    await expect(page.locator("body")).toContainText(grant.checkoutIntentId);
    await expect(page.locator("body")).not.toContainText(grant.eventId);
  });

  test("owner product revocation intents require auth, confirmation, idempotency, stale state, and redaction", async ({
    page,
    request,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Owner product revocation intents are covered once on desktop.");

    const buyerEmail = `product-revocation-${Date.now()}@example.com`;
    const grant = await grantSandboxProductEntitlements(request, buyerEmail);
    const lookup = await request.get(`/api/products/entitlements?checkoutIntentId=${encodeURIComponent(grant.checkoutIntentId)}`);
    expect(lookup.ok(), await lookup.text()).toBeTruthy();
    const lookupPayload = await lookup.json();
    const entitlement =
      lookupPayload.entitlements.find(
        (item: { productId: string }) => item.productId === "product-launch-checklist-download",
      ) ?? lookupPayload.entitlements[0];
    expect(entitlement).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^entitlement-/),
        status: "active",
      }),
    );

    const idempotencyKey = `playwright-product-revocation-${Date.now()}`;
    const privateReason = `Private revocation note ${Date.now()}`;
    const requestBody = {
      entitlementId: entitlement.id,
      expectedEntitlementStatus: entitlement.status,
      reasonCode: "manual_review",
      privateReason,
      confirmationText: productEntitlementRevocationConfirmationText,
      idempotencyKey,
    };

    const unauthorized = await request.post(productEntitlementRevocationIntentApiRoute, { data: requestBody });
    expect(unauthorized.status()).toBe(401);
    await expect(unauthorized.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "owner_session_required",
        redaction: expect.objectContaining({
          targetEntitlementIdsIncluded: false,
          privateReasonIncluded: false,
          actorEmailIncluded: false,
        }),
      }),
    );

    await signInOrCreateOwner(page);
    const contract = await page.request.get(productEntitlementRevocationIntentApiRoute);
    expect(contract.ok(), await contract.text()).toBeTruthy();
    await expect(contract.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: productEntitlementRevocationIntentStatus,
        issue: productEntitlementRevocationIntentWriteIssue,
        route: productEntitlementRevocationIntentApiRoute,
        confirmation: expect.objectContaining({ text: productEntitlementRevocationConfirmationText }),
        redaction: expect.objectContaining({
          targetEntitlementIdsIncluded: false,
          privateReasonIncluded: false,
          actorEmailHashIncluded: false,
          destructiveActionEnabled: false,
          entitlementMutationEnabled: false,
        }),
      }),
    );

    const stale = await page.request.post(productEntitlementRevocationIntentApiRoute, {
      data: {
        ...requestBody,
        expectedEntitlementStatus: "revoked",
        idempotencyKey: `${idempotencyKey}-stale`,
      },
    });
    expect(stale.status(), await stale.text()).toBe(409);
    await expect(stale.json()).resolves.toEqual(expect.objectContaining({ ok: false, code: "stale_entitlement_state" }));

    const created = await page.request.post(productEntitlementRevocationIntentApiRoute, { data: requestBody });
    expect(created.status(), await created.text()).toBe(201);
    const createdPayload = await created.json();
    expect(createdPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: productEntitlementRevocationIntentStatus,
        issue: productEntitlementRevocationIntentWriteIssue,
        duplicate: false,
        intent: expect.objectContaining({
          id: expect.stringMatching(/^product-revocation-intent-/),
          productId: entitlement.productId,
          productTitle: entitlement.productTitle,
          targetEntitlementId: entitlement.id,
          targetEntitlementStatus: "active",
          reasonCode: "manual_review",
          ownerConfirmed: true,
          privateReasonRecorded: true,
          targetEntitlementIncluded: false,
          actorIdentityIncluded: false,
          destructiveActionEnabled: false,
          entitlementMutationEnabled: false,
        }),
        redaction: expect.objectContaining({
          targetEntitlementIdsIncluded: false,
          privateReasonIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
        }),
      }),
    );
    const createdText = JSON.stringify(createdPayload);
    expect(createdText).not.toContain(privateReason);
    expect(createdText).not.toContain(buyerEmail);
    expect(createdText).not.toContain("m@rkmoriarty.com");

    const replay = await page.request.post(productEntitlementRevocationIntentApiRoute, { data: requestBody });
    expect(replay.status(), await replay.text()).toBe(200);
    await expect(replay.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "owner-product-revocation-intent-replayed",
        duplicate: true,
        intent: expect.objectContaining({
          id: createdPayload.intent.id,
          targetEntitlementId: entitlement.id,
        }),
      }),
    );

    const conflict = await page.request.post(productEntitlementRevocationIntentApiRoute, {
      data: { ...requestBody, reasonCode: "customer_request" },
    });
    expect(conflict.status(), await conflict.text()).toBe(409);
    await expect(conflict.json()).resolves.toEqual(expect.objectContaining({ ok: false, code: "idempotency_conflict" }));

    const sourceData = await request.get("/products/source-data");
    expect(sourceData.ok(), await sourceData.text()).toBeTruthy();
    const sourcePayload = await sourceData.json();
    expect(sourcePayload.revocationIntents.counts.ownerConfirmedIntents).toBeGreaterThanOrEqual(1);
    expect(sourcePayload.revocationIntents.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdPayload.intent.id,
          ownerConfirmed: true,
          privateReasonRecorded: true,
          targetEntitlementIncluded: false,
          actorIdentityIncluded: false,
        }),
      ]),
    );
    const sourceText = JSON.stringify(sourcePayload);
    expect(sourceText).not.toContain(entitlement.id);
    expect(sourceText).not.toContain(privateReason);
    expect(sourceText).not.toContain(buyerEmail);
    expect(sourceText).not.toContain("m@rkmoriarty.com");

    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: /Access removal intents stay non-destructive/i })).toBeVisible();
    await expect(page.locator("body")).toContainText("Access removal intent");
    await expect(page.locator("body")).toContainText(entitlement.id);
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
        status: audienceImportPreflightStatus,
        issue: audienceImportPreflightIssue,
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
        audienceBroadcastDeliveryBatchApiRoute,
        audienceBroadcastDeliveryQueueMessageApiRoute,
        audienceBroadcastDispatchPreflightApiRoute,
        audienceBroadcastDispatchAttemptApiRoute,
        audienceImportIntentApiRoute,
        audienceImportPreflightApiRoute,
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
    expect(payload.broadcastSenderDomainReadiness).toEqual(
      expect.objectContaining({
        status: audienceBroadcastSenderDomainReadinessStatus,
        issue: audienceBroadcastSenderDomainReadinessIssue,
        counts: expect.objectContaining({
          senderDomainReadinessRecords: expect.any(Number),
          domainsPendingVerification: expect.any(Number),
          domainsReady: expect.any(Number),
          providerSendEnabledRecords: 0,
          cloudflareQueueProducerEnabledRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          providerResponsesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
        }),
        redaction: expect.objectContaining({
          privateDnsCredentialsIncluded: false,
          rawDnsRecordsIncluded: false,
          providerSecretsIncluded: false,
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          recipientPayloadsIncluded: false,
          providerResponsesIncluded: false,
          providerMessageIdsIncluded: false,
          providerSendEnabled: false,
          cloudflareQueueProducersEnabled: false,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-sender-domain-readiness-bumpgrade-com",
            draftId: "broadcast-draft-launch-window",
            domain: "bumpgrade.com",
            providerSendEnabled: false,
            cloudflareQueueProducersEnabled: false,
            recipientPayloadsCreated: false,
            providerResponsesIncluded: false,
            providerMessageIdsIncluded: false,
          }),
        ]),
      }),
    );
    expect(payload.broadcastProviderEventReadiness).toEqual(
      expect.objectContaining({
        status: audienceBroadcastProviderEventReadinessStatus,
        issue: audienceBroadcastProviderEventReadinessIssue,
        counts: expect.objectContaining({
          providerEventReadinessRecords: expect.any(Number),
          bounceEventReadinessRecords: expect.any(Number),
          complaintEventReadinessRecords: expect.any(Number),
          deliveryEventReadinessRecords: expect.any(Number),
          providerSendEnabledRecords: 0,
          cloudflareQueueProducerEnabledRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          providerResponsesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
          rawProviderPayloadsStoredRecords: 0,
        }),
        redaction: expect.objectContaining({
          providerSecretsIncluded: false,
          rawProviderPayloadsIncluded: false,
          providerResponsesIncluded: false,
          providerMessageIdsIncluded: false,
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          recipientPayloadsIncluded: false,
          providerSendEnabled: false,
          cloudflareQueueProducersEnabled: false,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-provider-event-readiness-launch-window",
            draftId: "broadcast-draft-launch-window",
            eventKinds: expect.arrayContaining(["bounce", "complaint", "delivered"]),
            providerSendEnabled: false,
            cloudflareQueueProducersEnabled: false,
            recipientPayloadsCreated: false,
            providerResponsesIncluded: false,
            providerMessageIdsIncluded: false,
            rawProviderPayloadsStored: false,
          }),
        ]),
      }),
    );
    expect(payload.broadcastProviderRateLimitReadiness).toEqual(
      expect.objectContaining({
        status: audienceBroadcastProviderRateLimitReadinessStatus,
        issue: audienceBroadcastProviderRateLimitReadinessIssue,
        counts: expect.objectContaining({
          providerRateLimitReadinessRecords: expect.any(Number),
          throttleWindowRecords: expect.any(Number),
          retryBackoffPolicyRecords: expect.any(Number),
          providerSendEnabledRecords: 0,
          cloudflareQueueProducerEnabledRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          providerResponsesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
          rawProviderPayloadsStoredRecords: 0,
        }),
        redaction: expect.objectContaining({
          providerSecretsIncluded: false,
          providerLimitSecretsIncluded: false,
          rawProviderPayloadsIncluded: false,
          providerResponsesIncluded: false,
          providerMessageIdsIncluded: false,
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          recipientPayloadsIncluded: false,
          providerSendEnabled: false,
          cloudflareQueueProducersEnabled: false,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-provider-rate-limit-readiness-launch-window",
            draftId: "broadcast-draft-launch-window",
            throttleWindow: "provider_rate_limit_window_pending",
            providerSendEnabled: false,
            cloudflareQueueProducersEnabled: false,
            recipientPayloadsCreated: false,
            providerResponsesIncluded: false,
            providerMessageIdsIncluded: false,
            rawProviderPayloadsStored: false,
          }),
        ]),
      }),
    );
    expect(payload.broadcastProviderResponseReadiness).toEqual(
      expect.objectContaining({
        status: audienceBroadcastProviderResponseReadinessStatus,
        issue: audienceBroadcastProviderResponseReadinessIssue,
        counts: expect.objectContaining({
          providerResponseReadinessRecords: expect.any(Number),
          successResponsePolicyRecords: expect.any(Number),
          transientFailurePolicyRecords: expect.any(Number),
          permanentFailurePolicyRecords: expect.any(Number),
          retryDecisionPolicyRecords: expect.any(Number),
          providerSendEnabledRecords: 0,
          cloudflareQueueProducerEnabledRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          providerResponsesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
          rawProviderResponseBodiesStoredRecords: 0,
        }),
        redaction: expect.objectContaining({
          providerSecretsIncluded: false,
          rawProviderResponseBodiesIncluded: false,
          providerResponsesIncluded: false,
          providerMessageIdsIncluded: false,
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          recipientPayloadsIncluded: false,
          providerSendEnabled: false,
          cloudflareQueueProducersEnabled: false,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-provider-response-readiness-launch-window",
            draftId: "broadcast-draft-launch-window",
            responseStatusClasses: expect.arrayContaining(["accepted", "transient_failure", "permanent_failure"]),
            providerSendEnabled: false,
            cloudflareQueueProducersEnabled: false,
            recipientPayloadsCreated: false,
            providerResponsesIncluded: false,
            providerMessageIdsIncluded: false,
            rawProviderResponseBodiesStored: false,
          }),
        ]),
      }),
    );
    expect(payload.broadcastSendPayloadReadiness).toEqual(
      expect.objectContaining({
        status: audienceBroadcastSendPayloadReadinessStatus,
        issue: audienceBroadcastSendPayloadReadinessIssue,
        counts: expect.objectContaining({
          sendPayloadReadinessRecords: expect.any(Number),
          unsubscribeFooterPolicyRecords: expect.any(Number),
          consentRecheckPolicyRecords: expect.any(Number),
          suppressionRecheckPolicyRecords: expect.any(Number),
          cloudflareQueueProducerEnabledRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          personalizedBodiesCreatedRecords: 0,
          providerSendEnabledRecords: 0,
          providerResponsesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
          rawPayloadBodiesStoredRecords: 0,
        }),
        redaction: expect.objectContaining({
          rawRecipientEmailsIncluded: false,
          privateContactDataIncluded: false,
          recipientPayloadsIncluded: false,
          personalizedBodiesIncluded: false,
          rawPayloadBodiesIncluded: false,
          providerSecretsIncluded: false,
          providerResponsesIncluded: false,
          providerMessageIdsIncluded: false,
          cloudflareQueueProducersEnabled: false,
          providerSendEnabled: false,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-send-payload-readiness-launch-window",
            draftId: "broadcast-draft-launch-window",
            payloadScope: expect.arrayContaining(["unsubscribe_footer", "personalization_tokens"]),
            cloudflareQueueProducersEnabled: false,
            recipientPayloadsCreated: false,
            personalizedBodiesCreated: false,
            providerSendEnabled: false,
            providerResponsesIncluded: false,
            providerMessageIdsIncluded: false,
            rawPayloadBodiesStored: false,
          }),
        ]),
      }),
    );
    expect(payload.broadcastQueueProducerReadiness).toEqual(
      expect.objectContaining({
        status: audienceBroadcastQueueProducerReadinessStatus,
        issue: audienceBroadcastQueueProducerReadinessIssue,
        counts: expect.objectContaining({
          queueProducerReadinessRecords: expect.any(Number),
          dryRunProducerContracts: expect.any(Number),
          cloudflareQueueProducerEnabledRecords: 0,
          cloudflareQueueMessagesCreatedRecords: 0,
          queuePayloadBodiesCreatedRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          personalizedBodiesCreatedRecords: 0,
          providerSendEnabledRecords: 0,
          providerResponsesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
          rawPayloadBodiesStoredRecords: 0,
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          queuePayloadBodiesIncluded: false,
          recipientPayloadsIncluded: false,
          personalizedBodiesIncluded: false,
          rawPayloadBodiesIncluded: false,
          providerSecretsIncluded: false,
          providerResponsesIncluded: false,
          providerMessageIdsIncluded: false,
          cloudflareQueueProducersEnabled: false,
          cloudflareQueueMessagesCreated: false,
          providerSendEnabled: false,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-queue-producer-readiness-launch-window",
            draftId: "broadcast-draft-launch-window",
            queueName: "audience-broadcast-delivery",
            producerBinding: "AUDIENCE_BROADCAST_DELIVERY_QUEUE",
            cloudflareQueueProducersEnabled: false,
            cloudflareQueueMessagesCreated: false,
            queuePayloadBodiesCreated: false,
            recipientPayloadsCreated: false,
            personalizedBodiesCreated: false,
            providerSendEnabled: false,
            providerResponsesIncluded: false,
            providerMessageIdsIncluded: false,
            rawPayloadBodiesStored: false,
          }),
        ]),
      }),
    );
    expect(payload.broadcastQueueConsumerReadiness).toEqual(
      expect.objectContaining({
        status: audienceBroadcastQueueConsumerReadinessStatus,
        issue: audienceBroadcastQueueConsumerReadinessIssue,
        counts: expect.objectContaining({
          queueConsumerReadinessRecords: expect.any(Number),
          dryRunConsumerContracts: expect.any(Number),
          cloudflareQueueConsumerEnabledRecords: 0,
          cloudflareQueueMessagesConsumedRecords: 0,
          cloudflareQueueMessagesAckedRecords: 0,
          queueRetryRecordsCreatedRecords: 0,
          queueDeadLetterRecordsCreatedRecords: 0,
          queuePayloadBodiesReadRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          providerSendEnabledRecords: 0,
          providerResponsesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
          rawPayloadBodiesStoredRecords: 0,
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          queuePayloadBodiesIncluded: false,
          queueConsumerAckRowsIncluded: false,
          queueRetryRowsIncluded: false,
          queueDeadLetterRowsIncluded: false,
          recipientPayloadsIncluded: false,
          rawPayloadBodiesIncluded: false,
          providerSecretsIncluded: false,
          providerResponsesIncluded: false,
          providerMessageIdsIncluded: false,
          cloudflareQueueConsumersEnabled: false,
          cloudflareQueueMessagesConsumed: false,
          cloudflareQueueMessagesAcked: false,
          providerSendEnabled: false,
        }),
        records: expect.arrayContaining([
          expect.objectContaining({
            id: "broadcast-queue-consumer-readiness-launch-window",
            draftId: "broadcast-draft-launch-window",
            queueName: "audience-broadcast-delivery",
            consumerName: "bumpgrade-audience-broadcast-delivery-consumer",
            cloudflareQueueConsumersEnabled: false,
            cloudflareQueueMessagesConsumed: false,
            cloudflareQueueMessagesAcked: false,
            queueRetryRecordsCreated: false,
            queueDeadLetterRecordsCreated: false,
            queuePayloadBodiesRead: false,
            recipientPayloadsCreated: false,
            providerSendEnabled: false,
            providerResponsesIncluded: false,
            providerMessageIdsIncluded: false,
            rawPayloadBodiesStored: false,
          }),
        ]),
      }),
    );
    expect(payload.broadcastDeliveryBatches).toEqual(
      expect.objectContaining({
        status: audienceBroadcastDeliveryBatchStatus,
        issue: audienceBroadcastDeliveryBatchIssue,
        apiRoute: audienceBroadcastDeliveryBatchApiRoute,
        ownerRoute: "/admin/audience",
        confirmation: expect.objectContaining({
          required: true,
          text: audienceBroadcastDeliveryBatchConfirmationText,
        }),
        counts: expect.objectContaining({
          deliveryBatches: expect.any(Number),
          dryRunBatches: expect.any(Number),
          readyRecipientsBatched: expect.any(Number),
          heldRecipientsSnapshotted: expect.any(Number),
          activeSuppressionsSnapshotted: expect.any(Number),
          providerSendEnabledBatches: 0,
          recipientPayloadsCreatedBatches: 0,
          providerMessageIdsCreatedBatches: 0,
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          actorEmailIncluded: false,
          recipientPayloadsIncluded: false,
          personalizedBodyIncluded: false,
          providerMessageIdsIncluded: false,
          sendQueueRowsCreated: false,
        }),
      }),
    );
    expect(payload.broadcastDeliveryQueueMessages).toEqual(
      expect.objectContaining({
        status: audienceBroadcastDeliveryQueueMessageStatus,
        issue: audienceBroadcastDeliveryQueueMessageIssue,
        apiRoute: audienceBroadcastDeliveryQueueMessageApiRoute,
        ownerRoute: "/admin/audience",
        confirmation: expect.objectContaining({
          required: true,
          text: audienceBroadcastDeliveryQueueMessageConfirmationText,
        }),
        counts: expect.objectContaining({
          dryRunRecords: expect.any(Number),
          dryRunMessagesSnapshotted: expect.any(Number),
          heldRecipientsSnapshotted: expect.any(Number),
          providerSendEnabledRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          cloudflareQueueMessagesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          actorEmailIncluded: false,
          recipientPayloadsIncluded: false,
          personalizedBodyIncluded: false,
          providerMessageIdsIncluded: false,
          cloudflareQueueMessagesCreated: false,
          providerSendEnabled: false,
        }),
      }),
    );
    expect(payload.broadcastDispatchPreflights).toEqual(
      expect.objectContaining({
        status: audienceBroadcastDispatchPreflightStatus,
        issue: audienceBroadcastDispatchPreflightIssue,
        apiRoute: audienceBroadcastDispatchPreflightApiRoute,
        ownerRoute: "/admin/audience",
        confirmation: expect.objectContaining({
          required: true,
          text: audienceBroadcastDispatchPreflightConfirmationText,
        }),
        counts: expect.objectContaining({
          dryRunPreflights: expect.any(Number),
          dryRunMessagesSnapshotted: expect.any(Number),
          heldRecipientsSnapshotted: expect.any(Number),
          providerSendEnabledRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          cloudflareQueueMessagesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          actorEmailIncluded: false,
          recipientPayloadsIncluded: false,
          personalizedBodyIncluded: false,
          providerMessageIdsIncluded: false,
          cloudflareQueueMessagesCreated: false,
          providerSendEnabled: false,
        }),
      }),
    );
    expect(payload.broadcastDispatchAttempts).toEqual(
      expect.objectContaining({
        status: audienceBroadcastDispatchAttemptStatus,
        issue: audienceBroadcastDispatchAttemptIssue,
        apiRoute: audienceBroadcastDispatchAttemptApiRoute,
        ownerRoute: "/admin/audience",
        confirmation: expect.objectContaining({
          required: true,
          text: audienceBroadcastDispatchAttemptConfirmationText,
        }),
        counts: expect.objectContaining({
          dryRunAttempts: expect.any(Number),
          dryRunMessagesSnapshotted: expect.any(Number),
          heldRecipientsSnapshotted: expect.any(Number),
          providerSendEnabledRecords: 0,
          recipientPayloadsCreatedRecords: 0,
          cloudflareQueueMessagesCreatedRecords: 0,
          providerMessageIdsCreatedRecords: 0,
          providerResponsesCreatedRecords: 0,
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawRecipientEmailsIncluded: false,
          actorEmailIncluded: false,
          recipientPayloadsIncluded: false,
          personalizedBodyIncluded: false,
          providerMessageIdsIncluded: false,
          providerResponsesIncluded: false,
          cloudflareQueueMessagesCreated: false,
          providerSendEnabled: false,
        }),
      }),
    );
    expect(payload.importIntents).toEqual(
      expect.objectContaining({
        id: "audience-import-intent-contract",
        status: audienceImportIntentStatus,
        issue: audienceImportIntentIssue,
        parentIssue: 17,
        apiRoute: audienceImportIntentApiRoute,
        ownerRoute: "/admin/audience",
        workspace: expect.objectContaining({
          id: audienceAutomationWorkspace.id,
          status: audienceAutomationWorkspace.status,
          revisionId: audienceAutomationWorkspace.revisionId,
        }),
        confirmation: expect.objectContaining({
          required: true,
          text: audienceImportIntentConfirmationText,
        }),
        sourceKinds: expect.arrayContaining(["csv_upload", "kit_export", "manual_paste", "api_migration"]),
        counts: expect.objectContaining({
          importIntents: expect.any(Number),
          ownerConfirmedIntents: expect.any(Number),
          estimatedContacts: expect.any(Number),
          importRowsStoredRecords: 0,
          rawEmailsStoredRecords: 0,
          sequenceEnrollmentsCreatedRecords: 0,
          emailDeliveryEnabledRecords: 0,
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawEmailsIncluded: false,
          importRowsIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
          sequenceEnrollmentsCreated: false,
          emailDeliveryEnabled: false,
        }),
      }),
    );
    expect(payload.importPreflights).toEqual(
      expect.objectContaining({
        id: "audience-import-preflight-contract",
        status: audienceImportPreflightStatus,
        issue: audienceImportPreflightIssue,
        parentIssue: 17,
        apiRoute: audienceImportPreflightApiRoute,
        ownerRoute: "/admin/audience",
        workspace: expect.objectContaining({
          id: audienceAutomationWorkspace.id,
          status: audienceAutomationWorkspace.status,
          revisionId: audienceAutomationWorkspace.revisionId,
        }),
        confirmation: expect.objectContaining({
          required: true,
          text: audienceImportPreflightConfirmationText,
        }),
        counts: expect.objectContaining({
          importPreflights: expect.any(Number),
          ownerConfirmedPreflights: expect.any(Number),
          totalContactsChecked: expect.any(Number),
          subscriberRowsCreatedRecords: 0,
          rawEmailsStoredRecords: 0,
          importRowsStoredRecords: 0,
          sequenceEnrollmentsCreatedRecords: 0,
          emailDeliveryEnabledRecords: 0,
          exportEnabledRecords: 0,
        }),
        redaction: expect.objectContaining({
          privateContactDataIncluded: false,
          rawEmailsIncluded: false,
          importRowsIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
          subscriberRowsCreated: false,
          sequenceEnrollmentsCreated: false,
          emailDeliveryEnabled: false,
          exportEnabled: false,
        }),
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
          broadcastDeliveryBatchApiRoute: audienceBroadcastDeliveryBatchApiRoute,
          broadcastDeliveryQueueMessageApiRoute: audienceBroadcastDeliveryQueueMessageApiRoute,
          broadcastDispatchPreflightApiRoute: audienceBroadcastDispatchPreflightApiRoute,
          broadcastDispatchAttemptApiRoute: audienceBroadcastDispatchAttemptApiRoute,
          audienceImportIntentApiRoute,
          audienceImportPreflightApiRoute,
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
    expect(payload.writeBoundary).toContain("Issue #253 can record owner-confirmed import intent metadata");
    expect(payload.writeBoundary).toContain("Issue #259 can record owner-confirmed import preflight evidence");
    expect(payload.caveat).toContain("consent-backed subscriber capture");
    expect(payload.caveat).toContain("owner-confirmed import intent evidence");
    expect(payload.caveat).toContain("owner-confirmed import preflight evidence");

    await page.goto("/audience/indie-launch-waitlist");
    await expect(page.getByRole("heading", { name: /Indie launch waitlist and nurture/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Indie launch waitlist opt-in/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Unsubscribe evidence is captured/i })).toBeVisible();
    await expect(page.getByText("Launch checklist lead magnet")).toBeVisible();
    await expect(page.getByText("Indie launch nurture sequence")).toBeVisible();

    const browserEmail = `playwright-waitlist-${Date.now()}@example.com`;
    const optInForm = page.getByRole("form", { name: "Audience opt-in" });
    await optInForm.getByLabel("Email address").fill(` ${browserEmail} `);
    await optInForm.getByLabel("First name, optional").fill("  Playwright  ");
    await optInForm.getByLabel(/I want the launch checklist/i).check();
    await optInForm.getByRole("button", { name: /Join waitlist/i }).click();
    await expect(page.getByText("Waitlist opt-in saved")).toBeVisible();
    await expect(page.getByText(browserEmail)).toBeVisible();
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
    expect(JSON.stringify(afterPayload.broadcastDeliveryBatches)).not.toContain("@example.com");
    expect(JSON.stringify(afterPayload.broadcastDeliveryQueueMessages)).not.toContain("@example.com");
    expect(JSON.stringify(afterPayload.broadcastDispatchPreflights)).not.toContain("@example.com");
    expect(JSON.stringify(afterPayload.importIntents)).not.toContain("@example.com");
    expect(JSON.stringify(afterPayload.subscriberInspection)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.broadcastReadiness)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.broadcastPreviewSafety)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.broadcastQueueReadiness)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.broadcastDeliveryBatches)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.broadcastDeliveryQueueMessages)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.broadcastDispatchPreflights)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.importIntents)).not.toContain("Browser smoke");
    expect(JSON.stringify(afterPayload.importPreflights)).not.toContain("Browser smoke");
  });

  test("owner audience import intents and preflights require auth, confirmation, idempotency, stale state, and redaction", async ({
    page,
    request,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Owner import intent auth flow is covered once on desktop.");

    const suffix = Date.now();
    const idempotencyKey = `playwright-audience-import-intent-${suffix}`;
    const sourceLabel = `Kit import dry run ${suffix}`;
    const rawContactEmail = `raw-import-${suffix}@example.com`;
    const privateNote = `Private import note for m@rkmoriarty.com and ${rawContactEmail}`;
    const requestBody = {
      workspaceId: audienceAutomationWorkspace.id,
      expectedWorkspaceRevisionId: audienceAutomationWorkspace.revisionId,
      expectedWorkspaceStatus: audienceAutomationWorkspace.status,
      sourceKind: "kit_export",
      sourceLabel,
      estimatedContactCount: 10,
      estimatedNewContactCount: 7,
      estimatedUpdateCount: 2,
      estimatedSuppressedCount: 1,
      privateNote,
      confirmationText: audienceImportIntentConfirmationText,
      idempotencyKey,
    };
    const preflightIdempotencyKey = `playwright-audience-import-preflight-${suffix}`;
    const rawPreflightEmail = `raw-preflight-${suffix}@example.com`;

    const unauthorizedGet = await request.get(audienceImportIntentApiRoute);
    expect(unauthorizedGet.status()).toBe(401);
    await expect(unauthorizedGet.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "owner_session_required",
        redaction: expect.objectContaining({
          rawEmailsIncluded: false,
          importRowsIncluded: false,
          actorEmailIncluded: false,
        }),
      }),
    );

    const unauthorizedPost = await request.post(audienceImportIntentApiRoute, { data: requestBody });
    expect(unauthorizedPost.status()).toBe(401);
    await expect(unauthorizedPost.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    const unauthorizedPreflightGet = await request.get(audienceImportPreflightApiRoute);
    expect(unauthorizedPreflightGet.status()).toBe(401);
    await expect(unauthorizedPreflightGet.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "owner_session_required",
        redaction: expect.objectContaining({
          rawEmailsIncluded: false,
          subscriberRowsCreated: false,
          exportEnabled: false,
        }),
      }),
    );

    const unauthorizedPreflightPost = await request.post(audienceImportPreflightApiRoute, {
      data: {
        workspaceId: audienceAutomationWorkspace.id,
        importIntentId: "audience-import-intent-missing",
        expectedImportIntentSourceLabel: sourceLabel,
        expectedWorkspaceRevisionId: audienceAutomationWorkspace.revisionId,
        expectedWorkspaceStatus: audienceAutomationWorkspace.status,
        totalContactsChecked: 10,
        eligibleNewContactCount: 7,
        eligibleUpdateCount: 1,
        duplicateCount: 1,
        suppressedCount: 1,
        missingConsentCount: 0,
        malformedCount: 0,
        lawfulBasisCount: 8,
        confirmationText: audienceImportPreflightConfirmationText,
        idempotencyKey: preflightIdempotencyKey,
      },
    });
    expect(unauthorizedPreflightPost.status()).toBe(401);
    await expect(unauthorizedPreflightPost.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    await signInOrCreateOwner(page);

    const contractResponse = await page.request.get(audienceImportIntentApiRoute);
    expect(contractResponse.ok(), await contractResponse.text()).toBeTruthy();
    await expect(contractResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: audienceImportIntentStatus,
        route: audienceImportIntentApiRoute,
        confirmation: expect.objectContaining({ text: audienceImportIntentConfirmationText }),
        contract: expect.objectContaining({
          sourceKinds: expect.arrayContaining(["csv_upload", "kit_export"]),
          redaction: expect.objectContaining({
            rawEmailsIncluded: false,
            privateNoteIncluded: false,
          }),
        }),
      }),
    );

    const preflightContractResponse = await page.request.get(audienceImportPreflightApiRoute);
    expect(preflightContractResponse.ok(), await preflightContractResponse.text()).toBeTruthy();
    await expect(preflightContractResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: audienceImportPreflightStatus,
        route: audienceImportPreflightApiRoute,
        confirmation: expect.objectContaining({ text: audienceImportPreflightConfirmationText }),
        contract: expect.objectContaining({
          redaction: expect.objectContaining({
            rawEmailsIncluded: false,
            privateNoteIncluded: false,
            subscriberRowsCreated: false,
            exportEnabled: false,
          }),
        }),
      }),
    );

    const missingConfirmation = await page.request.post(audienceImportIntentApiRoute, {
      data: { ...requestBody, confirmationText: "Record contacts now", idempotencyKey: `${idempotencyKey}-missing` },
    });
    expect(missingConfirmation.status()).toBe(400);
    await expect(missingConfirmation.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "confirmation_required" }),
    );

    const staleRevision = await page.request.post(audienceImportIntentApiRoute, {
      data: {
        ...requestBody,
        expectedWorkspaceRevisionId: "stale-workspace-revision",
        idempotencyKey: `${idempotencyKey}-stale-revision`,
      },
    });
    expect(staleRevision.status()).toBe(409);
    await expect(staleRevision.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_workspace_revision",
        currentWorkspaceRevisionId: audienceAutomationWorkspace.revisionId,
      }),
    );

    const staleStatus = await page.request.post(audienceImportIntentApiRoute, {
      data: {
        ...requestBody,
        expectedWorkspaceStatus: "published",
        idempotencyKey: `${idempotencyKey}-stale-status`,
      },
    });
    expect(staleStatus.status()).toBe(409);
    await expect(staleStatus.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_workspace_status",
        currentWorkspaceStatus: audienceAutomationWorkspace.status,
      }),
    );

    const created = await page.request.post(audienceImportIntentApiRoute, { data: requestBody });
    expect(created.status(), await created.text()).toBe(201);
    const createdPayload = await created.json();
    expect(createdPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "audience_import_intent_recorded",
        duplicate: false,
        intent: expect.objectContaining({
          workspaceId: audienceAutomationWorkspace.id,
          sourceKind: "kit_export",
          sourceLabel,
          estimatedContactCount: 10,
          estimatedNewContactCount: 7,
          estimatedUpdateCount: 2,
          estimatedSuppressedCount: 1,
          privateNoteRecorded: true,
          importRowsStored: false,
          rawEmailsStored: false,
          sequenceEnrollmentsCreated: false,
          emailDeliveryEnabled: false,
        }),
        redaction: expect.objectContaining({
          rawEmailsIncluded: false,
          importRowsIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
        }),
      }),
    );

    const replay = await page.request.post(audienceImportIntentApiRoute, { data: requestBody });
    expect(replay.status(), await replay.text()).toBe(200);
    await expect(replay.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "audience_import_intent_replayed",
        duplicate: true,
        intent: expect.objectContaining({ id: createdPayload.intent.id }),
      }),
    );

    const conflict = await page.request.post(audienceImportIntentApiRoute, {
      data: { ...requestBody, estimatedContactCount: 11 },
    });
    expect(conflict.status()).toBe(409);
    await expect(conflict.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_conflict" }),
    );

    const sourceResponse = await page.request.get("/audience/source-data");
    expect(sourceResponse.ok(), await sourceResponse.text()).toBeTruthy();
    const sourcePayload = await sourceResponse.json();
    expect(sourcePayload.importIntents.counts.importIntents).toBeGreaterThanOrEqual(1);
    expect(sourcePayload.importIntents.counts.ownerConfirmedIntents).toBeGreaterThanOrEqual(1);
    expect(sourcePayload.importIntents.latestIntents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdPayload.intent.id,
          sourceLabel,
          rawEmailsStored: false,
          importRowsStored: false,
          sequenceEnrollmentsCreated: false,
          emailDeliveryEnabled: false,
        }),
      ]),
    );
    const sourceText = JSON.stringify(sourcePayload.importIntents);
    expect(sourceText).not.toContain(rawContactEmail);
    expect(sourceText).not.toContain("m@rkmoriarty.com");
    expect(sourceText).not.toContain("Private import note");

    const preflightRequestBody = {
      workspaceId: audienceAutomationWorkspace.id,
      importIntentId: createdPayload.intent.id,
      expectedImportIntentSourceLabel: sourceLabel,
      expectedWorkspaceRevisionId: audienceAutomationWorkspace.revisionId,
      expectedWorkspaceStatus: audienceAutomationWorkspace.status,
      totalContactsChecked: 10,
      eligibleNewContactCount: 6,
      eligibleUpdateCount: 2,
      duplicateCount: 1,
      suppressedCount: 1,
      missingConsentCount: 0,
      malformedCount: 0,
      lawfulBasisCount: 8,
      privateNote: `Private preflight note for ${rawPreflightEmail} and m@rkmoriarty.com`,
      confirmationText: audienceImportPreflightConfirmationText,
      idempotencyKey: preflightIdempotencyKey,
    };

    const missingPreflightConfirmation = await page.request.post(audienceImportPreflightApiRoute, {
      data: {
        ...preflightRequestBody,
        confirmationText: "Create subscribers now",
        idempotencyKey: `${preflightIdempotencyKey}-missing`,
      },
    });
    expect(missingPreflightConfirmation.status()).toBe(400);
    await expect(missingPreflightConfirmation.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "confirmation_required" }),
    );

    const stalePreflightRevision = await page.request.post(audienceImportPreflightApiRoute, {
      data: {
        ...preflightRequestBody,
        expectedWorkspaceRevisionId: "stale-workspace-revision",
        idempotencyKey: `${preflightIdempotencyKey}-stale-revision`,
      },
    });
    expect(stalePreflightRevision.status()).toBe(409);
    await expect(stalePreflightRevision.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_workspace_revision",
        currentWorkspaceRevisionId: audienceAutomationWorkspace.revisionId,
      }),
    );

    const missingImportIntent = await page.request.post(audienceImportPreflightApiRoute, {
      data: {
        ...preflightRequestBody,
        importIntentId: "audience-import-intent-missing",
        idempotencyKey: `${preflightIdempotencyKey}-missing-intent`,
      },
    });
    expect(missingImportIntent.status()).toBe(404);
    await expect(missingImportIntent.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "import_intent_not_found" }),
    );

    const mismatchImportIntent = await page.request.post(audienceImportPreflightApiRoute, {
      data: {
        ...preflightRequestBody,
        expectedImportIntentSourceLabel: "Wrong source label",
        idempotencyKey: `${preflightIdempotencyKey}-mismatch`,
      },
    });
    expect(mismatchImportIntent.status()).toBe(409);
    await expect(mismatchImportIntent.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "import_intent_mismatch" }),
    );

    const aggregateMismatch = await page.request.post(audienceImportPreflightApiRoute, {
      data: {
        ...preflightRequestBody,
        totalContactsChecked: 11,
        idempotencyKey: `${preflightIdempotencyKey}-aggregate`,
      },
    });
    expect(aggregateMismatch.status()).toBe(400);
    await expect(aggregateMismatch.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "aggregate_count_mismatch" }),
    );

    const preflightCreated = await page.request.post(audienceImportPreflightApiRoute, { data: preflightRequestBody });
    expect(preflightCreated.status(), await preflightCreated.text()).toBe(201);
    const preflightCreatedPayload = await preflightCreated.json();
    expect(preflightCreatedPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "audience_import_preflight_recorded",
        duplicate: false,
        preflight: expect.objectContaining({
          workspaceId: audienceAutomationWorkspace.id,
          importIntentId: createdPayload.intent.id,
          sourceKind: "kit_export",
          expectedImportIntentSourceLabel: sourceLabel,
          totalContactsChecked: 10,
          eligibleNewContactCount: 6,
          eligibleUpdateCount: 2,
          duplicateCount: 1,
          suppressedCount: 1,
          missingConsentCount: 0,
          malformedCount: 0,
          lawfulBasisCount: 8,
          privateNoteRecorded: true,
          importRowsStored: false,
          rawEmailsStored: false,
          subscriberRowsCreated: false,
          sequenceEnrollmentsCreated: false,
          emailDeliveryEnabled: false,
          exportEnabled: false,
        }),
        redaction: expect.objectContaining({
          rawEmailsIncluded: false,
          importRowsIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
          subscriberRowsCreated: false,
          exportEnabled: false,
        }),
      }),
    );

    const preflightReplay = await page.request.post(audienceImportPreflightApiRoute, { data: preflightRequestBody });
    expect(preflightReplay.status(), await preflightReplay.text()).toBe(200);
    await expect(preflightReplay.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "audience_import_preflight_replayed",
        duplicate: true,
        preflight: expect.objectContaining({ id: preflightCreatedPayload.preflight.id }),
      }),
    );

    const preflightConflict = await page.request.post(audienceImportPreflightApiRoute, {
      data: { ...preflightRequestBody, lawfulBasisCount: 7 },
    });
    expect(preflightConflict.status()).toBe(409);
    await expect(preflightConflict.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_conflict" }),
    );

    const sourceAfterPreflight = await page.request.get("/audience/source-data");
    expect(sourceAfterPreflight.ok(), await sourceAfterPreflight.text()).toBeTruthy();
    const sourceAfterPreflightPayload = await sourceAfterPreflight.json();
    expect(sourceAfterPreflightPayload.importPreflights.counts.importPreflights).toBeGreaterThanOrEqual(1);
    expect(sourceAfterPreflightPayload.importPreflights.counts.ownerConfirmedPreflights).toBeGreaterThanOrEqual(1);
    expect(sourceAfterPreflightPayload.importPreflights.latestPreflights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: preflightCreatedPayload.preflight.id,
          importIntentId: createdPayload.intent.id,
          expectedImportIntentSourceLabel: sourceLabel,
          rawEmailsStored: false,
          importRowsStored: false,
          subscriberRowsCreated: false,
          sequenceEnrollmentsCreated: false,
          emailDeliveryEnabled: false,
          exportEnabled: false,
        }),
      ]),
    );
    const preflightSourceText = JSON.stringify(sourceAfterPreflightPayload.importPreflights);
    expect(preflightSourceText).not.toContain(rawPreflightEmail);
    expect(preflightSourceText).not.toContain("m@rkmoriarty.com");
    expect(preflightSourceText).not.toContain("Private preflight note");

    await page.goto("/admin/audience");
    await expect(page.getByRole("heading", { name: "Imports stay intent-only until contact writes are safe" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record import intent/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preflights prove import safety before contact writes" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record import preflight/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: sourceLabel }).first()).toBeVisible();
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

    const unauthorizedQueueMessageResponse = await request.post(audienceBroadcastDeliveryQueueMessageApiRoute, {
      data: {
        deliveryBatchId: "broadcast-delivery-batch-not-public",
        draftId: "broadcast-draft-launch-window",
        expectedDraftUpdatedAt: "2026-05-19T00:00:00.000Z",
        expectedReadyRecipientCount: 0,
        confirmationText: audienceBroadcastDeliveryQueueMessageConfirmationText,
        idempotencyKey: `${idempotencyKey}-unauthorized-queue-messages`,
      },
    });
    expect(unauthorizedQueueMessageResponse.status()).toBe(401);
    await expect(unauthorizedQueueMessageResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    const unauthorizedDispatchPreflightResponse = await request.post(audienceBroadcastDispatchPreflightApiRoute, {
      data: {
        deliveryQueueMessageId: "broadcast-delivery-queue-messages-not-public",
        draftId: "broadcast-draft-launch-window",
        expectedDraftUpdatedAt: "2026-05-19T00:00:00.000Z",
        expectedReadyRecipientCount: 0,
        confirmationText: audienceBroadcastDispatchPreflightConfirmationText,
        idempotencyKey: `${idempotencyKey}-unauthorized-dispatch-preflight`,
      },
    });
    expect(unauthorizedDispatchPreflightResponse.status()).toBe(401);
    await expect(unauthorizedDispatchPreflightResponse.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    const unauthorizedDispatchAttemptResponse = await request.post(audienceBroadcastDispatchAttemptApiRoute, {
      data: {
        dispatchPreflightId: "broadcast-dispatch-preflight-not-public",
        draftId: "broadcast-draft-launch-window",
        expectedDraftUpdatedAt: "2026-05-19T00:00:00.000Z",
        expectedReadyRecipientCount: 0,
        confirmationText: audienceBroadcastDispatchAttemptConfirmationText,
        idempotencyKey: `${idempotencyKey}-unauthorized-dispatch-attempt`,
      },
    });
    expect(unauthorizedDispatchAttemptResponse.status()).toBe(401);
    await expect(unauthorizedDispatchAttemptResponse.json()).resolves.toEqual(
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
        analyticsExperimentDecisionApiRoute,
        analyticsNotificationInboxApiRoute,
        "/admin/analytics",
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
        "analyticsExperimentDecisionId",
        "analyticsExperimentDecisionKind",
        "analyticsNotificationInboxRecordId",
        "analyticsNotificationInboxStatus",
        "analyticsReportExportId",
        "analyticsReportExportSectionId",
        "analyticsCohortFixtureId",
        "analyticsCohortComparisonId",
        "analyticsCohortReviewId",
        "analyticsCohortReviewStatus",
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
    expect(payload.experimentDecisionWrites).toEqual(
      expect.objectContaining({
        status: analyticsExperimentDecisionStatus,
        issue: analyticsExperimentDecisionIssue,
        apiRoute: analyticsExperimentDecisionApiRoute,
        auth: "owner-session",
        tables: expect.arrayContaining(["analytics_experiment_decisions"]),
      }),
    );
    expect(payload.notificationInboxWrites).toEqual(
      expect.objectContaining({
        status: analyticsNotificationInboxStatus,
        issue: analyticsNotificationInboxIssue,
        apiRoute: analyticsNotificationInboxApiRoute,
        auth: "owner-session",
        confirmationText: analyticsNotificationInboxConfirmationText,
        tables: expect.arrayContaining(["analytics_notification_inbox_records"]),
      }),
    );
    expect(payload.experimentDecisions).toEqual(
      expect.objectContaining({
        status: analyticsExperimentDecisionStatus,
        issue: analyticsExperimentDecisionIssue,
        apiRoute: analyticsExperimentDecisionApiRoute,
        ownerRoute: "/admin/analytics",
        currentEvidenceByWindow: expect.arrayContaining([
          expect.objectContaining({
            timeWindow: expect.objectContaining({ key: "all" }),
            experimentId: "experiment-opt-in-hero-promise",
            rawRowsIncluded: false,
            privateDataIncluded: false,
          }),
        ]),
        redaction: expect.objectContaining({
          rawEventRowsIncluded: false,
          rawAssignmentRowsIncluded: false,
          actorEmailIncluded: false,
          privateNoteIncluded: false,
          trafficRoutingEnabled: false,
          automatedWinnerEnabled: false,
        }),
      }),
    );
    expect(payload.notificationInboxRecords).toEqual(
      expect.objectContaining({
        status: analyticsNotificationInboxStatus,
        issue: analyticsNotificationInboxIssue,
        apiRoute: analyticsNotificationInboxApiRoute,
        ownerRoute: "/admin/analytics",
        readiness: expect.objectContaining({
          id: analyticsNotificationReadinessId,
          status: analyticsNotificationReadinessStatus,
          channelId: analyticsNotificationAdminInboxChannelId,
          alertThresholdCount: 2,
        }),
        currentEvidenceByWindow: expect.arrayContaining([
          expect.objectContaining({
            timeWindow: expect.objectContaining({ key: "all" }),
            readinessId: analyticsNotificationReadinessId,
            channelId: analyticsNotificationAdminInboxChannelId,
            adminInboxRecordAllowed: true,
            ownerEmailSendEnabled: false,
            queueDispatchEnabled: false,
            customerAlertEnabled: false,
            rawRowsIncluded: false,
            privateDataIncluded: false,
          }),
        ]),
        counts: expect.objectContaining({
          emailSendEnabledRecords: 0,
          queueDispatchEnabledRecords: 0,
          customerAlertEnabledRecords: 0,
          recipientIdentityIncludedRecords: 0,
          emailBodyIncludedRecords: 0,
        }),
        redaction: expect.objectContaining({
          rawEventRowsIncluded: false,
          rawAssignmentRowsIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
          notificationRecipientIncluded: false,
          emailBodyIncluded: false,
          queuePayloadIncluded: false,
        }),
      }),
    );
    expect(payload.reportExports).toEqual(
      expect.objectContaining({
        status: analyticsReportExportStatus,
        issue: analyticsReportExportIssue,
        sourceDataRoute: "/analytics/source-data",
        selectedTimeWindow: expect.objectContaining({ key: "all" }),
        exports: expect.arrayContaining([
          expect.objectContaining({
            id: "analytics-report-export-indie-launch-aggregate-summary",
            format: "json",
            exportMode: "aggregate_snapshot",
            selectedTimeWindowKey: "all",
            sections: expect.arrayContaining([
              expect.objectContaining({
                id: "analytics-report-section-funnel-conversion",
                stableIds: expect.arrayContaining(["analyticsFunnelConversionReportId", "metricId"]),
              }),
              expect.objectContaining({
                id: "analytics-report-section-experiment-decisions",
                stableIds: expect.arrayContaining(["analyticsExperimentDecisionId"]),
              }),
            ]),
            sampleSizeCaveat: expect.stringContaining("sample-size caveats"),
          }),
        ]),
        cohortComparisonFixtures: expect.arrayContaining([
          expect.objectContaining({
            id: "analytics-cohort-fixture-source-newsletter",
            dimensions: expect.arrayContaining(["utmSource"]),
          }),
        ]),
        ownerReviewedCohortComparisons: expect.arrayContaining([
          expect.objectContaining({
            id: "analytics-cohort-comparison-newsletter-vs-direct-referral",
            status: analyticsCohortComparisonStatus,
            issue: analyticsCohortComparisonIssue,
            selectedTimeWindowKey: "all",
            ownerReview: expect.objectContaining({
              id: "analytics-cohort-review-indie-launch-source-mix",
              status: "reviewed_with_caveats",
              caveatAcknowledged: true,
              requiredBeforeAgentClaims: true,
            }),
            cohortFixtureIds: expect.arrayContaining([
              "analytics-cohort-fixture-source-newsletter",
              "analytics-cohort-fixture-direct-or-referral",
            ]),
            comparisonSummary: expect.objectContaining({
              winnerSelected: false,
              statisticallyMeaningful: false,
              publicClaimAllowed: false,
              trafficRoutingEnabled: false,
              automatedWinnerEnabled: false,
              revenueClaimEnabled: false,
            }),
            redaction: expect.objectContaining({
              rawEventRowsIncluded: false,
              rawAssignmentRowsIncluded: false,
              rawVisitorKeysIncluded: false,
              contactAnalyticsIncluded: false,
            }),
          }),
        ]),
        ownerReviewedAlertThresholds: expect.arrayContaining([
          expect.objectContaining({
            id: "analytics-alert-threshold-review-indie-launch-funnel-health",
            status: analyticsAlertAnomalyStatus,
            issue: analyticsAlertAnomalyIssue,
            selectedTimeWindowKey: "all",
            alertThresholds: expect.arrayContaining([
              expect.objectContaining({
                id: "analytics-alert-threshold-sales-to-checkout-rate",
                metricId: "funnel-metric-sales-to-checkout",
                action: "owner_review_only",
              }),
              expect.objectContaining({
                id: "analytics-alert-threshold-waitlist-opt-in-rate",
                metricId: "funnel-metric-waitlist-opt-in",
                action: "owner_review_only",
              }),
            ]),
            anomalyReview: expect.objectContaining({
              id: "analytics-anomaly-review-indie-launch-funnel-health",
              status: "reviewed_with_caveats",
              caveatAcknowledged: true,
              requiredBeforeAgentAction: true,
            }),
            automationBoundary: expect.objectContaining({
              notificationSent: false,
              trafficRoutingEnabled: false,
              automatedWinnerEnabled: false,
              revenueClaimEnabled: false,
              agentActionAllowed: false,
              ownerReviewRequired: true,
            }),
            redaction: expect.objectContaining({
              rawEventRowsIncluded: false,
              rawAssignmentRowsIncluded: false,
              rawVisitorKeysIncluded: false,
              contactAnalyticsIncluded: false,
            }),
          }),
        ]),
        ownerReviewedNotificationReadiness: expect.arrayContaining([
          expect.objectContaining({
            id: "analytics-notification-readiness-indie-launch-threshold-review",
            status: analyticsNotificationReadinessStatus,
            issue: analyticsNotificationReadinessIssue,
            selectedTimeWindowKey: "all",
            dependsOnAlertReviewIds: expect.arrayContaining([
              "analytics-alert-threshold-review-indie-launch-funnel-health",
              "analytics-anomaly-review-indie-launch-funnel-health",
            ]),
            dependsOnThresholdIds: expect.arrayContaining([
              "analytics-alert-threshold-sales-to-checkout-rate",
              "analytics-alert-threshold-waitlist-opt-in-rate",
            ]),
            deliveryChannels: expect.arrayContaining([
              expect.objectContaining({
                id: "analytics-notification-channel-owner-email-digest",
                enabled: false,
                deliveryConfigured: false,
                customerVisible: false,
              }),
              expect.objectContaining({
                id: "analytics-notification-channel-admin-inbox",
                enabled: false,
                deliveryConfigured: false,
                customerVisible: false,
              }),
            ]),
            readinessGates: expect.objectContaining({
              ownerReviewRequired: true,
              customerNotificationEnabled: false,
              queueProducerEnabled: false,
              emailSendEnabled: false,
              directAgentSendAllowed: false,
            }),
            deliveryBoundary: expect.objectContaining({
              notificationSent: false,
              persistedNotificationRows: false,
              ownerEmailSendEnabled: false,
              adminInboxWriteEnabled: false,
              trafficRoutingEnabled: false,
              automatedWinnerEnabled: false,
              revenueClaimEnabled: false,
            }),
            redaction: expect.objectContaining({
              rawEventRowsIncluded: false,
              rawAssignmentRowsIncluded: false,
              rawVisitorKeysIncluded: false,
              contactAnalyticsIncluded: false,
              notificationRecipientIncluded: false,
              emailBodyIncluded: false,
            }),
          }),
        ]),
        redaction: expect.objectContaining({
          rawEventRowsIncluded: false,
          rawAssignmentRowsIncluded: false,
          rawVisitorKeysIncluded: false,
          rawReferrersIncluded: false,
          rawQueryStringsIncluded: false,
          contactAnalyticsIncluded: false,
        }),
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
      "Issues #105, #107, #119, #121, #123, #125, #127, #129, #261, #263, #265, #267, #269, and #271 can capture seeded analytics events",
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
    await expect(page.getByRole("heading", { name: /Indie launch analytics and experiments/i })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: /Indie launch funnel/i })).toBeVisible();
    await expect.poll(async () => (await waitlistRow()).visitorCount).toBe(beforeVisitors + 1);
    await expect.poll(assignmentCount).toBe(beforeAssignments + 1);
    await expect.poll(variantCount).toBe(beforeVariantEvents + 1);
    await expect.poll(sourceCount).toBe(beforeSourceEvents + 1);

    await page.reload();
    await expect(page.getByRole("heading", { name: /Indie launch funnel/i })).toBeVisible();
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

  test("owner analytics experiment decisions require auth, confirmation, idempotency, stale evidence checks, and redaction", async ({
    page,
    request,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Owner analytics decision auth flow is covered once on desktop.");

    const suffix = Date.now();
    const experiment = analyticsDashboard.experiments[0];
    const variant = experiment.variants[0];
    const privateNote = `Private analytics decision note for m@rkmoriarty.com ${suffix}`;

    const sourceResponse = await request.get("/analytics/source-data");
    expect(sourceResponse.ok(), await sourceResponse.text()).toBeTruthy();
    const sourcePayload = await sourceResponse.json();
    const evidence = sourcePayload.experimentDecisions.currentEvidenceByWindow.find(
      (candidate: { timeWindow: { key: string } }) => candidate.timeWindow.key === "all",
    );
    expect(evidence).toBeTruthy();
    const expectedVariantCounts = Object.fromEntries(
      evidence.variantCounts.map((row: { variantId: string; totalAssignments: number }) => [
        row.variantId,
        row.totalAssignments,
      ]),
    );
    const idempotencyKey = `playwright-analytics-decision-${suffix}`;
    const requestBody = {
      dashboardId: analyticsDashboard.id,
      experimentId: experiment.id,
      decisionKind: "prefer_variant",
      selectedVariantId: variant.id,
      timeWindowKey: evidence.timeWindow.key,
      expectedDashboardRevisionId: analyticsDashboard.revisionId,
      expectedExperimentStatus: experiment.status,
      expectedAssignmentCount: evidence.assignmentCount,
      expectedVariantCounts,
      expectedPrimaryMetricId: evidence.primaryMetricId,
      expectedConversionSampleSize: evidence.conversionSampleSize,
      sampleSizeCaveatAcknowledged: true,
      privateNote,
      confirmationText: analyticsExperimentDecisionConfirmationText,
      idempotencyKey,
    };

    const unauthorizedGet = await request.get(analyticsExperimentDecisionApiRoute);
    expect(unauthorizedGet.status()).toBe(401);
    await expect(unauthorizedGet.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "owner_session_required",
        redaction: expect.objectContaining({
          rawEventRowsIncluded: false,
          rawAssignmentRowsIncluded: false,
          actorEmailIncluded: false,
        }),
      }),
    );

    const unauthorizedPost = await request.post(analyticsExperimentDecisionApiRoute, { data: requestBody });
    expect(unauthorizedPost.status()).toBe(401);
    await expect(unauthorizedPost.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    await signInOrCreateOwner(page);

    const contractResponse = await page.request.get(analyticsExperimentDecisionApiRoute);
    expect(contractResponse.ok(), await contractResponse.text()).toBeTruthy();
    await expect(contractResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: analyticsExperimentDecisionStatus,
        route: analyticsExperimentDecisionApiRoute,
        confirmation: expect.objectContaining({ text: analyticsExperimentDecisionConfirmationText }),
        contract: expect.objectContaining({
          redaction: expect.objectContaining({
            rawEventRowsIncluded: false,
            rawAssignmentRowsIncluded: false,
            privateNoteIncluded: false,
            trafficRoutingEnabled: false,
            automatedWinnerEnabled: false,
          }),
        }),
      }),
    );

    const missingConfirmation = await page.request.post(analyticsExperimentDecisionApiRoute, {
      data: { ...requestBody, confirmationText: "Pick winner now", idempotencyKey: `${idempotencyKey}-missing` },
    });
    expect(missingConfirmation.status()).toBe(400);
    await expect(missingConfirmation.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "confirmation_required" }),
    );

    const missingCaveat = await page.request.post(analyticsExperimentDecisionApiRoute, {
      data: { ...requestBody, sampleSizeCaveatAcknowledged: false, idempotencyKey: `${idempotencyKey}-caveat` },
    });
    expect(missingCaveat.status()).toBe(400);
    await expect(missingCaveat.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "sample_size_caveat_required" }),
    );

    const staleRevision = await page.request.post(analyticsExperimentDecisionApiRoute, {
      data: {
        ...requestBody,
        expectedDashboardRevisionId: "stale-analytics-dashboard-revision",
        idempotencyKey: `${idempotencyKey}-stale-revision`,
      },
    });
    expect(staleRevision.status()).toBe(409);
    await expect(staleRevision.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_dashboard_revision",
        currentDashboardRevisionId: analyticsDashboard.revisionId,
      }),
    );

    const staleEvidence = await page.request.post(analyticsExperimentDecisionApiRoute, {
      data: {
        ...requestBody,
        expectedAssignmentCount: requestBody.expectedAssignmentCount + 1,
        idempotencyKey: `${idempotencyKey}-stale-evidence`,
      },
    });
    expect(staleEvidence.status()).toBe(409);
    await expect(staleEvidence.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "stale_analytics_evidence" }),
    );

    const unsupportedVariant = await page.request.post(analyticsExperimentDecisionApiRoute, {
      data: {
        ...requestBody,
        selectedVariantId: "variant-not-in-experiment",
        idempotencyKey: `${idempotencyKey}-variant`,
      },
    });
    expect(unsupportedVariant.status()).toBe(400);
    await expect(unsupportedVariant.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_variant" }),
    );

    const created = await page.request.post(analyticsExperimentDecisionApiRoute, { data: requestBody });
    expect(created.status(), await created.text()).toBe(201);
    const createdPayload = await created.json();
    expect(createdPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "analytics_experiment_decision_recorded",
        duplicate: false,
        decision: expect.objectContaining({
          dashboardId: analyticsDashboard.id,
          experimentId: experiment.id,
          decisionKind: "prefer_variant",
          selectedVariantId: variant.id,
          timeWindowKey: "all",
          expectedAssignmentCount: requestBody.expectedAssignmentCount,
          expectedConversionSampleSize: requestBody.expectedConversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNoteRecorded: true,
          trafficRoutingEnabled: false,
          automatedWinnerEnabled: false,
          cookieAssignmentEnabled: false,
          revenueClaimEnabled: false,
          rawEventRowsExposed: false,
          rawAssignmentRowsExposed: false,
        }),
        redaction: expect.objectContaining({
          rawEventRowsIncluded: false,
          rawAssignmentRowsIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
          trafficRoutingEnabled: false,
          automatedWinnerEnabled: false,
        }),
      }),
    );

    const replay = await page.request.post(analyticsExperimentDecisionApiRoute, { data: requestBody });
    expect(replay.status(), await replay.text()).toBe(200);
    await expect(replay.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "analytics_experiment_decision_replayed",
        duplicate: true,
        decision: expect.objectContaining({ id: createdPayload.decision.id }),
      }),
    );

    const conflict = await page.request.post(analyticsExperimentDecisionApiRoute, {
      data: { ...requestBody, decisionKind: "needs_more_data" },
    });
    expect(conflict.status()).toBe(409);
    await expect(conflict.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_conflict" }),
    );

    const sourceAfterDecision = await page.request.get("/analytics/source-data");
    expect(sourceAfterDecision.ok(), await sourceAfterDecision.text()).toBeTruthy();
    const sourceAfterDecisionPayload = await sourceAfterDecision.json();
    expect(sourceAfterDecisionPayload.experimentDecisions.counts.ownerConfirmedDecisions).toBeGreaterThanOrEqual(1);
    expect(sourceAfterDecisionPayload.experimentDecisions.latestDecisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdPayload.decision.id,
          decisionKind: "prefer_variant",
          selectedVariantId: variant.id,
          trafficRoutingEnabled: false,
          automatedWinnerEnabled: false,
          rawEventRowsExposed: false,
          rawAssignmentRowsExposed: false,
        }),
      ]),
    );
    const sourceText = JSON.stringify(sourceAfterDecisionPayload.experimentDecisions);
    expect(sourceText).not.toContain(privateNote);
    expect(sourceText).not.toContain("m@rkmoriarty.com");

    await page.goto("/admin/analytics");
    await expect(page.getByRole("heading", { name: /Experiment decisions stay evidenced before traffic routing/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record experiment decision/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: variant.label }).first()).toBeVisible();
  });

  test("owner analytics notification inbox records require auth, confirmation, idempotency, stale evidence checks, and redaction", async ({
    page,
    request,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Owner analytics notification auth flow is covered once on desktop.");

    const suffix = Date.now();
    const privateNote = `Private analytics notification inbox note for m@rkmoriarty.com ${suffix}`;

    const sourceResponse = await request.get("/analytics/source-data");
    expect(sourceResponse.ok(), await sourceResponse.text()).toBeTruthy();
    const sourcePayload = await sourceResponse.json();
    const evidence = sourcePayload.notificationInboxRecords.currentEvidenceByWindow.find(
      (candidate: { timeWindow: { key: string } }) => candidate.timeWindow.key === "all",
    );
    expect(evidence).toBeTruthy();

    const idempotencyKey = `playwright-analytics-notification-inbox-${suffix}`;
    const requestBody = {
      dashboardId: analyticsDashboard.id,
      readinessId: analyticsNotificationReadinessId,
      channelId: analyticsNotificationAdminInboxChannelId,
      timeWindowKey: evidence.timeWindow.key,
      expectedDashboardRevisionId: analyticsDashboard.revisionId,
      expectedReadinessStatus: analyticsNotificationReadinessStatus,
      expectedOwnerReviewStatus: evidence.ownerReviewStatus,
      expectedAlertThresholdCount: evidence.alertThresholdCount,
      expectedConversionSampleSize: evidence.conversionSampleSize,
      sampleSizeCaveatAcknowledged: true,
      privateNote,
      confirmationText: analyticsNotificationInboxConfirmationText,
      idempotencyKey,
    };

    const unauthorizedGet = await request.get(analyticsNotificationInboxApiRoute);
    expect(unauthorizedGet.status()).toBe(401);
    await expect(unauthorizedGet.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "owner_session_required",
        redaction: expect.objectContaining({
          rawEventRowsIncluded: false,
          rawAssignmentRowsIncluded: false,
          notificationRecipientIncluded: false,
          emailBodyIncluded: false,
          actorEmailIncluded: false,
        }),
      }),
    );

    const unauthorizedPost = await request.post(analyticsNotificationInboxApiRoute, { data: requestBody });
    expect(unauthorizedPost.status()).toBe(401);
    await expect(unauthorizedPost.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    await signInOrCreateOwner(page);

    const contractResponse = await page.request.get(analyticsNotificationInboxApiRoute);
    expect(contractResponse.ok(), await contractResponse.text()).toBeTruthy();
    await expect(contractResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: analyticsNotificationInboxStatus,
        route: analyticsNotificationInboxApiRoute,
        confirmation: expect.objectContaining({ text: analyticsNotificationInboxConfirmationText }),
        contract: expect.objectContaining({
          readiness: expect.objectContaining({
            id: analyticsNotificationReadinessId,
            channelId: analyticsNotificationAdminInboxChannelId,
          }),
          redaction: expect.objectContaining({
            rawEventRowsIncluded: false,
            rawAssignmentRowsIncluded: false,
            privateNoteIncluded: false,
            notificationRecipientIncluded: false,
            emailBodyIncluded: false,
            queuePayloadIncluded: false,
          }),
        }),
      }),
    );

    const missingConfirmation = await page.request.post(analyticsNotificationInboxApiRoute, {
      data: { ...requestBody, confirmationText: "Send inbox alert now", idempotencyKey: `${idempotencyKey}-missing` },
    });
    expect(missingConfirmation.status()).toBe(400);
    await expect(missingConfirmation.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "confirmation_required" }),
    );

    const missingCaveat = await page.request.post(analyticsNotificationInboxApiRoute, {
      data: { ...requestBody, sampleSizeCaveatAcknowledged: false, idempotencyKey: `${idempotencyKey}-caveat` },
    });
    expect(missingCaveat.status()).toBe(400);
    await expect(missingCaveat.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "sample_size_caveat_required" }),
    );

    const staleRevision = await page.request.post(analyticsNotificationInboxApiRoute, {
      data: {
        ...requestBody,
        expectedDashboardRevisionId: "stale-analytics-dashboard-revision",
        idempotencyKey: `${idempotencyKey}-stale-revision`,
      },
    });
    expect(staleRevision.status()).toBe(409);
    await expect(staleRevision.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_dashboard_revision",
        currentDashboardRevisionId: analyticsDashboard.revisionId,
      }),
    );

    const staleReadiness = await page.request.post(analyticsNotificationInboxApiRoute, {
      data: {
        ...requestBody,
        expectedReadinessStatus: "stale-notification-readiness",
        idempotencyKey: `${idempotencyKey}-stale-readiness`,
      },
    });
    expect(staleReadiness.status()).toBe(409);
    await expect(staleReadiness.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_readiness_status",
        currentReadinessStatus: analyticsNotificationReadinessStatus,
      }),
    );

    const staleEvidence = await page.request.post(analyticsNotificationInboxApiRoute, {
      data: {
        ...requestBody,
        expectedConversionSampleSize: requestBody.expectedConversionSampleSize + 1,
        idempotencyKey: `${idempotencyKey}-stale-evidence`,
      },
    });
    expect(staleEvidence.status()).toBe(409);
    await expect(staleEvidence.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "stale_analytics_evidence" }),
    );

    const unsupportedChannel = await page.request.post(analyticsNotificationInboxApiRoute, {
      data: {
        ...requestBody,
        channelId: "analytics-notification-channel-owner-email-digest",
        idempotencyKey: `${idempotencyKey}-channel`,
      },
    });
    expect(unsupportedChannel.status()).toBe(400);
    await expect(unsupportedChannel.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_channel" }),
    );

    const created = await page.request.post(analyticsNotificationInboxApiRoute, { data: requestBody });
    expect(created.status(), await created.text()).toBe(201);
    const createdPayload = await created.json();
    expect(createdPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "analytics_notification_inbox_recorded",
        duplicate: false,
        record: expect.objectContaining({
          dashboardId: analyticsDashboard.id,
          readinessId: analyticsNotificationReadinessId,
          channelId: analyticsNotificationAdminInboxChannelId,
          timeWindowKey: "all",
          expectedReadinessStatus: analyticsNotificationReadinessStatus,
          expectedOwnerReviewStatus: evidence.ownerReviewStatus,
          expectedAlertThresholdCount: evidence.alertThresholdCount,
          expectedConversionSampleSize: evidence.conversionSampleSize,
          sampleSizeCaveatAcknowledged: true,
          privateNoteRecorded: true,
          adminInboxRecordCreated: true,
          ownerEmailSendEnabled: false,
          queueDispatchEnabled: false,
          customerAlertEnabled: false,
          trafficRoutingEnabled: false,
          automatedWinnerEnabled: false,
          revenueClaimEnabled: false,
          rawAnalyticsRowsExposed: false,
          recipientIdentityIncluded: false,
          emailBodyIncluded: false,
        }),
        redaction: expect.objectContaining({
          rawEventRowsIncluded: false,
          rawAssignmentRowsIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
          notificationRecipientIncluded: false,
          emailBodyIncluded: false,
          queuePayloadIncluded: false,
        }),
      }),
    );

    const replay = await page.request.post(analyticsNotificationInboxApiRoute, { data: requestBody });
    expect(replay.status(), await replay.text()).toBe(200);
    await expect(replay.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "analytics_notification_inbox_replayed",
        duplicate: true,
        record: expect.objectContaining({ id: createdPayload.record.id }),
      }),
    );

    const conflict = await page.request.post(analyticsNotificationInboxApiRoute, {
      data: { ...requestBody, privateNote: `${privateNote} changed` },
    });
    expect(conflict.status()).toBe(409);
    await expect(conflict.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_conflict" }),
    );

    const sourceAfterNotification = await page.request.get("/analytics/source-data");
    expect(sourceAfterNotification.ok(), await sourceAfterNotification.text()).toBeTruthy();
    const sourceAfterNotificationPayload = await sourceAfterNotification.json();
    expect(sourceAfterNotificationPayload.notificationInboxRecords.counts.ownerConfirmedRecords).toBeGreaterThanOrEqual(1);
    expect(sourceAfterNotificationPayload.notificationInboxRecords.latestRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdPayload.record.id,
          readinessId: analyticsNotificationReadinessId,
          channelId: analyticsNotificationAdminInboxChannelId,
          adminInboxRecordCreated: true,
          ownerEmailSendEnabled: false,
          queueDispatchEnabled: false,
          recipientIdentityIncluded: false,
          emailBodyIncluded: false,
        }),
      ]),
    );
    const sourceText = JSON.stringify(sourceAfterNotificationPayload.notificationInboxRecords);
    expect(sourceText).not.toContain(privateNote);
    expect(sourceText).not.toContain("m@rkmoriarty.com");

    await page.goto("/admin/analytics");
    await expect(page.getByRole("heading", { name: /Record analytics notification evidence without sending email/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record notification inbox/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: analyticsNotificationAdminInboxChannelId }).first()).toBeVisible();
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
        status: "owner-partner-notification-readiness-records-ready",
        issue: 277,
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
        "/api/admin/affiliates/payout-preparation-records",
        "/api/admin/affiliates/fraud-review-records",
        "/api/admin/affiliates/notification-readiness-records",
        "/admin/affiliates",
        "/affiliates/indie-launch-partners",
      ]),
    );
    expect(payload.stableIds).toEqual(
      expect.arrayContaining([
        "payoutPreparationRecordId",
        "payoutPreparationRecordStatus",
        "fraudReviewRecordId",
        "fraudReviewRecordStatus",
        "partnerNotificationReadinessRecordId",
        "partnerNotificationReadinessRecordStatus",
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
    expect(payload.partnerReportContract).toEqual(
      expect.objectContaining({
        status: "partner-reports-ready",
        issue: 193,
        sourceDataRoute: "/affiliates/source-data",
        stableIds: expect.arrayContaining(["affiliatePartnerReportId", "affiliatePartnerId"]),
      }),
    );
    expect(payload.payoutPreparationContract).toEqual(
      expect.objectContaining({
        status: "payout-preparation-ready",
        issue: 195,
        sourceDataRoute: "/affiliates/source-data",
        stableIds: expect.arrayContaining(["payoutPreparationId", "payoutBatchId", "affiliatePartnerReportId"]),
      }),
    );
    expect(payload.payoutPreparationRecordWrites).toEqual(
      expect.objectContaining({
        id: "affiliate-payout-preparation-record-contract",
        status: affiliatePayoutPreparationRecordStatus,
        issue: 273,
        apiRoute: affiliatePayoutPreparationRecordApiRoute,
        tables: expect.arrayContaining(["affiliate_payout_preparation_records"]),
      }),
    );
    expect(payload.fraudReviewRecordWrites).toEqual(
      expect.objectContaining({
        id: "affiliate-fraud-review-record-contract",
        status: affiliateFraudReviewRecordStatus,
        issue: 275,
        apiRoute: affiliateFraudReviewRecordApiRoute,
        tables: expect.arrayContaining(["affiliate_fraud_review_records"]),
      }),
    );
    expect(payload.partnerNotificationReadinessRecordWrites).toEqual(
      expect.objectContaining({
        id: "affiliate-partner-notification-readiness-record-contract",
        status: affiliatePartnerNotificationReadinessRecordStatus,
        issue: 277,
        apiRoute: affiliatePartnerNotificationReadinessRecordApiRoute,
        tables: expect.arrayContaining(["affiliate_partner_notification_readiness_records"]),
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
    expect(payload.partnerReportSummary).toEqual(
      expect.objectContaining({
        status: "available",
        rawRowsIncluded: false,
        privateDataIncluded: false,
        buyerDataIncluded: false,
        payoutRowsIncluded: false,
        taxRowsIncluded: false,
        stripeIdsIncluded: false,
        reports: expect.arrayContaining([
          expect.objectContaining({
            affiliatePartnerReportId: "affiliate-partner-report-launch-circle",
            affiliatePartnerId: "affiliate-partner-launch-circle",
            status: "public_safe_report_ready",
            issue: 193,
            totals: expect.objectContaining({
              totalClicks: expect.any(Number),
              attributedCheckouts: expect.any(Number),
              reviewOnlyLedgers: expect.any(Number),
              totalCommissionCents: expect.any(Number),
              currency: "USD",
            }),
            redaction: expect.objectContaining({
              buyerDataIncluded: false,
              rawClickRowsIncluded: false,
              rawCheckoutRowsIncluded: false,
              rawActorIdentityIncluded: false,
              payoutAccountIncluded: false,
              taxDataIncluded: false,
              stripeIdsIncluded: false,
            }),
          }),
        ]),
      }),
    );
    expect(payload.payoutPreparationSummary).toEqual(
      expect.objectContaining({
        status: "available",
        rawRowsIncluded: false,
        privateDataIncluded: false,
        buyerDataIncluded: false,
        rawLedgerRowsIncluded: false,
        rawActorIdentityIncluded: false,
        payoutRowsIncluded: false,
        payoutAccountsIncluded: false,
        taxRowsIncluded: false,
        stripeIdsIncluded: false,
        partnerNotificationsIncluded: false,
        batches: expect.arrayContaining([
          expect.objectContaining({
            payoutPreparationId: "payout-preparation-indie-launch-may-preview",
            payoutBatchId: "payout-batch-indie-launch-may-preview",
            status: "review_required",
            issue: 195,
            partnerReportIds: expect.arrayContaining(["affiliate-partner-report-launch-circle"]),
            eligibleLedgerIds: expect.arrayContaining(["commission-ledger-launch-pass-fixture"]),
            blockedLedgerIds: expect.arrayContaining(["commission-ledger-self-referral-review"]),
            reversedLedgerIds: expect.arrayContaining(["commission-ledger-refund-reversal"]),
            readinessChecklist: expect.arrayContaining([
              expect.objectContaining({ id: "payout-prep-check-private-payout-data", status: "external_required" }),
            ]),
            totals: expect.objectContaining({
              eligibleFixtureLedgers: 1,
              blockedFixtureLedgers: 1,
              reversedFixtureLedgers: 1,
              fixtureTotalCommissionCents: 2700,
              runtimeTotalCommissionCents: expect.any(Number),
              currency: "USD",
            }),
            execution: expect.objectContaining({
              payableCommissionCreated: false,
              stripePayoutCreated: false,
              payoutAccountStored: false,
              taxDataCollected: false,
              partnerNotificationSent: false,
            }),
            redaction: expect.objectContaining({
              buyerDataIncluded: false,
              rawLedgerRowsIncluded: false,
              rawActorIdentityIncluded: false,
              payoutAccountIncluded: false,
              taxDataIncluded: false,
              stripeIdsIncluded: false,
              partnerNotificationIncluded: false,
            }),
          }),
        ]),
      }),
    );
    expect(payload.payoutPreparationRecords).toEqual(
      expect.objectContaining({
        id: "affiliate-payout-preparation-record-contract",
        status: affiliatePayoutPreparationRecordStatus,
        issue: 273,
        apiRoute: affiliatePayoutPreparationRecordApiRoute,
        counts: expect.objectContaining({
          payableCommissionCreatedRecords: 0,
          stripePayoutCreatedRecords: 0,
          payoutAccountStoredRecords: 0,
          taxDataCollectedRecords: 0,
          partnerNotificationSentRecords: 0,
          rawLedgerRowsExposedRecords: 0,
        }),
        currentEvidence: expect.objectContaining({
          programId: affiliateProgram.id,
          payoutPreparationId: "payout-preparation-indie-launch-may-preview",
          payoutBatchId: "payout-batch-indie-launch-may-preview",
          eligibleLedgerCount: 1,
          blockedLedgerCount: 1,
          reversedLedgerCount: 1,
          totalCommissionCents: 2700,
          payableCommissionCreated: false,
          stripePayoutCreated: false,
          partnerNotificationSent: false,
        }),
        redaction: expect.objectContaining({
          buyerDataIncluded: false,
          rawLedgerRowsIncluded: false,
          rawActorIdentityIncluded: false,
          payoutAccountIncluded: false,
          taxDataIncluded: false,
          stripeIdsIncluded: false,
          partnerNotificationIncluded: false,
        }),
      }),
    );
    expect(payload.fraudReviewRecords).toEqual(
      expect.objectContaining({
        id: "affiliate-fraud-review-record-contract",
        status: affiliateFraudReviewRecordStatus,
        issue: 275,
        apiRoute: affiliateFraudReviewRecordApiRoute,
        counts: expect.objectContaining({
          fraudDecisionEnforcedRecords: 0,
          payableCommissionCreatedRecords: 0,
          stripePayoutCreatedRecords: 0,
          payoutAccountStoredRecords: 0,
          taxDataCollectedRecords: 0,
          partnerNotificationSentRecords: 0,
          rawLedgerRowsExposedRecords: 0,
          rawClickRowsExposedRecords: 0,
          rawCheckoutRowsExposedRecords: 0,
          privateFraudSignalsIncludedRecords: 0,
        }),
        currentEvidence: expect.objectContaining({
          programId: affiliateProgram.id,
          reviewFlagId: "review-flag-self-referral",
          payoutPreparationId: "payout-preparation-indie-launch-may-preview",
          payoutBatchId: "payout-batch-indie-launch-may-preview",
          reviewFlagSeverity: "high",
          linkedLedgerIds: expect.arrayContaining(["commission-ledger-self-referral-review"]),
          fraudDecisionEnforced: false,
          payableCommissionCreated: false,
          stripePayoutCreated: false,
          partnerNotificationSent: false,
          privateFraudSignalsIncluded: false,
        }),
        redaction: expect.objectContaining({
          buyerDataIncluded: false,
          rawLedgerRowsIncluded: false,
          rawClickRowsIncluded: false,
          rawCheckoutRowsIncluded: false,
          rawActorIdentityIncluded: false,
          privateFraudSignalsIncluded: false,
          payoutAccountIncluded: false,
          taxDataIncluded: false,
          stripeIdsIncluded: false,
          partnerNotificationIncluded: false,
        }),
      }),
    );
    expect(payload.partnerNotificationReadinessRecords).toEqual(
      expect.objectContaining({
        id: "affiliate-partner-notification-readiness-record-contract",
        status: affiliatePartnerNotificationReadinessRecordStatus,
        issue: 277,
        apiRoute: affiliatePartnerNotificationReadinessRecordApiRoute,
        counts: expect.objectContaining({
          partnerNotificationSentRecords: 0,
          notificationProviderCalledRecords: 0,
          queueDispatchCreatedRecords: 0,
          notificationBodyIncludedRecords: 0,
          recipientEmailIncludedRecords: 0,
          providerMessageIdIncludedRecords: 0,
          sendQueueRowsIncludedRecords: 0,
          payableCommissionCreatedRecords: 0,
          fraudDecisionEnforcedRecords: 0,
          stripePayoutCreatedRecords: 0,
          payoutAccountStoredRecords: 0,
          taxDataCollectedRecords: 0,
          rawLedgerRowsExposedRecords: 0,
          rawClickRowsExposedRecords: 0,
          rawCheckoutRowsExposedRecords: 0,
          privateFraudSignalsIncludedRecords: 0,
        }),
        currentEvidence: expect.objectContaining({
          programId: affiliateProgram.id,
          affiliatePartnerReportId: "affiliate-partner-report-launch-circle",
          affiliatePartnerId: "affiliate-partner-launch-circle",
          payoutPreparationId: "payout-preparation-indie-launch-may-preview",
          payoutBatchId: "payout-batch-indie-launch-may-preview",
          reviewFlagId: "review-flag-self-referral",
          payoutPreparationRecordStatus: affiliatePayoutPreparationRecordStatus,
          fraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
          notificationChannel: "email",
          notificationAudience: "redacted_affiliate_partner_summary",
          partnerNotificationSent: false,
          notificationProviderCalled: false,
          queueDispatchCreated: false,
          notificationBodyIncluded: false,
          recipientEmailIncluded: false,
          providerMessageIdIncluded: false,
          sendQueueRowsIncluded: false,
        }),
        redaction: expect.objectContaining({
          recipientEmailIncluded: false,
          notificationBodyIncluded: false,
          providerMessageIdIncluded: false,
          sendQueueRowsIncluded: false,
          buyerDataIncluded: false,
          rawLedgerRowsIncluded: false,
          rawClickRowsIncluded: false,
          rawCheckoutRowsIncluded: false,
          rawActorIdentityIncluded: false,
          privateFraudSignalsIncluded: false,
          payoutAccountIncluded: false,
          taxDataIncluded: false,
          stripeIdsIncluded: false,
          partnerNotificationIncluded: false,
        }),
      }),
    );
    expect(payload.programs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: affiliateProgram.id,
          slug: affiliateProgram.slug,
          revisionId: affiliateProgram.revisionId,
          partnerReports: expect.arrayContaining([
            expect.objectContaining({
              id: "affiliate-partner-report-launch-circle",
              partnerId: "affiliate-partner-launch-circle",
              issue: 193,
            }),
          ]),
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
            expect.objectContaining({
              id: "payout-batch-indie-launch-may-preview",
              preparationId: "payout-preparation-indie-launch-may-preview",
              status: "review_required",
              issue: 195,
            }),
          ]),
        }),
      ]),
    );
    expect(payload.writeBoundary).toContain("Issue #109 can capture seeded referral clicks");
    expect(payload.writeBoundary).toContain("Issue #111 can attach validated referral click evidence");
    expect(payload.writeBoundary).toContain("Issue #113 can create review-only");
    expect(payload.writeBoundary).toContain("Issue #115 can apply owner-gated review");
    expect(payload.writeBoundary).toContain("Issue #193 exposes public-safe partner reports");
    expect(payload.writeBoundary).toContain("Issue #195 exposes read-only payout preparation");
    expect(payload.writeBoundary).toContain("Issue #273 lets verified owners record payout preparation evidence");
    expect(payload.writeBoundary).toContain("Issue #275 lets verified owners record fraud review evidence");
    expect(payload.writeBoundary).toContain("Issue #277 lets verified owners record partner notification readiness evidence");
    expect(payload.caveat).toContain("review-only commission ledger evidence");
    expect(payload.caveat).toContain("public-safe partner reports");
    expect(payload.caveat).toContain("read-only payout preparation");
    expect(payload.caveat).toContain("owner-confirmed payout preparation records");
    expect(payload.caveat).toContain("owner-reviewed fraud review evidence");
    expect(payload.caveat).toContain("owner-reviewed partner notification readiness evidence");

    await page.goto("/affiliates/indie-launch-partners");
    await expect(page.getByRole("heading", { name: /Indie launch partner program/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Partner links can connect privacy-safe clicks to checkout evidence/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Partner performance reporting stays aggregate-only/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Payout preparation stays read-only/i })).toBeVisible();
    await expect(page.getByText("Launch Circle public-safe performance report")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Payout preparation", exact: true })).toBeVisible();
    await expect(page.locator(".admin-pill").filter({ hasText: /^LAUNCHCIRCLE$/ })).toBeVisible();
    await expect(page.getByText("Possible self-referral")).toBeVisible();
    await signInOrCreateOwner(page);
    await page.goto("/admin/affiliates");
    await expect(page.getByRole("heading", { name: /Record affiliate payout preparation evidence without creating payouts/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record payout preparation/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Record affiliate fraud review evidence without enforcing fraud decisions/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record fraud review/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Record affiliate partner notification readiness without sending notifications/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record notification readiness/i })).toBeVisible();
  });

  test("owner affiliate payout preparation records require auth, confirmation, idempotency, stale evidence checks, and redaction", async ({
    page,
    request,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Owner affiliate payout preparation auth flow is covered once on desktop.");

    const suffix = Date.now();
    const privateNote = `Private affiliate payout prep note for m@rkmoriarty.com ${suffix}`;

    const sourceResponse = await request.get("/affiliates/source-data");
    expect(sourceResponse.ok(), await sourceResponse.text()).toBeTruthy();
    const sourcePayload = await sourceResponse.json();
    const evidence = sourcePayload.payoutPreparationRecords.currentEvidence;
    expect(evidence).toEqual(
      expect.objectContaining({
        programId: affiliateProgram.id,
        payoutPreparationId: "payout-preparation-indie-launch-may-preview",
        payoutBatchId: "payout-batch-indie-launch-may-preview",
        totalCommissionCents: 2700,
      }),
    );

    const idempotencyKey = `playwright-affiliate-payout-preparation-${suffix}`;
    const requestBody = {
      programId: affiliateProgram.id,
      payoutPreparationId: evidence.payoutPreparationId,
      payoutBatchId: evidence.payoutBatchId,
      expectedProgramRevisionId: affiliateProgram.revisionId,
      expectedPayoutBatchStatus: evidence.payoutBatchStatus,
      expectedEligibleLedgerCount: evidence.eligibleLedgerCount,
      expectedBlockedLedgerCount: evidence.blockedLedgerCount,
      expectedReversedLedgerCount: evidence.reversedLedgerCount,
      expectedTotalCommissionCents: evidence.totalCommissionCents,
      privateNote,
      confirmationText: affiliatePayoutPreparationRecordConfirmationText,
      idempotencyKey,
    };

    const unauthorizedGet = await request.get(affiliatePayoutPreparationRecordApiRoute);
    expect(unauthorizedGet.status()).toBe(401);
    await expect(unauthorizedGet.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "owner_session_required",
        redaction: expect.objectContaining({
          buyerDataIncluded: false,
          rawLedgerRowsIncluded: false,
          rawActorIdentityIncluded: false,
          payoutAccountIncluded: false,
          taxDataIncluded: false,
          stripeIdsIncluded: false,
          partnerNotificationIncluded: false,
        }),
      }),
    );

    const unauthorizedPost = await request.post(affiliatePayoutPreparationRecordApiRoute, { data: requestBody });
    expect(unauthorizedPost.status()).toBe(401);
    await expect(unauthorizedPost.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    await signInOrCreateOwner(page);

    const contractResponse = await page.request.get(affiliatePayoutPreparationRecordApiRoute);
    expect(contractResponse.ok(), await contractResponse.text()).toBeTruthy();
    await expect(contractResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: affiliatePayoutPreparationRecordStatus,
        route: affiliatePayoutPreparationRecordApiRoute,
        confirmation: expect.objectContaining({ text: affiliatePayoutPreparationRecordConfirmationText }),
        contract: expect.objectContaining({
          currentEvidence: expect.objectContaining({
            payoutPreparationId: evidence.payoutPreparationId,
            payoutBatchId: evidence.payoutBatchId,
          }),
          redaction: expect.objectContaining({
            buyerDataIncluded: false,
            rawLedgerRowsIncluded: false,
            privateNoteIncluded: false,
            payoutAccountIncluded: false,
            taxDataIncluded: false,
            stripeIdsIncluded: false,
          }),
        }),
      }),
    );

    const missingConfirmation = await page.request.post(affiliatePayoutPreparationRecordApiRoute, {
      data: {
        ...requestBody,
        confirmationText: "Prepare affiliate payout now",
        idempotencyKey: `${idempotencyKey}-missing`,
      },
    });
    expect(missingConfirmation.status()).toBe(400);
    await expect(missingConfirmation.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "confirmation_required" }),
    );

    const staleRevision = await page.request.post(affiliatePayoutPreparationRecordApiRoute, {
      data: {
        ...requestBody,
        expectedProgramRevisionId: "stale-affiliate-program-revision",
        idempotencyKey: `${idempotencyKey}-stale-revision`,
      },
    });
    expect(staleRevision.status()).toBe(409);
    await expect(staleRevision.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_program_revision",
        currentProgramRevisionId: affiliateProgram.revisionId,
      }),
    );

    const staleStatus = await page.request.post(affiliatePayoutPreparationRecordApiRoute, {
      data: {
        ...requestBody,
        expectedPayoutBatchStatus: "stale-payout-batch-status",
        idempotencyKey: `${idempotencyKey}-stale-status`,
      },
    });
    expect(staleStatus.status()).toBe(409);
    await expect(staleStatus.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_payout_batch_status",
        currentPayoutBatchStatus: evidence.payoutBatchStatus,
      }),
    );

    const staleEvidence = await page.request.post(affiliatePayoutPreparationRecordApiRoute, {
      data: {
        ...requestBody,
        expectedTotalCommissionCents: requestBody.expectedTotalCommissionCents + 1,
        idempotencyKey: `${idempotencyKey}-stale-evidence`,
      },
    });
    expect(staleEvidence.status()).toBe(409);
    await expect(staleEvidence.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "stale_payout_preparation_evidence" }),
    );

    const unsupportedPreparation = await page.request.post(affiliatePayoutPreparationRecordApiRoute, {
      data: {
        ...requestBody,
        payoutPreparationId: "payout-preparation-missing",
        idempotencyKey: `${idempotencyKey}-unsupported-preparation`,
      },
    });
    expect(unsupportedPreparation.status()).toBe(400);
    await expect(unsupportedPreparation.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_payout_preparation" }),
    );

    const created = await page.request.post(affiliatePayoutPreparationRecordApiRoute, { data: requestBody });
    expect(created.status(), await created.text()).toBe(201);
    const createdPayload = await created.json();
    expect(createdPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "affiliate_payout_preparation_recorded",
        duplicate: false,
        record: expect.objectContaining({
          programId: affiliateProgram.id,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          expectedPayoutBatchStatus: evidence.payoutBatchStatus,
          expectedEligibleLedgerCount: evidence.eligibleLedgerCount,
          expectedBlockedLedgerCount: evidence.blockedLedgerCount,
          expectedReversedLedgerCount: evidence.reversedLedgerCount,
          expectedTotalCommissionCents: evidence.totalCommissionCents,
          ownerPayoutPreparationRecordCreated: true,
          payableCommissionCreated: false,
          stripePayoutCreated: false,
          stripeTransferCreated: false,
          payoutAccountStored: false,
          taxDataCollected: false,
          partnerNotificationSent: false,
          fraudDecisionEnforced: false,
          buyerDataIncluded: false,
          rawLedgerRowsExposed: false,
          rawActorIdentityIncluded: false,
        }),
        redaction: expect.objectContaining({
          buyerDataIncluded: false,
          rawLedgerRowsIncluded: false,
          rawActorIdentityIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
          payoutAccountIncluded: false,
          taxDataIncluded: false,
          stripeIdsIncluded: false,
          partnerNotificationIncluded: false,
        }),
      }),
    );

    const replay = await page.request.post(affiliatePayoutPreparationRecordApiRoute, { data: requestBody });
    expect(replay.status(), await replay.text()).toBe(200);
    await expect(replay.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "affiliate_payout_preparation_replayed",
        duplicate: true,
        record: expect.objectContaining({ id: createdPayload.record.id }),
      }),
    );

    const conflict = await page.request.post(affiliatePayoutPreparationRecordApiRoute, {
      data: { ...requestBody, privateNote: `${privateNote} changed` },
    });
    expect(conflict.status()).toBe(409);
    await expect(conflict.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_conflict" }),
    );

    const sourceAfterRecord = await page.request.get("/affiliates/source-data");
    expect(sourceAfterRecord.ok(), await sourceAfterRecord.text()).toBeTruthy();
    const sourceAfterRecordPayload = await sourceAfterRecord.json();
    expect(sourceAfterRecordPayload.payoutPreparationRecords.counts.ownerConfirmedRecords).toBeGreaterThanOrEqual(1);
    expect(sourceAfterRecordPayload.payoutPreparationRecords.latestRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdPayload.record.id,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          payableCommissionCreated: false,
          stripePayoutCreated: false,
          payoutAccountStored: false,
          taxDataCollected: false,
          partnerNotificationSent: false,
          rawLedgerRowsExposed: false,
        }),
      ]),
    );
    const sourceText = JSON.stringify(sourceAfterRecordPayload.payoutPreparationRecords);
    expect(sourceText).not.toContain(privateNote);
    expect(sourceText).not.toContain("m@rkmoriarty.com");

    await page.goto("/admin/affiliates");
    await expect(page.getByRole("heading", { name: /Record affiliate payout preparation evidence without creating payouts/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record payout preparation/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: evidence.payoutBatchId }).first()).toBeVisible();
  });

  test("owner affiliate fraud review records require auth, confirmation, idempotency, stale evidence checks, and redaction", async ({
    page,
    request,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Owner affiliate fraud review auth flow is covered once on desktop.");

    const suffix = Date.now();
    const privateNote = `Private affiliate fraud review note for m@rkmoriarty.com ${suffix}`;

    const sourceResponse = await request.get("/affiliates/source-data");
    expect(sourceResponse.ok(), await sourceResponse.text()).toBeTruthy();
    const sourcePayload = await sourceResponse.json();
    const evidence = sourcePayload.fraudReviewRecords.currentEvidence;
    expect(evidence).toEqual(
      expect.objectContaining({
        programId: affiliateProgram.id,
        reviewFlagId: "review-flag-self-referral",
        payoutPreparationId: "payout-preparation-indie-launch-may-preview",
        payoutBatchId: "payout-batch-indie-launch-may-preview",
        reviewFlagSeverity: "high",
        linkedLedgerIds: expect.arrayContaining(["commission-ledger-self-referral-review"]),
      }),
    );

    const idempotencyKey = `playwright-affiliate-fraud-review-${suffix}`;
    const requestBody = {
      programId: affiliateProgram.id,
      reviewFlagId: evidence.reviewFlagId,
      payoutPreparationId: evidence.payoutPreparationId,
      payoutBatchId: evidence.payoutBatchId,
      reviewDisposition: evidence.defaultReviewDisposition,
      expectedProgramRevisionId: affiliateProgram.revisionId,
      expectedPayoutBatchStatus: evidence.payoutBatchStatus,
      expectedFlagSeverity: evidence.reviewFlagSeverity,
      expectedLinkedLedgerCount: evidence.linkedLedgerIds.length,
      privateNote,
      confirmationText: affiliateFraudReviewRecordConfirmationText,
      idempotencyKey,
    };

    const unauthorizedGet = await request.get(affiliateFraudReviewRecordApiRoute);
    expect(unauthorizedGet.status()).toBe(401);
    await expect(unauthorizedGet.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "owner_session_required",
        redaction: expect.objectContaining({
          buyerDataIncluded: false,
          rawLedgerRowsIncluded: false,
          rawClickRowsIncluded: false,
          rawCheckoutRowsIncluded: false,
          rawActorIdentityIncluded: false,
          privateFraudSignalsIncluded: false,
          payoutAccountIncluded: false,
          taxDataIncluded: false,
          stripeIdsIncluded: false,
          partnerNotificationIncluded: false,
        }),
      }),
    );

    const unauthorizedPost = await request.post(affiliateFraudReviewRecordApiRoute, { data: requestBody });
    expect(unauthorizedPost.status()).toBe(401);
    await expect(unauthorizedPost.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    await signInOrCreateOwner(page);

    const contractResponse = await page.request.get(affiliateFraudReviewRecordApiRoute);
    expect(contractResponse.ok(), await contractResponse.text()).toBeTruthy();
    await expect(contractResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: affiliateFraudReviewRecordStatus,
        route: affiliateFraudReviewRecordApiRoute,
        confirmation: expect.objectContaining({ text: affiliateFraudReviewRecordConfirmationText }),
        contract: expect.objectContaining({
          currentEvidence: expect.objectContaining({
            reviewFlagId: evidence.reviewFlagId,
            payoutPreparationId: evidence.payoutPreparationId,
            payoutBatchId: evidence.payoutBatchId,
          }),
          redaction: expect.objectContaining({
            buyerDataIncluded: false,
            rawLedgerRowsIncluded: false,
            rawClickRowsIncluded: false,
            rawCheckoutRowsIncluded: false,
            rawActorIdentityIncluded: false,
            privateFraudSignalsIncluded: false,
            privateNoteIncluded: false,
            payoutAccountIncluded: false,
            taxDataIncluded: false,
            stripeIdsIncluded: false,
          }),
        }),
      }),
    );

    const missingConfirmation = await page.request.post(affiliateFraudReviewRecordApiRoute, {
      data: {
        ...requestBody,
        confirmationText: "Enforce affiliate fraud decision now",
        idempotencyKey: `${idempotencyKey}-missing`,
      },
    });
    expect(missingConfirmation.status()).toBe(400);
    await expect(missingConfirmation.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "confirmation_required" }),
    );

    const staleRevision = await page.request.post(affiliateFraudReviewRecordApiRoute, {
      data: {
        ...requestBody,
        expectedProgramRevisionId: "stale-affiliate-program-revision",
        idempotencyKey: `${idempotencyKey}-stale-revision`,
      },
    });
    expect(staleRevision.status()).toBe(409);
    await expect(staleRevision.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_program_revision",
        currentProgramRevisionId: affiliateProgram.revisionId,
      }),
    );

    const staleStatus = await page.request.post(affiliateFraudReviewRecordApiRoute, {
      data: {
        ...requestBody,
        expectedPayoutBatchStatus: "stale-payout-batch-status",
        idempotencyKey: `${idempotencyKey}-stale-status`,
      },
    });
    expect(staleStatus.status()).toBe(409);
    await expect(staleStatus.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_payout_batch_status",
        currentPayoutBatchStatus: evidence.payoutBatchStatus,
      }),
    );

    const staleEvidence = await page.request.post(affiliateFraudReviewRecordApiRoute, {
      data: {
        ...requestBody,
        expectedLinkedLedgerCount: requestBody.expectedLinkedLedgerCount + 1,
        idempotencyKey: `${idempotencyKey}-stale-evidence`,
      },
    });
    expect(staleEvidence.status()).toBe(409);
    await expect(staleEvidence.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "stale_fraud_review_evidence" }),
    );

    const unsupportedReviewFlag = await page.request.post(affiliateFraudReviewRecordApiRoute, {
      data: {
        ...requestBody,
        reviewFlagId: "review-flag-missing",
        idempotencyKey: `${idempotencyKey}-unsupported-flag`,
      },
    });
    expect(unsupportedReviewFlag.status()).toBe(400);
    await expect(unsupportedReviewFlag.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_review_flag" }),
    );

    const unsupportedDisposition = await page.request.post(affiliateFraudReviewRecordApiRoute, {
      data: {
        ...requestBody,
        reviewDisposition: "approve_and_pay",
        idempotencyKey: `${idempotencyKey}-unsupported-disposition`,
      },
    });
    expect(unsupportedDisposition.status()).toBe(400);
    await expect(unsupportedDisposition.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_review_disposition" }),
    );

    const created = await page.request.post(affiliateFraudReviewRecordApiRoute, { data: requestBody });
    expect(created.status(), await created.text()).toBe(201);
    const createdPayload = await created.json();
    expect(createdPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "affiliate_fraud_review_recorded",
        duplicate: false,
        record: expect.objectContaining({
          programId: affiliateProgram.id,
          reviewFlagId: evidence.reviewFlagId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          reviewDisposition: evidence.defaultReviewDisposition,
          expectedPayoutBatchStatus: evidence.payoutBatchStatus,
          expectedFlagSeverity: evidence.reviewFlagSeverity,
          expectedLinkedLedgerCount: evidence.linkedLedgerIds.length,
          ownerFraudReviewRecordCreated: true,
          fraudDecisionEnforced: false,
          payableCommissionCreated: false,
          stripePayoutCreated: false,
          stripeTransferCreated: false,
          payoutAccountStored: false,
          taxDataCollected: false,
          partnerNotificationSent: false,
          buyerDataIncluded: false,
          rawLedgerRowsExposed: false,
          rawClickRowsExposed: false,
          rawCheckoutRowsExposed: false,
          rawActorIdentityIncluded: false,
          privateFraudSignalsIncluded: false,
        }),
        redaction: expect.objectContaining({
          buyerDataIncluded: false,
          rawLedgerRowsIncluded: false,
          rawClickRowsIncluded: false,
          rawCheckoutRowsIncluded: false,
          rawActorIdentityIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
          privateFraudSignalsIncluded: false,
          payoutAccountIncluded: false,
          taxDataIncluded: false,
          stripeIdsIncluded: false,
          partnerNotificationIncluded: false,
        }),
      }),
    );

    const replay = await page.request.post(affiliateFraudReviewRecordApiRoute, { data: requestBody });
    expect(replay.status(), await replay.text()).toBe(200);
    await expect(replay.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "affiliate_fraud_review_replayed",
        duplicate: true,
        record: expect.objectContaining({ id: createdPayload.record.id }),
      }),
    );

    const conflict = await page.request.post(affiliateFraudReviewRecordApiRoute, {
      data: { ...requestBody, privateNote: `${privateNote} changed` },
    });
    expect(conflict.status()).toBe(409);
    await expect(conflict.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_conflict" }),
    );

    const sourceAfterRecord = await page.request.get("/affiliates/source-data");
    expect(sourceAfterRecord.ok(), await sourceAfterRecord.text()).toBeTruthy();
    const sourceAfterRecordPayload = await sourceAfterRecord.json();
    expect(sourceAfterRecordPayload.fraudReviewRecords.counts.ownerConfirmedRecords).toBeGreaterThanOrEqual(1);
    expect(sourceAfterRecordPayload.fraudReviewRecords.latestRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdPayload.record.id,
          reviewFlagId: evidence.reviewFlagId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          fraudDecisionEnforced: false,
          payableCommissionCreated: false,
          stripePayoutCreated: false,
          payoutAccountStored: false,
          taxDataCollected: false,
          partnerNotificationSent: false,
          rawLedgerRowsExposed: false,
          rawClickRowsExposed: false,
          rawCheckoutRowsExposed: false,
          privateFraudSignalsIncluded: false,
        }),
      ]),
    );
    const sourceText = JSON.stringify(sourceAfterRecordPayload.fraudReviewRecords);
    expect(sourceText).not.toContain(privateNote);
    expect(sourceText).not.toContain("m@rkmoriarty.com");

    await page.goto("/admin/affiliates");
    await expect(page.getByRole("heading", { name: /Record affiliate fraud review evidence without enforcing fraud decisions/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record fraud review/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: evidence.reviewFlagId }).first()).toBeVisible();
  });

  test("owner affiliate partner notification readiness records require auth, confirmation, idempotency, stale evidence checks, and redaction", async ({
    page,
    request,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Owner affiliate partner notification readiness auth flow is covered once on desktop.",
    );

    const suffix = Date.now();
    const privateNote = `Private affiliate partner notification readiness note for m@rkmoriarty.com ${suffix}`;

    const sourceResponse = await request.get("/affiliates/source-data");
    expect(sourceResponse.ok(), await sourceResponse.text()).toBeTruthy();
    const sourcePayload = await sourceResponse.json();
    const evidence = sourcePayload.partnerNotificationReadinessRecords.currentEvidence;
    expect(evidence).toEqual(
      expect.objectContaining({
        programId: affiliateProgram.id,
        affiliatePartnerReportId: "affiliate-partner-report-launch-circle",
        affiliatePartnerId: "affiliate-partner-launch-circle",
        payoutPreparationId: "payout-preparation-indie-launch-may-preview",
        payoutBatchId: "payout-batch-indie-launch-may-preview",
        reviewFlagId: "review-flag-self-referral",
        payoutPreparationRecordStatus: affiliatePayoutPreparationRecordStatus,
        fraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
        notificationChannel: "email",
      }),
    );

    const idempotencyKey = `playwright-affiliate-partner-notification-readiness-${suffix}`;
    const requestBody = {
      programId: affiliateProgram.id,
      affiliatePartnerReportId: evidence.affiliatePartnerReportId,
      affiliatePartnerId: evidence.affiliatePartnerId,
      payoutPreparationId: evidence.payoutPreparationId,
      payoutBatchId: evidence.payoutBatchId,
      reviewFlagId: evidence.reviewFlagId,
      notificationReadinessDisposition: evidence.defaultNotificationReadinessDisposition,
      expectedProgramRevisionId: affiliateProgram.revisionId,
      expectedPartnerReportStatus: evidence.partnerReportStatus,
      expectedPayoutBatchStatus: evidence.payoutBatchStatus,
      expectedPayoutPreparationRecordStatus: evidence.payoutPreparationRecordStatus,
      expectedFraudReviewRecordStatus: evidence.fraudReviewRecordStatus,
      expectedReviewFlagSeverity: evidence.reviewFlagSeverity,
      expectedLinkedLedgerCount: evidence.linkedLedgerIds.length,
      privateNote,
      confirmationText: affiliatePartnerNotificationReadinessRecordConfirmationText,
      idempotencyKey,
    };

    const unauthorizedGet = await request.get(affiliatePartnerNotificationReadinessRecordApiRoute);
    expect(unauthorizedGet.status()).toBe(401);
    await expect(unauthorizedGet.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "owner_session_required",
        redaction: expect.objectContaining({
          recipientEmailIncluded: false,
          notificationBodyIncluded: false,
          providerMessageIdIncluded: false,
          sendQueueRowsIncluded: false,
          buyerDataIncluded: false,
          rawLedgerRowsIncluded: false,
          rawClickRowsIncluded: false,
          rawCheckoutRowsIncluded: false,
          rawActorIdentityIncluded: false,
          privateFraudSignalsIncluded: false,
          payoutAccountIncluded: false,
          taxDataIncluded: false,
          stripeIdsIncluded: false,
          partnerNotificationIncluded: false,
        }),
      }),
    );

    const unauthorizedPost = await request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: requestBody,
    });
    expect(unauthorizedPost.status()).toBe(401);
    await expect(unauthorizedPost.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "owner_session_required" }),
    );

    await signInOrCreateOwner(page);

    const contractResponse = await page.request.get(affiliatePartnerNotificationReadinessRecordApiRoute);
    expect(contractResponse.ok(), await contractResponse.text()).toBeTruthy();
    await expect(contractResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: affiliatePartnerNotificationReadinessRecordStatus,
        route: affiliatePartnerNotificationReadinessRecordApiRoute,
        confirmation: expect.objectContaining({ text: affiliatePartnerNotificationReadinessRecordConfirmationText }),
        contract: expect.objectContaining({
          currentEvidence: expect.objectContaining({
            affiliatePartnerReportId: evidence.affiliatePartnerReportId,
            payoutPreparationId: evidence.payoutPreparationId,
            payoutBatchId: evidence.payoutBatchId,
            reviewFlagId: evidence.reviewFlagId,
          }),
          redaction: expect.objectContaining({
            recipientEmailIncluded: false,
            notificationBodyIncluded: false,
            providerMessageIdIncluded: false,
            sendQueueRowsIncluded: false,
            buyerDataIncluded: false,
            rawLedgerRowsIncluded: false,
            rawClickRowsIncluded: false,
            rawCheckoutRowsIncluded: false,
            rawActorIdentityIncluded: false,
            privateFraudSignalsIncluded: false,
            privateNoteIncluded: false,
            payoutAccountIncluded: false,
            taxDataIncluded: false,
            stripeIdsIncluded: false,
          }),
        }),
      }),
    );

    const missingConfirmation = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        confirmationText: "Send affiliate partner notification now",
        idempotencyKey: `${idempotencyKey}-missing`,
      },
    });
    expect(missingConfirmation.status()).toBe(400);
    await expect(missingConfirmation.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "confirmation_required" }),
    );

    const staleRevision = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        expectedProgramRevisionId: "stale-affiliate-program-revision",
        idempotencyKey: `${idempotencyKey}-stale-revision`,
      },
    });
    expect(staleRevision.status()).toBe(409);
    await expect(staleRevision.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_program_revision",
        currentProgramRevisionId: affiliateProgram.revisionId,
      }),
    );

    const stalePartnerReport = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        expectedPartnerReportStatus: "stale-report-status",
        idempotencyKey: `${idempotencyKey}-stale-report`,
      },
    });
    expect(stalePartnerReport.status()).toBe(409);
    await expect(stalePartnerReport.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_partner_report_status",
        currentPartnerReportStatus: evidence.partnerReportStatus,
      }),
    );

    const stalePayoutBatch = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        expectedPayoutBatchStatus: "stale-payout-batch-status",
        idempotencyKey: `${idempotencyKey}-stale-batch`,
      },
    });
    expect(stalePayoutBatch.status()).toBe(409);
    await expect(stalePayoutBatch.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_payout_batch_status",
        currentPayoutBatchStatus: evidence.payoutBatchStatus,
      }),
    );

    const stalePayoutRecordStatus = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        expectedPayoutPreparationRecordStatus: "stale-payout-preparation-record-status",
        idempotencyKey: `${idempotencyKey}-stale-payout-record`,
      },
    });
    expect(stalePayoutRecordStatus.status()).toBe(409);
    await expect(stalePayoutRecordStatus.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_payout_preparation_record_status",
        currentPayoutPreparationRecordStatus: affiliatePayoutPreparationRecordStatus,
      }),
    );

    const staleFraudRecordStatus = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        expectedFraudReviewRecordStatus: "stale-fraud-review-record-status",
        idempotencyKey: `${idempotencyKey}-stale-fraud-record`,
      },
    });
    expect(staleFraudRecordStatus.status()).toBe(409);
    await expect(staleFraudRecordStatus.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_fraud_review_record_status",
        currentFraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
      }),
    );

    const staleFraudEvidence = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        expectedLinkedLedgerCount: requestBody.expectedLinkedLedgerCount + 1,
        idempotencyKey: `${idempotencyKey}-stale-fraud-evidence`,
      },
    });
    expect(staleFraudEvidence.status()).toBe(409);
    await expect(staleFraudEvidence.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "stale_fraud_review_evidence" }),
    );

    const unsupportedReport = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        affiliatePartnerReportId: "affiliate-partner-report-missing",
        idempotencyKey: `${idempotencyKey}-unsupported-report`,
      },
    });
    expect(unsupportedReport.status()).toBe(400);
    await expect(unsupportedReport.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_partner_report" }),
    );

    const unsupportedPartner = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        affiliatePartnerId: "affiliate-partner-missing",
        idempotencyKey: `${idempotencyKey}-unsupported-partner`,
      },
    });
    expect(unsupportedPartner.status()).toBe(400);
    await expect(unsupportedPartner.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_affiliate_partner" }),
    );

    const unsupportedDisposition = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: {
        ...requestBody,
        notificationReadinessDisposition: "send_now",
        idempotencyKey: `${idempotencyKey}-unsupported-disposition`,
      },
    });
    expect(unsupportedDisposition.status()).toBe(400);
    await expect(unsupportedDisposition.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "unsupported_notification_readiness_disposition" }),
    );

    const created = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: requestBody,
    });
    expect(created.status(), await created.text()).toBe(201);
    const createdPayload = await created.json();
    expect(createdPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "affiliate_partner_notification_readiness_recorded",
        duplicate: false,
        record: expect.objectContaining({
          programId: affiliateProgram.id,
          affiliatePartnerReportId: evidence.affiliatePartnerReportId,
          affiliatePartnerId: evidence.affiliatePartnerId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          reviewFlagId: evidence.reviewFlagId,
          notificationReadinessDisposition: evidence.defaultNotificationReadinessDisposition,
          expectedPartnerReportStatus: evidence.partnerReportStatus,
          expectedPayoutBatchStatus: evidence.payoutBatchStatus,
          expectedPayoutPreparationRecordStatus: affiliatePayoutPreparationRecordStatus,
          expectedFraudReviewRecordStatus: affiliateFraudReviewRecordStatus,
          expectedReviewFlagSeverity: evidence.reviewFlagSeverity,
          expectedLinkedLedgerCount: evidence.linkedLedgerIds.length,
          ownerPartnerNotificationReadinessRecordCreated: true,
          partnerNotificationSent: false,
          notificationProviderCalled: false,
          queueDispatchCreated: false,
          notificationBodyIncluded: false,
          recipientEmailIncluded: false,
          providerMessageIdIncluded: false,
          sendQueueRowsIncluded: false,
          payableCommissionCreated: false,
          fraudDecisionEnforced: false,
          stripePayoutCreated: false,
          stripeTransferCreated: false,
          payoutAccountStored: false,
          taxDataCollected: false,
          buyerDataIncluded: false,
          rawLedgerRowsExposed: false,
          rawClickRowsExposed: false,
          rawCheckoutRowsExposed: false,
          rawActorIdentityIncluded: false,
          privateFraudSignalsIncluded: false,
        }),
        redaction: expect.objectContaining({
          recipientEmailIncluded: false,
          notificationBodyIncluded: false,
          providerMessageIdIncluded: false,
          sendQueueRowsIncluded: false,
          actorEmailIncluded: false,
          actorEmailHashIncluded: false,
          privateNoteIncluded: false,
          buyerDataIncluded: false,
          rawLedgerRowsIncluded: false,
          rawClickRowsIncluded: false,
          rawCheckoutRowsIncluded: false,
          rawActorIdentityIncluded: false,
          privateFraudSignalsIncluded: false,
          payoutAccountIncluded: false,
          taxDataIncluded: false,
          stripeIdsIncluded: false,
          partnerNotificationIncluded: false,
        }),
      }),
    );

    const replay = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: requestBody,
    });
    expect(replay.status(), await replay.text()).toBe(200);
    await expect(replay.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        status: "affiliate_partner_notification_readiness_replayed",
        duplicate: true,
        record: expect.objectContaining({ id: createdPayload.record.id }),
      }),
    );

    const conflict = await page.request.post(affiliatePartnerNotificationReadinessRecordApiRoute, {
      data: { ...requestBody, privateNote: `${privateNote} changed` },
    });
    expect(conflict.status()).toBe(409);
    await expect(conflict.json()).resolves.toEqual(
      expect.objectContaining({ ok: false, code: "idempotency_conflict" }),
    );

    const sourceAfterRecord = await page.request.get("/affiliates/source-data");
    expect(sourceAfterRecord.ok(), await sourceAfterRecord.text()).toBeTruthy();
    const sourceAfterRecordPayload = await sourceAfterRecord.json();
    expect(sourceAfterRecordPayload.partnerNotificationReadinessRecords.counts.ownerConfirmedRecords).toBeGreaterThanOrEqual(1);
    expect(sourceAfterRecordPayload.partnerNotificationReadinessRecords.latestRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdPayload.record.id,
          affiliatePartnerReportId: evidence.affiliatePartnerReportId,
          payoutPreparationId: evidence.payoutPreparationId,
          payoutBatchId: evidence.payoutBatchId,
          reviewFlagId: evidence.reviewFlagId,
          partnerNotificationSent: false,
          notificationProviderCalled: false,
          queueDispatchCreated: false,
          notificationBodyIncluded: false,
          recipientEmailIncluded: false,
          providerMessageIdIncluded: false,
          sendQueueRowsIncluded: false,
          fraudDecisionEnforced: false,
          payableCommissionCreated: false,
          stripePayoutCreated: false,
          payoutAccountStored: false,
          taxDataCollected: false,
          rawLedgerRowsExposed: false,
          rawClickRowsExposed: false,
          rawCheckoutRowsExposed: false,
          privateFraudSignalsIncluded: false,
        }),
      ]),
    );
    const sourceText = JSON.stringify(sourceAfterRecordPayload.partnerNotificationReadinessRecords);
    expect(sourceText).not.toContain(privateNote);
    expect(sourceText).not.toContain("m@rkmoriarty.com");

    await page.goto("/admin/affiliates");
    await expect(page.getByRole("heading", { name: /Record affiliate partner notification readiness without sending notifications/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record notification readiness/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: evidence.affiliatePartnerReportId }).first()).toBeVisible();
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
        expect.objectContaining({ id: "roadmap-paid-publisher-subdomains", status: "shipped", issue: 222 }),
        expect.objectContaining({ id: "roadmap-custom-domain-onboarding", status: "shipped", issue: 223 }),
        expect.objectContaining({ id: "roadmap-cross-subdomain-customer-auth", status: "shipped", issue: 224 }),
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
          id: "journey-prospect-explores-launch-marketing",
          featureId: "feature-public-feature-catalog",
          issueNumbers: expect.arrayContaining([217, 226, 234]),
          proof: expect.objectContaining({
            status: "passed",
            lastTestedAt: expect.any(String),
            ciLinks: expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining("/actions/runs/26168608279") }),
            ]),
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-226-features.png" }),
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-226-order-bump.png" }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-prospect-reviews-launch-pricing",
          featureId: "feature-resources-use-cases-pricing",
          issueNumbers: expect.arrayContaining([217, 226, 234]),
          proof: expect.objectContaining({
            status: "passed",
            ciLinks: expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining("/actions/runs/26168608279") }),
            ]),
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-226-pricing.png" }),
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-226-account-setup.png" }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-publisher-reserves-bumpgrade-subdomain",
          featureId: "feature-better-auth",
          issueNumbers: expect.arrayContaining([221, 222]),
          proof: expect.objectContaining({
            status: "passed",
            lastTestedAt: expect.any(String),
            ciLinks: expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining("/actions/runs/26160043319") }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-publisher-connects-custom-domain",
          featureId: "feature-better-auth",
          issueNumbers: expect.arrayContaining([221, 222, 223]),
          proof: expect.objectContaining({
            status: "passed",
            lastTestedAt: expect.any(String),
            ciLinks: expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining("/actions/runs/26166024751") }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-customer-uses-one-login-across-bumpgrade-subdomains",
          featureId: "feature-better-auth",
          issueNumbers: expect.arrayContaining([221, 222, 223, 224]),
          proof: expect.objectContaining({
            status: "passed",
            lastTestedAt: expect.any(String),
            ciLinks: expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining("/actions/runs/26164091138") }),
            ]),
            notes: expect.arrayContaining([
              expect.stringContaining("screenshot was not attached"),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-publisher-plans-first-checkout",
          featureId: "feature-stripe-commerce",
          issueNumbers: expect.arrayContaining([11, 34, 15, 16, 81, 99, 101, 111, 113, 115, 117]),
        }),
        expect.objectContaining({
          id: "journey-buyer-chooses-post-purchase-offer",
          featureId: "feature-checkout-offers",
          issueNumbers: [15, 99, 117],
        }),
        expect.objectContaining({
          id: "journey-publisher-previews-product-access",
          featureId: "feature-products-access",
          issueNumbers: [16, 83, 101, 139, 141, 143, 146, 147, 151, 179, 181, 185, 187, 251],
        }),
        expect.objectContaining({
          id: "journey-publisher-verifies-sandbox-entitlement-grant",
          featureId: "feature-products-access",
          issueNumbers: [16, 83, 99, 101, 139, 141, 143, 146, 147, 151, 179, 181, 185, 187, 251],
        }),
        expect.objectContaining({
          id: "journey-publisher-checks-mobile-admin",
          featureId: "feature-mobile-admin",
          issueNumbers: [13, 67, 68, 153, 155, 157],
        }),
        expect.objectContaining({
          id: "journey-publisher-previews-audience-automation",
          featureId: "feature-email-automation-crm",
          issueNumbers: [
            17, 85, 103, 137, 167, 169, 171, 173, 175, 177, 183, 189, 191, 197, 199, 201, 203, 205, 207, 209,
            211, 253, 259,
          ],
        }),
        expect.objectContaining({
          id: "journey-visitor-joins-indie-launch-waitlist",
          featureId: "feature-email-automation-crm",
          issueNumbers: [17, 85, 103, 167],
        }),
        expect.objectContaining({
          id: "journey-publisher-previews-analytics-experiments",
          featureId: "feature-analytics-testing",
          issueNumbers: [18, 87, 105, 107, 119, 121, 123, 125, 127, 129, 261, 263, 265, 267, 269, 271],
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
          issueNumbers: [19, 89, 109, 111, 113, 115, 193, 195, 273, 275, 277],
        }),
        expect.objectContaining({
          id: "journey-publisher-reads-affiliate-partner-reports",
          featureId: "feature-affiliates-referrals",
          issueNumbers: [19, 193],
        }),
        expect.objectContaining({
          id: "journey-publisher-prepares-affiliate-payout-batch",
          featureId: "feature-affiliates-referrals",
          issueNumbers: [19, 113, 115, 193, 195, 273, 275, 277],
        }),
        expect.objectContaining({
          id: "journey-owner-reviews-affiliate-fraud-flag",
          featureId: "feature-affiliates-referrals",
          issueNumbers: [19, 113, 115, 193, 195, 273, 275],
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
        expect.objectContaining({
          id: "journey-owner-prepares-affiliate-partner-notification-readiness",
          featureId: "feature-affiliates-referrals",
          issueNumbers: expect.arrayContaining([19, 277]),
        }),
      ]),
    );
  });

  test("admin user journeys source data exposes launch proof summary", async ({ request }) => {
    const response = await request.get("/admin/user-journeys/source-data");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.id).toBe("bumpgrade-admin-user-journeys-source-data");
    expect(["d1", "fixture", "mixed"]).toContain(payload.source);
    expect(payload.proofSummary).toEqual(
      expect.objectContaining({
        totalJourneys: expect.any(Number),
        testedJourneys: expect.any(Number),
        partialJourneys: expect.any(Number),
        screenshotLinks: expect.any(Number),
        ciLinks: expect.any(Number),
        latestTestedAt: expect.any(String),
      }),
    );
    expect(payload.proofSummary.totalJourneys).toBe(payload.journeys.length);
    expect(payload.proofSummary.testedJourneys).toBe(payload.journeys.length);
    expect(payload.proofSummary.partialJourneys).toBe(0);
    expect(payload.proofSummary.blockedJourneys).toBe(0);
    expect(payload.proofSummary.notRunJourneys).toBe(0);
    expect(payload.proofSummary.screenshotLinks).toBeGreaterThan(0);
    expect(payload.proofSummary.ciLinks).toBeGreaterThan(0);
    for (const journey of payload.journeys) {
      expect(journey.proof, journey.id).toEqual(
        expect.objectContaining({
          status: "passed",
          lastTestedAt: expect.any(String),
        }),
      );
      expect(journey.proof.notes, journey.id).not.toEqual(
        expect.arrayContaining([expect.stringContaining("Default proof is attached")]),
      );
    }
    expect(payload.journeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "journey-prospect-explores-launch-marketing",
          proof: expect.objectContaining({
            lastTestedAt: expect.any(String),
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-226-homepage.png" }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-compare-bumpgrade-to-clickfunnels",
          proof: expect.objectContaining({
            status: "passed",
            ciLinks: expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining("/actions/runs/26175118817") }),
            ]),
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-242-compare.png" }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-mark-reviews-nonblocking-attention",
          proof: expect.objectContaining({
            status: "passed",
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-73-for-mark-response-channels.png" }),
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-240-user-journeys-proof-matrix.png" }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-owner-opens-protected-admin",
          proof: expect.objectContaining({
            status: "passed",
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-9-admin-signed-in-desktop.png" }),
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-97-auth-aware-nav-for-mark.png" }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-agent-reads-bumpgrade-manifest",
          proof: expect.objectContaining({
            status: "passed",
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-12-agent-docs-index-desktop.png" }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-publisher-checks-mobile-admin",
          proof: expect.objectContaining({
            status: "passed",
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-157-ios-live-dashboard-hydration.png" }),
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-157-android-live-dashboard-hydration.png" }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-prospect-evaluates-content-surfaces",
          proof: expect.objectContaining({
            status: "passed",
            ciLinks: expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining("/actions/runs/26175118817") }),
            ]),
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-242-users.png" }),
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-242-resources.png" }),
            ]),
          }),
        }),
        expect.objectContaining({
          id: "journey-publisher-plans-first-checkout",
          proof: expect.objectContaining({
            status: "passed",
            ciLinks: expect.arrayContaining([
              expect.objectContaining({ url: expect.stringContaining("/actions/runs/26176981405") }),
            ]),
            screenshotLinks: expect.arrayContaining([
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-99-checkout-order-bump-start.png" }),
              expect.objectContaining({ url: "https://bumpgrade.com/pr-screenshots/issue-133-checkout-success-desktop.png" }),
            ]),
          }),
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
        expect.objectContaining({ table: "product_protected_content_sections" }),
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
        expect.objectContaining({ id: "mcp-tool-create-product-revocation-intent", status: "planned" }),
        expect.objectContaining({ id: "mcp-resource-mobile-admin-dashboard", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-resource-audience-automation", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-tool-create-audience-import-intent", status: "planned" }),
        expect.objectContaining({ id: "mcp-tool-create-audience-import-preflight", status: "planned" }),
        expect.objectContaining({ id: "mcp-resource-analytics-experiments", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-resource-analytics-report-exports", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-resource-analytics-alert-reviews", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-resource-analytics-notification-readiness", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-resource-analytics-notification-inbox-records", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-tool-create-analytics-experiment-decision", status: "planned" }),
        expect.objectContaining({ id: "mcp-tool-create-analytics-notification-inbox-record", status: "planned" }),
        expect.objectContaining({ id: "mcp-resource-affiliate-referrals", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-tool-create-affiliate-payout-preparation-record", status: "planned" }),
        expect.objectContaining({ id: "mcp-tool-create-affiliate-fraud-review-record", status: "planned" }),
        expect.objectContaining({ id: "mcp-tool-create-affiliate-partner-notification-readiness-record", status: "planned" }),
        expect.objectContaining({ id: "mcp-resource-publisher-account", status: "ready-contract" }),
        expect.objectContaining({ id: "mcp-tool-create-funnel-draft", status: "planned" }),
        expect.objectContaining({ id: "mcp-tool-duplicate-funnel-draft", status: "planned" }),
        expect.objectContaining({ id: "mcp-tool-propose-update", status: "planned" }),
      ]),
    );
    expect(payload.readContracts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "read-feature-catalog", route: "/features/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-admin-source", route: "/admin/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-agent-manifest", route: "/agent-docs/source-data", auth: "public" }),
        expect.objectContaining({ id: "read-content-surfaces", route: "/content/source-data", auth: "public" }),
        expect.objectContaining({
          id: "read-publisher-account-setup",
          route: "/account/source-data",
          auth: "public",
          stableIds: expect.arrayContaining([
            "publisherTenantId",
            "publisherSubdomainReservationId",
            "publisherCustomDomainId",
            "publisherAuthBoundaryId",
          ]),
          safeForAgents: expect.arrayContaining([
            "Read cross-subdomain auth configuration and custom-domain login boundary",
            "Distinguish Bumpgrade subdomains, existing custom domains, and the current no-domain-purchase policy",
          ]),
          writeBoundary: expect.stringContaining("does not sell, register, renew, transfer, or price domains today"),
        }),
        expect.objectContaining({
          id: "read-funnel-contract",
          route: "/funnels/source-data",
          auth: "public",
          stableIds: expect.arrayContaining(["funnelWebinarResourceTemplateId", "funnelDraftDuplicateId"]),
          safeForAgents: expect.arrayContaining([
            "Discover webinar and resource page-shape templates from issue #213",
            "Discover owner-session private draft duplication from issue #215",
          ]),
        }),
        expect.objectContaining({
          id: "read-admin-draft-funnels",
          route: "/admin/funnels",
          auth: "owner-session",
          stableIds: expect.arrayContaining(["funnelDraftDuplicateId"]),
        }),
        expect.objectContaining({ id: "read-checkout-offer-stack", route: "/offers/source-data", auth: "public" }),
        expect.objectContaining({
          id: "read-product-access-catalog",
          route: "/products/source-data",
          auth: "public",
          stableIds: expect.arrayContaining([
            "productEntitlementRevocationIntentId",
            "productProtectedContentId",
            "subscriptionMembershipAccessId",
          ]),
          safeForAgents: expect.arrayContaining([
            "Inspect owner-confirmed non-destructive revocation intent records",
            "Inspect protected content readiness and the checkout-intent-scoped protected fixture delivery boundary",
            "Inspect subscription-backed membership access state from trusted Stripe Billing webhook evidence",
          ]),
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
        expect.objectContaining({
          id: "read-protected-product-content",
          route: productProtectedContentDeliveryApiRoute,
          auth: "public",
        }),
        expect.objectContaining({
          id: "read-subscription-membership-access",
          route: "/products/source-data",
          auth: "public",
          stableIds: expect.arrayContaining(["subscriptionMembershipAccessId", "subscriptionPlanId"]),
        }),
        expect.objectContaining({ id: "read-admin-product-entitlements", route: "/admin/products", auth: "owner-session" }),
        expect.objectContaining({
          id: "create-owner-product-asset-upload-intent",
          route: "/api/admin/products/assets",
          auth: "owner-session",
        }),
        expect.objectContaining({
          id: "create-owner-product-revocation-intent",
          route: productEntitlementRevocationIntentApiRoute,
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
            "broadcastDeliveryBatchId",
            "broadcastDeliveryQueueMessageId",
            "broadcastDispatchPreflightId",
            "broadcastDispatchAttemptId",
            "broadcastSenderDomainReadinessId",
            "broadcastProviderEventReadinessId",
            "broadcastProviderRateLimitReadinessId",
            "broadcastProviderResponseReadinessId",
            "broadcastSendPayloadReadinessId",
            "broadcastQueueProducerReadinessId",
            "broadcastQueueConsumerReadinessId",
            "audienceImportIntentId",
            "audienceImportPreflightId",
          ]),
          safeForAgents: expect.arrayContaining([
            "Inspect suppression-aware broadcast readiness without recipient exposure",
            "Inspect public-safe dry-run broadcast schedule intent counts without actor email or recipient payloads",
            "Inspect broadcast preview and unsubscribe-footer safety without personalized body or recipient exposure",
            "Inspect delivery queue readiness without recipient payloads, queue rows, or provider sends",
            "Inspect delivery-batch dry runs without recipient payloads, queue messages, or provider sends",
            "Inspect delivery queue message dry runs without Cloudflare Queue dispatch, recipient payloads, or provider sends",
            "Inspect dispatch preflight dry runs without Cloudflare Queue dispatch, recipient payloads, or provider sends",
            "Inspect dispatch attempt receipts without Cloudflare Queue producers, queue payload bodies, provider responses, or provider sends",
            "Inspect sender-domain readiness without private DNS credentials, raw DNS records, provider secrets, or provider sends",
            "Inspect provider-event readiness without provider secrets, raw provider payloads, provider responses, or provider message IDs",
            "Inspect provider rate-limit readiness without provider secrets, provider limit secrets, raw provider payloads, provider responses, or provider message IDs",
            "Inspect provider response readiness without provider secrets, raw response bodies, provider responses, or provider message IDs",
            "Inspect send-payload readiness without recipient payloads, personalized bodies, raw payload bodies, queue producers, or provider sends",
            "Inspect Queue producer readiness without Queue messages, queue payload bodies, recipient payloads, or provider sends",
            "Inspect Queue consumer readiness without Queue message consumption, acks, retry/dead-letter rows, queue payload body reads, recipient payloads, or provider sends",
            "Inspect owner-confirmed import intents without raw contact rows, raw emails, actor emails, private notes, sequence enrollments, or sends",
            "Inspect owner-confirmed import preflights without raw contact rows, raw emails, subscriber writes, exports, actor emails, private notes, sequence enrollments, or sends",
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
          id: "create-owner-audience-import-intent",
          route: audienceImportIntentApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining(["audienceImportIntentId", "workspaceId", "idempotencyKey"]),
        }),
        expect.objectContaining({
          id: "create-owner-audience-import-preflight",
          route: audienceImportPreflightApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining(["audienceImportPreflightId", "audienceImportIntentId", "workspaceId", "idempotencyKey"]),
        }),
        expect.objectContaining({
          id: "create-owner-broadcast-schedule-intent",
          route: audienceBroadcastScheduleIntentApiRoute,
          auth: "owner-session",
        }),
        expect.objectContaining({
          id: "create-owner-broadcast-delivery-batch",
          route: audienceBroadcastDeliveryBatchApiRoute,
          auth: "owner-session",
        }),
        expect.objectContaining({
          id: "create-owner-broadcast-delivery-queue-messages",
          route: audienceBroadcastDeliveryQueueMessageApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining(["broadcastDeliveryQueueMessageId", "broadcastDeliveryBatchId"]),
        }),
        expect.objectContaining({
          id: "create-owner-broadcast-dispatch-preflight",
          route: audienceBroadcastDispatchPreflightApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining(["broadcastDispatchPreflightId", "broadcastDeliveryQueueMessageId"]),
        }),
        expect.objectContaining({
          id: "create-owner-broadcast-dispatch-attempt",
          route: audienceBroadcastDispatchAttemptApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining(["broadcastDispatchAttemptId", "broadcastDispatchPreflightId"]),
        }),
        expect.objectContaining({
          id: "read-admin-audience-subscribers",
          route: "/admin/audience",
          auth: "owner-session",
          stableIds: expect.arrayContaining(["audienceImportIntentId", "audienceImportPreflightId"]),
        }),
        expect.objectContaining({ id: "read-analytics-experiments", route: "/analytics/source-data", auth: "public" }),
        expect.objectContaining({
          id: "create-owner-analytics-experiment-decision",
          route: analyticsExperimentDecisionApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining(["analyticsExperimentDecisionId", "analyticsTimeWindow", "idempotencyKey"]),
        }),
        expect.objectContaining({
          id: "create-owner-analytics-notification-inbox-record",
          route: analyticsNotificationInboxApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining(["analyticsNotificationInboxRecordId", "analyticsNotificationReadinessId", "analyticsTimeWindow", "idempotencyKey"]),
        }),
        expect.objectContaining({
          id: "read-affiliate-referrals",
          route: "/affiliates/source-data",
          auth: "public",
          stableIds: expect.arrayContaining([
            "payoutPreparationRecordId",
            "payoutPreparationRecordStatus",
            "fraudReviewRecordId",
            "fraudReviewRecordStatus",
            "partnerNotificationReadinessRecordId",
            "partnerNotificationReadinessRecordStatus",
          ]),
        }),
        expect.objectContaining({
          id: "create-owner-affiliate-payout-preparation-record",
          route: affiliatePayoutPreparationRecordApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining(["payoutPreparationRecordId", "payoutPreparationId", "payoutBatchId", "idempotencyKey"]),
        }),
        expect.objectContaining({
          id: "create-owner-affiliate-fraud-review-record",
          route: affiliateFraudReviewRecordApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining(["fraudReviewRecordId", "reviewFlagId", "payoutPreparationId", "payoutBatchId", "idempotencyKey"]),
        }),
        expect.objectContaining({
          id: "create-owner-affiliate-partner-notification-readiness-record",
          route: affiliatePartnerNotificationReadinessRecordApiRoute,
          auth: "owner-session",
          stableIds: expect.arrayContaining([
            "partnerNotificationReadinessRecordId",
            "affiliatePartnerReportId",
            "payoutPreparationId",
            "payoutBatchId",
            "reviewFlagId",
            "idempotencyKey",
          ]),
        }),
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
            "analyticsExperimentDecisionId",
            "analyticsReportExportId",
            "analyticsReportExportSectionId",
            "analyticsCohortFixtureId",
            "analyticsCohortComparisonId",
            "analyticsCohortReviewId",
            "analyticsCohortReviewStatus",
            "analyticsAlertThresholdId",
            "analyticsAnomalyReviewId",
            "analyticsAnomalyReviewStatus",
            "analyticsNotificationReadinessId",
            "analyticsNotificationChannelId",
            "analyticsNotificationReadinessStatus",
            "analyticsNotificationInboxRecordId",
            "analyticsNotificationInboxStatus",
            "analyticsFunnelConversionReportId",
            "analyticsPageViewBeaconId",
          ]),
          safeForAgents: expect.arrayContaining([
            "Inspect owner-confirmed experiment decision evidence without raw event rows or raw assignment rows",
            "Inspect aggregate report export sections without raw analytics downloads",
            "Inspect owner-reviewed cohort comparison evidence without winner or revenue claims",
            "Inspect owner-reviewed alert threshold and anomaly-review evidence without automated alerts or traffic routing",
            "Inspect owner-reviewed notification delivery readiness without sending alerts or writing inbox rows",
            "Inspect owner-confirmed notification inbox records without recipients, email bodies, queue dispatch, or email sends",
          ]),
        }),
        expect.objectContaining({
          id: "read-affiliate-referrals",
          stableIds: expect.arrayContaining([
            "affiliatePartnerReportId",
            "payoutPreparationId",
            "payoutPreparationRecordId",
            "fraudReviewRecordId",
            "partnerNotificationReadinessRecordId",
            "referralClickId",
            "checkoutIntentId",
            "referralAttributionId",
            "reviewOnlyCommissionLedgerId",
          ]),
          safeForAgents: expect.arrayContaining([
            "Inspect public-safe partner performance reports",
            "Inspect read-only payout preparation checklists",
            "Inspect owner-confirmed payout preparation records without payout accounts, tax data, Stripe payout IDs, partner notification bodies, buyer data, raw ledger rows, or raw actor fields",
            "Inspect owner-reviewed fraud review records without private fraud signals, buyer data, raw ledger/click/checkout rows, actor identity, payout accounts, tax data, Stripe payout IDs, or partner notification bodies",
            "Inspect owner-reviewed partner notification readiness records without recipient emails, message bodies, provider message IDs, queue rows, buyer data, raw rows, private fraud signals, payout accounts, tax data, Stripe IDs, or partner sends",
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
        launchPreview: expect.any(Number),
        pending: 0,
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
    await expect(page.getByRole("heading", { name: /checkout returned successfully/i })).toBeVisible();
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

    await page.goto("/admin/user-journeys");
    await expect(page.getByRole("heading", { name: /Launch proof for the paths people will actually try/i })).toBeVisible();
    await expect(page.getByText("Evidence matrix")).toBeVisible();
    await expect(page.getByText("Latest proof", { exact: true })).toBeVisible();
    await expect(page.locator(".journey-screenshot-thumb").first()).toBeVisible();
    await expect(page.locator(".journey-proof-matrix").getByRole("link", { name: /CI workflow/i }).first()).toBeVisible();

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
    const deliveryBatchIdempotencyKey = `playwright-broadcast-delivery-batch-${Date.now()}`;
    const deliveryBatchResponse = await page.request.post(audienceBroadcastDeliveryBatchApiRoute, {
      data: {
        scheduleIntentId: scheduleIntentPayload.intent.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        confirmationText: audienceBroadcastDeliveryBatchConfirmationText,
        idempotencyKey: deliveryBatchIdempotencyKey,
      },
    });
    expect(deliveryBatchResponse.ok(), await deliveryBatchResponse.text()).toBeTruthy();
    const deliveryBatchPayload = await deliveryBatchResponse.json();
    expect(deliveryBatchPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "broadcast_delivery_batch_recorded",
        duplicate: false,
        batch: expect.objectContaining({
          draftId: broadcastDraft.id,
          scheduleIntentId: scheduleIntentPayload.intent.id,
          readyRecipientCount: broadcastDraft.readyRecipientCount,
          queueMode: "dry_run_contract",
          providerSendEnabled: false,
          recipientPayloadsCreated: false,
          sendQueueRowsCreated: false,
          providerMessageIdsIncluded: false,
        }),
        redaction: expect.objectContaining({
          actorEmailIncluded: false,
          rawRecipientEmailsIncluded: false,
          recipientPayloadsIncluded: false,
          sendQueueRowsCreated: false,
        }),
      }),
    );
    const replayDeliveryBatchResponse = await page.request.post(audienceBroadcastDeliveryBatchApiRoute, {
      data: {
        scheduleIntentId: scheduleIntentPayload.intent.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        confirmationText: audienceBroadcastDeliveryBatchConfirmationText,
        idempotencyKey: deliveryBatchIdempotencyKey,
      },
    });
    expect(replayDeliveryBatchResponse.ok(), await replayDeliveryBatchResponse.text()).toBeTruthy();
    await expect(replayDeliveryBatchResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        batch: expect.objectContaining({ id: deliveryBatchPayload.batch.id }),
      }),
    );
    const staleDeliveryBatchResponse = await page.request.post(audienceBroadcastDeliveryBatchApiRoute, {
      data: {
        scheduleIntentId: scheduleIntentPayload.intent.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount + 1,
        confirmationText: audienceBroadcastDeliveryBatchConfirmationText,
        idempotencyKey: `playwright-broadcast-delivery-batch-stale-${Date.now()}`,
      },
    });
    expect(staleDeliveryBatchResponse.status()).toBe(409);
    await expect(staleDeliveryBatchResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_readiness_count",
        currentReadyRecipientCount: broadcastDraft.readyRecipientCount,
      }),
    );
    const queueMessagesIdempotencyKey = `playwright-broadcast-delivery-queue-messages-${Date.now()}`;
    const queueMessagesResponse = await page.request.post(audienceBroadcastDeliveryQueueMessageApiRoute, {
      data: {
        deliveryBatchId: deliveryBatchPayload.batch.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        confirmationText: audienceBroadcastDeliveryQueueMessageConfirmationText,
        idempotencyKey: queueMessagesIdempotencyKey,
      },
    });
    expect(queueMessagesResponse.ok(), await queueMessagesResponse.text()).toBeTruthy();
    const queueMessagesPayload = await queueMessagesResponse.json();
    expect(queueMessagesPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "broadcast_delivery_queue_messages_recorded",
        duplicate: false,
        messages: expect.objectContaining({
          draftId: broadcastDraft.id,
          deliveryBatchId: deliveryBatchPayload.batch.id,
          dryRunMessageCount: broadcastDraft.readyRecipientCount,
          queueMode: "dry_run_contract",
          providerSendEnabled: false,
          recipientPayloadsCreated: false,
          cloudflareQueueMessagesCreated: false,
          providerMessageIdsIncluded: false,
        }),
        redaction: expect.objectContaining({
          actorEmailIncluded: false,
          rawRecipientEmailsIncluded: false,
          recipientPayloadsIncluded: false,
          cloudflareQueueMessagesCreated: false,
          providerSendEnabled: false,
        }),
      }),
    );
    const replayQueueMessagesResponse = await page.request.post(audienceBroadcastDeliveryQueueMessageApiRoute, {
      data: {
        deliveryBatchId: deliveryBatchPayload.batch.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        confirmationText: audienceBroadcastDeliveryQueueMessageConfirmationText,
        idempotencyKey: queueMessagesIdempotencyKey,
      },
    });
    expect(replayQueueMessagesResponse.ok(), await replayQueueMessagesResponse.text()).toBeTruthy();
    await expect(replayQueueMessagesResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        messages: expect.objectContaining({ id: queueMessagesPayload.messages.id }),
      }),
    );
    const staleQueueMessagesResponse = await page.request.post(audienceBroadcastDeliveryQueueMessageApiRoute, {
      data: {
        deliveryBatchId: deliveryBatchPayload.batch.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount + 1,
        confirmationText: audienceBroadcastDeliveryQueueMessageConfirmationText,
        idempotencyKey: `playwright-broadcast-delivery-queue-messages-stale-${Date.now()}`,
      },
    });
    expect(staleQueueMessagesResponse.status()).toBe(409);
    await expect(staleQueueMessagesResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_readiness_count",
        currentReadyRecipientCount: broadcastDraft.readyRecipientCount,
      }),
    );
    const dispatchPreflightIdempotencyKey = `playwright-broadcast-dispatch-preflight-${Date.now()}`;
    const dispatchPreflightResponse = await page.request.post(audienceBroadcastDispatchPreflightApiRoute, {
      data: {
        deliveryQueueMessageId: queueMessagesPayload.messages.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        confirmationText: audienceBroadcastDispatchPreflightConfirmationText,
        idempotencyKey: dispatchPreflightIdempotencyKey,
      },
    });
    expect(dispatchPreflightResponse.ok(), await dispatchPreflightResponse.text()).toBeTruthy();
    const dispatchPreflightPayload = await dispatchPreflightResponse.json();
    expect(dispatchPreflightPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "broadcast_dispatch_preflight_recorded",
        duplicate: false,
        preflight: expect.objectContaining({
          draftId: broadcastDraft.id,
          deliveryQueueMessageId: queueMessagesPayload.messages.id,
          dryRunMessageCount: broadcastDraft.readyRecipientCount,
          queueMode: "dry_run_contract",
          providerLimitPolicy: "provider_limit_required_before_live_sends",
          dispatchMode: "dry_run_preflight_no_cloudflare_queue_dispatch",
          providerSendEnabled: false,
          recipientPayloadsCreated: false,
          cloudflareQueueMessagesCreated: false,
          providerMessageIdsIncluded: false,
        }),
        redaction: expect.objectContaining({
          actorEmailIncluded: false,
          rawRecipientEmailsIncluded: false,
          recipientPayloadsIncluded: false,
          cloudflareQueueMessagesCreated: false,
          providerSendEnabled: false,
        }),
      }),
    );
    const replayDispatchPreflightResponse = await page.request.post(audienceBroadcastDispatchPreflightApiRoute, {
      data: {
        deliveryQueueMessageId: queueMessagesPayload.messages.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        confirmationText: audienceBroadcastDispatchPreflightConfirmationText,
        idempotencyKey: dispatchPreflightIdempotencyKey,
      },
    });
    expect(replayDispatchPreflightResponse.ok(), await replayDispatchPreflightResponse.text()).toBeTruthy();
    await expect(replayDispatchPreflightResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        preflight: expect.objectContaining({ id: dispatchPreflightPayload.preflight.id }),
      }),
    );
    const staleDispatchPreflightResponse = await page.request.post(audienceBroadcastDispatchPreflightApiRoute, {
      data: {
        deliveryQueueMessageId: queueMessagesPayload.messages.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount + 1,
        confirmationText: audienceBroadcastDispatchPreflightConfirmationText,
        idempotencyKey: `playwright-broadcast-dispatch-preflight-stale-${Date.now()}`,
      },
    });
    expect(staleDispatchPreflightResponse.status()).toBe(409);
    await expect(staleDispatchPreflightResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: false,
        code: "stale_readiness_count",
        currentReadyRecipientCount: broadcastDraft.readyRecipientCount,
      }),
    );
    const dispatchAttemptIdempotencyKey = `playwright-broadcast-dispatch-attempt-${Date.now()}`;
    const dispatchAttemptResponse = await page.request.post(audienceBroadcastDispatchAttemptApiRoute, {
      data: {
        dispatchPreflightId: dispatchPreflightPayload.preflight.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        confirmationText: audienceBroadcastDispatchAttemptConfirmationText,
        idempotencyKey: dispatchAttemptIdempotencyKey,
      },
    });
    expect(dispatchAttemptResponse.ok(), await dispatchAttemptResponse.text()).toBeTruthy();
    const dispatchAttemptPayload = await dispatchAttemptResponse.json();
    expect(dispatchAttemptPayload).toEqual(
      expect.objectContaining({
        ok: true,
        status: "broadcast_dispatch_attempt_recorded",
        duplicate: false,
        attempt: expect.objectContaining({
          draftId: broadcastDraft.id,
          dispatchPreflightId: dispatchPreflightPayload.preflight.id,
          dryRunMessageCount: broadcastDraft.readyRecipientCount,
          queueMode: "dry_run_contract",
          queueProducerMode: "dry_run_receipt_only_no_cloudflare_queue_producer",
          dispatchResultStatus: "not_dispatched_dry_run_receipt_only",
          providerSendEnabled: false,
          recipientPayloadsCreated: false,
          cloudflareQueueMessagesCreated: false,
          providerMessageIdsIncluded: false,
          providerResponsesIncluded: false,
        }),
        redaction: expect.objectContaining({
          actorEmailIncluded: false,
          rawRecipientEmailsIncluded: false,
          recipientPayloadsIncluded: false,
          providerResponsesIncluded: false,
          cloudflareQueueMessagesCreated: false,
          providerSendEnabled: false,
        }),
      }),
    );
    const replayDispatchAttemptResponse = await page.request.post(audienceBroadcastDispatchAttemptApiRoute, {
      data: {
        dispatchPreflightId: dispatchPreflightPayload.preflight.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount,
        confirmationText: audienceBroadcastDispatchAttemptConfirmationText,
        idempotencyKey: dispatchAttemptIdempotencyKey,
      },
    });
    expect(replayDispatchAttemptResponse.ok(), await replayDispatchAttemptResponse.text()).toBeTruthy();
    await expect(replayDispatchAttemptResponse.json()).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        duplicate: true,
        attempt: expect.objectContaining({ id: dispatchAttemptPayload.attempt.id }),
      }),
    );
    const staleDispatchAttemptResponse = await page.request.post(audienceBroadcastDispatchAttemptApiRoute, {
      data: {
        dispatchPreflightId: dispatchPreflightPayload.preflight.id,
        draftId: broadcastDraft.id,
        expectedDraftUpdatedAt: broadcastDraft.updatedAt,
        expectedReadyRecipientCount: broadcastDraft.readyRecipientCount + 1,
        confirmationText: audienceBroadcastDispatchAttemptConfirmationText,
        idempotencyKey: `playwright-broadcast-dispatch-attempt-stale-${Date.now()}`,
      },
    });
    expect(staleDispatchAttemptResponse.status()).toBe(409);
    await expect(staleDispatchAttemptResponse.json()).resolves.toEqual(
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
    expect(audienceSourceAfterSchedulePayload.broadcastDeliveryBatches.counts.deliveryBatches).toBeGreaterThanOrEqual(1);
    expect(audienceSourceAfterSchedulePayload.broadcastDeliveryBatches.counts.providerSendEnabledBatches).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastDeliveryBatches)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastDeliveryQueueMessages.counts.dryRunRecords).toBeGreaterThanOrEqual(1);
    expect(audienceSourceAfterSchedulePayload.broadcastDeliveryQueueMessages.counts.providerSendEnabledRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastDeliveryQueueMessages.counts.cloudflareQueueMessagesCreatedRecords).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastDeliveryQueueMessages)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastDispatchPreflights.counts.dryRunPreflights).toBeGreaterThanOrEqual(1);
    expect(audienceSourceAfterSchedulePayload.broadcastDispatchPreflights.counts.providerSendEnabledRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastDispatchPreflights.counts.cloudflareQueueMessagesCreatedRecords).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastDispatchPreflights)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastDispatchAttempts.counts.dryRunAttempts).toBeGreaterThanOrEqual(1);
    expect(audienceSourceAfterSchedulePayload.broadcastDispatchAttempts.counts.providerSendEnabledRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastDispatchAttempts.counts.cloudflareQueueMessagesCreatedRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastDispatchAttempts.counts.providerResponsesCreatedRecords).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastDispatchAttempts)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastSenderDomainReadiness.counts.senderDomainReadinessRecords).toBeGreaterThanOrEqual(1);
    expect(audienceSourceAfterSchedulePayload.broadcastSenderDomainReadiness.counts.providerSendEnabledRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastSenderDomainReadiness.counts.cloudflareQueueProducerEnabledRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastSenderDomainReadiness.counts.providerResponsesCreatedRecords).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastSenderDomainReadiness)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderEventReadiness.counts.providerEventReadinessRecords).toBeGreaterThanOrEqual(1);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderEventReadiness.counts.providerSendEnabledRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderEventReadiness.counts.rawProviderPayloadsStoredRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderEventReadiness.counts.providerResponsesCreatedRecords).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastProviderEventReadiness)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderRateLimitReadiness.counts.providerRateLimitReadinessRecords).toBeGreaterThanOrEqual(1);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderRateLimitReadiness.counts.providerSendEnabledRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderRateLimitReadiness.counts.rawProviderPayloadsStoredRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderRateLimitReadiness.counts.providerResponsesCreatedRecords).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastProviderRateLimitReadiness)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderResponseReadiness.counts.providerResponseReadinessRecords).toBeGreaterThanOrEqual(1);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderResponseReadiness.counts.providerSendEnabledRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderResponseReadiness.counts.rawProviderResponseBodiesStoredRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastProviderResponseReadiness.counts.providerResponsesCreatedRecords).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastProviderResponseReadiness)).not.toContain(audienceEmail);
    expect(audienceSourceAfterSchedulePayload.broadcastSendPayloadReadiness.counts.sendPayloadReadinessRecords).toBeGreaterThanOrEqual(1);
    expect(audienceSourceAfterSchedulePayload.broadcastSendPayloadReadiness.counts.recipientPayloadsCreatedRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastSendPayloadReadiness.counts.personalizedBodiesCreatedRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastSendPayloadReadiness.counts.rawPayloadBodiesStoredRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastSendPayloadReadiness.counts.providerSendEnabledRecords).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastSendPayloadReadiness.counts.providerResponsesCreatedRecords).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastSendPayloadReadiness)).not.toContain(audienceEmail);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueProducerReadiness.counts.queueProducerReadinessRecords,
    ).toBeGreaterThanOrEqual(1);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueProducerReadiness.counts.cloudflareQueueProducerEnabledRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueProducerReadiness.counts.cloudflareQueueMessagesCreatedRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueProducerReadiness.counts.queuePayloadBodiesCreatedRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueProducerReadiness.counts.recipientPayloadsCreatedRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueProducerReadiness.counts.providerSendEnabledRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueProducerReadiness.counts.providerResponsesCreatedRecords,
    ).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastQueueProducerReadiness)).not.toContain(
      audienceEmail,
    );
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.queueConsumerReadinessRecords,
    ).toBeGreaterThanOrEqual(1);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.cloudflareQueueConsumerEnabledRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.cloudflareQueueMessagesConsumedRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.cloudflareQueueMessagesAckedRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.queueRetryRecordsCreatedRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.queueDeadLetterRecordsCreatedRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.queuePayloadBodiesReadRecords,
    ).toBe(0);
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.recipientPayloadsCreatedRecords,
    ).toBe(0);
    expect(audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.providerSendEnabledRecords).toBe(
      0,
    );
    expect(
      audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness.counts.providerResponsesCreatedRecords,
    ).toBe(0);
    expect(JSON.stringify(audienceSourceAfterSchedulePayload.broadcastQueueConsumerReadiness)).not.toContain(
      audienceEmail,
    );

    await page.goto("/admin/audience");
    await expect(page.getByRole("heading", { name: /Subscriber inspection without public contact leaks/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Suppressions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "CRM notes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Import intents" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Import preflights" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Broadcast readiness" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Schedule intents" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preview safety" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue readiness" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sender domains" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Provider events", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Provider limits", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Provider responses", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Send payloads", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue producers", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue consumers", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Imports stay intent-only until contact writes are safe" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record import intent/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preflights prove import safety before contact writes" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record import preflight/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recipient payloads stay disabled before Queue producers" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Payload body creation is still blocked" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue producers remain disabled until handoff gates pass" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Producer binding is readiness-only" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue consumers stay disabled until ack and retry gates pass" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Consumer handoff is readiness-only" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preview copy stays separate from delivery" })).toBeVisible();
    await expect(page.getByText("Your Bumpgrade launch window is ready to preview")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue gates are visible before producers exist" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "audience-broadcast-delivery-dry-run" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sending domains stay blocked before live delivery" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "updates@bumpgrade.com" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Provider events stay redacted before live sends" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "bounce, complaint, delivered" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Provider throttles stay explicit before live sends" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "provider rate limit window pending" })).toBeVisible();
    await expect(page.getByText("Dry-run schedule intents", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Owner intent is recorded before any delivery queue exists" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Batch evidence is recorded before provider sends exist" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record delivery-batch dry run/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Queue evidence is recorded before Cloudflare dispatch" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record queue-message dry run/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Record dispatch preflight/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Provider and queue gates are checked before dispatch" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Record dispatch attempt/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Final handoff receipts stay dry-run before producers exist" })).toBeVisible();
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

    const webinarDraftResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "create-from-template",
        templateId: "template-webinar-registration-replay",
        title: `Webinar resource template draft ${Date.now()}`,
        confirmationText: draftFunnelTemplateCreationConfirmationText,
        idempotencyKey: `playwright-webinar-template-draft-${Date.now()}`,
        return: "json",
      },
    });
    expect(webinarDraftResponse.ok(), await webinarDraftResponse.text()).toBeTruthy();
    const webinarDraftPayload = await webinarDraftResponse.json();
    expect(webinarDraftPayload).toEqual(
      expect.objectContaining({
        ok: true,
        mode: "create-from-template",
        draft: expect.objectContaining({
          parentIssueNumber: 14,
          steps: expect.arrayContaining([
            expect.objectContaining({
              order: 1,
              kind: "webinar",
              title: "Registration and agenda",
              blocks: expect.arrayContaining([expect.objectContaining({ kind: "webinar" })]),
            }),
            expect.objectContaining({
              order: 2,
              kind: "resource",
              title: "Replay and resources",
              blocks: expect.arrayContaining([expect.objectContaining({ kind: "resource" })]),
            }),
          ]),
        }),
      }),
    );

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

    const duplicateIdempotencyKey = `playwright-duplicate-draft-${Date.now()}`;
    const duplicateTitle = `Duplicate launch draft ${Date.now()}`;
    const duplicateResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "duplicate",
        draftId: "funnel-draft-indie-launch-working-copy",
        title: duplicateTitle,
        expectedRevisionId: checkoutLinkPayload.draft.revisionId,
        confirmationText: draftFunnelDuplicationConfirmationText,
        idempotencyKey: duplicateIdempotencyKey,
        return: "json",
      },
    });
    expect(duplicateResponse.ok(), await duplicateResponse.text()).toBeTruthy();
    const duplicatePayload = await duplicateResponse.json();
    expect(duplicatePayload).toEqual(
      expect.objectContaining({
        ok: true,
        mode: "duplicate",
        draft: expect.objectContaining({
          title: duplicateTitle,
          status: "draft",
          sourceIssueNumber: 215,
          parentIssueNumber: 14,
          previewRoute: null,
          steps: expect.arrayContaining([
            expect.objectContaining({
              order: 2,
              kind: "sales",
              blocks: expect.arrayContaining([expect.objectContaining({ kind: "checkout" })]),
            }),
          ]),
        }),
      }),
    );
    const duplicatedCheckoutBlocks = duplicatePayload.draft.steps.flatMap(
      (step: { blocks: Array<{ kind: string; checkoutLink?: unknown }> }) =>
        step.blocks.filter((block) => block.kind === "checkout"),
    );
    expect(duplicatedCheckoutBlocks.length).toBeGreaterThan(0);
    expect(duplicatedCheckoutBlocks.every((block: { checkoutLink?: unknown }) => block.checkoutLink === undefined)).toBe(true);
    expect(JSON.stringify(duplicatePayload.draft)).not.toContain("checkout-link-funnel-draft-indie-launch-working-copy");

    const duplicateReplay = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "duplicate",
        draftId: "funnel-draft-indie-launch-working-copy",
        title: `${duplicateTitle} replay should not create a second draft`,
        expectedRevisionId: checkoutLinkPayload.draft.revisionId,
        confirmationText: draftFunnelDuplicationConfirmationText,
        idempotencyKey: duplicateIdempotencyKey,
        return: "json",
      },
    });
    expect(duplicateReplay.ok(), await duplicateReplay.text()).toBeTruthy();
    const duplicateReplayPayload = await duplicateReplay.json();
    expect(duplicateReplayPayload.draft.id).toBe(duplicatePayload.draft.id);

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

    const staleDuplicateResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "duplicate",
        draftId: "funnel-draft-indie-launch-working-copy",
        title: `Stale duplicate ${Date.now()}`,
        expectedRevisionId: seedPayload.draft.revisionId,
        confirmationText: draftFunnelDuplicationConfirmationText,
        idempotencyKey: `playwright-duplicate-stale-${Date.now()}`,
        return: "json",
      },
    });
    expect(staleDuplicateResponse.status()).toBe(503);
    const staleDuplicatePayload = await staleDuplicateResponse.json();
    expect(staleDuplicatePayload).toEqual(expect.objectContaining({ error: expect.stringContaining("revision changed") }));

    const missingDuplicateConfirmationResponse = await page.request.post("/api/admin/funnels/drafts", {
      headers: { accept: "application/json" },
      form: {
        mode: "duplicate",
        draftId: "funnel-draft-indie-launch-working-copy",
        title: `Unconfirmed duplicate ${Date.now()}`,
        expectedRevisionId: checkoutLinkPayload.draft.revisionId,
        confirmationText: "duplicate",
        idempotencyKey: `playwright-duplicate-unconfirmed-${Date.now()}`,
        return: "json",
      },
    });
    expect(missingDuplicateConfirmationResponse.status()).toBe(503);
    const missingDuplicateConfirmationPayload = await missingDuplicateConfirmationResponse.json();
    expect(missingDuplicateConfirmationPayload).toEqual(
      expect.objectContaining({ error: expect.stringContaining("confirmation text") }),
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
    await expect(page.getByRole("heading", { name: /Draft funnel builder for launch work/i })).toBeVisible();
    const draftCard = page.getByRole("article").filter({ hasText: "funnel-draft-indie-launch-working-copy" });
    await expect(draftCard.getByRole("heading", { name: "Indie launch working draft" })).toBeVisible();
    await expect(draftCard.getByRole("button", { name: /Duplicate draft/i })).toBeVisible();
    await expect(draftCard.getByText("Checkout links are not copied.")).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "Review the checkout path from this funnel." })).toBeVisible();
    await page.getByLabel(/Launch checklist bump/i).check();
    await page.getByLabel(/Exact confirmation text/i).fill(checkoutConfirmationText);
    await page.getByRole("button", { name: /Review checkout path/i }).click();
    await expect(page.getByText(/Checkout setup check/i)).toBeVisible();
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

  test("publisher auth form trims email whitespace before submit", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Auth form trimming is covered once on the desktop project.");
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
    const email = `trimmed-publisher-${suffix}@example.com`;

    await page.goto("/login?callbackURL=/account/setup");
    await page.getByRole("button", { name: "Sign up" }).click();
    const authForm = page.locator("form.auth-form");
    await authForm.getByLabel("Name").fill("  Trimmed Publisher  ");
    await authForm.getByLabel("Email").fill(` ${email} `);
    await authForm.getByLabel("Password").fill("BumpgradeLocal123!");
    const signUpRequestPromise = page.waitForRequest(
      (request) => request.method() === "POST" && request.url().includes("/api/auth/sign-up/email"),
    );
    await authForm.getByRole("button", { name: "Create account" }).click();
    const signUpRequest = await signUpRequestPromise;
    const signUpPayload = signUpRequest.postDataJSON() as { email?: string; name?: string };

    expect(signUpPayload.email).toBe(email);
    expect(signUpPayload.name).toBe("Trimmed Publisher");
  });

  test("paid publisher can reserve a Bumpgrade subdomain idempotently", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Auth flow is covered once on the desktop project.");
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
    const email = `paid-publisher-${suffix}@example.com`;
    await signInOrCreateAccount(page, email, "BumpgradeLocal123!", "Paid Publisher");
    await verifyEmail(page, email);

    await page.goto("/account/setup");
    await expect(page.getByRole("heading", { name: /Choose the Bumpgrade subdomain/i })).toBeVisible();
    await expect(page.locator("header.site-header").getByRole("link", { name: "Log in / sign up", exact: true })).toHaveCount(0);
    await expect(page.locator("header.site-header").getByRole("link", { name: "Account", exact: true })).toBeVisible();

    const subdomain = `launch-${suffix}`.slice(0, 50);
    const idempotencyKey = `playwright-publisher-subdomain-${suffix}`;
    const reservation = await page.request.post("/api/account/publisher/subdomain", {
      headers: { accept: "application/json", "x-bumpgrade-test-plan": "allow" },
      form: {
        return: "json",
        subdomain,
        idempotencyKey,
      },
    });
    expect(reservation.ok(), await reservation.text()).toBeTruthy();
    const payload = await reservation.json();
    expect(payload).toEqual(
      expect.objectContaining({
        ok: true,
        issue: 222,
        idempotent: false,
        reservation: expect.objectContaining({
          subdomain,
          fullHostname: `${subdomain}.bumpgrade.com`,
          status: "active",
          sourceIssueNumber: 222,
        }),
      }),
    );

    const replay = await page.request.post("/api/account/publisher/subdomain", {
      headers: { accept: "application/json", "x-bumpgrade-test-plan": "allow" },
      form: {
        return: "json",
        subdomain,
        idempotencyKey,
      },
    });
    expect(replay.ok(), await replay.text()).toBeTruthy();
    const replayPayload = await replay.json();
    expect(replayPayload).toEqual(
      expect.objectContaining({
        ok: true,
        idempotent: true,
        reservation: expect.objectContaining({ fullHostname: `${subdomain}.bumpgrade.com` }),
      }),
    );

    const reservedName = await page.request.post("/api/account/publisher/subdomain", {
      headers: { accept: "application/json", "x-bumpgrade-test-plan": "allow" },
      form: {
        return: "json",
        subdomain: "admin",
        idempotencyKey: `playwright-reserved-name-${suffix}`,
      },
    });
    expect(reservedName.status()).toBe(400);
    const reservedNamePayload = await reservedName.json();
    expect(reservedNamePayload).toEqual(expect.objectContaining({ code: "SUBDOMAIN_RESERVED" }));

    await page.goto("/account/setup");
    await expect(page.getByRole("heading", { name: `${subdomain}.bumpgrade.com` })).toBeVisible();
  });

  test("unpaid publisher cannot reserve a Bumpgrade subdomain", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Auth flow is covered once on the desktop project.");
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
    const email = `free-publisher-${suffix}@example.com`;
    await signInOrCreateAccount(page, email, "BumpgradeLocal123!", "Free Publisher");
    await verifyEmail(page, email);

    const response = await page.request.post("/api/account/publisher/subdomain", {
      headers: { accept: "application/json" },
      form: {
        return: "json",
        subdomain: `free-${suffix}`.slice(0, 50),
        idempotencyKey: `playwright-unpaid-subdomain-${suffix}`,
      },
    });
    expect(response.status()).toBe(402);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        ok: false,
        code: "PAID_PLAN_REQUIRED",
        issue: 222,
      }),
    );

    await page.goto("/account/setup");
    await expect(page.getByRole("heading", { name: /Choose the Bumpgrade subdomain/i })).toBeVisible();
    await expect(page.getByText("Paid plan required")).toBeVisible();
  });

  test("paid publisher can add and verify an existing custom domain", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Auth flow is covered once on the desktop project.");
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
    const email = `custom-domain-publisher-${suffix}@example.com`;
    await signInOrCreateAccount(page, email, "BumpgradeLocal123!", "Custom Domain Publisher");
    await verifyEmail(page, email);

    const subdomain = `domain-${suffix}`.slice(0, 50);
    const subdomainReservation = await page.request.post("/api/account/publisher/subdomain", {
      headers: { accept: "application/json", "x-bumpgrade-test-plan": "allow" },
      form: {
        return: "json",
        subdomain,
        idempotencyKey: `playwright-custom-domain-subdomain-${suffix}`,
      },
    });
    expect(subdomainReservation.ok(), await subdomainReservation.text()).toBeTruthy();

    const domainName = `www.publisher-${suffix}.com`;
    const customDomain = await page.request.post("/api/account/publisher/custom-domain", {
      headers: { accept: "application/json" },
      data: {
        return: "json",
        mode: "start",
        domain: domainName,
        idempotencyKey: `playwright-custom-domain-${suffix}`,
      },
    });
    expect(customDomain.ok(), await customDomain.text()).toBeTruthy();
    const customDomainPayload = await customDomain.json();
    expect(customDomainPayload).toEqual(
      expect.objectContaining({
        ok: true,
        issue: 223,
        idempotent: false,
        customDomain: expect.objectContaining({
          domainName,
          normalizedDomain: domainName,
          status: "pending_dns",
          dnsInstruction: expect.objectContaining({
            recordType: "CNAME",
            recordName: domainName,
            recordValue: "custom-domains.bumpgrade.com",
            expectedValue: "custom-domains.bumpgrade.com",
          }),
          sourceIssueNumber: 223,
        }),
      }),
    );

    const replay = await page.request.post("/api/account/publisher/custom-domain", {
      headers: { accept: "application/json" },
      form: {
        return: "json",
        mode: "start",
        domainName,
        idempotencyKey: `playwright-custom-domain-${suffix}`,
      },
    });
    expect(replay.ok(), await replay.text()).toBeTruthy();
    const replayPayload = await replay.json();
    expect(replayPayload).toEqual(
      expect.objectContaining({
        ok: true,
        idempotent: true,
        customDomain: expect.objectContaining({ normalizedDomain: domainName }),
      }),
    );

    const rejectedBumpgradeDomain = await page.request.post("/api/account/publisher/custom-domain", {
      headers: { accept: "application/json" },
      form: {
        return: "json",
        mode: "start",
        domainName: "demo.bumpgrade.com",
        idempotencyKey: `playwright-custom-domain-bumpgrade-${suffix}`,
      },
    });
    expect(rejectedBumpgradeDomain.status()).toBe(400);
    expect(await rejectedBumpgradeDomain.json()).toEqual(
      expect.objectContaining({ code: "CUSTOM_DOMAIN_BUMPGRADE_HOSTNAME" }),
    );

    const verification = await page.request.post("/api/account/publisher/custom-domain", {
      headers: { accept: "application/json", "x-bumpgrade-test-dns": "verified" },
      data: {
        return: "json",
        mode: "verify",
        customDomainId: customDomainPayload.customDomain.id,
      },
    });
    expect(verification.ok(), await verification.text()).toBeTruthy();
    const verificationPayload = await verification.json();
    expect(verificationPayload).toEqual(
      expect.objectContaining({
        ok: true,
        issue: 223,
        verified: true,
        customDomain: expect.objectContaining({
          id: customDomainPayload.customDomain.id,
          status: "dns_verified",
          sslStatus: "pending",
          failureReason: null,
        }),
      }),
    );

    await page.goto("/account/setup");
    await expect(page.getByRole("heading", { name: domainName })).toBeVisible();
    await expect(page.getByText("custom-domains.bumpgrade.com")).toBeVisible();
    await expect(page.getByRole("article").filter({ hasText: domainName })).toContainText("dns verified");
  });

  test("unpaid publisher cannot add a custom domain", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Auth flow is covered once on the desktop project.");
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
    const email = `free-custom-domain-${suffix}@example.com`;
    await signInOrCreateAccount(page, email, "BumpgradeLocal123!", "Free Custom Domain");
    await verifyEmail(page, email);

    const response = await page.request.post("/api/account/publisher/custom-domain", {
      headers: { accept: "application/json" },
      data: {
        return: "json",
        mode: "start",
        domainName: `www.free-${suffix}.com`,
        idempotencyKey: `playwright-unpaid-custom-domain-${suffix}`,
      },
    });
    expect(response.status()).toBe(402);
    expect(await response.json()).toEqual(expect.objectContaining({ code: "PAID_PLAN_REQUIRED", issue: 223 }));

    await page.goto("/account/setup");
    await expect(page.getByRole("heading", { name: /Bring an existing domain/i })).toBeVisible();
    await expect(page.getByText("A paid plan or launch-pilot entitlement is required before adding a custom domain.")).toBeVisible();
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
