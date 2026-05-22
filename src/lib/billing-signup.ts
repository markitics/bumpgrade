import { getCloudflareContext } from "@opennextjs/cloudflare";
import Stripe from "stripe";

import {
  billingCheckoutSuccessRoute,
  pricingSourceIssue,
  selfServePricingPlanBySlug,
  whiteGloveSetupAddon,
  type SelfServePricingPlanSlug,
} from "@/lib/pricing-plans";
import { createStripeClient, stripeSecretKeyFromEnv } from "@/lib/stripe";

type BillingRuntime = {
  db: D1Database;
  env: Cloudflare.Env;
};

type CommerceProductRow = {
  id: string;
  name: string;
  description: string | null;
};

type CommercePriceRow = {
  id: string;
  product_id: string;
  nickname: string | null;
  currency: string;
  unit_amount_cents: number;
  billing_interval: string;
  stripe_price_id: string | null;
  active: number;
};

type StripeSubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start?: number | null;
  current_period_end?: number | null;
};

export type BillingCheckoutPreview = {
  ok: true;
  status: "preview";
  reason: string;
  planSlug: SelfServePricingPlanSlug;
  lineItems: Array<{
    priceId: string;
    name: string;
    unitAmountCents: number;
    billingInterval: string;
    quantity: number;
  }>;
  totalInitialAmountCents: number;
  redaction: {
    rawStripeIdsIncluded: false;
    checkoutUrlIncluded: false;
  };
};

export type BillingCheckoutSessionResult =
  | BillingCheckoutPreview
  | {
      ok: true;
      status: "stripe_session_created";
      checkoutIntentId: string;
      redirectUrl: string;
      planSlug: SelfServePricingPlanSlug;
      redaction: {
        rawStripeIdsIncluded: false;
      };
    };

export type BillingCheckoutConfirmation =
  | {
      ok: true;
      status: "entitlement_active";
      planSlug: SelfServePricingPlanSlug;
      ownerEmail: string;
      subscriptionStatus: string;
      entitlementId: string;
      checkoutIntentId: string | null;
      setupAddonSelected: boolean;
      redaction: {
        rawStripeIdsIncluded: false;
      };
    }
  | {
      ok: false;
      status:
        | "session_missing"
        | "secret_missing"
        | "stripe_lookup_failed"
        | "session_not_complete"
        | "unsupported_plan"
        | "buyer_email_missing"
        | "subscription_missing"
        | "db_unavailable";
      message: string;
    };

export async function getBillingRuntime(): Promise<BillingRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB, env: cloudflareEnv };
}

export async function getOptionalBillingRuntime() {
  try {
    return await getBillingRuntime();
  } catch {
    return null;
  }
}

export function billingAppEnv(env: Cloudflare.Env) {
  return env.APP_ENV ?? process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
}

export function normalizeBillingEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase() ?? "";
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
  return email;
}

function runtimeId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function stripeIdFromValue(value: string | { id?: string } | null | undefined) {
  if (typeof value === "string") return value;
  return value?.id ?? null;
}

async function loadCommerceProduct(db: D1Database, productId: string) {
  return db.prepare("SELECT id, name, description FROM commerce_products WHERE id = ?").bind(productId).first<CommerceProductRow>();
}

async function loadCommercePrice(db: D1Database, priceId: string) {
  return db.prepare("SELECT * FROM commerce_prices WHERE id = ? AND active = 1").bind(priceId).first<CommercePriceRow>();
}

async function loadPlanRows(db: D1Database, planSlug: SelfServePricingPlanSlug, includeSetupAddon: boolean) {
  const plan = selfServePricingPlanBySlug(planSlug);
  if (!plan?.productId || !plan.priceId) return null;

  const planProduct = await loadCommerceProduct(db, plan.productId);
  const planPrice = await loadCommercePrice(db, plan.priceId);
  if (!planProduct || !planPrice) return null;

  const items = [{ product: planProduct, price: planPrice }];
  if (includeSetupAddon) {
    const setupProduct = await loadCommerceProduct(db, whiteGloveSetupAddon.productId);
    const setupPrice = await loadCommercePrice(db, whiteGloveSetupAddon.priceId);
    if (!setupProduct || !setupPrice) return null;
    items.push({ product: setupProduct, price: setupPrice });
  }

  return { plan, items };
}

function lineItemForPrice(product: CommerceProductRow, price: CommercePriceRow) {
  if (price.stripe_price_id) {
    return { price: price.stripe_price_id, quantity: 1 };
  }

  return {
    price_data: {
      currency: price.currency,
      unit_amount: price.unit_amount_cents,
      product_data: {
        name: product.name,
        description: product.description ?? undefined,
        metadata: {
          bumpgrade_product_id: product.id,
          bumpgrade_issue: String(pricingSourceIssue),
        },
      },
      recurring: price.billing_interval === "one_time" ? undefined : { interval: "month" as const },
    },
    quantity: 1,
  };
}

function safeLineItems(items: Array<{ product: CommerceProductRow; price: CommercePriceRow }>) {
  return items.map((item) => ({
    priceId: item.price.id,
    name: item.product.name,
    unitAmountCents: item.price.unit_amount_cents,
    billingInterval: item.price.billing_interval,
    quantity: 1,
  }));
}

function totalInitialAmountCents(items: Array<{ price: CommercePriceRow }>) {
  return items.reduce((total, item) => total + item.price.unit_amount_cents, 0);
}

function checkoutSuccessUrl(origin: string, checkoutIntentId: string) {
  const url = new URL(billingCheckoutSuccessRoute, origin);
  url.searchParams.set("checkout_intent_id", checkoutIntentId);
  url.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  return url.toString();
}

function checkoutCancelUrl(origin: string) {
  const url = new URL("/pricing", origin);
  url.searchParams.set("checkout", "cancelled");
  return url.toString();
}

async function insertCheckoutIntent(
  db: D1Database,
  input: {
    id: string;
    idempotencyKey: string;
    productId: string;
    priceId: string;
    buyerEmail: string | null;
    amountCents: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
    auditCorrelationId: string;
    metadata: Record<string, unknown>;
  },
) {
  await db
    .prepare(
      `INSERT INTO checkout_intents (
        id, idempotency_key, checkout_kind, status, product_id, price_id, buyer_email, amount_cents, currency,
        stripe_mode, success_url, cancel_url, confirmation_required, confirmed_at, audit_correlation_id,
        metadata_json, created_at, updated_at
      ) VALUES (?, ?, 'self_serve_subscription', 'pending_stripe', ?, ?, ?, ?, ?, 'live', ?, ?, 0, unixepoch(), ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      input.id,
      input.idempotencyKey,
      input.productId,
      input.priceId,
      input.buyerEmail,
      input.amountCents,
      input.currency,
      input.successUrl,
      input.cancelUrl,
      input.auditCorrelationId,
      JSON.stringify(input.metadata),
    )
    .run();
}

async function updateCheckoutIntentWithSession(
  db: D1Database,
  input: { checkoutIntentId: string; sessionId: string; metadata: Record<string, unknown> },
) {
  await db
    .prepare(
      `UPDATE checkout_intents
       SET status = 'stripe_session_created',
           stripe_checkout_session_id = ?,
           metadata_json = ?,
           updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(input.sessionId, JSON.stringify(input.metadata), input.checkoutIntentId)
    .run();
}

async function insertBillingAuditEvent(
  db: D1Database,
  input: { id: string; checkoutIntentId: string | null; eventKind: string; summary: string; metadata: Record<string, unknown> },
) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO payment_audit_events (
        id, checkout_intent_id, event_kind, actor_kind, summary, metadata_json, created_at
      ) VALUES (?, ?, ?, 'billing_signup', ?, ?, unixepoch())`,
    )
    .bind(input.id, input.checkoutIntentId, input.eventKind, input.summary, JSON.stringify(input.metadata))
    .run();
}

export async function createBillingCheckoutSession(input: {
  db: D1Database;
  env: Cloudflare.Env;
  origin: string;
  planSlug: SelfServePricingPlanSlug;
  includeSetupAddon: boolean;
  buyerEmail: string | null;
  previewOnly?: boolean;
}): Promise<BillingCheckoutSessionResult> {
  const rows = await loadPlanRows(input.db, input.planSlug, input.includeSetupAddon);
  if (!rows) {
    throw new Error("Self-serve pricing rows are not seeded.");
  }

  const secret = stripeSecretKeyFromEnv(input.env, "live");
  const appEnv = billingAppEnv(input.env);
  const safeItems = safeLineItems(rows.items);
  const initialAmount = totalInitialAmountCents(rows.items);

  if (input.previewOnly || appEnv === "test" || !secret) {
    return {
      ok: true,
      status: "preview",
      reason: input.previewOnly ? "preview_requested" : appEnv === "test" ? "test_environment" : "missing_live_secret",
      planSlug: input.planSlug,
      lineItems: safeItems,
      totalInitialAmountCents: initialAmount,
      redaction: {
        rawStripeIdsIncluded: false,
        checkoutUrlIncluded: false,
      },
    };
  }

  const checkoutIntentId = runtimeId("checkout-intent");
  const auditCorrelationId = runtimeId("audit");
  const idempotencyKey = runtimeId("billing-signup");
  const successUrl = checkoutSuccessUrl(input.origin, checkoutIntentId);
  const cancelUrl = checkoutCancelUrl(input.origin);
  const metadata = {
    checkout_surface: "self_serve_pricing",
    issue: pricingSourceIssue,
    plan_slug: input.planSlug,
    white_glove_setup: input.includeSetupAddon,
    line_items: safeItems,
    audit_correlation_id: auditCorrelationId,
    rawStripeIdsRedacted: true,
  };

  await insertCheckoutIntent(input.db, {
    id: checkoutIntentId,
    idempotencyKey,
    productId: rows.plan.productId ?? rows.items[0].product.id,
    priceId: rows.plan.priceId ?? rows.items[0].price.id,
    buyerEmail: input.buyerEmail,
    amountCents: initialAmount,
    currency: rows.items[0].price.currency,
    successUrl,
    cancelUrl,
    auditCorrelationId,
    metadata,
  });

  const stripe = createStripeClient(secret);
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      line_items: rows.items.map((item) => lineItemForPrice(item.product, item.price)),
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: input.buyerEmail ?? undefined,
      client_reference_id: checkoutIntentId,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: {
        checkout_intent_id: checkoutIntentId,
        plan_slug: input.planSlug,
        price_id: rows.items[0].price.id,
        white_glove_setup: input.includeSetupAddon ? "true" : "false",
        audit_correlation_id: auditCorrelationId,
        bumpgrade_issue: String(pricingSourceIssue),
      },
      subscription_data: {
        metadata: {
          checkout_intent_id: checkoutIntentId,
          plan_slug: input.planSlug,
          price_id: rows.items[0].price.id,
          audit_correlation_id: auditCorrelationId,
          bumpgrade_issue: String(pricingSourceIssue),
        },
      },
    },
    { idempotencyKey },
  );

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  await updateCheckoutIntentWithSession(input.db, {
    checkoutIntentId,
    sessionId: session.id,
    metadata: {
      ...metadata,
      stripe_session_created: true,
    },
  });

  await insertBillingAuditEvent(input.db, {
    id: `audit-billing-signup-session-created-${checkoutIntentId}`,
    checkoutIntentId,
    eventKind: "billing_checkout_session_created",
    summary: `Created live Stripe Checkout Session for Bumpgrade ${rows.plan.name}.`,
    metadata: {
      planSlug: input.planSlug,
      setupAddonSelected: input.includeSetupAddon,
      rawStripeIdsRedacted: true,
    },
  });

  return {
    ok: true,
    status: "stripe_session_created",
    checkoutIntentId,
    redirectUrl: session.url,
    planSlug: input.planSlug,
    redaction: {
      rawStripeIdsIncluded: false,
    },
  };
}

export async function confirmBillingCheckoutSession(input: {
  db: D1Database;
  env: Cloudflare.Env;
  sessionId: string | null | undefined;
}): Promise<BillingCheckoutConfirmation> {
  const sessionId = input.sessionId?.trim();
  if (!sessionId) {
    return { ok: false, status: "session_missing", message: "Missing Stripe Checkout Session reference." };
  }

  const secret = stripeSecretKeyFromEnv(input.env, "live");
  if (!secret) {
    return { ok: false, status: "secret_missing", message: "Live Stripe secret is not available in this runtime." };
  }

  const stripe = createStripeClient(secret);
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
  } catch {
    return { ok: false, status: "stripe_lookup_failed", message: "Could not verify the Stripe Checkout Session." };
  }

  const planSlug = session.metadata?.plan_slug;
  const plan = selfServePricingPlanBySlug(planSlug);
  if (!plan?.priceId) {
    return { ok: false, status: "unsupported_plan", message: "This Checkout Session is not tied to a Bumpgrade self-serve plan." };
  }

  if (session.status !== "complete") {
    return { ok: false, status: "session_not_complete", message: "Stripe has not marked this Checkout Session complete yet." };
  }

  const subscriptionId = stripeIdFromValue(session.subscription as string | { id?: string } | null);
  if (!subscriptionId) {
    return { ok: false, status: "subscription_missing", message: "Stripe did not attach a subscription to this session." };
  }

  const subscription =
    typeof session.subscription === "object" ? (session.subscription as StripeSubscriptionWithPeriods) : null;
  const subscriptionStatus = subscription?.status ?? "active";
  if (!["active", "trialing"].includes(subscriptionStatus) && session.payment_status !== "paid") {
    return {
      ok: false,
      status: "session_not_complete",
      message: "Stripe has not reported an active paid subscription for this session.",
    };
  }

  const ownerEmail = normalizeBillingEmail(session.customer_details?.email ?? session.customer_email ?? null);
  if (!ownerEmail) {
    return { ok: false, status: "buyer_email_missing", message: "Stripe did not return a buyer email for this session." };
  }

  const checkoutIntentId = session.metadata?.checkout_intent_id ?? session.client_reference_id ?? null;
  const setupAddonSelected = session.metadata?.white_glove_setup === "true";
  const customerId = stripeIdFromValue(session.customer as string | { id?: string } | null);
  const currentPeriodStart = subscription?.current_period_start ?? null;
  const currentPeriodEnd = subscription?.current_period_end ?? null;
  const entitlementId = `publisher-plan-entitlement-${subscriptionId}`;

  if (checkoutIntentId) {
    await input.db
      .prepare(
        `UPDATE checkout_intents
         SET status = ?,
             buyer_email = COALESCE(buyer_email, ?),
             stripe_subscription_id = ?,
             updated_at = unixepoch()
         WHERE id = ?`,
      )
      .bind(session.payment_status === "paid" ? "paid" : "completed", ownerEmail, subscriptionId, checkoutIntentId)
      .run();
  }

  await input.db
    .prepare(
      `INSERT INTO billing_subscriptions (
        id, buyer_email, product_id, price_id, status, stripe_customer_id, stripe_subscription_id, stripe_price_id,
        current_period_start, current_period_end, cancel_at_period_end, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
      ON CONFLICT(stripe_subscription_id) DO UPDATE SET
        buyer_email=excluded.buyer_email,
        product_id=excluded.product_id,
        price_id=excluded.price_id,
        status=excluded.status,
        stripe_customer_id=excluded.stripe_customer_id,
        stripe_price_id=excluded.stripe_price_id,
        current_period_start=excluded.current_period_start,
        current_period_end=excluded.current_period_end,
        cancel_at_period_end=excluded.cancel_at_period_end,
        metadata_json=excluded.metadata_json,
        updated_at=excluded.updated_at`,
    )
    .bind(
      `billing-subscription-${subscriptionId}`,
      ownerEmail,
      plan.productId,
      plan.priceId,
      subscriptionStatus,
      customerId,
      subscriptionId,
      null,
      currentPeriodStart,
      currentPeriodEnd,
      subscription?.cancel_at_period_end ? 1 : 0,
      JSON.stringify({
        source: "pricing_success_verification",
        issue: pricingSourceIssue,
        planSlug: plan.slug,
        checkoutIntentLinked: Boolean(checkoutIntentId),
        setupAddonSelected,
        rawStripeIdsRedacted: true,
      }),
    )
    .run();

  await input.db
    .prepare(
      `INSERT INTO publisher_plan_entitlements (
        id, owner_email, status, source, plan_slug, starts_at, ends_at, metadata_json, created_at, updated_at
      ) VALUES (?, ?, 'active', 'stripe_checkout_session', ?, unixepoch(), ?, ?, unixepoch(), unixepoch())
      ON CONFLICT(id) DO UPDATE SET
        owner_email=excluded.owner_email,
        status='active',
        source=excluded.source,
        plan_slug=excluded.plan_slug,
        ends_at=excluded.ends_at,
        metadata_json=excluded.metadata_json,
        updated_at=unixepoch()`,
    )
    .bind(
      entitlementId,
      ownerEmail,
      plan.slug,
      currentPeriodEnd,
      JSON.stringify({
        issue: pricingSourceIssue,
        checkoutIntentId,
        subscriptionStatus,
        setupAddonSelected,
        rawStripeIdsRedacted: true,
      }),
    )
    .run();

  await insertBillingAuditEvent(input.db, {
    id: `audit-billing-signup-confirmed-${session.id}`,
    checkoutIntentId,
    eventKind: "billing_checkout_session_verified",
    summary: `Verified Bumpgrade ${plan.name} Checkout Session and activated publisher entitlement.`,
    metadata: {
      planSlug: plan.slug,
      ownerEmail,
      subscriptionStatus,
      setupAddonSelected,
      rawStripeIdsRedacted: true,
    },
  });

  return {
    ok: true,
    status: "entitlement_active",
    planSlug: plan.slug,
    ownerEmail,
    subscriptionStatus,
    entitlementId,
    checkoutIntentId,
    setupAddonSelected,
    redaction: {
      rawStripeIdsIncluded: false,
    },
  };
}
