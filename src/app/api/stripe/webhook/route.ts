import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { grantEntitlementsForPaidCheckout } from "@/lib/product-entitlements";
import { redactedStripeEventPayload } from "@/lib/sandbox-checkout";
import { createStripeClientFromEnv, stripeModeFromEnv } from "@/lib/stripe";

type WebhookRuntime = {
  db: D1Database;
  env: Cloudflare.Env;
};

async function getRuntime(): Promise<WebhookRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;

  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }

  return { db: cloudflareEnv.DB, env: cloudflareEnv };
}

function webhookSecretFromEnv(env: Cloudflare.Env) {
  if (stripeModeFromEnv(env) === "live") {
    return env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET_LIVE;
  }
  return env.STRIPE_WEBHOOK_SECRET_SANDBOX ?? process.env.STRIPE_WEBHOOK_SECRET_SANDBOX;
}

function appEnvFromRuntime(env: Cloudflare.Env) {
  return env.APP_ENV ?? process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
}

function checkoutIntentIdFromEvent(event: Stripe.Event) {
  const object = event.data.object as Stripe.Checkout.Session & {
    metadata?: Record<string, string> | null;
  };
  return object.metadata?.checkout_intent_id || object.client_reference_id || null;
}

function statusForCheckoutEvent(event: Stripe.Event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    return session.payment_status === "paid" ? "paid" : "completed";
  }
  if (event.type === "checkout.session.async_payment_succeeded") return "paid";
  if (event.type === "checkout.session.async_payment_failed") return "payment_failed";
  if (event.type === "checkout.session.expired") return "expired";
  return null;
}

function stripeIdFromValue(value: string | { id?: string } | null | undefined) {
  if (typeof value === "string") return value;
  return value?.id ?? null;
}

async function parseWebhookEvent(request: NextRequest, env: Cloudflare.Env) {
  if (appEnvFromRuntime(env) === "test" && request.headers.get("x-bumpgrade-test-webhook") === "allow") {
    return (await request.json()) as Stripe.Event;
  }

  const secret = webhookSecretFromEnv(env);
  if (!secret) {
    return { error: "webhook_secret_not_configured" as const };
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return { error: "stripe_signature_missing" as const };
  }

  const rawBody = await request.text();
  const stripe = createStripeClientFromEnv(env);
  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  try {
    return await stripe.webhooks.constructEventAsync(rawBody, signature, secret, undefined, cryptoProvider);
  } catch {
    return { error: "stripe_signature_verification_failed" as const };
  }
}

async function storeWebhookEvent(db: D1Database, event: Stripe.Event) {
  const result = await db
    .prepare(
      `INSERT OR IGNORE INTO stripe_webhook_events (
        id, event_type, api_version, livemode, stripe_created_at, status, payload_redacted_json, processed_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'processed', ?, unixepoch(), unixepoch())`,
    )
    .bind(
      event.id,
      event.type,
      event.api_version ?? null,
      event.livemode ? 1 : 0,
      event.created ?? null,
      JSON.stringify(redactedStripeEventPayload(event)),
    )
    .run();

  return result.meta.changes > 0;
}

async function updateCheckoutIntentFromEvent(db: D1Database, event: Stripe.Event) {
  const checkoutIntentId = checkoutIntentIdFromEvent(event);
  const nextStatus = statusForCheckoutEvent(event);
  if (!checkoutIntentId || !nextStatus) return { checkoutIntentId, nextStatus, updated: false };

  const session = event.data.object as Stripe.Checkout.Session;
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : null;
  const subscription = typeof session.subscription === "string" ? session.subscription : null;

  const result = await db
    .prepare(
      `UPDATE checkout_intents
       SET status = ?,
           stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id),
           stripe_subscription_id = COALESCE(?, stripe_subscription_id),
           updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(nextStatus, paymentIntent, subscription, checkoutIntentId)
    .run();

  if (result.meta.changes > 0) {
    await db
      .prepare(
        `INSERT INTO payment_audit_events (
          id, checkout_intent_id, stripe_event_id, event_kind, actor_kind, summary, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, 'stripe_webhook', ?, ?, unixepoch())`,
      )
      .bind(
        `audit-${crypto.randomUUID()}`,
        checkoutIntentId,
        event.id,
        event.type,
        `Processed Stripe ${event.type} webhook for sandbox checkout.`,
        JSON.stringify({ rawStripeIdsRedacted: true, nextStatus }),
      )
      .run();
  }

  return { checkoutIntentId, nextStatus, updated: result.meta.changes > 0 };
}

type StripeSubscriptionEventObject = Stripe.Subscription & {
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

async function updateSubscriptionFromEvent(db: D1Database, event: Stripe.Event) {
  if (
    event.type !== "customer.subscription.created" &&
    event.type !== "customer.subscription.updated" &&
    event.type !== "customer.subscription.deleted"
  ) {
    return { updated: false };
  }

  const subscription = event.data.object as StripeSubscriptionEventObject;
  const stripeSubscriptionId = subscription.id;
  const stripePriceId = subscription.items?.data?.[0]?.price?.id ?? null;
  const matchedPrice = stripePriceId
    ? await db
        .prepare("SELECT id, product_id FROM commerce_prices WHERE stripe_price_id = ?")
        .bind(stripePriceId)
        .first<{ id: string; product_id: string }>()
    : null;

  await db
    .prepare(
      `INSERT INTO billing_subscriptions (
        id, product_id, price_id, status, stripe_customer_id, stripe_subscription_id, stripe_price_id,
        current_period_start, current_period_end, cancel_at_period_end, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
      ON CONFLICT(stripe_subscription_id) DO UPDATE SET
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
      `billing-subscription-${crypto.randomUUID()}`,
      matchedPrice?.product_id ?? null,
      matchedPrice?.id ?? null,
      subscription.status,
      stripeIdFromValue(subscription.customer),
      stripeSubscriptionId,
      stripePriceId,
      subscription.current_period_start ?? null,
      subscription.current_period_end ?? null,
      subscription.cancel_at_period_end ? 1 : 0,
      JSON.stringify({ eventType: event.type, rawStripeIdsRedacted: true }),
    )
    .run();

  await db
    .prepare(
      `INSERT INTO payment_audit_events (
        id, stripe_event_id, event_kind, actor_kind, summary, metadata_json, created_at
      ) VALUES (?, ?, ?, 'stripe_webhook', ?, ?, unixepoch())`,
    )
    .bind(
      `audit-${crypto.randomUUID()}`,
      event.id,
      event.type,
      `Processed Stripe ${event.type} webhook for sandbox subscription state.`,
      JSON.stringify({ rawStripeIdsRedacted: true, hasMatchedPrice: Boolean(matchedPrice) }),
    )
    .run();

  return { updated: true };
}

export async function POST(request: NextRequest) {
  const { db, env } = await getRuntime();
  const parsed = await parseWebhookEvent(request, env);

  if ("error" in parsed) {
    const status = parsed.error === "webhook_secret_not_configured" ? 503 : 400;
    return NextResponse.json({ ok: false, code: parsed.error }, { status });
  }

  const inserted = await storeWebhookEvent(db, parsed);
  if (!inserted) {
    return NextResponse.json({ ok: true, received: true, duplicate: true });
  }

  const processing = await updateCheckoutIntentFromEvent(db, parsed);
  const subscriptionProcessing = await updateSubscriptionFromEvent(db, parsed);
  const entitlementProcessing = await grantEntitlementsForPaidCheckout(db, parsed);

  return NextResponse.json({
    ok: true,
    received: true,
    duplicate: false,
    eventType: parsed.type,
    checkoutIntentId: processing.checkoutIntentId,
    checkoutIntentUpdated: processing.updated,
    subscriptionUpdated: subscriptionProcessing.updated,
    entitlementGrantsCreated: entitlementProcessing.created,
    entitlementGrantsSkipped: entitlementProcessing.skipped,
    redaction: {
      rawStripeIdsIncluded: false,
    },
  });
}
