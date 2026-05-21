import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  analyticsNotificationProviderDomainReadinessApiRoute,
  analyticsNotificationProviderDomainReadinessConfirmationText,
  analyticsNotificationProviderDomainReadinessIssue,
  analyticsNotificationProviderDomainReadinessStatus,
  createAnalyticsNotificationProviderDomainReadiness,
  getAnalyticsNotificationProviderDomainReadinessSummary,
} from "@/lib/analytics-notification-provider-domain-readiness";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NotificationProviderDomainReadinessRequestBody = {
  dashboardId?: unknown;
  readinessId?: unknown;
  channelId?: unknown;
  inboxRecordId?: unknown;
  dispatchPreflightId?: unknown;
  timeWindowKey?: unknown;
  notificationProviderDomainReadinessDisposition?: unknown;
  expectedDashboardRevisionId?: unknown;
  expectedReadinessStatus?: unknown;
  expectedNotificationInboxStatus?: unknown;
  expectedNotificationDispatchPreflightStatus?: unknown;
  expectedOwnerReviewStatus?: unknown;
  expectedAlertThresholdCount?: unknown;
  expectedConversionSampleSize?: unknown;
  sampleSizeCaveatAcknowledged?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<NotificationProviderDomainReadinessRequestBody> {
  try {
    return (await request.json()) as NotificationProviderDomainReadinessRequestBody;
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
  const summary = await getAnalyticsNotificationProviderDomainReadinessSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: analyticsNotificationProviderDomainReadinessStatus,
    issue: analyticsNotificationProviderDomainReadinessIssue,
    route: analyticsNotificationProviderDomainReadinessApiRoute,
    confirmation: { required: true, text: analyticsNotificationProviderDomainReadinessConfirmationText },
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAnalyticsNotificationProviderDomainReadinessSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAnalyticsNotificationProviderDomainReadiness({
    dashboardId: body.dashboardId,
    readinessId: body.readinessId,
    channelId: body.channelId,
    inboxRecordId: body.inboxRecordId,
    dispatchPreflightId: body.dispatchPreflightId,
    timeWindowKey: body.timeWindowKey,
    notificationProviderDomainReadinessDisposition: body.notificationProviderDomainReadinessDisposition,
    expectedDashboardRevisionId: body.expectedDashboardRevisionId,
    expectedReadinessStatus: body.expectedReadinessStatus,
    expectedNotificationInboxStatus: body.expectedNotificationInboxStatus,
    expectedNotificationDispatchPreflightStatus: body.expectedNotificationDispatchPreflightStatus,
    expectedOwnerReviewStatus: body.expectedOwnerReviewStatus,
    expectedAlertThresholdCount: body.expectedAlertThresholdCount,
    expectedConversionSampleSize: body.expectedConversionSampleSize,
    sampleSizeCaveatAcknowledged: body.sampleSizeCaveatAcknowledged,
    privateNote: body.privateNote,
    confirmationText: body.confirmationText,
    idempotencyKey: stringValue(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim() ?? null,
    actor: adminState.identity,
  });

  if (!result.ok) {
    const status =
      result.status === "stale_dashboard_revision" ||
      result.status === "stale_readiness_status" ||
      result.status === "stale_notification_inbox_status" ||
      result.status === "stale_notification_dispatch_preflight_status" ||
      result.status === "stale_owner_review_status" ||
      result.status === "stale_threshold_count" ||
      result.status === "stale_analytics_evidence" ||
      result.status === "stale_notification_inbox_evidence" ||
      result.status === "stale_notification_dispatch_preflight_evidence" ||
      result.status === "idempotency_conflict"
        ? 409
        : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentDashboardRevisionId: result.currentDashboardRevisionId,
      currentReadinessStatus: result.currentReadinessStatus,
      currentNotificationInboxStatus: result.currentNotificationInboxStatus,
      currentNotificationDispatchPreflightStatus: result.currentNotificationDispatchPreflightStatus,
      currentOwnerReviewStatus: result.currentOwnerReviewStatus,
      currentAlertThresholdCount: result.currentAlertThresholdCount,
      currentEvidence: result.currentEvidence,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
