import { NextResponse } from "next/server";

import { audienceAutomationSourceData } from "@/lib/audience-automation";
import {
  getAudienceBroadcastDeliveryBatchSummary,
  getAudienceBroadcastDeliveryQueueMessageSummary,
  getAudienceBroadcastPreviewSafetySummary,
  getAudienceBroadcastQueueReadinessSummary,
  getAudienceBroadcastReadinessSummary,
  getAudienceBroadcastScheduleIntentSummary,
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
  ] = await Promise.all([
    getAudienceSubscriberInspectionSummary(),
    getAudienceBroadcastReadinessSummary(),
    getAudienceBroadcastScheduleIntentSummary(),
    getAudienceBroadcastPreviewSafetySummary(),
    getAudienceBroadcastQueueReadinessSummary(),
    getAudienceBroadcastDeliveryBatchSummary(),
    getAudienceBroadcastDeliveryQueueMessageSummary(),
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
      ]),
    ),
    subscriberInspection,
    broadcastReadiness,
    broadcastScheduleIntents,
    broadcastPreviewSafety,
    broadcastQueueReadiness,
    broadcastDeliveryBatches,
    broadcastDeliveryQueueMessages,
  });
}
