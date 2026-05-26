import { NextRequest, NextResponse } from "next/server";

import {
  agentFunnelResourceDeliveryTokenApiRoute,
  agentFunnelResourceDeliveryTokenCapability,
  agentFunnelResourceDeliveryTokenConfirmationText,
  agentFunnelResourceDeliveryTokenIssue,
} from "@/lib/funnels";
import {
  agentFunnelResourceDeliveryTokenRedaction,
  createAgentFunnelResourceDeliveryToken,
} from "@/lib/agent-funnel-resource-delivery-tokens";
import { getSessionAdminState } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AgentFunnelResourceDeliveryTokenBody = {
  funnelSlug?: unknown;
  funnel_slug?: unknown;
  blockId?: unknown;
  block_id?: unknown;
  checkoutIntentId?: unknown;
  checkout_intent_id?: unknown;
  entitlementId?: unknown;
  entitlement_id?: unknown;
  expectedFunnelRevisionId?: unknown;
  expected_funnel_revision_id?: unknown;
  confirmationText?: unknown;
  confirmation_text?: unknown;
  idempotencyKey?: unknown;
  idempotency_key?: unknown;
  auditCorrelationId?: unknown;
  audit_correlation_id?: unknown;
};

async function parseBody(request: NextRequest): Promise<AgentFunnelResourceDeliveryTokenBody> {
  try {
    return (await request.json()) as AgentFunnelResourceDeliveryTokenBody;
  } catch {
    return {};
  }
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { ok: false, code, message, redaction: agentFunnelResourceDeliveryTokenRedaction, ...(extra ?? {}) },
    { status },
  );
}

function responseStatus(resultStatus: string, replayed?: boolean) {
  if (replayed) return 200;
  if (resultStatus === "invalid_request") return 400;
  if (resultStatus === "not_found") return 404;
  if (resultStatus === "not_eligible" || resultStatus === "stale_funnel_revision" || resultStatus === "idempotency_conflict") {
    return 409;
  }
  if (resultStatus === "unavailable") return 503;
  return 201;
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);

  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  if (adminState.identity.role !== "owner") {
    return jsonError(403, "owner_role_required", "Owner role required.");
  }

  return NextResponse.json({
    ok: true,
    id: agentFunnelResourceDeliveryTokenCapability.id,
    status: agentFunnelResourceDeliveryTokenCapability.status,
    issue: agentFunnelResourceDeliveryTokenIssue,
    route: agentFunnelResourceDeliveryTokenApiRoute,
    contract: agentFunnelResourceDeliveryTokenCapability,
    confirmation: {
      required: true,
      exactText: agentFunnelResourceDeliveryTokenConfirmationText,
    },
    redaction: agentFunnelResourceDeliveryTokenRedaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);

  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  if (adminState.identity.role !== "owner") {
    return jsonError(403, "owner_role_required", "Owner role required.");
  }

  const body = await parseBody(request);
  const result = await createAgentFunnelResourceDeliveryToken({
    actor: adminState.identity,
    funnelSlug: body.funnelSlug ?? body.funnel_slug,
    blockId: body.blockId ?? body.block_id,
    checkoutIntentId: body.checkoutIntentId ?? body.checkout_intent_id,
    entitlementId: body.entitlementId ?? body.entitlement_id,
    expectedFunnelRevisionId: body.expectedFunnelRevisionId ?? body.expected_funnel_revision_id,
    confirmationText: body.confirmationText ?? body.confirmation_text,
    idempotencyKey: body.idempotencyKey ?? body.idempotency_key ?? request.headers.get("idempotency-key"),
    auditCorrelationId: body.auditCorrelationId ?? body.audit_correlation_id,
  });

  return NextResponse.json(result, { status: responseStatus(result.status, result.ok ? result.replayed : false) });
}
