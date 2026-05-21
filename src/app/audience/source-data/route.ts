import { NextResponse } from "next/server";

import { audienceAutomationSourceData } from "@/lib/audience-automation";
import {
  getAudienceBroadcastDeliveryBatchSummary,
  getAudienceBroadcastDeliveryQueueMessageSummary,
  getAudienceBroadcastDispatchAttemptSummary,
  getAudienceBroadcastDispatchPreflightSummary,
  getAudienceBroadcastPreviewSafetySummary,
  getAudienceBroadcastProviderEventReadinessSummary,
  getAudienceBroadcastProviderRateLimitReadinessSummary,
  getAudienceBroadcastProviderResponseReadinessSummary,
  getAudienceBroadcastQueueConsumerReadinessSummary,
  getAudienceBroadcastQueueProducerReadinessSummary,
  getAudienceBroadcastQueueReadinessSummary,
  getAudienceBroadcastReadinessSummary,
  getAudienceBroadcastScheduleIntentSummary,
  getAudienceBroadcastSendPayloadReadinessSummary,
  getAudienceBroadcastSenderDomainReadinessSummary,
} from "@/lib/audience-broadcasts";
import { getAudienceImportIntentSummary, getAudienceImportPreflightSummary } from "@/lib/audience-imports";
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
    broadcastProviderRateLimitReadiness,
    broadcastProviderResponseReadiness,
    broadcastSendPayloadReadiness,
    broadcastQueueProducerReadiness,
    broadcastQueueConsumerReadiness,
    importIntents,
    importPreflights,
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
    getAudienceBroadcastProviderRateLimitReadinessSummary(),
    getAudienceBroadcastProviderResponseReadinessSummary(),
    getAudienceBroadcastSendPayloadReadinessSummary(),
    getAudienceBroadcastQueueProducerReadinessSummary(),
    getAudienceBroadcastQueueConsumerReadinessSummary(),
    getAudienceImportIntentSummary(),
    getAudienceImportPreflightSummary(),
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
        importIntents.apiRoute,
        importPreflights.apiRoute,
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
    broadcastProviderRateLimitReadiness,
    broadcastProviderResponseReadiness,
    broadcastSendPayloadReadiness,
    broadcastQueueProducerReadiness,
    broadcastQueueConsumerReadiness,
    importIntents,
    importPreflights,
  });
}
