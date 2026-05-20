import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  audienceBroadcastDeliveryQueueMessageApiRoute,
  audienceBroadcastDeliveryQueueMessageIssue,
  audienceBroadcastDeliveryQueueMessageStatus,
  createAudienceBroadcastDeliveryQueueMessages,
  getAudienceBroadcastDeliveryQueueMessageSummary,
} from "@/lib/audience-broadcasts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DeliveryQueueMessagesRequestBody = {
  deliveryBatchId?: unknown;
  draftId?: unknown;
  expectedDraftUpdatedAt?: unknown;
  expectedReadyRecipientCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<DeliveryQueueMessagesRequestBody> {
  try {
    return (await request.json()) as DeliveryQueueMessagesRequestBody;
  } catch {
    return {};
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function jsonError(
  status: number,
  code: string,
  message: string,
  redaction: Record<string, unknown>,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ ok: false, code, message, redaction, ...(extra ?? {}) }, { status });
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAudienceBroadcastDeliveryQueueMessageSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: audienceBroadcastDeliveryQueueMessageStatus,
    issue: audienceBroadcastDeliveryQueueMessageIssue,
    route: audienceBroadcastDeliveryQueueMessageApiRoute,
    confirmation: summary.confirmation,
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAudienceBroadcastDeliveryQueueMessageSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAudienceBroadcastDeliveryQueueMessages({
    deliveryBatchId: body.deliveryBatchId,
    draftId: body.draftId,
    expectedDraftUpdatedAt: body.expectedDraftUpdatedAt,
    expectedReadyRecipientCount: body.expectedReadyRecipientCount,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "delivery_batch_not_found" || result.status === "broadcast_draft_not_found"
        ? 404
        : result.status === "readiness_unavailable" || result.status === "queue_readiness_unavailable"
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
