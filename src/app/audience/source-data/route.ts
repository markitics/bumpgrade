import { NextResponse } from "next/server";

import { audienceAutomationSourceData } from "@/lib/audience-automation";
import {
  getAudienceBroadcastPreviewSafetySummary,
  getAudienceBroadcastReadinessSummary,
  getAudienceBroadcastScheduleIntentSummary,
} from "@/lib/audience-broadcasts";
import { getAudienceSubscriberInspectionSummary } from "@/lib/audience-subscribers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [subscriberInspection, broadcastReadiness, broadcastScheduleIntents, broadcastPreviewSafety] = await Promise.all([
    getAudienceSubscriberInspectionSummary(),
    getAudienceBroadcastReadinessSummary(),
    getAudienceBroadcastScheduleIntentSummary(),
    getAudienceBroadcastPreviewSafetySummary(),
  ]);

  return NextResponse.json({
    ...audienceAutomationSourceData,
    routes: Array.from(
      new Set([
        ...audienceAutomationSourceData.routes,
        subscriberInspection.ownerRoute,
        broadcastScheduleIntents.apiRoute,
      ]),
    ),
    subscriberInspection,
    broadcastReadiness,
    broadcastScheduleIntents,
    broadcastPreviewSafety,
  });
}
