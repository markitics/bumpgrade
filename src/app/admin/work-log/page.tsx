import type { Metadata } from "next";
import { ListChecks } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Admin work log",
  description: "Bumpgrade agent work-log placeholder.",
};

export default function AdminWorkLogPage() {
  return (
    <RouteShell
      eyebrow="Admin work log"
      title="Durable diary of how agents spend time."
      body="This route will record substantive work bursts, shipped PRs, validation, screenshots, blockers, and handoff notes."
      issue="#8"
      icon={ListChecks}
      bullets={[
        "D1-backed entries with stable IDs and issue/PR links.",
        "Validation and screenshot fields that match the repo docs.",
        "Safe summaries only, with no secrets or private inbox bodies.",
        "Append scripts or APIs so Codex can write entries after shipping.",
      ]}
    />
  );
}
