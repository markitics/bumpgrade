import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Features",
  description: "Planned Bumpgrade features across funnels, checkout, products, automations, analytics, admin, and agents.",
};

export default function FeaturesPage() {
  return (
    <RouteShell
      eyebrow="bumpgrade.com/features"
      title="Aspirational feature catalog, wired to roadmap evidence."
      body="This page will show every major Bumpgrade feature with live or pending badges, issue links, and no unsourced shipped claims."
      issue="#6"
      icon={Sparkles}
      bullets={[
        "Funnel, checkout, product, email, analytics, affiliate, admin, and agent feature groups.",
        "Live/pending badges tied to GitHub issues, PRs, deployments, and work-log entries.",
        "Public-safe copy that makes roadmap state useful without leaking private admin detail.",
        "Agent-readable feature IDs that can power manifests, APIs, and MCP resources.",
      ]}
    />
  );
}
