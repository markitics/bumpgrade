import { getCloudflareContext } from "@opennextjs/cloudflare";
import type Stripe from "stripe";

import { sandboxCheckoutOffer } from "@/lib/sandbox-checkout";

type CheckoutIntentForEntitlements = {
  id: string;
  product_id: string | null;
  price_id: string | null;
  buyer_email: string | null;
  metadata_json: string | null;
};

type CheckoutLineItemMetadata = {
  productId?: string;
  priceId?: string;
  kind?: string;
};

export type EntitlementGrantMapping = {
  id: string;
  sourcePriceId: string;
  sourceCommerceProductId: string;
  productId: string;
  productTitle: string;
  entitlementTemplateId: string;
  entitlementTemplateTitle: string;
  accessRuleId: string;
  fulfillmentKind: "digital_download" | "bundle" | "membership";
  grants: string[];
  grantSummary: string;
};

type SubscriptionEventObject = Stripe.Subscription & {
  metadata?: Record<string, string> | null;
  current_period_start?: number | null;
  current_period_end?: number | null;
  cancel_at_period_end?: boolean | null;
  customer?: string | { id?: string } | null;
  items?: {
    data?: Array<{
      price?: {
        id?: string | null;
      };
    }>;
  };
};

type CheckoutIntentForSubscriptionAccess = CheckoutIntentForEntitlements & {
  stripe_subscription_id: string | null;
};

type ProductEntitlementRuntime = {
  db: D1Database;
};

export const entitlementGrantMappingsUpdatedAt = "2026-05-20";

export const subscriptionMembershipAccessIssue = 187;
export const subscriptionMembershipAccessStatus = "subscription-membership-entitlement-ready";
export const subscriptionMembershipCommerceProductId = "product-bumpgrade-launch-membership";
export const subscriptionMembershipPriceId = "price-launch-membership-monthly-usd";
export const subscriptionMembershipStripeMetadataPriceKey = "bumpgrade_price_id";
export const subscriptionMembershipStripeMetadataCheckoutKey = "checkout_intent_id";
export const activeSubscriptionStatuses = ["active", "trialing"] as const;
export const inactiveSubscriptionStatuses = ["canceled", "unpaid", "incomplete_expired"] as const;

export const entitlementGrantMappings: EntitlementGrantMapping[] = [
  {
    id: "grant-map-sandbox-launch-pass-to-bundle",
    sourcePriceId: sandboxCheckoutOffer.priceId,
    sourceCommerceProductId: sandboxCheckoutOffer.productId,
    productId: "product-launch-bundle",
    productTitle: "Launch bundle",
    entitlementTemplateId: "entitlement-template-launch-bundle",
    entitlementTemplateTitle: "Launch bundle entitlement",
    accessRuleId: "access-rule-download-after-paid-webhook",
    fulfillmentKind: "bundle",
    grants: ["Download access", "Course enrollment", "Membership access"],
    grantSummary: "Grant the sandbox launch bundle entitlement after trusted paid checkout evidence.",
  },
  {
    id: "grant-map-launch-checklist-bump-to-download",
    sourcePriceId: "price-launch-checklist-bump-usd",
    sourceCommerceProductId: "product-launch-checklist-bump",
    productId: "product-launch-checklist-download",
    productTitle: "Launch checklist download",
    entitlementTemplateId: "entitlement-template-launch-download",
    entitlementTemplateTitle: "Launch download entitlement",
    accessRuleId: "access-rule-download-after-paid-webhook",
    fulfillmentKind: "digital_download",
    grants: ["Download asset access", "Receipt-visible fulfillment status"],
    grantSummary: "Grant the launch checklist download entitlement after trusted paid checkout evidence.",
  },
];

export const subscriptionMembershipGrantMapping: EntitlementGrantMapping = {
  id: "grant-map-launch-membership-subscription",
  sourcePriceId: subscriptionMembershipPriceId,
  sourceCommerceProductId: subscriptionMembershipCommerceProductId,
  productId: "product-launch-membership",
  productTitle: "Launch membership",
  entitlementTemplateId: "entitlement-template-launch-membership",
  entitlementTemplateTitle: "Launch membership entitlement",
  accessRuleId: "access-rule-membership-active-subscription",
  fulfillmentKind: "membership",
  grants: ["Member area access while subscription is active or trialing"],
  grantSummary: "Grant launch membership access while trusted Stripe Billing subscription state is active or trialing.",
};

export const productEntitlementLookupMappings = [...entitlementGrantMappings, subscriptionMembershipGrantMapping];

export const entitlementWriteContract = {
  id: "product-entitlement-webhook-grant-contract",
  status: "sandbox-webhook-grants-ready",
  issue: 101,
  parentIssue: 16,
  sourceEvents: ["checkout.session.completed"],
  tables: ["product_entitlements", "product_fulfillment_tasks"],
  sourceDataRoute: "/products/source-data",
  grantMappings: entitlementGrantMappings,
  publicSafeFields: [
    "id",
    "checkout_intent_id",
    "product_id",
    "entitlement_template_id",
    "access_rule_id",
    "status",
    "grant_kind",
    "source_price_id",
    "granted_at",
  ],
  serverPrivateFields: [
    "buyer_user_id",
    "buyer_email_hash",
    "source_stripe_event_id",
    "metadata_json",
    "private R2 object keys",
    "signed URLs",
    "raw Stripe customer/session/payment IDs",
  ],
  writeBoundary:
    "Issue #101 can grant idempotent sandbox entitlement rows from trusted paid checkout webhook evidence. Signed downloads, protected content, revocation, live fulfillment, customer portals, refunds, and direct agent writes remain locked behind future confirmed-write APIs.",
};

export type SubscriptionMembershipAccessSummary = {
  id: "subscription-membership-access-contract";
  status: typeof subscriptionMembershipAccessStatus;
  issue: typeof subscriptionMembershipAccessIssue;
  parentIssue: 16;
  sourceEvents: ["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"];
  sourceDataRoute: "/products/source-data";
  customerLookupRoute: "/api/products/entitlements";
  sourcePriceId: typeof subscriptionMembershipPriceId;
  sourceCommerceProductId: typeof subscriptionMembershipCommerceProductId;
  productId: "product-launch-membership";
  entitlementTemplateId: "entitlement-template-launch-membership";
  accessRuleId: "access-rule-membership-active-subscription";
  activeStatuses: typeof activeSubscriptionStatuses;
  inactiveStatuses: typeof inactiveSubscriptionStatuses;
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    billingSubscriptions: number;
    activeOrTrialingBillingSubscriptions: number;
    membershipEntitlements: number;
    activeMembershipEntitlements: number;
    inactiveMembershipEntitlements: number;
  };
  redaction: {
    buyerEmailIncluded: false;
    buyerEmailHashIncluded: false;
    rawStripeSubscriptionIdsIncluded: false;
    rawStripeCustomerIdsIncluded: false;
    sourceStripeEventIdsIncluded: false;
    metadataJsonIncluded: false;
    memberPostsIncluded: false;
    rawR2KeysIncluded: false;
    signedUrlsIncluded: false;
    progressDataIncluded: false;
    customerPortalUrlIncluded: false;
  };
  writeBoundary: string;
};

export type SubscriptionMembershipAccessResult = {
  attempted: boolean;
  updated: boolean;
  status: "active" | "inactive" | "unmatched" | "ignored";
  entitlementId: string | null;
  checkoutIntentId: string | null;
  subscriptionStatus: string | null;
};

const subscriptionMembershipRedaction = {
  buyerEmailIncluded: false,
  buyerEmailHashIncluded: false,
  rawStripeSubscriptionIdsIncluded: false,
  rawStripeCustomerIdsIncluded: false,
  sourceStripeEventIdsIncluded: false,
  metadataJsonIncluded: false,
  memberPostsIncluded: false,
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  progressDataIncluded: false,
  customerPortalUrlIncluded: false,
} satisfies SubscriptionMembershipAccessSummary["redaction"];

const subscriptionMembershipWriteBoundary =
  "Issue #187 mirrors trusted Stripe Billing subscription state and updates a checkout-linked membership entitlement only when subscription state is active or trialing. It marks access inactive when subscription state is canceled, unpaid, incomplete_expired, or deleted. It does not create manual renewal loops, Customer Portal sessions, raw Stripe ID exposure, member posts, progress rows, private R2 keys, signed URLs, destructive revocation, or direct unauthenticated agent writes.";

export const subscriptionMembershipAccessContract: Omit<
  SubscriptionMembershipAccessSummary,
  "source" | "loadError" | "counts"
> = {
  id: "subscription-membership-access-contract",
  status: subscriptionMembershipAccessStatus,
  issue: subscriptionMembershipAccessIssue,
  parentIssue: 16,
  sourceEvents: ["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"],
  sourceDataRoute: "/products/source-data",
  customerLookupRoute: "/api/products/entitlements",
  sourcePriceId: subscriptionMembershipPriceId,
  sourceCommerceProductId: subscriptionMembershipCommerceProductId,
  productId: "product-launch-membership",
  entitlementTemplateId: "entitlement-template-launch-membership",
  accessRuleId: "access-rule-membership-active-subscription",
  activeStatuses: activeSubscriptionStatuses,
  inactiveStatuses: inactiveSubscriptionStatuses,
  redaction: subscriptionMembershipRedaction,
  writeBoundary: subscriptionMembershipWriteBoundary,
};

function parseIntentMetadata(intent: CheckoutIntentForEntitlements) {
  if (!intent.metadata_json) return {};
  try {
    return JSON.parse(intent.metadata_json) as { line_items?: CheckoutLineItemMetadata[] };
  } catch {
    return {};
  }
}

function checkoutIntentIdFromEvent(event: Stripe.Event) {
  const object = event.data.object as Stripe.Checkout.Session & {
    metadata?: Record<string, string> | null;
  };
  return object.metadata?.checkout_intent_id || object.client_reference_id || null;
}

function paidCheckoutEvidence(event: Stripe.Event) {
  if (event.type !== "checkout.session.completed") return false;
  const session = event.data.object as Stripe.Checkout.Session;
  return session.payment_status === "paid" || session.status === "complete";
}

function lineItemsFromIntent(intent: CheckoutIntentForEntitlements) {
  const metadata = parseIntentMetadata(intent);
  const metadataItems = Array.isArray(metadata.line_items) ? metadata.line_items : [];
  const priceIds = metadataItems.map((item) => item.priceId).filter((priceId): priceId is string => Boolean(priceId));
  if (intent.price_id) priceIds.push(intent.price_id);
  return Array.from(new Set(priceIds));
}

function subscriptionObjectFromEvent(event: Stripe.Event) {
  if (
    event.type !== "customer.subscription.created" &&
    event.type !== "customer.subscription.updated" &&
    event.type !== "customer.subscription.deleted"
  ) {
    return null;
  }
  return event.data.object as SubscriptionEventObject;
}

export function subscriptionPriceIdFromObject(subscription: SubscriptionEventObject) {
  return (
    subscription.metadata?.[subscriptionMembershipStripeMetadataPriceKey] ??
    subscription.metadata?.price_id ??
    subscription.items?.data?.[0]?.price?.id ??
    null
  );
}

export function subscriptionCheckoutIntentIdFromObject(subscription: SubscriptionEventObject) {
  return subscription.metadata?.[subscriptionMembershipStripeMetadataCheckoutKey] ?? null;
}

function subscriptionStatusIsActive(status: string | null | undefined) {
  return activeSubscriptionStatuses.includes(status as (typeof activeSubscriptionStatuses)[number]);
}

function subscriptionStatusIsInactive(status: string | null | undefined) {
  return inactiveSubscriptionStatuses.includes(status as (typeof inactiveSubscriptionStatuses)[number]);
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function buyerEmailHash(email: string | null) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return null;
  return sha256(normalized);
}

async function subscriptionCheckoutIntent(db: D1Database, subscription: SubscriptionEventObject) {
  const checkoutIntentId = subscriptionCheckoutIntentIdFromObject(subscription);
  const stripeSubscriptionId = subscription.id;

  if (checkoutIntentId) {
    const intent = await db
      .prepare(
        `SELECT id, product_id, price_id, buyer_email, metadata_json, stripe_subscription_id
        FROM checkout_intents
        WHERE id = ?`,
      )
      .bind(checkoutIntentId)
      .first<CheckoutIntentForSubscriptionAccess>();
    if (intent) return intent;
  }

  return db
    .prepare(
      `SELECT id, product_id, price_id, buyer_email, metadata_json, stripe_subscription_id
      FROM checkout_intents
      WHERE stripe_subscription_id = ?
      ORDER BY updated_at DESC
      LIMIT 1`,
    )
    .bind(stripeSubscriptionId)
    .first<CheckoutIntentForSubscriptionAccess>();
}

async function getRuntime(): Promise<ProductEntitlementRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

export async function getSubscriptionMembershipAccessSummary(): Promise<SubscriptionMembershipAccessSummary> {
  try {
    const { db } = await getRuntime();
    const billing = await db
      .prepare(
        `SELECT
          COUNT(*) AS billing_subscriptions,
          SUM(CASE WHEN status IN ('active', 'trialing') THEN 1 ELSE 0 END) AS active_or_trialing_billing_subscriptions
        FROM billing_subscriptions
        WHERE price_id = ? OR product_id = ?`,
      )
      .bind(subscriptionMembershipPriceId, subscriptionMembershipCommerceProductId)
      .first<{
        billing_subscriptions: number | string | null;
        active_or_trialing_billing_subscriptions: number | string | null;
      }>();
    const entitlements = await db
      .prepare(
        `SELECT
          COUNT(*) AS membership_entitlements,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_membership_entitlements,
          SUM(CASE WHEN status != 'active' THEN 1 ELSE 0 END) AS inactive_membership_entitlements
        FROM product_entitlements
        WHERE grant_kind = 'sandbox_subscription_webhook'
          AND product_id = ?
          AND entitlement_template_id = ?`,
      )
      .bind(subscriptionMembershipGrantMapping.productId, subscriptionMembershipGrantMapping.entitlementTemplateId)
      .first<{
        membership_entitlements: number | string | null;
        active_membership_entitlements: number | string | null;
        inactive_membership_entitlements: number | string | null;
      }>();

    return {
      ...subscriptionMembershipAccessContract,
      source: "d1",
      loadError: null,
      counts: {
        billingSubscriptions: Number(billing?.billing_subscriptions ?? 0),
        activeOrTrialingBillingSubscriptions: Number(billing?.active_or_trialing_billing_subscriptions ?? 0),
        membershipEntitlements: Number(entitlements?.membership_entitlements ?? 0),
        activeMembershipEntitlements: Number(entitlements?.active_membership_entitlements ?? 0),
        inactiveMembershipEntitlements: Number(entitlements?.inactive_membership_entitlements ?? 0),
      },
    };
  } catch (error) {
    return {
      ...subscriptionMembershipAccessContract,
      source: "unavailable",
      loadError: error instanceof Error ? error.message : "Unable to load subscription membership access summary.",
      counts: {
        billingSubscriptions: 0,
        activeOrTrialingBillingSubscriptions: 0,
        membershipEntitlements: 0,
        activeMembershipEntitlements: 0,
        inactiveMembershipEntitlements: 0,
      },
    };
  }
}

export async function grantEntitlementsForPaidCheckout(db: D1Database, event: Stripe.Event) {
  const checkoutIntentId = checkoutIntentIdFromEvent(event);
  if (!checkoutIntentId || !paidCheckoutEvidence(event)) {
    return { attempted: false, created: 0, skipped: 0 };
  }

  const intent = await db
    .prepare("SELECT id, product_id, price_id, buyer_email, metadata_json FROM checkout_intents WHERE id = ?")
    .bind(checkoutIntentId)
    .first<CheckoutIntentForEntitlements>();

  if (!intent) {
    return { attempted: true, created: 0, skipped: 0 };
  }

  const priceIds = lineItemsFromIntent(intent);
  const mappings = entitlementGrantMappings.filter((mapping) => priceIds.includes(mapping.sourcePriceId));
  const emailHash = await buyerEmailHash(intent.buyer_email);
  let created = 0;
  let skipped = 0;

  for (const mapping of mappings) {
    const entitlementId = `entitlement-${checkoutIntentId}-${mapping.entitlementTemplateId}`;
    const fulfillmentTaskId = `fulfillment-${checkoutIntentId}-${mapping.entitlementTemplateId}`;
    const result = await db
      .prepare(
        `INSERT OR IGNORE INTO product_entitlements (
          id, checkout_intent_id, source_stripe_event_id, product_id, source_commerce_product_id,
          entitlement_template_id, access_rule_id, status, grant_kind, buyer_email_hash, source_price_id,
          metadata_json, granted_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'sandbox_paid_webhook', ?, ?, ?, unixepoch(), unixepoch())`,
      )
      .bind(
        entitlementId,
        checkoutIntentId,
        event.id,
        mapping.productId,
        mapping.sourceCommerceProductId,
        mapping.entitlementTemplateId,
        mapping.accessRuleId,
        emailHash,
        mapping.sourcePriceId,
        JSON.stringify({
          issue: 101,
          mappingId: mapping.id,
          productTitle: mapping.productTitle,
          templateTitle: mapping.entitlementTemplateTitle,
          grants: mapping.grants,
          rawStripeIdsRedacted: true,
          privateAssetDataIncluded: false,
        }),
      )
      .run();

    if (result.meta.changes > 0) {
      created += 1;
      await db
        .prepare(
          `INSERT OR IGNORE INTO product_fulfillment_tasks (
            id, entitlement_id, checkout_intent_id, product_id, status, fulfillment_kind, summary,
            metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'queued', ?, ?, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          fulfillmentTaskId,
          entitlementId,
          checkoutIntentId,
          mapping.productId,
          mapping.fulfillmentKind,
          mapping.grantSummary,
          JSON.stringify({
            issue: 101,
            mappingId: mapping.id,
            rawStripeIdsRedacted: true,
            privateAssetDataIncluded: false,
          }),
        )
        .run();

      await db
        .prepare(
          `INSERT INTO payment_audit_events (
            id, checkout_intent_id, stripe_event_id, event_kind, actor_kind, summary, metadata_json, created_at
          ) VALUES (?, ?, ?, 'product_entitlement_granted', 'stripe_webhook', ?, ?, unixepoch())`,
        )
        .bind(
          `audit-${crypto.randomUUID()}`,
          checkoutIntentId,
          event.id,
          mapping.grantSummary,
          JSON.stringify({
            issue: 101,
            entitlementId,
            productId: mapping.productId,
            entitlementTemplateId: mapping.entitlementTemplateId,
            fulfillmentTaskId,
            rawStripeIdsRedacted: true,
          }),
        )
        .run();
    } else {
      skipped += 1;
    }
  }

  return { attempted: true, created, skipped };
}

export async function syncMembershipEntitlementForSubscription(
  db: D1Database,
  event: Stripe.Event,
): Promise<SubscriptionMembershipAccessResult> {
  const subscription = subscriptionObjectFromEvent(event);
  if (!subscription) {
    return {
      attempted: false,
      updated: false,
      status: "ignored",
      entitlementId: null,
      checkoutIntentId: null,
      subscriptionStatus: null,
    };
  }

  const priceId = subscriptionPriceIdFromObject(subscription);
  if (priceId !== subscriptionMembershipPriceId) {
    return {
      attempted: true,
      updated: false,
      status: "unmatched",
      entitlementId: null,
      checkoutIntentId: null,
      subscriptionStatus: subscription.status ?? null,
    };
  }

  const intent = await subscriptionCheckoutIntent(db, subscription);
  if (!intent) {
    return {
      attempted: true,
      updated: false,
      status: "unmatched",
      entitlementId: null,
      checkoutIntentId: subscriptionCheckoutIntentIdFromObject(subscription),
      subscriptionStatus: subscription.status ?? null,
    };
  }

  const active = subscriptionStatusIsActive(subscription.status);
  const inactive = subscriptionStatusIsInactive(subscription.status) || event.type === "customer.subscription.deleted";
  const entitlementStatus = active ? "active" : inactive ? "inactive" : "inactive";
  const fulfillmentStatus = active ? "active" : "paused";
  const emailHash = await buyerEmailHash(intent.buyer_email);
  const mapping = subscriptionMembershipGrantMapping;
  const entitlementId = `entitlement-${intent.id}-${mapping.entitlementTemplateId}`;
  const fulfillmentTaskId = `fulfillment-${intent.id}-${mapping.entitlementTemplateId}`;

  const result = await db
    .prepare(
      `INSERT INTO product_entitlements (
        id, checkout_intent_id, source_stripe_event_id, product_id, source_commerce_product_id,
        entitlement_template_id, access_rule_id, status, grant_kind, buyer_email_hash, source_price_id,
        metadata_json, granted_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sandbox_subscription_webhook', ?, ?, ?, unixepoch(), unixepoch())
      ON CONFLICT(checkout_intent_id, product_id, entitlement_template_id) DO UPDATE SET
        source_stripe_event_id=excluded.source_stripe_event_id,
        source_commerce_product_id=excluded.source_commerce_product_id,
        access_rule_id=excluded.access_rule_id,
        status=excluded.status,
        grant_kind=excluded.grant_kind,
        buyer_email_hash=excluded.buyer_email_hash,
        source_price_id=excluded.source_price_id,
        metadata_json=excluded.metadata_json,
        updated_at=excluded.updated_at`,
    )
    .bind(
      entitlementId,
      intent.id,
      event.id,
      mapping.productId,
      mapping.sourceCommerceProductId,
      mapping.entitlementTemplateId,
      mapping.accessRuleId,
      entitlementStatus,
      emailHash,
      mapping.sourcePriceId,
      JSON.stringify({
        issue: subscriptionMembershipAccessIssue,
        mappingId: mapping.id,
        subscriptionStatus: subscription.status,
        activeSubscription: active,
        rawStripeIdsRedacted: true,
        rawStripeSubscriptionIdIncluded: false,
        rawStripeCustomerIdIncluded: false,
        customerPortalUrlCreated: false,
        manualRenewalLoopCreated: false,
      }),
    )
    .run();

  await db
    .prepare(
      `INSERT INTO product_fulfillment_tasks (
        id, entitlement_id, checkout_intent_id, product_id, status, fulfillment_kind, summary,
        metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'membership', ?, ?, unixepoch(), unixepoch())
      ON CONFLICT(entitlement_id) DO UPDATE SET
        status=excluded.status,
        fulfillment_kind=excluded.fulfillment_kind,
        summary=excluded.summary,
        metadata_json=excluded.metadata_json,
        updated_at=excluded.updated_at`,
    )
    .bind(
      fulfillmentTaskId,
      entitlementId,
      intent.id,
      mapping.productId,
      fulfillmentStatus,
      active
        ? "Membership access is active from trusted Stripe Billing subscription state."
        : "Membership access is paused because trusted Stripe Billing subscription state is not active.",
      JSON.stringify({
        issue: subscriptionMembershipAccessIssue,
        mappingId: mapping.id,
        subscriptionStatus: subscription.status,
        rawStripeIdsRedacted: true,
        memberPostsIncluded: false,
      }),
    )
    .run();

  await db
    .prepare(
      `INSERT INTO payment_audit_events (
        id, checkout_intent_id, stripe_event_id, event_kind, actor_kind, summary, metadata_json, created_at
      ) VALUES (?, ?, ?, 'product_subscription_membership_access_synced', 'stripe_webhook', ?, ?, unixepoch())`,
    )
    .bind(
      `audit-${crypto.randomUUID()}`,
      intent.id,
      event.id,
      active
        ? "Synced active subscription-backed membership access from Stripe Billing webhook."
        : "Synced inactive subscription-backed membership access from Stripe Billing webhook.",
      JSON.stringify({
        issue: subscriptionMembershipAccessIssue,
        entitlementId,
        fulfillmentTaskId,
        subscriptionStatus: subscription.status,
        rawStripeIdsRedacted: true,
      }),
    )
    .run();

  return {
    attempted: true,
    updated: result.meta.changes > 0,
    status: active ? "active" : "inactive",
    entitlementId,
    checkoutIntentId: intent.id,
    subscriptionStatus: subscription.status ?? null,
  };
}
