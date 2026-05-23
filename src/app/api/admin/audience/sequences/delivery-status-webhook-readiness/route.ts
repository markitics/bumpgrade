import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  audienceSequenceDeliveryStatusWebhookReadinessApiRoute,
  audienceSequenceDeliveryStatusWebhookReadinessIssue,
  audienceSequenceDeliveryStatusWebhookReadinessStatus,
  createAudienceSequenceDeliveryStatusWebhookReadiness,
  getAudienceSequenceDeliveryStatusWebhookReadinessSummary,
} from "@/lib/audience-sequence-delivery-status-webhook-readiness";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SequenceDeliveryStatusWebhookReadinessRequestBody = {
  deliveryResultReadinessId?: unknown;
  sequenceId?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedSequenceStatus?: unknown;
  expectedReadyEnrollmentCount?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<SequenceDeliveryStatusWebhookReadinessRequestBody> {
  try {
    return (await request.json()) as SequenceDeliveryStatusWebhookReadinessRequestBody;
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
  const summary = await getAudienceSequenceDeliveryStatusWebhookReadinessSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: audienceSequenceDeliveryStatusWebhookReadinessStatus,
    issue: audienceSequenceDeliveryStatusWebhookReadinessIssue,
    route: audienceSequenceDeliveryStatusWebhookReadinessApiRoute,
    confirmation: summary.confirmation,
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAudienceSequenceDeliveryStatusWebhookReadinessSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAudienceSequenceDeliveryStatusWebhookReadiness({
    deliveryResultReadinessId: body.deliveryResultReadinessId,
    sequenceId: body.sequenceId,
    expectedWorkspaceRevisionId: body.expectedWorkspaceRevisionId,
    expectedSequenceStatus: body.expectedSequenceStatus,
    expectedReadyEnrollmentCount: body.expectedReadyEnrollmentCount,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "delivery_result_readiness_not_found" || result.status === "sequence_not_found"
        ? 404
        : result.status === "readiness_unavailable"
          ? 503
          : result.status === "stale_workspace_revision" ||
              result.status === "stale_sequence_status" ||
              result.status === "stale_readiness_count" ||
              result.status === "stale_delivery_result_readiness_status" ||
              result.status === "stale_delivery_result_readiness_evidence" ||
              result.status === "delivery_status_webhook_gate_not_ready"
            ? 409
            : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentWorkspaceRevisionId: result.currentWorkspaceRevisionId,
      currentSequenceStatus: result.currentSequenceStatus,
      currentReadyEnrollmentCount: result.currentReadyEnrollmentCount,
      currentDeliveryResultReadinessStatus: result.currentDeliveryResultReadinessStatus,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
