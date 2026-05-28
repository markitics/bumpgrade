import { canonicalPricingRoute, formatUsd, pricingPlans } from "@/lib/pricing-plans";
import {
  routeOgImageContentType,
  routeOgImageResponse,
  routeOgImageSize,
} from "@/lib/route-og-images";

export const alt = "Bumpgrade pricing social image";
export const size = routeOgImageSize;
export const contentType = routeOgImageContentType;

function planPrice(plan: (typeof pricingPlans)[number]) {
  if (plan.monthlyAmountCents === null) return "Contact us";
  return `${formatUsd(plan.monthlyAmountCents)}/mo`;
}

export default function Image() {
  const selfServePlans = pricingPlans.filter((plan) => plan.status === "self_serve");

  return routeOgImageResponse({
    routeType: "Pricing",
    eyebrow: "Build first, pay at go-live",
    title: "Start building your publisher launch system today.",
    summary:
      "Free Build separates private launch setup from buyer-facing go-live actions that need a paid Bumpgrade plan.",
    route: canonicalPricingRoute,
    status: "Canonical route",
    facts: [
      selfServePlans.map((plan) => `${plan.name} ${planPrice(plan)}`).join(" / "),
      "Free Build before payment",
      "Paid go-live gates stay explicit",
    ],
    theme: {
      accent: "#c6f26b",
      accentSoft: "rgba(198, 242, 107, 0.17)",
      panel: "#f3f9df",
    },
  });
}
