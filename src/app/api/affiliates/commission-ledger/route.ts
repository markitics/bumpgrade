import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import {
  affiliateCommissionLedgerApiRoute,
  affiliateCommissionLedgerConfirmationText,
  affiliateCommissionLedgerContract,
  createReviewOnlyCommissionLedger,
} from "@/lib/affiliate-commission-ledger";

type CommissionLedgerRequestBody = {
  checkoutIntentId?: string;
  confirmationText?: string;
  idempotencyKey?: string;
  agentClientId?: string;
};

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return cloudflareEnv.DB;
}

async function parseBody(request: NextRequest): Promise<CommissionLedgerRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as CommissionLedgerRequestBody;
  } catch {
    return {};
  }
}

function parseOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    id: affiliateCommissionLedgerContract.id,
    status: affiliateCommissionLedgerContract.status,
    issue: affiliateCommissionLedgerContract.issue,
    route: affiliateCommissionLedgerApiRoute,
    confirmation: {
      required: true,
      text: affiliateCommissionLedgerConfirmationText,
    },
    contract: affiliateCommissionLedgerContract,
    redaction: {
      rawStripeIdsIncluded: false,
      privateDataIncluded: false,
      payableCommissionCreated: false,
      payoutCreated: false,
      taxDataIncluded: false,
      partnerNotificationSent: false,
    },
  });
}

export async function POST(request: NextRequest) {
  const db = await getDb();
  const body = await parseBody(request);
  const checkoutIntentId = parseOptionalString(body.checkoutIntentId);
  const idempotencyKey = parseOptionalString(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim();
  const agentClientId = parseOptionalString(body.agentClientId);

  if (!checkoutIntentId) {
    return jsonError(400, "checkout_intent_required", "A checkout intent ID is required.");
  }

  if (!idempotencyKey) {
    return jsonError(400, "idempotency_key_required", "An idempotency key is required.");
  }

  if (body.confirmationText !== affiliateCommissionLedgerConfirmationText) {
    return jsonError(
      400,
      "commission_ledger_confirmation_required",
      "Exact confirmation text is required before creating review-only commission ledger evidence.",
    );
  }

  const result = await createReviewOnlyCommissionLedger({
    db,
    checkoutIntentId,
    idempotencyKey,
    actorId: agentClientId,
  });

  if (!result.ok) {
    return jsonError(result.status, result.code, result.message);
  }

  return NextResponse.json({
    ok: true,
    status: result.duplicate ? "review_only_commission_replayed" : "review_only_commission_recorded",
    duplicate: result.duplicate,
    commissionLedger: result.ledger,
    redaction: {
      rawStripeIdsIncluded: false,
      privateDataIncluded: false,
      payableCommissionCreated: false,
      payoutCreated: false,
      taxDataIncluded: false,
      partnerNotificationSent: false,
    },
  });
}
