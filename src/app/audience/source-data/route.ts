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
import { getAudienceExportReadinessSummary } from "@/lib/audience-exports";
import { getAudienceImportIntentSummary, getAudienceImportPreflightSummary } from "@/lib/audience-imports";
import { getAudienceSequenceDeliveryBatchSummary } from "@/lib/audience-sequence-delivery-batches";
import { getAudienceSequenceDeliveryQueueMessageSummary } from "@/lib/audience-sequence-delivery-queue-messages";
import { getAudienceSequenceDispatchAttemptSummary } from "@/lib/audience-sequence-dispatch-attempts";
import { getAudienceSequenceDispatchPreflightSummary } from "@/lib/audience-sequence-dispatch-preflights";
import { getAudienceSequenceDeliveryAttemptReadinessSummary } from "@/lib/audience-sequence-delivery-attempt-readiness";
import { getAudienceSequenceDeliveryResultReadinessSummary } from "@/lib/audience-sequence-delivery-result-readiness";
import { getAudienceSequenceDeliveryStatusWebhookReadinessSummary } from "@/lib/audience-sequence-delivery-status-webhook-readiness";
import { getAudienceSequenceProviderPollingReadinessSummary } from "@/lib/audience-sequence-provider-polling-readiness";
import { getAudienceSequenceReceiptPayloadReadinessSummary } from "@/lib/audience-sequence-receipt-payload-readiness";
import { getAudienceSequenceDeliveryReadinessSummary } from "@/lib/audience-sequence-readiness";
import { getAudienceSequenceProviderCallReadinessSummary } from "@/lib/audience-sequence-provider-call-readiness";
import { getAudienceSequenceQueueConsumerReadinessSummary } from "@/lib/audience-sequence-queue-consumer-readiness";
import { getAudienceSequenceQueueProducerReadinessSummary } from "@/lib/audience-sequence-queue-producer-readiness";
import { getAudienceSequenceScheduleIntentSummary } from "@/lib/audience-sequence-schedule-intents";
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
    audienceSequenceDeliveryReadiness,
    audienceSequenceScheduleIntents,
    audienceSequenceDeliveryBatches,
    audienceSequenceDeliveryQueueMessages,
    audienceSequenceDispatchPreflights,
    audienceSequenceDispatchAttempts,
    audienceSequenceQueueProducerReadiness,
    audienceSequenceQueueConsumerReadiness,
    audienceSequenceProviderCallReadiness,
    audienceSequenceDeliveryAttemptReadiness,
    audienceSequenceDeliveryResultReadiness,
    audienceSequenceDeliveryStatusWebhookReadiness,
    audienceSequenceProviderPollingReadiness,
    audienceSequenceReceiptPayloadReadiness,
    audienceExportReadiness,
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
    getAudienceSequenceDeliveryReadinessSummary(),
    getAudienceSequenceScheduleIntentSummary(),
    getAudienceSequenceDeliveryBatchSummary(),
    getAudienceSequenceDeliveryQueueMessageSummary(),
    getAudienceSequenceDispatchPreflightSummary(),
    getAudienceSequenceDispatchAttemptSummary(),
    getAudienceSequenceQueueProducerReadinessSummary(),
    getAudienceSequenceQueueConsumerReadinessSummary(),
    getAudienceSequenceProviderCallReadinessSummary(),
    getAudienceSequenceDeliveryAttemptReadinessSummary(),
    getAudienceSequenceDeliveryResultReadinessSummary(),
    getAudienceSequenceDeliveryStatusWebhookReadinessSummary(),
    getAudienceSequenceProviderPollingReadinessSummary(),
    getAudienceSequenceReceiptPayloadReadinessSummary(),
    getAudienceExportReadinessSummary(),
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
        audienceSequenceScheduleIntents.apiRoute,
        audienceSequenceDeliveryBatches.apiRoute,
        audienceSequenceDeliveryQueueMessages.apiRoute,
        audienceSequenceDispatchPreflights.apiRoute,
        audienceSequenceDispatchAttempts.apiRoute,
        audienceSequenceQueueProducerReadiness.apiRoute,
        audienceSequenceQueueConsumerReadiness.apiRoute,
        audienceSequenceProviderCallReadiness.apiRoute,
        audienceSequenceDeliveryAttemptReadiness.apiRoute,
        audienceSequenceDeliveryResultReadiness.apiRoute,
        audienceSequenceDeliveryStatusWebhookReadiness.apiRoute,
        audienceSequenceProviderPollingReadiness.apiRoute,
        audienceSequenceReceiptPayloadReadiness.apiRoute,
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
    audienceSequenceDeliveryReadiness,
    audienceSequenceScheduleIntents,
    audienceSequenceDeliveryBatches,
    audienceSequenceDeliveryQueueMessages,
    audienceSequenceDispatchPreflights,
    audienceSequenceDispatchAttempts,
    audienceSequenceQueueProducerReadiness,
    audienceSequenceQueueConsumerReadiness,
    audienceSequenceProviderCallReadiness,
    audienceSequenceDeliveryAttemptReadiness,
    audienceSequenceDeliveryResultReadiness,
    audienceSequenceDeliveryStatusWebhookReadiness,
    audienceSequenceProviderPollingReadiness,
    audienceSequenceReceiptPayloadReadiness,
    audienceExportReadiness,
    importIntents,
    importPreflights,
  });
}
