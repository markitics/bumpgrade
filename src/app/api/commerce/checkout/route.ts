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
import { checkoutOfferStack } from "@/lib/checkout-offers";
import { createStripeClient, stripeModeFromEnv, stripeSecretKeyFromEnv } from "@/lib/stripe";

type CheckoutRequestBody = {
  priceId?: string;
  orderBumpPriceIds?: string[];
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

type CheckoutItem = {
  product: CommerceProductRow;
  price: CommercePriceRow;
  kind: "primary" | "order_bump";
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

function checkoutOfferForPrice(priceId: string) {
  if (priceId === sandboxCheckoutOffer.priceId) return { id: sandboxCheckoutOffer.id, title: sandboxCheckoutOffer.name };

  const orderBump = checkoutOfferStack.orderBumps.find((offer) => offer.priceId === priceId);
  if (orderBump) return { id: orderBump.id, title: orderBump.title };

  return null;
}

function safeOffer(product: CommerceProductRow, price: CommercePriceRow, kind: CheckoutItem["kind"] = "primary") {
  const sourceOffer = checkoutOfferForPrice(price.id);

  return {
    id: sourceOffer?.id ?? product.id,
    productId: product.id,
    priceId: price.id,
    kind,
    name: sourceOffer?.title ?? product.name,
    summary: product.description,
    currency: price.currency,
    unitAmountCents: price.unit_amount_cents,
    billingInterval: price.billing_interval,
    status: product.status,
  };
}

function parseOrderBumpPriceIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function allowedOrderBumpPriceIds() {
  return checkoutOfferStack.orderBumps.map((offer) => offer.priceId);
}

function totalAmountCents(items: CheckoutItem[]) {
  return items.reduce((total, item) => total + item.price.unit_amount_cents, 0);
}

function safeLineItems(items: CheckoutItem[]) {
  return items.map((item) => safeOffer(item.product, item.price, item.kind));
}

async function loadCheckoutItems(db: D1Database, input: { primaryPriceId: string; orderBumpPriceIds: string[] }) {
  const allowedBumpIds = allowedOrderBumpPriceIds();
  const unsupportedBumpIds = input.orderBumpPriceIds.filter((priceId) => !allowedBumpIds.includes(priceId));

  if (unsupportedBumpIds.length > 0) {
    return {
      ok: false as const,
      status: 400,
      code: "unsupported_order_bump",
      message: "Only the seeded launch checklist order bump can be attached to this sandbox checkout.",
    };
  }

  const primaryOffer = await loadSandboxOffer(db, input.primaryPriceId);
  if (!primaryOffer) {
    return {
      ok: false as const,
      status: 404,
      code: "sandbox_offer_not_found",
      message: "Sandbox checkout offer is not available.",
    };
  }

  const orderBumpItems: CheckoutItem[] = [];
  for (const priceId of input.orderBumpPriceIds) {
    const orderBumpOffer = await loadSandboxOffer(db, priceId);
    if (!orderBumpOffer) {
      return {
        ok: false as const,
        status: 404,
        code: "order_bump_not_seeded",
        message: "Selected order bump is not seeded in Bumpgrade commerce tables.",
      };
    }
    if (orderBumpOffer.price.currency !== primaryOffer.price.currency) {
      return {
        ok: false as const,
        status: 409,
        code: "order_bump_currency_mismatch",
        message: "Selected order bump currency must match the primary sandbox offer.",
      };
    }
    orderBumpItems.push({ ...orderBumpOffer, kind: "order_bump" });
  }

  return {
    ok: true as const,
    items: [{ ...primaryOffer, kind: "primary" as const }, ...orderBumpItems],
    primary: primaryOffer,
    selectedOrderBumpPriceIds: orderBumpItems.map((item) => item.price.id),
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
  items: CheckoutItem[];
  origin: string;
  reason: string;
  mode: string;
}) {
  const [primaryItem] = input.items;

  return NextResponse.json({
    ok: true,
    status: "preview",
    reason: input.reason,
    mode: input.mode,
    offer: safeOffer(primaryItem.product, primaryItem.price, "primary"),
    lineItems: safeLineItems(input.items),
    selectedOrderBumpPriceIds: input.items.filter((item) => item.kind === "order_bump").map((item) => item.price.id),
    totalAmountCents: totalAmountCents(input.items),
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
    items: CheckoutItem[];
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
      totalAmountCents(input.items),
      input.price.currency,
      input.mode,
      input.successUrl,
      input.cancelUrl,
      input.auditCorrelationId,
      input.agentClientId,
      JSON.stringify({
        checkout_surface: "sandbox",
        issue: 99,
        primary_price_id: input.price.id,
        selected_order_bump_price_ids: input.items
          .filter((item) => item.kind === "order_bump")
          .map((item) => item.price.id),
        line_items: safeLineItems(input.items),
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
  items: CheckoutItem[];
  intent: CheckoutIntentRow;
  idempotencyKey: string;
  successUrl: string;
  cancelUrl: string;
  buyerEmail: string | null;
}) {
  const session = await input.stripe.checkout.sessions.create(
    {
      mode: checkoutModeForPrice(input.price),
      line_items: input.items.map((item) => lineItemForPrice(item.product, item.price)),
      success_url: appendCheckoutQuery(input.successUrl, input.intent.id),
      cancel_url: input.cancelUrl,
      client_reference_id: input.intent.id,
      customer_email: input.buyerEmail ?? undefined,
      metadata: {
        checkout_intent_id: input.intent.id,
        product_id: input.product.id,
        price_id: input.price.id,
        selected_order_bump_price_ids: input.items
          .filter((item) => item.kind === "order_bump")
          .map((item) => item.price.id)
          .join(","),
        audit_correlation_id: input.intent.audit_correlation_id ?? "",
        bumpgrade_issue: "99",
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
        issue: 99,
        stripe_checkout_url: session.url,
        primary_price_id: input.price.id,
        selected_order_bump_price_ids: input.items
          .filter((item) => item.kind === "order_bump")
          .map((item) => item.price.id),
        line_items: safeLineItems(input.items),
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
      lineItems: safeLineItems(input.items),
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
    orderBumps: checkoutOfferStack.orderBumps.map((orderBump) => ({
      id: orderBump.id,
      priceId: orderBump.priceId,
      title: orderBump.title,
      unitAmountCents: orderBump.unitAmountCents,
      currency: orderBump.currency,
    })),
    supportsOrderBumps: true,
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
  const checkoutSelection = await loadCheckoutItems(db, {
    primaryPriceId: body.priceId ?? sandboxCheckoutPriceId,
    orderBumpPriceIds: parseOrderBumpPriceIds(body.orderBumpPriceIds),
  });
  if (!checkoutSelection.ok) {
    return jsonError(checkoutSelection.status, checkoutSelection.code, checkoutSelection.message);
  }

  const mode = stripeModeFromEnv(env);
  const secret = stripeSecretKeyFromEnv(env, mode);
  const origin = request.nextUrl.origin;

  if (mode !== "sandbox") {
    return jsonError(409, "live_mode_disabled", "This route is sandbox-only.");
  }

  if (body.previewOnly || env.APP_ENV === "test" || body.confirmationText !== checkoutConfirmationText) {
    return previewResponse({
      items: checkoutSelection.items,
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
      items: checkoutSelection.items,
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
    product: checkoutSelection.primary.product,
    price: checkoutSelection.primary.price,
    items: checkoutSelection.items,
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
      productId: checkoutSelection.primary.product.id,
      priceId: checkoutSelection.primary.price.id,
      lineItems: safeLineItems(checkoutSelection.items),
      idempotencyKey,
    },
  });

  try {
    const stripe = createStripeClient(secret);
    await createStripeSession({
      db,
      stripe,
      product: checkoutSelection.primary.product,
      price: checkoutSelection.primary.price,
      items: checkoutSelection.items,
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
          issue: 99,
          selected_order_bump_price_ids: checkoutSelection.selectedOrderBumpPriceIds,
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
