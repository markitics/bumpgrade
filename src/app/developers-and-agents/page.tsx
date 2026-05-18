import type { Metadata } from "next";
import { Bot } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Developers and agents",
  description: "Bumpgrade APIs, MCP direction, manifests, webhooks, and agent-safe action contracts.",
};

export default function DevelopersAndAgentsPage() {
  return (
    <RouteShell
      eyebrow="Developers and agents"
      title="Agent-readable contracts before hidden browser automation."
      body="This route will document the APIs, manifests, MCP resources, webhooks, and confirmation rules that let agents work safely with Bumpgrade."
      issue="#12"
      icon={Bot}
      bullets={[
        "Public docs that explain what agents can read and what requires confirmation.",
        "Stable manifests for features, roadmap, comparisons, journeys, and work logs.",
        "Write safety covering idempotency, stale-state checks, redaction, and audit IDs.",
        "Future MCP resources and tools layered on top of the same server-side contracts.",
      ]}
    />
  );
}
