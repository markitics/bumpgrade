import type { Metadata } from "next";
import { GitBranch } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Public Bumpgrade roadmap connected to feature, admin, and GitHub issue state.",
};

export default function RoadmapPage() {
  return (
    <RouteShell
      eyebrow="bumpgrade.com/roadmap"
      title="Public roadmap shaped by the main feature set."
      body="This page will summarize planned, active, blocked, and shipped Bumpgrade work without exposing private admin notes."
      issue="#7"
      icon={GitBranch}
      bullets={[
        "Roadmap items share IDs with admin data or structured fixtures.",
        "Public entries link to GitHub issues and PRs when safe.",
        "Feature status stays synchronized with `/features` and `/admin/roadmap`.",
        "Blocked work records exact unblock conditions instead of vague status.",
      ]}
    />
  );
}
