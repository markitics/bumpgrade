import { entitlementGrantMappings, entitlementWriteContract } from "@/lib/product-entitlements";

export type ProductAccessCatalogStatus = "draft";
export type ProductKind = "digital_download" | "course" | "membership" | "coaching_service" | "event_webinar" | "bundle";
export type ProductAssetKind = "file" | "lesson" | "member_area" | "booking" | "event" | "bundle";
export type FulfillmentTiming = "after_webhook_paid" | "manual_review" | "active_subscription";

export type ProductAccessAsset = {
  id: string;
  kind: ProductAssetKind;
  title: string;
  publicDescription: string;
  storageBoundary: string;
};

export type ProductAccessRule = {
  id: string;
  title: string;
  grants: string;
  timing: FulfillmentTiming;
  revocable: boolean;
  sourceEvent: string;
  writeBoundary: string;
};

export type ProductAccessRecord = {
  id: string;
  slug: string;
  kind: ProductKind;
  title: string;
  status: "draft";
  summary: string;
  linkedOfferIds: string[];
  assetIds: string[];
  accessRuleIds: string[];
  entitlementTemplateId: string;
};

export type EntitlementTemplate = {
  id: string;
  title: string;
  productIds: string[];
  status: "draft";
  grants: string[];
  revocationRules: string[];
  privateDataExcluded: string[];
};

export type ProductAccessCatalog = {
  id: string;
  slug: string;
  title: string;
  status: ProductAccessCatalogStatus;
  issue: number;
  parentIssue: number;
  sourceDataRoute: string;
  previewRoute: string;
  checkoutOfferRoute: string;
  commerceContractRoute: string;
  revisionId: string;
  summary: string;
  assets: ProductAccessAsset[];
  accessRules: ProductAccessRule[];
  products: ProductAccessRecord[];
  entitlementTemplates: EntitlementTemplate[];
  writeBoundary: string;
  validation: string[];
};

export const productAccessUpdatedAt = "2026-05-19";

export const productAccessCatalog: ProductAccessCatalog = {
  id: "product-access-catalog-indie-launch",
  slug: "indie-launch-library",
  title: "Indie launch product and access library",
  status: "draft",
  issue: 101,
  parentIssue: 16,
  sourceDataRoute: "/products/source-data",
  previewRoute: "/products/indie-launch-library",
  checkoutOfferRoute: "/offers/indie-launch-stack",
  commerceContractRoute: "/commerce/source-data",
  revisionId: "product-access-revision-indie-launch-2026-05-19",
  summary:
    "A product/access scaffold covering downloads, courses, memberships, services, events, bundles, and sandbox webhook-backed entitlement grants before private fulfillment delivery exists.",
  assets: [
    {
      id: "asset-launch-checklist-pdf",
      kind: "file",
      title: "Launch checklist PDF",
      publicDescription: "A downloadable checklist asset represented without a private R2 key or signed URL.",
      storageBoundary: "Future implementation stores private object keys server-side and returns signed access only to entitled users.",
    },
    {
      id: "asset-launch-course-lessons",
      kind: "lesson",
      title: "Launch course lessons",
      publicDescription: "Course lesson metadata for a future protected learning area.",
      storageBoundary: "Lesson bodies, videos, transcripts, and progress data remain private until auth and entitlements ship.",
    },
    {
      id: "asset-launch-member-area",
      kind: "member_area",
      title: "Launch member area",
      publicDescription: "Membership container for recurring access state.",
      storageBoundary: "Member-only posts, files, community data, and billing identifiers are not exposed in this source-data slice.",
    },
    {
      id: "asset-launch-coaching-booking",
      kind: "booking",
      title: "Launch coaching booking",
      publicDescription: "Manual scheduling placeholder for service delivery.",
      storageBoundary: "Calendar links, private notes, buyer details, and meeting URLs stay server-private.",
    },
    {
      id: "asset-launch-webinar-seat",
      kind: "event",
      title: "Launch webinar seat",
      publicDescription: "Event access placeholder for webinar or live workshop delivery.",
      storageBoundary: "Private join URLs, attendee lists, and replay URLs require confirmed entitlement state.",
    },
  ],
  accessRules: [
    {
      id: "access-rule-download-after-paid-webhook",
      title: "Grant download after paid webhook",
      grants: "Digital download access after trusted checkout.session.completed evidence.",
      timing: "after_webhook_paid",
      revocable: true,
      sourceEvent: "checkout.session.completed",
      writeBoundary: "No download link is issued until a future entitlement write verifies paid status and buyer identity.",
    },
    {
      id: "access-rule-course-after-paid-webhook",
      title: "Grant course after paid webhook",
      grants: "Course enrollment after paid checkout evidence.",
      timing: "after_webhook_paid",
      revocable: true,
      sourceEvent: "checkout.session.completed",
      writeBoundary: "No protected lesson access or progress record is written in this slice.",
    },
    {
      id: "access-rule-membership-active-subscription",
      title: "Grant membership while subscription is active",
      grants: "Membership access while Stripe subscription state is active or trialing.",
      timing: "active_subscription",
      revocable: true,
      sourceEvent: "customer.subscription.updated",
      writeBoundary: "No subscription entitlement is granted until billing subscription state is mirrored and trusted.",
    },
    {
      id: "access-rule-service-manual-review",
      title: "Queue service fulfillment for manual review",
      grants: "Service or coaching delivery task after payment evidence.",
      timing: "manual_review",
      revocable: true,
      sourceEvent: "payment_audit_events",
      writeBoundary: "No private booking link, customer note, or meeting URL is exposed through public source-data.",
    },
    {
      id: "access-rule-event-after-paid-webhook",
      title: "Grant event seat after paid webhook",
      grants: "Event or webinar seat after trusted payment evidence.",
      timing: "after_webhook_paid",
      revocable: true,
      sourceEvent: "checkout.session.completed",
      writeBoundary: "No join URL, attendee roster, or replay access is exposed until entitlement writes exist.",
    },
  ],
  products: [
    {
      id: "product-launch-checklist-download",
      slug: "launch-checklist-download",
      kind: "digital_download",
      title: "Launch checklist download",
      status: "draft",
      summary: "A downloadable asset that can back an order bump or standalone checkout product.",
      linkedOfferIds: ["offer-bump-launch-checklist"],
      assetIds: ["asset-launch-checklist-pdf"],
      accessRuleIds: ["access-rule-download-after-paid-webhook"],
      entitlementTemplateId: "entitlement-template-launch-download",
    },
    {
      id: "product-launch-course-lite",
      slug: "launch-course-lite",
      kind: "course",
      title: "Launch course lite",
      status: "draft",
      summary: "A small course product for lessons, modules, and protected progress state.",
      linkedOfferIds: ["offer-upsell-launch-accelerator"],
      assetIds: ["asset-launch-course-lessons"],
      accessRuleIds: ["access-rule-course-after-paid-webhook"],
      entitlementTemplateId: "entitlement-template-launch-course",
    },
    {
      id: "product-launch-membership",
      slug: "launch-membership",
      kind: "membership",
      title: "Launch membership",
      status: "draft",
      summary: "Recurring membership access that depends on subscription state.",
      linkedOfferIds: ["offer-upsell-launch-accelerator"],
      assetIds: ["asset-launch-member-area"],
      accessRuleIds: ["access-rule-membership-active-subscription"],
      entitlementTemplateId: "entitlement-template-launch-membership",
    },
    {
      id: "product-launch-coaching-session",
      slug: "launch-coaching-session",
      kind: "coaching_service",
      title: "Launch coaching session",
      status: "draft",
      summary: "Manual service fulfillment placeholder for coaching or implementation support.",
      linkedOfferIds: ["offer-downsell-launch-review"],
      assetIds: ["asset-launch-coaching-booking"],
      accessRuleIds: ["access-rule-service-manual-review"],
      entitlementTemplateId: "entitlement-template-launch-service",
    },
    {
      id: "product-launch-webinar-seat",
      slug: "launch-webinar-seat",
      kind: "event_webinar",
      title: "Launch webinar seat",
      status: "draft",
      summary: "Event or webinar access record with private join details kept out of public data.",
      linkedOfferIds: ["offer-downsell-launch-review"],
      assetIds: ["asset-launch-webinar-seat"],
      accessRuleIds: ["access-rule-event-after-paid-webhook"],
      entitlementTemplateId: "entitlement-template-launch-event",
    },
    {
      id: "product-launch-bundle",
      slug: "launch-bundle",
      kind: "bundle",
      title: "Launch bundle",
      status: "draft",
      summary: "Bundle model that can grant multiple product entitlements after a trusted purchase.",
      linkedOfferIds: ["offer-upsell-launch-accelerator"],
      assetIds: ["asset-launch-checklist-pdf", "asset-launch-course-lessons", "asset-launch-member-area"],
      accessRuleIds: [
        "access-rule-download-after-paid-webhook",
        "access-rule-course-after-paid-webhook",
        "access-rule-membership-active-subscription",
      ],
      entitlementTemplateId: "entitlement-template-launch-bundle",
    },
  ],
  entitlementTemplates: [
    {
      id: "entitlement-template-launch-download",
      title: "Launch download entitlement",
      productIds: ["product-launch-checklist-download"],
      status: "draft",
      grants: ["Download asset access", "Receipt-visible fulfillment status"],
      revocationRules: ["Refunds or chargebacks should revoke download eligibility in a future fulfillment API."],
      privateDataExcluded: ["R2 object key", "signed URL", "buyer email", "Stripe customer id"],
    },
    {
      id: "entitlement-template-launch-course",
      title: "Launch course entitlement",
      productIds: ["product-launch-course-lite"],
      status: "draft",
      grants: ["Course enrollment", "Protected lesson access"],
      revocationRules: ["Refund, dispute, or manual admin revocation should remove future lesson access."],
      privateDataExcluded: ["Lesson body", "video URL", "progress state", "buyer identity"],
    },
    {
      id: "entitlement-template-launch-membership",
      title: "Launch membership entitlement",
      productIds: ["product-launch-membership"],
      status: "draft",
      grants: ["Member area access while subscription is active"],
      revocationRules: ["Subscription cancellation, unpaid invoices, refunds, or disputes should revoke active access."],
      privateDataExcluded: ["Stripe subscription id", "member posts", "private files", "buyer identity"],
    },
    {
      id: "entitlement-template-launch-service",
      title: "Launch service entitlement",
      productIds: ["product-launch-coaching-session"],
      status: "draft",
      grants: ["Manual service fulfillment task"],
      revocationRules: ["Service cancellation or refund should close or reverse the fulfillment task."],
      privateDataExcluded: ["Calendar link", "meeting URL", "private notes", "buyer identity"],
    },
    {
      id: "entitlement-template-launch-event",
      title: "Launch event entitlement",
      productIds: ["product-launch-webinar-seat"],
      status: "draft",
      grants: ["Event seat", "Replay eligibility after event"],
      revocationRules: ["Refund, cancellation, or no-show policy should determine event access changes."],
      privateDataExcluded: ["Join URL", "attendee list", "replay URL", "buyer identity"],
    },
    {
      id: "entitlement-template-launch-bundle",
      title: "Launch bundle entitlement",
      productIds: ["product-launch-bundle"],
      status: "draft",
      grants: ["Download access", "Course enrollment", "Membership access"],
      revocationRules: ["Bundle revocation should cascade through each component entitlement with audit evidence."],
      privateDataExcluded: ["Component private asset keys", "subscription ids", "buyer identity"],
    },
  ],
  writeBoundary:
    "Issue #101 can grant idempotent sandbox product entitlement rows and fulfillment task evidence from trusted paid checkout webhooks, issue #141 can inspect customer-safe checkout-intent entitlement status, and issue #143 can create short-lived sandbox download tokens for active file entitlements. Product creation, private asset upload, signed object URLs, protected content, subscription access changes, refunds, revocations, live fulfillment, and direct agent writes require future authenticated confirmed-write APIs.",
  validation: [
    "/products/source-data returns seeded products, assets, access rules, and entitlement templates.",
    "/products/indie-launch-library renders the product/access preview.",
    "/products/entitlements renders checkout-intent-scoped customer entitlement lookup.",
    "/api/products/download-tokens creates short-lived sandbox download tokens for active file entitlements.",
    "/api/stripe/webhook grants idempotent sandbox entitlements after trusted paid checkout evidence.",
    "/agent-docs/source-data lists the product access read contract for future MCP resources.",
  ],
};

export const productAccessCatalogs = [productAccessCatalog];

export function getProductAccessCatalogBySlug(slug: string) {
  return productAccessCatalogs.find((catalog) => catalog.slug === slug) ?? null;
}

export const productAccessSourceData = {
  id: "bumpgrade-product-access-source-data",
  updatedAt: productAccessUpdatedAt,
  status: "sandbox-entitlement-grants-ready",
  issue: 101,
  parentIssue: 16,
  generatedFrom: "src/lib/product-access.ts",
  routes: [
    "/products/source-data",
    "/products/entitlements",
    "/api/products/entitlements",
    "/api/products/download-tokens",
    "/api/products/downloads?token={token}",
    ...productAccessCatalogs.map((catalog) => catalog.previewRoute),
  ],
  stableIds: [
    "productId",
    "assetId",
    "accessRuleId",
    "entitlementTemplateId",
    "customerProductEntitlementLookupId",
    "productDownloadTokenId",
    "subscriptionPlanId",
    "fulfillmentId",
    "agentActionId",
  ],
  entitlementWrites: entitlementWriteContract,
  grantMappings: entitlementGrantMappings,
  writeBoundary: productAccessCatalog.writeBoundary,
  catalogs: productAccessCatalogs,
  caveat:
    "This contract proves product/access read and preview semantics, sandbox webhook-backed entitlement row grants, owner inspection, customer-safe checkout-intent entitlement lookup, and short-lived sandbox download tokens. It does not expose private R2 keys, signed object URLs, protected content, revocation APIs, live fulfillment, customer portals, or direct agent confirmed-write APIs.",
};
