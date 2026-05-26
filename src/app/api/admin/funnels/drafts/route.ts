import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  addDraftFunnelBlock,
  archiveDraftFunnel,
  bulkPurgeArchivedDraftFunnels,
  createDraftFunnelFromTemplate,
  createDraftFunnelFromLibraryTemplate,
  duplicateDraftFunnel,
  getFunnelDraftD1OrThrow,
  linkDraftFunnelBlockToResourceDelivery,
  linkDraftFunnelBlockToWebinarEvent,
  linkDraftFunnelStepToCheckoutOffer,
  moveDraftFunnelBlockToStep,
  publishDraftFunnel,
  purgeArchivedDraftFunnel,
  reorderDraftFunnelBlock,
  reorderDraftFunnelStep,
  removeDraftFunnelBlock,
  seedEditableFunnelDraft,
  unlinkDraftFunnelCheckoutLink,
  updateDraftFunnelBlock,
  updateDraftFunnelBlockCanvasLayout,
  updateDraftFunnelBlockVisualStyle,
  updateDraftFunnelStep,
} from "@/lib/funnel-drafts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RequestFields = {
  wantsJson: boolean;
  value(key: string): string;
};

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function headerWantsJson(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  const contentType = request.headers.get("content-type") ?? "";
  return accept.includes("application/json") || contentType.includes("application/json");
}

function formWantsJson(request: NextRequest, formData: FormData) {
  return formValue(formData, "return") === "json" || (request.headers.get("accept") ?? "").includes("application/json");
}

async function readRequestFields(request: NextRequest): Promise<RequestFields> {
  const contentType = request.headers.get("content-type") ?? "";
  const wantsJsonFromHeaders = headerWantsJson(request);

  if (contentType.includes("application/json")) {
    let body: unknown = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const record = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};

    return {
      wantsJson: true,
      value(key) {
        const value = record[key];
        return typeof value === "string" ? value : "";
      },
    };
  }

  try {
    const formData = await request.formData();

    return {
      wantsJson: formWantsJson(request, formData),
      value(key) {
        return formValue(formData, key);
      },
    };
  } catch {
    return {
      wantsJson: wantsJsonFromHeaders,
      value() {
        return "";
      },
    };
  }
}

function fallbackIdempotencyKey() {
  return `funnel-draft-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
}

function resourceDeliverySelection(fields: RequestFields) {
  const resourceDeliveryRef = fields.value("resourceDeliveryRef");
  if (resourceDeliveryRef.includes("::")) {
    const [productId, assetId] = resourceDeliveryRef.split("::");
    return { productId, assetId };
  }

  return {
    productId: fields.value("productId"),
    assetId: fields.value("assetId"),
  };
}

function bulkPurgeTargets(fields: RequestFields) {
  try {
    const parsed = JSON.parse(fields.value("bulkTargetsJson"));
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((target) => {
      if (!target || typeof target !== "object" || Array.isArray(target)) return [];
      const record = target as Record<string, unknown>;
      const draftId = typeof record.draftId === "string" ? record.draftId : "";
      const expectedRevisionId = typeof record.expectedRevisionId === "string" ? record.expectedRevisionId : "";
      return draftId && expectedRevisionId ? [{ draftId, expectedRevisionId }] : [];
    });
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const fields = await readRequestFields(request);
  const json = fields.wantsJson;
  const adminState = await getSessionAdminState(request.headers);

  if (!adminState.identity) {
    if (json) {
      return NextResponse.json({ error: "Owner session required.", denialReason: adminState.denialReason }, { status: 401 });
    }

    const login = new URL("/login", request.url);
    login.searchParams.set("callbackURL", "/admin/funnels");
    return NextResponse.redirect(login, { status: 303 });
  }

  try {
    const db = await getFunnelDraftD1OrThrow();
    const mode = fields.value("mode") || "create";
    const idempotencyKey = fields.value("idempotencyKey") || fallbackIdempotencyKey();
    let draft;

    if (mode === "seed") {
      draft = await seedEditableFunnelDraft(db, adminState.identity, idempotencyKey);
    } else if (mode === "create-from-template") {
      draft = await createDraftFunnelFromLibraryTemplate(db, adminState.identity, {
        templateId: fields.value("templateId"),
        title: fields.value("title"),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });
    } else if (mode === "duplicate") {
      draft = await duplicateDraftFunnel(db, adminState.identity, {
        draftId: fields.value("draftId"),
        title: fields.value("title"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });
    } else if (mode === "archive") {
      draft = await archiveDraftFunnel(db, adminState.identity, {
        draftId: fields.value("draftId"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });
    } else if (mode === "purge") {
      const purge = await purgeArchivedDraftFunnel(db, adminState.identity, {
        draftId: fields.value("draftId"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });

      if (json) {
        return NextResponse.json({ ok: true, mode, purge });
      }

      const redirect = new URL("/admin/funnels", request.url);
      redirect.searchParams.set("purged", purge.draftId);
      return NextResponse.redirect(redirect, { status: 303 });
    } else if (mode === "bulk-purge-archived-drafts") {
      const bulkPurge = await bulkPurgeArchivedDraftFunnels(db, adminState.identity, {
        targets: bulkPurgeTargets(fields),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });

      if (json) {
        return NextResponse.json({ ok: true, mode, bulkPurge });
      }

      const redirect = new URL("/admin/funnels", request.url);
      redirect.searchParams.set("bulkPurged", String(bulkPurge.purgedDraftCount));
      return NextResponse.redirect(redirect, { status: 303 });
    } else if (mode === "update-step") {
      draft = await updateDraftFunnelStep(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        title: fields.value("title"),
        goal: fields.value("goal"),
        kind: fields.value("kind"),
        idempotencyKey,
      });
    } else if (mode === "update-block") {
      draft = await updateDraftFunnelBlock(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        blockId: fields.value("blockId"),
        title: fields.value("title"),
        body: fields.value("body"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        idempotencyKey,
      });
    } else if (mode === "update-block-style") {
      draft = await updateDraftFunnelBlockVisualStyle(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        blockId: fields.value("blockId"),
        visualStyleId: fields.value("visualStyleId"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        idempotencyKey,
      });
    } else if (mode === "update-block-canvas-layout") {
      draft = await updateDraftFunnelBlockCanvasLayout(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        blockId: fields.value("blockId"),
        x: fields.value("x"),
        y: fields.value("y"),
        width: fields.value("width"),
        height: fields.value("height"),
        zIndex: fields.value("zIndex"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        idempotencyKey,
      });
    } else if (mode === "add-block") {
      draft = await addDraftFunnelBlock(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        blockKind: fields.value("blockKind"),
        title: fields.value("title"),
        body: fields.value("body"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        idempotencyKey,
      });
    } else if (mode === "remove-block") {
      draft = await removeDraftFunnelBlock(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        blockId: fields.value("blockId"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        idempotencyKey,
      });
    } else if (mode === "move-block") {
      draft = await reorderDraftFunnelBlock(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        blockId: fields.value("blockId"),
        direction: fields.value("direction"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        idempotencyKey,
      });
    } else if (mode === "move-block-to-step") {
      draft = await moveDraftFunnelBlockToStep(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        targetStepId: fields.value("targetStepId"),
        blockId: fields.value("blockId"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        idempotencyKey,
      });
    } else if (mode === "link-checkout") {
      draft = await linkDraftFunnelStepToCheckoutOffer(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        offerId: fields.value("offerId"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });
    } else if (mode === "unlink-checkout") {
      draft = await unlinkDraftFunnelCheckoutLink(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        blockId: fields.value("blockId"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });
    } else if (mode === "link-resource-delivery") {
      const selection = resourceDeliverySelection(fields);
      draft = await linkDraftFunnelBlockToResourceDelivery(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        blockId: fields.value("blockId"),
        productId: selection.productId,
        assetId: selection.assetId,
        expectedRevisionId: fields.value("expectedRevisionId"),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });
    } else if (mode === "link-webinar-event") {
      draft = await linkDraftFunnelBlockToWebinarEvent(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        blockId: fields.value("blockId"),
        eventTitle: fields.value("eventTitle"),
        registrationUrl: fields.value("registrationUrl"),
        replayUrl: fields.value("replayUrl"),
        providerLabel: fields.value("providerLabel"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });
    } else if (mode === "move-step") {
      draft = await reorderDraftFunnelStep(db, adminState.identity, {
        draftId: fields.value("draftId"),
        stepId: fields.value("stepId"),
        direction: fields.value("direction"),
        idempotencyKey,
      });
    } else if (mode === "publish") {
      draft = await publishDraftFunnel(db, adminState.identity, {
        draftId: fields.value("draftId"),
        expectedRevisionId: fields.value("expectedRevisionId"),
        confirmationText: fields.value("confirmationText"),
        idempotencyKey,
      });
    } else {
      draft = await createDraftFunnelFromTemplate(db, adminState.identity, {
        title: fields.value("title"),
        idempotencyKey,
      });
    }

    if (json) {
      return NextResponse.json({ ok: true, mode, draft });
    }

    const redirect = new URL("/admin/funnels", request.url);
    redirect.searchParams.set("draft", draft.id);
    return NextResponse.redirect(redirect, { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create draft funnel.";
    if (json) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    const redirect = new URL("/admin/funnels", request.url);
    redirect.searchParams.set("error", message);
    return NextResponse.redirect(redirect, { status: 303 });
  }
}
