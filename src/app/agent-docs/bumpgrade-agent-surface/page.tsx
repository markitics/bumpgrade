import type { Metadata } from "next";
import { Bot } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Bumpgrade agent surface",
  description: "Public agent-readable Bumpgrade surface placeholder.",
};

export default function AgentSurfacePage() {
  return (
    <RouteShell
      eyebrow="Agent docs"
      title="Public agent surface starts with source-grounded reads."
      body="This route will explain what agents can read, what is planned, what requires Mark/admin credentials, and what must not be automated through browser UI."
      issue="#12"
      icon={Bot}
      bullets={[
        "Feature source data is available at `/features/source-data` with feature IDs, statuses, issue links, and agent-contract notes.",
        "Roadmap source data is available at `/roadmap/source-data` with public-safe status lanes, blockers, and issue evidence.",
        "Human admin pages require Better Auth owner sessions; public-safe admin source data remains available at `/admin/source-data` and per-surface source-data routes.",
        "Feature, roadmap, comparison, work-log, and journey read contracts.",
        "Comparison source data is available at `/compare/source-data` with source IDs, retrieval dates, and roadmap caveats.",
        "Source evidence IDs and URLs for public claims.",
        "Confirmed-write rules for billing, public publishing, and admin changes.",
        "Future MCP resource and tool index.",
      ]}
    />
  );
}
