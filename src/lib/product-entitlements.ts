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
  fulfillmentKind: "digital_download" | "bundle";
  grants: string[];
  grantSummary: string;
};

export const entitlementGrantMappingsUpdatedAt = "2026-05-19";

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
