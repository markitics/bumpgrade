import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import {
  postPurchaseDecisionApiRoute,
  postPurchaseDecisionConfirmationText,
  postPurchaseDecisionContract,
  loadPostPurchaseCheckout,
  publicPostPurchaseCheckout,
  recordPostPurchaseDecision,
} from "@/lib/post-purchase-decisions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DecisionRequestBody = {
  checkoutIntentId?: string;
  decisionKind?: string;
  confirmationText?: string;
  idempotencyKey?: string;
  expectedCheckoutUpdatedAt?: number;
};

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return cloudflareEnv.DB;
}

async function parseBody(request: NextRequest): Promise<DecisionRequestBody> {
  if (!request.body) return {};
  try {
    return (await request.json()) as DecisionRequestBody;
  } catch {
    return {};
  }
}

function parseOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function parseExpectedUpdatedAt(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) return null;
  return value;
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, ...(extra ?? {}) }, { status });
}

function redaction() {
  return {
    stripeChargeCreated: false,
    paymentIntentCreated: false,
    fulfillmentCreated: false,
    entitlementGranted: false,
    payableCommissionCreated: false,
    payoutCreated: false,
    privateDataIncluded: false,
    rawStripeIdsIncluded: false,
  };
}

export async function GET(request: NextRequest) {
  const checkoutIntentId = request.nextUrl.searchParams.get("checkoutIntentId")?.trim();
  const checkout = checkoutIntentId ? await loadPostPurchaseCheckout(await getDb(), checkoutIntentId) : null;

  return NextResponse.json({
    ok: true,
    id: postPurchaseDecisionContract.id,
    status: postPurchaseDecisionContract.status,
    issue: postPurchaseDecisionContract.issue,
    route: postPurchaseDecisionApiRoute,
    confirmation: {
      required: true,
      text: postPurchaseDecisionConfirmationText,
    },
    contract: postPurchaseDecisionContract,
    checkout: checkout ? publicPostPurchaseCheckout(checkout) : null,
    redaction: redaction(),
  });
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request);
  const checkoutIntentId = parseOptionalString(body.checkoutIntentId);
  const decisionKind = parseOptionalString(body.decisionKind);
  const idempotencyKey = parseOptionalString(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim();
  const expectedCheckoutUpdatedAt = parseExpectedUpdatedAt(body.expectedCheckoutUpdatedAt);

  if (!checkoutIntentId) {
    return jsonError(400, "checkout_intent_required", "A checkout intent ID is required.");
  }

  if (!decisionKind) {
    return jsonError(400, "post_purchase_decision_required", "A post-purchase decision kind is required.");
  }

  if (!idempotencyKey) {
    return jsonError(400, "idempotency_key_required", "An idempotency key is required.");
  }

  if (!expectedCheckoutUpdatedAt) {
    return jsonError(400, "expected_checkout_updated_at_required", "The current checkout updatedAt value is required.");
  }

  if (body.confirmationText !== postPurchaseDecisionConfirmationText) {
    return jsonError(
      400,
      "post_purchase_confirmation_required",
      "Exact confirmation text is required before recording a post-purchase decision.",
    );
  }

  const db = await getDb();
  const result = await recordPostPurchaseDecision({
    db,
    checkoutIntentId,
    decisionKind,
    idempotencyKey,
    expectedCheckoutUpdatedAt,
  });

  if (!result.ok) {
    return jsonError(result.status, result.code, result.message, result.checkout ? { checkout: result.checkout } : undefined);
  }

  return NextResponse.json({
    ok: true,
    status: result.duplicate ? "post_purchase_decision_replayed" : "post_purchase_decision_recorded",
    duplicate: result.duplicate,
    decision: result.decision,
    redaction: redaction(),
  });
}
