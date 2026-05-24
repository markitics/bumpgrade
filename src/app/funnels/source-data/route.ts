import { NextResponse } from "next/server";

import { getPublishedD1FunnelSourceData } from "@/lib/funnel-drafts";
import { funnelSourceData } from "@/lib/funnels";
import { getProductDeliveryGateSummary } from "@/lib/product-delivery-gates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [publishedD1, ownerProductDeliveryGates] = await Promise.all([
    getPublishedD1FunnelSourceData(),
    getProductDeliveryGateSummary(),
  ]);

  return NextResponse.json({
    ...funnelSourceData,
    routes: [
      ...funnelSourceData.routes,
      ...publishedD1.publishedFunnels
        .map((funnel) => funnel.previewRoute)
        .filter((route) => !funnelSourceData.routes.includes(route)),
    ],
    publishedD1Funnels: publishedD1.publishedFunnels,
    publishedD1Source: publishedD1.source,
    publishedD1LoadError: publishedD1.loadError,
    privateDraftsIncluded: publishedD1.privateDraftsIncluded,
    rawOwnerDataIncluded: publishedD1.rawOwnerDataIncluded,
    ownerProductDeliveryGates,
  });
}
