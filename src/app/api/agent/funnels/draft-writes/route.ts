import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  addDraftFunnelBlock,
  archiveDraftFunnel,
  bulkPurgeArchivedDraftFunnels,
  draftFunnelArchiveConfirmationText,
  draftFunnelBulkPurgeConfirmationText,
  draftFunnelCheckoutLinkConfirmationText,
  draftFunnelCheckoutUnlinkConfirmationText,
  draftFunnelDuplicationConfirmationText,
  draftFunnelPurgeConfirmationText,
  draftFunnelPublishConfirmationText,
  draftFunnelResourceDeliveryLinkConfirmationText,
  draftFunnelWebinarEventLinkConfirmationText,
  duplicateDraftFunnel,
  getFunnelDraftD1OrThrow,
  linkDraftFunnelBlockToResourceDelivery,
  linkDraftFunnelBlockToWebinarEvent,
  linkDraftFunnelStepToCheckoutOffer,
  moveDraftFunnelBlockToStep,
  publishDraftFunnel,
  purgeArchivedDraftFunnel,
  reorderDraftFunnelBlock,
  removeDraftFunnelBlock,
  unlinkDraftFunnelCheckoutLink,
  updateDraftFunnelBlock,
  updateDraftFunnelBlockCanvasLayout,
  updateDraftFunnelBlockVisualStyle,
  type DraftFunnelBulkPurgeResult,
  type DraftFunnelPurgeResult,
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
  targetStepId?: unknown;
  blockId?: unknown;
  blockKind?: unknown;
  direction?: unknown;
  offerId?: unknown;
  productId?: unknown;
  assetId?: unknown;
  eventTitle?: unknown;
  registrationUrl?: unknown;
  replayUrl?: unknown;
  providerLabel?: unknown;
  visualStyleId?: unknown;
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
  zIndex?: unknown;
  title?: unknown;
  body?: unknown;
  expectedRevisionId?: unknown;
  targets?: unknown;
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

function redaction(input: { publicRouteMutationCreated?: boolean } = {}) {
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
    publicRouteMutationCreated: input.publicRouteMutationCreated ?? false,
    publicAgentWriteCreated: false,
  };
}

function redactedDraftSummary(draft: DraftFunnelRecord, input: { publicRouteChanged?: boolean } = {}) {
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
    publicRouteChanged: input.publicRouteChanged ?? false,
    ownerEmailIncluded: false,
    ownerUserIdIncluded: false,
    rawRowsIncluded: false,
  };
}

function redactedPurgeSummary(purge: DraftFunnelPurgeResult) {
  return {
    id: purge.id,
    draftId: purge.draftId,
    draftSlug: purge.draftSlug,
    draftTitle: purge.draftTitle,
    previousStatus: purge.previousStatus,
    previousRevisionId: purge.previousRevisionId,
    summary: purge.summary.replaceAll(purge.actorEmail, "owner"),
    metadata: purge.metadata,
    createdAt: purge.createdAt,
    actorEmailIncluded: false,
    idempotencyKeyIncluded: false,
    rawRowsIncluded: false,
  };
}

function redactedBulkPurgeSummary(bulkPurge: DraftFunnelBulkPurgeResult) {
  return {
    id: bulkPurge.id,
    requestedDraftCount: bulkPurge.requestedDraftCount,
    purgedDraftCount: bulkPurge.purgedDraftCount,
    idempotentReplayCount: bulkPurge.idempotentReplayCount,
    purges: bulkPurge.purges.map(redactedPurgeSummary),
    metadata: bulkPurge.metadata,
    createdAt: bulkPurge.createdAt,
    actorEmailIncluded: false,
    idempotencyKeyIncluded: false,
    rawRowsIncluded: false,
  };
}

function bulkPurgeTargets(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((target) => {
    if (!target || typeof target !== "object" || Array.isArray(target)) return [];
    const record = target as Record<string, unknown>;
    const draftId = stringValue(record.draftId, 220);
    const expectedRevisionId = stringValue(record.expectedRevisionId, 260);
    return draftId && expectedRevisionId ? [{ draftId, expectedRevisionId }] : [];
  });
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
  const isBulkPurge = operationId === "bulk-purge-archived-drafts";

  if (!agentFunnelDraftWriteOperationIds.includes(operationId as (typeof agentFunnelDraftWriteOperationIds)[number])) {
    return jsonError(400, "unsupported_operation", "Choose a supported agent funnel draft write operation.", {
      allowedOperations: agentFunnelDraftWriteOperationIds,
    });
  }

  if (!idempotencyKey || !auditCorrelationId || (!isBulkPurge && (!draftId || !expectedRevisionId))) {
    return jsonError(
      400,
      "invalid_request",
      isBulkPurge
        ? "idempotencyKey and auditCorrelationId are required."
        : "draftId, expectedRevisionId, idempotencyKey, and auditCorrelationId are required.",
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
    let draft: DraftFunnelRecord | null = null;
    let purge: DraftFunnelPurgeResult | null = null;
    let bulkPurge: DraftFunnelBulkPurgeResult | null = null;
    let publicRouteMutationCreated = false;

    if (operationId === "bulk-purge-archived-drafts") {
      bulkPurge = await bulkPurgeArchivedDraftFunnels(db, adminState.identity, {
        targets: bulkPurgeTargets(body.targets),
        confirmationText: draftFunnelBulkPurgeConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    } else if (operationId === "update-block") {
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
    } else if (operationId === "update-block-style") {
      const stepId = stringValue(body.stepId, 220);
      const blockId = stringValue(body.blockId, 220);
      const visualStyleId = stringValue(body.visualStyleId, 80);

      if (!stepId || !blockId || !visualStyleId) {
        return jsonError(
          400,
          "invalid_update_block_style_request",
          "update-block-style requires stepId, blockId, and visualStyleId.",
        );
      }

      draft = await updateDraftFunnelBlockVisualStyle(db, adminState.identity, {
        draftId,
        stepId,
        blockId,
        visualStyleId,
        expectedRevisionId,
        idempotencyKey,
        agentWriteAudit,
      });
      publicRouteMutationCreated = draft.status === "published";
    } else if (operationId === "update-block-canvas-layout") {
      const stepId = stringValue(body.stepId, 220);
      const blockId = stringValue(body.blockId, 220);

      if (
        !stepId ||
        !blockId ||
        body.x == null ||
        body.y == null ||
        body.width == null ||
        body.height == null ||
        body.zIndex == null
      ) {
        return jsonError(
          400,
          "invalid_update_block_canvas_layout_request",
          "update-block-canvas-layout requires stepId, blockId, x, y, width, height, and zIndex.",
        );
      }

      draft = await updateDraftFunnelBlockCanvasLayout(db, adminState.identity, {
        draftId,
        stepId,
        blockId,
        x: body.x,
        y: body.y,
        width: body.width,
        height: body.height,
        zIndex: body.zIndex,
        expectedRevisionId,
        idempotencyKey,
        agentWriteAudit,
      });
      publicRouteMutationCreated = draft.status === "published";
    } else if (operationId === "add-block") {
      const stepId = stringValue(body.stepId, 220);
      const blockKind = stringValue(body.blockKind, 80);
      const title = stringValue(body.title, 140);
      const blockBody = stringValue(body.body);

      if (!stepId || !blockKind) {
        return jsonError(400, "invalid_add_block_request", "add-block requires stepId and blockKind.");
      }

      draft = await addDraftFunnelBlock(db, adminState.identity, {
        draftId,
        stepId,
        blockKind,
        title,
        body: blockBody,
        expectedRevisionId,
        idempotencyKey,
        agentWriteAudit,
      });
    } else if (operationId === "remove-block") {
      const stepId = stringValue(body.stepId, 220);
      const blockId = stringValue(body.blockId, 220);

      if (!stepId || !blockId) {
        return jsonError(400, "invalid_remove_block_request", "remove-block requires stepId and blockId.");
      }

      draft = await removeDraftFunnelBlock(db, adminState.identity, {
        draftId,
        stepId,
        blockId,
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
    } else if (operationId === "link-checkout-offer") {
      const stepId = stringValue(body.stepId, 220);
      const offerId = stringValue(body.offerId, 220);

      if (!stepId || !offerId) {
        return jsonError(
          400,
          "invalid_checkout_link_request",
          "link-checkout-offer requires stepId and offerId.",
        );
      }

      draft = await linkDraftFunnelStepToCheckoutOffer(db, adminState.identity, {
        draftId,
        stepId,
        offerId,
        expectedRevisionId,
        confirmationText: draftFunnelCheckoutLinkConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    } else if (operationId === "unlink-checkout") {
      const stepId = stringValue(body.stepId, 220);
      const blockId = stringValue(body.blockId, 220);

      if (!stepId || !blockId) {
        return jsonError(
          400,
          "invalid_checkout_unlink_request",
          "unlink-checkout requires stepId and blockId.",
        );
      }

      draft = await unlinkDraftFunnelCheckoutLink(db, adminState.identity, {
        draftId,
        stepId,
        blockId,
        expectedRevisionId,
        confirmationText: draftFunnelCheckoutUnlinkConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    } else if (operationId === "move-block") {
      const stepId = stringValue(body.stepId, 220);
      const blockId = stringValue(body.blockId, 220);
      const direction = stringValue(body.direction, 12);

      if (!stepId || !blockId || (direction !== "up" && direction !== "down")) {
        return jsonError(
          400,
          "invalid_block_move_request",
          "move-block requires stepId, blockId, and direction of up or down.",
        );
      }

      draft = await reorderDraftFunnelBlock(db, adminState.identity, {
        draftId,
        stepId,
        blockId,
        direction,
        expectedRevisionId,
        idempotencyKey,
        agentWriteAudit,
      });
    } else if (operationId === "move-block-to-step") {
      const stepId = stringValue(body.stepId, 220);
      const targetStepId = stringValue(body.targetStepId, 220);
      const blockId = stringValue(body.blockId, 220);

      if (!stepId || !targetStepId || !blockId) {
        return jsonError(
          400,
          "invalid_cross_step_block_move_request",
          "move-block-to-step requires stepId, targetStepId, and blockId.",
        );
      }

      draft = await moveDraftFunnelBlockToStep(db, adminState.identity, {
        draftId,
        stepId,
        targetStepId,
        blockId,
        expectedRevisionId,
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
    } else if (operationId === "publish-draft") {
      publicRouteMutationCreated = true;
      draft = await publishDraftFunnel(db, adminState.identity, {
        draftId,
        expectedRevisionId,
        confirmationText: draftFunnelPublishConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    } else if (operationId === "purge-archived-draft") {
      purge = await purgeArchivedDraftFunnel(db, adminState.identity, {
        draftId,
        expectedRevisionId,
        confirmationText: draftFunnelPurgeConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    } else {
      const archiveTarget = await db
        .prepare("SELECT status, preview_route FROM funnel_drafts WHERE id = ?")
        .bind(draftId)
        .first<{ status: string; preview_route: string | null }>();
      publicRouteMutationCreated = archiveTarget?.status === "published" || Boolean(archiveTarget?.preview_route);
      draft = await archiveDraftFunnel(db, adminState.identity, {
        draftId,
        expectedRevisionId,
        confirmationText: draftFunnelArchiveConfirmationText,
        idempotencyKey,
        agentWriteAudit,
      });
    }

    if (purge) {
      return NextResponse.json(
        {
          ok: true,
          status: "agent_funnel_draft_write_recorded",
          operationId,
          issue: agentFunnelDraftWriteIssue,
          route: agentFunnelDraftWriteApiRoute,
          auditCorrelationId,
          purge: redactedPurgeSummary(purge),
          redaction: redaction(),
        },
        { status: 201 },
      );
    }

    if (bulkPurge) {
      return NextResponse.json(
        {
          ok: true,
          status: "agent_funnel_draft_write_recorded",
          operationId,
          issue: agentFunnelDraftWriteIssue,
          route: agentFunnelDraftWriteApiRoute,
          auditCorrelationId,
          bulkPurge: redactedBulkPurgeSummary(bulkPurge),
          redaction: redaction(),
        },
        { status: 201 },
      );
    }

    if (!draft) {
      return jsonError(400, "invalid_agent_funnel_write", "Unable to record agent funnel draft write.");
    }

    return NextResponse.json(
      {
        ok: true,
        status: "agent_funnel_draft_write_recorded",
        operationId,
        issue: agentFunnelDraftWriteIssue,
        route: agentFunnelDraftWriteApiRoute,
        auditCorrelationId,
        draft: redactedDraftSummary(draft, { publicRouteChanged: publicRouteMutationCreated }),
        redaction: redaction({ publicRouteMutationCreated }),
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record agent funnel draft write.";
    const mapped = errorStatus(message);
    return jsonError(mapped.status, mapped.code, message);
  }
}
