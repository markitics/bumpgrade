import type { Metadata } from "next";
import { GitBranch } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Admin roadmap",
  description: "Owner-facing Bumpgrade roadmap surface placeholder.",
};

export default function AdminRoadmapPage() {
  return (
    <RouteShell
      eyebrow="Admin roadmap"
      title="Roadmap command center for Mark and future agents."
      body="This admin route will track feature state, owners, issue links, PR links, blockers, and deployment evidence."
      issue="#8"
      icon={GitBranch}
      bullets={[
        "D1-backed feature and issue state.",
        "Active, next, pending, blocked, shipped, and parked lanes.",
        "Links to public features, roadmap, work-log entries, and PR screenshots.",
        "Exact blocker notes that can move to For Mark when Mark attention is needed.",
      ]}
    />
  );
}
