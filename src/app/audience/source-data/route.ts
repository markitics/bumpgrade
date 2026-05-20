import { NextResponse } from "next/server";

import { audienceAutomationSourceData } from "@/lib/audience-automation";
import {
  getAudienceBroadcastDeliveryBatchSummary,
  getAudienceBroadcastDeliveryQueueMessageSummary,
  getAudienceBroadcastDispatchAttemptSummary,
  getAudienceBroadcastDispatchPreflightSummary,
  getAudienceBroadcastPreviewSafetySummary,
  getAudienceBroadcastProviderEventReadinessSummary,
  getAudienceBroadcastQueueReadinessSummary,
  getAudienceBroadcastReadinessSummary,
  getAudienceBroadcastScheduleIntentSummary,
  getAudienceBroadcastSenderDomainReadinessSummary,
} from "@/lib/audience-broadcasts";
import { getAudienceSubscriberInspectionSummary } from "@/lib/audience-subscribers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [
    subscriberInspection,
    broadcastReadiness,
    broadcastScheduleIntents,
    broadcastPreviewSafety,
    broadcastQueueReadiness,
    broadcastDeliveryBatches,
    broadcastDeliveryQueueMessages,
    broadcastDispatchPreflights,
    broadcastDispatchAttempts,
    broadcastSenderDomainReadiness,
    broadcastProviderEventReadiness,
  ] = await Promise.all([
    getAudienceSubscriberInspectionSummary(),
    getAudienceBroadcastReadinessSummary(),
    getAudienceBroadcastScheduleIntentSummary(),
    getAudienceBroadcastPreviewSafetySummary(),
    getAudienceBroadcastQueueReadinessSummary(),
    getAudienceBroadcastDeliveryBatchSummary(),
    getAudienceBroadcastDeliveryQueueMessageSummary(),
    getAudienceBroadcastDispatchPreflightSummary(),
    getAudienceBroadcastDispatchAttemptSummary(),
    getAudienceBroadcastSenderDomainReadinessSummary(),
    getAudienceBroadcastProviderEventReadinessSummary(),
  ]);

  return NextResponse.json({
    ...audienceAutomationSourceData,
    routes: Array.from(
      new Set([
        ...audienceAutomationSourceData.routes,
        subscriberInspection.ownerRoute,
        broadcastScheduleIntents.apiRoute,
        broadcastDeliveryBatches.apiRoute,
        broadcastDeliveryQueueMessages.apiRoute,
        broadcastDispatchPreflights.apiRoute,
        broadcastDispatchAttempts.apiRoute,
      ]),
    ),
    subscriberInspection,
    broadcastReadiness,
    broadcastScheduleIntents,
    broadcastPreviewSafety,
    broadcastQueueReadiness,
    broadcastDeliveryBatches,
    broadcastDeliveryQueueMessages,
    broadcastDispatchPreflights,
    broadcastDispatchAttempts,
    broadcastSenderDomainReadiness,
    broadcastProviderEventReadiness,
  });
}
