import type Stripe from "stripe";

import { site } from "@/lib/site";
import { type StripeMode } from "@/lib/commerce";

type CheckoutSessionCreateParams = NonNullable<Parameters<Stripe["checkout"]["sessions"]["create"]>[0]>;
type CheckoutLineItem = NonNullable<CheckoutSessionCreateParams["line_items"]>[number];
type CheckoutMode = NonNullable<CheckoutSessionCreateParams["mode"]>;

export const sandboxCheckoutProductId = "product-bumpgrade-sandbox-launch-pass";
export const sandboxCheckoutPriceId = "price-bumpgrade-sandbox-launch-pass-usd";
export const checkoutConfirmationText = "Create sandbox checkout for Bumpgrade sandbox launch pass at 9.00 USD";

export const checkoutRoutes = {
  start: "/api/commerce/checkout",
  webhook: "/api/stripe/webhook",
  redirect: "/api/commerce/checkout/redirect",
  success: "/commerce/checkout/success",
  cancel: "/commerce/checkout/cancel",
};

export const sandboxCheckoutOffer = {
  id: "sandbox-launch-pass",
  productId: sandboxCheckoutProductId,
  priceId: sandboxCheckoutPriceId,
  name: "Bumpgrade sandbox launch pass",
  summary:
    "A one-time sandbox checkout offer used to prove Checkout Session creation, D1 intent persistence, webhook idempotency, and redacted payment audit trails before live billing is enabled.",
  currency: "usd",
  unitAmountCents: 900,
  billingInterval: "one_time",
  mode: "sandbox" as StripeMode,
  issue: 34,
  status: "sandbox-live",
};

export type CommerceProductRow = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  status: string;
  description: string | null;
  fulfillment_kind: string;
};

export type CommercePriceRow = {
  id: string;
  product_id: string;
  nickname: string | null;
  currency: string;
  unit_amount_cents: number;
  billing_interval: string;
  stripe_price_id: string | null;
  active: number;
};

export type CheckoutIntentRow = {
  id: string;
  idempotency_key: string;
  checkout_kind: string;
  status: string;
  product_id: string | null;
  price_id: string | null;
  buyer_email: string | null;
  amount_cents: number;
  currency: string;
  stripe_mode: StripeMode;
  stripe_checkout_session_id: string | null;
  success_url: string | null;
  cancel_url: string | null;
  audit_correlation_id: string | null;
  agent_client_id: string | null;
  metadata_json: string | null;
};

export function hasUsableSandboxSecret(secret: string | undefined) {
  return Boolean(secret && /^sk_test_[A-Za-z0-9_]{20,}$/.test(secret));
}

export function publicCheckoutUrl(origin: string, path: string) {
  return new URL(path, origin || site.url).toString();
}

export function checkoutRedirectUrl(origin: string, intentId: string) {
  return publicCheckoutUrl(origin, `${checkoutRoutes.redirect}/${intentId}`);
}

export function appendCheckoutQuery(url: string, intentId: string) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set("checkout_intent_id", intentId);
  nextUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  return nextUrl.toString();
}

export function checkoutModeForPrice(price: CommercePriceRow): CheckoutMode {
  return price.billing_interval === "one_time" ? "payment" : "subscription";
}

export function lineItemForPrice(
  product: CommerceProductRow,
  price: CommercePriceRow,
): CheckoutLineItem {
  if (price.stripe_price_id) {
    return { price: price.stripe_price_id, quantity: 1 };
  }

  const priceData: NonNullable<CheckoutLineItem["price_data"]> = {
    currency: price.currency,
    unit_amount: price.unit_amount_cents,
    product_data: {
      name: product.name,
      description: product.description ?? undefined,
      metadata: {
        bumpgrade_product_id: product.id,
      },
    },
  };

  if (price.billing_interval !== "one_time") {
    priceData.recurring = { interval: price.billing_interval as NonNullable<typeof priceData.recurring>["interval"] };
  }

  return {
    price_data: priceData,
    quantity: 1,
  };
}

export function parseIntentMetadata(intent: Pick<CheckoutIntentRow, "metadata_json">) {
  if (!intent.metadata_json) return {};

  try {
    return JSON.parse(intent.metadata_json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function redactedStripeEventPayload(event: Stripe.Event) {
  const object = event.data.object as Stripe.Event.Data.Object & {
    object?: string;
    status?: string | null;
    payment_status?: string | null;
    client_reference_id?: string | null;
    metadata?: Record<string, string> | null;
  };

  return {
    id: event.id,
    type: event.type,
    apiVersion: event.api_version ?? null,
    livemode: event.livemode,
    created: event.created,
    objectType: object.object ?? null,
    status: object.status ?? null,
    paymentStatus: object.payment_status ?? null,
    clientReferenceId: object.client_reference_id ?? null,
    metadata: {
      checkoutIntentId: object.metadata?.checkout_intent_id ?? null,
      productId: object.metadata?.product_id ?? null,
      priceId: object.metadata?.price_id ?? null,
      auditCorrelationId: object.metadata?.audit_correlation_id ?? null,
    },
  };
}
