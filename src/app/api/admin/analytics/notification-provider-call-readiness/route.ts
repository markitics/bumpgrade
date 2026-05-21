import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  analyticsNotificationProviderCallReadinessApiRoute,
  analyticsNotificationProviderCallReadinessConfirmationText,
  analyticsNotificationProviderCallReadinessIssue,
  analyticsNotificationProviderCallReadinessStatus,
  createAnalyticsNotificationProviderCallReadiness,
  getAnalyticsNotificationProviderCallReadinessSummary,
} from "@/lib/analytics-notification-provider-call-readiness";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NotificationProviderCallReadinessRequestBody = {
  dashboardId?: unknown;
  readinessId?: unknown;
  channelId?: unknown;
  inboxRecordId?: unknown;
  dispatchPreflightId?: unknown;
  providerDomainReadinessId?: unknown;
  sendPayloadReadinessId?: unknown;
  queueConsumerReadinessId?: unknown;
  timeWindowKey?: unknown;
  notificationProviderCallReadinessDisposition?: unknown;
  expectedDashboardRevisionId?: unknown;
  expectedReadinessStatus?: unknown;
  expectedNotificationInboxStatus?: unknown;
  expectedNotificationDispatchPreflightStatus?: unknown;
  expectedNotificationProviderDomainReadinessStatus?: unknown;
  expectedNotificationSendPayloadReadinessStatus?: unknown;
  expectedNotificationQueueConsumerReadinessStatus?: unknown;
  expectedOwnerReviewStatus?: unknown;
  expectedAlertThresholdCount?: unknown;
  expectedConversionSampleSize?: unknown;
  sampleSizeCaveatAcknowledged?: unknown;
  privateNote?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
};

async function parseBody(request: NextRequest): Promise<NotificationProviderCallReadinessRequestBody> {
  try {
    return (await request.json()) as NotificationProviderCallReadinessRequestBody;
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
  const summary = await getAnalyticsNotificationProviderCallReadinessSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: summary.id,
    status: analyticsNotificationProviderCallReadinessStatus,
    issue: analyticsNotificationProviderCallReadinessIssue,
    route: analyticsNotificationProviderCallReadinessApiRoute,
    confirmation: { required: true, text: analyticsNotificationProviderCallReadinessConfirmationText },
    contract: summary,
    redaction: summary.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  const summary = await getAnalyticsNotificationProviderCallReadinessSummary();
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", summary.redaction, {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const result = await createAnalyticsNotificationProviderCallReadiness({
    dashboardId: body.dashboardId,
    readinessId: body.readinessId,
    channelId: body.channelId,
    inboxRecordId: body.inboxRecordId,
    dispatchPreflightId: body.dispatchPreflightId,
    providerDomainReadinessId: body.providerDomainReadinessId,
    sendPayloadReadinessId: body.sendPayloadReadinessId,
    queueConsumerReadinessId: body.queueConsumerReadinessId,
    timeWindowKey: body.timeWindowKey,
    notificationProviderCallReadinessDisposition: body.notificationProviderCallReadinessDisposition,
    expectedDashboardRevisionId: body.expectedDashboardRevisionId,
    expectedReadinessStatus: body.expectedReadinessStatus,
    expectedNotificationInboxStatus: body.expectedNotificationInboxStatus,
    expectedNotificationDispatchPreflightStatus: body.expectedNotificationDispatchPreflightStatus,
    expectedNotificationProviderDomainReadinessStatus: body.expectedNotificationProviderDomainReadinessStatus,
    expectedNotificationSendPayloadReadinessStatus: body.expectedNotificationSendPayloadReadinessStatus,
    expectedNotificationQueueConsumerReadinessStatus: body.expectedNotificationQueueConsumerReadinessStatus,
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
      result.status === "stale_notification_provider_domain_readiness_status" ||
      result.status === "stale_notification_send_payload_readiness_status" ||
      result.status === "stale_notification_queue_consumer_readiness_status" ||
      result.status === "stale_owner_review_status" ||
      result.status === "stale_threshold_count" ||
      result.status === "stale_analytics_evidence" ||
      result.status === "stale_notification_inbox_evidence" ||
      result.status === "stale_notification_dispatch_preflight_evidence" ||
      result.status === "stale_notification_provider_domain_readiness_evidence" ||
      result.status === "stale_notification_send_payload_readiness_evidence" ||
      result.status === "stale_notification_queue_consumer_readiness_evidence" ||
      result.status === "idempotency_conflict"
        ? 409
        : 400;
    return jsonError(status, result.status, result.message, result.redaction, {
      currentDashboardRevisionId: result.currentDashboardRevisionId,
      currentReadinessStatus: result.currentReadinessStatus,
      currentNotificationInboxStatus: result.currentNotificationInboxStatus,
      currentNotificationDispatchPreflightStatus: result.currentNotificationDispatchPreflightStatus,
      currentNotificationProviderDomainReadinessStatus: result.currentNotificationProviderDomainReadinessStatus,
      currentNotificationSendPayloadReadinessStatus: result.currentNotificationSendPayloadReadinessStatus,
      currentNotificationQueueConsumerReadinessStatus: result.currentNotificationQueueConsumerReadinessStatus,
      currentOwnerReviewStatus: result.currentOwnerReviewStatus,
      currentAlertThresholdCount: result.currentAlertThresholdCount,
      currentEvidence: result.currentEvidence,
    });
  }

  return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
}
