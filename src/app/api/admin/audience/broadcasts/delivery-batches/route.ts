import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  audienceBroadcastDeliveryBatchApiRoute,
  audienceBroadcastDeliveryBatchIssue,
  audienceBroadcastDeliveryBatchStatus,
  createAudienceBroadcastDeliveryBatch,
  getAudienceBroadcastDeliveryBatchSummary,
} from "@/lib/audience-broadcasts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DeliveryBatchRequestBody = {
  scheduleIntentId?: unknown;
  draftId?: unknown;
  expectedDraftUpdatedAt?: unknown;
  expectedReadyRecipientCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<DeliveryBatchRequestBody> {
  try {
    return (await request.json()) as DeliveryBatchRequestBody;
  } catch {
    return {};
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function jsonError(status: number, code: string, message: string, redaction: Record<string, unknown>, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, redaction, ...(extra ?? {}) }, { status });
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAudienceBroadcastDeliveryBatchSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: audienceBroadcastDeliveryBatchStatus,
    issue: audienceBroadcastDeliveryBatchIssue,
    route: audienceBroadcastDeliveryBatchApiRoute,
    confirmation: summary.confirmation,
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAudienceBroadcastDeliveryBatchSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAudienceBroadcastDeliveryBatch({
    scheduleIntentId: body.scheduleIntentId,
    draftId: body.draftId,
    expectedDraftUpdatedAt: body.expectedDraftUpdatedAt,
    expectedReadyRecipientCount: body.expectedReadyRecipientCount,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "schedule_intent_not_found" || result.status === "broadcast_draft_not_found"
        ? 404
        : result.status === "readiness_unavailable" ||
            result.status === "preview_safety_unavailable" ||
            result.status === "queue_readiness_unavailable"
          ? 503
          : result.status === "stale_draft_revision" || result.status === "stale_readiness_count"
            ? 409
            : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentDraftUpdatedAt: result.currentDraftUpdatedAt,
      currentReadyRecipientCount: result.currentReadyRecipientCount,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
