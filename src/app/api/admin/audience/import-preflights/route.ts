import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  audienceImportPreflightApiRoute,
  audienceImportPreflightIssue,
  audienceImportPreflightStatus,
  createAudienceImportPreflight,
  getAudienceImportPreflightSummary,
} from "@/lib/audience-imports";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ImportPreflightRequestBody = {
  workspaceId?: unknown;
  importIntentId?: unknown;
  expectedImportIntentSourceLabel?: unknown;
  expectedWorkspaceRevisionId?: unknown;
  expectedWorkspaceStatus?: unknown;
  totalContactsChecked?: unknown;
  eligibleNewContactCount?: unknown;
  eligibleUpdateCount?: unknown;
  duplicateCount?: unknown;
  suppressedCount?: unknown;
  missingConsentCount?: unknown;
  malformedCount?: unknown;
  lawfulBasisCount?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<ImportPreflightRequestBody> {
  try {
    return (await request.json()) as ImportPreflightRequestBody;
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
  const summary = await getAudienceImportPreflightSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: audienceImportPreflightStatus,
    issue: audienceImportPreflightIssue,
    route: audienceImportPreflightApiRoute,
    confirmation: summary.confirmation,
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAudienceImportPreflightSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAudienceImportPreflight({
    workspaceId: body.workspaceId,
    importIntentId: body.importIntentId,
    expectedImportIntentSourceLabel: body.expectedImportIntentSourceLabel,
    expectedWorkspaceRevisionId: body.expectedWorkspaceRevisionId,
    expectedWorkspaceStatus: body.expectedWorkspaceStatus,
    totalContactsChecked: body.totalContactsChecked,
    eligibleNewContactCount: body.eligibleNewContactCount,
    eligibleUpdateCount: body.eligibleUpdateCount,
    duplicateCount: body.duplicateCount,
    suppressedCount: body.suppressedCount,
    missingConsentCount: body.missingConsentCount,
    malformedCount: body.malformedCount,
    lawfulBasisCount: body.lawfulBasisCount,
    privateNote: body.privateNote,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "workspace_not_found" || result.status === "import_intent_not_found"
        ? 404
        : result.status === "stale_workspace_revision" ||
            result.status === "stale_workspace_status" ||
            result.status === "import_intent_mismatch" ||
            result.status === "idempotency_conflict"
          ? 409
          : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentWorkspaceRevisionId: result.currentWorkspaceRevisionId,
      currentWorkspaceStatus: result.currentWorkspaceStatus,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
