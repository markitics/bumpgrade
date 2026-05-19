import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  affiliateCommissionReviewActionConfirmationText,
  affiliateCommissionReviewActionsApiRoute,
  affiliateCommissionReviewActionsContract,
  applyOwnerCommissionLedgerAction,
  type AffiliateCommissionReviewActionKind,
} from "@/lib/affiliate-commission-ledger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ReviewActionRequestBody = {
  commissionLedgerId?: string;
  actionKind?: string;
  confirmationText?: string;
  idempotencyKey?: string;
  expectedUpdatedAt?: number;
  reason?: string;
};

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return cloudflareEnv.DB;
}

async function parseBody(request: NextRequest): Promise<ReviewActionRequestBody> {
  if (!request.body) return {};

  try {
    return (await request.json()) as ReviewActionRequestBody;
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

function parseActionKind(value: unknown): AffiliateCommissionReviewActionKind | null {
  if (value === "mark_reviewed" || value === "hold_for_review" || value === "reverse_evidence") return value;
  return null;
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, ...(extra ?? {}) }, { status });
}

function redaction() {
  return {
    rawStripeIdsIncluded: false,
    privateDataIncluded: false,
    payableCommissionCreated: false,
    payoutCreated: false,
    taxDataIncluded: false,
    partnerNotificationSent: false,
  };
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: affiliateCommissionReviewActionsContract.id,
    status: affiliateCommissionReviewActionsContract.status,
    issue: affiliateCommissionReviewActionsContract.issue,
    route: affiliateCommissionReviewActionsApiRoute,
    confirmation: {
      required: true,
      text: affiliateCommissionReviewActionConfirmationText,
    },
    contract: affiliateCommissionReviewActionsContract,
    redaction: redaction(),
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const commissionLedgerId = parseOptionalString(body.commissionLedgerId);
  const actionKind = parseActionKind(body.actionKind);
  const idempotencyKey = parseOptionalString(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim();
  const expectedUpdatedAt = parseExpectedUpdatedAt(body.expectedUpdatedAt);

  if (!commissionLedgerId) {
    return jsonError(400, "commission_ledger_required", "A commission ledger ID is required.");
  }

  if (!actionKind) {
    return jsonError(400, "commission_review_action_unsupported", "Unsupported commission review action.");
  }

  if (!idempotencyKey) {
    return jsonError(400, "idempotency_key_required", "An idempotency key is required.");
  }

  if (!expectedUpdatedAt) {
    return jsonError(400, "expected_updated_at_required", "The current commission ledger updatedAt value is required.");
  }

  if (body.confirmationText !== affiliateCommissionReviewActionConfirmationText) {
    return jsonError(
      400,
      "commission_review_confirmation_required",
      "Exact confirmation text is required before applying owner commission review actions.",
    );
  }

  const db = await getDb();
  const result = await applyOwnerCommissionLedgerAction({
    db,
    commissionLedgerId,
    actionKind,
    idempotencyKey,
    expectedUpdatedAt,
    actor: adminState.identity,
    reason: body.reason,
  });

  if (!result.ok) {
    return jsonError(result.status, result.code, result.message, result.ledger ? { commissionLedger: result.ledger } : undefined);
  }

  return NextResponse.json({
    ok: true,
    status: result.duplicate ? "commission_review_action_replayed" : "commission_review_action_recorded",
    duplicate: result.duplicate,
    reviewAction: result.action,
    commissionLedger: result.ledger,
    redaction: redaction(),
  });
}
