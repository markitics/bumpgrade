import type { Metadata } from "next";
import { GitCompareArrows } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Compare",
  description: "Bumpgrade comparison hub and alternative pages for ClickFunnels, Kit, Shopify, SamCart, and adjacent platforms.",
};

export default function ComparePage() {
  return (
    <RouteShell
      eyebrow="bumpgrade.com/compare"
      title="Shopify-style comparison hub for the indiepreneur stack."
      body="This route will become the comparison hub plus source-linked alternative pages for ClickFunnels, Kit, Shopify, SamCart, Kajabi, Podia, Systeme.io, Kartra, and ThriveCart."
      issue="#5"
      icon={GitCompareArrows}
      bullets={[
        "Structured competitor data with retrieval dates, source URLs, and confidence notes.",
        "Alternative pages that separate Bumpgrade roadmap intent from verified shipped features.",
        "SEO metadata, sitemap entries, and markdown or API mirrors for agents.",
        "Tone and structure inspired by Shopify's `/compare` hub, adapted to Bumpgrade's audience.",
      ]}
    />
  );
}
