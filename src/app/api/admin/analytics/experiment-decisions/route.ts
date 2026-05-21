import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  analyticsExperimentDecisionApiRoute,
  analyticsExperimentDecisionIssue,
  analyticsExperimentDecisionStatus,
  createAnalyticsExperimentDecision,
  getAnalyticsExperimentDecisionSummary,
} from "@/lib/analytics-experiment-decisions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ExperimentDecisionRequestBody = {
  dashboardId?: unknown;
  experimentId?: unknown;
  decisionKind?: unknown;
  selectedVariantId?: unknown;
  timeWindowKey?: unknown;
  expectedDashboardRevisionId?: unknown;
  expectedExperimentStatus?: unknown;
  expectedAssignmentCount?: unknown;
  expectedVariantCounts?: unknown;
  expectedPrimaryMetricId?: unknown;
  expectedConversionSampleSize?: unknown;
  sampleSizeCaveatAcknowledged?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<ExperimentDecisionRequestBody> {
  try {
    return (await request.json()) as ExperimentDecisionRequestBody;
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
  const summary = await getAnalyticsExperimentDecisionSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: analyticsExperimentDecisionStatus,
    issue: analyticsExperimentDecisionIssue,
    route: analyticsExperimentDecisionApiRoute,
    confirmation: summary.confirmation,
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAnalyticsExperimentDecisionSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAnalyticsExperimentDecision({
    dashboardId: body.dashboardId,
    experimentId: body.experimentId,
    decisionKind: body.decisionKind,
    selectedVariantId: body.selectedVariantId,
    timeWindowKey: body.timeWindowKey,
    expectedDashboardRevisionId: body.expectedDashboardRevisionId,
    expectedExperimentStatus: body.expectedExperimentStatus,
    expectedAssignmentCount: body.expectedAssignmentCount,
    expectedVariantCounts: body.expectedVariantCounts,
    expectedPrimaryMetricId: body.expectedPrimaryMetricId,
    expectedConversionSampleSize: body.expectedConversionSampleSize,
    sampleSizeCaveatAcknowledged: body.sampleSizeCaveatAcknowledged,
    privateNote: body.privateNote,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "dashboard_not_found" || result.status === "experiment_not_found"
        ? 404
        : result.status === "stale_dashboard_revision" ||
            result.status === "stale_experiment_status" ||
            result.status === "stale_analytics_evidence" ||
            result.status === "idempotency_conflict"
          ? 409
          : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentDashboardRevisionId: result.currentDashboardRevisionId,
      currentExperimentStatus: result.currentExperimentStatus,
      currentEvidence: result.currentEvidence,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
