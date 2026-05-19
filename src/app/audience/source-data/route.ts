import { NextResponse } from "next/server";

import { audienceAutomationSourceData } from "@/lib/audience-automation";
import { getAudienceSubscriberInspectionSummary } from "@/lib/audience-subscribers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const subscriberInspection = await getAudienceSubscriberInspectionSummary();

  return NextResponse.json({
    ...audienceAutomationSourceData,
    routes: Array.from(new Set([...audienceAutomationSourceData.routes, subscriberInspection.ownerRoute])),
    subscriberInspection,
  });
}
