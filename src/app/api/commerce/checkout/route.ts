import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import {
  appendCheckoutQuery,
  checkoutConfirmationText,
  checkoutModeForPrice,
  checkoutRedirectUrl,
  checkoutRoutes,
  hasUsableSandboxSecret,
  lineItemForPrice,
  publicCheckoutUrl,
  sandboxCheckoutOffer,
  sandboxCheckoutPriceId,
  type CheckoutIntentRow,
  type CommercePriceRow,
  type CommerceProductRow,
} from "@/lib/sandbox-checkout";
import { createStripeClient, stripeModeFromEnv, stripeSecretKeyFromEnv } from "@/lib/stripe";

type CheckoutRequestBody = {
  priceId?: string;
  buyerEmail?: string;
  confirmationText?: string;
  idempotencyKey?: string;
  agentClientId?: string;
  successUrl?: string;
  cancelUrl?: string;
  previewOnly?: boolean;
};

type CheckoutRuntime = {
  db: D1Database;
  env: Cloudflare.Env;
};

const actorKind = "checkout_api";

async function getRuntime(): Promise<CheckoutRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;

  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }

  return { db: cloudflareEnv.DB, env: cloudflareEnv };
}

async function loadSandboxOffer(db: D1Database, priceId = sandboxCheckoutPriceId) {
  const price = await db
    .prepare("SELECT * FROM commerce_prices WHERE id = ? AND active = 1")
    .bind(priceId)
    .first<CommercePriceRow>();

  if (!price) return null;

  const product = await db
    .prepare("SELECT * FROM commerce_products WHERE id = ?")
    .bind(price.product_id)
    .first<CommerceProductRow>();

  if (!product) return null;

  return { product, price };
}

function safeOffer(product: CommerceProductRow, price: CommercePriceRow) {
  return {
    id: sandboxCheckoutOffer.id,
    productId: product.id,
    priceId: price.id,
    name: product.name,
    summary: product.description,
    currency: price.currency,
    unitAmountCents: price.unit_amount_cents,
    billingInterval: price.billing_interval,
    status: product.status,
  };
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

function parseEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return null;
  return trimmed;
}

async function parseBody(request: NextRequest): Promise<CheckoutRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as CheckoutRequestBody;
  } catch {
    return {};
  }
}

function previewResponse(input: {
  product: CommerceProductRow;
  price: CommercePriceRow;
  origin: string;
  reason: string;
  mode: string;
}) {
  return NextResponse.json({
    ok: true,
    status: "preview",
    reason: input.reason,
    mode: input.mode,
    offer: safeOffer(input.product, input.price),
    confirmation: {
      required: true,
      text: checkoutConfirmationText,
    },
    routes: {
      start: checkoutRoutes.start,
      webhook: checkoutRoutes.webhook,
      success: publicCheckoutUrl(input.origin, checkoutRoutes.success),
      cancel: publicCheckoutUrl(input.origin, checkoutRoutes.cancel),
    },
    redaction: {
      rawStripeIdsIncluded: false,
      checkoutUrlIncluded: false,
    },
  });
}

async function insertAuditEvent(
  db: D1Database,
  input: {
    checkoutIntentId: string;
    eventKind: string;
    summary: string;
    actorId?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  await db
    .prepare(
      `INSERT INTO payment_audit_events (
        id, checkout_intent_id, event_kind, actor_kind, actor_id, summary, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      `audit-${crypto.randomUUID()}`,
      input.checkoutIntentId,
      input.eventKind,
      actorKind,
      input.actorId ?? null,
      input.summary,
      JSON.stringify(input.metadata ?? {}),
    )
    .run();
}

async function createOrReadIntent(
  db: D1Database,
  input: {
    id: string;
    idempotencyKey: string;
    product: CommerceProductRow;
    price: CommercePriceRow;
    buyerEmail: string | null;
    mode: string;
    successUrl: string;
    cancelUrl: string;
    auditCorrelationId: string;
    agentClientId: string | null;
  },
) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO checkout_intents (
        id, idempotency_key, checkout_kind, status, product_id, price_id, buyer_email, amount_cents, currency,
        stripe_mode, success_url, cancel_url, confirmation_required, confirmed_at, audit_correlation_id,
        agent_client_id, metadata_json, created_at, updated_at
      ) VALUES (?, ?, 'sandbox_checkout', 'pending_stripe', ?, ?, ?, ?, ?, ?, ?, ?, 1, unixepoch(), ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      input.id,
      input.idempotencyKey,
      input.product.id,
      input.price.id,
      input.buyerEmail,
      input.price.unit_amount_cents,
      input.price.currency,
      input.mode,
      input.successUrl,
      input.cancelUrl,
      input.auditCorrelationId,
      input.agentClientId,
      JSON.stringify({
        checkout_surface: "sandbox",
        issue: 34,
      }),
    )
    .run();

  return db
    .prepare("SELECT * FROM checkout_intents WHERE idempotency_key = ?")
    .bind(input.idempotencyKey)
    .first<CheckoutIntentRow>();
}

function existingIntentResponse(intent: CheckoutIntentRow, origin: string) {
  return NextResponse.json({
    ok: true,
    status: intent.status,
    duplicate: true,
    checkoutIntentId: intent.id,
    redirect: intent.stripe_checkout_session_id
      ? {
          type: "bumpgrade",
          url: checkoutRedirectUrl(origin, intent.id),
        }
      : null,
    redaction: {
      rawStripeIdsIncluded: false,
    },
  });
}

async function createStripeSession(input: {
  db: D1Database;
  stripe: Stripe;
  product: CommerceProductRow;
  price: CommercePriceRow;
  intent: CheckoutIntentRow;
  idempotencyKey: string;
  successUrl: string;
  cancelUrl: string;
  buyerEmail: string | null;
}) {
  const session = await input.stripe.checkout.sessions.create(
    {
      mode: checkoutModeForPrice(input.price),
      line_items: [lineItemForPrice(input.product, input.price)],
      success_url: appendCheckoutQuery(input.successUrl, input.intent.id),
      cancel_url: input.cancelUrl,
      client_reference_id: input.intent.id,
      customer_email: input.buyerEmail ?? undefined,
      metadata: {
        checkout_intent_id: input.intent.id,
        product_id: input.product.id,
        price_id: input.price.id,
        audit_correlation_id: input.intent.audit_correlation_id ?? "",
        bumpgrade_issue: "34",
      },
    },
    { idempotencyKey: input.idempotencyKey },
  );

  await input.db
    .prepare(
      `UPDATE checkout_intents
       SET status = 'stripe_session_created',
           stripe_checkout_session_id = ?,
           metadata_json = ?,
           updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(
      session.id,
      JSON.stringify({
        checkout_surface: "sandbox",
        issue: 34,
        stripe_checkout_url: session.url,
      }),
      input.intent.id,
    )
    .run();

  await insertAuditEvent(input.db, {
    checkoutIntentId: input.intent.id,
    eventKind: "checkout_session_created",
    summary: "Created sandbox Stripe Checkout Session.",
    actorId: input.intent.agent_client_id,
    metadata: {
      productId: input.product.id,
      priceId: input.price.id,
      rawStripeIdsRedacted: true,
    },
  });
}

export async function GET(request: NextRequest) {
  const { db, env } = await getRuntime();
  const offer = await loadSandboxOffer(db);
  if (!offer) return jsonError(404, "sandbox_offer_not_found", "Sandbox checkout offer is not seeded.");

  const mode = stripeModeFromEnv(env);
  const secret = stripeSecretKeyFromEnv(env, mode);
  const canCreateStripeSession = mode === "sandbox" && env.APP_ENV !== "test" && hasUsableSandboxSecret(secret);

  return NextResponse.json({
    ok: true,
    id: "bumpgrade-sandbox-checkout-contract",
    status: "available",
    mode,
    canCreateStripeSession,
    offer: safeOffer(offer.product, offer.price),
    confirmation: {
      required: true,
      text: checkoutConfirmationText,
    },
    routes: {
      start: checkoutRoutes.start,
      webhook: checkoutRoutes.webhook,
      success: publicCheckoutUrl(request.nextUrl.origin, checkoutRoutes.success),
      cancel: publicCheckoutUrl(request.nextUrl.origin, checkoutRoutes.cancel),
    },
    redaction: {
      rawStripeIdsIncluded: false,
    },
  });
}

export async function POST(request: NextRequest) {
  const { db, env } = await getRuntime();
  const body = await parseBody(request);
  const offer = await loadSandboxOffer(db, body.priceId ?? sandboxCheckoutPriceId);
  if (!offer) return jsonError(404, "sandbox_offer_not_found", "Sandbox checkout offer is not available.");

  const mode = stripeModeFromEnv(env);
  const secret = stripeSecretKeyFromEnv(env, mode);
  const origin = request.nextUrl.origin;

  if (mode !== "sandbox") {
    return jsonError(409, "live_mode_disabled", "This route is sandbox-only.");
  }

  if (body.previewOnly || env.APP_ENV === "test" || body.confirmationText !== checkoutConfirmationText) {
    return previewResponse({
      product: offer.product,
      price: offer.price,
      origin,
      mode,
      reason: body.previewOnly
        ? "preview_requested"
        : env.APP_ENV === "test"
          ? "test_environment"
          : "confirmation_text_required",
    });
  }

  if (!secret || !hasUsableSandboxSecret(secret)) {
    return previewResponse({
      product: offer.product,
      price: offer.price,
      origin,
      mode,
      reason: "missing_or_incomplete_sandbox_secret",
    });
  }

  const checkoutIntentId = `checkout-intent-${crypto.randomUUID()}`;
  const auditCorrelationId = `audit-${crypto.randomUUID()}`;
  const idempotencyKey =
    body.idempotencyKey?.trim() || request.headers.get("idempotency-key") || `bumpgrade-${crypto.randomUUID()}`;
  const successUrl = body.successUrl?.trim() || publicCheckoutUrl(origin, checkoutRoutes.success);
  const cancelUrl = body.cancelUrl?.trim() || publicCheckoutUrl(origin, checkoutRoutes.cancel);
  const buyerEmail = parseEmail(body.buyerEmail);
  const agentClientId = body.agentClientId?.trim() || null;

  const intent = await createOrReadIntent(db, {
    id: checkoutIntentId,
    idempotencyKey,
    product: offer.product,
    price: offer.price,
    buyerEmail,
    mode,
    successUrl,
    cancelUrl,
    auditCorrelationId,
    agentClientId,
  });

  if (!intent) {
    return jsonError(500, "checkout_intent_not_created", "Checkout intent could not be created.");
  }

  if (intent.id !== checkoutIntentId) {
    return existingIntentResponse(intent, origin);
  }

  await insertAuditEvent(db, {
    checkoutIntentId: intent.id,
    eventKind: "checkout_intent_created",
    summary: "Created sandbox checkout intent before calling Stripe.",
    actorId: agentClientId,
    metadata: {
      productId: offer.product.id,
      priceId: offer.price.id,
      idempotencyKey,
    },
  });

  try {
    const stripe = createStripeClient(secret);
    await createStripeSession({
      db,
      stripe,
      product: offer.product,
      price: offer.price,
      intent,
      idempotencyKey,
      successUrl,
      cancelUrl,
      buyerEmail,
    });
  } catch (error) {
    await db
      .prepare("UPDATE checkout_intents SET status = 'stripe_error', metadata_json = ?, updated_at = unixepoch() WHERE id = ?")
      .bind(
        JSON.stringify({
          checkout_surface: "sandbox",
          issue: 34,
          stripe_error: error instanceof Error ? error.message.slice(0, 240) : "Unknown Stripe error",
        }),
        intent.id,
      )
      .run();

    return jsonError(502, "stripe_checkout_error", "Stripe sandbox checkout session could not be created.");
  }

  return NextResponse.json({
    ok: true,
    status: "stripe_session_created",
    checkoutIntentId: intent.id,
    redirect: {
      type: "bumpgrade",
      url: checkoutRedirectUrl(origin, intent.id),
    },
    redaction: {
      rawStripeIdsIncluded: false,
      rawCheckoutUrlIncluded: false,
    },
  });
}
