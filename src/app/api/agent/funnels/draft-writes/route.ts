import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  archiveDraftFunnel,
  draftFunnelArchiveConfirmationText,
  draftFunnelDuplicationConfirmationText,
  draftFunnelResourceDeliveryLinkConfirmationText,
  draftFunnelWebinarEventLinkConfirmationText,
  duplicateDraftFunnel,
  getFunnelDraftD1OrThrow,
  linkDraftFunnelBlockToResourceDelivery,
  linkDraftFunnelBlockToWebinarEvent,
  updateDraftFunnelBlock,
  type DraftFunnelRecord,
} from "@/lib/funnel-drafts";
import {
  agentFunnelDraftWriteApiRoute,
  agentFunnelDraftWriteCapability,
  agentFunnelDraftWriteConfirmationText,
  agentFunnelDraftWriteIssue,
  agentFunnelDraftWriteOperationIds,
} from "@/lib/funnels";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AgentFunnelDraftWriteRequestBody = {
  operationId?: unknown;
  draftId?: unknown;
  stepId?: unknown;
  blockId?: unknown;
  productId?: unknown;
  assetId?: unknown;
  eventTitle?: unknown;
  registrationUrl?: unknown;
  replayUrl?: unknown;
  providerLabel?: unknown;
  title?: unknown;
  body?: unknown;
  expectedRevisionId?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
  auditCorrelationId?: unknown;
};

async function parseBody(request: NextRequest): Promise<AgentFunnelDraftWriteRequestBody> {
  try {
    return (await request.json()) as AgentFunnelDraftWriteRequestBody;
  } catch {
    return {};
  }
}

function stringValue(value: unknown, maxLength = 1_200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function redaction() {
  return {
    ownerEmailIncluded: false,
    ownerUserIdIncluded: false,
    idempotencyKeyIncluded: false,
    rawRowsIncluded: false,
    privateSessionIncluded: false,
    providerSecretsIncluded: false,
    rawR2KeysIncluded: false,
    signedUrlsIncluded: false,
    buyerDataIncluded: false,
    billingMutationCreated: false,
    publicAgentWriteCreated: false,
  };
}

function redactedDraftSummary(draft: DraftFunnelRecord) {
  return {
    id: draft.id,
    slug: draft.slug,
    title: draft.title,
    status: draft.status,
    summary: draft.summary,
    previewRoute: draft.previewRoute,
    sourceDataRoute: draft.sourceDataRoute,
    revisionId: draft.revisionId,
    stepCount: draft.steps.length,
    blockCount: draft.steps.reduce((total, step) => total + step.blocks.length, 0),
    publicRouteChanged: draft.status === "archived",
    ownerEmailIncluded: false,
    ownerUserIdIncluded: false,
    rawRowsIncluded: false,
  };
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, redaction: redaction(), ...(extra ?? {}) }, { status });
}

function errorStatus(message: string) {
  if (/revision changed/i.test(message)) return { status: 409, code: "stale_draft_revision" };
  if (/not found/i.test(message)) return { status: 404, code: "draft_target_not_found" };
  if (/confirmation/i.test(message)) return { status: 400, code: "confirmation_required" };
  return { status: 400, code: "invalid_agent_funnel_write" };
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
    id: agentFunnelDraftWriteCapability.id,
    status: agentFunnelDraftWriteCapability.status,
    issue: agentFunnelDraftWriteIssue,
    route: agentFunnelDraftWriteApiRoute,
    contract: agentFunnelDraftWriteCapability,
    confirmation: {
      required: true,
      exactText: agentFunnelDraftWriteConfirmationText,
    },
    allowedOperations: agentFunnelDraftWriteCapability.allowedOperations,
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

  if (adminState.identity.role !== "owner") {
    return jsonError(403, "owner_role_required", "Owner role required.");
  }

  const body = await parseBody(request);
  const operationId = stringValue(body.operationId, 80);
  const idempotencyKey = stringValue(body.idempotencyKey, 220) || request.headers.get("idempotency-key")?.trim() || "";
  const auditCorrelationId = stringValue(body.auditCorrelationId, 220);
  const expectedRevisionId = stringValue(body.expectedRevisionId, 260);
  const draftId = stringValue(body.draftId, 220);

  if (!agentFunnelDraftWriteOperationIds.includes(operationId as (typeof agentFunnelDraftWriteOperationIds)[number])) {
    return jsonError(400, "unsupported_operation", "Choose a supported agent funnel draft write operation.", {
      allowedOperations: agentFunnelDraftWriteOperationIds,
    });
  }

  if (!draftId || !expectedRevisionId || !idempotencyKey || !auditCorrelationId) {
    return jsonError(
      400,
      "invalid_request",
      "draftId, expectedRevisionId, idempotencyKey, and auditCorrelationId are required.",
    );
  }

  if (body.confirmationText !== agentFunnelDraftWriteConfirmationText) {
    return jsonError(400, "confirmation_required", "Exact agent funnel write confirmation text is required.");
  }

  const agentWriteAudit = {
    operationId,
    auditCorrelationId,
  };

  try {
    const db = await getFunnelDraftD1OrThrow();
    let draft: DraftFunnelRecord;

    if (operationId === "update-block") {
      const stepId = stringValue(body.stepId, 220);
      const blockId = stringValue(body.blockId, 220);
      const title = stringValue(body.title, 140);
      const blockBody = stringValue(body.body);

      if (!stepId || !blockId || (!title && !blockBody)) {
        return jsonError(
          400,
          "invalid_update_block_request",
          "update-block requires stepId, blockId, and at least one title or body value.",
        );
      }

      draft = await updateDraftFunnelBlock(db, adminState.identity, {
        draftId,
        stepId,
        blockId,
        title,
        body: blockBody,
        expectedRevisionId,
        idempotencyKey,
        agentWriteAudit,
      });
    } else if (operationId === "link-resource-delivery") {
      const stepId = stringValue(body.stepId, 220);
      const blockId = stringValue(body.blockId, 220);
      const productId = stringValue(body.productId, 220);
      const assetId = stringValue(body.assetId, 220);

      if (!stepId || !blockId || !productId || !assetId) {
        return jsonError(
          400,
          "invalid_resource_delivery_link_request",
          "link-resource-delivery requires stepId, blockId, productId, and assetId.",
        );
      }

      draft = await linkDraftFunnelBlockToResourceDelivery(db, adminState.identity, {
        draftId,
        stepId,
        blockId,
        productId,
        assetId,
        expectedRevisionId,
        confirmationText: draftFunnelResourceDeliveryLinkConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    } else if (operationId === "link-webinar-event") {
      const stepId = stringValue(body.stepId, 220);
      const blockId = stringValue(body.blockId, 220);
      const eventTitle = stringValue(body.eventTitle, 180);
      const registrationUrl = stringValue(body.registrationUrl, 600);
      const replayUrl = stringValue(body.replayUrl, 600);
      const providerLabel = stringValue(body.providerLabel, 120);

      if (!stepId || !blockId || !eventTitle || !registrationUrl || !providerLabel) {
        return jsonError(
          400,
          "invalid_webinar_event_link_request",
          "link-webinar-event requires stepId, blockId, eventTitle, registrationUrl, and providerLabel.",
        );
      }

      draft = await linkDraftFunnelBlockToWebinarEvent(db, adminState.identity, {
        draftId,
        stepId,
        blockId,
        eventTitle,
        registrationUrl,
        replayUrl,
        providerLabel,
        expectedRevisionId,
        confirmationText: draftFunnelWebinarEventLinkConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    } else if (operationId === "duplicate-draft") {
      draft = await duplicateDraftFunnel(db, adminState.identity, {
        draftId,
        title: stringValue(body.title, 140),
        expectedRevisionId,
        confirmationText: draftFunnelDuplicationConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    } else {
      draft = await archiveDraftFunnel(db, adminState.identity, {
        draftId,
        expectedRevisionId,
        confirmationText: draftFunnelArchiveConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        status: "agent_funnel_draft_write_recorded",
        operationId,
        issue: agentFunnelDraftWriteIssue,
        route: agentFunnelDraftWriteApiRoute,
        auditCorrelationId,
        draft: redactedDraftSummary(draft),
        redaction: redaction(),
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record agent funnel draft write.";
    const mapped = errorStatus(message);
    return jsonError(mapped.status, mapped.code, message);
  }
}
