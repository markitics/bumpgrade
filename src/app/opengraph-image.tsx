import { marketingFeatures } from "@/lib/marketing-features";
import {
  routeOgImageContentType,
  routeOgImageResponse,
  routeOgImageSize,
} from "@/lib/route-og-images";
import { site } from "@/lib/site";

export const alt = "Bumpgrade publisher launch platform social image";
export const size = routeOgImageSize;
export const contentType = routeOgImageContentType;

export default function Image() {
  return routeOgImageResponse({
    routeType: "Home",
    eyebrow: "Publisher launches",
    title: "Funnels, checkout, email, products, analytics, and AI help in one place.",
    summary: site.description,
    route: "/",
    status: "Available now",
    facts: [
      `${marketingFeatures.length} feature pages`,
      "Self-serve pricing is canonical",
      "Public source data for agents",
    ],
    theme: {
      accent: "#61d394",
      accentSoft: "rgba(97, 211, 148, 0.18)",
      panel: "#f8f4ea",
    },
  });
}
