import {
  entitlementGrantMappings,
  entitlementWriteContract,
  subscriptionMembershipAccessContract,
  subscriptionMembershipGrantMapping,
} from "@/lib/product-entitlements";

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

export const productAccessUpdatedAt = "2026-05-20";

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
    "A product/access library covering downloads, courses, memberships, services, events, bundles, trusted payment-backed entitlement grants, subscription-backed membership access, the first private delivery path, owner-confirmed private asset upload intents, non-destructive revocation intent readiness, protected content readiness, and checkout-intent-scoped protected content fixture delivery.",
  assets: [
    {
      id: "asset-launch-checklist-pdf",
      kind: "file",
      title: "Launch checklist PDF",
      publicDescription: "A downloadable checklist asset delivered through a private R2-backed fixture without exposing object keys or signed URLs.",
      storageBoundary:
        "Issue #146 stores and reads the safe fixture through the PRODUCT_ASSETS R2 binding server-side; private object keys and signed URLs stay out of public source-data and token responses.",
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
      writeBoundary:
        "Issue #146 can issue a short-lived one-use token for active file entitlements and stream the seeded private R2 fixture through Bumpgrade.",
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
    "Issue #101 can grant idempotent sandbox product entitlement rows and fulfillment task evidence from trusted paid checkout webhooks, issue #141 can inspect customer-safe checkout-intent entitlement status, issue #143 can create one-use download tokens for active file entitlements, issue #146 can stream a seeded private R2-backed fixture through Bumpgrade, issue #147 revalidates current entitlement and trusted checkout state before redemption, issue #151 lets verified owners create small private asset upload records after exact confirmation, idempotency, and catalog revision checks, issue #179 exposes non-destructive revocation intent readiness, issue #181 exposes protected content readiness, issue #185 returns seeded protected fixture bodies only after checkout-intent, entitlement, product/template scope, and trusted checkout checks, and issue #187 syncs checkout-linked membership entitlement state from trusted Stripe Billing subscription events. Product creation, customer delivery of arbitrary uploads, signed object URLs, refunds, Customer Portal actions, destructive revocations, live fulfillment automation, and direct unauthenticated agent writes require future APIs.",
  validation: [
    "/products/source-data returns seeded products, assets, access rules, and entitlement templates.",
    "/products/indie-launch-library renders the product/access preview.",
    "/products/entitlements renders checkout-intent-scoped customer entitlement lookup.",
    "/api/products/download-tokens creates short-lived download tokens for active file entitlements.",
    "/api/products/downloads?token={token} revalidates current entitlement and trusted checkout state, streams the seeded private R2 fixture once, and rejects token replay.",
    "/api/admin/products/assets lets verified owners create small private R2-backed asset upload records without exposing private object keys, signed URLs, or upload bodies.",
    "Revocation intent readiness is inspectable without entitlement mutation, access removal, raw buyer exposure, or billing changes.",
    "Protected content readiness is inspectable without lesson bodies, member posts, progress rows, private R2 keys, signed URLs, or customer delivery.",
    "Subscription-backed membership access is inspectable without raw Stripe subscription/customer IDs, buyer identity, member posts, private files, or Customer Portal URLs.",
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
  status: "subscription-membership-entitlement-ready",
  issue: 187,
  parentIssue: 16,
  generatedFrom: "src/lib/product-access.ts",
  routes: [
    "/products/source-data",
    "/products/entitlements",
    "/api/products/entitlements",
    "/api/products/download-tokens",
    "/api/products/downloads?token={token}",
    "/api/products/protected-content",
    "/api/admin/products/assets",
    ...productAccessCatalogs.map((catalog) => catalog.previewRoute),
  ],
  stableIds: [
    "productId",
    "assetId",
    "accessRuleId",
    "entitlementTemplateId",
    "customerProductEntitlementLookupId",
    "productDownloadTokenId",
    "productAssetUploadIntentId",
    "productEntitlementRevocationIntentId",
    "productProtectedContentId",
    "subscriptionPlanId",
    "fulfillmentId",
    "agentActionId",
  ],
  entitlementWrites: entitlementWriteContract,
  grantMappings: entitlementGrantMappings,
  subscriptionMembershipAccess: subscriptionMembershipAccessContract,
  subscriptionMembershipGrantMapping,
  writeBoundary: productAccessCatalog.writeBoundary,
  catalogs: productAccessCatalogs,
  caveat:
    "This contract proves product/access read and preview semantics, sandbox webhook-backed entitlement row grants, subscription-backed membership entitlement state, owner inspection, customer-safe checkout-intent entitlement lookup, short-lived download tokens, seeded private R2-backed fixture delivery, owner-confirmed small private asset upload records, non-destructive revocation intent readiness, protected content readiness, and checkout-intent-scoped protected fixture delivery. It does not expose private R2 keys, signed object URLs, upload bodies, arbitrary uploaded content, raw Stripe subscription/customer IDs, destructive revocation APIs, live fulfillment automation, customer portals, customer delivery of arbitrary uploads, or direct unauthenticated agent writes.",
};
